const GUIDANCE = [
  "smallerSteps",
  "moreExplanation",
  "startingPointHelp",
  "overviewFirst",
];
const RESPONSIBILITIES = [
  "workStudy",
  "homeProperty",
  "caring",
  "personalAdministration",
  "moneyBills",
  "other",
];
const DIFFICULTIES = [
  "remembering",
  "starting",
  "finding",
  "ongoing",
  "other",
  "unsure",
];
const FOLLOWUPS = {
  remembering: ["tasks", "appointments", "dates", "other"],
  starting: ["tooManyOptions", "tooBig", "unclearNextStep", "other"],
  finding: ["documents", "notes", "datesDetails", "other"],
  ongoing: ["whatNeedsDoing", "progress", "deadlines", "other"],
  other: ["ownWords"],
};
const STAGES = [
  "welcome",
  "name",
  "guidance",
  "responsibilities",
  "location",
  "difficulty",
  "followup",
  "review",
  "starting",
  "workspace",
];

class InvalidState extends Error {}

function blankState() {
  return {
    stage: "welcome",
    resumeStage: "name",
    profile: {
      nickname: "",
      guidance: [],
      responsibilities: [],
      responsibilityOther: "",
      countryRegion: "",
      timeZone: "",
      difficulty: "",
      difficultyOther: "",
      followup: "",
      followupOther: "",
    },
  };
}

function boundedText(value, max, label) {
  if (typeof value !== "string" || value.length > max || value.includes("\0")) {
    throw new InvalidState(`${label} must be text of at most ${max} characters.`);
  }
  return value.trim();
}

function validateTask(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== 2 || !Object.hasOwn(value, "title") ||
      !Object.hasOwn(value, "completed") || typeof value.completed !== "boolean") {
    throw new InvalidState("A task needs only a title and a completed status.");
  }
  const title = boundedText(value.title, 240, "Task");
  if (!title) throw new InvalidState("Enter something you'd like to do.");
  return { title, completed: value.completed };
}

