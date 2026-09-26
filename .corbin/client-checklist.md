# Client Onboarding Checklist

What every new client goes through, once. Per-client messages should only carry
what differs; point here for the rest.

## 1. Before the build starts

- [ ] Signed Service Agreement + Master Services Agreement (key terms summary sent first)
- [ ] Package chosen (Starter / Foundation / Growth) and any add-ons, with prerequisites listed
- [ ] Upkeep chosen: they maintain it, or I maintain it (monthly plan, $150/mo minimum)
- [ ] Domain election recorded (MSA 9.1): Option A, client stays registrant (recommended), or Option B, I am registrant and renewals are prepaid pass-through
- [ ] Content owner named: who sends copy, photos, logo, and approves drafts

## 2. Access the client grants (never a shared password)

Delegated or team access in the client's own accounts (MSA 9.6(f), 10.4(b)).

- [ ] **Domain registrar**: who it is, renewal date, auto-renew on, delegate/team access for DNS
- [ ] **DNS host** (if not the registrar, e.g. Cloudflare): member access to the zone
- [ ] **Email provider** (Google Workspace, Microsoft 365, other): admin or delegated access to the domain verification and DNS setup pages
- [ ] **Existing website host** (if moving): access or an export, and the date the old plan ends
- [ ] **Google Business Profile**: manager access (if they have one)
- [ ] **Other services the site touches** (booking, payments, forms, mailing list): named, with who owns each account

## 3. What I record before touching DNS

- [ ] Export of the current DNS zone (the rollback copy)
- [ ] Every record's purpose written down: website, email (MX), email authenticity (SPF, DKIM, DMARC), verifications
- [ ] Email is flowing today: a test message in and out before any change

## 4. Go-live (Phase 4 of the MSA build)

- [ ] Domain connected, SSL live on the bare domain and `www`
- [ ] Email records in place and a test message lands in an inbox, not spam
- [ ] Contact form tested end to end
- [ ] Zone export saved again after go-live

## 5. Handover

**If they maintain it:** every account is in their name, logins walked through, current DNS zone export handed over, and a note that they can bring me back as an administrator later.

**If I maintain it:** access kept, domain renewal dates in my calendar, the list of what I am responsible for agreed in writing, and how to reach me (support hours 1:00 - 9:00 pm Pacific, Monday to Friday, ticket or email).

## How issues are handled on the monthly plan

Worst problem first, then priority clients, as soon as possible:

1. **Severity**: site down or email not arriving before anything cosmetic.
2. **Priority clients**: within the same severity, higher tiers and accepted Priority Service go first (MSA 5.6).
3. **Order received** within the same severity and priority.
