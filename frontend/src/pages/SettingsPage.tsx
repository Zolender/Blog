import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { setCredentials } from "../features/auth/authSlice"
import { usersApi } from "../api/users"
import { useToast } from "../components/Toast"

const pageVariants = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const SettingsPage = () => {
    const dispatch      = useAppDispatch()
    const { user }      = useAppSelector(state => state.auth)
    const { showToast } = useToast()

    const [bio, setBio]               = useState(user?.bio ?? "")
    const [profilePic, setProfilePic] = useState(user?.profile_pic ?? "")
    const [isLoading, setIsLoading]   = useState(false)
    const [error, setError]           = useState<string | null>(null)

    useEffect(() => {
        document.title = "Settings — Z-Tales"
        return () => { document.title = "Z-Tales" }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        try {
            const data = await usersApi.updateMe({
                bio: bio.trim() || undefined,
                profile_pic: profilePic.trim() || null,
            })
            const token = localStorage.getItem("token")!
            dispatch(setCredentials({ user: data.user, token }))
            showToast("Settings saved")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible">
            <div className="reading-column py-12">
                <h1 className="heading-section mb-8">Settings</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && <div className="error-banner">{error}</div>}

                    <div className="flex flex-col gap-1.5">
                        <label className="input-label" htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            placeholder="Tell readers a little about yourself..."
                            rows={4}
                            maxLength={300}
                            className="input-field resize-none"
                        />
                        <p className="meta-text text-right">{bio.length} / 300</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="input-label" htmlFor="profile-pic">
                            Profile picture URL
                        </label>
                        <input
                            id="profile-pic"
                            type="url"
                            value={profilePic}
                            onChange={e => setProfilePic(e.target.value)}
                            placeholder="https://..."
                            className="input-field"
                        />
                        {profilePic && (
                            <img
                                src={profilePic}
                                alt="Preview"
                                className="w-16 h-16 rounded-full object-cover mt-2"
                                onError={e => (e.currentTarget.style.display = "none")}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <p className="meta-text">
                            Signed in as <span className="text-primary font-medium">{user?.username}</span>
                        </p>
                        <button type="submit" disabled={isLoading} className="btn-primary">
                            {isLoading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
}

export default SettingsPage
