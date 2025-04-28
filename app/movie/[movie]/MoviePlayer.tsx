'use client'
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import React, { useState } from 'react';
import { MediaPlayer, MediaProvider, MediaProviderAdapter, MediaProviderSetupEvent, PlayerSrc, isHLSProvider, useMediaRemote } from '@vidstack/react';
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';
import RealDebridRawVideo from './CustomMedia';

export function MoviePlayer(props: { title: string, year: number }) {
    //stack:
    //1. get torrent from jackett
    //2. send that magnet to real-debrid
    //3. get the url.
    //4. play it 
    //
    console.log(props.title)



    //TODO: ADD CAPTION SUPPORT FROM OPEN SUBTITLES
    return (
        <Dialog>
            <DialogTrigger className={buttonVariants()}>
                <Play className='mr-3' /> Play
            </DialogTrigger>
            <DialogContent>
                <RealDebridRawVideo/>
                <DialogTitle> Media: </DialogTitle>
                <DialogDescription>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}

