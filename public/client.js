(function () {
  'use strict';

  const CONFIG = {
    APPWRITE_FUNCTION_URL: 'https://analytics.keithw.me',
    TRACK_OUTBOUND_LINKS: true,
    TRACK_FILE_DOWNLOADS: true,
    TRACK_SCROLL_DEPTH: true,
    DEBUG: false, // Set to true for debugging
  };

  const script = document.currentScript;

  // Debug logging function
  function debug(...args) {
    if (CONFIG.DEBUG) {
      console.log('[Analytics]', ...args);
    }
  }

  function collectSystemInfo() {
    const nav = navigator;
    const screen = window.screen;
    const siteId = script && script.dataset && script.dataset.siteId;

    return {
      userAgent: nav.userAgent,
      language: nav.language || nav.language,
      platform: nav.platform,
      screenWidth: screen.width,
      screenHeight: screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer,
      url: window.location.href,
      title: document.title,
      siteId: siteId || null,
    };
  }

  async function sendAnalyticsData(eventData) {
    try {
      const systemInfo = collectSystemInfo();
      const payload = {
        ...systemInfo,
        ...eventData,
        timestamp: new Date().toISOString(),
      };

      debug('Sending analytics data:', payload);

      const response = await fetch(CONFIG.APPWRITE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      debug('Analytics data sent successfully:', result);
    } catch (error) {
      debug('Error sending analytics data:', error);
      // Fail silently to not affect user experience
    }
  }

  function trackPageView() {
    sendAnalyticsData({
      eventType: 'page_view',
      eventData: {
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
    });
  }

  // Custom events
  function trackEvent(eventName, eventData = {}) {
    sendAnalyticsData({
      eventType: 'custom_event',
      eventData: {
        eventName: eventName,
        ...eventData,
      },
    });
  }

  function trackOutboundLinks() {
    if (!CONFIG.TRACK_OUTBOUND_LINKS) return;

    document.addEventListener('click', function (event) {
      const link =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || !link.href) return;

      try {
        const linkUrl = new URL(link.href);
        const currentUrl = new URL(window.location.href);

        // Check if it's an outbound link
        if (linkUrl.hostname !== currentUrl.hostname) {
          sendAnalyticsData({
            eventType: 'outbound_link_click',
            eventData: {
              url: link.href,
              text: (link.textContent && link.textContent.trim()) || null,
              target: linkUrl.hostname,
            },
          });
        }
      } catch (error) {
        debug('Error tracking outbound link:', error);
      }
    });
  }

  function trackFileDownloads() {
    if (!CONFIG.TRACK_FILE_DOWNLOADS) return;

    const downloadExtensions = [
      'pdf',
      'doc',
      'docx',
      'xls',
      'xlsx',
      'ppt',
      'pptx',
      'zip',
      'rar',
      '7z',
      'tar',
      'gz',
      'mp3',
      'mp4',
      'avi',
      'mov',
      'wmv',
      'jpg',
      'jpeg',
      'png',
      'gif',
      'svg',
      'exe',
      'dmg',
      'deb',
      'rpm',
    ];

    document.addEventListener('click', function (event) {
      const link =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || !link.href) return;

      try {
        const url = new URL(link.href);
        const pathname = url.pathname.toLowerCase();
        const extension = pathname.split('.').pop();

        if (extension && downloadExtensions.includes(extension)) {
          sendAnalyticsData({
            eventType: 'file_download',
            eventData: {
              url: link.href,
              filename: pathname.split('/').pop(),
              extension: extension,
              filesize: null, // Could be enhanced to detect file size
            },
          });
        }
      } catch (error) {
        debug('Error tracking file download:', error);
      }
    });
  }

  function trackScrollDepth() {
    if (!CONFIG.TRACK_SCROLL_DEPTH) return;

    let maxScrollDepth = 0;
    let scrollDepthMarkers = [25, 50, 75, 90, 100];
    let firedMarkers = new Set();

    function calculateScrollDepth() {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const scrollPercent = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      return Math.min(scrollPercent, 100);
    }

    function handleScroll() {
      const currentDepth = calculateScrollDepth();

      if (currentDepth > maxScrollDepth) {
        maxScrollDepth = currentDepth;

        // Check if we've hit any new markers
        scrollDepthMarkers.forEach((marker) => {
          if (currentDepth >= marker && !firedMarkers.has(marker)) {
            firedMarkers.add(marker);
            sendAnalyticsData({
              eventType: 'scroll_depth',
              eventData: {
                depth: marker,
                maxDepth: maxScrollDepth,
              },
            });
          }
        });
      }
    }

    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function () {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    });
  }

  // Track time on page (send when user leaves)
  function trackTimeOnPage() {
    const startTime = Date.now();

    function sendTimeOnPage() {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds

      if (timeSpent > 5) {
        // Only track if user spent more than 5 seconds
        sendAnalyticsData({
          eventType: 'time_on_page',
          eventData: {
            timeSpent: timeSpent,
            url: window.location.href,
          },
        });
      }
    }

    // Send time on page when user leaves
    window.addEventListener('beforeunload', sendTimeOnPage);
    window.addEventListener('pagehide', sendTimeOnPage);

    // Also send periodically for long sessions
    setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 0 && timeSpent % 300 === 0) {
        // Every 5 minutes
        sendAnalyticsData({
          eventType: 'session_ping',
          eventData: {
            timeSpent: timeSpent,
            url: window.location.href,
          },
        });
      }
    }, 30000); // Check every 30 seconds
  }

  function initAnalytics() {
    const siteId = script && script.dataset && script.dataset.siteId;

    if (!siteId) {
      console.warn(
        'No site ID found in script tag. Analytics will not be initialized.'
      );
      return;
    }

    debug('Initializing analytics...');

    // Track initial page view
    trackPageView();

    // Set up event tracking
    trackOutboundLinks();
    trackFileDownloads();
    trackScrollDepth();
    trackTimeOnPage();

    debug('Analytics initialized successfully');
  }

  // Public API
  window['analytics'] = {
    track: trackEvent,
    pageview: trackPageView,
    config: CONFIG,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalytics);
  } else {
    // DOM is already ready
    setTimeout(initAnalytics, 0);
  }

  debug('Analytics script loaded');
})();
