"use client"

import { useState } from "react"
import Image from "next/image"
import { Tv2, ChevronRight, Calendar, Clock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import getSeasonDetails from "./seasonAction"
import { TvPlayer } from "./TvPlayer"
import { User } from "lucia"

export interface Season {
    id: number
    name: string
    season_number: number
    episode_count: number
    poster_path: string
    overview: string
    air_date: string
}

export interface Episode {
    id: string
    name: string
    episode_number: number
    season_number: number
    still_path: string
    overview: string
    air_date: string
    runtime: number
}

interface SeasonDrawerProps {
    showId: string
    showTitle: string
    seasons: Season[]
    user: User
}

export function SeasonDrawer({ showId, showTitle, seasons, user }: SeasonDrawerProps) {
    const [open, setOpen] = useState(false)
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSeasonSelect = async (season: Season) => {
        console.log("seelected", season.season_number)
        if (selectedSeason?.id === season.id && episodes.length > 0) {
            return // Already loaded
        }

        setSelectedSeason(season)
        setIsLoading(true)

        try {
            const data = await getSeasonDetails(season, showId)
            setEpisodes(data.episodes || [])
            // console.log(data.episodes[0])

            // Select first episode by default
            if (data.episodes && data.episodes.length > 0) {
                setSelectedEpisode(data.episodes[0])
            } else {
                setSelectedEpisode(null)
            }
        } catch (error) {
            console.error("Failed to fetch season episodes:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEpisodeSelect = (episode: Episode) => {
        setSelectedEpisode(episode)
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "TBA"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    }

    const formatRuntime = (minutes: number) => {
        if (!minutes) return "N/A"
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    return (
        <Drawer
            open={open}
            onOpenChange={(open) => {
                setOpen(open)
                handleSeasonSelect(seasons[0])
            }}
        >
            <DrawerTrigger className={buttonVariants()}>
                <Tv2 className="mr-2 h-4 w-4" />
                Browse Seasons & Episodes
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh] flex flex-col">
                <DrawerHeader className="pb-2">
                    <DrawerTitle className="text-2xl">{showTitle}</DrawerTitle>
                    <DrawerDescription>Browse seasons and episodes</DrawerDescription>
                </DrawerHeader>

                <div className="px-4 flex-1 flex flex-col overflow-hidden">
                    <Tabs
                        defaultValue={seasons[0]?.id.toString()}
                        className="w-full h-full flex flex-col"
                        onValueChange={(value) => {
                            const season = seasons.find((s) => s.id.toString() === value)
                            if (season) {
                                handleSeasonSelect(season)
                            }
                        }}
                    >
                        {/* Simple div with overflow-auto for horizontal scrolling */}
                        <div className="w-full overflow-x-auto mb-2 pb-2 border-b">
                            <div className="inline-flex min-w-full">
                                <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
                                    {seasons.map((season) => (
                                        <TabsTrigger
                                            key={season.id}
                                            value={season.id.toString()}
                                            className="min-w-[120px] data-[state=active]:bg-background"
                                        >
                                            {season.name}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>

                        {seasons.map((season) => (
                            <TabsContent
                                key={season.id}
                                value={season.id.toString()}
                                className="flex-1 flex flex-col overflow-hidden"
                            >
                                {selectedSeason?.id === season.id && (
                                    <div className="flex flex-col h-full">
                                        <div className="mb-2">
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-1 h-4 w-4" />
                                                    {formatDate(season.air_date)}
                                                </div>
                                                <div className="flex items-center">
                                                    <Tv2 className="mr-1 h-4 w-4" />
                                                    {season.episode_count} Episodes
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-4 flex-1 overflow-hidden">
                                            {/* Season poster */}
                                            <div className="w-1/4 flex-shrink-0">
                                                <div className="relative w-full h-0 pb-[150%]">
                                                    <Image
                                                        src={
                                                            season.poster_path
                                                                ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                                                                : "/placeholder.svg?height=450&width=300"
                                                        }
                                                        alt={season.name}
                                                        fill
                                                        sizes="(max-width: 768px) 25vw, 20vw"
                                                        className="rounded-lg object-cover"
                                                        priority
                                                    />
                                                </div>
                                            </div>

                                            {/* Episodes list */}
                                            <div className="w-3/4 flex-1 flex flex-col overflow-hidden">
                                                <h4 className="text-md font-semibold mb-2">Episodes</h4>
                                                {isLoading ? (
                                                    <div className="flex justify-center py-8">
                                                        <p>Loading episodes...</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 overflow-hidden h-full">
                                                        {episodes.length > 0 ? (
                                                            <ScrollArea className="h-[calc(100vh-350px)] pr-4">
                                                                <div className="space-y-2 pb-2">
                                                                    {episodes.map((episode) => (
                                                                        <Card
                                                                            key={episode.id}
                                                                            className={`cursor-pointer transition-all ${selectedEpisode?.id === episode.id ? "ring-2 ring-primary" : "hover:bg-accent"
                                                                                }`}
                                                                            onClick={() => handleEpisodeSelect(episode)}
                                                                        >
                                                                            <CardContent className="p-3">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="flex-1">
                                                                                        <h5 className="font-medium text-sm">
                                                                                            {episode.episode_number}. {episode.name}
                                                                                        </h5>
                                                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                                            <div className="flex items-center">
                                                                                                <Calendar className="mr-1 h-3 w-3" />
                                                                                                {formatDate(episode.air_date)}
                                                                                            </div>
                                                                                            {episode.runtime && (
                                                                                                <div className="flex items-center">
                                                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                                                    {formatRuntime(episode.runtime)}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                                </div>
                                                                                <p className="text-xs mt-1 line-clamp-2">
                                                                                    {episode.overview || "No description available."}
                                                                                </p>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        ) : (
                                                            <p className="text-center py-8 text-muted-foreground">
                                                                No episodes available for this season.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <DrawerFooter className="pt-2">
                    <TvPlayer userId={user.id} title={showTitle} episode={selectedEpisode} rdapikey={user.apiKey} />

                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

