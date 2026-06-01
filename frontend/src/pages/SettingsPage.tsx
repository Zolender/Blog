import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { setCredentials } from "../features/auth/authSlice"
import { usersApi } from "../api/users"
import { useToast } from "../components/Toast"
import { getAvatarColor } from "../utils/formatting"

const pageVariants = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const SettingsPage = () => {
    const dispatch      = useAppDispatch()
    const navigate      = useNavigate()
    const { user }      = useAppSelector(state => state.auth)
    const { showToast } = useToast()

    const [bio, setBio]               = useState(user?.bio ?? "")
    const [profilePic, setProfilePic] = useState(user?.profile_pic ?? "")
    const [avatarBroken, setAvatarBroken] = useState(false)
    const [isLoading, setIsLoading]   = useState(false)
    const [error, setError]           = useState<string | null>(null)

    // Reset broken flag each time the URL changes so each new value gets a fresh attempt
    useEffect(() => { setAvatarBroken(false) }, [profilePic])

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

    const showAvatar = Boolean(profilePic && !avatarBroken)

    return (
        <motion.div variants={pageVariants} initial="hidden" animate="visible">
            <div className="reading-column py-12">

                {/* Back navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs mb-8"
                >
                    <ArrowLeft size={13} />
                    Back
                </button>

                <h1 className="heading-section mb-8">Settings</h1>

                {/* Live avatar preview — shows the current/entered pic */}
                <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(user?.username ?? "")}`}>
                        {showAvatar ? (
                            <img
                                src={profilePic}
                                alt={user?.username ?? "Avatar"}
                                className="w-full h-full rounded-full object-cover"
                                onError={() => setAvatarBroken(true)}
                            />
                        ) : (
                            <span className="text-white font-sans text-2xl font-semibold select-none">
                                {(user?.username ?? "?").charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <p className="font-sans text-sm font-medium text-primary truncate">{user?.username}</p>
                        <p className="meta-text truncate">{user?.email}</p>
                        {user?.username && (
                            <Link
                                to={`/users/${user.username}`}
                                className="meta-text inline-flex items-center gap-1 hover:text-primary transition-colors duration-150 mt-0.5"
                            >
                                <ExternalLink size={11} />
                                View profile
                            </Link>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {error && <div className="error-banner" role="alert">{error}</div>}

                    <div className="flex flex-col gap-1.5">
                        <label className="input-label" htmlFor="bio">Bio <span className="meta-text font-normal normal-case tracking-normal">— optional</span></label>
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
                            Profile picture URL <span className="meta-text font-normal normal-case tracking-normal">— optional</span>
                        </label>
                        <input
                            id="profile-pic"
                            type="url"
                            value={profilePic}
                            onChange={e => setProfilePic(e.target.value)}
                            placeholder="https://..."
                            className="input-field"
                        />
                        <p className="meta-text">
                            Paste a direct image URL — the avatar preview above updates live.
                        </p>
                    </div>

                    <div className="flex items-center justify-end pt-2">
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
