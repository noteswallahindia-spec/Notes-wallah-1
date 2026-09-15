/**
 * NOTES WALLAH - Test Series, Practice & Academic Challenges Engine
 * Part 5 of 10: Test & Practice Architecture
 * 
 * Manages:
 * - NCERT Academic Test Series across Classes 9, 10, 11, 12
 * - Filterable tests: Full Syllabus Mock, Subject-wise, Chapter-wise
 * - Interactive Test Runner with timer, question palette, review flagging
 * - Detailed Result Card with question-by-question NCERT review & explanations
 * - Daily and Weekly Academic Challenges with instant solution verification
 * - Real academic study streak (Milestone based, strictly zero XP)
 * - Integration with Firestore and LocalStorage
 */

const SEED_TESTS = [
  // Class 10 Science Tests
  {
    id: "test_c10_sci_ch1",
    class_id: "class_10",
    subject_id: "c10_science",
    subject_name: "Science",
    title: "Class 10 Science: Chemical Reactions & Equations",
    description: "NCERT Chapter 1 diagnostic test covering types of chemical reactions, oxidation-reduction, balancing, and rancidity.",
    duration_mins: 15,
    difficulty: "Standard",
    questions: [
      {
        id: "q_c10_sci_1",
        question: "When magnesium ribbon is burnt in air, the ash formed is:",
        options: [
          "Black magnesium oxide (MgO)",
          "White magnesium oxide (MgO)",
          "Yellow magnesium nitride (Mg₃N₂)",
          "Brown magnesium carbonate (MgCO₃)"
        ],
        correct_index: 1,
        concept: "Combustion of Magnesium Ribbon (NCERT Activity 1.1)",
        explanation: "Magnesium ribbon burns with a dazzling white flame and changes into a white powder. This powder is magnesium oxide (MgO), formed due to the reaction between magnesium and oxygen present in the air: 2Mg + O₂ → 2MgO."
      },
      {
        id: "q_c10_sci_2",
        question: "In the reaction: CuO + H₂ → Cu + H₂O, which substance is oxidised and which is reduced?",
        options: [
          "CuO is oxidised, H₂ is reduced",
          "H₂ is oxidised, CuO is reduced",
          "Both CuO and H₂ are oxidised",
          "Neither is oxidised"
        ],
        correct_index: 1,
        concept: "Redox Reactions (Oxidation & Reduction)",
        explanation: "In this reaction, CuO loses oxygen and is reduced to Cu. H₂ gains oxygen and is oxidised to H₂O. Therefore, H₂ is oxidised and CuO is reduced."
      },
      {
        id: "q_c10_sci_3",
        question: "Which of the following is an endothermic process?",
        options: [
          "Dilution of sulphuric acid",
          "Sublimation of dry ice (solid CO₂)",
          "Condensation of water vapours",
          "Respiration in living organisms"
        ],
        correct_index: 1,
        concept: "Exothermic and Endothermic Reactions",
        explanation: "Sublimation of solid CO₂ absorbs heat energy from the surroundings without chemical combustion, making it an endothermic process. Dilution of acids, respiration, and condensation release heat."
      },
      {
        id: "q_c10_sci_4",
        question: "Lead nitrate powder is heated in a dry boiling tube. What observation confirms the reaction?",
        options: [
          "A colourless and odourless gas is liberated",
          "Brown fumes of nitrogen dioxide (NO₂) and yellow residue of lead oxide (PbO)",
          "A pop sound is heard",
          "The residue turns completely white"
        ],
        correct_index: 1,
        concept: "Thermal Decomposition Reaction",
        explanation: "Thermal decomposition of lead nitrate: 2Pb(NO₃)₂ (s) → 2PbO (s) + 4NO₂ (g) + O₂ (g). The brown fumes observed are nitrogen dioxide (NO₂) and the yellow solid residue remaining is lead(II) oxide (PbO)."
      },
      {
        id: "q_c10_sci_5",
        question: "To prevent oil and fat containing food items from getting oxidised (rancidity), manufacturers flush bags of chips with:",
        options: [
          "Oxygen gas",
          "Nitrogen gas",
          "Carbon dioxide gas",
          "Hydrogen gas"
        ],
        correct_index: 1,
        concept: "Corrosion & Rancidity Prevention",
        explanation: "Nitrogen is an unreactive inert gas that displaces oxygen inside snack packets, preventing oxidative breakdown and rancidity of fats and oils."
      }
    ]
  },
  {
    id: "test_c10_sci_ch2",
    class_id: "class_10",
    subject_id: "c10_science",
    subject_name: "Science",
    title: "Class 10 Science: Acids, Bases and Salts",
    description: "Assessment on pH scale, neutralization reactions, chlor-alkali process, Plaster of Paris, and indicators.",
    duration_mins: 15,
    difficulty: "Standard",
    questions: [
      {
        id: "q_c10_sci_6",
        question: "An aqueous solution turns red litmus paper blue. Excess addition of which of the following solution would reverse the change?",
        options: [
          "Baking powder",
          "Lime (Calcium hydroxide)",
          "Ammonium hydroxide solution",
          "Hydrochloric acid"
        ],
        correct_index: 3,
        concept: "Acid-Base Indicators & Neutralization",
        explanation: "The initial solution is basic because it turns red litmus blue. Adding an acid like hydrochloric acid (HCl) neutralizes the base and makes the solution acidic, turning the litmus back to red."
      },
      {
        id: "q_c10_sci_7",
        question: "What is the chemical formula of Plaster of Paris?",
        options: [
          "CaSO₄ · 2H₂O",
          "CaSO₄ · ½H₂O",
          "CaSO₄ · H₂O",
          "2CaSO₄ · H₂O"
        ],
        correct_index: 1,
        concept: "Salts & Plaster of Paris (NCERT Sec 2.4.4)",
        explanation: "Plaster of Paris is calcium sulphate hemihydrate (CaSO₄ · ½H₂O), prepared by carefully heating gypsum (CaSO₄ · 2H₂O) at 373 K."
      },
      {
        id: "q_c10_sci_8",
        question: "Tooth enamel is the hardest substance in the body. It begins to corrode when the mouth pH falls below:",
        options: [
          "7.0",
          "6.5",
          "5.5",
          "8.0"
        ],
        correct_index: 2,
        concept: "pH in Everyday Life & Tooth Decay",
        explanation: "Tooth enamel made of calcium hydroxyapatite corrodes when oral pH drops below 5.5 due to acid produced by bacteria degrading leftover sugar and food particles."
      },
      {
        id: "q_c10_sci_9",
        question: "During the Chlor-alkali process, the gas produced at the anode is:",
        options: [
          "Hydrogen gas (H₂)",
          "Chlorine gas (Cl₂)",
          "Oxygen gas (O₂)",
          "Nitrogen gas (N₂)"
        ],
        correct_index: 1,
        concept: "Chlor-Alkali Process (Electricity through Brine)",
        explanation: "When electricity is passed through aqueous sodium chloride (brine), chlorine gas is given off at the anode, and hydrogen gas is given off at the cathode: 2NaCl + 2H₂O → 2NaOH + Cl₂ + H₂."
      },
      {
        id: "q_c10_sci_10",
        question: "Nettle leaf hair sting causes burning pain. The acid injected is:",
        options: [
          "Oxalic acid",
          "Methanoic acid (Formic acid)",
          "Tartaric acid",
          "Citric acid"
        ],
        correct_index: 1,
        concept: "Natural Sources of Organic Acids",
        explanation: "Nettle leaf hair injects methanoic acid (HCOOH) into the skin. Traditional remedy involves rubbing dock plant leaves containing weak alkaline juices."
      }
    ]
  },
  // Class 10 Mathematics Tests
  {
    id: "test_c10_math_ch1",
    class_id: "class_10",
    subject_id: "c10_maths",
    subject_name: "Mathematics",
    title: "Class 10 Maths: Real Numbers & Polynomials",
    description: "Practice test on Fundamental Theorem of Arithmetic, HCF-LCM relation, irrationality proofs, and zeroes of quadratic polynomials.",
    duration_mins: 15,
    difficulty: "Standard",
    questions: [
      {
        id: "q_c10_m_1",
        question: "If two positive integers a and b are written as a = x³y² and b = xy³, where x, y are prime numbers, then HCF(a, b) is:",
        options: [
          "xy",
          "xy²",
          "x³y³",
          "x²y²"
        ],
        correct_index: 1,
        concept: "Fundamental Theorem of Arithmetic (HCF calculation)",
        explanation: "HCF is the product of the smallest power of each common prime factor involved in the numbers. For a = x³y² and b = xy³, the common factors with lowest powers are x¹ and y², giving HCF = xy²."
      },
      {
        id: "q_c10_m_2",
        question: "If the zeroes of the quadratic polynomial ax² + bx + c, c ≠ 0 are equal, then:",
        options: [
          "c and a have opposite signs",
          "c and d have opposite signs",
          "c and a have the same sign",
          "c and b have the same sign"
        ],
        correct_index: 2,
        concept: "Zeroes of Quadratic Polynomial & Discriminant",
        explanation: "For equal roots, discriminant D = b² - 4ac = 0, so b² = 4ac. Since b² ≥ 0, 4ac must be positive, which requires 'a' and 'c' to have the exact same sign."
      },
      {
        id: "q_c10_m_3",
        question: "Given that HCF(306, 657) = 9, what is LCM(306, 657)?",
        options: [
          "22338",
          "21148",
          "22556",
          "24338"
        ],
        correct_index: 0,
        concept: "Relation: HCF(a, b) × LCM(a, b) = a × b",
        explanation: "LCM(306, 657) = (306 × 657) / HCF = (306 × 657) / 9 = 34 × 657 = 22,338."
      },
      {
        id: "q_c10_m_4",
        question: "If one zero of the quadratic polynomial (k - 1)x² + kx + 1 is -3, then the value of k is:",
        options: [
          "4/3",
          "-4/3",
          "2/3",
          "-2/3"
        ],
        correct_index: 0,
        concept: "Zeroes of a Polynomial Value Substitution",
        explanation: "Since -3 is a zero: (k - 1)(-3)² + k(-3) + 1 = 0 ⇒ 9(k - 1) - 3k + 1 = 0 ⇒ 9k - 9 - 3k + 1 = 0 ⇒ 6k - 8 = 0 ⇒ k = 8/6 = 4/3."
      },
      {
        id: "q_c10_m_5",
        question: "The decimal expansion of the rational number 14587 / (2 × 5⁴) will terminate after how many decimal places?",
        options: [
          "1 decimal place",
          "2 decimal places",
          "3 decimal places",
          "4 decimal places"
        ],
        correct_index: 3,
        concept: "Terminating Decimals and Prime Factorization",
        explanation: "The denominator is 2¹ × 5⁴. The highest power between 2 and 5 in the denominator is 4. Multiplying numerator and denominator by 2³ gives 10⁴ in the denominator, terminating after 4 decimal places."
      }
    ]
  },
  // Class 10 Social Science Tests
  {
    id: "test_c10_soc_ch1",
    class_id: "class_10",
    subject_id: "c10_social",
    subject_name: "Social Science",
    title: "Class 10 Social: Nationalism in Europe & India",
    description: "History assessment on the French Revolution, Frederic Sorrieu's vision, Non-Cooperation Movement, and Rowlatt Act.",
    duration_mins: 15,
    difficulty: "Standard",
    questions: [
      {
        id: "q_c10_soc_1",
        question: "Who was proclaimed the German Emperor in a ceremony held at Versailles in January 1871?",
        options: [
          "Kaiser William I of Prussia",
          "Otto von Bismarck",
          "Victor Emmanuel II",
          "Giuseppe Mazzini"
        ],
        correct_index: 0,
        concept: "Unification of Germany (NCERT History Ch 1)",
        explanation: "In January 1871, the Prussian King, Kaiser William I, was proclaimed German Emperor in the Hall of Mirrors at the Palace of Versailles after the Prussian victory over France."
      },
      {
        id: "q_c10_soc_2",
        question: "The Civil Code of 1804 in France is usually known as:",
        options: [
          "The French Directory",
          "The Napoleonic Code",
          "The Treaty of Vienna",
          "The Declaration of the Rights of Man"
        ],
        correct_index: 1,
        concept: "Napoleonic Administrative Reforms",
        explanation: "The Civil Code of 1804—usually known as the Napoleonic Code—did away with all privileges based on birth, established equality before the law, and secured the right to property."
      },
      {
        id: "q_c10_soc_3",
        question: "Why did Mahatma Gandhi decide to withdraw the Non-Cooperation Movement in February 1922?",
        options: [
          "Due to the Jallianwala Bagh incident",
          "Because of the violent incident at Chauri Chaura",
          "Due to the Poona Pact agreement",
          "Because the First World War had begun"
        ],
        correct_index: 1,
        concept: "Non-Cooperation Movement & Chauri Chaura",
        explanation: "In February 1922, at Chauri Chaura in Gorakhpur, a peaceful demonstration turned into a violent clash where protestors burned a police station with 22 policemen inside. Hearing this, Gandhiji immediately called off the movement."
      },
      {
        id: "q_c10_soc_4",
        question: "Who composed the national song 'Vande Mataram'?",
        options: [
          "Rabindranath Tagore",
          "Bankim Chandra Chattopadhyay",
          "Abanindranath Tagore",
          "Subhas Chandra Bose"
        ],
        correct_index: 1,
        concept: "Sense of Collective Belonging (NCERT History Ch 2)",
        explanation: "In the 1870s, Bankim Chandra Chattopadhyay wrote 'Vande Mataram' as a hymn to the motherland. Later it was included in his novel Anandamath and widely sung during the Swadeshi movement."
      },
      {
        id: "q_c10_soc_5",
        question: "The Rowlatt Act of 1919 authorized the British government to:",
        options: [
          "Impose heavy taxes on salt production",
          "Detain political prisoners without trial for up to two years",
          "Ban the publication of all vernacular newspapers",
          "Arrest Congress leaders only with judicial warrants"
        ],
        correct_index: 1,
        concept: "The Rowlatt Act & Nationalist Opposition",
        explanation: "The Rowlatt Act hurried through the Imperial Legislative Council gave the colonial government enormous powers to repress political activities and allowed detention of political prisoners without trial for two years."
      }
    ]
  },
  // Class 10 Full Syllabus Science Mock
  {
    id: "test_c10_full_science",
    class_id: "class_10",
    subject_id: "c10_science",
    subject_name: "Science",
    title: "Class 10 Science: Full Board Mock Examination",
    description: "Complete 10-question mock test spanning Physics, Chemistry, and Biology curated directly from board blueprints.",
    duration_mins: 20,
    difficulty: "Board Target",
    questions: [
      {
        id: "q_c10_full_1",
        question: "What is the focal length of a spherical mirror of radius of curvature 30 cm?",
        options: [
          "60 cm",
          "15 cm",
          "30 cm",
          "7.5 cm"
        ],
        correct_index: 1,
        concept: "Light - Reflection: f = R / 2",
        explanation: "The focal length (f) of a spherical mirror is half of its radius of curvature (R): f = R / 2 = 30 cm / 2 = 15 cm."
      },
      {
        id: "q_c10_full_2",
        question: "Which gland secretes bile juice for fat emulsification in the human digestive system?",
        options: [
          "Pancreas",
          "Liver",
          "Stomach gastric glands",
          "Salivary glands"
        ],
        correct_index: 1,
        concept: "Human Digestive System (Life Processes)",
        explanation: "Bile juice is secreted by the liver and stored in the gall bladder. It emulsifies large fat globules into smaller droplets for lipase action."
      },
      {
        id: "q_c10_full_3",
        question: "The device used for measuring electric current in a circuit is called:",
        options: [
          "Voltmeter",
          "Galvanometer",
          "Ammeter",
          "Potentiometer"
        ],
        correct_index: 2,
        concept: "Electricity - Current & Circuits",
        explanation: "An ammeter is always connected in series in an electric circuit to measure electric current flowing through it."
      },
      {
        id: "q_c10_full_4",
        question: "Which of the following hydrocarbon will undergo addition reaction?",
        options: [
          "CH₄",
          "C₂H₆",
          "C₃H₈",
          "C₃H₆"
        ],
        correct_index: 3,
        concept: "Carbon Compounds - Addition Reactions of Unsaturated Hydrocarbons",
        explanation: "Addition reactions occur in unsaturated hydrocarbons (alkenes and alkynes) having double or triple bonds. C₃H₆ (propene) is an alkene and reacts with hydrogen in the presence of nickel catalyst."
      },
      {
        id: "q_c10_full_5",
        question: "In Mendel's dihybrid cross between round green and wrinkled yellow pea seeds, the phenotypic ratio in F₂ generation was:",
        options: [
          "3 : 1",
          "9 : 3 : 3 : 1",
          "1 : 2 : 1",
          "9 : 7"
        ],
        correct_index: 1,
        concept: "Heredity & Mendel's Law of Independent Assortment",
        explanation: "The classic phenotypic ratio observed in Mendel's dihybrid cross F₂ generation is 9 (Round Yellow) : 3 (Round Green) : 3 (Wrinkled Yellow) : 1 (Wrinkled Green)."
      }
    ]
  },
  // Class 9 Science Test
  {
    id: "test_c9_sci_ch1",
    class_id: "class_9",
    subject_id: "c9_science",
    subject_name: "Science",
    title: "Class 9 Science: Matter in Our Surroundings",
    description: "Foundational assessment on states of matter, latent heat, evaporation, and kinetic theory of particles.",
    duration_mins: 15,
    difficulty: "Standard",
    questions: [
      {
        id: "q_c9_sci_1",
        question: "The boiling point of water on the Kelvin temperature scale is:",
        options: [
          "273 K",
          "373 K",
          "100 K",
          "0 K"
        ],
        correct_index: 1,
        concept: "Temperature Scale Conversion: K = °C + 273",
        explanation: "Boiling point of water is 100 °C. In Kelvin: T(K) = 100 + 273 = 373 K."
      },
      {
        id: "q_c9_sci_2",
        question: "Evaporation of a liquid causes cooling because:",
        options: [
          "High energy particles absorb latent heat from surroundings",
          "Particles lose kinetic energy to surroundings",
          "Liquid changes state at fixed temperature",
          "Surface tension increases"
        ],
        correct_index: 0,
        concept: "Evaporation and Latent Heat of Vaporisation",
        explanation: "The particles of liquid absorb energy from the surroundings to regain the energy lost during evaporation. This absorption of heat from the surroundings causes the surface to feel cool."
      },
      {
        id: "q_c9_sci_3",
        question: "Which of the following states of matter has the highest compressibility?",
        options: [
          "Solid",
          "Liquid",
          "Gas",
          "Crystal"
        ],
        correct_index: 2,
        concept: "Characteristics of Particles of Matter",
        explanation: "Gases have large intermolecular spaces between particles and negligible intermolecular attraction, giving them maximum compressibility (as utilized in LPG and CNG cylinders)."
      }
    ]
  }
];

