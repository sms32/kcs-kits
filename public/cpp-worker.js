// Classic (non-module) worker that runs C++ with the JSCPP interpreter.
// Loaded by src/lib/cpp-runner.ts. Bump the ?v= number there when you edit this file.
importScripts("/jscpp/jscpp.js");

const MAX_OUTPUT = 20000; // characters; stops a runaway print loop

// Turns interpreter messages into something a student can act on.
function friendly(msg) {
  msg = String(msg || "Unknown error").replace(/^ERROR:\s*/, "");
  const lib = msg.match(/cannot find library:\s*(\S+)/);
  if (lib) {
    return (
      "#include <" + lib[1] + "> is not available in this judge. " +
      "Use only iostream, iomanip, cmath, cstring, cctype or cstdlib."
    );
  }
  if (/Parsing Failure/.test(msg)) {
    const line = msg.match(/line (\d+)/);
    return "Syntax error" + (line ? " near line " + line[1] : "") + ". Check for a missing ; or bracket.";
  }
  if (/Time limit exceeded/i.test(msg)) return "Time limit exceeded";
  return msg.split("\n")[0];
}

function runOne(code, input, limitMs) {
  let output = "";
  try {
    JSCPP.run(code, input, {
      stdio: {
        write: function (s) {
          output += s;
          if (output.length > MAX_OUTPUT) throw new Error("Output limit exceeded");
        },
      },
      maxTimeout: limitMs,
      unsigned_overflow: "ignore",
    });
    return { output: output, error: null };
  } catch (e) {
    return { output: output, error: friendly(e && e.message ? e.message : e) };
  }
}

self.onmessage = function (e) {
  const d = e.data;
  const results = d.inputs.map(function (inp) {
    return runOne(d.code, inp, d.limitMs);
  });
  self.postMessage({ type: "done", id: d.id, results: results });
};

self.postMessage({ type: "ready" });