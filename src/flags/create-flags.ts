import { Flags } from '@oclif/core'
import { projectFlag } from './project-flag.js'

export const createFlags = {
  title: Flags.string({
    char: 't',
    description: 'Item title',
    required: true,
  }),
  body: Flags.string({
    char: 'b',
    description: 'Item body / description (markdown)',
    default: '',
  }),
  status: Flags.string({
    char: 's',
    description: 'Initial status (empty = use type default)',
    default: '',
  }),
  priority: Flags.integer({
    char: 'p',
    description: 'Priority level (0 = use default)',
    default: 0,
  }),
  'custom-field': Flags.string({
    description: 'Custom field as key=value (repeatable)',
    multiple: true,
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
