/**
 * Deploy page UI.
 *
 * Self-contained HTML, CSS, and JavaScript for the drag-and-drop deploy
 * experience. No build step, no framework -- just template literals.
 */

// ── Public renderers ─────────────────────────────────────────────────────────

export function renderShell(
	body: string,
	options: {
		title?: string;
		siteDomain?: string;
		deployPath?: string;
	} = {},
): string {
	const title = options.title || "Internal Sites";

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <style>${CSS}</style>
</head>
<body>
  <main class="page">
    ${body}
  </main>
  <script>
    window.INTERNAL_SITE_DOMAIN = ${JSON.stringify(options.siteDomain || "")};
    window.INTERNAL_DEPLOY_PATH = ${JSON.stringify(options.deployPath || "/deploy")};
  </script>
</body>
</html>`;
}

export function renderDeployPage(options: {
	siteDomain: string;
	deployPath: string;
}): string {
	return renderShell(
		`
    <section class="hero">
      <p class="eyebrow">Internal Sites</p>
      <h1>Upload and deploy</h1>
      <p class="lede">Drop a site. Get a URL.</p>
      <p class="sublede">Upload static files and publish them behind company login.</p>
    </section>

    <section class="panel">
      <form id="deploy-form">
        <div class="settings-grid">
          <label class="field">
            <span>Site name</span>
            <input id="site-name" name="name" required placeholder="Team handbook" autocomplete="off">
          </label>

          <label class="field">
            <span>Internal URL</span>
            <div class="url-row">
              <input id="site-slug" name="slug" required pattern="[a-z0-9-]+" placeholder="team-handbook" autocomplete="off">
              <strong>.${esc(options.siteDomain)}</strong>
            </div>
          </label>
        </div>

        <div id="drop-zone" class="upload-card">
          <input id="file-input" type="file" webkitdirectory multiple hidden>
          <input id="zip-input" type="file" accept=".zip,application/zip" hidden>
          <div class="upload-card-header">
            <strong id="upload-heading">Drop a folder or ZIP here</strong>
            <button class="remove-button" type="button" id="remove-all" hidden>Remove all</button>
          </div>
          <div id="empty-state" class="empty-state">
            <p class="empty-title">Drop a folder or ZIP file here</p>
            <div class="button-row">
              <button class="secondary" type="button" id="folder-button">Browse folder</button>
              <button class="secondary" type="button" id="zip-button">Browse ZIP</button>
            </div>
          </div>
          <div id="file-summary" class="file-list muted" hidden>No files selected.</div>
        </div>

        <button id="deploy-button" class="primary" type="submit" disabled>Deploy site</button>
      </form>

      <div id="result" class="result" aria-live="polite"></div>
    </section>

    <section class="note">
      <strong>Protected by default.</strong>
      Every site requires company login via Cloudflare Access.
    </section>

    <script>${DEPLOY_SCRIPT}</script>
  `,
		{
			title: "Deploy Site",
			siteDomain: options.siteDomain,
			deployPath: options.deployPath,
		},
	);
}

export function renderNotFound(
	siteDomain: string,
	deployPath: string,
): string {
	return renderShell(
		`
    <section class="panel centered">
      <p class="eyebrow">404</p>
      <h1>Site not found</h1>
      <p class="lede">No site is configured for this URL.</p>
      <a class="link-button" href="${esc(deployPath)}">Deploy a site</a>
    </section>
  `,
		{ title: "Site not found", siteDomain, deployPath },
	);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function esc(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

// ── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
:root {
  color-scheme: light;
  --bg: #fff7ef;
  --panel: rgba(255, 255, 255, .9);
  --text: #1f1f1f;
  --muted: #766d65;
  --line: #eadfd4;
  --line-strong: #d9ccbf;
  --orange: #ff5f1f;
  --orange-soft: #fff0e6;
  --sunset: #ffb088;
  --green: #087f5b;
  --red: #b42318;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }
[hidden] { display: none !important; }

body {
  margin: 0;
  background:
    radial-gradient(circle at 8% -12%, rgba(255, 95, 31, .26), transparent 34rem),
    radial-gradient(circle at 78% 0%, rgba(255, 176, 136, .28), transparent 32rem),
    linear-gradient(180deg, #fffaf5 0%, var(--bg) 58%, #fffaf7 100%);
  color: var(--text);
  min-height: 100vh;
}

.page {
  width: min(1040px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 48px 0;
}

/* ── Hero ──────────────────────────────────────────────── */

.hero { margin-bottom: 30px; }

.eyebrow {
  color: var(--orange);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .14em;
  margin: 0 0 14px;
  text-transform: uppercase;
}

h1 {
  font-size: clamp(48px, 7vw, 82px);
  line-height: .92;
  letter-spacing: -.07em;
  margin: 0 0 12px;
  max-width: 900px;
}

.lede {
  color: var(--muted);
  font-size: clamp(19px, 2.2vw, 26px);
  line-height: 1.3;
  margin: 0;
  max-width: 780px;
}

.sublede {
  color: var(--muted);
  font-size: 18px;
  line-height: 1.45;
  margin: 8px 0 0;
  max-width: 780px;
}

/* ── Panel ─────────────────────────────────────────────── */

.panel {
  background: transparent;
  border: 0;
  padding: 0;
}

.centered { text-align: center; }

/* ── Settings grid ─────────────────────────────────────── */

.settings-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, .95fr) minmax(0, 1.35fr);
  margin-bottom: 20px;
}

.field { display: block; margin-bottom: 22px; }
.settings-grid .field { margin-bottom: 0; }

.field span {
  display: block;
  font-size: 14px;
  font-weight: 750;
  margin-bottom: 8px;
}

input {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--text);
  font: inherit;
  font-size: 16px;
  outline: none;
  padding: 16px 18px;
  width: 100%;
}

input:focus {
  border-color: var(--orange);
  box-shadow: 0 0 0 4px rgba(255, 106, 26, .12);
}

.url-row { align-items: center; display: flex; gap: 10px; }
.url-row input { flex: 1; min-width: 0; }
.url-row strong {
  color: var(--muted);
  font-size: 15px;
  font-weight: 650;
  white-space: nowrap;
}

/* ── Upload card ───────────────────────────────────────── */

.upload-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 28px 80px rgba(117, 75, 38, .12);
  overflow: hidden;
  transition: .15s ease;
}

.upload-card.dragging {
  background: var(--orange-soft);
  border-color: var(--orange);
}

.upload-card-header {
  align-items: center;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 24px;
}

.upload-card-header strong {
  font-size: 20px;
  font-weight: 750;
}

.remove-button {
  background: transparent;
  color: var(--muted);
  font-size: 16px;
  font-weight: 500;
  padding: 8px;
}

.remove-button:hover { color: var(--text); }

.empty-state {
  align-items: center;
  background: linear-gradient(180deg, rgba(255, 240, 230, .72), rgba(255, 255, 255, .72));
  border: 1px dashed rgba(255, 95, 31, .34);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 20px;
  min-height: 220px;
  padding: 30px;
  text-align: center;
}

.empty-title {
  color: var(--text);
  font-size: 24px;
  font-weight: 760;
  letter-spacing: -.025em;
  margin: 0 0 8px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

/* ── Buttons ───────────────────────────────────────────── */

button, .link-button {
  border: 0;
  border-radius: 14px;
  cursor: pointer;
  display: inline-block;
  font: inherit;
  font-weight: 700;
  padding: 12px 16px;
  text-decoration: none;
}

.primary {
  background: var(--orange);
  color: white;
  font-size: 18px;
  margin-top: 18px;
  width: 100%;
  box-shadow: 0 16px 34px rgba(255, 95, 31, .22);
}

.primary:disabled { cursor: not-allowed; opacity: .45; }

.secondary {
  background: white;
  border: 1px solid rgba(255, 95, 31, .35);
  color: var(--orange);
  padding: 11px 15px;
}

.secondary:hover {
  background: var(--orange);
  color: white;
}

.link-button { background: #1f1f1f; color: white; }

/* ── File list ─────────────────────────────────────────── */

.file-list {
  max-height: 420px;
  overflow: auto;
  padding: 18px 24px 24px;
}

.file-row {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) auto auto;
  min-height: 38px;
}

.file-name {
  align-items: center;
  display: flex;
  gap: 12px;
  min-width: 0;
}

.file-name span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-icon {
  color: var(--muted);
  flex: 0 0 auto;
  height: 20px;
  width: 20px;
}

.folder-chevron {
  color: var(--muted);
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 23px;
  line-height: 1;
  width: 12px;
}

.file-size {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.file-check {
  color: var(--orange);
  font-size: 23px;
  line-height: 1;
}

/* ── Result ────────────────────────────────────────────── */

.muted { color: var(--muted); }
.result { margin-top: 20px; }
.result-card { border-radius: 18px; padding: 22px; }
.result-card.success {
  background: #e8fff6;
  border: 1px solid #b7ebd5;
  color: var(--green);
}
.result-card.error {
  background: #fff0ee;
  border: 1px solid #ffd0cb;
  color: var(--red);
}
.result-card a { color: inherit; font-weight: 850; }

.success-url {
  font-size: 17px;
  margin: 12px 0;
  overflow-wrap: anywhere;
}

.success-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.success-actions a,
.success-actions button {
  align-items: center;
  background: #1f1f1f;
  border: 0;
  border-radius: 12px;
  color: white;
  display: inline-flex;
  font: inherit;
  font-weight: 750;
  justify-content: center;
  padding: 11px 14px;
  text-decoration: none;
}

.success-actions button.secondary-action {
  background: white;
  border: 1px solid #b7ebd5;
  color: var(--green);
}

/* ── Note ──────────────────────────────────────────────── */

.note {
  color: var(--muted);
  font-size: 15px;
  margin-top: 16px;
  padding-bottom: 8px;
}

/* ── Admin tables ──────────────────────────────────────── */

.dataContainer { margin-top: 24px; overflow-x: auto; }
.dataTable { border-collapse: collapse; min-width: 100%; }
.dataTable th, .dataTable td {
  border-bottom: 1px solid var(--line);
  padding: 10px;
  text-align: left;
  white-space: nowrap;
}
.dataTable th {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
}

/* ── Responsive ────────────────────────────────────────── */

@media (max-width: 640px) {
  .page { padding: 32px 0; }
  .settings-grid { grid-template-columns: 1fr; }
  .url-row { align-items: stretch; flex-direction: column; }
  .url-row strong { white-space: normal; }
  .upload-card-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }
  .empty-state { min-height: 220px; }
}
`;

// ── Client-side deploy script ────────────────────────────────────────────────

const DEPLOY_SCRIPT = `
const form = document.getElementById("deploy-form");
const nameInput = document.getElementById("site-name");
const slugInput = document.getElementById("site-slug");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const zipInput = document.getElementById("zip-input");
const folderButton = document.getElementById("folder-button");
const zipButton = document.getElementById("zip-button");
const emptyState = document.getElementById("empty-state");
const fileSummary = document.getElementById("file-summary");
const uploadHeading = document.getElementById("upload-heading");
const removeAllButton = document.getElementById("remove-all");
const deployButton = document.getElementById("deploy-button");
const result = document.getElementById("result");

let selectedFiles = [];
let selectedPaths = [];
let isZipSelection = false;

// ── Auto-slug from name ──────────────────────────────────

nameInput.addEventListener("input", function () {
  if (!slugInput.dataset.touched) {
    slugInput.value = slugify(nameInput.value);
  }
});

slugInput.addEventListener("input", function () {
  slugInput.dataset.touched = "true";
  slugInput.value = slugify(slugInput.value);
});

// ── Browse buttons ───────────────────────────────────────

folderButton.addEventListener("click", function () { fileInput.click(); });
zipButton.addEventListener("click", function () { zipInput.click(); });
removeAllButton.addEventListener("click", clearSelection);

fileInput.addEventListener("change", function () {
  setFiles(Array.from(fileInput.files || []), false);
});
zipInput.addEventListener("change", function () {
  setFiles(Array.from(zipInput.files || []), true);
});

// ── Drag and drop ────────────────────────────────────────

["dragenter", "dragover"].forEach(function (eventName) {
  dropZone.addEventListener(eventName, function (event) {
    event.preventDefault();
    dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach(function (eventName) {
  dropZone.addEventListener(eventName, function (event) {
    event.preventDefault();
    dropZone.classList.remove("dragging");
  });
});

dropZone.addEventListener("drop", async function (event) {
  var items = Array.from(event.dataTransfer.items || []);
  var files = Array.from(event.dataTransfer.files || []);

  if (items.some(function (item) { return item.webkitGetAsEntry; })) {
    var collected = [];
    for (var i = 0; i < items.length; i++) {
      var entry = items[i].webkitGetAsEntry && items[i].webkitGetAsEntry();
      if (entry) await collectEntryFiles(entry, "", collected);
    }
    selectedFiles = collected.map(function (item) { return item.file; });
    selectedPaths = collected.map(function (item) { return item.path; });
    isZipSelection = false;
    renderFileSummary();
    return;
  }

  setFiles(files, files.length === 1 && files[0].name.toLowerCase().endsWith(".zip"));
});

// ── Form submit ──────────────────────────────────────────

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  result.innerHTML = "";
  deployButton.disabled = true;
  deployButton.textContent = "Deploying...";

  try {
    var body = new FormData();
    body.set("name", nameInput.value);
    body.set("slug", slugInput.value);
    body.set("paths", JSON.stringify(selectedPaths));

    selectedFiles.forEach(function (file, index) {
      body.append("files", file, selectedPaths[index] || file.name);
    });

    var response = await fetch("/api/sites/deploy", { method: "POST", body: body });
    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Deploy failed");
    }

    result.innerHTML =
      '<div class="result-card success">' +
      "<strong>Site deployed.</strong>" +
      '<p class="success-url"><a href="' + data.url + '" target="_blank" rel="noreferrer">' + data.url + "</a></p>" +
      '<div class="success-actions">' +
      '<a href="' + data.url + '" target="_blank" rel="noreferrer">Open site</a>' +
      '<button class="secondary-action" type="button" id="copy-link">Copy link</button>' +
      "</div></div>";

    var copyButton = document.getElementById("copy-link");
    if (copyButton) {
      copyButton.addEventListener("click", async function () {
        await navigator.clipboard.writeText(data.url);
        copyButton.textContent = "Copied";
        setTimeout(function () { copyButton.textContent = "Copy link"; }, 1400);
      });
    }
  } catch (error) {
    result.innerHTML =
      '<div class="result-card error"><strong>Deploy failed.</strong><p>' +
      escapeHtml(error.message) +
      "</p></div>";
  } finally {
    deployButton.textContent = "Deploy site";
    deployButton.disabled = selectedFiles.length === 0;
  }
});

// ── File selection helpers ───────────────────────────────

function setFiles(files, isZip) {
  selectedFiles = files;
  selectedPaths = files.map(function (file) {
    return isZip ? file.name : (file.webkitRelativePath || file.name);
  });
  isZipSelection = isZip;
  renderFileSummary();
}

function clearSelection() {
  selectedFiles = [];
  selectedPaths = [];
  isZipSelection = false;
  fileInput.value = "";
  zipInput.value = "";
  renderFileSummary();
}

function renderFileSummary() {
  deployButton.disabled = selectedFiles.length === 0;

  if (selectedFiles.length === 0) {
    uploadHeading.textContent = "Drop a folder or ZIP here";
    emptyState.hidden = false;
    fileSummary.hidden = true;
    fileSummary.innerHTML = "";
    removeAllButton.hidden = true;
    return;
  }

  uploadHeading.textContent = "Uploading " + selectedFiles.length + " total file(s)";
  emptyState.hidden = true;
  fileSummary.hidden = false;
  removeAllButton.hidden = false;

  if (isZipSelection) {
    deployButton.disabled = selectedFiles.length !== 1 || !selectedFiles[0].name.toLowerCase().endsWith(".zip");
  }

  fileSummary.innerHTML = renderFileRows(selectedFiles, selectedPaths);
}

function renderFileRows(files, paths) {
  var rows = buildDisplayRows(files, paths);
  var visibleRows = rows.slice(0, 100).map(renderDisplayRow).join("");
  var remaining = rows.length > 100
    ? '<div class="file-row"><div class="file-name muted">+' + (rows.length - 100) + " more items</div><span></span><span></span></div>"
    : "";
  return visibleRows + remaining;
}

function buildDisplayRows(files, paths) {
  var rows = [];
  var seenDirs = new Set();

  files.forEach(function (file, index) {
    var normalizedPath = (paths[index] || file.name).replace(/\\\\/g, "/");
    var parts = normalizedPath.split("/").filter(Boolean);
    var fileName = parts[parts.length - 1] || file.name;

    for (var depth = 0; depth < parts.length - 1; depth++) {
      var dirPath = parts.slice(0, depth + 1).join("/");
      if (!seenDirs.has(dirPath)) {
        seenDirs.add(dirPath);
        rows.push({ type: "folder", name: parts[depth], path: dirPath, size: 0, depth: depth });
      }
    }

    if (fileName.startsWith(".")) return;

    rows.push({ type: "file", name: fileName, path: normalizedPath, size: file.size, depth: Math.max(0, parts.length - 1) });
  });

  return rows;
}

function renderDisplayRow(row) {
  return '<div class="file-row"><div class="file-name" style="padding-left: ' + (row.depth * 22) + 'px">' +
    rowIcon(row.type) +
    '<span title="' + escapeHtml(row.path) + '">' + escapeHtml(row.name) + "</span></div>" +
    '<span class="file-size">' + formatBytes(row.size) + "</span>" +
    '<span class="file-check">&#10003;</span></div>';
}

function rowIcon(type) {
  if (type === "folder") {
    return '<span class="folder-chevron">&#8250;</span><svg class="file-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6.5h6l2 2h10v9.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }
  return '<svg class="file-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" stroke-width="1.8"/><path d="M14 3v5h5" stroke="currentColor" stroke-width="1.8"/></svg>';
}

// ── Directory traversal ──────────────────────────────────

async function collectEntryFiles(entry, prefix, collected) {
  if (entry.isFile) {
    var file = await new Promise(function (resolve, reject) { entry.file(resolve, reject); });
    collected.push({ file: file, path: prefix + file.name });
    return;
  }

  if (entry.isDirectory) {
    var reader = entry.createReader();
    var entries = await readAllDirectoryEntries(reader);
    for (var i = 0; i < entries.length; i++) {
      await collectEntryFiles(entries[i], prefix + entry.name + "/", collected);
    }
  }
}

async function readAllDirectoryEntries(reader) {
  var entries = [];
  while (true) {
    var batch = await new Promise(function (resolve, reject) { reader.readEntries(resolve, reject); });
    if (!batch.length) return entries;
    entries.push.apply(entries, batch);
  }
}

// ── Utilities ────────────────────────────────────────────

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 63);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KiB";
  return (bytes / 1024 / 1024).toFixed(1) + " MiB";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}
`;
