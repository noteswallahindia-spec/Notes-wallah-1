/**
 * NOTES WALLAH - Firebase Architecture & Configuration
 * Part 1 of 10: Foundation
 * 
 * Prepares the architecture for:
 * - Firebase Authentication
 * - Firebase Firestore
 * - Firebase Storage
 * - Firebase Cloud Functions (Part 5+)
 * - Firebase Cloud Messaging (Part 8+)
 * 
 * IMPORTANT:
 * - Frontend code uses only client SDK credentials.
 * - Do NOT put Firebase Admin SDK keys or private server secrets here.
 * - Replace the placeholder config below with your official Firebase Project credentials.
 */

// Official Firebase Project Configuration Placeholder
// Students/Developers can update this directly or inject via localStorage('nw_firebase_config')
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "notes-wallah-edu.firebaseapp.com",
  projectId: "notes-wallah-edu",
  storageBucket: "notes-wallah-edu.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

class FirebaseService {
  constructor() {
    this.config = this.loadConfig();
    this.isInitialized = false;
    this.isDemoMode = false;
    this.auth = null;
    this.firestore = null;
    this.storage = null;
  }

  /**
   * Load saved config from storage or fallback to defaults
   */
  loadConfig() {
    try {
      const stored = localStorage.getItem("nw_firebase_config");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[NotesWallah Firebase] Failed to parse stored config", e);
    }
    return { ...DEFAULT_FIREBASE_CONFIG };
  }

  /**
   * Save and apply new Firebase configuration
   */
  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem("nw_firebase_config", JSON.stringify(this.config));
    return this.initialize();
  }

  /**
   * Checks if user has provided real Firebase credentials
   */
  isConfigured() {
    return (
      this.config &&
      this.config.apiKey &&
      this.config.apiKey !== "YOUR_FIREBASE_API_KEY" &&
      this.config.projectId !== "notes-wallah-edu"
    );
  }

  /**
   * Initialize Firebase SDK or fallback to local development mode
   */
  async initialize() {
    if (this.isConfigured() && typeof window.firebase !== "undefined") {
      try {
        if (!window.firebase.apps || window.firebase.apps.length === 0) {
          window.firebase.initializeApp(this.config);
        }
        this.auth = window.firebase.auth();
        this.firestore = window.firebase.firestore();
        this.storage = window.firebase.storage();
        this.isInitialized = true;
        this.isDemoMode = false;
        console.info("[NotesWallah Firebase] Real Firebase Project connected successfully:", this.config.projectId);
        return { success: true, mode: "production" };
      } catch (err) {
        console.error("[NotesWallah Firebase] Initialization error, using safe local mode:", err);
      }
    }

    // Safe Development / Standby Mode:
    // Ensures Part 1 & 2 UI, onboarding, and navigation are 100% testable without breaking
    this.isInitialized = true;
    this.isDemoMode = true;
    console.info("[NotesWallah Firebase] Initialized in Safe Foundation Mode. (Ready for your Firebase Project Keys)");
    return { success: true, mode: "safe_foundation" };
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

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isConfigured: this.isConfigured(),
      projectId: this.config ? this.config.projectId : null,
      mode: this.isDemoMode ? "safe_foundation" : "production"
    };
  }
}

// Global singleton instance for the app
window.NotesWallahFirebase = new FirebaseService();
