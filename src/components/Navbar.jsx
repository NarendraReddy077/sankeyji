import React from 'react';
import {
  Sparkles,
  Download,
  Share2,
  FolderOpen,
  Layers,
  HelpCircle,
  BarChart3,
  Flame,
  ChevronDown
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../presets/samplePresets';

export default function Navbar({
  activePresetId,
  onSelectPreset,
  renderMode,
  setRenderMode,
  onOpenExport,
  onOpenSyntaxHelp
}) {
  return (
    <header className="navbar-root">
      {/* Brand & Logo */}
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M4 4v16h16" />
            <path d="M4 14c4 0 4-8 8-8s4 8 8 8" />
          </svg>
        </div>
        <div className="brand-text-container">
          <span className="brand-title">Sankey<span className="text-gradient">Ji</span></span>
          <span className="brand-badge">Studio</span>
        </div>
      </div>

      {/* Preset Selector & Quick Action Bar */}
      <div className="navbar-center-actions">
        {/* Preset Selector Dropdown */}
        <div className="preset-selector-wrapper">
          <FolderOpen size={15} className="text-slate-400" />
          <select
            className="preset-select"
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
          >
            {SAMPLE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none text-slate-400 ml-1" />
        </div>
      </div>

      {/* Right Top Action Bar */}
      <div className="navbar-right-actions">
        <button
          className="btn-nav-secondary"
          onClick={onOpenSyntaxHelp}
          title="Format Guide & Syntax"
        >
          <HelpCircle size={15} />
          <span>Guide</span>
        </button>

        <button
          className="btn-nav-primary"
          onClick={onOpenExport}
          title="Export PNG or SVG"
        >
          <Download size={15} />
          <span>Export Diagram</span>
        </button>
      </div>
    </header>
  );
}
