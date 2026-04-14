// overlay.js

window.__IEV_UI__ = (() => {

  let panel;

  function init() {
    panel = document.createElement("div");
    panel.id = "iev-panel";

    panel.innerHTML = `
      <div class="iev-title">IEV :: NODE INSPECTOR</div>
      <div id="iev-content">click a hotspot...</div>
    `;

    document.body.appendChild(panel);

    injectStyles();
  }

  function injectStyles() {
    const style = document.createElement("style");

    style.textContent = `
      #iev-panel {
        position: fixed;
        bottom: 10px;
        left: 10px;
        width: 320px;
        max-height: 50vh;
        overflow-y: auto;
        background: black;
        color: #00ff99;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border: 1px solid #00ff99;
        z-index: 999999;
      }

      .iev-title {
        font-weight: bold;
        margin-bottom: 6px;
        color: #00ffff;
      }

      .iev-section {
        margin-top: 8px;
        border-top: 1px solid #003322;
        padding-top: 5px;
      }

      button {
        background: black;
        color: #00ff99;
        border: 1px solid #00ff99;
        margin-top: 5px;
        cursor: pointer;
        width: 100%;
      }
    `;

    document.head.appendChild(style);
  }

  function showNodeDetails(node) {
    const el = node.el;

    const listeners = window.__IEV_HOOKS__.listeners
      .filter(l => l.target === el)
      .map(l => l.type);

    const html = `
      <div><b>Tag:</b> ${el.tagName}</div>
      <div><b>Risk:</b> ${node.risk}</div>

      <div class="iev-section">
        <b>Attributes:</b><br>
        ${[...el.attributes].map(a => `${a.name}="${a.value}"`).join("<br>")}
      </div>

      <div class="iev-section">
        <b>Event Listeners:</b><br>
        ${listeners.join(", ") || "none"}
      </div>

      <div class="iev-section">
        <b>Actions</b>
        <button id="iev-fuzz-node">Fuzz This Input</button>
      </div>
    `;

    document.getElementById("iev-content").innerHTML = html;

    attachActions(el);
  }

  function attachActions(el) {
    const btn = document.getElementById("iev-fuzz-node");

    if (!btn) return;

    btn.onclick = () => {
      if (el.value !== undefined) {
        el.value = "<script>alert(1)</script>";
      }
    };
  }

  return {
    init,
    showNodeDetails
  };

})();
