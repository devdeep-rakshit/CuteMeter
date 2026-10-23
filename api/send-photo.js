const { timingSafeEqual } = require("node:crypto");

const MAX_BASE64_LENGTH = 3500000;
const MAX_PHOTO_BYTES = 2600000;

function jsonError(res, status, error) {
    return res.status(status).json({ ok: false, error: error });
}

function matchesSecret(received, expected) {
    if (typeof received !== "string" || typeof expected !== "string" || !received || !expected) return false;
    const receivedBuffer = Buffer.from(received, "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (receivedBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(receivedBuffer, expectedBuffer);
}

module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return jsonError(res, 405, "Use POST to send a selected photo.");
    }

    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin && host) {
        try {
            if (new URL(origin).host !== host) {
                return jsonError(res, 403, "Cross-origin requests are not allowed.");
            }
        } catch (_) {
            return jsonError(res, 403, "The request origin is invalid.");
        }
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const sendKey = process.env.TELEGRAM_SEND_KEY;

    if (!botToken || !chatId || !sendKey || sendKey.length < 16) {
        return jsonError(res, 503, "Telegram backend is not configured. Add TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, and a TELEGRAM_SEND_KEY of at least 16 characters in Vercel, then redeploy.");
    }

    let body = req.body;
    if (typeof body === "string") {
        try {
            body = JSON.parse(body);
        } catch (_) {
            return jsonError(res, 400, "The request body is not valid JSON.");
        }
    }

    if (!body || typeof body !== "object") {
        return jsonError(res, 400, "A photo is required.");
    }

    if (!matchesSecret(body.sendKey, sendKey)) {
        return jsonError(res, 401, "The private send key is incorrect.");
    }

    if (typeof body.imageData !== "string" || body.imageData.length > MAX_BASE64_LENGTH + 40) {
        return jsonError(res, 413, "The photo is too large. Retake it and try again.");
    }

    const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(body.imageData);
    if (!match) {
        return jsonError(res, 400, "The selected image must be a JPEG or PNG photo.");
    }

    const base64 = match[2].replace(/\s/g, "");
    if (base64.length > MAX_BASE64_LENGTH) {
        return jsonError(res, 413, "The photo is too large. Retake it and try again.");
    }

    const photoBuffer = Buffer.from(base64, "base64");
    if (!photoBuffer.length || photoBuffer.length > MAX_PHOTO_BYTES ||
        photoBuffer.toString("base64").replace(/=+$/, "") !== base64.replace(/=+$/, "")) {
        return jsonError(res, 400, "The photo data is empty, too large, or invalid. Please take another photo.");
    }

    try {
        const mimeType = match[1] === "png" ? "image/png" : "image/jpeg";
        const extension = match[1] === "png" ? "png" : "jpg";
        const form = new FormData();
        form.append("chat_id", chatId);
        form.append("caption", "CuteMeter photo, sent after the user's explicit confirmation.");
        form.append("photo", new Blob([photoBuffer], { type: mimeType }), "cutemeter-photo." + extension);

        const telegramResponse = await fetch("https://api.telegram.org/bot" + botToken + "/sendPhoto", {
            method: "POST",
            body: form
        });

        let telegramResult = {};
        try {
            telegramResult = await telegramResponse.json();
        } catch (_) {
            telegramResult = {};
        }

        if (!telegramResponse.ok || telegramResult.ok !== true) {
            const description = typeof telegramResult.description === "string" ? telegramResult.description : "";
            if (telegramResponse.status === 401) {
                return jsonError(res, 502, "Telegram rejected the bot token. Revoke any exposed token in @BotFather and add the new token to Vercel.");
            }
            if (telegramResponse.status === 429) {
                return jsonError(res, 429, "Telegram is rate-limiting the bot. Wait a little and retry.");
            }
            if (/chat not found/i.test(description)) {
                return jsonError(res, 502, "Telegram could not find this chat. Open the bot in Telegram, send /start, and verify TELEGRAM_CHAT_ID in Vercel.");
            }
            if (/bot was blocked|bot can't initiate|bot is not a member/i.test(description)) {
                return jsonError(res, 502, "The bot cannot message this chat yet. Open the bot and send /start, or check its membership and permissions.");
            }
            return jsonError(res, 502, "Telegram rejected the photo" + (description ? ": " + description.slice(0, 180) : ". Check the bot token, chat ID, and image size."));
        }

        return res.status(200).json({ ok: true, message: "Photo sent successfully to Telegram. 💌" });
    } catch (_) {
        return jsonError(res, 502, "Could not reach Telegram. Check your connection and try again.");
    }
};
