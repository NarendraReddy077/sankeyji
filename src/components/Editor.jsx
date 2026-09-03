import React, { useRef } from 'react';
import { Code, Copy, Check, Sparkles, AlertCircle, FileText, Plus, HelpCircle, Maximize2, Minimize2, PanelLeftClose } from 'lucide-react';

export default function Editor({
  code,
  setCode,
  errors = [],
  onInsertSnippet,
  totalFlows = 0,
  onOpenSyntaxHelp,
  isMaximized = false,
  onToggleMaximize,
  onMinimize
}) {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef(null);

  const lines = code.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (snippet) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextText = code.substring(0, start) + snippet + code.substring(end);
    setCode(nextText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 0);
  };

  return (
    <div className="editor-panel-root">
      {/* Editor Header Bar */}
      <div className="editor-header">
        <div className="editor-title-group">
          <Code size={16} className="text-primary-500" />
          <span className="editor-title">Flow Data Input</span>
          <span className="badge-count">{totalFlows} flows</span>
        </div>

        <div className="editor-actions">
          <button
            className="editor-btn-secondary"
            onClick={onOpenSyntaxHelp}
            title="Syntax Cheat Sheet"
          >
            <HelpCircle size={14} />
            <span>Syntax</span>
          </button>

          <button
            className="editor-btn-secondary"
            onClick={handleCopy}
            title="Copy Text Input"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onToggleMaximize && (
            <button
              className={`editor-btn-secondary ${isMaximized ? 'active-toggle' : ''}`}
              onClick={onToggleMaximize}
              title={isMaximized ? "Restore Editor (Default Width)" : "Maximize Editor (Expand Full)"}
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              <span>{isMaximized ? 'Restore' : 'Expand'}</span>
            </button>
          )}

          {onMinimize && (
            <button
              className="editor-btn-icon"
              onClick={onMinimize}
              title="Minimize Editor"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Snippet Bar */}
      <div className="quick-snippets-bar">
        <span className="snippets-label">Insert:</span>
        <button
          className="snippet-chip"
          onClick={() => handleInsert('\nSource [10000] Target')}
          title="Add Flow Line"
        >
          <Plus size={12} /> Flow
        </button>
        <button
          className="snippet-chip"
          onClick={() => handleInsert('\n// === Section Name ===')}
          title="Add Section Comment"
        >
          // Section
        </button>
        <button
          className="snippet-chip"
          onClick={() => handleInsert(' #3B82F6')}
          title="Add Link Color"
        >
          #Color
        </button>
      </div>

      {/* Editor Textarea with Line Numbers */}
      <div className="editor-code-container">
        <div className="editor-line-numbers">
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const hasError = errors.some(e => e.line === lineNum);
            return (
              <div
                key={idx}
                className={`line-number ${hasError ? 'line-error' : ''}`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Source [Amount] Target..."
          spellCheck="false"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </div>

      {/* Syntax Errors Warning Drawer */}
      {errors.length > 0 && (
        <div className="editor-error-drawer">
          <div className="error-drawer-header">
            <AlertCircle size={15} className="text-rose-500" />
            <span>{errors.length} Syntax Warning{errors.length > 1 ? 's' : ''}</span>
          </div>
          <div className="error-list">
            {errors.slice(0, 3).map((err, i) => (
              <div key={i} className="error-item">
                <span className="error-line">Line {err.line}:</span> {err.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
