import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { TVCard } from "./TvCard"
import { validateUser } from "./server/validateUser"

interface TVShow {
    poster_path: string
    name: string
    id: number
    vote_average: number
}

interface TVCarouselProps {
    title: string
    link: string
    results: TVShow[]
}

export async function TVCarousel({ title, link, results }: TVCarouselProps) {
    const {user} = await validateUser()
    const isLoggedIn = !!user

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
                        {results.map((show, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                                <TVCard
                                    poster_path={show.poster_path}
                                    name={show.name}
                                    id={show.id}
                                    vote_average={show.vote_average}
                                    isLoggedIn={isLoggedIn}
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

