// Release timestamps include a timezone so every visitor sees the same launch time.
document.querySelectorAll('.project-card[data-release-at]').forEach((card) => {
  const releaseAt = Date.parse(card.dataset.releaseAt);
  const badge = card.querySelector('.app-store-badge');
  if (!Number.isFinite(releaseAt) || !badge) return;

  const update = () => {
    const remaining = releaseAt - Date.now();
    if (remaining > 0) {
      // Cap long waits at the browser's maximum timeout, then check again.
      window.setTimeout(update, Math.min(remaining, 2147483647));
      return;
    }

    badge.src = 'https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg';
    badge.alt = 'Download on the App Store';
    badge.width = 120;
    const releaseNote = card.querySelector('.project-release');
    if (releaseNote) releaseNote.hidden = true;
  };

  update();
});
