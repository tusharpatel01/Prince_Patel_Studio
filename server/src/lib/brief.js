export const LABELS = {
  '2d-floor-plan': '2D Floor Plan', '3d-front-elevation': '3D Front Elevation', '3d-interior-visualization': '3D Interior Visualization',
  'residential-design': 'Residential Building Design', 'commercial-design': 'Commercial Building Design', 'design-consultation': 'Design Consultation', other: 'Other',
};

// Plain-language summary of a validated inquiry. Contact details are left out on purpose.
export const makeBrief = (d) => {
  const plot = d.plotWidth && d.plotLength ? `${d.plotWidth} x ${d.plotLength} ${d.unit}` : null;
  const building = [d.floors && `${d.floors} floor${d.floors > 1 ? 's' : ''}`, d.bedrooms != null && `${d.bedrooms} bedrooms`, d.bathrooms != null && `${d.bathrooms} bathrooms`].filter(Boolean).join(', ');
  return [
    `Property: ${[d.propertyType, d.location && `in ${d.location}`].filter(Boolean).join(' ') || 'not specified'}`,
    plot && `Plot: ${plot}${d.roadFacing ? `, road-facing ${d.roadFacing}` : ''}`,
    building && `Building: ${building}`,
    d.style && `Style: ${d.style}`,
    d.services.length && `Services: ${d.services.map((s) => LABELS[s] || s).join(', ')}`,
    d.requirements && `Requirements: ${d.requirements}`,
    d.budget && `Budget: ${d.budget}`,
    d.timeline && `Timeline: ${d.timeline}`,
    d.message && `Notes: ${d.message}`,
  ].filter(Boolean).join('\n');
};
