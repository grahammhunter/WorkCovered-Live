import {
  CALL_SCRIPT,
  HERO_EVENTS,
  JOURNEY_STATIONS,
  SECTORS,
  formatCallClock,
  nextHeroState,
  validateAssessment,
} from "./site-data.mjs";

const state = {
  hero: { eventIndex: 0, web: 61, voice: 82 },
  layer: 0,
  station: 0,
  sector: "garages",
  previewOutcome: "success",
  call: {
    active: false,
    seconds: 0,
    audio: null,
    timers: new Set(),
    intervals: new Set(),
  },
};

let initialTheatreMarkup = "";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function schedule(callback, delay) {
  const timer = window.setTimeout(() => {
    state.call.timers.delete(timer);
    callback();
  }, delay);
  state.call.timers.add(timer);
  return timer;
}

function repeat(callback, delay) {
  const interval = window.setInterval(callback, delay);
  state.call.intervals.add(interval);
  return interval;
}

function updateHero() {
  const web = document.querySelector("#hero-web-count");
  const voice = document.querySelector("#hero-voice-count");
  const event = document.querySelector("#hero-event");
  if (!web || !voice || !event) return;

  web.textContent = String(state.hero.web);
  voice.textContent = String(state.hero.voice);
  event.textContent = `▸ ${HERO_EVENTS[state.hero.eventIndex].detail}`;
}

function advanceHero() {
  state.hero = nextHeroState(state.hero);
  updateHero();
}

function updateLayer(index = state.layer) {
  state.layer = Math.max(0, Math.min(2, Number(index)));

  document.querySelectorAll("#layers [role='tab'][data-action='select-layer']").forEach((button) => {
    const active = Number(button.dataset.index) === state.layer;
    button.setAttribute("aria-selected", String(active));
    button.style.borderColor = active ? "#D9A441" : "rgba(237,236,225,.2)";
    button.style.background = active ? "#D9A441" : "none";
    button.style.color = active ? "#0F1A15" : "rgba(237,236,225,.65)";
  });

  document.querySelectorAll("#layers .layer-panel").forEach((panel, panelIndex) => {
    const active = panelIndex === state.layer;
    panel.style.opacity = active ? "1" : "0";
    panel.style.transform = active ? "translateY(0)" : "translateY(12px)";
    panel.style.pointerEvents = active ? "auto" : "none";
    panel.setAttribute("aria-hidden", String(!active));
  });

  const planes = [...document.querySelectorAll("#layers .layer-plane")];
  planes.forEach((plane, planeIndex) => {
    const active = planeIndex === state.layer;
    const rank = planes.filter((_, candidate) => candidate !== state.layer).indexOf(plane);
    plane.style.top = active ? "3.2rem" : `${11.4 + rank * 2.6}rem`;
    plane.style.zIndex = active ? "4" : String(2 - rank);
    plane.style.transform = `rotateX(55deg) rotateZ(-38deg) translateZ(${active ? "1.3rem" : "0rem"})`;
    plane.style.filter = active ? "none" : "brightness(.38) saturate(.5)";
    plane.style.borderColor = active ? "#D9A441" : "rgba(237,236,225,.14)";
    plane.style.boxShadow = active
      ? "0 34px 70px -24px rgba(0,0,0,.7), 0 0 40px -8px rgba(217,164,65,.3)"
      : "0 18px 40px -22px rgba(0,0,0,.6)";
  });
}

