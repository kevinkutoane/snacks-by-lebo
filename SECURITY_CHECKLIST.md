# Snacks by Lebo - Security Checklist for Payment Gateway Integration

## ✅ Implemented Security Measures

### 1. XSS Prevention
- [x] All dynamic content is sanitized using `sanitizeHTML()` function
- [x] Product names, descriptions, and user inputs are escaped before DOM insertion
- [x] Cart item names are validated against the catalog

### 2. Input Validation
- [x] Quantity limits enforced (max 50 per item, max 100 in cart)
- [x] Form fields have `maxlength` attributes
- [x] Input patterns for phone numbers, names, and postal codes
- [x] Email format validation with regex
- [x] Autocomplete attributes added for better UX and security

### 3. Price Tampering Prevention
- [x] Prices always fetched from product catalog, never from localStorage
- [x] Cart validation on load removes items not in catalog
- [x] Totals recalculated from catalog on every render
- [x] Server-side validation comments added as reminders

### 4. Security Headers (Meta Tags)
- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY` (prevents clickjacking)
- [x] `X-XSS-Protection: 1; mode=block`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] Basic Content Security Policy (CSP)

### 5. Rate Limiting
- [x] Client-side rate limiter prevents rapid cart operations
- [x] Buttons disabled during feedback animations

### 6. Reference Number Generation
- [x] Uses `crypto.getRandomValues()` when available
- [x] Timestamp + random string format for uniqueness

---

## 🔴 CRITICAL: Before Going Live with Payments

### Server-Side Requirements

#### 1. Backend API Required
```
⚠️ You MUST implement a backend server for payment processing!

Current status: Client-side only (NOT SAFE for real payments)
```

**Minimum backend endpoints needed:**
- `POST /api/orders` - Create order with server-validated prices
- `POST /api/checkout` - Initiate payment with gateway
- `POST /api/webhooks/payment` - Handle payment gateway callbacks
- `GET /api/orders/:id` - Check order status

#### 2. Server-Side Price Validation
```javascript
// Example: Node.js/Express
app.post('/api/orders', async (req, res) => {
    const { items } = req.body;
    
    // ALWAYS recalculate on server
    const validatedItems = items.map(item => {
        const product = PRODUCT_CATALOG[item.id];
        if (!product) throw new Error('Invalid product');
        return {
            ...item,
            price: product.price, // Use SERVER price
            total: product.price * item.quantity
        };
    });
    
    const serverTotal = validatedItems.reduce((sum, item) => sum + item.total, 0);
    // Never trust client's total!
});
```

#### 3. HTTPS Required
```
⚠️ Payment pages MUST be served over HTTPS only!

Action items:
- [ ] Obtain SSL certificate (Let's Encrypt is free)
- [ ] Configure server to redirect HTTP → HTTPS
- [ ] Add HSTS header: Strict-Transport-Security: max-age=31536000
```

#### 4. PCI DSS Compliance
```
If handling card data, you must comply with PCI DSS.

RECOMMENDED: Use hosted payment pages from your gateway:
- PayFast (South Africa): Hosted checkout page
- Stripe: Stripe Checkout or Elements
- PayPal: PayPal Checkout buttons

This way, card numbers never touch your server!
```

---

## 💳 Payment Gateway Integration Guide

### Option 1: PayFast (Recommended for South Africa)

**Update CSP for PayFast:**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.payfast.co.za;
    frame-src https://www.payfast.co.za https://sandbox.payfast.co.za;
    connect-src 'self' https://api.payfast.co.za;
">
```

**Security checklist for PayFast:**
- [ ] Validate signature on ITN (Instant Transaction Notification)
- [ ] Verify payment amount matches order total
- [ ] Check merchant ID in ITN matches your account
- [ ] Use sandbox environment for testing first

### Option 2: Stripe

**Update CSP for Stripe:**
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' https://js.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    connect-src 'self' https://api.stripe.com;
">
```

**Security checklist for Stripe:**
- [ ] Use Stripe Elements (card fields in iframe)
- [ ] Implement webhook signature verification
- [ ] Use idempotency keys for payment intents
- [ ] Enable Radar for fraud detection

---

## 🔒 Additional Security Recommendations

### 1. CSRF Protection
When adding a backend, implement CSRF tokens:
```javascript
// Add to all forms
<input type="hidden" name="_csrf" value="{{csrfToken}}">

// Validate on server
app.use(csrfProtection);
```

### 2. Rate Limiting (Server-Side)
```javascript
// Example: express-rate-limit
const rateLimit = require('express-rate-limit');

const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 checkout attempts per window
    message: 'Too many checkout attempts'
});

app.post('/api/checkout', checkoutLimiter, checkoutHandler);
```

### 3. Input Sanitization (Server-Side)
```javascript
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

// Sanitize all user inputs
customerData.firstName = sanitizeHtml(req.body.firstName);
customerData.email = validator.normalizeEmail(req.body.email);
```

### 4. Logging & Monitoring
- [ ] Log all payment attempts (success and failure)
- [ ] Set up alerts for unusual activity
- [ ] Implement audit trail for orders
- [ ] Monitor for suspicious patterns

### 5. Database Security
- [ ] Use parameterized queries (prevent SQL injection)
- [ ] Encrypt sensitive data at rest
- [ ] Never store full card numbers
- [ ] Hash/encrypt customer passwords

---

## 📋 Pre-Launch Checklist

### Before accepting real payments:

- [ ] Backend API implemented and tested
- [ ] HTTPS configured with valid SSL certificate
- [ ] Payment gateway integrated in sandbox/test mode
- [ ] Server-side price validation implemented
- [ ] Webhook signature verification working
- [ ] Rate limiting active on all endpoints
- [ ] CSRF protection enabled
- [ ] Error logging and monitoring set up
- [ ] Privacy policy and terms of service published
- [ ] PCI DSS compliance verified (if handling cards directly)
- [ ] Test all payment flows thoroughly
- [ ] Set up refund/cancellation process
- [ ] Customer support email/phone ready

---

## 📞 Support Resources

- **PayFast Documentation**: https://developers.payfast.co.za/
- **Stripe Security Guide**: https://stripe.com/docs/security
- **OWASP Security Guide**: https://owasp.org/www-project-web-security-testing-guide/
- **PCI DSS**: https://www.pcisecuritystandards.org/

---

*Document Version: 1.0*  
*Last Updated: February 2026*
