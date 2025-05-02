import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle} from 'lucide-react'
import Image from "next/image"
import { validateUser } from "@/components/server/validateUser"
import { redirect } from "next/navigation"
// import { ShowCarousel } from "@/app/ShowCarousel"
import {TvPlayer} from "./TvPlayer"
import { SeasonDrawer } from "./SeasonDrawer"

async function TVShowPage({ params }: { params: { tv: string } }) {
    const backdropUrl = "https://image.tmdb.org/t/p/original"
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
    } = await (await fetch(showUrl, options)).json()


    // Fetch recommended shows
    const recommendedShows = await (
        await fetch(`https://api.themoviedb.org/3/tv/${params.show}/recommendations?language=en-US&page=1`, options)
    ).json()

    // Validate user
    const { user, session } = await validateUser()
    if (!user) {
        return redirect("/signin")
    }
    const apiKey = user.apiKey

    return (
        <>
            <Image
                src={backdropUrl + backdrop_path || "/placeholder.svg"}
                alt={name + " backdrop"}
                width={1920}
                height={1080}
                className="absolute inset-0 z-0 bg-blend-color-dodge"
            />
            <div className="bg-gradient-to-t from-background from-30% translate-y-36">
                <div className="flex gap-x-5 items-center justify-between">
                    <div className="flex flex-col gap-y-5 ml-5 w-96">
                        <h1 className="text-primary text-left text-4xl font-bold">
                            {name} ({first_air_date?.slice(0, 4)})
                        </h1>
                        <p>{tagline}</p>

                        {/* Season Drawer component */}
                        <SeasonDrawer
                            showId={params.tv}
                            showTitle={name}
                            seasons={seasons}
                            imdbId={external_ids?.imdb_id}
                            apiKey={apiKey}
                        />

                        <Button variant={"secondary"}>
                            <MessageCircle className="mr-3" /> Chat
                        </Button>

                        <div className="flex flex-row gap-x-1 items-center">
                            <p className="font-bold">Genres:</p>
                            <div className="flex gap-x-2 w-96 gap-y-2 flex-wrap">
                                {genres?.map(({ id, name }) => (
                                    <Badge key={id}>{name}</Badge>
                                ))}
                            </div>
                        </div>

                        <p className="font-bold">Runtime: {episode_run_time?.[0] || "N/A"} min</p>

                        <p>{overview}</p>
                    </div>

                    <Image
                        className="mr-16"
                        src={backdropUrl + poster_path || "/placeholder.svg"}
                        alt={name + " poster"}
                        width={300}
                        height={450}
                    />
                </div>
            </div>

            {/* Recommended Shows */}
            <div className="relative translate-y-36 mt-8 w-full overflow-hidden px-4 md:px-6 max-w-7xl mx-auto">
            </div>
        </>
    )
}

export default TVShowPage

