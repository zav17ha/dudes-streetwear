# Dudes Streetwear — Online Store

The website for **Dudes Streetwear** (#1 streetwear brand in Sri Lanka). It's a storefront with a built-in admin panel. Customers order through **WhatsApp**: there's no online checkout.

- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Lenis smooth scroll
- **Hosting:** Vercel
- **Products:** Upstash Redis (connected from the Vercel dashboard)
- **Product photos:** Vercel Blob (connected from the Vercel dashboard)

---

## What's included

| Page | What it does |
| --- | --- |
| `/` | Brand intro preloader, a hero with drifting light specks, scrolling tickers, latest drops, a scroll-revealed manifesto, lookbook parallax, how-to-order steps and community links |
| `/shop` | All T-shirts with search, sorting and quick-add of a size from the grid |
| `/product/[slug]` | Gallery with zoom/lightbox, colour and size pickers, quantity, **Add to bag**, **Order now on WhatsApp**, details and related products |
| `/about` | Brand story and pillars |
| `/contact` | WhatsApp, phone, email, address, social links and a map |
| `/admin` | Product manager with username/password logins and a Team page |

**How ordering works:** customers add items to their bag. The bag is saved in their browser. They can also fill in their name and address. One tap opens WhatsApp with a ready-made message to **071 878 7087**:

```
Hey DUDES! 🔥 I'd like to place an order:

1. *1991 Heavyweight Hoodie*
   Size: L | Colour: Black
   Qty: 2 × Rs. 7,990 = Rs. 15,980
   https://your-site/product/1991-heavyweight-hoodie

Items: 2
*Subtotal: Rs. 15,980* (+ delivery)

Name: …
Delivery address: …
```

Other features: SEO metadata, Open Graph image, `sitemap.xml`, `robots.txt`, product structured data (JSON-LD), a favicon from the dragon "D" mark, a floating WhatsApp button and support for reduced motion.

---

## Deploy to Vercel (step by step)

1. **Push this folder to a GitHub repository.**
2. In Vercel, click **Add New → Project**, import the repo and keep the defaults (Framework: Next.js). Don't deploy yet, or deploy and come back.
3. **Add the product database:** Project → **Storage** → **Create Database** → **Upstash for Redis** (free plan is fine) → connect it to this project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Add photo storage:** Project → **Storage** → **Create** → **Blob** → connect it to this project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
5. **Set the owner login:** Project → **Settings → Environment Variables** → add `ADMIN_USERNAME` (for example `admin`) and `ADMIN_PASSWORD` (long and private).
6. Optional: add `NEXT_PUBLIC_SITE_URL` (for example `https://dudes.lk`) once you have a custom domain.
7. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables take effect.

The first time the site reads the database, it fills it with the 8 starter products. You can edit or delete them from the admin.

> Without Redis connected, the site still works but shows the starter products as read-only. The admin panel shows a banner explaining what's missing.

---

## Managing products (for the client)

1. Go to **`https://your-site/admin`** and sign in with your username and password. Tick **Keep me signed in** to stay logged in for 30 days.
2. Click **+ Add product**:
   - **Photos:** drag and drop or pick from your phone or computer. Photos are resized and compressed before upload. The **first photo is the cover** and the **second shows on hover** in the shop grid. Drag or use the arrows to reorder.
   - **Name, description, highlights** (one per line), **price in LKR**, optional **compare-at price** (shows a sale badge).
   - **Sizes and colours.**
   - Switches: **New drop** (badge), **Featured** (shown first on the home page), **Sold out** (stays visible but can't be ordered, with an "ask about restock" button) and **Hidden** (admin-only).
3. Click **Publish**. The store updates right away.

You can flip *New / Featured / Sold out / Visible* straight from the product list.

### Team logins

Admins see a **Team** link in the admin header.

- **Create a login:** enter a name. The username and a strong password are filled in for you. Choose **Editor** (products only) or **Admin** (products plus team).
- **Share it:** after creating the login, tap **Copy login details** or **Send on WhatsApp** to send the link, username and password in one message. The password is only shown once.
- **Manage access:** change someone's role, reset their password (it shows new details to share) or remove their login. Removing a login signs that person out straight away.

The owner account always comes from `ADMIN_USERNAME` / `ADMIN_PASSWORD`, so you can't lock yourself out. Team logins are stored in the same database as the products, with hashed passwords.

---

## Local development

```bash
npm install
cp .env.example .env.local    # set ADMIN_USERNAME + ADMIN_PASSWORD
npm run dev                   # http://localhost:3000
```

Without Redis or Blob credentials, local development uses:

- `.data/products.json` for products and `.data/users.json` for team logins
- `public/uploads/` for uploaded photos

Both folders are git-ignored. Run local mode with `npm run dev`. Files uploaded at runtime aren't served by `next start`.

---

## Customising

| What | Where |
| --- | --- |
| Phone / WhatsApp number, email, address, social links, tagline | `lib/site.ts` |
| WhatsApp message wording | `lib/whatsapp.ts` |
| Colours (black & white palette), fonts, animation timings | `app/globals.css` (`@theme`) and `app/layout.tsx` (fonts: Anton, Archivo, JetBrains Mono) |
| Home page sections and copy | `components/home/*` |
| About page copy | `app/(site)/about/page.tsx` |
| Starter products (used before the database has any) | `lib/seed.ts` |
| Logos (vector, traced from the official artwork) | `public/brand/*.svg` and `components/brand/paths.ts` |

The starter product images in `public/products/` are generated mockups. Replace them with real product photos from the admin panel.

## Project structure

```
app/
  (site)/            storefront pages + shared layout (header, footer, bag, page transitions)
  admin/             login, product list, create/edit forms, server actions
  api/upload/        authenticated image upload → Vercel Blob
components/
  brand/ home/ layout/ shop/ ui/ admin/ providers/
lib/
  store.ts           product storage (Redis → local file → read-only starter data)
  media.ts           image storage (Vercel Blob → local folder)
  auth.ts            signed-cookie admin session
  users.ts           owner + team logins (scrypt-hashed passwords)
proxy.ts             protects /admin/*
```
