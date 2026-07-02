# SkillSwap AI - Functional Requirements

This document describes each functional module in detail, with implementation notes and acceptance criteria.

## Module 1: Authentication System

### Features

* Email registration with password
* Email login
* Google OAuth login
* Password reset flow
* Email verification workflow

### Data

* `email`
* `passwordHash`
* `isEmailVerified`
* `authProvider`
* `createdAt`

### Acceptance Criteria

* Users can register and log in successfully.
* Users receive verification emails and can confirm their account.
* Protected routes require authentication.
* Unauthorized users cannot access dashboard or learning room pages.

### Implementation Notes

* Use Firebase Authentication for email/password and Google sign-in.
* Build UI flows for onboarding, email confirmation, and password reset.
* Add error handling for invalid credentials and expired links.

## Module 2: Student Profile Management

### Features

* Profile photo upload
* Personal bio
* College and degree information
* Portfolio links
* Skill lists separated into skills offered and skills needed
* Social profile links

### Data Fields

#### Personal Information

* Full name
* Email
* Profile picture URL
* College
* Degree
* Bio

#### Skills Offered

* Skill name
* Experience level
* Years of experience

#### Skills Required

* Skill name
* Target level

#### Social Links

* GitHub
* LinkedIn
* Portfolio website

### Acceptance Criteria

* Users can create and update their profile.
* Skills are saved in the correct collections or nested fields.
* Profile pages display all relevant information.
* Users can upload and update a profile photo.

### Implementation Notes

* Store profile information in Firestore under `Users`.
* Use Firebase Storage for profile photo uploads.
* Provide an onboarding wizard to capture essential fields.
* Validate skill entries and enforce required fields.

## Module 3: AI Skill Matching Engine

### Description

AI analyzes user profiles, skills offered, and skills needed to recommend ideal learning partners.

### Inputs

* Skills offered
* Skills needed
* Experience levels
* Learning goals
* User ratings
* Activity metrics

### Outputs

* Match percentage
* Matching explanation
* Recommended user list

### Acceptance Criteria

* A match score is generated successfully for each candidate.
* The UI displays an explanation of the match.
* Suggested partners are relevant to the user’s goals.

### Implementation Notes

* Build a scoring function that compares skill overlap, experience parity, and learning goals.
* Use AI or simple heuristics in MVP: matching skills offered by one user to skills needed by another.
* Provide a match explanation field with reasons such as “Strong overlap in Python and DSA.”

## Module 4: Skill Swap Request System

### Features

* Create swap request with offer and request details
* Accept or reject incoming requests
* Cancel sent requests
* Track request status through its lifecycle

### Request Status

* Pending
* Accepted
* Active
* Completed
* Rejected

### Acceptance Criteria

* Users can send swap requests to other users.
* Request status updates correctly through progress states.
* Notifications are triggered when requests are created, accepted, or rejected.

### Implementation Notes

* Store requests in a `SwapRequests` collection with status and participant IDs.
* Update status atomically and notify affected users.
* Provide UI filters for request status and quick actions.

## Module 5: Learning Rooms

### Description

Learning rooms are collaborative spaces for approved swap partners.

### Features

#### Shared Notes

* Rich text editor
* Auto-save notes to Firestore

#### Resource Management

* Upload PDFs and documents
* Share links and references

#### Task Management

* Create tasks
* Assign tasks to participants
* Mark tasks completed

#### Progress Tracking

* Display learning progress
* Track goal milestones

### Acceptance Criteria

* Learning rooms are created automatically after swap approval.
* Participants can collaborate in real time.
* Progress updates correctly when tasks are completed.

### Implementation Notes

* Create a `LearningRooms` collection with room metadata, participants, and collaboration content.
* Use Firestore real-time updates for notes and tasks.
* Provide a mobile-friendly interface for room activity.

## Module 6: Google Meet Integration

### Features

* Schedule sessions from inside the room
* Generate Google Meet links
* Calendar integration with Google Calendar API
* Join meetings from the app

### Stored Information

* Meeting ID
* Meeting link
* Start time
* End time
* Host
* Participants

### Acceptance Criteria

* Meetings are generated successfully.
* Participants receive notifications for meeting invites.
* Join links work correctly.

### Implementation Notes

* Use Google Calendar API to create events with meet links.
* Store meeting metadata in a `Meetings` collection.
* Display scheduled sessions inside the learning room and notifications.

## Module 7: AI Study Path Generator

### Description

Generate personalized learning plans based on current skill level, target skill, and available study hours.

### Inputs

* Current skill level
* Target skill
* Available hours per week

### Outputs

