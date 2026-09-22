// Let keyboard users scroll overflowing scientific content without shrinking it.
function updateReadingRegions() {
  document.querySelectorAll('main mjx-container, main pre, main table').forEach(el => {
    const overflow = el.scrollWidth > el.clientWidth + 1;
    if (overflow) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', el.tagName.toLowerCase() === 'mjx-container' ? 'Scrollable formula' : 'Scrollable content');
      el.dataset.scrollRegion = 'true';
    } else if (el.dataset.scrollRegion) {
      el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); delete el.dataset.scrollRegion;
    }
  });
}
window.addEventListener('load', updateReadingRegions);
window.addEventListener('resize', updateReadingRegions);
