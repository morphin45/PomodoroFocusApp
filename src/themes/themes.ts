export interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPremium: boolean;
  colors: {
    primary: string;
    primaryDark: string;
    background: string;
    backgroundDark: string;
    card: string;
    cardDark: string;
    accent: string;
    accentDark: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic Red',
    description: 'The original Pomodoro experience',
    icon: '🍅',
    isPremium: false,
    colors: {
      primary: '#ef5350',
      primaryDark: '#d32f2f',
      background: '#fffaf6',
      backgroundDark: '#0a0a0a',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(22, 22, 22, 0.98)',
      accent: '#ff7043',
      accentDark: '#ff5722',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calm and focused like the sea',
    icon: '🌊',
    isPremium: false,
    colors: {
      primary: '#2196f3',
      primaryDark: '#1976d2',
      background: '#f0f8ff',
      backgroundDark: '#0a1628',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(15, 25, 40, 0.98)',
      accent: '#42a5f5',
      accentDark: '#2196f3',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural and refreshing',
    icon: '🌲',
    isPremium: false,
    colors: {
      primary: '#4caf50',
      primaryDark: '#388e3c',
      background: '#f1f8f4',
      backgroundDark: '#0a1a0f',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(15, 30, 20, 0.98)',
      accent: '#66bb6a',
      accentDark: '#4caf50',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm and energizing',
    icon: '🌅',
    isPremium: true,
    colors: {
      primary: '#ff9800',
      primaryDark: '#f57c00',
      background: '#fff8f0',
      backgroundDark: '#1a0f05',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(30, 20, 10, 0.98)',
      accent: '#ffb74d',
      accentDark: '#ff9800',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    description: 'Soft and peaceful',
    icon: '💜',
    isPremium: true,
    colors: {
      primary: '#9c27b0',
      primaryDark: '#7b1fa2',
      background: '#faf0ff',
      backgroundDark: '#1a0a1f',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(25, 15, 30, 0.98)',
      accent: '#ba68c8',
      accentDark: '#9c27b0',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    description: 'Deep and mysterious',
    icon: '🌙',
    isPremium: true,
    colors: {
      primary: '#673ab7',
      primaryDark: '#512da8',
      background: '#f5f0ff',
      backgroundDark: '#0f0a1a',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(20, 15, 30, 0.98)',
      accent: '#9575cd',
      accentDark: '#673ab7',
    },
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Delicate and beautiful',
    icon: '🌸',
    isPremium: true,
    colors: {
      primary: '#e91e63',
      primaryDark: '#c2185b',
      background: '#fff0f5',
      backgroundDark: '#1a0a10',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(30, 15, 20, 0.98)',
      accent: '#f06292',
      accentDark: '#e91e63',
    },
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    description: 'Luxurious and premium',
    icon: '✨',
    isPremium: true,
    colors: {
      primary: '#ffc107',
      primaryDark: '#ffa000',
      background: '#fffbf0',
      backgroundDark: '#1a1505',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(30, 25, 10, 0.98)',
      accent: '#ffd54f',
      accentDark: '#ffc107',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic Ice',
    description: 'Cool and crisp',
    icon: '❄️',
    isPremium: true,
    colors: {
      primary: '#00bcd4',
      primaryDark: '#0097a7',
      background: '#f0fdff',
      backgroundDark: '#051a1f',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(10, 25, 30, 0.98)',
      accent: '#4dd0e1',
      accentDark: '#00bcd4',
    },
  },
  {
    id: 'rose',
    name: 'Rose Gold',
    description: 'Elegant and sophisticated',
    icon: '🌹',
    isPremium: true,
    colors: {
      primary: '#e8a0bf',
      primaryDark: '#d4789c',
      background: '#fff5f8',
      backgroundDark: '#1a0f14',
      card: 'rgba(255, 255, 255, 0.92)',
      cardDark: 'rgba(28, 18, 22, 0.98)',
      accent: '#f0b8d0',
      accentDark: '#e8a0bf',
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return THEMES.find(t => t.id === id) || THEMES[0];
};

export const applyTheme = (theme: Theme, isDark: boolean) => {
  const root = document.documentElement;
  const colors = theme.colors;
  
  if (isDark) {
    root.style.setProperty('--primary', colors.primaryDark);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--background', colors.backgroundDark);
    root.style.setProperty('--card', colors.cardDark);
    root.style.setProperty('--accent', colors.accentDark);
  } else {
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--card', colors.card);
    root.style.setProperty('--accent', colors.accent);
  }
};
