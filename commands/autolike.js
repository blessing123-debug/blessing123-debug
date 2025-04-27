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
        // Debug: Log the triggering of the command
        console.log('autoLikeCommand triggered');

        // Check if sender is the owner
        if (!isOwner(senderId)) {
            console.log('Not owner, exiting'); // Debug log for owner check
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
            console.log(`Current auto like status: ${status}`); // Debug log for status
            await sock.sendMessage(chatId, { 
                text: `🔄 *Auto Like*\n\nCurrent status: ${status}\n\nUse:\n.autolike on - Enable auto like\n.autolike off - Disable auto like`,
            });
            return;
        }

        // Handle on/off commands
        const command = args[0].toLowerCase();
        console.log(`Received command: ${command}`); // Debug log for command

        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config));
            console.log('Auto like enabled'); // Debug log for enabling
            await sock.sendMessage(chatId, { 
                text: '✅ Auto like has been enabled!',
            });
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config));
            console.log('Auto like disabled'); // Debug log for disabling
            await sock.sendMessage(chatId, { 
                text: '❌ Auto like has been disabled!',
            });
        } else {
            console.log('Invalid command received'); // Debug log for invalid command
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid command! Use:\n.autolike on - Enable auto like\n.autolike off - Disable auto like',
            });
        }
    } catch (error) {
        console.error('Error in auto like command:', error); // Error logging
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
        console.error('Error checking auto like config:', error); // Error logging
        return false;
    }
}

// Function to handle auto like logic (example: on status updates or reactions)
async function handleAutoLike(sock, message) {
    try {
        if (!isAutoLikeEnabled()) {
            console.log('Auto like is disabled, exiting'); // Debug log
            return;
        }

        // Simplified check for a status message type
        if (message && message.type === 'status') {
            console.log('Auto liking status message'); // Debug log
            await sock.sendMessage(message.chatId, { text: '❤️ Liked your status!' });
        }

    } catch (error) {
        console.error('Error in auto like:', error.message); // Error logging
    }
}

module.exports = {
    autoLikeCommand,
    handleAutoLike
};
