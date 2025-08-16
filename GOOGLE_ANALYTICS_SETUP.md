# Google Analytics Setup Guide

## 1. Get Your Google Analytics Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Create a new property or select an existing one
4. Copy your Measurement ID (format: G-XXXXXXXXXX or GA_XXXXXXXXX)

## 2. Set Up Environment Variables

Create a `.env.local` file in your project root and add:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

## 3. Features Included

### Automatic Page Tracking
- Tracks all page views automatically
- Handles dynamic routes and search parameters
- Sends page title and URL to Google Analytics

### Custom Event Tracking
Use the `trackEvent` function to track custom events:

```typescript
import { trackEvent } from '@/components/GoogleAnalytics';

// Track a button click
trackEvent('click', 'button', 'reservation_button');

// Track a form submission
trackEvent('submit', 'form', 'booking_form');

// Track with value
trackEvent('purchase', 'ecommerce', 'property_booking', 150);
```

### Manual Page View Tracking
Use the `trackPageView` function for custom page view tracking:

```typescript
import { trackPageView } from '@/components/GoogleAnalytics';

trackPageView('/custom-page');
```

## 4. Privacy & Compliance

The integration includes:
- IP anonymization
- Secure cookie flags
- GDPR-friendly configuration

## 5. Testing

1. Deploy your site or run locally
2. Open browser developer tools
3. Check the Network tab for requests to `googletagmanager.com`
4. Verify in Google Analytics Real-Time reports

## 6. Common Events to Track

### User Engagement
```typescript
// Property views
trackEvent('view', 'property', propertyId);

// Search queries
trackEvent('search', 'property_search', searchQuery);

// Booking attempts
trackEvent('begin_checkout', 'booking', propertyId);
```

### Business Goals
```typescript
// Successful bookings
trackEvent('purchase', 'booking', propertyId, totalPrice);

// Contact form submissions
trackEvent('generate_lead', 'contact', 'contact_form');

// Newsletter signups
trackEvent('sign_up', 'newsletter', 'email_signup');
```

## 7. Troubleshooting

### Analytics not working?
- Check that `NEXT_PUBLIC_GA_ID` is set correctly
- Verify the ID format (G-XXXXXXXXXX)
- Check browser console for errors
- Ensure ad blockers are disabled for testing

### Events not showing?
- Wait 24-48 hours for data to appear
- Check Real-Time reports for immediate feedback
- Verify event parameters are correct

## 8. Advanced Configuration

You can modify the GoogleAnalytics component to add:
- Enhanced ecommerce tracking
- User ID tracking
- Custom dimensions and metrics
- Cross-domain tracking

## 9. Performance Impact

- Script loads asynchronously (no blocking)
- Minimal impact on page load times
- Automatic cleanup and optimization 