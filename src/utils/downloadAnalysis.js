function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Excel DE: ; als Separator -> trotzdem sauber escapen
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows, delimiter = ";") {
  return rows.map((r) => r.map((v) => csvEscape(v)).join(delimiter)).join("\n");
}

function triggerDownload(filename, content, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadAnalysisCsv(result) {
  // result entspricht deinem Backend-Response: meta, domainResult, pageResults :contentReference[oaicite:0]{index=0}
  const domain = result?.meta?.domain ?? "domain";
  const safeDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "_");

  const rows = [];

  // Domain words
  rows.push(["SECTION", "rank", "word", "count"]);
  (result?.domainResult?.words ?? []).forEach((w, i) => {
    rows.push(["domain_words", i + 1, w.word, w.count]);
  });

  rows.push([]);

  // Domain bigrams
  rows.push(["SECTION", "rank", "w1", "w2", "count"]);
  (result?.domainResult?.bigrams ?? []).forEach((b, i) => {
    rows.push(["domain_bigrams", i + 1, b.w1, b.w2, b.count]);
  });

  rows.push([]);

  // Optional pageResults (falls vorhanden)
  rows.push(["SECTION", "pageId", "url", "rank", "word", "count"]);
  (result?.pageResults ?? []).forEach((p) => {
    (p.words ?? []).forEach((w, i) => {
      rows.push(["page_words", p.id, p.url, i + 1, w.word, w.count]);
    });
  });

  const csv = rowsToCsv(rows, ";");
  triggerDownload(`analysis_${safeDomain}.csv`, csv);
}

export function downloadAnalysisJson(result) {
  const domain = result?.meta?.domain ?? "domain";
  const safeDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/[^\w.-]+/g, "_");

  const json = JSON.stringify(result, null, 2);
  triggerDownload(`analysis_${safeDomain}.json`, json, "application/json;charset=utf-8");
}