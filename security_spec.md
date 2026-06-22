# Security Specification - AI Portfolio Generator

## 1. Data Invariants
1. **User Ownership**: A user can only read and write their own `/users/{userId}` record. The `userId` path variable must match `request.auth.uid`.
2. **Portfolio Isolation**: Only the original creator of a portfolio can update, deploy, or delete it (the `userId` field inside `/portfolios/{portfolioId}` must match `request.auth.uid`). However, public portfolio profiles can be publicly read by anyone (unauthenticated/guest) so that the live portfolios can be rendered.
3. **Conversational Privacy**: Chat documents inside `/chats/{chatId}` are strictly private. Only the creator (`userId` matches the current session `auth.uid`) can create, read, or run updates.
4. **Suggestions Isolation**: Users can query, view, and dismiss/apply recommendations inside `/suggestions/{suggestionId}` that are addressed to them (`userId` matches `request.auth.uid`).
5. **System Timestamps**: All creation and modification timestamps must match `request.time`.
6. **Immutable Fields**: Fields representing critical identity like `userId` and `createdAt` cannot be altered once written.

---

## 2. The "Dirty Dozen" Payloads (Exploitations Blocked)

1. **Identity Spoofing in Profiles**: Try to write someone else's profile `users/foreign_uid` with a hijacked credential.
2. **Ghost Field Poisoning in User state**: Try to write custom properties like `isAdmin` or system parameters into the `/users/{userId}` profile document.
3. **Privilege Escalation on Portfolios**: Update portfolio content belonging to a victim `portfolios/victim_portfolio_123` by injecting your own session payload.
4. **Orphaned Portfolio Orphans**: Submitting profile records containing random invalid characters as ID params.
5. **Session Hijacking in Chats**: Read conversational summaries of another developer in `/chats/unauthorized_chat`.
6. **Admin Simulation in Suggestions**: Write arbitrary recommendation lists inside the suggestions deck without authentication.
7. **Bypassing Timestamp Validation**: Force custom older client-provided timestamps as `createdAt`/`updatedAt` values to forge streak counts or history logs.
8. **Shadow Fields on Code Generations**: Create a portfolio document containing malicious code structures or unauthorized parameter arrays.
9. **Null Auth Leak**: Attempt to retrieve portfolio detail lists with empty or anonymous authorization tokens if the operational path requires verification.
10. **Denial of Wallet Payload**: Inject a massive 1MB random string as a title/tagline field to exhaust the owner's billing threshold.
11. **Immutability Breach**: Modify the designated `userId` parameter of an existing portfolio document.
12. **Status Skipping**: Attempt to transition a portfolio deployment from `'idle'` straight to `'completed'` while bypassing the necessary intermediate active phases.

---

## 3. Security Test Scenarios (firestore.rules.test.ts)

Below is an abstract blueprint of the firestore rules test file. In production, these assertions run against local firebase emulators:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe("AI Portfolio Generator Security Rules Tests", () => {
  it("should block non-owners from editing user document", async () => {
    // Attempting to edit database collections with spoofed IDs
  });
  it("should prevent updating immutable fields inside portfolios", async () => {
    // Assert write rejection on modified userId key
  });
});
```
