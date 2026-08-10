// Copies Homebrew install commands to the clipboard when a .brew-btn is clicked,
// showing a temporary "Copied!" confirmation label.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brew-btn').forEach((btn) => {
    const label = btn.querySelector('.brew-btn-label');
    if (!label) return;
    const originalLabel = label.textContent;
    const tap = btn.dataset.brewTap;
    const install = btn.dataset.brewInstall;
    const command = [tap, install].filter(Boolean).join('\n');

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(command);
        label.textContent = 'Copied!';
      } catch (err) {
        label.textContent = 'Copy failed';
      }
      setTimeout(() => {
        label.textContent = originalLabel;
      }, 2000);
    });
  });
});
