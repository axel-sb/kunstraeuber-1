// region imports
import { invariantResponse } from '@epic-web/invariant'
import { type Artwork } from '@prisma/client'
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
	redirect,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	NavLink,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import { type FunctionComponent } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'
import artworkId from './artworks.$artworkId.css?url'

// #endregion imports
export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworkId },
]

export const action = async ({ params, request }: ActionFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const formData = await request.formData()
	const favorite = Object.fromEntries(formData)
	console.log(' 🟠 formData: ', formData, ' 🟠🟠 favorite: ', favorite)
	await updateArtwork(parseInt(params.artworkId))
	console.log('🔵🔵 params →', params)
	return redirect(`/artworks/${params.artworkId}`)
}

//$ MARK:  Loader function to fetch artwork data ↓

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const artwork = await getArtwork({ id: Number(params.artworkId) })
	if (!artwork) {
		throw new Response("Artwork from 'getArtwork(id)' not found", {
			status: 404,
		})
	}

	// The underscore _ is a convention used by some developers to indicate that the value at that position in the array is not going to be used. This is a way to "ignore" certain returned values when destructuring an array.

	const filteredArtwork: Artwork = Object.fromEntries(
		Object.entries(artwork).filter(
			([_, value]) => value != null && value !== '',
		),
	) as Artwork

	const colorHsl = artwork ? `${artwork.colorHsl}` : 'hsl(0 0% 100%)'

	console.log('🟡 filteredArtwork →', filteredArtwork)
	return json({ artwork: filteredArtwork, colorHsl })
}

//$ MARK:    Export Default ↓

export default function Artwork() {
	const { artwork } = useLoaderData<typeof loader>()
	const colorHsl = useLoaderData<typeof loader>().colorHsl
	const artist = {
		__html:
			'<span class="font-bold opacity-60"> Artist:  </span> <br>' +
			artwork.Artist,
	}
	const description = {
		__html: artwork.Description
			? '<span class="font-bold opacity-60">Description: </span>' +
				artwork.Description
			: '',
	}
	// for back-button
	const navigate = useNavigate()

	//$ MARK: toggle details

	const handleClick = (e: { target: any }) => {
		e.target.classList.toggle('open')
	}

	//$ MARK: return  JSX ↓___
	return (
		<main className="m-auto w-screen max-w-[843px] justify-start px-4">
			<div className="toolbar sticky top-4 z-50 mx-auto flex w-full max-w-[843px] items-center justify-between">
				<NavLink
					className={({ isActive, isPending }) =>
						isActive ? 'active' : isPending ? 'pending' : ''
					}
					to={`../artworks/zoom/${artwork.id}`}
				>
					<Icon
						name="zoom-in"
						className="mr-2 h-6 w-6 saturate-200"
						size="font"
						style={{ color: colorHsl }}
					/>
				</NavLink>
				<span className="inline">
					<Favorite artwork={artwork} />
				</span>
			</div>

			<figure className="relative mt-8 flex w-full flex-col items-center justify-start">
				<img
					className="rounded-sm"
					alt={artwork.alt_text ?? undefined}
					key={artwork.id}
					src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
				/>
				{/*
                //$ MARK: Details
                */}
				<figcaption className="relative mx-auto flex w-full flex-col items-center justify-end">
					<details
						id="artwork-info"
						className="styled group max-h-min w-full overflow-y-auto sm:max-w-[843px]"
					>
						{/* //___ _____________________ Summary (title) */}

						<summary
							onClick={(e) => {
								handleClick(e)
							}}
							className="relative z-50 flex justify-evenly pb-12 pt-0"
						>
							<div className="artwork-title flex grow items-center justify-between text-balance pt-4 text-center text-lg opacity-75">
								<Button
									className="btn-back group-has-[details[open]]:bloc hover:merge pl-2"
									variant="ghost"
									size={'lg'}
									style={{ color: colorHsl }}
									onClick={() => {
										navigate(-1)
									}}
								>
									<Icon
										name="cross-1"
										size="lg"
										className="saturate-200"
										style={{ color: colorHsl }}
									/>
								</Button>
								<div className="flex translate-y-12 items-center justify-around hover:drop-shadow-xl">
									{artwork.Title}
								</div>

								<div
									className="h-8 w-8 rounded-lg border-slate-100 shadow-sm hover:shadow-orange-100"
									onClick={(e) => {
										handleClick(e)
									}}
								>
									<Icon
										name="info-i2"
										size="lg"
										className="saturate-200"
										style={{ color: colorHsl }}
									/>
								</div>
							</div>
						</summary>
						{/*
            //$ #region details //! MARK: DETAILS data
            */}
						<div className="expander" id="expander">
							<div className="expander-content min-h-0 grid-cols-1">
								<ul className="flex h-full flex-col gap-0.5 px-4 py-8">
									<li
										dangerouslySetInnerHTML={artist}
										className="hyphens-auto pb-4"
									></li>
									<li
										className="max-w-prose pt-4"
										dangerouslySetInnerHTML={description}
									></li>
									{Object.entries(artwork)
										.filter(
											([key, value]) =>
												value &&
												value !== '' &&
												key !== 'id' &&
												key !== 'Title' &&
												key !== 'image_url' &&
												key !== 'alt_text' &&
												key !== 'artist_title' &&
												key !== 'Description' &&
												key !== 'Artist' &&
												key !== 'Term' &&
												key !== 'Styles' &&
												key !== 'color_h' &&
												key !== 'color_s' &&
												key !== 'color_l' &&
												key !== 'Category' &&
												/* key !== 'Theme' && */
												/* key !== 'provenance_text' && */
												key !== 'width' &&
												key !== 'height' &&
												key !== 'image_id' &&
												key !== 'is_boosted' &&
												key !== 'is_zoomable',
										)

										.sort(([keyA], [keyB]) => {
											const order = [
												'Date',
												'Place',
												'Medium',
												'Style',
												'Subject',
												'Type',
												'Technique',
												'Theme',
												'alt_text',
												'provenance_text',
											]
											const indexA = order.indexOf(keyA)
											const indexB = order.indexOf(keyB)
											return indexA - indexB
										})
										.map(([key, value]) => (
											<li key={key}>
												<span className="font-bold opacity-60">{key}:</span>{' '}
												<span className="detail-content">{value}</span>
											</li>
										))}
								</ul>

								{/*
                  //$ #endregion DETAILS
                  */}
							</div>
						</div>
					</details>
				</figcaption>
			</figure>
		</main>
	)
}

const Favorite: FunctionComponent<{
	artwork: Pick<Artwork, 'favorite'>
}> = ({ artwork }) => {
	const fetcher = useFetcher()
	const favorite = fetcher.formData
		? fetcher.formData.get('favorite') === 'true'
		: artwork.favorite
	const colorHsl = useLoaderData<typeof loader>().colorHsl
	return (
		<fetcher.Form method="post">
			<Button
				className="btn-back"
				variant="ghost"
				size="lg"
				style={{ color: colorHsl }}
			>
				{favorite ? (
					<Icon
						name="star-filled"
						size="md"
						className="saturate-200 glow"
						style={{ color: colorHsl }}
					/>
				) : (
					<Icon
						name="star"
						size="md"
						className="saturate-200"
						style={{ color: colorHsl }}
					/>
				)}
			</Button>
		</fetcher.Form>
	)
}
