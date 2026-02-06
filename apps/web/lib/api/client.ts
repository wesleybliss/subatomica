
export const request = async (url: string, options?: RequestInit) => {
    
    const res = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })
    
    if (!res.ok)
        throw new Error(`API Error: ${res.status}`)
    
    return res.json()
    
}

// Then use it:
/*export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: () => apiClient('/api/projects'),
    })
}*/