// Seed Academic Challenges (Class-specific conceptual questions)
const SEED_DAILY_CHALLENGES = {
  class_10: {
    id: "dc_c10_today",
    class_id: "class_10",
    subject: "Science",
    topic: "Chemical Equations (Redox & Balancing)",
    date: new Date().toISOString().split("T")[0],
    difficulty: "Conceptual Booster",
    question: "A shiny brown-coloured element 'X' on heating in air becomes black in colour. Identify element 'X' and the black coloured compound formed:",
    options: [
      "X is Iron (Fe), Compound is Fe₂O₃",
      "X is Copper (Cu), Compound is Copper(II) Oxide (CuO)",
      "X is Silver (Ag), Compound is Ag₂S",
      "X is Lead (Pb), Compound is PbO"
    ],
    correct_index: 1,
    hint: "Think about NCERT Activity 1.11 where copper powder is heated in a china dish.",
    explanation: "The shiny brown element 'X' is Copper (Cu). When copper powder is heated in a china dish, the surface of copper powder becomes coated with black copper(II) oxide (CuO). Reaction: 2Cu + O₂ → 2CuO."
  },
  class_9: {
    id: "dc_c9_today",
    class_id: "class_9",
    subject: "Science",
    topic: "Characteristics of Matter",
    date: new Date().toISOString().split("T")[0],
    difficulty: "Foundational",
    question: "Why does the smell of hot sizzling food reach you several metres away, but to get the smell from cold food you have to go close?",
    options: [
      "Hot food produces higher air pressure",
      "Rate of diffusion increases with increase in temperature due to higher kinetic energy",
      "Cold particles have higher velocity than hot particles",
      "Cold food particles dissolve in air faster"
    ],
    correct_index: 1,
    hint: "Recall how particle kinetic energy depends on thermal temperature.",
    explanation: "Particles of matter possess kinetic energy. With rise in temperature, the kinetic energy of particles increases, causing them to move faster. Therefore, the rate of diffusion of hot food vapours in air is much faster than cold food."
  },
  class_11: {
    id: "dc_c11_today",
    class_id: "class_11",
    subject: "Physics",
    topic: "Units and Dimensions",
    date: new Date().toISOString().split("T")[0],
    difficulty: "Advanced Drill",
    question: "The dimensional formula of Universal Gravitational Constant (G) is:",
    options: [
      "[M⁻¹ L³ T⁻²]",
      "[M¹ L² T⁻²]",
      "[M⁰ L³ T⁻¹]",
      "[M⁻¹ L² T⁻³]"
    ],
    correct_index: 0,
    hint: "Use Newton's law: F = G · (m₁ · m₂) / r²",
    explanation: "From F = G · m₁ · m₂ / r², G = (F · r²) / (m₁ · m₂). Substituting dimensions: [G] = ([M L T⁻²] · [L²]) / [M²] = [M⁻¹ L³ T⁻²]."
  },
  class_12: {
    id: "dc_c12_today",
    class_id: "class_12",
    subject: "Physics",
    topic: "Electrostatics & Gauss's Law",
    date: new Date().toISOString().split("T")[0],
    difficulty: "Board Target",
    question: "Electric flux through a closed Gaussian surface enclosing a dipole of charges +q and -q is:",
    options: [
      "q / ε₀",
      "2q / ε₀",
      "Zero",
      "q / 2ε₀"
    ],
    correct_index: 2,
    hint: "Gauss's law states total electric flux = Q_enclosed / ε₀.",
    explanation: "By Gauss's Law, Φ = Q_net / ε₀. An electric dipole consists of equal and opposite charges (+q and -q). The net enclosed charge Q_net = (+q) + (-q) = 0. Hence, electric flux Φ = 0."
  }
};

