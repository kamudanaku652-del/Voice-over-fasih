# Security Specification - Alan Voice Pro

## 1. Data Invariants
- A user can only read and write their own profile by default.
- Only an Admin can change a user's `subscriptionTier`.
- No user (including admins) can update their own `role`. Roles are immutable or set by the system/owner.
- `createdAt` is immutable.
- `subscriptionTier` is limited to 'free' or 'premium'.

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **Self-Upgrade**: User attempts to set `subscriptionTier: 'premium'` on their own document. (Expected: DENIED)
2. **Identity Spoofing**: User A attempts to read User B's profile. (Expected: DENIED)
3. **Admin Escalation**: User attempts to set `role: 'admin'` on their own document. (Expected: DENIED)
4. **Field Poisoning**: User attempts to update with a 1MB string in `email`. (Expected: DENIED)
5. **Orphaned Write**: Attempting to create a user profile without a UID. (Expected: DENIED)
6. **Immutable Breach**: Attempting to change `createdAt`. (Expected: DENIED)
7. **Cross-Tenant List**: Authenticated user attempts `list` on `/users` collection without filtering. (Expected: DENIED)
8. **Admin Abuse (Self)**: Admin tries to change their own role to something else. (Expected: DENIED)
9. **Role Injection**: Adding a field `owner: true` to bypass checks. (Expected: DENIED)
10. **State Shortcut**: Setting `subscriptionTier` without following payment flow (handled by server/admin panel).
11. **ID Injection**: Using a dangerous string as document ID. (Expected: DENIED)
12. **Type Confusion**: Setting `role: true` instead of a string. (Expected: DENIED)
