import { ESLint, type Linter } from 'eslint'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { compose, escapace } from '../src/index'
import {
  profileEslintRulePerformance,
  type RulePerformance,
} from '../src/utilities/eslint-rule-performance'

type Concurrency = ESLint.Options['concurrency']
type OutputFormat = 'json' | 'table'

type Alignment = 'left' | 'right'

interface Column<Row> {
  heading: string
  align?: Alignment
  render: (row: Row) => string
}

interface Ranking {
  description: string
  title: string
  sort: (left: RulePerformance, right: RulePerformance) => number
}

interface Options {
  concurrency: Concurrency
  format: OutputFormat
  limit: number
  patterns: string[]
}

const collator = new Intl.Collator('en')
const countFormatter = new Intl.NumberFormat('en')
const percentFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})
const timeFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

const usage = `Usage: tsx scripts/rule-performance.ts [options] [patterns...]

Profile ESLint rule timings with stats enabled and rank the slowest rules from multiple angles.

Options:
  --limit <number>              Max rows per ranking section. Default: 10
  --format <table|json>         Output format. Default: table
  --concurrency <off|auto|n>    ESLint worker setting. Default: off
  --help                        Show this help text
`

const compareNumbersDescending = (left: number, right: number): number => right - left

const compareRulesByName = (left: RulePerformance, right: RulePerformance): number =>
  collator.compare(left.ruleId, right.ruleId)

const chainComparisons = (...comparisons: number[]): number => {
  for (const comparison of comparisons) {
    if (comparison !== 0) {
      return comparison
    }
  }

  return 0
}

const formatMilliseconds = (value: number): string => `${timeFormatter.format(value)} ms`

const formatPercent = (value: number): string => `${percentFormatter.format(value * 100)}%`

const formatCount = (value: number): string => countFormatter.format(value)

const truncateMiddle = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value
  }

  const edgeLength = Math.max(1, Math.floor((maxLength - 1) / 2))
  return `${value.slice(0, edgeLength)}…${value.slice(-(maxLength - edgeLength - 1))}`
}

const formatHotspot = ({ slowestSample }: RulePerformance): string => {
  const relativePath = path.relative(process.cwd(), slowestSample.filePath)
  const displayPath = relativePath === '' ? slowestSample.filePath : relativePath
  return `${truncateMiddle(displayPath, 36)}#${slowestSample.passIndex}`
}

const formatCell = (value: string, width: number, align: Alignment = 'left'): string =>
  align === 'right' ? value.padStart(width) : value.padEnd(width)

const renderTable = <Row>(rows: readonly Row[], columns: ReadonlyArray<Column<Row>>): string => {
  const matrix = rows.map((row) => columns.map((column) => column.render(row)))
  const widths = columns.map((column, columnIndex) =>
    Math.max(column.heading.length, ...matrix.map((cells) => cells[columnIndex].length)),
  )

  return [
    columns
      .map((column, columnIndex) => formatCell(column.heading, widths[columnIndex], column.align))
      .join('  '),
    columns.map((_, columnIndex) => '-'.repeat(widths[columnIndex])).join('  '),
    ...matrix.map((cells) =>
      cells
        .map((value, columnIndex) =>
          formatCell(value, widths[columnIndex], columns[columnIndex]?.align),
        )
        .join('  '),
    ),
  ].join('\n')
}

const parseLimit = (value: string | undefined): number => {
  const parsed = Number(value ?? '10')

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected --limit to be a positive integer, received ${JSON.stringify(value)}`)
  }

  return parsed
}

const parseFormat = (value: string | undefined): OutputFormat => {
  if (value === undefined || value === 'table' || value === 'json') {
    return value ?? 'table'
  }

  throw new Error(`Expected --format to be "table" or "json", received ${JSON.stringify(value)}`)
}

const parseConcurrency = (value: string | undefined): Concurrency => {
  if (value === undefined || value === 'off' || value === 'auto') {
    return value ?? 'off'
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Expected --concurrency to be "off", "auto", or a positive integer, received ${JSON.stringify(value)}`,
    )
  }

  return parsed
}

const parseOptions = (): Options => {
  const {
    positionals,
    values: { concurrency, format, help, limit },
  } = parseArgs({
    allowPositionals: true,
    options: {
      concurrency: { type: 'string' },
      format: { type: 'string' },
      help: { short: 'h', type: 'boolean' },
      limit: { type: 'string' },
    },
    strict: true,
  })

  if (help === true) {
    console.log(usage)
    process.exit(0)
  }

  return {
    concurrency: parseConcurrency(concurrency),
    format: parseFormat(format),
    limit: parseLimit(limit),
    patterns: positionals.length === 0 ? ['.'] : positionals,
  }
}

