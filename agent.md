# AGENTS.md

## Project Engineering Instructions

### Primary Goal

The primary goal of this project is to build an application that is:

* Efficient
* Performant
* Scalable
* Maintainable
* Secure
* Lightweight
* Easy to understand and extend

**Performance and simplicity should be considered before adding new code, dependencies, or architecture.**

Before implementing a feature, inspect the existing project structure and follow the established patterns.

---

# 1. Application Performance First

Always prioritize application performance.

Before implementing any feature, consider:

* Initial page load
* JavaScript bundle size
* API response size
* Database query performance
* Number of API requests
* Rendering performance
* Repeated requests
* Unnecessary state updates
* Memory usage
* Network usage

Do not introduce unnecessary abstractions, libraries, API calls, or state.

Prefer the simplest implementation that satisfies the requirement efficiently.

---

# 2. React Query for Server-State Management

Use **React Query / TanStack Query** for server-side data.

React Query should handle:

* API requests
* Caching
* Refetching
* Request deduplication
* Loading states
* Error states
* Cache invalidation
* Background updates

Do not unnecessarily store API/server data in Redux.

Example:

```text
Backend API
     ↓
TanStack Query
     ↓
Cache
     ↓
React Components
```

Use appropriate:

* `staleTime`
* `gcTime`
* query keys
* mutations
* invalidation

Avoid refetching data that is already available and valid in the cache.

---

# 3. Lazy Loading

Use lazy loading wherever it improves the application's loading performance.

Consider lazy loading for:

* Routes
* Large components
* Heavy libraries
* Modals
* Charts
* Editors
* Large feature modules
* Images
* Non-critical UI

Do not load large resources during the initial page load if they are not immediately required.

Use code splitting where appropriate.

Example:

```jsx
const Reports = lazy(() => import("./Reports"));
```

The goal is to keep the initial JavaScript payload as small as reasonably possible.

---

# 4. Redux for Centralized Client State

Use Redux / Redux Toolkit for **global client-side state that genuinely needs centralized management**.

Do not put everything into Redux.

Store only required data.

Good candidates:

```text
Authentication UI state
Global UI state
Application settings
Selected application state
Cross-feature client state
```

Avoid storing:

```text
Large API responses
Duplicate server data
Temporary component state
Form state that belongs to one component
Data already managed by React Query
```

Prefer local React state when the state is only required by one component.

Use Redux Toolkit rather than the legacy Redux pattern.

---

# 5. Lightweight API Requests

Every backend request should send the minimum data required to perform the operation.

Avoid:

* Sending unused fields
* Sending duplicate data
* Sending complete objects when only an ID/reference is required
* Sending unnecessary nested objects
* Returning unused fields from APIs

Prefer:

```json
{
  "name": "Product A"
}
```

instead of:

```json
{
  "id": "123",
  "name": "Product A",
  "description": "...",
  "createdAt": "...",
  "updatedAt": "...",
  "createdBy": "...",
  "metadata": {},
  "otherUnusedData": {}
}
```

API responses should also be lightweight.

Only return fields required by the consuming feature.

---

# 6. API Performance Target

Backend requests should be designed to complete within approximately **100 ms under normal expected conditions** whenever practical.

This is a performance target, not a reason to sacrifice correctness, security, or reliability.

When an API is slower than expected, investigate:

1. Database queries
2. Missing indexes
3. Unnecessary joins/population
4. Large response payloads
5. Repeated database calls
6. External API calls
7. Unnecessary processing
8. N+1 queries
9. Serialization overhead
10. Network latency

Do not artificially force a request below 100 ms at the expense of correctness.

---

# 7. Prefer O(1) Operations Where Appropriate

When designing algorithms and data access, prefer **O(1)** operations where realistically possible.

Avoid unnecessary:

```text
O(n²)
O(n³)
```

operations.

For example, avoid repeatedly searching an array:

```js
users.find(...)
```

inside another loop when a lookup structure can be created.

Prefer:

```js
const userMap = new Map(
  users.map(user => [user.id, user])
);
```

Then:

```js
userMap.get(id);
```

However, do not force O(1) complexity when it makes the code unnecessarily complex.

Choose the simplest efficient algorithm appropriate for the actual data size.

---

# 8. User Identity Must Not Be Managed Through Frontend IDs

Do not expose or depend on a user ID stored in frontend state, localStorage, sessionStorage, Redux, or URL parameters for authentication/identity purposes.

The frontend should not send:

```json
{
  "userId": "123"
}
```

