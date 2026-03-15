const timeouts = new Map<string, number>();

export function setMemberTimeout(userId: string) {
    const expiresAt = Date.now() + 60 * 1000; // 1분
    timeouts.set(userId, expiresAt);
}

export function isMemberTimedOut(userId: string): { timedOut: boolean; remaining?: number } {
    const expiresAt = timeouts.get(userId);
    if (!expiresAt) return { timedOut: false };

    if (Date.now() > expiresAt) {
        timeouts.delete(userId);
        return { timedOut: false };
    }

    return { timedOut: true, remaining: Math.ceil((expiresAt - Date.now()) / 1000) };
}
