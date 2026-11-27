# Flamingo Rentals --- Project Context

**Last updated:** 27 November 2026\
**Purpose:** Handover/context document for continuing development of
Flamingo Rentals in ChatGPT or another coding assistant.

> **Important project state:** The database migration issue described
> below is not yet confirmed resolved. Do not assume that the database
> has been reset, that data has been restored, or that a new booking
> migration has been successfully applied. Confirm the current state
> before running database-changing commands.

------------------------------------------------------------------------

## 1. Project overview

Flamingo Rentals is a marketplace connecting customers with vendors who
offer rentable products and services. The product has a web application
and a planned mobile application.

The user is leading backend and web development. A teammate is working
on the mobile/React Native side and is relatively new to that stack.

Core product direction:

-   Guests can browse vendors and listings.
-   Customers can add listings to a cart and complete booking details.
-   Customers pay at checkout; a booking is confirmed only after
    successful server-side payment verification.
-   Vendors manage listings, availability and their business profiles.
-   Vendors do not accept or reject customer bookings in the intended
    workflow.
-   Vendors may cancel bookings, with a mandatory cancellation reason.
-   Wallet and statement functionality exists in the schema/database and
    must be preserved.
-   No payment provider has been selected or integrated yet.

## 2. Tech stack and development environment

### Confirmed stack

  --------------------------------------------------------------------------------------------
  Area                                Technology / detail
  ----------------------------------- --------------------------------------------------------
  Web framework                       Next.js (App Router)

  Language                            TypeScript

  ORM                                 Prisma 7.10.0

  Database                            PostgreSQL

  Prisma configuration                `prisma.config.ts`

  Prisma schema                       `prisma/schema.prisma`

  Generated Prisma Client             `app/generated/prisma`

  Package/runtime environment         Node.js / npm

  Source control                      Git and GitHub

  Local development OS                Windows

  Shell                               PowerShell, usually through VS Code

  Project directory                   `C:\Users\Oreolorun\OneDrive\Desktop\next-jsblog-site`

  GitHub repository                   `horeolorun/flamingo-rentals.git`
  --------------------------------------------------------------------------------------------

The database connection seen in Prisma output identifies database
`postgres`, schema `public`, host `pooled.db.prisma.io:5432`. A direct
connection string was also shared during troubleshooting. **Credentials
were exposed in chat and must be rotated.** Never copy credentials into
this file, source control, chat messages, screenshots or logs.

### Prisma 7 notes

-   Prisma configuration is loaded from `prisma.config.ts`.

-   The generated client is output to `app/generated/prisma`.

-   For this installed Prisma CLI version, `migrate diff` uses
    `--from-schema` / `--to-schema`; the old `--to-schema-datamodel`
    option is removed.

-   Typical checks:

    ``` powershell
    npx prisma validate
    npx prisma format
    npx prisma generate
    npx prisma migrate status
    ```

-   `npx prisma migrate dev --name <migration_name>` creates and applies
    a development migration, but it must not be run while the current
    migration-history drift remains unresolved.

-   `npx prisma migrate reset` is destructive and drops/recreates the
    configured database schema. The configured database is remote, so
    this is not a harmless local reset.

-   `npx prisma db push` is not the preferred workflow; the project
    owner explicitly wants migration-based schema changes.

## 3. Repository and folder structure

### Confirmed / previously supplied structure

The following paths and files have been supplied or discussed in earlier
work. Paths should be checked against the current repository before
creating or renaming anything.

