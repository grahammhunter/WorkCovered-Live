import test from "node:test";
import assert from "node:assert/strict";
import {
  HERO_EVENTS,
  JOURNEY_STATIONS,
  SECTORS,
  CALL_SCRIPT,
  nextHeroState,
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
