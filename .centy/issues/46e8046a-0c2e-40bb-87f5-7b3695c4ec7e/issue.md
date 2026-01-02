# Add PR-related RPC methods to centy.proto for App

Add PR message definitions and service methods to centy-app/proto/centy.proto to enable the App to communicate with the daemon for PR operations.

## Acceptance Criteria

- [ ] Add PR message types: PullRequest, PrMetadata, CreatePrRequest/Response, GetPrRequest, ListPrsRequest/Response, UpdatePrRequest/Response, DeletePrRequest/Response
- [ ] Add PR RPC methods to CentyDaemon service: CreatePr, GetPr, GetPrByDisplayNumber, ListPrs, UpdatePr, DeletePr
- [ ] Regenerate centy_pb.ts using buf generate
- [ ] Verify types match CLI daemon types

## Reference Files

- centy-app/proto/centy.proto (Issue messages at lines 184-302)
- centy-cli/src/daemon/types.ts (PR types at lines 470-580)
