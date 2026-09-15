## Purpose

Defines the optional production-packaging and AI-search behavior that may be
implemented only after the mandatory Staff Pulse stages are complete.

## ADDED Requirements

### Requirement: Optional container startup
If the Bonus stage is undertaken, `docker-compose up` SHALL start the client
and server and runtime configuration SHALL be supplied through `.env`.

#### Scenario: Bonus stack is started
- **WHEN** a reviewer runs `docker-compose up` with the documented environment configuration
- **THEN** the client and server start and are usable together

### Requirement: Optional Nginx production serving
If the Bonus stage is undertaken, Nginx SHALL proxy API requests, serve the
production client assets, and enable gzip delivery. The production frontend
build SHALL be no larger than 200 KB when measured with the accepted gzip
method.

#### Scenario: Bonus production deployment is inspected
- **WHEN** the containerized production application serves the dashboard
- **THEN** Nginx serves compressed static assets, proxies API traffic, and the measured gzip build size does not exceed 200 KB

### Requirement: Optional natural-language search
If the Bonus stage is undertaken, the search input SHALL accept natural
language and convert a successful AI response into a structured client-side
filter. If AI interpretation is unavailable or unsuccessful, the dashboard
SHALL fall back to text search.

#### Scenario: AI interpretation succeeds
- **WHEN** the user submits a natural-language organization query and the AI interpretation succeeds
- **THEN** the dashboard applies the returned structured filter on the client

#### Scenario: AI interpretation fails
- **WHEN** the AI search cannot return a valid structured filter
- **THEN** the dashboard applies text search as a fallback
