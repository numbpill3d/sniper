window.__IEV_SCORER__ = (() => {

  function score(results) {
    let score = 100;
    const issues = [];

    if (!results.csp.exists) {
      score -= 25;
      issues.push("Missing CSP");
    } else if (results.csp.weak) {
      score -= 15;
      issues.push("Weak CSP");
    }

    if (results.secrets.length > 0) {
      score -= 30;
      issues.push("Exposed secrets");
    }

    if (results.domXSS.length > 0) {
      score -= 20;
      issues.push("Potential DOM XSS");
    }

    if (results.jwt.length > 0) {
      score -= 10;
      issues.push("JWT exposed in DOM");
    }

    return {
      score: Math.max(score, 0),
      issues
    };
  }

  return { score };

})();
