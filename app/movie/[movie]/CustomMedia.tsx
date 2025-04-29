"use client"

import { useRef, useEffect, useState } from "react"
import dashjs from "dashjs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, SkipBack, SkipForward, Settings } from "lucide-react"

export default function CustomPlayer(props: { link: string; duration: number }) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const dashPlayerRef = useRef<dashjs.MediaPlayerClass | null>(null)
    const seekTs = useRef(0)
    const curTs = useRef(0)
    const [realTime, setRealTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [movieDuration, setMovieDuration] = useState(props.duration)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const base_link = props.link

    const createDashPlayer = (mpdUrl: string) => {
        const video = videoRef.current
        if (!video) return

        const dashPlayer = dashjs.MediaPlayer().create()
        dashPlayer.initialize(video, mpdUrl, true)
        dashPlayerRef.current = dashPlayer
    }

    const reloadDashPlayer = (mpdUrl: string) => {
        const video = videoRef.current
        if (!video || !dashPlayerRef.current) return

        try {
            dashPlayerRef.current.reset()
            dashPlayerRef.current.attachView(video)
            dashPlayerRef.current.attachSource(mpdUrl)
        } catch (e) {
            console.error("Error while reloading dash player:", e)
        }
    }

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        createDashPlayer(base_link + `?t=0`)

        const handleSeeking = () => {
            const seekTo = video.currentTime + seekTs.current

            const foundInBuffer = false
            for (let i = 0; i < video.buffered.length; i++) {
                const start = video.buffered.start(i) + seekTs.current
                const end = video.buffered.end(i) + seekTs.current
                if (seekTo >= start && seekTo <= end) {
                    curTs.current = seekTo
                    console.log("Fast seek inside buffer to", seekTo)
                    return
                }
            }

            console.log("Reloading MPD for seek to", seekTo)

            seekTs.current = curTs.current = seekTo

            video.pause()
            reloadDashPlayer(base_link + `?t=${Math.floor(seekTs.current)}`)
            video.currentTime = 0
            video.play()
        }

        const handleTimeUpdate = () => {
            const video = videoRef.current
            if (!video) return
            setRealTime(seekTs.current + video.currentTime)
        }

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            const video = videoRef.current
            if (!video) return

            if (e.key === "ArrowLeft") {
                video.currentTime = Math.max(0, video.currentTime - 10)
            } else if (e.key === "ArrowRight") {
                video.currentTime += 10
            } else if (e.key === " ") {
                togglePlayPause()
                e.preventDefault()
            } else if (e.key === "m") {
                toggleMute()
            } else if (e.key === "f") {
                toggleFullscreen()
            }
        }

        video.addEventListener("seeking", handleSeeking)
        video.addEventListener("timeupdate", handleTimeUpdate)
        video.addEventListener("play", handlePlay)
        video.addEventListener("pause", handlePause)
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        window.addEventListener("keydown", handleKeyDown)

        return () => {
            video.removeEventListener("seeking", handleSeeking)
            video.removeEventListener("timeupdate", handleTimeUpdate)
            video.removeEventListener("play", handlePlay)
            video.removeEventListener("pause", handlePause)
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
            window.removeEventListener("keydown", handleKeyDown)
            dashPlayerRef.current?.reset()
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.volume = volume
        video.muted = isMuted
    }, [volume, isMuted])

    const handleCustomSeek = (value: number[]) => {
        const video = videoRef.current
        if (!video) return

        const newRealTime = value[0]

        const newOffset = newRealTime - seekTs.current
        if (newOffset >= 0 && newOffset <= video.duration) {
            video.currentTime = newOffset
        } else {
            seekTs.current = newRealTime
            video.pause()
            reloadDashPlayer(base_link + `?t=${Math.floor(seekTs.current)}`)
            video.currentTime = 0
            video.play()
        }
    }

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0])
        if (value[0] === 0) {
            setIsMuted(true)
        } else if (isMuted) {
            setIsMuted(false)
        }
    }

    const togglePlayPause = () => {
        const video = videoRef.current
        if (!video) return

        if (isPlaying) {
            video.pause()
        } else {
            video.play()
        }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    const toggleFullscreen = () => {
        const container = containerRef.current
        if (!container) return

        if (document.fullscreenElement) {
            document.exitFullscreen()
        } else {
            container.requestFullscreen()
        }
    }

    const skipBackward = () => {
        const video = videoRef.current
        if (!video) return
        video.currentTime = Math.max(0, video.currentTime - 10)
    }

    const skipForward = () => {
        const video = videoRef.current
        if (!video) return
        video.currentTime += 10
    }

    const handleMouseMove = () => {
        setShowControls(true)

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
            }
        }, 3000)
    }

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false)
        }
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full bg-black overflow-hidden rounded-lg ${isFullscreen ? "h-screen" : "aspect-video"}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                controls={false}
                autoPlay
                preload="auto"
                onClick={togglePlayPause}
            />

            {/* Play/Pause Overlay Button (center of video) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-20 h-20 rounded-full bg-black/30 hover:bg-black/50 text-white"
                        onClick={togglePlayPause}
                    >
                        <Play className="w-10 h-10 fill-white" />
                    </Button>
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-2 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
            >
                {/* Progress Bar */}
                <div className="mb-2">
                    <Slider
                        value={[realTime]}
                        min={0}
                        max={movieDuration}
                        step={0.1}
                        onValueChange={handleCustomSeek}
                        className="[&>span:first-child]:h-1.5 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-white"
                    />
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={skipBackward}>
                            <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-white hover:bg-white/10"
                            onClick={togglePlayPause}
                        >
                            {isPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
                        </Button>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={skipForward}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Time Display */}
                    <div className="text-white text-sm ml-2">
                        {formatTime(realTime)} / {formatTime(movieDuration)}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center ml-auto">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={toggleMute}>
                            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>

                        <div className="w-24 mx-2">
                            <Slider
                                value={[isMuted ? 0 : volume]}
                                min={0}
                                max={1}
                                step={0.01}
                                onValueChange={handleVolumeChange}
                                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-2.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-white"
                            />
                        </div>
                    </div>

                    {/* Settings & Fullscreen */}
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
                            <Settings className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/10"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const hDisplay = hours > 0 ? `${hours}:` : ""
    const mDisplay = `${minutes}`.padStart(2, "0") + ":"
    const sDisplay = `${secs}`.padStart(2, "0")

    return hDisplay + mDisplay + sDisplay
}

