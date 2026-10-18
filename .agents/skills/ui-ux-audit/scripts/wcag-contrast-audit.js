/**
 * WCAG 2.1 AA Accessibility & Contrast Evaluation Script
 * Designed to be executed inside browser context via `playwright_evaluate`
 */
(() => {
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function parseRgb(colorStr) {
    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1
    };
  }

  function getEffectiveBg(el) {
    let cur = el;
    while (cur && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      const bg = parseRgb(style.backgroundColor);
      if (bg && bg.a > 0.05) {
        return bg;
      }
      cur = cur.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function getContrastRatio(fgRgb, bgRgb) {
    const l1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const l2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

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

  const contrastIssues = [];
  const interactiveIssues = [];

  // 1. Text contrast check
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    const parent = textNode.parentElement;
    if (!parent || parent.offsetParent === null) continue;
    const text = textNode.textContent.trim();
    if (!text || text.length < 2) continue;

    const style = window.getComputedStyle(parent);
    if (style.visibility === 'hidden' || style.display === 'none' || parseFloat(style.opacity) < 0.1) continue;

    const fg = parseRgb(style.color);
    if (!fg) continue;
    const bg = getEffectiveBg(parent);
    const ratio = getContrastRatio(fg, bg);
    const fontSize = parseFloat(style.fontSize);
    const isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === 'bold';
    const isLarge = fontSize >= 24 || (fontSize >= 18.66 && isBold);
    const minRequired = isLarge ? 3.0 : 4.5;

    if (ratio < minRequired) {
      contrastIssues.push({
        selector: getDomPath(parent),
        textSnippet: text.slice(0, 30),
        ratio: ratio.toFixed(2),
        required: minRequired,
        fontSize: `${fontSize}px`,
        isLarge,
        color: style.color,
        background: `rgb(${bg.r}, ${bg.g}, ${bg.b})`
      });
    }
  }

  // 2. Interactive elements accessible name check
  const interactives = document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="link"]');
  interactives.forEach(el => {
    if (el.offsetParent === null) return;
    const style = window.getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return;

    const ariaLabel = el.getAttribute('aria-label');
    const ariaLabelledby = el.getAttribute('aria-labelledby');
    const title = el.getAttribute('title');
    const text = el.innerText ? el.innerText.trim() : '';
    const alt = el.querySelector('img') ? el.querySelector('img').getAttribute('alt') : null;
    const hasAccessibleName = !!(ariaLabel || ariaLabelledby || title || text || alt || (el.tagName === 'INPUT' && el.value));

    if (!hasAccessibleName) {
      interactiveIssues.push({
        tag: el.tagName.toLowerCase(),
        selector: getDomPath(el),
        type: el.getAttribute('type') || null,
        htmlSnippet: el.outerHTML.slice(0, 80)
      });
    }
  });

  return {
    contrastIssues: contrastIssues.slice(0, 20),
    totalContrastIssues: contrastIssues.length,
    interactiveIssues: interactiveIssues.slice(0, 20),
    totalInteractiveIssues: interactiveIssues.length
  };
})();

