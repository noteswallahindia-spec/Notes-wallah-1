/**
 * NOTES WALLAH - Database Service (Firebase Firestore)
 * Part 1 of 10: Foundation
 * 
 * Manages:
 * - Real Student Profile persistence in Firestore (collection: `users/{uid}`)
 * - Class, Board, Medium, Preferred Language synchronization
 * - Prepares academic schema for Part 2 (Subjects & Notes)
 * - Prepares test schema for Part 3 (Tests)
 * - Prepares challenges schema for Part 4 (Daily/Weekly Challenges)
 * 
 * STRICT COMPLIANCE:
 * - NO XP system anywhere (No XP fields, no XP tables, no XP variables)
 * - NO fake student statistics or mock numbers
 * - Clean empty states when data is not yet recorded
 */

class DatabaseService {
  constructor() {
    this.COLLECTION_USERS = "users";
    this.COLLECTION_SUBJECTS = "subjects";
    this.COLLECTION_CHAPTERS = "chapters";
    this.COLLECTION_TESTS = "tests";
    this.COLLECTION_CHALLENGES = "challenges";
    this.LOCAL_PROFILES_PREFIX = "nw_profile_";
  }

  /**
   * Save or update Student Profile in Firestore & local fallback cache
   */
  async saveUserProfile(uid, profileData) {
    if (!uid) throw new Error("Student UID is required.");

    const sanitizedData = {
      uid: uid,
      name: profileData.name ? profileData.name.trim() : "",
      classLevel: profileData.classLevel || "",
      board: profileData.board || "",
      medium: profileData.medium || "",
      preferredLanguage: profileData.preferredLanguage || "English",
      updatedAt: new Date().toISOString()
    };

    if (profileData.email) {
      sanitizedData.email = profileData.email;
    }

    // 1. Save to local cache
    try {
      const existing = await this.getUserProfile(uid) || {};
      const merged = { ...existing, ...sanitizedData };
      if (!merged.createdAt) {
        merged.createdAt = new Date().toISOString();
      }
      localStorage.setItem(this.LOCAL_PROFILES_PREFIX + uid, JSON.stringify(merged));
    } catch (e) {
      console.warn("[DatabaseService] Local storage write error", e);
    }

    // 2. Persist to real Firestore if configured
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore.collection(this.COLLECTION_USERS).doc(uid).set(sanitizedData, { merge: true });
        console.info("[DatabaseService] Profile saved to Firestore successfully for student:", uid);
      } catch (err) {
        console.error("[DatabaseService] Firestore save error:", err);
      }
    }

    return sanitizedData;
  }

  /**
   * Fetch Student Profile
   */
  async getUserProfile(uid) {
    if (!uid) return null;

    // Try Firestore first if configured
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const doc = await fb.firestore.collection(this.COLLECTION_USERS).doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          localStorage.setItem(this.LOCAL_PROFILES_PREFIX + uid, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore fetch error, checking local store:", err);
      }
    }

    // Fallback to local cache
    try {
      const local = localStorage.getItem(this.LOCAL_PROFILES_PREFIX + uid);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.warn("[DatabaseService] Local read error", e);
    }

    return null;
  }

  /**
   * Prepared Foundation for Part 2: Subjects & Chapters
   * Returns empty array until Part 2 loads academic syllabus from Firebase
   */
  async getStudySubjects(classLevel, board) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_SUBJECTS)
          .where("classLevel", "==", classLevel)
          .where("board", "==", board)
          .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("[DatabaseService] Subjects query error:", e);
      }
    }
    // Safe empty state foundation for Part 1
    return [];
  }

  /**
   * Prepared Foundation for Part 3: Tests & Mock Series
   * Returns empty array until Part 3 introduces question banks
   */
  async getAvailableTests(classLevel, board) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_TESTS)
          .where("classLevel", "==", classLevel)
          .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("[DatabaseService] Tests query error:", e);
      }
    }
    return [];
  }

  /**
   * Prepared Foundation for Part 4: Daily & Weekly Challenges
   * Returns empty array until Part 4
   */
  async getChallenges(classLevel) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_CHALLENGES)
          .where("classLevel", "==", classLevel)
          .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("[DatabaseService] Challenges query error:", e);
      }
    }
    return [];
  }
}

window.NotesWallahDatabase = new DatabaseService();
