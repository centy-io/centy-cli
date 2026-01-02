# Implement gRPC API versioning with action-based compatibility

Design and implement a versioning strategy for the daemon's gRPC API that allows:

- Different CLI/daemon versions to work together
- Graceful degradation when actions are missing
- Warnings (not errors) on version mismatch

## Proposed Changes

### 1. Extend DaemonInfo proto message

```protobuf
message DaemonInfo {
  string version = 1;
  repeated string available_versions = 2;
  string binary_path = 3;
  // NEW fields:
  uint32 api_version = 4;              // Bump on breaking API changes
  repeated string available_actions = 5; // List of available RPC methods
}
```

### 2. Implement compatibility check in CLI

- On startup, call GetDaemonInfo()
- Cache available_actions for the session
- Before calling any RPC, check if action exists in list
- If action missing → show helpful message instead of cryptic gRPC error

### 3. Action-based compatibility

Daemon advertises available RPC methods:

```
["CreateIssue", "GetIssue", "ListIssues", "UpdateIssue", "DeleteIssue",
 "CreateDoc", "GetDoc", "ListDocs", "CreatePr", "GetPr", "ListPrs",
 "CreateLink", "DeleteLink", "SpawnAgent", ...]
```

- CLI checks if required action exists before calling
- Missing actions show "requires daemon upgrade" or gracefully disable UI element
- New daemon versions can add actions without breaking old CLIs
- CLI can query this once on startup and cache it

### 4. Proto evolution rules

- Never remove or renumber fields
- New fields must be optional with defaults
- Deprecated fields marked with [deprecated = true]
- Use reserved keyword for removed field numbers

## Files to Modify

- centy-cli/proto/centy.proto - Add api_version and available_actions to DaemonInfo
- centy-daemon/src/server/mod.rs - Return api_version and generate available_actions list
- centy-cli/src/daemon/check-daemon-connection.ts - Cache available_actions on startup
- centy-cli/src/daemon/load-proto.ts - Add action availability check helper
