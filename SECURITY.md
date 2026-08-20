# Security notes

## Fixed in the application

| Issue | Before | Now |
| --- | --- | --- |
| Admin privilege escalation | `auth-token` cookie held the raw user id in readable client state; middleware trusted it verbatim. Setting it to any known id granted that account. | `gm_session` is httpOnly and HMAC-signed (`lib/session.ts`). Middleware verifies the signature locally; `app/admin/layout.tsx` and every admin API route re-check the role against the database. |
| User table exposed to the browser | Login downloaded every user record — email, role and **plaintext password** — and compared in JavaScript. | `POST /api/auth/login` compares server-side. The browser only ever receives its own `PublicUser`, which has no password field. |
| Plaintext passwords | Stored and compared as-is. | scrypt with a per-user salt (`lib/server/password.ts`). Existing plaintext records are accepted once and transparently upgraded on next login. |
| Client-controlled prices | The browser computed the discounted price and wrote it into the persisted cart; totals derived from it. | The cart request carries only `{id, quantity}`. `lib/server/cart.ts` re-prices from the catalog on every read and write; `POST /api/checkout` recomputes the order total server-side. |
| Direct browser-to-database writes | Product create/edit/delete and role changes ran from the browser through the Firebase client SDK. | All mutations go through `/api/admin/*` behind `requireAdmin()`. The Firebase client SDK is no longer a dependency. |
| Database URL in the client bundle | `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_USERS_URL` were inlined into every page. | `FIREBASE_DB_URL` is server-only; `lib/server/db.ts` imports `server-only`. |
| No server-side validation | Rules lived only in the client form. | `lib/server/validation.ts` runs on every write. Image URLs are restricted to https on an allowlisted host, which also blocks `javascript:` and `data:` URLs. |
| Unthrottled credential endpoints | Login happened client-side, so there was nothing to throttle. | `lib/server/rate-limit.ts` — 8 login attempts/minute, 5 registrations/hour, per IP. |
| Account enumeration | — | Wrong email and wrong password return the same message. |
| Cross-account access | The profile page took the user id from client state. | `/api/account` acts only on `session.userId`. |
| Privilege in request body | — | `role` is hard-coded to `"user"` at registration; an admin cannot demote themselves. |
| Secrets in logs | Errors echoed database responses. | `safeUrl()` redacts `?auth=`; handlers log a message and return a generic one. |

## Action still required from you

### 1. Lock down the Firebase Realtime Database rules — highest priority

The `/users` node is currently **world-readable and world-writable**. Confirmed during the audit:

```
GET https://goo-market-db-default-rtdb.firebaseio.com/users.json?shallow=true  ->  200
```

The application no longer depends on those open rules — every read and write now happens
server-side — but the rules themselves are still open, so anyone on the internet can still read
or delete the data directly. **Nothing in this refactor can fix that; it has to be changed in the
Firebase console.**

In *Realtime Database → Rules*, replace the current rules with:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "products": {
      ".read": true,
      ".write": false
    }
  }
}
```

Then create a service credential and set it in the environment:

```
FIREBASE_DB_AUTH=<database secret or service-account ID token>
```

`lib/server/db.ts` appends it as `?auth=` on every request, so the server keeps full access while
the public loses it.

### 2. Rotate the leaked credentials

The Firebase web config was hard-coded in `firebase/config.js` and committed to git. That file is
deleted, but it is still in the history. Rotate the key in the Firebase console, and treat every
password currently in the database as compromised — they were stored in plaintext behind an open
endpoint, so they should be assumed public. Consider forcing a reset for all existing accounts.

### 3. Set `AUTH_SECRET` in production

`.env` has a generated value for local use. Production needs its own:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rotating it invalidates every existing session.

### 4. Restrict the Cloudinary upload preset

`NEXT_PUBLIC_UPLOAD_PRESET` is public by design — that is how unsigned browser uploads work — but
the preset should be constrained in the Cloudinary console: allowed formats, a max file size, and a
dedicated folder. Otherwise it is an open file host.

### 5. Dependency advisories

`npm audit` reports 3 high-severity advisories in `postcss` and `sharp`, both transitive
dependencies of `next@15.5.12`. They are not reachable from application code, and the only fix
npm offers is `next@16`, a major upgrade that was out of scope for this pass. Plan that upgrade
separately.

## Known limitations

- **Rate limiting is per-process.** `lib/server/rate-limit.ts` uses an in-memory map, so on a
  multi-instance or serverless deployment each instance counts separately. Move it to a shared
  store (Upstash, Redis) or a platform WAF rule before this sees real traffic.
- **Checkout is simulated.** There is no payment provider. The server now computes and validates
  the order total and stock before clearing the cart, so the boundary is in the right place, but
  no money moves and no order record is written.
- **No CSRF tokens.** The session cookie is `SameSite=Lax` and all mutations are non-GET, which
  covers the common cases. Add tokens if the cookie ever needs to be `SameSite=None`.
