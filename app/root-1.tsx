// #region imports
import {
	json,
	type LoaderFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useLocation,
	useMatches,
	useSearchParams,
	useSubmit,
} from '@remix-run/react'
// import { withSentry } from '@sentry/remix'
import { useId, useRef, useState } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import globalStyles from './app.css?url'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { EpicProgress } from './components/progress-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Button } from './components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	// DropdownMenuGroup,
	DropdownMenuItem,
	// DropdownMenuLabel,
	DropdownMenuPortal,
	// DropdownMenuRadioGroup,
	// DropdownMenuRadioItem,
	// DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { Input } from './components/ui/input.tsx'
import { Label } from './components/ui/label.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import { StatusButton } from './components/ui/status-button.tsx'

import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
} from './routes/resources+/search-data.server.tsx'
import { ThemeSwitch, useTheme } from './routes/resources+/theme-switch.tsx'
// import { Test } from './routes/test.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import {
	combineHeaders,
	getDomainUrl,
	getUserImgSrc,
	useIsPending,
} from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { type Theme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser, useUser } from './utils/user.ts'
// #endregion imports

//§ _________________________________________________ MARK: Links

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
		{ rel: 'stylesheet', href: globalStyles },
	].filter(Boolean)
}

//§ _________________________________________________ MARK: Meta

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? '* Kunsträuber' : 'Error | Kunsträuber' },
		{
			name: 'description',
			content: `Good Artists Borrow, Great Artists Steal`,
		},
	]
}

//§ _________________________________________________ MARK: Loader
export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: {
											entity: true,
											action: true,
											access: true,
										},
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? undefined
	const searchType = url.searchParams.get('searchType') ?? ''

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
			break
		/* data = await getArtist('Picasso') */
	}

	return json(
		{
			user,
			data,
			searchType,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

//§ _________________________________________________ MARK: headers

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

//§ _________________________________________________ MARK: Document

function Document({
	children,
	nonce,
	theme = 'dark',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme}`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
			</head>
			<body className="w-full bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

//§ _________________________________________________ MARK: App

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	const theme = useTheme()
	const matches = useMatches()
	console.log('🟡 matches →', matches)
	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/artworks/',
	})
	const handleFormChange = (form: HTMLFormElement) => {
		submit(form)
	}
	// const isPending = useIsPending()
	const [searchParams, setsearchParams] = useSearchParams()
	const [searchType, setSearchType] = useState<
		| 'all'
		| 'artist'
		| 'style'
		| 'place'
		| 'date'
		| 'color'
		| 'subject'
		| 'term'
		| ''
	>('')
	// const formRef = useRef<HTMLFormElement>(null)
	const id = useId()

	const operationStatus = ['idle', 'pending', 'success', 'error']
	// const isOnSearchPage = matches.find((m) => m.id === 'routes/users+/index')
	const location = useLocation()
	console.log('🔵 location →', location)

	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)

	//§ _____________________________________________________ MARK: App return

	return (
		<Document
			nonce={nonce}
			theme={theme}
			allowIndexing={allowIndexing}
			env={data.ENV}
		>
			{location.pathname === '/' ? (
				<header className="container py-6">
					<nav className="flex flex-wrap items-center justify-between gap-4 md:max-w-2xl md:gap-8 lg:max-w-4xl xl:max-w-5xl">
						<Logo />
						<div className="flex items-center gap-10">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
						<div className="w-full shrink-0 grow"></div>
						{/*
                        //§ _________________________________________________ MARK: Search Bar
                        */}

						<div className="search-bar block w-full rounded-md ring-0 ring-yellow-100/50 ring-offset-[.5px] ring-offset-yellow-50/50 lg:max-w-4xl xl:max-w-5xl">
							<Form
								method="GET"
								action="/artworks/"
								className="no-wrap flex items-center justify-center gap-2"
								onChange={(e) => {
									// const autoSubmit =	false &&
									handleFormChange(e.currentTarget)
								}}
							>
								{/*
                                //$  _________________________________ MARK: SearchInput
								 */}
								<div className="flex-1 rounded-md">
									<Label htmlFor={id} className="sr-only">
										Search
									</Label>
									<Input
										type="search"
										name="search"
										id={id}
										list="suggestions-list"
										defaultValue={searchParams.get('search') ?? ''}
										placeholder={`Search ${searchType}`}
										className="w-full border-0"
										onChange={(e) => setsearchParams(e.target.value)}
									/>
								</div>

								<datalist id="suggestions-list">
									<option value="Chocolate"></option>
									<option value="Coconut"></option>
									<option value="Mint"></option>
									<option value="Strawberry"></option>
									<option value="Vanilla"></option>
								</datalist>
								{/*{' '}
                                //$ ________________________________ MARK: Split Button
								 */}
								<div className="splitbutton flex max-w-sm flex-[.5] rounded-md">
									{/*{' '}<Test />{' '}
									 */}

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
										className="flex h-10 w-full rounded-md border-input bg-background px-1 py-1 font-light ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid]:border-input-invalid"
									>
										<option value="all">All</option>
										<option value="artist">Artist</option>
										<option value="style">Style</option>
										<option value="place">Place</option>
										<option value="date">Date</option>
										<option value="color">Color</option>
									</select>
									{/*
                                //$  ________________________________ MARK: Status Button
								 */}

									<StatusButton
										type="submit"
										status={
											isSubmitting
												? 'pending'
												: (operationStatus as unknown as
														| 'error'
														| 'success'
														| 'idle'
														| 'pending')
										}
										className="flex flex-1 items-center justify-center border-0 pl-4 pr-2 shadow-none"
									>
										<Icon name="magnifying-glass" size="lg" />
										<span className="sr-only">Search</span>
									</StatusButton>
								</div>
							</Form>
						</div>
					</nav>
				</header>
			) : null}

			<Outlet />

			{/*
            //§ _______________________________________________ MARK: Footer
			 */}

			<div className="footer container flex items-center justify-between py-3">
				<Logo />
				<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				<Help />
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</Document>
	)
}

//§ _____________________________________________________ MARK: Logo

function Logo() {
	return (
		<Link to="/" className="group grid leading-snug">
			<span className="font-light leading-none text-cyan-200 transition group-hover:-translate-x-1">
				kunst
			</span>
			<span className="font-bold leading-none text-yellow-100 transition group-hover:translate-x-1">
				räuber
			</span>
		</Link>
	)
}

//§ _____________________________________________________ MARK: Help

function Help() {
	return (
		<Button variant="ghost" size="ghost">
			<Icon name="question-mark-circled" className="border-0" size="md"></Icon>
		</Button>
	)
}

// funcion as 'export default' (exluding Sentry)
export default function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

// exclude Sentry
// export default withSentry(AppWithProviders)

//§ ___________________________________________________ MARK: UserDropdown

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={(e) => e.preventDefault()}
						className="flex items-center gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm">{user.name ?? user.username}</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
							<Icon className="text-body-md" name="pencil-2">
								Notes
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={(event) => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}

//§ ___________________________________________________ MARK: ErrorBoundary

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
