const fs = require('fs');
const path = require('path');

// Path to store auto like configuration
const configPath = path.join(__dirname, '../data/autoLike.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

// Function to check if auto like is enabled
function isAutoLikeEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto like config:', error);
        return false;
    }
}

// Auto-Like Command (Enable/Disable)
async function autoLikeCommand(sock, chatId, senderId, args) {
    try {
        // Check if sender is the bot owner (adjust this as per your bot's owner check logic)
        if (senderId !== 'your-owner-id') {
            await sock.sendMessage(chatId, { text: '❌ This command can only be used by the owner!' });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Like View*\n\nCurrent status: ${status}\n\nUse:\n.autolike on - Enable auto like\n.autolike off - Disable auto like` 
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '✅ Auto like is now enabled!' });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { text: '❌ Auto like is now disabled!' });
        } else {
            await sock.sendMessage(chatId, { text: '❌ Invalid command! Use:\n.autolike on - Enable auto like\n.autolike off - Disable auto like' });
        }
    } catch (error) {
        console.error('Error in autolike command:', error);
        await sock.sendMessage(chatId, { text: '❌ Error occurred while managing auto like!' });
    }
}

// Handle status updates and auto like
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoLikeEnabled()) {
            return; // Auto like is off, so don't proceed
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Handle status updates
        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                const sender = status.key.participant || status.key.remoteJid;
                console.log(`✅ Liked status from: ${sender.split('@')[0]}`);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('⚠️ Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }
    } catch (error) {
        console.error('❌ Error in auto like:', error.message);
    }
}

module.exports = {
    autoLikeCommand,
    handleStatusUpdate
};


