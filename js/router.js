/**
 * NOTES WALLAH - Modular View & Screen Router
 * Part 1 of 10: Foundation
 * 
 * Manages:
 * - Splash -> Auth (Login/Signup) -> Onboarding -> Main Navigation Shell
 * - 5 Primary Tab Destinations in Main Shell:
 *     1. Home
 *     2. Study (Academic syllabus, subjects & Pro Notes gate)
 *     3. Test (Mocks, Subject tests & PYQs)
 *     4. Challenges (Daily & Weekly Challenges - Zero XP)
 *     5. Account (Student Profile, Class/Board, Preferences & Settings)
 * 
 * Strict Rule:
 * - No XP navigation
 * - No separate notes bottom nav
 */

class AppRouter {
  constructor() {
    this.currentView = null;
    this.currentTab = "home";
    this.validTabs = ["home", "study", "test", "challenges", "account"];
    this.initHistory();
  }

  initHistory() {
    window.addEventListener("popstate", (e) => {
      if (e.state && e.state.view) {
        this.navigate(e.state.view, e.state.tab, false);
      }
    });
  }

  /**
   * Primary View Navigator: Switches between Splash, Login, Signup, Onboarding, and Main
   */
  navigate(viewId, tabId = "home", pushToHistory = true) {
    const views = document.querySelectorAll(".app-view");
    let targetView = document.getElementById(`view-${viewId}`);

    if (!targetView) {
      console.warn(`[Router] View not found: view-${viewId}, defaulting to main`);
      viewId = "main";
      targetView = document.getElementById("view-main");
    }

    views.forEach(v => {
      v.classList.remove("active");
    });

    targetView.classList.add("active");
    this.currentView = viewId;

    if (viewId === "main") {
      this.switchTab(tabId || this.currentTab || "home");
    }

    if (pushToHistory) {
      history.pushState({ view: viewId, tab: tabId }, "", `#${viewId}${tabId ? `/${tabId}` : ""}`);
    }

    // Scroll viewport to top on route change
    const viewport = document.querySelector(".app-content-viewport");
    if (viewport) viewport.scrollTop = 0;
  }

  /**
   * Main App Sub-tab Switcher: Switches between Home, Study, Test, Challenges, Account
   */
  switchTab(tabId) {
    if (!this.validTabs.includes(tabId)) {
      tabId = "home";
    }

    const tabScreens = document.querySelectorAll(".tab-screen");
    const navItems = document.querySelectorAll(".nav-item");

    tabScreens.forEach(screen => {
      screen.classList.remove("active");
    });

    const targetScreen = document.getElementById(`screen-${tabId}`);
    if (targetScreen) {
      targetScreen.classList.add("active");
    }

    navItems.forEach(item => {
      if (item.getAttribute("data-tab") === tabId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    this.currentTab = tabId;

    // Academic study system initialization trigger
    if (tabId === "study" && window.NotesWallahStudy) {
      if (!window.NotesWallahStudy.currentClassId) {
        const currentUser = window.NotesWallahAuth ? window.NotesWallahAuth.getCurrentUser() : null;
        window.NotesWallahStudy.init(currentUser);
      }
    }

    // Test series and Daily challenge initialization triggers
    if (tabId === "test" && window.NotesWallahTestEngine) {
      const currentUser = window.NotesWallahAuth ? window.NotesWallahAuth.getCurrentUser() : null;
      const classId = (currentUser && currentUser.academic_profile && currentUser.academic_profile.class) || "class_10";
      window.NotesWallahTestEngine.renderTestHub(classId);
    }

    if (tabId === "challenges" && window.NotesWallahTestEngine) {
      const currentUser = window.NotesWallahAuth ? window.NotesWallahAuth.getCurrentUser() : null;
      const classId = (currentUser && currentUser.academic_profile && currentUser.academic_profile.class) || "class_10";
      window.NotesWallahTestEngine.renderChallenges(classId);
    }

    // Scroll viewport to top
    const viewport = document.querySelector(".app-content-viewport");
    if (viewport) viewport.scrollTop = 0;
  }
}

window.NotesWallahRouter = new AppRouter();
