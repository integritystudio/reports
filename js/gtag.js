// Google Analytics 4 — G-YXLT76BTM4
// Tracks: content groups, scroll depth (25/50/75/100%), card clicks, time on page
// Outbound links + file downloads handled by GA4 Enhanced Measurement (enable in admin)
(function () {
  var GA_ID = 'G-YXLT76BTM4';

  // --- Inject gtag script ---
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  // --- Content grouping from data-brand and path ---
  var brand = document.documentElement.getAttribute('data-brand') || 'unknown';
  var pathSegments = window.location.pathname.split('/').filter(Boolean);
  var section = pathSegments[0] || 'home';

  gtag('config', GA_ID, {
    content_group: brand,
    page_title: document.title,
    custom_map: {
      dimension1: 'brand',
      dimension2: 'section',
      dimension3: 'content_type'
    }
  });

  gtag('event', 'page_metadata', {
    brand: brand,
    section: section,
    content_type: detectContentType()
  });

  // --- Scroll depth via IntersectionObserver (25/50/75/100%) ---
  var SCROLL_THRESHOLDS = [25, 50, 75, 100];

  function initScrollTracking() {
    if (typeof IntersectionObserver === 'undefined') return;

    var docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var pct = parseInt(entry.target.getAttribute('data-scroll-pct'), 10);
        gtag('event', 'scroll_depth', {
          percent_scrolled: pct,
          brand: brand,
          section: section
        });
        observer.unobserve(entry.target);
        entry.target.parentNode.removeChild(entry.target);
      });
    }, { threshold: 0 });

    SCROLL_THRESHOLDS.forEach(function (pct) {
      var sentinel = document.createElement('div');
      sentinel.setAttribute('data-scroll-pct', pct);
      sentinel.setAttribute('aria-hidden', 'true');
      sentinel.style.cssText = 'position:absolute;left:0;width:1px;height:1px;pointer-events:none;';
      sentinel.style.top = Math.min(Math.round(docHeight * pct / 100), docHeight - 1) + 'px';
      document.body.appendChild(sentinel);
      observer.observe(sentinel);
    });

    return observer;
  }

  var scrollObserver = initScrollTracking();

  // --- Card click tracking ---
  function onCardClick(e) {
    var link = e.target.closest('a.card');
    if (!link) return;

    var titleEl = link.querySelector('.card-title');
    var categoryEl = link.querySelector('.card-category');

    gtag('event', 'card_click', {
      card_title: titleEl ? titleEl.textContent : '',
      card_category: categoryEl ? categoryEl.textContent : '',
      destination_url: link.getAttribute('href') || '',
      brand: brand,
      section: section
    });
  }

  document.addEventListener('click', onCardClick);

  // --- Time on page (30s, 60s, 180s, 300s) — pauses in background tabs ---
  var TIME_THRESHOLDS = [30, 60, 180, 300];
  var timeFired = {};
  var elapsedBeforePause = 0;
  var segmentStart = Date.now();
  var timeInterval = null;

  function checkTimeOnPage() {
    var elapsed = elapsedBeforePause + Math.floor((Date.now() - segmentStart) / 1000);
    var allFired = true;

    for (var i = 0; i < TIME_THRESHOLDS.length; i++) {
      var t = TIME_THRESHOLDS[i];
      if (!timeFired[t]) {
        allFired = false;
        if (elapsed >= t) {
          timeFired[t] = true;
          gtag('event', 'time_on_page', {
            seconds: t,
            brand: brand,
            section: section
          });
        }
      }
    }

    if (allFired) clearInterval(timeInterval);
  }

  function startTimeTracking() {
    segmentStart = Date.now();
    if (!timeInterval) timeInterval = setInterval(checkTimeOnPage, 5000);
  }

  function pauseTimeTracking() {
    elapsedBeforePause += Math.floor((Date.now() - segmentStart) / 1000);
    if (timeInterval) {
      clearInterval(timeInterval);
      timeInterval = null;
    }
  }

  startTimeTracking();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pauseTimeTracking();
    else startTimeTracking();
  });

  // --- Cleanup on page unload ---
  window.addEventListener('pagehide', function () {
    if (scrollObserver) scrollObserver.disconnect();
    document.removeEventListener('click', onCardClick);
    pauseTimeTracking();
  });

  // --- Content type detection (path-segment matching) ---
  function detectContentType() {
    var path = window.location.pathname.toLowerCase();
    var segment = '/' + (pathSegments[pathSegments.length - 1] || '');

    if (/whitepaper/.test(segment)) return 'whitepaper';
    if (/audit/.test(segment)) return 'audit';
    if (/competitor/.test(segment)) return 'competitor-analysis';
    if (/research/.test(segment)) return 'research';
    if (/prompt/.test(segment)) return 'prompts';
    if (/architecture/.test(segment)) return 'architecture';
    if (/index\.html$/.test(path) || path === '/' || /\/$/.test(path)) return 'index';
    return 'report';
  }
})();
