import { buildPaginationMeta } from '../src/utils/response';

describe('buildPaginationMeta', () => {
  it('returns correct meta for first page', () => {
    const meta = buildPaginationMeta(1, 10, 35);
    expect(meta).toEqual({
      page: 1,
      limit: 10,
      total: 35,
      totalPages: 4,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('returns correct meta for last page', () => {
    const meta = buildPaginationMeta(4, 10, 35);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
    expect(meta.totalPages).toBe(4);
  });

  it('returns correct meta for single page', () => {
    const meta = buildPaginationMeta(1, 10, 5);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
    expect(meta.totalPages).toBe(1);
  });

  it('handles zero total correctly', () => {
    const meta = buildPaginationMeta(1, 10, 0);
    expect(meta.total).toBe(0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
  });
});
