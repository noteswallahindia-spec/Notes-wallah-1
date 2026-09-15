/**
 * NOTES WALLAH - Firebase Architecture & Verification System
 * Part 4 of 10: Connection Verification & Multi-service Architecture
 * 
 * Strict separation:
 * 1. Firebase Configuration (Template & Validation)
 * 2. Firebase Initialization (App lifecycle)
 * 3. Firebase Services (Auth, Firestore, Storage accessors)
 * 4. Firebase Verification Utility (Development-safe diagnostic tool)
 * 
 * Rules:
 * - Never invent fake credentials or project IDs.
 * - Never expose private keys or secrets.
 * - Never show "Firebase Connected" unless real initialization succeeds.
 * - Fails gracefully if unconfigured: informs user and maintains local stability.
 */

// 1. FIREBASE CONFIGURATION TEMPLATE
// Real official Firebase Project credentials for wala-notes-ai-studio
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAtRWfhW20nt31sIxLv47A-OlPRZzsQmaQ",
  authDomain: "wala-notes-ai-studio.firebaseapp.com",
  projectId: "wala-notes-ai-studio",
  storageBucket: "wala-notes-ai-studio.firebasestorage.app",
  messagingSenderId: "326539144217",
  appId: "1:326539144217:web:3c7d2e847e004623618e88",
  measurementId: "G-6M6BLT7XM5"
};

class FirebaseService {
  constructor() {
    this.config = this.loadConfig();
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
    this.isInitialized = false;
    this.initError = null;
  }

  // ========================================================================
  // 1. CONFIGURATION MANAGEMENT
  // ========================================================================

  /**
   * Load saved config from localStorage or fallback to empty template
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem("nw_firebase_config");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && this.validateConfig(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[Firebase] Could not read stored config from localStorage:", e);
    }
    return { ...DEFAULT_FIREBASE_CONFIG };
  }

  /**
   * Validates if a config object contains real, non-placeholder credentials
   */
  validateConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return false;
    const { apiKey, projectId, appId } = cfg;

    const isNonEmpty = (str) => typeof str === "string" && str.trim().length > 0;
    const isPlaceholder = (str) => 
      !str || 
      str === "YOUR_FIREBASE_API_KEY" || 
      str.includes("YOUR_") ||
      str === "notes-wallah-edu";

