// heatmap.js

window.__IEV_HEATMAP__ = (() => {

  let canvas, ctx;
  let nodes = [];
  let selectedNode = null;

  const hooks = window.__IEV_HOOKS__;

  function initCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "iev-heatmap";

    Object.assign(canvas.style, {
      position: "fixed",
      top: 0,
      left: 0,
      pointerEvents: "none",
      zIndex: 999998
    });

    resize();
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function collectNodes() {
    nodes = [];

    document.querySelectorAll("*").forEach(el => {
      const rect = el.getBoundingClientRect();

      if (
        rect.width < 6 ||
        rect.height < 6 ||
        rect.top > window.innerHeight ||
        rect.left > window.innerWidth
      ) return;

      const risk = scoreNode(el);

      if (risk > 0) {
        nodes.push({
          el,
          rect,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          risk
        });
      }
    });
  }

  function scoreNode(el) {
    let risk = 0;

    // Inputs / forms
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      risk += 20;
      if (el.type === "password") risk += 15;
    }

    if (el.tagName === "FORM") {
      risk += 25;
    }

    // Inline JS handlers
    for (let attr of el.attributes || []) {
      if (attr.name.startsWith("on")) {
        risk += 15;
      }
    }

    // Event listeners from hooks
    if (hooks.listeners.some(l => l.target === el)) {
      risk += 20;
    }

    // DOM injection hints
    if (el.innerHTML && el.innerHTML.includes("<script")) {
      risk += 30;
    }

    // Reflected params
    const params = new URLSearchParams(location.search);
    for (let [k, v] of params) {
      if (v && el.innerText && el.innerText.includes(v)) {
        risk += 35;
      }
    }

    // Data attributes (often dynamic)
    if ([...el.attributes].some(a => a.name.startsWith("data-"))) {
      risk += 5;
    }

    return risk;
  }

  function drawHeat() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(n => {
      const radius = 30 + n.risk;

      const intensity = Math.min(n.risk / 80, 1);

      const gradient = ctx.createRadialGradient(
        n.x, n.y, 0,
        n.x, n.y, radius
      );

      gradient.addColorStop(0, `rgba(255, ${Math.floor(255 - intensity * 255)}, 0, 0.75)`);
      gradient.addColorStop(1, "rgba(255,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // highlight selected
      if (selectedNode && selectedNode.el === n.el) {
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(n.rect.left, n.rect.top, n.rect.width, n.rect.height);
      }
    });
  }

  function findNodeAt(x, y) {
    return nodes.find(n =>
      x >= n.rect.left &&
      x <= n.rect.right &&
      y >= n.rect.top &&
      y <= n.rect.bottom
    );
  }

  function handleClick(e) {
    const node = findNodeAt(e.clientX, e.clientY);
    if (!node) return;

    selectedNode = node;
    window.__IEV_UI__.showNodeDetails(node);
  }

  function loop() {
    collectNodes();
    drawHeat();
    requestAnimationFrame(loop);
  }

  function observeDOM() {
    const observer = new MutationObserver(() => {
      collectNodes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  function start() {
    initCanvas();
    observeDOM();

    document.addEventListener("click", handleClick, true);

    loop();
  }

  return {
    start
  };

})();
