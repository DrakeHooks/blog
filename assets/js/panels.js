(() => {
  const panels = Array.from(document.querySelectorAll(".panel"));
  const openButtons = Array.from(document.querySelectorAll("[data-panel]"));
  const closeButtons = Array.from(document.querySelectorAll("[data-close]"));
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));

  const FOCUSABLE =
    'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  const mobileQuery = window.matchMedia("(max-width: 767px)");

  let activePanel = null;
  let lastFocus = null;
  let touchStartY = 0;

  /* Existing scrim support, but KAP-style menu does not use it visually */
  let scrim = document.getElementById("panelScrim");
  if (scrim) {
    scrim.setAttribute("hidden", "");
    scrim.setAttribute("aria-hidden", "true");
    scrim.classList.remove("is-open");
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
    const focusables = getFocusableIn(panel);
    if (focusables.length) {
      focusables[0].focus({ preventScroll: true });
    }
  }

  function setOpenState(isOpen) {
    document.documentElement.classList.toggle("is-panel-open", isOpen);
    document.body.classList.toggle("is-panel-open", isOpen);
  }

  function setButtonExpanded(panelId, expanded) {
    openButtons.forEach((btn) => {
      if (btn.getAttribute("data-panel") === panelId) {
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      }
    });

    const menuToggle = document.getElementById("menuToggle");
    if (menuToggle && panelId === "panel-menu") {
      menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    }
  }

  function closeAll({ restoreFocus = true } = {}) {
    const panelToClose = activePanel;

    panels.forEach((panel) => {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      panel.setAttribute("inert", "");
      setPanelFocusable(panel, false);
    });

    openButtons.forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });

    if (scrim) {
      scrim.classList.remove("is-open");
      scrim.setAttribute("hidden", "");
      scrim.setAttribute("aria-hidden", "true");
    }

    activePanel = null;
    setOpenState(false);

    if (
      restoreFocus &&
      panelToClose &&
      lastFocus &&
      typeof lastFocus.focus === "function"
    ) {
      lastFocus.focus({ preventScroll: true });
    }

    lastFocus = null;
  }

  function openPanel(id, openerEl) {
    const panel = document.getElementById(id);
    if (!panel) return;

    closeAll({ restoreFocus: false });

    lastFocus = openerEl || document.activeElement;
    activePanel = panel;

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    panel.removeAttribute("inert");
    setPanelFocusable(panel, true);

    setButtonExpanded(id, true);
    setOpenState(true);

    if (scrim) {
      scrim.setAttribute("hidden", "");
      scrim.setAttribute("aria-hidden", "true");
      scrim.classList.remove("is-open");
    }

    /*
      Desktop-style focus trap is intentionally not used here.
      This menu behaves like a lightweight KAP-style top menu, not a modal.
    */
    if (!mobileQuery.matches) {
      focusFirst(panel);
    }
  }

  function isPanelOpen() {
    return Boolean(activePanel) ||
      document.documentElement.classList.contains("is-panel-open") ||
      document.body.classList.contains("is-panel-open") ||
      panels.some((panel) => panel.classList.contains("is-open"));
  }

  openButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();

      const id = btn.getAttribute("data-panel");
      if (!id) return;

      const panel = document.getElementById(id);
      const isOpen = panel && panel.classList.contains("is-open");

      if (isOpen) closeAll();
      else openPanel(id, btn);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      closeAll();
    });
  });

  panels.forEach((panel) => {
    panel.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (link) closeAll({ restoreFocus: false });
    });
  });

  if (scrim) {
    scrim.addEventListener("click", () => closeAll());
  }

  document.addEventListener("keydown", (event) => {
    if (!isPanelOpen()) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeAll();
    }
  });

  /*
    Close the mobile menu on any mobile scroll gesture.
    This keeps it feeling like KAP: lightweight, temporary, gone once the page moves.
  */
  window.addEventListener(
    "scroll",
    () => {
      if (mobileQuery.matches && isPanelOpen()) {
        closeAll({ restoreFocus: false });
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "wheel",
    () => {
      if (mobileQuery.matches && isPanelOpen()) {
        closeAll({ restoreFocus: false });
      }
    },
    { passive: true }
  );

  window.addEventListener(
    "touchstart",
    (event) => {
      if (!mobileQuery.matches || !isPanelOpen()) return;
      touchStartY = event.touches[0]?.clientY || 0;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchmove",
    (event) => {
      if (!mobileQuery.matches || !isPanelOpen()) return;

      const currentY = event.touches[0]?.clientY || 0;
      const moved = Math.abs(currentY - touchStartY);

      if (moved > 6) {
        closeAll({ restoreFocus: false });
      }
    },
    { passive: true }
  );

  /*
    If viewport changes to desktop while menu is open, cleanly close it.
  */
  mobileQuery.addEventListener?.("change", () => {
    if (!mobileQuery.matches && isPanelOpen()) {
      closeAll({ restoreFocus: false });
    }
  });

  /* Theme toggle: role="switch" + aria-checked */
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

  function toggleTheme(event) {
    event?.stopPropagation?.();

    const current = document.documentElement.dataset.theme || "light";
    const next = current === "dark" ? "light" : "dark";

    setTheme(next);
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", toggleTheme);

    btn.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggleTheme(event);
      }
    });
  });

  applyThemeUI(document.documentElement.dataset.theme || "light");
  closeAll({ restoreFocus: false });
})();