"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Trash2, Film, Tv } from "lucide-react"
import { useSavedItems } from "@/app/saved-item-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { saveMovie, saveTVShow } from "@/app/actions/save-actions"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function SavedItemsGrid() {
    const { savedMovies, savedTVShows, isLoading, removeSavedMovie, removeSavedTVShow, refreshSavedItems } =
        useSavedItems()
    const [activeTab, setActiveTab] = useState("movies")
    const [removingItems, setRemovingItems] = useState<Set<number>>(new Set())
    const { toast } = useToast()
    const imageUrl = "https://image.tmdb.org/t/p/w500"

    const handleRemoveMovie = async (movieId: number, title: string) => {
        setRemovingItems((prev) => new Set(prev).add(movieId))

        try {
            const result = await saveMovie({
                id: movieId,
                title,
                poster_path: savedMovies.find((m) => m.movieId === movieId)?.posterPath || "",
                vote_average: savedMovies.find((m) => m.movieId === movieId)?.voteAverage || 0,
            })

            if (result.success) {
                removeSavedMovie(movieId)
                toast({
                    title: "Removed from saved list",
                    description: `${title} has been removed from your saved list`,
                    duration: 3000,
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                    duration: 3000,
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove item from your saved list",
                variant: "destructive",
                duration: 3000,
            })
        } finally {
            setRemovingItems((prev) => {
                const newSet = new Set(prev)
                newSet.delete(movieId)
                return newSet
            })
            refreshSavedItems()
        }
    }

    const handleRemoveTVShow = async (tvShowId: number, name: string) => {
        setRemovingItems((prev) => new Set(prev).add(tvShowId))

        try {
            const result = await saveTVShow({
                id: tvShowId,
                name,
                poster_path: savedTVShows.find((t) => t.tvShowId === tvShowId)?.posterPath || "",
                vote_average: savedTVShows.find((t) => t.tvShowId === tvShowId)?.voteAverage || 0,
            })

            if (result.success) {
                removeSavedTVShow(tvShowId)
                toast({
                    title: "Removed from saved list",
                    description: `${name} has been removed from your saved list`,
                    duration: 3000,
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                    duration: 3000,
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove item from your saved list",
                variant: "destructive",
                duration: 3000,
            })
        } finally {
            setRemovingItems((prev) => {
                const newSet = new Set(prev)
                newSet.delete(tvShowId)
                return newSet
            })
            refreshSavedItems()
        }
    }

    if (isLoading) {
        return <SavedItemsGridSkeleton />
    }

    const hasNoSavedItems = savedMovies.length === 0 && savedTVShows.length === 0

    return (
        <Tabs defaultValue="movies" className="w-full" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
                <TabsList>
                    <TabsTrigger value="movies" className="flex items-center gap-2">
                        <Film className="h-4 w-4" />
                        Movies
                        {savedMovies.length > 0 && (
                            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {savedMovies.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="tvshows" className="flex items-center gap-2">
                        <Tv className="h-4 w-4" />
                        TV Shows
                        {savedTVShows.length > 0 && (
                            <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                {savedTVShows.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>
            </div>

            {hasNoSavedItems && (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No saved items yet</h3>
                    <p className="text-muted-foreground mb-6">Items you save will appear here for easy access.</p>
                    <Button asChild>
                        <Link href="/">Browse Content</Link>
                    </Button>
                </div>
            )}

            <TabsContent value="movies" className="mt-0">
                {savedMovies.length === 0 && !hasNoSavedItems ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">No saved movies</h3>
                        <p className="text-muted-foreground mb-6">You haven't saved any movies yet.</p>
                        <Button asChild>
                            <Link href="/">Browse Movies</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {savedMovies.map((movie) => (
                            <Card key={movie.movieId} className="overflow-hidden group transition-all duration-200 hover:shadow-lg">
                                <Link href={`/movie/${movie.movieId}`} className="block">
                                    <CardContent className="relative p-0">
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <Image
                                                src={movie.posterPath ? `${imageUrl}${movie.posterPath}` : "/placeholder.svg"}
                                                alt={`${movie.title} poster`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                            />
                                        </div>
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-white text-sm font-medium">{movie.voteAverage.toFixed(1)}</span>
                                        </div>
                                    </CardContent>
                                </Link>
                                <CardFooter className="p-2 flex justify-between items-center bg-card">
                                    <h3 className="font-medium text-sm truncate mr-2">{movie.title}</h3>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 w-8 p-0 rounded-full"
                                        onClick={() => handleRemoveMovie(movie.movieId, movie.title)}
                                        disabled={removingItems.has(movie.movieId)}
                                        title="Remove from saved list"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove from saved list</span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="tvshows" className="mt-0">
                {savedTVShows.length === 0 && !hasNoSavedItems ? (
                    <div className="text-center py-12">
                        <h3 className="text-xl font-medium mb-2">No saved TV shows</h3>
                        <p className="text-muted-foreground mb-6">You haven't saved any TV shows yet.</p>
                        <Button asChild>
                            <Link href="/">Browse TV Shows</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {savedTVShows.map((tvShow) => (
                            <Card key={tvShow.tvShowId} className="overflow-hidden group transition-all duration-200 hover:shadow-lg">
                                <Link href={`/tv/${tvShow.tvShowId}`} className="block">
                                    <CardContent className="relative p-0">
                                        <div className="relative aspect-[2/3] overflow-hidden">
                                            <Image
                                                src={tvShow.posterPath ? `${imageUrl}${tvShow.posterPath}` : "/placeholder.svg"}
                                                alt={`${tvShow.name} poster`}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                            />
                                        </div>
                                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="text-white text-sm font-medium">{tvShow.voteAverage.toFixed(1)}</span>
                                        </div>
                                    </CardContent>
                                </Link>
                                <CardFooter className="p-2 flex justify-between items-center bg-card">
                                    <h3 className="font-medium text-sm truncate mr-2">{tvShow.name}</h3>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-8 w-8 p-0 rounded-full"
                                        onClick={() => handleRemoveTVShow(tvShow.tvShowId, tvShow.name)}
                                        disabled={removingItems.has(tvShow.tvShowId)}
                                        title="Remove from saved list"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove from saved list</span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
}

function SavedItemsGridSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-[2/3] w-full rounded-md" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