just to identify the authenticated user.

The backend should determine the authenticated user from the secure authentication mechanism.

Preferred flow:

```text
Browser
   ↓
HttpOnly Secure Cookie
   ↓
Backend
   ↓
Authentication middleware
   ↓
Authenticated user context
   ↓
Controller / Service
```

The backend should derive the user identity from the authenticated session/token.

Never trust a client-provided user ID for authorization.

---

# 9. Authentication – RS256 + Access/Refresh Tokens

Use **RS256 (RSA + SHA-256)** for JWT signing when JWT-based asymmetric authentication is required.

Use:

```text
Private Key
    ↓
Authentication Service
    ↓
Signs JWT
```

and:

```text
Public Key
    ↓
Other Services
    ↓
Verify JWT
```

Do not distribute the private key to other services unnecessarily.

Use an access-token and refresh-token architecture.

General flow:

```text
Login
  ↓
Authentication Service
  ↓
Access Token + Refresh Token
  ↓
Secure HttpOnly Cookies
  ↓
Browser
```

Access token:

* Short-lived
* Used for authenticated API requests

Refresh token:

* Longer-lived
* Used to obtain a new access token
* Must be securely stored
* Should support rotation/revocation where appropriate

Cookies should use appropriate security attributes such as:

```text
HttpOnly
Secure
SameSite
```

Never store sensitive authentication tokens in:

```text
localStorage
sessionStorage
```

unless there is a specific architectural reason and the associated security risks are understood.

Authentication and authorization must always be enforced by the backend.

---

# 10. Minimize Boilerplate

Avoid unnecessary boilerplate.

Prefer:

* Reusable utilities
* Shared components
* Reusable hooks
* Redux Toolkit
* React Query
* Common API clients
* Shared validation
* Common middleware

Do not create abstractions just because code can technically be abstracted.

Use abstraction when it improves:

* Reusability
* Maintainability
* Consistency
* Testability

Avoid excessive abstraction.

---

# 11. File Structure

Maintain a clean and predictable file structure.

Before creating a new file:

1. Inspect the existing directory structure.
2. Check whether a suitable existing file already exists.
3. Follow the project's existing architectural pattern.
4. Avoid creating duplicate utilities/components/services.

Use meaningful filenames.

Good:

```text
user.service.ts
auth.middleware.ts
product.controller.ts
product.repository.ts
useProducts.ts
ProductCard.tsx
```

Avoid:

```text
helper2.ts
temp.ts
commonNew.ts
testFinal.ts
dataNew.ts
```

File names should clearly describe their responsibility.

---

# 12. Follow Existing Architecture

**Always analyse the existing files before implementing changes.**

Do not introduce a completely different pattern without understanding the current architecture.

Before modifying a feature:

```text
1. Inspect related components
2. Inspect existing hooks
3. Inspect API/service layer
4. Inspect Redux state
5. Inspect React Query usage
6. Inspect backend routes/controllers/services
7. Inspect database models
8. Follow existing conventions
```

When a suitable pattern already exists, reuse it.

The new implementation should feel like it belongs to the existing project.

---

# 13. Responsive Frontend Design

Use viewport-aware responsive sizing where appropriate.

Prefer responsive CSS units such as:

```css
vw
vh
dvw
dvh
svh
lvh
```

when sizing UI elements relative to the viewport.

For example:

```css
min-height: 100dvh;
width: 100vw;
```

However, do not blindly use `vw`/`vh` for every element.

Use appropriate units depending on the UI:

```text
px      → borders, icons, small fixed dimensions
rem     → typography and spacing
%       → container-relative sizing
vw/vh   → viewport-relative layouts
dvh     → mobile viewport height
```

The UI must remain responsive across:

* Desktop
* Laptop
* Tablet
* Mobile

Avoid hard-coded dimensions that cause overflow or poor responsive behavior.

---

# 14. Database Performance

Database access must also follow the performance-first approach.

Before adding a query:

* Check whether an index is required.
* Return only required fields.
* Avoid unnecessary population/joins.
* Avoid N+1 queries.
* Avoid fetching entire collections when pagination/filtering is possible.
* Use pagination for large datasets.
* Use projections/selectors to reduce payload size.

Example:

Prefer:

```js
User.find(
  { status: "active" },
  { name: 1, email: 1 }
);
```

over fetching unnecessary fields.

---

# 15. Avoid Duplicate API Calls

Before creating an API request, check whether the required data already exists in:

