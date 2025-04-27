// commands/autolike.js
async function autoLikeStatus(sock) {
    try {
        const chats = await sock.fetchStatusUpdates(); // Get recent statuses
        for (const chat of chats) {
            if (chat.id.startsWith('status@broadcast') && chat.statuses) {
                for (const status of chat.statuses) {
                    await sock.sendReaction(status.key.remoteJid, status.key.id, '❤️');
                    console.log(`Reacted 😈 to status from ${status.key.remoteJid}`);
                }
            }
        }
    } catch (err) {
        console.error('Failed to auto-like status:', err);
    }
}

module.exports = autoLikeStatus;
