export const HERO_EVENTS = [
  { medium: "voice", detail: "02:47 — Emergency plumber call triaged, £80 call-out paid online" },
  { medium: "web", detail: "03:15 — Website quote form completed, auto-acknowledged by SMS" },
  { medium: "voice", detail: "09:12 — Garage overflow call answered, MOT booked from the live diary" },
  { medium: "web", detail: "21:08 — Web chat qualified, photos requested by SMS" },
  { medium: "voice", detail: "12:51 — Lunchtime caller helped while the desk was on another line" },
  { medium: "voice", detail: "17:34 — 'Just closed' call captured, quote request logged to CRM" },
  { medium: "web", detail: "23:40 — Late-night web enquiry answered, booking link sent" },
];

export const JOURNEY_STATIONS = [
  {
    number: "01",
    time: "18:42",
    meta: "STATION 01 · 18:42, TUESDAY",
    medium: "PHONE",
    title: "The enquiry arrives",
    body: "A landlord rings about a leaking boiler. You're mid-job, phone on silent. Normally, this is where the work is lost.",
    outcome: "✓ Nothing missed",
  },
  {
    number: "02",
    time: "18:42",
    meta: "STATION 02 · 18:42, SECONDS LATER",
    medium: "ASSISTANT",
    title: "Answered, immediately",
    body: "Your assistant picks up in your company's voice — takes the address, the symptoms and the urgency, and reassures them help is being arranged.",
    outcome: "✓ Answered · ✓ Reassured",
  },
  {
    number: "03",
    time: "18:44",
    meta: "STATION 03 · 18:44",
    medium: "QUALIFICATION",
    title: "Qualified and captured",
    body: "Emergency or routine? Tenant vulnerable? Access arranged? The right questions are asked, and the answers are written down properly — every time.",
    outcome: "✓ Qualified · ✓ Details complete",
  },
  {
    number: "04",
    time: "18:45",
    meta: "STATION 04 · 18:45",
    medium: "YOUR SYSTEMS",
    title: "In your CRM and diary — automatically",
    body: "The job appears in your CRM with everything attached, an 8:30am slot is booked into your calendar, and the customer gets a confirmation text.",
    outcome: "✓ CRM · ✓ Calendar · ✓ Confirmed by SMS",
  },
  {
    number: "05",
    time: "08:30",
    meta: "STATION 05 · 08:30, WEDNESDAY",
    medium: "OUTCOME",
    title: "You turn up and do the work",
    body: "No voicemail tennis, no lost details, no Sunday admin. The customer already trusts you — because you were the one who answered.",
    outcome: "✓ Won — while you were on another job",
  },
];

export const SECTORS = {
  garages: {
    label: "Garages & auto centres",
    heading: "For the workshop where the phone rings under a ramp",
    scenario: "Bookings arrive while every pair of hands is on a job. Cover means the call is answered, the DVSA record is checked, the slot is booked and the job sheet is written — before anyone's put a spanner down. Try it above.",
    covers: [
      { label: "The front", detail: "A site that looks like the standard of your workshop — and books MOTs itself" },
      { label: "The voice", detail: "Booking calls answered around the clock, vehicle details checked against DVSA" },
      { label: "The wiring", detail: "Diary, job sheets, reminders and MOT-due follow-ups running themselves" },
    ],
  },
  trades: {
    label: "Trades & home services",
    heading: "For the plumber mid-job when the big contract rings",
    scenario: "Your best marketing is being reachable. But you can't answer a phone from under a floor — and evening callers won't wait until tomorrow. Cover means the call is answered, the job is qualified and the slot is booked before you've washed your hands.",
    covers: [
      { label: "The front", detail: "A site that looks like the standard of your work — not a £300 template" },
      { label: "The voice", detail: "Emergency calls answered, triaged for safety, booked into your real diary" },
      { label: "The wiring", detail: "Job sheets, confirmations and follow-ups that write themselves" },
    ],
  },
  dental: {
    label: "Dental & medical",
    heading: "For the practice losing new patients to hold music",
    scenario: "Reception can't take three calls at once, and new-patient enquiries arrive at 9pm. Cover means every enquiry is answered in your practice's tone, bookings land in the diary you already use, and reminders quietly cut the no-show list.",
    covers: [
      { label: "The front", detail: "A site that reassures nervous patients and makes registering effortless" },
      { label: "The voice", detail: "After-hours booking, rescheduling and routine questions — handled" },
      { label: "The wiring", detail: "Diary, recalls and reminders joined up; compliance designed in, not bolted on" },
    ],
  },
  legal: {
    label: "Legal & professional",
    heading: "For the firm where a slow reply looks like a slow lawyer",
    scenario: "Prospective clients judge responsiveness before they ever judge advice. Cover means new enquiries get a considered first response in minutes, intake details are captured accurately, and fee-earner time stops going on admin.",
    covers: [
      { label: "The front", detail: "A site with the gravity of the firm — credible, precise, quietly confident" },
      { label: "The voice", detail: "Enquiries acknowledged and intake questions asked, correctly, first time" },
      { label: "The wiring", detail: "Clean handover into your case management — no retyping, no gaps" },
    ],
  },
};

