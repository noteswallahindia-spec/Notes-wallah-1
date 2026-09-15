/**
 * NOTES WALLAH - Database Service (Firebase Firestore)
 * Part 2 of 10: Academic NCERT Syllabus System
 * 
 * Manages:
 * - Student Profile & Class association (collection: `users/{uid}`)
 * - Official NCERT Academic Hierarchy:
 *     Class -> Subject -> Chapter -> NCERT Ebook or Pro Notes
 * - Collections:
 *     1. "classes"    (name, display_order, board, medium, is_active)
 *     2. "subjects"   (id, class_id, name, display_order, is_active, created_at, updated_at)
 *     3. "chapters"   (id, class_id, subject_id, chapter_number, chapter_name, display_order, is_active, created_at, updated_at)
 *     4. "ebooks"     (id, class_id, subject_id, chapter_id, title, ebook_url, is_active, created_at, updated_at)
 *     5. "pro_notes"  (id, class_id, subject_id, chapter_id, title, description, storage_path, thumbnail_url, is_active, created_at, updated_at)
 * 
 * STRICT ARCHITECTURE RULES:
 * - Relationships instead of separate collections (e.g. no "class10_physics")
 * - NO XP system anywhere (no XP fields, no XP levels, no XP rewards, no XP unlock logic)
 * - Do NOT upload NCERT PDFs to Firebase Storage; store official NCERT portal URLs
 * - Class filtering: Students only see content for their selected class_id
 * - Lazy loading: Class -> Subject -> Chapter -> Ebook / Pro Notes
 * - Proper loading and empty states
 * - Robust fallback store mirroring Firestore schema identically
 */

// ============================================================================
// VERIFIED NCERT SYLLABUS SEED DATA (Genuine NCERT structure & official links)
// ============================================================================

const SEED_CLASSES = [
  { id: "class_9", name: "Class 9", display_order: 9, board: "CBSE", medium: "English", is_active: true },
  { id: "class_10", name: "Class 10", display_order: 10, board: "CBSE", medium: "English", is_active: true },
  { id: "class_11", name: "Class 11", display_order: 11, board: "CBSE", medium: "English", is_active: true },
  { id: "class_12", name: "Class 12", display_order: 12, board: "CBSE", medium: "English", is_active: true }
];