function validateState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidState("Setup data must be an object.");
  }
  if (Object.keys(value).some((key) => !["stage", "resumeStage", "profile"].includes(key))) {
    throw new InvalidState("Setup data contains an unsupported field.");
  }
  if (!STAGES.includes(value.stage)) throw new InvalidState("Choose a valid setup stage.");
  const p = value.profile;
  if (!p || typeof p !== "object" || Array.isArray(p)) {
    throw new InvalidState("Profile data must be an object.");
  }
  const fields = [
    "nickname", "guidance", "responsibilities", "responsibilityOther",
    "countryRegion", "timeZone", "difficulty", "difficultyOther",
    "followup", "followupOther",
  ];
  if (Object.keys(p).some((key) => !fields.includes(key)) ||
      fields.some((key) => !Object.hasOwn(p, key))) {
    throw new InvalidState("Profile data contains missing or unsupported fields.");
  }
  const profile = {
    nickname: boundedText(p.nickname, 60, "Nickname"),
    guidance: p.guidance,
    responsibilities: p.responsibilities,
    responsibilityOther: boundedText(p.responsibilityOther, 120, "Other responsibility"),
    countryRegion: boundedText(p.countryRegion, 80, "Country or region"),
    timeZone: boundedText(p.timeZone, 80, "Time zone"),
    difficulty: p.difficulty,
    difficultyOther: boundedText(p.difficultyOther, 160, "Other difficulty"),
    followup: p.followup,
    followupOther: boundedText(p.followupOther, 160, "Follow-up"),
  };
  if (!Array.isArray(profile.guidance) || profile.guidance.length > GUIDANCE.length ||
      new Set(profile.guidance).size !== profile.guidance.length ||
      profile.guidance.some((x) => !GUIDANCE.includes(x))) {
    throw new InvalidState("Choose valid guidance preferences.");
  }
  if (!Array.isArray(profile.responsibilities) || profile.responsibilities.length > RESPONSIBILITIES.length + 1 ||
      new Set(profile.responsibilities).size !== profile.responsibilities.length ||
      profile.responsibilities.some((x) => !RESPONSIBILITIES.includes(x) && x !== "financialGoals")) {
    throw new InvalidState("Choose valid responsibilities.");
  }
  // Preserve earlier profiles now that financial goals are covered by money and bills.
  profile.responsibilities = [...new Set(profile.responsibilities.map((value) =>
    value === "financialGoals" ? "moneyBills" : value))];
  if (!profile.responsibilities.includes("other") && profile.responsibilityOther) {
    throw new InvalidState("Add or remove the other-responsibility description.");
  }
  if (profile.timeZone) {
    try {
      new Intl.DateTimeFormat("en", { timeZone: profile.timeZone });
    } catch {
      throw new InvalidState("Choose a valid time zone.");
    }
  }
  if (!DIFFICULTIES.includes(profile.difficulty) && profile.difficulty !== "") {
    throw new InvalidState("Choose a valid difficulty.");
  }
  if (profile.difficulty !== "other" && profile.difficultyOther) {
    throw new InvalidState("Add or remove the other-difficulty description.");
  }
  if (profile.difficulty && FOLLOWUPS[profile.difficulty]) {
    if (profile.followup && !FOLLOWUPS[profile.difficulty].includes(profile.followup)) {
      throw new InvalidState("That follow-up does not match the selected difficulty.");
    }
  } else if (profile.followup || profile.followupOther) {
    throw new InvalidState("Remove the follow-up because none is needed.");
  }
  if (!["other", "ownWords"].includes(profile.followup) && profile.followupOther) {
    throw new InvalidState("Add or remove the follow-up description.");
  }
  const resumeStage = value.resumeStage === undefined ? "name" : value.resumeStage;
  if (!STAGES.includes(resumeStage) || resumeStage === "workspace") {
    throw new InvalidState("Choose a valid setup resume point.");
  }
  return { stage: value.stage, resumeStage, profile };
}

function followupStage(profile) {
  return profile.difficulty && profile.difficulty !== "unsure" ? "followup" : "review";
}

function nextStage(state) {
  const { stage, profile } = state;
  if (stage === "welcome") return "name";
  if (stage === "name") return "guidance";
  if (stage === "guidance") return "responsibilities";
  if (stage === "responsibilities") return "location";
  if (stage === "location") return "difficulty";
  if (stage === "difficulty") return followupStage(profile);
  if (stage === "followup") return "review";
  if (stage === "review") return "starting";
  if (stage === "starting") return "workspace";
  return "workspace";
}

function previousStage(stage) {
  const i = STAGES.indexOf(stage);
  if (stage === "review") return "difficulty";
  return STAGES[Math.max(0, i - 1)];
}

function changeDifficulty(profile, difficulty, difficultyOther = "") {
  return {
    ...profile,
    difficulty,
    difficultyOther: difficulty === "other" ? difficultyOther : "",
    followup: "",
    followupOther: "",
  };
}

function clearAnswer(profile, field) {
  const updated = { ...profile };
  if (field === "nickname") updated.nickname = "";
  if (field === "guidance") updated.guidance = [];
  if (field === "responsibilities") {
    updated.responsibilities = [];
    updated.responsibilityOther = "";
  }
  if (field === "location") {
    updated.countryRegion = "";
    updated.timeZone = "";
  }
  if (field === "difficulty") {
    updated.difficulty = "";
    updated.difficultyOther = "";
    updated.followup = "";
    updated.followupOther = "";
  }
  if (field === "followup") {
    updated.followup = "";
    updated.followupOther = "";
  }
  return updated;
}

module.exports = {
  GUIDANCE, RESPONSIBILITIES, DIFFICULTIES, FOLLOWUPS, STAGES,
  blankState, validateState, nextStage, previousStage, followupStage,
  changeDifficulty, clearAnswer, InvalidState,
  validateTask,
};
