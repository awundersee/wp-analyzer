// wordpressApi.js

function normalizeBase(input) {
  let s = String(input || "").trim();
  if (!s) {
    throw new Error("Bitte eine Domain oder einen REST-Endpunkt eingeben.");
  }

  if (!/^https?:\/\//i.test(s)) s = "https://" + s;

  try {
    return new URL(s);
  } catch {
    throw new Error(
      "Die eingegebene Domain oder URL ist ungültig. Beispiel: https://example.com"
    );
  }
}

function isJustOriginPath(u) {
  const p = (u.pathname || "").replace(/\/+$/, "");
  return p === "";
}

/**
 * input:
 *  - "https://example.com"                    -> defaultPath wird ergänzt
 *  - "https://example.com/irgendwas"          -> exakt übernommen
 *  - "https://example.com/wp-json/x/v1/pages"-> exakt übernommen
 */
export function buildApiUrl(input, defaultPath, params = {}) {
  const u = normalizeBase(input);

  let url;
  if (isJustOriginPath(u)) {
    if (!defaultPath?.startsWith("/")) {
      throw new Error("Interner Fehler: defaultPath ungültig.");
    }
    url = new URL(u.origin + defaultPath);
  } else {
    url = new URL(u.toString());
  }

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  return url.toString();
}

function mapFetchErrorToGerman(err, url) {
  const msg = String(err?.message ?? "");

  if (msg.includes("Failed to fetch")) {
    return (
      "Abruf fehlgeschlagen. Mögliche Ursachen: Die Domain ist nicht erreichbar, " +
      "die WordPress REST API ist deaktiviert oder CORS blockiert die Anfrage."
    );
  }

  if (msg.includes("Invalid URL") || msg.includes("URL")) {
    return "Die angegebene Domain oder URL ist ungültig. Bitte prüfe die Eingabe.";
  }

  if (msg.includes("401") || msg.includes("403")) {
    return (
      "Zugriff verweigert (401/403). Die WordPress REST API ist nicht öffentlich erreichbar."
    );
  }

  if (msg.includes("404")) {
    return (
      "REST-Endpunkt nicht gefunden (404). Bitte prüfe, ob die URL korrekt ist " +
      "und WordPress unter dieser Adresse erreichbar ist."
    );
  }

  if (msg.includes("NetworkError")) {
    return "Netzwerkfehler. Bitte prüfe deine Internetverbindung.";
  }

  return `Fehler beim Abruf der Daten. (${url})`;
}

// Wrapper
export async function fetchPages(baseOrFullUrl, { per_page = 100 } = {}) {
  let url;

  try {
    url = buildApiUrl(baseOrFullUrl, "/wp-json/wp/v2/pages", { per_page });
  } catch (err) {
    // Validierungsfehler (bereits auf Deutsch)
    throw err;
  }

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "Unerwartete Antwort vom Server. Der Endpunkt liefert keine Seitenliste."
      );
    }

    return data;
  } catch (err) {
    const msg = String(err?.message ?? "");

    // Wenn schon deutsche Meldung → direkt weiterreichen
    if (/Bitte|Zugriff|Fehler|Endpunkt|Domain|URL|Abruf/i.test(msg)) {
      throw err;
    }

    throw new Error(mapFetchErrorToGerman(err, url));
  }
}