import { CharacterSheet } from '@/components/screens/CharacterSheet';
import { SessionLogger } from '@/components/screens/SessionLogger';
import { PostSessionRewardDemo } from '@/components/screens/PostSessionReward';
import { QuestBoard } from '@/components/screens/QuestBoard';
import { Crew } from '@/components/screens/Crew';
import { History } from '@/components/screens/History';
import { ensureDb } from '@/lib/db/index';
import { getCharacterSheet, getQuests, getHistory, getCrewLeaderboard } from '@/lib/db/queries';

export default async function Home() {
  await ensureDb();
  const [charSheet, quests, history, crew] = await Promise.all([
    getCharacterSheet(),
    getQuests(),
    getHistory(),
    getCrewLeaderboard(),
  ]);

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(1400px 900px at 50% -8%,#111519,#060708 62%)', padding: '60px 72px 120px', fontFamily: "'Inter',sans-serif", color: '#F2F5F7' }}>

      {/* ============ MASTHEAD ============ */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, maxWidth: 1600 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#C6F135', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ph-bold ph-mountains" style={{ fontSize: 26, color: '#0B0D10' }} />
            </div>
            <div className="font-oswald" style={{ fontWeight: 600, fontSize: 52, letterSpacing: '.14em', lineHeight: .9 }}>ASCEND</div>
          </div>
          <div style={{ marginTop: 12, color: '#AEB7BF', fontSize: 15, maxWidth: 560, lineHeight: 1.5 }}>
            Training progress rendered as a living character sheet. Log a session, watch the attribute climb, hold the streak, close the season with a rank.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {([['#FF5A3C','STRENGTH'],['#3CC5FF','ENDURANCE'],['#B57BFF','MOBILITY'],['#FFC53C','CONSISTENCY']] as const).map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
              <span className="font-oswald" style={{ letterSpacing: '.14em', fontSize: 13, color: '#C3CBD2' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ SECTION A · CORE SCREENS ============ */}
      <SectionHeader letter="A" title="Core Screens" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 60 }}>
        <ScreenWrapper num="01" title="Character Sheet" sub="Home">
          {charSheet ? <CharacterSheet data={charSheet} /> : <PlaceholderPhone />}
        </ScreenWrapper>
        <ScreenWrapper num="02" title="Session Logger" sub="Fast entry">
          <SessionLogger />
        </ScreenWrapper>
        <ScreenWrapper num="03" title="Post-Session Reward" sub="The payoff">
          <PostSessionRewardDemo />
        </ScreenWrapper>
        <ScreenWrapper num="04" title="Quest Board" sub="Objectives">
          {quests ? <QuestBoard weekly={quests.weekly} seasonal={quests.seasonal} /> : <PlaceholderPhone />}
        </ScreenWrapper>
        <ScreenWrapper num="05" title="Crew" sub="Leaderboard">
          {crew ? <Crew crewName={crew.crewName} members={crew.members} myRank={crew.myRank} nodsUsedToday={crew.nodsUsedToday} /> : <PlaceholderPhone />}
        </ScreenWrapper>
        <ScreenWrapper num="06" title="History" sub="Heatmap + PRs">
          <History heatmap={history.heatmap} totalSessions={history.totalSessions} personalRecordCount={history.personalRecordCount} personalRecords={history.personalRecords} />
        </ScreenWrapper>
      </div>

      {/* ============ SECTION B · STATES ============ */}
      <SectionHeader letter="B" title="Character Sheet · States" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 60 }}>
        <ScreenWrapper num="07" title="First Run" sub="No baseline yet">
          <FirstRunState />
        </ScreenWrapper>
        <ScreenWrapper num="08" title="Empty / Rest Day" sub="Recovery">
          <EmptyState />
        </ScreenWrapper>
        <ScreenWrapper num="09" title="Character Sheet" sub="Light mode">
          {charSheet ? <CharacterSheet data={charSheet} light /> : <PlaceholderPhone />}
        </ScreenWrapper>
      </div>

      {/* ============ SECTION C · COMPONENTS ============ */}
      <SectionHeader letter="C" title="Component Sheet" />
      <ComponentSheet />

      <div style={{ marginTop: 60, color: '#5C666E', fontSize: 12, maxWidth: 1000, lineHeight: 1.6 }}>
        No dark patterns · XP earned relative to your own baseline · streaks include rest tokens · badges are rare and specific · WCAG AA contrast on text and progress indicators · primary actions thumb-reachable for one-handed use.
      </div>
    </main>
  );
}

