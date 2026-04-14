document.getElementById("scan").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.__IEV_SCANNER__.extractEndpoints()
  }, (res) => {
    document.getElementById("output").textContent =
      JSON.stringify(res[0].result, null, 2);
  });
};

document.getElementById("fuzz").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.__IEV_FUZZ__.fuzzInputs()
  });
};
