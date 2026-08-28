export interface LearningObjective {
  id: string;
  text: string;
}

export interface KeyConcept {
  termAr: string;
  termEn?: string;
  definition: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  image?: {
    src: string;
    caption: string;
    alt?: string;
  };
  imagePlaceholder?: {
    title: string;
    description: string;
    caption: string;
  };
  notes?: CalloutBox[];
  subsections?: {
    title: string;
    content: string;
    items?: string[];
  }[];
}

export interface CalloutBox {
  id: string;
  type: "pause_and_reflect" | "important_note" | "key_terms" | "pro_tip" | "enrichment" | "hint";
  title: string;
  content: string;
  question?: string;
  sectionId?: string;
}

export interface EngineerChallenge {
  title: string;
  scenario: string;
  steps: {
    number: number;
    title: string;
    description: string;
    actionType: "collect_data" | "analyze_stakeholders" | "make_decision" | "diagnose_fault" | "choose_method";
    options?: string[];
  }[];
  hint: string;
}

export interface AppliedTask {
  title: string;
  scenario: string;
  prompt: string;
  sampleAnswer?: string;
}

export interface SolvedExampleItem {
  id: string;
  type: "mcq" | "true_false" | "matching";
  question: string;
  options?: { id: string; text: string }[];
  matchingPairs?: { left: string; right: string }[];
  correctAnswer: string | Record<string, string>;
  explanation: string;
}

export interface SolvedExample {
  title: string;
  items: SolvedExampleItem[];
}

export interface QuestionItem {
  id: string;
  type: "mcq" | "true_false" | "fill_blank" | "matching" | "essay";
  category: "check_understanding" | "read_and_answer" | "practice" | "exam_style";
  questionText: string;
  options?: { id: string; text: string }[];
  matchingPairs?: { id: string; left: string; right: string }[];
  correctAnswer: string | string[] | Record<string, string>;
  explanation?: string;
  marks?: number;
  rubricCriteria?: string[];
}

export interface Lesson {
  id: string;
  slug: string;
  number: string; // e.g. "1-1"
  chapterId: string;
  chapterNumber: number;
  title: string;
  englishTitle: string;
  pageRange: string; // e.g. "4 - 11"
  learningObjectives: string[];
  coreIdea: string;
  keyQuestion: string;
  learningPath: {
    previous?: string;
    current: string;
    next?: string;
  };
  exploreInPairs?: string;
  keyConcepts: KeyConcept[];
  sections: LessonSection[];
  callouts: CalloutBox[];
  engineerChallenge: EngineerChallenge;
  appliedTask: AppliedTask;
  solvedExample: SolvedExample;
  mainQuestionAnswer: string;
  summary: string[];
  challengeYourself: {
    reflect: string;
    challenge: string;
  };
  questions: QuestionItem[];
  simulatorId?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  description: string;
  colorTheme: string;
  icon: string;
  pageStart: number;
  pageEnd: number;
  lessons: Lesson[];
}

export interface GlossaryTerm {
  id: string;
  termAr: string;
  termEn: string;
  definitionAr: string;
  definitionEn?: string;
  chapterId: string;
  lessonNumber: string;
  category: "AI" | "Cybersecurity" | "WebDev" | "Design" | "General";
}

export interface AcronymTerm {
  short: string;
  fullEn: string;
  fullAr: string;
  descriptionAr: string;
  category: "Hardware" | "AI" | "Cybersecurity" | "Networking" | "WebDev" | "Design" | "General";
  lessonRef?: string;
}

export interface UserProgress {
  completedLessons: string[]; // lesson ids
  quizScores: Record<string, { score: number; total: number; date: string }>;
  bookmarks: string[]; // lesson ids
  notes: Record<string, string>; // lessonId -> note text
  streakDays: number;
  lastActiveDate: string;
  points: number;
  badges: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  grade: string;
  school?: string;
  avatar: string;
}

export interface SimulatorMeta {
  id: string;
  title: string;
  category: string;
  iconName?: string;
  color?: string;
  description: string;
  lessonNumber?: string;
  chapterNumber?: number;
}

export interface BookStats {
  totalChapters: number;
  totalLessons: number;
  totalSimulators: number;
  totalGlossaryTerms: number;
  totalAcronyms: number;
  totalExamQuestions: number;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  englishTitle: string;
  stage: string;
  grade: string;
  term: string;
  accreditation: string[];
  description: string;
  colorTheme?: string;
  icon?: string;
  chapters: Chapter[];
  glossary?: GlossaryTerm[];
  acronyms?: AcronymTerm[];
  simulators?: SimulatorMeta[];
}

