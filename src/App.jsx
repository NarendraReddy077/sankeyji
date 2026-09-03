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

  // UI Panels State
  const [editorWidth, setEditorWidth] = useState(380);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [isSidebarMaximized, setIsSidebarMaximized] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
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

  // Zen Mode (Both Sidebars Collapsed)
  const isZenMode = isEditorCollapsed && isSidebarCollapsed;
  const handleToggleZenMode = () => {
    if (isZenMode) {
      setIsEditorCollapsed(false);
      setIsSidebarCollapsed(false);
    } else {
      setIsEditorCollapsed(true);
      setIsSidebarCollapsed(true);
      setIsEditorMaximized(false);
      setIsSidebarMaximized(false);
    }
  };

  // Maximize / Expand Left (Editor)
  const handleToggleEditorMaximize = () => {
    if (isEditorMaximized) {
      setIsEditorMaximized(false);
    } else {
      setIsEditorMaximized(true);
      setIsEditorCollapsed(false);
    }
  };

  // Maximize / Expand Right (Inspector)
  const handleToggleSidebarMaximize = () => {
    if (isSidebarMaximized) {
      setIsSidebarMaximized(false);
    } else {
      setIsSidebarMaximized(true);
      setIsSidebarCollapsed(false);
    }
  };

  // Resize Left Pane (Editor) Drag Handler
  const handleLeftResizeStart = (e) => {
    e.preventDefault();
    setIsDraggingLeft(true);
    const startX = e.clientX;
    const startWidth = isEditorCollapsed ? 38 : editorWidth;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const targetWidth = startWidth + delta;
      if (targetWidth < 120) {
        setIsEditorCollapsed(true);
        return;
      }
      setIsEditorCollapsed(false);
      setIsEditorMaximized(false);
      const maxWidth = Math.max(400, Math.floor(window.innerWidth * 0.65));
      const clampedWidth = Math.min(maxWidth, Math.max(220, targetWidth));
      setEditorWidth(clampedWidth);
    };

    const onMouseUp = () => {
      setIsDraggingLeft(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Resize Right Pane (Customizer) Drag Handler
  const handleRightResizeStart = (e) => {
    e.preventDefault();
    setIsDraggingRight(true);
    const startX = e.clientX;
    const startWidth = isSidebarCollapsed ? 38 : sidebarWidth;

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      const targetWidth = startWidth + delta;
      if (targetWidth < 120) {
        setIsSidebarCollapsed(true);
        return;
      }
      setIsSidebarCollapsed(false);
      setIsSidebarMaximized(false);
      const maxWidth = Math.max(400, Math.floor(window.innerWidth * 0.65));
      const clampedWidth = Math.min(maxWidth, Math.max(260, targetWidth));
      setSidebarWidth(clampedWidth);
    };

    const onMouseUp = () => {
      setIsDraggingRight(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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

  // Computed width styles for CSS
  const getEditorStyle = () => {
    if (isEditorCollapsed) return { width: '40px', minWidth: '40px', maxWidth: '40px' };
    if (isEditorMaximized) return { width: 'min(62vw, 840px)', minWidth: '380px' };
    return { width: `${editorWidth}px` };
  };

  const getSidebarStyle = () => {
    if (isSidebarCollapsed) return { width: '40px', minWidth: '40px', maxWidth: '40px' };
    if (isSidebarMaximized) return { width: 'min(58vw, 760px)', minWidth: '340px' };
    return { width: `${sidebarWidth}px` };
  };

  return (
    <div className={`app-root ${isDraggingLeft || isDraggingRight ? 'is-dragging-resizer' : ''}`}>
      {/* Top Main Navigation */}
      <Navbar
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSyntaxHelp={() => setIsSyntaxModalOpen(true)}
        isEditorCollapsed={isEditorCollapsed}
        setIsEditorCollapsed={setIsEditorCollapsed}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isZenMode={isZenMode}
        onToggleZenMode={handleToggleZenMode}
      />

      {/* Main Studio Body Workspace */}
      <div className="studio-workspace">
        {/* Left Side: Code / Text Data Editor */}
        <div
          className={`editor-pane-container ${isEditorCollapsed ? 'collapsed' : ''} ${isEditorMaximized ? 'maximized' : ''} ${isDraggingLeft ? 'resizing' : ''}`}
          style={getEditorStyle()}
        >
          {!isEditorCollapsed ? (
            <Editor
              code={code}
              setCode={setCode}
              errors={parsedData.errors}
              totalFlows={parsedData.links.length}
              onOpenSyntaxHelp={() => setIsSyntaxModalOpen(true)}
              isMaximized={isEditorMaximized}
              onToggleMaximize={handleToggleEditorMaximize}
              onMinimize={() => { setIsEditorCollapsed(true); setIsEditorMaximized(false); }}
            />
          ) : (
            <div className="collapsed-rail" onClick={() => setIsEditorCollapsed(false)} title="Click to Expand Editor">
              <button
                className="rail-expand-btn"
                onClick={(e) => { e.stopPropagation(); setIsEditorCollapsed(false); }}
                title="Expand Text Editor"
              >
                <PanelLeftOpen size={16} />
              </button>
              <div className="rail-vertical-label">Flow Editor</div>
            </div>
          )}
        </div>

        {/* Left Resizer Drag Handle */}
        <div
          className={`pane-resizer-handle left ${isDraggingLeft ? 'dragging' : ''} ${isEditorCollapsed ? 'collapsed-handle' : ''}`}
          onMouseDown={handleLeftResizeStart}
          onDoubleClick={() => { setEditorWidth(380); setIsEditorMaximized(false); setIsEditorCollapsed(false); }}
          title={isEditorCollapsed ? "Drag right to expand Editor" : "Drag to resize Editor | Double click to reset width"}
        >
          <div className="resizer-grip-line" />
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

        {/* Right Resizer Drag Handle */}
        <div
          className={`pane-resizer-handle right ${isDraggingRight ? 'dragging' : ''} ${isSidebarCollapsed ? 'collapsed-handle' : ''}`}
          onMouseDown={handleRightResizeStart}
          onDoubleClick={() => { setSidebarWidth(350); setIsSidebarMaximized(false); setIsSidebarCollapsed(false); }}
          title={isSidebarCollapsed ? "Drag left to expand Inspector" : "Drag to resize Inspector | Double click to reset width"}
        >
          <div className="resizer-grip-line" />
        </div>

        {/* Right Side: Visual Inspector / Customization Sidebar */}
        <div
          className={`sidebar-pane-container ${isSidebarCollapsed ? 'collapsed' : ''} ${isSidebarMaximized ? 'maximized' : ''} ${isDraggingRight ? 'resizing' : ''}`}
          style={getSidebarStyle()}
        >
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
              isMaximized={isSidebarMaximized}
              onToggleMaximize={handleToggleSidebarMaximize}
              onMinimize={() => { setIsSidebarCollapsed(true); setIsSidebarMaximized(false); }}
            />
          ) : (
            <div className="collapsed-rail" onClick={() => setIsSidebarCollapsed(false)} title="Click to Expand Inspector">
              <button
                className="rail-expand-btn"
                onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(false); }}
                title="Expand Customizer"
              >
                <SlidersHorizontal size={16} />
              </button>
              <div className="rail-vertical-label">Inspector</div>
            </div>
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
