'use client';
import { useState } from 'react';
import { PhoneFrame, BottomNav } from '../ui/PhoneFrame';

interface Member {
  id: string;
  display_name: string;
  season_xp: number;
  rank: number;
  isMe: boolean;
  hasNodFromMe: boolean;
}

interface CrewProps {
  crewName: string;
  members: Member[];
  myRank: number;
  nodsUsedToday?: number;
}

const RANK_COLORS: Record<number, string> = { 1: '#FFC53C', 2: '#8A939C', 3: '#C6F135' };

export function Crew({ crewName, members, myRank, nodsUsedToday = 0 }: CrewProps) {
  const [nodded, setNodded] = useState<Set<string>>(new Set(members.filter(m => m.hasNodFromMe).map(m => m.id)));
  const [nodsLeft, setNodsLeft] = useState(5 - nodsUsedToday);
  const maxXp = Math.max(...members.map(m => m.season_xp), 1);
  const myData = members.find(m => m.isMe);

  const sendNod = async (toId: string) => {
    if (nodded.has(toId) || nodsLeft <= 0) return;
    const res = await fetch('/api/crews/nod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toUserId: toId }),
    });
    const data = await res.json();
    if (data.success) {
      setNodded(prev => new Set([...prev, toId]));
      setNodsLeft(n => n - 1);
    }
  };

  // Pick someone to suggest nodding
  const nodSuggestion = members.find(m => !m.isMe && !nodded.has(m.id));

  return (
    <PhoneFrame>
      <div style={{ padding: '6px 22px 96px', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.2em', color: '#8A939C' }}>SEASON 3 CREW</div>
            <div className="font-oswald" style={{ fontSize: 20, letterSpacing: '.02em', marginTop: 2 }}>{crewName}</div>
          </div>
          <div style={{ background: '#14181D', border: '1px solid #23282F', borderRadius: 11, padding: '6px 11px' }}>
            <span className="font-oswald" style={{ fontSize: 13, color: '#C3CBD2' }}>{members.length} / 8</span>
          </div>
        </div>

        {/* Your rank card */}
        <div style={{ marginTop: 14, background: 'linear-gradient(135deg,#151b10,#101418)', border: '1px solid #2c3a14', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#C6F135' }}>YOUR RANK</div>
            <div style={{ fontSize: 12, color: '#8A939C', marginTop: 6 }}>of {members.length} · {myData?.season_xp.toLocaleString() ?? 0} season XP</div>
          </div>
          <div className="font-oswald" style={{ fontWeight: 600, fontSize: 60, lineHeight: .8, color: '#C6F135' }}>#{myRank}</div>
        </div>

        {/* Leaderboard */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {members.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', borderRadius: 11,
              background: m.isMe ? 'rgba(198,241,53,.07)' : 'transparent',
              border: m.isMe ? '1px solid #3A4A10' : '1px solid transparent',
            }}>
              <span className="font-oswald" style={{ width: 16, fontSize: 15, color: RANK_COLORS[m.rank] ?? '#8A939C', textAlign: 'center' }}>{m.rank}</span>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.isMe ? '#C6F135' : '#23282F', color: m.isMe ? '#0B0D10' : '#F2F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Oswald',sans-serif", fontSize: 13, flexShrink: 0 }}>
                {m.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {m.display_name}
                  {m.isMe && <span className="font-oswald" style={{ color: '#C6F135', fontSize: 10, letterSpacing: '.1em', marginLeft: 6 }}>YOU</span>}
                </div>
                <div style={{ height: 5, background: m.isMe ? '#0B0D10' : '#14181D', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
                  <div className="anim-grow" style={{ height: '100%', width: `${Math.round((m.season_xp / maxXp) * 100)}%`, background: '#C6F135', borderRadius: 3 }} />
                </div>
              </div>
              <span className="font-oswald" style={{ fontSize: 14, color: m.isMe ? '#F2F5F7' : '#C3CBD2', width: 44, textAlign: 'right' }}>
                {m.season_xp.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Nod suggestion */}
        {nodSuggestion && (
          <div style={{ marginTop: 14, background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ph ph-hand-waving" style={{ color: '#3CC5FF', fontSize: 24, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 12, color: '#C3CBD2', lineHeight: 1.4 }}>
              {nodSuggestion.display_name} logged 3 strong sessions last week. <span style={{ color: '#F2F5F7' }}>Send a nod?</span>
            </div>
            <button onClick={() => sendNod(nodSuggestion.id)} disabled={nodsLeft <= 0} style={{ background: 'transparent', border: '1px solid #23282F', color: '#C6F135', borderRadius: 10, padding: '8px 12px', fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: '.06em', opacity: nodsLeft <= 0 ? 0.5 : 1 }}>
              {nodded.has(nodSuggestion.id) ? '✓ NODDED' : 'NOD'}
            </button>
          </div>
        )}
      </div>
      <BottomNav active="crew" />
    </PhoneFrame>
  );
}
