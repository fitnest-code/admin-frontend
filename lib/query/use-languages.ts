import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export interface Language {
  code: string;
}

const FALLBACK_LANGUAGES = ["AZ", "EN", "RU"] as const;

export function normalizeLanguageCodes(raw: unknown): string[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as { data?: unknown })?.data)
      ? (raw as { data: unknown[] }).data
      : [];

  const codes = list
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "code" in item) {
        return String((item as Language).code ?? "");
      }
      return "";
    })
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean);

  const unique = Array.from(new Set(codes));
  if (unique.length === 0) return [...FALLBACK_LANGUAGES];

  // Prefer AZ as the primary / first tab when present.
  unique.sort((a, b) => {
    if (a === "AZ") return -1;
    if (b === "AZ") return 1;
    return a.localeCompare(b);
  });
  return unique;
}

export function emptyLanguageRecord(languages: string[], seed?: Record<string, string>) {
  return Object.fromEntries(
    languages.map((lang) => [lang, seed?.[lang] ?? ""])
  ) as Record<string, string>;
}

export function useLanguages() {
  const queryClient = useQueryClient();

  const { data: languages = [...FALLBACK_LANGUAGES], isLoading } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const res = await apiRequest<unknown>("/languages");
      return normalizeLanguageCodes(res);
    },
    staleTime: 60_000,
  });

  const createLanguage = useMutation({
    mutationFn: (code: string) =>
      apiRequest<Language>("/languages", {
        method: "POST",
        body: { code: code.trim().toUpperCase() },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  const updateLanguage = useMutation({
    mutationFn: ({ code, newCode }: { code: string; newCode: string }) =>
      apiRequest<Language>(`/languages/${encodeURIComponent(code)}`, {
        method: "PUT",
        body: { code: newCode.trim().toUpperCase() },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  const deleteLanguage = useMutation({
    mutationFn: (code: string) =>
      apiRequest<void>(`/languages/${encodeURIComponent(code)}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  return {
    languages,
    isLoading,
    createLanguage,
    updateLanguage,
    deleteLanguage,
  };
}
