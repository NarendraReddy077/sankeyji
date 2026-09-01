import React from 'react';
import { X, HelpCircle, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function SyntaxHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card syntax-modal">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-primary-500" />
            <h3 className="modal-title">SankeyJi Text Format Cheat Sheet</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="syntax-doc-block">
            <div className="syntax-heading">1. Basic Flow Line</div>
            <p className="syntax-desc">Connect any source to target with a value inside brackets:</p>
            <div className="syntax-code">
              Source [Amount] Target<br/>
              <span className="text-emerald-400">Total Energy [540000] Production</span><br/>
              <span className="text-emerald-400">Gross Revenue [1200000] COGS</span>
            </div>
          </div>

          <div className="syntax-doc-block">
            <div className="syntax-heading">2. Multi-tier / Multi-stage Flows</div>
            <p className="syntax-desc">Chain stages naturally by using the target of one line as the source of the next:</p>
            <div className="syntax-code">
              Total Inflow [1000] Operations<br/>
              Operations [600] Machinery<br/>
              Operations [400] Labor
            </div>
          </div>

          <div className="syntax-doc-block">
            <div className="syntax-heading">3. Custom Link Colors</div>
            <p className="syntax-desc">Append a hex color code at the end of any line:</p>
            <div className="syntax-code">
              Production [90000] Motors & Drives <span className="text-amber-300">#3B82F6</span>
            </div>
          </div>

          <div className="syntax-doc-block">
            <div className="syntax-heading">4. Node Directives (Custom Icon & Color)</div>
            <p className="syntax-desc">Prefix with colon <code>:</code> to configure a node's icon or color:</p>
            <div className="syntax-code">
              :Machinery #10B981<br/>
              :HVAC [icon=Snowflake, color=#06B6D4]
            </div>
          </div>

          <div className="syntax-doc-block">
            <div className="syntax-heading">5. Comments & Whitespace</div>
            <p className="syntax-desc">Lines starting with <code>//</code> or <code>#</code> are treated as comments and ignored:</p>
            <div className="syntax-code">
              <span className="text-slate-400">// === Energy Inflow Section ===</span><br/>
              Total Energy [1000000] Factory
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-modal-primary" onClick={onClose}>
            Got it, Let's build!
          </button>
        </div>
      </div>
    </div>
  );
}
