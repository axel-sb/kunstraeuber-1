import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '#app/utils/misc.tsx'

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-within:ring-2 ring-ring ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'border border-input text-primary-foreground hover:bg-secondary/80',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/80',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent text-yellow-100 hover:text-yellow-300 ring-0 focus-visible:ring-0 focus-within:ring-0',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				wide: 'px-24 py-5',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				pill: 'px-12 py-3 leading-3',
				icon: 'h-10 w-10',
				fill: 'h-10 w-10 px-0 py-0',
				ghost: 'h-10 px-2 py-2',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return (
			<>
				<Comp
					className={cn(buttonVariants({ variant, size, className }))}
					ref={ref}
					{...props}
				/>
				<select
					id="searchType"
					name="searchType"
					value={searchType}
					onChange={(e) => {
						const searchType = e.target.value as
							| 'all'
							| 'artist'
							| 'style'
							| 'place'
							| 'date'
							| 'color'

						setSearchType(searchType)

						if (searchType === 'color') {
							window.location.href = '/artworks/colorSearch'
						}
					}}
					className="aria-[invalid]:border-input-invalid flex h-10 w-full rounded-md border border-input bg-background px-6 py-4 font-light ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="all">All</option>
					<option value="artist">Artist</option>
					<option value="style">Style</option>
					<option value="place">Place</option>
					<option value="date">Date</option>765t4rswa8
					<option value="color">Color</option>
				</select>
			</>
		)
	},
)
Button.displayName = 'Button'

export { Button, buttonVariants }
