import { Flags } from '@oclif/core'
import { projectFlag } from './project-flag.js'

export const updateFlags = {
  title: Flags.string({ char: 't', description: 'New title' }),
  body: Flags.string({
    char: 'b',
    description: 'New body (markdown content)',
  }),
  status: Flags.string({
    char: 's',
    description: 'New status (e.g., open, in-progress, closed)',
  }),
  priority: Flags.integer({
    char: 'p',
    description: 'New priority level (1 = highest)',
  }),
  'custom-field': Flags.string({
    multiple: true,
    description: 'Custom field in key=value format (repeatable)',
  }),
  tag: Flags.string({
    multiple: true,
    description:
      'Replace tags with this value (repeatable; omit to leave tags unchanged)',
  }),
  'clear-tags': Flags.boolean({
    description: 'Clear all tags from the item',
    default: false,
  }),
  link: Flags.string({
    description:
      'Link to another entity as link-type:type:id (repeatable, e.g. blocks:issue:2)',
    multiple: true,
  }),
  json: Flags.boolean({
    description: 'Output as JSON',
    default: false,
  }),
  project: projectFlag,
} as const
