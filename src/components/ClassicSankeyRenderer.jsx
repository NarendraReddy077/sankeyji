import React, { useMemo, useState } from 'react';
import { sankey, sankeyLinkHorizontal, sankeyJustify, sankeyLeft, sankeyRight, sankeyCenter } from 'd3-sankey';
import { formatValue } from '../parser/sankeyParser';

// Format percentage helper
function formatPercentage(val, baseVal) {
  if (!baseVal || baseVal <= 0 || isNaN(val)) return '0%';
  const rawPct = (val / baseVal) * 100;
  if (rawPct >= 99.95) return '100%';
  if (rawPct <= 0.05 && rawPct > 0) return '0.1%';
  if (Math.abs(rawPct - Math.round(rawPct)) < 0.05) {
    return `${Math.round(rawPct)}%`;
  }
  return `${rawPct.toFixed(1)}%`;
}

export default function ClassicSankeyRenderer({
  parsedData,
  title,
  subtitle,
  note,
  unitPrefix = '',
  unitSuffix = '',
  showPercentages = true,
  percentageBasis = 'branch',
  palette,
  nodeWidth = 24,
  nodePadding = 18,
  linkOpacity = 0.55,
  compactNumbers = false,
  nodeAlign = 'justify'
}) {
  const { nodes: rawNodes, links: rawLinks, totalRootValue } = parsedData;
  const [hoveredItem, setHoveredItem] = useState(null);

  const SVG_WIDTH = 1350;
  const SVG_HEIGHT = 800;
  const MARGIN = { top: 90, right: 180, bottom: 60, left: 160 };

  // Alignment functions
  const alignFn = {
    justify: sankeyJustify,
    left: sankeyLeft,
    right: sankeyRight,
    center: sankeyCenter
  }[nodeAlign] || sankeyJustify;

  // D3 Sankey Layout
  const sankeyData = useMemo(() => {
    if (!rawNodes.length || !rawLinks.length) return null;

    try {
      // Deep copy to prevent d3 mutation collisions
      const nodes = rawNodes.map(d => ({ ...d }));
      const links = rawLinks.map(d => ({
        ...d,
        source: d.source,
        target: d.target,
        value: d.value
      }));

      const sankeyGenerator = sankey()
        .nodeId(d => d.id)
        .nodeAlign(alignFn)
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .extent([
          [MARGIN.left, MARGIN.top],
          [SVG_WIDTH - MARGIN.right, SVG_HEIGHT - MARGIN.bottom]
        ]);

      const graph = sankeyGenerator({ nodes, links });
      return graph;
    } catch (err) {
      console.error('Sankey layout error:', err);
      return null;
    }
  }, [rawNodes, rawLinks, nodeWidth, nodePadding, alignFn, MARGIN.left, MARGIN.top, MARGIN.right, MARGIN.bottom, SVG_WIDTH, SVG_HEIGHT]);

  const pathGenerator = sankeyLinkHorizontal();

  if (!sankeyData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        Rendering diagram...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
          {sankeyData.links.map((link, i) => {
            const gradId = `classic-link-grad-${i}`;
            const sColor = link.source.color || '#3B82F6';
            const tColor = link.target.color || '#10B981';
            return (
              <linearGradient key={gradId} id={gradId} gradientUnits="userSpaceOnUse" x1={link.source.x1} x2={link.target.x0}>
                <stop offset="0%" stopColor={sColor} stopOpacity={linkOpacity} />
                <stop offset="100%" stopColor={tColor} stopOpacity={linkOpacity} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Header */}
        <g transform="translate(60, 45)">
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

        {/* Links */}
        <g id="classic-links">
          {sankeyData.links.map((link, i) => {
            const d = pathGenerator(link);
            const isHovered = hoveredItem && hoveredItem.type === 'link' && hoveredItem.index === i;
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={`url(#classic-link-grad-${i})`}
                strokeWidth={Math.max(1, link.width)}
                strokeOpacity={isHovered ? 0.9 : 1}
                style={{ transition: 'stroke-opacity 0.2s', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredItem({ type: 'link', index: i, data: link })}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <title>{`${link.source.name} → ${link.target.name}: ${formatValue(link.value, { prefix: unitPrefix, suffix: unitSuffix, compact: compactNumbers })}`}</title>
              </path>
            );
          })}
        </g>

        {/* Nodes */}
        <g id="classic-nodes">
          {sankeyData.nodes.map((node) => {
            const nodeH = Math.max(2, node.y1 - node.y0);
            const isRightSide = node.x0 > SVG_WIDTH / 2;

            // Find parent node
            let parentNode = null;
            if (node.targetLinks && node.targetLinks.length > 0) {
              parentNode = node.targetLinks[0].source;
            }

            let pctDisplay = '';
            if (node.sourceLinks && node.sourceLinks.length > 0 && (!node.targetLinks || node.targetLinks.length === 0)) {
              pctDisplay = '100%';
            } else if (percentageBasis === 'branch' && parentNode) {
              pctDisplay = formatPercentage(node.value, parentNode.value);
            } else {
              pctDisplay = formatPercentage(node.value, totalRootValue);
            }

            const totalPctDisplay = formatPercentage(node.value, totalRootValue);
            const formattedVal = formatValue(node.value, { prefix: unitPrefix, suffix: unitSuffix, compact: compactNumbers });

            return (
              <g key={node.id} transform={`translate(${node.x0}, ${node.y0})`}>
                <rect
                  width={node.x1 - node.x0}
                  height={nodeH}
                  rx="4"
                  fill={node.color || '#3B82F6'}
                  stroke="rgba(0,0,0,0.15)"
                  strokeWidth="1"
                  style={{ cursor: 'grab' }}
                  onMouseEnter={() => setHoveredItem({ type: 'node', data: node, parentNode, pctDisplay, totalPctDisplay })}
                  onMouseLeave={() => setHoveredItem(null)}
                />

                {/* Node Label Text */}
                <text
                  x={isRightSide ? (node.x1 - node.x0) + 10 : -10}
                  y={nodeH / 2}
                  dy="0.35em"
                  textAnchor={isRightSide ? 'start' : 'end'}
                  fill={palette?.textMain || '#0F172A'}
                  fontSize="13"
                  fontWeight="700"
                >
                  {node.name}
                </text>

                {/* Node Value */}
                <text
                  x={isRightSide ? (node.x1 - node.x0) + 10 : -10}
                  y={nodeH / 2 + 16}
                  dy="0.35em"
                  textAnchor={isRightSide ? 'start' : 'end'}
                  fill={palette?.textMuted || '#64748B'}
                  fontSize="11"
                  fontWeight="600"
                >
                  {formattedVal} {showPercentages ? `(${pctDisplay})` : ''}
                </text>
              </g>
            );
          })}
        </g>

        {/* Footer Note */}
        {note && (
          <g transform={`translate(${SVG_WIDTH / 2}, ${SVG_HEIGHT - 18})`}>
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

      {/* Floating Hover Tooltip */}
      {hoveredItem && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          {hoveredItem.type === 'link' ? (
            <div>
              <span style={{ color: '#94A3B8' }}>{hoveredItem.data.source.name}</span> → <span style={{ color: '#60A5FA', fontWeight: '700' }}>{hoveredItem.data.target.name}</span>
              <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: '#FFFFFF' }}>
                {formatValue(hoveredItem.data.value, { prefix: unitPrefix, suffix: unitSuffix, compact: compactNumbers })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: '700', color: '#60A5FA' }}>{hoveredItem.data.name}</div>
              <div style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>
                {formatValue(hoveredItem.data.value, { prefix: unitPrefix, suffix: unitSuffix, compact: compactNumbers })}
                <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '6px' }}>
                  ({hoveredItem.pctDisplay}{hoveredItem.parentNode ? ` of ${hoveredItem.parentNode.name}` : ''}, {hoveredItem.totalPctDisplay} of total)
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
