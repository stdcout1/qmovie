import { notFound } from "next/navigation"
import { MediaGrid } from "@/components/media-grid"
import { fetchMediaPage } from "@/app/actions/media-actions"
import { validateUser } from "@/components/server/validateUser"

// Define valid categories and their display names
const validCategories = {
    "airing-today": "Airing Today",
    "on-the-air": "On The Air",
    popular: "Popular TV Shows",
    "top-rated": "Top Rated TV Shows",
}

// Map URL categories to API endpoints
const categoryToEndpoint = {
    "airing-today": "airing_today",
    "on-the-air": "on_the_air",
    popular: "popular",
    "top-rated": "top_rated",
}

export default async function TVCategoryPage({ params }: { params: { category: string } }) {
    const category = params.category
    const { user } = await validateUser()
    const isLoggedIn = !!user

    // Check if the category is valid
    if (!validCategories[category as keyof typeof validCategories]) {
        notFound()
    }

    const displayName = validCategories[category as keyof typeof validCategories]
    const endpoint = categoryToEndpoint[category as keyof typeof categoryToEndpoint]

    // Fetch initial data on the server
    let initialData
    try {
        initialData = await fetchMediaPage("tv", endpoint, 1)
    } catch (error) {
        console.error("Error fetching initial TV data:", error)
        initialData = { results: [], page: 1, total_pages: 1, total_results: 0 }
    }

    return (
        <main className="container py-8">
            <h1 className="text-3xl font-bold mb-8">{displayName}</h1>

            <MediaGrid type="tv" endpoint={endpoint} isLoggedIn={isLoggedIn} initialData={initialData} />
        </main>
    )
}

