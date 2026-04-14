window.__IEV_SCANNER__ = (() => {

  function extractEndpoints() {
    const endpoints = new Set();

    // forms
    document.querySelectorAll("form").forEach(f => {
      if (f.action) endpoints.add(f.action);
    });

    // anchors
    document.querySelectorAll("a[href]").forEach(a => {
      endpoints.add(a.href);
    });

    // scripts (possible APIs)
    document.querySelectorAll("script[src]").forEach(s => {
      endpoints.add(s.src);
    });

    return Array.from(endpoints);
  }

  function extractParams() {
    const params = new Set();

    // URL params
    const urlParams = new URLSearchParams(location.search);
    for (const [k] of urlParams) params.add(k);

    // input fields
    document.querySelectorAll("input[name]").forEach(i => {
      params.add(i.name);
    });

    return Array.from(params);
  }

  function detectCSP() {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) {
      return { exists: false, weak: true, value: null };
    }

    const value = meta.content;

    const weak =
      value.includes("*") ||
      value.includes("unsafe-inline") ||
      value.includes("unsafe-eval");

    return { exists: true, weak, value };
  }

  function listEventListeners() {
    const elements = document.querySelectorAll("*");
    const results = [];

    elements.forEach(el => {
      const listeners = getEventListenersSafe(el);
      if (listeners && Object.keys(listeners).length > 0) {
        results.push({
          tag: el.tagName,
          listeners: Object.keys(listeners)
        });
      }
    });

    return results;
  }

  function getEventListenersSafe(el) {
    try {
      return getEventListeners ? getEventListeners(el) : null;
    } catch {
      return null;
    }
  }

  function highlightInputs() {
    document.querySelectorAll("input, textarea").forEach(el => {
      el.style.outline = "2px solid red";
    });
  }

  return {
    extractEndpoints,
    extractParams,
    detectCSP,
    listEventListeners,
    highlightInputs
  };

})();
