'use client'
import { useRef, useEffect, useState } from 'react';
import dashjs from 'dashjs';

export default function CustomPlayer(props: {link: string, duration: number}) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const dashPlayerRef = useRef<dashjs.MediaPlayerClass | null>(null);
    const seekTs = useRef(0);
    const curTs = useRef(0);
    const [realTime, setRealTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [movieDuration, setMovieDuration] = useState(props.duration); // example
    const [isFullscreen, setIsFullscreen] = useState(false);
    const base_link = props.link;

    const createDashPlayer = (mpdUrl: string) => {
        const video = videoRef.current;
        if (!video) return;

        const dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(video, mpdUrl, true);
        dashPlayerRef.current = dashPlayer;
    };

    const reloadDashPlayer = (mpdUrl: string) => {
        const video = videoRef.current;
        if (!video || !dashPlayerRef.current) return;

        try {
            dashPlayerRef.current.reset();
            dashPlayerRef.current.attachView(video);
            dashPlayerRef.current.attachSource(mpdUrl);
        } catch (e) {
            console.error('Error while reloading dash player:', e);
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        createDashPlayer(base_link + `?t=0`);

        const handleSeeking = () => {
            const seekTo = video.currentTime + seekTs.current;

            let foundInBuffer = false;
            for (let i = 0; i < video.buffered.length; i++) {
                const start = video.buffered.start(i) + seekTs.current;
                const end = video.buffered.end(i) + seekTs.current;
                if (seekTo >= start && seekTo <= end) {
                    curTs.current = seekTo;
                    console.log('Fast seek inside buffer to', seekTo);
                    return;
                }
            }

            console.log('Reloading MPD for seek to', seekTo);

            seekTs.current = curTs.current = seekTo;

            video.pause();
            reloadDashPlayer(base_link + `?t=${Math.floor(seekTs.current)}`);
            video.currentTime = 0;
            video.play();
        };

        const handleTimeUpdate = () => {
            const video = videoRef.current;
            if (!video) return;
            setRealTime(seekTs.current + video.currentTime);
        };

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const video = videoRef.current;
            if (!video) return;

            if (e.key === 'ArrowLeft') {
                video.currentTime = Math.max(0, video.currentTime - 10);
            } else if (e.key === 'ArrowRight') {
                video.currentTime += 10;
            }
        };

        video.addEventListener('seeking', handleSeeking);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            video.removeEventListener('seeking', handleSeeking);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
            dashPlayerRef.current?.reset();
        };
    }, []);

    const handleCustomSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newRealTime = parseFloat(e.target.value);

        const newOffset = newRealTime - seekTs.current;
        if (newOffset >= 0 && newOffset <= video.duration) {
            video.currentTime = newOffset;
        } else {
            seekTs.current = newRealTime;
            video.pause();
            reloadDashPlayer(base_link + `?t=${Math.floor(seekTs.current)}`);
            video.currentTime = 0;
            video.play();
        }
    };

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                backgroundColor: 'black',
            }}
        >
            <video
                ref={videoRef}
                controls={false}
                autoPlay
                preload="auto"
                style={{ width: '100%', height: 'auto', display: 'block' }}
            />

            {/* Controls Overlay */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <button onClick={togglePlayPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button onClick={toggleFullscreen}>
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>

                <input
                    type="range"
                    min={0}
                    max={movieDuration}
                    value={realTime}
                    onChange={handleCustomSeek}
                    style={{ flexGrow: 1 }}
                />
            </div>

            <div
                style={{
                    position: 'absolute',
                    bottom: 40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'white',
                    fontSize: '14px',
                }}
            >
                {formatTime(realTime)} / {formatTime(movieDuration)}
            </div>
        </div>
    );
}

function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const hDisplay = `${hours}:`;
    const mDisplay = `${minutes}`.padStart(2, '0') + ':';
    const sDisplay = `${secs}`.padStart(2, '0');

    return hDisplay + mDisplay + sDisplay;
}

