"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookmarkIcon, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useSavedItems } from "@/app/saved-item-context"
import { saveTVShow } from "@/app/actions/save-actions"

interface TVFavoriteButtonProps {
    tvShowId: number
    name: string
    posterPath: string | null
    voteAverage: number
}

export function TVFavoriteButton({ tvShowId, name, posterPath, voteAverage }: TVFavoriteButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { isTVShowSaved, addSavedTVShow, removeSavedTVShow, refreshSavedItems } = useSavedItems()

    const isSaved = isTVShowSaved(tvShowId)

    const handleToggleFavorite = async () => {
        setIsLoading(true)

        try {
            const result = await saveTVShow({
                id: tvShowId,
                name,
                poster_path: posterPath || "",
                vote_average: voteAverage,
            })

            if (result.success) {
                // Update local state immediately for better UX
                if (result.saved) {
                    addSavedTVShow({
                        tvShowId,
                        name,
                        posterPath,
                        voteAverage,
                    })
                } else {
                    removeSavedTVShow(tvShowId)
                }

                // Refresh saved items to ensure consistency with server
                refreshSavedItems()

                toast({
                    title: result.saved ? "Added to Favorites" : "Removed from Favorites",
                    description: result.saved
                        ? `${name} has been added to your favorites`
                        : `${name} has been removed from your favorites`,
                    duration: 3000,
                })
            } else {
                toast({
                    title: "Error",
                    description: result.message,
                    variant: "destructive",
                    duration: 3000,
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update favorites",
                variant: "destructive",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            variant={isSaved ? "default" : "outline"}
            size="lg"
            className="min-w-[120px]"
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                    <BookmarkIcon className={`h-5 w-5 mr-2 ${isSaved ? "fill-white" : ""}`} />
                    {isSaved ? "Favorited" : "Favorite"}
                </>
            )}
        </Button>
    )
}


