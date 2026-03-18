/// <reference types="astro/client" />

type MembershipPlan = 'monthly' | 'semiannual' | 'annual' | 'lifetime';
type MembershipStatus = 'pending' | 'active' | 'expired' | 'inactive';

interface MembershipRecord {
  id: string;
  user_id: string;
  plan: MembershipPlan;
  status: MembershipStatus;
  start_at: string | null;
  end_at: string | null;
  is_lifetime: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email?: string;
    } | null;
    membership: MembershipRecord | null;
    hasPaidAccess: boolean;
  }
}