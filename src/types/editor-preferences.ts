export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: "vs-dark" | "monokai" | "github-dark";
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

export function parseEditorPreferences(raw: unknown): EditorPreferences {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_EDITOR_PREFERENCES };
  const r = raw as Record<string, unknown>;
  return {
    fontSize: typeof r.fontSize === "number" ? r.fontSize : DEFAULT_EDITOR_PREFERENCES.fontSize,
    tabSize: typeof r.tabSize === "number" ? r.tabSize : DEFAULT_EDITOR_PREFERENCES.tabSize,
    wordWrap: typeof r.wordWrap === "boolean" ? r.wordWrap : DEFAULT_EDITOR_PREFERENCES.wordWrap,
    minimap: typeof r.minimap === "boolean" ? r.minimap : DEFAULT_EDITOR_PREFERENCES.minimap,
    theme:
      r.theme === "vs-dark" || r.theme === "monokai" || r.theme === "github-dark"
        ? r.theme
        : DEFAULT_EDITOR_PREFERENCES.theme,
  };
}
