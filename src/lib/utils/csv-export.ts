export interface ExportOptions {
  filename?: string;
  headers?: string[];
}

/**
 * Characters that Excel, LibreOffice Calc and Google Sheets interpret as the
 * start of a formula when they appear at the beginning of a cell value:
 * `=`, `+`, `-`, `@`, tab (`\t`) and carriage return (`\r`).
 *
 * @see https://owasp.org/www-community/attacks/CSV_Injection (CWE-1236)
 */
const CSV_FORMULA_TRIGGER = /^[=+\-@\t\r]/;

/**
 * Neutralizes CSV Formula Injection (CWE-1236) by prefixing any value that
 * begins with a formula trigger character with a single quote (`'`). The
 * apostrophe forces spreadsheet applications to treat the whole cell as
 * literal text instead of evaluating it as a formula.
 *
 * This is a serialization-layer control only: the returned value is used when
 * building the CSV file and never mutates the underlying stored data. Per the
 * OWASP guidance, ANY string starting with a trigger character is neutralized,
 * including legitimate-looking values such as negative numbers (`-5`) or
 * international phone numbers (`+5511...`); over-neutralizing is preferred to
 * leaving an injection vector open.
 */
export function neutralizeCsvFormula(value: string): string {
  return CSV_FORMULA_TRIGGER.test(value) ? `'${value}` : value;
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
    headers.map((header) => `"${neutralizeCsvFormula(header).replace(/"/g, '""')}"`).join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '""';
          }
          // Neutralize formula injection, then escape quotes and wrap in quotes
          const stringValue = neutralizeCsvFormula(String(value));
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
