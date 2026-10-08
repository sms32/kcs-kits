export type Tier = 1 | 2 | 3;
export type QType = "fix" | "complete" | "write";
export type Language = "python" | "cpp";

export interface BankQuestion {
  id: string;
  tier: Tier;
  type: QType;
  title: string;
  prompt: string;
  starterCode: string;
  sampleInput: string;
  sampleOutput: string;
  hiddenInputs: string[];
  hiddenOutputs: string[];
  solution: string;
  language?: Language; // missing = detected from the code (see questionLanguage)
}

// What a student may see (no hidden inputs, outputs, or solution)
export interface PublicQuestion {
  id: string;
  tier: Tier;
  type: QType;
  title: string;
  prompt: string;
  starterCode: string;
  sampleInput: string;
  sampleOutput: string;
  language?: Language;
}

export const TYPE_LABEL: Record<QType, string> = {
  fix: "Fix the bug",
  complete: "Complete the code",
  write: "Write the program",
};

export const TIER_LABEL = ["", "Easy", "Medium", "Hard"];

export const LANGUAGE_FILE: Record<Language, string> = {
  python: "main.py",
  cpp: "main.cpp",
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  python: "Python",
  cpp: "C++",
};

/**
 * Which language a question runs in. Uses the question's own `language` when
 * it is set, and otherwise guesses from the starter code, so old Python banks
 * and APIs that do not pass `language` through keep working.
 */
export function questionLanguage(q: { language?: Language; starterCode?: string }): Language {
  if (q.language === "cpp" || q.language === "python") return q.language;
  return /#include\s*<|\bint\s+main\s*\(/.test(q.starterCode ?? "") ? "cpp" : "python";
}

// Ignore trailing spaces and blank lines at the end
export const normalizeOutput = (s: string) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .trim();