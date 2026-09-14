/**
 * NOTES WALLAH - Authentication Architecture
 * Part 1 of 10: Foundation
 * 
 * Supports:
 * - Email & Password Login
 * - New Student Registration
 * - Google Sign-In
 * - Password Reset
 * - Session Persistence & Detection
 * - Student-Friendly Error Handling (Never exposes raw Firebase error codes)
 */

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    this.STORAGE_KEY = "nw_active_student_session";
    this.restoreSession();
  }

  /**
   * Translates cryptic Firebase error codes into encouraging, respectful messages
   */
  mapErrorMessage(errorCode) {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address (e.g. student@gmail.com).";
      case "auth/user-not-found":
        return "We couldn't find an account with this email. Please check your spelling or sign up.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password. If you've forgotten it, use 'Forgot Password' below.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please tap 'Log in' instead.";
      case "auth/weak-password":
        return "Password is too short. Please choose at least 6 characters for safety.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your mobile data or Wi-Fi.";
      case "auth/popup-closed-by-user":
        return "Google sign-in window was closed. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. For your security, please wait a few moments and try again.";
      default:
        return "Unable to sign in right now. Please verify your details and try again.";
    }
  }

  /**
   * Restores existing session from local storage on app start
   */
  restoreSession() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[AuthService] Could not restore session", e);
    }
  }

  /**
   * Save session locally
   */
  saveSession(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.notifyListeners();
  }

  /**
   * Initialize Firebase Auth listener for real session restore
   */
  initFirebaseAuthObserver() {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth) {
      fb.auth.onAuthStateChanged(async (fbUser) => {
        if (fbUser) {
          try {
            let profile = await window.NotesWallahDatabase.getUserProfile(fbUser.uid);
            const user = {
              uid: fbUser.uid,
              email: fbUser.email,
              name: profile ? profile.name : fbUser.displayName || fbUser.email.split("@")[0],
              role: profile ? (profile.role || "student") : "student",
              isOnboarded: !!(profile && (profile.classLevel || profile.class_id)),
              profile: profile || {}
            };
            this.saveSession(user);
          } catch (e) {
            console.warn("[AuthService] Error fetching profile on auth change:", e);
          }
        }
      });
    }
  }

  /**
   * Register listener for auth state changes
   */
  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    this.authListeners.forEach(cb => {
      try { cb(this.currentUser); } catch (e) { console.error(e); }
    });
  }

  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Sign in with Email and Password
   */
  async loginWithEmail(email, password) {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth) {
      try {
        const userCredential = await fb.auth.signInWithEmailAndPassword(email.trim(), password);
        const fbUser = userCredential.user;
        const profile = await window.NotesWallahDatabase.getUserProfile(fbUser.uid);
        
        const user = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: profile ? profile.name : fbUser.displayName || email.split("@")[0],
          isOnboarded: !!(profile && profile.classLevel),
          profile: profile || {}
        };
        this.saveSession(user);
        return user;
      } catch (err) {
        throw new Error(this.mapErrorMessage(err.code || err.message));
      }
    }

    // Safe Foundation fallback for offline/development test
    const user = {
      uid: "student_" + btoa(email.trim()).replace(/=/g, "").slice(0, 10),
      email: email.trim(),
      name: email.split("@")[0],
      isOnboarded: false,
      profile: {}
    };

    // Check if user has an existing saved profile in database
    const existing = await window.NotesWallahDatabase.getUserProfile(user.uid);
    if (existing) {
      user.name = existing.name || user.name;
      user.isOnboarded = !!existing.classLevel;
      user.profile = existing;
    }

    this.saveSession(user);
    return user;
  }

  /**
   * Register new student with Name, Email & Password
   */
  async signupWithEmail(name, email, password, confirmPassword) {
    if (!name || !name.trim()) {
      throw new Error("Please enter your full name.");
    }
    if (!email || !email.trim()) {
      throw new Error("Please enter your email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match. Please recheck.");
    }

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth) {
      try {
        const userCredential = await fb.auth.createUserWithEmailAndPassword(email.trim(), password);
        const fbUser = userCredential.user;
        await fbUser.updateProfile({ displayName: name.trim() });

        const user = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: name.trim(),
          isOnboarded: false,
          profile: {}
        };
        this.saveSession(user);
        return user;
      } catch (err) {
        throw new Error(this.mapErrorMessage(err.code || err.message));
      }
    }

    // Safe Foundation fallback
    const user = {
      uid: "student_" + Math.random().toString(36).substring(2, 9),
      email: email.trim(),
      name: name.trim(),
      isOnboarded: false,
      profile: {}
    };
    this.saveSession(user);
    return user;
  }

  /**
   * Continue with Google Sign-In
   */
  async loginWithGoogle() {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth && window.firebase) {
      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        const result = await fb.auth.signInWithPopup(provider);
        const fbUser = result.user;
        const profile = await window.NotesWallahDatabase.getUserProfile(fbUser.uid);
        
        const user = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || "Student",
          photoURL: fbUser.photoURL || null,
          isOnboarded: !!(profile && profile.classLevel),
          profile: profile || {}
        };
        this.saveSession(user);
        return user;
      } catch (err) {
        throw new Error(this.mapErrorMessage(err.code || err.message));
      }
    }

    // Safe Foundation Google Mock for preview/development
    const user = {
      uid: "google_student_" + Math.random().toString(36).substring(2, 9),
      email: "student.google@noteswallah.in",
      name: "Google Student",
      isOnboarded: false,
      profile: {}
    };
    this.saveSession(user);
    return user;
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(email) {
    if (!email || !email.trim()) {
      throw new Error("Please enter your registered email address.");
    }

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth) {
      try {
        await fb.auth.sendPasswordResetEmail(email.trim());
        return true;
      } catch (err) {
        throw new Error(this.mapErrorMessage(err.code || err.message));
      }
    }

    // Simulation confirmation for foundation mode
    return true;
  }

  /**
   * Log out active student
   */
  async logout() {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.auth) {
      try {
        await fb.auth.signOut();
      } catch (e) {
        console.warn("[AuthService] Firebase signOut warning:", e);
      }
    }
    this.saveSession(null);
  }
}

window.NotesWallahAuth = new AuthService();
