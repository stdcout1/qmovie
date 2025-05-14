import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="relative min-h-screen">
            {/* Backdrop skeleton */}
            <div className="absolute inset-0 z-0">
                <Skeleton className="w-full h-full" />
            </div>

            {/* Main content skeleton */}
            <div className="relative z-10 pt-16 pb-24 container mx-auto">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Poster skeleton */}
                    <div className="hidden lg:block flex-shrink-0 rounded-lg overflow-hidden">
                        <Skeleton className="w-[300px] h-[450px]" />
                    </div>

                    {/* Movie details skeleton */}
                    <div className="flex-1 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <div>
                                <Skeleton className="h-10 w-64 mb-2" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>

                        {/* Mobile poster skeleton */}
                        <div className="block lg:hidden mx-auto max-w-xs rounded-lg overflow-hidden">
                            <Skeleton className="w-full aspect-[2/3]" />
                        </div>

                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-32" />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-24" />
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <Skeleton key={i} className="h-6 w-20" />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Movies skeleton */}
            <div className="relative z-10 container mx-auto px-4 pb-16">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="aspect-[2/3] w-full rounded-md" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

