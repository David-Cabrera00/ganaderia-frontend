import { useMemo, useState } from 'react';

export function usePagination(initialPage = 0, initialSize = 10) {
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);

  const params = useMemo(() => ({ page, size }), [page, size]);

  return {
    page,
    size,
    params,
    setPage,
    setSize,
    reset: () => {
      setPage(initialPage);
      setSize(initialSize);
    },
  };
}
