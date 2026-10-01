'use strict';

/*
 * Helpers that read, validate and extend CHANGELOG.md while preserving the project's established format:
 *
 *   # [26.1.10](https://github.com/pegasystems/angular-sdk/tree/release/26.1.10)            <- in-progress release (no date)
 *   # [25.1.13](https://github.com/pegasystems/angular-sdk/tree/release/25.1.13) - Released: 12/06/2026
 *
 *   ### **Features**
 *   *   **Added support for X.**
 *       * Github: [PR-545](https://github.com/pegasystems/angular-sdk-components/pull/545)
 *   ### **Bug fixes**
 *   *   **Fixed Y.**
 *         * Github: [PR-486](https://github.com/pegasystems/angular-sdk-components/pull/486)
 */

const REPO_PR_URL = 'https://github.com/pegasystems/angular-sdk-components/pull';
const RELEASE_URL = 'https://github.com/pegasystems/angular-sdk/tree/release';

const HEADING_RE =
  /^# \[(\d+\.\d+\.\d+)\]\((https:\/\/github\.com\/pegasystems\/angular-sdk\/tree\/release\/[^)]+)\)(?: - Released: (\d{2})\/(\d{2})\/(\d{4}))?\s*$/;

/** Section names in canonical order with the indentation used for their "Github:" lines. */
const SECTIONS = {
  feature: { title: 'Features', indent: 4 },
  fix: { title: 'Bug fixes', indent: 6 },
  refactor: { title: 'Refactoring', indent: 4 }
};
const KNOWN_SECTION_TITLES = ['Features', 'Bug fixes', 'Refactoring', 'Dependencies & Infrastructure'];

const prLink = n => `[PR-${n}](${REPO_PR_URL}/${n})`;

/** Splits text into release blocks: [{ start, end, version, date|undefined, headingLine }] using line indexes. */
function parseReleases(lines) {
  const releases = [];
  lines.forEach((line, i) => {
    if (!line.startsWith('# ')) return;
    const m = HEADING_RE.exec(line);
    releases.push({ start: i, version: m ? m[1] : undefined, date: m && m[3] ? `${m[3]}/${m[4]}/${m[5]}` : undefined, valid: !!m, line });
  });
  releases.forEach((r, i) => {
    r.end = i + 1 < releases.length ? releases[i + 1].start : lines.length;
  });
  return releases;
}

function validDate(d) {
  const [dd, mm, yyyy] = d.split('/').map(Number);
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  return dt.getUTCFullYear() === yyyy && dt.getUTCMonth() === mm - 1 && dt.getUTCDate() === dd;
}

/** @returns {string[]} problems found; an empty array means the file follows the format. */
function checkChangelog(text) {
  const problems = [];
  const lines = text.split('\n');
  const releases = parseReleases(lines);
  if (!releases.length) return ['no release headings found'];
  if (releases[0].start !== 0) problems.push('file must start with the newest release heading');

  const seen = new Set();
  releases.forEach((r, idx) => {
    const where = `line ${r.start + 1}`;
    if (!r.valid) {
      problems.push(`${where}: heading must look like "# [x.y.z](${RELEASE_URL}/x.y.z)" optionally followed by " - Released: dd/mm/yyyy"`);
      return;
    }
    const expectedUrl = `${RELEASE_URL}/${r.version}`;
    if (!r.line.includes(`(${expectedUrl})`)) problems.push(`${where}: link must be ${expectedUrl}`);
    if (seen.has(r.version)) problems.push(`${where}: duplicate release ${r.version}`);
    seen.add(r.version);
    if (r.date) {
      if (!validDate(r.date)) problems.push(`${where}: invalid date ${r.date}`);
    } else if (idx !== 0) {
      problems.push(`${where}: only the newest release may omit "- Released: dd/mm/yyyy"`);
    }

    for (let i = r.start + 1; i < r.end; i += 1) {
      const line = lines[i];
      const sec = /^### (?:\*\*)?(.+?)(?:\*\*)?\s*$/.exec(line);
      if (sec && !KNOWN_SECTION_TITLES.includes(sec[1]))
        problems.push(`line ${i + 1}: unknown section "${sec[1]}" (allowed: ${KNOWN_SECTION_TITLES.join(', ')})`);
      // Link consistency is enforced for the newest release only; older entries are history and are not rewritten.
      for (const m of idx === 0 ? line.matchAll(/\[PR-(\d+)\]\(([^)]*)\)/g) : []) {
        if (m[2] !== `${REPO_PR_URL}/${m[1]}`) problems.push(`line ${i + 1}: PR link for ${m[1]} must be ${REPO_PR_URL}/${m[1]}`);
      }
      if (/Github:/.test(line) && !/\[PR-\d+\]\(/.test(line))
        problems.push(`line ${i + 1}: "Github:" line must contain at least one [PR-n](url) link`);
    }
  });
  return problems;
}

