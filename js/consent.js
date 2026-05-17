// consent.js — Consent Mode v2 banner & update handler
// Works alongside gtag.js which sets denied-by-default consent.
// Persists choice in localStorage key 'consent_v2'.
(function () {
  var STORAGE_KEY = 'consent_v2';
  var BANNER_ID = 'consent-banner';

  var ANALYTICS_GRANT = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  };

  var ANALYTICS_DENY = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  };

  function applyConsent(choice) {
    if (typeof window.gtag === 'function') {
      gtag('consent', 'update', choice === 'accepted' ? ANALYTICS_GRANT : ANALYTICS_DENY);
    }
  }

  function saveAndApply(choice) {
    try { localStorage.setItem(STORAGE_KEY, choice); } catch (e) { /* ignore */ }
    applyConsent(choice);
    hideBanner();
  }

  function hideBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (banner) banner.hidden = true;
  }

  function showBanner() {
    var banner = document.getElementById(BANNER_ID);
    if (banner) banner.hidden = false;
  }

  function createBanner() {
    var banner = document.createElement('aside');
    banner.id = BANNER_ID;
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.hidden = true;

    var text = document.createElement('p');
    text.className = 'consent-banner__text';
    text.textContent = 'We use analytics cookies to understand how this site is used. You can decline and we will only use essential cookies.';

    var actions = document.createElement('div');
    actions.className = 'consent-banner__actions';

    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'consent-banner__btn consent-banner__btn--accept';
    acceptBtn.textContent = 'Accept analytics';
    acceptBtn.addEventListener('click', function () { saveAndApply('accepted'); });

    var declineBtn = document.createElement('button');
    declineBtn.type = 'button';
    declineBtn.className = 'consent-banner__btn consent-banner__btn--decline';
    declineBtn.textContent = 'Decline';
    declineBtn.addEventListener('click', function () { saveAndApply('declined'); });

    actions.appendChild(acceptBtn);
    actions.appendChild(declineBtn);
    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);
    return banner;
  }

  function init() {
    var stored;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }

    if (stored === 'accepted' || stored === 'declined') {
      applyConsent(stored);
      return;
    }

    createBanner();
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
