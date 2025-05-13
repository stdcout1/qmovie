"use server"

interface MediaResult {
    results: any[]
    page: number
    total_pages: number
    total_results: number
}

export async function fetchMediaPage(
    type: "movie" | "tv",
    endpoint: string,
    page: number,
    isTrending = false,
): Promise<MediaResult> {
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY

    if (!MOVIE_API_KEY) {
        throw new Error("MOVIE_API_KEY is not defined in environment variables")
    }

    try {
        // Construct the API URL based on the type and endpoint
        let url: string

        if (isTrending) {
            url = `https://api.themoviedb.org/3/${type}/${endpoint}?page=${page}`
        } else {
            url = `https://api.themoviedb.org/3/${type}/${endpoint}?page=${page}`
        }

        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${MOVIE_API_KEY}`,
            },
        }

        const response = await fetch(url, options)

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching media:", error)
        throw error
    }
}

