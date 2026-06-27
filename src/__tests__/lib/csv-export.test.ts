import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, prepareExportData } from '@/lib/utils/csv-export';

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

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let createdLink: HTMLAnchorElement;

  beforeEach(() => {
    clickSpy = vi.fn();
    URL.createObjectURL = vi.fn(() => 'blob:mock');
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
});
