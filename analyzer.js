window.__IEV_ANALYZER__ = (() => {

  function findSecrets() {
    const matches = [];

    const regexes = [
      /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9\-_]{16,}/i,
      /token\s*[:=]\s*['"][A-Za-z0-9\-_\.]{20,}/i,
      /Bearer\s+[A-Za-z0-9\-_\.]+/i
    ];

    document.querySelectorAll("script").forEach(s => {
      const text = s.innerText;

      regexes.forEach(r => {
        if (r.test(text)) {
          matches.push({
            type: "secret",
            snippet: text.slice(0, 120)
          });
        }
      });
    });

    return matches;
  }

  function detectDOMXSS() {
    const risky = [];

    document.querySelectorAll("*").forEach(el => {
      if (el.innerHTML && el.innerHTML.includes("<script")) {
        risky.push({
          type: "dom-xss",
          tag: el.tagName
        });
      }
    });

    return risky;
  }

  function detectJWT() {
    const tokens = [];

    const regex = /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g;

    document.body.innerText.replace(regex, (m) => {
      tokens.push({
        token: m,
        decoded: parseJWT(m)
      });
    });

    return tokens;
  }

  function parseJWT(token) {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  return {
    findSecrets,
    detectDOMXSS,
    detectJWT
  };

})();