const SEED_SUBJECTS = [
  // Class 10 Subjects
  { id: "c10_science", class_id: "class_10", name: "Science", display_order: 1, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_maths", class_id: "class_10", name: "Mathematics", display_order: 2, icon: "math", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_social", class_id: "class_10", name: "Social Science", display_order: 3, icon: "socialScience", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_english", class_id: "class_10", name: "English", display_order: 4, icon: "english", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_hindi", class_id: "class_10", name: "Hindi", display_order: 5, icon: "hindi", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 9 Subjects
  { id: "c9_science", class_id: "class_9", name: "Science", display_order: 1, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_maths", class_id: "class_9", name: "Mathematics", display_order: 2, icon: "math", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_social", class_id: "class_9", name: "Social Science", display_order: 3, icon: "socialScience", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_english", class_id: "class_9", name: "English", display_order: 4, icon: "english", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Subjects
  { id: "c11_physics", class_id: "class_11", name: "Physics", display_order: 1, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chemistry", class_id: "class_11", name: "Chemistry", display_order: 2, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_biology", class_id: "class_11", name: "Biology", display_order: 3, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_maths", class_id: "class_11", name: "Mathematics", display_order: 4, icon: "math", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_english", class_id: "class_11", name: "English", display_order: 5, icon: "english", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_urdu", class_id: "class_11", name: "Urdu", display_order: 6, icon: "hindi", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 12 Subjects
  { id: "c12_physics", class_id: "class_12", name: "Physics", display_order: 1, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c12_chemistry", class_id: "class_12", name: "Chemistry", display_order: 2, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c12_maths", class_id: "class_12", name: "Mathematics", display_order: 3, icon: "math", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c12_biology", class_id: "class_12", name: "Biology", display_order: 4, icon: "science", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }
];

const SEED_CHAPTERS = [
  // Class 10 Science (Official 13 Chapters - Rationalised NCERT)
  { id: "c10_sci_ch1", class_id: "class_10", subject_id: "c10_science", chapter_number: 1, chapter_name: "Chemical Reactions and Equations", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch2", class_id: "class_10", subject_id: "c10_science", chapter_number: 2, chapter_name: "Acids, Bases and Salts", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch3", class_id: "class_10", subject_id: "c10_science", chapter_number: 3, chapter_name: "Metals and Non-metals", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch4", class_id: "class_10", subject_id: "c10_science", chapter_number: 4, chapter_name: "Carbon and its Compounds", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch5", class_id: "class_10", subject_id: "c10_science", chapter_number: 5, chapter_name: "Life Processes", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch6", class_id: "class_10", subject_id: "c10_science", chapter_number: 6, chapter_name: "Control and Coordination", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch7", class_id: "class_10", subject_id: "c10_science", chapter_number: 7, chapter_name: "How do Organisms Reproduce?", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch8", class_id: "class_10", subject_id: "c10_science", chapter_number: 8, chapter_name: "Heredity", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch9", class_id: "class_10", subject_id: "c10_science", chapter_number: 9, chapter_name: "Light – Reflection and Refraction", display_order: 9, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch10", class_id: "class_10", subject_id: "c10_science", chapter_number: 10, chapter_name: "The Human Eye and the Colourful World", display_order: 10, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch11", class_id: "class_10", subject_id: "c10_science", chapter_number: 11, chapter_name: "Electricity", display_order: 11, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch12", class_id: "class_10", subject_id: "c10_science", chapter_number: 12, chapter_name: "Magnetic Effects of Electric Current", display_order: 12, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch13", class_id: "class_10", subject_id: "c10_science", chapter_number: 13, chapter_name: "Our Environment", display_order: 13, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 10 Mathematics (Official 14 Chapters - Rationalised NCERT)
  { id: "c10_math_ch1", class_id: "class_10", subject_id: "c10_maths", chapter_number: 1, chapter_name: "Real Numbers", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch2", class_id: "class_10", subject_id: "c10_maths", chapter_number: 2, chapter_name: "Polynomials", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch3", class_id: "class_10", subject_id: "c10_maths", chapter_number: 3, chapter_name: "Pair of Linear Equations in Two Variables", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch4", class_id: "class_10", subject_id: "c10_maths", chapter_number: 4, chapter_name: "Quadratic Equations", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch5", class_id: "class_10", subject_id: "c10_maths", chapter_number: 5, chapter_name: "Arithmetic Progressions", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch6", class_id: "class_10", subject_id: "c10_maths", chapter_number: 6, chapter_name: "Triangles", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch7", class_id: "class_10", subject_id: "c10_maths", chapter_number: 7, chapter_name: "Coordinate Geometry", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch8", class_id: "class_10", subject_id: "c10_maths", chapter_number: 8, chapter_name: "Introduction to Trigonometry", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch9", class_id: "class_10", subject_id: "c10_maths", chapter_number: 9, chapter_name: "Some Applications of Trigonometry", display_order: 9, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch10", class_id: "class_10", subject_id: "c10_maths", chapter_number: 10, chapter_name: "Circles", display_order: 10, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch11", class_id: "class_10", subject_id: "c10_maths", chapter_number: 11, chapter_name: "Areas Related to Circles", display_order: 11, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch12", class_id: "class_10", subject_id: "c10_maths", chapter_number: 12, chapter_name: "Surface Areas and Volumes", display_order: 12, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch13", class_id: "class_10", subject_id: "c10_maths", chapter_number: 13, chapter_name: "Statistics", display_order: 13, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch14", class_id: "class_10", subject_id: "c10_maths", chapter_number: 14, chapter_name: "Probability", display_order: 14, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 10 Social Science Selected Official Chapters
  { id: "c10_soc_ch1", class_id: "class_10", subject_id: "c10_social", chapter_number: 1, chapter_name: "The Rise of Nationalism in Europe (History)", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_soc_ch2", class_id: "class_10", subject_id: "c10_social", chapter_number: 2, chapter_name: "Nationalism in India (History)", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_soc_ch3", class_id: "class_10", subject_id: "c10_social", chapter_number: 3, chapter_name: "Resources and Development (Geography)", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_soc_ch4", class_id: "class_10", subject_id: "c10_social", chapter_number: 4, chapter_name: "Power-sharing (Democratic Politics)", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_soc_ch5", class_id: "class_10", subject_id: "c10_social", chapter_number: 5, chapter_name: "Development (Economics)", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 10 English Selected Official Chapters
  { id: "c10_eng_ch1", class_id: "class_10", subject_id: "c10_english", chapter_number: 1, chapter_name: "A Letter to God (First Flight)", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_eng_ch2", class_id: "class_10", subject_id: "c10_english", chapter_number: 2, chapter_name: "Nelson Mandela: Long Walk to Freedom", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 9 Science Selected Official Chapters
  { id: "c9_sci_ch1", class_id: "class_9", subject_id: "c9_science", chapter_number: 1, chapter_name: "Matter in Our Surroundings", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_sci_ch2", class_id: "class_9", subject_id: "c9_science", chapter_number: 2, chapter_name: "Is Matter Around Us Pure", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_sci_ch5", class_id: "class_9", subject_id: "c9_science", chapter_number: 5, chapter_name: "The Fundamental Unit of Life", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c9_sci_ch7", class_id: "class_9", subject_id: "c9_science", chapter_number: 7, chapter_name: "Motion", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Chapters (Matching syllabus: Physics 8, Chemistry 8, Biology 8, Maths 13, English 3, Urdu 2)
  // Physics (8 Chapters)
  { id: "c11_phy_ch1", class_id: "class_11", subject_id: "c11_physics", chapter_number: 1, chapter_name: "Physical World and Measurement", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch2", class_id: "class_11", subject_id: "c11_physics", chapter_number: 2, chapter_name: "Motion in a Straight Line", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch3", class_id: "class_11", subject_id: "c11_physics", chapter_number: 3, chapter_name: "Motion in a Plane", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch4", class_id: "class_11", subject_id: "c11_physics", chapter_number: 4, chapter_name: "Laws of Motion", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch5", class_id: "class_11", subject_id: "c11_physics", chapter_number: 5, chapter_name: "Work, Energy and Power", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch6", class_id: "class_11", subject_id: "c11_physics", chapter_number: 6, chapter_name: "Gravitation", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch7", class_id: "class_11", subject_id: "c11_physics", chapter_number: 7, chapter_name: "Thermodynamics", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch8", class_id: "class_11", subject_id: "c11_physics", chapter_number: 8, chapter_name: "Oscillations and Waves", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Chemistry (8 Chapters)
  { id: "c11_chem_ch1", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 1, chapter_name: "Some Basic Concepts of Chemistry", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch2", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 2, chapter_name: "Structure of Atom", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch3", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 3, chapter_name: "Classification of Elements and Periodicity", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch4", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 4, chapter_name: "Chemical Bonding and Molecular Structure", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch5", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 5, chapter_name: "Chemical Thermodynamics", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch6", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 6, chapter_name: "Equilibrium", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch7", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 7, chapter_name: "Redox Reactions", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch8", class_id: "class_11", subject_id: "c11_chemistry", chapter_number: 8, chapter_name: "Organic Chemistry: Some Basic Principles", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Biology (8 Chapters)
  { id: "c11_bio_ch1", class_id: "class_11", subject_id: "c11_biology", chapter_number: 1, chapter_name: "The Living World", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch2", class_id: "class_11", subject_id: "c11_biology", chapter_number: 2, chapter_name: "Biological Classification", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch3", class_id: "class_11", subject_id: "c11_biology", chapter_number: 3, chapter_name: "Plant Kingdom", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch4", class_id: "class_11", subject_id: "c11_biology", chapter_number: 4, chapter_name: "Animal Kingdom", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch5", class_id: "class_11", subject_id: "c11_biology", chapter_number: 5, chapter_name: "Morphology of Flowering Plants", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch6", class_id: "class_11", subject_id: "c11_biology", chapter_number: 6, chapter_name: "Anatomy of Flowering Plants", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch7", class_id: "class_11", subject_id: "c11_biology", chapter_number: 7, chapter_name: "Structural Organisation in Animals", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch8", class_id: "class_11", subject_id: "c11_biology", chapter_number: 8, chapter_name: "Cell: The Unit of Life", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Mathematics (13 Chapters)
  { id: "c11_math_ch1", class_id: "class_11", subject_id: "c11_maths", chapter_number: 1, chapter_name: "Sets", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch2", class_id: "class_11", subject_id: "c11_maths", chapter_number: 2, chapter_name: "Relations and Functions", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch3", class_id: "class_11", subject_id: "c11_maths", chapter_number: 3, chapter_name: "Trigonometric Functions", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch4", class_id: "class_11", subject_id: "c11_maths", chapter_number: 4, chapter_name: "Complex Numbers and Quadratic Equations", display_order: 4, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch5", class_id: "class_11", subject_id: "c11_maths", chapter_number: 5, chapter_name: "Linear Inequalities", display_order: 5, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch6", class_id: "class_11", subject_id: "c11_maths", chapter_number: 6, chapter_name: "Permutations and Combinations", display_order: 6, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch7", class_id: "class_11", subject_id: "c11_maths", chapter_number: 7, chapter_name: "Binomial Theorem", display_order: 7, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch8", class_id: "class_11", subject_id: "c11_maths", chapter_number: 8, chapter_name: "Sequences and Series", display_order: 8, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch9", class_id: "class_11", subject_id: "c11_maths", chapter_number: 9, chapter_name: "Straight Lines", display_order: 9, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch10", class_id: "class_11", subject_id: "c11_maths", chapter_number: 10, chapter_name: "Conic Sections", display_order: 10, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch11", class_id: "class_11", subject_id: "c11_maths", chapter_number: 11, chapter_name: "Introduction to Three Dimensional Geometry", display_order: 11, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch12", class_id: "class_11", subject_id: "c11_maths", chapter_number: 12, chapter_name: "Limits and Derivatives", display_order: 12, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch13", class_id: "class_11", subject_id: "c11_maths", chapter_number: 13, chapter_name: "Statistics and Probability", display_order: 13, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // English (3 Chapters)
  { id: "c11_eng_ch1", class_id: "class_11", subject_id: "c11_english", chapter_number: 1, chapter_name: "The Portrait of a Lady (Hornbill)", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_eng_ch2", class_id: "class_11", subject_id: "c11_english", chapter_number: 2, chapter_name: "We're Not Afraid to Die... if We Can All Be Together", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_eng_ch3", class_id: "class_11", subject_id: "c11_english", chapter_number: 3, chapter_name: "Discovering Tut: The Saga Continues", display_order: 3, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Urdu (2 Chapters)
  { id: "c11_urdu_ch1", class_id: "class_11", subject_id: "c11_urdu", chapter_number: 1, chapter_name: "Chapter 1 - Afsana & Nazm", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_urdu_ch2", class_id: "class_11", subject_id: "c11_urdu", chapter_number: 2, chapter_name: "Chapter 2 - Ghazal & Qasida", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 12 Selected Chapters
  { id: "c12_phy_ch1", class_id: "class_12", subject_id: "c12_physics", chapter_number: 1, chapter_name: "Electric Charges and Fields", display_order: 1, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c12_phy_ch2", class_id: "class_12", subject_id: "c12_physics", chapter_number: 2, chapter_name: "Electrostatic Potential and Capacitance", display_order: 2, is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }
];

const SEED_EBOOKS = [
  // Class 11 Physics Exact NCERT Chapter PDFs
  { id: "c11_phy_ch1_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch1", title: "NCERT Class 11 Physics Chapter 1 - Physical World and Measurement", ebook_url: "https://ncert.nic.in/textbook/pdf/keph101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch2_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch2", title: "NCERT Class 11 Physics Chapter 2 - Motion in a Straight Line", ebook_url: "https://ncert.nic.in/textbook/pdf/keph102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch3_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch3", title: "NCERT Class 11 Physics Chapter 3 - Motion in a Plane", ebook_url: "https://ncert.nic.in/textbook/pdf/keph103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch4_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch4", title: "NCERT Class 11 Physics Chapter 4 - Laws of Motion", ebook_url: "https://ncert.nic.in/textbook/pdf/keph104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch5_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch5", title: "NCERT Class 11 Physics Chapter 5 - Work, Energy and Power", ebook_url: "https://ncert.nic.in/textbook/pdf/keph105.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch6_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch6", title: "NCERT Class 11 Physics Chapter 6 - Gravitation", ebook_url: "https://ncert.nic.in/textbook/pdf/keph107.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch7_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch7", title: "NCERT Class 11 Physics Chapter 7 - Thermodynamics", ebook_url: "https://ncert.nic.in/textbook/pdf/keph204.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_phy_ch8_ebook", class_id: "class_11", subject_id: "c11_physics", chapter_id: "c11_phy_ch8", title: "NCERT Class 11 Physics Chapter 8 - Oscillations and Waves", ebook_url: "https://ncert.nic.in/textbook/pdf/keph206.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Chemistry Exact NCERT Chapter PDFs
  { id: "c11_chem_ch1_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch1", title: "NCERT Class 11 Chemistry Chapter 1 - Some Basic Concepts of Chemistry", ebook_url: "https://ncert.nic.in/textbook/pdf/kech101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch2_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch2", title: "NCERT Class 11 Chemistry Chapter 2 - Structure of Atom", ebook_url: "https://ncert.nic.in/textbook/pdf/kech102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch3_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch3", title: "NCERT Class 11 Chemistry Chapter 3 - Classification of Elements", ebook_url: "https://ncert.nic.in/textbook/pdf/kech103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch4_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch4", title: "NCERT Class 11 Chemistry Chapter 4 - Chemical Bonding", ebook_url: "https://ncert.nic.in/textbook/pdf/kech104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch5_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch5", title: "NCERT Class 11 Chemistry Chapter 5 - Chemical Thermodynamics", ebook_url: "https://ncert.nic.in/textbook/pdf/kech105.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch6_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch6", title: "NCERT Class 11 Chemistry Chapter 6 - Equilibrium", ebook_url: "https://ncert.nic.in/textbook/pdf/kech106.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch7_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch7", title: "NCERT Class 11 Chemistry Chapter 7 - Redox Reactions", ebook_url: "https://ncert.nic.in/textbook/pdf/kech201.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_chem_ch8_ebook", class_id: "class_11", subject_id: "c11_chemistry", chapter_id: "c11_chem_ch8", title: "NCERT Class 11 Chemistry Chapter 8 - Organic Chemistry Basics", ebook_url: "https://ncert.nic.in/textbook/pdf/kech202.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Biology Exact NCERT Chapter PDFs
  { id: "c11_bio_ch1_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch1", title: "NCERT Class 11 Biology Chapter 1 - The Living World", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch2_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch2", title: "NCERT Class 11 Biology Chapter 2 - Biological Classification", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch3_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch3", title: "NCERT Class 11 Biology Chapter 3 - Plant Kingdom", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch4_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch4", title: "NCERT Class 11 Biology Chapter 4 - Animal Kingdom", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch5_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch5", title: "NCERT Class 11 Biology Chapter 5 - Morphology of Flowering Plants", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo105.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch6_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch6", title: "NCERT Class 11 Biology Chapter 6 - Anatomy of Flowering Plants", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo106.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch7_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch7", title: "NCERT Class 11 Biology Chapter 7 - Structural Organisation in Animals", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo107.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_bio_ch8_ebook", class_id: "class_11", subject_id: "c11_biology", chapter_id: "c11_bio_ch8", title: "NCERT Class 11 Biology Chapter 8 - Cell: The Unit of Life", ebook_url: "https://ncert.nic.in/textbook/pdf/kebo108.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Mathematics Exact NCERT Chapter PDFs
  { id: "c11_math_ch1_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch1", title: "NCERT Class 11 Mathematics Chapter 1 - Sets", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch2_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch2", title: "NCERT Class 11 Mathematics Chapter 2 - Relations and Functions", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch3_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch3", title: "NCERT Class 11 Mathematics Chapter 3 - Trigonometric Functions", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch4_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch4", title: "NCERT Class 11 Mathematics Chapter 4 - Complex Numbers", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch5_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch5", title: "NCERT Class 11 Mathematics Chapter 5 - Linear Inequalities", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh105.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch6_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch6", title: "NCERT Class 11 Mathematics Chapter 6 - Permutations and Combinations", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh106.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch7_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch7", title: "NCERT Class 11 Mathematics Chapter 7 - Binomial Theorem", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh107.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch8_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch8", title: "NCERT Class 11 Mathematics Chapter 8 - Sequences and Series", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh108.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch9_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch9", title: "NCERT Class 11 Mathematics Chapter 9 - Straight Lines", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh109.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch10_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch10", title: "NCERT Class 11 Mathematics Chapter 10 - Conic Sections", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh110.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch11_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch11", title: "NCERT Class 11 Mathematics Chapter 11 - 3D Geometry", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh111.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch12_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch12", title: "NCERT Class 11 Mathematics Chapter 12 - Limits and Derivatives", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh112.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_math_ch13_ebook", class_id: "class_11", subject_id: "c11_maths", chapter_id: "c11_math_ch13", title: "NCERT Class 11 Mathematics Chapter 13 - Statistics & Probability", ebook_url: "https://ncert.nic.in/textbook/pdf/kemh113.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 English Exact NCERT Chapter PDFs
  { id: "c11_eng_ch1_ebook", class_id: "class_11", subject_id: "c11_english", chapter_id: "c11_eng_ch1", title: "NCERT Class 11 English Hornbill Chapter 1 - The Portrait of a Lady", ebook_url: "https://ncert.nic.in/textbook/pdf/kewh101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_eng_ch2_ebook", class_id: "class_11", subject_id: "c11_english", chapter_id: "c11_eng_ch2", title: "NCERT Class 11 English Hornbill Chapter 2 - We're Not Afraid to Die", ebook_url: "https://ncert.nic.in/textbook/pdf/kewh102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_eng_ch3_ebook", class_id: "class_11", subject_id: "c11_english", chapter_id: "c11_eng_ch3", title: "NCERT Class 11 English Hornbill Chapter 3 - Discovering Tut", ebook_url: "https://ncert.nic.in/textbook/pdf/kewh103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 11 Urdu Exact NCERT Chapter PDFs
  { id: "c11_urdu_ch1_ebook", class_id: "class_11", subject_id: "c11_urdu", chapter_id: "c11_urdu_ch1", title: "NCERT Class 11 Urdu Chapter 1 - Afsana & Nazm", ebook_url: "https://ncert.nic.in/textbook/pdf/keur101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c11_urdu_ch2_ebook", class_id: "class_11", subject_id: "c11_urdu", chapter_id: "c11_urdu_ch2", title: "NCERT Class 11 Urdu Chapter 2 - Ghazal & Qasida", ebook_url: "https://ncert.nic.in/textbook/pdf/keur102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 10 Science Exact NCERT Chapter PDFs (Direct textbook chapter references from official portal)
  { id: "c10_sci_ch1_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch1", title: "NCERT Class 10 Science Chapter 1 - Chemical Reactions and Equations", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch2_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch2", title: "NCERT Class 10 Science Chapter 2 - Acids, Bases and Salts", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch3_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch3", title: "NCERT Class 10 Science Chapter 3 - Metals and Non-metals", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch4_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch4", title: "NCERT Class 10 Science Chapter 4 - Carbon and its Compounds", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch5_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch5", title: "NCERT Class 10 Science Chapter 5 - Life Processes", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc105.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch6_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch6", title: "NCERT Class 10 Science Chapter 6 - Control and Coordination", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc106.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch7_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch7", title: "NCERT Class 10 Science Chapter 7 - How do Organisms Reproduce?", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc107.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch8_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch8", title: "NCERT Class 10 Science Chapter 8 - Heredity", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc108.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch9_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch9", title: "NCERT Class 10 Science Chapter 9 - Light – Reflection and Refraction", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc109.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch10_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch10", title: "NCERT Class 10 Science Chapter 10 - The Human Eye", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc110.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch11_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch11", title: "NCERT Class 10 Science Chapter 11 - Electricity", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc111.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch12_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch12", title: "NCERT Class 10 Science Chapter 12 - Magnetic Effects", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc112.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_sci_ch13_ebook", class_id: "class_10", subject_id: "c10_science", chapter_id: "c10_sci_ch13", title: "NCERT Class 10 Science Chapter 13 - Our Environment", ebook_url: "https://ncert.nic.in/textbook/pdf/jesc113.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 10 Mathematics Exact NCERT Chapter PDFs
  { id: "c10_math_ch1_ebook", class_id: "class_10", subject_id: "c10_maths", chapter_id: "c10_math_ch1", title: "NCERT Class 10 Mathematics Chapter 1 - Real Numbers", ebook_url: "https://ncert.nic.in/textbook/pdf/jemh101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch2_ebook", class_id: "class_10", subject_id: "c10_maths", chapter_id: "c10_math_ch2", title: "NCERT Class 10 Mathematics Chapter 2 - Polynomials", ebook_url: "https://ncert.nic.in/textbook/pdf/jemh102.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch3_ebook", class_id: "class_10", subject_id: "c10_maths", chapter_id: "c10_math_ch3", title: "NCERT Class 10 Mathematics Chapter 3 - Pair of Linear Equations", ebook_url: "https://ncert.nic.in/textbook/pdf/jemh103.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },
  { id: "c10_math_ch4_ebook", class_id: "class_10", subject_id: "c10_maths", chapter_id: "c10_math_ch4", title: "NCERT Class 10 Mathematics Chapter 4 - Quadratic Equations", ebook_url: "https://ncert.nic.in/textbook/pdf/jemh104.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 9 Science Official NCERT Ebook URLs
  { id: "c9_sci_ch1_ebook", class_id: "class_9", subject_id: "c9_science", chapter_id: "c9_sci_ch1", title: "NCERT Class 9 Science Chapter 1 - Matter in Our Surroundings", ebook_url: "https://ncert.nic.in/textbook/pdf/iesc101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" },

  // Class 12 Physics Official NCERT Ebook URLs
  { id: "c12_phy_ch1_ebook", class_id: "class_12", subject_id: "c12_physics", chapter_id: "c12_phy_ch1", title: "NCERT Class 12 Physics Chapter 1 - Electric Charges and Fields", ebook_url: "https://ncert.nic.in/textbook/pdf/leph101.pdf", is_active: true, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" }
];

const SEED_PRO_NOTES = [
  {
    id: "c10_sci_ch1_pro",
    class_id: "class_10",
    subject_id: "c10_science",
    chapter_id: "c10_sci_ch1",
    title: "Chemical Reactions & Equations - Topper Revision Notes",
    description: "Handwritten high-yield revision summary covering chemical equation balancing, displacement, precipitation, redox reactions, corrosion and rancidity.",
    storage_path: "pro_notes/class_10/science/ch1_chemical_reactions_topper.pdf",
    thumbnail_url: "",
    is_active: true,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z"
  },
  {
    id: "c10_sci_ch2_pro",
    class_id: "class_10",
    subject_id: "c10_science",
    chapter_id: "c10_sci_ch2",
    title: "Acids, Bases & Salts - Complete Formula & Reaction Sheet",
    description: "High-yield formulas, pH scale variations, chlor-alkali process, bleaching powder and plaster of paris preparation with exam tips.",
    storage_path: "pro_notes/class_10/science/ch2_acids_bases_salts.pdf",
    thumbnail_url: "",
    is_active: true,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z"
  },
  {
    id: "c10_sci_ch5_pro",
    class_id: "class_10",
    subject_id: "c10_science",
    chapter_id: "c10_sci_ch5",
    title: "Life Processes - Comprehensive Diagrams & Flowcharts",
    description: "Hand-drawn diagrams of human digestive system, nephron, double circulation, and photosynthetic pathway with board examination highlights.",
    storage_path: "pro_notes/class_10/science/ch5_life_processes_diagrams.pdf",
    thumbnail_url: "",
    is_active: true,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z"
  },
  {
    id: "c10_math_ch1_pro",
    class_id: "class_10",
    subject_id: "c10_maths",
    chapter_id: "c10_math_ch1",
    title: "Real Numbers - Fundamental Theorem & Irrationality Proofs",
    description: "Step-by-step proofs for irrational numbers (√2, √3, √5), prime factorisation trees, and HCF × LCM theorem applications.",
    storage_path: "pro_notes/class_10/maths/ch1_real_numbers_revision.pdf",
    thumbnail_url: "",
    is_active: true,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-10T10:00:00Z"
  }
];

class DatabaseService {
  constructor() {
    this.COLLECTION_USERS = "users";
    this.COLLECTION_CLASSES = "classes";
    this.COLLECTION_SUBJECTS = "subjects";
    this.COLLECTION_CHAPTERS = "chapters";
    this.COLLECTION_EBOOKS = "ebooks";
    this.COLLECTION_PRO_NOTES = "pro_notes";
    this.COLLECTION_TESTS = "tests";
    this.COLLECTION_CHALLENGES = "challenges";
    this.LOCAL_PROFILES_PREFIX = "nw_profile_";

    // In-memory / persistent seed tables
    this.seedClasses = SEED_CLASSES;
    this.seedSubjects = SEED_SUBJECTS;
    this.seedChapters = SEED_CHAPTERS;
    this.seedEbooks = SEED_EBOOKS;
    this.seedProNotes = SEED_PRO_NOTES;
  }

  /**
   * Helper to normalize class identifier (e.g. "Class 10" -> "class_10")
   */
  normalizeClassId(classInput) {
    if (!classInput) return "class_10";
    const cleaned = String(classInput).trim().toLowerCase();
    if (cleaned.startsWith("class_")) return cleaned;
    const match = cleaned.match(/(\d+)/);
    if (match) {
      return `class_${match[1]}`;
    }
    return "class_10";
  }

  /**
   * Format class id to display string (e.g. "class_10" -> "Class 10")
   */
  formatClassName(classId) {
    if (!classId) return "Class 10";
    const match = String(classId).match(/(\d+)/);
    return match ? `Class ${match[1]}` : classId;
  }

  // ==========================================================================
  // USER / STUDENT PROFILE
  // ==========================================================================

  /**
   * Save or update Student Profile in Firestore & local fallback cache
   */
  async saveUserProfile(uid, profileData) {
    if (!uid) throw new Error("Student UID is required.");

    const classId = this.normalizeClassId(profileData.class_id || profileData.classLevel);
    const className = profileData.classLevel || this.formatClassName(classId);

    const sanitizedData = {
      uid: uid,
      name: profileData.name ? profileData.name.trim() : "",
      email: profileData.email || "",
      photo_url: profileData.photo_url || null,
      class_id: classId,
      classLevel: className,
      board: profileData.board || "CBSE",
      medium: profileData.medium || "English",
      role: profileData.role || "student", // default: student, or admin
      preferredLanguage: profileData.preferredLanguage || "English",
      created_at: profileData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

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
        console.info("[DatabaseService] Profile saved to Firestore for student:", uid);
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

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const doc = await fb.firestore.collection(this.COLLECTION_USERS).doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          if (!data.class_id && data.classLevel) {
            data.class_id = this.normalizeClassId(data.classLevel);
          }
          localStorage.setItem(this.LOCAL_PROFILES_PREFIX + uid, JSON.stringify(data));
          return data;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore profile fetch error, fallback to local:", err);
      }
    }

    // Fallback to local cache
    try {
      const local = localStorage.getItem(this.LOCAL_PROFILES_PREFIX + uid);
      if (local) {
        const parsed = JSON.parse(local);
        if (!parsed.class_id && parsed.classLevel) {
          parsed.class_id = this.normalizeClassId(parsed.classLevel);
        }
        return parsed;
      }
    } catch (e) {
      console.warn("[DatabaseService] Local read error", e);
    }

    return null;
  }

  // ==========================================================================
  // 1. CLASSES
  // ==========================================================================

  /**
   * Fetch available academic classes
   */
  async getClasses() {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_CLASSES)
          .where("is_active", "==", true)
          .get();

        if (!snapshot.empty) {
          const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          classes.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          return classes;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore classes query error, using seed:", err);
      }
    }
    return [...this.seedClasses].filter(c => c.is_active);
  }

  // ==========================================================================
  // 2. SUBJECTS (Filtered strictly by class_id)
  // ==========================================================================

  /**
   * Fetch subjects strictly for a specific class_id
   * CRITICAL: Ensures a Class 10 student only sees Class 10 subjects
   */
  async getSubjects(classId) {
    if (!classId) return [];
    const normalizedClassId = this.normalizeClassId(classId);

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_SUBJECTS)
          .where("class_id", "==", normalizedClassId)
          .where("is_active", "==", true)
          .get();

        if (!snapshot.empty) {
          const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          subjects.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          return subjects;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore subjects query error, fallback to seed:", err);
      }
    }

    // Filter seed subjects strictly by class_id
    const filtered = this.seedSubjects.filter(
      s => s.class_id === normalizedClassId && s.is_active
    );
    filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return filtered;
  }

  /**
   * Fetch single subject details by ID
   */
  async getSubjectById(subjectId) {
    if (!subjectId) return null;

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const doc = await fb.firestore.collection(this.COLLECTION_SUBJECTS).doc(subjectId).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore subject fetch error:", err);
      }
    }

    return this.seedSubjects.find(s => s.id === subjectId) || null;
  }

  // ==========================================================================
  // 3. CHAPTERS (Filtered strictly by class_id and subject_id)
  // ==========================================================================

  /**
   * Fetch chapters for a given class_id and subject_id
   */
  async getChapters(classId, subjectId) {
    if (!classId || !subjectId) return [];
    const normalizedClassId = this.normalizeClassId(classId);

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_CHAPTERS)
          .where("class_id", "==", normalizedClassId)
          .where("subject_id", "==", subjectId)
          .where("is_active", "==", true)
          .get();

        if (!snapshot.empty) {
          const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          chapters.sort((a, b) => (a.display_order || a.chapter_number || 0) - (b.display_order || b.chapter_number || 0));
          return chapters;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore chapters query error, fallback to seed:", err);
      }
    }

    // Filter seed chapters strictly by class_id and subject_id
    const filtered = this.seedChapters.filter(
      c => c.class_id === normalizedClassId && c.subject_id === subjectId && c.is_active
    );
    filtered.sort((a, b) => (a.display_order || a.chapter_number || 0) - (b.display_order || b.chapter_number || 0));
    return filtered;
  }

  /**
   * Fetch single chapter details by ID
   */
  async getChapterById(chapterId) {
    if (!chapterId) return null;

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const doc = await fb.firestore.collection(this.COLLECTION_CHAPTERS).doc(chapterId).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore chapter fetch error:", err);
      }
    }

    return this.seedChapters.find(c => c.id === chapterId) || null;
  }

  // ==========================================================================
  // 4. NCERT EBOOKS (Official NCERT URLs - never uploaded PDFs)
  // ==========================================================================

  /**
   * Fetch official NCERT Ebook document for a specific chapter
   */
  async getEbookForChapter(chapterId) {
    if (!chapterId) return null;

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_EBOOKS)
          .where("chapter_id", "==", chapterId)
          .where("is_active", "==", true)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore ebook query error:", err);
      }
    }

    return this.seedEbooks.find(e => e.chapter_id === chapterId && e.is_active) || null;
  }

  // ==========================================================================
  // 5. PRO NOTES (Metadata in Firestore, files in Firebase Storage - ZERO XP)
  // ==========================================================================

  /**
   * Fetch Pro Notes document for a specific chapter
   * STRICT: Contains NO XP fields or XP unlock conditions
   */
  async getProNotesForChapter(chapterId) {
    if (!chapterId) return null;

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_PRO_NOTES)
          .where("chapter_id", "==", chapterId)
          .where("is_active", "==", true)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore pro_notes query error:", err);
      }
    }

    return this.seedProNotes.find(p => p.chapter_id === chapterId && p.is_active) || null;
  }

  /**
   * Check availability of both Ebook and Pro Notes for a chapter
   * Efficient summary query for chapter list badges
   */
  async checkChapterAvailability(chapterId) {
    const [ebook, proNotes] = await Promise.all([
      this.getEbookForChapter(chapterId),
      this.getProNotesForChapter(chapterId)
    ]);

    return {
      hasEbook: !!(ebook && ebook.ebook_url),
      hasProNotes: !!(proNotes && proNotes.storage_path)
    };
  }

  /**
   * Check if a student user has administrative role
   */
  async checkIsAdmin(uid) {
    if (!uid) return false;
    const profile = await this.getUserProfile(uid);
    return !!(profile && profile.role === "admin");
  }

  // ==========================================================================
  // ADMIN CONTENT MANAGEMENT CRUD OPERATIONS
  // ==========================================================================

  /**
   * Save or update Pro Note metadata in Firestore and local store
   * pro_notes/{noteId}
   */
  async saveProNoteMetadata(noteData) {
    if (!noteData || !noteData.id) {
      throw new Error("Pro Note ID is required.");
    }

    const cleanNote = {
      id: noteData.id,
      class_id: this.normalizeClassId(noteData.class_id),
      subject_id: noteData.subject_id,
      chapter_id: noteData.chapter_id,
      title: (noteData.title || "").trim(),
      description: (noteData.description || "").trim(),
      storage_path: noteData.storage_path || "",
      download_url: noteData.download_url || "",
      thumbnail_url: noteData.thumbnail_url || "",
      file_name: noteData.file_name || "notes.pdf",
      file_size: Number(noteData.file_size) || 0,
      is_active: noteData.is_active !== false,
      created_at: noteData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update in-memory seed list
    const existingIndex = this.seedProNotes.findIndex(p => p.id === cleanNote.id);
    if (existingIndex >= 0) {
      this.seedProNotes[existingIndex] = cleanNote;
    } else {
      this.seedProNotes.push(cleanNote);
    }

    // Persist to Firestore if configured
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_PRO_NOTES)
          .doc(cleanNote.id)
          .set(cleanNote, { merge: true });
        console.info("[DatabaseService] Pro Note metadata saved to Firestore:", cleanNote.id);
      } catch (err) {
        console.error("[DatabaseService] Firestore pro_notes save error:", err);
        throw new Error("Unable to save note metadata to Firestore: " + err.message);
      }
    }

    // Update local storage backup
    try {
      localStorage.setItem("nw_custom_pro_notes", JSON.stringify(this.seedProNotes));
    } catch (e) {
      console.warn("Local storage write error for pro notes:", e);
    }

    return cleanNote;
  }

  /**
   * Fetch all Pro Notes across all classes for Admin table
   */
  async getAllProNotes() {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_PRO_NOTES)
          .get();

        if (!snapshot.empty) {
          const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Merge with custom notes in local cache if any
          return notes;
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore getAllProNotes query error, fallback to seed:", err);
      }
    }

    // Load any persisted custom pro notes
    try {
      const stored = localStorage.getItem("nw_custom_pro_notes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(e);
    }

    return [...this.seedProNotes];
  }

  /**
   * Toggle Pro Note active status (is_active)
   */
  async updateProNoteStatus(noteId, isActive) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_PRO_NOTES)
          .doc(noteId)
          .update({ is_active: isActive, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error("[DatabaseService] Error updating pro note status:", err);
      }
    }

    const note = this.seedProNotes.find(p => p.id === noteId);
    if (note) {
      note.is_active = isActive;
      note.updated_at = new Date().toISOString();
      try {
        localStorage.setItem("nw_custom_pro_notes", JSON.stringify(this.seedProNotes));
      } catch (e) {}
    }
    return true;
  }

  /**
   * Delete Pro Note metadata and reference
   */
  async deleteProNote(noteId) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_PRO_NOTES)
          .doc(noteId)
          .delete();
      } catch (err) {
        console.error("[DatabaseService] Error deleting pro note doc:", err);
      }
    }

    this.seedProNotes = this.seedProNotes.filter(p => p.id !== noteId);
    try {
      localStorage.setItem("nw_custom_pro_notes", JSON.stringify(this.seedProNotes));
    } catch (e) {}
    return true;
  }

  /**
   * Admin: Create or update Class
   */
  async createClass(classData) {
    const classId = this.normalizeClassId(classData.id || classData.name);
    const docData = {
      id: classId,
      name: (classData.name || this.formatClassName(classId)).trim(),
      display_order: Number(classData.display_order) || 10,
      board: classData.board || "CBSE",
      medium: classData.medium || "English",
      is_active: classData.is_active !== false,
      created_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      await fb.firestore.collection(this.COLLECTION_CLASSES).doc(classId).set(docData, { merge: true });
    }

    const idx = this.seedClasses.findIndex(c => c.id === classId);
    if (idx >= 0) this.seedClasses[idx] = docData;
    else this.seedClasses.push(docData);

    return docData;
  }

  /**
   * Admin: Create or update Subject under a Class
   */
  async createSubject(subjectData) {
    const classId = this.normalizeClassId(subjectData.class_id);
    const subjectId = subjectData.id || `${classId}_${(subjectData.name || "").toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const docData = {
      id: subjectId,
      class_id: classId,
      name: (subjectData.name || "").trim(),
      display_order: Number(subjectData.display_order) || 1,
      icon: subjectData.icon || "science",
      is_active: subjectData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      await fb.firestore.collection(this.COLLECTION_SUBJECTS).doc(subjectId).set(docData, { merge: true });
    }

    const idx = this.seedSubjects.findIndex(s => s.id === subjectId);
    if (idx >= 0) this.seedSubjects[idx] = docData;
    else this.seedSubjects.push(docData);

    return docData;
  }

  /**
   * Admin: Create or update Chapter under a Subject
   */
  async createChapter(chapterData) {
    const classId = this.normalizeClassId(chapterData.class_id);
    const subjectId = chapterData.subject_id;
    const chNum = Number(chapterData.chapter_number) || 1;
    const chapterId = chapterData.id || `${subjectId}_ch${chNum}`;

    const docData = {
      id: chapterId,
      class_id: classId,
      subject_id: subjectId,
      chapter_number: chNum,
      chapter_name: (chapterData.chapter_name || "").trim(),
      display_order: chNum,
      is_active: chapterData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      await fb.firestore.collection(this.COLLECTION_CHAPTERS).doc(chapterId).set(docData, { merge: true });
    }

    const idx = this.seedChapters.findIndex(c => c.id === chapterId);
    if (idx >= 0) this.seedChapters[idx] = docData;
    else this.seedChapters.push(docData);

    return docData;
  }

  /**
   * Admin: Save NCERT Ebook link for a Chapter
   */
  async saveEbookMetadata(ebookData) {
    const classId = this.normalizeClassId(ebookData.class_id);
    const ebookId = ebookData.id || `${ebookData.chapter_id}_ebook`;

    const docData = {
      id: ebookId,
      class_id: classId,
      subject_id: ebookData.subject_id,
      chapter_id: ebookData.chapter_id,
      title: ebookData.title || "Official NCERT Chapter Ebook",
      ebook_url: ebookData.ebook_url || "",
      is_active: ebookData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      await fb.firestore.collection(this.COLLECTION_EBOOKS).doc(ebookId).set(docData, { merge: true });
    }

    const idx = this.seedEbooks.findIndex(e => e.id === ebookId);
    if (idx >= 0) this.seedEbooks[idx] = docData;
    else this.seedEbooks.push(docData);

    return docData;
  }

  /**
   * Admin: Aggregate statistics for the dashboard
   */
  async getAdminStats() {
    const allNotes = await this.getAllProNotes();
    const activeNotes = allNotes.filter(n => n.is_active).length;

    return {
      totalClasses: this.seedClasses.length,
      totalSubjects: this.seedSubjects.length,
      totalChapters: this.seedChapters.length,
      totalProNotes: allNotes.length,
      activeProNotes: activeNotes,
      totalEbooks: this.seedEbooks.length
    };
  }

  // ==========================================================================
  // SYLLABUS SYNC UTILITY (Optional Admin / Setup Sync to Live Firestore)
  // ==========================================================================

  /**
   * Push verified NCERT syllabus seed documents to a connected Firebase Firestore
   * Keeps actual data editable in Firebase Console by teachers and administrators.
   */
  async syncSyllabusToFirestore() {
    const fb = window.NotesWallahFirebase;
    if (!fb.isConfigured() || !fb.firestore) {
      throw new Error("Firebase project is not connected. Enter your credentials first.");
    }

    console.info("[DatabaseService] Starting official NCERT syllabus Firestore sync...");
    const batch = fb.firestore.batch();

    // 1. Classes
    for (const c of this.seedClasses) {
      const ref = fb.firestore.collection(this.COLLECTION_CLASSES).doc(c.id);
      batch.set(ref, c, { merge: true });
    }

    // 2. Subjects
    for (const s of this.seedSubjects) {
      const ref = fb.firestore.collection(this.COLLECTION_SUBJECTS).doc(s.id);
      batch.set(ref, s, { merge: true });
    }

    // 3. Chapters
    for (const ch of this.seedChapters) {
      const ref = fb.firestore.collection(this.COLLECTION_CHAPTERS).doc(ch.id);
      batch.set(ref, ch, { merge: true });
    }

    // 4. Ebooks
    for (const eb of this.seedEbooks) {
      const ref = fb.firestore.collection(this.COLLECTION_EBOOKS).doc(eb.id);
      batch.set(ref, eb, { merge: true });
    }

    // 5. Pro Notes
    for (const pn of this.seedProNotes) {
      const ref = fb.firestore.collection(this.COLLECTION_PRO_NOTES).doc(pn.id);
      batch.set(ref, pn, { merge: true });
    }

    await batch.commit();
    console.info("[DatabaseService] NCERT syllabus successfully synced to Firestore!");
    return { success: true, count: this.seedChapters.length };
  }

  // ==========================================================================
  // PART 5: TEST ENGINE & ACADEMIC CHALLENGE PERSISTENCE (Zero XP)
  // ==========================================================================

  /**
   * Record a student's completed test attempt
   */
  async recordTestAttempt(userId, evaluation) {
    const attemptId = `attempt_${Date.now()}`;
    const record = {
      id: attemptId,
      user_id: userId,
      test_id: evaluation.testId,
      test_title: evaluation.testTitle,
      subject_name: evaluation.subjectName,
      total_questions: evaluation.totalQuestions,
      correct_count: evaluation.correctCount,
      incorrect_count: evaluation.incorrectCount,
      unattempted_count: evaluation.unattemptedCount,
      score: evaluation.score,
      percentage: evaluation.percentage,
      accuracy: evaluation.accuracy,
      time_spent_seconds: evaluation.timeSpentSeconds,
      timestamp: evaluation.timestamp || new Date().toISOString()
    };

    // 1. Save to local storage history
    const localKey = `nw_test_history_${userId}`;
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(localKey) || "[]");
    } catch (e) {
      history = [];
    }
    history.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(history.slice(0, 50)));

    // 2. Increment student profile tests_taken count
    await this.incrementUserStats(userId, { testsTaken: 1 });

    // 3. Save to Firestore if connected
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_USERS)
          .doc(userId)
          .collection("test_attempts")
          .doc(attemptId)
          .set(record);
      } catch (err) {
        console.warn("[DatabaseService] Could not persist test attempt to Firestore:", err);
      }
    }

    return record;
  }

  /**
   * Get user's recent test attempts
   */
  async getUserTestAttempts(userId) {
    const localKey = `nw_test_history_${userId}`;
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore && userId && userId !== "local_student") {
      try {
        const snap = await fb.firestore
          .collection(this.COLLECTION_USERS)
          .doc(userId)
          .collection("test_attempts")
          .orderBy("timestamp", "desc")
          .limit(50)
          .get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore test attempts query error:", err);
      }
    }
    try {
      return JSON.parse(localStorage.getItem(localKey) || "[]");
    } catch (e) {
      return [];
    }
  }

  /**
   * Record response for daily academic challenge
   */
  async recordDailyChallengeAttempt(userId, challengeId, selectedOption) {
    const today = new Date().toISOString().split("T")[0];
    const key = `nw_challenge_${userId}_${challengeId}`;
    localStorage.setItem(key, String(selectedOption));

    // Update daily streak
    const streakKey = `nw_streak_${userId}`;
    let streakData = { streakDays: 1, lastDate: today };
    try {
      const stored = JSON.parse(localStorage.getItem(streakKey) || "null");
      if (stored && stored.lastDate) {
        const last = new Date(stored.lastDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streakData = { streakDays: stored.streakDays + 1, lastDate: today };
        } else if (diffDays === 0) {
          streakData = stored; // Already answered today
        } else {
          streakData = { streakDays: 1, lastDate: today };
        }
      }
    } catch (e) {
      // fallback
    }
    localStorage.setItem(streakKey, JSON.stringify(streakData));

    // Save to Firestore if available
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_USERS)
          .doc(userId)
          .collection("challenge_attempts")
          .doc(`${today}_${challengeId}`)
          .set({
            challenge_id: challengeId,
            selected_option: selectedOption,
            date: today,
            timestamp: new Date().toISOString()
          });
      } catch (e) {
        console.warn("[DatabaseService] Challenge Firestore write error:", e);
      }
    }
  }

  /**
   * Get user's saved answer for a daily challenge
   */
  getDailyChallengeAnswer(userId, challengeId) {
    const key = `nw_challenge_${userId}_${challengeId}`;
    const val = localStorage.getItem(key);
    return val !== null ? parseInt(val, 10) : null;
  }

  /**
   * Get user's academic streak
   */
  getAcademicStreak(userId) {
    const streakKey = `nw_streak_${userId}`;
    try {
      const stored = JSON.parse(localStorage.getItem(streakKey) || "null");
      if (stored && stored.streakDays) {
        return stored;
      }
    } catch (e) {}
    return { streakDays: 1, lastDate: new Date().toISOString().split("T")[0] };
  }

  /**
   * Increment user academic statistics
   */
  async incrementUserStats(userId, { testsTaken = 0, chaptersCompleted = 0 }) {
    const profile = await this.getStudentProfile(userId);
    if (!profile) return;

    profile.tests_taken = (profile.tests_taken || 0) + testsTaken;
    profile.chapters_completed = (profile.chapters_completed || 0) + chaptersCompleted;

    // Save updated profile
    await this.saveStudentProfile(userId, profile);
  }

  async getAvailableTests(classLevel) {
    const classId = this.normalizeClassId(classLevel);
    const fb = window.NotesWallahFirebase;
    let list = [];
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_TESTS)
          .where("class_id", "==", classId)
          .where("is_active", "==", true)
          .get();
        if (!snapshot.empty) {
          list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn("[DatabaseService] Tests query error:", e);
      }
    }
    if (list.length === 0) {
      try {
        const stored = JSON.parse(localStorage.getItem("nw_custom_tests") || "[]");
        list = stored.filter(t => t.class_id === classId && t.is_active !== false);
      } catch (e) {}
    }
    return list;
  }

  /**
   * Admin: Create or update test document
   */
  async createTest(testData) {
    const testId = testData.id || `test_${Date.now()}`;
    const docData = {
      id: testId,
      class_id: this.normalizeClassId(testData.class_id),
      subject_id: testData.subject_id || "",
      chapter_id: testData.chapter_id || "",
      title: (testData.title || "").trim(),
      description: (testData.description || "").trim(),
      test_type: testData.test_type || "chapter", // "full_syllabus" | "subject" | "chapter"
      duration_seconds: Number(testData.duration_seconds) || (Number(testData.duration_mins || 15) * 60),
      question_count: Number(testData.question_count) || 0,
      difficulty: testData.difficulty || "Standard",
      is_active: testData.is_active !== false,
      created_at: testData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore.collection(this.COLLECTION_TESTS).doc(testId).set(docData, { merge: true });
      } catch (err) {
        console.warn("[DatabaseService] Firestore test write failed:", err);
      }
    }

    // Persist to local storage custom tests registry
    try {
      const stored = JSON.parse(localStorage.getItem("nw_custom_tests") || "[]");
      const idx = stored.findIndex(t => t.id === testId);
      if (idx >= 0) stored[idx] = docData;
      else stored.push(docData);
      localStorage.setItem("nw_custom_tests", JSON.stringify(stored));
    } catch (e) {}

    return docData;
  }

  /**
   * Admin: Add question to a test's questions subcollection
   */
  async addQuestionToTest(testId, questionData) {
    const questionId = questionData.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const docData = {
      id: questionId,
      test_id: testId,
      question: (questionData.question || "").trim(),
      question_type: questionData.question_type || "mcq_single",
      options: Array.isArray(questionData.options) ? questionData.options : [],
      correct_answer: questionData.correct_answer !== undefined ? questionData.correct_answer : (questionData.correct_index !== undefined ? questionData.correct_index : 0),
      explanation: (questionData.explanation || "").trim(),
      concept: (questionData.concept || "").trim(),
      marks: Number(questionData.marks) || 1,
      order: Number(questionData.order) || 1,
      is_active: questionData.is_active !== false,
      created_at: new Date().toISOString()
    };

    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore
          .collection(this.COLLECTION_TESTS)
          .doc(testId)
          .collection("questions")
          .doc(questionId)
          .set(docData, { merge: true });

        // Update parent test question count
        await fb.firestore
          .collection(this.COLLECTION_TESTS)
          .doc(testId)
          .set({ question_count: firebase.firestore.FieldValue.increment(1) }, { merge: true });
      } catch (err) {
        console.warn("[DatabaseService] Firestore question write failed:", err);
      }
    }

    // Update local cache
    try {
      const key = `nw_test_questions_${testId}`;
      const list = JSON.parse(localStorage.getItem(key) || "[]");
      list.push(docData);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}

    return docData;
  }

  /**
   * Fetch questions for a test
   */
  async getTestQuestions(testId) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snap = await fb.firestore
          .collection(this.COLLECTION_TESTS)
          .doc(testId)
          .collection("questions")
          .where("is_active", "==", true)
          .orderBy("order", "asc")
          .get();

        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (err) {
        console.warn("[DatabaseService] Firestore questions fetch fallback:", err);
      }
    }

    try {
      const key = `nw_test_questions_${testId}`;
      const local = JSON.parse(localStorage.getItem(key) || "[]");
      if (local.length > 0) return local;
    } catch (e) {}

    return [];
  }

  /**
   * Delete a test and its questions
   */
  async deleteTest(testId) {
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        await fb.firestore.collection(this.COLLECTION_TESTS).doc(testId).delete();
      } catch (e) {
        console.warn(e);
      }
    }

    try {
      const stored = JSON.parse(localStorage.getItem("nw_custom_tests") || "[]");
      const filtered = stored.filter(t => t.id !== testId);
      localStorage.setItem("nw_custom_tests", JSON.stringify(filtered));
      localStorage.removeItem(`nw_test_questions_${testId}`);
    } catch (e) {}

    return true;
  }

  async getChallenges(classLevel) {
    const classId = this.normalizeClassId(classLevel);
    const fb = window.NotesWallahFirebase;
    if (fb.isConfigured() && fb.firestore) {
      try {
        const snapshot = await fb.firestore
          .collection(this.COLLECTION_CHALLENGES)
          .where("class_id", "==", classId)
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
