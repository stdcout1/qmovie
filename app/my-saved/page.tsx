import { redirect } from "next/navigation"
import { SavedItemsGrid } from "@/components/saved-item-grid"
import { validateUser } from "@/components/server/validateUser"

export const metadata = {
    title: "My Saved Items | Streaming Platform",
    description: "View your saved movies and TV shows",
}

export default async function MySavedPage() {
    const {user} = await validateUser()

    // Redirect to login if not authenticated
    if (!user) {
        redirect("/login")
    }

    return (
        <main className="container py-8">
            <h1 className="text-3xl font-bold mb-8">My Saved Items</h1>

            <div className="space-y-12">
                <SavedItemsGrid />
            </div>
        </main>
    )
}

