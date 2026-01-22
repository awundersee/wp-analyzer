export function normalizeUrl(input) {
  if (!input) return "";

  let url = input.trim();

  // falls User nur domain.tld eingibt
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // trailing slash weg
  url = url.replace(/\/+$/, "");

  return url;
}
