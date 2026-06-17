"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";

export function EditorPreferencesForm({
  initialPrefs,
}: {
  initialPrefs: EditorPreferences;
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [, startTransition] = useTransition();

  function save(patch: Partial<EditorPreferences>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    startTransition(async () => {
      const result = await updateEditorPreferences(next);
      if (result.success) {
        toast.success("Editor preferences saved.");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Font size */}
        <div className="space-y-1.5">
          <Label htmlFor="editor-font-size">Font size</Label>
          <Select
            value={String(prefs.fontSize)}
            onValueChange={(v) => save({ fontSize: Number(v) })}
          >
            <SelectTrigger id="editor-font-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tab size */}
        <div className="space-y-1.5">
          <Label htmlFor="editor-tab-size">Tab size</Label>
          <Select
            value={String(prefs.tabSize)}
            onValueChange={(v) => save({ tabSize: Number(v) })}
          >
            <SelectTrigger id="editor-tab-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 4].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-1.5">
        <Label htmlFor="editor-theme">Theme</Label>
        <Select
          value={prefs.theme}
          onValueChange={(v) => save({ theme: v as EditorPreferences["theme"] })}
        >
          <SelectTrigger id="editor-theme" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vs-dark">VS Dark</SelectItem>
            <SelectItem value="monokai">Monokai</SelectItem>
            <SelectItem value="github-dark">GitHub Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-1">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Word wrap</p>
            <p className="text-xs text-muted-foreground">
              Wrap long lines to fit the editor width
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.wordWrap}
            onClick={() => save({ wordWrap: !prefs.wordWrap })}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              prefs.wordWrap ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                prefs.wordWrap ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Minimap</p>
            <p className="text-xs text-muted-foreground">
              Show code minimap in the editor
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.minimap}
            onClick={() => save({ minimap: !prefs.minimap })}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              prefs.minimap ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                prefs.minimap ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
