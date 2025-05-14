"use server"

import { z } from "zod"

// Common schema for both movies and TV shows
const ContentBaseSchema = z.object({
    id: z.number(),
    poster_path: z.string().nullable(),
    overview: z.string().nullable(),
    vote_average: z.number(),
    genre_ids: z.array(z.number()).optional(),
})

// Movie-specific schema
const MovieSchema = ContentBaseSchema.extend({
    title: z.string(),
    release_date: z.string().nullable(),
    media_type: z.literal("movie").optional(),
})

// TV-specific schema
const TVShowSchema = ContentBaseSchema.extend({
    name: z.string(),
    first_air_date: z.string().nullable(),
    media_type: z.literal("tv").optional(),
})

// Combined content schema with discriminated union
const ContentSchema = z.discriminatedUnion("media_type", [
    MovieSchema.extend({ media_type: z.literal("movie") }),
    TVShowSchema.extend({ media_type: z.literal("tv") }),
])

// For API responses that don't include media_type
const ContentResponseSchema = z.object({
    results: z.array(z.union([MovieSchema, TVShowSchema])),
    total_results: z.number(),
    total_pages: z.number(),
})

export type Movie = z.infer<typeof MovieSchema>
export type TVShow = z.infer<typeof TVShowSchema>
export type Content = Movie | TVShow

export type ContentType = "movie" | "tv"


const MOVIE_API_KEY = process.env.MOVIE_API_KEY
const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${MOVIE_API_KEY}`,
    },
}

// Function to discover content (movies or TV shows) with various filters
export async function discoverContent({
    contentType = "movie",
    query = "",
    year = "",
    sortBy = "popularity.desc",
    genres = "",
    voteAverage = 0,
    page = 1,
}: {
    contentType: ContentType
    query?: string
    year?: string
    sortBy?: string
    genres?: string
    voteAverage?: number
    page?: number
}): Promise<{ content: Content[]; totalPages: number; totalResults: number }> {
    try {
        // For text search, we need to use the search endpoint
        if (query && query.length >= 2) {
            const searchUrl = new URL(`https://api.themoviedb.org/3/search/${contentType}`)
            searchUrl.searchParams.append("query", query)
            searchUrl.searchParams.append("language", "en-US")
            searchUrl.searchParams.append("include_adult", "false")
            searchUrl.searchParams.append("page", page.toString())

            if (year) {
                if (contentType === "movie") {
                    searchUrl.searchParams.append("year", year)
                } else {
                    searchUrl.searchParams.append("first_air_date_year", year)
                }
            }

            const response = await fetch(searchUrl.toString(), options)

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`)
            }

            const data = await response.json()
            const results = data.results.map((item: any) => ({
                ...item,
                media_type: contentType,
            }))

            return {
                content: results,
                totalPages: data.total_pages,
                totalResults: data.total_results,
            }
        }

        // Otherwise use the discover endpoint with filters
        const url = new URL(`https://api.themoviedb.org/3/discover/${contentType}`)
        url.searchParams.append("language", "en-US")
        url.searchParams.append("include_adult", "false")
        url.searchParams.append("page", page.toString())
        url.searchParams.append("sort_by", sortBy)

        if (year) {
            if (contentType === "movie") {
                url.searchParams.append("primary_release_year", year)
            } else {
                url.searchParams.append("first_air_date_year", year)
            }
        }

        if (genres) {
            url.searchParams.append("with_genres", genres)
        }

        if (voteAverage > 0) {
            url.searchParams.append("vote_average.gte", voteAverage.toString())
        }

        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        const results = data.results.map((item: any) => ({
            ...item,
            media_type: contentType,
        }))

        return {
            content: results,
            totalPages: data.total_pages,
            totalResults: data.total_results,
        }
    } catch (error) {
        console.error(`Error discovering ${contentType}:`, error)
        return { content: [], totalPages: 0, totalResults: 0 }
    }
}

// Get content details (movie or TV show)
export async function getContentDetails(id: string, contentType: ContentType): Promise<any> {
    try {
        const url = new URL(`https://api.themoviedb.org/3/${contentType}/${id}`)
        url.searchParams.append("language", "en-US")

        if (contentType === "tv") {
            url.searchParams.append("append_to_response", "season/1")
        }

        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return { ...data, media_type: contentType }
    } catch (error) {
        console.error(`Error fetching ${contentType} details:`, error)
        return null
    }
}

// Get genre list for filtering
export async function getGenres(contentType: ContentType) {
    try {
        const url = new URL(`https://api.themoviedb.org/3/genre/${contentType}/list`)
        url.searchParams.append("language", "en-US")

        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        return data.genres || []
    } catch (error) {
        console.error(`Error fetching ${contentType} genres:`, error)
        return []
    }
}

// Get TV show season details
export async function getTVSeasonDetails(tvId: string, seasonNumber: number): Promise<any> {
    try {
        const url = new URL(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}`)
        url.searchParams.append("language", "en-US")

        const response = await fetch(url.toString(), options)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching TV season details:", error)
        return null
    }
}

