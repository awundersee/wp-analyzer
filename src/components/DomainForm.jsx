import { useMemo, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { fetchPages } from "../api/wordpressApi";
import { buildPageObjects } from "../services/buildPageObjects";
import { analyzeDomain } from "../api/backendClient";

export default function DomainForm() {
  const [domain, setDomain] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const preparedPageObjects = useMemo(() => {
    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const objs = buildPageObjects(selectedPages);
    return objs.slice(0, 100);
  }, [pages, selectedIds]);
  const [analysisResult, setAnalysisResult] = useState(null);  

  // Modal state für "Datenformat zeigen"
  const [modalObject, setModalObject] = useState(null);
  const modalElRef = useRef(null);
  const modalInstanceRef = useRef(null);

  const allSelected = useMemo(() => {
    if (pages.length === 0) return false;
    return selectedIds.size === pages.length;
  }, [pages, selectedIds]);

  const selectedCount = selectedIds.size;

  const resetForm = () => {
    setDomain("");
    setPages([]);
    setSelectedIds(new Set());
    setError(null);
    setInfo(null);
    setModalObject(null);
    setAnalysisResult(null);    
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      if (pages.length === 0) return new Set();
      if (prev.size === pages.length) return new Set();
      return new Set(pages.map((p) => p.id));
    });
  };

  const handleLoadPages = async (e) => {
    e.preventDefault();
    setAnalysisResult(null);
    setError(null);
    setInfo(null);
    setModalObject(null);

    setPages([]);
    setSelectedIds(new Set());

    setIsLoading(true);
    try {
      const result = await fetchPages(domain);

      // Optional: nach Titel sortieren
      result.sort((a, b) => {
        const ta = (a?.title?.rendered ?? "").toLowerCase();
        const tb = (b?.title?.rendered ?? "").toLowerCase();
        return ta.localeCompare(tb);
      });

      setPages(result);
      setSelectedIds(new Set(result.map((p) => p.id))); // default: alle ausgewählt
      setInfo(`Geladen: ${result.length} Seiten`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrepareSelected = () => {
    setError(null);
    setInfo(null);
    setAnalysisResult(null);

    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const pageObjects = buildPageObjects(selectedPages);

    const limited = pageObjects.slice(0, 100); // Frontend-seitig zusätzlich absichern
    setPreparedPageObjects(limited);

    console.group(`Prepared page objects (${limited.length})`);
    console.log(limited);
  };

  const handleAnalyze = async () => {
    setError(null);
    setInfo(null);
    setAnalysisResult(null);

    if (!domain) {
      setError("Bitte eine Domain eingeben.");
      return;
    }
    if (preparedPageObjects.length === 0) {
      setError("Bitte mindestens eine Seite auswählen.");
      return;
    }


    const payload = {
      domain,
      pages: preparedPageObjects.slice(0, 100).map((p) => ({
        id: p.id,
        name: p.name,
        url: p.url || "",
        text: p.text || "",
      })),
      // options darf drin bleiben – Backend ignoriert aktuell
    };

    console.group("Analysedaten");
    console.log(payload);
    console.groupEnd();
        
    setIsLoading(true);
    try {
      const result = await analyzeDomain(payload);
      console.group("Analyseergebnisse");
      console.log(result);
      console.groupEnd();      
      setAnalysisResult(result);
      setInfo("Analyse erfolgreich abgeschlossen.");
    } catch (err) {
      if (err.status === 401) {
        setError("Analyse nicht erlaubt: Backend-Schlüssel fehlt oder ist ungültig.");
      } else if (err.status === 400) {
        setError("Die Analyse-Daten sind ungültig oder unvollständig.");
      } else if (err.status === 413) {
        setError("Zu viele Seiten. Maximal 100 Seiten sind erlaubt.");
      } else {
        setError("Unerwarteter Fehler bei der Analyse.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showFormatForPage = (page) => {
    // Wir bauen das Seitenobjekt nur für diese eine Seite
    const [obj] = buildPageObjects([page]);
    setModalObject(obj ?? null);

    // Bootstrap JS Modal initialisieren & öffnen
    if (!modalInstanceRef.current && modalElRef.current) {
      modalInstanceRef.current = new Modal(modalElRef.current, {
        backdrop: true,
        keyboard: true,
        focus: true,
      });
    }
    modalInstanceRef.current?.show();
  };

  const meta = analysisResult?.meta;
  const domainResult = analysisResult?.domainResult;
  const pageResults = analysisResult?.pageResults ?? [];

  const pct = (count, total) => {
    if (!total || total <= 0) return null;
    return ((count / total) * 100).toFixed(1); // 1 Nachkommastelle
  };

  return (
    <>
      <div className="form-container position-relative">
        <form onSubmit={handleLoadPages} className="mb-3">
          <label className="form-label ms-2 d-none">WordPress Domain</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="https://example.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setAnalysisResult(null);
                setPreparedPageObjects([]);    
                setError(null);
                setInfo(null);
                setModalObject(null);
                setPages([]);
                setSelectedIds(new Set());
              }}
              disabled={isLoading}
            />

            {/* X-Button: nur anzeigen, wenn Inhalt vorhanden */}
            {domain && !isLoading && (
              <button
                type="button"
                className="btn bg-primary bg-opacity-25 text-primary"
                onClick={resetForm}
                title="Eingabe und Ergebnisse zurücksetzen"
              >
                &times;
              </button>
            )}

            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Lade..." : "Seiten laden"}
            </button>
          </div>
          <div className="form-text px-2 mt-2">
            Alternative: Es kann eine beliebige URL zu einem REST-Endpunkt angeben werden{" "}
            (z. B. <code>https://example.com/wp-json/custom/v1/pages</code>).{" "}
            Das zurückgelieferte Datenformat muss der WordPress REST API entsprechen.
          </div>
        </form>

        {/* Loader.gif bei "Seiten laden" */}
        {isLoading && (
          <div className="d-flex align-items-center gap-2 mb-3 position-absolute">
            <img src="/loader.gif" alt="Loading" width="28" height="3" />
            <span className="text-primary">Bitte warten</span>
          </div>
        )}

        {error && <div className="alert alert-danger position-absolute">{error}</div>}
        {info && <div className="alert alert-info position-absolute">{info}</div>}

      </div>

      {pages.length > 0 && !analysisResult && (
        <>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleAll}
            >
              {allSelected ? "Auswahl aufheben" : "Alle auswählen"}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAnalyze}
              disabled={isLoading || preparedPageObjects.length === 0}
              title={preparedPageObjects.length === 0 ? "Bitte mindestens eine Seite auswählen" : ""}
            >
              {isLoading ? "Analysiere..." : "Analyse starten"}
            </button>          

            <span className="text-muted ms-1">
              Ausgewählt: {selectedCount} / {pages.length}
            </span>

          </div>

          <ul className="list-group mb-3">
            {pages.map((page) => {
              const checked = selectedIds.has(page.id);

              return (
                <li
                  key={page.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center gap-2 flex-grow-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(page.id)}
                      aria-label={`Select page ${page.id}`}
                    />

                    {/* Name klickbar (toggle checkbox) */}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-start"
                      style={{ textDecoration: "none" }}
                      onClick={() => toggleOne(page.id)}
                      title="Auswahl umschalten"
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: page.title?.rendered ?? "(ohne Titel)",
                        }}
                      />
                    </button>
                  </div>

                  <div className="d-flex gap-2">
                    {/* Datenformat zeigen -> Modal */}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => showFormatForPage(page)}
                      title="Zeigt das vorbereitete Seitenobjekt"
                    >
                      Datenformat zeigen
                    </button>

                    {page.link && (
                        <a
                            className="btn btn-sm btn-outline-secondary"
                            href={page.link}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Seite zeigen
                        </a>
                    )}

                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Optional: Ergebnis-Vorschau (minimal) */}
      {analysisResult && (
      <div className="mt-4 analyze-container">
            {/* optional: Meta-Info oben */}
            {meta && (
              <div className="small text-secondary mb-3">
                <div><strong>Domain:</strong> {meta.domain}</div>
                <div>
                  <strong>Laufzeit:</strong> {meta.runtimeMs} ms<br></br>
                  <strong>Seiten:</strong> {meta.pagesReceived}
                </div>
              </div>
            )}

            {/* optional: Domain-Result als erstes Accordion-Item */}
            <div className="accordion mb-3" id="domainAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingDomain">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseDomain"
                    aria-expanded="false"
                    aria-controls="collapseDomain"
                  >
                    Gesamtauswertung
                  </button>
                </h2>
                <div
                  id="collapseDomain"
                  className="accordion-collapse collapse"
                  aria-labelledby="headingDomain"
                  data-bs-parent="#domainAccordion"
                >
                  <div className="accordion-body">

                    <div className="overview-container">

                      {meta?.wordCount != null && (
                        <span className="mb-2"><strong>Wortanzahl:</strong> {meta.wordCount}</span>
                      )}

                      {meta?.wordCharCount != null && (
                        <span className="mb-2"><strong>Wortzeichenanzahl:</strong> {meta.wordCharCount}</span>
                      )}

                      {meta?.charCount != null && (
                        <span className="mb-2"><strong>Gesamtzeichenanzahl:</strong> {meta.charCount}</span>
                      )}

                    </div>

                    <div className="row g-3 mt-2">
                      <div className="col-md-6">
                        <strong>Top-Wörter</strong>
                        <ul className="mb-3">
                          {(domainResult?.words ?? []).map((w) => (
                            <li key={w.word}>
                              <code>{w.word}</code>{" "}
                              <span className="text-secondary">
                                ({w.count}
                                {meta?.wordCount ? ` · ${pct(w.count, meta.wordCount)}%` : ""})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-md-6">
                        <strong>Top-Wortpaare</strong>
                        <ul className="mb-0">
                          {(domainResult?.bigrams ?? []).map((b, idx) => (
                            <li key={`${b.w1}-${b.w2}-${idx}`}>
                              <code>{b.w1} {b.w2}</code> <span className="text-secondary">({b.count})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* pro Seite: Accordion */}
            <div className="accordion" id="pagesAccordion">
              {pageResults.map((p, index) => {
                const headingId = `headingPage-${p.id ?? index}`;
                const collapseId = `collapsePage-${p.id ?? index}`;

                return (
                  <div className="accordion-item" key={p.id ?? `${p.url}-${index}`}>
                    <h2 className="accordion-header" id={headingId}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded="false"
                        aria-controls={collapseId}
                      >
                        <span className="me-2">{p.name ?? "?"}</span>
                      </button>
                    </h2>

                    <div
                      id={collapseId}
                      className="accordion-collapse collapse"
                      aria-labelledby={headingId}
                      data-bs-parent="#pagesAccordion"
                    >
                      <div className="accordion-body">
                        <div className="mb-2">
                          <a href={p.url} target="_blank" rel="noreferrer">
                            {p.url}
                          </a>
                        </div>

                        <div className="overview-container">

                          {p?.wordCount != null && (
                            <span className="mb-2"><strong>Wortanzahl:</strong> {p.wordCount}</span>
                          )}

                          {p?.wordCharCount != null && (
                            <span className="mb-2"><strong>Wortzeichenanzahl:</strong> {p.wordCharCount}</span>
                          )}

                          {p?.charCount != null && (
                            <span className="mb-2"><strong>Gesamtzeichenanzahl:</strong> {p.charCount}</span>
                          )}

                        </div>

                        <div className="row g-3 mt-2">
                          <div className="col-md-6">
                            <strong>Wörter</strong>
                            <ul className="mb-0">
                              {(p.words ?? []).map((w) => (
                                <li key={w.word}>
                                  <code>{w.word}</code>{" "}
                                  <span className="text-secondary">
                                    ({w.count}
                                    {meta?.wordCount ? ` · ${pct(w.count, meta.wordCount)}%` : ""})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="col-md-6">
                            <strong>Wortpaare</strong>
                            <ul className="mb-0">
                              {(p.bigrams ?? []).map((b, idx) => (
                                <li key={`${b.w1}-${b.w2}-${idx}`}>
                                  <code>{b.w1} {b.w2}</code> <span className="text-secondary">({b.count})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Rohdaten weiterhin in Konsole lassen, nicht im UI */}
                        {/* console.log machst du beim Setzen des Results */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      )}

      {/* Bootstrap Modal (zentriert, Bootstrap JS) */}
      <div className="modal fade" tabIndex="-1" aria-hidden="true" ref={modalElRef}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Datenformat (Seitenobjekt)</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              {!modalObject ? (
                <div className="text-muted">Kein Datenobjekt verfügbar.</div>
              ) : (
                <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(modalObject, null, 2)}
                </pre>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Schließen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}