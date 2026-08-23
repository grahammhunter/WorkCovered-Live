import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_EVENTS,
  JOURNEY_STATIONS,
  SECTORS,
  CALL_SCRIPT,
  CALL_DIAL_NUMBER,
  callPresentation,
  callTypingInterval,
  nextHeroState,
  nextDialFrame,
  nextLayerForVisibility,
  nextTypedFrame,
  validateAssessment,
  formatCallClock,
} from "../assets/js/site-data.js";

test("the parity data contains every current interactive sequence", () => {
  assert.equal(HERO_EVENTS.length, 7);
  assert.equal(JOURNEY_STATIONS.length, 5);
  assert.deepEqual(Object.keys(SECTORS), ["garages", "trades", "dental", "legal"]);
  assert.equal(CALL_SCRIPT.length, 13);
});

test("hero counts increment according to the next event medium", () => {
  assert.deepEqual(nextHeroState({ eventIndex: 0, web: 61, voice: 82 }), {
    eventIndex: 1,
    web: 62,
    voice: 82,
  });
});

test("assessment validation identifies missing required values", () => {
  const result = validateAssessment({
    name: "",
    businessName: "",
    phone: "",
    email: "invalid",
    enquiryType: "",
    consent: false,
  });
  assert.deepEqual(Object.keys(result.fields), ["name", "businessName", "phone", "email"]);
  assert.equal(result.enquiryType, true);
  assert.equal(result.consent, true);
  assert.equal(result.valid, false);
});

test("assessment validation accepts a complete enquiry", () => {
  const result = validateAssessment({
    name: "Alex Smith",
    businessName: "Smith Heating",
    phone: "07700 900123",
    email: "alex@example.com",
    enquiryType: "website",
    consent: true,
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.fields, {});
  assert.equal(result.enquiryType, false);
  assert.equal(result.consent, false);
});

test("call clock uses mm:ss formatting", () => {
  assert.equal(formatCallClock(0), "00:00");
  assert.equal(formatCallClock(65), "01:05");
});

test("dialling reveals the Riverside number one character at a time", () => {
  assert.deepEqual(nextDialFrame(0), {
    text: "0",
    nextIndex: 1,
    complete: false,
  });
  assert.deepEqual(nextDialFrame(CALL_DIAL_NUMBER.length - 1), {
    text: CALL_DIAL_NUMBER,
    nextIndex: CALL_DIAL_NUMBER.length,
    complete: true,
  });
});

test("transcript typing advances two characters and finishes on the full sentence", () => {
  assert.deepEqual(nextTypedFrame("Hello", 0), {
    text: "He",
    nextIndex: 2,
    complete: false,
  });
  assert.deepEqual(nextTypedFrame("Hello", 4), {
    text: "Hello",
    nextIndex: 5,
    complete: true,
  });
});

test("transcript typing is synchronised to audio with the original fallback", () => {
  assert.equal(callTypingInterval(undefined, 70), 34);
  assert.equal(callTypingInterval(0.2, 70), 14);
  assert.equal(callTypingInterval(8, 70), (8000 - 600) / 35);
});

test("in-progress call phases expose Stop but not Replay", () => {
  assert.deepEqual(callPresentation("dialling", null), {
    showDialler: true,
    showConnectedCall: false,
    showStop: true,
    showReplay: false,
    customerSpeaking: false,
    agentSpeaking: false,
  });
  assert.deepEqual(callPresentation("playing", "customer"), {
    showDialler: false,
    showConnectedCall: true,
    showStop: true,
    showReplay: false,
    customerSpeaking: true,
    agentSpeaking: false,
  });
});

test("completed calls expose Replay with every speaking effect disabled", () => {
  assert.deepEqual(callPresentation("ending", "agent"), {
    showDialler: false,
    showConnectedCall: true,
    showStop: true,
    showReplay: false,
    customerSpeaking: false,
    agentSpeaking: false,
  });
  assert.deepEqual(callPresentation("done", "agent"), {
    showDialler: false,
    showConnectedCall: true,
    showStop: false,
    showReplay: true,
    customerSpeaking: false,
    agentSpeaking: false,
  });
});

test("the layer stack opens on entry and resets to the front after exit", () => {
  assert.equal(nextLayerForVisibility(-1, true), 0);
  assert.equal(nextLayerForVisibility(2, false), 0);
  assert.equal(nextLayerForVisibility(1, true), 1);
  assert.equal(nextLayerForVisibility(0, false), 0);
});
