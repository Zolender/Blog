const SkeletonPost = () => {
    return (
        <div className="reading-column py-10 flex flex-col gap-8">

            {/* Banner */}
            <div className="w-full h-64 sm:h-80 skeleton" />

            {/* Title + author */}
            <div className="flex flex-col gap-4">
                <div className="h-9 skeleton w-3/4" />
                <div className="h-5 skeleton w-1/2" />

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton shrink-0" />
                    <div className="flex flex-col gap-1.5">
                        <div className="h-3 skeleton w-28" />
                        <div className="h-2.5 skeleton w-36" />
                    </div>
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Body lines */}
            <div className="flex flex-col gap-3">
                <div className="h-3 skeleton w-full" />
                <div className="h-3 skeleton w-full" />
                <div className="h-3 skeleton w-5/6" />
                <div className="h-3 skeleton w-full" />
                <div className="h-3 skeleton w-4/5" />
                <div className="h-3 skeleton w-full" />
                <div className="h-3 skeleton w-3/4" />
                <div className="h-3 skeleton w-full" />
                <div className="h-3 skeleton w-5/6" />
            </div>

            <div className="border-t border-border" />

            {/* Engagement row */}
            <div className="flex items-center gap-4">
                <div className="h-5 skeleton w-12" />
                <div className="h-5 skeleton w-12" />
            </div>

            <div className="border-t border-border" />

            {/* Comments heading */}
            <div className="flex flex-col gap-4">
                <div className="h-6 skeleton w-36" />
                <div className="h-24 skeleton w-full" />
            </div>
        </div>
    )
}

export default SkeletonPost