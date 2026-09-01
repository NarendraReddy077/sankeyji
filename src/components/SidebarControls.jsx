import React, { useState } from 'react';
import {
  Palette,
  Sliders,
  Type,
  Lightbulb,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  Plus,
  Trash2
} from 'lucide-react';
import { COLOR_PALETTES } from '../utils/themeAndIcons';

const ICON_CHOICES = [
  'Factory', 'Cog', 'Snowflake', 'Lightbulb', 'BatteryCharging', 'Users', 'Wrench',
  'AlertTriangle', 'Zap', 'DollarSign', 'TrendingUp', 'Cloud', 'Database', 'HardDrive',
  'Leaf', 'Globe', 'Target', 'Truck', 'ShieldCheck', 'Layers', 'Activity', 'BarChart3'
];

export default function SidebarControls({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  note,
  setNote,
  unitPrefix,
  setUnitPrefix,
  unitSuffix,
  setUnitSuffix,
  showPercentages,
  setShowPercentages,
  paletteId,
  setPaletteId,
  showInsights,
  setShowInsights,
  insights,
  customInsights,
  setCustomInsights,
  cardRadius,
  setCardRadius,
  ribbonCurvature,
  setRibbonCurvature,
  compactNumbers,
  setCompactNumbers,
  nodeWidth,
  setNodeWidth,
  nodePadding,
  setNodePadding,
  nodeAlign,
  setNodeAlign,
  nodes = [],
  customOverrides,
  setCustomOverrides
}) {
  const [activeTab, setActiveTab] = useState('style'); // 'style' | 'text' | 'units' | 'nodes'

  const handleNodeColorChange = (nodeName, color) => {
    setCustomOverrides(prev => ({
      ...prev,
      [nodeName]: {
        ...(prev[nodeName] || {}),
        color
      }
    }));
  };

  const handleNodeIconChange = (nodeName, icon) => {
    setCustomOverrides(prev => ({
      ...prev,
      [nodeName]: {
        ...(prev[nodeName] || {}),
        icon
      }
    }));
  };

  const handleAddInsight = () => {
    const current = customInsights || insights;
    setCustomInsights([...current, 'New custom insight bullet point']);
  };

  const handleUpdateInsight = (idx, text) => {
    const current = [...(customInsights || insights)];
    current[idx] = text;
    setCustomInsights(current);
  };

  const handleDeleteInsight = (idx) => {
    const current = [...(customInsights || insights)];
    current.splice(idx, 1);
    setCustomInsights(current);
  };

  return (
    <div className="sidebar-controls-root">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab-btn ${activeTab === 'style' ? 'active' : ''}`}
          onClick={() => setActiveTab('style')}
        >
          <Palette size={15} />
          <span>Style & Theme</span>
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <Type size={15} />
          <span>Titles & Insights</span>
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === 'units' ? 'active' : ''}`}
          onClick={() => setActiveTab('units')}
        >
          <Hash size={15} />
          <span>Units & Data</span>
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === 'nodes' ? 'active' : ''}`}
          onClick={() => setActiveTab('nodes')}
        >
          <Tag size={15} />
          <span>Node Customizer</span>
        </button>
      </div>

      <div className="sidebar-content-scroll">
        {/* ================= TAB 1: STYLE & THEME ================= */}
        {activeTab === 'style' && (
          <div className="control-section">
            <label className="control-label">Color Theme</label>
            <div className="palette-grid">
              {COLOR_PALETTES.map(pal => (
                <div
                  key={pal.id}
                  className={`palette-card ${paletteId === pal.id ? 'selected' : ''}`}
                  onClick={() => setPaletteId(pal.id)}
                >
                  <div className="palette-header">
                    <span className="palette-title">{pal.name}</span>
                  </div>
                  <div className="palette-swatches">
                    {pal.colors.slice(0, 6).map((c, i) => (
                      <span key={i} className="color-swatch-dot" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider-h" />

            <div className="control-group">
              <div className="control-header-row">
                <label className="control-label">Ribbon Curvature</label>
                <span className="control-val-badge">{Math.round(ribbonCurvature * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={ribbonCurvature}
                onChange={e => setRibbonCurvature(parseFloat(e.target.value))}
                className="custom-range"
              />
            </div>

            <div className="control-group">
              <div className="control-header-row">
                <label className="control-label">Card Corner Radius</label>
                <span className="control-val-badge">{cardRadius}px</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                step="2"
                value={cardRadius}
                onChange={e => setCardRadius(parseInt(e.target.value))}
                className="custom-range"
              />
            </div>

            <div className="control-group">
              <div className="control-header-row">
                <label className="control-label">Flow Node Width (Classic View)</label>
                <span className="control-val-badge">{nodeWidth}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="40"
                step="2"
                value={nodeWidth}
                onChange={e => setNodeWidth(parseInt(e.target.value))}
                className="custom-range"
              />
            </div>

            <div className="control-group">
              <div className="control-header-row">
                <label className="control-label">Flow Node Padding (Classic View)</label>
                <span className="control-val-badge">{nodePadding}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                step="2"
                value={nodePadding}
                onChange={e => setNodePadding(parseInt(e.target.value))}
                className="custom-range"
              />
            </div>
          </div>
        )}

        {/* ================= TAB 2: TITLES & INSIGHTS ================= */}
        {activeTab === 'text' && (
          <div className="control-section">
            <div className="control-group">
              <label className="control-label">Diagram Main Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Factory Energy Flow – Sankey Diagram"
                className="control-input"
              />
            </div>

            <div className="control-group">
              <label className="control-label">Subtitle / Description</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="e.g. Total Energy Consumption – 1,000,000 kWh / Month"
                className="control-input"
              />
            </div>

            <div className="control-group">
              <label className="control-label">Footer Note / Disclaimer</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Note: Sample diagram for illustration..."
                rows={2}
                className="control-textarea"
              />
            </div>

            <div className="divider-h" />

            <div className="control-group">
              <div className="toggle-switch-row">
                <div>
                  <label className="control-label mb-0">Show Key Insights Box</label>
                  <div className="control-hint">Executive summary highlight card</div>
                </div>
                <input
                  type="checkbox"
                  checked={showInsights}
                  onChange={e => setShowInsights(e.target.checked)}
                  className="custom-checkbox"
                />
              </div>

              {showInsights && (
                <div className="insights-editor-list mt-3">
                  {(customInsights || insights).map((bullet, idx) => (
                    <div key={idx} className="insight-bullet-edit-row">
                      <input
                        type="text"
                        value={bullet}
                        onChange={e => handleUpdateInsight(idx, e.target.value)}
                        className="control-input text-xs"
                      />
                      <button
                        className="btn-icon-danger"
                        onClick={() => handleDeleteInsight(idx)}
                        title="Delete Insight"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn-add-insight"
                    onClick={handleAddInsight}
                  >
                    <Plus size={13} /> Add Insight Bullet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: UNITS & NUMBERS ================= */}
        {activeTab === 'units' && (
          <div className="control-section">
            <div className="control-group">
              <label className="control-label">Unit Prefix (Currency, etc.)</label>
              <input
                type="text"
                value={unitPrefix}
                onChange={e => setUnitPrefix(e.target.value)}
                placeholder="e.g. $, €, ₹, £"
                className="control-input"
              />
            </div>

            <div className="control-group">
              <label className="control-label">Unit Suffix (Energy, Count, etc.)</label>
              <input
                type="text"
                value={unitSuffix}
                onChange={e => setUnitSuffix(e.target.value)}
                placeholder="e.g.  kWh,  tCO2e,  Users,  GB"
                className="control-input"
              />
            </div>

            <div className="divider-h" />

            <div className="control-group">
              <div className="toggle-switch-row">
                <div>
                  <label className="control-label mb-0">Display Percentages</label>
                  <div className="control-hint">Shows (xx%) on nodes and categories</div>
                </div>
                <input
                  type="checkbox"
                  checked={showPercentages}
                  onChange={e => setShowPercentages(e.target.checked)}
                  className="custom-checkbox"
                />
              </div>
            </div>

            <div className="control-group">
              <div className="toggle-switch-row">
                <div>
                  <label className="control-label mb-0">Compact Numbers</label>
                  <div className="control-hint">Format as 1M, 540k instead of 1,000,000</div>
                </div>
                <input
                  type="checkbox"
                  checked={compactNumbers}
                  onChange={e => setCompactNumbers(e.target.checked)}
                  className="custom-checkbox"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: NODES & ICONS ================= */}
        {activeTab === 'nodes' && (
          <div className="control-section">
            <div className="control-hint mb-3">
              Customize colors and icons for each detected category:
            </div>
            <div className="node-customizer-list">
              {nodes.map(node => {
                const override = customOverrides[node.name] || {};
                const activeColor = override.color || node.color || '#3B82F6';
                const activeIcon = override.icon || node.icon || 'Layers';

                return (
                  <div key={node.id} className="node-custom-card">
                    <div className="node-custom-header">
                      <span className="node-custom-name" title={node.name}>
                        {node.name}
                      </span>
                      <span className="node-custom-val">
                        {node.value.toLocaleString()}
                      </span>
                    </div>

                    <div className="node-custom-controls">
                      {/* Color Picker Input */}
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={activeColor}
                          onChange={e => handleNodeColorChange(node.name, e.target.value)}
                          className="color-circle-input"
                        />
                        <span className="color-code-label">{activeColor}</span>
                      </div>

                      {/* Icon Selector Dropdown */}
                      <select
                        value={activeIcon}
                        onChange={e => handleNodeIconChange(node.name, e.target.value)}
                        className="icon-select-dropdown"
                      >
                        {ICON_CHOICES.map(ic => (
                          <option key={ic} value={ic}>{ic}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
