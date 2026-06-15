import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * Usage:  const { data, loading, error, refetch } = useApi(fn, deps)
 */
export function useApi(apiFn, deps = [], options = {}) {
  const { immediate = true, transform } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const fnRef = useRef(apiFn);
  fnRef.current = apiFn;

  const fetch = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fnRef.current(...args);
      const result = transform ? transform(res.data) : res.data;
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Paginated list hook.
 */
export function usePaginatedList(apiFn, initialParams = {}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const merged = { ...params, ...overrides, page: (overrides.page ?? params.page ?? 0) + 1, limit: overrides.limit ?? params.limit ?? 10 };
      const res = await apiFn(merged);
      setItems(res.data.data);
      setPagination(p => ({ ...p, total: res.data.pagination?.total ?? res.data.data.length }));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const setPage = (page) => { setPagination(p => ({ ...p, page })); setParams(p => ({ ...p, page })); };
  const setLimit = (limit) => { setPagination(p => ({ ...p, limit, page: 0 })); setParams(p => ({ ...p, limit, page: 0 })); };
  const setSearch = (search) => setParams(p => ({ ...p, search, page: 0 }));
  const setFilter = (key, value) => setParams(p => ({ ...p, [key]: value, page: 0 }));

  return { items, pagination, loading, refetch: fetch, setPage, setLimit, setSearch, setFilter };
}
