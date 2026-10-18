# Backend PRD: Handmade Fabric Accessories Store

Prepared by Member A (Frontend) for Member B (Backend). This is a proposal. Member B owns the backend decisions and can amend anything here.

## Scope of this document

This covers the backend only: the API, business rules, payments and security. It does not cover the frontend or the database design. Member C owns the database. The backend reaches the database through a data-access layer that B and C agree on.

## Problem statement

The client sells handmade fabric accessories such as scrunchies, pouches, cable holders and lip-balm holders. Customers cannot yet choose their own fabric, size and add-ons online, see the price, and pay in one flow. The storefront needs a backend that serves products, validates custom configurations, calculates prices, takes orders and confirms payments reliably.

## Users

- **Guest:** browses products, categories and the contact page. Cannot buy.
- **Customer:** a registered user who builds items, keeps a cart, saves addresses, pays and tracks orders. Most customers will shop on a phone in India.
- **Internal team:** enters products and moves orders through production. There is no admin dashboard in release 1, so the backend needs a safe internal way to do this (see open decisions).

## Product vision

A dependable backend where the server is the single source of truth for products, prices, valid combinations and payment status.

## Core backend features

| Feature | What it does | Priority |
| --- | --- | --- |
| Authentication | Register, log in, log out, forgot and reset password | Must-have |
| Product catalogue | List, detail, categories, search, filter by category, fabric and price, sort, paging | Must-have |
| Build Your Own quote | Validates a chosen configuration and returns the price or the problems | Must-have |
| Cart | Add, edit configuration, change quantity, remove, re-check prices | Must-have |
| Addresses | Save and list Indian delivery addresses | Must-have |
| Checkout | Creates the order from the cart and returns what is needed to start payment | Must-have |
| Payments | Creates the gateway session, receives the webhook, records payment status | Must-have |
| Orders | Order list and order detail with status | Must-have |
| Internal product entry | A safe way for the team to add and update products | Must-have |
| Password reset email | Sends the reset link | Must-have |
| Contact form | Receives messages from the Contact page | Should-have |
| Order status updates | Staff move orders through production and dispatch | Should-have |
| Order emails | Order confirmation and dispatch notices | Should-have |
| Merge guest cart on login | Keeps items added before login | Nice-to-have |
| Refunds | Refund handling through the gateway | Nice-to-have |

## Backend flow

1. A visitor loads categories and products. The backend returns only published, available products.
2. A customer opens a product and picks fabric, size and add-ons. The frontend calls the quote endpoint on each change. The backend checks the combination is valid and returns the price.
3. The customer adds the configured item to the cart. The backend re-validates and stores the selection with the price at that moment.
4. The customer saves an address.
5. At checkout the backend re-prices every cart item, creates the order in a pending payment state and returns the information needed to open the payment screen.
6. The customer pays at the gateway. The gateway sends a webhook to the backend.
7. The backend verifies the webhook, updates the payment status and the order status.
8. The frontend reads the order from the API. Payment counts as done only when the backend says so. A redirect is never proof.
9. The customer sees the order in My Account. The team updates the status as the order is made and shipped.

## What the MVP looks like

All must-have features above, running against the real database and a real payment gateway in test mode, with automated tests for pricing, cart, checkout and the payment webhook.

## Success measures

- No order is ever marked paid without a verified gateway confirmation.
- A duplicate webhook or a repeated checkout request never creates a second order or a second charge.
- Prices on the order always match what the backend quoted at checkout.
- Quote responses are fast enough to feel instant while the customer picks options. Proposed target: under 300 ms at the 95th percentile.
- Every error returns the agreed error format. No unhandled crashes.

## What we are not building in release 1

- Admin dashboard
- Frontend code of any kind
- Database design and migrations (Member C)
- Coupons, loyalty points and reviews
- Multiple currencies or delivery outside India
- Refund automation

## Assumptions and open decisions

- Currency is INR and delivery is India only. Needs client confirmation.
- The payment gateway is not chosen. See the Backend API Specification.
- Shipping and tax charges are the client's decision. The API must support a shipping and a tax amount, even when both are zero.
- How the team enters products in release 1: a seed or import script, or protected internal endpoints. Member B to propose.
- Order cancellation rules after production starts need a client decision.
