# Testing Obligations

Testing is the agent's responsibility, not the human's. Research deeply, identify every meaningful failure mode, write tests that would satisfy a senior engineer in code review.

## The Agent's Testing Obligations

For every stage:

### 1. Research the Testing Landscape

Before writing any test code, investigate:
- What testing frameworks and tools exist for this specific tech (not just generic unit test runners — domain-specific tools)
- How the official docs recommend testing this type of code
- Known gotchas, race conditions, and subtle bugs people commonly hit
- What professional open-source projects in this space test for

### 2. Design a Test Strategy

Think through:
- What's the right ratio of unit / integration / e2e for this stage?
- What needs mocking vs. what should run against real instances?
- What test data do we need? How do we generate it?
- What's the fixture strategy? (setup/teardown, isolation between tests)

### 3. Write Thorough Tests

**Unit tests:**
- Every public function/method has at least one test
- Happy path + at least one unhappy path per function
- Boundary values (empty string, zero, negative, max int, None/null)
- Type edge cases (unexpected types, missing fields)

**Integration tests:**
- Components from this stage work together correctly
- Components from this stage work with prior stages
- Data flows end-to-end through the stage's pipeline

**Error path tests:**
- Dependencies unavailable (DB down, API unreachable, file missing)
- Malformed input
- Resource constraints (timeout, rate limit, disk full)
- Error messages are useful, not generic

**Regression anchors:**
- Tests that lock in behavior so future stages can't accidentally break it
- Critical for interfaces that later stages depend on

### 4. Validate Test Quality

After writing tests, verify:
- Tests actually fail when code is wrong (mutate code, check tests catch it)
- Tests test behavior, not implementation (won't break on refactors)
- Tests are isolated (each runs independently, no ordering dependencies)
- Tests are fast (slow tests don't get run)

## Testing by Domain

Different code needs different testing approaches. Research and apply the right one:

| Domain | What to Test | Tools/Techniques to Research |
|--------|-------------|------------------------------|
| **API endpoints** | Status codes, response shapes, auth, validation, error formats | Test client, request factories, schema validation |
| **Database layer** | CRUD, migrations, constraints, concurrent access, edge queries | In-memory DB, transaction rollback, fixtures |
| **External API integrations** | Response handling, retry logic, timeout behavior, rate limits | VCR/cassette recording, mock servers, contract tests |
| **File I/O** | Read/write, permissions, encoding, large files, missing paths | Temp directories, filesystem mocks |
| **Async code** | Concurrency, cancellation, timeout, error propagation | Async test runners, event loop fixtures |
| **Config/settings** | Defaults, overrides, env vars, validation, missing values | Env manipulation, temp config files |
| **CLI tools** | Arg parsing, output format, exit codes, error messages | CLI test runners, output capture |
| **UI components** | Rendering, interaction, accessibility, responsive behavior | Component testing libs, snapshot tests, visual regression |
| **State machines** | Valid transitions, invalid transitions, edge states | Property-based testing, state diagrams as test specs |
| **Security-sensitive code** | Auth bypass, injection, privilege escalation, data leaks | Security-focused test patterns, fuzzing |
| **WebSocket/realtime** | Connection lifecycle, reconnection, message ordering, backpressure | Mock WS servers, timing-sensitive fixtures |
| **Caching** | Cache hit/miss, invalidation, TTL, race conditions | Time mocking, cache inspection |
| **Background jobs/queues** | Enqueue, process, retry, dead letter, ordering | In-memory queue, job inspection |

## Concrete Example: Database Service Testing

For a database service stage, don't just test "can I insert and read a record." Test:

- Insert with all fields populated
- Insert with only required fields (nullable fields omitted)
- Insert with duplicate unique keys (expect specific error)
- Read nonexistent record (expect None, not crash)
- Update nonexistent record (expect specific behavior)
- Delete and verify it's gone
- Delete nonexistent record (expect specific behavior)
- Concurrent reads/writes don't corrupt data
- Connection loss mid-operation (graceful error, not silent corruption)
- Schema migration on empty DB runs clean
- Schema migration on DB with existing data runs clean
- Query with empty table returns empty list, not error
- Query with special characters in string fields
- Large payload handling (field at max length, field exceeding max length)
- Pagination works correctly (first page, last page, beyond last page)
- Sort ordering is deterministic
- Transactions roll back on error

This level of thoroughness is the baseline, not the gold standard.

## Concrete Example: API Endpoint Testing

For an API endpoint, don't just test "returns 200." Test:

- Valid request returns correct response shape
- Response includes all required fields
- Missing required fields return 400 with useful error message
- Invalid field types return 400 with field-specific error
- Auth required endpoints return 401 without token
- Auth required endpoints return 403 with wrong permissions
- Rate limiting returns 429 with Retry-After header
- Concurrent requests don't cause race conditions
- Large request body is handled (accepted or rejected with clear limit)
- Malformed JSON returns 400, not 500
- Request with extra unknown fields is handled (ignored or rejected, documented either way)
- Error responses follow the same shape as success responses
- Content-Type headers are correct
- CORS headers are present when expected

## Test File Organization

Every stage's tests go in the project's test directory, organized by type:

```
tests/
├── unit/
│   ├── test_[stage_module_a].py
│   └── test_[stage_module_b].py
├── integration/
│   └── test_[stage_name]_integration.py
├── fixtures/
│   ├── [stage_name]_fixtures.py
│   └── sample_data/
└── conftest.py
```
