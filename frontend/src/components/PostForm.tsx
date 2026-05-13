import { useState, type SubmitEvent } from "react"


interface PostFormValues {
    title: string
    content: string
    banner_image: string
}

interface PostFormProps{
    initialValues?: Partial<PostFormValues>
    onSubmit: (values: PostFormValues)=> Promise<void>
    submitLabel: string
    isLoading: boolean
    error: string | null
}


const PostForm = ({initialValues, onSubmit, submitLabel, isLoading, error}: PostFormProps) => {
    const [title, setTitle] = useState(initialValues?.title??"")
    const [content, setContent] = useState(initialValues?.content?? "")
    const [banner_image, setBanner_image] = useState(initialValues?.banner_image??"")

    const handleSubmit = async (e: SubmitEvent)=>{
        e.preventDefault()
        await onSubmit({title, content, banner_image})
    }
    
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">{error}</div>
            )}
            <div className="flex flex-col gap-1">
                <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
                <input 
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e)=> setTitle(e.target.value)}
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="banner_image" className="text-sm font-medium text-gray-700">
                    Banner image URL
                    <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                </label>
                <input 
                    type="url"
                    id="banner_image"
                    required
                    value={banner_image}
                    onChange={(e)=> setBanner_image(e.target.value)}
                    placeholder="https://..."
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor="content" className="text-sm font-medium text-gray-700">Content</label>
                <textarea 
                    id="content"
                    required
                    rows={12}
                    value={content}
                    onChange={(e)=> setContent(e.target.value)}
                    className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button className="self-start px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading} type="submit">{isLoading? "Saving": submitLabel}</button>
        </form>
    );
}
 
export default PostForm;