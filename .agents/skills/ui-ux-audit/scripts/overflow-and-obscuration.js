/**
 * Horizontal Overflow & CTA Obscuration Detection Script
 * Designed to be executed inside browser context via `playwright_evaluate`
 */
(() => {
  function getDomPath(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
    if (el.id) return `#${el.id}`;
    let path = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\s+/).filter(c => c && !c.includes(':')).slice(0, 2);
      if (classes.length) path += '.' + classes.join('.');
    }
    return path;
  }

  const docWidth = document.documentElement.clientWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const hasHorizontalScroll = scrollWidth > docWidth;

  const overflowingElements = [];
  if (hasHorizontalScroll) {
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.right > docWidth + 2) {
        overflowingElements.push({
          selector: getDomPath(el),
          right: Math.round(rect.right),
          viewportWidth: docWidth,
          diff: Math.round(rect.right - docWidth),
          htmlSnippet: el.outerHTML.slice(0, 80)
        });
      }
    }
  }

  // Check CTA / Interactive elements obscuration (z-index / sticky overlays)
  const ctas = document.querySelectorAll('button, a[href], [role="button"], input[type="submit"]');
  const obscuredElements = [];

  ctas.forEach(el => {
    if (el.offsetParent === null) return;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) < 0.1) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Check if element is within the current visible viewport
    if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const topEl = document.elementFromPoint(centerX, centerY);
    if (topEl && !el.contains(topEl) && !topEl.contains(el) && topEl !== el) {
      const topStyle = window.getComputedStyle(topEl);
      obscuredElements.push({
        obscuredSelector: getDomPath(el),
        obscuredText: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 30),
        coveringSelector: getDomPath(topEl),
        coveringPosition: topStyle.position,
        coveringZIndex: topStyle.zIndex
      });
    }
  });

  return {
    viewport: { width: docWidth, height: window.innerHeight },
    hasHorizontalScroll,
    scrollWidth,
    docWidth,
    overflowCount: overflowingElements.length,
    overflowingElements: overflowingElements.slice(0, 10),
    obscuredCount: obscuredElements.length,
    obscuredElements: obscuredElements.slice(0, 10)
  };
})();

