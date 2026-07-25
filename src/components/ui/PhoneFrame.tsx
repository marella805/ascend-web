'use client';
import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export function PhoneFrame({ children, className = '', light }: PhoneFrameProps) {
  const bg = light ? '#EEF1F2' : '#0B0D10';
  const border = light ? '#D8DCE0' : '#1B2026';
  return (
    <div
      className={className}
      style={{
        width: 390,
        height: 844,
        background: bg,
        borderRadius: 46,
        border: `9px solid ${border}`,
        boxShadow: '0 30px 70px rgba(0,0,0,.6)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Notch */}
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 118, height: 26, background: '#000', borderRadius: 16, zIndex: 20 }} />
      {/* Status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px 0', fontSize: 13, zIndex: 15, color: light ? '#2C3338' : '#F2F5F7' }}>
        <span className="font-oswald" style={{ fontWeight: 500 }}>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14 }}>
          <i className="ph-fill ph-cell-signal-full" />
          <i className="ph-fill ph-wifi-high" />
          <i className="ph-fill ph-battery-high" />
        </span>
      </div>
      {/* Content */}
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

export function BottomNav({ active, light }: { active: 'sheet' | 'quests' | 'crew' | 'history'; light?: boolean }) {
  const iconColor = light ? '#9AA3AB' : '#6B747C';
  const activeColor = light ? '#4C6B00' : '#C6F135';
  const bg = light ? 'linear-gradient(to top,#EEF1F2 55%,rgba(238,241,242,0))' : 'linear-gradient(to top,#0B0D10 55%,rgba(11,13,16,0))';
  const fabBg = light ? '#A9D400' : '#C6F135';
  const fabShadow = light ? '0 8px 22px rgba(169,212,0,.5)' : '0 8px 22px rgba(198,241,53,.4)';

  const items = [
    { key: 'sheet', icon: 'ph-shield-chevron', label: 'SHEET', fillIcon: 'ph-fill ph-shield-chevron' },
    { key: 'quests', icon: 'ph-target', label: 'QUESTS', fillIcon: 'ph-fill ph-target' },
    { key: 'crew', icon: 'ph-users-three', label: 'CREW', fillIcon: 'ph-fill ph-users-three' },
    { key: 'history', icon: 'ph-chart-bar', label: 'HISTORY', fillIcon: 'ph-fill ph-chart-bar' },
  ];

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 86, background: bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 30px 0', zIndex: 12 }}>
      {items.slice(0, 2).map(item => (
        <NavItem key={item.key} active={active === item.key} icon={item.icon} fillIcon={item.fillIcon} label={item.label} activeColor={activeColor} iconColor={iconColor} />
      ))}
      <div style={{ width: 56, height: 56, borderRadius: 20, background: fabBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -10, boxShadow: fabShadow }}>
        <i className="ph-bold ph-plus" style={{ fontSize: 26, color: '#0B0D10' }} />
      </div>
      {items.slice(2).map(item => (
        <NavItem key={item.key} active={active === item.key} icon={item.icon} fillIcon={item.fillIcon} label={item.label} activeColor={activeColor} iconColor={iconColor} />
      ))}
    </div>
  );
}

function NavItem({ active, icon, fillIcon, label, activeColor, iconColor }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: active ? activeColor : iconColor, width: 46 }}>
      <i className={active ? fillIcon : `ph ${icon}`} style={{ fontSize: 22 }} />
      <span className="font-oswald" style={{ fontSize: 8, letterSpacing: '.14em' }}>{label}</span>
    </div>
  );
}
