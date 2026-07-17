import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, neutralizeCsvFormula, prepareExportData } from '@/lib/utils/csv-export';

describe('prepareExportData', () => {
  it('returns data unchanged when no field map is given', () => {
    const data = [{ id: 1, name: 'Ana' }];
    expect(prepareExportData(data)).toBe(data);
  });

  it('applies the field map transforms to each row', () => {
    const data = [{ first: 'Ana', last: 'Silva' }];
    const result = prepareExportData(data, {
      fullName: (item) => `${item.first} ${item.last}`,
    });
    expect(result).toEqual([{ fullName: 'Ana Silva' }]);
  });

  it('produces one mapped object per input row', () => {
    const data = [{ v: 1 }, { v: 2 }];
    const result = prepareExportData(data, { doubled: (item) => String(item.v * 2) });
    expect(result).toEqual([{ doubled: '2' }, { doubled: '4' }]);
  });
});

describe('neutralizeCsvFormula (CSV Formula Injection / CWE-1236)', () => {
  it.each(['=', '+', '-', '@', '\t', '\r'])(
    'prefixes an apostrophe when the value starts with %j',
    (trigger) => {
      const payload = `${trigger}cmd|'/C calc'!A0`;
      expect(neutralizeCsvFormula(payload)).toBe(`'${payload}`);
    }
  );

  it('neutralizes the classic =HYPERLINK / DDE payloads', () => {
    expect(neutralizeCsvFormula('=1+1')).toBe("'=1+1");
    expect(neutralizeCsvFormula('=cmd|\'/c calc\'!A1')).toBe("'=cmd|'/c calc'!A1");
    expect(neutralizeCsvFormula('@SUM(1+1)')).toBe("'@SUM(1+1)");
  });

  it('leaves ordinary values untouched (no over-quoting of safe data)', () => {
    expect(neutralizeCsvFormula('Ana Silva')).toBe('Ana Silva');
    expect(neutralizeCsvFormula('Curso de Excel Avançado')).toBe('Curso de Excel Avançado');
    expect(neutralizeCsvFormula('ana@example.com')).toBe('ana@example.com');
    expect(neutralizeCsvFormula('R$ 1.200,00')).toBe('R$ 1.200,00');
    expect(neutralizeCsvFormula('')).toBe('');
    // Trigger characters that appear mid-string are harmless and preserved.
    expect(neutralizeCsvFormula('São Paulo - SP')).toBe('São Paulo - SP');
    expect(neutralizeCsvFormula('nota=10')).toBe('nota=10');
  });

  it('neutralizes edge-case leading triggers per OWASP (no exceptions)', () => {
    // Negative numbers and international phone numbers start with triggers and
    // are neutralized by design; over-neutralizing is safer than an open vector.
    expect(neutralizeCsvFormula('-5')).toBe("'-5");
    expect(neutralizeCsvFormula('+5511999998888')).toBe("'+5511999998888");
  });
});

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let createdLink: HTMLAnchorElement;
  let lastBlob: Blob | undefined;

  const readCsv = async () => {
    if (!lastBlob) throw new Error('no blob was created');
    return lastBlob.text();
  };

  beforeEach(() => {
    clickSpy = vi.fn();
    lastBlob = undefined;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      lastBlob = blob;
      return 'blob:mock';
    }) as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn();

    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      const el = realCreate(tag);
      if (tag === 'a') {
        createdLink = el as HTMLAnchorElement;
        (el as HTMLAnchorElement).click = clickSpy as unknown as () => void;
      }
      return el;
    }) as typeof document.createElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns and does nothing when data is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    exportToCSV([]);
    expect(warnSpy).toHaveBeenCalledWith('No data to export');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('triggers a download for non-empty data', () => {
    exportToCSV([{ id: 1, name: 'Ana' }]);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('uses the provided filename', () => {
    exportToCSV([{ id: 1 }], { filename: 'students.csv' });
    expect(createdLink.getAttribute('download')).toBe('students.csv');
  });

  it('falls back to a dated filename when none is provided', () => {
    exportToCSV([{ id: 1 }]);
    expect(createdLink.getAttribute('download')).toMatch(/^export-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('neutralizes formula-injection payloads in cell values', async () => {
    exportToCSV([{ nome: '=cmd|\'/c calc\'!A1', obs: '+ATTACK' }]);
    const csv = await readCsv();
    // The dangerous value is prefixed with an apostrophe inside the quoted cell.
    expect(csv).toContain('"\'=cmd|\'/c calc\'!A1"');
    expect(csv).toContain('"\'+ATTACK"');
    // The raw formula must never appear at the start of a quoted cell.
    expect(csv).not.toContain('"=cmd');
    expect(csv).not.toContain('"+ATTACK');
  });

  it('preserves RFC 4180 quote escaping alongside neutralization', async () => {
    exportToCSV([{ nome: '=SUM(A1)"; DROP', plain: 'Ana "A" Silva' }]);
    const csv = await readCsv();
    // Leading trigger neutralized AND internal double-quote doubled.
    expect(csv).toContain('"\'=SUM(A1)""; DROP"');
    // Ordinary value keeps its RFC 4180 quoting untouched.
    expect(csv).toContain('"Ana ""A"" Silva"');
  });

  it('does not alter safe values (no over-neutralization)', async () => {
    exportToCSV([{ nome: 'Ana Silva', curso: 'Curso de Excel Avançado' }]);
    const csv = await readCsv();
    expect(csv).toContain('"Ana Silva"');
    expect(csv).toContain('"Curso de Excel Avançado"');
    expect(csv).not.toContain("'Ana");
  });
});
