# Require daemon connection before CLI commands execute

CLI commands should check daemon connection upfront and show a clear error message if the daemon is not running. Added check-daemon-connection.ts utility and integrated it into init and create issue commands.
