// #region  import export
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import { NavLink, useLoaderData, useLocation } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.js'
import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
} from '../resources+/search-data.server'
import artworks from './artworks.index.css?url'

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworks },
]

/* //$ MARK: Loader
   This function is only ever run on the server. On the initial server render, it will provide data to the HTML document. On navigations in the browser, Remix will call the function via fetch from the browser.This means you can talk directly to your database, use server-only API secrets, etc. Any code that isn't used to render the UI will be removed from the browser bundle. */
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? undefined
	const searchType = url.searchParams.get('searchType') ?? 'All'

	let data
	switch (searchType) {
		case 'all':
			data = await getAny(query)
			break
		case 'artist':
			data = await getArtist(query)
			break
		case 'style':
			data = await getStyle(query)
			break
		case 'place':
			data = await getPlace(query)
			break
		case 'date':
			data = await getDate(Number(query))
			break
		case 'color':
			data = await getColor((query ?? '').toString())
			break

		default:
			break /* = await getAny('Picasso') */
	}
	console.log(
		'🟡🟡🟡 searchType, query → ',
		searchType, query,
		'🟡 data → ',
		data ? data[0] : 'no data returned by loader',
	)
	return json({ query, data })
}

// #endregion import export

//+                                            export default
// MARK: Export default
export default function ArtworksPage() {
	const { data, query } = useLoaderData<typeof loader>()
	const location = useLocation()
	const currentQueryKey = location.search.split('&').find(part => part.startsWith('='))?.split('=')[1];

	return (
		//+ ___________________________________________  return  JSX ↓
		<>
			<main className="flex flex-col items-center overscroll-contain">
				<ul className="artworks-fade-in flex list-none flex-col items-center justify-start gap-y-28 overflow-y-auto overscroll-contain pb-28 pt-12">
					{data ? (
						data.map((artwork) => (
							<li key={artwork.id} className="flex items-center">
								<NavLink
									className={({ isActive, isPending }) =>
										isActive ? 'active' : isPending ? 'pending' : ''
									}
									to={`${artwork.id}`}
								>
									{artwork.Title ? (
										<>
											<figure className="flex-column mx-auto flex min-h-full max-w-[281px] flex-wrap items-center justify-center object-contain lg:max-w-[831px]">
												<img
													style={{
														maxHeight: 'calc(100dvh - 4rem)',
														maxWidth: '100%',
													}}
													alt={artwork.alt_text ?? undefined}
													key={artwork.id}
													src={artwork.image_url ?? '../dummy.jpeg'}
												/>
												{/*
                                            //_                                               Figcaption
                                            */}
												<figcaption className="w-full pt-3 text-secondary-foreground">
													<div className="relative w-full">
														<span>{artwork.Title}</span>

														<span>{artwork.artist_title}</span>
														{/*{' '}
													<Icon
														name="arrow-right"
														size="font"
														className="ml-2 h-5 w-10 justify-self-end rounded-full border-[0.5px] border-muted-foreground pb-[0.05rem] pl-[0.15rem] pr-[0.2rem] pt-[0.09rem] backdrop-brightness-50"
													></Icon>
													<Icon
														name="arrow-right"
														size="xl"
														className="absolute bottom-0 right-0 ml-2 h-5 w-10 justify-self-end rounded-full border-[0.5px] border-muted-foreground pb-[0.07rem] pl-[0.15rem] pr-[0.2rem] pt-[0.1rem] backdrop-brightness-50"
													></Icon>
                                                    */}
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
			<div className="relative flex">
				<h2 className="absolute -bottom-20 right-4 pb-4 text-center leading-none">
					<span className="font-semibold opacity-50">
						searched{' '}
						<em className="font-normal opacity-100">
							{' '}
							{currentQueryKey}
							{': '}
						</em>{' '}
					</span>
					{query || 'All'}{' '}
					{/* same as: {location.search.split('&')[0].split('=')[1]} */}
				</h2>
			</div>
		</>
	)
}
