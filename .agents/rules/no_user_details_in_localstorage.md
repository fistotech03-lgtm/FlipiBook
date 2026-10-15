# Rule: Do Not Expose User Details in Local Storage

## Policy Statement
Never store, retrieve, or expose sensitive user details (such as user credentials, emails, user IDs, profile data, or authentication tokens) in `localStorage` or `sessionStorage`.

## Architectural Requirements
1. **HttpOnly Cookies for Auth & User Context:**
   - User authentication state and session identification must be managed exclusively through secure, `HttpOnly` cookies handled by the backend (`flipibook_token`, session cookies).
   - The frontend must never save JWTs, bearer tokens, or user IDs into client-side storage.

2. **In-Memory State Management:**
   - Authenticated user data (`emailId`, `name`, `user_id`, permissions) must only be maintained in in-memory state (Redux store via `authSlice` / `useAuth()`).
   - On page refresh or new tabs, the client validates the session by calling `/api/auth/verify` with `{ withCredentials: true }` and re-populates memory.

3. **Backend Authority on User Identity:**
   - Endpoints requiring user context must derive the user from the verified session/cookie on the server, not from client-supplied IDs or localStorage payloads.

4. **Prohibited Patterns:**
   - Prohibited: `localStorage.setItem('user', JSON.stringify(user))`
   - Prohibited: `localStorage.setItem('user_profile', ...)`
   - Prohibited: `localStorage.getItem('user')`
   - Allowed in localStorage: UI layout preferences (e.g. `isRulerEnabled`, `isTrimViewEnabled`, `last_active_folder`).
