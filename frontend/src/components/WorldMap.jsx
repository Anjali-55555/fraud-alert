import React, { useMemo } from 'react';

// Coordinates scaled to a 900x450 SVG bounding box
const countryCoords = {
  'US': { x: 200, y: 150, name: 'United States' },
  'CA': { x: 190, y: 115, name: 'Canada' },
  'GB': { x: 430, y: 110, name: 'United Kingdom' },
  'DE': { x: 460, y: 120, name: 'Germany' },
  'FR': { x: 445, y: 135, name: 'France' },
  'JP': { x: 800, y: 170, name: 'Japan' },
  'BR': { x: 340, y: 320, name: 'Brazil' },
  'RU': { x: 580, y: 90,  name: 'Russia' },
  'ZA': { x: 490, y: 340, name: 'South Africa' },
  'UA': { x: 515, y: 110, name: 'Ukraine' }
};

const WorldMap = ({ data = [] }) => {
  // Map incoming database counts to coords
  const hotspots = useMemo(() => {
    return data.map(item => {
      const coord = countryCoords[item.country];
      if (!coord) return null;
      return {
        ...coord,
        code: item.country,
        total: item.totalTransactions,
        fraud: item.fraudCount
      };
    }).filter(Boolean);
  }, [data]);

  return (
    <div className="w-full glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">Geographic Threat Map</h3>
          <p className="text-xs text-slate-400">Live global risk hotspots by origin country</p>
        </div>
        <div className="flex gap-4 text-[10px] uppercase font-semibold tracking-wider">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span> High Threat</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Normal Traffic</span>
        </div>
      </div>

      <div className="relative aspect-[2/1] bg-slate-950/40 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
        {/* Vector Background representing abstract grid world map */}
        <svg viewBox="0 0 900 450" className="w-full h-full text-slate-800">
          {/* Decorative lines for grids */}
          <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.5">
            <line x1="0" y1="75" x2="900" y2="75" />
            <line x1="0" y1="150" x2="900" y2="150" />
            <line x1="0" y1="225" x2="900" y2="225" />
            <line x1="0" y1="300" x2="900" y2="300" />
            <line x1="0" y1="375" x2="900" y2="375" />
            
            <line x1="150" y1="0" x2="150" y2="450" />
            <line x1="300" y1="0" x2="300" y2="450" />
            <line x1="450" y1="0" x2="450" y2="450" />
            <line x1="600" y1="0" x2="600" y2="450" />
            <line x1="750" y1="0" x2="750" y2="450" />
          </g>

          {/* Abstract background continents */}
          <path 
            d="M 120 70 Q 240 60 280 140 T 360 220 T 260 280 T 150 200 Z" 
            fill="rgba(79, 70, 229, 0.03)" 
            stroke="rgba(79, 70, 229, 0.05)" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path 
            d="M 400 90 Q 520 60 620 60 T 800 120 T 850 200 T 700 300 T 550 250 Z" 
            fill="rgba(79, 70, 229, 0.03)" 
            stroke="rgba(79, 70, 229, 0.05)" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path 
            d="M 280 280 Q 320 380 340 420 T 380 350 Z" 
            fill="rgba(79, 70, 229, 0.03)" 
            stroke="rgba(79, 70, 229, 0.05)" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path 
            d="M 440 280 Q 480 360 520 400 T 500 320 Z" 
            fill="rgba(79, 70, 229, 0.03)" 
            stroke="rgba(79, 70, 229, 0.05)" 
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Connections / Flight lines */}
          <g stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" fill="none">
            {hotspots.map((h, i) => (
              <path key={i} d={`M 200 150 Q ${(200 + h.x)/2} ${(150 + h.y)/2 - 50} ${h.x} ${h.y}`} strokeDasharray="3 3" />
            ))}
          </g>

          {/* Render base nodes */}
          {Object.entries(countryCoords).map(([code, c]) => (
            <circle key={code} cx={c.x} cy={c.y} r="4" fill="#312E81" />
          ))}

          {/* Render active threats / hotspots */}
          {hotspots.map((h) => {
            const isHighRisk = h.fraud > 0;
            const markerColor = isHighRisk ? '#EF4444' : '#6366F1';
            
            return (
              <g key={h.code} className="cursor-pointer group">
                {/* Outer Ring */}
                {isHighRisk && (
                  <circle
                    cx={h.x}
                    cy={h.y}
                    r={10 + h.fraud * 2.5}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="1.5"
                    className="animate-ping"
                    style={{ transformOrigin: `${h.x}px ${h.y}px` }}
                  />
                )}
                
                {/* Core Circle */}
                <circle
                  cx={h.x}
                  cy={h.y}
                  r={5 + h.fraud * 1.2}
                  fill={markerColor}
                  className="transition-all hover:scale-125 duration-200"
                  style={{ transformOrigin: `${h.x}px ${h.y}px` }}
                />

                {/* Tooltip Overlay */}
                <title>
                  {h.name} (${h.code})\n
                  Transactions: ${h.total}\n
                  Flagged Suspicious: ${h.fraud}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default WorldMap;