``` text
next-jsblog-site/
├── app/
│   ├── (web)/
│   │   ├── customer/
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   └── vendors/
│   │   │       ├── page.tsx
│   │   │       ├── VendorDiscoveryFilters.tsx
│   │   │       └── [slug]/
│   │   │           └── page.tsx
│   │   └── vendor/
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       ├── availability/
│   │       │   └── page.tsx
│   │       ├── listings/
│   │       │   ├── page.tsx
│   │       │   └── new/
│   │       │       └── page.tsx
│   │       ├── messages/
│   │       │   └── page.tsx
│   │       ├── onboarding/
│   │       │   ├── page.tsx
│   │       │   └── business/
│   │       │       └── page.tsx
│   │       ├── orders/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── send-otp/
│   │   │       └── route.ts
│   │   ├── cart/
│   │   │   ├── route.ts
│   │   │   └── items/
│   │   │       ├── route.ts
│   │   │       └── [itemId]/
│   │   │           └── route.ts
│   │   ├── customer/
│   │   │   └── vendors/
│   │   │       ├── route.ts
│   │   │       └── [slug]/
│   │   │           └── route.ts
│   │   └── vendor/
│   │       ├── availability/
│   │       │   └── route.ts
│   │       ├── availability-blocks/
│   │       │   └── route.ts
│   │       └── listings/
│   │           └── route.ts
│   └── page.tsx
├── components/
│   └── customer/
│       └── AddToCartButton.tsx
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── prisma.config.ts
└── ...
```

The user previously supplied the complete contents of several files,
including:

-   `app/(web)/customer/account/page.tsx`
-   `app/(web)/customer/cart/page.tsx`
-   `app/(web)/customer/vendors/[slug]/page.tsx`
-   `app/(web)/customer/vendors/page.tsx`
-   `app/(web)/customer/vendors/VendorDiscoveryFilters.tsx`
-   `components/customer/AddToCartButton.tsx`
-   `app/api/cart/items/[itemId]/route.ts`
-   `app/api/cart/items/route.ts`
-   `app/api/cart/route.ts`
-   `app/(web)/vendor/orders/page.tsx`
-   `app/(web)/vendor/availability/page.tsx`
-   `app/api/vendor/availability/route.ts`
-   `app/api/vendor/availability-blocks/route.ts`
-   `app/api/customer/vendors/route.ts`
-   `app/api/customer/vendors/[slug]/route.ts`

Do not ask the user to resend these files or directory structures unless
the current version is genuinely needed and may have changed. Consult
the conversation history first. The user has explicitly asked not to be
repeatedly asked for structures already provided.

## 4. Features and implementation status

The following status is based on the conversation history, not a fresh
audit of the repository. "Implemented / supplied" means code was
previously shared or functionality was discussed as present; it is not a
guarantee that the current branch is fully working.

### Authentication and accounts

-   Email OTP authentication endpoint at `app/api/auth/send-otp`.
-   The endpoint previously had a 500 error that was resolved.
-   A Prisma P1012 Session schema issue was also encountered and
    resolved at that time.
-   Customer account page exists.
-   User and session/authentication models exist in Prisma
    schema/database.

### Vendor discovery and profiles

-   Customer vendor discovery page exists.
-   Vendor discovery filters component exists.
-   Individual vendor page exists at `/customer/vendors/[slug]`.
-   Customer-facing vendor API routes exist:
    -   `app/api/customer/vendors/route.ts`
    -   `app/api/customer/vendors/[slug]/route.ts`
-   Vendor profile data includes branding and business information;
    database introspection showed fields such as logo URL, featured
    flag, location and ratings.

### Listings

-   Vendor listing management page and new-listing page exist.
-   Vendor listings API exists at `app/api/vendor/listings/route.ts`.
-   Listing model includes price, pricing unit, status and
    availability-related fields.
-   Inventory quantity is intended to be represented by
    `Listing.totalQuantity`, defaulting to 1. This field was present in
    the current local Prisma schema but was missing from the database
    during the November 2026 investigation.

### Cart and booking details

-   Customer cart page exists.
-   Cart API routes exist:
    -   `app/api/cart/route.ts`
    -   `app/api/cart/items/route.ts`
    -   `app/api/cart/items/[itemId]/route.ts`
-   `AddToCartButton` component exists.
-   Cart, CartItem and bundle-related models/tables exist in the
    database.
-   Guest browsing and guest cart retention are intended; cart should
    persist using browser storage/cookies and be merged or retained
    after sign-in.
