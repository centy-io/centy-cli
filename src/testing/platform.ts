import { it } from 'vitest'

/** True when running on Windows. */
export const IS_WINDOWS = process.platform === 'win32'

/** True when running on a Unix-like OS (macOS or Linux). */
export const IS_UNIX = !IS_WINDOWS

/** Like `it`, but skips the test when running on Windows. */
export const skipOnWindows = it.skipIf(IS_WINDOWS)

/** Like `it`, but skips the test when running on Unix (macOS or Linux). */
export const skipOnUnix = it.skipIf(IS_UNIX)
