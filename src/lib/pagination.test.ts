import {
  getSingleSearchParam,
  paginateRows,
  parsePositiveInt,
} from "@/lib/pagination";

describe("pagination helpers", () => {
  it("limits page boundaries and slices rows correctly", () => {
    const result = paginateRows([1, 2, 3, 4, 5], { page: 3, pageSize: 2 });

    expect(result.rows).toEqual([5]);
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(result.total).toBe(5);
  });

  it("normalizes invalid page sizes and out-of-range pages", () => {
    const result = paginateRows([1, 2, 3], { page: 99, pageSize: 0 });

    expect(result.rows).toEqual([3]);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(1);
    expect(result.totalPages).toBe(3);
  });

  it("parses positive integers with fallback", () => {
    expect(parsePositiveInt("5", 1)).toBe(5);
    expect(parsePositiveInt(["8"], 1)).toBe(8);
    expect(parsePositiveInt("0", 3)).toBe(3);
    expect(parsePositiveInt(undefined, 7)).toBe(7);
  });

  it("extracts single search params", () => {
    expect(getSingleSearchParam("abc")).toBe("abc");
    expect(getSingleSearchParam(["first", "second"])).toBe("first");
    expect(getSingleSearchParam(undefined)).toBeUndefined();
  });
});
