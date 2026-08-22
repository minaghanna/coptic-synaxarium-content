import { readFile } from "node:fs/promises";

const contentURL = new URL("./synaxarium.json", import.meta.url);
const content = JSON.parse(await readFile(contentURL, "utf8"));
const errors = [];
const fail = (message) => errors.push(message);

if (!Number.isInteger(content.version) || content.version < 1) {
  fail(`version must be a positive integer; got ${content.version}`);
}
if (typeof content.updatedAt !== "string" || Number.isNaN(Date.parse(content.updatedAt))) {
  fail("updatedAt must be a valid RFC 3339 timestamp");
}
if (!content.days || typeof content.days !== "object" || Array.isArray(content.days)) {
  fail("days must be an object");
}

const expectedDays = new Set();
for (let month = 1; month <= 12; month += 1) {
  for (let day = 1; day <= 30; day += 1) expectedDays.add(`${month}-${day}`);
}
for (let day = 1; day <= 6; day += 1) expectedDays.add(`13-${day}`);

const actualDays = Object.keys(content.days ?? {});
if (actualDays.length !== 366) fail(`expected 366 days; got ${actualDays.length}`);
for (const day of expectedDays) if (!(day in (content.days ?? {}))) fail(`missing day ${day}`);
for (const day of actualDays) if (!expectedDays.has(day)) fail(`unexpected day ${day}`);

let readingCount = 0;
let sourceCount = 0;
const ids = new Set();

for (const [dayKey, day] of Object.entries(content.days ?? {})) {
  if (typeof day.copticDay !== "string" || !day.copticDay.trim()) {
    fail(`${dayKey}: copticDay is empty`);
  }
  if (!Array.isArray(day.readings) || day.readings.length === 0) {
    fail(`${dayKey}: readings must be a non-empty array`);
    continue;
  }

  for (const [index, reading] of day.readings.entries()) {
    readingCount += 1;
    const label = `${dayKey}.readings[${index}]`;
    for (const field of ["id", "copticDate", "title", "story"]) {
      if (typeof reading[field] !== "string" || !reading[field].trim()) {
        fail(`${label}: ${field} is empty`);
      }
    }
    if (reading.copticDate !== dayKey) {
      fail(`${label}: copticDate ${reading.copticDate} does not match parent ${dayKey}`);
    }

    if (ids.has(reading.id)) fail(`${label}: duplicate ID ${reading.id}`);
    ids.add(reading.id);

    if ("sourceURL" in reading) {
      sourceCount += 1;
      try {
        const sourceURL = new URL(reading.sourceURL);
        if (sourceURL.protocol !== "https:") fail(`${label}: sourceURL must use HTTPS`);
      } catch {
        fail(`${label}: sourceURL is not a valid URL`);
      }
    }
  }
}

if (readingCount !== 700) fail(`expected 700 readings; got ${readingCount}`);
if (ids.size !== readingCount) fail(`expected ${readingCount} unique IDs; got ${ids.size}`);

if (errors.length > 0) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Valid: ${actualDays.length} days, ${readingCount} readings, ${ids.size} unique stable IDs, ${sourceCount} sourced readings`);
}
