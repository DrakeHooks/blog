document.addEventListener("DOMContentLoaded", () => {
    // Find all <pre><code> blocks
    document.querySelectorAll("pre > code").forEach((codeElem) => {
      // Create the wrapper div
      const wrapper = document.createElement("div");
      wrapper.classList.add("code-wrapper");
  
      // Create the copy button
      const copyButton = document.createElement("button");
      copyButton.classList.add("copy-button");
      copyButton.textContent = "Copy";
  
      // Reference the parent <pre> element
      const preElem = codeElem.parentNode;
  
      // Insert the wrapper before the <pre>, then move <pre> inside it
      preElem.parentNode.insertBefore(wrapper, preElem);
      wrapper.appendChild(copyButton);
      wrapper.appendChild(preElem);
  
      // Add "copy to clipboard" functionality
      copyButton.addEventListener("click", () => {
        const codeText = codeElem.innerText || codeElem.textContent;
        navigator.clipboard.writeText(codeText)
          .then(() => {
            copyButton.textContent = "Copied!";
            setTimeout(() => {
              copyButton.textContent = "Copy";
            }, 2000);
          })
          .catch((err) => {
            console.error("Failed to copy code:", err);
          });
      });
    });
  });
  