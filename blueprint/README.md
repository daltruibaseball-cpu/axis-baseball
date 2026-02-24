# The Blueprint — One-on-One Hitting

A single high-converting landing page that drives visitors to **book a call** for a one-on-one hitting program. Built with static HTML, CSS, and JavaScript. No backend required.

## Set your Calendly URL

1. Open **script.js** and replace the placeholder with your real Calendly link:

   ```js
   const CALENDLY_URL = 'https://calendly.com/your-username/30min';
   ```

   Use your actual Calendly event URL (e.g. `https://calendly.com/your-username/15min` or a custom event type).

2. Save the file. The "Book a Call" and "Book a Free Call" buttons will open a modal with your Calendly scheduling page (inline widget when Calendly’s script loads, or an iframe fallback).

## Run locally

- **Option A:** Open **index.html** in a browser (double-click or drag into the window). Some features (e.g. Calendly widget) may behave best over HTTP.
- **Option B:** Serve the folder with a local server:
  ```bash
  npx serve .
  ```
  Then open the URL shown (e.g. `http://localhost:3000`).

## Deploy

- **Netlify:** Drag the **blueprint** folder into [Netlify Drop](https://app.netlify.com/drop), or connect a repo that contains this folder and set the publish directory to the folder with `index.html`.
- **Vercel / other:** Use the same folder as the project root; no build step needed.

## Project location

This project was created inside **baseball-training** as `blueprint/`. If you want it as a separate repo (e.g. a sibling folder like `/Users/jakedaltrui/blueprint`), move the **blueprint** folder out and use it as its own project. It does not depend on any files outside this folder.

## Assets (optional)

The **assets/** folder is for favicon and social share images. You can add:

- **Favicon:** e.g. `favicon.ico` or `favicon.png`, and link it in `index.html` with `<link rel="icon" href="assets/favicon.ico">`.
- **OG image:** e.g. `og-image.png` (recommended 1200×630) for social sharing; set in `<meta property="og:image" content="...">` in `index.html`.

Leaving **assets/** empty is fine; the page works without them.