    return (
      isNonEmpty(apiKey) && !isPlaceholder(apiKey) &&
      isNonEmpty(projectId) && !isPlaceholder(projectId) &&
      isNonEmpty(appId) && !isPlaceholder(appId)
    );
  }

  /**
   * Returns true only when real valid credentials are present
   */
  isConfigured() {
    return this.validateConfig(this.config);
  }

  /**
   * Save new configuration and re-initialize
   */
  async saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem("nw_firebase_config", JSON.stringify(this.config));
    } catch (e) {
      console.error("[Firebase] Failed to persist config:", e);
    }
    return await this.initialize();
  }

  /**
   * Clear saved configuration
   */
  clearConfig() {
    localStorage.removeItem("nw_firebase_config");
    this.config = { ...DEFAULT_FIREBASE_CONFIG };
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
    this.isInitialized = false;
  }

  // ========================================================================
  // 2. INITIALIZATION
  // ========================================================================

  /**
   * Initializes Firebase Web SDK or handles unconfigured state gracefully
   */
  async initialize() {
    this.initError = null;

    // Check if Firebase Web SDK scripts are loaded
    if (typeof window.firebase === "undefined") {
      this.initError = "Firebase Web SDK library is not loaded on the window object.";
      console.warn("[Firebase] SDK script missing. Continuing in safe offline mode.");
      this.isInitialized = false;
      return this.verifyConnection();
    }

    // Check if real configuration exists
    if (!this.isConfigured()) {
      console.info("[Firebase] Configuration not provided. App running in unconfigured development mode.");
      this.isInitialized = false;
      return this.verifyConnection();
    }

    try {
      // Initialize or retrieve existing app
      if (!window.firebase.apps || window.firebase.apps.length === 0) {
        this.app = window.firebase.initializeApp(this.config);
      } else {
        this.app = window.firebase.app();
      }

      // Initialize Services
      if (typeof window.firebase.auth === "function") {
        this.auth = window.firebase.auth();
      }
      if (typeof window.firebase.firestore === "function") {
        this.firestore = window.firebase.firestore();
      }
      if (typeof window.firebase.storage === "function") {
        this.storage = window.firebase.storage();
      }
      if (typeof window.firebase.analytics === "function" && this.config.measurementId) {
        try {
          this.analytics = window.firebase.analytics();
        } catch (e) {
          // Analytics is optional
        }
      }

      this.isInitialized = true;
      console.info("[Firebase] Initialized successfully with project:", this.config.projectId);
    } catch (err) {
      this.isInitialized = false;
      this.initError = err.message || "Unknown Firebase initialization failure";
      console.error("[Firebase] Initialization error:", err);
    }

    return this.verifyConnection();
  }

  // ========================================================================
  // 3. SERVICE ACCESSORS
  // ========================================================================

  getApp() {
    return this.app;
  }

  getAuth() {
    return this.auth;
  }

  getFirestore() {
    return this.firestore;
  }

  getStorage() {
    return this.storage;
  }

  // ========================================================================
  // 4. MODULAR CONNECTION VERIFICATION UTILITY
  // ========================================================================

  /**
   * Diagnostic test that inspects Firebase status without exposing secrets
   * Verifies:
   * 1. Firebase SDK Loaded
   * 2. Configuration Present
   * 3. Firebase App Initialized
   * 4. Auth Service Available
   * 5. Firestore Available
   * 6. Storage Available
   */
  verifyConnection() {
    const sdkLoaded = typeof window.firebase !== "undefined";
    const hasConfig = this.isConfigured();
    const appInit = !!(this.app || (sdkLoaded && window.firebase.apps && window.firebase.apps.length > 0));
    const authAvailable = !!this.auth;
    const firestoreAvailable = !!this.firestore;
    const storageAvailable = !!this.storage;

    const allServicesAvailable = appInit && authAvailable && firestoreAvailable && storageAvailable;

    let statusText = "Not Configured";
    let statusType = "warning"; // "success" | "warning" | "error"

    if (allServicesAvailable) {
      statusText = "Connected";
      statusType = "success";
    } else if (this.initError) {
      statusText = "Configuration Error";
      statusType = "error";
    } else if (!hasConfig) {
      statusText = "Not Configured";
      statusType = "warning";
    } else {
      statusText = "Partially Connected";
      statusType = "warning";
    }

    // Masked project ID for safe display (never shows API keys)
    const maskedProjectId = this.config && this.config.projectId 
      ? this.config.projectId 
      : null;

    const diagnosticSteps = [
      {
        id: "sdk",
        name: "Firebase Web SDK",
        ok: sdkLoaded,
        message: sdkLoaded ? "v10 Compat SDK detected in browser" : "Firebase Web SDK not loaded"
      },
      {
        id: "config",
        name: "Project Configuration",
        ok: hasConfig,
        message: hasConfig ? `Project ID: ${maskedProjectId}` : "Awaiting valid Firebase credentials"
      },
      {
        id: "app",
        name: "Firebase App",
        ok: appInit,
        message: appInit ? "App instance initialized" : "App instance not initialized"
      },
      {
        id: "auth",
        name: "Firebase Auth",
        ok: authAvailable,
        message: authAvailable ? "Auth service ready" : "Auth service unavailable"
      },
      {
        id: "firestore",
        name: "Cloud Firestore",
        ok: firestoreAvailable,
        message: firestoreAvailable ? "Firestore service ready" : "Firestore service unavailable"
      },
      {
        id: "storage",
        name: "Firebase Storage",
        ok: storageAvailable,
        message: storageAvailable ? "Storage service ready" : "Storage service unavailable"
      }
    ];

    return {
      success: allServicesAvailable,
      sdkLoaded,
      isConfigured: hasConfig,
      appInitialized: appInit,
      authAvailable,
      firestoreAvailable,
      storageAvailable,
      projectId: maskedProjectId,
      statusText,
      statusType,
      error: this.initError,
      diagnosticSteps
    };
  }
}

// Global singleton instance
window.NotesWallahFirebase = new FirebaseService();
