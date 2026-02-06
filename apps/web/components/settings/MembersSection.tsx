'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, UserPlus } from 'lucide-react'
import { addTeamMember, removeTeamMember } from '@/lib/db/actions/teams'
import { toast } from 'sonner'

type Member = {
    id: string
    name: string
    email: string
    image: string | null
    role: string
}

type MembersSectionProps = {
    teamId: string
    members: Member[]
    canManage: boolean
}

const avatarUrlFor = (name: string, email: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`

const getRoleBadgeVariant = (role: string) => {
    switch (role) {
        case 'owner':
            return 'default'
        case 'admin':
            return 'secondary'
        default:
            return 'outline'
    }
}

export function MembersSection({ teamId, members, canManage }: MembersSectionProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const handleAddMember = async () => {
        if (!email.trim()) {
            toast.error('Please enter an email address')
            return
        }
        
        setIsSubmitting(true)
        try {
            await addTeamMember(teamId, email.trim())
            toast.success('Member added successfully')
            setEmail('')
            setIsAddDialogOpen(false)
            window.location.reload()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add member')
        } finally {
            setIsSubmitting(false)
        }
    }
    
    const handleRemoveMember = async (userId: string, memberName: string) => {
        if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
            return
        }
        
        try {
            await removeTeamMember(teamId, userId)
            toast.success(`${memberName} has been removed from the team`)
            window.location.reload()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to remove member')
        }
    }
    
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Members</p>
                    {canManage && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger
                                className={'h-8 gap-1.5 inline-flex items-center justify-center '
                                    + 'whitespace-nowrap transition-all disabled:pointer-events-none '
                                    + 'disabled:opacity-50 shrink-0 outline-none select-none '
                                    + 'text-xs font-medium bg-primary text-primary-foreground px-2.5'}
                                data-slot="button">
                                <UserPlus className="h-4 w-4" />
                                Add Member
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Team Member</DialogTitle>
                                    <DialogDescription>
                                        Enter the email address of an existing user to add them to this team.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="user@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleAddMember()
                                                }
                                            }}/>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                        disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddMember} disabled={isSubmitting}>
                                        {isSubmitting ? 'Adding...' : 'Add Member'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
            
            <div className="divide-y divide-neutral-100">
                {members.length === 0 ? (
                    <div className="px-6 py-8 text-center text-neutral-500">
                        <p>No members in this team yet.</p>
                    </div>
                ) : (
                    members.map(member => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50">
                            <div className="flex items-center gap-4">
                                <img
                                    src={member.image || avatarUrlFor(member.name, member.email)}
                                    alt={member.name}
                                    className="h-10 w-10 rounded-full border border-neutral-200"/>
                                <div>
                                    <p className="font-medium text-neutral-900">{member.name}</p>
                                    <p className="text-sm text-neutral-500">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                                    {member.role}
                                </Badge>
                                {canManage && member.role !== 'owner' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleRemoveMember(member.id, member.name)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove from team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    )
}