function renderJourney(index = state.station) {
  state.station = Math.max(0, Math.min(JOURNEY_STATIONS.length - 1, Number(index)));
  const station = JOURNEY_STATIONS[state.station];

  document.querySelectorAll("#journey [role='tab']").forEach((button, buttonIndex) => {
    const active = buttonIndex === state.station;
    button.setAttribute("aria-selected", String(active));
    button.style.background = active ? "#1D3026" : "#16241D";
    button.style.borderColor = active ? "#B98A2E" : "rgba(237,236,225,.1)";
    button.style.borderTopColor = active ? "#D9A441" : "rgba(237,236,225,.14)";
    button.style.transform = active ? "translateY(-4px)" : "none";
  });

  const panel = document.querySelector("#journey-panel");
  if (!panel) return;
  panel.setAttribute("aria-labelledby", `journey-tab-${state.station}`);
  panel.innerHTML = `
    <div class="journey-meta"><span>${escapeHtml(station.meta)}</span><span>${escapeHtml(station.medium)}</span></div>
    <h3>${escapeHtml(station.title)}</h3>
    <p>${escapeHtml(station.body)}</p>
    <p class="journey-outcome">${escapeHtml(station.outcome)}</p>
  `;
  panel.style.animation = "none";
  window.requestAnimationFrame(() => {
    panel.style.animation = "wcMsgIn .45s cubic-bezier(.22,.8,.24,1) both";
  });
}

function renderSector(key = state.sector) {
  if (!SECTORS[key]) return;
  state.sector = key;
  const sector = SECTORS[key];

  document.querySelectorAll("[data-action='select-sector']").forEach((button) => {
    const active = button.dataset.sector === key;
    button.setAttribute("aria-selected", String(active));
    button.style.borderColor = active ? "#8A6620" : "rgba(15,26,21,.3)";
    button.style.background = active ? "#0F1A15" : "none";
    button.style.color = active ? "#EDECE1" : "rgba(15,26,21,.7)";
  });

  const panel = document.querySelector("#sector-panel");
  const heading = document.querySelector("#sector-heading");
  const scenario = document.querySelector("#sector-scenario");
  const covers = document.querySelector("#sector-covers");
  if (!panel || !heading || !scenario || !covers) return;

  panel.setAttribute("aria-labelledby", `sector-tab-${key}`);
  heading.textContent = sector.heading;
  scenario.textContent = sector.scenario;
  covers.innerHTML = sector.covers.map((cover) => `
    <li>
      <span class="sector-cover-label">${escapeHtml(cover.label)}</span><br>
      <span class="sector-cover-detail">${escapeHtml(cover.detail)}</span>
    </li>
  `).join("");
}

function activeCallMarkup() {
  return `
    <div class="call-stage">
      <div class="call-visual">
        <div class="call-visual-topline">
          <span id="call-caption">CONNECTED</span>
          <button type="button" data-action="stop-call" aria-label="Stop the demo call"><span aria-hidden="true"></span>Stop demo</button>
        </div>
        <div class="call-speakers" aria-label="Current call speakers">
          <div class="call-speaker" data-speaker="customer">
            <div class="call-phone" aria-hidden="true"><span></span><strong>Riverside<br>Auto Care</strong><time id="call-clock">00:00</time></div>
            <small>CUSTOMER</small>
          </div>
          <div class="call-flow" aria-hidden="true"><span></span></div>
          <div class="call-speaker" data-speaker="agent">
            <div class="agent-orb" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            <small>AI AGENT</small>
          </div>
        </div>
      </div>
      <div class="call-webchat">
        <div class="call-webchat-header"><span class="status-dot"></span> Riverside Auto Care <small>WEB CHAT, SAME BRAIN</small></div>
        <div id="call-transcript" class="call-transcript" aria-live="polite"></div>
        <div class="call-webchat-footer">SAME SCRIPT · SAME BOOKING ENGINE · TWO FRONT DOORS</div>
      </div>
    </div>
    <div id="call-status" class="call-status" aria-live="polite">▸ Incoming call connecting…</div>
  `;
}

function setActiveSpeaker(speaker) {
  document.querySelectorAll(".call-speaker").forEach((element) => {
    element.classList.toggle("is-speaking", element.dataset.speaker === speaker);
  });
  const caption = document.querySelector("#call-caption");
  if (caption) caption.textContent = speaker === "customer" ? "CUSTOMER SPEAKING →" : "← AGENT SPEAKING";
}

