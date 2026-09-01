import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Editor from './components/Editor';
import DiagramViewer from './components/DiagramViewer';
import SidebarControls from './components/SidebarControls';
import ExportModal from './components/ExportModal';
import SyntaxHelpModal from './components/SyntaxHelpModal';
import { SAMPLE_PRESETS } from './presets/samplePresets';
import { COLOR_PALETTES } from './utils/themeAndIcons';
import { parseSankeyText } from './parser/sankeyParser';
import { PanelLeftClose, PanelLeftOpen, SlidersHorizontal } from 'lucide-react';

export default function App() {
  // Active Preset & Editor Code
  const defaultPreset = SAMPLE_PRESETS[0]; // Factory Energy Flow (user's input)
  const [activePresetId, setActivePresetId] = useState(defaultPreset.id);
  const [code, setCode] = useState(defaultPreset.code);

  // Diagram Metadata
  const [title, setTitle] = useState(defaultPreset.title);
  const [subtitle, setSubtitle] = useState(defaultPreset.subtitle);
  const [note, setNote] = useState(defaultPreset.note);
  const [unitPrefix, setUnitPrefix] = useState(defaultPreset.unitPrefix || '');
  const [unitSuffix, setUnitSuffix] = useState(defaultPreset.unitSuffix || ' kWh');

  // Display & Rendering Modes
  const [renderMode, setRenderMode] = useState('infographic'); // 'infographic' | 'classic'
  const [paletteId, setPaletteId] = useState(defaultPreset.paletteId || 'executive_vibrant');
  const [showPercentages, setShowPercentages] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [customInsights, setCustomInsights] = useState(null);
  const [compactNumbers, setCompactNumbers] = useState(false);

  // Layout Fine-Tuning
  const [cardRadius, setCardRadius] = useState(12);
  const [ribbonCurvature, setRibbonCurvature] = useState(0.5);
  const [nodeWidth, setNodeWidth] = useState(24);
  const [nodePadding, setNodePadding] = useState(18);
  const [nodeAlign, setNodeAlign] = useState('justify');

  // Custom Per-Node Overrides
  const [customOverrides, setCustomOverrides] = useState({});

  // UI Panels
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSyntaxModalOpen, setIsSyntaxModalOpen] = useState(false);

  // Selected Palette Object
  const currentPalette = useMemo(() => {
    return COLOR_PALETTES.find(p => p.id === paletteId) || COLOR_PALETTES[0];
  }, [paletteId]);

  // Parse Text Input
  const parsedData = useMemo(() => {
    return parseSankeyText(code, currentPalette, customOverrides);
  }, [code, currentPalette, customOverrides]);

  // Handle Preset Switching
  const handleSelectPreset = (presetId) => {
    const selected = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (!selected) return;
    setActivePresetId(presetId);
    setCode(selected.code);
    setTitle(selected.title);
    setSubtitle(selected.subtitle);
    setNote(selected.note);
    setUnitPrefix(selected.unitPrefix || '');
    setUnitSuffix(selected.unitSuffix || '');
    setPaletteId(selected.paletteId || 'executive_vibrant');
    setCustomInsights(null); // Reset to auto-generate
    setCustomOverrides({});
  };

  return (
    <div className="app-root">
      {/* Top Main Navigation */}
      <Navbar
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSyntaxHelp={() => setIsSyntaxModalOpen(true)}
      />

      {/* Main Studio Body Workspace */}
      <div className="studio-workspace">
        {/* Left Side: Code / Text Data Editor */}
        <div className={`editor-pane-container ${isEditorCollapsed ? 'collapsed' : ''}`}>
          {!isEditorCollapsed ? (
            <Editor
              code={code}
              setCode={setCode}
              errors={parsedData.errors}
              totalFlows={parsedData.links.length}
              onOpenSyntaxHelp={() => setIsSyntaxModalOpen(true)}
            />
          ) : (
            <div className="collapsed-rail">
              <button
                className="rail-expand-btn"
                onClick={() => setIsEditorCollapsed(false)}
                title="Expand Text Editor"
              >
                <PanelLeftOpen size={16} />
              </button>
            </div>
          )}

          {!isEditorCollapsed && (
            <button
              className="collapse-toggle-tab left"
              onClick={() => setIsEditorCollapsed(true)}
              title="Collapse Editor"
            >
              <PanelLeftClose size={14} />
            </button>
          )}
        </div>

        {/* Center: Live Diagram Viewport */}
        <div className="diagram-pane-container">
          <DiagramViewer
            parsedData={parsedData}
            renderMode={renderMode}
            setRenderMode={setRenderMode}
            title={title}
            subtitle={subtitle}
            note={note}
            unitPrefix={unitPrefix}
            unitSuffix={unitSuffix}
            showPercentages={showPercentages}
            palette={currentPalette}
            insights={parsedData.insights}
            showInsights={showInsights}
            cardRadius={cardRadius}
            ribbonCurvature={ribbonCurvature}
            compactNumbers={compactNumbers}
            nodeWidth={nodeWidth}
            nodePadding={nodePadding}
            nodeAlign={nodeAlign}
            onOpenExport={() => setIsExportModalOpen(true)}
          />
        </div>

        {/* Right Side: Visual Inspector / Customization Sidebar */}
        <div className={`sidebar-pane-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          {!isSidebarCollapsed ? (
            <SidebarControls
              title={title}
              setTitle={setTitle}
              subtitle={subtitle}
              setSubtitle={setSubtitle}
              note={note}
              setNote={setNote}
              unitPrefix={unitPrefix}
              setUnitPrefix={setUnitPrefix}
              unitSuffix={unitSuffix}
              setUnitSuffix={setUnitSuffix}
              showPercentages={showPercentages}
              setShowPercentages={setShowPercentages}
              paletteId={paletteId}
              setPaletteId={setPaletteId}
              showInsights={showInsights}
              setShowInsights={setShowInsights}
              insights={parsedData.insights}
              customInsights={customInsights}
              setCustomInsights={setCustomInsights}
              cardRadius={cardRadius}
              setCardRadius={setCardRadius}
              ribbonCurvature={ribbonCurvature}
              setRibbonCurvature={setRibbonCurvature}
              compactNumbers={compactNumbers}
              setCompactNumbers={setCompactNumbers}
              nodeWidth={nodeWidth}
              setNodeWidth={setNodeWidth}
              nodePadding={nodePadding}
              setNodePadding={setNodePadding}
              nodeAlign={nodeAlign}
              setNodeAlign={setNodeAlign}
              nodes={parsedData.nodes}
              customOverrides={customOverrides}
              setCustomOverrides={setCustomOverrides}
            />
          ) : (
            <div className="collapsed-rail">
              <button
                className="rail-expand-btn"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Customizer"
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          )}

          {!isSidebarCollapsed && (
            <button
              className="collapse-toggle-tab right"
              onClick={() => setIsSidebarCollapsed(true)}
              title="Collapse Customizer"
            >
              <PanelLeftClose size={14} className="rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Export Dialog Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={title}
      />

      {/* Syntax Help Modal */}
      <SyntaxHelpModal
        isOpen={isSyntaxModalOpen}
        onClose={() => setIsSyntaxModalOpen(false)}
      />
    </div>
  );
}
