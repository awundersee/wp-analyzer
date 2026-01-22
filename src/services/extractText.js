// src/services/extractText.js

/**
 * Ziel: stabiler Fließtext aus WP content.rendered
 * - entfernt <script>/<style> (auch wenn "versteckt" im String)
 * - entfernt Gutenberg-Kommentare
 * - entfernt Shortcode-Tags, ABER behält den Inhalt dazwischen
 * - entfernt Medien/Embeds-Elemente (img, video, iframe, ...)
 */
export function extractTextFromHtml(inputHtml) {
  if (!inputHtml) return "";

  let html = String(inputHtml);

  // 1) Gutenberg Block Comments entfernen: <!-- wp:... --> und <!-- /wp:... -->
  html = html.replace(/<!--\s*\/?wp:.*?-->/gis, " ");

  // Normale HTML-Kommentare entfernen
  html = html.replace(/<!--[\s\S]*?-->/g, " ");

  // 2) <script> und <style> schon im String entfernen (falls DOMParser sie nicht sauber "fasst")
  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gis,
    " "
  );
  html = html.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gis,
    " "
  );

  // 3) WordPress-Shortcodes: NUR die Shortcode-Tags entfernen, Inhalt behalten
  // Entfernt z.B. [vc_row], [vc_column], [/vc_row], [gallery ids="..."], [embed] etc.
  // (lässt den Text, der zwischen den Tags steht, stehen)
  html = html.replace(/\[\/?[a-zA-Z][\w:-]*(?:\s+[^\]]*)?]/g, " ");

  // 4) DOM parse
  const doc = new DOMParser().parseFromString(html, "text/html");

  // 5) Nicht-textuelle/Embed-Elemente entfernen
  const removeSelectors = [
    "noscript",
    "template",
    "iframe",
    "svg",
    "canvas",
    "img",
    "video",
    "audio",
    "source",
    "picture",
    "object",
    "embed",
    "form",
    "button",
    "input",
    "select",
    "textarea",
  ];
  doc.querySelectorAll(removeSelectors.join(",")).forEach((el) => el.remove());

  // Optional: offensichtlich versteckte Elemente raus
  doc.querySelectorAll("[hidden], [aria-hidden='true']").forEach((el) =>
    el.remove()
  );

  // 6) Text extrahieren
  let text = doc.body?.textContent ?? "";

  // 7) Whitespace normalisieren
  text = text
    .replace(/\u00a0/g, " ") // &nbsp;
    .replace(/\s+/g, " ")
    .trim();

  return text;
}