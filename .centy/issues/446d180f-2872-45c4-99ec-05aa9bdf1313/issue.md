# LLM integration - CLI commands

Implement CLI commands to expose the daemon's LLM integration RPCs:

- `centy llm spawn` - Spawn an agent on an issue (plan/implement action)
- `centy llm status` - Get active work session status
- `centy llm clear` - Clear work session tracking
- `centy llm config` - View/update LLM agent configuration
- `centy llm agents` - List available/configured agents

Should integrate with existing daemon client and expose all LLM-related gRPC endpoints (SpawnAgent, GetLlmWork, ClearLlmWork, GetLocalLlmConfig, UpdateLocalLlmConfig).

Parent issue: cf64f3d7-832f-4ba9-831b-2589a1c8e790 (centy-daemon)
