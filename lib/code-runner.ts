import { runPython, warmUpPython, type PyResult } from "./py-runner";
import { runCpp, warmUpCpp } from "./cpp-runner";
import type { Language } from "./relay";

export type CodeResult = PyResult;

/** Runs `code` once per input in the given language. One result per input, in order. */
export function runCode(
  language: Language,
  code: string,
  inputs: string[],
  timeoutMs = 10000
): Promise<CodeResult[]> {
  return language === "cpp"
    ? runCpp(code, inputs, timeoutMs)
    : runPython(code, inputs, timeoutMs);
}

/** Starts loading the interpreter early. Pass a language to load only that one. */
export function warmUpRunners(language?: Language): Promise<void> {
  const jobs: Promise<void>[] = [];
  if (!language || language === "python") jobs.push(warmUpPython());
  if (!language || language === "cpp") jobs.push(warmUpCpp());
  return Promise.all(jobs).then(() => undefined);
}