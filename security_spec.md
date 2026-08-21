# Security Specification

This document outlines the security invariants, malicious payloads, and rules for the B2BR Order Collector Firebase integration.

## Data Invariants

1. **Seller Credentials**:
   - Each document ID must be a valid, normalized email address.
   - The password hash must be a mathematically valid SHA-512 hex string of exactly 128 characters.
   - The salt must be a valid 16-byte hex string of exactly 32 characters.
   - The record must have exactly `hash`, `salt`, and `updatedAt` on creation.

2. **Email Verification Codes**:
   - Each document ID must match the `email` field inside the document.
   - The verification `code` must be a 6-digit numeric string.
   - The `verified` field must be a boolean.
   - Updates to verification codes can only modify `verified` and `verifiedAt`.

---

## The "Dirty Dozen" Payloads

Here are 12 malicious payloads designed to violate identity, integrity, and state, which must be blocked by the security rules:

1. **Credential Over-injection (Shadow Fields)**:
   ```json
   {
     "hash": "a".repeat(128),
     "salt": "b".repeat(32),
     "updatedAt": "2026-07-22T10:44:18Z",
     "isAdmin": true
   }
   ```
2. **Short Hash Injection**:
   ```json
   {
     "hash": "abc",
     "salt": "b".repeat(32),
     "updatedAt": "2026-07-22T10:44:18Z"
   }
   ```
3. **Long Salt Injection**:
   ```json
   {
     "hash": "a".repeat(128),
     "salt": "b".repeat(64),
     "updatedAt": "2026-07-22T10:44:18Z"
   }
   ```
4. **Invalid DataType for Salt**:
   ```json
   {
     "hash": "a".repeat(128),
     "salt": 1234567890,
     "updatedAt": "2026-07-22T10:44:18Z"
   }
   ```
5. **Wrong Verification Code Format**:
   ```json
   {
     "email": "user@example.com",
     "code": "1234567",
     "expiresAt": "2026-07-22T10:54:18Z",
     "verified": false,
     "createdAt": "2026-07-22T10:44:18Z"
   }
   ```
6. **Wrong Email Format inside OTP Document**:
   ```json
   {
     "email": "not-an-email",
     "code": "123456",
     "expiresAt": "2026-07-22T10:54:18Z",
     "verified": false,
     "createdAt": "2026-07-22T10:44:18Z"
   }
   ```
7. **Bypassing Verification (Pre-verifying OTP)**:
   ```json
   {
     "email": "user@example.com",
     "code": "123456",
     "expiresAt": "2026-07-22T10:54:18Z",
     "verified": true,
     "createdAt": "2026-07-22T10:44:18Z"
   }
   ```
8. **Shadow Field in OTP Document**:
   ```json
   {
     "email": "user@example.com",
     "code": "123456",
     "expiresAt": "2026-07-22T10:54:18Z",
     "verified": false,
     "createdAt": "2026-07-22T10:44:18Z",
     "bypass": true
   }
   ```
9. **Tampering with verification code during validation update**:
   ```json
   {
     "email": "user@example.com",
     "code": "999999",
     "expiresAt": "2026-07-22T10:54:18Z",
     "verified": true,
     "createdAt": "2026-07-22T10:44:18Z"
   }
   ```
10. **Wrong Data Type for Verified Flag**:
    ```json
    {
      "email": "user@example.com",
      "code": "123456",
      "expiresAt": "2026-07-22T10:54:18Z",
      "verified": "yes",
      "createdAt": "2026-07-22T10:44:18Z"
    }
    ```
11. **Huge ID Poisoning Attack**:
    Document ID: `a.repeat(200) + "@example.com"` (should be rejected by `isValidId()` limits).
12. **Null/Missing Required Fields in Credentials**:
    ```json
    {
      "hash": "a".repeat(128),
      "updatedAt": "2026-07-22T10:44:18Z"
    }
    ```

---

## The Test Runner

A simulation of rules checks to ensure these cases return `PERMISSION_DENIED`.
