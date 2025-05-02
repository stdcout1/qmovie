'use server'

import { Season } from "./SeasonDrawer"
async function getSeasonDetails(season: Season, showId: string) {
    'use server'
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${MOVIE_API_KEY}`,
        },
    }
    return await (await fetch(`https://api.themoviedb.org/3/tv/${showId}/season/${season.season_number}`, options)).json()

}

export default getSeasonDetails



