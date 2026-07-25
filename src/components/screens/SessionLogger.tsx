'use client';
import { useState, useCallback } from 'react';
import { PhoneFrame } from '../ui/PhoneFrame';

interface Set {
  index: number;
  weight: number;
  reps: number;
  done: boolean;
}

interface SessionLoggerProps {
  exerciseName?: string;
  onFinish?: (sessionId: string) => void;
}

export function SessionLogger({ exerciseName = 'Back Squat', onFinish }: SessionLoggerProps) {
  const [currentWeight, setCurrentWeight] = useState('185');
  const [currentReps, setCurrentReps] = useState(5);
  const [sets, setSets] = useState<Set[]>([
    { index: 0, weight: 185, reps: 5, done: true },
    { index: 1, weight: 185, reps: 5, done: true },
  ]);
  const [currentSetIdx, setCurrentSetIdx] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleKey = useCallback((k: string) => {
    setCurrentWeight(prev => {
      if (k === '⌫') return prev.length > 1 ? prev.slice(0, -1) : '0';
      if (k === '.') return prev.includes('.') ? prev : prev + '.';
      if (prev === '0') return k;
      return prev + k;
    });
  }, []);

  const addSet = () => {
    const w = parseFloat(currentWeight) || 0;
    setSets(prev => [...prev, { index: currentSetIdx, weight: w, reps: currentReps, done: true }]);
    setCurrentSetIdx(i => i + 1);
  };

  const finish = async () => {
    setLoading(true);
    try {
      // Create session
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modality: 'strength', title: 'Back & Legs' }),
      });
      const { id } = await res.json();
      // Finish session
      const finRes = await fetch(`/api/sessions/${id}/finish`, { method: 'POST' });
      const envelope = await finRes.json();
      onFinish?.(id);
    } finally {
      setLoading(false);
    }
  };

  const displaySets = [...sets, { index: currentSetIdx, weight: parseFloat(currentWeight) || 0, reps: currentReps, done: false }];

  return (
    <PhoneFrame>
      <div style={{ padding: '6px 22px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 22, color: '#C3CBD2' }} />
          <span className="font-oswald" style={{ letterSpacing: '.2em', fontSize: 13 }}>LOG SESSION</span>
          <i className="ph ph-x" style={{ fontSize: 22, color: '#C3CBD2' }} />
        </div>

        {/* Exercise selector */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '11px 16px' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.16em', color: '#8A939C' }}>EXERCISE · {currentSetIdx + 1} OF {displaySets.length} SETS</div>
            <div className="font-oswald" style={{ fontSize: 22, letterSpacing: '.02em' }}>{exerciseName}</div>
          </div>
          <i className="ph ph-caret-down" style={{ color: '#C6F135', fontSize: 20 }} />
        </div>

        {/* Set history */}
        <div style={{ marginTop: 10, display: 'flex', gap: 7, overflowX: 'auto' }}>
          {displaySets.slice(-5).map((s, i) => {
            const isCurrent = !s.done;
            return (
              <div key={s.index} style={{
                flex: '0 0 auto', minWidth: 60,
                background: isCurrent ? 'rgba(198,241,53,.1)' : '#14181D',
                border: `1px solid ${isCurrent ? '#C6F135' : '#23282F'}`,
                borderRadius: 10, padding: '7px 0', textAlign: 'center',
              }}>
                <div style={{ fontSize: 9, color: isCurrent ? '#C6F135' : '#8A939C' }}>SET {s.index + 1}</div>
                <div className="font-oswald" style={{ fontSize: 15, color: isCurrent ? '#C6F135' : '#C3CBD2' }}>
                  {isCurrent ? 'now' : `${s.weight}×${s.reps}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weight display */}
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.2em', color: '#8A939C' }}>WEIGHT · LB</div>
          <div className="font-oswald" style={{ fontWeight: 600, fontSize: 92, lineHeight: .86, color: '#C6F135' }}>{currentWeight}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, marginTop: 8 }}>
            <button onClick={() => setCurrentReps(r => Math.max(1, r - 1))} style={{ width: 38, height: 38, borderRadius: 11, background: '#14181D', border: '1px solid #23282F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-minus" style={{ fontSize: 18 }} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div className="font-oswald" style={{ fontSize: 26, lineHeight: 1 }}>{currentReps}</div>
              <div style={{ fontSize: 9, letterSpacing: '.14em', color: '#8A939C' }}>REPS</div>
            </div>
            <button onClick={() => setCurrentReps(r => r + 1)} style={{ width: 38, height: 38, borderRadius: 11, background: '#14181D', border: '1px solid #23282F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph ph-plus" style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Keypad */}
        <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
          {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k => (
            <button key={k} onClick={() => handleKey(k)}
              style={{ background: k === '.' || k === '⌫' ? '#0F1216' : '#14181D', border: k === '.' || k === '⌫' ? 'none' : '1px solid #23282F', borderRadius: 12, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Oswald',sans-serif", fontSize: k === '⌫' ? undefined : 25, color: k === '.' || k === '⌫' ? '#8A939C' : '#F2F5F7' }}>
              {k === '⌫' ? <i className="ph ph-backspace" style={{ fontSize: 22 }} /> : k}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 9, display: 'flex', gap: 8 }}>
          <button onClick={addSet} style={{ flex: 1, background: 'transparent', border: '1px solid #3A4A10', color: '#C6F135', borderRadius: 14, height: 52, fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: '.06em' }}>
            + ADD SET
          </button>
          <button onClick={finish} disabled={loading} style={{ flex: 1.5, background: '#C6F135', color: '#0B0D10', borderRadius: 14, height: 52, fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: '.06em', opacity: loading ? .7 : 1 }}>
            {loading ? 'SAVING...' : 'FINISH SESSION'}
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
