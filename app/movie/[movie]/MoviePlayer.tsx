'use client'
import { buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import React, { useState } from 'react';
import { MediaPlayer, MediaProvider, MediaProviderAdapter, MediaProviderSetupEvent, PlayerSrc, isHLSProvider, useMediaRemote } from '@vidstack/react';
import { PlyrLayout, plyrLayoutIcons } from '@vidstack/react/player/layouts/plyr';

export function MoviePlayer() {
    //TODO: ADD CAPTION SUPPORT FROM OPEN SUBTITLES
    const mkvLink: PlayerSrc = {src: "/api/proxy?fileUrl=https://chi8.download.real-debrid.com/d/JYS4OLJAWJVUO22/Anyone.But.You.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv", type:"video/webm"}
    return (
        <Dialog>
            <DialogTrigger className={buttonVariants()}>
                <Play className='mr-3' /> Play
            </DialogTrigger>
            <DialogContent>
                <MediaPlayer src={mkvLink}>
                    <MediaProvider />
                    <PlyrLayout icons={plyrLayoutIcons} />
                </MediaPlayer>
                <DialogTitle> Media: </DialogTitle>
                <DialogDescription>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}

