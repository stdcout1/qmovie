"use server"

import { client } from "@/auth"

// Saves the current playback position for a video
export async function savePlaybackPosition(
    videoId: string,
    position: number,
    userId: string
) {
    if (!userId) {
        return { success: false, error: "User ID is required" }
    }

    try {
        await client.playbackPosition.upsert({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
            update: {
                position,
                updatedAt: new Date(),
            },
            create: {
                userId,
                videoId,
                position,
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to save playback position:", error)
        return { success: false, error: "Failed to save playback position" }
    }
}

// Retrieves the saved playback position for a video
export async function getPlaybackPosition(
    videoId: string,
    userId: string
) {
    if (!userId) {
        return { success: false, position: 0, error: "User ID is required" }
    }

    try {
        const savedPosition = await client.playbackPosition.findUnique({
            where: {
                userId_videoId: {
                    userId,
                    videoId,
                },
            },
        })

        return {
            success: true,
            position: savedPosition?.position || 0
        }
    } catch (error) {
        console.error("Failed to get playback position:", error)
        return { success: false, position: 0, error: "Failed to get playback position" }
    }
}

// Gets all videos a user has started watching but not finished
export async function getContinueWatchingList(userId: string, limit = 10) {
    try {
        const positions = await client.playbackPosition.findMany({
            where: {
                userId,
            },
            orderBy: {
                updatedAt: "desc",
            },
            take: limit,
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        })

        return {
            success: true,
            positions,
        }
    } catch (error) {
        console.error("Failed to get continue watching list:", error)
        return { success: false, positions: [], error: "Failed to get continue watching list" }
    }
}

