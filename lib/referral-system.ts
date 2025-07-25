import { v4 as uuidv4 } from 'uuid';

export interface ReferralChain {
  id: string;
  ideaId: string;
  userId: string;
  referrerId?: string; // Who referred this user
  referralCode: string; // Unique code for this user's referrals
  referredUsers: string[]; // Users this person referred
  isCompleted: boolean; // Has referred to 3 people
  createdAt: string;
  completedAt?: string;
}

export interface ReferralLink {
  ideaId: string;
  referrerId: string;
  referralCode: string;
  url: string;
}

export class ReferralSystem {
  private static REQUIRED_REFERRALS = 3;

  // Generate unique referral code
  static generateReferralCode(): string {
    return uuidv4().split('-')[0].toUpperCase();
  }

  // Create referral link
  static createReferralLink(ideaId: string, userId: string): ReferralLink {
    const referralCode = this.generateReferralCode();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ideaspreader.com';
    
    return {
      ideaId,
      referrerId: userId,
      referralCode,
      url: `${baseUrl}/idea/${ideaId}?ref=${referralCode}&from=${userId}`
    };
  }

  // Track referral when someone clicks a referral link
  static trackReferral(ideaId: string, referralCode: string, newUserId: string): ReferralChain {
    // In production, this would save to database
    const referralChain: ReferralChain = {
      id: uuidv4(),
      ideaId,
      userId: newUserId,
      referralCode: this.generateReferralCode(),
      referredUsers: [],
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    // Find the referrer by referral code and update their chain
    // This would be a database operation in production
    //('📊 Tracking referral:', {
    //   ideaId,
    //   referralCode,
    //   newUserId,
    //   chain: referralChain
    // });

    return referralChain;
  }

  // Complete referral when user refers 3 people
  static completeReferral(userId: string, referredEmails: string[]): boolean {
    if (referredEmails.length < this.REQUIRED_REFERRALS) {
      return false;
    }

    // In production, update database
    //('✅ Referral completed:', {
      // userId,
    //   referredCount: referredEmails.length,
    //   completedAt: new Date().toISOString()
    // });

    return true;
  }

  // Get referral tree for visualization
  static getReferralTree(ideaId: string): any {
    // In production, fetch from database
    return {
      ideaId,
      totalReferrals: 1247,
      totalReach: 15420,
      levels: 8,
      chains: [
        // Mock data for visualization
        {
          level: 1,
          referrals: 3,
          users: ['user1', 'user2', 'user3']
        },
        {
          level: 2,
          referrals: 9,
          users: ['user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12']
        }
        // ... more levels
      ]
    };
  }

  // Check if user can access idea (has completed referral or is original creator)
  static canAccessIdea(userId: string, ideaId: string, referralCode?: string): boolean {
    // In production, check database for:
    // 1. Is user the original creator?
    // 2. Has user completed their referral requirement?
    // 3. Is this their first time accessing via referral link?
    
    // For demo, allow access but track the referral
    if (referralCode) {
      // //('🔗 User accessing via referral link:', {
      //   userId,
      //   ideaId,
      //   referralCode
      // });
    }
    
    return true;
  }

  // Get user's referral stats
  static getUserReferralStats(userId: string) {
    // In production, fetch from database
    return {
      totalReferrals: 12,
      completedChains: 4,
      pendingChains: 1,
      totalReach: 3847,
      rank: 'Super Spreader',
      badges: ['First Referral', 'Chain Master', 'Viral Creator']
    };
  }
}