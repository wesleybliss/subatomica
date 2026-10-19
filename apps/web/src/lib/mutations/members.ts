// @todo

import Logger from '@repo/shared/utils/logger'

const log = new Logger('web/lib/mutations/members')

export const addTeamMember = async (teamId: string, email: string) => {
    log.d('@todo addTeamMember', { teamId, email })
}

export const removeTeamMember = async (teamId: string, userId: string) => {
    log.d('@todo removeTeamMember', { teamId, userId })
}
