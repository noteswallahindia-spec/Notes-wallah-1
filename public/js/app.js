/**
 * NOTES WALLAH - Main Application Controller
 * Part 1 of 10: Foundation Bootstrap
 * 
 * Orchestrates:
 * - Bootstrapping & Splash screen timing
 * - Session restoration & Auto-login
 * - Auth form bindings (Login, Signup, Google, Forgot Password)
 * - Onboarding multi-option collection (Class, Board, Medium, Language)
 * - Navigation tab bindings (Home, Study, Test, Challenges, Account)
 * - Pro Notes Ad requirement integration via AdService
 * - Clean empty states with zero fake statistics and zero XP
 */

document.addEventListener("DOMContentLoaded", async () => {
  const router = window.NotesWallahRouter;
  const auth = window.NotesWallahAuth;
  const db = window.NotesWallahDatabase;
  const ui = window.NotesWallahUI;
  const adService = window.NotesWallahAdService;
  const firebaseService = window.NotesWallahFirebase;

  // 1. Initialize Ad Service & Firebase Architecture
  await firebaseService.initialize();
  auth.initFirebaseAuthObserver();
  await adService.init();

  // 2. Bind Navigation Tab Clicks
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = item.getAttribute("data-tab");
      router.switchTab(tab);
    });
  });

  // 3. Bind Quick Access buttons on Home Screen
  const quickBtns = document.querySelectorAll("[data-navigate-tab]");
  quickBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-navigate-tab");
      router.switchTab(tab);
    });
  });

  // 4. Session Detection & Auth State Observer
  auth.onAuthStateChanged(async (user) => {
    updateUIForUser(user);

    // Initial routing after splash
    setTimeout(() => {
      const splash = document.getElementById("view-splash");
      if (splash) {
        splash.style.opacity = "0";
        splash.style.transition = "opacity 300ms ease";
        setTimeout(() => {
          splash.style.display = "none";
        }, 300);
      }

      if (!user) {
        router.navigate("login", null, false);
      } else if (!user.isOnboarded) {
        router.navigate("onboarding", null, false);
      } else {
        if (window.NotesWallahStudy) {
          window.NotesWallahStudy.init(user);
        }
        router.navigate("main", "home", false);
      }
    }, 1100);
  });

  // 5. Update UI with Active Student Information
  function updateUIForUser(user) {
    const studentNameDisplays = document.querySelectorAll(".student-name-display");
    const studentClassDisplays = document.querySelectorAll(".student-class-display");
    const studentBoardDisplays = document.querySelectorAll(".student-board-display");
    const studentMediumDisplays = document.querySelectorAll(".student-medium-display");
    const studentLangDisplays = document.querySelectorAll(".student-lang-display");
    const studentEmailDisplays = document.querySelectorAll(".student-email-display");
    const studentAvatarCircle = document.getElementById("student-avatar-initial");
    const topbarAvatar = document.getElementById("topbar-avatar-circle");

    if (user) {
      const displayName = user.name || (user.email ? user.email.split("@")[0] : "Student");
      const userClass = (user.profile && user.profile.classLevel) || "Class 10";
      const userBoard = (user.profile && user.profile.board) || "CBSE";
      const userMedium = (user.profile && user.profile.medium) || "English Medium";
      const userLang = (user.profile && user.profile.preferredLanguage) || "English";

      studentNameDisplays.forEach(el => el.textContent = displayName);
      studentClassDisplays.forEach(el => el.textContent = userClass);
      studentBoardDisplays.forEach(el => el.textContent = userBoard);
      studentMediumDisplays.forEach(el => el.textContent = userMedium);
      studentLangDisplays.forEach(el => el.textContent = userLang);
      studentEmailDisplays.forEach(el => el.textContent = user.email || "");

      const initialChar = displayName.charAt(0).toUpperCase() || "A";
      if (studentAvatarCircle) {
        studentAvatarCircle.textContent = initialChar;
      }
      if (topbarAvatar) {
        topbarAvatar.textContent = initialChar;
      }
    } else {
      studentNameDisplays.forEach(el => el.textContent = "Student");
      studentClassDisplays.forEach(el => el.textContent = "Class 10");
      studentBoardDisplays.forEach(el => el.textContent = "CBSE");
    }
  }

  // 6. Login Form Handler
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;
      const submitBtn = document.getElementById("login-submit-btn");

      try {
        ui.setButtonLoading(submitBtn, true, "Sign In");
        const user = await auth.loginWithEmail(email, password);
        ui.showToast(`Welcome back, ${user.name}!`, "success");
        if (!user.isOnboarded) {
          router.navigate("onboarding");
        } else {
          if (window.NotesWallahStudy) {
            window.NotesWallahStudy.init(user);
          }
          router.navigate("main", "home");
        }
      } catch (err) {
        ui.showToast(err.message, "error", 4200);
      } finally {
        ui.setButtonLoading(submitBtn, false, "Sign In");
      }
    });
  }

  // 7. Signup Form Handler
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("signup-confirm-password").value;
      const submitBtn = document.getElementById("signup-submit-btn");

      try {
        ui.setButtonLoading(submitBtn, true, "Create Account");
        await auth.signupWithEmail(name, email, password, confirmPassword);
        ui.showToast("Account created successfully! Let's set up your profile.", "success");
        router.navigate("onboarding");
      } catch (err) {
        ui.showToast(err.message, "error", 4200);
      } finally {
        ui.setButtonLoading(submitBtn, false, "Create Account");
      }
    });
  }

  // 8. Google Sign-in Handlers (both in Login and Signup views)
  const googleBtns = document.querySelectorAll(".btn-google");
  googleBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        ui.setButtonLoading(btn, true, "Connecting...");
        const user = await auth.loginWithGoogle();
        ui.showToast(`Namaste, ${user.name}!`, "success");
        if (!user.isOnboarded) {
          router.navigate("onboarding");
        } else {
          router.navigate("main", "home");
        }
      } catch (err) {
        ui.showToast(err.message, "error");
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg class="google-icon-svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg><span>Continue with Google</span>`;
      }
    });
  });

  // 9. Forgot Password Modal Form
  const forgotForm = document.getElementById("forgot-password-form");
  if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email").value;
      const submitBtn = document.getElementById("forgot-submit-btn");

      try {
        ui.setButtonLoading(submitBtn, true, "Sending Link");
        await auth.sendPasswordReset(email);
        ui.closeModal("modal-forgot-password");
        ui.showToast("Password reset instructions sent to your email.", "success", 4000);
      } catch (err) {
        ui.showToast(err.message, "error");
      } finally {
        ui.setButtonLoading(submitBtn, false, "Send Reset Link");
      }
    });
  }

  // 10. Onboarding Flow Handler
  let selectedClass = "";
  let selectedBoard = "";
  let selectedMedium = "English Medium";
  let selectedLanguage = "English";

  // Chip selection listeners for Class
  const classChips = document.querySelectorAll(".class-choice-chip");
  classChips.forEach(chip => {
    chip.addEventListener("click", () => {
      classChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedClass = chip.getAttribute("data-value");
    });
  });

  // Chip selection listeners for Board
  const boardChips = document.querySelectorAll(".board-choice-chip");
  boardChips.forEach(chip => {
    chip.addEventListener("click", () => {
      boardChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedBoard = chip.getAttribute("data-value");
    });
  });

  // Chip selection listeners for Medium
  const mediumChips = document.querySelectorAll(".medium-choice-chip");
  mediumChips.forEach(chip => {
    chip.addEventListener("click", () => {
      mediumChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedMedium = chip.getAttribute("data-value");
    });
  });

  // Chip selection listeners for Preferred Language
  const langChips = document.querySelectorAll(".lang-choice-chip");
  langChips.forEach(chip => {
    chip.addEventListener("click", () => {
      langChips.forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      selectedLanguage = chip.getAttribute("data-value");
    });
  });

  const onboardingForm = document.getElementById("onboarding-form");
  if (onboardingForm) {
    onboardingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentUser = auth.getCurrentUser();
      if (!currentUser) {
        ui.showToast("Session expired. Please log in again.", "error");
        router.navigate("login");
        return;
      }

      if (!selectedClass) {
        ui.showToast("Please select your current class.", "error");
        return;
      }
      if (!selectedBoard) {
        ui.showToast("Please select your educational board.", "error");
        return;
      }

      const submitBtn = document.getElementById("onboarding-submit-btn");
      try {
        ui.setButtonLoading(submitBtn, true, "Saving Profile");

        const studentProfile = {
          name: currentUser.name,
          email: currentUser.email,
          classLevel: selectedClass,
          board: selectedBoard,
          medium: selectedMedium,
          preferredLanguage: selectedLanguage
        };

        await db.saveUserProfile(currentUser.uid, studentProfile);

        // Update local session
        currentUser.isOnboarded = true;
        currentUser.profile = studentProfile;
        auth.saveSession(currentUser);

        if (window.NotesWallahStudy) {
          window.NotesWallahStudy.init(currentUser);
        }

        ui.showToast("Profile set up successfully! Welcome to Notes Wallah.", "success");
        router.navigate("main", "home");
      } catch (err) {
        ui.showToast("Could not save profile: " + err.message, "error");
      } finally {
        ui.setButtonLoading(submitBtn, false, "Complete Setup");
      }
    });
  }

  // Account switch class button listener
  const btnAccountChangeClass = document.getElementById("btn-account-change-class");
  if (btnAccountChangeClass) {
    btnAccountChangeClass.addEventListener("click", () => {
      if (window.NotesWallahStudy) {
        window.NotesWallahStudy.openClassSwitcher();
      }
    });
  }

  // 11. Pro Notes Ad Gatekeeper Demo Trigger
  const proNotesButtons = document.querySelectorAll(".btn-open-pro-notes");
  proNotesButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const noteId = btn.getAttribute("data-note-id") || "sample_chapter_notes";
      
      // Request Ad from centralized AdService
      const adResult = await adService.showProNotesAd(noteId);

      // Open Pro Notes Ad requirement dialog informing student of the architecture
      const modalMsg = document.getElementById("pro-notes-modal-message");
      if (modalMsg) {
        modalMsg.textContent = adResult.message || "Pro Notes requires an advertisement before unlocking.";
      }
      ui.openModal("modal-pro-notes-ad");
    });
  });

  // 12. Password Visibility Toggles
  const pwToggles = document.querySelectorAll(".password-toggle-btn");
  pwToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const targetInputId = toggle.getAttribute("data-target");
      const input = document.getElementById(targetInputId);
      if (input) {
        const isPassword = input.getAttribute("type") === "password";
        input.setAttribute("type", isPassword ? "text" : "password");
        toggle.innerHTML = isPassword ? window.NotesWallahIcons.eyeOff : window.NotesWallahIcons.eye;
      }
    });
  });

  // 13. Route switch buttons (e.g. from Login to Signup, Forgot Password modal)
  document.querySelectorAll("[data-navigate-view]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const view = btn.getAttribute("data-navigate-view");
      router.navigate(view);
    });
  });

  document.querySelectorAll("[data-navigate-tab]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = btn.getAttribute("data-navigate-tab");
      router.switchTab(tab);
    });
  });

  const topbarAvatarCircle = document.getElementById("topbar-avatar-circle");
  if (topbarAvatarCircle) {
    topbarAvatarCircle.addEventListener("click", () => {
      router.switchTab("account");
    });
  }

  document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute("data-open-modal");
      ui.openModal(modalId);
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute("data-close-modal");
      ui.closeModal(modalId);
    });
  });

  // 14. Theme Toggle Listener (Header button & Account Settings switch)
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      ui.toggleTheme();
    });
  }

  const themeSwitchCheckbox = document.getElementById("theme-switch-checkbox");
  if (themeSwitchCheckbox) {
    themeSwitchCheckbox.addEventListener("change", (e) => {
      ui.setTheme(e.target.checked ? "dark" : "light");
    });
  }

  // 15. Logout Handler
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to log out of Notes Wallah?")) {
        await auth.logout();
        ui.showToast("Logged out successfully.", "info");
        router.navigate("login");
      }
    });
  }

  // 16. Firebase Configuration Modal Form & Diagnostic Verification
  const firebaseConfigForm = document.getElementById("firebase-config-form");
  const testFirebaseBtn = document.getElementById("btn-test-firebase-connection");
  const configStatusBadge = document.getElementById("firebase-status-badge");

  const runFirebaseDiagnosticsUI = async () => {
    const diag = await firebaseService.verifyConnection();
    
    // Update Badge
    if (configStatusBadge) {
      if (diag.success) {
        configStatusBadge.textContent = "Connected";
        configStatusBadge.className = "academic-badge status-connected";
      } else if (firebaseService.isConfigured()) {
        configStatusBadge.textContent = "Connection Error";
        configStatusBadge.className = "academic-badge status-error";
      } else {
        configStatusBadge.textContent = "Pending Setup";
        configStatusBadge.className = "academic-badge status-pending";
      }
    }

    // Update Live Diagnostic Checklist
    const overallStatus = document.getElementById("fb-diag-overall-status");
    if (overallStatus) {
      overallStatus.textContent = diag.success ? "Active & Healthy" : (firebaseService.isConfigured() ? "Check Config" : "Ready For Setup");
      overallStatus.className = `academic-badge ${diag.success ? "status-connected" : (firebaseService.isConfigured() ? "status-error" : "status-pending")}`;
    }

    const setItemStatus = (id, label, isOk) => {
      const item = document.getElementById(id);
      if (!item) return;
      const valSpan = item.querySelector(".diag-val");
      if (valSpan) {
        valSpan.textContent = label;
        valSpan.style.color = isOk ? "var(--color-status-success)" : (firebaseService.isConfigured() ? "var(--color-status-error)" : "var(--color-text-secondary)");
      }
    };

    setItemStatus("diag-item-sdk", diag.checks.sdk ? "Loaded (v10.8.0)" : "Not Detected", diag.checks.sdk);
    setItemStatus("diag-item-config", diag.checks.config ? "Valid Keys Present" : "Missing / Not Set", diag.checks.config);
    setItemStatus("diag-item-app", diag.checks.app ? "Initialized" : "Uninitialized", diag.checks.app);
    setItemStatus("diag-item-auth", diag.checks.auth ? "Available" : "Unavailable", diag.checks.auth);
    setItemStatus("diag-item-firestore", diag.checks.firestore ? "Available" : "Unavailable", diag.checks.firestore);
    setItemStatus("diag-item-storage", diag.checks.storage ? "Available" : "Unavailable", diag.checks.storage);

    return diag;
  };

  // Populate stored values into the inputs
  const currentConfig = firebaseService.getConfig();
  if (currentConfig) {
    if (document.getElementById("fb-cfg-api-key")) document.getElementById("fb-cfg-api-key").value = currentConfig.apiKey || "";
    if (document.getElementById("fb-cfg-project-id")) document.getElementById("fb-cfg-project-id").value = currentConfig.projectId || "";
    if (document.getElementById("fb-cfg-auth-domain")) document.getElementById("fb-cfg-auth-domain").value = currentConfig.authDomain || "";
    if (document.getElementById("fb-cfg-storage-bucket")) document.getElementById("fb-cfg-storage-bucket").value = currentConfig.storageBucket || "";
    if (document.getElementById("fb-cfg-app-id")) document.getElementById("fb-cfg-app-id").value = currentConfig.appId || "";
  }

  // Initial Diagnostic update
  await runFirebaseDiagnosticsUI();

  if (firebaseConfigForm) {
    firebaseConfigForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const apiKey = document.getElementById("fb-cfg-api-key").value.trim();
      const projectId = document.getElementById("fb-cfg-project-id").value.trim();
      const authDomain = document.getElementById("fb-cfg-auth-domain").value.trim();
      const storageBucket = document.getElementById("fb-cfg-storage-bucket").value.trim();
      const appId = document.getElementById("fb-cfg-app-id").value.trim();

      if (!apiKey || !projectId) {
        ui.showToast("Please provide at least API Key and Project ID.", "error");
        return;
      }

      firebaseService.saveConfig({
        apiKey,
        projectId,
        authDomain: authDomain || `${projectId}.firebaseapp.com`,
        storageBucket: storageBucket || `${projectId}.appspot.com`,
        appId
      });

      const diag = await runFirebaseDiagnosticsUI();
      ui.closeModal("modal-firebase-config");

      if (diag.success) {
        ui.showToast("Firebase configured and verified successfully!", "success");
      } else {
        ui.showToast("Configuration saved. Please check credentials if connection fails.", "info");
      }
    });
  }

  if (testFirebaseBtn) {
    testFirebaseBtn.addEventListener("click", async () => {
      ui.showToast("Running connection diagnostics...", "info");
      const diag = await runFirebaseDiagnosticsUI();
      if (diag.success) {
        ui.showToast("All Firebase services verified successfully!", "success");
      } else if (!firebaseService.isConfigured()) {
        ui.showToast("Credentials not configured yet. App running in local foundation mode.", "info");
      } else {
        ui.showToast("Verification failed. Please check your credentials.", "error");
      }
    });
  }

  // 17. Multilingual Architecture & Language Selector
  const i18n = window.NotesWallahI18n;
  const langDisplay = document.getElementById("settings-current-language-display");
  const confirmLangBtn = document.getElementById("btn-confirm-language-change");

  const syncLanguageDisplay = (lang) => {
    if (langDisplay) {
      langDisplay.textContent = lang === "hi" ? "हिन्दी (Hindi)" : "English";
    }
    const currentRadio = document.querySelector(`input[name="app_language_radio"][value="${lang}"]`);
    if (currentRadio) {
      currentRadio.checked = true;
    }
  };

  if (i18n) {
    syncLanguageDisplay(i18n.currentLanguage);
    i18n.onLanguageChange((lang) => {
      syncLanguageDisplay(lang);
    });
  }

  if (confirmLangBtn && i18n) {
    confirmLangBtn.addEventListener("click", async () => {
      const selected = document.querySelector('input[name="app_language_radio"]:checked');
      if (selected) {
        const newLang = selected.value;
        await i18n.setLanguage(newLang);
        ui.closeModal("modal-language-selector");
        const msg = newLang === "hi" ? "भाषा सफलतापूर्वक बदल दी गई है" : "Language updated successfully";
        ui.showToast(msg, "success");
      }
    });
  }
});
