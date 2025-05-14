"use client"
import { useEffect, useState, useTransition, useCallback } from "react"
import { Search, Loader2, Filter, SortAsc, Film, Tv } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { discoverContent, type Content, type ContentType } from "@/app/actions/search-action"
import { useDebouncedCallback } from "use-debounce"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sort options
const SORT_OPTIONS = [
    { label: "Popularity Desc", value: "popularity.desc" },
    { label: "Popularity Asc", value: "popularity.asc" },
    { label: "Release Date Desc", value: "release_date.desc" },
    { label: "Release Date Asc", value: "release_date.asc" },
    { label: "Vote Average Desc", value: "vote_average.desc" },
    { label: "Vote Average Asc", value: "vote_average.asc" },
]

// Genre options (simplified list)
const GENRE_OPTIONS = {
    movie: [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 14, name: "Fantasy" },
        { id: 36, name: "History" },
        { id: 27, name: "Horror" },
        { id: 10402, name: "Music" },
        { id: 9648, name: "Mystery" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Science Fiction" },
        { id: 53, name: "Thriller" },
    ],
    tv: [
        { id: 10759, name: "Action & Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 80, name: "Crime" },
        { id: 99, name: "Documentary" },
        { id: 18, name: "Drama" },
        { id: 10751, name: "Family" },
        { id: 10762, name: "Kids" },
        { id: 9648, name: "Mystery" },
        { id: 10763, name: "News" },
        { id: 10764, name: "Reality" },
        { id: 10765, name: "Sci-Fi & Fantasy" },
        { id: 10766, name: "Soap" },
        { id: 10767, name: "Talk" },
        { id: 10768, name: "War & Politics" },
        { id: 37, name: "Western" },
    ],
}

export function SearchBar() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Content[]>([])
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Content type (movie or tv)
    const [contentType, setContentType] = useState<ContentType>("movie")

    // Filters
    const [year, setYear] = useState("")
    const [sortBy, setSortBy] = useState("popularity.desc")
    const [selectedGenres, setSelectedGenres] = useState<number[]>([])
    const [voteAverage, setVoteAverage] = useState(0)
    const [totalResults, setTotalResults] = useState(0)

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Load initial content when dialog opens or content type changes
    useEffect(() => {
        if (open) {
            fetchContent()
        }
    }, [open, contentType])

    // Reset filters when content type changes
    useEffect(() => {
        setSelectedGenres([])
    }, [contentType])

    // Fetch content with current filters
    const fetchContent = useCallback(() => {
        startTransition(async () => {
            const genreString = selectedGenres.join(",")
            const { content, totalResults: total } = await discoverContent({
                contentType,
                query,
                year,
                sortBy,
                genres: genreString,
                voteAverage,
            })
            setResults(content)
            setTotalResults(total)
        })
    }, [contentType, query, year, sortBy, selectedGenres, voteAverage])

    // Debounced search function
    const debouncedSearch = useDebouncedCallback(() => {
        fetchContent()
    }, 300)

    // Handle input change
    const handleInputChange = (value: string) => {
        setQuery(value)
        debouncedSearch()
    }

    // Handle filter changes
    const handleYearChange = (value: string) => {
        setYear(value)
        debouncedSearch()
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        debouncedSearch()
    }

    const toggleGenre = (genreId: number) => {
        setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]))
        debouncedSearch()
    }

    const handleVoteAverageChange = (value: number[]) => {
        setVoteAverage(value[0])
        debouncedSearch()
    }

    const clearFilters = () => {
        setYear("")
        setSortBy("popularity.desc")
        setSelectedGenres([])
        setVoteAverage(0)
        debouncedSearch()
    }

    const handleContentTypeChange = (value: string) => {
        setContentType(value as ContentType)
        // Filters will be reset in the useEffect
    }

    const runCommand = useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    const navigateToContent = useCallback(
        (id: number, type: ContentType) => {
            runCommand(() => router.push(`/${type}/${id}`))
        },
        [router, runCommand],
    )

    // Get poster URL
    const getPosterUrl = (path: string | null) => {
        if (!path) return "/classic-movie-theater.png"
        return `https://image.tmdb.org/t/p/w92${path}`
    }

    // Get content title
    const getContentTitle = (content: Content) => {
        if ("title" in content) return content.title
        return content.name
    }

    // Get content release date
    const getContentReleaseDate = (content: Content) => {
        if ("release_date" in content) return content.release_date
        return content.first_air_date
    }

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 xl:mr-2" />
                <span className="hidden xl:inline-flex">Search movies & TV...</span>
                <span className="sr-only">Search movies and TV shows</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen} className="max-w-3xl">
                <Tabs defaultValue="movie" onValueChange={handleContentTypeChange}>
                    <div className="flex items-center justify-between border-b px-3">
                        <div className="flex items-center flex-1">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <CommandInput
                                placeholder={`Search for ${contentType === "movie" ? "movies" : "TV shows"}...`}
                                value={query}
                                onValueChange={handleInputChange}
                                className="flex-1"
                            />
                        </div>

                        <TabsList className="ml-2">
                            <TabsTrigger value="movie" className="flex items-center">
                                <Film className="h-4 w-4 mr-1" />
                                <span>Movies</span>
                            </TabsTrigger>
                            <TabsTrigger value="tv" className="flex items-center">
                                <Tv className="h-4 w-4 mr-1" />
                                <span>TV Shows</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex items-center border-b px-3 py-2 gap-1">
                        {/* Year Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <Filter className="h-3.5 w-3.5 mr-2" />
                                    <span>Year</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-0" align="start">
                                <div className="p-4 space-y-2">
                                    <h4 className="font-medium text-sm">
                                        Filter by {contentType === "movie" ? "Release" : "First Air Date"} Year
                                    </h4>
                                    <input
                                        type="number"
                                        placeholder="Enter year (e.g. 2023)"
                                        className="w-full p-2 text-sm border rounded"
                                        value={year}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                        min="1900"
                                        max="2030"
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Sort Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <SortAsc className="h-3.5 w-3.5 mr-2" />
                                    <span>Sort</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {SORT_OPTIONS.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={sortBy === option.value ? "bg-accent" : ""}
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Genre Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <span>Genres</span>
                                    {selectedGenres.length > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {selectedGenres.length}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                                <div className="p-4">
                                    <h4 className="font-medium text-sm mb-2">Filter by Genres</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {GENRE_OPTIONS[contentType].map((genre) => (
                                            <Badge
                                                key={genre.id}
                                                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                                                className="cursor-pointer"
                                                onClick={() => toggleGenre(genre.id)}
                                            >
                                                {genre.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Rating Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8">
                                    <span>Rating</span>
                                    {voteAverage > 0 && (
                                        <Badge variant="secondary" className="ml-1">
                                            {voteAverage}+
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-0" align="start">
                                <div className="p-4 space-y-4">
                                    <h4 className="font-medium text-sm">Minimum Rating</h4>
                                    <div className="space-y-2">
                                        <Slider value={[voteAverage]} min={0} max={10} step={0.5} onValueChange={handleVoteAverageChange} />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>0</span>
                                            <span>{voteAverage} stars</span>
                                            <span>10</span>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Clear Filters */}
                        {(year || sortBy !== "popularity.desc" || selectedGenres.length > 0 || voteAverage > 0) && (
                            <Button variant="ghost" size="sm" className="h-8 ml-auto" onClick={clearFilters}>
                                Clear
                            </Button>
                        )}
                    </div>

                    <TabsContent value="movie" className="mt-0">
                        <Command>
                            <CommandList>
                                {isPending && (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                                <CommandEmpty>{!isPending && "No movies found."}</CommandEmpty>

                                {results.length > 0 && (
                                    <CommandGroup heading={`Results ${totalResults > 0 ? `(${totalResults} total)` : ""}`}>
                                        {results.map((content) => (
                                            <CommandItem
                                                key={content.id}
                                                onSelect={() => navigateToContent(content.id, "movie")}
                                                className="flex items-center py-2"
                                            >
                                                <div className="mr-2 flex-shrink-0 h-12 w-8 relative overflow-hidden rounded">
                                                    <Image
                                                        src={getPosterUrl(content.poster_path) || "/placeholder.svg"}
                                                        alt={getContentTitle(content)}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{getContentTitle(content)}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {getContentReleaseDate(content)
                                                            ? new Date(getContentReleaseDate(content)!).getFullYear()
                                                            : "N/A"}{" "}
                                                        • {content.vote_average.toFixed(1)}⭐
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                <CommandSeparator />

                                <CommandGroup heading="Navigation">
                                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>Home</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => runCommand(() => router.push("/my-saved"))}>
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>My Saved</span>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>

                    <TabsContent value="tv" className="mt-0">
                        <Command>
                            <CommandList>
                                {isPending && (
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                )}

                                <CommandEmpty>{!isPending && "No TV shows found."}</CommandEmpty>

                                {results.length > 0 && (
                                    <CommandGroup heading={`Results ${totalResults > 0 ? `(${totalResults} total)` : ""}`}>
                                        {results.map((content) => (
                                            <CommandItem
                                                key={content.id}
                                                onSelect={() => navigateToContent(content.id, "tv")}
                                                className="flex items-center py-2"
                                            >
                                                <div className="mr-2 flex-shrink-0 h-12 w-8 relative overflow-hidden rounded">
                                                    <Image
                                                        src={getPosterUrl(content.poster_path) || "/placeholder.svg"}
                                                        alt={getContentTitle(content)}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{getContentTitle(content)}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {getContentReleaseDate(content)
                                                            ? new Date(getContentReleaseDate(content)!).getFullYear()
                                                            : "N/A"}{" "}
                                                        • {content.vote_average.toFixed(1)}⭐
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                <CommandSeparator />

                                <CommandGroup heading="Navigation">
                                    <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>Home</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => runCommand(() => router.push("/my-saved"))}>
                                        <Search className="mr-2 h-4 w-4" />
                                        <span>My Saved</span>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </TabsContent>
                </Tabs>
            </CommandDialog>
        </>
    )
}

