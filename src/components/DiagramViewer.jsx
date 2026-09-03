import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Eye, LayoutGrid, Layers, Sparkles } from 'lucide-react';
import InfographicRenderer from './InfographicRenderer';
import ClassicSankeyRenderer from './ClassicSankeyRenderer';

export default function DiagramViewer({
  parsedData,
  renderMode,
  setRenderMode,
  title,
  subtitle,
  note,
  unitPrefix,
  unitSuffix,
  showPercentages,
  percentageBasis = 'branch',
  palette,
  insights,
  showInsights,
  cardRadius,
  ribbonCurvature,
  compactNumbers,
  nodeWidth,
  nodePadding,
  nodeAlign,
  onOpenExport
}) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bgStyle, setBgStyle] = useState('grid'); // 'white' | 'slate' | 'dark' | 'grid'
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom(prev => Math.min(2.5, prev + 0.15));
  const handleZoomOut = () => setZoom(prev => Math.max(0.4, prev - 0.15));
  const handleResetZoom = () => setZoom(1);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  const getBackgroundClass = () => {
    switch (bgStyle) {
      case 'white': return 'bg-canvas-white';
      case 'slate': return 'bg-canvas-slate';
      case 'dark': return 'bg-canvas-dark';
      case 'grid':
      default: return 'bg-canvas-grid';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`diagram-viewer-wrapper ${getBackgroundClass()} ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {/* Top Floating Viewport Toolbar */}
      <div className="viewport-toolbar">
        {/* Mode Switcher Pill */}
        <div className="mode-toggle-group">
          <button
            className={`mode-btn ${renderMode === 'infographic' ? 'active' : ''}`}
            onClick={() => setRenderMode('infographic')}
            title="Executive Infographic Card Layout"
          >
            <Sparkles size={14} className="mr-1" />
            <span>Infographic View</span>
          </button>
          <button
            className={`mode-btn ${renderMode === 'classic' ? 'active' : ''}`}
            onClick={() => setRenderMode('classic')}
            title="Continuous Flow Sankey"
          >
            <Layers size={14} className="mr-1" />
            <span>Flow Sankey</span>
          </button>
        </div>

        {/* Zoom & Canvas Controls */}
        <div className="zoom-controls-group">
          <div className="bg-picker-pill">
            <button
              className={`bg-dot-btn ${bgStyle === 'white' ? 'active' : ''}`}
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1' }}
              onClick={() => setBgStyle('white')}
              title="Clean White Canvas"
            />
            <button
              className={`bg-dot-btn ${bgStyle === 'slate' ? 'active' : ''}`}
              style={{ backgroundColor: '#F1F5F9' }}
              onClick={() => setBgStyle('slate')}
              title="Slate Light Canvas"
            />
            <button
              className={`bg-dot-btn ${bgStyle === 'dark' ? 'active' : ''}`}
              style={{ backgroundColor: '#0F172A' }}
              onClick={() => setBgStyle('dark')}
              title="Studio Dark Canvas"
            />
            <button
              className={`bg-dot-btn ${bgStyle === 'grid' ? 'active' : ''}`}
              style={{ background: 'linear-gradient(45deg, #E2E8F0 25%, transparent 25%), linear-gradient(-45deg, #E2E8F0 25%, transparent 25%)', backgroundSize: '6px 6px' }}
              onClick={() => setBgStyle('grid')}
              title="Subtle Grid Canvas"
            />
          </div>

          <div className="divider-v" />

          <button className="tool-icon-btn" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <span className="zoom-label" onClick={handleResetZoom} title="Click to Reset">
            {Math.round(zoom * 100)}%
          </span>
          <button className="tool-icon-btn" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          <button className="tool-icon-btn" onClick={handleResetZoom} title="Reset Zoom (100%)">
            <RotateCcw size={15} />
          </button>
          <button className="tool-icon-btn" onClick={toggleFullscreen} title="Fullscreen View">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Diagram Viewport */}
      <div className="diagram-canvas-scrollbox">
        <div
          className="diagram-scalable-stage"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
        >
          {renderMode === 'infographic' ? (
            <InfographicRenderer
              parsedData={parsedData}
              title={title}
              subtitle={subtitle}
              note={note}
              unitPrefix={unitPrefix}
              unitSuffix={unitSuffix}
              showPercentages={showPercentages}
              percentageBasis={percentageBasis}
              palette={palette}
              insights={insights}
              showInsights={showInsights}
              cardRadius={cardRadius}
              ribbonCurvature={ribbonCurvature}
              compactNumbers={compactNumbers}
            />
          ) : (
            <ClassicSankeyRenderer
              parsedData={parsedData}
              title={title}
              subtitle={subtitle}
              note={note}
              unitPrefix={unitPrefix}
              unitSuffix={unitSuffix}
              showPercentages={showPercentages}
              percentageBasis={percentageBasis}
              palette={palette}
              nodeWidth={nodeWidth}
              nodePadding={nodePadding}
              compactNumbers={compactNumbers}
              nodeAlign={nodeAlign}
            />
          )}
        </div>
      </div>
    </div>
  );
}
