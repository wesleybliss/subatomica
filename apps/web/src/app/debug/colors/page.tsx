import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

type ColorGroup = {
  label: string;
  colors: { name: string; variable: string }[];
};

const COLOR_GROUPS: ColorGroup[] = [
    {
        label: 'Core Colors',
        colors: [
            { name: 'Background', variable: '--background' },
            { name: 'Foreground', variable: '--foreground' },
            { name: 'Card', variable: '--card' },
            { name: 'Card Foreground', variable: '--card-foreground' },
        ],
    },
    {
        label: 'Interactive Colors',
        colors: [
            { name: 'Primary', variable: '--primary' },
            { name: 'Primary Foreground', variable: '--primary-foreground' },
            { name: 'Secondary', variable: '--secondary' },
            { name: 'Secondary Foreground', variable: '--secondary-foreground' },
            { name: 'Accent', variable: '--accent' },
            { name: 'Accent Foreground', variable: '--accent-foreground' },
        ],
    },
    {
        label: 'Semantic Colors',
        colors: [
            { name: 'Destructive', variable: '--destructive' },
            { name: 'Destructive Foreground', variable: '--destructive-foreground' },
            { name: 'Muted', variable: '--muted' },
            { name: 'Muted Foreground', variable: '--muted-foreground' },
        ],
    },
    {
        label: 'Chart Colors',
        colors: [
            { name: 'Chart 1', variable: '--chart-1' },
            { name: 'Chart 2', variable: '--chart-2' },
            { name: 'Chart 3', variable: '--chart-3' },
            { name: 'Chart 4', variable: '--chart-4' },
            { name: 'Chart 5', variable: '--chart-5' },
        ],
    },
    {
        label: 'Sidebar Colors',
        colors: [
            { name: 'Sidebar', variable: '--sidebar' },
            { name: 'Sidebar Foreground', variable: '--sidebar-foreground' },
            { name: 'Sidebar Primary', variable: '--sidebar-primary' },
            { name: 'Sidebar Primary Foreground', variable: '--sidebar-primary-foreground' },
            { name: 'Sidebar Accent', variable: '--sidebar-accent' },
            { name: 'Sidebar Accent Foreground', variable: '--sidebar-accent-foreground' },
            { name: 'Sidebar Border', variable: '--sidebar-border' },
        ],
    },
    {
        label: 'Input & Border',
        colors: [
            { name: 'Border', variable: '--border' },
            { name: 'Input', variable: '--input' },
            { name: 'Ring', variable: '--ring' },
        ],
    },
    {
        label: 'Popover',
        colors: [
            { name: 'Popover', variable: '--popover' },
            { name: 'Popover Foreground', variable: '--popover-foreground' },
        ],
    },
]

function ColorSwatch({
    name,
    variable,
}: {
  name: string;
  variable: string;
}) {
    const [color, setColor] = useState<string>('')
    
    useEffect(() => {
        // eslint-disable-next-line no-restricted-globals
        const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
        setColor(value)
    }, [variable])
    
    return (
        <div className="space-y-2">
            <div
                className="w-full h-24 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: color }}/>
            <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground font-mono">{color || 'Loading...'}</p>
                <p className="text-xs text-muted-foreground font-mono">{variable}</p>
            </div>
        </div>
    )
}

export default function DebugColorsPage() {
    return (
        <section className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Theme Colors</h1>
                <p className="text-muted-foreground">
          All colors from the Tailwind & shadcn configuration
                </p>
            </div>
            
            <div className="space-y-12">
                {COLOR_GROUPS.map(group => (
                    <div key={group.label}>
                        <h2 className="text-lg font-semibold text-foreground mb-4">{group.label}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {group.colors.map(color => (
                                <ColorSwatch
                                    key={color.variable}
                                    name={color.name}
                                    variable={color.variable}/>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
