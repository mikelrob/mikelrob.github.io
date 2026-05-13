(function () {
  const scrollMilestones = [25, 50, 75, 100];
  const reached = new Set();

  function getScrollPercent() {
    const el = document.documentElement;
    const scrolled = el.scrollTop || document.body.scrollTop;
    const total = el.scrollHeight - el.clientHeight;
    return total > 0 ? Math.floor((scrolled / total) * 100) : 0;
  }

  function onScroll() {
    const pct = getScrollPercent();
    for (const milestone of scrollMilestones) {
      if (pct >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        if (window.umami) {
          window.umami.track('Scroll Depth', { percent: milestone });
        }
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  const sections = [
    { id: 'about', label: 'Reached About' },
    { id: 'projects', label: 'Reached Projects' },
  ];

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const section = sections.find((s) => s.id === entry.target.id);
          if (section && window.umami) {
            window.umami.track(section.label);
          }
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.3 }
  );

  for (const section of sections) {
    const el = document.getElementById(section.id);
    if (el) observer.observe(el);
  }
})();