class TestEngineService {
  constructor() {
    this.tests = SEED_TESTS;
    this.dailyChallenges = SEED_DAILY_CHALLENGES;
    this.activeSession = null;
    this.timerInterval = null;
    this.currentFilterSubject = "all";
  }

  /**
   * Filter tests for a student's class and optional subject
   */
  getTestsForClass(classId, subjectId = "all") {
    const normClass = window.NotesWallahDatabase.normalizeClassId(classId);
    let list = this.tests.filter(t => t.class_id === normClass);
    if (subjectId && subjectId !== "all") {
      list = list.filter(t => t.subject_id === subjectId);
    }
    return list;
  }

  /**
   * Get single test by ID
   */
  getTestById(testId) {
    return this.tests.find(t => t.id === testId) || null;
  }

  /**
   * Get today's academic challenge for student's class
   */
  getDailyChallenge(classId) {
    const normClass = window.NotesWallahDatabase.normalizeClassId(classId);
    return this.dailyChallenges[normClass] || this.dailyChallenges["class_10"];
  }

  /**
   * Initialize and render Test Hub tab (Screen 3)
   */
  renderTestHub(classId) {
    const container = document.getElementById("screen-test");
    if (!container) return;

    const normClass = window.NotesWallahDatabase.normalizeClassId(classId);
    const className = window.NotesWallahDatabase.formatClassName(normClass);
    const tests = this.getTestsForClass(normClass, this.currentFilterSubject);

    // Update class display badges
    const classBadges = container.querySelectorAll(".student-class-display");
    classBadges.forEach(b => { b.textContent = className; });

    let testsListHtml = "";
    if (tests.length === 0) {
      testsListHtml = `
        <div class="empty-state" style="margin-top: var(--spacing-4);">
          <div class="empty-state-icon-wrap">
            <svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <h4 class="empty-state-title">No Tests Found</h4>
          <p class="empty-state-subtitle">No test series available for the selected subject filter in ${className}.</p>
        </div>
      `;
    } else {
      testsListHtml = `
        <div class="test-cards-grid" style="display: flex; flex-direction: column; gap: var(--spacing-3); margin-top: var(--spacing-3);">
          ${tests.map(test => `
            <div class="feature-card test-item-card" data-test-id="${test.id}" style="cursor: pointer; border-left: 4px solid var(--brand-gold);">
              <div class="card-header-row" style="margin-bottom: var(--spacing-1);">
                <div style="display: flex; gap: var(--spacing-2); align-items: center;">
                  <span class="card-tag" style="color: var(--brand-navy-primary);">${test.subject_name}</span>
                  <span class="academic-badge" style="font-size: 0.65rem;">${test.difficulty}</span>
                </div>
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">⏱️ ${test.duration_mins} Mins</span>
              </div>
              <h4 class="card-title" style="margin-bottom: var(--spacing-1); font-size: var(--font-size-sm);">${test.title}</h4>
              <p class="card-desc" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-3);">${test.description}</p>
              
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: var(--spacing-2);">
                <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-semibold);">
                  📝 ${test.questions.length} Questions
                </span>
                <button type="button" class="btn btn-primary btn-sm btn-launch-test" data-test-id="${test.id}" style="padding: 6px 14px; font-size: var(--font-size-xs);">
                  Start Test
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    const testContent = `
      <div class="section-title-row">
        <h3 class="section-title">Test Series & Practice</h3>
        <span class="academic-badge student-class-display">${className}</span>
      </div>

      <!-- Quick Architecture Info Card -->
      <div class="feature-card" style="border-left: 4px solid var(--brand-navy-primary); margin-bottom: var(--spacing-3); padding: var(--spacing-3) var(--spacing-4);">
        <div class="card-header-row" style="margin-bottom: 2px;">
          <span class="card-tag" style="color: var(--brand-navy-primary);">Academic Practice Engine</span>
          <span class="academic-badge" style="background: rgba(46, 125, 50, 0.12); color: #2E7D32;">Zero XP • Pure Learning</span>
        </div>
        <p class="card-desc" style="font-size: var(--font-size-xs); margin: 0;">
          NCERT syllabus tests featuring timed examination modes, interactive question palettes, and faculty explanations.
        </p>
      </div>

      <!-- Subject Filter Pills -->
      <div class="test-subject-filters" style="display: flex; gap: var(--spacing-2); overflow-x: auto; padding-bottom: 6px; margin-bottom: var(--spacing-2);">
        <button type="button" class="choice-chip ${this.currentFilterSubject === 'all' ? 'selected' : ''}" data-filter-subject="all">
          All Tests
        </button>
        <button type="button" class="choice-chip ${this.currentFilterSubject === 'c10_science' ? 'selected' : ''}" data-filter-subject="c10_science">
          Science
        </button>
        <button type="button" class="choice-chip ${this.currentFilterSubject === 'c10_maths' ? 'selected' : ''}" data-filter-subject="c10_maths">
          Mathematics
        </button>
        <button type="button" class="choice-chip ${this.currentFilterSubject === 'c10_social' ? 'selected' : ''}" data-filter-subject="c10_social">
          Social Science
        </button>
      </div>

      ${testsListHtml}
    `;