function appendTranscript(line) {
  const transcript = document.querySelector("#call-transcript");
  if (!transcript) return;
  const bubble = document.createElement("p");
  bubble.className = line.speaker === "customer" ? "customer-message" : "agent-message";
  bubble.textContent = line.text;
  transcript.append(bubble);
  transcript.scrollTop = transcript.scrollHeight;
}

function finishCall() {
  if (!state.call.active) return;
  const caption = document.querySelector("#call-caption");
  const status = document.querySelector("#call-status");
  if (caption) caption.textContent = "CALL COMPLETE — BOOKED · LOGGED · SMS CONFIRMED";
  if (status) {
    status.innerHTML = `
      <div class="call-outcomes">
        <span>✓ Booked — Wed 3 Sep</span>
        <span>✓ DVSA checked — 2 advisories noted</span>
        <span>✓ SMS sent with booking details</span>
        <span>✓ Appended to existing vehicle card</span>
      </div>
    `;
  }
  document.querySelectorAll(".call-speaker").forEach((element) => element.classList.remove("is-speaking"));
}

function playCallLine(index) {
  if (!state.call.active) return;
  if (index >= CALL_SCRIPT.length) {
    finishCall();
    return;
  }

  const line = CALL_SCRIPT[index];
  setActiveSpeaker(line.speaker);
  const status = document.querySelector("#call-status");
  if (status) status.textContent = `▸ ${line.status}`;

  const audio = state.call.audio ?? new Audio();
  state.call.audio = audio;
  let advanced = false;
  const advance = () => {
    if (advanced || !state.call.active) return;
    advanced = true;
    appendTranscript(line);
    schedule(() => playCallLine(index + 1), 450);
  };

  audio.onended = advance;
  audio.onerror = () => schedule(advance, Math.max(1600, line.text.length * 20));
  audio.src = line.audio;
  audio.play().catch(() => schedule(advance, Math.max(1600, line.text.length * 20)));
}

function startCall() {
  if (state.call.active) return;
  const body = document.querySelector("#call-theatre-body");
  if (!body) return;

  state.call.active = true;
  state.call.seconds = 0;
  body.removeAttribute("style");
  body.innerHTML = activeCallMarkup();
  repeat(() => {
    state.call.seconds += 1;
    const clock = document.querySelector("#call-clock");
    if (clock) clock.textContent = formatCallClock(state.call.seconds);
  }, 1000);
  playCallLine(0);
}

function stopCall(reset = true) {
  state.call.active = false;
  for (const timer of state.call.timers) window.clearTimeout(timer);
  for (const interval of state.call.intervals) window.clearInterval(interval);
  state.call.timers.clear();
  state.call.intervals.clear();

  if (state.call.audio) {
    state.call.audio.onended = null;
    state.call.audio.onerror = null;
    state.call.audio.pause();
    state.call.audio.currentTime = 0;
  }

  if (reset) {
    const body = document.querySelector("#call-theatre-body");
    if (body) {
      body.innerHTML = initialTheatreMarkup;
      body.style.minHeight = "29rem";
      body.style.display = "flex";
      body.style.flexDirection = "column";
      body.style.alignItems = "center";
      body.style.justifyContent = "center";
      body.style.gap = "1.4rem";
      body.style.padding = "2rem";
      body.style.textAlign = "center";
    }
  }
}

function showFieldError(name, visible) {
  const field = document.querySelector(`[name='${name}']`);
  const error = document.querySelector(`#error-${name}`);
  if (field) {
    field.style.borderColor = visible ? "#A64A37" : "rgba(237,236,225,.18)";
    field.setAttribute("aria-invalid", String(visible));
  }
  if (error) error.hidden = !visible;
}

