document.addEventListener("click", async (event) => {
  const button = event.target.closest(".codeframe__copy");
  if (!button) return;

  const targetId = button.getAttribute("data-copy-target");
  const target = document.getElementById(targetId);
  if (!target) return;

  const codeEl = target.querySelector("pre code, pre");
  if (!codeEl) return;

  const text = codeEl.innerText.replace(/\n$/, "");
  const label = button.querySelector(".codeframe__copy-label");

  const setState = (message, copied = false) => {
    if (label) label.textContent = message;
    button.classList.toggle("is-copied", copied);
  };

  try {
    await navigator.clipboard.writeText(text);
    setState("Copied", true);
  } catch (err) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      setState("Copied", true);
    } catch (fallbackErr) {
      setState("Failed", false);
    }

    document.body.removeChild(textarea);
  }

  window.clearTimeout(button._copyResetTimer);
  button._copyResetTimer = window.setTimeout(() => {
    setState("Copy", false);
  }, 1800);
});