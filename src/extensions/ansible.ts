/**
 * Ansible YAML sort orders are semantic first, ansible-lint compatible second,
 * and documentation-shaped third. Plays flow from identity and target selection
 * to execution context, result controls, variables, selection, then the play
 * body.
 *
 * Task-like mappings intentionally differ: keep identity first, the module or
 * action body next, then execution context, result handling, conditions,
 * selection, notifications, and large nested bodies. ansible-lint enforces the
 * most important part of that shape: `name` first, and `block`, `rescue`, and
 * `always` last. Preserve that behavior because controls placed below a large
 * block are easy to confuse with nested task controls.
 *
 * Do not append the generic YAML sort fallback here. Module argument maps, role
 * variables, and many Molecule or metadata sub-maps are domain-specific and may
 * be intentionally grouped. Unknown task keys are treated as module/action keys
 * by default; update `ansibleTaskControlKeys` when adding a new Ansible control
 * keyword.
 */
import type { RuleYamlSortKeysOptions } from '../types/rule-yaml-sort-keys-options'

type ValueOf<T> = T extends Array<infer U> ? U : never

const sortKeysOption = (
  option: ValueOf<RuleYamlSortKeysOptions>,
): ValueOf<RuleYamlSortKeysOptions> => option

const ansibleIdentifierPathSegment = '(?:\\.[a-zA-Z_][a-zA-Z0-9_]*|\\["[a-zA-Z_][a-zA-Z0-9_-]*"\\])'
const ansibleRootSequenceItemPathPattern = '^\\[[0-9]+\\]$'
const ansibleNestedTaskPathPattern = '^\\[[0-9]+\\](?:\\.(?:block|rescue|always)\\[[0-9]+\\])*$'
const ansiblePlayTaskPathPattern =
  '^\\[[0-9]+\\]\\.(?:pre_tasks|tasks|post_tasks|handlers)\\[[0-9]+\\](?:\\.(?:block|rescue|always)\\[[0-9]+\\])*$'
const ansiblePlayRolePathPattern = '^\\[[0-9]+\\]\\.roles\\[[0-9]+\\]$'
const ansibleMetaDependencyPathPattern = '^dependencies\\[[0-9]+\\]$'
const ansibleRequirementPathPattern = '^(?:collections|roles)\\[[0-9]+\\]$'
const ansibleArgumentSpecPathPattern = `^argument_specs${ansibleIdentifierPathSegment}$`
const ansibleArgumentSpecOptionPathPattern = `^argument_specs${ansibleIdentifierPathSegment}\\.options(?:${ansibleIdentifierPathSegment}\\.options)*${ansibleIdentifierPathSegment}$`

const ansibleTaskControlKeys = [
  'action',
  'always',
  'args',
  'async',
  'become',
  'become_exe',
  'become_flags',
  'become_method',
  'become_user',
  'block',
  'changed_when',
  'check_mode',
  'collections',
  'connection',
  'debugger',
  'delay',
  'delegate_facts',
  'delegate_to',
  'diff',
  'environment',
  'failed_when',
  'ignore_errors',
  'ignore_unreachable',
  'listen',
  'local_action',
  'loop',
  'loop_control',
  'name',
  'notify',
  'poll',
  'register',
  'remote_user',
  'rescue',
  'retries',
  'run_once',
  'tags',
  'throttle',
  'timeout',
  'until',
  'vars',
  'when',
  'with_dict',
  'with_fileglob',
  'with_first_found',
  'with_flattened',
  'with_indexed_items',
  'with_inventory_hostnames',
  'with_items',
  'with_lines',
  'with_list',
  'with_nested',
  'with_random_choice',
  'with_sequence',
  'with_subelements',
  'with_together',
]
const ansibleTaskActionKeyPattern = `^(?!(?:${ansibleTaskControlKeys.join('|')})$).+$`

const ansibleTaskSortKeysOrder = [
  'name',
  'listen',
  'action',
  'local_action',
  { keyPattern: ansibleTaskActionKeyPattern },
  'args',
  'collections',
  'become',
  'become_user',
  'become_method',
  'become_flags',
  'become_exe',
  'remote_user',
  'connection',
  'delegate_to',
  'delegate_facts',
  'run_once',
  'throttle',
  'timeout',
  'environment',
  'vars',
  'register',
  'changed_when',
  'failed_when',
  'debugger',
  'check_mode',
  'diff',
  'ignore_errors',
  'ignore_unreachable',
  'async',
  'poll',
  'until',
  'retries',
  'delay',
  'loop',
  'with_items',
  'with_list',
  'with_dict',
  'with_fileglob',
  'with_first_found',
  'with_flattened',
  'with_indexed_items',
  'with_inventory_hostnames',
  'with_lines',
  'with_nested',
  'with_random_choice',
  'with_sequence',
  'with_subelements',
  'with_together',
  'loop_control',
  'when',
  'tags',
  'notify',
  'block',
  'rescue',
  'always',
]

