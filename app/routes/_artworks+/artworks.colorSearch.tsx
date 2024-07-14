// #region imports
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Form,
	NavLink,
	useLoaderData,
	useNavigation,
	useSubmit,
} from '@remix-run/react'

import Hue from '@uiw/react-color-hue'
import { useEffect, useState } from 'react'
import { Icon } from '#app/components/ui/icon.js'
import { Input } from '#app/components/ui/input'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useDebounce, useIsPending } from '#app/utils/misc'
import { getColor } from '../resources+/search-data.server'
import colorSearch from './artworks.colorSearch.css?url'
import artworks from './artworks.index.css?url'
// #endregion imports

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworks },
	{ rel: 'stylesheet', href: colorSearch },
]

// #region Loader  // ___ ________________________ Loader ⇅ ⬆︎⬇︎

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get('q') ?? '200'
	let data = await getColor((q ?? '200').toString())
	return json({ q, data })
}
// #endregion

// #region Color Search  //          ______________ Color Search 🌈

// ________________________ https://uiwjs.github.io/react-color/#/hue
export default function ColorSearch({
	status,
	autoFocus = false,
	autoSubmit = false,
}: {
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocus?: boolean
	autoSubmit?: boolean
}) {
	const { q, data } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	const [color, setcolor] = useState('')

	function HueSlider() {
		const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 })
		console.log('🟡 hsva →', hsva)
		return (
			<Hue
				hue={hsva.h}
				onChange={newHue => {
					setHsva({ ...hsva, ...newHue })
					setcolor(JSON.stringify(newHue.h))
				}}
			/>
		)
	}

	useEffect(() => {
		const searchField = document.getElementById('q')
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	// We've seen useNavigate already, we'll use its cousin, useSubmit (https://remix.run/docs/en/main/hooks/use-submit), for this.
	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/',
	})

	// Spinner
	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	/* // __  ____________________________    Color Picker 🌈  */

	return (
		<>
			<header className="hidden py-6">
				<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8"></nav>
			</header>

			<HueSlider />

			<Form
				id="search-form"
				className="flex flex-wrap items-center justify-center gap-2"
				onChange={e => autoSubmit && handleFormChange(e.currentTarget)}
				role="search"
			>
				<div className="flex w-full">
					<label
						htmlFor="color-picker"
						className="inline-block h-16 w-full"
						style={{
							background: `linear-gradient(to right, hsl(${color}, 100%, 35%) 40%, hsl(${color}, 100%, 50%) 60%, hsl(${color}, 100%, 85%)`,
							color: `hsl(${color}, 100%, 50%)`
						}}
					></label>
					<Input
						aria-label="Search by color"
						id="q"
						name="q"
						value={color}
						onChange={e => setcolor(e.target.value)}
						placeholder="Search"
						type="hidden"
					/>

				</div>
				<div>
					<StatusButton
						type="submit"
						status={isSubmitting ? 'pending' : status}
						className="relative -top-14 flex h-8 w-full items-center justify-center border-0 hover:bg-secondary/10 "
                        style={{color: `${color}`, filter: 'invert(1)'}}
					>
						<Icon name="magnifying-glass" size="xl" />
						<span className="sr-only">Search</span>
					</StatusButton>
				</div>
				<div aria-hidden hidden={!searching} id="search-spinner" />
			</Form>

			{/* // ___ _______________________________ response (images) on page */}

			<main className="flex flex-col items-center justify-center">
				<ul className="artworks-preview max-h-[90dvh]} mb-12 flex w-full flex-col items-center justify-start gap-16 overflow-y-auto">
					{data ? (
						data.map(artwork => (
							<li key={artwork.id} className="md:max-w-sm">
								<NavLink
									className={({ isActive, isPending }) =>
										isActive ? 'active' : isPending ? 'pending' : ''
									}
									to={`../artworks/${artwork.id}`}
								>
									{artwork.Title ? (
										<>
											<figure className="relative p-4 hover:grid hover:items-start">
												<img
													alt={artwork.alt_text ?? undefined}
													key={artwork.id}
													src={artwork.image_url ?? '../dummy.jpeg'}
												/>
												{/* //__ ______ figcaption ____artwork.Title_-_artwork.artist_title_-_arrow-right */}
												<figcaption>
													<div>{artwork.Title}</div>
													<div className="flex w-full justify-between">
														<span>{artwork.artist_title}</span>
														<Icon
															name="eye-open"
															className="absolute bottom-4 right-4 h-6 w-6"
														/>
													</div>
												</figcaption>
											</figure>
										</>
									) : (
										<i>No Artworks found </i>
									)}
								</NavLink>
							</li>
						))
					) : (
						<li>no data</li>
					)}
				</ul>
			</main>
		</>
	)
}

// #endregion
