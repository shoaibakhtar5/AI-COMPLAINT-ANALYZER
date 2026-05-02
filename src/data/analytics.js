export const threatDensity = [
  [88, 42, 73, 24, 91, 67, 48],
  [64, 33, 29, 77, 85, 51, 40],
  [92, 54, 37, 69, 58, 96, 72],
  [48, 27, 82, 44, 65, 31, 90],
  [75, 88, 59, 36, 72, 43, 66],
];

export const neuralPrediction = [
  { name: '00:00', value: 42 },
  { name: '04:00', value: 61 },
  { name: '08:00', value: 38 },
  { name: '12:00', value: 84 },
  { name: '16:00', value: 51 },
  { name: '20:00', value: 92 },
  { name: '24:00', value: 68 },
];

export const systemLoad = [
  { name: 'NLP', value: 44 },
  { name: 'Routing', value: 26 },
  { name: 'Risk', value: 18 },
  { name: 'Archive', value: 12 },
];

export const allocation = [
  { name: 'Critical', value: 41 },
  { name: 'Active', value: 33 },
  { name: 'Queued', value: 18 },
  { name: 'Resolved', value: 8 },
];

export const topVectors = [
  { source: 'Billing breach', region: 'North America', severity: 'Critical', volume: 124 },
  { source: 'Refund dispute', region: 'EMEA', severity: 'High', volume: 98 },
  { source: 'Portal outage', region: 'APAC', severity: 'Medium', volume: 74 },
  { source: 'Data access', region: 'LATAM', severity: 'High', volume: 63 },
];
