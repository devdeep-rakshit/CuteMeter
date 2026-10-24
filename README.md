# CuteMeter 🎀

A pastel, mobile-first camera web app with a playful simulated cuteness/flirt score and optional Telegram image-stream testing.

## Behavior
- The score is randomly simulated for entertainment; it does not analyze facial features or measure attractiveness.
- Start CuteMeter to activate the camera and rotating compliments.
- If a Telegram bot token and chat ID are supplied before starting, camera frames are automatically sent to that chat at a target rate of 2 per second.
- Press Stop session to stop automation and release camera tracks.
- Camera access requires browser permission and HTTPS or localhost.

## Testing note
This is a frontend-only Telegram integration. A bot token entered in the browser can be exposed through source code or network inspection. Use a disposable test bot and rotate/revoke its token after testing.