-   Add to Cart is intended to open a booking-details interface for
    dates and quantity, with an option to add an item without completing
    details immediately.
-   In the cart, dates and quantity should be edited through the
    booking-details interface rather than +/- controls.
-   Checkout should be disabled when selected items have incomplete
    required booking dates/details.
-   Availability should be rechecked when booking details change and
    again during checkout/payment to prevent overselling.
-   The existing cart page previously had +/- quantity controls and a
    checkout placeholder; these were identified for later correction.
-   Do not assume rental price calculation includes duration until
    `pricingUnit` and current pricing logic have been reviewed. A
    previously discussed simple formula was `priceKobo * quantity`, but
    duration rules were not confirmed.

### Vendor availability

-   Vendor availability page exists.
-   `app/api/vendor/availability/route.ts` exists.
-   `app/api/vendor/availability-blocks/route.ts` exists and supports
    manual availability blocks.
-   Preserve both routes; they serve distinct availability
    functionality.
-   Manual vendor-wide availability blocks remain relevant alongside
    listing inventory calculations.

### Bundles

-   Bundle support migration exists: `20261118120624_add_bundle_support`
-   Database introspection showed `VendorBundle`, `VendorBundleItem`,
    `CartBundle`, and `CartBundleItem` tables and related enums.
-   `CartItem.isSelected` was introduced for selection in cart.

### Wallet and statements

-   Wallet and Statement models/tables exist in the database.
-   Wallet-related schema includes wallet purpose/status, balances,
    minimum balance, transfers flag, version, timestamps, and links from
    User and VendorProfile.
-   Statement includes walletId, inflow, outflow, balance, narration,
    optional reference/transaction identifiers, postedAt and createdAt.
-   Wallet implementation is sensitive and must not be redesigned or
    modified unless the user explicitly requests it.
-   Preserve existing wallet balances, statements, relationships,
    indexes and constraints during all database work.

### Vendor orders

-   Vendor orders page exists but was previously a placeholder.
-   The intended product workflow has changed from vendor accept/reject
    to payment-confirmed bookings. Do not reintroduce vendor
    acceptance/rejection without explicit direction.

## 5. Architectural and product decisions

### Booking lifecycle

Intended workflow:

1.  Customer selects listing and booking dates/quantity.
2.  Customer proceeds to checkout.
3.  Customer payment is initiated (provider not yet selected or
    integrated).
4.  Server verifies payment successfully.
5.  Only after successful server-side verification is the booking
    confirmed.
6.  Vendor does not accept or reject the booking.
7.  Vendor may cancel a booking, with a mandatory cancellation reason.
8.  Refund status and amounts are tracked where applicable.

Do not mark a booking confirmed merely because the client reports
payment success. Payment verification must be server-side.

### Inventory and availability

-   `Listing.totalQuantity` represents total stock for a listing.
-   Default inventory quantity is 1.
-   Services or single-unit rentals commonly have quantity 1; physical
    rental listings may have multiple units.
-   Availability is calculated as total inventory minus overlapping
    confirmed/paid bookings, while respecting manual vendor availability
    blocks.
-   Recheck availability at checkout and payment confirmation to avoid
    overselling.
-   Booking quantity defaults to 1 for existing/new bookings unless
    explicitly provided.
-   The precise definition of booking overlap and date boundaries should
    be made consistent throughout the application.

### Cart

-   Guest cart should persist.
-   Signing in should retain/merge the guest cart.
-   Customers can add items with incomplete details, but checkout should
    require the necessary booking information for selected items.
-   Dates and quantity are edited in booking details, not by cart +/-
    controls.
-   Availability and price estimates must be recalculated when booking
    details change.
-   Do not invent a duration pricing formula; inspect `pricingUnit` and
    existing code.

### Wallet and financial records

-   Preserve wallet and statement models/data.
-   No payment provider integration is currently selected.
-   Do not fabricate financial transactions or seed fake financial
    history that could be mistaken for real transactions.
-   Wallet schema and wallet-related code should remain untouched unless
    explicitly requested.

