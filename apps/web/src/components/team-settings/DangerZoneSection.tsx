import type { Team } from '@repo/shared/types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import {
    useDeleteTeamMutation,
    useUpdateTeamMutation,
} from '@/lib/mutations/teams.mutations'

type DangerZoneSectionProps = {
    team: Team
}

export function DangerZoneSection({ team }: DangerZoneSectionProps) {
    return (
        <section className="rounded-2xl border border-red-200 shadow-sm">
            <div className="border-b border-red-100 px-6 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-red-400">
                    Danger Zone
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                    Irreversible actions that affect this team.
                </p>
            </div>

            <div className="divide-y divide-red-100">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <p className="font-medium text-neutral-900">Rename team</p>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Change the display name and URL slug for this team.
                        </p>
                    </div>
                    <RenameTeamDialog team={team} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <p className="font-medium text-neutral-900">Delete team</p>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            Permanently delete this team and all associated data.
                        </p>
                    </div>
                    <DeleteTeamDialog team={team} />
                </div>
            </div>
        </section>
    )
}

function RenameTeamDialog({ team }: { team: Team }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(team.name)
    const updateTeam = useUpdateTeamMutation()
    const navigate = useNavigate()

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (next) setName(team.name)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || name.trim() === team.name) return

        try {
            const updated = await updateTeam.mutateAsync({
                teamId: team.id,
                name: name.trim(),
            })
            toast.success('Team renamed')
            setOpen(false)
            if (updated.slug !== team.slug)
                navigate(`/t/${updated.slug}/settings`, { replace: true })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to rename team')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
                Rename team
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Rename Team</DialogTitle>
                        <DialogDescription>
                            Change the name of your team. The URL slug will update to match.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="danger-rename">Team Name</Label>
                            <Input
                                id="danger-rename"
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
                            onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                !name.trim()
                                || name.trim() === team.name
                                || updateTeam.isPending
                            }>
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
    const navigate = useNavigate()

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (!next) setConfirmName('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (confirmName !== team.name) return

        try {
            await deleteTeam.mutateAsync({ teamId: team.id })
            toast.success('Team deleted')
            setOpen(false)
            navigate('/', { replace: true })
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete team')
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button variant="destructive" size="sm" />}>
                Delete team
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
                            <Label htmlFor="danger-delete-confirm">
                                Type <strong>{team.name}</strong> to confirm
                            </Label>
                            <Input
                                id="danger-delete-confirm"
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
                            onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={confirmName !== team.name || deleteTeam.isPending}>
                            {deleteTeam.isPending ? 'Deleting...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