* React Query cache
* Redux state
* Component state
* Server-provided data

Do not make multiple identical requests unnecessarily.

Use React Query's caching and request deduplication capabilities.

---

# 16. Frontend State Rules

Use the appropriate state management tool for each type of state.

```text
Component State
      ↓
Local UI state

React Query
      ↓
Server/API state

Redux
      ↓
Global client state

URL
      ↓
Shareable navigation/filter state
```

Do not use Redux as a replacement for React Query.

Do not use React Query as a replacement for every type of client state.

---

# 17. Code Quality

Code should be:

* Simple
* Readable
* Reusable
* Efficient
* Testable
* Consistent

Avoid:

* Dead code
* Duplicate code
* Unused imports
* Unused variables
* Unnecessary dependencies
* Deeply nested logic
* Extremely large components
* Extremely large functions
* Magic values without explanation

Prefer small, focused functions and components.

---

# 18. Before Writing Code

Before implementing a feature, follow this process:

```text
Understand requirement
        ↓
Inspect existing project
        ↓
Find similar implementation
        ↓
Understand data flow
        ↓
Identify performance implications
        ↓
Choose the simplest architecture
        ↓
Implement
        ↓
Check API payloads
        ↓
Check rendering performance
        ↓
Check unnecessary requests
        ↓
Check responsive behavior
        ↓
Test
```

Do not immediately start creating new files without understanding the existing implementation.

---

# 19. Enterprise-Grade Architecture

The application should be designed with **enterprise-level quality, security, scalability, maintainability, and observability** in mind.

Enterprise standard does **not** mean adding complexity unnecessarily.

Every architectural decision should have a clear reason and should support one or more of:

* Scalability
* Security
* Reliability
* Maintainability
* Independent deployment
* Performance
* Fault isolation
* Observability
* Team ownership
* Future extensibility

---

## 19.1 Microservices

Use a **microservice architecture when the application's domain and scale justify it**.

Services should have clear responsibilities and boundaries.

For example:

```text
                    API Gateway
                         |
          +--------------+--------------+
          |              |              |
     Auth Service   User Service   Product Service
          |              |              |
       Database       Database       Database
```

A service should ideally:

* Have a clearly defined responsibility.
* Own its business logic.
* Minimize coupling with other services.
* Be independently deployable.
* Communicate through well-defined APIs/events.
* Avoid directly accessing another service's database.
* Have appropriate authentication and authorization.
* Have independent logging and monitoring.

Do not split every small feature into a separate service.

Prefer **domain-based service boundaries** rather than creating services based only on individual CRUD operations.

Example:

```text
Good:

Auth Service
Product Service
Order Service
Payment Service
Notification Service

Avoid:

CreateUser Service
GetUser Service
UpdateUser Service
DeleteUser Service
```

If the application is still small, a **modular monolith** may be used initially while keeping clear domain boundaries so individual modules can later be extracted into services.

---

## 19.2 API Gateway

For multiple backend services, prefer a centralized API entry point.

```text
                    Client
                       |
                       ↓
                  API Gateway
                       |
          +------------+------------+
          ↓            ↓            ↓
       Auth API     User API     Product API
```

The gateway can handle common concerns such as:

* Authentication
* Authorization
* Rate limiting
* Request validation
* Routing
* CORS
* Request logging
* Correlation IDs
* Response handling

Do not duplicate gateway responsibilities unnecessarily inside every service.

Each service must still validate authorization for resources it owns.

---

## 19.3 Service-to-Service Authentication

Internal service communication must not automatically be considered trusted.

Use authenticated and authorized communication between services.

For JWT-based architectures:

```text
Auth Service
     |
     | signs
     ↓
RS256 Access Token
     |
     ↓
API Gateway / Service
     |
     | verifies using public key
     ↓
Authorized Request
```

Use asymmetric signing such as **RS256** when appropriate so services can verify tokens without possessing the private signing key.

---

## 19.4 Database Ownership

Each microservice should own its data.

Preferred:

```text
Auth Service
     ↓
Auth Database

Product Service
     ↓
Product Database

Order Service
     ↓
Order Database
```

Avoid:

```text
Auth Service ──┐
Product Service ─┼──→ Same database tables
Order Service ──┘
```

Services should communicate through APIs or events instead of directly modifying another service's database.

---

## 19.5 Event-Driven Communication

Use asynchronous events when operations do not need an immediate response.

Example:

