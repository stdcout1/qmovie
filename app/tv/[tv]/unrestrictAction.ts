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
        return null
    }

    return { dash: dash, duration: duration }


}

