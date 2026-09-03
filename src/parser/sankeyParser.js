import { detectIconForNode } from '../utils/themeAndIcons';

/**
 * Format numbers with commas or compact notation
 */
export function formatValue(val, { prefix = '', suffix = '', compact = false, decimals = 0 } = {}) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  
  let formatted = '';
  if (compact) {
    if (Math.abs(val) >= 1e9) {
      formatted = (val / 1e9).toFixed(1) + 'B';
    } else if (Math.abs(val) >= 1e6) {
      formatted = (val / 1e6).toFixed(1) + 'M';
    } else if (Math.abs(val) >= 1e3) {
      formatted = (val / 1e3).toFixed(1) + 'k';
    } else {
      formatted = val.toLocaleString();
    }
  } else {
    formatted = Number(val).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  return `${prefix}${formatted}${suffix}`;
}

export function parseSankeyText(rawText, userPalette, customOverrides = {}) {
  const lines = rawText.split(/\r?\n/);
  const links = [];
  const nodeOverrides = { ...customOverrides };
  const metadata = {};
  const errors = [];

  // Match line format: Source [Value] Target (optional #color or extra tags)
  // Supports: Source Name [12345.67] Target Name #optionalColor
  const linkRegex = /^\s*([^\[\]]+?)\s*\[\s*([\d,.]+)\s*\]\s*([^#\[\]]+?)(?:\s+#([a-fA-F0-9]{3,8}))?\s*$/;
  // Node directive: :NodeName #color or :NodeName [icon=gear, color=#...]
  const nodeDirectiveRegex = /^\s*:\s*([^#\[]+?)(?:\s+#([a-fA-F0-9]{3,8}))?(?:\s*\[(.*)\])?\s*$/;
  // Metadata directive: @key value
  const metaRegex = /^\s*@(\w+)\s+(.+)$/;

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    const line = rawLine.trim();

    if (!line || line.startsWith('//') || line.startsWith('#')) {
      return; // Skip comments and blanks
    }

    if (line.startsWith('@')) {
      const metaMatch = line.match(metaRegex);
      if (metaMatch) {
        metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      }
      return;
    }

    if (line.startsWith(':')) {
      const dirMatch = line.match(nodeDirectiveRegex);
      if (dirMatch) {
        const name = dirMatch[1].trim();
        let color = dirMatch[2] ? `#${dirMatch[2]}` : undefined;
        let icon = undefined;
        if (dirMatch[3]) {
          const props = dirMatch[3].split(',');
          props.forEach(p => {
            const [k, v] = p.split('=').map(s => s.trim());
            if (k === 'icon') icon = v;
            if (k === 'color') color = v.startsWith('#') ? v : `#${v}`;
          });
        }
        nodeOverrides[name] = {
          ...(nodeOverrides[name] || {}),
          ...(color ? { color } : {}),
          ...(icon ? { icon } : {})
        };
      }
      return;
    }

    const match = line.match(linkRegex);
    if (match) {
      const source = match[1].trim();
      const rawVal = match[2].replace(/,/g, '');
      const value = parseFloat(rawVal);
      const target = match[3].trim();
      const linkColor = match[4] ? `#${match[4]}` : null;

      if (isNaN(value) || value <= 0) {
        errors.push({ line: lineNum, message: `Invalid numeric value "${match[2]}"` });
        return;
      }
      if (!source || !target) {
        errors.push({ line: lineNum, message: 'Source and Target names cannot be empty' });
        return;
      }
      if (source === target) {
        errors.push({ line: lineNum, message: `Self-referential link on "${source}"` });
        return;
      }

      links.push({
        source,
        target,
        value,
        color: linkColor,
        line: lineNum
      });
    } else {
      errors.push({ line: lineNum, message: `Unrecognized format. Expected: Source [Amount] Target` });
    }
  });

  // Build Graph Nodes
  const nodeMap = new Map();
  let nodeOrderCounter = 0;
  function getOrCreateNode(name) {
    if (!nodeMap.has(name)) {
      nodeMap.set(name, {
        id: name,
        name: name,
        inLinks: [],
        outLinks: [],
        inValue: 0,
        outValue: 0,
        value: 0,
        depth: 0,
        order: nodeOrderCounter++,
        color: null,
        icon: null
      });
    }
    return nodeMap.get(name);
  }

  links.forEach(l => {
    const sNode = getOrCreateNode(l.source);
    const tNode = getOrCreateNode(l.target);
    sNode.outLinks.push(l);
    tNode.inLinks.push(l);
    sNode.outValue += l.value;
    tNode.inValue += l.value;
  });

  const nodes = Array.from(nodeMap.values());

  // Determine node values
  nodes.forEach(n => {
    n.value = Math.max(n.inValue, n.outValue);
  });

  // Calculate Stages / Depths using DAG Longest Path
  const rootNodes = nodes.filter(n => n.inLinks.length === 0);
  const leafNodes = nodes.filter(n => n.outLinks.length === 0);

  // Compute depth for all nodes
  const visited = new Set();
  function computeDepth(node, currentDepth = 0) {
    if (currentDepth > node.depth) {
      node.depth = currentDepth;
    }
    if (visited.has(node.id + '_' + currentDepth)) return;
    visited.add(node.id + '_' + currentDepth);

    node.outLinks.forEach(link => {
      const target = nodeMap.get(link.target);
      if (target) {
        computeDepth(target, currentDepth + 1);
      }
    });
  }

  rootNodes.forEach(r => computeDepth(r, 0));

  // Find max depth
  const maxDepth = nodes.reduce((max, n) => Math.max(max, n.depth), 0);

  // Total Root Inflow
  const totalRootValue = rootNodes.reduce((sum, n) => sum + (n.outValue || n.value), 0) || 1;
  const totalLeafValue = leafNodes.reduce((sum, n) => sum + (n.inValue || n.value), 0) || 0;

  // Group nodes by depth / stage column
  const stages = [];
  for (let d = 0; d <= maxDepth; d++) {
    stages.push(nodes.filter(n => n.depth === d));
  }

  // Preserve input data order for each stage
  stages.forEach(stage => {
    stage.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Assign Colors & Icons
  const paletteColors = userPalette?.colors || [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#EF4444', '#64748B'
  ];

  // Map primary stage nodes (depth 1 or intermediate) to palette colors
  let colorIdx = 0;
  stages.forEach((stage, depth) => {
    stage.forEach(node => {
      // Overrides
      const override = nodeOverrides[node.name] || {};
      
      // Auto icon
      node.icon = override.icon || detectIconForNode(node.name);

      if (override.color) {
        node.color = override.color;
      } else if (depth === 0) {
        node.color = userPalette?.rootColor || '#0F172A';
      } else {
        // Inherit color from parent incoming link or next palette color
        if (node.inLinks.length > 0) {
          const parentNode = nodeMap.get(node.inLinks[0].source);
          if (parentNode && parentNode.depth > 0 && parentNode.color) {
            node.color = parentNode.color;
          } else {
            node.color = paletteColors[colorIdx % paletteColors.length];
            colorIdx++;
          }
        } else {
          node.color = paletteColors[colorIdx % paletteColors.length];
          colorIdx++;
        }
      }
    });
  });

  // Assign link colors based on source or target node
  links.forEach(l => {
    const sNode = nodeMap.get(l.source);
    const tNode = nodeMap.get(l.target);
    if (!l.color) {
      if (tNode && tNode.color && sNode.depth === 0) {
        l.color = tNode.color;
      } else if (sNode && sNode.color) {
        l.color = sNode.color;
      } else {
        l.color = '#94A3B8';
      }
    }
  });

  // Auto-generate Dynamic Key Insights
  const insights = generateInsights({
    rootNodes,
    stages,
    leafNodes,
    totalRootValue,
    totalLeafValue,
    nodeMap
  });

  return {
    nodes,
    links,
    stages,
    rootNodes,
    leafNodes,
    totalRootValue,
    totalLeafValue,
    maxDepth,
    errors,
    metadata,
    insights
  };
}

/**
 * Automatically calculates dynamic domain-agnostic insights
 */
function generateInsights({ rootNodes, stages, leafNodes, totalRootValue, totalLeafValue, nodeMap }) {
  const bullets = [];

  // 1. Stage 1 Breakdown (Largest contributor)
  if (stages.length > 1 && stages[1].length > 0) {
    const primaryStage = stages[1];
    const topPrimary = primaryStage[0];
    const topShare = ((topPrimary.value / totalRootValue) * 100).toFixed(topPrimary.value / totalRootValue < 0.1 ? 1 : 0);
    bullets.push(`${topPrimary.name} is the largest consumer / stream (${topShare}%)`);

    if (primaryStage.length > 1) {
      const secondPrimary = primaryStage[1];
      const secondShare = ((secondPrimary.value / totalRootValue) * 100).toFixed(secondPrimary.value / totalRootValue < 0.1 ? 1 : 0);
      bullets.push(`${secondPrimary.name} is the 2nd highest (${secondShare}%)`);
    }
  }

  // 2. Identify top focus areas (top 3-4 categories)
  if (stages.length > 1) {
    const topCategories = stages[1].slice(0, 4).map(n => n.name.split('(')[0].split('/')[0].trim());
    if (topCategories.length >= 2) {
      bullets.push(`Focus areas for optimization: ${topCategories.join(', ')}`);
    }
  }

  // 3. Detect Losses, Waste, Bounces, Overhead
  const lossNodes = Array.from(nodeMap.values()).filter(n => {
    const l = n.name.toLowerCase();
    return l.includes('loss') || l.includes('waste') || l.includes('leak') || l.includes('bounce') || l.includes('drop');
  });

  if (lossNodes.length > 0) {
    const totalLoss = lossNodes.reduce((sum, n) => sum + (n.value || 0), 0);
    const lossPct = ((totalLoss / totalRootValue) * 100).toFixed(1);
    const primaryLossName = lossNodes[0].name;
    bullets.push(`${primaryLossName} / Inefficiencies accounted for ${lossPct}% of total`);
  } else if (Math.abs(totalRootValue - totalLeafValue) > 0.01 && totalLeafValue > 0) {
    const diff = totalRootValue - totalLeafValue;
    const diffPct = Math.abs((diff / totalRootValue) * 100).toFixed(1);
    bullets.push(`Flow delta / unallocated balance: ${diffPct}%`);
  }

  return bullets;
}
