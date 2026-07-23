"use client";

import { EraserIcon } from "@/components/icons/eraser-icon";
import { MarqueeIcon } from "@/components/icons/marquee-icon";
import { PencilIcon } from "@/components/icons/pencil-icon";
import type { Tool } from "@/types/tools";

type ToolbarProps = {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
};

const tools: Array<{ id: Tool; label: string; icon: typeof PencilIcon }> = [
  { id: "pencil", label: "Lápiz", icon: PencilIcon },
  { id: "eraser", label: "Borrador", icon: EraserIcon },
  { id: "marquee", label: "Selección", icon: MarqueeIcon },
];

export function Toolbar({ activeTool, onToolChange }: ToolbarProps) {
  return (
    <div className="toolbar" role="toolbar" aria-label="Herramientas">
      {tools.map(({ id, label, icon: Icon }) => {
        const isActive = activeTool === id;

        return (
          <button
            key={id}
            type="button"
            className={`toolbar-button${isActive ? " toolbar-button--active" : ""}`}
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onToolChange(id)}
          >
            <Icon className="toolbar-icon" />
          </button>
        );
      })}
    </div>
  );
}
