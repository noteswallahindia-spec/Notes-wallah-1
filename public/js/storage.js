/**
 * NOTES WALLAH - Storage Service (Firebase Storage)
 * Part 1 of 10: Foundation
 * 
 * Prepares the architecture for:
 * - Profile avatar uploads
 * - Academic Notes & PDF documents (Part 2+)
 * - Test question diagrams & solutions (Part 3+)
 */

class StorageService {
  constructor() {
    this.AVATARS_PATH = "avatars";
    this.NOTES_PATH = "notes";
  }

  /**
   * Upload Student Profile Picture
   */
  async uploadProfilePicture(uid, file) {
    if (!uid || !file) throw new Error("User ID and file are required.");

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.storage) {
      try {
        const fileExt = file.name.split(".").pop();
        const ref = fb.storage.ref(`${this.AVATARS_PATH}/${uid}_avatar.${fileExt}`);
        const snapshot = await ref.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
      } catch (err) {
        console.error("[StorageService] Upload error:", err);
        throw new Error("Unable to upload image right now. Please try again.");
      }
    }

    // Safe local blob URL for preview
    return URL.createObjectURL(file);
  }

  /**
   * Resolve public or authenticated download URL for a storage path
   */
  async getDownloadURL(storagePath) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.storage) {
      try {
        const ref = fb.storage.ref(storagePath);
        return await ref.getDownloadURL();
      } catch (e) {
        console.warn("[StorageService] Could not get URL for path:", storagePath, e);
      }
    }
    return null;
  }
}

window.NotesWallahStorage = new StorageService();
