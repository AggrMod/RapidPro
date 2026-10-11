// The floating phone button (css/call-bar.css) stays on screen at all times on phones, above the fold
// included (Terry 10/10). This file used to hide it while another Call button was visible; it now only
// clears any leftover hidden state so cached pages from that version still show the button.
(function () {
  var bar = document.querySelector('a.sticky-call');
  if (bar) bar.classList.remove('is-tucked');
})();
