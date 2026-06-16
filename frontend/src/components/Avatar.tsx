import { getAvatarColor } from "../utils/formatting"

interface AvatarProps {
    username: string
    profilePic?: string | null
    size?: "sm" | "md"
}

const Avatar = ({ username, profilePic, size = "sm" }: AvatarProps) => {
    const sizeClass = size === "md" ? "avatar-md" : "avatar"

    if (profilePic) {
        return (
            <img
                src={profilePic}
                alt={username}
                className={`${sizeClass} object-cover`}
            />
        )
    }

    return (
        <div className={`${sizeClass} ${getAvatarColor(username)}`}>
            <span className="avatar-initial">{username.charAt(0).toUpperCase()}</span>
        </div>
    )
}

export default Avatar
