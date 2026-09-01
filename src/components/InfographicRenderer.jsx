import React, { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { formatValue } from '../parser/sankeyParser';

// Dynamic Icon Component
function DynamicIcon({ name, size = 24, color = 'currentColor', className = '' }) {
  const IconComponent = LucideIcons[name] || LucideIcons.Layers || LucideIcons.Activity;
  return <IconComponent size={size} color={color} className={className} />;
}

export default function InfographicRenderer({
  parsedData,
  title,
  subtitle,
  note,
  unitPrefix = '',
  unitSuffix = '',
  showPercentages = true,
  palette,
  insights = [],
  showInsights = true,
  cardRadius = 12,
  ribbonCurvature = 0.5,
  compactNumbers = false,
  customInsights = null
}) {
  const { stages, rootNodes, totalRootValue, links, maxDepth } = parsedData;

  // ViewBox & Layout Dimensions
  const SVG_WIDTH = 1350;
  const HEADER_HEIGHT = 90;
  const FOOTER_HEIGHT = 45;
  const PADDING_TOP = HEADER_HEIGHT + 20;
  const PADDING_BOTTOM = FOOTER_HEIGHT + 20;

  // Calculate dynamic height based on total items
  const maxItemsInStage = useMemo(() => {
    return Math.max(...stages.map(s => s.length), 6);
  }, [stages]);

  const SVG_HEIGHT = Math.max(760, PADDING_TOP + PADDING_BOTTOM + maxItemsInStage * 68 + 80);
  const CONTENT_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM - 60;

  // Compute Layout Positions
  const layout = useMemo(() => {
    if (!stages || stages.length === 0) return null;

    const nodePositions = new Map();
    const stageCount = stages.length;

    // Determine column X positions
    // 3-Stage Layout (Root -> Middle Cards -> Leaf Items)
    let colX = [];
    if (stageCount === 2) {
      colX = [60, 720];
    } else if (stageCount === 3) {
      colX = [60, 480, 960];
    } else {
      // 4+ stages: distribute evenly
      const availableW = SVG_WIDTH - 140;
      const step = availableW / (stageCount - 1);
      colX = stages.map((_, i) => 60 + i * step);
    }

    // Stage 0: Root Node(s)
    const stage0 = stages[0] || [];
    const rootCardW = 190;
    const rootCardH = Math.min(220, Math.max(160, CONTENT_HEIGHT * 0.45));
    const rootYStart = PADDING_TOP + (CONTENT_HEIGHT - rootCardH) / 2 - 30;

    stage0.forEach((node, idx) => {
      const x = colX[0];
      const y = rootYStart + idx * (rootCardH + 20);
      nodePositions.set(node.id, {
        x,
        y,
        width: rootCardW,
        height: rootCardH,
        isRoot: true,
        node
      });
    });

    // Stage 1 (Middle Stage) - Cards
    if (stages.length > 1) {
      const stage1 = stages[1];
      const cardW = stageCount > 3 ? 240 : 280;
      const cardH = 58;
      const totalAvailable = CONTENT_HEIGHT;
      const spacing = Math.min(24, Math.max(10, (totalAvailable - stage1.length * cardH) / Math.max(1, stage1.length - 1)));
      const startY = PADDING_TOP + Math.max(0, (totalAvailable - (stage1.length * cardH + (stage1.length - 1) * spacing)) / 2);

      stage1.forEach((node, idx) => {
        const x = colX[1];
        const y = startY + idx * (cardH + spacing);
        nodePositions.set(node.id, {
          x,
          y,
          width: cardW,
          height: cardH,
          isMiddle: true,
          node
        });
      });
    }

    // Stage 2 (Leaf / Subsequent Stages)
    if (stages.length > 2) {
      for (let sIdx = 2; sIdx < stages.length; sIdx++) {
        const stage = stages[sIdx];
        const isLastStage = sIdx === stages.length - 1;
        const colLeft = colX[sIdx];
        const itemW = 340;
        const itemH = 26;

        // Group leaf nodes by their incoming parent to align visually next to parent
        const parentGroups = new Map();
        stage.forEach(node => {
          const parentId = node.inLinks[0]?.source || 'root';
          if (!parentGroups.has(parentId)) parentGroups.set(parentId, []);
          parentGroups.get(parentId).push(node);
        });

        // Position nodes vertically anchored near parent card
        let globalYOffset = PADDING_TOP + 10;
        const parentPosMap = nodePositions;

        parentGroups.forEach((groupNodes, parentId) => {
          const parentPos = parentPosMap.get(parentId);
          let groupStartY = globalYOffset;

          if (parentPos) {
            const expectedCenter = parentPos.y + parentPos.height / 2;
            const groupTotalH = groupNodes.length * 30;
            groupStartY = Math.max(globalYOffset, expectedCenter - groupTotalH / 2);
          }

          groupNodes.forEach((node, idx) => {
            const y = groupStartY + idx * 30;
            nodePositions.set(node.id, {
              x: colLeft,
              y,
              width: itemW,
              height: itemH,
              isLeaf: isLastStage,
              node
            });
            globalYOffset = y + 30 + 6;
          });
        });
      }
    }

    return { nodePositions, colX };
  }, [stages, CONTENT_HEIGHT, SVG_WIDTH, PADDING_TOP, PADDING_BOTTOM]);

  // Generate Smooth Cubic Bézier Link Paths with dynamic ribbon thickness
  const ribbonPaths = useMemo(() => {
    if (!layout || !links) return [];

    const { nodePositions } = layout;
    const paths = [];

    // Track vertical cumulative offsets for multi-link branching
    const sourceOffsets = new Map();
    const targetOffsets = new Map();

    links.forEach((link, idx) => {
      const sPos = nodePositions.get(link.source);
      const tPos = nodePositions.get(link.target);
      if (!sPos || !tPos) return;

      const sNode = sPos.node;
      const tNode = tPos.node;

      // Calculate source ribbon portion
      const sTotalVal = sNode.outValue || sNode.value || 1;
      const tTotalVal = tNode.inValue || tNode.value || 1;

      const sCurrOffset = sourceOffsets.get(link.source) || 0;
      const tCurrOffset = targetOffsets.get(link.target) || 0;

      // Source anchor point
      const sFrac = link.value / sTotalVal;
      const tFrac = link.value / tTotalVal;

      let sY0, sY1, tY0, tY1;
      let sX = sPos.x + sPos.width;
      let tX = tPos.x;

      if (sPos.isRoot) {
        // Distribute proportionally across root card height
        const margin = 16;
        const activeH = sPos.height - margin * 2;
        sY0 = sPos.y + margin + (sCurrOffset / sTotalVal) * activeH;
        sY1 = sY0 + sFrac * activeH;
      } else {
        // Middle card source
        const margin = 8;
        const activeH = sPos.height - margin * 2;
        sY0 = sPos.y + margin + (sCurrOffset / sTotalVal) * activeH;
        sY1 = sY0 + sFrac * activeH;
      }

      if (tPos.isLeaf) {
        // Connect to leaf item marker
        tY0 = tPos.y + 6;
        tY1 = tPos.y + tPos.height - 6;
      } else {
        // Connect to middle card target
        const margin = 8;
        const activeH = tPos.height - margin * 2;
        tY0 = tPos.y + margin + (tCurrOffset / tTotalVal) * activeH;
        tY1 = tY0 + tFrac * activeH;
      }

      sourceOffsets.set(link.source, sCurrOffset + link.value);
      targetOffsets.set(link.target, tCurrOffset + link.value);

      // Smooth Cubic Bezier Ribbon Path
      const deltaX = tX - sX;
      const cpx1 = sX + deltaX * ribbonCurvature;
      const cpx2 = tX - deltaX * ribbonCurvature;

      // Top curve from (sX, sY0) to (tX, tY0)
      // Bottom curve back from (tX, tY1) to (sX, sY1)
      const d = `
        M ${sX} ${sY0}
        C ${cpx1} ${sY0}, ${cpx2} ${tY0}, ${tX} ${tY0}
        L ${tX} ${tY1}
        C ${cpx2} ${tY1}, ${cpx1} ${sY1}, ${sX} ${sY1}
        Z
      `;

      // Gradient ID for link
      const gradId = `link-grad-${idx}`;
      const sourceColor = sPos.isRoot ? '#64748B' : (sNode.color || '#94A3B8');
      const targetColor = tNode.color || link.color || '#3B82F6';

      paths.push({
        id: `link-${idx}`,
        d,
        gradId,
        sourceColor,
        targetColor,
        link
      });
    });

    return paths;
  }, [layout, links, ribbonCurvature]);

  // Active insights list
  const activeInsights = customInsights || insights;

  return (
    <div className="infographic-container" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <svg
        id="sankey-export-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
          background: palette?.background || '#FFFFFF'
        }}
      >
        <defs>
          {/* Shadow Filter for Cards */}
          <filter id="card-shadow" x="-8%" y="-8%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.07" />
          </filter>
          <filter id="root-shadow" x="-10%" y="-10%" width="125%" height="135%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.22" />
          </filter>

          {/* Gradients for Ribbons */}
          {ribbonPaths.map(r => (
            <linearGradient key={r.gradId} id={r.gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={r.sourceColor} stopOpacity="0.75" />
              <stop offset="100%" stopColor={r.targetColor} stopOpacity="0.85" />
            </linearGradient>
          ))}
        </defs>

        {/* ================= HEADER ================= */}
        <g id="sankey-header" transform="translate(60, 45)">
          <text
            x={SVG_WIDTH / 2 - 60}
            y="0"
            textAnchor="middle"
            fill={palette?.textMain || '#0F172A'}
            fontSize="26"
            fontWeight="800"
            letterSpacing="-0.5px"
          >
            {title || 'Flow Breakdown – Sankey Diagram'}
          </text>
          {subtitle && (
            <text
              x={SVG_WIDTH / 2 - 60}
              y="26"
              textAnchor="middle"
              fill={palette?.textMuted || '#64748B'}
              fontSize="15"
              fontWeight="500"
            >
              {subtitle}
            </text>
          )}
        </g>

        {/* ================= RIBBON FLOWS ================= */}
        <g id="sankey-ribbons">
          {ribbonPaths.map(r => (
            <path
              key={r.id}
              d={r.d}
              fill={`url(#${r.gradId})`}
              className="sankey-ribbon-path"
              style={{
                transition: 'opacity 0.2s ease',
                cursor: 'pointer'
              }}
            >
              <title>{`${r.link.source} → ${r.link.target}: ${formatValue(r.link.value, { prefix: unitPrefix, suffix: unitSuffix, compact: compactNumbers })}`}</title>
            </path>
          ))}
        </g>

        {/* ================= NODES RENDERING ================= */}
        {layout && (
          <g id="sankey-nodes">
            {Array.from(layout.nodePositions.values()).map(pos => {
              const { node, x, y, width, height, isRoot, isMiddle, isLeaf } = pos;
              const pct = ((node.value / totalRootValue) * 100).toFixed(node.value / totalRootValue < 0.1 ? 1 : 0);
              const formattedVal = formatValue(node.value, {
                prefix: unitPrefix,
                suffix: unitSuffix,
                compact: compactNumbers
              });

              // 1. ROOT NODE (Left Dark Card matching screenshot)
              if (isRoot) {
                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`} filter="url(#root-shadow)">
                    {/* Dark Card Background */}
                    <rect
                      width={width}
                      height={height}
                      rx={cardRadius + 4}
                      fill={node.color || palette?.rootColor || '#0F172A'}
                    />
                    {/* Inner Accent Line */}
                    <rect
                      x="1"
                      y="1"
                      width={width - 2}
                      height={height - 2}
                      rx={cardRadius + 3}
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1.5"
                    />

                    {/* Icon Container */}
                    <g transform={`translate(${width / 2 - 20}, 28)`}>
                      <DynamicIcon name={node.icon || 'Factory'} size={40} color="#FFFFFF" />
                    </g>

                    {/* Root Node Title */}
                    <text
                      x={width / 2}
                      y={height - 76}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="14"
                      fontWeight="800"
                      letterSpacing="0.6px"
                    >
                      {node.name.toUpperCase()}
                    </text>

                    {/* Root Value */}
                    <text
                      x={width / 2}
                      y={height - 48}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="18"
                      fontWeight="700"
                    >
                      {formattedVal}
                    </text>

                    {/* Root 100% Badge */}
                    {showPercentages && (
                      <text
                        x={width / 2}
                        y={height - 24}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.85)"
                        fontSize="14"
                        fontWeight="600"
                      >
                        (100%)
                      </text>
                    )}
                  </g>
                );
              }

              // 2. MIDDLE STAGE NODE (Clean rounded card with colored border & icon)
              if (isMiddle) {
                const nodeColor = node.color || '#3B82F6';
                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`} filter="url(#card-shadow)">
                    {/* Card Background */}
                    <rect
                      width={width}
                      height={height}
                      rx={cardRadius}
                      fill="#FFFFFF"
                      stroke={nodeColor}
                      strokeWidth="1.5"
                    />

                    {/* Left Icon Pill */}
                    <rect
                      x="0"
                      y="0"
                      width="58"
                      height={height}
                      rx={cardRadius}
                      fill={`${nodeColor}14`}
                    />
                    {/* Cover right radius of the left pill */}
                    <rect
                      x="40"
                      y="0"
                      width="18"
                      height={height}
                      fill={`${nodeColor}14`}
                    />

                    {/* Icon Component */}
                    <g transform={`translate(17, ${(height - 24) / 2})`}>
                      <DynamicIcon name={node.icon} size={24} color={nodeColor} />
                    </g>

                    {/* Node Name */}
                    <text
                      x="68"
                      y="24"
                      fill={palette?.textMain || '#0F172A'}
                      fontSize="13"
                      fontWeight="700"
                      letterSpacing="0.2px"
                    >
                      {node.name.length > 26 ? node.name.slice(0, 24) + '…' : node.name}
                    </text>

                    {/* Node Value & Percentage */}
                    <text
                      x="68"
                      y="44"
                      fill={palette?.textMuted || '#475569'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {formattedVal} {showPercentages ? `(${pct}%)` : ''}
                    </text>
                  </g>
                );
              }

              // 3. LEAF ITEM (Right List item with colored marker)
              if (isLeaf) {
                const leafColor = node.color || '#3B82F6';
                return (
                  <g key={node.id} transform={`translate(${x}, ${y})`}>
                    {/* Small Colored Marker */}
                    <rect
                      x="0"
                      y="4"
                      width="8"
                      height="14"
                      rx="3"
                      fill={leafColor}
                    />

                    {/* Leaf Label */}
                    <text
                      x="16"
                      y="16"
                      fill={palette?.textMain || '#0F172A'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {node.name}
                    </text>

                    {/* Leaf Value & Percentage */}
                    <text
                      x={width}
                      y="16"
                      textAnchor="end"
                      fill={palette?.textMuted || '#334155'}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {formattedVal} {showPercentages ? `(${pct}%)` : ''}
                    </text>
                  </g>
                );
              }

              return null;
            })}
          </g>
        )}

        {/* ================= KEY INSIGHTS CALLOUT PANEL ================= */}
        {showInsights && activeInsights.length > 0 && (
          <g id="sankey-insights" transform={`translate(60, ${SVG_HEIGHT - FOOTER_HEIGHT - 135})`}>
            {/* Box container */}
            <rect
              width="290"
              height="125"
              rx="12"
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="1.2"
            />
            {/* Blue accent left strip */}
            <rect
              width="5"
              height="125"
              rx="3"
              fill="#3B82F6"
            />

            {/* Title */}
            <text
              x="18"
              y="24"
              fill="#1E3A8A"
              fontSize="14"
              fontWeight="800"
              fontStyle="italic"
            >
              Key Insights
            </text>

            {/* Insight Bullets */}
            {activeInsights.slice(0, 4).map((bullet, idx) => (
              <g key={idx} transform={`translate(18, ${44 + idx * 19})`}>
                <circle cx="2" cy="-4" r="2.5" fill="#64748B" />
                <text
                  x="10"
                  y="0"
                  fill="#334155"
                  fontSize="11"
                  fontWeight="500"
                >
                  {bullet.length > 44 ? bullet.slice(0, 42) + '…' : bullet}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* ================= FOOTER / NOTE ================= */}
        {note && (
          <g id="sankey-footer" transform={`translate(${SVG_WIDTH / 2}, ${SVG_HEIGHT - 18})`}>
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={palette?.textMuted || '#94A3B8'}
              fontSize="12"
              fontWeight="400"
            >
              {note}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
