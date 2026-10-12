# PROPOSED - not agreed with Members B and C

This document defines the proposed lifecycle statuses for customer orders and payment transactions.
These status values are currently implemented by the frontend (`lib/types/order.ts`) and mock API adapter (`lib/api/mock/`), but require review and formal agreement from Member B (Backend) and Member C (Infrastructure/Security).

---

## 1. Order Status (`OrderStatus`)

The lifecycle stages through which an order passes from placement to final fulfillment or cancellation.

| Status Value | Customer-Facing Label | Meaning | Visual Indicator |
| --- | --- | --- | --- |
| `placed` | Order Placed | The customer has submitted checkout and the order record is created. | Neutral / Info badge |
| `confirmed` | Payment Confirmed | Payment has been verified; atelier has received the order for processing. | Primary / Green badge |
| `in_production` | Crafting in Atelier | The bespoke accessory is being cut, stitched, and assembled by hand in the studio. | Accent / Amber badge |
| `packed` | Quality Checked & Packed | Atelier review complete; order is safely packed for shipment. | Primary / Blue badge |
| `dispatched` | Dispatched / In Transit | Consignment handed over to courier partner for delivery. | Primary / Blue badge |
| `delivered` | Delivered | Shipment successfully delivered to customer address. | Success / Green badge |
| `cancelled` | Cancelled | Order was cancelled due to payment failure, customer request, or stock issue. | Error / Red badge |

### State Transitions (Proposed)

```
[placed] ---> [confirmed] ---> [in_production] ---> [packed] ---> [dispatched] ---> [delivered]
   |                |
   v                v
[cancelled]    [cancelled]
```

---

## 2. Payment Status (`PaymentStatus`)

The transaction outcome recorded by the payment gateway and verified by the backend.

| Status Value | Meaning | Frontend Action |
| --- | --- | --- |
| `pending` | Payment session initiated but not yet settled or webhook confirmation delayed. | Displays pending notification; polls `GET /orders/{id}` for a limited duration with manual refresh CTA. |
| `paid` | Transaction authorized and captured. | Clears cart; displays Order Confirmation screen with full summary. |
| `failed` | Transaction declined by bank, insufficient funds, or gateway error. | Keeps cart intact; displays retry payment CTA with clear explanatory message. |
| `cancelled` | Customer abandoned payment screen or explicitly cancelled gateway modal. | Keeps cart intact; displays returned-from-payment notice with option to resume checkout. |

---

## 3. Notes for Member B & C

1. **Proof of payment**: Per Frontend Specification Section 7 note 1, the frontend never treats client-side redirects or gateway responses as proof of payment. Payment status is only confirmed when `GET /orders/{id}` returns `paymentStatus: 'paid'`.
2. **Webhook reconciliation**: When the payment gateway fires an asynchronous webhook, Member B's backend should update the order record so subsequent `GET /orders/{id}` polling reflects the transition from `pending` to `paid` or `failed`.
