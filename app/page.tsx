import { MovieCarousel } from "./MovieCarousel"

export default async function Home() {
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${MOVIE_API_KEY}`,
        },
    }

    // Fetch popular movies
    const popularMoviesUrl = "https://api.themoviedb.org/3/movie/popular"
    const popularMoviesData = await fetch(popularMoviesUrl, options)

    if (!popularMoviesData.ok) {
        throw new Error(`Failed to fetch popular movies: ${popularMoviesData.status}`)
    }

    const popularMovies = await popularMoviesData.json()

    // Fetch trending movies
    const trendingMoviesUrl = "https://api.themoviedb.org/3/trending/movie/day"
    const trendingMoviesData = await fetch(trendingMoviesUrl, options)

    if (!trendingMoviesData.ok) {
        throw new Error(`Failed to fetch trending movies: ${trendingMoviesData.status}`)
    }

    const trendingMovies = await trendingMoviesData.json()

    return (
        <main className="container py-8 space-y-12">
            <MovieCarousel title="Popular Movies" link="/movies/popular" results={popularMovies.results} />

            <MovieCarousel title="Trending Today" link="/movies/trending" results={trendingMovies.results} />
        </main>
    )
}

