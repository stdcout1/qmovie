"use client"

import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import CustomPlayer from "@/app/movie/[movie]/CustomMedia"
import type { Episode } from "./SeasonDrawer"
import { Play } from "lucide-react"
import videoAction from "./videoAction"
import { unrestrictAction } from "./unrestrictAction"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type FileEntry = {
    id: number
    path: string
    bytes: number
    selected: number
}

type ParsedEpisode = {
    path: string
    season: number
    episode: number
    size: number
    url: string
}

export type Data = {
    files: FileEntry[]
    links: string[]
}

function extractEpisodes(data: Data): ParsedEpisode[] {
    const { files, links } = data
    const videoExtensions = [".mkv", ".mp4", ".avi", ".mov", ".webm"]
    const seasonFolderRegex = /season[\s._-]?(\d{1,2})/i
    const episodeRegex =
        /\b(?:s(?:eason)?[ ._-]?(\d{1,2}))[ ._-]?(?:e(?:pisode)?[ ._-]?(\d{1,2}))\b|\b(\d{1,2})x(\d{2})\b/i
    const looseEpisodeRegex = /\b[eE]p(?:isode)?[ ._-]?(\d{1,2})\b/

    let linkIndex = 0
    const episodes: ParsedEpisode[] = []

    for (const file of files) {
        if (file.selected !== 1) continue

        const path = file.path.toLowerCase()
        const filename = path.split("/").pop() || ""
        const ext = filename.slice(filename.lastIndexOf("."))

        if (!videoExtensions.includes(ext)) {
            linkIndex++
            continue
        }

        let season: number | undefined
        let episode: number | undefined

        const match = filename.match(episodeRegex)
        if (match) {
            if (match[1] && match[2]) {
                season = Number.parseInt(match[1], 10)
                episode = Number.parseInt(match[2], 10)
            } else if (match[3] && match[4]) {
                season = Number.parseInt(match[3], 10)
                episode = Number.parseInt(match[4], 10)
            }
        }

        if (season === undefined || episode === undefined) {
            const folders = path.split("/")
            const seasonFolder = folders.find((part) => seasonFolderRegex.test(part))
            const seasonMatch = seasonFolder?.match(seasonFolderRegex)
            if (seasonMatch) {
                season = Number.parseInt(seasonMatch[1], 10)
            }

            const looseEpMatch = filename.match(looseEpisodeRegex)
            if (looseEpMatch) {
                episode = Number.parseInt(looseEpMatch[1], 10)
            }
        }

        if (season !== undefined && episode !== undefined && linkIndex < links.length) {
            episodes.push({
                path: file.path,
                season,
                episode,
                size: file.bytes,
                url: links[linkIndex],
            })
        }

        linkIndex++
    }

    return episodes
}

function getEpisodeLink(episodes: ParsedEpisode[], season: number, episode: number): string | null {
    return episodes.find((ep) => ep.season === season && ep.episode === episode)?.url ?? null
}

export function TvPlayer(props: { title: string | undefined; episode: Episode | null; rdapikey: string }) {
    const [data, setData] = useState<Data | null>(null)
    const [loading, setLoading] = useState(true)
    const [videoLink, setVideoLink] = useState(null)
    const [duration, setDuration] = useState(null)

    // Check if the selected episode is from a specials/bonus season (season 0)
    const isSpecialSeason = props.episode?.season_number === 0

    useEffect(() => {
        async function loadData() {
            try {
                setData(await videoAction(props))
            } finally {
                setLoading(false)
                console.log("Loaded")
                console.log(data)
            }
        }
        loadData()
    }, [])

    async function onPlayHandler() {
        if (data && props.episode && !isSpecialSeason) {
            const link = getEpisodeLink(extractEpisodes(data), props.episode?.season_number, props.episode?.episode_number)
            const newdata = await unrestrictAction(link, props.rdapikey)
            if (newdata) {
                const { dash, duration } = newdata
                setVideoLink(dash.full)
                setDuration(duration)
            }
        }
    }

    // Render the play button with tooltip for special seasons
    const renderPlayButton = () => {
        const buttonContent = (
            <>
                <Play className="mr-3" /> Play {props.episode?.name}
            </>
        )

        // If it's a special season, wrap in tooltip to explain why it's disabled
        if (isSpecialSeason) {
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="inline-flex w-full">
                                <button
                                    className={buttonVariants({
                                        className: "w-full opacity-60 cursor-not-allowed",
                                    })}
                                    disabled={true}
                                >
                                    {buttonContent}
                                </button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Special/Bonus episodes are not supported yet</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        }

        // Regular season episode
        return (
            <DialogTrigger className={buttonVariants()} disabled={loading} onClick={onPlayHandler}>
                {buttonContent}
            </DialogTrigger>
        )
    }

    return (
        <Dialog>
            {renderPlayButton()}
            <DialogContent>
                <DialogTitle> {props.title} </DialogTitle>
                {videoLink && duration ? <CustomPlayer link={videoLink} duration={duration} /> : <p>Loading player...</p>}
                <DialogDescription></DialogDescription>
            </DialogContent>
        </Dialog>
    )
}

