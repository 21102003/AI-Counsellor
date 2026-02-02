# Profile Integrity Scoring System

## Overview
The Profile Integrity Score is a dynamic metric (0-100%) that tracks user profile completion across the AI Counsellor application.

## Scoring Breakdown

| Component | Weight | Criteria |
|-----------|--------|----------|
| **Basic Profile** | 20% | User is authenticated (Name, Email exist) |
| **Academic Target** | 20% | Degree, GPA, and Target Country are set |
| **University Locked** | 20% | User has committed to at least one university |
| **Standardized Tests** | 20% | IELTS or GRE score is added (even if null/not taken) |
| **Budget Defined** | 20% | Annual budget is set and > 0 |

## Implementation

### Storage Keys
- `access_token` or `token` - Authentication token
- `userProfile` - User's academic profile data
- `lockedUniversity` - Committed university object

### Usage Example

```typescript
import { calculateProfileScore, getScoreFeedback } from '@/lib/profile-score';

// Load data
const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
const hasLockedUni = !!localStorage.getItem('lockedUniversity');
const isAuth = !!localStorage.getItem('access_token');

// Calculate score
const score = calculateProfileScore(userProfile, hasLockedUni, isAuth);

// Get feedback
const feedback = getScoreFeedback(score);
// Returns: { message: string, color: string }
```

## Visual States

### Score < 50% (Orange)
- **Message**: "Profile Incomplete. Calibration Required."
- **Color**: `text-orange-400` / `text-orange-500`
- **Action**: Prompt user to complete onboarding

### Score 50-79% (Indigo)
- **Message**: "Profile in progress. Complete remaining steps."
- **Color**: `text-indigo-400` / `text-indigo-500`
- **Action**: Guide user to missing components

### Score ≥ 80% (Green)
- **Message**: "Optimization Complete. Ready for submission."
- **Color**: `text-emerald-400` / `text-emerald-500`
- **Action**: Encourage application submission

## SVG Circle Progress

The circular progress indicator uses `stroke-dasharray` and `stroke-dashoffset` to animate the score:

```typescript
const radius = 56; // pixels
const circumference = 2 * Math.PI * radius;
const progressOffset = circumference - (score / 100) * circumference;
```

## Data Flow

1. **Onboarding (AI or Manual)** → Saves `userProfile` to localStorage
2. **Discovery/Lock University** → Saves `lockedUniversity` to localStorage
3. **Dashboard Load** → Reads all data, calculates score dynamically
4. **Real-time Updates** → Score recalculates on each dashboard visit

## Future Enhancements

- [ ] Add backend API for persistent scoring
- [ ] Track score history over time
- [ ] Add gamification (badges, achievements)
- [ ] Send notifications when score drops
- [ ] Integrate with application submission workflow
