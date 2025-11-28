import React, { useState, useMemo } from 'react';
import { User as UserIcon } from 'lucide-react';

const formatAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) {
        return avatar;
    }
    if (avatar.startsWith('/')) {
        return avatar;
    }
    return `/storage/${avatar}`;
};

export default function UserAvatar({
    user,
    size = 40,
    className = '',
    showInitials = true,
    iconSize = 18,
}) {
    const [hasError, setHasError] = useState(false);
    const avatarUrl = useMemo(() => {
        if (!user?.avatar || hasError) {
            return null;
        }
        return formatAvatarUrl(user.avatar);
    }, [user?.avatar, hasError]);

    const initials = useMemo(() => {
        if (!showInitials || !user?.name) return null;
        const parts = user.name.trim().split(' ');
        const firstTwo = parts.slice(0, 2).map(part => part.charAt(0).toUpperCase());
        return firstTwo.join('');
    }, [user?.name, showInitials]);

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-primary-600 text-white flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={user?.name || 'User avatar'}
                    className="w-full h-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : initials ? (
                <span className="text-sm font-semibold">{initials}</span>
            ) : (
                <UserIcon className="text-white" size={iconSize} />
            )}
        </div>
    );
}

