(function () {

  const scanner = window.__IEV_SCANNER__;
  const analyzer = window.__IEV_ANALYZER__;
  const scorer = window.__IEV_SCORER__;
  const reporter = window.__IEV_REPORTER__;
  const hooks = window.__IEV_HOOKS__;

  function fullScan() {

    const results = {
      endpoints: scanner.extractEndpoints(),
      params: scanner.extractParams(),
      csp: scanner.detectCSP(),
      listeners: scanner.listEventListeners(),
      secrets: analyzer.findSecrets(),
      domXSS: analyzer.detectDOMXSS(),
      jwt: analyzer.detectJWT(),
      requests: hooks.requests
    };

    const scoreData = scorer.score(results);
    const report = reporter.generate(results, scoreData);

    injectOverlay(report);

    console.log("[IEV REPORT]", report);
  }

  function injectOverlay(report) {
    const el = document.createElement("div");

    el.innerHTML = `
      <div><b>Score:</b> ${report.score}/100</div>
      <div><b>Issues:</b> ${report.issues.join(", ")}</div>
      <button id="iev-export">Export Report</button>
    `;

    el.style = `
      position:fixed;
      bottom:10px;
      right:10px;
      background:black;
      color:#00ff99;
      padding:10px;
      z-index:999999;
      font-family:monospace;
      border:1px solid #00ff99;
    `;

    document.body.appendChild(el);

    document.getElementById("iev-export").onclick = () => {
      reporter.download(report);
    };
  }

  setTimeout(fullScan, 1500);

})();
