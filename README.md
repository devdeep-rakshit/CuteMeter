# CuteMeter 🎀

A playful, mobile-first cuteness meter with a live front-camera preview, countdown, score, compliments, photo preview, local download, and **explicitly initiated** Telegram sharing.

## Privacy and photo behavior

- Opening the page asks the browser for camera permission so the live preview can work.
- CuteMeter does **not** take photos automatically, run a background capture loop, or silently upload camera frames.
- Press **Take Photo** to create a single photo, then review its preview or download it.
- A photo is sent only after the user checks the consent box, enters the private send key, and presses **Send Photo to Telegram**.
- The Telegram bot token and chat ID are read by a server-side API function. They must never be placed in browser JavaScript or committed to Git.

## Live demo

GitHub Pages: https://devdeep-rakshit.github.io/cutemeter/

The GitHub Pages demo supports the camera preview, explicit capture, preview, and download. GitHub Pages serves static files only, so it cannot run the secure Telegram API function. Deploy the repository to Vercel to enable Telegram delivery.

## Enable Telegram delivery on Vercel

### 1. Revoke the exposed bot token

A bot token was previously present in public client-side JavaScript. Treat it as compromised even after removing it from the latest version, because old commits may still contain it.

1. Open Telegram and contact **@BotFather**.
2. Use **/revoke** and select the affected bot to invalidate the old token.
3. Keep the newly issued token private. Do not paste it into any HTML or JavaScript file.

### 2. Deploy this repository to Vercel

1. Sign in to Vercel and import **devdeep-rakshit/cutemeter** from GitHub.
2. Keep the project root at the repository root. No frontend build step or third-party npm package is required.
3. Deploy the project. Vercel will serve the static frontend and the function at **/api/send-photo**.

### 3. Configure Vercel environment variables

In the Vercel project's **Settings → Environment Variables**, add these values for the environments where you will test and run the app:

- **TELEGRAM_BOT_TOKEN**: the newly issued token from @BotFather.
- **TELEGRAM_CHAT_ID**: the destination user's or group's chat ID. For a private chat, open the bot and send **/start** first; use the correct chat ID.
- **TELEGRAM_SEND_KEY**: a long private passphrase of at least 16 characters. This must not be committed to the repository. You will enter it in the photo panel when sending.

Redeploy after changing environment variables so the function receives the new values.

### 4. Test the full flow

1. Open the Vercel deployment over HTTPS and grant camera access.
2. Press **Take Photo** and check the preview.
3. Optional: press **Download Photo** to save it locally.
4. Check the consent box, enter the private send key, and press **Send Photo to Telegram**.
5. If delivery fails, read the on-page error. It distinguishes missing backend configuration, an incorrect send key, a bot-token rejection, and a missing/inaccessible chat.

## Troubleshooting

- **Telegram send is disabled on GitHub Pages:** expected. Use the Vercel deployment; GitHub Pages cannot run **/api/send-photo**.
- **Private send key is incorrect:** make the entered value exactly match **TELEGRAM_SEND_KEY** in Vercel.
- **Telegram says chat not found:** open the bot, send **/start**, and verify **TELEGRAM_CHAT_ID**.
- **Telegram rejects the token:** revoke the old exposed token with @BotFather, update **TELEGRAM_BOT_TOKEN**, and redeploy.
- **Camera will not start:** use HTTPS (or localhost during development), allow camera access in the browser, close other apps using the camera, and reload.

## Project structure

- **index.html**: accessible page structure and photo-consent controls.
- **css/**: responsive styling and animations.
- **js/camera.js**: camera initialization and user-triggered one-shot capture only.
- **js/app.js**: countdown, score, preview/download, and consent-based send flow.
- **api/send-photo.js**: server-side Telegram API call using Vercel environment variables.
