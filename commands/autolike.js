const fs = require('fs');
const path = require('path');
const isOwner = require('../lib/isOwner'); // Ensure this is the correct import for checking if the user is the owner

// Path to store auto-like configuration
const configPath = path.join(__dirname, '../data/autoLike.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ enabled: false }));
}

// The autoLike command function
async function autoLikeCommand(sock, chatId, senderId, args) {
    try {
        // Check if sender is the owner
        if (!isOwner(senderId)) {
            await sock.sendMessage(chatId, { 
                text: '❌ This command can only be used by the owner!' 
            });
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Like*\n\nCurrent status: ${status}\n\nUse:\n.autolike on - Enable auto like\n.autolike off - Disable auto like`,
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '✅ Auto like has been enabled!',
            });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            await sock.sendMessage(chatId, { 
                text: '❌ Auto like has been disabled!',
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid command! Use:\n.autolike on - Enable auto like\n.autolike off - Disable auto like',
            });
        }
    } catch (error) {
        console.error('Error in auto like command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Error occurred while managing auto like!\n' + error.message,
        });
    }
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

// Function to handle auto like logic (example: on status updates or reactions)
async function handleAutoLike(sock, message) {
    try {
        if (!isAutoLikeEnabled()) {
            return;
        }

        // You can modify the conditions here based on your bot's logic for auto-liking
        if (message && message.type === 'status') {
            // Automatically like the status message
            await sock.sendMessage(message.chatId, { text: '❤️ Liked your status!' });
            console.log('✅ Liked the status');
        }

    } catch (error) {
        console.error('Error in auto like:', error.message);
    }
}

module.exports = {
    autoLikeCommand,
    handleAutoLike
};



