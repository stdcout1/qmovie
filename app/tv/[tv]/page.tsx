import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from 'lucide-react'
import Image from "next/image"
import { validateUser } from "@/components/server/validateUser"
import { redirect } from "next/navigation"
import { TVCarousel } from "@/components/TVCarousel"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { SeasonDrawer } from "./SeasonDrawer"
import { TVFavoriteButton } from "./TVFavoriteButton"

async function TVShowPage({ params }: { params: { tv: string } }) {
    const { user } = await validateUser()
    if (!user) {
        return redirect("/signin")
    }

    const backdropUrl = "https://image.tmdb.org/t/p/original"
    const posterUrl = "https://image.tmdb.org/t/p/w500"
    const showUrl = `https://api.themoviedb.org/3/tv/${params.tv}`
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${MOVIE_API_KEY}`,
        },
    }

    // Fetch TV show details
    const tvShowData = await fetch(showUrl, options).then((res) => res.json())
    const {
        backdrop_path,
        name,
        first_air_date,
        poster_path,
        tagline,
        episode_run_time,
        genres,
        overview,
        external_ids,
        number_of_seasons,
        seasons,
        vote_average,
        id,
    } = tvShowData

    // Fetch recommended shows
    const recommendedShows = await fetch(
        `https://api.themoviedb.org/3/tv/${params.tv}/recommendations?language=en-US&page=1`,
        options,
    ).then((res) => res.json())

    const releaseYear = first_air_date ? first_air_date.slice(0, 4) : ""
    const runtime = episode_run_time && episode_run_time.length > 0 ? `${episode_run_time[0]} min` : "N/A"

    return (
        <div className="relative min-h-screen">
            {/* Backdrop with overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {backdrop_path ? (
                    <Image
                        src={`${backdropUrl}${backdrop_path}`}
                        alt={`${name} backdrop`}
                        fill
                        priority
                        className="object-cover object-center"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-background/90 to-background" />
            </div>

            {/* Main content */}
            <div className="relative z-10 pt-16 pb-24 container mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Poster (hidden on small screens, shown on side on larger screens) */}
                    <div className="hidden lg:block flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                        {poster_path ? (
                            <Image
                                src={`${posterUrl}${poster_path}`}
                                alt={`${name} poster`}
                                width={300}
                                height={450}
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="w-[300px] h-[450px] bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-400">No poster available</span>
                            </div>
                        )}
                    </div>

                    {/* TV Show details */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white">
                                    {name} {releaseYear && <span className="opacity-75">({releaseYear})</span>}
                                </h1>
                                {tagline && <p className="text-lg mt-2 text-gray-300 italic">{tagline}</p>}
                            </div>

                            <TVFavoriteButton tvShowId={id} name={name} posterPath={poster_path} voteAverage={vote_average} />
                        </div>

                        {/* Mobile poster (shown only on small screens) */}
                        <div className="block lg:hidden mx-auto max-w-xs rounded-lg overflow-hidden shadow-xl border border-gray-800">
                            {poster_path ? (
                                <Image
                                    src={`${posterUrl}${poster_path}`}
                                    alt={`${name} poster`}
                                    width={300}
                                    height={450}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-400">No poster available</span>
                                </div>
                            )}
                        </div>

                        {/* Season Drawer component */}
                        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
                            <SeasonDrawer showId={params.tv} showTitle={name} seasons={seasons} user={user} />
                        </Suspense>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="secondary" className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" /> Chat
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {genres && genres.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-300">Genres</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {genres.map(({ id, name }: { id: number; name: string }) => (
                                            <Badge key={id} variant="secondary">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-gray-300">Episodes Runtime</h3>
                                <p>{runtime}</p>
                            </div>

                            {number_of_seasons && (
                                <div>
                                    <h3 className="font-semibold text-gray-300">Seasons</h3>
                                    <p>{number_of_seasons} {number_of_seasons === 1 ? "season" : "seasons"}</p>
                                </div>
                            )}

                            {overview && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-300">Overview</h3>
                                    <p className="text-gray-200 leading-relaxed">{overview}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Shows */}
            <div className="relative z-10 container mx-auto px-4 pb-16">
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    {recommendedShows.results && recommendedShows.results.length > 0 && (
                        <TVCarousel title="Recommended Shows" results={recommendedShows.results} link={`${params.tv}/recommendations`} />
                    )}
                </Suspense>
            </div>
        </div>
    )
}

export default TVShowPage


