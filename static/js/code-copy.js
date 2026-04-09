document.addEventListener("DOMContentLoaded", () => {
  const blocks = document.querySelectorAll(".highlight");

  blocks.forEach((block) => {
    if (block.querySelector(".code-copy-btn")) return;

    const pre = block.querySelector("pre");
    if (!pre) return;

    const button = document.createElement("button");
    button.className = "code-copy-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Copy code");
    button.setAttribute("title", "Copy code");

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);

        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Copied");
        button.setAttribute("title", "Copied");

        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.setAttribute("aria-label", "Copy code");
          button.setAttribute("title", "Copy code");
        }, 1600);
      } catch (err) {
        button.setAttribute("aria-label", "Copy failed");
        button.setAttribute("title", "Copy failed");

        window.setTimeout(() => {
          button.setAttribute("aria-label", "Copy code");
          button.setAttribute("title", "Copy code");
        }, 1600);
      }
    });

    block.appendChild(button);
  });
});