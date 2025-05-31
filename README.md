# Simple Analytics

A lightweight, privacy-focused web analytics solution built with Appwrite functions, Geoapify geolocation, and intelligent bot detection.

## 🚀 Features

- **Real-time Analytics**: Track page views, events, and user interactions
- **Bot Detection**: Intelligent filtering of bot traffic using user agent analysis
- **Geolocation**: City-level location data powered by Geoapify
- **Privacy-Focused**: No cookies, respects user privacy
- **Multiple Event Types**: Page views, clicks, downloads, scroll depth, time on page
- **Custom Events**: Track custom events with flexible data structure
- **Serverless**: Powered by Appwrite functions for scalability

## 🎯 What This Tool Tracks

### Automatic Events

- **Page Views**: Every page visit with full context
- **Outbound Links**: Clicks on external links
- **File Downloads**: Downloads of common file types (PDF, DOC, etc.)
- **Scroll Depth**: User engagement at 25%, 50%, 75%, 90%, 100%
- **Time on Page**: Session duration and engagement metrics

### User Context

- **Browser Information**: Browser type, version, OS
- **Location Data**: Country, region, city (via IP geolocation)
- **Device Information**: Screen resolution, window size
- **Network Information**: ISP, timezone
- **Bot Detection**: Automatic filtering of bot traffic

### Custom Events

Track any custom events with flexible data structure:

```javascript
analytics.track('button_click', {
  button_id: 'signup',
  section: 'header',
  campaign: 'summer2024',
});
```

## ⚡ Quick Start

### 1. Set Up Appwrite

1. Create an Appwrite project
2. Set up database and collection (see `setup-guide.md`)
3. Generate API keys

### 2. Get API Keys

- **Appwrite**: Project ID, API key, database/collection IDs
- **Geoapify**: Free API key (3,000 requests/day)

### 3. Configure & Deploy Function

```bash
# Update configuration in appwrite-analytics-function.js
# Deploy using the helper script
chmod +x deploy.sh
./deploy.sh
```

### 4. Add to Your Website

```html
<!-- Include the script -->
<script src="analytics-client.js"></script>

<!-- Or inline it -->
<script>
  // Paste analytics-client.js content here
  // Update CONFIG.APPWRITE_FUNCTION_URL first
</script>
```

## 📊 Data Schema

The system stores data in Appwrite with the following structure:

```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "url": "https://example.com/page",
  "title": "Page Title",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "browser": "Chrome",
  "browserVersion": "91.0",
  "operatingSystem": "Windows 10",
  "ipAddress": "192.168.1.1",
  "country": "United States",
  "region": "California",
  "city": "San Francisco",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "timezone": "America/Los_Angeles",
  "isp": "Example ISP",
  "isRobot": false,
  "eventType": "pageview",
  "eventData": {},
  "screenWidth": 1920,
  "screenHeight": 1080,
  "windowWidth": 1200,
  "windowHeight": 800,
  "language": "en-US",
  "platform": "Win32"
}
```

## 🤖 Bot Detection

The system uses multiple techniques to identify bots:

- **User Agent Analysis**: Pattern matching against known bot signatures
- **Behavioral Signals**: Missing user agents, suspicious patterns
- **Automation Detection**: Headless browsers, automation tools
- **Known Bot Lists**: Common crawlers and spiders

Detected bots are marked with `isRobot: true` for easy filtering.

## 🌍 Geolocation

Location data is provided by Geoapify's IP Geolocation API:

- **Accuracy**: City-level precision
- **Data Points**: Country, region, city, coordinates, timezone, ISP
- **Privacy**: No personal data stored, only IP-based location
- **Rate Limits**: 3,000 free requests/day

## 🔒 Privacy & Security

- **No Cookies**: Client-side script doesn't use cookies
- **No Fingerprinting**: Basic browser info only
- **IP Anonymization**: Consider anonymizing IPs in production
- **GDPR Compliance**: Designed with privacy regulations in mind
- **Rate Limiting**: Built-in protection against abuse

## 🛠️ Configuration Options

### Client-Side Options

```javascript
const CONFIG = {
  APPWRITE_FUNCTION_URL: 'your-function-url',
  TRACK_OUTBOUND_LINKS: true,
  TRACK_FILE_DOWNLOADS: true,
  TRACK_SCROLL_DEPTH: true,
  DEBUG: false,
};
```

### Function Environment Variables

- `DATABASE_ID`: Appwrite database ID
- `COLLECTION_ID`: Appwrite collection ID
- `GEOAPIFY_API_KEY`: Geoapify API key

## 📈 Usage Examples

### Basic Integration

```html
<script src="analytics-client.js"></script>
```

### Custom Event Tracking

```javascript
// Track user actions
analytics.track('video_play', { video_id: 'intro', duration: 120 });
analytics.track('search', { query: 'web analytics', results: 15 });
analytics.track('purchase', { product: 'premium', value: 99.99 });
```

### Single Page Applications

```javascript
// Manual page view tracking for SPAs
analytics.pageview();
```

## 🎛️ Advanced Features

### Custom Event Types

- E-commerce tracking
- Form submissions
- Video/media interactions
- Search queries
- Error tracking

### Data Analysis

The collected data can be used for:

- Traffic analysis and trends
- User behavior insights
- Performance monitoring
- Conversion tracking
- Geographic analysis

## 🧪 Testing

Use the included `example-integration.html` to test:

1. Open the file in a browser
2. Enable debug mode in analytics config
3. Open developer tools console
4. Interact with the page elements
5. Verify events are being tracked

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Configure Appwrite function domains
2. **No Data**: Check API keys and database permissions
3. **Function Timeouts**: Optimize function or increase timeout
4. **Rate Limits**: Monitor Geoapify usage

### Debug Mode

Enable debug logging:

```javascript
analytics.config.DEBUG = true;
```

## 📚 Documentation

- `setup-guide.md`: Detailed setup instructions
- `example-integration.html`: Working integration example
- Inline code comments for implementation details

## 🤝 Contributing

This is a simple analytics tool designed for educational and small-scale production use. Feel free to:

- Add new event types
- Improve bot detection
- Enhance privacy features
- Add data visualization

## 📄 License

MIT License - feel free to use and modify for your projects.

## 🔗 Related Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/products/functions)
- [Geoapify IP Geolocation API](https://www.geoapify.com/ip-geolocation-api)
- [Bot Detection Patterns](https://github.com/omrilotan/isbot)
- [Web Analytics Best Practices](https://www.google.com/analytics)

## ⚠️ Important Notes

1. **API Limits**: Monitor your Geoapify usage (3,000 free requests/day)
2. **Privacy Laws**: Ensure compliance with GDPR, CCPA, etc.
3. **Performance**: The client script is lightweight but test on your site
4. **Security**: Keep API keys secure and rotate regularly
5. **Scaling**: Consider upgrading Appwrite and Geoapify plans for high traffic

---

Built with ❤️ using Appwrite, Geoapify, and modern web technologies.
