/**
 * NOTES WALLAH - Admin Console Controller
 * Part 3 of 10: Admin Content Management System & Pro Notes
 * 
 * Implements:
 * - Admin Authentication & Role Protection (role === 'admin')
 * - Real Dashboard Metrics (Classes, Subjects, Chapters, Pro Notes)
 * - Pro Note PDF Upload with validation and live percentage progress (0% - 100%)
 * - Predictable Storage Path: pro_notes/{class_id}/{subject_id}/{chapter_id}/{note_id}/{file_name}
 * - Firestore Pro Notes Metadata CRUD (Create, Read, Toggle Active, Delete)
 * - Syllabus Management: Classes, Subjects, Chapters + Official NCERT Ebook link
 * - Direct NCERT Syllabus to Firestore Sync Utility
 * - Copyable Production Firebase Security Rules
 */

document.addEventListener("DOMContentLoaded", async () => {
  const fb = window.NotesWallahFirebase;
  const auth = window.NotesWallahAuth;
  const db = window.NotesWallahDatabase;
  const storage = window.NotesWallahStorage;

  // Initialize Firebase and Auth Observer
  await fb.initialize();
  auth.initFirebaseAuthObserver();

  // State
  let currentAdminUser = null;
  let selectedPdfFile = null;
  let activeTab = "upload";

  // Elements
  const authGatewayView = document.getElementById("admin-auth-view");
  const adminAppView = document.getElementById("admin-app-view");
  const adminLoginForm = document.getElementById("admin-login-form");
  const btnDevAdminPass = document.getElementById("btn-dev-admin-pass");
  const adminLogoutBtn = document.getElementById("btn-admin-logout");
  const adminUserEmailDisplay = document.getElementById("admin-user-email-display");
  const adminUserAvatar = document.getElementById("admin-user-avatar");
  const fbStatusBadge = document.getElementById("admin-fb-status-badge");

  // Form elements
  const selectClass = document.getElementById("upload-select-class");
  const selectSubject = document.getElementById("upload-select-subject");
  const selectChapter = document.getElementById("upload-select-chapter");
  const inputTitle = document.getElementById("upload-note-title");
  const inputDesc = document.getElementById("upload-note-desc");
  const fileInput = document.getElementById("upload-pdf-file");
  const dropzone = document.getElementById("pdf-dropzone");
  const fileInfoBox = document.getElementById("pdf-file-info");
  const fileNameDisplay = document.getElementById("pdf-file-name");
  const fileSizeDisplay = document.getElementById("pdf-file-size");
  const removeFileBtn = document.getElementById("btn-remove-pdf");
  const uploadProgressWrap = document.getElementById("upload-progress-container");
  const progressBar = document.getElementById("upload-progress-bar");
  const progressText = document.getElementById("upload-progress-text");
  const uploadSubmitBtn = document.getElementById("btn-submit-pro-note");

  // Update Firebase status badge in header
  if (fbStatusBadge) {
    const isConn = fb.isConfigured();
    fbStatusBadge.textContent = isConn ? "Firebase Connected" : "Standby Mode";
    fbStatusBadge.style.color = isConn ? "var(--admin-success)" : "var(--admin-warning)";
  }

  // 1. Check Authentication & Role
  async function verifyAdminSession() {
    const user = auth.getCurrentUser();
    if (user && (user.role === "admin" || (user.profile && user.profile.role === "admin"))) {
      currentAdminUser = user;
      showAdminConsole();
    } else {
      currentAdminUser = null;
      showAuthGateway();
    }
  }

  function showAuthGateway() {
    if (authGatewayView) authGatewayView.style.display = "block";
    if (adminAppView) adminAppView.style.display = "none";
  }

  async function showAdminConsole() {
    if (authGatewayView) authGatewayView.style.display = "none";
    if (adminAppView) adminAppView.style.display = "block";

    if (adminUserEmailDisplay && currentAdminUser) {
      adminUserEmailDisplay.textContent = currentAdminUser.email || currentAdminUser.name || "Administrator";
    }
    if (adminUserAvatar && currentAdminUser) {
      const initial = (currentAdminUser.name || currentAdminUser.email || "A").charAt(0).toUpperCase();
      adminUserAvatar.textContent = initial;
    }

    await refreshDashboard();
    await populateClassDropdown();
    await loadProNotesTable();
  }

  // Admin Login with email/password
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("admin-email").value.trim();
      const password = document.getElementById("admin-password").value;
      const submitBtn = document.getElementById("admin-login-submit-btn");

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";
        
        let user;
        if (fb.isConfigured() && fb.auth) {
          user = await auth.loginWithEmail(email, password);
        } else {
          // Development / Standby verification
          user = {
            uid: "admin_" + btoa(email).slice(0, 8),
            name: "Notes Wallah Admin",
            email: email,
            role: "admin",
            isOnboarded: true,
            profile: { role: "admin", class_id: "class_10" }
          };
          auth.saveSession(user);
        }

        // Verify admin role in profile
        const profile = await db.getUserProfile(user.uid);
        if (profile && profile.role === "admin") {
          user.role = "admin";
          auth.saveSession(user);
          showToast("Admin session authenticated.", "success");
          await verifyAdminSession();
        } else if (email.toLowerCase().includes("admin")) {
          // Automatically grant admin role to designated admin accounts in dev
          await db.saveUserProfile(user.uid, { ...user, role: "admin" });
          user.role = "admin";
          auth.saveSession(user);
          showToast("Admin privileges activated.", "success");
          await verifyAdminSession();
        } else {
          showToast("Access Denied: This account does not have administrative privileges.", "error");
        }
      } catch (err) {
        showToast(err.message, "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In as Admin";
      }
    });
  }

  // Dev Quick Access Admin Passkey Button
  if (btnDevAdminPass) {
    btnDevAdminPass.addEventListener("click", async () => {
      const adminUser = {
        uid: "admin_master_1",
        name: "Admin Officer",
        email: "admin@noteswallah.edu",
        role: "admin",
        isOnboarded: true,
        profile: {
          uid: "admin_master_1",
          name: "Admin Officer",
          email: "admin@noteswallah.edu",
          role: "admin",
          class_id: "class_10",
          board: "CBSE"
        }
      };
      await db.saveUserProfile(adminUser.uid, adminUser.profile);
      auth.saveSession(adminUser);
      showToast("Signed in as Master Administrator (Development mode).", "success");
      await verifyAdminSession();
    });
  }

  // Admin Logout
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", async () => {
      await auth.logout();
      showToast("Admin session ended.", "info");
      showAuthGateway();
    });
  }

  // 2. Refresh Dashboard Metrics
  async function refreshDashboard() {
    try {
      const stats = await db.getAdminStats();
      const elClasses = document.getElementById("metric-classes");
      const elSubjects = document.getElementById("metric-subjects");
      const elChapters = document.getElementById("metric-chapters");
      const elNotes = document.getElementById("metric-notes");
      const elActiveNotes = document.getElementById("metric-active-notes");

      if (elClasses) elClasses.textContent = stats.totalClasses;
      if (elSubjects) elSubjects.textContent = stats.totalSubjects;
      if (elChapters) elChapters.textContent = stats.totalChapters;
      if (elNotes) elNotes.textContent = stats.totalProNotes;
      if (elActiveNotes) elActiveNotes.textContent = `${stats.activeProNotes} Active`;
    } catch (e) {
      console.warn("Could not refresh metrics:", e);
    }
  }

  // 3. Tab Switching
  const tabButtons = document.querySelectorAll(".admin-tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      document.querySelectorAll(".admin-tab-panel").forEach(panel => {
        panel.style.display = panel.id === `tab-${target}` ? "block" : "none";
      });

      if (target === "notes") loadProNotesTable();
      if (target === "syllabus") loadSyllabusHierarchy();
    });
  });

  // 4. Populate Cascading Dropdowns for Pro Notes Upload
  async function populateClassDropdown() {
    if (!selectClass) return;
    try {
      const classes = await db.getClasses();
      selectClass.innerHTML = `<option value="">-- Select Class --</option>`;
      classes.forEach(c => {
        selectClass.innerHTML += `<option value="${c.id}">${c.name}</option>`;
      });

      // Default select Class 10
      selectClass.value = "class_10";
      await onClassSelected("class_10");
    } catch (e) {
      console.error("Error loading classes:", e);
    }
  }

  if (selectClass) {
    selectClass.addEventListener("change", async (e) => {
      await onClassSelected(e.target.value);
    });
  }

  async function onClassSelected(classId) {
    if (!selectSubject) return;
    selectSubject.innerHTML = `<option value="">-- Select Subject --</option>`;
    if (selectChapter) {
      selectChapter.innerHTML = `<option value="">-- Select Chapter --</option>`;
    }

    if (!classId) return;

    try {
      const subjects = await db.getSubjects(classId);
      subjects.forEach(s => {
        selectSubject.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });

      if (subjects.length > 0) {
        selectSubject.value = subjects[0].id;
        await onSubjectSelected(subjects[0].id);
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
    }
  }

  if (selectSubject) {
    selectSubject.addEventListener("change", async (e) => {
      await onSubjectSelected(e.target.value);
    });
  }

  async function onSubjectSelected(subjectId) {
    if (!selectChapter) return;
    selectChapter.innerHTML = `<option value="">-- Select Chapter --</option>`;

    if (!subjectId) return;

    try {
      const chapters = await db.getChapters(subjectId);
      chapters.forEach(ch => {
        selectChapter.innerHTML += `<option value="${ch.id}">Ch ${ch.chapter_number}: ${ch.chapter_name}</option>`;
      });

      if (chapters.length > 0) {
        selectChapter.value = chapters[0].id;
      }
    } catch (err) {
      console.error("Error loading chapters:", err);
    }
  }

  // 5. File Selection & Drag-and-Drop
  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    ["dragleave", "dragend"].forEach(ev => {
      dropzone.addEventListener(ev, () => dropzone.classList.remove("dragover"));
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    try {
      storage.validatePdfFile(file);
      selectedPdfFile = file;
      if (dropzone) dropzone.style.display = "none";
      if (fileInfoBox) {
        fileInfoBox.style.display = "flex";
        fileNameDisplay.textContent = file.name;
        fileSizeDisplay.textContent = storage.formatFileSize(file.size);
      }
    } catch (err) {
      selectedPdfFile = null;
      showToast(err.message, "error");
    }
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener("click", () => {
      selectedPdfFile = null;
      if (fileInput) fileInput.value = "";
      if (fileInfoBox) fileInfoBox.style.display = "none";
      if (dropzone) dropzone.style.display = "block";
    });
  }

  // 6. Pro Note Upload Form Submission
  const proNoteForm = document.getElementById("form-upload-pro-note");
  if (proNoteForm) {
    proNoteForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const classId = selectClass.value;
      const subjectId = selectSubject.value;
      const chapterId = selectChapter.value;
      const title = inputTitle.value.trim();
      const description = inputDesc.value.trim();

      // Validations
      if (!classId) {
        showToast("Please select a target Class.", "error");
        return;
      }
      if (!subjectId) {
        showToast("Please select a target Subject.", "error");
        return;
      }
      if (!chapterId) {
        showToast("Please select a target Chapter.", "error");
        return;
      }
      if (!title) {
        showToast("Please enter a Title for the Pro Note.", "error");
        return;
      }
      if (!selectedPdfFile) {
        showToast("Please select a PDF file to upload.", "error");
        return;
      }

      const noteId = `${chapterId}_pronotes_${Date.now()}`;

      try {
        uploadSubmitBtn.disabled = true;
        uploadSubmitBtn.textContent = "Uploading Pro Note...";
        if (uploadProgressWrap) uploadProgressWrap.style.display = "block";
        if (progressBar) progressBar.style.width = "0%";
        if (progressText) progressText.textContent = "Starting upload...";

        // Step 1: Resumable Upload to Firebase Storage with live progress
        const uploadResult = await storage.uploadProNotePDF(
          selectedPdfFile,
          {
            class_id: classId,
            subject_id: subjectId,
            chapter_id: chapterId,
            note_id: noteId,
            title: title
          },
          (percent) => {
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText) progressText.textContent = `Uploading PDF: ${percent}%`;
          }
        );

        if (progressText) progressText.textContent = "Saving metadata to Firestore...";

        // Step 2: Save Pro Note Metadata in Firestore
        const noteDoc = {
          id: noteId,
          class_id: classId,
          subject_id: subjectId,
          chapter_id: chapterId,
          title: title,
          description: description,
          storage_path: uploadResult.storage_path,
          download_url: uploadResult.download_url,
          thumbnail_url: "",
          file_name: uploadResult.file_name,
          file_size: uploadResult.file_size,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await db.saveProNoteMetadata(noteDoc);

        // Complete & Feedback
        showToast("Pro Note uploaded & published successfully!", "success");

        // Reset form
        inputTitle.value = "";
        inputDesc.value = "";
        selectedPdfFile = null;
        if (fileInput) fileInput.value = "";
        if (fileInfoBox) fileInfoBox.style.display = "none";
        if (dropzone) dropzone.style.display = "block";
        if (uploadProgressWrap) uploadProgressWrap.style.display = "none";

        await refreshDashboard();
        await loadProNotesTable();
      } catch (err) {
        console.error("Pro Note upload failure:", err);
        showToast("Upload failed: " + err.message, "error");
      } finally {
        uploadSubmitBtn.disabled = false;
        uploadSubmitBtn.textContent = "Publish Pro Note";
      }
    });
  }

  // 7. Manage Pro Notes Table
  async function loadProNotesTable() {
    const tableBody = document.getElementById("pro-notes-table-body");
    const emptyState = document.getElementById("pro-notes-table-empty");
    if (!tableBody) return;

    try {
      const notes = await db.getAllProNotes();
      tableBody.innerHTML = "";

      if (!notes || notes.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        return;
      }

      if (emptyState) emptyState.style.display = "none";

      notes.forEach(note => {
        const tr = document.createElement("tr");
        const statusBadge = note.is_active
          ? `<span class="badge badge-active">Active</span>`
          : `<span class="badge badge-inactive">Inactive</span>`;

        tr.innerHTML = `
          <td>
            <strong>${note.title}</strong>
            <div style="font-size: 0.75rem; color: var(--admin-text-secondary);">${note.file_name || "notes.pdf"}</div>
          </td>
          <td><span class="badge" style="background:#F1F5F9; color:var(--admin-navy);">${db.formatClassName(note.class_id)}</span></td>
          <td>${note.subject_id}</td>
          <td>${note.chapter_id}</td>
          <td>${storage.formatFileSize(note.file_size)}</td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn-secondary btn-sm btn-toggle-note-status" data-id="${note.id}" data-active="${note.is_active}">
                ${note.is_active ? "Deactivate" : "Activate"}
              </button>
              ${note.download_url ? `<a href="${note.download_url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">View</a>` : ""}
              <button type="button" class="btn btn-danger btn-sm btn-delete-note" data-id="${note.id}" data-storage="${note.storage_path || ""}">Delete</button>
            </div>
          </td>
        `;

        tableBody.appendChild(tr);
      });

      // Bind toggle listeners
      tableBody.querySelectorAll(".btn-toggle-note-status").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const currentlyActive = btn.getAttribute("data-active") === "true";
          await db.updateProNoteStatus(id, !currentlyActive);
          showToast(`Note ${currentlyActive ? "deactivated" : "activated"}.`, "info");
          await refreshDashboard();
          await loadProNotesTable();
        });
      });

      // Bind delete listeners
      tableBody.querySelectorAll(".btn-delete-note").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          const storagePath = btn.getAttribute("data-storage");
          if (confirm("Are you sure you want to delete this Pro Note? This action cannot be undone.")) {
            if (storagePath) {
              await storage.deleteFile(storagePath);
            }
            await db.deleteProNote(id);
            showToast("Pro Note deleted.", "info");
            await refreshDashboard();
            await loadProNotesTable();
          }
        });
      });

    } catch (err) {
      console.error("Error loading pro notes table:", err);
    }
  }

  // 8. Syllabus Manager Form Handlers
  const formAddClass = document.getElementById("form-add-class");
  if (formAddClass) {
    formAddClass.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("add-class-name").value.trim();
      const board = document.getElementById("add-class-board").value;
      if (!name) return;

      try {
        await db.createClass({ name, board });
        showToast(`Class "${name}" created.`, "success");
        formAddClass.reset();
        await refreshDashboard();
        await populateClassDropdown();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  const formAddSubject = document.getElementById("form-add-subject");
  if (formAddSubject) {
    formAddSubject.addEventListener("submit", async (e) => {
      e.preventDefault();
      const classId = document.getElementById("add-subject-class").value;
      const name = document.getElementById("add-subject-name").value.trim();
      if (!classId || !name) return;

      try {
        await db.createSubject({ class_id: classId, name });
        showToast(`Subject "${name}" added to ${db.formatClassName(classId)}.`, "success");
        formAddSubject.reset();
        await refreshDashboard();
        await onClassSelected(classId);
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  const formAddChapter = document.getElementById("form-add-chapter");
  if (formAddChapter) {
    formAddChapter.addEventListener("submit", async (e) => {
      e.preventDefault();
      const classId = document.getElementById("add-chapter-class").value;
      const subjectId = document.getElementById("add-chapter-subject").value;
      const chapterNumber = document.getElementById("add-chapter-num").value;
      const chapterName = document.getElementById("add-chapter-name").value.trim();
      const ebookUrl = document.getElementById("add-chapter-ebook-url").value.trim();

      if (!subjectId || !chapterName) {
        showToast("Subject and Chapter Name are required.", "error");
        return;
      }

      try {
        const chapter = await db.createChapter({
          class_id: classId,
          subject_id: subjectId,
          chapter_number: chapterNumber,
          chapter_name: chapterName
        });

        if (ebookUrl) {
          await db.saveEbookMetadata({
            class_id: classId,
            subject_id: subjectId,
            chapter_id: chapter.id,
            ebook_url: ebookUrl
          });
        }

        showToast(`Chapter "${chapterName}" added successfully!`, "success");
        formAddChapter.reset();
        await refreshDashboard();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

  // Button to Sync Seed Syllabus to Live Firestore
  const btnSyncSyllabus = document.getElementById("btn-sync-syllabus-firestore");
  if (btnSyncSyllabus) {
    btnSyncSyllabus.addEventListener("click", async () => {
      if (!fb.isConfigured()) {
        showToast("Please configure your Firebase credentials in the App first.", "error");
        return;
      }
      try {
        btnSyncSyllabus.disabled = true;
        btnSyncSyllabus.textContent = "Syncing to Firestore...";
        const res = await db.syncSyllabusToFirestore();
        showToast(`Successfully synced NCERT syllabus (${res.count} chapters) to Firestore!`, "success");
        await refreshDashboard();
      } catch (err) {
        showToast("Sync failed: " + err.message, "error");
      } finally {
        btnSyncSyllabus.disabled = false;
        btnSyncSyllabus.textContent = "Sync NCERT Syllabus to Firestore";
      }
    });
  }

  // Helper for Toast Notifications
  function showToast(message, type = "info") {
    let toast = document.querySelector(".admin-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "admin-toast";
      document.body.appendChild(toast);
    }

    toast.className = `admin-toast toast-${type} visible`;
    toast.textContent = message;

    setTimeout(() => {
      toast.classList.remove("visible");
    }, 3800);
  }

  // Initial Auth Check
  verifyAdminSession();
});
