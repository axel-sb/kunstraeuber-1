
import {
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import styleSheetUrl from './index.css?url'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styleSheetUrl }]
}
export const meta: MetaFunction = () => [{ title: '*Kunsträuber' }]

export default function Index() {

	return (
		<div className="flex h-full flex-col px-4 md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">

			<figure className=" default-picture flex h-full flex-col items-center  justify-around pb-4">
				<img
					className="animate-hue-backdrop w-[calc(70vh/1.26)] object-center"
					alt="Andy Warhol, Four Mona Lisas. A work made of acrylic and silkscreen ink on linen."
					src="four-mona-lisas-sm.jpg"
					srcSet="four-mona-lisas-sm.jpg 430w, four-mona-lisas.jpg 600w"
				/>
				<figcaption className="text-lg">
					Four Mona Lisas, 1978
				</figcaption>
			</figure>
		</div>
	)
}
