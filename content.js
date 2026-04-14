// content.js

(function () {

  // Core modules
  const scanner  = window.__IEV_SCANNER__;
  const analyzer = window.__IEV_ANALYZER__;
  const scorer   = window.__IEV_SCORER__;
  const reporter = window.__IEV_REPORTER__;
  const hooks    = window.__IEV_HOOKS__;
  const heatmap  = window.__IEV_HEATMAP__;
  const ui       = window.__IEV_UI__;

  let lastReport = null;

  // --- INIT SEQUENCE ---
  function init() {
    waitForDOM().then(() => {
      ui.init();
      heatmap.start();

      runFullScan();

      // periodic rescans (for SPAs / dynamic pages)
      setInterval(runFullScan, 8000);

      observeURLChanges();
    });
  }

  function waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", resolve);
      }
    });
  }

  // --- CORE SCAN PIPELINE ---
  function runFullScan() {
    try {
      const results = {
        endpoints: scanner.extractEndpoints(),
        params: scanner.extractParams(),
        csp: scanner.detectCSP(),
        listeners: scanner.listEventListeners(),
        secrets: analyzer.findSecrets(),
        domXSS: analyzer.detectDOMXSS(),
        jwt: analyzer.detectJWT(),
        requests: hooks.requests || []
      };

      const scoreData = scorer.score(results);

      const report = reporter.generate(results, scoreData);

      lastReport = report;

      updateFloatingSummary(report);

      console.log("[IEV SCAN]", report);

    } catch (err) {
      console.warn("[IEV ERROR]", err);
    }
  }

  // --- FLOATING SUMMARY (top-right mini HUD) ---
  function updateFloatingSummary(report) {
    let el = document.getElementById("iev-summary");

    if (!el) {
      el = document.createElement("div");
      el.id = "iev-summary";

      Object.assign(el.style, {
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "black",
        color: "#00ff99",
        fontFamily: "monospace",
        fontSize: "11px",
        padding: "8px",
        border: "1px solid #00ff99",
        zIndex: 999999
      });

      document.body.appendChild(el);
    }

    const issueText = report.issues.length
      ? report.issues.join(", ")
      : "none";

    el.innerHTML = `
      <div><b>IEV</b></div>
      <div>Score: ${report.score}/100</div>
      <div>Issues: ${issueText}</div>
      <button id="iev-export-btn">Export</button>
    `;

    document.getElementById("iev-export-btn").onclick = () => {
      reporter.download(report);
    };
  }

  // --- SPA / URL CHANGE DETECTION ---
  function observeURLChanges() {
    let lastURL = location.href;

    const observer = new MutationObserver(() => {
      if (location.href !== lastURL) {
        lastURL = location.href;

        console.log("[IEV] URL changed, rescanning...");
        setTimeout(runFullScan, 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // --- OPTIONAL: GLOBAL HOTKEYS ---
  function registerHotkeys() {
    document.addEventListener("keydown", (e) => {

      // CTRL + SHIFT + E → export report
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        if (lastReport) {
          reporter.download(lastReport);
        }
      }

      // CTRL + SHIFT + R → force rescan
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
        runFullScan();
      }

    });
  }

  registerHotkeys();
  init();

})();
