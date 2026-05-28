const SkeletonAdminCard = () => (
    <div className="border border-border p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full skeleton shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3 skeleton w-32" />
                <div className="h-2.5 skeleton w-48" />
            </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="h-7 skeleton w-24" />
            <div className="h-7 skeleton w-16" />
        </div>
    </div>
)

export default SkeletonAdminCard