import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useNavigate, useLoaderData } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { Icon } from '#app/components/ui/icon.js'
import Viewer from '../../components/viewer.client'
import { getArtworkUrl } from '../resources+/search-data.server'
import zoomStyles from './artworks.zoom.$artworkId.css?url'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: zoomStyles }]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const data = await getArtworkUrl({ id: Number(params.artworkId) })
	console.log('🟡 data →', data)

	const src = data
		? data.image_url ??
			'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/843,/0/default.jpg'
		: 'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/843,/0/default.jpg'

	console.log('🟢 src →', src, typeof src)

	const identifier = src.split('/full/')[0]
	console.log('🔴 identifier →', identifier)
	typeof identifier === 'string'
		? identifier
		: 'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27'

	const colorHsl = data
		? data.colorHsl ??
        data.colorHsl
        : 'hsl(0 0% 100%)'


	return json({ identifier, colorHsl })
}

export default function Zoom() {
    const navigate = useNavigate()
	const { identifier } = useLoaderData() as { identifier: string }
    const { colorHsl } = useLoaderData() as { colorHsl: string }
	return (
		<>
			<button
				className="btn-back absolute bottom-4 left-4 z-10 h-10 w-10 rounded-full"
				style={{
					color: colorHsl,
					backdropFilter:
						'blur(5px)  brightness(0.5)',
                    backgroundColor: 'var(--colors-primary)',
				}}
				onClick={(e) => {
					navigate(-1)
					console.log('button-back clicked')
				}}
			>
				<Icon
					name="arrow-left"
					className="h-8 w-8 saturate-200"
					style={{ color: colorHsl }}
				/>
			</button>
			<ClientOnly fallback={<div>Loading...</div>}>
				{() => <Viewer src={identifier} isTiledImage={true} />}
			</ClientOnly>
		</>
	)
}
