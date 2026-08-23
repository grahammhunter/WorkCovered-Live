import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { CALL_SCRIPT } from "../assets/js/site-data.mjs";

test("every call-theatre audio asset exists", async () => {
  await Promise.all(CALL_SCRIPT.map((line) => access(new URL(`../${line.audio}`, import.meta.url))));
});

test("HTML exposes every native interaction control", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const action of [
    "select-layer",
    "select-station",
    "select-sector",
    "start-call",
    "stop-call",
    "submit-assessment",
  ]) {
    assert.match(html, new RegExp(`data-action=["']${action}["']`));
  }
});

test("native controller implements each parity interaction", async () => {
  const script = await readFile(new URL("../assets/js/site.js", import.meta.url), "utf8");
  for (const functionName of [
    "updateHero",
    "updateLayer",
    "renderJourney",
    "renderSector",
    "startCall",
    "stopCall",
    "handleAssessmentSubmit",
  ]) {
    assert.match(script, new RegExp(`function ${functionName}\\b`), `missing ${functionName}`);
  }
});

test("production controller contains no external submission or AI endpoint", async () => {
  const script = await readFile(new URL("../assets/js/site.js", import.meta.url), "utf8");
  assert.equal(/fetch\s*\(/.test(script), false);
  assert.equal(/anthropic|claude|openai/i.test(script), false);
});
