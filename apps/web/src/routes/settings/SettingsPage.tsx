'use client'

import { useWireValue } from '@forminator/react-wire'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Users, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGetTeamsQuery } from '@/lib/queries/teams.queries'
import {
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
} from '@/lib/mutations/teams.mutations'
import * as store from '@/store'
import type { Team } from '@repo/shared/types'

export default function SettingsPage() {
    const teams = useWireValue(store.teams)

    useGetTeamsQuery()

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="border-b border-border">
                <div className="mx-auto max-w-5xl px-6 py-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Settings</p>
                            <h1 className="text-3xl font-semibold mt-2">Manage your teams</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Create, rename, and delete teams. Click on a team to manage its members.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-6 py-10">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Teams</CardTitle>
                            <CardDescription>
                                {teams.length} team{teams.length !== 1 ? 's' : ''} total
                            </CardDescription>
                        </div>
                        <CreateTeamDialog />
                    </CardHeader>
                    <CardContent>
                        {teams.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <h3 className="mt-4 text-lg font-medium">No teams yet</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Get started by creating your first team.
                                </p>
                                <div className="mt-6">
                                    <CreateTeamDialog />
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {teams.map(team => (
                                    <TeamListItem key={team.id} team={team} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function TeamListItem({ team }: { team: Team }) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <Link to={`/t/${team.slug}/settings`} className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                        {team.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div>
                    <h4 className="font-medium">{team.name}</h4>
                    <p className="text-sm text-muted-foreground">/{team.slug}</p>
                </div>
            </Link>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditTeamDialog team={team} />
                <DeleteTeamDialog team={team} />
                <Link to={`/t/${team.slug}/settings`} className="inline-flex items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium transition-all hover:bg-muted hover:text-foreground h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    )
}

function CreateTeamDialog() {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const createTeam = useCreateTeamMutation()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        const team = await createTeam.mutateAsync({ name })
        setName('')
        setOpen(false)
        navigate(`/t/${team.slug}`)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Team</DialogTitle>
                        <DialogDescription>
                            Create a new team to collaborate with others.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Team Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Engineering"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!name.trim() || createTeam.isPending}>
                            {createTeam.isPending ? 'Creating...' : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function EditTeamDialog({ team }: { team: Team }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(team.name)
    const updateTeam = useUpdateTeamMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name === team.name) return
        await updateTeam.mutateAsync({ teamId: team.id, name })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button variant="ghost" size="icon-sm" />
            }>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit {team.name}</span>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Rename Team</DialogTitle>
                        <DialogDescription>
                            Change the name of your team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Team Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Team name"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={!name.trim() || name === team.name || updateTeam.isPending}
                        >
                            {updateTeam.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function DeleteTeamDialog({ team }: { team: Team }) {
    const [open, setOpen] = useState(false)
    const [confirmName, setConfirmName] = useState('')
    const deleteTeam = useDeleteTeamMutation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (confirmName !== team.name) return
        await deleteTeam.mutateAsync({ teamId: team.id })
        setOpen(false)
        setConfirmName('')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
                <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" />
            }>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete {team.name}</span>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Delete Team</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the team
                            <strong> {team.name}</strong> and all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-delete">
                                Type <strong>{team.name}</strong> to confirm
                            </Label>
                            <Input
                                id="confirm-delete"
                                value={confirmName}
                                onChange={e => setConfirmName(e.target.value)}
                                placeholder={team.name}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="destructive"
                            disabled={confirmName !== team.name || deleteTeam.isPending}
                        >
                            {deleteTeam.isPending ? 'Deleting...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
