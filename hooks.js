window.__IEV_HOOKS__ = (() => {

  const requests = [];

  function hookFetch() {
    const orig = window.fetch;

    window.fetch = async function (...args) {
      const res = await orig.apply(this, args);

      try {
        requests.push({
          type: "fetch",
          url: args[0],
          method: args[1]?.method || "GET"
        });
      } catch {}

      return res;
    };
  }

  const listeners = [];

function hookAddEventListener() {
  const orig = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    listeners.push({
      target: this,
      type
    });
    return orig.apply(this, arguments);
  };
}

hookAddEventListener();

  return {
  requests,
  listeners
};

  function hookXHR() {
    const origOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.__iev = { method, url };
      return origOpen.apply(this, arguments);
    };

    const origSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function () {
      if (this.__iev) {
        requests.push({
          type: "xhr",
          url: this.__iev.url,
          method: this.__iev.method
        });
      }
      return origSend.apply(this, arguments);
    };
  }

  function hookDOMSinks() {
    const sinks = [];

    const orig = Element.prototype.innerHTML;

    Object.defineProperty(Element.prototype, "innerHTML", {
      set(value) {
        sinks.push({
          type: "innerHTML",
          value: value.slice(0, 100)
        });
        return orig.call(this, value);
      }
    });

    return sinks;
  }

  function hookStorage() {
    const originalSet = localStorage.setItem;

    localStorage.setItem = function (k, v) {
      if (v && v.length > 50) {
        console.log("[IEV] Large localStorage write", k);
      }
      return originalSet.apply(this, arguments);
    };
  }

  function init() {
    hookFetch();
    hookXHR();
    hookStorage();
  }

  init();

  return {
    requests
  };

})();
