import { useMemo, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { fetchPages } from "../api/wordpressApi";
import { buildPageObjects } from "../services/buildPageObjects";

export default function DomainForm() {
  const [domain, setDomain] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

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

    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const pageObjects = buildPageObjects(selectedPages);

    setInfo(`Vorbereitet: ${pageObjects.length} Seitenobjekte (für Backend-Analyse)`);
    console.log("Prepared page objects:", pageObjects);
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

  return (
    <>
      <form onSubmit={handleLoadPages} className="mb-3">
        <label className="form-label ms-2 d-none">WordPress Domain</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="https://example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
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
          Alternative: Eigener REST-Endpunkt (z. B. <code>https://example.com/wp-json/custom/v1/pages</code>){" "}
          mit vollständiger URL angeben.
        </div>
      </form>

      {/* Loader.gif bei "Seiten laden" */}
      {isLoading && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <img src="/loader.gif" alt="Loading" width="28" height="28" />
          <span className="text-muted">Seiten werden geladen…</span>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {info && <div className="alert alert-info">{info}</div>}

      {pages.length > 0 && (
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
              className="btn btn-success btn-sm"
              onClick={handlePrepareSelected}
              disabled={selectedCount === 0}
            >
              Daten vorbereiten
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