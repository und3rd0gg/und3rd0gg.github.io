// "Send the link to my PC" for visitors on phones and tablets.
// Hidden on Windows, where the Microsoft Store button already does the job.
(() => {
  if (/Windows/i.test(navigator.userAgent)) return;
  document.querySelectorAll('[data-send-to-pc]').forEach((button) => {
    const url = button.dataset.url;
    const copiedText = button.dataset.copied;
    button.hidden = false;
    button.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'UnderdoggNote', url });
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        button.textContent = copiedText;
      } catch {
        window.location.href = 'mailto:?subject=UnderdoggNote&body=' + encodeURIComponent(url);
      }
    });
  });
})();
