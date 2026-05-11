import type { LocByLanguage } from "@opensec/db/schema";

export type ParsedCloc = {
  locTotal: number | null;
  locFiles: number | null;
  locBlank: number | null;
  locComment: number | null;
  locByLanguage: LocByLanguage;
  clocOutputRaw: string | null;
};

function parseNumber(value: string) {
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseClocOutput(raw: string | null): ParsedCloc {
  const clocOutputRaw = raw?.trim() || null;

  if (!clocOutputRaw) {
    return {
      locTotal: null,
      locFiles: null,
      locBlank: null,
      locComment: null,
      locByLanguage: {},
      clocOutputRaw: null,
    };
  }

  const locByLanguage: LocByLanguage = {};
  let totals = {
    locTotal: null as number | null,
    locFiles: null as number | null,
    locBlank: null as number | null,
    locComment: null as number | null,
  };

  for (const line of clocOutputRaw.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("-") || trimmed.startsWith("Language")) {
      continue;
    }

    const match = trimmed.match(/^(.+?)\s+(\d[\d,]*)\s+(\d[\d,]*)\s+(\d[\d,]*)\s+(\d[\d,]*)$/);

    if (!match) {
      continue;
    }

    const [, language, filesRaw, blankRaw, commentRaw, codeRaw] = match;
    const files = parseNumber(filesRaw);
    const blank = parseNumber(blankRaw);
    const comment = parseNumber(commentRaw);
    const code = parseNumber(codeRaw);

    if (files === null || blank === null || comment === null || code === null) {
      continue;
    }

    if (language === "SUM:") {
      totals = {
        locTotal: code,
        locFiles: files,
        locBlank: blank,
        locComment: comment,
      };
      continue;
    }

    locByLanguage[language] = { files, blank, comment, code };
  }

  if (totals.locTotal === null) {
    const rows = Object.values(locByLanguage);
    totals = {
      locTotal: rows.reduce((sum, row) => sum + row.code, 0) || null,
      locFiles: rows.reduce((sum, row) => sum + row.files, 0) || null,
      locBlank: rows.reduce((sum, row) => sum + row.blank, 0) || null,
      locComment: rows.reduce((sum, row) => sum + row.comment, 0) || null,
    };
  }

  return {
    ...totals,
    locByLanguage,
    clocOutputRaw,
  };
}
