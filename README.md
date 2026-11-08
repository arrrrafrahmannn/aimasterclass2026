# AI MASTERCLASS — EKTU AI

A premium static form website for the ৳299 AI Masterclass. Students submit their full name, bKash transaction ID, and WhatsApp number. Google Apps Script records them directly in a private Google Sheet. EKTU AI verifies payments and contacts learners manually on WhatsApp within 12 hours.

No student accounts, separate database, admin dashboard, paid payment integration, or separate application server are required. The Google Sheet is the management interface. The site includes 10,000 animated gold light trails on desktop, a mobile particle budget, and reduced-motion support.

## Run

Use Node 22.13 or newer. Run `npm install`, `npm run dev`, and `npm run build`. The deployable website is the `dist/` folder. The configured asset base is `/aimasterclass2026/`; set `base: '/'` in `vite.config.ts` for hosting at a domain root.

## Connect the Sheet

1. Open your private Sheet and choose **Extensions → Apps Script**.
2. Paste `integrations/GoogleSheets.gs` and save.
3. Run `initializeSheet` once and authorize it in your Google account.
4. Deploy as a **Web app**, executing as **Me**, with access set to **Anyone**. Your Sheet itself stays **Restricted**. The script only accepts submissions and never returns student records.
5. Copy the deployed Web app URL ending in `/exec`.
6. Paste that URL into `public/enrollment-config.json`. Set `enrollmentOpen` to `true` after checking the connection.
7. Build and redeploy. Test that a clearly labeled test submission appears in the Sheet and that success is shown only after Google acknowledges the save. Do not send a real payment for testing. Delete the test row afterward.

No password, API key, or shared secret belongs in browser code. A public form endpoint is expected to be public. Server-side validation, a honeypot, per-number submission limits, a write lock, and duplicate transaction checks provide basic abuse protection. Larger-volume sites may need additional bot protection.

The form remains closed until a valid Apps Script URL is configured. Payment submissions are always Pending. Payment verification never occurs automatically. All confirmations and live class information are sent manually through WhatsApp.

## Google Sheet columns

Reference, submission time in Dhaka, full name, WhatsApp number, transaction ID, amount, payment status, WhatsApp confirmation sent, and notes. Update verification/contact statuses directly in the Sheet.

## Hosting

This is a static website. The built folder can run on static hosting without a Node server. GitHub stores the entire source and the included workflow builds a downloadable site artifact. GitHub Pages has restrictions on sites primarily facilitating commercial transactions; review its current terms before choosing it for a payment-collection site. A compatible static host can deploy directly from this repository.

## Owner review

Confirm the proposed curriculum wording, refund terms, and public support contact before launch. No Facebook page URL has been guessed. The Google Sheets connection still requires the owner’s Apps Script deployment URL.
