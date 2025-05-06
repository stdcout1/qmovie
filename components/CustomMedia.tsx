"use client"

import { useRef, useEffect, useState } from "react"
import dashjs from "dashjs"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, SkipBack, SkipForward, Settings, Check, ChevronLeft, X } from 'lucide-react'

export default function CustomPlayer(props: {
    link: string
    duration: number
    videoId: string
    initialPosition?: number
    onPositionChange?: (position: number) => void
}) {
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
    const positionReportIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [hasEverPlayed, setHasEverPlayed] = useState(false)
    const shouldReportPositionRef = useRef(false)
    const lastReportedPositionRef = useRef(0)

    // Settings menu state
    const [showSettings, setShowSettings] = useState(false)
    const [settingsView, setSettingsView] = useState<"main" | "quality" | "subtitles">("main")
    const [qualities, setQualities] = useState<{ bitrate: number; height: number; index: number }[]>([])
    const [currentQuality, setCurrentQuality] = useState<number | "auto">("auto")
    const [subtitles, setSubtitles] = useState<{ index: number; lang: string; label: string }[]>([])
    const [currentSubtitle, setCurrentSubtitle] = useState<number | "off">("off")

    // Safe wrapper for position reporting with debouncing
    const reportPosition = (position: number) => {
        if (!shouldReportPositionRef.current || !hasEverPlayed || isInitialLoad || position <= 0) {
            return
        }

        // Only report if position has changed by at least 2 seconds since last report
        // or if it's been more than 5 seconds since the last report
        const now = Date.now()
        const timeSinceLastReport = now - (lastReportedPositionRef.current || 0)
        const minReportInterval = 5000; // 5 seconds minimum between reports

        if (timeSinceLastReport >= minReportInterval) {
            if (props.onPositionChange) {
                console.log("Reporting position:", position);
                props.onPositionChange(position)
                lastReportedPositionRef.current = now
            }
        }
    }

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

    // Initialize with initial position if provided
    useEffect(() => {
        if (props.initialPosition && props.initialPosition > 0) {
            // If we have a saved position, set it
            seekTs.current = props.initialPosition

            // If the saved position is within 10 seconds of the end, start from beginning
            if (props.initialPosition >= props.duration - 10) {
                seekTs.current = 0
            }
        }
        setIsInitialLoad(false)
    }, [props.initialPosition, props.duration])

    // Enable position reporting after the first play event
    useEffect(() => {
        if (isPlaying && !hasEverPlayed) {
            setHasEverPlayed(true)
            // Wait a bit before enabling position reporting to avoid any initial events
            setTimeout(() => {
                shouldReportPositionRef.current = true
            }, 1000)
        }
    }, [isPlaying, hasEverPlayed])

    useEffect(() => {
        // Set up interval to report position every 5 seconds while playing
        if (isPlaying && hasEverPlayed) {
            // Clear any existing interval first
            if (positionReportIntervalRef.current) {
                clearInterval(positionReportIntervalRef.current)
            }

            positionReportIntervalRef.current = setInterval(() => {
                if (shouldReportPositionRef.current) {
                    reportPosition(realTime)
                }
            }, 5000)
        }

        return () => {
            if (positionReportIntervalRef.current) {
                clearInterval(positionReportIntervalRef.current)
            }
        }
    }, [isPlaying, realTime, hasEverPlayed])

    // Report position when component unmounts or user pauses
    useEffect(() => {
        // Only add the beforeunload listener if we're past initial load and have played
        if (isInitialLoad || !hasEverPlayed) return

        const handleBeforeUnload = () => {
            reportPosition(realTime)
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            // Report position on unmount, but only if we have a valid position
            reportPosition(realTime)
        }
    }, [realTime, isInitialLoad, hasEverPlayed])

    // Report position when user pauses
    useEffect(() => {
        // Only report position when transitioning from playing to paused (not on initial mount)
        if (!isPlaying && hasEverPlayed && !isInitialLoad) {
            reportPosition(realTime)
        }
    }, [isPlaying, realTime, isInitialLoad, hasEverPlayed])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Initialize with the saved position if available
        createDashPlayer(base_link + `?t=${Math.floor(seekTs.current)}`)

        // Get available qualities and subtitles once the player is initialized
        const handleStreamInitialized = () => {
            getAvailableQualities()
            getAvailableSubtitles()
        }

        if (dashPlayerRef.current) {
            dashPlayerRef.current.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, handleStreamInitialized)
        }

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

        const handlePlay = () => {
            setIsPlaying(true)
        }

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
                video.currentTime += 5
            } else if (e.key === " ") {
                togglePlayPause()
                e.preventDefault()
            } else if (e.key === "m") {
                toggleMute()
            } else if (e.key === "f") {
                toggleFullscreen()
            } else if (e.key === "Escape" && showSettings) {
                closeSettings()
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

            if (dashPlayerRef.current) {
                dashPlayerRef.current.off(dashjs.MediaPlayer.events.STREAM_INITIALIZED, handleStreamInitialized)
                dashPlayerRef.current.reset()
            }
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

        // Don't report position immediately after seeking
        // The regular interval will handle it
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
            if (isPlaying && !showSettings) {
                setShowControls(false)
            }
        }, 3000)
    }

    const handleMouseLeave = () => {
        if (isPlaying && !showSettings) {
            setShowControls(false)
        }
    }

    const toggleSettings = () => {
        setShowSettings(!showSettings)
        setSettingsView("main")
    }

    const closeSettings = () => {
        setShowSettings(false)
    }

    const getAvailableQualities = () => {
        if (!dashPlayerRef.current) return

        try {
            const bitrateInfo = dashPlayerRef.current.getBitrateInfoListFor("video")
            if (bitrateInfo && bitrateInfo.length > 0) {
                const qualityList = bitrateInfo.map((info, index) => ({
                    bitrate: info.bitrate,
                    height: info.height,
                    index: index,
                }))
                setQualities(qualityList)
            }
        } catch (e) {
            console.error("Error getting quality info:", e)
        }
    }

    const getAvailableSubtitles = () => {
        if (!dashPlayerRef.current) return

        try {
            const tracks = dashPlayerRef.current.getTracksFor("text")
            if (tracks && tracks.length > 0) {
                const subtitleList = tracks.map((track, index) => ({
                    index: index,
                    lang: track.lang || "unknown",
                    label: track.labels && track.labels.length > 0 ? track.labels[0].text : track.lang || "Unknown",
                }))
                setSubtitles(subtitleList)
            }
        } catch (e) {
            console.error("Error getting subtitle info:", e)
        }
    }

    const setQuality = (index: number | "auto") => {
        if (!dashPlayerRef.current) return

        try {
            if (index === "auto") {
                dashPlayerRef.current.setAutoSwitchQualityFor("video", true)
            } else {
                dashPlayerRef.current.setAutoSwitchQualityFor("video", false)
                dashPlayerRef.current.setQualityFor("video", index)
            }

            setCurrentQuality(index)
        } catch (e) {
            console.error("Error setting quality:", e)
        }
    }

    const setSubtitle = (index: number | "off") => {
        if (!dashPlayerRef.current) return

        try {
            if (index === "off") {
                dashPlayerRef.current.setTextTrack(-1)
            } else {
                dashPlayerRef.current.setTextTrack(index)
            }

            setCurrentSubtitle(index)
        } catch (e) {
            console.error("Error setting subtitle:", e)
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

            {/* Subtitles */}
            {currentSubtitle !== "off" && (
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                    <div className="bg-black/70 px-4 py-1 rounded text-white text-center max-w-[80%]">
                        <track kind="subtitles" src="" srcLang="en" label="English" />
                    </div>
                </div>
            )}

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

            {/* Settings Menu */}
            {showSettings && (
                <div className="absolute right-4 bottom-16 w-56 bg-black/90 border border-gray-700 rounded-md text-white shadow-lg z-10">
                    <div className="flex items-center justify-between p-2 border-b border-gray-700">
                        {settingsView !== "main" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 mr-1 text-white hover:bg-white/10 p-1.5"
                                onClick={() => setSettingsView("main")}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}
                        <span className="font-medium">
                            {settingsView === "main" ? "Settings" : settingsView === "quality" ? "Quality" : "Subtitles"}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/10 p-1.5"
                            onClick={closeSettings}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {settingsView === "main" && (
                        <div className="p-1">
                            <button
                                className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                onClick={() => setSettingsView("quality")}
                            >
                                <span>Quality</span>
                                <span className="text-sm text-gray-400">
                                    {currentQuality === "auto" ? "Auto" : qualities.find((q) => q.index === currentQuality)?.height + "p"}
                                </span>
                            </button>
                            <button
                                className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                onClick={() => setSettingsView("subtitles")}
                            >
                                <span>Subtitles</span>
                                <span className="text-sm text-gray-400">
                                    {currentSubtitle === "off" ? "Off" : subtitles.find((s) => s.index === currentSubtitle)?.label}
                                </span>
                            </button>
                        </div>
                    )}

                    {settingsView === "quality" && (
                        <div className="p-1 max-h-60 overflow-y-auto">
                            <button
                                className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                onClick={() => setQuality("auto")}
                            >
                                <span>Auto</span>
                                {currentQuality === "auto" && <Check className="h-4 w-4" />}
                            </button>
                            {qualities.map((quality) => (
                                <button
                                    key={quality.index}
                                    className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                    onClick={() => setQuality(quality.index)}
                                >
                                    <span>{quality.height}p</span>
                                    {currentQuality === quality.index && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {settingsView === "subtitles" && (
                        <div className="p-1 max-h-60 overflow-y-auto">
                            <button
                                className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                onClick={() => setSubtitle("off")}
                            >
                                <span>Off</span>
                                {currentSubtitle === "off" && <Check className="h-4 w-4" />}
                            </button>
                            {subtitles.map((subtitle) => (
                                <button
                                    key={subtitle.index}
                                    className="w-full flex justify-between items-center p-2 hover:bg-white/10 rounded"
                                    onClick={() => setSubtitle(subtitle.index)}
                                >
                                    <span>{subtitle.label}</span>
                                    {currentSubtitle === subtitle.index && <Check className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    )}
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 text-white ${showSettings ? "bg-white/20" : "hover:bg-white/10"}`}
                            onClick={toggleSettings}
                        >
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

