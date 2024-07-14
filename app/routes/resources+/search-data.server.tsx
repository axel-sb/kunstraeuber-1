import { type Artwork } from '@prisma/client'
import { prisma } from '../../utils/db.server.ts'

//+  ___________              _____________________________  BY ID
export function getArtwork({ id }: Pick<Artwork, 'id'>) {
	return prisma.artwork.findFirst({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			// date_end: true,
			Date: true,
			Place: true,
			Medium: true,
			Technique: true,
			Description: true,
			Style: true,
			// width: true,
			// height: true,
			// is_boosted: true,
			image_url: true,
			Type: true,
			// Term: true,
			Subject: true,
			Category: true,
			// classification: true,
			Provenance: true,
			alt_text: true,
			// color_h: true,
			// color_s: true,
			// color_l: true,
			is_zoomable: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { id },

	})
}

//+  ___________              ___________________________ URL BY ID

export function getArtworkUrl({ id }: Pick<Artwork, 'id'>) {
	return prisma.artwork.findFirst({
		select: {
			image_url: true,
			colorHsl: true,
		},
		where: { id: Number(id) }, // Ensure id is converted to a number if expected by the database
	})
}

// +  _________________           ____________________   BY WEIGHT
export function getWeight(q?: string | '') {
	return prisma.artwork.findMany({
		select: {
			id: true,
			Artist: true,
			artist_title: true,
			Title: true,
			Place: true,
			Date: true,
			date_end: true,
			Description: true,
			Style: true,
			Term: true,
			Subject: true,
			classification: true,
			Category: true,
			Type: true,
			Medium: true,
			Technique: true,
			Provenance: true,
			favorite: true,
			is_boosted: true,
			image_url: true,
			alt_text: true,
			weight: true,
			colorHsl: true,
		},
		where: { weight: { gt: Number(q) } },
		skip: 0,
		take: 20,
	})
}

//+   ________________          __________________     BY FAVORITE
export function getFavorite() {
	return prisma.artwork.findMany({
		select: {
			id: true,
			Artist: true,
			artist_title: true,
			Title: true,
			Place: true,
			Date: true,
			date_end: true,
			Description: true,
			Style: true,
			Term: true,
			Subject: true,
			classification: true,
			Category: true,
			Type: true,
			Medium: true,
			Technique: true,
			Provenance: true,
			favorite: true,
			is_boosted: true,
			image_url: true,
			alt_text: true,
			weight: true,
			colorHsl: true,
		},
		where: { favorite: { equals: true } },
		skip: 0,
		take: 500,
	})
}

