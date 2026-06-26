export interface ExportOptions {
  filename?: string;
  headers?: string[];
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = options.headers || Object.keys(data[0]);
  const filename = options.filename || `export-${new Date().toISOString().split("T")[0]}.csv`;

  // Build CSV content
  const csvContent = [
    // Header row
    headers.map((header) => `"${header}"`).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '""';
          }
          const stringValue = String(value);
          // Escape quotes and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareExportData<T extends Record<string, unknown>>(
  data: T[],
  fieldMap?: Record<string, (item: T) => string>
): T[] {
  if (!fieldMap) {
    return data;
  }

  return data.map((item) => {
    const mapped: Record<string, unknown> = {};
    for (const [key, transform] of Object.entries(fieldMap)) {
      mapped[key] = transform(item);
    }
    return mapped as T;
  });
}
