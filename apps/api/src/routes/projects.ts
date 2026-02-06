import { Context, Hono } from 'hono'
// import { ProjectSchema } from '@repo/shared/schemas/project'
import { getProjects } from '@/services/projects'

export default async (c: Context) => {
    
    /*app.get('/', async () => {
        const projects = await getProjects()
        return projects.map(p => ProjectSchema.parse(p))
    })*/
    
    //const { q, page, limit } = request.query
    
    type GetProjectsParams = {
        Params: {
            teamId: string
        }
    }
    
    const teamId = c.req.param('teamId')
    
    if (!teamId)
        return c.json(
            { error: 'teamId is required' },
            { status: 404 },
        )
    
    const projects = await getProjects(teamId)
    
    c.json(projects)
    
}
