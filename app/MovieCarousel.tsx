import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MovieCard } from "./MovieCard"

interface Movie {
    poster_path: string
    title: string
    id: number
    vote_average: number
}

interface MovieCarouselProps {
    title: string
    link: string
    results: Movie[]
}

export async function MovieCarousel({ title, link, results }: MovieCarouselProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Link className="font-bold text-xl flex items-center gap-2 hover:underline group" href={link}>
                    {title}
                    <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="relative">
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {results.map((movie, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <MovieCard
                                    poster_path={movie.poster_path}
                                    title={movie.title}
                                    id={movie.id}
                                    vote_average={movie.vote_average}
                                />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border" />
                    <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border" />
                </Carousel>
            </div>
        </div>
    )
}

