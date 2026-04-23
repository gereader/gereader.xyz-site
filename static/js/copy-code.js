(function () {
  var blocks = document.querySelectorAll('.highlight');
  if (!blocks.length) return;

  blocks.forEach(function (block) {
    if (block.querySelector('.copy-code-btn')) return;
    var pre = block.querySelector('pre');
    if (!pre) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-code-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span class="copy-code-label">Copy</span>';

    block.style.position = 'relative';
    block.appendChild(btn);

    btn.addEventListener('click', function () {
      var codeEl = block.querySelector('pre code') || block.querySelector('pre');
      if (!codeEl) return;
      var lines = codeEl.querySelectorAll('.line');
      var text;
      if (lines.length) {
        text = Array.from(lines).map(function (line) {
          var cl = line.querySelector('.cl');
          return (cl ? cl.textContent : line.textContent).replace(/\n$/, '');
        }).join('\n');
      } else {
        text = codeEl.innerText;
      }
      var done = function () {
        btn.classList.add('copied');
        btn.querySelector('.copy-code-label').textContent = 'Copied';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.querySelector('.copy-code-label').textContent = 'Copy';
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
})();
