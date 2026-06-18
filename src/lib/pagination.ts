export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function paginateRows<T>(
  allRows: T[],
  { page = 1, pageSize = 10 }: PaginationInput,
): PaginatedResult<T> {
  const safePageSize = Math.max(1, pageSize);
  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * safePageSize;

  return {
    rows: allRows.slice(startIndex, startIndex + safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export function parsePositiveInt(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
