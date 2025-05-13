"use server"

import { revalidatePath } from "next/cache"
import { validateUser } from "@/components/server/validateUser"
import { client } from "@/auth"

export async function saveMovie(movieData: {
    id: number
    title: string
    poster_path: string
    vote_average: number
}) {
    let { user } = await validateUser()

    if (!user) {
        return { success: false, message: "You must be logged in to save movies" }
    }

    try {
        // Check if movie is already saved
        const existingSave = await client.savedMovie.findUnique({
            where: {
                userId_movieId: {
                    userId: user.id,
                    movieId: movieData.id,
                },
            },
        })

        if (existingSave) {
            // Remove the saved movie
            await client.savedMovie.delete({
                where: {
                    userId_movieId: {
                        userId: user.id,
                        movieId: movieData.id,
                    },
                },
            })

            revalidatePath("/")
            return { success: true, saved: false, message: "Movie removed from saved list" }
        } else {
            // Save the movie
            await client.savedMovie.create({
                data: {
                    userId: user.id,
                    movieId: movieData.id,
                    title: movieData.title,
                    posterPath: movieData.poster_path,
                    voteAverage: movieData.vote_average,
                },
            })

            revalidatePath("/")
            return { success: true, saved: true, message: "Movie saved successfully" }
        }
    } catch (error) {
        console.error("Error saving movie:", error)
        return { success: false, message: "Failed to save movie" }
    }
}

export async function saveTVShow(tvData: {
    id: number
    name: string
    poster_path: string
    vote_average: number
}) {

    let { user } = await validateUser()

    if (!user) {
        return { success: false, message: "You must be logged in to save TV shows" }
    }

    try {
        // Check if TV show is already saved
        const existingSave = await client.savedTVShow.findUnique({
            where: {
                userId_tvShowId: {
                    userId: user.id,
                    tvShowId: tvData.id,
                },
            },
        })

        if (existingSave) {
            // Remove the saved TV show
            await client.savedTVShow.delete({
                where: {
                    userId_tvShowId: {
                        userId: user.id,
                        tvShowId: tvData.id,
                    },
                },
            })

            revalidatePath("/")
            return { success: true, saved: false, message: "TV show removed from saved list" }
        } else {
            // Save the TV show
            await client.savedTVShow.create({
                data: {
                    userId: user.id,
                    tvShowId: tvData.id,
                    name: tvData.name,
                    posterPath: tvData.poster_path,
                    voteAverage: tvData.vote_average,
                },
            })

            revalidatePath("/")
            return { success: true, saved: true, message: "TV show saved successfully" }
        }
    } catch (error) {
        console.error("Error saving TV show:", error)
        return { success: false, message: "Failed to save TV show" }
    }
}
