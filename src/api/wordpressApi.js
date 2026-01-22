import { normalizeUrl } from "../utils/normalizeUrl";

export async function fetchPages(domainInput) {
  const baseUrl = normalizeUrl(domainInput);
  if (!baseUrl) throw new Error("Bitte eine Domain eingeben.");

  const url = `${baseUrl}/wp-json/wp/v2/pages?per_page=100`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("WordPress REST API nicht erreichbar oder Zugriff blockiert.");
  }

  return await response.json();
}