import { notFound } from "next/navigation"
import { MediaGrid } from "@/components/media-grid"
import { fetchMediaPage } from "@/app/actions/media-actions"
import { validateUser } from "@/components/server/validateUser"

// Define valid categories and their display names
const validCategories = {
    "now-playing": "Now Playing",
    popular: "Popular Movies",
    "top-rated": "Top Rated Movies",
    upcoming: "Upcoming Movies",
    trending: "Trending Movies",
}

// Map URL categories to API endpoints
const categoryToEndpoint = {
    "now-playing": "now_playing",
    popular: "popular",
    "top-rated": "top_rated",
    upcoming: "upcoming",
    trending: "trending/movie/day",
}

export default async function MovieCategoryPage({ params }: { params: { category: string } }) {
    const category = params.category
    const {user} = await validateUser()
    const isLoggedIn = !!user

    // Check if the category is valid
    if (!validCategories[category as keyof typeof validCategories]) {
        notFound()
    }

    const displayName = validCategories[category as keyof typeof validCategories]
    const endpoint = categoryToEndpoint[category as keyof typeof categoryToEndpoint]

    // Determine if this is a trending endpoint which has a different URL structure
    const isTrending = category === "trending"

    // Fetch initial data on the server
    let initialData
    try {
        initialData = await fetchMediaPage("movie", endpoint, 1, isTrending)
    } catch (error) {
        console.error("Error fetching initial movie data:", error)
        initialData = { results: [], page: 1, total_pages: 1, total_results: 0 }
    }

    return (
        <main className="container py-8">
            <h1 className="text-3xl font-bold mb-8">{displayName}</h1>

            <MediaGrid
                type="movie"
                endpoint={endpoint}
                isTrending={isTrending}
                isLoggedIn={isLoggedIn}
                initialData={initialData}
            />
        </main>
    )
}