### User interface

-   Product direction: clean, light SaaS interface.
-   Previously specified primary purple `#4f2a91` and green accent.
-   Customer/vendor role switching is part of the intended experience.
-   Vendor verification and payout bank details are part of vendor
    onboarding requirements.

## 6. Prisma schema and migrations

### Migration folders known from earlier inspection

``` text
prisma/migrations/
├── 20260912062531_init_auth/
├── 20260912203923_add_otp_verification/
├── 20260913153335_add_sessions/
├── 20260914131235_add_vendor_listings/
├── 202609142206_add_vendor_segments_and_deferred_onboarding/
├── 20260915101817_add_password_and_email_preferences/
├── 20260915134227_add_verification_purpose/
├── 20260917104133_add_vendor_search_filters/
├── 20261109141750_add_vendor_branding/
├── 20261118120624_add_bundle_support/
└── 20261123100203_add_wallet_and_statement/
```

The exact folder names above were observed in prior PowerShell output
and should be checked against the current working tree.

### Migration/schema issues encountered in November 2026

1.  Initial `schema.prisma` had duplicate `Wallet` and `Statement` model
    declarations, duplicate wallet fields/relations on `VendorProfile`,
    and references to missing enums.

2.  The schema was corrected and subsequently passed:

    ``` powershell
    npx prisma validate
    npx prisma generate
    ```

    Prisma Client 7.10.0 generated to `app/generated/prisma`.

3.  The current schema at that time included:

    -   `Listing.totalQuantity Int @default(1)`
    -   Booking quantity and cancellation/refund fields
    -   `BookingCancellationActor` enum: `CUSTOMER`, `VENDOR`, `ADMIN`
    -   `RefundStatus` enum: `NOT_REQUIRED`, `PENDING`, `PROCESSING`,
        `REFUNDED`, `FAILED`

4.  The database introspection (`npx prisma db pull --print`) showed:

    -   `Listing.totalQuantity` was missing from the actual database.
    -   `Booking.quantity` was missing.
    -   Booking cancellation and refund fields were missing.
    -   `BookingCancellationActor` and `RefundStatus` enums were
        missing.
    -   Wallet and Statement tables existed.
    -   Bundle tables existed.

5.  `npx prisma migrate status` reported 11 migrations found and
    "Database schema is up to date!" However, this only reflected
    migration tracking status at that point; it did not prove the schema
    matched the latest local `schema.prisma`.

6.  A safe diff command was run:

    ``` powershell
    npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
    ```

    It generated SQL to add the booking enums/fields,
    `Listing.totalQuantity`, `Booking.quantity`, and a composite booking
    availability index. This command only prints SQL; it does not apply
    it.

7.  `npx prisma migrate dev --create-only --name add_booking_inventory_and_cancellation_fields`
    then detected drift and offered a reset. User did not confirm that
    reset at that point.

8.  A subsequent `npx prisma migrate dev --name add_bookings` again
    detected drift and offered a reset.

### Wallet migration checksum mismatch

The migration: `20261123100203_add_wallet_and_statement/migration.sql`

was identified as modified after application.

The database record in `_prisma_migrations` showed:

``` text
migration_name:
20261123100203_add_wallet_and_statement

checksum:
438cccae2b507fced343ed5a5d167ebe66d2aaffe6bc03d8edb1d56caeba35d0

finished_at:
2026-11-23T10:02:08.391Z
```

The local file hash at the time of checking was:

``` text
26D8B55ACD7CF414E6DDB7E99DCC094DDC9C1866E2B308EF713071C135885C69
```

These differ, confirming a checksum mismatch.

The user supplied the contents of the local wallet migration. It
creates: - `WalletPurpose` and `WalletStatus` enums. - Wallet columns on
`User` and `VendorProfile`. - `Wallet` and `Statement` tables. - Wallet
and Statement indexes. - Four foreign keys from User/VendorProfile
wallet IDs to Wallet. - An additional manually appended constraint:
`sql   ALTER TABLE "Statement"     ADD CONSTRAINT statement_wallet_fk     FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT;` -
A wallet balance check constraint: `wallet_balance_above_minimum` - A
Statement inflow/outflow check constraint:
`statement_inflow_xor_outflow`

