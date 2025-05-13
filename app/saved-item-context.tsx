"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SavedMovie = {
    movieId: number
    title: string
    posterPath: string | null
    voteAverage: number
}

type SavedTVShow = {
    tvShowId: number
    name: string
    posterPath: string | null
    voteAverage: number
}

interface SavedItemsContextType {
    savedMovies: SavedMovie[]
    savedTVShows: SavedTVShow[]
    isLoading: boolean
    isMovieSaved: (movieId: number) => boolean
    isTVShowSaved: (tvShowId: number) => boolean
    addSavedMovie: (movie: SavedMovie) => void
    removeSavedMovie: (movieId: number) => void
    addSavedTVShow: (tvShow: SavedTVShow) => void
    removeSavedTVShow: (tvShowId: number) => void
    refreshSavedItems: () => Promise<void>
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined)

export function SavedItemsProvider({ children }: { children: ReactNode }) {
    const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([])
    const [savedTVShows, setSavedTVShows] = useState<SavedTVShow[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchSavedItems = async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/saved-items")

            if (!response.ok) {
                // If not logged in or other error, just set empty arrays
                setSavedMovies([])
                setSavedTVShows([])
                return
            }

            const data = await response.json()
            setSavedMovies(data.savedMovies || [])
            setSavedTVShows(data.savedTVShows || [])
        } catch (error) {
            console.error("Error fetching saved items:", error)
            // Set empty arrays on error
            setSavedMovies([])
            setSavedTVShows([])
        } finally {
            setIsLoading(false)
        }
    }

    // Initial fetch on mount
    useEffect(() => {
        fetchSavedItems()
    }, [])

    const isMovieSaved = (movieId: number) => {
        return savedMovies.some((movie) => movie.movieId === movieId)
    }

    const isTVShowSaved = (tvShowId: number) => {
        return savedTVShows.some((tvShow) => tvShow.tvShowId === tvShowId)
    }

    const addSavedMovie = (movie: SavedMovie) => {
        setSavedMovies((prev) => [...prev, movie])
    }

    const removeSavedMovie = (movieId: number) => {
        setSavedMovies((prev) => prev.filter((movie) => movie.movieId !== movieId))
    }

    const addSavedTVShow = (tvShow: SavedTVShow) => {
        setSavedTVShows((prev) => [...prev, tvShow])
    }

    const removeSavedTVShow = (tvShowId: number) => {
        setSavedTVShows((prev) => prev.filter((tvShow) => tvShow.tvShowId !== tvShowId))
    }

    const refreshSavedItems = async () => {
        await fetchSavedItems()
    }

    return (
        <SavedItemsContext.Provider
            value={{
                savedMovies,
                savedTVShows,
                isLoading,
                isMovieSaved,
                isTVShowSaved,
                addSavedMovie,
                removeSavedMovie,
                addSavedTVShow,
                removeSavedTVShow,
                refreshSavedItems,
            }}
        >
            {children}
        </SavedItemsContext.Provider>
    )
}

export function useSavedItems() {
    const context = useContext(SavedItemsContext)
    if (context === undefined) {
        throw new Error("useSavedItems must be used within a SavedItemsProvider")
    }
    return context
}

