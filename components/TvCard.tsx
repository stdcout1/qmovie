"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookmarkIcon, Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { saveTVShow } from "@/app/actions/save-actions"
import { useSavedItems } from "@/app/saved-item-context"

interface TVCardProps {
    poster_path: string
    name: string
    id: number
    vote_average: number
    isLoggedIn?: boolean
}

export function TVCard({ poster_path, name, id, vote_average, isLoggedIn = false }: TVCardProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const { isTVShowSaved, addSavedTVShow, removeSavedTVShow, refreshSavedItems } = useSavedItems()
    const url = "https://image.tmdb.org/t/p/w500"

    const saved = isTVShowSaved(id)

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isLoggedIn) {
            toast({
                title: "Login Required",
                description: "Please log in to save TV shows to your watch list",
                variant: "destructive",
                duration: 3000,
            })
            return
        }

        setIsLoading(true)

        try {
            const result = await saveTVShow({
                id,
                name,
                poster_path,
                vote_average,
            })

            if (result.success) {
                // Update local state immediately for better UX
                if (result.saved) {
                    addSavedTVShow({
                        tvShowId: id,
                        name,
                        posterPath: poster_path,
                        voteAverage: vote_average,
                    })
                } else {
                    removeSavedTVShow(id)
                }

                // Refresh saved items to ensure consistency with server
                refreshSavedItems()

                toast({
                    title: result.saved ? "Saved to Watch Later" : "Removed from Watch Later",
                    description: result.saved
                        ? `${name} has been added to your watch later list`
                        : `${name} has been removed from your list`,
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
                description: "Failed to update your watch list",
                variant: "destructive",
                duration: 3000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden group transition-all duration-200 hover:shadow-lg">
            <Link href={`/tv/${id}`} className="block">
                <CardContent className="relative p-0">
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                            src={poster_path ? `${url}${poster_path}` : "/placeholder.svg"}
                            alt={`${name} poster`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        />
                    </div>
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm font-medium">{vote_average.toFixed(1)}</span>
                    </div>
                </CardContent>
            </Link>
            <CardFooter className="p-2 flex justify-between items-center bg-card">
                <h3 className="font-medium text-sm truncate mr-2">{name}</h3>
                {isLoggedIn && (
                    <Button
                        size="sm"
                        variant={saved ? "default" : "outline"}
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={handleSave}
                        disabled={isLoading}
                        title={saved ? "Remove from Watch Later" : "Save to Watch Later"}
                    >
                        <BookmarkIcon className={`h-4 w-4 ${saved ? "text-white" : ""}`} fill={saved ? "currentColor" : "none"} />
                        <span className="sr-only">{saved ? "Remove from Watch Later" : "Save to Watch Later"}</span>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