//+  _____________________________________________________  BY ANY
export function getAny(qAny?: string | '') {
	if (!qAny) {
		qAny = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			date_end: true,
			Date: true,
			Provenance: true,
			alt_text: true,
			width: true,
			height: true,
			Description: true,
			Place: true,
			Medium: true,
			Type: true,
			Category: true,
			Term: true,
			Style: true,
			Subject: true,
			classification: true,
			Technique: true,
			is_zoomable: true,
			has_multimedia_resources: true,
			has_educational_resources: true,
			has_advanced_imaging: true,
			image_url: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: {
			OR: [
				{ Title: { contains: qAny } },
				{ Artist: { contains: qAny } },
				{ Term: { contains: qAny } },
				{ Subject: { contains: qAny } },
				{ classification: { contains: qAny } },
				{ Category: { contains: qAny } },
				{ Style: { contains: qAny } },
				{ Technique: { contains: qAny } },
				// { Provenance: { contains: qAny } },
				{ alt_text: { contains: qAny } },
				{ Description: { contains: qAny } },
				{ Place: { contains: qAny } },
				{ Medium: { contains: qAny } },
				{ Type: { contains: qAny } },
				{ artist_title: { contains: qAny } },
				{ date_end: { equals: parseInt(qAny) } },
				// { Date: { contains: qAny } },
			],
			AND: [{ Description: { not: '' } }],
		},
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  __________________________________________________  BY ARTIST
export function getArtist(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}
	console.log('🟡🟡 q →', q)

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			// date_end: true,
			// Date: true,
			// Place: true,
			// Medium: true,
			// Technique: true,
			// Description: true,
			// is_boosted: true,
			image_url: true,
			// Term: true,
			// Subject: true,
			// Category: true,
			// classification: true,
			// Provenance: true,
			alt_text: true,
			// color_h: true,
			// color_s: true,
			// color_l: true,
			// is_zoomable: true,
			// Type: true,
			// favorite: true,
			weight: true,
			//  colorHsl: true,
		},
		where: {
			OR: [
				{ Artist: { contains: q } },
				{ artist_title: { contains: q } },
			],
		},
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+ __________________________________________________  BY SUBJECT
export function getArtworksBySubject(querySubject?: string | '') {
	if (!querySubject) {
		querySubject = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			date_end: true,
			Date: true,
			is_boosted: true,
			image_url: true,
			Medium: true,
			Term: true,
			Subject: true,
			Category: true,
			Style: true,
			classification: true,
			Technique: true,
			Provenance: true,
			alt_text: true,
			Description: true,
			Place: true,
			Type: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { Subject: { contains: querySubject } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY STYLE
export function getStyle(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			date_end: true,
			Date: true,
			is_boosted: true,
			image_url: true,
			Medium: true,
			Term: true,
			Subject: true,
			Category: true,
			Style: true,
			classification: true,
			Technique: true,
			Provenance: true,
			alt_text: true,
			Description: true,
			Place: true,
			Type: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { Style: { contains: q } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY PLACE
export function getPlace(qPlace?: string | '') {
	if (!qPlace) {
		qPlace = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			date_end: true,
			Date: true,
			is_boosted: true,
			image_url: true,
			Medium: true,
			Term: true,
			Subject: true,
			Category: true,
			Style: true,
			classification: true,
			Technique: true,
			Provenance: true,
			alt_text: true,
			Description: true,
			Place: true,
			Type: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { Place: { contains: qPlace } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  _________________________________________________  BY DATEEND

export function getDate(qDate?: number | 0) {
	if (!qDate) {
		qDate = 0
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			Title: true,
			Artist: true,
			artist_title: true,
			date_end: true,
			Date: true,
			is_boosted: true,
			image_url: true,
			Medium: true,
			Term: true,
			Subject: true,
			Category: true,
			Style: true,
			classification: true,
			Technique: true,
			Provenance: true,
			alt_text: true,
			Description: true,
			Place: true,
			Type: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { date_end: { equals: qDate } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY COLOR
export function getColor(q?: string | '') {
	let numQ = Number(q)
	if (isNaN(numQ)) {
		console.log('🟡 numQ is not a number ')
	} else {
		return prisma.artwork.findMany({
			select: {
				id: true,
				Title: true,
				Artist: true,
				artist_title: true,
				// date_end: true,
				Date: true,
				Place: true,
				Medium: true,
				Technique: true,
				Description: true,
				Style: true,
				width: true,
				height: true,
				// is_boosted: true,
				image_url: true,
				Type: true,
				//Term: true,
				Subject: true,
				// Category: true,
				// classification: true,
				Provenance: true,
				alt_text: true,
				color_h: true,
				color_s: true,
				color_l: true,
				colorHsl: true,
				// is_zoomable: true,
				favorite: true,
				weight: true,
			},
			where: {
				color_h: {
					gt: numQ - 2,
					lt: numQ + 2,
				},
				color_s: { gt: Number(15) },
				color_l: { gt: Number(15), lt: Number(85) },
			},
			orderBy: { weight: 'desc' },
			skip: 0,
			take: 20,
		})
	}
}

//+                                                UPDATE FAVORITE
export async function updateArtwork(id: Artwork['id']) {
	const artwork = await prisma.artwork.findUnique({
		where: { id },
		select: {
			favorite: true,
		},
	})

	if (!artwork) {
		throw new Error('Artwork not found')
	}

	const updatedFavorite = !artwork.favorite

	const update = prisma.artwork.update({
		where: { id },
		data: { favorite: updatedFavorite },
	})

	return update
}

//+  ____________________________________________________   CREATE
/* export function createArtwork({
	id,
	Title,
	Artist,
	artist_title,
	date_end,
	Date,
	Provenance,
	alt_text,
	Description,
	Place,
	Medium,
	Type,
	Category,
	Term,
	Style,
	classification,
	Technique,
	is_boosted,
	Subject,
	image_url,
	favorite,
	weight,
	color_h,
	color_s,
	color_l,
	colorHsl,
}: Pick<
	Artwork,
	| 'id'
	| 'Title'
	| 'Artist'
	| 'artist_title'
	| 'date_end'
	| 'Date'
	| 'Provenance'
	| 'alt_text'
	| 'Description'
	| 'Place'
	| 'Medium'
	| 'Type'
	| 'Category'
	| 'Term'
	| 'Style'
	| 'classification'
	| 'Technique'
	| 'is_boosted'
	| 'Subject'
	| 'image_url'
	| 'favorite'
	| 'weight'
	| 'color_h'
	| 'color_s'
	| 'color_l'
	| 'colorHsl'
>) {
	return prisma.artwork.create({
		data: {
			id,
			Title,
			Artist,
			artist_title,
			date_end,
			Date,
			Provenance,
			alt_text,
			Description,
			Place,
			Medium,
			Type,
			Category,
			Term,
			Style,
			classification,
			Technique,
			is_boosted,
			Subject,
			image_url,
			favorite,
			weight,
			color_h,
			color_s,
			color_l,
			colorHsl,
		},
	})
} */
