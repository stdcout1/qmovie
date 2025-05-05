'use client'
import CustomPlayer from "@/components/CustomMedia"
import { savePlaybackPosition } from "@/app/actions/video-playback"
import { useState } from "react"
export function MoviePlayerClient({ videoId, userId, link, duration, initialPosition }) {
    const [currentPosition, setCurrentPosition] = useState(initialPosition || 0)

    const handlePositionChange = async (position) => {
        setCurrentPosition(position)
        await savePlaybackPosition(videoId, position, userId)
    }

    return (
        <CustomPlayer
            videoId={videoId}
            link={link}
            duration={duration}
            initialPosition={initialPosition}
            onPositionChange={handlePositionChange}
        />
    )
}


