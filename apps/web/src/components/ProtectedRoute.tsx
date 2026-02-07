import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'

const ProtectedRoute = () => {
    
    const location = useLocation()
    const { data: session, isPending } = useSession()
    
    if (isPending)
        return null // @todo or a spinner
    
    if (session)
        return <Navigate to="/" replace state={{ from: location }} />
    
    return <Outlet />
    
}

export default ProtectedRoute
