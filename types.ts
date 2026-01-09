
export enum ReviewPlatform {
  GOOGLE = 'google',
  ZOMATO = 'zomato',
  FACEBOOK = 'facebook',
  SWIGGY = 'swiggy',
  YELP = 'yelp',
  TRIPADVISOR = 'tripadvisor',
  JUSTDIAL = 'justdial',
  INTERNAL_ONLY = 'internal_only'
}

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'online' | 'offline' | 'invited';
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  whatsappNumber: string;
  ownerName: string;
  email: string;
  plan: 'basic' | 'pro';
  platforms: ReviewPlatform[];
  team: TeamMember[];
}

export interface Review {
  id: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  text: string;
  visibility: Visibility;
  platform?: ReviewPlatform;
  createdAt: string;
  aiDraft?: string;
  resolved: boolean;
}

export type DashboardTab = 'overview' | 'inbox' | 'analytics' | 'integrations' | 'settings' | 'market-intel' | 'channel-detail' | 'qr-generator';
export type AppView = 'client-flow' | 'dashboard' | 'auth';
