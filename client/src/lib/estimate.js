const SQFT_PER_SQM = 10.7639;
const convert = (a, from, to) => (from === to ? a : from === 'sqm' ? a * SQFT_PER_SQM : a / SQFT_PER_SQM);

// base = built-up area x rate. Allowances already included in the rate are listed but never added again.
export function estimate({ area, areaUnit, tier, config, city, customRate, selected = [] }) {
  let rate, rateUnit, source;
  if (customRate > 0) { rate = customRate; rateUnit = areaUnit; source = 'your own rate'; }
  else {
    const loc = config.locations.find((l) => l.name.trim().toLowerCase() === (city || '').trim().toLowerCase());
    rate = loc?.rates?.[tier]; rateUnit = config.unit; source = loc ? `configured ${tier} rate for ${loc.name}` : null;
  }
  if (!(rate > 0) || !(area > 0)) return null;
  const base = convert(area, areaUnit, rateUnit) * rate;
  let total = base;
  const items = config.allowances.map((a) => {
    if (a.includedInRate) return { label: a.label, amount: 0, note: 'Included in the rate' };
    if (a.optional && !selected.includes(a.key)) return null;
    const amount = (base * a.percent) / 100;
    total += amount;
    return { label: a.label, amount, note: `${a.percent}% of base cost` };
  }).filter(Boolean);
  const spread = config.rangeSpreadPercent ?? 10;
  return { base, total, low: total * (1 - spread / 100), high: total * (1 + spread / 100), items, rate, rateUnit, source, spread };
}
