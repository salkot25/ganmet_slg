/**
 * PLN Corporate Theme & Chart Design Tokens
 * Adheres strictly to 60:30:10 rule & 4px spatial scale
 */

export const PLN_COLORS = {
  // 60% Dominant Base
  baseDark: '#070F1E',
  baseDarkSubtle: '#0B1728',
  baseLight: '#F8FAFC',
  
  // 30% Secondary Card & Structure
  surfaceDark: '#102238',
  surfaceDarkBorder: '#1E3A5F',
  surfaceLight: '#FFFFFF',
  surfaceLightBorder: '#E2E8F0',

  // 10% PLN Accents & Status
  cyan: '#00A2B9',
  cyanLight: '#00C2CB',
  cyanDark: '#00838F',
  cyanGlow: 'rgba(0, 162, 185, 0.35)',
  cyanSubtle: 'rgba(0, 162, 185, 0.12)',

  yellow: '#FFC107',
  yellowGlow: 'rgba(255, 193, 7, 0.3)',
  
  orange: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  slate: '#64748B'
};

export const getChartTheme = (isDark = true) => ({
  textColor: isDark ? '#94A3B8' : '#475569',
  gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
  tooltipBg: isDark ? 'rgba(11, 23, 40, 0.96)' : '#FFFFFF',
  tooltipTitle: isDark ? '#F8FAFC' : '#0F172A',
  tooltipBody: isDark ? '#00C2CB' : '#007B8C',
  tooltipSub: isDark ? '#94A3B8' : '#475569',
  tooltipBorder: isDark ? 'rgba(0, 162, 185, 0.4)' : '#CBD5E1',
  borderColor: isDark ? '#102238' : '#FFFFFF',
  fontFamily: 'Plus Jakarta Sans, sans-serif'
});
