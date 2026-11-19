# TriNexus | VitaGuard AI — Backend Security Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Backend Application Security & Cryptographic Auditing  
**Document ID:** `02_BACKEND_SECURITY_AUDIT.md`  
**Evaluation Mode:** STATIC SOURCE CODE AUDIT + ISOLATED EXPLOIT REPRODUCTION  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **CONFIRMED SECURITY VULNERABILITIES IDENTIFIED**  
> This security assessment identifies **two (2) critical vulnerabilities** (hardcoded JWT secret enabling authentication bypass, and an admin TOTP null-secret bypass flaw), **one (1) high-severity security misconfiguration** (wildcard CORS with credentials), and **multiple medium-severity findings** (lack of rate limiting, missing token revocation, and plaintext password fallback).  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Authentication Infrastructure Audit

### 1.1 Password Hashing & Insecure Plaintext Fallback
- **Implementation Location:** [`backend/app/auth.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/auth.py#L31-L42)
- **Hashing Function:**
  ```python
  def get_password_hash(password: str) -> str:
      salt = bcrypt.gensalt()
      return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
  ```
  Uses standard bcrypt with random salt generation. Validated as modern and sound.
- **Verification Function Defect:**
  ```python
  def verify_password(plain_password: str, hashed_password: str) -> bool:
      if not hashed_password or not plain_password:
          return False
      try:
          return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
      except Exception:
          return plain_password == hashed_password
  ```
  > [!WARNING]
  > **Defect (Finding ID: `AUTH-DEF-01`, Severity: MEDIUM):**  
  > The `except Exception:` block falls back to a **direct plaintext comparison** (`return plain_password == hashed_password`). If a corrupted hash, malformed salt, or legacy unhashed string is stored in the database, the system validates plaintext passwords without error or upgrade.
  > **Remediation:** Remove the fallback. If `bcrypt.checkpw` raises an exception, return `False` and log the security error.

---

### 1.2 Static Hardcoded JWT Secret Key (CRITICAL VULNERABILITY)
- **Implementation Location:** [`backend/app/auth.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/auth.py#L12)
- **Source Code Evidence:**
  ```python
  SECRET_KEY = "vitaguard-ai-super-secret-key-2026"
  ALGORITHM = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
  ```
- **Vulnerability Reproduction (Test ID: `SEC-01`):**
  Because the signing key is hardcoded directly in public source code and backup archives, an attacker can generate offline arbitrary HMAC-SHA256 signatures. In test `SEC-01`, a forged token was constructed:
  ```python
  forged_payload = {
      "sub": str(admin_id),
      "username": "testadmin1",
      "role": "admin",
      "exp": datetime.utcnow() + timedelta(hours=1)
  }
  forged_token = jwt.encode(forged_payload, "vitaguard-ai-super-secret-key-2026", algorithm="HS256")
  ```
  When transmitted to [`backend/app/auth.py:get_current_user`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/auth.py#L48-L76), the forged token was validated as completely legitimate, granting instantaneous and total administrator access to `/api/admin/dashboard` without knowing the user's password or presenting a TOTP authenticator code.
- **Severity:** **CRITICAL** (Finding ID: `VULN-CRIT-01`)
- **Remediation:** Read the secret from a cryptographically random environment variable (`os.getenv("SECRET_KEY")`), refuse server startup if the variable is missing or shorter than 32 bytes, and invalidate existing tokens.

---

### 1.3 Token Lifecycle, Expiration & Revocation Gaps
1. **Prolonged Expiration:** `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24` (24 hours). A compromised token remains valid for a full day.
2. **Missing Token Revocation / Blacklist:** The backend provides no `/auth/logout` endpoint. When a user clicks "Sign Out" in the frontend, the client merely removes the token from `localStorage`. The token remains cryptographically valid on the server until expiration.
3. **No Refresh Token Mechanism:** Single-token architecture without short-lived access tokens and revocable refresh tokens.

---

## 2. Admin Two-Factor Authentication (TOTP) Audit

### 2.1 Implementation Mechanics
- **Location:** [`backend/app/routes/auth.py:login_user`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/auth.py#L246-L258)
- **Algorithm:** TOTP (RFC 6238) using `pyotp.TOTP` with `valid_window=1` (allows $\pm 30$ seconds, yielding a 90-second acceptance window).

### 2.2 Admin TOTP Null Secret Bypass (CRITICAL VULNERABILITY)
- **Vulnerable Code:**
  ```python
  if user.role and user.role.lower() == "admin":
      auth_code = payload.authenticator_code or payload.totp_code
      if not auth_code:
          raise HTTPException(
              status_code=status.HTTP_401_UNAUTHORIZED,
              detail="Authenticator code required for administrator",
          )
      if user.totp_secret:
          totp = pyotp.TOTP(user.totp_secret)
          if not totp.verify(str(auth_code).strip(), valid_window=1):
              add_audit(db, user.id, "LOGIN_FAILED", "Invalid TOTP code")
              raise HTTPException(...)
  ```
- **Vulnerability Reproduction (Test ID: `SEC-02`):**
  If an administrator account is created in the database where `totp_secret` is `NULL` or empty (e.g. through external seeding, database migration, or partial account provisioning), the outer `if not auth_code:` check requires only that *some* string is provided. When the user passes an arbitrary string such as `"123456"`, the inner check `if user.totp_secret:` evaluates to **`False`**. The verification step is completely bypassed, and the user is authenticated as an administrator!
- **Severity:** **CRITICAL** (Finding ID: `VULN-CRIT-02`)
- **Remediation:** If `user.role == "admin"`, strictly require that `user.totp_secret` is non-empty. If it is null, abort login immediately with HTTP 403 Forbidden.

### 2.3 Replay Attacks & Lack of Rate Limiting
- **Replay Window:** Because `valid_window=1` is used without recording used token timestamps, any valid 6-digit OTP can be replayed multiple times within the 90-second window.
- **Brute-Force Vulnerability:** No rate-limiting middleware (such as `slowapi`) is implemented on `/api/auth/login`. An automated script can perform hundreds of login attempts per second against the 6-digit OTP space.

---

## 3. Role-Based Access Control (RBAC) Verification

The following empirical matrix was verified during test execution:

```
┌─────────────────────────────────┬───────────┬─────────────┬─────────────┬─────────────┐
│ Endpoint Category               │ Guest     │ Patient     │ Doctor      │ Admin       │
├─────────────────────────────────┼───────────┼─────────────┼─────────────┼─────────────┤
│ Public Screening (DiaBD / CVD)  │ ALLOW     │ ALLOW       │ ALLOW       │ ALLOW       │
│ Pima Research Model (/predict)  │ 403 BLOCK │ 403 BLOCK   │ 403 BLOCK   │ 200 ALLOW   │
│ Patient Dashboard               │ 401 BLOCK │ 200 (Own)   │ 401/403     │ 401/403     │
│ Doctor Appointments             │ 401 BLOCK │ 403 BLOCK   │ 200 ALLOW   │ 403 BLOCK   │
│ Doctor Records Global Directory │ 401 BLOCK │ 403 BLOCK   │ 200 (ALL!)* │ 200 (ALL)   │
│ Admin Dashboard                 │ 401 BLOCK │ 403 BLOCK   │ 403 BLOCK   │ 200 ALLOW   │
│ Toggle User Status              │ 401 BLOCK │ 403 BLOCK   │ 403 BLOCK   │ 200 ALLOW   │
└─────────────────────────────────┴───────────┴─────────────┴─────────────┴─────────────┘
```
*\*Identified as a major privacy defect (Finding ID: `PRIV-01`).*

### Key RBAC Findings:
1. **Server-Side Enforcement:** RBAC is properly enforced server-side via Python dependencies (`get_current_user`, role checks). Tampering with client-side `localStorage.getItem('userRole')` allows viewing the React UI layout but all API calls to protected endpoints fail with 401/403.
2. **Pima Containment Verified:** Pima model is strictly gated: Guest, Patient, and Doctor receive HTTP 403 Forbidden (`PIMA-01` to `PIMA-03`). Only Admin audit access is permitted (`PIMA-04`).

---

## 4. Insecure CORS Configuration (HIGH SEVERITY)

### 4.1 Implementation Defect
- **Location:** [`backend/app/main.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/main.py#L30-L36)
- **Source Code Evidence:**
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Vulnerability Analysis (Test ID: `SEC-03`):**
  Pairing `allow_origins=["*"]` with `allow_credentials=True` is an invalid and insecure CORS configuration:
  - In modern browsers, W3C Fetch standards prohibit `Access-Control-Allow-Origin: *` when credentials mode is `include`.
  - In Starlette/FastAPI, this configuration either emits runtime warnings or permits reflection of the `Origin` header, exposing authenticated endpoints to cross-origin requests from arbitrary third-party origins.
- **Severity:** **HIGH** (Finding ID: `VULN-HIGH-01`)
- **Remediation:** Replace `allow_origins=["*"]` with an explicit whitelist of trusted origins read from the environment (e.g. `["http://localhost:5173", "https://vitaguard.ai"]`).

---

## 5. Security Headers & API Exposure

1. **Missing Security Headers:** The backend application does not inject defensive HTTP headers. Inspection of responses revealed the complete absence of:
   - `Content-Security-Policy` (CSP)
   - `Strict-Transport-Security` (HSTS)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
2. **OpenAPI Documentation Exposure:**
   - Swagger UI (`/docs`) and ReDoc (`/redoc`) are enabled in production mode without authentication.
   - Endpoint schema definitions and internal parameter names are publicly discoverable.
