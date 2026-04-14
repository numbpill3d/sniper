window.__IEV_HEATMAP__ = (() => {

  let canvas, ctx;
  let nodes = [];

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
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);

  function collectNodes() {
    nodes = [];

    document.querySelectorAll("*").forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 5 || rect.height < 5) return;

      const risk = scoreNode(el);

      if (risk > 0) {
        nodes.push({
          el,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          risk
        });
      }
    });
  }

  function scoreNode(el) {
    let risk = 0;

    // Inputs
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      risk += 20;
      if (el.type === "password") risk += 10;
    }

    // Inline events
    for (let attr of el.attributes || []) {
      if (attr.name.startsWith("on")) {
        risk += 15;
      }
    }

    // innerHTML usage hint
    if (el.innerHTML && el.innerHTML.includes("<script")) {
      risk += 25;
    }

    // data attributes often used for dynamic injection
    if ([...el.attributes].some(a => a.name.startsWith("data-"))) {
      risk += 5;
    }

    // forms
    if (el.tagName === "FORM") {
      risk += 25;
    }

    return risk;
  }

  function drawHeat() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(n => {
      const radius = 40 + n.risk;

      const gradient = ctx.createRadialGradient(
        n.x, n.y, 0,
        n.x, n.y, radius
      );

      gradient.addColorStop(0, `rgba(255,0,0,${Math.min(n.risk / 100, 0.8)})`);
      gradient.addColorStop(1, "rgba(255,0,0,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    collectNodes();
    drawHeat();
    requestAnimationFrame(loop);
  }

  function start() {
    initCanvas();
    loop();
  }

  return {
    start
  };

})();
