# Universal Security Audit Checklist for Claude Code

Add this to your `~/.claude/CLAUDE.md` to apply security checks to ALL projects.

---

## Security Audit Instructions

When reviewing or writing code, ALWAYS check for these security issues. Before completing any feature that involves APIs, authentication, payments, or user data, run through this checklist.

### 1. Secrets Management

**Check:**
- [ ] No API keys, tokens, or secrets in client-side code (React, Vue, mobile apps)
- [ ] No secrets in git history (even if removed from current code)
- [ ] Environment variables used for all secrets
- [ ] `.env` files in `.gitignore`

**Red flags:**
```javascript
// BAD - secret in client code
const OPENAI_KEY = "sk-...";
const stripe = Stripe("sk_live_...");

// BAD - even with env, if it's EXPO_PUBLIC_ or NEXT_PUBLIC_, it's in the client bundle!
const key = process.env.NEXT_PUBLIC_SECRET_KEY; // This is exposed!
```

**Fix:** Move all API calls to a backend/serverless function.

---

### 2. Authentication & Authorization

**Check:**
- [ ] Every API endpoint verifies user identity (not just "is logged in")
- [ ] Server validates user can access the specific resource they're requesting
- [ ] JWTs are verified on every request, not just login
- [ ] Sensitive operations (delete, payment, admin) have extra verification

**Red flags:**
```javascript
// BAD - no auth check
app.get("/api/user/:id", (req, res) => {
  return db.getUser(req.params.id); // Anyone can get any user!
});

// BAD - only checks if logged in, not if authorized
app.delete("/api/posts/:id", authMiddleware, (req, res) => {
  return db.deletePost(req.params.id); // Any user can delete any post!
});
```

**Fix:**
```javascript
// GOOD - verify ownership
app.delete("/api/posts/:id", authMiddleware, (req, res) => {
  const post = db.getPost(req.params.id);
  if (post.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  return db.deletePost(req.params.id);
});
```

---

### 3. Premium Features (Don't Hide, Withhold)

**Check:**
- [ ] Premium content/features are gated on the SERVER, not just hidden in UI
- [ ] Usage limits enforced server-side, not client-side
- [ ] Tier/subscription status verified on each protected request

**Red flags:**
```javascript
// BAD - client-side gating
if (user.isPro) {
  showPremiumFeature();
}

// BAD - client checks limit
const canGenerate = usage.count < 5;
```

**Fix:** Server returns 403 if user doesn't have access. Client just displays the error.

---

### 4. Rate Limiting

**Check:**
- [ ] All public endpoints have rate limiting
- [ ] Rate limits are per-user or per-IP
- [ ] Expensive operations (AI, email, SMS) have strict limits

**Implement:**
```javascript
// Upstash Redis example
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

// In handler
const { success } = await ratelimit.limit(userId || ip);
if (!success) return res.status(429).json({ error: "Rate limited" });
```

---

### 5. Input Validation & Sanitization

**Check:**
- [ ] All user input is validated (type, length, format)
- [ ] Strings are sanitized to prevent XSS
- [ ] SQL queries use parameterized statements (not string concat)
- [ ] File uploads are validated (type, size, content)
- [ ] Allow-lists used for enums (conditions, categories, etc.)

**Red flags:**
```javascript
// BAD - SQL injection
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);

// BAD - XSS
element.innerHTML = userInput;

// BAD - no validation
db.insert({ name: req.body.name, age: req.body.age });
```

**Fix:**
```javascript
// GOOD - parameterized
db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);

// GOOD - sanitized
element.textContent = userInput;

// GOOD - validated
const schema = z.object({ name: z.string().max(100), age: z.number().min(0).max(150) });
const validated = schema.parse(req.body);
```

---

### 6. Server-Side Logic

**Check:**
- [ ] Price calculations done on server
- [ ] Discounts/coupons validated on server
- [ ] Sensitive business logic runs on server only
- [ ] Client can't manipulate scores, points, or balances

**Red flags:**
```javascript
// BAD - client calculates price
const total = items.reduce((sum, item) => sum + item.price, 0);
const withDiscount = total * 0.8; // User can just change this!
fetch("/api/checkout", { body: { amount: withDiscount } });
```

**Fix:** Send item IDs to server; server calculates everything.

---

### 7. Error Handling

**Check:**
- [ ] Error messages to users are generic ("Something went wrong")
- [ ] Stack traces never exposed to client
- [ ] Database errors never exposed to client
- [ ] Detailed errors logged server-side only

**Red flags:**
```javascript
// BAD - exposes internals
catch (error) {
  res.status(500).json({ error: error.message, stack: error.stack });
}
```

**Fix:**
```javascript
catch (error) {
  console.error("Checkout error:", error); // Log details
  res.status(500).json({ error: "Something went wrong" }); // Generic to user
}
```

---

### 8. Logging

**Check:**
- [ ] No passwords logged
- [ ] No full credit card numbers logged
- [ ] No API keys or tokens logged
- [ ] No PII (email, SSN, address) in logs unless necessary
- [ ] Logs don't include request bodies with sensitive data

**Red flags:**
```javascript
// BAD
console.log("User login:", { email, password });
console.log("Payment:", req.body); // Contains card number!
```

---

### 9. Dependencies

**Check:**
- [ ] No known vulnerabilities: `npm audit` / `yarn audit`
- [ ] Dependencies regularly updated
- [ ] Lock files committed (package-lock.json, yarn.lock)
- [ ] Minimal dependencies for attack surface reduction

**Run:**
```bash
npm audit
npm outdated
```

---

### 10. Security Headers

**Check for these headers on API responses:**
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy` (appropriate for your app)
- [ ] `Strict-Transport-Security` (for HTTPS)

---

## Quick Audit Command

When auditing a project, run these checks:

```bash
# Check for exposed secrets
grep -r "sk-" --include="*.ts" --include="*.js" --include="*.tsx" src/ app/ lib/ components/
grep -r "api_key\|apiKey\|API_KEY\|secret\|password" --include="*.ts" --include="*.js" src/

# Check for SQL injection patterns
grep -r "SELECT.*\${" --include="*.ts" --include="*.js" src/
grep -r "INSERT.*\${" --include="*.ts" --include="*.js" src/

# Check for innerHTML (XSS risk)
grep -r "innerHTML" --include="*.tsx" --include="*.jsx" src/

# Check dependencies
npm audit

# Check for console.log with sensitive data
grep -r "console.log.*password\|console.log.*token\|console.log.*key" --include="*.ts" --include="*.js" src/
```

---

## Before Deploying Checklist

- [ ] All F's turned to A's in the security audit
- [ ] `.env.example` documents all required variables
- [ ] Production environment variables set (not dev values)
- [ ] CORS restricted to your domain (not `*`)
- [ ] Rate limiting enabled
- [ ] Auth required on protected endpoints
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Error messages are generic to users
- [ ] No `console.log` with sensitive data

---

## For Claude Code

Add this to your project or global CLAUDE.md:

```markdown
## Security Requirements

Before completing any PR or feature:
1. Run the security checklist above
2. Verify no secrets in client code
3. Verify all endpoints check authorization (not just authentication)
4. Verify rate limiting on public endpoints
5. Verify input validation and sanitization
6. Verify premium features are server-gated
```
