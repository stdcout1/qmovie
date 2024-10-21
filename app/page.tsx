import Image from "next/image";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { MovieCarousel } from "./PopularCarousel";



export default function Home() {
    return (
        <main>
            <MovieCarousel title={"Popular"} url={"https://api.themoviedb.org/3/movie/popular?language=en-US&page=1"} link={"popular"} />
        </main>
    );
}
