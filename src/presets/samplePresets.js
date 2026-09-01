export const SAMPLE_PRESETS = [
  {
    id: 'factory_energy',
    name: '🏭 Factory Energy Flow',
    category: 'Energy & Industrial',
    title: 'Factory Energy Flow – Sankey Diagram',
    subtitle: 'Example: Total Energy Consumption – 1,000,000 kWh / Month',
    unitSuffix: ' kWh',
    unitPrefix: '',
    paletteId: 'executive_vibrant',
    code: `// === Factory Energy Input to Departments ===
Total Energy Input [540000] Production / Process
Total Energy Input [160000] HVAC
Total Energy Input [90000] Lighting
Total Energy Input [70000] UPS & Power Backup
Total Energy Input [60000] Common Areas
Total Energy Input [50000] Utilities
Total Energy Input [30000] Losses

// === Production / Process Breakdown ===
Production / Process [280000] Machinery & Equipment
Production / Process [120000] Process Heating
Production / Process [90000] Motors & Drives
Production / Process [50000] Conveyors & Material Handling

// === HVAC Breakdown ===
HVAC [70000] AHU / Air Handling Units
HVAC [50000] Chillers & Cooling Towers
HVAC [40000] Pumps & Fans (HVAC)

// === Lighting Breakdown ===
Lighting [50000] Production Area Lighting
Lighting [25000] Warehouse Lighting
Lighting [15000] Outdoor Lighting

// === UPS & Backup Breakdown ===
UPS & Power Backup [50000] UPS Systems
UPS & Power Backup [20000] Battery Charging Losses

// === Common Areas Breakdown ===
Common Areas [30000] Office & Admin Areas
Common Areas [15000] Cafeteria / Amenities
Common Areas [15000] Washrooms & Others

// === Utilities Breakdown ===
Utilities [20000] Water Pumps
Utilities [20000] Compressed Air System
Utilities [10000] Boilers / Steam System

// === Losses Breakdown ===
Losses [15000] Transformer Losses
Losses [10000] Distribution Losses
Losses [5000] Other Electrical Losses`
  },
  {
    id: 'cloud_infrastructure',
    name: '☁️ Cloud Infrastructure (AWS / Azure) Bill',
    category: 'Technology & DevOps',
    title: 'Cloud Infrastructure & Architecture Cost Flow',
    subtitle: 'Monthly Multi-Cloud Expenditure Breakdown ($450,000 / mo)',
    unitSuffix: '',
    unitPrefix: '$',
    note: 'Cloud FinOps automated billing stream snapshot.',
    paletteId: 'cyber_tech',
    code: `Total Cloud Bill [210000] Compute & Containers
Total Cloud Bill [95000] Databases & Caching
Total Cloud Bill [75000] Storage & Backups
Total Cloud Bill [45000] Networking & CDN
Total Cloud Bill [25000] Observability & Security

// === Compute Breakdown ===
Compute & Containers [120000] Kubernetes (EKS Clusters)
Compute & Containers [60000] GPU Inference Instances
Compute & Containers [30000] Serverless Lambda

// === Databases Breakdown ===
Databases & Caching [55000] Managed Aurora PostgreSQL
Databases & Caching [25000] Redis ElastiCache Cluster
Databases & Caching [15000] DynamoDB & DocumentDB

// === Storage Breakdown ===
Storage & Backups [50000] Hot S3 Object Storage
Storage & Backups [25000] Glacier Deep Archive`
  },
  {
    id: 'carbon_footprint',
    name: '🌍 Corporate GHG Carbon Footprint',
    category: 'Sustainability & ESG',
    title: 'Corporate Greenhouse Gas (GHG) Emissions Flow',
    subtitle: 'Annual Carbon Accounting – Total: 120,000 tCO2e',
    unitSuffix: ' tCO2e',
    unitPrefix: '',
    note: 'Calculated compliant with GHG Protocol Corporate Standard (Scope 1, 2, and 3).',
    paletteId: 'eco_green',
    code: `Total Carbon Footprint [18000] Scope 1 (Direct)
Total Carbon Footprint [32000] Scope 2 (Indirect - Power)
Total Carbon Footprint [70000] Scope 3 (Supply Chain & Value)

// === Scope 1 Direct ===
Scope 1 (Direct) [10000] Natural Gas Heating
Scope 1 (Direct) [8000] Company Vehicle Fleet

// === Scope 2 Indirect ===
Scope 2 (Indirect - Power) [22000] Purchased Grid Electricity
Scope 2 (Indirect - Power) [10000] District Steam & Chilled Water

// === Scope 3 Value Chain ===
Scope 3 (Supply Chain & Value) [35000] Purchased Goods & Raw Materials
Scope 3 (Supply Chain & Value) [20000] Upstream Logistics & Freight
Scope 3 (Supply Chain & Value) [15000] Business Travel & Commuting`
  },
];
