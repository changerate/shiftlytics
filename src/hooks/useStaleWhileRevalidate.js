"use client";
import { useState, useEffect, useCallback, useRef } from 'react';





/**
 * Custom hook that implements the stale-while-revalidate pattern
 * Returns cached data immediately while fetching fresh data in the background
 * 
 * @param {string} key - Unique key for caching
 * @param {Function} fetcher - Function that returns a promise with data
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, error, isLoading, isValidating, mutate }
 */
export function useStaleWhileRevalidate(key, fetcher, options = {}) {
    const {
        refreshInterval = 0, // 0 = no auto refresh
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
        dedupingInterval = 2000, // 2 seconds deduping
        errorRetryCount = 3,
        errorRetryInterval = 5000, // 5 seconds
        staleTime = 0, // 0 = always stale
    } = options;

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    
    const cacheRef = useRef(new Map());
    const lastFetchRef = useRef(new Map());
    const retryCountRef = useRef(0);
    const intervalRef = useRef(null);

    // Cache key for this specific request
    const getCachedData = useCallback(() => {
        return cacheRef.current.get(key);
    }, [key]);

    const setCachedData = useCallback((newData) => {
        cacheRef.current.set(key, {
            data: newData,
            timestamp: Date.now(),
        });
    }, [key]);

    const isStale = useCallback(() => {
        const cached = getCachedData();
        if (!cached) return true;
        return Date.now() - cached.timestamp > staleTime;
    }, [getCachedData, staleTime]);

    const shouldDedup = useCallback(() => {
        const lastFetch = lastFetchRef.current.get(key);
        if (!lastFetch) return false;
        return Date.now() - lastFetch < dedupingInterval;
    }, [key, dedupingInterval]);





    const fetchData = useCallback(async (isRevalidation = false) => {
        // Prevent duplicate requests within deduping interval
        if (!isRevalidation && shouldDedup()) {
            return;
        }

        try {
            // Set validating state
            setIsValidating(true);
            if (!isRevalidation) {
                setIsLoading(true);
                setError(null);
            }

            // Record fetch time
            lastFetchRef.current.set(key, Date.now());

            // Call the fetcher function
            const result = await fetcher();

            // Update cache and state
            setCachedData(result);
            setData(result);
            setError(null);
            retryCountRef.current = 0; // Reset retry count on success

        } catch (err) {
            console.error('SWR fetch error:', err);
            setError(err);
            
            // Retry logic
            if (retryCountRef.current < errorRetryCount) {
                retryCountRef.current += 1;
                setTimeout(() => {
                    fetchData(isRevalidation);
                }, errorRetryInterval);
            }
        } finally {
            setIsLoading(false);
            setIsValidating(false);
        }
    }, [key, fetcher, shouldDedup, setCachedData, errorRetryCount, errorRetryInterval]);





    // Manual mutate function to update data
    const mutate = useCallback(async (newData) => {
        if (typeof newData === 'function') {
            // If newData is a function, call it with current data
            const currentData = data || getCachedData()?.data;
            const updatedData = await newData(currentData);
            setData(updatedData);
            setCachedData(updatedData);
        } else if (newData !== undefined) {
            // If newData is provided, use it directly
            setData(newData);
            setCachedData(newData);
        } else {
            // If no newData provided, revalidate
            await fetchData(true);
        }
    }, [data, getCachedData, setCachedData, fetchData]);




    // Initial data fetch
    useEffect(() => {
        const cached = getCachedData();
        
        if (cached && !isStale()) {
            // Use cached data if available and not stale
            setData(cached.data);
            setIsLoading(false);
            // Still revalidate in background if needed
            if (isStale()) {
                fetchData(true);
            }
        } else {
            // No cache or stale data, fetch fresh
            fetchData();
        }
    }, [key, fetchData, getCachedData, isStale]);

   


    // Set up refresh interval
    useEffect(() => {
        if (refreshInterval > 0) {
            intervalRef.current = setInterval(() => {
                fetchData(true);
            }, refreshInterval);

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [refreshInterval, fetchData]);




    // Revalidate on window focus
    useEffect(() => {
        if (!revalidateOnFocus) return;

        const handleFocus = () => {
            if (isStale()) {
                fetchData(true);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [revalidateOnFocus, fetchData, isStale]);




    // Revalidate on network reconnect
    useEffect(() => {
        if (!revalidateOnReconnect) return;

        const handleOnline = () => {
            fetchData(true);
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [revalidateOnReconnect, fetchData]);




    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    };
}

export default useStaleWhileRevalidate;
