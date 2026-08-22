# Coptic Synaxarium content

This directory is the canonical, app-independent Synaxarium content source. `synaxarium.json` uses this top-level shape:

```json
{
  "version": 1,
  "updatedAt": "2026-08-21T00:00:00Z",
  "days": {
    "1-1": {
      "copticDay": "Thout 1",
      "readings": [
        { "id": "...", "copticDate": "1-1", "title": "...", "story": "...", "sourceURL": "..." }
      ]
    }
  }
}
```

`sourceURL` is optional and must only be added after checking that the linked source supports that specific reading. Every reading ID must be a non-empty, globally unique, immutable identifier. An ID is the durable identity used by deep links and future persisted features; it is deliberately independent of editable fields such as the title, Coptic date, and story.

## Editorial changes in version 1

Only the previously audited errors were corrected:

- Kiahk 26 (`4-26`), St. Anastasia: corrected the martyrdom year from `34 A.D.` to `304 A.D.`. Source: [St-Takla English Synaxarium](https://st-takla.org/books/en/church/synaxarium/04-keyahk/26-kiahk-anastasia.html).
- Paremoude 27 (`8-27`), St. Boctor Ebn Romanus: replaced the unrelated St. Mark story with a new English summary based on the correct Boctor reading. Source: [St-Takla English Synaxarium](https://st-takla.org/books/en/church/synaxarium/08-bermodah/27-baramouda-boctor.html).
- Epip 25 (`11-25`): retained the already-correct Abakragoun story, moved the existing Domadius story from the Palamon record to Domadius, replaced Mercurius's duplicate Abakragoun story with the church-consecration reading, and replaced Palamon's shifted Domadius story with a source-based English summary. Sources: [Abakragoun](https://st-takla.org/books/en/church/synaxarium/11-abeeb/25-epep-abakragoun.html), [Domadius](https://st-takla.org/books/en/church/synaxarium/11-abeeb/25-epep-domadius.html), [Mercurius](https://st-takla.org/books/en/church/synaxarium/11-abeeb/25-epep-mercurius.html), and [Palamon](https://st-takla.org/books/en/church/synaxarium/11-abeeb/25-epep-palamon.html).

No other title, Coptic date, or story text was edited during the import.

## Edit and validate

1. Edit `synaxarium.json`; keep each reading's `copticDate` equal to its parent day key.
2. Add `sourceURL` only after verifying the source. For a published content change, increment `version` and set `updatedAt` to the publication time in UTC.
3. Preserve an existing reading's ID across title, date, story, and source edits. Assign a new unique ID only when adding a genuinely new reading; never recycle a deleted reading's ID for different content.
4. Run `node validate.mjs` and review the diff before publishing. The validator enforces non-empty, globally unique IDs, but editorial review is responsible for catching accidental changes to an existing ID.

## Publish and roll back

After the remote repository exists, clients will read the stable raw `main` URL:

`https://raw.githubusercontent.com/minaghanna/coptic-synaxarium-content/main/synaxarium.json`

For each publication, validate, review the diff, commit to `main`, and push. To roll back bad content, revert the bad editorial commit, increment `version`, update `updatedAt`, run `node validate.mjs`, and publish that new corrective commit. Never decrease or reuse a version clients may already have cached.
