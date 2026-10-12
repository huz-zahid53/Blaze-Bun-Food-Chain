/**
 * Strip `bis_skin_checked` (and similar) attributes injected by browser
 * extensions (Urban VPN, Bitdefender, etc.) BEFORE React hydrates.
 *
 * Loaded via next/script strategy="beforeInteractive" so it executes
 * before any framework JS. A MutationObserver ensures late injections
 * are also caught.
 */
(function () {
  var ATTR = "bis_skin_checked";

  // 1. Sweep anything already present
  var dirty = document.querySelectorAll("[" + ATTR + "]");
  for (var i = 0; i < dirty.length; i++) {
    dirty[i].removeAttribute(ATTR);
  }

  // 2. Catch future injections — the extension may run its content-script
  //    after this file but before React hydration finishes.
  if (typeof MutationObserver !== "undefined") {
    var observer = new MutationObserver(function (mutations) {
      for (var j = 0; j < mutations.length; j++) {
        var m = mutations[j];
        if (m.type === "attributes" && m.attributeName === ATTR) {
          m.target.removeAttribute(ATTR);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [ATTR],
      subtree: true,
    });

    // Stop observing after hydration is long done (10 s) to avoid
    // keeping the observer alive for the entire session.
    setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }
})();
