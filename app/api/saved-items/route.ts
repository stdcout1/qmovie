import { NextResponse } from "next/server"

import { client } from "@/auth";
import { validateUser } from "@/components/server/validateUser";

export async function GET() {
    const { user } = await validateUser();

    if (!user) {
        return NextResponse.json({ savedMovies: [], savedTVShows: [] })
    }

    try {
        // Fetch all saved movies for the user
        const savedMovies = await client.savedMovie.findMany({
            where: { userId: user.id },
            select: {
                movieId: true,
                title: true,
                posterPath: true,
                voteAverage: true,
            },
        })

        // Fetch all saved TV shows for the user
        const savedTVShows = await client.savedTVShow.findMany({
            where: { userId: user.id },
            select: {
                tvShowId: true,
                name: true,
                posterPath: true,
                voteAverage: true,
            },
        })

        return NextResponse.json({ savedMovies, savedTVShows })
    } catch (error) {
        console.error("Error fetching saved items:", error)
        return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 })
    }
}

