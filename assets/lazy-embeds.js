// Loads heavy third-party iframes (Instagram reels, Google Map) only when they are about to be seen.
(function () {
  var els = document.querySelectorAll('iframe[data-src]');
  function load(f) { f.src = f.dataset.src; f.removeAttribute('data-src'); }
  if (!('IntersectionObserver' in window)) { els.forEach(load); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { load(e.target); io.unobserve(e.target); } });
  }, { rootMargin: '300px 150px' });
  els.forEach(function (f) { io.observe(f); });
})();
