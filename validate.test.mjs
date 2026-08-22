import assert from "node:assert/strict";
import test from "node:test";

import { isRFC3339InternetDateTime } from "./timestamp.mjs";

test("accepts RFC 3339 internet date-time timestamps supported by the app", () => {
  for (const timestamp of [
    "2026-08-21T00:00:00Z",
    "2026-08-21T00:00:00.123Z",
    "2024-02-29T23:59:59-08:00",
    "2026-08-21T12:34:56+14:00",
  ]) {
    assert.equal(isRFC3339InternetDateTime(timestamp), true, timestamp);
  }
});

test("rejects partial, permissively parsed, and invalid timestamps", () => {
  for (const timestamp of [
    "2026-08-21",
    "2026-08-21 00:00:00Z",
    "2026-08-21T00:00:00",
    "2026-08-21T00:00Z",
    "2026-02-29T00:00:00Z",
    "2026-02-30T00:00:00Z",
    "2026-08-21T24:00:00Z",
    "2026-08-21T23:59:60Z",
    "2026-08-21T00:00:00+14:01",
    "2026-08-21T00:00:00+24:00",
  ]) {
    assert.equal(isRFC3339InternetDateTime(timestamp), false, timestamp);
  }
});

test("rejects non-string timestamps", () => {
  for (const timestamp of [undefined, null, 0, {}]) {
    assert.equal(isRFC3339InternetDateTime(timestamp), false);
  }
});
