const SkeletonEditor = () => (
    <div className="min-h-screen flex flex-col">

        {/* Mirrors the sticky writer header */}
        <div className="sticky top-0 z-10 bg-base border-b border-border">
            <div className="page-wrapper h-14 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-4 w-14 rounded-sm" />
                    <span className="text-border select-none">|</span>
                    <div className="skeleton h-5 w-16 rounded-sm" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="skeleton h-3 w-12 rounded-sm" />
                    <div className="skeleton h-7 w-20 rounded-sm" />
                    <div className="skeleton h-7 w-20 rounded-sm" />
                </div>
            </div>
        </div>

        {/* Mirrors the reading-column form body */}
        <div className="flex-1 reading-column py-10 flex flex-col">

            {/* Banner image row */}
            <div className="flex items-center gap-2 py-2">
                <div className="skeleton w-3 h-3 rounded-sm shrink-0" />
                <div className="skeleton h-3 w-48 rounded-sm" />
            </div>

            <hr className="divider my-2" />

            {/* Title */}
            <div className="skeleton h-10 w-3/4 rounded-sm mt-1 mb-1" />

            <hr className="divider my-2" />

            {/* Toolbar + content area */}
            <div className="flex flex-col border border-border bg-white mt-1">
                <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-border">
                    {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="skeleton w-8 h-8 rounded-sm" />
                    ))}
                </div>
                <div className="p-5 flex flex-col gap-5">
                    {[1, 0.9, 0.75, 1, 0.85, 0.6, 1, 0.7].map((w, i) => (
                        <div
                            key={i}
                            className="skeleton h-4 rounded-sm"
                            style={{ width: `${w * 100}%` }}
                        />
                    ))}
                </div>
            </div>

        </div>
    </div>
)

export default SkeletonEditor