```text
Order Service
      |
      | OrderCreated
      ↓
 Message Broker
      |
      +------→ Notification Service
      |
      +------→ Inventory Service
      |
      +------→ Analytics Service
```

Possible technologies can include:

* RabbitMQ
* Kafka
* Redis Streams
* Cloud messaging services

Do not introduce a message broker simply because the architecture is called "enterprise."

Use it when asynchronous processing, decoupling, reliability, or event-driven workflows provide a real benefit.

---

## 19.6 Observability

Enterprise applications must be observable.

Implement:

### Logging

Use structured logs.

```json
{
  "level": "info",
  "service": "order-service",
  "requestId": "req_123",
  "event": "order_created"
}
```

Avoid relying only on:

```js
console.log("something happened");
```

### Metrics

Monitor important metrics such as:

* API response time
* Error rate
* Request count
* Database latency
* CPU usage
* Memory usage
* Queue length

### Distributed Tracing

For multiple services, use request/correlation IDs.

```text
Client
  ↓ requestId: abc123
Gateway
  ↓ abc123
Order Service
  ↓ abc123
Payment Service
  ↓ abc123
Database
```

This makes debugging distributed requests easier.

---

## 19.7 Error Handling

Use consistent API error responses.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product not found"
  },
  "requestId": "req_123"
}
```

Do not expose:

* Stack traces
* Database errors
* Internal service details
* Secrets
* Private implementation details

to the frontend in production.

---

## 19.8 Validation

Validate data at system boundaries.

```text
Client
   ↓
API Gateway
   ↓
Service Validation
   ↓
Business Logic
   ↓
Database
```

Never rely only on frontend validation.

Frontend validation improves user experience.

Backend validation provides security and correctness.

---

## 19.9 Security by Default

Security should be part of the architecture rather than added later.

Follow:

* HTTPS
* Secure HttpOnly cookies
* Appropriate SameSite policy
* Access/refresh token separation
* RS256 where appropriate
* Input validation
* Authorization checks
* Rate limiting
* Secure headers
* Secret management
* Password hashing
* Least-privilege access
* Database access controls

Never trust values coming from the client.

---

## 19.10 Configuration and Secrets

Never hard-code:

```text
Passwords
API keys
JWT private keys
Database credentials
SMTP credentials
Third-party secrets
```

Use environment variables or a proper secret-management system.

Example:

```text
.env
Secret Manager
Vercel Environment Variables
Cloud Secret Manager
Vault
```

Private keys must never be committed to Git.

---

## 19.11 Dependency Management

Do not add a dependency unless it provides meaningful value.

Before adding a library:

1. Check whether the functionality already exists.
2. Check whether the project already uses an equivalent library.
3. Consider bundle size.
4. Consider security.
5. Consider maintenance status.
6. Consider long-term compatibility.

Prefer established libraries over creating unnecessary custom implementations.

---

## 19.12 Architecture Should Evolve

Do not build the entire system as dozens of microservices on day one unless there is a real requirement.

Prefer:

```text
Start
  ↓
Well-structured modules
  ↓
Clear domain boundaries
  ↓
Measure actual requirements
  ↓
Extract services when justified
```

The architecture should allow future extraction without requiring unnecessary complexity today.

---

## 19.13 Enterprise Architecture Principle

The goal is **not maximum complexity**.

The goal is:

```text
                    Enterprise Quality
                           |
       +-------------------+-------------------+
       |                   |                   |
    Security          Reliability         Scalability
       |                   |                   |
       +-------------------+-------------------+
                           |
                     Maintainability
                           |
                       Performance
                           |
                    Clear Architecture
```

Choose architecture based on actual requirements.

**Use microservices when they provide a real architectural benefit. Do not use microservices merely to appear enterprise-grade.**

Every additional service, dependency, abstraction, database, queue, or architectural layer introduces operational cost and should therefore have a clear justification.


# 20. General Rule

For every implementation, ask:

### Performance

> Can this be faster?

### Network

> Can this request/response be smaller?

### State

> Does this data really need global state?

### Rendering

> Does this component really need to render now?

### Database

> Can this query return less data or use a better index?

### Security

> Is any sensitive information unnecessarily exposed to the client?

### Architecture

> Does this follow the existing project structure?

### Maintainability

> Can another developer understand this code quickly?

### Complexity

> Can this be implemented with less code and fewer moving parts?

---

## Final Principle

**Build the simplest solution that is secure, performant, scalable, and consistent with the existing application.**

Do not optimize blindly.

Measure, analyse, and then optimize where it provides a real benefit.
