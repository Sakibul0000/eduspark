# EduSpark AI — Firestore Security Specification

## 1. Data Invariants
1. **Profile Isolation**: A student's `users/{userId}` document contains PII (`email`, `fullName`) and may only be read, created, or updated by the verified owner (`request.auth.uid == userId && request.auth.token.email_verified == true`).
2. **Enrollment Ownership**: An `enrollments/{enrollmentId}` document must have `userId == request.auth.uid`, valid `courseId`, and server timestamps (`enrolledAt == request.time`, `lastAccessedAt == request.time`) on creation.
3. **Quiz Attempt Integrity**: A `quizAttempts/{attemptId}` document is immutable once submitted (no updates), must have `userId == request.auth.uid`, bounded `score <= totalQuestions`, `0 <= percentage <= 100`, and `createdAt == request.time`.
4. **Learning Progress Ownership**: A `learningProgress/{progressId}` document must belong to `request.auth.uid`, enforce bounded `completedLessonIds` (`<= 50`) and `activityDates` (`<= 365`), `0 <= progressPercent <= 100`, and `updatedAt == request.time`.
5. **Chat History Privacy**: `chatHistory/{messageId}` documents are strictly private to `userId == request.auth.uid` and immutable after creation (only create, read, or delete).
6. **Settings Privacy**: `userSettings/{userId}` may only be accessed by `request.auth.uid == userId`, with validated `theme` enum (`light` or `dark`) and bounded `dailyGoalMinutes` (`5..480`).
7. **Catalog Read-Only**: `courses`, `lessons`, and `quizQuestions` are readable by users and locked against client-side tampering (`allow write: if false`).
8. **Strict Key & Size Guards**: Every document write validates `hasAll` + `hasOnly`, string `.size()` bounds, ID regex `^[a-zA-Z0-9_-]+$`, and `affectedKeys().hasOnly(...)` on every update.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Read of Private Profile**: `GET /users/user_abc` without auth -> `PERMISSION_DENIED`.
2. **Cross-User Profile Read (PII Leak)**: `GET /users/victim_uid` as `attacker_uid` -> `PERMISSION_DENIED`.
3. **Unverified Email Spoof Write**: `CREATE /users/user_abc` with `email_verified: false` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Profile**: `CREATE /users/user_abc` with extra field `isAdmin: true` -> `PERMISSION_DENIED`.
5. **Cross-User Enrollment Spoofing**: `CREATE /enrollments/victim_course1` with `userId: "victim"` while signed in as `attacker` -> `PERMISSION_DENIED`.
6. **Client-Forged Timestamp**: `CREATE /enrollments/att_course1` with `enrolledAt: Timestamp(2020-01-01)` != `request.time` -> `PERMISSION_DENIED`.
7. **Unbounded List Scraping**: `LIST /enrollments` without `where("userId", "==", auth.uid)` -> `PERMISSION_DENIED`.
8. **ID Poisoning Attack**: `CREATE /quizAttempts/<200-char-invalid-id!@#>` -> `PERMISSION_DENIED`.
9. **Score Tampering / Update After Terminal Quiz Submission**: `UPDATE /quizAttempts/attempt1` changing `percentage: 100` -> `PERMISSION_DENIED`.
10. **Immutable Field Mutation on Progress**: `UPDATE /learningProgress/prog1` attempting to change `userId` or `courseId` -> `PERMISSION_DENIED`.
11. **Value Poisoning on Settings**: `UPDATE /userSettings/user1` setting `theme: "neon-hacker"` or `dailyGoalMinutes: 99999` -> `PERMISSION_DENIED`.
12. **Catalog Tampering**: `UPDATE /courses/course_ml` from a client SDK -> `PERMISSION_DENIED`.
