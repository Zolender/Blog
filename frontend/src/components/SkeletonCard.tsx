const SkeletonCard = () => {
    return (
        <div className="card">
            <div className="w-full h-48 skeleton"/>
            <div className="p-5 flex flex-col gap-3">
                <div className="h-2 skeleton w-1/3"/>
                <div className="h-5 skeleton w-3/4"/>
                <div className="h-3 skeleton w-full"/>
                <div className="h-3 skeleton w-2/3"/>
                <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full skeleton"/>
                        <div className="h-3 skeleton w-20"/>
                    </div>
                    <div className="h-3 skeleton w-12"/>
                </div>
            </div>
        </div>
    );
}
 
export default SkeletonCard;