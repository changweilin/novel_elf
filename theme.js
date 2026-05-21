(function () {
  const KEY = "aevenmere.theme.v1";
  const THEMES = ["dark", "light"];

  function systemTheme() {
    try {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      return "dark";
    }
  }

  function storedTheme() {
    try {
      const value = localStorage.getItem(KEY);
      return THEMES.includes(value) ? value : null;
    } catch {
      return null;
    }
  }

  let currentTheme = storedTheme() || systemTheme();

  function syncMeta(theme) {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme === "light" ? "#f6ead6" : "#14110d");
  }

  function applyTheme(theme, persist) {
    currentTheme = THEMES.includes(theme) ? theme : systemTheme();
    document.documentElement.dataset.theme = currentTheme;
    document.documentElement.style.colorScheme = currentTheme;
    syncMeta(currentTheme);
    if (persist) {
      try { localStorage.setItem(KEY, currentTheme); } catch {}
    }
    window.dispatchEvent(new CustomEvent("aevenmere:themechange", { detail: { theme: currentTheme } }));
  }

  function setTheme(theme) {
    applyTheme(theme, true);
  }

  function toggleTheme() {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }

  function subscribe(callback) {
    const handler = (event) => callback(event.detail.theme);
    window.addEventListener("aevenmere:themechange", handler);
    return () => window.removeEventListener("aevenmere:themechange", handler);
  }

  function useTheme() {
    const ReactRef = window.React;
    const [theme, setThemeState] = ReactRef.useState(currentTheme);
    ReactRef.useEffect(() => subscribe(setThemeState), []);
    return [theme, setTheme];
  }

  function ThemeToggle({ className = "" } = {}) {
    const [theme, setThemeValue] = window.AevenTheme.useTheme();
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";
    const label = isDark ? "Dark" : "Light";
    return React.createElement(
      "button",
      {
        type: "button",
        className: `theme-toggle ${className}`.trim(),
        "aria-label": `Switch to ${nextTheme} mode`,
        title: `Switch to ${nextTheme} mode`,
        onClick: () => setThemeValue(nextTheme)
      },
      React.createElement("span", { className: "theme-toggle-mark", "aria-hidden": "true" },
        React.createElement("span", { className: "theme-toggle-orb" })
      ),
      React.createElement("span", { className: "theme-toggle-label" }, label)
    );
  }

  window.AevenTheme = {
    KEY,
    get: () => currentTheme,
    set: setTheme,
    toggle: toggleTheme,
    subscribe,
    useTheme
  };
  window.ThemeToggle = ThemeToggle;

  applyTheme(currentTheme, false);

  try {
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onSystemChange = () => {
      if (!storedTheme()) applyTheme(systemTheme(), false);
    };
    if (query.addEventListener) query.addEventListener("change", onSystemChange);
    else if (query.addListener) query.addListener(onSystemChange);
  } catch {}
})();
