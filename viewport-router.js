(function () {
  "use strict";

  const script = document.currentScript;
  const current = script?.dataset.current || "auto";
  const mobileMaxWidth = Number(script?.dataset.mobileMaxWidth || 820);
  const routes = {
    desktop: "Aevenmere%20Atelier.html",
    mobile: "Aevenmere%20Atelier%20-%20Mobile.html"
  };

  const params = new URLSearchParams(window.location.search);
  const forced = (params.get("view") || params.get("layout") || "").toLowerCase();

  function getViewportWidth() {
    const windowWidth = window.innerWidth || Number.POSITIVE_INFINITY;
    const docWidth = document.documentElement?.clientWidth || Number.POSITIVE_INFINITY;
    const width = Math.min(windowWidth, docWidth);
    return Number.isFinite(width) ? width : window.innerWidth || document.documentElement.clientWidth || 1024;
  }

  function getDesiredLayout() {
    return getViewportWidth() <= mobileMaxWidth ? "mobile" : "desktop";
  }

  function getTargetUrl(layout, keepLayoutParam) {
    const url = new URL(routes[layout], window.location.href);
    const nextParams = new URLSearchParams(window.location.search);

    if (!keepLayoutParam) {
      nextParams.delete("view");
      nextParams.delete("layout");
    }

    const search = nextParams.toString();
    url.search = search ? `?${search}` : "";
    url.hash = window.location.hash;
    return url;
  }

  function routeTo(layout, keepLayoutParam) {
    document.documentElement.dataset.viewportLayout = layout;

    if (current !== "auto" && current === layout) {
      return;
    }

    const target = getTargetUrl(layout, keepLayoutParam);
    if (target.href !== window.location.href) {
      window.location.replace(target.href);
    }
  }

  if (forced === "desktop" || forced === "mobile") {
    routeTo(forced, true);
    return;
  }

  routeTo(getDesiredLayout(), false);
})();