The user wants `Statement.walletId` to have **no foreign key**.

A PostgreSQL query against `pg_constraint` returned only:

``` text
Statement_pkey    PRIMARY KEY (id)
```

This confirmed that the actual Statement table did not have a foreign
key or check constraints at that time. It is not clear whether the
additional check constraints from the supplied local migration were ever
applied; do not assume they exist.

### Latest user decision about reset

The user asked how to remove the problematic migration and rerun all
migrations, explicitly saying they do not mind losing data. An earlier
assistant proposed: - Remove only the `statement_wallet_fk` SQL block
from the wallet migration. - Keep the wallet balance and statement
inflow/outflow check constraints. - Run `npx prisma migrate reset`. -
Then run `npx prisma migrate dev --name add_bookings`. - Then
`npx prisma generate` and `npx prisma migrate status`.

**However, the user has NOT confirmed that they actually edited the file
or ran the reset.** Do not assume the reset has happened.

Critical cautions: - The configured database is remote
(`pooled.db.prisma.io`), so `migrate reset` would delete data in that
remote PostgreSQL schema, not merely a local database. - Before reset,
verify this is definitely the disposable development database and that
the user accepts losing all records. - The migration checksum issue is
not fixed merely by editing the old migration. A reset replays the
current migration files from scratch, so a checksum mismatch on the old
applied history is no longer relevant after a successful full reset. -
Do not remove the entire wallet migration. It is required to recreate
wallet and statement tables. - Removing the Statement foreign key from
the migration file means the replayed database will not have that FK. -
The earlier recommendation to preserve check constraints needs careful
thought: the user asked specifically to remove the foreign key, and
their actual DB did not show the Statement check constraint. The user
has now explicitly accepted data loss and wants a reset/replay, but no
final decision has been made about retaining or removing the check
constraints. Do not silently alter more wallet behaviour than
necessary. - The local `main` branch comparison for the wallet migration
returned no diff; this only established that the working file matched
local `main`, not that it matched `origin/main` or the original applied
checksum. The command `git show origin/main:...` was suggested but no
output was provided. - User asked about adding data back after reset. No
reset or restore is confirmed. If reset is performed, old records can
only be restored from a backup/export or another copy; Prisma migrations
recreate structure, not data. Fresh development data can be inserted
with seed scripts or through the application.

## 7. Current working tree state (last known)

The last `git status --short` output was:

``` text
 M app/(web)/customer/vendors/[slug]/page.tsx
 M app/(web)/vendor/availability/page.tsx
 M app/(web)/vendor/listings/page.tsx
 M app/api/vendor/listings/route.ts
 M components/customer/AddToCartButton.tsx
 M prisma/schema.prisma
?? app/api/vendor/availability-blocks/
```

These changes are uncommitted and must be preserved. Do not use broad
`git restore`, `git reset --hard`, or destructive cleanup commands.

## 8. Known bugs / outstanding work

### Database and migrations --- highest priority

-   Wallet migration checksum mismatch.
-   Prisma migration drift involving the Statement table's `walletId`
    foreign key.
-   User wants no `Statement.walletId` foreign key.
-   Booking and inventory columns/enums were missing from database
    during introspection.
-   Need to reconcile schema, migrations and database safely.
-   Need to determine whether a full reset/replay has been performed
    since the last conversation. It was only proposed, not confirmed.
-   Need to verify whether the database is disposable before any reset
    because it is remote.
-   After migration repair, verify schema with `migrate status` and
    inspect the relevant tables/columns/constraints.
-   If data is restored or seeded, ensure wallet and transaction records
    are not fabricated as real history.

### Customer cart and booking UX

-   Cart page previously had +/- quantity controls; intended behaviour
    is editing dates/quantity through booking-details UI.
