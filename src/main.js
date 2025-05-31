import { Client, Databases, ID } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT ?? '')
  .setProject(process.env.APPWRITE_PROJECT_ID ?? '')
  .setKey(process.env.APPWRITE_API_KEY ?? '');

const databases = new Databases(client);

// Constants
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? '';
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID ?? '';
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

// Bot detection patterns (based on isbot library patterns)
const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /whatsapp/i,
  /skype/i,
  /telegram/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,
  /automation/i,
];

// Function to detect if user agent is a bot
function isBot(userAgent) {
  if (!userAgent) return true; // No user agent is suspicious

  const ua = userAgent.toLowerCase();

  // Check against bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return true;
    }
  }

  // Additional heuristics
  if (ua.length < 20) return true; // Very short user agents are suspicious
  if (!ua.includes('mozilla')) return true; // Most browsers include mozilla

  return false;
}

// Function to get geolocation data from Geoapify
async function getLocationData(ip) {
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/ipinfo?ip=${ip}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();

    return {
      country: data.country?.name || null,
      region: data.state?.name || null,
      city: data.city?.name || null,
      latitude: data.location?.latitude || null,
      longitude: data.location?.longitude || null,
      timezone: data.timezone?.name || null,
      isp: data.isp || null,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      country: null,
      region: null,
      city: null,
      latitude: null,
      longitude: null,
      timezone: null,
      isp: null,
    };
  }
}

// Function to parse browser information
function parseBrowserInfo(userAgent) {
  if (!userAgent)
    return { browser: 'Unknown', version: 'Unknown', os: 'Unknown' };

  const ua = userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  let os = 'Unknown';

  // Browser detection
  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes('Firefox')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/(\d+\.\d+)/);
    if (match) version = match[1];
  } else if (ua.includes('Opera') || ua.includes('OPR')) {
    browser = 'Opera';
    const match = ua.match(/(Opera|OPR)\/(\d+\.\d+)/);
    if (match) version = match[2];
  }

  // OS detection
  if (ua.includes('Windows NT')) {
    os = 'Windows';
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const ntVersion = match[1];
      switch (ntVersion) {
        case '10.0':
          os = 'Windows 10/11';
          break;
        case '6.3':
          os = 'Windows 8.1';
          break;
        case '6.2':
          os = 'Windows 8';
          break;
        case '6.1':
          os = 'Windows 7';
          break;
        default:
          os = `Windows NT ${ntVersion}`;
      }
    }
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (match) os = `macOS ${match[1].replace(/_/g, '.')}`;
  } else if (ua.includes('Linux')) {
    os = 'Linux';
    if (ua.includes('Android')) {
      os = 'Android';
      const match = ua.match(/Android (\d+\.\d+)/);
      if (match) os = `Android ${match[1]}`;
    }
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    const match = ua.match(/OS (\d+_\d+)/);
    if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
  }

  return { browser, version, os };
}

// Main function handler
export default async ({ req, res, log, error }) => {
  try {
    console.log('Received request:', req.method, req.url);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return res.send('', 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
    }

    // Only allow POST and OPTIONS methods
    if (req.method !== 'POST') {
      return res.json({ error: 'Method not allowed' }, 405);
    }

    // Parse request body
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Get client IP address
    const clientIP =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.connection?.remoteAddress ||
      'unknown';

    // Get user agent
    const userAgent = req.headers['user-agent'] || '';

    // Get referrer
    const referrer =
      req.headers['referer'] || req.headers['referrer'] || data.referrer || '';

    // Extract browser information
    const browserInfo = parseBrowserInfo(userAgent);

    // Detect if it's a bot
    const isRobot = isBot(userAgent);

    // Get location data
    const locationData = await getLocationData(clientIP);

    // Prepare document data
    const documentData = {
      // Timestamp
      timestamp: new Date().toISOString(),

      // Page information
      url: data.url || '',
      title: data.title || '',
      referrer: referrer,

      // User information
      userAgent: userAgent,
      browser: browserInfo.browser,
      browserVersion: browserInfo.version,
      operatingSystem: browserInfo.os,

      // Network information
      ipAddress: clientIP,

      // Location information
      country: locationData.country,
      region: locationData.region,
      city: locationData.city,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      timezone: locationData.timezone,
      isp: locationData.isp,

      // Bot detection
      isRobot: isRobot,

      // Additional data from client
      screenWidth: data.screenWidth || null,
      screenHeight: data.screenHeight || null,
      windowWidth: data.windowWidth || null,
      windowHeight: data.windowHeight || null,
      language: data.language || null,
      platform: data.platform || null,

      // Custom event data
      eventType: data.eventType || 'pageview',
      eventData: (data.eventData && JSON.stringify(data.eventData)) || null,
    };

    log('Processing analytics event:', JSON.stringify(documentData, null, 2));

    // Save to database
    const result = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      documentData
    );

    log('Document created successfully:', result.$id);

    // Return success response
    return res.json(
      {
        success: true,
        id: result.$id,
        timestamp: documentData.timestamp,
      },
      200,
      {
        'Access-Control-Allow-Origin': '*',
      }
    );
  } catch (err) {
    error('Error processing analytics event:', err);
    return res.json(
      {
        success: false,
        error: err.message,
      },
      500,
      {
        'Access-Control-Allow-Origin': '*',
      }
    );
  }
};
