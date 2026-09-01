export const COLOR_PALETTES = [
  {
    id: 'executive_vibrant',
    name: 'Executive Infographic (Default)',
    description: 'Vibrant clean colors tailored for executive presentations',
    colors: [
      '#3B82F6', // Production / Blue
      '#10B981', // HVAC / Green
      '#F59E0B', // Lighting / Amber
      '#8B5CF6', // UPS / Purple
      '#06B6D4', // Common Areas / Cyan
      '#EF4444', // Utilities / Red
      '#64748B', // Losses / Slate Gray
      '#EC4899', // Pink
      '#F97316', // Orange
      '#14B8A6', // Teal
      '#6366F1'  // Indigo
    ],
    rootColor: '#0F172A', // Dark Navy Card
    background: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B'
  },
  {
    id: 'emerald_finance',
    name: 'Emerald & Gold Finance',
    description: 'Corporate luxury tones for revenue, P&L, and budgets',
    colors: [
      '#059669', '#10B981', '#34D399', '#D97706', '#F59E0B',
      '#2563EB', '#6366F1', '#475569', '#DC2626', '#0D9488'
    ],
    rootColor: '#064E3B',
    background: '#FFFFFF',
    textMain: '#064E3B',
    textMuted: '#475569'
  },
  {
    id: 'sunset_glow',
    name: 'Sunset Warmth',
    description: 'Warm coral, amber, violet, and crimson transitions',
    colors: [
      '#F43F5E', '#FB923C', '#FBBF24', '#A855F7', '#EC4899',
      '#3B82F6', '#10B981', '#64748B', '#E11D48', '#C026D3'
    ],
    rootColor: '#881337',
    background: '#FFFFFF',
    textMain: '#4C0519',
    textMuted: '#701A75'
  },
  {
    id: 'cyber_tech',
    name: 'Cyber & Cloud Tech',
    description: 'Vibrant neon cyan, violet, electric blue, and magenta',
    colors: [
      '#06B6D4', '#8B5CF6', '#3B82F6', '#EC4899', '#10B981',
      '#F59E0B', '#6366F1', '#14B8A6', '#F43F5E', '#94A3B8'
    ],
    rootColor: '#1E1B4B',
    background: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B'
  },
  {
    id: 'eco_green',
    name: 'Sustainability & ESG',
    description: 'Natural forest greens, sky blues, earth tones',
    colors: [
      '#15803D', '#047857', '#0284C7', '#65A30D', '#D97706',
      '#0D9488', '#854D0E', '#4B5563', '#DC2626', '#7C3AED'
    ],
    rootColor: '#14532D',
    background: '#FFFFFF',
    textMain: '#14532D',
    textMuted: '#4B5563'
  },
  {
    id: 'royal_indigo',
    name: 'Royal Indigo & Slate',
    description: 'Modern SaaS dark-to-light professional gradient',
    colors: [
      '#4F46E5', '#2563EB', '#0284C7', '#059669', '#D97706',
      '#7C3AED', '#DB2777', '#475569', '#EA580C', '#0891B2'
    ],
    rootColor: '#1E1B4B',
    background: '#FFFFFF',
    textMain: '#1E1B4B',
    textMuted: '#64748B'
  },
  {
    id: 'monochrome_slate',
    name: 'Monochrome Slate & Minimal',
    description: 'Sophisticated grayscale tones for clean reporting',
    colors: [
      '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1',
      '#1E293B', '#0F172A', '#52525B', '#71717A', '#A1A1AA'
    ],
    rootColor: '#0F172A',
    background: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B'
  }
];

export const KEYWORD_ICON_MAP = [
  { keywords: ['factory', 'plant', 'industry', 'manufactur', 'site'], icon: 'Factory' },
  { keywords: ['product', 'process', 'machin', 'equip', 'motor', 'gear', 'conveyor', 'driv', 'tool'], icon: 'Cog' },
  { keywords: ['hvac', 'chill', 'cool', 'air', 'fan', 'ventilat', 'ahu', 'cold', 'freez'], icon: 'Snowflake' },
  { keywords: ['light', 'lamp', 'bulb', 'illum'], icon: 'Lightbulb' },
  { keywords: ['ups', 'battery', 'backup', 'charg', 'cell', 'accumulat'], icon: 'BatteryCharging' },
  { keywords: ['common', 'admin', 'office', 'user', 'people', 'team', 'amenit', 'cafeteria', 'washroom', 'hr', 'staff', 'employ'], icon: 'Users' },
  { keywords: ['utilit', 'pump', 'water', 'compress', 'boiler', 'steam', 'gas', 'pipe', 'wrench', 'plumb'], icon: 'Wrench' },
  { keywords: ['loss', 'leak', 'waste', 'drop', 'transformer', 'drain', 'overhead', 'hazard', 'alert', 'error'], icon: 'AlertTriangle' },
  { keywords: ['energy', 'power', 'electr', 'volt', 'watt', 'kwh', 'mwh', 'grid', 'generat', 'solar', 'turbin'], icon: 'Zap' },
  { keywords: ['money', 'dollar', 'euro', 'revenue', 'profit', 'inflow', 'income', 'cogs', 'budget', 'finan', 'salari', 'tax', 'ebitda', 'fund', 'spend'], icon: 'DollarSign' },
  { keywords: ['market', 'sale', 'funnel', 'growth', 'lead', 'convers', 'campaign', 'ad', 'acquisit', 'prospect'], icon: 'TrendingUp' },
  { keywords: ['cloud', 'aws', 'azure', 'gcp', 'server', 'comput', 'kubernet', 'eks', 'node', 'host', 'vm'], icon: 'Cloud' },
  { keywords: ['db', 'database', 'sql', 'postgres', 'redis', 'dynamo', 'aurora', 'data'], icon: 'Database' },
  { keywords: ['storage', 's3', 'bucket', 'archive', 'disk', 'backup'], icon: 'HardDrive' },
  { keywords: ['carbon', 'co2', 'ghg', 'scope', 'emiss', 'green', 'eco', 'sustain', 'esg', 'climat'], icon: 'Leaf' },
  { keywords: ['traffic', 'web', 'visit', 'session', 'bounce', 'organic', 'search', 'social', 'page'], icon: 'Globe' },
  { keywords: ['activat', 'signup', 'pro', 'subscript', 'tier', 'plan', 'user'], icon: 'Target' },
  { keywords: ['logist', 'freight', 'deliver', 'ship', 'truck', 'transport', 'distribut', 'warehous', 'supply'], icon: 'Truck' },
  { keywords: ['secur', 'protect', 'shield', 'audit', 'complian'], icon: 'ShieldCheck' }
];

export function detectIconForNode(nodeName) {
  const lower = (nodeName || '').toLowerCase();
  for (const item of KEYWORD_ICON_MAP) {
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        return item.icon;
      }
    }
  }
  return 'Layers'; // Default neutral icon
}
