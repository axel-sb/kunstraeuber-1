// #region import-export
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import { NavLink, useLoaderData } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.js'
import { getFavorite } from '../resources+/search-data.server'
import favorites from './artworks.favorites.css?url'

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: favorites },
]

export const loader = async ({}: LoaderFunctionArgs) => {
	const data = await getFavorite()
	return json({ data })
}

// #endregion import export
/*  ;(async () => {
	let data = await getFavorite()
	// Rest of the code that uses the 'data' variable
})() */

export default function Favorites() {
	const { data } = useLoaderData<typeof loader>()
	console.log('🟡 data →', data)
	return (
		<main className="flex items-center justify-center">
			<ul className="artworks-preview mb-12 flex w-full flex-col items-center justify-start gap-16 overflow-y-hidden">
				{data ? (
					data.map((artwork) => (
						<li key={artwork.id} className="md:max-w-sm">
							<NavLink
								className={({ isActive, isPending }) =>
									isActive
										? 'active'
										: isPending
											? 'pending'
											: ''
								}
								to={`/artworks/${artwork.id}`}
							>
								{artwork.Title ? (
									<>
										<figure className="p-4 hover:grid hover:items-start">
											<img
												alt={
													artwork.alt_text ??
													undefined
												}
												key={artwork.id}
												src={
													artwork.image_url ??
													'../dummy.jpeg'
												}
											/>
											{/*
                      // #region FIGCAPTION
											 */}
											<figcaption>
												<div>{artwork.Title}</div>
												<div className="flex max-w-full justify-between">
													<span>
														{artwork.artist_title}
													</span>
													<Icon
														name="arrow-right"
														className="flex-1 justify-self-end"
													></Icon>
												</div>
											</figcaption>
											{/* // #endregion figcaption */}
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
			<NavLink to="/" className="home fixed bottom-4 right-4">
				<h1
					data-heading
					className="flex flex-wrap items-center justify-end gap-2"
				>
					<div className="flex max-w-min flex-wrap">
						<span className="ml-auto max-w-min text-[16px] font-thin leading-none text-cyan-200 md:text-[18px] lg:text-[22px] xl:text-[24px]">
							Kunst
						</span>
						<span className="max-w-min text-[13px] font-thin leading-none text-yellow-100 file:ml-auto md:text-[15px] lg:text-[18px] xl:text-[20px]">
							räuber
						</span>
					</div>
				</h1>
			</NavLink>
		</main>
	)
}
