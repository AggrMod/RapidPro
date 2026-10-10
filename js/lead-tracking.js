// Email lead tracking for Google Analytics 4 (G-YN82WFKX62, loaded inline on each page).
// Phone taps are already tracked by each page's inline script as `phone_click`; this adds `email_click` for mailto:
// links. Mark `phone_click` and `email_click` as key events in GA4 (Admin → Events) so Google Ads can import them.
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
    if (!a || typeof window.gtag !== 'function') return;
    window.gtag('event', 'email_click', {
      email_address: (a.getAttribute('href') || '').replace(/^mailto:/i, '').split('?')[0],
      page_path: location.pathname,
      link_text: (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      transport_type: 'beacon',
    });
  }, true);
})();
