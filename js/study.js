/**
 * NOTES WALLAH - Academic Study & Syllabus Controller
 * Part 2 of 10: Complete NCERT-Based Study System
 * 
 * Hierarchy:
 * Class -> Subject -> Chapter -> NCERT Ebook or Pro Notes
 * 
 * Key Principles:
 * - Strictly NCERT-based syllabus (Class 9, 10, 11, 12)
 * - Zero XP system (no XP fields, requirements, or unlocks)
 * - Class filtering: Students only see content matching their selected class_id
 * - Lazy loading: Queries are executed on-demand (Subject -> Chapters -> Resources)
 * - Official NCERT Ebook links opened directly (never uploaded to Firebase Storage)
 * - Pro Notes Ad flow: Opens via AdService gatekeeper without fake completion
 * - Back navigation: Seamlessly moves within the study stack without page reload
 */

class StudyController {
  constructor() {
    this.currentClassId = "class_10";
    this.currentClassName = "Class 10";
    this.currentSubject = null;
    this.currentChapter = null;
    this.currentEbook = null;
    this.currentProNotes = null;

    // View stack for breadcrumbs and back navigation: 'subjects' | 'chapters' | 'detail'
    this.activeStudyLevel = "subjects";
    this.historyStack = [];
  }

  /**
   * Initialize study controller with authenticated user
   */
  async init(user) {
    if (user && user.profile) {
      this.currentClassId = window.NotesWallahDatabase.normalizeClassId(
        user.profile.class_id || user.profile.classLevel
      );
      this.currentClassName = user.profile.classLevel || window.NotesWallahDatabase.formatClassName(this.currentClassId);
    } else {
      this.currentClassId = "class_10";
      this.currentClassName = "Class 10";
    }

    this.bindDOM();
    await this.loadSubjects();
  }

  /**
   * Update active class (e.g. when student switches class)
   */
  async switchClass(newClassId) {
    this.currentClassId = window.NotesWallahDatabase.normalizeClassId(newClassId);
    this.currentClassName = window.NotesWallahDatabase.formatClassName(this.currentClassId);
    
    // Reset view to subjects root
    this.showSubview("subjects");
    await this.loadSubjects();
  }

