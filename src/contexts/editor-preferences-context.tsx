"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences";

const EditorPreferencesContext = createContext<EditorPreferences>(DEFAULT_EDITOR_PREFERENCES);

export function EditorPreferencesProvider({
  prefs,
  children,
}: {
  prefs: EditorPreferences;
  children: React.ReactNode;
}) {
  return (
    <EditorPreferencesContext.Provider value={prefs}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
