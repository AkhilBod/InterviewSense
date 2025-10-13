export interface WordImprovementSuggestion {
  original: string;
  improved: string;
  severity: "red" | "yellow" | "green";
  category: "quantify_impact" | "communication" | "length_depth" | "drive" | "analytical" | "general";
  explanation: string;
  position?: {
    start: number;
    end: number;
  };
  textPosition?: {
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface WordAnalysisData {
  wordImprovements: WordImprovementSuggestion[];
  overallScore: number;
  severityBreakdown: {
    red: number;
    yellow: number;
    green: number;
  };
  categoryBreakdown: {
    quantify_impact: number;
    communication: number;
    length_depth: number;
    drive: number;
    analytical: number;
    general?: number;
  };
}

export interface ResumeAnalysisData {
  jobTitle: string;
  company?: string;
  overallScore: number;
  impactScore: number;
  styleScore: number;
  skillsScore: number;
  strengths: string[];
  improvementAreas: string[];
  analysis: string;
  fileType: string;
  resumeLength?: number;
  keywordMatch?: number;
  skillsCount?: number;
  atsCompatibility?: string;
}

export interface SpecificImprovementSuggestion {
  original: string;
  improved: string;
  severity: "red" | "yellow" | "green";
  category: "quantify_impact" | "communication" | "length_depth" | "drive" | "analytical";
  explanation: string;
  location: string;
}

export interface SpecificAnalysisData {
  specificImprovements: SpecificImprovementSuggestion[];
  overallScore: number;
  severityBreakdown: {
    red: number;
    yellow: number;
    green: number;
  };
  categoryBreakdown: {
    quantify_impact: number;
    communication: number;
    length_depth: number;
    drive: number;
    analytical: number;
  };
  improvementSummary: {
    criticalIssues: string;
    keyOpportunities: string;
    strengthsToKeep: string;
  };
}
