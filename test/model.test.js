const test = require("node:test");
const assert = require("node:assert/strict");
const {
  blankState, validateState, nextStage, previousStage, changeDifficulty,
} = require("../model");

test("blank profile can be validated and setup moves through at most one follow-up", () => {
  const state = validateState(blankState());
  assert.equal(nextStage(state), "name");
  assert.equal(previousStage("name"), "welcome");
  assert.equal(nextStage({ ...state, stage: "difficulty", profile: { ...state.profile, difficulty: "unsure" } }), "review");
  assert.equal(nextStage({ ...state, stage: "difficulty", profile: { ...state.profile, difficulty: "finding" } }), "followup");
  assert.equal(nextStage({ ...state, stage: "followup" }), "review");
});

test("changing the selected difficulty clears its dependent answer", () => {
  const populated = { ...blankState().profile, difficulty: "finding", followup: "documents", followupOther: "" };
  const changed = changeDifficulty(populated, "remembering");
  assert.equal(changed.difficulty, "remembering");
  assert.equal(changed.followup, "");
  assert.equal(changed.followupOther, "");
  assert.throws(() => validateState({ stage: "review", profile: { ...populated, difficulty: "remembering" } }), /does not match/);
});

test("validation rejects unknown fields, invalid choices, oversized text, and invalid IANA zones", () => {
  const state = blankState();
  assert.throws(() => validateState({ ...state, extra: true }), /unsupported field/);
  assert.throws(() => validateState({ ...state, profile: { ...state.profile, guidance: ["surprise"] } }), /guidance preferences/);
  assert.throws(() => validateState({ ...state, profile: { ...state.profile, nickname: "x".repeat(61) } }), /at most 60/);
  assert.throws(() => validateState({ ...state, profile: { ...state.profile, timeZone: "Mars/Olympus" } }), /valid time zone/);
  assert.throws(() => validateState({ ...state, profile: { ...state.profile, followup: "documents" } }), /none is needed/);
});

test("valid profile supports combined preferences, multiple responsibilities, and independent location fields", () => {
  const state = blankState();
  state.stage = "review";
  state.profile.guidance = ["overviewFirst", "smallerSteps", "moreExplanation", "startingPointHelp"];
  state.profile.responsibilities = ["workStudy", "homeProperty", "other"];
  state.profile.responsibilityOther = "Community volunteering";
  state.profile.countryRegion = "Example region";
  state.profile.timeZone = "Europe/Paris";
  state.profile.difficulty = "starting";
  state.profile.followup = "tooBig";
  assert.deepEqual(validateState(state), state);
});

test("earlier financial-goals selections are preserved under money and bills", () => {
  const state = blankState();
  state.profile.responsibilities = ["financialGoals"];
  assert.deepEqual(validateState(state).profile.responsibilities, ["moneyBills"]);
  assert.equal(state.profile.difficulty, "");
  state.profile.responsibilities.push("moneyBills");
  assert.deepEqual(validateState(state).profile.responsibilities, ["moneyBills"]);
  assert.deepEqual(validateState(blankState()), blankState());
});
