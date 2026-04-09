(() => {
  const panels = Array.from(document.querySelectorAll(".panel"));
  const openButtons = Array.from(document.querySelectorAll("[data-panel]"));
  const closeButtons = Array.from(document.querySelectorAll("[data-close]"));

  const FOCUSABLE =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  let activePanel = null;
  let lastFocus = null;

  // iOS-safe scroll lock
  let scrollY = 0;
  function lockScroll() {
    scrollY = window.scrollY || 0;
    document.documentElement.classList.add("is-panel-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }
  function unlockScroll() {
    document.documentElement.classList.remove("is-panel-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  }

  // Scrim element
  let scrim = document.getElementById("panelScrim");
  if (!scrim) {
    scrim = document.createElement("div");
    scrim.id = "panelScrim";
    scrim.className = "panel-scrim";
    scrim.setAttribute("hidden", "");
    scrim.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrim);
  }

  function showScrim() {
    scrim.removeAttribute("hidden");
    requestAnimationFrame(() => scrim.classList.add("is-open"));
  }
  function hideScrim() {
    scrim.classList.remove("is-open");
    window.setTimeout(() => {
      scrim.setAttribute("hidden", "");
    }, 180);
  }

  function setPanelFocusable(panel, enabled) {
    const nodes = Array.from(panel.querySelectorAll(FOCUSABLE));
    nodes.forEach((el) => {
      if (!panel.contains(el)) return;

      if (enabled) {
        const orig = el.getAttribute("data-orig-tabindex");
        if (orig !== null) {
          if (orig === "") el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", orig);
          el.removeAttribute("data-orig-tabindex");
        }
      } else {
        if (!el.hasAttribute("data-orig-tabindex")) {
          const current = el.getAttribute("tabindex");
          el.setAttribute("data-orig-tabindex", current === null ? "" : current);
        }
        el.setAttribute("tabindex", "-1");
      }
    });
  }

  function getFocusableIn(panel) {
    return Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) =>
      panel.contains(el)
    );
  }

  function focusFirst(panel) {
    const closeBtn = panel.querySelector("[data-close]");
    if (closeBtn) {
      closeBtn.focus({ preventScroll: true });
      return;
    }
    const focusables = getFocusableIn(panel);
    if (focusables.length) focusables[0].focus({ preventScroll: true });
  }

  function closeAll({ restoreFocus = true } = {}) {
    panels.forEach((p) => {
      p.classList.remove("is-open");
      p.setAttribute("aria-hidden", "true");
      p.setAttribute("inert", "");
      setPanelFocusable(p, false);
    });

    if (activePanel) {
      activePanel = null;
      hideScrim();
      unlockScroll();
    }

    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");

    if (restoreFocus && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
    lastFocus = null;
  }

  function openPanel(id, openerEl) {
    closeAll({ restoreFocus: false });

    const panel = document.getElementById(id);
    if (!panel) return;

    lastFocus = openerEl || document.activeElement;

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.removeAttribute("inert");
    setPanelFocusable(panel, true);

    activePanel = panel;

    if (id === "panel-menu") {
      const menuToggle = document.getElementById("menuToggle");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");

      lockScroll();
      showScrim();
      focusFirst(panel);
    }
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-panel");
      if (!id) return;

      const panel = document.getElementById(id);
      const isOpen = panel && panel.classList.contains("is-open");
      if (isOpen) closeAll();
      else openPanel(id, btn);
    });
  });

  closeButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAll();
    })
  );

  scrim.addEventListener("click", () => closeAll());

  // Keyboard: ESC closes, TAB traps focus
  document.addEventListener("keydown", (e) => {
    if (!activePanel) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeAll();
      return;
    }

    if (e.key === "Tab") {
      const focusables = getFocusableIn(activePanel);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        if (current === first || !activePanel.contains(current)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    }
  });

  /* Theme toggle: role="switch" + aria-checked */
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  function applyThemeUI(theme) {
    const checked = theme === "dark";
    themeButtons.forEach((btn) => {
      btn.setAttribute("aria-checked", checked ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        checked ? "Switch to light theme" : "Switch to dark theme"
      );
    });
  }

  function setTheme(next) {
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    applyThemeUI(next);
  }

  function toggleTheme(e) {
    e?.stopPropagation?.();
    const current = document.documentElement.dataset.theme || "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
    btn.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleTheme(e);
      }
    });
  });

  applyThemeUI(document.documentElement.dataset.theme || "light");
  closeAll({ restoreFocus: false });
})();
