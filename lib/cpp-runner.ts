import type { PyResult } from "./py-runner";

// Bump the number after ?v= whenever you change public/cpp-worker.js.
const WORKER_URL = "/cpp-worker.js?v=1";
const PER_RUN_CAP_MS = 4000; // one run of one input never gets more than this

let worker: Worker | null = null;
let workerReady: Promise<Worker> | null = null;
let nextId = 1;
// Runs are serialized: one job at a time on the single worker.
let chain: Promise<unknown> = Promise.resolve();

function resetWorker(w?: Worker) {
  if (w && w !== worker) return;
  worker?.terminate();
  worker = null;
  workerReady = null;
}

function getWorker(): Promise<Worker> {
  if (workerReady) return workerReady;

  // Classic worker: it loads the interpreter with importScripts().
  const w = new Worker(WORKER_URL);
  worker = w;

  workerReady = new Promise<Worker>((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "ready") {
        cleanup();
        resolve(w);
      }
    };
    const onError = (e: ErrorEvent) => {
      cleanup();
      resetWorker(w);
      reject(new Error(e.message || "Worker failed to start (check /jscpp/jscpp.js loads)"));
    };
    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
  });

  return workerReady;
}

function allFail(inputs: string[], error: string): PyResult[] {
  return inputs.map(() => ({ output: "", error }));
}

async function runOnce(code: string, inputs: string[], timeoutMs: number): Promise<PyResult[]> {
  let w: Worker;
  try {
    w = await getWorker();
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    return allFail(inputs, `C++ could not start: ${m}`);
  }

  // The interpreter stops each run itself (limitMs). The timer below is only a
  // safety net that kills the worker if it ever stops answering.
  const limitMs = Math.min(
    PER_RUN_CAP_MS,
    Math.max(500, Math.floor(timeoutMs / Math.max(inputs.length, 1)) - 300)
  );

  return new Promise<PyResult[]>((resolve) => {
    const id = nextId++;

    const finish = (results: PyResult[]) => {
      clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
      resolve(results);
    };
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (d?.type === "done" && d.id === id) finish(d.results as PyResult[]);
    };
    const onError = (e: ErrorEvent) => {
      resetWorker(w);
      finish(allFail(inputs, `C++ worker crashed: ${e.message || "unknown error"}`));
    };
    const timer = setTimeout(() => {
      resetWorker(w);
      finish(allFail(inputs, "Time limit exceeded"));
    }, timeoutMs + 2000);

    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ id, code, inputs, limitMs });
  });
}

/** Runs `code` once per entry in `inputs` (each entry is the full stdin text). */
export function runCpp(code: string, inputs: string[], timeoutMs = 10000): Promise<PyResult[]> {
  const job = chain.then(() => runOnce(code, inputs, timeoutMs));
  chain = job.catch(() => undefined);
  return job;
}

export function warmUpCpp(): Promise<void> {
  return getWorker().then(
    () => undefined,
    () => undefined
  );
}