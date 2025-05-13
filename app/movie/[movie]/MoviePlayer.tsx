import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Play } from "lucide-react"
import { useState } from "react"
import { XMLParser } from "fast-xml-parser"
import { env } from "process"
import type { User } from "lucia"
import { savePlaybackPosition, getPlaybackPosition } from "@/app/actions/video-playback"
import { MoviePlayerClient } from "./MovieClient"

export async function MoviePlayer(props: { title: string; imdb_id: string; user: User }) {
    //stack:
    //1. get torrent from jackett
    //2. send that magnet to real-debrid
    //3. get the url.
    //4. play it
    //
    console.log(props.title)

    // jackett
    console.log(env.JACKETT_API_KEY)
    console.log(props.imdb_id)

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
    })
    const jackettUrl = `${env.JACKETT_URL}/api/v2.0/indexers/all/results/torznab`
    const jackettApiKey = env.JACKETT_API_KEY
    const options = {
        method: "GET",
    }
    console.log(jackettUrl + `?apikey=${jackettApiKey}&t=movie&cat=2040&imdbid=${props.imdb_id}`, options)

    const xml = await (
        await fetch(jackettUrl + `?apikey=${jackettApiKey}&t=movie&imdbid=${props.imdb_id}`, options)
    ).text()
    const json = parser.parse(xml)
    const items = json?.rss?.channel?.item ?? []
    if (items.length == 0) {
        console.log("No items")
        return
    }
    function getTorznabAttr(item, key) {
        const attrs = item["torznab:attr"]
        const list = Array.isArray(attrs) ? attrs : [attrs]
        return list.find((attr) => attr.name === key)?.value
    }

    function getTopSeeder(items) {
        return items.reduce((top, item) => {
            const seeders = Number.parseInt(getTorznabAttr(item, "seeders") ?? "0")
            const topSeeders = Number.parseInt(getTorznabAttr(top, "seeders") ?? "0")
            return seeders > topSeeders ? item : top
        }, items[0])
    }
    const topItem = getTopSeeder(items)
    console.log("Title:", topItem.title)
    console.log("Seeders:", getTorznabAttr(topItem, "seeders"))
    console.log("Magnet:", getTorznabAttr(topItem, "magneturl"))

    // now we pass this magent url to real-debrid
    const RDAPIKEY = props.user.apiKey
    const getOptionsRD = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${RDAPIKEY}`,
        },
    }
    // first we add magnet
    const addMagnetOptions = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RDAPIKEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ magnet: getTorznabAttr(topItem, "magneturl") }),
    }
    const { id } = await (await fetch("https://api.real-debrid.com/rest/1.0/torrents/addMagnet", addMagnetOptions)).json()
    console.log(id, RDAPIKEY)
    // now select all the files
    const selectFilesOptions = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RDAPIKEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ files: "all" }),
    }
    const _ = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${id}`, selectFilesOptions)
    // now get the links

    const { links } = await (await fetch(`https://api.real-debrid.com/rest/1.0/torrents/info/${id}`, getOptionsRD)).json()
    console.log(links)

    //now we unrestrict the link
    const unrestrictLinkOptions = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${RDAPIKEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ link: links[0] }),
    }
    const output = await (
        await fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", unrestrictLinkOptions)
    ).json()
    console.log(output.id)

    // now we get the streaming link
    // for some reason sometimes we need to slice the last two characters off its very weird lol

    const trySlices = [0, -1, -2];

    let dash: string | null = null;
    let duration: number | null = null;

    for (const slice of trySlices) {
        const id = slice === 0 ? output.id : output.id.slice(0, slice);

        const dashRes = await fetch(`https://api.real-debrid.com/rest/1.0/streaming/transcode/${id}`, getOptionsRD);
        const dashData = await dashRes.json();
        console.log(dashData.dash);

        if (dashData.dash) {
            dash = dashData.dash;

            const durationRes = await fetch(`https://api.real-debrid.com/rest/1.0/streaming/mediaInfos/${id}`, getOptionsRD);
            const durationData = await durationRes.json();
            console.log(durationData.duration);

            duration = durationData.duration;
            break;
        }
    }

    if (!dash || !duration) {
        return
    }

    // Get saved playback position
    const savedPositionResult = await getPlaybackPosition(props.imdb_id, props.user.id)
    const initialPosition = savedPositionResult.success ? savedPositionResult.position : 0

    // Client component for dialog state
    return (
        <Dialog>
            <DialogTrigger className={buttonVariants()}>
                <Play className="mr-3" /> Play
            </DialogTrigger>
            <DialogContent>
                <DialogTitle> {props.title} </DialogTitle>
                <MoviePlayerClient
                    videoId={props.imdb_id}
                    userId={props.user.id}
                    link={dash.full}
                    duration={duration}
                    initialPosition={initialPosition}
                />
                <DialogDescription></DialogDescription>
            </DialogContent>
        </Dialog>
    )
}
