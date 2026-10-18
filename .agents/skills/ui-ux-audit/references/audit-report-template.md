# UI/UX & Accessibility Audit Report Template

Use this template to compile the audit findings for the tested URL or screen.

---

## 1. Executive Summary

| URL / View Under Test | Environment / Port | Date & Time | Overall Verdict | Critical Issues | Major Issues | Minor Issues |
| --------------------- | ------------------ | ----------- | --------------- | --------------- | ------------ | ------------ |
| `http://localhost:...`| Local / Staging    | YYYY-MM-DD  | PASS / FAIL     | 0               | 2            | 3            |

---

## 2. Visual & Responsive Inspection

### Viewport Screenshots

| Viewport | Dimensions | Screenshot Path / Status | Horizontal Overflow | Obscured CTA Detected |
| -------- | ---------- | ------------------------ | ------------------- | --------------------- |
| Mobile   | 375 x 812  | `screenshots/mobile.png` | None / Detected     | None / Detected       |
| Tablet   | 768 x 1024 | `screenshots/tablet.png` | None / Detected     | None / Detected       |
| Desktop  | 1440 x 900 | `screenshots/desktop.png`| None / Detected     | None / Detected       |

---

## 3. Detailed Audit Findings

### [Severity: Critical / Major / Minor] Issue Title

- **Category**: Accessibility (WCAG 2.1 AA) / Responsive Layout / User Flow & Form Error
- **DOM Selector**: `button.primary-action#submit-btn`
- **Observed Behavior**: Description of what is failing (e.g., contrast is 2.8:1 instead of 4.5:1, button obscured by sticky footer, no validation error message).
- **Expected Behavior**: What WCAG 2.1 AA or UX best practices dictate.
- **Evidence**:
  - Measured Value: `Contrast ratio: 2.78:1 (Body text)`
  - Screenshot reference: `screenshots/mobile.png`
- **Recommended Fix**:
```diff
- color: #94a3b8;
+ color: #475569; /* Provides 4.8:1 contrast ratio against white background */
```
```html
<!-- Add aria-label or accessible name -->
- <button class="icon-btn"><i class="icon-trash"></i></button>
+ <button class="icon-btn" aria-label="Delete vocabulary"><i class="icon-trash" aria-hidden="true"></i></button>
```

---

## 4. Remediation Checklist

- [ ] Fix Critical flow blockers
- [ ] Fix Major accessibility (WCAG 2.1 AA) and overlapping layout issues
- [ ] Refine Minor spacing and visual inconsistencies

