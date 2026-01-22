import { useMemo, useState } from "react";
import { fetchPages } from "../api/wordpressApi";
import { buildPageObjects } from "../services/buildPageObjects";

export default function DomainForm() {
  const [domain, setDomain] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [prepared, setPrepared] = useState([]);

  const allSelected = useMemo(() => {
    if (pages.length === 0) return false;
    return selectedIds.size === pages.length;
  }, [pages, selectedIds]);

  const selectedCount = selectedIds.size;

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
    setPrepared([]);
    setPages([]);
    setSelectedIds(new Set());

    try {
      const result = await fetchPages(domain);

      // Optional: nach Titel sortieren (schöner für UI)
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
    }
  };

  const handlePrepare = () => {
    setError(null);
    setInfo(null);

    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const pageObjects = buildPageObjects(selectedPages);

    setPrepared(pageObjects);
    setInfo(
      `Vorbereitet: ${pageObjects.length} Seitenobjekte (für Backend-Analyse)`
    );

    // Für Debug / Kontrolle
    console.log("Prepared page objects:", pageObjects);
  };

  return (
    <>
      <form onSubmit={handleLoadPages} className="mb-3">
        <label className="form-label">WordPress Domain</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="https://example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Seiten laden
          </button>
        </div>
        <div className="form-text">
          Voraussetzung: WordPress REST API ist erreichbar (
          <code>/wp-json/wp/v2/pages</code>).
        </div>
      </form>

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
              onClick={handlePrepare}
              disabled={selectedCount === 0}
            >
              Daten vorbereiten
            </button>

            <span className="text-muted ms-1">
              Ausgewählt: {selectedCount} / {pages.length}
            </span>
          </div>

          <ul className="list-group mb-3">
            {pages.map((page) => (
              <li
                key={page.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center gap-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={selectedIds.has(page.id)}
                    onChange={() => toggleOne(page.id)}
                    aria-label={`Select page ${page.id}`}
                  />

                  <span
                    dangerouslySetInnerHTML={{
                      __html: page.title?.rendered ?? "(ohne Titel)",
                    }}
                  />
                </div>

                <a
                  className="btn btn-sm btn-outline-secondary"
                  href={page.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Öffnen
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      {prepared.length > 0 && (
        <div className="card">
          <div className="card-header">Preview (1. Objekt)</div>
          <div className="card-body">
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(prepared[0], null, 2)}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}