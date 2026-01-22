import { extractTextFromHtml } from "./extractText";

export function buildPageObjects(wpPages) {
  return (wpPages ?? []).map((p) => {
    const html = p?.content?.rendered ?? "";
    return {
      id: p.id,
      name: p?.title?.rendered ?? "",
      url: p?.link ?? "",
      text: extractTextFromHtml(html),
    };
  });
}