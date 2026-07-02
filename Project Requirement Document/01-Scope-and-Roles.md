# SkillSwap AI - Scope and User Roles

## 1. In Scope

The first release must include the following core functional areas:

* User authentication and account management
* Student profile creation and skill management
* AI skill matching engine
* Skill swap request workflow
* Learning rooms for collaboration
* Google Meet scheduling and meeting links
* AI-generated study plans and session summaries
* Marketplace for listing skill exchange offers
* Skill verification and peer ratings
* Notifications and real-time updates
* Admin dashboard with user and verification management
* Analytics tracking

## 2. Out of Scope (Version 1)

These features should be reserved for later phases to keep the MVP focused:

* Native mobile applications
* Payment systems and monetization
* Session video storage or full recording transcript archive
* Multi-language localization
* Corporate or enterprise training workflows

## 3. User Roles

### Student

Students are the primary users of SkillSwap AI. Their key permissions include:

* Register and log in via email or Google
* Create and update profile information
* Add skills offered and skills needed
* Search for and send swap requests
* Accept, reject, cancel, and manage swap requests
* Join learning rooms and participate in sessions
* Upload certificates and portfolio links
* Access AI-powered tools and study plans
* Rate peers after a skill exchange

### Admin

Admins manage platform safety, trust, and growth. Their permissions include:

* View and manage all user accounts
* Moderate skill listings and marketplace activity
* Approve or reject certificate verifications
* View platform analytics and reports
* Suspend or remove users when necessary

## 4. Implementation Notes

* Maintain clear role-based access control in the backend.
* Protect admin actions behind strong authorization checks.
* Provide students with clear guidance during onboarding and profile completion.
* Build the platform so roles can expand in future releases (mentor, moderator, organization).
