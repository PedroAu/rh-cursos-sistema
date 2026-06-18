import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminLeads } from "@/lib/admin-data";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function isCurrentUserAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  return profile?.role === "admin";
}

export async function GET(request: Request) {
  if (!(await isCurrentUserAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rows = await getAdminLeads({
    query: searchParams.get("query") ?? "",
    status: searchParams.get("status") ?? "todos",
    type: searchParams.get("type") ?? "todos",
    ...(searchParams.get("courseId") ? { courseId: searchParams.get("courseId") ?? "todos" } : {}),
    ...(searchParams.get("source") ? { source: searchParams.get("source") ?? "todos" } : {}),
    ...(searchParams.get("dateFrom") ? { dateFrom: searchParams.get("dateFrom") ?? "" } : {}),
    ...(searchParams.get("dateTo") ? { dateTo: searchParams.get("dateTo") ?? "" } : {}),
  });

  const csv = [
    ["id", "nome", "email", "telefone", "tipo", "interesse", "origem", "status", "entrada"]
      .map(escapeCsv)
      .join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.type,
        row.interest,
        row.origin,
        row.crmStatus,
        row.createdAt,
      ]
        .map((value) => escapeCsv(String(value)))
        .join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}
