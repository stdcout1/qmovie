import { validateUser } from "@/components/server/validateUser"
import { TVCarousel } from "../components/TVCarousel"
import { MovieCarousel } from "./MovieCarousel"
import { ApiKeyAlert } from "@/components/apikeyalert"

export default async function Home() {
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${MOVIE_API_KEY}`,
        },
    }


    const { user } = await validateUser()

    // Flag to track API key validity
    let isApiKeyExpired = false


    if (user) {
        const getOptionsRD = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${user.apiKey}`,
            },
        }

        const { type } = await (await fetch("https://api.real-debrid.com/rest/1.0/user", getOptionsRD)).json()
        console.log(type)
        if (type == "free" || !type) {
            isApiKeyExpired = true
        }
    }

    // MOVIE LISTS
    // Fetch now playing movies
    const nowPlayingMoviesUrl = "https://api.themoviedb.org/3/movie/now_playing"
    const nowPlayingMoviesData = await fetch(nowPlayingMoviesUrl, options)
    if (!nowPlayingMoviesData.ok) {
        throw new Error(`Failed to fetch now playing movies: ${nowPlayingMoviesData.status}`)
    }
    const nowPlayingMovies = await nowPlayingMoviesData.json()

    // Fetch popular movies
    const popularMoviesUrl = "https://api.themoviedb.org/3/movie/popular"
    const popularMoviesData = await fetch(popularMoviesUrl, options)
    if (!popularMoviesData.ok) {
        throw new Error(`Failed to fetch popular movies: ${popularMoviesData.status}`)
    }
    const popularMovies = await popularMoviesData.json()

    // Fetch top rated movies
    const topRatedMoviesUrl = "https://api.themoviedb.org/3/movie/top_rated"
    const topRatedMoviesData = await fetch(topRatedMoviesUrl, options)
    if (!topRatedMoviesData.ok) {
        throw new Error(`Failed to fetch top rated movies: ${topRatedMoviesData.status}`)
    }
    const topRatedMovies = await topRatedMoviesData.json()

    // Fetch upcoming movies
    const upcomingMoviesUrl = "https://api.themoviedb.org/3/movie/upcoming"
    const upcomingMoviesData = await fetch(upcomingMoviesUrl, options)
    if (!upcomingMoviesData.ok) {
        throw new Error(`Failed to fetch upcoming movies: ${upcomingMoviesData.status}`)
    }
    const upcomingMovies = await upcomingMoviesData.json()

    // Fetch trending movies
    const trendingMoviesUrl = "https://api.themoviedb.org/3/trending/movie/day"
    const trendingMoviesData = await fetch(trendingMoviesUrl, options)
    if (!trendingMoviesData.ok) {
        throw new Error(`Failed to fetch trending movies: ${trendingMoviesData.status}`)
    }
    const trendingMovies = await trendingMoviesData.json()

    // TV SERIES LISTS
    // Fetch airing today TV shows
    const airingTodayTVUrl = "https://api.themoviedb.org/3/tv/airing_today"
    const airingTodayTVData = await fetch(airingTodayTVUrl, options)
    if (!airingTodayTVData.ok) {
        throw new Error(`Failed to fetch airing today TV shows: ${airingTodayTVData.status}`)
    }
    const airingTodayTV = await airingTodayTVData.json()

    // Fetch on the air TV shows
    const onTheAirTVUrl = "https://api.themoviedb.org/3/tv/on_the_air"
    const onTheAirTVData = await fetch(onTheAirTVUrl, options)
    if (!onTheAirTVData.ok) {
        throw new Error(`Failed to fetch on the air TV shows: ${onTheAirTVData.status}`)
    }
    const onTheAirTV = await onTheAirTVData.json()

    // Fetch popular TV shows
    const popularTVUrl = "https://api.themoviedb.org/3/tv/popular"
    const popularTVData = await fetch(popularTVUrl, options)
    if (!popularTVData.ok) {
        throw new Error(`Failed to fetch popular TV shows: ${popularTVData.status}`)
    }
    const popularTV = await popularTVData.json()

    // Fetch top rated TV shows
    const topRatedTVUrl = "https://api.themoviedb.org/3/tv/top_rated"
    const topRatedTVData = await fetch(topRatedTVUrl, options)
    if (!topRatedTVData.ok) {
        throw new Error(`Failed to fetch top rated TV shows: ${topRatedTVData.status}`)
    }
    const topRatedTV = await topRatedTVData.json()

    return (
        <main className="container py-8 space-y-12">
            {isApiKeyExpired && <ApiKeyAlert />}
            <h2 className="text-2xl font-bold mb-6">Movies</h2>

            <MovieCarousel title="Now Playing" link="/movies/now-playing" results={nowPlayingMovies.results} />

            <MovieCarousel title="Popular Movies" link="/movies/popular" results={popularMovies.results} />

            <MovieCarousel title="Top Rated Movies" link="/movies/top-rated" results={topRatedMovies.results} />

            <MovieCarousel title="Upcoming Movies" link="/movies/upcoming" results={upcomingMovies.results} />

            {/*
                <MovieCarousel title="Trending Today" link="/movies/trending" results={trendingMovies.results} />
            */}

            <div className="border-t pt-8 mt-12">
                <h2 className="text-2xl font-bold mb-6">TV Shows</h2>

                <TVCarousel title="Airing Today" link="/tvs/airing-today" results={airingTodayTV.results} />

                <div className="mt-12">
                    <TVCarousel title="On The Air" link="/tvs/on-the-air" results={onTheAirTV.results} />
                </div>

                <div className="mt-12">
                    <TVCarousel title="Popular TV Shows" link="/tvs/popular" results={popularTV.results} />
                </div>

                <div className="mt-12">
                    <TVCarousel title="Top Rated TV Shows" link="/tvs/top-rated" results={topRatedTV.results} />
                </div>
            </div>
        </main>
    )
}

