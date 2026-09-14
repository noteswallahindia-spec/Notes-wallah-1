/**
 * NOTES WALLAH - UI Component & Theme Controller
 * Part 1 of 10: Foundation
 * 
 * Rules:
 * - Centralized CSS variables for theme; no colors scattered in JS
 * - Zero emojis as UI icons; pure vector SVG icons
 * - Accessible focus, toasts, and dialog handlers
 */

const ICONS = {
  home: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 10.2L12 3l9 7.2v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-10z"/></svg>`,
  study: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  test: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  challenges: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  account: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  sun: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  bell: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chevronRight: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>`,
  chevronLeft: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  arrowLeft: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  externalLink: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  check: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  eye: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  mail: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  user: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  logout: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  sparkle: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  info: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  close: `<svg class="icon-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  science: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M10 2v7.31L4.15 20.3A1 1 0 0 0 5 22h14a1 1 0 0 0 .85-1.7L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="7" y1="16" x2="17" y2="16"/></svg>`,
  math: `<svg class="icon-svg" viewBox="0 0 24 24"><line x1="4" y1="12" x2="10" y2="12"/><line x1="7" y1="9" x2="7" y2="15"/><line x1="14" y1="12" x2="20" y2="12"/><line x1="14" y1="8" x2="20" y2="8"/><line x1="14" y1="16" x2="20" y2="16"/></svg>`,
  socialScience: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  english: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="12" y1="7" x2="12" y2="13"/></svg>`,
  hindi: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  bookOpen: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  fileText: `<svg class="icon-svg icon-svg-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
};

class UIService {
  constructor() {
    this.currentTheme = "light";
    this.initTheme();
  }

  /**
   * Theme Management (CSS Variable driven)
   */
  initTheme() {
    const saved = localStorage.getItem("nw_theme");
    if (saved) {
      this.setTheme(saved);
    } else {
      // Respect user's OS preference
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      this.setTheme(prefersDark ? "dark" : "light");
    }
  }

  setTheme(themeName) {
    this.currentTheme = themeName;
    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("nw_theme", themeName);
    
    // Update theme toggle icon if present
    const toggleBtn = document.getElementById("theme-toggle-btn");
    if (toggleBtn) {
      toggleBtn.innerHTML = themeName === "dark" ? ICONS.sun : ICONS.moon;
      toggleBtn.setAttribute("aria-label", `Switch to ${themeName === "dark" ? "Light" : "Dark"} mode`);
    }

    const themeCheckbox = document.getElementById("theme-switch-checkbox");
    if (themeCheckbox) {
      themeCheckbox.checked = themeName === "dark";
    }
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === "dark" ? "light" : "dark");
  }

  /**
   * Toast Notifications
   */
  showToast(message, type = "info", duration = 3200) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-msg ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 200ms ease";
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  /**
   * Modal Dialog Controls
   */
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.add("active");
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove("active");
    }
  }

  /**
   * Button Loading State
   */
  setButtonLoading(btn, isLoading, defaultText) {
    if (!btn) return;
    if (isLoading) {
      btn.disabled = true;
      btn.setAttribute("data-prev-text", btn.innerHTML);
      btn.innerHTML = `<span class="splash-spinner" style="width:18px;height:18px;border-width:2px;border-top-color:currentColor;"></span> <span>Please wait...</span>`;
    } else {
      btn.disabled = false;
      const prev = btn.getAttribute("data-prev-text");
      btn.innerHTML = prev || defaultText;
    }
  }
}

window.NotesWallahUI = new UIService();
window.NotesWallahIcons = ICONS;
