// Original line illustrations standing in for real renders. Replace with uploaded images later.
const s = { fill: 'none', stroke: '#252623', strokeWidth: 1.4 };

const sized = (u, w) => (u.includes('/upload/') ? u.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : u);

export default function Art({ kind = 'plan', floors = 1, seed = 0, label = 'Concept', url }) {
  const v = seed % 3;
  if (url) return <img src={sized(url, 1200)} srcSet={`${sized(url, 600)} 600w, ${sized(url, 1200)} 1200w`} sizes="(min-width: 768px) 50vw, 100vw" alt={label} loading="lazy" className="h-full w-full bg-white object-cover" />;
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full bg-white" role="img" aria-label={`${label}: concept illustration`}>
      {kind === 'plan' && (
        <g {...s}>
          <rect x="50" y="35" width="300" height="230" strokeWidth="3" />
          <path d={['M50 150H210M210 35V265M210 150H350', 'M50 120H350M170 120V265M260 120V265', 'M130 35V150M50 150H350M250 150V265'][v]} />
        </g>
      )}
      {kind === 'elevation' && (
        <g {...s}>
          <path d="M20 270H380" strokeWidth="2" />
          {Array.from({ length: floors }).map((_, i) => (
            <g key={i}>
              <rect x={60 + (v === 1 && i ? 30 : 0)} y={230 - i * 85} width={v === 1 && i ? 220 : 280} height="85" />
              <rect x="90" y={250 - i * 85} width="45" height="35" stroke="#777B62" />
              <rect x="220" y={250 - i * 85} width="45" height="35" stroke="#777B62" />
            </g>
          ))}
          <path d={`M60 ${230 - (floors - 1) * 85}H340`} strokeWidth="3" />
          <rect x="168" y="235" width="30" height="35" />
        </g>
      )}
      {kind === 'interior' && (
        <g {...s}>
          <path d="M40 60H360V250H40ZM40 210H360M40 60L80 40H320L360 60" />
          <rect x="110" y="170" width="150" height="50" /><rect x="110" y="150" width="150" height="22" />
          <rect x="290" y="95" width="45" height="115" stroke="#777B62" />
          <circle cx="185" cy="75" r="9" />
        </g>
      )}
      <text x="12" y="290" fontSize="10" fill="#77766F" fontFamily="DM Sans">{label}</text>
    </svg>
  );
}