function formatEntry(type, text, prs) {
  const { indent } = SECTIONS[type];
  const cleaned = text.trim().replace(/^\*\*|\*\*$/g, '');
  const links = prs.map(prLink).join(', ');
  return [`*   **${cleaned}**`, `${' '.repeat(indent)}* Github: ${links}`];
}

/** Starts a new in-progress release at the top. Throws if the newest release is not yet dated. */
function startRelease(text, version) {
  const lines = text.split('\n');
  const [newest] = parseReleases(lines);
  if (newest && newest.valid && !newest.date) throw new Error(`release ${newest.version} is still in progress; finish it first`);
  if (newest && newest.version === version) throw new Error(`release ${version} already exists`);
  return `# [${version}](${RELEASE_URL}/${version})\n\n${text}`;
}

/** Adds an entry under the in-progress release (creating the section in canonical order if needed). */
function addEntry(text, { type, text: entryText, prs }) {
  if (!SECTIONS[type]) throw new Error(`type must be one of: ${Object.keys(SECTIONS).join(', ')}`);
  if (!entryText || !entryText.trim()) throw new Error('entry text is required');
  if (!prs || !prs.length || prs.some(n => !/^\d+$/.test(String(n)))) throw new Error('at least one numeric PR number is required');

  const lines = text.split('\n');
  const [top] = parseReleases(lines);
  if (!top || !top.valid) throw new Error('CHANGELOG.md has no valid release heading');
  if (top.date) throw new Error(`newest release ${top.version} is already dated; start a new one with --new-release <version>`);

  const sectionTitle = SECTIONS[type].title;
  const headingRe = new RegExp(`^### (?:\\*\\*)?${sectionTitle}(?:\\*\\*)?\\s*$`);
  const entry = formatEntry(type, entryText, prs.map(String));

  let secStart = -1;
  for (let i = top.start + 1; i < top.end; i += 1) if (headingRe.test(lines[i])) secStart = i;

  if (secStart >= 0) {
    const existing = lines.slice(secStart, top.end);
    const dup = prs.map(String).find(n => existing.some(l => l.includes(`[PR-${n}](`)));
    if (dup) throw new Error(`PR-${dup} is already listed under "${sectionTitle}"; edit the existing entry instead`);
    let end = secStart + 1;
    for (let i = secStart + 1; i < top.end; i += 1) {
      if (/^### /.test(lines[i]) || lines[i].trim() === '---') break;
      if (lines[i].trim() !== '') end = i + 1;
    }
    lines.splice(end, 0, ...entry);
  } else {
    // Insert before the first later canonical section, otherwise at the end of the release block.
    const order = ['Features', 'Bug fixes', 'Refactoring', 'Dependencies & Infrastructure'];
    const later = order.slice(order.indexOf(sectionTitle) + 1);
    let at = -1;
    for (let i = top.start + 1; i < top.end && at < 0; i += 1) {
      const sec = /^### (?:\*\*)?(.+?)(?:\*\*)?\s*$/.exec(lines[i]);
      if (sec && later.includes(sec[1])) at = i;
    }
    if (at < 0) {
      at = top.end;
      while (at > top.start + 1 && lines[at - 1].trim() === '') at -= 1;
    }
    const block = ['', `### **${sectionTitle}**`, ...entry];
    if (at < lines.length && lines[at].trim() !== '') block.push('');
    lines.splice(at, 0, ...block);
  }
  return lines.join('\n');
}

/** Stamps the in-progress release with its release date (dd/mm/yyyy). */
function stampRelease(text, date) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date) || !validDate(date)) throw new Error('date must be a valid dd/mm/yyyy');
  const lines = text.split('\n');
  const [top] = parseReleases(lines);
  if (!top || !top.valid) throw new Error('CHANGELOG.md has no valid release heading');
  if (top.date) throw new Error(`release ${top.version} is already dated ${top.date}`);
  lines[top.start] = `${lines[top.start].trimEnd()} - Released: ${date}`;
  return lines.join('\n');
}

module.exports = { checkChangelog, addEntry, startRelease, stampRelease, parseReleases, prLink, REPO_PR_URL, RELEASE_URL };