  /**
   * Bind event listeners for study sub-views
   */
  bindDOM() {
    // Back to subjects button
    const btnBackToSubjects = document.getElementById("btn-study-back-to-subjects");
    if (btnBackToSubjects) {
      btnBackToSubjects.addEventListener("click", () => {
        this.navigateToLevel("subjects");
      });
    }

    // Back to chapters button
    const btnBackToChapters = document.getElementById("btn-study-back-to-chapters");
    if (btnBackToChapters) {
      btnBackToChapters.addEventListener("click", () => {
        this.navigateToLevel("chapters");
      });
    }

    // Change Class button in study header
    const btnChangeClass = document.getElementById("btn-change-study-class");
    if (btnChangeClass) {
      btnChangeClass.addEventListener("click", () => {
        this.openClassSwitcher();
      });
    }

    // Class switcher modal form submit
    const classSwitchForm = document.getElementById("class-switcher-form");
    if (classSwitchForm) {
      classSwitchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedRadio = document.querySelector('input[name="switch_class_radio"]:checked');
        if (selectedRadio) {
          const newClassId = selectedRadio.value;
          await this.applyClassChange(newClassId);
        }
      });
    }

    // Pro Notes unlock button inside chapter detail
    const proNotesActionArea = document.getElementById("pro-notes-action-area");
    if (proNotesActionArea) {
      proNotesActionArea.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btn-unlock-pro-notes");
        if (btn) {
          const noteId = btn.getAttribute("data-note-id");
          await this.handleProNotesUnlock(noteId);
        }
      });
    }

    // NCERT Ebook button inside chapter detail
    const ebookActionArea = document.getElementById("ebook-action-area");
    if (ebookActionArea) {
      ebookActionArea.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-read-ncert-ebook");
        if (btn) {
          const url = btn.getAttribute("data-url");
          if (url && url.startsWith("http")) {
            // Open official NCERT portal link directly
            window.open(url, "_blank", "noopener,noreferrer");
          } else {
            window.NotesWallahUI.showToast("NCERT Ebook link is not currently accessible.", "error");
          }
        }
      });
    }

    // Pro Notes Reader modal unlock confirm
    const btnReaderPreview = document.getElementById("btn-preview-pro-notes-reader");
    if (btnReaderPreview) {
      btnReaderPreview.addEventListener("click", () => {
        window.NotesWallahUI.closeModal("modal-pro-notes-ad");
        this.openProNotesReader();
      });
    }
  }

  // ==========================================================================
  // 1. SUBJECTS LEVEL
  // ==========================================================================

  /**
   * Load subjects strictly for the student's selected class_id
   * Firebase Query Efficiency: Only loads subjects for current class
   */
  async loadSubjects() {
    const listContainer = document.getElementById("study-subjects-list");
    const loadingEl = document.getElementById("study-subjects-loading");
    const emptyEl = document.getElementById("study-subjects-empty");
    const errorEl = document.getElementById("study-subjects-error");
    const countBadge = document.getElementById("study-subject-count-badge");
    const classDisplays = document.querySelectorAll(".study-active-class-name");

    classDisplays.forEach(el => el.textContent = this.currentClassName);

    if (loadingEl) loadingEl.style.display = "flex";
    if (emptyEl) emptyEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
    if (listContainer) listContainer.innerHTML = "";

    try {
      const subjects = await window.NotesWallahDatabase.getSubjects(this.currentClassId);

      if (loadingEl) loadingEl.style.display = "none";

      if (!subjects || subjects.length === 0) {
        if (emptyEl) emptyEl.style.display = "flex";
        if (countBadge) countBadge.textContent = "0 Subjects";
        return;
      }

      if (countBadge) countBadge.textContent = `${subjects.length} Subjects`;

      // Render Subject Cards with proper vector graphics (zero emojis)
      const icons = window.NotesWallahIcons;
      let html = "";
      for (const subject of subjects) {
        let subjectIconSvg = icons.bookOpen;
        const subNameLower = subject.name.toLowerCase();
        if (subNameLower.includes("science") || subNameLower.includes("physics") || subNameLower.includes("chemistry") || subNameLower.includes("biology")) {
          subjectIconSvg = icons.science;
        } else if (subNameLower.includes("math")) {
          subjectIconSvg = icons.math;
        } else if (subNameLower.includes("social")) {
          subjectIconSvg = icons.socialScience;
        } else if (subNameLower.includes("english")) {
          subjectIconSvg = icons.english;
        } else if (subNameLower.includes("hindi") || subNameLower.includes("urdu")) {
          subjectIconSvg = icons.hindi;
        }

        html += `
          <div class="study-subject-card" data-subject-id="${subject.id}">
            <div class="subject-card-left">
              <div class="subject-card-icon">
                ${subjectIconSvg}
              </div>
              <div class="subject-card-text">
                <h4 class="subject-card-title">${subject.name}</h4>
                <p class="subject-card-meta">Official NCERT Syllabus</p>
              </div>
            </div>
            <div class="subject-card-right">
              <span class="subject-chevron">${icons.chevronRight}</span>
            </div>
          </div>
        `;
      }

      listContainer.innerHTML = html;

      // Attach click listeners to cards
      listContainer.querySelectorAll(".study-subject-card").forEach(card => {
        card.addEventListener("click", () => {
          const subjectId = card.getAttribute("data-subject-id");
          const selected = subjects.find(s => s.id === subjectId);
          if (selected) {
            this.openSubject(selected);
          }
        });
      });

    } catch (err) {
      console.error("[StudyController] Error loading subjects:", err);
      if (loadingEl) loadingEl.style.display = "none";
      if (errorEl) {
        errorEl.style.display = "block";
        errorEl.innerHTML = `
          <div class="error-notice">
            <p>Unable to load subjects at this time. Please check your internet connection.</p>
            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-retry-subjects">Retry</button>
          </div>
        `;
        const retryBtn = document.getElementById("btn-retry-subjects");
        if (retryBtn) retryBtn.addEventListener("click", () => this.loadSubjects());
      }
    }
  }

  // ==========================================================================
  // 2. CHAPTERS LEVEL
  // ==========================================================================

  /**
   * Open Subject view and lazy-load its chapters from Firebase
   */
  async openSubject(subject) {
    this.currentSubject = subject;
    this.showSubview("chapters");

    const headerTitle = document.getElementById("chapters-subject-title");
    const headerClass = document.getElementById("chapters-class-badge");
    const countText = document.getElementById("chapters-count-text");

    if (headerTitle) headerTitle.textContent = subject.name;
    if (headerClass) headerClass.textContent = this.currentClassName;
    if (countText) countText.textContent = "Loading official NCERT syllabus...";

    await this.loadChapters(subject.id);
  }

  /**
   * Fetch chapters for the active subject and render them
   */
  async loadChapters(subjectId) {
    const listContainer = document.getElementById("study-chapters-list");
    const loadingEl = document.getElementById("study-chapters-loading");
    const emptyEl = document.getElementById("study-chapters-empty");
    const errorEl = document.getElementById("study-chapters-error");
    const countText = document.getElementById("chapters-count-text");

    if (loadingEl) loadingEl.style.display = "flex";
    if (emptyEl) emptyEl.style.display = "none";
    if (errorEl) errorEl.style.display = "none";
    if (listContainer) listContainer.innerHTML = "";

    try {
      const chapters = await window.NotesWallahDatabase.getChapters(this.currentClassId, subjectId);

      if (loadingEl) loadingEl.style.display = "none";

      if (!chapters || chapters.length === 0) {
        if (emptyEl) emptyEl.style.display = "flex";
        if (countText) countText.textContent = "No chapters recorded yet";
        return;
      }

      if (countText) countText.textContent = `${chapters.length} NCERT Chapters`;

      // Check resource availability in parallel for badges
      const availabilityList = await Promise.all(
        chapters.map(ch => window.NotesWallahDatabase.checkChapterAvailability(ch.id))
      );

      const icons = window.NotesWallahIcons;
      let html = "";

      chapters.forEach((chapter, index) => {
        const avail = availabilityList[index] || { hasEbook: false, hasProNotes: false };

        const ebookBadge = avail.hasEbook
          ? `<span class="study-pill pill-green">${icons.bookOpen} Ebook Available</span>`
          : `<span class="study-pill pill-muted">Ebook Soon</span>`;

        const proNotesBadge = avail.hasProNotes
          ? `<span class="study-pill pill-gold">${icons.sparkle} Pro Notes</span>`
          : `<span class="study-pill pill-muted">Notes Soon</span>`;

        html += `
          <div class="study-chapter-card" data-chapter-id="${chapter.id}">
            <div class="chapter-card-header">
              <span class="chapter-badge">Chapter ${chapter.chapter_number}</span>
              <div class="chapter-pills-row">
                ${ebookBadge}
                ${proNotesBadge}
              </div>
            </div>
            <div class="chapter-card-body">
              <h4 class="chapter-card-name">${chapter.chapter_name}</h4>
              <div class="chapter-card-footer">
                <span class="chapter-read-action">Open Study Materials</span>
                <span class="chapter-card-arrow">${icons.chevronRight}</span>
              </div>
            </div>
          </div>
        `;
      });

      listContainer.innerHTML = html;

      // Attach chapter click handlers
      listContainer.querySelectorAll(".study-chapter-card").forEach(card => {
        card.addEventListener("click", () => {
          const chapterId = card.getAttribute("data-chapter-id");
          const selected = chapters.find(c => c.id === chapterId);
          if (selected) {
            this.openChapter(selected);
          }
        });
      });

    } catch (err) {
      console.error("[StudyController] Error loading chapters:", err);
      if (loadingEl) loadingEl.style.display = "none";
      if (errorEl) {
        errorEl.style.display = "block";
        errorEl.innerHTML = `
          <div class="error-notice">
            <p>Unable to load chapters at this time. Please try again.</p>
            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-retry-chapters">Retry</button>
          </div>
        `;
        const retryBtn = document.getElementById("btn-retry-chapters");
        if (retryBtn) retryBtn.addEventListener("click", () => this.loadChapters(subjectId));
      }
    }
  }

  // ==========================================================================
  // 3. CHAPTER DETAIL LEVEL (NCERT Ebook & Pro Notes)
  // ==========================================================================

  /**
   * Open Chapter detail view and lazy-load official NCERT Ebook and Pro Notes metadata
   */
  async openChapter(chapter) {
    this.currentChapter = chapter;
    this.showSubview("detail");

    const detailNum = document.getElementById("detail-chapter-num");
    const detailTitle = document.getElementById("detail-chapter-title");
    const detailMeta = document.getElementById("detail-subject-meta");
    const detailClass = document.getElementById("detail-class-badge");

    if (detailNum) detailNum.textContent = `Chapter ${chapter.chapter_number}`;
    if (detailTitle) detailTitle.textContent = chapter.chapter_name;
    if (detailMeta) detailMeta.textContent = `${this.currentClassName} • ${this.currentSubject ? this.currentSubject.name : "Subject"} • Official NCERT`;
    if (detailClass) detailClass.textContent = this.currentClassName;

    await this.loadChapterResources(chapter.id);
  }

  /**
   * Lazy load Ebook and Pro Notes metadata for the selected chapter
   */
  async loadChapterResources(chapterId) {
    const loadingEl = document.getElementById("study-detail-loading");
    const contentEl = document.getElementById("study-detail-content");
    const ebookArea = document.getElementById("ebook-action-area");
    const proNotesArea = document.getElementById("pro-notes-action-area");
    const proNotesDesc = document.getElementById("pro-notes-card-desc");

    if (loadingEl) loadingEl.style.display = "flex";
    if (contentEl) contentEl.style.opacity = "0.5";

    try {
      const [ebook, proNotes] = await Promise.all([
        window.NotesWallahDatabase.getEbookForChapter(chapterId),
        window.NotesWallahDatabase.getProNotesForChapter(chapterId)
      ]);

      this.currentEbook = ebook;
      this.currentProNotes = proNotes;

      if (loadingEl) loadingEl.style.display = "none";
      if (contentEl) contentEl.style.opacity = "1";

      const icons = window.NotesWallahIcons;

      // 1. NCERT Ebook Rendering
      // Strict rule: Only show button if a valid ebook URL exists!
      if (ebook && ebook.ebook_url && ebook.ebook_url.startsWith("http")) {
        ebookArea.innerHTML = `
          <button type="button" class="btn btn-outline-primary btn-read-ncert-ebook" data-url="${ebook.ebook_url}">
            ${icons.bookOpen}
            <span>Read NCERT Ebook</span>
            ${icons.externalLink}
          </button>
          <p class="study-card-fineprint">Opens official Government NCERT digital portal (Free public access)</p>
        `;
      } else {
        ebookArea.innerHTML = `
          <div class="study-notice-box">
            <span class="notice-icon">${icons.info}</span>
            <p>NCERT Ebook is not available yet.</p>
          </div>
        `;
      }

      // 2. Pro Notes Rendering
      // Strict rule: No XP. Connected to AdService flow.
      if (proNotes && proNotes.is_active) {
        if (proNotesDesc) {
          proNotesDesc.textContent = proNotes.description || "High-scoring handwritten topper notes with exam highlights and revision summaries.";
        }
        proNotesArea.innerHTML = `
          <button type="button" class="btn btn-gold btn-unlock-pro-notes" data-note-id="${proNotes.id}">
            ${icons.lock}
            <span>Unlock Pro Notes</span>
          </button>
          <p class="study-card-fineprint">Advertisement supported • Free Access • Immediate opening</p>
        `;
      } else {
        if (proNotesDesc) {
          proNotesDesc.textContent = "Topper handwritten notes for this specific chapter are currently being compiled.";
        }
        proNotesArea.innerHTML = `
          <div class="study-notice-box">
            <span class="notice-icon">${icons.info}</span>
            <p>No Pro Notes available yet.</p>
          </div>
        `;
      }

    } catch (err) {
      console.error("[StudyController] Error loading chapter study material:", err);
      if (loadingEl) loadingEl.style.display = "none";
      if (contentEl) contentEl.style.opacity = "1";
    }
  }

  // ==========================================================================
  // 4. PRO NOTES AD GATEKEEPER & DOCUMENT READER
  // ==========================================================================

  /**
   * Handle Pro Notes Unlock Request via AdService
   * Requirement:
   * User opens Pro Notes -> Advertisement -> Pro Notes opens
   * In Part 2:
   * - No fake ad completion
   * - Decoupled from ad provider
   * - Zero XP
   */
  async handleProNotesUnlock(noteId) {
    const adService = window.NotesWallahAdService;
    const adResult = await adService.showProNotesAd(noteId);

    if (adResult.completed) {
      // Production path: If a real ad provider showed and completed the ad
      this.openProNotesReader();
    } else {
      // Development / Safe Foundation path:
      // Show student-friendly ad requirement gatekeeper notice
      const modalMsg = document.getElementById("pro-notes-modal-message");
      if (modalMsg) {
        modalMsg.innerHTML = `
          <strong>Pro Notes Advertisement Gate:</strong><br>
          To maintain free quality education, Pro Notes require an advertisement before unlocking.<br><br>
          <em>Status:</em> No live Ad network SDK is connected in this build. You can preview the Pro Notes reader directly below.
        `;
      }
      window.NotesWallahUI.openModal("modal-pro-notes-ad");
    }
  }

  /**
   * Open the Pro Notes Document Reader Modal
   */
  openProNotesReader() {
    const note = this.currentProNotes;
    const chapter = this.currentChapter;
    const subject = this.currentSubject;

    const titleEl = document.getElementById("reader-note-title");
    const metaEl = document.getElementById("reader-note-meta");
    const descEl = document.getElementById("reader-note-desc");
    const storageEl = document.getElementById("reader-storage-path");

    if (titleEl) {
      titleEl.textContent = (note && note.title) || (chapter ? `${chapter.chapter_name} Pro Notes` : "Handwritten Pro Notes");
    }
    if (metaEl) {
      metaEl.textContent = `${this.currentClassName} • ${subject ? subject.name : "Subject"} • Chapter ${chapter ? chapter.chapter_number : ""}`;
    }
    if (descEl) {
      descEl.textContent = (note && note.description) || "Handwritten topper summary with key formulas, reactions, and CBSE board examination tips.";
    }
    if (storageEl) {
      storageEl.textContent = (note && note.storage_path) || "Firebase Storage: pro_notes/sample.pdf";
    }

    window.NotesWallahUI.openModal("modal-pro-notes-reader");
  }

  // ==========================================================================
  // 5. CLASS SWITCHER (Filtered Academic Re-sync)
  // ==========================================================================

  /**
   * Open Class Switcher Dialog
   */
  openClassSwitcher() {
    // Check currently selected radio
    const radios = document.querySelectorAll('input[name="switch_class_radio"]');
    radios.forEach(radio => {
      radio.checked = radio.value === this.currentClassId;
    });
    window.NotesWallahUI.openModal("modal-change-class");
  }

  /**
   * Apply class change, save to profile, and reload syllabus
   */
  async applyClassChange(newClassId) {
    const auth = window.NotesWallahAuth;
    const db = window.NotesWallahDatabase;
    const ui = window.NotesWallahUI;

    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      const updatedProfile = {
        ...(currentUser.profile || {}),
        class_id: newClassId,
        classLevel: db.formatClassName(newClassId)
      };

      try {
        await db.saveUserProfile(currentUser.uid, updatedProfile);
        currentUser.profile = updatedProfile;
        auth.saveSession(currentUser);
      } catch (e) {
        console.warn("[StudyController] Failed to persist profile class update:", e);
      }
    }

    ui.closeModal("modal-change-class");
    ui.showToast(`Switched to ${db.formatClassName(newClassId)}. Loading syllabus...`, "success");

    // Update displays across app
    document.querySelectorAll(".student-class-display").forEach(el => {
      el.textContent = db.formatClassName(newClassId);
    });

    await this.switchClass(newClassId);
  }

  // ==========================================================================
  // 6. NAVIGATION & SUBVIEW ROUTING
  // ==========================================================================

  /**
   * Switch between subjects, chapters, and detail sub-views
   * Strictly avoids reloading page, losing session, or breaking back navigation
   */
  showSubview(level) {
    this.activeStudyLevel = level;

    const viewSubjects = document.getElementById("study-subview-subjects");
    const viewChapters = document.getElementById("study-subview-chapters");
    const viewDetail = document.getElementById("study-subview-chapter-detail");

    if (viewSubjects) viewSubjects.style.display = level === "subjects" ? "block" : "none";
    if (viewChapters) viewChapters.style.display = level === "chapters" ? "block" : "none";
    if (viewDetail) viewDetail.style.display = level === "detail" ? "block" : "none";

    // Scroll viewport to top
    const viewport = document.querySelector(".app-content-viewport");
    if (viewport) viewport.scrollTop = 0;
  }

  /**
   * Navigate back safely within Study stack
   */
  navigateToLevel(level) {
    if (level === "subjects") {
      this.currentSubject = null;
      this.currentChapter = null;
      this.showSubview("subjects");
    } else if (level === "chapters") {
      this.currentChapter = null;
      this.showSubview("chapters");
    }
  }

  /**
   * Reset to subjects level (used when user taps 'Study' in bottom navigation)
   */
  resetToSubjects() {
    this.navigateToLevel("subjects");
  }
}

window.NotesWallahStudy = new StudyController();
