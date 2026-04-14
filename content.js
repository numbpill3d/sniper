(function () {

  const scanner = window.__IEV_SCANNER__;
  const fuzz = window.__IEV_FUZZ__;

  function runScan() {
    const data = {
      endpoints: scanner.extractEndpoints(),
      params: scanner.extractParams(),
      csp: scanner.detectCSP(),
      listeners: scanner.listEventListeners()
    };

    console.log("[IEV] Scan Results:", data);
    injectOverlay(data);
  }

  function injectOverlay(data) {
    const panel = document.createElement("div");
    panel.id = "iev-overlay";

    panel.innerHTML = `
      <div class="iev-header">Exploit Surface</div>
      <div>Endpoints: ${data.endpoints.length}</div>
      <div>Params: ${data.params.length}</div>
      <div>CSP: ${data.csp.exists ? (data.csp.weak ? "Weak" : "OK") : "Missing"}</div>
      <button id="iev-highlight">Highlight Inputs</button>
      <button id="iev-fuzz">Fuzz Inputs</button>
    `;

    document.body.appendChild(panel);

    document.getElementById("iev-highlight").onclick = () => {
      scanner.highlightInputs();
    };

    document.getElementById("iev-fuzz").onclick = () => {
      fuzz.fuzzInputs();
    };
  }

  const style = document.createElement("style");
  style.textContent = `
    #iev-overlay {
      position: fixed;
      top: 10px;
      right: 10px;
      background: black;
      color: #00ff99;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      z-index: 999999;
      border: 1px solid #00ff99;
    }
    #iev-overlay button {
      display: block;
      margin-top: 5px;
      background: black;
      color: #00ff99;
      border: 1px solid #00ff99;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  runScan();

})();