function showFormFeedback(outcome) {
  const form = document.querySelector("#assessment-form");
  const feedback = document.querySelector("#form-feedback");
  const title = document.querySelector("#form-feedback-title");
  const copy = document.querySelector("#form-feedback-copy");
  const icon = feedback?.querySelector(".form-feedback-icon");
  if (!form || !feedback || !title || !copy || !icon) return;

  const success = outcome === "success";
  form.classList.add("is-complete");
  feedback.hidden = false;
  feedback.setAttribute("role", success ? "status" : "alert");
  feedback.classList.toggle("is-error", !success);
  icon.textContent = success ? "✓" : "!";
  title.textContent = success ? "Consider it covered." : "That didn't go through.";
  copy.textContent = success
    ? "Thanks. We'll be in touch within one working day to arrange your cover assessment."
    : "No details have been sent. Please try again, or contact us directly if the problem continues.";
  const reset = feedback.querySelector("[data-action='reset-form']");
  if (reset) reset.textContent = success ? "Send another enquiry" : "Try again";
}

function handleAssessmentSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  values.consent = Boolean(form.querySelector("input[type='checkbox']")?.checked);
  const result = validateAssessment(values);

  for (const field of ["name", "businessName", "phone", "email"]) {
    showFieldError(field, Boolean(result.fields[field]));
  }
  showFieldError("enquiryType", result.enquiryType);
  const consentError = document.querySelector("#error-consent");
  if (consentError) consentError.hidden = !result.consent;

  if (!result.valid) {
    form.querySelector("[aria-invalid='true']")?.focus();
    return;
  }

  const submit = form.querySelector("[data-action='submit-assessment']");
  if (submit) {
    submit.disabled = true;
    submit.textContent = "Sending…";
  }
  window.setTimeout(() => showFormFeedback(state.previewOutcome), 1400);
}

function resetForm() {
  const form = document.querySelector("#assessment-form");
  const feedback = document.querySelector("#form-feedback");
  if (!form || !feedback) return;
  form.classList.remove("is-complete");
  feedback.hidden = true;
  const submit = form.querySelector("[data-action='submit-assessment']");
  if (submit) {
    submit.disabled = false;
    submit.textContent = "Book my cover assessment";
  }
}

function setPreviewOutcome(outcome) {
  state.previewOutcome = outcome === "error" ? "error" : "success";
  document.querySelectorAll("[data-action='set-preview']").forEach((button) => {
    const active = button.dataset.outcome === state.previewOutcome;
    button.style.borderColor = active ? "#D9A441" : "rgba(237,236,225,.25)";
    button.style.color = active ? "#D9A441" : "rgba(237,236,225,.5)";
    button.style.background = active ? "rgba(217,164,65,.1)" : "none";
  });
}

function handleClick(event) {
  const control = event.target.closest("[data-action]");
  if (!control) return;

  switch (control.dataset.action) {
    case "select-layer":
      updateLayer(control.dataset.index);
      break;
    case "select-station":
      renderJourney(control.dataset.index);
      break;
    case "select-sector":
      renderSector(control.dataset.sector);
      break;
    case "start-call":
      startCall();
      break;
    case "stop-call":
      stopCall();
      break;
    case "set-preview":
      setPreviewOutcome(control.dataset.outcome);
      break;
    case "reset-form":
      resetForm();
      break;
  }
}

function initializeSite() {
  const theatreBody = document.querySelector("#call-theatre-body");
  initialTheatreMarkup = theatreBody?.innerHTML ?? "";

  updateHero();
  updateLayer(0);
  renderJourney(0);
  renderSector("garages");
  setPreviewOutcome("success");

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[role='button'][data-action]")) {
      event.preventDefault();
      event.target.click();
    }
  });
  document.querySelector("#assessment-form")?.addEventListener("submit", handleAssessmentSubmit);
  window.setInterval(advanceHero, 3400);

  const theatre = document.querySelector("#call-theatre");
  if (theatre && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting && state.call.active) stopCall();
    }, { threshold: 0.15 });
    observer.observe(theatre);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
} else {
  initializeSite();
}