const columns: ReadonlyArray<Column<RulePerformance>> = [
  { heading: 'Rule', render: (rule) => rule.ruleId },
  { align: 'right', heading: 'Total', render: (rule) => formatMilliseconds(rule.totalMs) },
  { align: 'right', heading: 'Share', render: (rule) => formatPercent(rule.shareOfRuleTime) },
  { align: 'right', heading: 'Avg', render: (rule) => formatMilliseconds(rule.averageMs) },
  { align: 'right', heading: 'Median', render: (rule) => formatMilliseconds(rule.medianMs) },
  { align: 'right', heading: 'P95', render: (rule) => formatMilliseconds(rule.percentile95Ms) },
  { align: 'right', heading: 'Max', render: (rule) => formatMilliseconds(rule.maxMs) },
  { align: 'right', heading: 'Files', render: (rule) => formatCount(rule.fileCount) },
  { align: 'right', heading: 'Samples', render: (rule) => formatCount(rule.sampleCount) },
  { heading: 'Hotspot', render: formatHotspot },
]

const rankings: readonly Ranking[] = [
  {
    description: 'Largest cumulative rule cost across all timed file passes.',
    title: 'Overall hotspots',
    sort: (left, right) =>
      chainComparisons(
        compareNumbersDescending(left.totalMs, right.totalMs),
        compareNumbersDescending(left.shareOfRuleTime, right.shareOfRuleTime),
        compareRulesByName(left, right),
      ),
  },
  {
    description: 'Highest average cost when the rule appears in a timed pass.',
    title: 'Expensive when they run',
    sort: (left, right) =>
      chainComparisons(
        compareNumbersDescending(left.averageMs, right.averageMs),
        compareNumbersDescending(left.totalMs, right.totalMs),
        compareRulesByName(left, right),
      ),
  },
  {
    description: 'Largest file-specific spikes, ranked by worst case and tail latency.',
    title: 'Worst spikes',
    sort: (left, right) =>
      chainComparisons(
        compareNumbersDescending(left.maxMs, right.maxMs),
        compareNumbersDescending(left.percentile95Ms, right.percentile95Ms),
        compareNumbersDescending(left.totalMs, right.totalMs),
        compareRulesByName(left, right),
      ),
  },
]

const renderSummary = ({
  concurrency,
  patterns,
  report,
}: {
  concurrency: Concurrency
  patterns: readonly string[]
  report: ReturnType<typeof profileEslintRulePerformance>
}): string => {
  const { summary } = report

  return [
    `Patterns: ${patterns.join(', ')}`,
    `Concurrency: ${String(concurrency)}`,
    `Timed files: ${formatCount(summary.timedFileCount)} of ${formatCount(summary.fileCount)} lint results`,
    `Passes: ${formatCount(summary.passCount)} total, ${formatCount(summary.fixPassCount)} fix reruns`,
    `Runtime totals: rules ${formatMilliseconds(summary.ruleMs)}, parse ${formatMilliseconds(summary.parseMs)}, fix ${formatMilliseconds(summary.fixMs)}, all passes ${formatMilliseconds(summary.totalMs)}`,
  ].join('\n')
}

const renderRankings = (rules: readonly RulePerformance[], limit: number): string =>
  rankings
    .map(({ description, sort, title }) => {
      const rankedRules = rules.toSorted(sort).slice(0, limit)
      return `${title}\n${description}\n${renderTable(rankedRules, columns)}`
    })
    .join('\n\n')

const repositoryIgnorePatterns = ['src/types/*.ts', 'src/rules/*.ts']

const main = async (): Promise<void> => {
  const options = parseOptions()
  // `compose(escapace())` returns the runtime shape ESLint accepts, but the
  // package types come from typescript-eslint's flat-config definitions.
  const overrideConfig = (await compose(escapace(), {
    ignores: repositoryIgnorePatterns,
  })) as unknown as Linter.Config[]
  const eslint = new ESLint({
    concurrency: options.concurrency,
    overrideConfig,
    overrideConfigFile: true,
    stats: true,
  })

  const results = await eslint.lintFiles(options.patterns)
  const report = profileEslintRulePerformance(results)

  if (options.format === 'json') {
    console.log(JSON.stringify({ ...report, options }, null, 2))
    return
  }

  if (report.rules.length === 0) {
    console.log(
      `${renderSummary({ concurrency: options.concurrency, patterns: options.patterns, report })}\n\nNo timed rule data was produced.`,
    )
    return
  }

  console.log(
    [
      renderSummary({ concurrency: options.concurrency, patterns: options.patterns, report }),
      renderRankings(report.rules, options.limit),
    ].join('\n\n'),
  )
}

await main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
  console.error(message)
  process.exitCode = 1
})
