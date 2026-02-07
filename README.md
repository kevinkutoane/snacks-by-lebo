# Snacks by Lebo - E-Commerce Website

A modern, vibrant e-commerce platform for a kid's snacks startup business. Built with vanilla HTML, CSS, and JavaScript with no external dependencies.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [File Documentation](#file-documentation)
- [User Journey](#user-journey)
- [Shopping Cart System](#shopping-cart-system)
- [Checkout Process](#checkout-process)

---

## ✨ Features

### Core Features
- **Product Showcase**: 3 curated snack packages (Starter, Family, Premium)
- **Shopping Cart**: Add/remove items with quantity controls
- **Persistent Storage**: Cart saved in browser's localStorage
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Contemporary design with animations and gradients

### Package Options
1. **Starter Pack - R250**
   - 2x Fruity Rainbow Bites
   - 2x Crispy Veggie Chips
   - 2x Berry Blast Popcorn

2. **Family Favorites Pack - R450** (Most Popular)
   - 6 different snack varieties (2 of each)
   - Best value for families

3. **Ultimate Deluxe Pack - R600** (Best Value)
   - 9 different snack varieties (2 of each)
   - Complete collection

### Website Sections
- **Hero Section**: Eye-catching landing area with animated background
- **Products Section**: Package showcase with cart functionality
- **About Section**: 4 feature cards highlighting company values
- **Contact Section**: Contact information and inquiry form
- **Checkout Page**: Complete order form with banking details

---

## 📁 Project Structure

```
snacks_by_lebo/
├── index.html           # Main homepage
├── checkout.html        # Checkout & payment page
├── styles.css          # All styling and responsive design
├── script.js           # Main application logic
├── hero-bg.svg         # Animated hero background with fruits
└── README.md           # This file
```

---

## 🔄 Application Flow

### User Journey Map

```
┌─────────────────────────────────────────────────────────────┐
│                    SNACKS BY LEBO FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. LANDING (index.html)
   ↓
   ├─→ View Hero Section
   │   ├─→ Learn about brand
   │   └─→ Click "Explore Packages" button
   ↓
2. BROWSE PRODUCTS
   ├─→ See 3 package options
   ├─→ Choose quantity for each package
   └─→ Click "Add to Cart"
   ↓
3. SHOPPING CART (Modal Popup)
   ├─→ View added items
   ├─→ See subtotal + delivery fee (R50)
   ├─→ Remove items if needed
   └─→ Click "Proceed to Checkout"
   ↓
4. CHECKOUT PAGE (checkout.html)
   ├─→ Enter customer details
   │   ├─→ Name, email, phone
   │   └─→ Delivery address & notes
   ├─→ Choose payment method
   ├─→ Accept terms & conditions
   └─→ Click "Complete Order"
   ↓
5. ORDER CONFIRMATION
   ├─→ Display bank details
   ├─→ Show reference number
   ├─→ Redirect to homepage
   └─→ Cart cleared
   ↓
6. PAYMENT (Manual Process)
   └─→ Customer transfers money to bank account
       ├─→ Receives SMS/Email confirmation (2 hours)
       └─→ Order fulfilled
```

---

## 🛠 Technology Stack

- **Frontend**: HTML5
- **Styling**: CSS3 (Grid, Flexbox, Gradients, Animations)
- **Interactivity**: Vanilla JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **Icons**: Unicode Emojis
- **Graphics**: SVG (hero background)

### No Dependencies
- ✅ No jQuery
- ✅ No Bootstrap
- ✅ No Build tools required
- ✅ No external APIs
- ✅ Works offline

---

## 🚀 Setup Instructions

### Quick Start

1. **Extract Files**
   ```bash
   Extract all files to a folder
   ```

2. **Open in Browser**
   ```bash
   Double-click index.html
   Or right-click → Open with Browser
   ```

3. **Start Shopping**
   - Browse products
   - Add to cart
   - Proceed to checkout

### Alternative: Web Server
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (with http-server installed)
http-server

# Then visit: http://localhost:8000
```

---

## 📄 File Documentation

### index.html
**Main homepage of the website**

Sections:
- Navigation bar with logo and cart icon
- Hero section with animated background
- Products grid (3 snack packages)
- About us with feature cards
- Contact form
- Footer with links

Key Elements:
```html
<nav class="navbar">           <!-- Sticky navigation -->
<section id="products">        <!-- Product showcase -->
<section id="about">           <!-- Company values -->
<section id="contact">         <!-- Contact form -->
<div id="cartModal">           <!-- Shopping cart modal -->
```

### checkout.html
**Dedicated checkout & payment page**

Sections:
- Customer information form
- Delivery address form
- Payment method selection
- Bank account details display
- Order summary sidebar
- Terms & conditions checkbox

Features:
- Auto-generated reference numbers
- Copy-to-clipboard bank details
- Real-time order calculations
- Form validation
- Responsive two-column layout

### styles.css
**Complete styling for the entire application (678 lines)**

Key Sections:
- **Root Variables**: Color schemes, shadows, transitions
- **Typography**: Font sizes, weights, letter-spacing
- **Navigation**: Navbar styling with hover effects
- **Hero**: Background animations, gradient effects
- **Products**: Card layouts, hover animations
- **Responsive**: Mobile-first breakpoints
- **Animations**: Float, blob, shimmer effects

Color Palette:
```css
Primary (Red):    #FF6B6B
Secondary (Teal): #4ECDC4
Accent (Yellow):  #FFE66D
Dark (Navy):      #2C3E50
Light (Off-white):#F8F9FA
```

### script.js
**Main application logic (380+ lines)**

Core Functions:

1. **Cart Management**
   - `addToCart()` - Add items with quantity
   - `removeFromCart()` - Remove single items
   - `updateCartDisplay()` - Update cart count badge

2. **Product Rendering**
   - `renderProducts()` - Display packages in grid
   - `increaseQuantity()` - Increment item quantity
   - `decreaseQuantity()` - Decrement item quantity

3. **Modal Controls**
   - `openCart()` - Show cart modal
   - `closeCart()` - Hide cart modal
   - `renderCartItems()` - Render items in modal

4. **Storage**
   - `saveCartToStorage()` - Save cart to localStorage
   - `loadCartFromStorage()` - Load cart from localStorage

5. **Checkout**
   - `checkout()` - Process checkout, redirect to checkout.html

6. **Navigation**
   - `setupNavigation()` - Active link tracking on scroll

### hero-bg.svg
**Animated SVG background for hero section**

Contains:
- 🍓 Strawberries with leaves
- 🍌 Bananas
- 🍉 Watermelon slices
- 🍊 Oranges
- 🍎 Apples
- 🍇 Grapes
- 🍿 Popcorn
- ✨ Sparkles and decorative elements

Features:
- Responsive SVG with gradients
- Glowing filter effects
- 60% opacity for text readability
- Matches brand colors

---

## 👥 User Journey

### First-Time Visitor

```
1. Lands on homepage
   ├─→ Reads hero tagline
   ├─→ Views company stats
   └─→ Clicks "Explore Packages"
   
2. Scrolls to products
   ├─→ Sees 3 package options
   ├─→ Reads descriptions and contents
   └─→ Compares pricing
   
3. Makes selection
   ├─→ Adjusts quantity with +/- buttons
   └─→ Clicks "Add to Cart"
   
4. Views about section
   ├─→ Learns company values
   ├─→ Sees key features
   └─→ Builds trust
   
5. Sees contact info
   ├─→ Gets phone/email
   └─→ Optional: Sends inquiry
```

### Returning Customer

```
1. Lands on homepage
2. Cart still has items (localStorage)
3. Clicks cart icon
4. Adjusts quantities
5. Proceeds to checkout
6. Fills details (usually faster)
7. Completes order
```

---

## 🛒 Shopping Cart System

### How It Works

**LocalStorage Implementation:**
```javascript
// Saves cart when items added/removed
localStorage.setItem('snacksCart', JSON.stringify(cart))

// Loads cart when page refreshes
const saved = localStorage.getItem('snacksCart')
cart = JSON.parse(saved)
```

### Cart Data Structure

```javascript
[
  {
    id: 1,
    name: "Starter Snack Pack",
    price: 250,
    quantity: 2,
    // ... other properties
  },
  {
    id: 2,
    name: "Family Favorites Pack",
    price: 450,
    quantity: 1,
    // ... other properties
  }
]
```

### Cart Features

| Feature | Details |
|---------|---------|
| **Quantity Control** | +/- buttons for each item |
| **Cart Count Badge** | Shows total items in cart |
| **Remove Items** | Delete individual packages |
| **Persistent** | Survives browser refresh |
| **Modal Display** | Popup overlay for viewing |
| **Summary** | Shows subtotal, delivery, total |

### Pricing Calculation

```
Total = (Sum of all item prices × quantities) + Delivery Fee
      = Subtotal + R50
```

---

## 💳 Checkout Process

### Step-by-Step Process

#### Step 1: Customer Information
- First & Last Name
- Email Address
- Phone Number

#### Step 2: Delivery Address
- Street Address
- City/Town
- Postal Code
- Delivery Notes (optional)

#### Step 3: Payment Method Selection
- Bank Transfer (primary)
- Mobile Money/EFT (alternative)

#### Step 4: Order Review
- Order summary displayed
- Bank account details shown
- Reference number generated

#### Step 5: Confirmation
- Terms checkbox required
- Submit button triggers confirmation

### Bank Account Details

```
Account Holder: Lebo Snacks (Pty) Ltd
Bank: First National Bank
Account Number: 62234567890
Branch Code: 250456
```

### Reference Number System

- **Format**: `LEBO-{timestamp}-{random}`
- **Example**: `LEBO-34567-89012`
- **Purpose**: Track customer orders
- **Display**: On checkout page and confirmation

### Confirmation Flow

```
1. Form submitted
   ↓
2. Validate all fields
   ↓
3. Check terms accepted
   ↓
4. Generate reference number
   ↓
5. Save order to localStorage
   ↓
6. Display confirmation alert
   ↓
7. Clear cart
   ↓
8. Redirect to home (2 second delay)
```

### Order Data Saved

```javascript
{
  customer: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+27123456789",
    address: "123 Main St",
    city: "Cape Town",
    postalCode: "8000",
    notes: "Gate code: 1234",
    paymentMethod: "bank"
  },
  items: [...],           // Cart items
  subtotal: 950,          // Sum of items
  delivery: 50,           // Fixed delivery fee
  total: 1000,            // Grand total
  reference: "LEBO-...", // Unique reference
  timestamp: "2026-01-22T..." // Order time
}
```

---

## 🎨 Design System

### Color Scheme

```
Primary Red:     #FF6B6B  (CTAs, badges, highlights)
Secondary Teal:  #4ECDC4  (Hover states, secondary CTAs)
Accent Yellow:   #FFE66D  (Call-to-action buttons, highlights)
Dark Navy:       #2C3E50  (Text, headers)
Light Off-White: #F8F9FA  (Backgrounds, secondary surfaces)
Success Green:   #95E1D3  (Checkmarks, confirmations)
```

### Typography

- **Font Family**: System fonts (Apple/Google/Microsoft defaults)
- **Headlines**: 800 weight, -0.5px letter-spacing
- **Body**: 400-500 weight, 1.6 line-height
- **Buttons**: 600 weight, uppercase for labels

### Spacing

- **Container Max**: 1200px
- **Section Padding**: 5rem top/bottom
- **Card Padding**: 2rem
- **Gap Between Items**: 2.5rem

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(0,0,0,0.08)
--shadow-md: 0 4px 16px rgba(0,0,0,0.12)
--shadow-lg: 0 12px 32px rgba(0,0,0,0.15)
--shadow-xl: 0 20px 48px rgba(0,0,0,0.2)
```

---

## 📱 Responsive Breakpoints

### Desktop (1200px+)
- 3-column product grid
- Two-column checkout layout
- Full navigation visible

### Tablet (768px - 1199px)
- 2-column product grid
- Stack checkout to single column
- Hamburger-friendly nav

### Mobile (480px - 767px)
- 1-column product grid
- Full-width forms
- Simplified navigation
- Touch-friendly buttons

---

## 🔐 Security Considerations

### What's Implemented
- ✅ Client-side form validation
- ✅ Required field checking
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Terms acceptance required

### What's NOT Implemented (Production)
- ❌ Server-side validation
- ❌ SSL/HTTPS (needed for production)
- ❌ Payment gateway integration
- ❌ Database storage
- ❌ Authentication/Authorization

### Production Recommendations
1. Move to HTTPS
2. Implement backend server
3. Add payment gateway (Stripe, PayFast, Yoco)
4. Store orders in database
5. Send actual emails/SMS
6. Add user accounts system
7. Implement order tracking

---

## 📊 Analytics Events

### Tracked Events (localStorage-based)

```javascript
- Product viewed
- Item added to cart
- Item removed from cart
- Cart viewed
- Checkout started
- Order completed
```

### Can be Enhanced With
- Google Analytics
- Mixpanel
- Amplitude
- Custom tracking dashboard

---

## 🐛 Troubleshooting

### Issue: Cart empties on refresh
**Solution**: Check browser localStorage is enabled
```javascript
// Check if localStorage works:
localStorage.setItem('test', 'value')
localStorage.getItem('test')  // Should return 'value'
```

### Issue: SVG background not showing
**Solution**: Ensure hero-bg.svg is in same directory

### Issue: Checkout page styles missing
**Solution**: Check styles.css is linked in checkout.html

### Issue: Forms not submitting
**Solution**: Check browser console for JavaScript errors

---

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] User accounts & login
- [ ] Order history & tracking
- [ ] Wishlist functionality
- [ ] Product reviews & ratings
- [ ] Email newsletter signup
- [ ] Live chat support

### Phase 3 Features
- [ ] Subscription boxes
- [ ] Loyalty rewards program
- [ ] Custom gift packages
- [ ] Bulk ordering
- [ ] B2B portal
- [ ] Social media integration

### Technical Improvements
- [ ] Service Worker for offline mode
- [ ] Progressive Web App (PWA)
- [ ] Image optimization
- [ ] Code splitting
- [ ] Automated testing (Jest, Cypress)
- [ ] CI/CD pipeline

---

## 📞 Support & Contact

**For Development Questions:**
- Review code comments (inline documentation)
- Check this README
- View console logs for debugging

**For Business Information:**
- Email: hello@snacksbylebo.com
- Phone: (555) 123-4567

---

## 📜 License

© 2026 Snacks by Lebo. All rights reserved.

---

## 👨‍💻 Code Quality Standards

### Comments
- ✅ Function headers with purpose
- ✅ Complex logic explained
- ✅ Variable names descriptive
- ✅ Event listeners documented

### Best Practices
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Mobile-first approach
- ✅ Progressive enhancement
- ✅ Accessibility considerations

---

**Last Updated**: January 22, 2026
**Version**: 1.0.0
