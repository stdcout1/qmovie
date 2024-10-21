import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, Star } from "lucide-react";

const MovieCard = ({ poster_path, title, id, vote_average }) => {
    const url = 'https://image.tmdb.org/t/p/w500'
    return (
        <Card >
            <CardContent className="flex aspect-square items-center justify-center p-1">
                <Link href={"/movie/" + id}>
                    <Image src={url + poster_path} alt={title + "poster"} width={500} height={1920} />
                </Link>
            </CardContent>
            <div className="relative flex items-end justify-left">
                <Star className="absolute m-1" />
                <p className="absolute m-1 translate-x-7 text-white text-align-center mix-blend-exclusion">{vote_average}</p>
            </div>
        </Card>
    )
}

export const MovieCarousel = async ({title, url, link }) => {
    const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${MOVIE_API_KEY}`
        }
    };
    const { page, results, total_pages, total_results } = await (await fetch(url, options)).json();
    console.log()

    return (
        <>
            <Link className="font-bold text-xl flex gap-2 w-80" href={link}> {title}
                <ArrowRightIcon className="my-auto" />
            </Link>

            <Carousel className="mt-2">
                <CarouselNext />
                <CarouselPrevious />
                <CarouselContent>
                    {results.map((item, index) => (
                        <CarouselItem key={index} className="basis-2/4 md:basis-1/4 lg:basis-1/4">
                            <div className="p-1">
                                <MovieCard poster_path={item.poster_path} title={item.title} id={item.id} vote_average={item.vote_average} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </>
    );
};

