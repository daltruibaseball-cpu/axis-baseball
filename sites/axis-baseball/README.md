# Elite Baseball Training - Landing Page

A clean, modern, and responsive landing page for a baseball training service.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean design with smooth animations and transitions
- **Smooth Scrolling**: Navigation with smooth scroll behavior
- **Mobile Menu**: Hamburger menu for mobile devices
- **Contact Form**: Interactive contact form for inquiries
- **Multiple Sections**: Hero, Services, About, Testimonials, and Contact sections

## Structure

- `index.html` - Homepage
- `pages/` - Program and checkout pages (free-program, inseason-power-program, etc.)
- `css/styles.css` - Styles
- `js/script.js` - Scripts
- `assets/` - Images (logo, favicon, hero backgrounds, share images)
- `netlify/functions/` - Serverless functions (Stripe)

## How to Use

1. Open `index.html` in your web browser (or run a local server from this folder).
2. **Netlify**: Set **Base directory** to `sites/axis-baseball` so publish root is this folder.
2. For the paid program upsell with Stripe payments, see **Stripe Setup** below

## Stripe Payment Setup (In-Season Program)

The upgrade flow on `inseason-power-program.html` uses Stripe's Payment Element for inline checkout.

### 1. Configure Stripe keys
- In `script.js`, replace `pk_test_YOUR_KEY` in `STRIPE_CONFIG.publishableKey` with your [Stripe publishable key](https://dashboard.stripe.com/apikeys)

### 2. Set environment variable (Netlify)
- In Netlify: **Site settings → Environment variables**
- Add `STRIPE_SECRET_KEY` with your Stripe secret key (starts with `sk_test_` or `sk_live_`)

### 3. Install dependencies & deploy
- From this folder (`sites/axis-baseball`), run `npm install`.
- In Netlify, set **Base directory** to `sites/axis-baseball` so the publish root is this folder.
- Deploy — the function at `netlify/functions/create-payment-intent.js` will create PaymentIntents.

### 4. Local testing
- Run `netlify dev` to test the payment flow locally (requires [Netlify CLI](https://docs.netlify.com/cli/get-started/))

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #1a4d8c;      /* Main brand color */
    --secondary-color: #ff6b35;    /* Accent/CTA color */
    --accent-color: #f4a261;       /* Additional accent */
}
```

### Content
- Update text content directly in `index.html`
- Replace placeholder contact information with your actual details
- Modify service offerings in the Services section

### Images
Replace the placeholder image in the About section with your own image by updating the `.image-placeholder` div or adding an `<img>` tag.

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

Free to use and modify for your project.
