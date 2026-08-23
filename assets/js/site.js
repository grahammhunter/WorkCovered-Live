import {
  CALL_SCRIPT,
  CALL_DIAL_NUMBER,
  HERO_EVENTS,
  JOURNEY_STATIONS,
  SECTORS,
  callPresentation,
  callTypingInterval,
  formatCallClock,
  nextDialFrame,
  nextHeroState,
  nextLayerForVisibility,
  nextTypedFrame,
  validateAssessment,
} from "./site-data.js?v=20260823-call-parity-2";

const state = {
  hero: { eventIndex: 0, web: 61, voice: 82 },
  layer: -1,
  station: 0,
  sector: "garages",
  previewOutcome: "success",
  call: {
    phase: "idle",
    speaker: null,
    dialIndex: 0,
    seconds: 0,
    audio: null,
    clockInterval: null,
    dialInterval: null,
    typingInterval: null,
    statusInterval: null,
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

function clearScheduled(timer) {
  if (timer == null) return;
  window.clearTimeout(timer);
  state.call.timers.delete(timer);
}

function clearRepeated(interval) {
  if (interval == null) return;
  window.clearInterval(interval);
  state.call.intervals.delete(interval);
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
  const requestedLayer = Number(index);
  state.layer = requestedLayer < 0 ? -1 : Math.max(0, Math.min(2, requestedLayer));
  const selectedLayer = Math.max(0, state.layer);

  document.querySelectorAll("#layers [role='tab'][data-action='select-layer']").forEach((button) => {
    const active = Number(button.dataset.index) === selectedLayer;
    button.setAttribute("aria-selected", String(active));
    button.style.borderColor = active ? "#D9A441" : "rgba(237,236,225,.2)";
    button.style.background = active ? "#D9A441" : "none";
    button.style.color = active ? "#0F1A15" : "rgba(237,236,225,.65)";
  });

  document.querySelectorAll("#layers .layer-panel").forEach((panel, panelIndex) => {
    const active = panelIndex === selectedLayer;
    panel.style.opacity = active ? "1" : "0";
    panel.style.transform = active ? "translateY(0)" : "translateY(12px)";
    panel.style.pointerEvents = active ? "auto" : "none";
    panel.setAttribute("aria-hidden", String(!active));
  });

  const planes = [...document.querySelectorAll("#layers .layer-plane")];
  planes.forEach((plane, planeIndex) => {
    if (state.layer < 0) {
      plane.style.top = `${3.6 + planeIndex * 2.2}rem`;
      plane.style.zIndex = String(3 - planeIndex);
      plane.style.transform = "rotateX(55deg) rotateZ(-38deg) translateZ(0rem)";
      plane.style.filter = "brightness(.6) saturate(.7)";
      plane.style.borderColor = "rgba(237,236,225,.16)";
      plane.style.boxShadow = "0 22px 46px -22px rgba(0,0,0,.55)";
      return;
    }

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
    <div id="call-stage" class="call-stage is-dialling">
      <div class="call-visual">
        <div class="call-speakers" aria-label="Current call speakers">
          <div class="call-party call-customer" data-speaker="customer">
            <div class="call-phone-entry">
              <div class="call-phone-scale">
                <div class="call-phone" aria-hidden="true">
                  <span class="call-phone-speaker"></span>
                  <div id="call-dialler" class="call-dialler">
                    <strong id="call-dial-number"></strong>
                    <div class="call-keypad">${"<i></i>".repeat(9)}</div>
                    <small id="call-dial-status">DIALLING…</small>
                  </div>
                  <div id="call-connected" class="call-phone-connected" hidden>
                    <strong>Riverside<br>Auto Care</strong>
                    <time id="call-clock">00:00</time>
                    <div class="customer-bars"><i></i><i></i><i></i><i></i></div>
                  </div>
                </div>
              </div>
            </div>
            <small>CUSTOMER</small>
          </div>
          <div class="call-flow" aria-hidden="true">
            <div class="call-flow-customer"><span></span><span></span><span></span></div>
            <div class="call-flow-agent"><span></span><span></span><span></span></div>
          </div>
          <div class="call-party call-agent" data-speaker="agent">
            <div class="agent-orb-shell" aria-hidden="true">
              <span class="agent-ripple"></span>
              <span class="agent-ripple"></span>
              <div class="agent-orb"><i></i><i></i><i></i><i></i><i></i></div>
            </div>
            <small>AI AGENT</small>
          </div>
        </div>
        <p id="call-caption" class="call-caption" aria-live="polite">DIALLING RIVERSIDE AUTO CARE…</p>
        <button type="button" class="call-stop" data-action="stop-call" aria-label="Stop the demo call"><span aria-hidden="true"></span>Stop demo</button>
        <button type="button" class="call-replay" data-action="start-call" hidden>↻ Replay the call</button>
      </div>
      <div class="call-webchat">
        <div class="call-webchat-header"><span>RIVERSIDEAUTOCARE.CO.UK — WEB CHAT, SAME BRAIN</span><i class="status-dot"></i></div>
        <div id="call-transcript" class="call-transcript" aria-live="polite"></div>
        <div class="call-webchat-footer">SAME SCRIPT · SAME BOOKING ENGINE · TWO FRONT DOORS</div>
      </div>
    </div>
    <div id="call-status" class="call-status" aria-live="polite">
      <span id="call-status-ticker" class="call-status-ticker">▸&nbsp; <span id="call-status-copy"></span><i>▌</i></span>
      <div id="call-outcomes" class="call-outcomes" hidden>
        <span>✓ Booked — Wed 3 Sep</span>
        <span>✓ DVSA checked — 2 advisories noted</span>
        <span>✓ SMS sent with booking details</span>
        <span>✓ Appended to existing vehicle card</span>
      </div>
    </div>
  `;
}

function applyCallPresentation() {
  const presentation = callPresentation(state.call.phase, state.call.speaker);
  const stage = document.querySelector("#call-stage");
  if (!stage) return;

  stage.className = [
    "call-stage",
    `is-${state.call.phase}`,
    presentation.customerSpeaking ? "is-customer-speaking" : "",
    presentation.agentSpeaking ? "is-agent-speaking" : "",
  ].filter(Boolean).join(" ");

  const dialler = document.querySelector("#call-dialler");
  const connected = document.querySelector("#call-connected");
  const stop = document.querySelector(".call-stop");
  const replay = document.querySelector(".call-replay");
  const ticker = document.querySelector("#call-status-ticker");
  const outcomes = document.querySelector("#call-outcomes");
  if (dialler) dialler.hidden = !presentation.showDialler;
  if (connected) connected.hidden = !presentation.showConnectedCall;
  if (stop) stop.hidden = !presentation.showStop;
  if (replay) replay.hidden = !presentation.showReplay;
  if (ticker) ticker.hidden = state.call.phase === "done";
  if (outcomes) outcomes.hidden = state.call.phase !== "done";

  const caption = document.querySelector("#call-caption");
  if (caption) {
    if (state.call.phase === "dialling") caption.textContent = "DIALLING RIVERSIDE AUTO CARE…";
    else if (state.call.phase === "connecting") caption.textContent = "CALLING…";
    else if (presentation.customerSpeaking) caption.textContent = "CUSTOMER SPEAKING →";
    else if (presentation.agentSpeaking) caption.textContent = "← AGENT SPEAKING";
    else if (state.call.phase === "done") caption.textContent = "CALL COMPLETE — BOOKED · LOGGED · SMS CONFIRMED";
    else caption.textContent = "CONNECTED";
  }
}

function setActiveSpeaker(speaker) {
  state.call.speaker = speaker;
  applyCallPresentation();
}

function createTranscriptLine(line) {
  const transcript = document.querySelector("#call-transcript");
  if (!transcript) return null;
  const bubble = document.createElement("p");
  bubble.className = line.speaker === "customer" ? "customer-message" : "agent-message";
  bubble.classList.add("is-typing");
  transcript.append(bubble);
  transcript.scrollTop = transcript.scrollHeight;
  return bubble;
}

function startTranscriptTyping(bubble, line, delay) {
  if (!bubble || bubble.dataset.typingStarted === "true") return;
  bubble.dataset.typingStarted = "true";

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    bubble.textContent = line.text;
    return;
  }

  clearRepeated(state.call.typingInterval);
  let index = 0;
  state.call.typingInterval = repeat(() => {
    const frame = nextTypedFrame(line.text, index);
    index = frame.nextIndex;
    bubble.textContent = frame.text;
    const transcript = document.querySelector("#call-transcript");
    if (transcript) transcript.scrollTop = transcript.scrollHeight;
    if (frame.complete) {
      clearRepeated(state.call.typingInterval);
      state.call.typingInterval = null;
    }
  }, delay);
}

function completeTranscriptLine(bubble, line) {
  clearRepeated(state.call.typingInterval);
  state.call.typingInterval = null;
  if (!bubble) return;
  bubble.classList.remove("is-typing");
  bubble.textContent = line.text;
  const transcript = document.querySelector("#call-transcript");
  if (transcript) transcript.scrollTop = transcript.scrollHeight;
}

function typeCallStatus(message) {
  const copy = document.querySelector("#call-status-copy");
  if (!copy) return;
  clearRepeated(state.call.statusInterval);
  state.call.statusInterval = null;

  const typeIn = () => {
    let index = 0;
    state.call.statusInterval = repeat(() => {
      index += 1;
      copy.textContent = message.slice(0, index);
      if (index >= message.length) {
        clearRepeated(state.call.statusInterval);
        state.call.statusInterval = null;
      }
    }, 16);
  };

  if (!copy.textContent) {
    typeIn();
    return;
  }

  state.call.statusInterval = repeat(() => {
    copy.textContent = copy.textContent.slice(0, -1);
    if (!copy.textContent) {
      clearRepeated(state.call.statusInterval);
      state.call.statusInterval = null;
      typeIn();
    }
  }, 10);
}

function finishCall() {
  if (state.call.phase !== "playing") return;
  clearRepeated(state.call.clockInterval);
  state.call.clockInterval = null;
  state.call.phase = "ending";
  setActiveSpeaker(null);

  schedule(() => {
    typeCallStatus("Call ended.");
    schedule(() => {
      clearRepeated(state.call.statusInterval);
      state.call.statusInterval = null;
      state.call.phase = "done";
      state.call.speaker = null;
      applyCallPresentation();
    }, 2400);
  }, 1000);
}

function playCallLine(index) {
  if (state.call.phase !== "playing") return;
  if (index >= CALL_SCRIPT.length) {
    finishCall();
    return;
  }

  const line = CALL_SCRIPT[index];
  setActiveSpeaker(line.speaker);
  typeCallStatus(line.status);
  const bubble = createTranscriptLine(line);

  const audio = state.call.audio ?? new Audio();
  state.call.audio = audio;
  let advanced = false;
  let typingStarted = false;
  let fallbackAdvance = null;
  let typingFallback = null;
  let failureScheduled = false;

  const beginTyping = (delay) => {
    if (typingStarted) return;
    typingStarted = true;
    clearScheduled(typingFallback);
    typingFallback = null;
    startTranscriptTyping(bubble, line, delay);
  };

  const advance = () => {
    if (advanced || state.call.phase !== "playing") return;
    advanced = true;
    clearScheduled(typingFallback);
    clearScheduled(fallbackAdvance);
    completeTranscriptLine(bubble, line);
    setActiveSpeaker(null);
    schedule(() => playCallLine(index + 1), 500);
  };

  const handleAudioFailure = () => {
    if (failureScheduled) return;
    failureScheduled = true;
    beginTyping(34);
    fallbackAdvance = schedule(advance, Math.max(1600, line.text.length * 20 + 1400));
  };

  audio.onended = advance;
  audio.onerror = handleAudioFailure;
  audio.onloadedmetadata = () => beginTyping(callTypingInterval(audio.duration, line.text.length));
  audio.src = line.audio;
  typingFallback = schedule(() => beginTyping(34), 900);
  audio.play().catch(handleAudioFailure);
}

function startCall() {
  if (!["idle", "done"].includes(state.call.phase)) return;
  const body = document.querySelector("#call-theatre-body");
  if (!body) return;

  clearCallResources();
  state.call.phase = "dialling";
  state.call.speaker = null;
  state.call.dialIndex = 0;
  state.call.seconds = 0;
  body.removeAttribute("style");
  body.innerHTML = activeCallMarkup();
  applyCallPresentation();

  state.call.dialInterval = repeat(() => {
    const frame = nextDialFrame(state.call.dialIndex);
    state.call.dialIndex = frame.nextIndex;
    const number = document.querySelector("#call-dial-number");
    if (number) number.textContent = frame.text;
    if (!frame.complete) return;

    clearRepeated(state.call.dialInterval);
    state.call.dialInterval = null;
    state.call.phase = "connecting";
    const status = document.querySelector("#call-dial-status");
    if (status) status.textContent = "CALLING…";
    applyCallPresentation();
    schedule(() => {
      if (state.call.phase !== "connecting") return;
      state.call.phase = "playing";
      state.call.clockInterval = repeat(() => {
        state.call.seconds += 1;
        const clock = document.querySelector("#call-clock");
        if (clock) clock.textContent = formatCallClock(state.call.seconds);
      }, 1000);
      applyCallPresentation();
      playCallLine(0);
    }, 1100);
  }, 130);
}

function clearCallResources() {
  for (const timer of state.call.timers) window.clearTimeout(timer);
  for (const interval of state.call.intervals) window.clearInterval(interval);
  state.call.timers.clear();
  state.call.intervals.clear();
  state.call.clockInterval = null;
  state.call.dialInterval = null;
  state.call.typingInterval = null;
  state.call.statusInterval = null;

  if (state.call.audio) {
    state.call.audio.onended = null;
    state.call.audio.onerror = null;
    state.call.audio.onloadedmetadata = null;
    state.call.audio.pause();
    state.call.audio.currentTime = 0;
  }
}

function stopCall(reset = true) {
  clearCallResources();
  state.call.phase = "idle";
  state.call.speaker = null;
  state.call.dialIndex = 0;
  state.call.seconds = 0;

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

function handleSectionLink(event) {
  const link = event.target.closest("a[href^='#']");
  const sectionId = link?.getAttribute("href");
  if (!sectionId || sectionId === "#") return false;

  const section = document.querySelector(sectionId);
  if (!section) return false;

  event.preventDefault();
  section.scrollIntoView();
  history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  return true;
}

function handleClick(event) {
  if (handleSectionLink(event)) return;

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
  updateLayer(-1);
  renderJourney(0);
  renderSector("garages");
  setPreviewOutcome("success");

  if (window.location.hash && document.querySelector(window.location.hash)) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[role='button'][data-action]")) {
      event.preventDefault();
      event.target.click();
    }
  });
  document.querySelector("#assessment-form")?.addEventListener("submit", handleAssessmentSubmit);
  window.setInterval(advanceHero, 3400);

  const layers = document.querySelector("#layers");
  if (layers && "IntersectionObserver" in window) {
    const layerObserver = new IntersectionObserver((entries) => {
      const nextLayer = nextLayerForVisibility(state.layer, entries[0].isIntersecting);
      if (nextLayer !== state.layer) updateLayer(nextLayer);
    }, { threshold: 0.4 });
    layerObserver.observe(layers);
  }

  const theatre = document.querySelector("#call-theatre");
  if (theatre && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting && state.call.phase !== "idle") stopCall();
    }, { threshold: 0.15 });
    observer.observe(theatre);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
} else {
  initializeSite();
}
