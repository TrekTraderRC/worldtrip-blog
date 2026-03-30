import React from 'react';

function polarToCartesian(index, total, radius) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

export default function CollectionWheel({
  title,
  subtitle,
  items,
  centerTop,
  centerBottom,
  mode = 'constellation',
}) {
  const total = items.length;
  const radius = 188;

  return (
    <section className="wheel-panel">
      <div className="wheel-panel-head">
        <div className="wheel-kicker">{subtitle}</div>
        <h2 className="wheel-title">{title}</h2>
      </div>

      <div className={`wheel-shell ${mode}`}>
        <div className="wheel-glow wheel-glow-a" />
        <div className="wheel-glow wheel-glow-b" />

        <div className="wheel-ring wheel-ring-outer" />
        <div className="wheel-ring wheel-ring-mid" />
        <div className="wheel-ring wheel-ring-inner" />

        {items.map((item, index) => {
          const pos = polarToCartesian(index, total, radius);
          const unlocked = item.count > 0;

          return (
            <div
              key={item.key}
              className={`wheel-node ${unlocked ? 'unlocked' : 'locked'}`}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
              }}
            >
              <div className="wheel-flame-wrap">
                <div className={`wheel-flame ${unlocked ? 'on' : 'off'}`} />
              </div>

              <div className="wheel-node-card">
                <div className="wheel-node-symbol">
                  {mode === 'zodiac' ? item.emoji : item.symbol}
                </div>
                <div className="wheel-node-name">{item.name}</div>
                <div className={`wheel-node-count ${unlocked ? 'on' : 'off'}`}>
                  {String(item.count).padStart(2, '0')}
                </div>
              </div>
            </div>
          );
        })}

        <div className="wheel-center">
          <div className="wheel-center-label">{centerTop}</div>
          <div className="wheel-center-value">{centerBottom}</div>
        </div>
      </div>
    </section>
  );
}