import { Form, useSearchParams, useSubmit } from '@remix-run/react'
import { useId, useState } from 'react'
import { useDebounce, useIsPending } from '#app/utils/misc.tsx'
import { Icon } from './ui/icon.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { StatusButton } from './ui/status-button.tsx'

//  _____   _________________________________________  Search Bar
export function SearchBar({
	status,
	autoFocus = false,
	autoSubmit = false,
}: {
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocus?: boolean
	autoSubmit?: boolean
}) {
	const id = useId()
	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/artworks/',
	})

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	const [searchType, setSearchType] = useState<
		'all' | 'artist' | 'style' | 'place' | 'date' | 'color' | ''
	>('')

	const [searchParams, setsearchParams] = useSearchParams()

	//  _____   _____________________________return

	return (
		<Form
			method="GET"
			action="/artworks/"
			className="flex flex-wrap items-center justify-center gap-2"
			onChange={(e) => autoSubmit && handleFormChange(e.currentTarget)}
		>
			{/* MARK: SearchInput
			 */}
			<div className="flex-1">
				<Label htmlFor={id} className="sr-only">
					Search
				</Label>
				<Input
					type="search"
					name="search"
					id={id}
					defaultValue={searchParams.get('search') ?? ''}
					placeholder={`Search ${searchType}`}
					className="w-full box-shadow"
					autoFocus={autoFocus}
					onChange={(e) => setsearchParams(e.target.value)}
				/>
			</div>
			{/* MARK: Select
			 */}
			<div className="flex-1">
				<Label htmlFor={id} className="sr-only">
					Search Type
				</Label>
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
					<option value="date">Date</option>
					<option value="color">Color</option>
				</select>
			</div>

			<div>
				<StatusButton
					type="submit"
					status={isSubmitting ? 'pending' : status}
					className="flex w-full items-center justify-center"
				>
					<Icon name="magnifying-glass" size="md" />
					<span className="sr-only">Search</span>
				</StatusButton>
			</div>
		</Form>
	)
}
