import React, { useState } from 'react';
import { Download, Copy, Check, X, Image as ImageIcon, FileCode, Sparkles, Loader2 } from 'lucide-react';

export default function ExportModal({ isOpen, onClose, title = 'sankey-diagram' }) {
  const [scale, setScale] = useState(2); // 1x, 2x, 4x
  const [includeBg, setIncludeBg] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState('');

  if (!isOpen) return null;

  const sanitizeFilename = (name) => {
    return (name || 'sankey-diagram').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
  };

  // Convert SVG Element to high-res Canvas
  const renderSvgToCanvas = async (exportScale = 2, transparent = false) => {
    const svgElement = document.getElementById('sankey-export-svg');
    if (!svgElement) throw new Error('SVG diagram not found');

    const svgClone = svgElement.cloneNode(true);
    
    // Extract dimensions from viewBox or attributes
    let width = 1350;
    let height = 800;
    if (svgElement.viewBox && svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.width > 0) {
      width = svgElement.viewBox.baseVal.width;
      height = svgElement.viewBox.baseVal.height;
    } else if (svgElement.getAttribute('viewBox')) {
      const parts = svgElement.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }

    svgClone.setAttribute('width', width);
    svgClone.setAttribute('height', height);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Insert white background rect if solid background requested
    if (!transparent) {
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', '#FFFFFF');
      svgClone.insertBefore(bgRect, svgClone.firstChild);
    }

    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width * exportScale);
          canvas.height = Math.round(height * exportScale);
          const ctx = canvas.getContext('2d');

          if (!transparent) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(blobURL);
          resolve(canvas);
        } catch (canvasErr) {
          URL.revokeObjectURL(blobURL);
          reject(canvasErr);
        }
      };
      image.onerror = (err) => {
        URL.revokeObjectURL(blobURL);
        reject(err);
      };
      image.src = blobURL;
    });
  };

  // Export as PNG
  const handleExportPNG = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderSvgToCanvas(scale, !includeBg);
      const filename = `${sanitizeFilename(title)}_${scale}x.png`;

      const triggerDownload = (uri) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        setExportSuccess(`Downloaded ${filename}`);
        setTimeout(() => setExportSuccess(''), 3500);
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = window.URL.createObjectURL(blob);
            triggerDownload(url);
            setTimeout(() => window.URL.revokeObjectURL(url), 2000);
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            triggerDownload(dataUrl);
          }
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownload(dataUrl);
      }
    } catch (err) {
      console.error('PNG export error:', err);
      setIsExporting(false);
      alert('Could not export PNG. Please try downloading Vector SVG.');
    }
  };

  // Export as Vector SVG
  const handleExportSVG = () => {
    try {
      setIsExporting(true);
      const svgElement = document.getElementById('sankey-export-svg');
      if (!svgElement) {
        setIsExporting(false);
        return;
      }

      const svgClone = svgElement.cloneNode(true);
      let width = 1350;
      let height = 800;
      if (svgElement.viewBox && svgElement.viewBox.baseVal && svgElement.viewBox.baseVal.width > 0) {
        width = svgElement.viewBox.baseVal.width;
        height = svgElement.viewBox.baseVal.height;
      } else if (svgElement.getAttribute('viewBox')) {
        const parts = svgElement.getAttribute('viewBox').trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          width = parts[2];
          height = parts[3];
        }
      }

      svgClone.setAttribute('width', width);
      svgClone.setAttribute('height', height);
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      if (includeBg) {
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', '#FFFFFF');
        svgClone.insertBefore(bgRect, svgClone.firstChild);
      }

      const svgString = '<?xml version="1.0" standalone="no"?>\r\n' + new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const filename = `${sanitizeFilename(title)}.svg`;

      const link = document.createElement('a');
      link.download = filename;
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      setIsExporting(false);
      setExportSuccess(`Downloaded ${filename}`);
      setTimeout(() => setExportSuccess(''), 3500);
    } catch (err) {
      console.error('SVG export error:', err);
      setIsExporting(false);
    }
  };

  // Copy PNG to Clipboard
  const handleCopyClipboard = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderSvgToCanvas(2, !includeBg);
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setIsExporting(false);
          setCopied(true);
          setExportSuccess('Diagram copied to clipboard!');
          setTimeout(() => {
            setCopied(false);
            setExportSuccess('');
          }, 3500);
        } catch (clipErr) {
          console.error('Clipboard write error:', clipErr);
          setIsExporting(false);
          alert('Could not copy to clipboard directly. Please use Download PNG.');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary-500" />
            <h3 className="modal-title">Export Diagram</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Resolution Options */}
          <div className="control-group">
            <label className="control-label">PNG Resolution / Quality</label>
            <div className="resolution-selector-grid">
              <button
                className={`res-btn ${scale === 1 ? 'active' : ''}`}
                onClick={() => setScale(1)}
              >
                <div className="res-title">1x (Standard)</div>
                <div className="res-subtitle">1350 × 800 px (Web)</div>
              </button>
              <button
                className={`res-btn ${scale === 2 ? 'active' : ''}`}
                onClick={() => setScale(2)}
              >
                <div className="res-title">2x (High-Res)</div>
                <div className="res-subtitle">2700 × 1600 px (HD Print)</div>
              </button>
              <button
                className={`res-btn ${scale === 4 ? 'active' : ''}`}
                onClick={() => setScale(4)}
              >
                <div className="res-title">4x (Ultra 4K)</div>
                <div className="res-subtitle">5400 × 3200 px (Presentation)</div>
              </button>
            </div>
          </div>

          {/* Background Toggle */}
          <div className="control-group mt-4">
            <div className="toggle-switch-row">
              <div>
                <label className="control-label mb-0">Solid White Background</label>
                <div className="control-hint">Toggle off for transparent background</div>
              </div>
              <input
                type="checkbox"
                checked={includeBg}
                onChange={e => setIncludeBg(e.target.checked)}
                className="custom-checkbox"
              />
            </div>
          </div>

          {/* Success Banner */}
          {exportSuccess && (
            <div className="export-success-banner">
              <Check size={16} />
              <span>{exportSuccess}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="modal-footer">
          <button
            className="btn-modal-action"
            onClick={handleCopyClipboard}
            disabled={isExporting}
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>

          <button
            className="btn-modal-action"
            onClick={handleExportSVG}
            disabled={isExporting}
          >
            <FileCode size={16} />
            <span>Download Vector SVG</span>
          </button>

          <button
            className="btn-modal-primary"
            onClick={handleExportPNG}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Download PNG ({scale}x)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
