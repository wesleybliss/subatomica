import {
    accounts,
    teamMembers,
    trelloBoardLinks,
    type TrelloMemberLink,
    trelloMemberLinks,
    users,
} from '@repo/db/schema'
import Logger from '@repo/shared/utils/logger'
import { and, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/client'
import { getAccessibleTeamIds } from '@/services/shared'
import {
    getBoardMembers,
    getMe,
    type TrelloMember,
} from '@/services/trello/client'
import { assertConnected } from '@/services/trello/oauth'

const log = new Logger('api/trello/members')

export type MemberMappingInput = {
    trelloMemberId: string
    email: string
    trelloUsername?: string | null
    trelloFullName?: string | null
}

export type CatalogMember = {
    trelloMemberId: string
    trelloUsername: string | null
    trelloFullName: string | null
    email: string | null
    userId: string | null
    claimed: boolean
    suggestedEmail: string | null
}

async function assertTeamAccess(userId: string, teamId: string) {
    const accessible = getAccessibleTeamIds(userId)
    if (!accessible.includes(teamId))
        throw new Error('NotFound: Team not found')
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

async function ensureTeamMembership(teamId: string, userId: string) {
    await db
        .insert(teamMembers)
        .values({
            userId,
            teamId,
            role: 'member',
        })
        .onConflictDoNothing()
}

async function resolveOrCreateUser(params: {
    email: string
    name: string
}): Promise<{ userId: string, created: boolean }> {
    const email = normalizeEmail(params.email)
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
    
    if (existing)
        return { userId: existing.id, created: false }
    
    const [created] = await db
        .insert(users)
        .values({
            name: params.name.trim() || email,
            email,
            emailVerified: false,
        })
        .returning({ id: users.id })
    
    return { userId: created.id, created: true }
}

export async function applyMemberMappings(
    teamId: string,
    mappings: MemberMappingInput[],
    memberMetaById?: Map<string, TrelloMember>,
) {
    let created = 0
    let linked = 0
    
    for (const mapping of mappings) {
        const email = normalizeEmail(mapping.email)
        if (!email || !email.includes('@'))
            continue
        
        const meta = memberMetaById?.get(mapping.trelloMemberId)
        const username = mapping.trelloUsername ?? meta?.username ?? null
        const fullName = mapping.trelloFullName ?? meta?.fullName ?? null
        const displayName = fullName || username || email
        
        const { userId, created: wasCreated } = await resolveOrCreateUser({
            email,
            name: displayName,
        })
        if (wasCreated)
            created += 1
        
        await ensureTeamMembership(teamId, userId)
        
        const [existing] = await db
            .select()
            .from(trelloMemberLinks)
            .where(and(
                eq(trelloMemberLinks.teamId, teamId),
                eq(trelloMemberLinks.trelloMemberId, mapping.trelloMemberId),
            ))
            .limit(1)
        
        if (existing) {
            await db
                .update(trelloMemberLinks)
                .set({
                    email,
                    userId,
                    trelloUsername: username,
                    trelloFullName: fullName,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(trelloMemberLinks.id, existing.id))
        }
        else {
            await db.insert(trelloMemberLinks).values({
                teamId,
                trelloMemberId: mapping.trelloMemberId,
                trelloUsername: username,
                trelloFullName: fullName,
                email,
                userId,
            })
        }
        linked += 1
    }
    
    return { created, linked }
}

export async function getAssigneeMap(teamId: string): Promise<Map<string, string>> {
    const links: TrelloMemberLink[] = await db
        .select()
        .from(trelloMemberLinks)
        .where(eq(trelloMemberLinks.teamId, teamId))
    
    const map = new Map<string, string>()
    for (const link of links) {
        if (link.userId)
            map.set(link.trelloMemberId, link.userId)
    }
    return map
}

export function pickAssigneeId(
    idMembers: string[] | undefined,
    assigneeByTrelloId: Map<string, string>,
): string | null {
    if (!idMembers?.length)
        return null
    for (const memberId of idMembers) {
        const userId = assigneeByTrelloId.get(memberId)
        if (userId)
            return userId
    }
    return null
}

export async function upsertMemberStubs(
    teamId: string,
    members: TrelloMember[],
) {
    for (const member of members) {
        const [existing] = await db
            .select({ id: trelloMemberLinks.id })
            .from(trelloMemberLinks)
            .where(and(
                eq(trelloMemberLinks.teamId, teamId),
                eq(trelloMemberLinks.trelloMemberId, member.id),
            ))
            .limit(1)
        
        if (existing) {
            await db
                .update(trelloMemberLinks)
                .set({
                    trelloUsername: member.username || null,
                    trelloFullName: member.fullName || null,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(trelloMemberLinks.id, existing.id))
            continue
        }
        
        await db.insert(trelloMemberLinks).values({
            teamId,
            trelloMemberId: member.id,
            trelloUsername: member.username || null,
            trelloFullName: member.fullName || null,
            email: null,
            userId: null,
        })
    }
}

export async function listTeamMembersForBoards(
    userId: string,
    teamId: string,
    boardIds: string[],
) {
    await assertTeamAccess(userId, teamId)
    await assertConnected(teamId)
    
    const ids = [...new Set(boardIds.filter(Boolean))]
    
    let boardIdsToFetch = ids
    if (boardIdsToFetch.length === 0) {
        const links = await db
            .select({ trelloBoardId: trelloBoardLinks.trelloBoardId })
            .from(trelloBoardLinks)
            .where(eq(trelloBoardLinks.teamId, teamId))
        boardIdsToFetch = links.map((l: { trelloBoardId: string }) => l.trelloBoardId)
    }
    
    const memberById = new Map<string, TrelloMember>()
    
    await Promise.all(boardIdsToFetch.map(async boardId => {
        try {
            const members = await getBoardMembers(teamId, boardId)
            for (const member of members)
                memberById.set(member.id, member)
        }
        catch (err) {
            log.e('Failed to fetch board members', boardId, err)
        }
    }))
    
    if (memberById.size > 0)
        await upsertMemberStubs(teamId, [...memberById.values()])
    
    let me: TrelloMember | null = null
    try {
        me = await getMe(teamId)
    }
    catch (err) {
        log.e('Failed to fetch Trello me', err)
    }
    
    const existingLinks: TrelloMemberLink[] = await db
        .select()
        .from(trelloMemberLinks)
        .where(eq(trelloMemberLinks.teamId, teamId))
    
    const linkByTrelloId = new Map(existingLinks.map(l => [l.trelloMemberId, l]))
    
    // Union: stubs from boards + any previously saved links
    const allIds = new Set([
        ...memberById.keys(),
        ...linkByTrelloId.keys(),
    ])
    
    const claimedUserIds = new Set<string>()
    const userIds = [...linkByTrelloId.values()]
        .map(l => l.userId)
        .filter((id): id is string => Boolean(id))
    
    if (userIds.length > 0) {
        const creds = await db
            .select({ userId: accounts.userId })
            .from(accounts)
            .where(and(
                inArray(accounts.userId, userIds),
                eq(accounts.providerId, 'credential'),
            ))
        for (const c of creds)
            claimedUserIds.add(c.userId)
    }
    
    const result: CatalogMember[] = [...allIds].map(trelloMemberId => {
        const meta = memberById.get(trelloMemberId)
        const link = linkByTrelloId.get(trelloMemberId)
        const suggestedEmail = me && me.id === trelloMemberId && me.email
            ? normalizeEmail(me.email)
            : null
        
        return {
            trelloMemberId,
            trelloUsername: meta?.username ?? link?.trelloUsername ?? null,
            trelloFullName: meta?.fullName ?? link?.trelloFullName ?? null,
            email: link?.email ?? null,
            userId: link?.userId ?? null,
            claimed: link?.userId ? claimedUserIds.has(link.userId) : false,
            suggestedEmail,
        }
    }).sort((a, b) =>
        (a.trelloFullName || a.trelloUsername || '')
            .localeCompare(b.trelloFullName || b.trelloUsername || ''),
    )
    
    return {
        members: result,
        connectedMemberId: me?.id ?? null,
    }
}

export async function saveMemberMappings(
    userId: string,
    teamId: string,
    mappings: MemberMappingInput[],
) {
    await assertTeamAccess(userId, teamId)
    await assertConnected(teamId)
    
    const stats = await applyMemberMappings(teamId, mappings)
    log.i('Saved member mappings', teamId, stats)
    return stats
}
