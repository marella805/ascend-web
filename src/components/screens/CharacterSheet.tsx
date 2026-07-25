'use client';
import { PhoneFrame, BottomNav } from '../ui/PhoneFrame';
import { RadarChart } from '../ui/RadarChart';
import { ProgressRing } from '../ui/ProgressRing';

interface CharacterSheetData {
  user: { displayName: string };
  level: { level: number; levelXp: number; levelXpRequired: number; xpToNext: number };
  totalXp: number;
  attributes: { str: number; end: number; mob: number; con: number };
  streak: { length: number; restTokens: number };
  todayQuest: { name: string; current: number; target: number; xpReward: number } | null;
  season: { ordinal: number; week: number };
}

export function CharacterSheet({ data, light }: { data: CharacterSheetData; light?: boolean }) {
  const { user, level, attributes, streak, todayQuest, season } = data;
  const bg = light ? '#EEF1F2' : '#0B0D10';
  const surf = light ? '#FFFFFF' : '#14181D';
  const border = light ? '#E2E6E8' : '#23282F';
  const textMuted = light ? '#5C666E' : '#8A939C';
  const text2 = light ? '#2C3338' : '#C3CBD2';
  const accent = light ? '#A9D400' : '#C6F135';
  const accentText = light ? '#4C6B00' : '#C6F135';
  const barBg = light ? '#FFFFFF' : '#14181D';
  const xpPct = ((level.levelXp / level.levelXpRequired) * 100).toFixed(1) + '%';

  return (
    <PhoneFrame light={light}>
      <div style={{ padding: '6px 22px 96px', height: '100%', overflowY: 'auto', background: bg }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: textMuted }}>
              SEASON {season.ordinal} · WEEK {season.week}
            </div>
            <div className="font-oswald" style={{ fontSize: 17, letterSpacing: '.03em', marginTop: 3 }}>{user.displayName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: surf, border: `1px solid ${border}`, borderRadius: 12, padding: '7px 11px' }}>
            <i className="ph-fill ph-fire" style={{ color: '#FFC53C', fontSize: 16 }} />
            <span className="font-oswald" style={{ fontSize: 17 }}>{streak.length}</span>
          </div>
        </div>

        {/* Streak protection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: textMuted, fontSize: 11 }}>
          <i className="ph ph-shield-check" style={{ color: accentText, fontSize: 14 }} />
          {streak.restTokens} rest tokens available · streak protected
        </div>

        {/* Level */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.2em', color: textMuted }}>LEVEL</div>
            <div className="font-oswald" style={{ fontWeight: 600, fontSize: 66, lineHeight: .86, letterSpacing: '-.01em' }}>{level.level}</div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 6 }}>
            <div className="font-oswald" style={{ fontSize: 15, color: accentText }}>{level.levelXp.toLocaleString()} / {level.levelXpRequired.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>{level.xpToNext.toLocaleString()} XP to level {level.level + 1}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, height: 8, borderRadius: 6, background: barBg, border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div className="anim-grow" style={{ height: '100%', width: xpPct, background: accent, borderRadius: 6 }} />
        </div>

        {/* Attributes */}
        <div style={{ marginTop: 16, background: surf, border: `1px solid ${border}`, borderRadius: 18, padding: '12px 12px 4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: textMuted }}>ATTRIBUTES</span>
            <span style={{ fontSize: 10, color: textMuted }}>this season</span>
          </div>
          <RadarChart {...attributes} size={220} light={light} />
        </div>

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[
            { key: 'STR', val: attributes.str, color: '#FF5A3C', lightColor: '#D8452B' },
            { key: 'END', val: attributes.end, color: '#3CC5FF', lightColor: '#1E86C7' },
            { key: 'MOB', val: attributes.mob, color: '#B57BFF', lightColor: '#7C43D6' },
            { key: 'CON', val: attributes.con, color: '#FFC53C', lightColor: '#B8860B' },
          ].map(({ key, val, color, lightColor }) => (
            <div key={key} style={{ background: surf, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: light ? lightColor : color, margin: '0 auto 6px' }} />
              <div className="font-oswald" style={{ fontSize: 24, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: '.14em', color: textMuted, marginTop: 3 }}>{key}</div>
            </div>
          ))}
        </div>

        {/* Today's quest */}
        {todayQuest && (
          <div style={{ marginTop: 12, background: light ? '#FFFFFF' : 'linear-gradient(180deg,#171C22,#12161B)', border: `1px solid ${border}`, borderRadius: 16, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <ProgressRing
              value={(todayQuest.current / todayQuest.target) * 100}
              color={light ? '#5B7A00' : '#C6F135'}
              size={44}
            />
            <div style={{ flex: 1 }}>
              <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: accentText }}>TODAY'S QUEST</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{todayQuest.name}</div>
              <div style={{ fontSize: 11, color: textMuted, marginTop: 1 }}>
                {todayQuest.current} of {todayQuest.target} done · +{todayQuest.xpReward} XP
              </div>
            </div>
            <i className="ph ph-caret-right" style={{ color: textMuted, fontSize: 18 }} />
          </div>
        )}
      </div>
      <BottomNav active="sheet" light={light} />
    </PhoneFrame>
  );
}
