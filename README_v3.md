# TSC English Academy - Premium English Lessons

**Live Site:** https://xx0019v.github.io/TSC/

## 🎯 Latest Improvements (v3.0)

### ✅ Completed Enhancements

#### 1. **Language Optimization** 
   - ✓ Removed Portuguese (PT) language completely
   - ✓ Streamlined to Japanese (JA) & English (EN) only
   - ✓ Updated language toggle UI and logic
   - ✓ Cleaned up JS/HTML references

#### 2. **Performance & Image Optimization**
   - ✓ Added lazy loading attributes to images (`loading="lazy"`)
   - ✓ Implemented image pre-loading for critical assets
   - ✓ Enhanced Service Worker with network-first + cache-first strategies
   - ✓ Optimized cache versioning (v5 → v6)
   - ✓ Added manifest.json (PWA support improvements)

#### 3. **Security Enhancements**
   - ✓ Added Content-Security-Policy (CSP) meta tag
   - ✓ Implemented Referrer-Policy: `strict-origin-when-cross-origin`
   - ✓ Added Permissions-Policy for privacy (geolocation, microphone, camera disabled)
   - ✓ Enhanced iframe sandboxing for Google Forms

#### 4. **SEO & Structured Data**
   - ✓ Expanded JSON-LD structured data (EducationalOrganization, FAQPage)
   - ✓ Added social media schema (LinkedIn, Twitter, Instagram)
   - ✓ Improved og:locale and OGP meta tags (JP & EN)
   - ✓ Added Twitter Card with proper creator attribution

#### 5. **Social Links & Contact**
   - ✓ Added LinkedIn profile link in footer
   - ✓ Added Twitter account link (@tscenglish)
   - ✓ Added Instagram profile link
   - ✓ Maintained email contact: tscenglishacademy@gmail.com

#### 6. **Mobile & UX Improvements**
   - ✓ Enhanced touch feedback for mobile devices
   - ✓ Optimized fixed CTA button for mobile (<768px)
   - ✓ Added safe area inset support for notch devices
   - ✓ Improved accessibility (aria labels, focus states)
   - ✓ Added skip-to-content link for keyboard navigation

#### 7. **Performance Monitoring**
   - ✓ Integrated Core Web Vitals monitoring (LCP, CLS, FID/INP)
   - ✓ Added lightweight performance logging
   - ✓ Enabled fallback lazy loading for legacy browsers

#### 8. **PWA Ready**
   - ✓ manifest.json with installable app config
   - ✓ Service Worker offline support
   - ✓ Shortcut actions (Free Trial, FAQ)
   - ✓ Theme color & display mode optimization

---

## 📁 Project Structure

```
TSC/
├── index.html              (Main landing page - optimized v3.0)
├── manifest.json          (PWA manifest - enhanced)
├── sw.js                  (Service Worker - v6)
├── css/
│   ├── base.css          (Core styles, animations, typography)
│   ├── hero.css          (Hero section with parallax)
│   └── components.css    (Cards, buttons, UI components)
├── js/
│   ├── ui.js             (Language toggle, year, accessibility)
│   ├── effects.js        (Scroll effects, parallax)
│   └── particles.js      (Particle animation system)
├── images/               (Optimized images)
└── README.md            (This file)
```

---

## 🚀 How to Deploy

**Your site is already live at:** https://xx0019v.github.io/TSC/

To push latest changes to GitHub:

```powershell
cd 'c:\Users\SHINTAROGAB\TSC'
git add .
git commit -m "v3.0: Full optimization - language consolidation, security, PWA"
git push origin main
```

---

## 🎨 Features

### Multilingual Support
- Japanese (日本語) - Default
- English (English)

### Interactive Elements
- **Language Toggle** - Top-right corner (JA/EN)
- **Dynamic Hero Section** - Parallax background with responsive layout
- **Feature Cards** - 3D tilt effect with smooth animations
- **Responsive CTA Buttons** - Ripple & gradient animations
- **Premium Animations** - Breathing effects, sheen sweeps, custom transitions

### Performance
- **Service Worker Caching** - Network-first + cache-first strategy
- **Image Lazy Loading** - Reduces initial load time
- **Critical CSS Inlining** - Faster first paint
- **Preload/Prefetch** - Optimized resource hints

### Accessibility
- Semantic HTML5 structure
- ARIA labels & roles
- Keyboard navigation support
- Focus indicators
- Motion preference respecting (`prefers-reduced-motion`)

### Security
- Content-Security-Policy (CSP)
- Referrer-Policy protection
- Permissions-Policy (privacy-first)
- Real-time iframe security

---

## 📊 Performance Metrics Targeted

| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID (First Input Delay) | < 100ms |
| Time to Interactive | < 3.5s |

---

## 🔧 Quick Customization

### Change Brand Colors
Edit `:root` in `css/base.css`:
```css
--brand-gold: #d4af37;          /* Primary color */
--brand-gold-soft: #f3e7c9;     /* Light variant */
```

### Update Contact Email
Search for: `tscenglishacademy@gmail.com`  
Replace with your email

### Modify Form URL
Find & update the Google Forms embed URL

---

## 📞 Contact

**Email:** tscenglishacademy@gmail.com  
**Website:** https://xx0019v.github.io/TSC/

---

**Version:** 3.0 | **Last Updated:** 2026-02-08 | © 2026 TSC English Academy
