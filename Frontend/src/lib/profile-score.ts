/**
 * Profile Integrity Scoring System
 * 
 * This module calculates a user's profile completion score (0-100%)
 * based on key milestones in the application journey.
 */

export interface UserProfile {
  degree?: string;
  gpa?: number;
  ielts?: number | null;
  gre?: number | null;
  budget?: number;
  country?: string;
}

/**
 * Calculate Profile Completion Score (0-100%)
 * 
 * Scoring Breakdown:
 * - 20% Basic Profile (Name, Email from authentication)
 * - 20% Academic Target (Degree, GPA, Country)
 * - 20% University Locked
 * - 20% Standardized Tests Added (IELTS or GRE)
 * - 20% Budget Defined
 * 
 * @param userProfile - User's profile data from localStorage
 * @param hasLockedUniversity - Whether user has committed to a university
 * @param isAuthenticated - Whether user is authenticated
 * @returns Score from 0-100
 */
export const calculateProfileScore = (
  userProfile: UserProfile | null,
  hasLockedUniversity: boolean,
  isAuthenticated: boolean
): number => {
  let score = 0;

  // 20% - Basic Profile (if authenticated, assume name/email exist)
  if (isAuthenticated) {
    score += 20;
  }

  // 20% - Academic Target (Degree, GPA, Country)
  if (userProfile?.degree && userProfile?.gpa && userProfile?.country) {
    score += 20;
  }

  // 20% - University Locked
  if (hasLockedUniversity) {
    score += 20;
  }

  // 20% - Standardized Tests (IELTS or GRE)
  const hasTests =
    (userProfile?.ielts !== undefined && userProfile?.ielts !== null) ||
    (userProfile?.gre !== undefined && userProfile?.gre !== null);
  if (hasTests) {
    score += 20;
  }

  // 20% - Budget Defined
  if (userProfile?.budget && userProfile.budget > 0) {
    score += 20;
  }

  return score;
};

/**
 * Get feedback message and color based on score
 * 
 * @param score - Profile completion score (0-100)
 * @returns Object with message and color class
 */
export const getScoreFeedback = (score: number): { message: string; color: string } => {
  if (score < 50) {
    return {
      message: "Profile Incomplete. Calibration Required.",
      color: "text-orange-400",
    };
  } else if (score >= 80) {
    return {
      message: "Optimization Complete. Ready for submission.",
      color: "text-emerald-400",
    };
  } else {
    return {
      message: "Profile in progress. Complete remaining steps.",
      color: "text-indigo-400",
    };
  }
};

/**
 * Get SVG circle progress values for visual indicator
 * 
 * @param score - Profile completion score (0-100)
 * @param radius - Circle radius in pixels
 * @returns Object with circumference and offset for SVG strokeDasharray
 */
export const getCircleProgress = (score: number, radius: number = 56) => {
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;
  
  return {
    circumference,
    progressOffset,
  };
};

/**
 * Get color class based on score
 * 
 * @param score - Profile completion score (0-100)
 * @returns Tailwind color class for the progress indicator
 */
export const getScoreColor = (score: number): string => {
  if (score < 50) return "text-orange-500";
  if (score >= 80) return "text-emerald-500";
  return "text-indigo-500";
};
