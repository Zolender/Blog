const SkeletonAdminRow = () => {
    return (
        <>
            
            <div className="sm:hidden border border-border p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full skeleton shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                        <div className="h-3 skeleton w-32" />
                        <div className="h-2.5 skeleton w-48" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-2.5 skeleton w-28" />
                    <div className="h-7 skeleton w-20" />
                </div>
                <div className="h-7 skeleton w-24" />
            </div>

            <tr className="hidden sm:table-row bg-white">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full skeleton shrink-0" />
                        <div className="h-3 skeleton w-24" />
                    </div>
                </td>
                <td className="px-4 py-3"><div className="h-3 skeleton w-36" /></td>
                <td className="px-4 py-3"><div className="h-6 skeleton w-16" /></td>
                <td className="px-4 py-3"><div className="h-3 skeleton w-20" /></td>
                <td className="px-4 py-3"><div className="h-7 skeleton w-16" /></td>
            </tr>
        </>
    )
}

export default SkeletonAdminRow