// Usage: node scripts/build-jscpp.mjs
// Bundles the JSCPP C++ interpreter into public/jscpp/jscpp.js so the browser
// worker can load it as a plain script. Run once after `npm i JSCPP esbuild`.
import { build } from "esbuild";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const entry = fileURLToPath(new URL("../node_modules/JSCPP/lib/commonjs.js", import.meta.url));
const outDir = fileURLToPath(new URL("../public/jscpp/", import.meta.url));

if (!existsSync(entry)) {
  console.error("JSCPP is not installed. Run: npm i JSCPP && npm i -D esbuild");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

// JSCPP's printf dependency asks for a few Node modules that a worker does not have.
const shims = {
  util: "module.exports={inspect:function(v){return typeof v==='string'?v:JSON.stringify(v)},format:function(){return Array.prototype.join.call(arguments,' ')}};",
  stream: "function Stream(){} module.exports={Stream:Stream};",
  fs: "module.exports={};",
};
const shimPlugin = {
  name: "node-shims",
  setup(b) {
    b.onResolve({ filter: /^(util|stream|fs)$/ }, (a) => ({ path: a.path, namespace: "shim" }));
    b.onLoad({ filter: /.*/, namespace: "shim" }, (a) => ({ contents: shims[a.path], loader: "js" }));
  },
};

await build({
  entryPoints: [entry],
  bundle: true,
  format: "iife",
  globalName: "JSCPP",
  platform: "browser",
  minify: true,
  plugins: [shimPlugin],
  outfile: outDir + "jscpp.js",
});
console.log("Built public/jscpp/jscpp.js");