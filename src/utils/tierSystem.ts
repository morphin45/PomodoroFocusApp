export type Tier = 'free' | 'pro' | 'premium' | 'team';
export type BillingCycle = 'monthly' | 'yearly';

export interface TierConfig {
  id: Tier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  gradient: string;
  icon: string;
  features: string[];
  limits: TierLimits;
  badge?: string;
  popular?: boolean;
}

export interface TierLimits {
  maxTasks: number;
  maxSounds: number;
  maxThemes: number;
  maxCustomTechniques: number;
  historyDays: number;
  maxNotes: number;
  maxGoals: number;
  maxProjects: number;
  exportsPerMonth: number;
  cloudSync: boolean;
  teamMembers: number;
  apiAccess: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  aiFeatures: boolean;
}

export const TIER_CONFIGS: Record<Tier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Start your focus journey',
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: '#6b7280',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    icon: '🌱',
    features: [
      'Basic timer with 4 techniques',
      'Up to 5 active tasks',
      '7-day session history',
      '3 ambient sounds',
      '3 themes',
      '1 custom technique',
      'Basic statistics',
      'Keyboard shortcuts',
      'Break activity suggestions',
    ],
    limits: {
      maxTasks: 5,
      maxSounds: 3,
      maxThemes: 3,
      maxCustomTechniques: 1,
      historyDays: 7,
      maxNotes: 10,
      maxGoals: 2,
      maxProjects: 1,
      exportsPerMonth: 2,
      cloudSync: false,
      teamMembers: 1,
      apiAccess: false,
      prioritySupport: false,
      customBranding: false,
      aiFeatures: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Unlock your full potential',
    monthlyPrice: 3.99,
    yearlyPrice: 29.99,
    color: '#f05252',
    gradient: 'linear-gradient(135deg, #f05252 0%, #d83d42 100%)',
    icon: '⚡',
    badge: 'Most Popular',
    popular: true,
    features: [
      'Everything in Free, plus:',
      'Unlimited tasks & projects',
      'Full session history',
      '12 ambient sounds',
      '10 beautiful themes',
      'Unlimited custom techniques',
      'Advanced analytics & insights',
      'PDF & CSV reports',
      'Data import from other apps',
      'Session notes & tags',
      'Task categories',
      'Goals & streak protection',
      'Focus mode',
      'Health reminders',
      'Priority email support',
    ],
    limits: {
      maxTasks: 999,
      maxSounds: 12,
      maxThemes: 10,
      maxCustomTechniques: 999,
      historyDays: 365,
      maxNotes: 999,
      maxGoals: 10,
      maxProjects: 10,
      exportsPerMonth: 30,
      cloudSync: false,
      teamMembers: 1,
      apiAccess: false,
      prioritySupport: true,
      customBranding: false,
      aiFeatures: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'The ultimate focus experience',
    monthlyPrice: 7.99,
    yearlyPrice: 59.99,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    icon: '💎',
    badge: 'Best Value',
    features: [
      'Everything in Pro, plus:',
      'Cloud sync across all devices',
      'Dashboard widgets',
      'Timeline visualization',
      'Better notifications with snooze',
      'Quick actions',
      'Full accessibility suite',
      'AI-powered recommendations',
      'Custom sound uploads',
      'API access',
      'Beta feature access',
      '1-on-1 onboarding call',
      'Early access to new features',
      'Exclusive achievements',
      'VIP support (< 4hr response)',
    ],
    limits: {
      maxTasks: 999,
      maxSounds: 999,
      maxThemes: 999,
      maxCustomTechniques: 999,
      historyDays: 9999,
      maxNotes: 999,
      maxGoals: 999,
      maxProjects: 999,
      exportsPerMonth: 999,
      cloudSync: true,
      teamMembers: 1,
      apiAccess: true,
      prioritySupport: true,
      customBranding: false,
      aiFeatures: true,
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    tagline: 'Focus together, achieve more',
    monthlyPrice: 12.99,
    yearlyPrice: 99.99,
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    icon: '👥',
    features: [
      'Everything in Premium, plus:',
      'Team collaboration',
      'Shared goals & projects',
      'Team analytics dashboard',
      'Admin controls',
      'SSO integration',
      'Custom branding',
      'Dedicated account manager',
      'Team achievements',
      'Custom integrations',
      'SLA guarantee (99.9%)',
      'Invoice billing',
      'Onboarding for teams',
      'Priority feature requests',
      'White-label option',
    ],
    limits: {
      maxTasks: 999,
      maxSounds: 999,
      maxThemes: 999,
      maxCustomTechniques: 999,
      historyDays: 9999,
      maxNotes: 999,
      maxGoals: 999,
      maxProjects: 999,
      exportsPerMonth: 999,
      cloudSync: true,
      teamMembers: 999,
      apiAccess: true,
      prioritySupport: true,
      customBranding: true,
      aiFeatures: true,
    },
  },
};

export interface UsageStats {
  tasks: number;
  sounds: number;
  themes: number;
  customTechniques: number;
  notes: number;
  goals: number;
  projects: number;
  exportsThisMonth: number;
}

export const checkFeatureAccess = (
  tier: Tier,
  feature: keyof TierLimits
): boolean => {
  const value = TIER_CONFIGS[tier].limits[feature];
  return typeof value === 'boolean' ? value : (value as number) > 0;
};

export const checkUsageLimit = (
  tier: Tier,
  usage: UsageStats
): { allowed: boolean; limit: number; current: number; feature: string } | null => {
  const limits = TIER_CONFIGS[tier].limits;
  
  if (usage.tasks >= limits.maxTasks) {
    return { allowed: false, limit: limits.maxTasks, current: usage.tasks, feature: 'tasks' };
  }
  if (usage.notes >= limits.maxNotes) {
    return { allowed: false, limit: limits.maxNotes, current: usage.notes, feature: 'notes' };
  }
  if (usage.goals >= limits.maxGoals) {
    return { allowed: false, limit: limits.maxGoals, current: usage.goals, feature: 'goals' };
  }
  if (usage.exportsThisMonth >= limits.exportsPerMonth) {
    return { allowed: false, limit: limits.exportsPerMonth, current: usage.exportsThisMonth, feature: 'exports' };
  }
  
  return null;
};

export const getUpgradeMessage = (currentTier: Tier, feature: string): string => {
  const nextTier = currentTier === 'free' ? 'pro' : currentTier === 'pro' ? 'premium' : 'team';
  const nextConfig = TIER_CONFIGS[nextTier];
  
  return `Upgrade to ${nextConfig.name} to unlock unlimited ${feature} and more powerful features!`;
};
