"use client"

import { useState, useRef, useCallback } from "react"
import { TVCard } from "./TvCard"
import { MovieCard } from "@/app/MovieCard"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMediaPage } from "@/app/actions/media-actions"

interface MediaGridProps {
    type: "movie" | "tv"
    endpoint: string
    isTrending?: boolean
    isLoggedIn: boolean
    initialData: {
        results: any[]
        page: number
        total_pages: number
    }
}

interface Movie {
    id: number
    title: string
    poster_path: string
    vote_average: number
}

interface TVShow {
    id: number
    name: string
    poster_path: string
    vote_average: number
}

export function MediaGrid({ type, endpoint, isTrending = false, isLoggedIn, initialData }: MediaGridProps) {
    const [items, setItems] = useState<Movie[] | TVShow[]>(initialData.results)
    const [page, setPage] = useState(initialData.page)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(page < initialData.total_pages)
    const observer = useRef<IntersectionObserver | null>(null)

    // Function to fetch more data
    const loadMoreItems = useCallback(async () => {
        if (loading || !hasMore) return

        try {
            setLoading(true)
            const nextPage = page + 1
            const data = await fetchMediaPage(type, endpoint, nextPage, isTrending)

            if (data.results.length === 0) {
                setHasMore(false)
            } else {
                setItems((prevItems) => [...prevItems, ...data.results])
                setPage(nextPage)
                setHasMore(nextPage < data.total_pages)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }, [type, endpoint, isTrending, page, loading, hasMore])

    // Setup intersection observer for infinite scrolling
    const lastItemRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading) return

            if (observer.current) {
                observer.current.disconnect()
            }

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMoreItems()
                }
            })

            if (node) {
                observer.current.observe(node)
            }
        },
        [loading, hasMore, loadMoreItems],
    )

    // Handle errors
    if (error) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-medium text-red-500 mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map((item, index) => {
                    const isLastItem = index === items.length - 1

                    if (type === "movie") {
                        const movie = item as Movie
                        return (
                            <div key={`${movie.id}-${index}`} ref={isLastItem ? lastItemRef : null}>
                                <MovieCard
                                    id={movie.id}
                                    title={movie.title}
                                    poster_path={movie.poster_path}
                                    vote_average={movie.vote_average}
                                    isLoggedIn={isLoggedIn}
                                />
                            </div>
                        )
                    } else {
                        const tvShow = item as TVShow
                        return (
                            <div key={`${tvShow.id}-${index}`} ref={isLastItem ? lastItemRef : null}>
                                <TVCard
                                    id={tvShow.id}
                                    name={tvShow.name}
                                    poster_path={tvShow.poster_path}
                                    vote_average={tvShow.vote_average}
                                    isLoggedIn={isLoggedIn}
                                />
                            </div>
                        )
                    }
                })}
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-md" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ))}
                </div>
            )}

            {/* End of results message */}
            {!hasMore && items.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">You've reached the end of the list</div>
            )}
        </div>
    )
}

