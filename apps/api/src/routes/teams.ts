import { Context } from 'hono'
import { getUserTeams } from '@/services/teams'

export const getTeams = async (c: Context) => {
    
    const user = c.get('user')
    
    const teams = await getUserTeams(user.id)
    
    c.json(teams)
    
}

export default (app: any) => {
  
    app.get('/t', getTeams)
    
}
