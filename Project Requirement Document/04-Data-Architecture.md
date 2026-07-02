# SkillSwap AI - Data Architecture

This document defines data collections, key entity relationships, and storage structure for the platform.

## 1. Collections Overview

### Users

Stores user profile and account data.

Fields:
* `uid`
* `fullName`
* `email`
* `profilePhotoUrl`
* `college`
* `degree`
* `bio`
* `skillsOffered` (array)
* `skillsNeeded` (array)
* `socialLinks`
* `verificationStatus`
* `ratingSummary`
* `createdAt`
* `lastActiveAt`

### SwapRequests

Tracks skill exchange requests between students.

Fields:
* `requestId`
* `senderId`
* `receiverId`
* `skillsOffered`
* `skillsRequested`
* `message`
* `status`
* `createdAt`
* `updatedAt`

### LearningRooms

Manages active collaboration rooms.

Fields:
* `roomId`
* `swapRequestId`
* `participants`
* `notes`
* `resources`
* `tasks`
* `progress`
* `createdAt`
* `updatedAt`

### Meetings

Stores scheduled session data.

Fields:
* `meetingId`
* `roomId`
* `hostId`
* `participantIds`
* `meetLink`
* `calendarEventId`
* `startTime`
* `endTime`
* `status`

### MarketplacePosts

Holds marketplace listing data.

Fields:
* `postId`
* `userId`
* `title`
* `description`
* `skillsOffered`
* `skillsDesired`
* `category`
* `experienceLevel`
* `status`
* `createdAt`

### Ratings

Captures peer feedback after sessions.

Fields:
* `ratingId`
* `reviewerId`
* `revieweeId`
* `communication`
* `teachingQuality`
* `reliability`
* `comments`
* `createdAt`

### Notifications

Stores in-app notifications and remote delivery metadata.

Fields:
* `notificationId`
* `userId`
* `type`
* `title`
* `message`
* `relatedEntityId`
* `isRead`
* `createdAt`

### Certificates

Stores verification submissions.

Fields:
* `certificateId`
* `userId`
* `type`
* `documentUrl`
* `status`
* `reviewNotes`
* `submittedAt`
* `reviewedAt`

### SessionSummaries

Stores AI-generated summaries for sessions.

Fields:
* `summaryId`
* `roomId`
* `authorId`
* `summaryText`
* `keyLearnings`
* `actionItems`
* `nextGoals`
* `createdAt`

### QuizResults

Captures quiz performance and knowledge gap data.

Fields:
* `quizResultId`
* `userId`
* `topic`
* `score`
* `weakAreas`
* `strongAreas`
* `recommendedPartners`
* `createdAt`

## 2. Relationship Model

* Users create and own SwapRequests.
* Accepted SwapRequests generate LearningRooms.
* LearningRooms can have multiple Meetings and SessionSummaries.
* Ratings are linked to a specific user relationship and session context.
* MarketplacePosts are linked to user profiles and verification status.

## 3. Data Flow Notes

* On request acceptance, create a LearningRoom record and update both participant statuses.
* Store collaboration notes and task updates inside the LearningRoom for realtime access.
* Use Firestore collection listeners to drive live updates in the UI.
* Keep read-heavy query patterns optimized with denormalized summary fields such as user display name and avatar.

## 4. Security and Privacy Notes

* Protect all collections so users can only read/write data they own or are authorized to access.
* Limit access to verification documents only to admin reviewers.
* Avoid exposing unnecessary profile fields in public marketplace or match listings.
* Use strong authentication and Firestore rules to restrict data updates by role and entity ownership.

## 5. Implementation Notes

* Use Firestore indexing for search and filtering on skills, status, and dates.
* Create composite indexes for common query patterns like `SwapRequests` by receiverId and status.
* Consider storing skill tags in normalized subcollections if skill taxonomy expands in future releases.
