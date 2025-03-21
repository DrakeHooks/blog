document.addEventListener("click", function(e) {
    if (e.target.matches(".copy-button")) {
      // The <pre> is the next sibling inside the .code-wrapper
      const preElem = e.target.nextElementSibling;
      if (!preElem) return;
  
      // The <code> block is inside <pre>
      const codeElem = preElem.querySelector("code");
      if (!codeElem) return;
  
      // Get the code text
      const codeToCopy = codeElem.innerText || codeElem.textContent;
  
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          e.target.textContent = "Copied!";
          setTimeout(() => { e.target.textContent = "Copy"; }, 2000);
        })
        .catch(err => console.error("Failed to copy code:", err));
    }
  });
  