const ansiblePlaySortKeysOrder = [
  'name',
  'hosts',
  'gather_facts',
  'gather_subset',
  'gather_timeout',
  'fact_path',
  'become',
  'become_user',
  'become_method',
  'become_flags',
  'become_exe',
  'remote_user',
  'connection',
  'strategy',
  'serial',
  'order',
  'any_errors_fatal',
  'max_fail_percentage',
  'force_handlers',
  'vars',
  'vars_files',
  'vars_prompt',
  'collections',
  'module_defaults',
  'environment',
  'tags',
  'pre_tasks',
  'roles',
  'tasks',
  'post_tasks',
  'handlers',
]

const ansibleRoleUseSortKeysOrder = [
  'role',
  'name',
  'src',
  'version',
  'become',
  'vars',
  'when',
  'tags',
]

export const ruleYamlSortKeysOptionsAnsibleTasks = [
  sortKeysOption({
    order: ansibleTaskSortKeysOrder,
    pathPattern: ansibleNestedTaskPathPattern,
  }),
] as unknown as RuleYamlSortKeysOptions

export const ruleYamlSortKeysOptionsAnsiblePlaybooks = [
  sortKeysOption({
    order: ansiblePlaySortKeysOrder,
    pathPattern: ansibleRootSequenceItemPathPattern,
  }),
  sortKeysOption({
    order: ansibleTaskSortKeysOrder,
    pathPattern: ansiblePlayTaskPathPattern,
  }),
  sortKeysOption({
    order: ansibleRoleUseSortKeysOrder,
    pathPattern: ansiblePlayRolePathPattern,
  }),
] as unknown as RuleYamlSortKeysOptions

export const ruleYamlSortKeysOptionsAnsibleMeta = [
  sortKeysOption({
    allowLineSeparatedGroups: true,
    order: ['galaxy_info', 'argument_specs', 'dependencies'],
    pathPattern: '^$',
  }),
  sortKeysOption({
    order: [
      'role_name',
      'namespace',
      'description',
      'author',
      'company',
      'issue_tracker_url',
      'license',
      'min_ansible_version',
      'platforms',
      'galaxy_tags',
      'dependencies',
    ],
    pathPattern: '^galaxy_info$',
  }),
  sortKeysOption({
    order: ['name', 'versions'],
    pathPattern: '^galaxy_info\\.platforms\\[[0-9]+\\]$',
  }),
  sortKeysOption({
    order: ansibleRoleUseSortKeysOrder,
    pathPattern: ansibleMetaDependencyPathPattern,
  }),
  sortKeysOption({
    order: ['short_description', 'description', 'author', 'version_added', 'options'],
    pathPattern: ansibleArgumentSpecPathPattern,
  }),
  sortKeysOption({
    order: [
      'description',
      'type',
      'required',
      'default',
      'choices',
      'elements',
      'options',
      'aliases',
      'version_added',
    ],
    pathPattern: ansibleArgumentSpecOptionPathPattern,
  }),
] as unknown as RuleYamlSortKeysOptions

export const ruleYamlSortKeysOptionsAnsibleRequirements = [
  sortKeysOption({
    allowLineSeparatedGroups: true,
    order: ['collections', 'roles'],
    pathPattern: '^$',
  }),
  sortKeysOption({
    order: ['name', 'src', 'source', 'type', 'scm', 'version', 'signatures'],
    pathPattern: ansibleRequirementPathPattern,
  }),
] as unknown as RuleYamlSortKeysOptions

export const ruleYamlSortKeysOptionsMolecule = [
  sortKeysOption({
    allowLineSeparatedGroups: true,
    order: [
      'scenario',
      'prerun',
      'role_name_check',
      'shared_state',
      'dependency',
      'driver',
      'platforms',
      'provisioner',
      'verifier',
      'lint',
    ],
    pathPattern: '^$',
  }),
  sortKeysOption({
    order: ['name', 'enabled', 'command', 'options', 'env'],
    pathPattern: '^dependency$',
  }),
  sortKeysOption({
    order: ['name', 'options'],
    pathPattern: '^driver$',
  }),
  sortKeysOption({
    order: [
      'name',
      'image',
      'pre_build_image',
      'dockerfile',
      'command',
      'override_command',
      'groups',
      'children',
      'privileged',
      'capabilities',
      'volumes',
      'tmpfs',
      'environment',
      'networks',
      'published_ports',
      'registry',
    ],
    pathPattern: '^platforms\\[[0-9]+\\]$',
  }),
  sortKeysOption({
    order: ['name', 'playbooks', 'inventory', 'config_options', 'options', 'env', 'lint'],
    pathPattern: '^provisioner$',
  }),
  sortKeysOption({
    order: ['create', 'destroy', 'prepare', 'converge', 'side_effect', 'verify', 'cleanup'],
    pathPattern: '^provisioner\\.playbooks$',
  }),
] as unknown as RuleYamlSortKeysOptions
