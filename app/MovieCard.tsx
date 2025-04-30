"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BookmarkIcon, Star } from 'lucide-react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface MovieCardProps {
    poster_path: string
    title: string
    id: number
    vote_average: number
}

export function MovieCard({ poster_path, title, id, vote_average }: MovieCardProps) {
    const [saved, setSaved] = useState(false)
    const { toast } = useToast()
    const url = "https://image.tmdb.org/t/p/w500"

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Toggle saved state
        setSaved(!saved)

        // Show toast notification
        toast({
            title: saved ? "Removed from Watch Later" : "Saved to Watch Later",
            description: saved
                ? `${title} has been removed from your list`
                : `${title} has been added to your watch later list`,
            duration: 3000,
        })
        //TODO: Write saving logic here...
        // im thinking we store the props to the movie card as a list of objects in the databse
        // then we retrive them to prevent redundant calls to the tmdb api. if the image link dosent work,
        // then we request a new one to the database.

    }

    return (
        <Card className="overflow-hidden group transition-all duration-200 hover:shadow-lg">
            <Link href={`/movie/${id}`} className="block">
                <CardContent className="relative p-0">
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                            src={poster_path ? `${url}${poster_path}` : "/placeholder.svg"}
                            alt={`${title} poster`}
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
                <h3 className="font-medium text-sm truncate mr-2">{title}</h3>
                <Button
                    size="sm"
                    variant={saved ? "default" : "outline"}
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={handleSave}
                    title={saved ? "Remove from Watch Later" : "Save to Watch Later"}
                >
                    <BookmarkIcon className={`h-4 w-4 ${saved ? "text-white" : ""}`} fill={saved ? "currentColor" : "none"} />
                    <span className="sr-only">{saved ? "Remove from Watch Later" : "Save to Watch Later"}</span>
                </Button>
            </CardFooter>
        </Card>
    )
}

