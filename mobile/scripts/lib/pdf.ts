// Extrae texto de un PDF con pdftotext (poppler, -enc UTF-8 para acentos).
// Es el primer eslabón de "alimentar Cortex con libros": PDF → texto → átomos.
// (En local usamos pdftotext; el día que esto corra en una Edge Function habrá
// que extraer el texto antes y pasarlo, porque Deno no tiene pdftotext.)

import { execFileSync } from "node:child_process";

export function pdfToText(path: string, maxChars = 90000): string {
  const raw = execFileSync("pdftotext", ["-enc", "UTF-8", path, "-"], {
    maxBuffer: 128 * 1024 * 1024,
  }).toString("utf8");
  const clean = raw
    .replace(/\f/g, " ") // saltos de página → espacio
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  // recorta para no disparar el coste de tokens; Sonnet tiene contexto de sobra
  // pero un libro entero puede ser caro. 90k chars ≈ 25-30k tokens.
  return clean.length > maxChars ? clean.slice(0, maxChars) : clean;
}