-   Checkout placeholder remains to be completed.
-   AddToCartButton feedback/visibility issue was previously noted.
-   Ensure incomplete selected items block checkout.
-   Recalculate availability and estimates when booking details change.
-   Preserve guest cart and merge/retain after sign-in.

### Vendor functionality

-   Vendor orders page was a placeholder.
-   Vendor listings and availability pages have active uncommitted
    modifications.
-   Preserve existing manual availability-block API and page behaviour.
-   Ensure vendor booking workflow follows payment-confirmed booking
    model, not vendor accept/reject.

### Payment and refunds

-   No payment provider selected or integrated.
-   Payment verification must be server-side before booking
    confirmation.
-   Refund tracking fields are planned/represented in schema but
    operational refund integration is not complete.

## 9. Development workflow and safety rules

The user has explicitly requested the following collaboration style:

1.  Give plain, step-by-step instructions with exact file paths and
    exact commands.
2.  Prefer complete corrected files or complete folder replacements when
    making code changes, rather than scattered snippets, where
    practical.
3.  Before requesting a folder structure or file already supplied, check
    conversation history first. Do not repeatedly ask for structures
    already known.
4.  Ask only for genuinely missing files or current versions that may
    have changed.
5.  Review dependencies and related files before proposing changes.
6.  Preserve unrelated functionality and all existing uncommitted work.
7.  Do not change wallet implementation, models, balances or financial
    logic unless explicitly requested.
8.  Do not integrate a payment provider without the user selecting one.
9.  Never run destructive database commands without explicitly
    explaining their impact and obtaining confirmation.
10. Do not run `migrate reset`, `db push`, or apply raw SQL blindly.
11. Review generated migration SQL before applying it, especially for
    `DROP`, `ALTER`, foreign-key, wallet or data-changing operations.
12. Use British English and avoid generic AI-sounding phrasing.
13. Do not claim a fix is complete until the user has applied it and the
    result has been verified.

## 10. Useful commands

Run from:

``` powershell
cd "C:\Users\Oreolorun\OneDrive\Desktop\next-jsblog-site"
```

### Schema checks

``` powershell
npx prisma validate
npx prisma format
npx prisma generate
```

### Migration status

``` powershell
npx prisma migrate status
```

### Preview database-to-schema SQL diff (read-only)

``` powershell
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

This prints SQL; it does not apply it.

### Inspect a migration file hash

``` powershell
Get-FileHash "prisma/migrations/20261123100203_add_wallet_and_statement/migration.sql" -Algorithm SHA256
```

### Inspect Git working tree

``` powershell
git status --short
```

### Show a migration from remote main without modifying local files

``` powershell
git fetch origin
git show origin/main:prisma/migrations/20261123100203_add_wallet_and_statement/migration.sql
```

### Normal future migration workflow (only after drift is resolved)

``` powershell
npx prisma migrate dev --name describe_your_changes
```

Do not use `migrate dev` while Prisma reports drift or asks to reset
unless the reset has been deliberately approved for the correct
database.

------------------------------------------------------------------------

## 11. Handover checklist for the next assistant

Before making any changes, establish:

-   [ ] Has the user edited the wallet migration to remove
    `statement_wallet_fk`?
-   [ ] Has the user run `npx prisma migrate reset`? If yes, when and
    against which database?
-   [ ] Is the configured remote database confirmed disposable?
-   [ ] Has a backup/export been made, or has the user explicitly
    accepted permanent data loss?
-   [ ] What does `npx prisma migrate status` currently report?
-   [ ] Does the wallet migration file still contain the two check
    constraints?
-   [ ] Does the actual `Statement` table currently have only its
    primary key, or has its state changed?
-   [ ] Are the booking and inventory changes still pending?
-   [ ] Has the exposed Prisma credential been rotated?
-   [ ] What is the current `git status --short`? Preserve all
    uncommitted application and schema changes.

**Do not assume the reset/replay plan was executed. Ask for the current
terminal output if the user has not confirmed it.**
