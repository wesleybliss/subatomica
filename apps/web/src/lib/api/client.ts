import { API_BASE } from '@/lib/api-base'

const createFullUrl = (url: string) => {
    
    if (url.startsWith('http:') || url.startsWith('https:'))
        return url
    
    if (url.startsWith('/'))
        return `${API_BASE}${url}`
    
    return `${API_BASE}/${url}`
    
}

export const request = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    
    const fullUrl = createFullUrl(url)
    
    const res = await fetch(fullUrl, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })
    
    if (!res.ok)
        throw new Error(`API Error: ${res.status}`)
    
    return await res.json()
    
}

// Then use it:
/*export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: () => apiClient('/projects'),
    })
}*/
