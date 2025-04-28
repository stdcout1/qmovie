'use client'
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import React, { useState } from 'react';
import CustomPlayer from './CustomMedia';

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
                <DialogTitle> {props.title} </DialogTitle>
                <CustomPlayer link="https://29.stream.real-debrid.com/t/FY3YBSGVSV2PU87/eng1/none/aac/full.mpd" />
                <DialogDescription>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}

