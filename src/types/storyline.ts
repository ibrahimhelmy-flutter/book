export interface StoryMilestone {
  id: string;
  stageNumber: number;
  badge: string;
  title: string;
  crisis: {
    title: string;
    description: string;
    realWorldScenario?: string;
  };
  breakthrough: {
    title: string;
    description: string;
    logicalInsight: string;
  };
  concept: {
    termAr: string;
    termEn: string;
    definition: string;
    howItWorks: string;
    officialPage?: number;
  };
  diagramType:
    | "open-channel"
    | "symmetric-crisis"
    | "asymmetric-keys"
    | "digital-certificate-signature"
    | "tls-handshake"
    | "mfa-factors"
    | "ecommerce-symphony"
    | string;
  diagramCaption: string;
  nextDilemma: {
    title: string;
    hook: string;
  };
}

export interface DefenseMatrixItem {
  stepNumber: number;
  userAction: string;
  underTheHoodTech: string;
  threatNeutralized: string;
}

export interface GrandFinale {
  title: string;
  subtitle: string;
  scenarioTitle: string;
  scenarioStory: string;
  defenseMatrix: DefenseMatrixItem[];
  curriculumTakeaway: string;
}

export interface LessonStoryline {
  lessonId: string;
  lessonSlug: string;
  lessonNumber: string;
  chapterId: string;
  title: string;
  subtitle: string;
  heroHook: {
    headline: string;
    leadParagraph: string;
    theCoreQuestion: string;
  };
  milestones: StoryMilestone[];
  grandFinale: GrandFinale;
}
