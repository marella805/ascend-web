'use client';
import { useEffect, useState } from 'react';
import { PhoneFrame } from '../ui/PhoneFrame';

interface RewardEnvelope {
  session: { title: string; durationS: number; volumeKg: number; setCount: number };
  xp: { earned: number; level: number; levelXp: number; levelXpRequired: number };
  baseline: { percentVsBaseline: number; isForming: boolean };
  attributes: { key: string; before: number; after: number; delta: number }[];
  badges: { name: string; crew_rarity_pct?: number }[];
  quests: { name: string; current: number; target: number; completed: boolean; xpReward: number }[];
  streak: { length: number; restTokens: number };
}

export function PostSessionReward({ envelope }: { envelope: RewardEnvelope }) {
  const [p, setP] = useState(0);

  useEffect(() => {
    const t0 = Date.now(), d = 1200;
    const timer = setInterval(() => {
      const x = Math.min(1, (Date.now() - t0) / d);
      setP(1 - Math.pow(1 - x, 3));
      if (x >= 1) clearInterval(timer);
    }, 32);
    return () => clearInterval(timer);
  }, []);

  const cs = (a: number, b: number) => Math.round(a + (b - a) * p);
  const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
  const durationMin = Math.round(envelope.session.durationS / 60);
  const volumeKgDisplay = (envelope.session.volumeKg * p).toFixed(0);
  const xpDisplay = cs(0, envelope.xp.earned);
  const xpBarWidth = ((envelope.xp.levelXp + envelope.xp.earned * p) / envelope.xp.levelXpRequired * 100).toFixed(1) + '%';

  const attrColors: Record<string, string> = { str: '#FF5A3C', end: '#3CC5FF', mob: '#B57BFF', con: '#FFC53C' };
  const attrLabels: Record<string, string> = { str: 'STR', end: 'END', mob: 'MOB', con: 'CON' };

  const newBadge = envelope.badges?.[0];

  return (
    <PhoneFrame>
      <div style={{ padding: '8px 22px 20px', height: '100%', display: 'flex', flexDirection: 'column', background: 'radial-gradient(120% 60% at 50% 0%,#1a2410,#0B0D10 55%)' }}>
        {/* Header */}
        <div className="anim-rise" style={{ textAlign: 'center', marginTop: 6 }}>
          <div className="font-oswald" style={{ letterSpacing: '.26em', fontSize: 12, color: '#C6F135' }}>SESSION COMPLETE</div>
          <div style={{ fontSize: 12, color: '#8A939C', marginTop: 3 }}>
            {envelope.session.title} · {durationMin} min · {fmt(parseFloat(volumeKgDisplay) * 2.205)} lb volume
          </div>
        </div>

        {/* XP */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <div className="font-oswald" style={{ fontWeight: 600, fontSize: 88, lineHeight: 1, color: '#C6F135', textShadow: '0 0 40px rgba(198,241,53,.35)' }}>
            +{fmt(xpDisplay)}
          </div>
          <div className="font-oswald" style={{ letterSpacing: '.24em', fontSize: 12, color: '#8A939C', marginTop: 2 }}>XP EARNED</div>
        </div>

        {/* Level bar */}
        <div style={{ marginTop: 14, background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '13px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span className="font-oswald" style={{ letterSpacing: '.1em', color: '#8A939C' }}>LEVEL {envelope.xp.level}</span>
            <span className="font-oswald" style={{ color: '#C6F135' }}>{fmt(envelope.xp.levelXp + envelope.xp.earned * p)} / {fmt(envelope.xp.levelXpRequired)}</span>
          </div>
          <div style={{ marginTop: 8, height: 8, background: '#0B0D10', border: '1px solid #23282F', borderRadius: 6, overflow: 'hidden' }}>
            <div className="anim-grow" style={{ height: '100%', background: '#C6F135', borderRadius: 6, width: xpBarWidth }} />
          </div>
          {!envelope.baseline.isForming && (
            <div style={{ marginTop: 9, fontSize: 11, color: '#C3CBD2', lineHeight: 1.4 }}>
              vs your 4-week baseline <span className="font-oswald" style={{ color: '#C6F135', fontSize: 13 }}>
                {envelope.baseline.percentVsBaseline >= 0 ? '+' : ''}{envelope.baseline.percentVsBaseline}%
              </span> — your biggest push this season
            </div>
          )}
        </div>

        {/* Attribute deltas */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {envelope.attributes.map(attr => {
            const color = attrColors[attr.key];
            const pct = Math.round(((attr.before / 100) + (attr.delta / 100) * p) * 74);
            return (
              <div key={attr.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                <span className="font-oswald" style={{ width: 34, fontSize: 12, letterSpacing: '.08em', color: '#8A939C' }}>{attrLabels[attr.key]}</span>
                <div style={{ flex: 1, height: 6, background: '#14181D', borderRadius: 4, overflow: 'hidden' }}>
                  <div className="anim-grow" style={{ height: '100%', width: pct + '%', background: color, borderRadius: 4 }} />
                </div>
                <span className="font-oswald" style={{ width: 32, textAlign: 'right', fontSize: 17, color: attr.delta > 0 ? '#F2F5F7' : '#8A939C' }}>
                  {attr.delta > 0 ? `+${cs(0, attr.delta)}` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Badge unlock */}
        {newBadge && (
          <div className="anim-flip" style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg,#1c2410,#12161B)', border: '1px solid #3A4A10', borderRadius: 16, padding: '13px 15px' }}>
            <div style={{ width: 50, height: 50, borderRadius: 13, background: '#C6F135', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="ph-fill ph-medal" style={{ fontSize: 28, color: '#0B0D10' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#C6F135' }}>BADGE UNLOCKED</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{newBadge.name}</div>
              {newBadge.crew_rarity_pct != null && (
                <div style={{ fontSize: 11, color: '#8A939C', marginTop: 1 }}>Only {newBadge.crew_rarity_pct}% of your crew hold this</div>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        <button style={{ marginTop: 'auto', width: '100%', background: '#C6F135', color: '#0B0D10', borderRadius: 15, height: 56, fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: '.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="ph-bold ph-cards" style={{ fontSize: 20 }} />
          COLLECT SESSION CARD
        </button>
      </div>
    </PhoneFrame>
  );
}

export function PostSessionRewardDemo() {
  const demo: RewardEnvelope = {
    session: { title: 'Back & Legs', durationS: 2820, volumeKg: 5624 / 2.205, setCount: 18 },
    xp: { earned: 640, level: 12, levelXp: 1240, levelXpRequired: 2140 },
    baseline: { percentVsBaseline: 18, isForming: false },
    attributes: [
      { key: 'str', before: 40, after: 42, delta: 2 },
      { key: 'end', before: 38, after: 38, delta: 0 },
      { key: 'mob', before: 27, after: 27, delta: 0 },
      { key: 'con', before: 54, after: 55, delta: 1 },
    ],
    badges: [{ name: 'Bodyweight Squat ×5', crew_rarity_pct: 6 }],
    quests: [{ name: 'Vertical Pull Volume', current: 2, target: 3, completed: false, xpReward: 120 }],
    streak: { length: 11, restTokens: 2 },
  };
  return <PostSessionReward envelope={demo} />;
}
