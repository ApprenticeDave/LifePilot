(() => {
  "use strict";
  const root = document.querySelector("#app");
  root.addEventListener("input", updateFromForm);
  root.addEventListener("submit", onTaskSubmit);
  const status = document.querySelector("#save-status");
  const retrySave = document.querySelector("#retry-save");
  const reloadState = document.querySelector("#reload-state");
  const FOLLOWUP_COPY = {
    remembering: {
      title: "What do you most often want help remembering?",
      options: [["tasks", "Tasks"], ["appointments", "Appointments"], ["dates", "Important dates"], ["other", "Something else"]],
    },
    starting: {
      title: "What tends to make starting difficult?",
      options: [["tooManyOptions", "There are too many options"], ["tooBig", "The activity feels too big"], ["unclearNextStep", "The next step is unclear"], ["other", "Something else"]],
    },
    finding: {
      title: "What information is hardest to find when you need it?",
      options: [["documents", "Documents"], ["notes", "Notes"], ["datesDetails", "Dates or details"], ["other", "Something else"]],
    },
    ongoing: {
      title: "What is hardest to keep track of?",
      options: [["whatNeedsDoing", "What needs doing"], ["progress", "Progress"], ["deadlines", "Deadlines"], ["other", "Something else"]],
    },
    other: { title: "What would make this a little easier?", options: [["ownWords", "A little more detail, if you like"]] },
  };
  const labels = {
    remembering: "Remembering tasks or important dates",
    starting: "Knowing where to start",
    finding: "Finding information when I need it",
    ongoing: "Keeping track of ongoing responsibilities",
    other: "Something else",
    unsure: "I'm not sure yet",
  };
  let state;
  let dirty = false;
  let revision = 0;
  let activeSave = null;
  let saveTimer;
  let saveError = "";
  let customRegionSelected = false;
  let serverVersion;
  let conflicted = false;
  let transitioning = false;
  // Return destinations are session-only. Reload retains saved answers/stage,
  // but resumes normal setup navigation rather than a previous targeted edit.
  let editContext = null;
  let tasks = [];
  let taskDraft = "";
  let taskEdit = null;
  let taskMessage = "";
  let taskFailed = false;
  let completedOpen = false;
  let openTasksExpanded = false;

  function blockTransitionInput(event) {
    if (transitioning && (event.type !== "keydown" || event.key !== "Tab")) event.preventDefault();
  }
  ["beforeinput", "click", "keydown", "pointerdown", "mousedown"].forEach((name) => root.addEventListener(name, blockTransitionInput, true));

  const escapeText = (text) => String(text ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  function selectedOptions(items, selected, type, name) {
    return items.map(([value, title, detail = ""]) => `
      <label class="choice">
        <input id="${name}-${value}" type="${type}" name="${name}" value="${value}" ${selected.includes(value) ? "checked" : ""}>
        <span class="choice-copy"><strong>${title}</strong>${detail ? `<small>${detail}</small>` : ""}</span>
      </label>`).join("");
  }
  function button(label, action, kind = "secondary") {
    return `<button class="button ${kind}" type="button" data-action="${action}">${label}</button>`;
  }
  function progress(stage) {
    const phase = stage === "review" || stage === "starting" ? "Your starting point" :
      ["difficulty", "followup"].includes(stage) ? "What would help" : "About you";
    const step = {
      name: "Preferred name", guidance: "Guidance style", responsibilities: "Everyday responsibilities",
      location: "Region and time zone", difficulty: "Choose what to explore", followup: "One optional follow-up",
      review: "Review your answers", starting: "Choose where to begin",
    }[stage] || "";
    return `<p class="progress-label">${phase}${step ? `<span>· ${step}</span>` : ""}</p>`;
  }
  function preferenceIntro() {
    const p = state.profile;
    let detail = "";
    if (p.guidance.includes("overviewFirst")) detail += "First, a quick view of the whole setup: a few basics, what might help, then a chance to review.";
    if (p.guidance.includes("moreExplanation")) detail += `${detail ? " " : ""}Each question includes a short explanation of why it may be useful.`;
    return detail ? `<aside class="overview"><strong>${p.guidance.includes("overviewFirst") ? "The short version" : "A little more context"}</strong><p>${detail}</p></aside>` : "";
  }
  function stepHeading(title, description, stage) {
    const small = state.profile.guidance.includes("smallerSteps");
    return `${progress(stage)}${preferenceIntro()}<p class="eyebrow">${small ? "One small step" : "Getting to know you"}</p><h1>${title}</h1><p class="lead">${description}</p>`;
  }
  function navigation(back = true, nextLabel = "Continue") {
    return `<div class="actions">${back ? button("Back", "back") : ""}${button(nextLabel, "next", "primary")}
      <button class="text-button" type="button" data-action="later">Finish setup later</button>
      <button class="text-button quiet" type="button" data-action="skip">Skip this question</button></div><div id="skip-confirm"></div>`;
  }
  function textField(id, label, value, hint = "", max = 160) {
    return `<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text" maxlength="${max}" value="${escapeText(value)}" autocomplete="off">${hint ? `<span class="field-hint">${hint}</span>` : ""}</div>`;
  }
  function overviewCard() {
    return `<div class="overview"><strong>What this step is for</strong><p>${state.profile.guidance.includes("moreExplanation") ? "Your answer helps us make later examples relevant. It doesn't define you or restrict what you can explore." : "This gives us a little context for relevant examples. It doesn't define you or restrict what you can explore."}</p></div>`;
  }
  function screenWelcome() {
    return `<section class="card welcome-card"><p class="eyebrow">A gentle place to begin</p><h1>Welcome to LifePilot</h1>
      <p class="lead">Let's find a useful starting point together. You can skip any question, pause, or explore without setup.</p>
      <div class="privacy-notice"><h2>Your information stays here</h2>
        <p>Your setup answers and any tasks you add are saved in a database on this computer so you can come back after closing or restarting LifePilot. There is no account, sign-in, cloud storage, or external service.</p>
        <p>The local database is <strong>not encrypted</strong>. Anyone with access to this computer or its files may be able to read it. Share only what you're comfortable storing here. Clearing your local data removes your profile and tasks from LifePilot; it is not a secure erase of the storage device.</p>
        <p>Skipped answers stay unanswered; LifePilot doesn't infer a difficulty from them. Your region is recorded only as a preference; this first version does not provide region-specific localization. Time zone is not used to enable notifications.</p></div>
      <div class="actions">${button("Get started", "next", "primary")}${button("Explore without setup", "explore")}      ${state.stage !== "welcome" || hasAnyProfile() ? button("Continue setup", "resume") : ""}</div>
      ${state.stage !== "welcome" || hasAnyProfile() ? `<div class="actions">${button("Review answers", "review")}</div>` : ""}
    </section>`;
  }
  function screenName() {
    return `<section class="card">${stepHeading("What would you like us to call you?", "A nickname is plenty. This is optional.", "name")}
      ${textField("nickname", "Name or nickname (optional)", state.profile.nickname, "We'll use this when we address you. It doesn't need to be your legal name.", 60)}
      ${navigation()}</section>`;
  }
  function screenGuidance() {
    const prefs = [
      ["smallerSteps", "Smaller steps", "Break a complex activity into manageable actions."],
      ["moreExplanation", "More explanation", "Explain unfamiliar terms and why a step matters."],
      ["startingPointHelp", "Help me choose a starting point", "Offer a next action I can accept or change."],
      ["overviewFirst", "A brief overview first", "Show the bigger picture before individual steps."],
    ];
    return `<section class="card">${stepHeading("What would make guidance easier for you to use?", "Choose any that sound useful. You can change these preferences later.", "guidance")}
      <fieldset class="field"><legend class="field-label">Guidance preferences (choose any)</legend>
        <div class="choice-list">${selectedOptions(prefs, state.profile.guidance, "checkbox", "guidance")}</div></fieldset>
      ${navigation()}</section>`;
  }
  function screenResponsibilities() {
    const options = [
      ["workStudy", "Work or study", "Work tasks, study deadlines, classes, and professional commitments."],
      ["homeProperty", "Home or property", "Household tasks, maintenance, repairs, renovations, and property paperwork."],
      ["caring", "Caring for others", "Helping children, family members, or others with day-to-day needs and appointments."],
      ["personalAdministration", "Personal administration", "Forms, applications, renewals, and important correspondence."],
      ["moneyBills", "Money and bills", "Bills, budgeting, saving, and keeping track of financial goals you set."],
      ["other", "Something else", "Another responsibility or area of life you would like support with."],
    ];
    return `<section class="card">${stepHeading("Which responsibilities are part of everyday life?", "Choose any that fit. This isn't a measure of whether something is a problem.", "responsibilities")}
      ${overviewCard()}<fieldset class="field"><legend class="field-label">Responsibilities (optional)</legend>
        <div class="choice-list">${selectedOptions(options, state.profile.responsibilities, "checkbox", "responsibilities")}</div></fieldset>
      ${state.profile.responsibilities.includes("other") ? textField("responsibilityOther", "Something else (optional)", state.profile.responsibilityOther, "Please don't include names or private details.", 120) : ""}
      ${navigation()}</section>`;
  }
  function timezoneOptions() {
    let values = ["UTC"];
    let notice = "";
    try {
      if (Intl.supportedValuesOf) {
        values = [...new Set([...Intl.supportedValuesOf("timeZone"), "UTC"])].sort();
      } else {
        notice = "This browser cannot provide the full time-zone list. Only UTC is offered; you can skip this question.";
      }
    } catch {
      notice = "The time-zone list could not be loaded. Only UTC is offered; you can skip this question.";
    }
    if (state.profile.timeZone && !values.includes(state.profile.timeZone)) values.push(state.profile.timeZone);
    const options = `<option value="">Choose a time zone (optional)</option>${values.map((zone) => {
      let offset = "offset unavailable";
      try {
        offset = new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "shortOffset" })
          .formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value || offset;
      } catch {
        offset = "offset unavailable";
      }
      return `<option value="${escapeText(zone)}" ${state.profile.timeZone === zone ? "selected" : ""}>${escapeText(zone.replaceAll("_", " "))} (${escapeText(offset)})</option>`;
    }).join("")}`;
    return { options, notice };
  }
  function screenLocation() {
    const zones = timezoneOptions();
    const regionCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");
    const regionNames = typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
    const suggestions = regionNames
      ? regionCodes.map((code) => regionNames.of(code)).sort((a, b) => a.localeCompare(b, "en"))
      : [];
    const customRegion = customRegionSelected ||
      Boolean(state.profile.countryRegion && !suggestions.includes(state.profile.countryRegion));
    return `<section class="card">${stepHeading("Which region and time zone should we use?", "You can provide either one, both, or neither.", "location")}
      ${overviewCard()}<div class="field">
        <label for="countryRegionChoice">Country or region (optional)</label>
        <select id="countryRegionChoice" name="countryRegionChoice" aria-describedby="region-hint">
          <option value="">Choose a country or region (optional)</option>
          ${suggestions.map((name) => `<option value="${escapeText(name)}" ${!customRegion && state.profile.countryRegion === name ? "selected" : ""}>${escapeText(name)}</option>`).join("")}
          <option value="__other" ${customRegion ? "selected" : ""}>Other / enter my own</option>
        </select>
        <span id="region-hint" class="field-hint">${regionNames ? "Choose from the list, or select Other / enter my own." : "The country list isn't available in this browser. Select Other / enter my own to add an answer."} This is not an address. Region-specific guidance isn't available in this first version.</span>
      </div>
      ${customRegion ? textField("countryRegion", "Your country or region (optional)", state.profile.countryRegion, "Use your own wording, or leave this blank.", 80) : ""}
      <div class="field"><label for="timeZone">Time zone (optional)</label><select id="timeZone" name="timeZone" aria-describedby="timezone-hint">${zones.options}</select><span id="timezone-hint" class="field-hint">Offsets shown are for today. Used only as a saved profile preference. No notifications are sent.${zones.notice ? ` ${zones.notice}` : ""}</span></div>
      ${navigation()}</section>`;
  }
  function screenDifficulty() {
    const options = Object.entries(labels).map(([value, label]) => [value, label]);
    const examples = {
      workStudy: "work or study deadlines",
      homeProperty: "home tasks or property documents",
      caring: "care-related appointments",
      personalAdministration: "forms or important correspondence",
      moneyBills: "bill dates, financial paperwork, or goals you set for saving or budgeting",
    };
    const relevantExamples = state.profile.responsibilities
      .filter((value) => Object.hasOwn(examples, value)).map((value) => examples[value]);
    return `<section class="card">${stepHeading("What feels difficult to keep on top of?", "Choose one thing to explore first. You don't need to explain everything now.", "difficulty")}
      ${overviewCard()}${relevantExamples.length ? `<p class="explain">In the areas you selected, examples could include ${relevantExamples.join(", ")}. These are examples, not assumptions about what you find difficult.</p>` : ""}
      <fieldset class="field"><legend class="field-label">Pick one, or skip</legend>
        <div class="choice-list">${selectedOptions(options, state.profile.difficulty ? [state.profile.difficulty] : [], "radio", "difficulty")}</div></fieldset>
      ${state.profile.difficulty === "other" ? textField("difficultyOther", "In your own words (optional)", state.profile.difficultyOther, "Share only what you're comfortable sharing.", 160) : ""}
      ${navigation()}</section>`;
  }
  function screenFollowup() {
    const spec = FOLLOWUP_COPY[state.profile.difficulty];
    if (!spec) return screenReview();
    return `<section class="card">${stepHeading(spec.title, "One optional follow-up. A short answer or no answer is fine.", "followup")}
      ${overviewCard()}<fieldset class="field"><legend class="field-label">Choose one (optional)</legend>
        <div class="choice-list">${selectedOptions(spec.options, state.profile.followup ? [state.profile.followup] : [], "radio", "followup")}</div></fieldset>
      ${["other", "ownWords"].includes(state.profile.followup) ? textField("followupOther", "A little more detail (optional)", state.profile.followupOther, "No private records or detailed examples needed.", 160) : ""}
      ${navigation()}</section>`;
  }
  const profileSections = [
    ["Nickname", "nickname", "name"],
    ["Guidance style", "guidance", "guidance"],
    ["Responsibilities", "responsibilities", "responsibilities"],
    ["Country or region · time zone", "location", "location"],
  ];
  function profileAnswer(section) {
    const p = state.profile;
    if (section === "nickname") return p.nickname || "Not provided";
    if (section === "guidance") {
      const words = { smallerSteps: "Smaller steps", moreExplanation: "More explanation", startingPointHelp: "Help choosing a starting point", overviewFirst: "Overview first" };
      return p.guidance.length ? p.guidance.map((x) => words[x]).join(", ") : "Not provided";
    }
    if (section === "responsibilities") {
      const words = { workStudy: "Work or study", homeProperty: "Home or property", caring: "Caring for others", personalAdministration: "Personal administration", moneyBills: "Money and bills" };
      const items = p.responsibilities.filter((x) => x !== "other").map((x) => words[x]);
      if (p.responsibilities.includes("other")) items.push(p.responsibilityOther || "Something else");
      return items.length ? items.join(", ") : "Not provided";
    }
    return [p.countryRegion, p.timeZone ? p.timeZone.replaceAll("_", " ") : ""].filter(Boolean).join(" · ") || "Not provided";
  }
  function difficultyAnswer() {
    const p = state.profile;
    return p.difficulty ? `${labels[p.difficulty]}${p.difficulty === "other" && p.difficultyOther ? `: ${p.difficultyOther}` : ""}` : "Not provided";
  }
  function followupAnswer() {
    const p = state.profile;
    if (!p.followup) return "Not provided";
    const spec = FOLLOWUP_COPY[p.difficulty];
    const label = spec?.options.find(([id]) => id === p.followup)?.[1] || "";
    return [label, p.followupOther].filter(Boolean).join(": ") || label || "Not provided";
  }
  function summaryRow(title, value, action) {
    return `<div class="summary-row"><dt>${escapeText(title)}</dt><dd>${escapeText(value)}</dd><button type="button" data-action="edit" data-stage="${escapeText(action)}" aria-label="${escapeText(`Change ${title}`)}">Change</button></div>`;
  }
  function screenReview() {
    const extraRows = state.profile.difficulty && state.profile.difficulty !== "unsure"
      ? summaryRow("Follow-up", followupAnswer(), "followup") : "";
    const allEmpty = !state.profile.nickname && !state.profile.guidance.length && !state.profile.responsibilities.length &&
      !state.profile.countryRegion && !state.profile.timeZone && !state.profile.difficulty;
    const prefs = state.profile.guidance;
    let tailored = "";
    if (prefs.includes("overviewFirst")) tailored += "You'll see the bigger picture first. ";
    if (prefs.includes("smallerSteps")) tailored += "We'll favor clear, manageable steps. ";
    if (prefs.includes("moreExplanation")) tailored += "We'll include extra context. ";
    if (prefs.includes("startingPointHelp")) tailored += "We'll suggest a starting point you can choose to use or change.";
    return `<section class="card">${stepHeading("Does this look right?", "Check the details you chose. You can change any answer or continue without adding anything.", "review")}
      ${allEmpty ? `<p class="overview">You haven't added any details yet. That's okay—you can still explore.</p>` : ""}
      <dl class="summary-list">
        ${profileSections.map(([title, section, stage]) => summaryRow(title, profileAnswer(section), stage)).join("")}
        ${summaryRow("What you'd like help with", difficultyAnswer(), "difficulty")}
        ${extraRows}
      </dl>${tailored ? `<aside class="overview"><strong>How your preferences shape this setup</strong><p>${tailored}</p></aside>` : ""}
      <div class="actions">${button("Choose a starting point", "next", "primary")}${button("Back", "back")}${button("Finish setup later", "later")}</div></section>`;
  }
  function suggestion() {
    const p = state.profile;
    const content = {
      remembering: ["Capture one task", "Use the Tasks card on Home to put something down and find it again. Dates and reminders aren't built yet."],
      starting: ["Break one activity into a manageable next step", "A short next-step plan could make a larger activity easier to approach. Task planning isn't built yet."],
      finding: ["Make a note about where a useful document is kept", "You could record a location without uploading the document. Notes and document organization aren't built yet."],
      ongoing: ["Make a short list for one responsibility", "A small list could make one ongoing responsibility easier to see. Lists and tracking aren't built yet."],
      other: ["Choose one small thing you'd like to explore", "You can decide what feels relevant. You can capture a task on Home; notes aren't built yet."],
      unsure: ["Explore the workspace", "You can capture a task on Home or look around without committing to a setup answer. Reminders and document tools aren't built yet."],
      "": ["Explore the workspace", "You can explore without choosing a problem, or capture a task on Home. Reminders and document tools aren't built yet."],
    };
    return content[p.difficulty] || content[""];
  }
  function screenStarting() {
    const [title, why] = suggestion();
    const personalized = Boolean(state.profile.difficulty && state.profile.difficulty !== "unsure");
    const helper = state.profile.guidance.includes("startingPointHelp");
    return `<section class="card">${stepHeading("Where would you like to start?", personalized ? "Here's one possible starting point based on what you shared. You can choose to explore it or simply continue." : "You can explore at your own pace. This suggestion isn't personalized.", "starting")}
      ${state.profile.guidance.includes("overviewFirst") ? `<aside class="overview"><strong>In short</strong><p>We've saved your optional profile locally. Next, choose whether to explore the starter workspace or revisit setup.</p></aside>` : ""}
      <div class="suggestion"><p class="eyebrow">${personalized ? "A possible starting point" : "An option to explore"}</p><h2>${title}</h2><p>${why}</p></div>
      ${helper ? `<p class="explain">This is only a suggestion. Nothing will be created, scheduled, or shared.</p>` : ""}
      <div class="actions">${button("Continue to workspace", "next", "primary")}${button("Review answers", "review")}
        <button class="text-button" type="button" data-action="back">Back</button></div></section>`;
  }
  function screenWorkspace() {
    const p = state.profile;
    const greeting = p.nickname ? `Welcome, ${escapeText(p.nickname)}` : "A place to begin";
    const reachedStartingPoint = state.resumeStage === "starting";
    const areas = [
      ["homeProperty", "Home or property", "Household tasks, maintenance, repairs, and property paperwork.", "M3 11 12 3l9 8M5 10v11h14V10M9 21v-7h6v7"],
      ["workStudy", "Work or study", "Work commitments, classes, and study deadlines.", "M4 5h6l2 2 2-2h6v15h-6l-2 2-2-2H4ZM12 7v15"],
      ["caring", "Caring for others", "Day-to-day support, shared responsibilities, and appointments.", "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 21v-2a4 4 0 0 0-3-4"],
      ["personalAdministration", "Personal administration", "Forms, renewals, applications, and important correspondence.", "M6 3h9l4 4v14H6ZM14 3v5h5M9 12h7M9 16h7"],
      ["moneyBills", "Money and bills", "Bills, budgeting, saving, and financial goals you set.", "M3 6h18v15H3ZM3 6V3h15M16 12h5v4h-5Z"],
      ["other", "Other responsibilities", "Space for another area of everyday life.", "M12 3v18M3 12h18"],
    ];
    const selectedAreas = areas.filter(([id]) => p.responsibilities.includes(id));
    const visibleAreas = selectedAreas.length ? selectedAreas :
      areas.filter(([id]) => ["homeProperty", "workStudy", "moneyBills"].includes(id));
    const icon = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"></path></svg>`;
    const guidance = p.guidance.length ? profileAnswer("guidance") : "No guidance preferences chosen yet.";
    return `<section class="dashboard" aria-labelledby="home-heading">
      <header class="dashboard-heading"><div><p class="eyebrow">Your local workspace</p><h1 id="home-heading">Home</h1><p class="lead">${greeting}. Take things one step at a time.</p></div>
        ${button("Review profile", "review")}</header>
      ${p.guidance.includes("overviewFirst") ? `<p class="dashboard-overview">Start with your profile, see the areas you'd like support with, and adjust how LifePilot guides you.</p>` : ""}
      <section class="dashboard-next" aria-labelledby="next-heading">
        <div class="dashboard-icon">${icon("m5 12 4 4L19 6")}</div>
        <div><p class="eyebrow">${p.guidance.includes("smallerSteps") ? "One small step" : "Your next step"}</p>
          <h2 id="next-heading">${reachedStartingPoint ? "Make this space feel like yours" : "Pick up where you left off"}</h2>
          <p>${reachedStartingPoint ? "Review your profile or adjust the guidance that works for you." : "Your setup progress is saved. Continue when you're ready, or explore the areas below."}</p>
          ${p.guidance.includes("startingPointHelp") ? `<p class="dashboard-detail">A useful starting point is ${reachedStartingPoint ? "checking your preferences" : "continuing your optional setup"}. You stay in control of what you answer.</p>` : ""}
          <div class="actions">${reachedStartingPoint ? button("Adjust my profile", "review", "primary") : button("Continue setup", "resume", "primary")}
            ${reachedStartingPoint ? button("Revisit setup", "resume") : ""}</div>
        </div>
      </section>
      <section id="tasks-card" class="dashboard-panel tasks-panel" aria-labelledby="tasks-heading">${taskCardContent()}</section>
      <div class="dashboard-grid">
        <section class="dashboard-panel" aria-labelledby="areas-heading">
          <h2 id="areas-heading">${selectedAreas.length ? "Your areas" : "Areas to explore"}</h2>
          <p class="dashboard-detail">${selectedAreas.length ? "Based on the responsibilities you selected." : "A few examples of where LifePilot could help. Choose your areas in your profile."} These tools aren't available yet.</p>
          <div class="area-grid">${visibleAreas.map(([, title, detail, path]) => `<article class="area-card">
            <span class="area-icon">${icon(path)}</span><h3>${title}</h3><p>${detail}</p><span class="availability">Not available yet</span>
          </article>`).join("")}</div>
        </section>
        <aside class="dashboard-panel" aria-labelledby="guidance-heading">
          <span class="area-icon">${icon("M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6")}</span>
          <h2 id="guidance-heading">Support, your way</h2><p>${escapeText(guidance)}</p>
          ${p.guidance.includes("moreExplanation") ? `<p class="dashboard-detail">These preferences shape setup wording and presentation. You can change them without changing your other answers.</p>` : ""}
          ${button("Change guidance", "edit").replace('data-action="edit"', 'data-action="edit" data-stage="guidance"')}
          <div class="local-note"><strong>Saved on this computer</strong><p>No cloud sync or sign-in. The local database is not encrypted.</p></div>
        </aside>
      </div>
      <p class="dashboard-scope">This first version supports your profile, setup, and a local task list. Reminders, dates, notes, property tools, and financial tracking are not built yet.</p>
      <details class="dashboard-data"><summary>Manage local data</summary>
        <p>Remove your saved setup, profile, and all tasks from LifePilot on this computer. This cannot be undone in the app and is not a secure erase.</p>
        ${button("Clear my local data", "confirm-clear")}<div id="clear-confirm"></div>
      </details>
    </section>`;
  }
  function taskCardContent() {
    const openTasks = tasks.filter((task) => !task.completed);
    const previewTasks = openTasks.slice(0, 2);
    const completed = tasks.filter((task) => task.completed);
    if (openTasks.length <= previewTasks.length) openTasksExpanded = false;
    const row = (task) => {
      const title = escapeText(task.title);
      if (taskEdit?.id === task.id) {
        return `<li class="task-row"><form data-task-form="edit" data-task-id="${task.id}">
          ${textField("taskEditTitle", "Edit task", taskEdit.title, "Save changes when you're ready.", 240)}
          <div class="task-actions"><button type="submit" class="button secondary">Save changes</button>
          <button type="button" class="text-button" data-action="task-cancel" data-task-id="${task.id}">Cancel edit</button></div></form></li>`;
      }
      return `<li class="task-row"><span class="task-title">${title}</span><div class="task-actions">
        <button type="button" class="button secondary" data-action="task-toggle" data-task-id="${task.id}" aria-label="${task.completed ? "Reopen" : "Mark done"}: ${title}">${task.completed ? "Reopen" : "Mark done"}</button>
        <button type="button" class="text-button" data-action="task-edit" data-task-id="${task.id}" aria-label="Edit task: ${title}">Edit</button>
        </div></li>`;
    };
    return `<h2 id="tasks-heading" tabindex="-1">Tasks</h2>
      <p class="dashboard-detail">Get something off your mind. No date or category needed.</p>
      <form data-task-form="add">
        <div class="field"><label for="task-title">What would you like to do?</label>
          <input id="task-title" name="taskTitle" type="text" maxlength="240" value="${escapeText(taskDraft)}" autocomplete="off" required aria-describedby="task-hint">
          <span id="task-hint" class="field-hint">Saved on this computer when you select Add task. No reminders are sent.</span></div>
        <button type="submit" class="button secondary">Add task</button>
      </form>
      <p id="task-message" role="status" aria-live="polite" class="task-message${taskFailed ? " is-error" : ""}">${escapeText(taskMessage)}</p>
      <h3>To do (${openTasks.length})</h3>${openTasks.length ? `<ul id="task-preview" class="task-list">${previewTasks.map(row).join("")}</ul>
        ${openTasks.length > previewTasks.length ? `<details id="more-open-tasks"${openTasksExpanded ? " open" : ""}><summary>Show all ${openTasks.length} tasks</summary>
          <ul id="more-open-task-list" class="task-list">${openTasks.slice(previewTasks.length).map(row).join("")}</ul></details>` : ""}` :
        `<p class="dashboard-detail">${completed.length ? "No unfinished tasks. Add something whenever you need to." : "No tasks yet. Add something you'd like to come back to."}</p>`}
      ${completed.length ? `<details id="completed-tasks" ${completedOpen ? "open" : ""}><summary>Completed (${completed.length})</summary>
        <ul class="task-list">${completed.map(row).join("")}</ul></details>` : ""}`;
  }
  function renderTasks(focusId = "task-title") {
    const card = document.querySelector("#tasks-card");
    card.innerHTML = taskCardContent();
    card.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onAction));
    document.getElementById(focusId)?.focus();
  }
  function taskStatus(message, failed = false) {
    taskMessage = message;
    taskFailed = failed;
    const target = document.querySelector("#task-message");
    if (target) {
      target.textContent = message;
      target.classList.toggle("is-error", failed);
    }
  }
  function onTaskSubmit(event) {
    const form = event.target;
    if (!form.dataset.taskForm) return;
    event.preventDefault();
    return onAction({ currentTarget: { dataset: {
      action: form.dataset.taskForm === "add" ? "task-add" : "task-save",
      taskId: form.dataset.taskId,
    } } });
  }
  async function handleTaskAction(action, id) {
    completedOpen = Boolean(document.querySelector("#completed-tasks")?.open);
    openTasksExpanded = Boolean(document.querySelector("#more-open-tasks")?.open);
    const task = tasks.find((item) => item.id === id);
    if (action === "task-cancel") {
      taskEdit = null;
      taskStatus("");
      return renderTasks("tasks-heading");
    }
    if (action === "task-edit") {
      if (taskEdit && taskEdit.id !== id) return taskStatus("Save or cancel your current edit before editing another task.", true);
      if (!task) return taskStatus("That task is no longer available. Reload saved data before continuing.", true);
      taskEdit = { id, title: task.title };
      taskStatus("");
      return renderTasks("taskEditTitle");
    }
    if (action !== "task-add" && !task) return taskStatus("That task is no longer available. Reload the page before continuing.", true);
    const title = (action === "task-add" ? taskDraft : action === "task-save" ? taskEdit?.title : task.title)?.trim();
    if (!title || title.length > 240) return taskStatus("Enter a task of 1 to 240 characters.", true);
    if ((dirty || activeSave) && !(await persist(false))) return;
    taskStatus("Saving task...");
    try {
      const response = await fetch(action === "task-add" ? "/api/tasks" : `/api/tasks/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-LifePilot-Request": "1", "X-LifePilot-Version": String(serverVersion) },
        body: JSON.stringify({ title, completed: action === "task-add" ? false : action === "task-toggle" ? !task.completed : task.completed }),
        cache: "no-store",
      });
      const result = await response.json();
      if (response.status === 409) {
        taskStatus("Your task change wasn't saved. Your draft is still here; see the save conflict message below.", true);
        return reportConflict();
      }
      if (!response.ok) throw new Error(result.error || "Could not save this task.");
      serverVersion = result.version;
      tasks = result.tasks;
      if (action === "task-add") taskDraft = "";
      if (action === "task-save") taskEdit = null;
      if (action === "task-toggle" && taskEdit?.id === id) taskEdit = null;
      taskStatus(action === "task-add" ? "Task added and saved on this computer." :
        action === "task-save" ? "Task changes saved on this computer." :
          task.completed ? "Task reopened and saved on this computer." : "Task marked done and saved on this computer.");
      renderTasks(action === "task-add" ? "task-title" : "tasks-heading");
      setStatus(taskMessage);
    } catch (error) {
      taskStatus(`${error.message} Your task change is still on screen. Try again before leaving.`, true);
    }
  }
  function hasAnyProfile() {
    const p = state.profile;
    return Boolean(p.nickname || p.guidance.length || p.responsibilities.length || p.countryRegion || p.timeZone || p.difficulty);
  }
  function render(focusHeading = false) {
    const screens = {
      welcome: screenWelcome, name: screenName, guidance: screenGuidance,
      responsibilities: screenResponsibilities, location: screenLocation,
      difficulty: screenDifficulty, followup: screenFollowup, review: screenReview,
      starting: screenStarting, workspace: screenWorkspace,
    };
    root.innerHTML = (screens[state.stage] || screenWelcome)();
    document.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onAction));
    setStatus(saveError || (dirty ? "Saving your changes…" : ""), Boolean(saveError), Boolean(saveError));
    const heading = root.querySelector("h1");
    if (heading && focusHeading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  function setStatus(message, error = Boolean(saveError), retry = false) {
    status.textContent = message;
    status.classList.toggle("is-error", error);
    retrySave.hidden = !retry || conflicted;
    reloadState.hidden = !conflicted;
  }
  function updateFromForm(event) {
    if (transitioning) return;
    const el = event.target;
    if (el.name === "taskTitle" || el.name === "taskEditTitle") {
      if (el.name === "taskTitle") taskDraft = el.value;
      else if (taskEdit) taskEdit.title = el.value;
      if (!conflicted) taskStatus("Not saved yet.");
      return;
    }
    const p = state.profile;
    if (el.name === "countryRegionChoice") {
      customRegionSelected = el.value === "__other";
      p.countryRegion = customRegionSelected ? "" : el.value;
    } else if (el.name === "guidance") {
      p.guidance = [...root.querySelectorAll('input[name="guidance"]:checked')].map((input) => input.value);
    } else if (el.name === "responsibilities") {
      p.responsibilities = [...root.querySelectorAll('input[name="responsibilities"]:checked')].map((input) => input.value);
      if (!p.responsibilities.includes("other")) p.responsibilityOther = "";
    } else if (el.name === "difficulty") {
      const choice = root.querySelector('input[name="difficulty"]:checked')?.value || "";
      if (choice !== p.difficulty) Object.assign(p, changedDifficulty(p, choice));
    } else if (el.name === "followup") {
      p.followup = root.querySelector('input[name="followup"]:checked')?.value || "";
      if (!["other", "ownWords"].includes(p.followup)) p.followupOther = "";
    } else if (Object.hasOwn(p, el.name)) {
      p[el.name] = el.value;
    }
    dirty = true;
    revision += 1;
    if (!conflicted) saveError = "";
    clearTimeout(saveTimer);
    if (!conflicted) saveTimer = setTimeout(() => persist(true), 500);
    if (el.type === "checkbox" || el.type === "radio" || el.name === "countryRegionChoice") {
      render(false);
      if (el.id) document.getElementById(el.id)?.focus();
    } else {
      setStatus(saveError || "Saving your changes…", Boolean(saveError), Boolean(saveError));
    }
  }
  function changedDifficulty(profile, value) {
    return {
      difficulty: value,
      difficultyOther: value === "other" ? profile.difficultyOther : "",
      followup: "",
      followupOther: "",
    };
  }
  async function persist(showSuccess = true) {
    clearTimeout(saveTimer);
    if (conflicted) return false;
    if (activeSave) {
      const result = await activeSave;
      if (!result) return false;
      return dirty ? persist(showSuccess) : true;
    }
    const savingRevision = revision;
    const snapshot = JSON.stringify(state);
    activeSave = (async () => {
      try {
        const response = await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-LifePilot-Request": "1", "X-LifePilot-Version": String(serverVersion) },
          body: snapshot,
          cache: "no-store",
        });
        const result = await response.json();
        if (response.status === 409) return reportConflict();
        if (!response.ok) throw new Error(result.error || "Your changes could not be saved.");
        // Advance the server token even if input changed while this snapshot saved.
        serverVersion = result.version;
        if (revision === savingRevision) {
          state = result.state;
          dirty = false;
          saveError = "";
          setStatus(showSuccess ? "Saved on this computer." : "");
        }
        return true;
      } catch (error) {
        saveError = `${error.message} Your current answers are still on screen; retry before leaving.`;
        setStatus(saveError, true, true);
        return false;
      }
    })();
    const success = await activeSave;
    activeSave = null;
    if (success && dirty) return persist(showSuccess);
    return success;
  }
  function reportConflict() {
    conflicted = true;
    clearTimeout(saveTimer);
    saveError = "Save conflict: your local data changed in another window. Your draft is still on screen and has not overwritten those changes. Reload saved data to continue; reloading discards this unsaved draft.";
    setStatus(saveError, true);
    return false;
  }
  function hasAnswer(stage) {
    const p = state.profile;
    return ({
      name: Boolean(p.nickname),
      guidance: p.guidance.length > 0,
      responsibilities: p.responsibilities.length > 0 || Boolean(p.responsibilityOther),
      location: Boolean(p.countryRegion || p.timeZone),
      difficulty: Boolean(p.difficulty || p.difficultyOther),
      followup: Boolean(p.followup || p.followupOther),
    })[stage] || false;
  }
  async function navigate(stage) {
    if (conflicted || ((dirty || activeSave) && !(await persist(false)))) return false;
    const previousStage = state.stage;
    const previousResume = state.resumeStage;
    if (stage === "workspace" && !editContext) state.resumeStage = state.stage === "welcome" ? "name" : state.stage;
    state.stage = stage;
    dirty = true;
    revision += 1;
    saveError = "";
    if (!(await persist(false))) {
      state.stage = previousStage;
      state.resumeStage = previousResume;
      revision += 1;
      dirty = true;
      return false;
    }
    if (stage === editContext?.origin || stage === "workspace") editContext = null;
    render(true);
    return true;
  }
  function showSkipConfirm() {
    const target = document.querySelector("#skip-confirm");
    if (!target) return;
    if (!hasAnswer(state.stage)) {
      return navigate(nextStageForCurrent());
    }
    target.innerHTML = `<div class="skip-confirm"><p>You already entered an answer here. Continue with it, or remove it before skipping?</p>
      <div class="actions"><button class="button secondary" type="button" data-action="keep-skip-answer">Continue with this answer</button>
      <button class="button primary" type="button" data-action="remove-skip">Remove answer and skip</button></div></div>`;
    target.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onAction));
    target.querySelector("button")?.focus();
  }
  function nextStageForOptional() {
    return ({ name: "guidance", guidance: "responsibilities", responsibilities: "location", location: "difficulty" })[state.stage] || "review";
  }
  async function onAction(event) {
    if (transitioning || conflicted) return;
    transitioning = true; // Before any await, including persisting a dirty field.
    root.setAttribute("aria-busy", "true");
    try { return await handleAction(event); }
    finally {
      transitioning = false;
      root.removeAttribute("aria-busy");
    }
  }
  async function handleAction(event) {
    const action = event.currentTarget.dataset.action;
    if (action.startsWith("task-")) return handleTaskAction(action, event.currentTarget.dataset.taskId);
    if (action === "next") return navigate(nextStageForCurrent());
    if (action === "back") {
      const target = state.stage === "starting" ? "review" : previousStageForCurrent();
      return navigate(target);
    }
    if (action === "skip") return showSkipConfirm();
    if (action === "keep-skip-answer") return navigate(nextStageForCurrent());
    if (action === "cancel-skip") return document.querySelector("#skip-confirm")?.replaceChildren();
    if (action === "remove-skip") {
      if (state.stage === "location") customRegionSelected = false;
      state.profile = clearField(state.profile, state.stage);
      dirty = true;
      revision += 1;
      const dest = editContext?.origin || (["difficulty", "followup"].includes(state.stage) ? "review" : nextStageForOptional());
      return navigate(dest);
    }
    if (action === "later" || action === "explore" || action === "workspace") return navigate("workspace");
    if (action === "resume") {
      editContext = null;
      return navigate(state.stage === "workspace" || state.stage === "welcome" ? state.resumeStage : state.stage);
    }
    if (action === "review") return navigate("review");
    if (action === "edit") {
      const previousContext = editContext;
      const origin = state.stage;
      editContext = { origin, entry: event.currentTarget.dataset.stage };
      if (!(await navigate(editContext.entry))) editContext = previousContext;
      return;
    }
    if (action === "confirm-clear") {
      const box = document.querySelector("#clear-confirm");
      box.innerHTML = `<div class="skip-confirm"><p>This removes the saved profile, setup progress, and all tasks from LifePilot on this computer. It cannot be restored through the app.</p>
        <div class="actions"><button class="button secondary" type="button" data-action="cancel-clear">Keep my data</button>
        <button class="button primary" type="button" data-action="clear">Clear all my local data</button></div></div>`;
      box.querySelectorAll("[data-action]").forEach((el) => el.addEventListener("click", onAction));
    }
    if (action === "cancel-clear") return document.querySelector("#clear-confirm")?.replaceChildren();
    if (action === "retry-save") return persist(true);
    if (action === "clear") {
      if (conflicted || ((dirty || activeSave) && !(await persist(false)))) return;
      clearTimeout(saveTimer);
      try {
        const response = await fetch("/api/clear", { method: "POST", headers: { "Content-Type": "application/json", "X-LifePilot-Request": "1", "X-LifePilot-Version": String(serverVersion) }, body: "{}" });
        const result = await response.json();
        if (response.status === 409) return reportConflict();
        if (!response.ok) throw new Error(result.error || "Could not clear local data.");
        serverVersion = result.version;
        state = result.state;
        tasks = result.tasks;
        taskDraft = "";
        taskEdit = null;
        taskMessage = "";
        taskFailed = false;
        completedOpen = false;
        openTasksExpanded = false;
        editContext = null;
        customRegionSelected = false;
        dirty = false;
        saveError = "";
        setStatus("Local data has been cleared.");
        render(true);
      } catch (error) { saveError = error.message; setStatus(error.message, true); }
    }
  }
  function nextStageForCurrent() {
    const s = state.stage;
    if (s === "difficulty") return state.profile.difficulty && state.profile.difficulty !== "unsure" ? "followup" : editContext?.origin || "review";
    if (editContext) return editContext.origin;
    if (s === "followup") return "review";
    return ({ welcome: "name", name: "guidance", guidance: "responsibilities", responsibilities: "location", location: "difficulty", review: "starting", starting: "workspace" })[s] || "workspace";
  }
  function previousStageForCurrent() {
    const s = state.stage;
    if (editContext) return s === "followup" && editContext.entry === "difficulty" ? "difficulty" : editContext.origin;
    if (s === "review") return state.profile.difficulty && state.profile.difficulty !== "unsure" ? "followup" : "difficulty";
    if (s === "followup") return "difficulty";
    return ({ name: "welcome", guidance: "name", responsibilities: "guidance", location: "responsibilities", difficulty: "location", starting: "review" })[s] || "welcome";
  }
  function clearField(profile, stage) {
    const p = { ...profile };
    if (stage === "name") p.nickname = "";
    if (stage === "guidance") p.guidance = [];
    if (stage === "responsibilities") { p.responsibilities = []; p.responsibilityOther = ""; }
    if (stage === "location") { p.countryRegion = ""; p.timeZone = ""; }
    if (stage === "difficulty") { p.difficulty = ""; p.difficultyOther = ""; p.followup = ""; p.followupOther = ""; }
    if (stage === "followup") { p.followup = ""; p.followupOther = ""; }
    return p;
  }
  async function start() {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your saved local setup.");
      const result = await response.json();
      state = result.state;
      tasks = result.tasks;
      serverVersion = result.version;
      render(true);
    } catch (error) {
      root.innerHTML = `<section class="card"><h1>LifePilot couldn't open your local setup</h1><p class="lead">${escapeText(error.message)}</p><p>Reload the page to retry. Your existing local data has not been changed.</p></section>`;
    }
  }
  retrySave.addEventListener("click", () => onAction({ currentTarget: { dataset: { action: "retry-save" } } }));
  reloadState.addEventListener("click", () => {
    if (!transitioning && conflicted && window.confirm("Reload saved data? This discards your unsaved draft in this window.")) window.location.reload();
  });
  start();
})();
