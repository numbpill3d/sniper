window.__IEV_REPORTER__ = (() => {

  function generate(results, scoreData) {
    return {
      url: location.href,
      timestamp: new Date().toISOString(),
      score: scoreData.score,
      issues: scoreData.issues,
      details: results
    };
  }

  function download(report) {
    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "iev-report.json";
    a.click();
  }

  return {
    generate,
    download
  };

})();
