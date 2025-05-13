'use server'
import { env } from 'process'
import { XMLParser } from 'fast-xml-parser'
import React from 'react'



async function videoAction(props) {
    //stack:
    //1. get torrent from jackett
    //2. send that magnet to real-debrid
    //3. get the url.
    //4. play it 
    //
    console.log(props.title)


    // jackett
    console.log(env.JACKETT_API_KEY)

    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
    });
    const jackettUrl = `${env.JACKETT_URL}/api/v2.0/indexers/all/results/torznab`
    const jackettApiKey = env.JACKETT_API_KEY
    const options = {
        method: 'GET',
    }
    console.log(jackettUrl + `?apikey=${jackettApiKey}&t=tvsearch&q=${props.title}`, options)

    const xml = await (await fetch(jackettUrl + `?apikey=${jackettApiKey}&t=tvsearch&q=${props.title}`, options)).text()
    const json = parser.parse(xml);
    const items = json?.rss?.channel?.item ?? [];
    if (items.length == 0) {
        console.log("No items")
        return
    }
    function getTorznabAttr(item, key) {
        const attrs = item['torznab:attr'];
        const list = Array.isArray(attrs) ? attrs : [attrs];
        return list.find(attr => attr.name === key)?.value;
    }

    function getTopSeeder(items) {
        return items.reduce((top, item) => {
            const seeders = parseInt(getTorznabAttr(item, 'seeders') ?? '0');
            const topSeeders = parseInt(getTorznabAttr(top, 'seeders') ?? '0');
            return seeders > topSeeders ? item : top;
        }, items[0]);
    }
    const completeSeriesRegex = /complete|all[\s._-]?seasons|season\s*\d+\s*[-–]\s*\d+|s\d{2}[\s._-]?s\d{2}/i;

    const filteredItems = items.filter(item =>
        completeSeriesRegex.test(item.title)
    );

    if (filteredItems.length === 0) {
        console.log("No complete series found");
        return;
    }

    const topItem = getTopSeeder(filteredItems);
    console.log("Title:", topItem.title);
    console.log("Seeders:", getTorznabAttr(topItem, 'seeders'));
    console.log("Magnet:", getTorznabAttr(topItem, 'magneturl'));
    //
    // now we pass this magent url to real-debrid
    const RDAPIKEY = props.rdapikey
    const getOptionsRD = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${RDAPIKEY}`
        },
    }
    // first we add magnet 
    const addMagnetOptions = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RDAPIKEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ magnet: getTorznabAttr(topItem, 'magneturl') })
    }
    const { id } = await (await fetch("https://api.real-debrid.com/rest/1.0/torrents/addMagnet", addMagnetOptions)).json()
    console.log(id, RDAPIKEY)
    // now select all the files
    const selectFilesOptions = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RDAPIKEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ files: 'all' })
    }
    const _ = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/selectFiles/${id}`, selectFilesOptions)
    // now get the links
    // we need to check if we 

    const data =  await (await fetch(`https://api.real-debrid.com/rest/1.0/torrents/info/${id}`, getOptionsRD)).json()

    return(data)
}

export default videoAction
