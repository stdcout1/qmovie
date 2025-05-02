'use server'


export async function unrestrictAction(link: string | null, rdapikey: string) {
    if (!link) {
        return null
    }
    const getOptionsRD = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${rdapikey}`
        },
    }

    const unrestrictLinkOptions = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rdapikey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ link: link })
    }
    const output = await (await fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", unrestrictLinkOptions)).json()
    console.log(output.id)

    // now we get the streaming link 

    const { dash } = await (await fetch(`https://api.real-debrid.com/rest/1.0/streaming/transcode/${output.id.slice(0, -2)}`, getOptionsRD)).json()
    console.log(dash)

    //duration

    const { duration } = await (await fetch(`https://api.real-debrid.com/rest/1.0/streaming/mediaInfos/${output.id.slice(0, -2)}`, getOptionsRD)).json()
    console.log(duration)

    return { dash: dash, duration: duration }


}

