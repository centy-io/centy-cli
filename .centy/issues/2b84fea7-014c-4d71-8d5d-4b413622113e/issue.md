# Add CLI commands for issue linking

The issue linking feature is implemented in the daemon and web app (Issue #38).

Need to add CLI commands:

- centy link <sourceId> --to <targetId> --type <linkType> - Create a link
- centy unlink <sourceId> --from <targetId> [--type <linkType>] - Delete a link
- centy list links <entityId> - List links for an entity
- centy list link-types - List available link types

Files to create:

- src/commands/link/index.ts
- src/commands/unlink/index.ts
- src/commands/list/links.ts
- src/commands/list/link-types.ts
- src/daemon/daemon-create-link.ts
- src/daemon/daemon-delete-link.ts
- src/daemon/daemon-list-links.ts
- src/daemon/daemon-get-available-link-types.ts

Proto methods already exist: CreateLink, DeleteLink, ListLinks, GetAvailableLinkTypes
