import { MovieCarousel } from '@/app/PopularCarousel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image'
import React, { useEffect } from 'react'
import '@vidstack/react/player/styles/base.css';
import '@vidstack/react/player/styles/plyr/theme.css';
import { Captions, Track } from '@vidstack/react';
import { MoviePlayer } from './MoviePlayer';
import { client } from '@/auth';
import { validateUser } from '@/components/server/validateUser';
import { redirect } from 'next/navigation';

async function moviePage({ params }: { params: { movie: string } }) {
    const backdropUrl = 'https://image.tmdb.org/t/p/original'
    const movieUrl = `https://api.themoviedb.org/3/movie/${params.movie}`
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${MOVIE_API_KEY}`
        }
    };
    const { backdrop_path, title, release_date, poster_path, tagline, runtime, genres, overview } = await (await fetch(movieUrl, options)).json();
    let {user, session} = await validateUser()
    if (!user) {
        return redirect("/signin")
    }
    let apiKey = user.apiKey

    return (
        <>
            <Image src={backdropUrl + backdrop_path} alt={title + "backdrop"} width={1920} height={1080} className='absolute inset-0 z-0 bg-blend-color-dodge' />
            <div className='bg-gradient-to-t from-background from-30% translate-y-36'>
                <div className='flex gap-x-5 items-center justify-between'>
                    <div className='flex flex-col gap-y-5 ml-5 w-96'>
                        <h1 className='text-primary text-left text-4xl font-bold'>{title} ({release_date.slice(0, 4)})</h1>
                        <p> {tagline} </p>
                        <MoviePlayer />
                        <Button variant={'secondary'}> <MessageCircle className='mr-3' /> Chat </Button>
                        <div className='flex flex-row gap-x-1 items-center'>
                            <p className='font-bold'>Genres:</p>
                            <div className='flex gap-x-2 w-96 gap-y-2 flex-wrap'>
                                {genres.map(({ id, name }) => (
                                    <Badge key={id}>{name} </Badge>
                                ))}
                            </div>
                        </div>
                        <p> Runtime: {runtime} </p>
                        <p> {overview} </p>
                    </div>
                    <Image className='mr-16' src={backdropUrl + poster_path} alt={title + " poster"} width={300} height={300 * 2 / 3} />
                </div>
            </div >
            <div className='relative translate-y-36 mt-5'>
                <MovieCarousel title={"Recommended"} url={`https://api.themoviedb.org/3/movie/${params.movie}/recommendations?language=en-US&page=1`} link={"/recommendations"} />
            </div>
        </>
    )
}

export default moviePage
