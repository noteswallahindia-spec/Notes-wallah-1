/**
 * NOTES WALLAH - Storage Service (Firebase Storage)
 * Part 3 of 10: Pro Notes & PDF Document Storage
 * 
 * Implements:
 * - Predictable Storage Path:
 *     pro_notes/{class_id}/{subject_id}/{chapter_id}/{note_id}/{file_name}
 * - Strict PDF File Type & Size Validation (Max 50MB)
 * - Resumable Upload with real-time progress callbacks (0% - 100%)
 * - Safe download URL resolution
 * - Safe fallback simulation for testing prior to live Firebase project key entry
 */

class StorageService {
  constructor() {
    this.AVATARS_PATH = "avatars";
    this.PRO_NOTES_BASE = "pro_notes";
    this.MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Helper to format bytes into readable string (e.g. "4.2 MB")
   */
  formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  /**
   * Validate PDF file before attempting upload
   */
  validatePdfFile(file) {
    if (!file) {
      throw new Error("Please select a PDF file to upload.");
    }
    const isPdfType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdfType) {
      throw new Error("Invalid file type. Only PDF documents (.pdf) are permitted for Pro Notes.");
    }
    if (file.size > this.MAX_PDF_SIZE_BYTES) {
      throw new Error(`File is too large (${this.formatFileSize(file.size)}). Maximum allowed size is 50MB.`);
    }
    return true;
  }

  /**
   * Build predictable storage path for a Pro Note
   * pro_notes/{class_id}/{subject_id}/{chapter_id}/{note_id}/{file_name}
   */
  buildProNoteStoragePath(classId, subjectId, chapterId, noteId, fileName) {
    const cleanClass = String(classId).trim().toLowerCase();
    const cleanSubject = String(subjectId).trim().toLowerCase();
    const cleanChapter = String(chapterId).trim().toLowerCase();
    const cleanNoteId = String(noteId).trim();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    return `${this.PRO_NOTES_BASE}/${cleanClass}/${cleanSubject}/${cleanChapter}/${cleanNoteId}/${cleanFileName}`;
  }

  /**
   * Resumable Pro Note PDF Upload with Progress Callback
   * 
   * @param {File} file - PDF file to upload
   * @param {Object} metadata - { class_id, subject_id, chapter_id, note_id, title }
   * @param {Function} onProgress - Callback receiving numeric progress (0 to 100)
   * @returns {Promise<{ storage_path: string, download_url: string, file_name: string, file_size: number }>}
   */
  async uploadProNotePDF(file, metadata, onProgress = () => {}) {
    this.validatePdfFile(file);

    const { class_id, subject_id, chapter_id, note_id, title } = metadata;
    if (!class_id || !subject_id || !chapter_id || !note_id) {
      throw new Error("Missing academic hierarchy. Class, Subject, Chapter and Note ID are required.");
    }

    const storagePath = this.buildProNoteStoragePath(class_id, subject_id, chapter_id, note_id, file.name);
    const fb = window.NotesWallahFirebase;

    // Real Firebase Storage Upload with Resumable Progress
    if (fb.isConfigured() && fb.storage) {
      return new Promise((resolve, reject) => {
        try {
          const storageRef = fb.storage.ref(storagePath);
          const uploadMetadata = {
            contentType: "application/pdf",
            customMetadata: {
              class_id,
              subject_id,
              chapter_id,
              note_id,
              title: title || file.name,
              uploaded_at: new Date().toISOString()
            }
          };

          const uploadTask = storageRef.put(file, uploadMetadata);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              if (snapshot.totalBytes > 0) {
                const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                onProgress(percent);
              }
            },
            (error) => {
              console.error("[StorageService] Firebase Storage upload failed:", error);
              reject(new Error("Firebase Storage upload failed: " + (error.message || "Unknown error")));
            },
            async () => {
              try {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                onProgress(100);
                resolve({
                  storage_path: storagePath,
                  download_url: downloadURL,
                  file_name: file.name,
                  file_size: file.size
                });
              } catch (urlErr) {
                reject(urlErr);
              }
            }
          );
        } catch (err) {
          reject(err);
        }
      });
    }

    // Safe Foundation Mode: Simulated resumable upload with live progress
    return new Promise((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 20;
        if (currentProgress >= 100) {
          clearInterval(interval);
          onProgress(100);
          const blobUrl = URL.createObjectURL(file);
          resolve({
            storage_path: storagePath,
            download_url: blobUrl,
            file_name: file.name,
            file_size: file.size
          });
        } else {
          onProgress(currentProgress);
        }
      }, 150);
    });
  }

  /**
   * Delete file from Firebase Storage
   */
  async deleteFile(storagePath) {
    if (!storagePath) return;
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.storage) {
      try {
        const ref = fb.storage.ref(storagePath);
        await ref.delete();
        console.info("[StorageService] File deleted from Firebase Storage:", storagePath);
      } catch (err) {
        console.warn("[StorageService] Unable to delete file from storage (might not exist):", err);
      }
    }
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
    if (!storagePath) return null;
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
