import { useEffect, useState, useMemo } from 'react';

export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX: Memoize the options object to create a stable dependency.
  // This prevents the useEffect hook from re-running on every render
  // due to a changing object reference.
  const stableOptions = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // The options object is parsed back from the stable string
    const requestOptions = options ? JSON.parse(stableOptions) : undefined;

    fetch(url, requestOptions)
      .then(async (res) => {
        if (!res.ok) {
            // Try to get a more specific error message from the response body
            const errorBody = await res.json().catch(() => ({ message: 'Failed to fetch' }));
            throw new Error(errorBody.message || 'Failed to fetch');
        }
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
    // The dependency array now uses the stable, memoized string.
  }, [url, stableOptions, options]);

  return { data, loading, error };
}