* Weekly learning plan
* Assignments
* Resources
* Milestones

### Acceptance Criteria

* A study roadmap is generated successfully.
* The plan is displayed clearly with milestones and tasks.

### Implementation Notes

* Use AI or rule-based logic to generate study paths.
* Provide editable plan cards so users can customize assignments.

## Module 8: AI Knowledge Gap Detection

### Features

* Topic-based quizzes
* Performance analysis
* Improvement recommendations

### Outputs

* Weak areas
* Strong areas
* Suggested learning partners

### Acceptance Criteria

* Quiz results are analyzed correctly.
* AI recommendations are generated and actionable.

### Implementation Notes

* Track quiz responses in `QuizResults`.
* Score performance and compute gap analysis.
* Suggest partners whose strengths match a user’s weak areas.

## Module 9: AI Learning Assistant

### Features

* Answer questions in natural language
* Explain concepts on demand
* Generate notes and summaries
* Create quizzes and suggest resources

### AI Provider

* Google Gemini API

### Acceptance Criteria

* The assistant responds accurately.
* Context awareness is maintained across the session.

### Implementation Notes

* Build the assistant as a chat interaction layer.
* Provide a context window with relevant user profile and room details.

## Module 10: AI Session Summary

### Features

* Generate session summary
* Highlight key learnings
* Create action items and homework
* Define next session goals

### Acceptance Criteria

* Session summaries are generated automatically.
* Summaries are stored in the learning room record.

### Implementation Notes

* Trigger summary creation when a session ends or on-demand.
* Store summaries in a `SessionSummaries` collection or nested room document.

## Module 11: Marketplace

### Features

* Create marketplace listings
* Search listings with keywords
* Filter results by skill, experience, and availability
* Apply for skill exchanges

### Listing Example

* "I’ll teach Python for DSA"

### Acceptance Criteria

* Listings are visible to the community.
* Search and filtering work correctly.

### Implementation Notes

* Use a `MarketplacePosts` collection with category tags and verification status.
* Provide featured listings and a search UI for discovery.

## Module 12: Skill Verification System

### Features

* Upload certificates and project evidence
* GitHub profile verification
* Verification request workflow for admins

### Verification Levels

#### Basic

* Profile complete

#### Verified

* Certificate approved

#### Expert

* Projects and GitHub approved

### Acceptance Criteria

* Users can submit verification requests.
* Admins can approve or reject verification.

### Implementation Notes

* Store verification requests in `Certificates` or a dedicated verification collection.
* Allow admins to review uploaded files and metadata.

## Module 13: Peer Rating System

### Categories

* Communication
* Teaching quality
* Reliability

### Acceptance Criteria

* Users can rate peers after a swap.
* Average ratings are computed and displayed.

### Implementation Notes

* Save ratings to a `Ratings` collection.
* Use aggregated ratings on profile pages.

## Module 14: Notification System

### Notification Types

* Match found
* Request received
* Request accepted
* Meeting reminder
* Task assignment
* Marketplace activity

### Technology

* Firebase Cloud Messaging
* Firestore realtime updates

### Acceptance Criteria

* Notifications deliver successfully.

### Implementation Notes

* Use push notifications and in-app activity feed.
* Trigger notifications on state changes in requests, meetings, and tasks.

## Module 15: Attendance & Analytics

### Track

* Sessions attended
* Learning hours
* Weekly streak
* Task completion rate

### Visualizations

* Progress charts
* Learning statistics
* Activity trends

### Acceptance Criteria

* Analytics update in real time.

### Implementation Notes

* Aggregate usage metrics in Firestore and display on dashboards.
* Use charts to show trends and highlight engagement.

## Module 16: AI Session Recording Analysis

### Features

* Upload session recordings
* AI analysis of session content

### Outputs

* Covered concepts
* Revision notes
* MCQ quiz
* Learning insights
* Questions asked

### Acceptance Criteria

* Recordings process successfully.
* Insights are generated accurately.

### Implementation Notes

* Build a recording upload flow linked to learning rooms.
* Use AI services to parse audio/video and extract summaries.

## Module 17: Admin Dashboard

### User Management

* View all users
* Suspend or delete users

### Skill Management

* Add or remove platform skills

### Verification Management

* Approve or reject certificates

### Analytics

* Total users
* Active users
* Verified users
* Active swaps
* Completed swaps
* Marketplace listings

### Acceptance Criteria

* Admin actions reflect immediately in the system.

### Implementation Notes

* Create an admin-only dashboard with filtered user lists and verification workflow.
* Audit admin actions and add a safe retry mechanism.