export const CALL_SCRIPT = [
  {
    speaker: "agent",
    text: "Good morning — you've reached Riverside Auto Care. How can I help today?",
    audio: "media/hf_20260823_193934_baa2e9f7-1492-428b-83b6-3d6bbfc5d500.wav",
    status: "Incoming call answered — new enquiry opened",
  },
  {
    speaker: "customer",
    text: "Hi, I'd like to book my car in for a service and MOT please.",
    audio: "uploads/1.mp3",
    status: "Customer requesting a service & MOT booking",
  },
  {
    speaker: "agent",
    text: "Of course. The first slot I have for a combined service and MOT is Wednesday the 3rd of September at 8am. Shall I book that in?",
    audio: "media/hf_20260823_170239_d24f7f4a-5974-4b79-8fd8-4c29381a6555.wav",
    status: "Checking the diary — offering first available slot",
  },
  {
    speaker: "customer",
    text: "Yes, that works.",
    audio: "uploads/2.mp3",
    status: "Booking date confirmed by customer — slot held",
  },
  {
    speaker: "agent",
    text: "Could I take your full name and the best contact number for the booking?",
    audio: "media/hf_20260823_170239_f6ce5bbb-9c3f-438c-b626-b82dbc6f2454.wav",
    status: "Requesting customer name and contact number",
  },
  {
    speaker: "customer",
    text: "Daniel Carter — 07700 900123.",
    audio: "uploads/3.mp3",
    status: "Contact captured — creating customer record in the CRM",
  },
  {
    speaker: "agent",
    text: "Thanks, Daniel. And the vehicle registration?",
    audio: "media/hf_20260823_170239_4f9f1a2e-1737-460d-8b37-9d61c13e266a.wav",
    status: "Requesting vehicle registration",
  },
  {
    speaker: "customer",
    text: "It's AB12 CDE.",
    audio: "uploads/4.mp3",
    status: "Registration received — querying DVSA for MOT history and vehicle details",
  },
  {
    speaker: "agent",
    text: "Found it — a black BMW 320d. I can see your last MOT recorded two advisories — front brake discs and a nearside front tyre — so our technicians will check both during the service and speak to you before any extra work is done.",
    audio: "media/hf_20260823_170239_e8085d99-43e2-4358-8168-90510a827b44.wav",
    status: "DVSA lookup successful — colour, make, model and 2 advisories returned",
  },
  {
    speaker: "customer",
    text: "Perfect, thank you.",
    audio: "uploads/5.mp3",
    status: "Advisories noted on the job sheet",
  },
  {
    speaker: "agent",
    text: "You're all booked: service and MOT on Wednesday the 3rd of September. Drop the car off from 8am — we're open 8 till 5 — and an SMS message has been sent to your phone with all the booking details. Is there anything else I can help with?",
    audio: "media/hf_20260823_170239_fc38a189-4f02-4b23-8f21-9fce3b211f96.wav",
    status: "Booking confirmed — SMS with all details sent to customer's phone",
  },
  {
    speaker: "customer",
    text: "No, that's everything — thanks.",
    audio: "uploads/6.mp3",
    status: "Checking records — vehicle known to us, appending booking to its existing vehicle card",
  },
  {
    speaker: "agent",
    text: "You're very welcome, Daniel. We'll see you and the BMW on Wednesday morning. Goodbye.",
    audio: "media/hf_20260823_170326_30424755-5269-4762-b4d1-157d7b2f7784.wav",
    status: "Thanking customer and closing the call",
  },
];

export const CALL_DIAL_NUMBER = "0161 496 0000";

export function nextDialFrame(index) {
  const nextIndex = Math.min(CALL_DIAL_NUMBER.length, Math.max(0, Number(index) || 0) + 1);
  return {
    text: CALL_DIAL_NUMBER.slice(0, nextIndex),
    nextIndex,
    complete: nextIndex >= CALL_DIAL_NUMBER.length,
  };
}

export function nextTypedFrame(text, index) {
  const source = String(text ?? "");
  const nextIndex = Math.min(source.length, Math.max(0, Number(index) || 0) + 2);
  return {
    text: source.slice(0, nextIndex),
    nextIndex,
    complete: nextIndex >= source.length,
  };
}

export function callTypingInterval(durationSeconds, textLength) {
  const duration = Number(durationSeconds);
  const length = Math.max(1, Math.ceil((Number(textLength) || 0) / 2));
  if (!Number.isFinite(duration) || duration <= 0) return 34;
  return Math.max(14, (duration * 1000 - 600) / length);
}

export function callPresentation(phase, speaker) {
  const playing = phase === "playing";
  return {
    showDialler: phase === "dialling" || phase === "connecting",
    showConnectedCall: phase === "playing" || phase === "ending" || phase === "done",
    showStop: phase === "dialling" || phase === "connecting" || phase === "playing" || phase === "ending",
    showReplay: phase === "done",
    customerSpeaking: playing && speaker === "customer",
    agentSpeaking: playing && speaker === "agent",
  };
}

export function nextLayerForVisibility(currentLayer, isIntersecting) {
  const layer = Number(currentLayer);
  if (isIntersecting && layer < 0) return 0;
  if (!isIntersecting && layer > 0) return 0;
  return layer;
}

export function nextHeroState(state) {
  const eventIndex = (state.eventIndex + 1) % HERO_EVENTS.length;
  const nextEvent = HERO_EVENTS[eventIndex];
  return {
    eventIndex,
    web: state.web + (nextEvent.medium === "web" ? 1 : 0),
    voice: state.voice + (nextEvent.medium === "voice" ? 1 : 0),
  };
}

export function validateAssessment(values) {
  const fields = {};
  const required = ["name", "businessName", "phone", "email"];

  for (const field of required) {
    const value = String(values[field] ?? "").trim();
    if (!value || (field === "email" && !/.+@.+\..+/.test(value))) {
      fields[field] = true;
    }
  }

  const enquiryType = !String(values.enquiryType ?? "").trim();
  const consent = values.consent !== true;

  return {
    fields,
    enquiryType,
    consent,
    valid: Object.keys(fields).length === 0 && !enquiryType && !consent,
  };
}

export function formatCallClock(seconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
