# TriNexus | VitaGuard AI — Frontend Security Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Frontend Application Security & Client-Side Risk Assessment  
**Document ID:** `03_FRONTEND_SECURITY_AUDIT.md`  
**Evaluation Mode:** STATIC CODE ANALYSIS + BROWSER STORAGE & DEPENDENCY AUDIT  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **GOVERNANCE & AUDIT RESTRICTION NOTICE**  
> This frontend security audit evaluates client-side safeguards, browser storage practices, and dependency vulnerability profiles. Findings are strictly technical and defensive. No production frontend files or lockfiles have been modified.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Protected Route Implementation & Client-Side Bypass

### 1.1 Architecture of `ProtectedRoute.jsx`
- **Location:** [`frontend/src/components/ProtectedRoute.jsx`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/ProtectedRoute.jsx)
- **Source Code:**
  ```javascript
  function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    let userRole = localStorage.getItem('userRole');
    if (!userRole) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          userRole = parsed.role;
        }
      } catch (e) {
        userRole = null;
      }
    }
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && userRole && !allowedRoles.includes(userRole.toLowerCase())) {
      return <Navigate to={getDashboardPath(userRole)} replace />;
    }
    return children;
  }
  ```

### 1.2 Security Analysis & Client-Side Role Tampering
- **Finding (Finding ID: `FE-SEC-01`, Severity: LOW / ARCHITECTURAL):**  
  `ProtectedRoute.jsx` relies entirely on mutable browser storage (`localStorage.getItem('userRole')`).
- **Demonstration:**
  If an authenticated patient runs `localStorage.setItem('userRole', 'admin')` in browser DevTools and navigates to `/admin`, the client router renders the `AdminDashboard` component shell.
- **Defensive Boundary Integrity:**
  While the UI shell renders, all subsequent data fetching calls to `/api/admin/dashboard` require a valid JWT token signed by the server. Because the patient's JWT claims `role: "patient"`, the backend returns **HTTP 403 Forbidden**, preventing any actual data exposure or privilege escalation.
- **Conclusion:** Frontend route guards function correctly as navigation guidance, and backend server-side authorization reliably enforces the true security perimeter.

---

## 2. Cross-Site Scripting (XSS) & Dynamic Rendering Audit

### 2.1 Audit for Unsafe DOM Manipulation
A global search across all JSX/JS files in `frontend/src/` for `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, and `document.write()` was conducted:
- **Result:** Exactly one occurrence of `innerHTML` was found in [`frontend/src/components/GoogleAuthButton.jsx:34`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/GoogleAuthButton.jsx#L34):
  ```javascript
  if (hostRef.current) {
    hostRef.current.innerHTML = '';
  }
  ```
  This is a benign container reset prior to rendering Google Identity Services.
- **Zero Instances of `dangerouslySetInnerHTML`:** The entire frontend codebase relies on native React JSX `{expression}` data-binding. React automatically escapes HTML entities (e.g. `<` to `&lt;`), preventing Reflected and Stored XSS in text nodes.

### 2.2 Markdown & User-Generated Content
- The application does not use external Markdown parsers or HTML sanitizers for notice replies or appointment notes.
- Instead, the backend sanitizes strings via regex (`_plain` in `notices.py` and `appointments.py`), stripping HTML tags before persistence. The frontend renders them as plain React string children.

---

## 3. Browser Storage & Token Persistence Audit

### 3.1 Persistent Token Storage in `localStorage`
- **Location:** [`frontend/src/services/api.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/services/api.js#L7-L12)
- **Mechanism:**
  ```javascript
  API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```
- **Risk Assessment (Finding ID: `FE-SEC-02`, Severity: MEDIUM):**
  Storing authentication tokens in `localStorage` makes them accessible to any JavaScript running in the origin. If a third-party dependency compromise occurs, stored credentials can be extracted.
- **Remediation Recommendation:**
  Migrate to `httpOnly`, `Secure`, `SameSite=Strict` cookies for token storage, which prevents client-side script access entirely.

---

## 4. API Error Handling & Information Leakage

### 4.1 Error Interception & Presentation
- **Implementation:** [`frontend/src/services/api.js:getApiError`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/services/api.js#L18-L20)
  ```javascript
  export const getApiError = (err, defaultMsg = 'Something went wrong') => {
    return err.response?.data?.detail || defaultMsg;
  };
  ```
- **Leakage Analysis:**
  - The frontend gracefully extracts backend `detail` strings or presents a fallback message.
  - Server stack traces are not displayed in the UI.
  - However, because FastAPI returns validation error details (e.g., specific field limits and data type expectations), API error payloads reveal schema validation rules to the user.

---

## 5. Frontend Dependency Security Audit

An automated dependency vulnerability audit was conducted using `npm audit --json` against `frontend/package-lock.json`:

```
┌───────────────────┬──────────────┬──────────────┬──────────────────────────────┬──────────────────────────────────┐
│ Vulnerable Package│ Severity     │ Dependency   │ Advisory / CVE Reference     │ Vulnerability Description        │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────────────┤
│ `follow-redirects`│ **HIGH**     │ Indirect     │ GHSA-mrwp-f3q8-3g9p          │ Sensitive headers discarded;     │
│                   │              │ (via axios)  │ CVE-2024-28849               │ credentials follow redirects     │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────────────┤
│ `vite`            │ **HIGH**     │ Direct (dev) │ GHSA-587h-7wmj-h5pm          │ `launch-editor` arbitrary command│
│                   │              │              │ GHSA-4w7w-66w2-5vf9          │ execution on Windows             │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────────────┤
│ `esbuild`         │ **MODERATE** │ Indirect     │ GHSA-67mh-4wv8-2f99          │ Dev server request interception  │
│                   │              │ (via vite)   │ CWE-346                      │ and response leakage             │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────────────┤
│ `react-router`    │ **MODERATE** │ Indirect     │ GHSA-wrjc-x8rr-h8h6          │ Open redirect via backslash in   │
│                   │              │ (via dom)    │ GHSA-337j-9hxr-rhxg          │ `<Link>` and constructor inject  │
├───────────────────┼──────────────┼──────────────┼──────────────────────────────┼──────────────────────────────────┤
│ `react-router-dom`│ **MODERATE** │ Direct (prod)│ (inherited from react-router)│ Router traversal vulnerabilities │
└───────────────────┴──────────────┴──────────────┴──────────────────────────────┴──────────────────────────────────┘
```

### Dependency Audit Summary:
- **Total Vulnerabilities:** 5 (2 High, 3 Moderate, 0 Critical).
- **Production Impact:** `follow-redirects` (via `axios 1.6.8`) and `react-router-dom 6.23.1` impact the production client bundle. `vite` and `esbuild` impact the development and build pipeline only.
- **Rule Enforcement:** Under the execution constraints of this audit, package manifests and lockfiles have **not** been modified. Dependency upgrades must be scheduled as a controlled engineering maintenance task.
