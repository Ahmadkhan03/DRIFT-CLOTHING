# DRIFT — Streetwear Store

Premium men's / unisex streetwear store for Pakistan. Built with Next.js 16, Tailwind CSS 4, Motion and Lenis.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Connect the database (Supabase)

1. Create a free project at https://supabase.com (region: closest to Pakistan, e.g. Singapore or Mumbai).
2. In the dashboard open **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_orders.sql` and click **Run**. Repeat for `0002_admin.sql`.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project Settings → Data API → Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Project Settings → API Keys → **publishable** key
   - `SUPABASE_SECRET_KEY`: Project Settings → API Keys → **secret** key (keep this private, never commit it)
4. Restart `npm run dev`. Checkout, order tracking and newsletter signups now save to Supabase.

## Admin panel (`/admin`)

Dashboard, orders (confirm → pack → ship → deliver, COD cash tracking, WhatsApp confirm, packing slip), customers CRM (lifetime value, tags, notes), discount codes and newsletter subscribers (CSV export).

- **Before Supabase is connected:** in local development `/admin` opens in **demo mode** with sample data and no login. In production it stays locked.
- **Adding staff:** in Supabase → Authentication → Users → **Add user** (email + password, tick "Auto confirm"). Then in SQL Editor run
  `insert into staff (email, full_name, role) values ('owner@example.com', 'Owner Name', 'owner');`
  (use a lower-case email). They can now sign in at `/admin/login`.

### Order confirmation emails (optional)

Create an account at https://resend.com, verify your domain, then set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local`. Without them, orders still work and emails are skipped.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/products.ts` | Product catalogue (placeholder data + images), categories, price formatting |
| `src/lib/cart-store.ts` | Cart state (saved in the browser) |
| `src/app/globals.css` | Design tokens: colours, fonts, grain, marquee, preloader |
| `src/components/layout/` | Announcement bar, header + mega menu, cart drawer, newsletter popup, preloader, footer |
| `src/components/home/` | Home page sections |
| `src/components/product/` | Product card and product page |
| `src/components/shop/` | Shop listing with filters and sorting |
| `src/components/checkout/` | Checkout form and order summary |
| `src/app/actions/` | Server actions: place order, discount codes, newsletter, tracking |
| `src/lib/supabase/server.ts` | Server-only Supabase client |
| `src/app/admin/` | Admin panel pages and server actions |
| `src/lib/admin/` | Admin auth, data access (Supabase or demo data) |
| `supabase/migrations/` | Database schema |

### Swapping in real content

- **Logo:** replace the `Drift` wordmark in `src/components/layout/Header.tsx` (and the footer/preloader).
- **Products and photos:** edit `src/lib/products.ts`. Images are Unsplash placeholders for now; later they will come from the admin panel.

## Roadmap

1. ~~Design system and home page~~ ✅
2. ~~Shop, product page, cart drawer, newsletter popup~~ ✅ (front-end only, placeholder data)
3. ~~Checkout with Cash on Delivery, orders in Supabase, confirmation page, order tracking, confirmation emails~~ ✅
   - Next: Safepay (card, JazzCash, Easypaisa)
4. ~~Admin and CRM: dashboard, orders, customers, discount codes, subscribers~~ ✅
   - Next: products & stock per size managed from the admin (move catalogue into the database), abandoned carts
5. Accounts, wishlist, order tracking, reviews, search, SEO and analytics
6. Testing, performance pass and launch
