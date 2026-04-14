window.__IEV_FUZZ__ = (() => {

  const payloads = [
    "' OR 1=1 --",
    "<script>alert(1)</script>",
    "../../etc/passwd",
    "\" onmouseover=alert(1) x=\""
  ];

  function fuzzInputs() {
    document.querySelectorAll("input[type='text'], textarea").forEach(el => {
      payloads.forEach(p => {
        el.value = p;
      });
    });
  }

  function fuzzURL() {
    const url = new URL(window.location.href);
    url.searchParams.forEach((v, k) => {
      url.searchParams.set(k, payloads[0]);
    });

    window.location.href = url.toString();
  }

  return {
    fuzzInputs,
    fuzzURL
  };

})();