function SectionHeader({ letter, title }: { letter: string; title: string }) {
  return (
    <div style={{ margin: '64px 0 30px', display: 'flex', alignItems: 'center', gap: 16, maxWidth: 1600 }}>
      <span className="font-oswald" style={{ fontSize: 13, letterSpacing: '.28em', color: '#C6F135' }}>{letter}</span>
      <span className="font-oswald" style={{ fontSize: 24, letterSpacing: '.06em', textTransform: 'uppercase' }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#23282F,transparent)' }} />
    </div>
  );
}

function ScreenWrapper({ num, title, sub, children }: { num: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 390 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="font-oswald" style={{ fontSize: 12, letterSpacing: '.18em', color: '#C6F135' }}>{num}</span>
        <span className="font-oswald" style={{ fontSize: 18, letterSpacing: '.04em', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#8A939C' }}>{sub}</span>
      </div>
      {children}
    </div>
  );
}

function PlaceholderPhone() {
  return (
    <div style={{ width: 390, height: 844, background: '#0B0D10', borderRadius: 46, border: '9px solid #1B2026', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#23282F', fontFamily: "'Oswald',sans-serif", fontSize: 14, letterSpacing: '.1em' }}>
      LOADING
    </div>
  );
}

function FirstRunState() {
  return (
    <div style={{ width: 390, height: 844, background: 'radial-gradient(120% 55% at 50% 0%,#161c11,#0B0D10 55%)', borderRadius: 46, border: '9px solid #1B2026', boxShadow: '0 30px 70px rgba(0,0,0,.6)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 118, height: 26, background: '#000', borderRadius: 16, zIndex: 20 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px 0', fontSize: 13, zIndex: 15 }}>
        <span className="font-oswald" style={{ fontWeight: 500 }}>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
          <i className="ph-fill ph-cell-signal-full" /><i className="ph-fill ph-wifi-high" /><i className="ph-fill ph-battery-high" />
        </span>
      </div>
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, overflow: 'hidden', padding: '20px 26px', display: 'flex', flexDirection: 'column' }}>
        <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#C6F135', marginTop: 10 }}>SEASON 3 · WEEK 1</div>
        <div className="font-oswald" style={{ fontWeight: 600, fontSize: 40, lineHeight: 1, marginTop: 8 }}>Welcome,<br />Alex</div>
        <div style={{ color: '#C3CBD2', fontSize: 14, lineHeight: 1.5, marginTop: 14 }}>
          Your first five sessions set your <span style={{ color: '#F2F5F7' }}>baseline</span>. From there, every attribute climbs relative to your own numbers — not anyone else&apos;s.
        </div>
        <div style={{ margin: '24px auto', position: 'relative' }}>
          <svg viewBox="0 0 220 220" style={{ width: 230, height: 230, display: 'block' }}>
            <polygon points="110,20 200,110 110,200 20,110" fill="none" stroke="#20252B" />
            <polygon points="110,65 155,110 110,155 65,110" fill="none" stroke="#191E24" />
            <line x1="110" y1="20" x2="110" y2="200" stroke="#191E24" />
            <line x1="20" y1="110" x2="200" y2="110" stroke="#191E24" />
            <polygon points="110,102 118,110 110,118 102,110" fill="rgba(198,241,53,.2)" stroke="#C6F135" strokeWidth="2" />
            <text x="110" y="13" fill="#5C6870" fontFamily="Oswald" fontSize="11" textAnchor="middle">STR</text>
            <text x="211" y="113" fill="#5C6870" fontFamily="Oswald" fontSize="11" textAnchor="middle">END</text>
            <text x="110" y="215" fill="#5C6870" fontFamily="Oswald" fontSize="11" textAnchor="middle">MOB</text>
            <text x="9" y="113" fill="#5C6870" fontFamily="Oswald" fontSize="11" textAnchor="middle">CON</text>
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,26px)', fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: '.16em', color: '#8A939C', whiteSpace: 'nowrap' }}>BASELINE FORMING</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 4 }}>
          <span className="font-oswald" style={{ fontSize: 13, color: '#8A939C' }}>LEVEL 1</span>
          <span className="font-oswald" style={{ fontSize: 13, color: '#8A939C' }}>0 / 300 XP</span>
        </div>
        <div style={{ height: 8, background: '#14181D', border: '1px solid #23282F', borderRadius: 6 }} />
        <button style={{ marginTop: 'auto', width: '100%', background: '#C6F135', color: '#0B0D10', borderRadius: 15, height: 58, fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: '.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <i className="ph-bold ph-plus" style={{ fontSize: 20 }} />LOG YOUR FIRST SESSION
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ width: 390, height: 844, background: '#0B0D10', borderRadius: 46, border: '9px solid #1B2026', boxShadow: '0 30px 70px rgba(0,0,0,.6)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 118, height: 26, background: '#000', borderRadius: 16, zIndex: 20 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px 0', fontSize: 13, zIndex: 15 }}>
        <span className="font-oswald" style={{ fontWeight: 500 }}>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
          <i className="ph-fill ph-cell-signal-full" /><i className="ph-fill ph-wifi-high" /><i className="ph-fill ph-battery-high" />
        </span>
      </div>
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, overflow: 'hidden', padding: '20px 26px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.22em', color: '#8A939C' }}>SEASON 3 · WEEK 5</div>
            <div className="font-oswald" style={{ fontSize: 17, marginTop: 3 }}>Alex Rivera</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#14181D', border: '1px solid #23282F', borderRadius: 12, padding: '7px 11px' }}>
            <i className="ph-fill ph-fire" style={{ color: '#FFC53C', fontSize: 16 }} /><span className="font-oswald" style={{ fontSize: 17 }}>12</span>
          </div>
        </div>
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#14181D', border: '1px solid #23282F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <i className="ph ph-moon-stars" style={{ fontSize: 34, color: '#6B747C' }} />
          </div>
          <div className="font-oswald" style={{ fontSize: 20, marginTop: 20, letterSpacing: '.04em' }}>Rest day</div>
          <div style={{ fontSize: 14, color: '#8A939C', marginTop: 8, lineHeight: 1.5, maxWidth: 260, margin: '8px auto 0' }}>
            A rest token covered today. Your 12-day streak is intact.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 16, color: '#C3CBD2', fontSize: 13 }}>
            <i className="ph ph-shield-check" style={{ color: '#C6F135', fontSize: 16 }} />2 rest tokens remaining
          </div>
        </div>
        <div style={{ marginTop: 'auto', background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: '14px 16px' }}>
          <div className="font-oswald" style={{ fontSize: 11, letterSpacing: '.18em', color: '#8A939C', marginBottom: 8 }}>TOMORROW&apos;S QUEST</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Vertical Pull Volume</div>
          <div style={{ fontSize: 11, color: '#8A939C', marginTop: 4 }}>2 of 3 sessions complete · +120 XP on finish</div>
        </div>
        <button style={{ marginTop: 12, width: '100%', background: '#C6F135', color: '#0B0D10', borderRadius: 15, height: 56, fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: '.06em' }}>
          LOG A SESSION ANYWAY
        </button>
      </div>
    </div>
  );
}

function ComponentSheet() {
  return (
    <div style={{ background: '#0B0D10', border: '1px solid #1B2026', borderRadius: 24, padding: 36, maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 34 }}>
      <div>
        <div className="font-oswald" style={{ fontSize: 12, letterSpacing: '.2em', color: '#8A939C', marginBottom: 16 }}>BUTTONS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <button style={{ background: '#C6F135', color: '#0B0D10', borderRadius: 13, height: 48, padding: '0 24px', fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: '.06em' }}>PRIMARY</button>
          <button style={{ background: 'transparent', border: '1px solid #3A4A10', color: '#C6F135', borderRadius: 13, height: 48, padding: '0 24px', fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: '.06em' }}>SECONDARY</button>
          <button style={{ background: 'transparent', color: '#C3CBD2', borderRadius: 13, height: 48, padding: '0 20px', fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: '.06em' }}>GHOST</button>
          <button style={{ width: 48, height: 48, borderRadius: 13, background: '#14181D', border: '1px solid #23282F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C6F135' }}>
            <i className="ph-bold ph-plus" style={{ fontSize: 20 }} />
          </button>
          <button disabled style={{ background: '#14181D', color: '#5C666E', borderRadius: 13, height: 48, padding: '0 24px', fontFamily: "'Oswald',sans-serif", fontSize: 15, letterSpacing: '.06em', opacity: .45, cursor: 'not-allowed' }}>DISABLED</button>
        </div>
      </div>
      <div style={{ height: 1, background: '#1B2026' }} />
      <div>
        <div className="font-oswald" style={{ fontSize: 12, letterSpacing: '.2em', color: '#8A939C', marginBottom: 16 }}>STAT CHIPS</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {([['42','STRENGTH','#FF5A3C'],['38','ENDURANCE','#3CC5FF'],['27','MOBILITY','#B57BFF'],['55','CONSIST.','#FFC53C']] as const).map(([val, label, color]) => (
            <div key={label} style={{ width: 100, background: '#14181D', border: '1px solid #23282F', borderRadius: 14, padding: '14px 6px', textAlign: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, margin: '0 auto 8px' }} />
              <div className="font-oswald" style={{ fontSize: 30, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 10, letterSpacing: '.14em', color: '#8A939C', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: '#1B2026' }} />
      <div>
        <div className="font-oswald" style={{ fontSize: 12, letterSpacing: '.2em', color: '#8A939C', marginBottom: 16 }}>PROGRESS RINGS</div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }}>
            <circle cx="22" cy="22" r="18" fill="none" stroke="#23282F" strokeWidth="4" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="#C6F135" strokeWidth="4" strokeLinecap="round" strokeDasharray="113.1" strokeDashoffset="35" transform="rotate(-90 22 22)" className="anim-ring" />
          </svg>
          <svg viewBox="0 0 72 72" style={{ width: 72, height: 72 }}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#23282F" strokeWidth="5" />
            <circle cx="36" cy="36" r="30" fill="none" stroke="#3CC5FF" strokeWidth="5" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="66" transform="rotate(-90 36 36)" className="anim-ring" />
            <text x="36" y="41" fill="#F2F5F7" fontFamily="Oswald" fontSize="18" textAnchor="middle">65%</text>
          </svg>
          <svg viewBox="0 0 108 108" style={{ width: 104, height: 104 }}>
            <circle cx="54" cy="54" r="46" fill="none" stroke="#23282F" strokeWidth="7" />
            <circle cx="54" cy="54" r="46" fill="none" stroke="#C6F135" strokeWidth="7" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="92.5" transform="rotate(-90 54 54)" className="anim-ring" />
            <text x="54" y="52" fill="#F2F5F7" fontFamily="Oswald" fontWeight="600" fontSize="30" textAnchor="middle">68%</text>
            <text x="54" y="70" fill="#8A939C" fontFamily="Oswald" fontSize="9" letterSpacing="1.5" textAnchor="middle">SEASON</text>
          </svg>
        </div>
      </div>
      <div style={{ height: 1, background: '#1B2026' }} />
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="font-oswald" style={{ fontSize: 12, letterSpacing: '.2em', color: '#8A939C', marginBottom: 16 }}>SESSION CARD</div>
          <div style={{ background: 'linear-gradient(160deg,#171C22,#101418)', border: '1px solid #23282F', borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#FF5A3C' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="font-oswald" style={{ letterSpacing: '.16em', fontSize: 11, color: '#8A939C' }}>JUL 18 · 47 MIN</span>
              <span className="font-oswald" style={{ fontSize: 11, color: '#C6F135' }}>+640 XP</span>
            </div>
            <div className="font-oswald" style={{ fontSize: 24, marginTop: 6 }}>Back &amp; Legs</div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {([['12,400','LB VOLUME','#C6F135'],['18','SETS','#F2F5F7'],['+18%','VS BASE','#C6F135']] as const).map(([val, label, color]) => (
                <div key={label}>
                  <div className="font-oswald" style={{ fontSize: 22, color }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#8A939C', letterSpacing: '.1em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="font-oswald" style={{ fontSize: 12, letterSpacing: '.2em', color: '#8A939C', marginBottom: 16 }}>BADGES</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1, background: 'linear-gradient(135deg,#1c2410,#12161B)', border: '1px solid #3A4A10', borderRadius: 16, padding: 16, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#C6F135', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <i className="ph-fill ph-medal" style={{ fontSize: 30, color: '#0B0D10' }} />
              </div>
              <div className="font-oswald" style={{ fontSize: 13, marginTop: 10 }}>Bodyweight Squat ×5</div>
              <div style={{ fontSize: 10, color: '#C6F135', letterSpacing: '.1em', marginTop: 3 }}>UNLOCKED · TOP 6%</div>
            </div>
            <div style={{ flex: 1, background: '#14181D', border: '1px solid #23282F', borderRadius: 16, padding: 16, textAlign: 'center', opacity: .6 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1B2026', border: '1px solid #23282F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <i className="ph ph-lock-simple" style={{ fontSize: 26, color: '#5C666E' }} />
              </div>
              <div className="font-oswald" style={{ fontSize: 13, marginTop: 10, color: '#8A939C' }}>Sub-20:00 5K</div>
              <div style={{ fontSize: 10, color: '#5C666E', letterSpacing: '.1em', marginTop: 3 }}>LOCKED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
