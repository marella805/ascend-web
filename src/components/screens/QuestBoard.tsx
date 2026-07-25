'use client';
import { useState } from 'react';
import { PhoneFrame, BottomNav } from '../ui/PhoneFrame';
import { ProgressRing } from '../ui/ProgressRing';

interface Quest {
  id: string;
  name: string;
  current_value: number;
  target_value: number;
  state: string;
  xp_reward: number;
  kind: string;
}

interface QuestBoardProps {
  weekly: Quest[];
  seasonal: Quest[];
}

const QUEST_COLORS = ['#3CC5FF', '#B57BFF', '#FF5A3C', '#FFC53C'];

export function QuestBoard({ weekly, seasonal }: QuestBoardProps) {
  const [tab, setTab] = useState<'weekly' | 'seasonal'>('weekly');
  const quests = tab === 'weekly' ? weekly : seasonal;

  const seasonGoal = seasonal[0];
  const seasonPct = seasonGoal ? Math.round((seasonGoal.current_value / seasonGoal.target_value) * 100) : 0;

  return (
    <PhoneFrame>
      <div style={{ padding: '6px 22px 96px', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
          <span className="font-oswald" style={{ letterSpacing: '.14em', fontSize: 20 }}>QUEST BOARD</span>
          <span style={{ fontSize: 11, color: '#8A939C' }}>Season 3 · Wk 5</span>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: 14, display: 'flex', background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: 4 }}>
          {(['weekly', 'seasonal'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, textAlign: 'center',
              background: tab === t ? '#C6F135' : 'transparent',
              color: tab === t ? '#0B0D10' : '#8A939C',
              borderRadius: 9, padding: '9px 0',
              fontFamily: "'Oswald',sans-serif", letterSpacing: '.1em', fontSize: 13,
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Quests */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {quests.map((q, i) => {
            const pct = Math.round((q.current_value / q.target_value) * 100);
            const done = q.state === 'complete';
            return (
              <div key={q.id} style={{ background: '#14181D', border: `1px solid ${done ? '#3A4A10' : '#23282F'}`, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <ProgressRing value={pct} color={done ? '#C6F135' : QUEST_COLORS[i % 4]} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{q.name}</div>
                  <div style={{ fontSize: 11, color: '#8A939C', marginTop: 2 }}>
                    {done ? 'Complete!' : `${q.current_value} of ${q.target_value}`} · +{q.xp_reward} XP
                    {q.kind === 'season_goal' && ' · rank promotion'}
                  </div>
                </div>
                <span className="font-oswald" style={{ fontSize: 18, color: done ? '#C6F135' : '#C3CBD2' }}>{pct}%</span>
              </div>
            );
          })}
        </div>

        {/* Season goal pin (always shown on weekly tab) */}
        {tab === 'weekly' && seasonGoal && (
          <div style={{ marginTop: 16, background: 'linear-gradient(160deg,#151b10,#101418)', border: '1px solid #2c3a14', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg viewBox="0 0 108 108" style={{ width: 104, height: 104, flexShrink: 0 }}>
              <circle cx="54" cy="54" r="46" fill="none" stroke="#23282F" strokeWidth="7" />
              <circle cx="54" cy="54" r="46" fill="none" stroke="#C6F135" strokeWidth="7" strokeLinecap="round"
                strokeDasharray="289" strokeDashoffset={289 * (1 - seasonPct / 100)}
                transform="rotate(-90 54 54)" className="anim-ring" />
              <text x="54" y="52" fill="#F2F5F7" fontFamily="Oswald" fontWeight="600" fontSize="30" textAnchor="middle">{seasonPct}%</text>
              <text x="54" y="70" fill="#8A939C" fontFamily="Oswald" fontSize="9" letterSpacing="1.5" textAnchor="middle">COMPLETE</text>
            </svg>
            <div>
              <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#C6F135' }}>SEASON GOAL</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3 }}>{seasonGoal.name}</div>
              <div style={{ fontSize: 11, color: '#8A939C', marginTop: 4, lineHeight: 1.5 }}>
                Reward · +{seasonGoal.xp_reward.toLocaleString()} XP<br />and a rank promotion
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav active="quests" />
    </PhoneFrame>
  );
}