    container.innerHTML = testContent;
    this.bindTestHubEvents(container, classId);
  }

  /**
   * Bind event listeners for test hub
   */
  bindTestHubEvents(container, classId) {
    // Subject filter pills
    const filterPills = container.querySelectorAll("[data-filter-subject]");
    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        this.currentFilterSubject = pill.getAttribute("data-filter-subject");
        this.renderTestHub(classId);
      });
    });

    // Start Test buttons
    const launchBtns = container.querySelectorAll(".btn-launch-test, .test-item-card");
    launchBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const testId = btn.getAttribute("data-test-id");
        if (testId) {
          this.openTestConfigModal(testId);
        }
      });
    });
  }

  /**
   * Open Test Configuration Modal before taking test
   */
  openTestConfigModal(testId) {
    const test = this.getTestById(testId);
    if (!test) return;

    const modalTitle = document.getElementById("test-config-modal-title");
    const modalDesc = document.getElementById("test-config-modal-desc");
    const modalQCount = document.getElementById("test-config-qcount");
    const modalDuration = document.getElementById("test-config-duration");
    const startBtn = document.getElementById("btn-confirm-start-test");

    if (modalTitle) modalTitle.textContent = test.title;
    if (modalDesc) modalDesc.textContent = test.description;
    if (modalQCount) modalQCount.textContent = `${test.questions.length} Questions`;
    if (modalDuration) modalDuration.textContent = `${test.duration_mins} Minutes`;

    if (startBtn) {
      startBtn.onclick = () => {
        const timedRadio = document.querySelector('input[name="test_mode_radio"]:checked');
        const isTimed = timedRadio ? timedRadio.value === "timed" : true;
        window.NotesWallahUI.closeModal("modal-test-config");
        this.startTest(test.id, { timed: isTimed });
      };
    }

    window.NotesWallahUI.openModal("modal-test-config");
  }

  /**
   * Start Test Execution Session
   */
  startTest(testId, config = { timed: true }) {
    const test = this.getTestById(testId);
    if (!test) return;

    this.activeSession = {
      test: test,
      isTimed: config.timed,
      totalQuestions: test.questions.length,
      currentQuestionIndex: 0,
      userAnswers: {},       // { [qIndex]: optionIndex }
      markedForReview: new Set(),
      remainingSeconds: config.timed ? test.duration_mins * 60 : 0,
      elapsedSeconds: 0,
      startTime: Date.now()
    };

    const modal = document.getElementById("modal-test-runner");
    if (!modal) return;

    // Set Title
    const titleEl = document.getElementById("test-runner-title");
    if (titleEl) titleEl.textContent = test.title;

    // Start Timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.activeSession.elapsedSeconds++;
      if (this.activeSession.isTimed) {
        this.activeSession.remainingSeconds--;
        this.updateTimerDisplay();
        if (this.activeSession.remainingSeconds <= 0) {
          clearInterval(this.timerInterval);
          window.NotesWallahUI.showToast("Time is up! Submitting test automatically...", "info");
          this.submitTest();
        }
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);

    // Render Question Stepper & Current Question
    this.renderQuestionPalette();
    this.renderActiveQuestion();

    window.NotesWallahUI.openModal("modal-test-runner");
  }

  /**
   * Update Timer UI display
   */
  updateTimerDisplay() {
    const timerEl = document.getElementById("test-runner-timer");
    if (!timerEl || !this.activeSession) return;

    let displaySecs = this.activeSession.isTimed ? this.activeSession.remainingSeconds : this.activeSession.elapsedSeconds;
    const mins = Math.floor(displaySecs / 60);
    const secs = displaySecs % 60;
    const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    timerEl.textContent = formatted;
    if (this.activeSession.isTimed && this.activeSession.remainingSeconds <= 120) {
      timerEl.style.color = "var(--color-status-error)";
    } else {
      timerEl.style.color = "var(--color-text-primary)";
    }
  }

  /**
   * Render Question Palette pills (1 to N)
   */
  renderQuestionPalette() {
    const paletteEl = document.getElementById("test-palette-container");
    if (!paletteEl || !this.activeSession) return;

    const total = this.activeSession.totalQuestions;
    let html = "";
    for (let i = 0; i < total; i++) {
      const isCurrent = i === this.activeSession.currentQuestionIndex;
      const isAnswered = this.activeSession.userAnswers[i] !== undefined;
      const isMarked = this.activeSession.markedForReview.has(i);

      let statusClass = "palette-unanswered";
      if (isMarked) statusClass = "palette-marked";
      else if (isAnswered) statusClass = "palette-answered";
      if (isCurrent) statusClass += " palette-active";

      html += `<button type="button" class="palette-pill ${statusClass}" data-q-idx="${i}">${i + 1}</button>`;
    }
    paletteEl.innerHTML = html;

    // Palette pill click bindings
    paletteEl.querySelectorAll(".palette-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const idx = parseInt(pill.getAttribute("data-q-idx"), 10);
        this.goToQuestion(idx);
      });
    });
  }

  /**
   * Render active question statement and choices
   */
  renderActiveQuestion() {
    if (!this.activeSession) return;

    const qIdx = this.activeSession.currentQuestionIndex;
    const question = this.activeSession.test.questions[qIdx];
    const total = this.activeSession.totalQuestions;

    // Indicators
    const qCountBadge = document.getElementById("test-runner-qcounter");
    if (qCountBadge) qCountBadge.textContent = `Question ${qIdx + 1} of ${total}`;

    const conceptBadge = document.getElementById("test-runner-concept-badge");
    if (conceptBadge) conceptBadge.textContent = question.concept || "NCERT Curriculum";

    // Question statement
    const qStatement = document.getElementById("test-runner-question-statement");
    if (qStatement) qStatement.textContent = question.question;

    // Options container
    const optionsContainer = document.getElementById("test-runner-options");
    if (optionsContainer) {
      const selectedOpt = this.activeSession.userAnswers[qIdx];
      const letters = ["A", "B", "C", "D"];

      optionsContainer.innerHTML = question.options.map((opt, oIdx) => `
        <div class="test-option-card ${selectedOpt === oIdx ? 'selected' : ''}" data-option-idx="${oIdx}">
          <div class="option-letter-badge">${letters[oIdx]}</div>
          <div class="option-text">${opt}</div>
        </div>
      `).join("");

      // Bind option clicks
      optionsContainer.querySelectorAll(".test-option-card").forEach(card => {
        card.addEventListener("click", () => {
          const oIdx = parseInt(card.getAttribute("data-option-idx"), 10);
          this.selectOption(oIdx);
        });
      });
    }

    // Toggle Review Button state
    const markBtn = document.getElementById("btn-test-mark-review");
    if (markBtn) {
      const isMarked = this.activeSession.markedForReview.has(qIdx);
      markBtn.textContent = isMarked ? "★ Marked" : "☆ Mark for Review";
      markBtn.className = `btn btn-outline btn-sm ${isMarked ? 'btn-marked-active' : ''}`;
    }

    // Navigation buttons (Prev / Next)
    const prevBtn = document.getElementById("btn-test-prev");
    const nextBtn = document.getElementById("btn-test-next");
    if (prevBtn) prevBtn.disabled = qIdx === 0;
    if (nextBtn) {
      if (qIdx === total - 1) {
        nextBtn.textContent = "Review & Submit";
        nextBtn.className = "btn btn-primary btn-sm";
      } else {
        nextBtn.textContent = "Next Question →";
        nextBtn.className = "btn btn-secondary btn-sm";
      }
    }
  }

  /**
   * Select an option for current question
   */
  selectOption(optionIndex) {
    if (!this.activeSession) return;
    const qIdx = this.activeSession.currentQuestionIndex;
    this.activeSession.userAnswers[qIdx] = optionIndex;
    this.renderQuestionPalette();
    this.renderActiveQuestion();
  }

  /**
   * Clear option for current question
   */
  clearCurrentSelection() {
    if (!this.activeSession) return;
    const qIdx = this.activeSession.currentQuestionIndex;
    delete this.activeSession.userAnswers[qIdx];
    this.renderQuestionPalette();
    this.renderActiveQuestion();
  }

  /**
   * Toggle Mark for Review for current question
   */
  toggleMarkForReview() {
    if (!this.activeSession) return;
    const qIdx = this.activeSession.currentQuestionIndex;
    if (this.activeSession.markedForReview.has(qIdx)) {
      this.activeSession.markedForReview.delete(qIdx);
    } else {
      this.activeSession.markedForReview.add(qIdx);
    }
    this.renderQuestionPalette();
    this.renderActiveQuestion();
  }

  /**
   * Navigate to specific question index
   */
  goToQuestion(idx) {
    if (!this.activeSession) return;
    if (idx >= 0 && idx < this.activeSession.totalQuestions) {
      this.activeSession.currentQuestionIndex = idx;
      this.renderQuestionPalette();
      this.renderActiveQuestion();
    }
  }

  /**
   * Handle Next / Previous actions
   */
  nextQuestion() {
    if (!this.activeSession) return;
    if (this.activeSession.currentQuestionIndex < this.activeSession.totalQuestions - 1) {
      this.goToQuestion(this.activeSession.currentQuestionIndex + 1);
    } else {
      this.openSubmitConfirmModal();
    }
  }

  prevQuestion() {
    if (!this.activeSession) return;
    if (this.activeSession.currentQuestionIndex > 0) {
      this.goToQuestion(this.activeSession.currentQuestionIndex - 1);
    }
  }

  /**
   * Open confirmation dialog before submitting
   */
  openSubmitConfirmModal() {
    if (!this.activeSession) return;

    const total = this.activeSession.totalQuestions;
    const answeredCount = Object.keys(this.activeSession.userAnswers).length;
    const markedCount = this.activeSession.markedForReview.size;
    const unansweredCount = total - answeredCount;

    const summaryEl = document.getElementById("test-submit-summary");
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-2); text-align: center; margin: var(--spacing-3) 0;">
          <div style="background: rgba(46, 125, 50, 0.1); padding: var(--spacing-2); border-radius: var(--radius-sm);">
            <strong style="color: #2E7D32; display: block; font-size: var(--font-size-md);">${answeredCount}</strong>
            <span style="font-size: 0.688rem; color: var(--color-text-secondary);">Answered</span>
          </div>
          <div style="background: rgba(232, 163, 61, 0.1); padding: var(--spacing-2); border-radius: var(--radius-sm);">
            <strong style="color: var(--brand-gold); display: block; font-size: var(--font-size-md);">${markedCount}</strong>
            <span style="font-size: 0.688rem; color: var(--color-text-secondary);">Marked</span>
          </div>
          <div style="background: rgba(211, 47, 47, 0.1); padding: var(--spacing-2); border-radius: var(--radius-sm);">
            <strong style="color: #D32F2F; display: block; font-size: var(--font-size-md);">${unansweredCount}</strong>
            <span style="font-size: 0.688rem; color: var(--color-text-secondary);">Unanswered</span>
          </div>
        </div>
      `;
    }

    const confirmBtn = document.getElementById("btn-confirm-test-submission");
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        window.NotesWallahUI.closeModal("modal-test-submit-confirm");
        this.submitTest();
      };
    }

    window.NotesWallahUI.openModal("modal-test-submit-confirm");
  }

  /**
   * Finalize and evaluate Test Session
   */
  async submitTest() {
    if (!this.activeSession) return;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const session = this.activeSession;
    const test = session.test;
    const questions = test.questions;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const questionResults = questions.map((q, idx) => {
      const userChoice = session.userAnswers[idx];
      const isAttempted = userChoice !== undefined;
      const isCorrect = isAttempted && userChoice === q.correct_index;

      if (!isAttempted) unattemptedCount++;
      else if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        userChoice: userChoice !== undefined ? userChoice : null,
        correctChoice: q.correct_index,
        isCorrect: isCorrect,
        isAttempted: isAttempted,
        explanation: q.explanation,
        concept: q.concept
      };
    });

    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const accuracy = (correctCount + incorrectCount > 0)
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
      : 0;

    const evaluation = {
      testId: test.id,
      testTitle: test.title,
      subjectName: test.subject_name,
      totalQuestions: total,
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      unattemptedCount: unattemptedCount,
      score: correctCount,
      percentage: percentage,
      accuracy: accuracy,
      timeSpentSeconds: session.elapsedSeconds,
      timestamp: new Date().toISOString(),
      questionResults: questionResults
    };

    // Close Runner modal
    window.NotesWallahUI.closeModal("modal-test-runner");

    // Persist attempt to Database & Update Profile Stats
    try {
      const auth = window.NotesWallahAuth;
      const currentUser = auth.getCurrentUser();
      const userId = currentUser ? currentUser.uid : "local_student";

      await window.NotesWallahDatabase.recordTestAttempt(userId, evaluation);
      this.updateProfileStatsUI();
    } catch (err) {
      console.warn("[TestEngine] Could not save test attempt to cloud:", err);
    }

    // Render Result Card
    this.renderTestResult(evaluation);
  }

  /**
   * Update Student Profile Stats in UI (Tests Taken Counter)
   */
  updateProfileStatsUI() {
    try {
      const testsTakenEl = document.getElementById("stat-tests-taken");
      if (testsTakenEl) {
        const currentVal = parseInt(testsTakenEl.textContent, 10) || 0;
        testsTakenEl.textContent = String(currentVal + 1);
      }
    } catch (e) {
      console.warn("[TestEngine] Stats UI update skipped:", e);
    }
  }

  /**
   * Render Comprehensive Test Result & NCERT Review
   */
  renderTestResult(result) {
    const modal = document.getElementById("modal-test-result");
    if (!modal) return;

    // Header Summary
    const titleEl = document.getElementById("test-result-title");
    if (titleEl) titleEl.textContent = result.testTitle;

    const scoreNumber = document.getElementById("result-score-number");
    if (scoreNumber) scoreNumber.textContent = `${result.correctCount}/${result.totalQuestions}`;

    const scorePercent = document.getElementById("result-score-percent");
    if (scorePercent) scorePercent.textContent = `${result.percentage}% Score`;

    // Status Badge
    const statusBadge = document.getElementById("result-status-badge");
    if (statusBadge) {
      if (result.percentage >= 80) {
        statusBadge.textContent = "Excellent Mastery";
        statusBadge.className = "academic-badge status-connected";
      } else if (result.percentage >= 50) {
        statusBadge.textContent = "Proficient";
        statusBadge.className = "academic-badge status-pending";
      } else {
        statusBadge.textContent = "Revision Recommended";
        statusBadge.className = "academic-badge status-error";
      }
    }

    // Breakdown Metrics
    const correctEl = document.getElementById("result-metric-correct");
    const incorrectEl = document.getElementById("result-metric-incorrect");
    const unattemptedEl = document.getElementById("result-metric-unattempted");
    const accuracyEl = document.getElementById("result-metric-accuracy");

    if (correctEl) correctEl.textContent = String(result.correctCount);
    if (incorrectEl) incorrectEl.textContent = String(result.incorrectCount);
    if (unattemptedEl) unattemptedEl.textContent = String(result.unattemptedCount);
    if (accuracyEl) accuracyEl.textContent = `${result.accuracy}%`;

    // Question-by-Question Review List
    const reviewList = document.getElementById("test-review-questions-list");
    if (reviewList) {
      const letters = ["A", "B", "C", "D"];
      reviewList.innerHTML = result.questionResults.map((q, idx) => {
        let badgeColor = "#2E7D32";
        let statusText = "Correct";
        if (!q.isAttempted) {
          badgeColor = "var(--color-text-secondary)";
          statusText = "Skipped";
        } else if (!q.isCorrect) {
          badgeColor = "#D32F2F";
          statusText = "Incorrect";
        }

        return `
          <div class="test-review-item-card" style="background: var(--color-bg-subtle); border-radius: var(--radius-md); padding: var(--spacing-3); margin-bottom: var(--spacing-3); border: 1px solid var(--color-border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2);">
              <span style="font-weight: var(--font-weight-bold); font-size: var(--font-size-xs); color: var(--color-text-primary);">
                Question ${idx + 1}
              </span>
              <span class="academic-badge" style="background: rgba(0,0,0,0.05); color: ${badgeColor}; font-size: 0.65rem;">
                ${statusText}
              </span>
            </div>

            <p style="font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-2); color: var(--color-text-primary);">
              ${q.questionText}
            </p>

            <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: var(--spacing-2); font-size: var(--font-size-xs);">
              ${q.options.map((opt, oIdx) => {
                let optStyle = "background: var(--color-bg-surface); color: var(--color-text-secondary);";
                if (oIdx === q.correctChoice) {
                  optStyle = "background: rgba(46, 125, 50, 0.15); color: #2E7D32; font-weight: var(--font-weight-bold); border-left: 3px solid #2E7D32;";
                } else if (q.userChoice === oIdx && !q.isCorrect) {
                  optStyle = "background: rgba(211, 47, 47, 0.15); color: #D32F2F; border-left: 3px solid #D32F2F;";
                }
                return `
                  <div style="padding: 6px 10px; border-radius: var(--radius-sm); ${optStyle}">
                    <strong>${letters[oIdx]}.</strong> ${opt}
                    ${oIdx === q.correctChoice ? ' <span style="font-size: 0.65rem; color: #2E7D32;">(Correct Answer)</span>' : ''}
                    ${q.userChoice === oIdx && !q.isCorrect ? ' <span style="font-size: 0.65rem; color: #D32F2F;">(Your Choice)</span>' : ''}
                  </div>
                `;
              }).join("")}
            </div>

            <!-- NCERT Faculty Explanation -->
            <div style="background: rgba(232, 163, 61, 0.08); border-left: 3px solid var(--brand-gold); padding: var(--spacing-2) var(--spacing-3); border-radius: var(--radius-sm); font-size: 0.72rem;">
              <strong style="color: var(--brand-gold); display: block; margin-bottom: 2px;">Faculty NCERT Solution:</strong>
              <p style="margin: 0; color: var(--color-text-secondary);">${q.explanation}</p>
              ${q.concept ? `<span style="display: inline-block; margin-top: 4px; font-size: 0.65rem; color: var(--color-text-accent);">📖 Topic: ${q.concept}</span>` : ''}
            </div>
          </div>
        `;
      }).join("");
    }

    // Retake Test Button
    const retakeBtn = document.getElementById("btn-retake-test");
    if (retakeBtn) {
      retakeBtn.onclick = () => {
        window.NotesWallahUI.closeModal("modal-test-result");
        this.openTestConfigModal(result.testId);
      };
    }

    window.NotesWallahUI.openModal("modal-test-result");
  }

  /**
   * Render Academic Challenges Screen (Screen 4)
   */
  renderChallenges(classId) {
    const container = document.getElementById("screen-challenges");
    if (!container) return;

    const normClass = window.NotesWallahDatabase.normalizeClassId(classId);
    const className = window.NotesWallahDatabase.formatClassName(normClass);
    const dailyChallenge = this.getDailyChallenge(normClass);

    // Check if student has answered today
    const auth = window.NotesWallahAuth;
    const currentUser = auth.getCurrentUser();
    const userId = currentUser ? currentUser.uid : "local_student";
    const savedAnswer = window.NotesWallahDatabase.getDailyChallengeAnswer(userId, dailyChallenge.id);

    const letters = ["A", "B", "C", "D"];
    const isAnswered = savedAnswer !== null;

    let challengeBodyHtml = "";
    if (isAnswered) {
      const isCorrect = savedAnswer === dailyChallenge.correct_index;
      challengeBodyHtml = `
        <div style="margin-top: var(--spacing-3);">
          <div style="padding: var(--spacing-3); border-radius: var(--radius-md); background: ${isCorrect ? 'rgba(46, 125, 50, 0.12)' : 'rgba(211, 47, 47, 0.12)'}; margin-bottom: var(--spacing-3);">
            <strong style="color: ${isCorrect ? '#2E7D32' : '#D32F2F'}; display: block; font-size: var(--font-size-sm); margin-bottom: 2px;">
              ${isCorrect ? '✓ Correct Answer! Well done.' : '✗ Incorrect choice.'}
            </strong>
            <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
              Your response was recorded for your daily study streak.
            </span>
          </div>

          <!-- Question statement -->
          <p style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-3); color: var(--color-text-primary);">
            ${dailyChallenge.question}
          </p>

          <!-- Options list with correct marked -->
          <div style="display: flex; flex-direction: column; gap: var(--spacing-2); margin-bottom: var(--spacing-3);">
            ${dailyChallenge.options.map((opt, oIdx) => {
              let style = "background: var(--color-bg-subtle); color: var(--color-text-secondary);";
              if (oIdx === dailyChallenge.correct_index) {
                style = "background: rgba(46, 125, 50, 0.15); color: #2E7D32; font-weight: var(--font-weight-bold); border-left: 3px solid #2E7D32;";
              } else if (savedAnswer === oIdx && !isCorrect) {
                style = "background: rgba(211, 47, 47, 0.15); color: #D32F2F; border-left: 3px solid #D32F2F;";
              }
              return `
                <div style="padding: 10px 14px; border-radius: var(--radius-sm); font-size: var(--font-size-xs); ${style}">
                  <strong>${letters[oIdx]}.</strong> ${opt}
                  ${oIdx === dailyChallenge.correct_index ? ' (Correct Answer)' : ''}
                </div>
              `;
            }).join("")}
          </div>

          <!-- Step-by-Step NCERT Faculty Solution -->
          <div style="background: rgba(232, 163, 61, 0.08); border-left: 3px solid var(--brand-gold); padding: var(--spacing-3); border-radius: var(--radius-md); font-size: var(--font-size-xs);">
            <strong style="color: var(--brand-gold); display: block; margin-bottom: 4px;">NCERT Faculty Solution & Concept:</strong>
            <p style="margin: 0; color: var(--color-text-secondary); line-height: 1.5;">${dailyChallenge.explanation}</p>
          </div>
        </div>
      `;
    } else {
      challengeBodyHtml = `
        <div style="margin-top: var(--spacing-3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2);">
            <span class="academic-badge" style="background: rgba(232, 163, 61, 0.15); color: var(--brand-gold);">
              ${dailyChallenge.topic}
            </span>
            <span style="font-size: 0.65rem; color: var(--color-text-secondary);">Faculty Curated</span>
          </div>

          <p style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-3); color: var(--color-text-primary);">
            ${dailyChallenge.question}
          </p>

          <div class="daily-challenge-options" style="display: flex; flex-direction: column; gap: var(--spacing-2); margin-bottom: var(--spacing-4);">
            ${dailyChallenge.options.map((opt, oIdx) => `
              <div class="choice-chip daily-opt-chip" data-opt-index="${oIdx}" style="padding: 10px 14px; width: 100%; justify-content: flex-start; text-align: left;">
                <strong style="margin-right: 8px;">${letters[oIdx]}.</strong> ${opt}
              </div>
            `).join("")}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.688rem; color: var(--color-text-secondary);">💡 Hint: ${dailyChallenge.hint}</span>
            <button type="button" class="btn btn-primary btn-sm" id="btn-submit-daily-challenge" disabled style="padding: 6px 16px;">
              Submit Answer
            </button>
          </div>
        </div>
      `;
    }

    const streak = window.NotesWallahDatabase.getAcademicStreak(userId);

    const challengesHtml = `
      <div class="section-title-row">
        <h3 class="section-title">Academic Challenges</h3>
        <span class="academic-badge" style="background: var(--brand-gold-subtle); color: var(--color-text-accent);">Curated</span>
      </div>

      <!-- Academic Streak Card (Strictly Zero XP) -->
      <div class="student-greeting-banner" style="margin-bottom: var(--spacing-4);">
        <div class="greeting-text-wrap">
          <h2 style="font-size: var(--font-size-base);">
            🔥 ${streak.streakDays} Day Study Streak
          </h2>
          <p style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">
            Solve daily conceptual questions to reinforce retention and board exam confidence.
          </p>
        </div>
        <span class="academic-badge status-connected" style="font-size: 0.688rem;">
          ${className}
        </span>
      </div>

      <!-- Daily Challenge Card -->
      <div class="feature-card challenge-card" style="border-left: 4px solid var(--brand-gold); margin-bottom: var(--spacing-4);">
        <div class="card-header-row">
          <span class="card-tag" style="color: var(--brand-navy-primary);">Daily Challenge</span>
          <span class="academic-badge" style="background: rgba(232, 163, 61, 0.12); color: var(--brand-gold);">Today's Problem</span>
        </div>
        <h4 class="card-title" style="margin-bottom: 2px;">Daily Conceptual Problem</h4>
        <p class="card-desc" style="font-size: var(--font-size-xs); margin-bottom: 0;">Faculty curated problem testing core NCERT textbook concepts.</p>
        
        ${challengeBodyHtml}
      </div>

      <!-- Weekly Mock Marathon Card -->
      <div class="feature-card challenge-card" style="border-left: 4px solid var(--brand-navy-primary);">
        <div class="card-header-row">
          <span class="card-tag">Weekly Challenge</span>
          <span class="academic-badge">Active</span>
        </div>
        <h4 class="card-title">Weekly Mock Marathon</h4>
        <p class="card-desc" style="font-size: var(--font-size-xs);">Comprehensive chapter retention practice scheduled for your syllabus.</p>
        
        <div style="margin-top: var(--spacing-3); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: var(--spacing-2);">
          <span style="font-size: var(--font-size-xs); color: var(--color-text-secondary);">⏱️ 20 Mins • 10 Questions</span>
          <button type="button" class="btn btn-secondary btn-sm btn-launch-weekly-test" data-test-id="test_c10_full_science" style="padding: 6px 14px; font-size: var(--font-size-xs);">
            Start Marathon
          </button>
        </div>
      </div>
    `;

    container.innerHTML = challengesHtml;
    this.bindChallengeEvents(container, classId, dailyChallenge.id);
  }

  /**
   * Bind event listeners for Challenges screen
   */
  bindChallengeEvents(container, classId, challengeId) {
    let selectedOption = null;
    const submitBtn = container.getElementById("btn-submit-daily-challenge");
    const optChips = container.querySelectorAll(".daily-opt-chip");

    optChips.forEach(chip => {
      chip.addEventListener("click", () => {
        optChips.forEach(c => c.classList.remove("selected"));
        chip.classList.add("selected");
        selectedOption = parseInt(chip.getAttribute("data-opt-index"), 10);
        if (submitBtn) submitBtn.disabled = false;
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        if (selectedOption === null) return;
        const auth = window.NotesWallahAuth;
        const currentUser = auth.getCurrentUser();
        const userId = currentUser ? currentUser.uid : "local_student";

        await window.NotesWallahDatabase.recordDailyChallengeAttempt(userId, challengeId, selectedOption);
        window.NotesWallahUI.showToast("Daily Challenge answer submitted!", "success");
        this.renderChallenges(classId);
      });
    }

    // Weekly challenge launch button
    const weeklyBtn = container.querySelector(".btn-launch-weekly-test");
    if (weeklyBtn) {
      weeklyBtn.addEventListener("click", () => {
        const testId = weeklyBtn.getAttribute("data-test-id");
        if (testId) {
          this.openTestConfigModal(testId);
        }
      });
    }
  }
}

window.NotesWallahTestEngine = new TestEngineService();
