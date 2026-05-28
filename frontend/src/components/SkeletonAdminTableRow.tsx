const SkeletonAdminTableRow = () => (
    <tr className="bg-white">
        <td className="px-4 py-3">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full skeleton shrink-0" />
                <div className="h-3 skeleton w-24" />
            </div>
        </td>
        <td className="px-4 py-3"><div className="h-3 skeleton w-36" /></td>
        <td className="px-4 py-3"><div className="h-7 skeleton w-24" /></td>
        <td className="px-4 py-3"><div className="h-3 skeleton w-20" /></td>
        <td className="px-4 py-3"><div className="h-7 skeleton w-16" /></td>
    </tr>
)

export default SkeletonAdminTableRow