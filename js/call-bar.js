// Tuck the phone call bar (css/call-bar.css) away while another call button is already on screen,
// so phones never show two "Call" buttons at once. Without this script the bar simply stays up.
(function () {
  var bar = document.querySelector('a.sticky-call');
  if (!bar || !('IntersectionObserver' in window)) return;
  var others = [].slice.call(document.querySelectorAll('a[href^="tel:"]')).filter(function (a) {
    return a !== bar && a.offsetParent !== null && !a.closest('footer, .footer');
  });
  if (!others.length) return;
  var onScreen = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) onScreen.add(e.target); else onScreen.delete(e.target);
    });
    bar.classList.toggle('is-tucked', onScreen.size > 0);
  }, { rootMargin: '0px 0px -90px 0px' });
  others.forEach(function (a) { io.observe(a); });
})();
