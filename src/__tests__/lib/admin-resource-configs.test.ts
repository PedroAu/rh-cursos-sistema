import { expect, test } from "vitest";

import { createAdminStoreFixture } from "../../../tests/fixtures/admin-store";
import { buildResourceConfig } from "@/lib/admin-resource-configs";

function createDeps() {
  const noop = () => undefined;
  return {
    search: "",
    editingId: null,
    form: {},
    setForm: noop,
    setEditingId: noop,
    setValidationErrors: noop,
    setOpen: noop,
  };
}

function expectFieldKeys(
  config: { fields: Array<{ key: string }> },
  expectedKeys: string[]
) {
  expect(config.fields.map((field) => field.key)).toEqual(expectedKeys);
}

function expectFieldTypes(
  config: { fields: Array<{ key: string; type?: string }> },
  expectedTypes: Record<string, string>
) {
  for (const [key, type] of Object.entries(expectedTypes)) {
    expect(config.fields.find((field) => field.key === key)?.type).toBe(type);
  }
}

test("AdminResourcePage configs cover all 7 resource field contracts", () => {
  const store = createAdminStoreFixture();
  const deps = createDeps();
  const editEnrollmentDeps = {
    ...createDeps(),
    editingId: "enrollment-maria",
    form: {
      studentName: "Maria Souza",
      email: "maria.souza@example.com",
      courseTitle: "eSocial Prático",
      classLabel: "10/07/2026 • Ao vivo online",
      createdAtLabel: "11 de jun. de 2026, 10:00",
      paymentMethod: "Pix",
      enrollmentType: "Órgão público",
      derivedStatus: "Confirmada em turma futura.",
      status: "Confirmada",
    },
  };

  const configs = {
    courses: buildResourceConfig("courses", store as never, deps as never),
    classes: buildResourceConfig("classes", store as never, deps as never),
    students: buildResourceConfig("students", store as never, deps as never),
    leads: buildResourceConfig("leads", store as never, deps as never),
    enrollments: buildResourceConfig("enrollments", store as never, deps as never),
    enrollmentsEdit: buildResourceConfig("enrollments", store as never, editEnrollmentDeps as never),
    instructors: buildResourceConfig("instructors", store as never, deps as never),
    blog: buildResourceConfig("blog", store as never, deps as never),
  };

  expectFieldKeys(configs.courses, [
    "title",
    "pathId",
    "modalities",
    "level",
    "status",
    "featured",
    "durationLabel",
    "price",
    "image",
    "targetAudience",
    "categories",
    "featuredCourseIds",
    "shortDescription",
    "fullDescription",
    "objectives",
    "benefits",
    "modules",
  ]);
  expectFieldTypes(configs.courses, {
    pathId: "select",
    modalities: "multiselect",
    featured: "select",
    price: "number",
    targetAudience: "array",
    categories: "array",
    featuredCourseIds: "multiselect",
    shortDescription: "textarea",
    fullDescription: "textarea",
    objectives: "array",
    benefits: "array",
    modules: "modules",
  });

  expectFieldKeys(configs.classes, [
    "courseId",
    "startDate",
    "endDate",
    "time",
    "modality",
    "totalSeats",
    "manualFilledSeats",
    "status",
    "instructorId",
    "location",
  ]);
  expectFieldTypes(configs.classes, {
    courseId: "select",
    startDate: "date",
    endDate: "date",
    modality: "select",
    totalSeats: "number",
    manualFilledSeats: "number",
    status: "select",
    instructorId: "select",
  });

  expectFieldKeys(configs.students, ["name", "email", "organization", "enrollmentStatus"]);
  expectFieldTypes(configs.students, {
    name: "text",
    email: "text",
    organization: "text",
    enrollmentStatus: "select",
  });

  expectFieldKeys(configs.leads, [
    "name",
    "email",
    "phone",
    "type",
    "courseInterest",
    "origin",
    "status",
    "organization",
    "teamSize",
    "preferredModality",
    "trainingObjective",
    "trainingTheme",
    "mainChallenges",
  ]);
  expectFieldTypes(configs.leads, {
    type: "select",
    origin: "select",
    status: "select",
    teamSize: "number",
    trainingObjective: "textarea",
    trainingTheme: "textarea",
    mainChallenges: "textarea",
  });

  expectFieldKeys(configs.enrollments, [
    "studentName",
    "email",
    "phone",
    "cpf",
    "organization",
    "jobTitle",
    "enrollmentType",
    "paymentMethod",
    "courseId",
    "classId",
    "notes",
  ]);
  expectFieldTypes(configs.enrollments, {
    studentName: "text",
    email: "text",
    phone: "text",
    cpf: "text",
    organization: "text",
    jobTitle: "text",
    enrollmentType: "select",
    paymentMethod: "select",
    courseId: "select",
    classId: "select",
    notes: "textarea",
  });
  expectFieldKeys(configs.enrollmentsEdit, [
    "studentName",
    "email",
    "courseTitle",
    "classLabel",
    "createdAtLabel",
    "paymentMethod",
    "enrollmentType",
    "derivedStatus",
    "status",
  ]);
  expectFieldTypes(configs.enrollmentsEdit, {
    studentName: "readonly",
    email: "readonly",
    courseTitle: "readonly",
    classLabel: "readonly",
    createdAtLabel: "readonly",
    paymentMethod: "readonly",
    enrollmentType: "readonly",
    derivedStatus: "readonly",
    status: "select",
  });

  expectFieldKeys(configs.instructors, [
    "name",
    "email",
    "phone",
    "specialty",
    "education",
    "photoUrl",
    "bio",
    "courseIds",
    "status",
  ]);
  expectFieldTypes(configs.instructors, {
    name: "text",
    education: "textarea",
    photoUrl: "file",
    bio: "textarea",
    courseIds: "multiselect",
    status: "select",
  });

  expectFieldKeys(configs.blog, [
    "title",
    "category",
    "author",
    "status",
    "summary",
    "content",
    "image",
    "tags",
    "readingTime",
    "relatedCourseId",
  ]);
  expectFieldTypes(configs.blog, {
    category: "select",
    status: "select",
    summary: "textarea",
    content: "textarea",
    tags: "array",
    relatedCourseId: "select",
  });
});

test("class form narrows modality options to the selected course modalities", () => {
  const store = createAdminStoreFixture();
  store.courses = [
    {
      ...store.courses[0],
      modalities: ["Presencial", "Ao vivo online"],
      modality: "Presencial",
    },
  ];

  const config = buildResourceConfig(
    "classes",
    store as never,
    {
      ...createDeps(),
      form: { courseId: store.courses[0].id },
    } as never
  );

  const modalityField = config.fields.find((field) => field.key === "modality");
  expect(modalityField?.options).toEqual([
    { value: "Presencial", label: "Presencial" },
    { value: "Ao vivo online", label: "Ao vivo online" },
  ]);
});
