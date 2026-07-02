# Development Phase 1 - Foundation

## Objective

Build the core MVP infrastructure, authentication, user profile management, skill matching, swap request flow, and basic collaboration support.

## Scope

### Core Features

* User Authentication
  - Email/password sign-up and login
  - Google OAuth
  - Email verification
  - Password reset
* Profile Management
  - Create and edit user profile
  - Upload profile picture
  - Add skills offered and skills needed
  - Add bio, college, degree, and social links
* Basic AI Skill Matching
  - Match candidates by skill overlap
  - Calculate match percentage
  - Display matching explanation
* Swap Request Workflow
  - Create swap requests
  - Accept, reject, cancel requests
  - Track request status
* Learning Room Setup
  - Create learning room when request is accepted
  - Basic room metadata and participants

### Data & Backend

* Firestore collections: `Users`, `SwapRequests`, `LearningRooms`
* Authentication via Firebase Auth
* Profile photo storage in Firebase Storage
* Firestore security rules for basic role-based access

### UI/UX

* Authentication screens
* Profile setup and skill entry forms
* Match discovery list
* Swap request cards and status views
* Basic learning room shell

## Success Criteria

* User can sign up, verify email, and log in.
* Users can create and update profiles with skills.
* Matching results are generated and displayed.
* Swap requests flow through Pending, Accepted, Rejected statuses.
* Learning room records are created after a swap is accepted.

## Implementation Notes

* Prioritize a clean glassmorphic UI skeleton for early pages.
* Keep initial AI logic lightweight and rule-based.
* Build reusable form and card components for later phases.
* Enable real-time status updates using Firestore listeners.
