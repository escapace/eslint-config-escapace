import type { Linter } from 'eslint'

export interface LintStatsResult {
  filePath: string
  stats?: Linter.Stats
}

export interface RulePerformanceSample {
  filePath: string
  passIndex: number
  totalMs: number
}

export interface RulePerformance {
  averageMs: number
  fileCount: number
  maxMs: number
  medianMs: number
  percentile95Ms: number
  ruleId: string
  sampleCount: number
  shareOfRuleTime: number
  slowestSample: RulePerformanceSample
  totalMs: number
}

export interface RulePerformanceSummary {
  fileCount: number
  fixMs: number
  fixPassCount: number
  parseMs: number
  passCount: number
  ruleMs: number
  timedFileCount: number
  totalMs: number
}

export interface RulePerformanceReport {
  rules: RulePerformance[]
  summary: RulePerformanceSummary
}

interface RuleAccumulator {
  filePaths: Set<string>
  samples: RulePerformanceSample[]
  totalMs: number
}

const quantile = (values: readonly number[], percentile: number): number => {
  if (values.length === 0) {
    return 0
  }

  if (values.length === 1) {
    return values[0]
  }

  const index = (values.length - 1) * percentile
  const lowerIndex = Math.floor(index)
  const upperIndex = Math.ceil(index)
  const lowerValue = values[lowerIndex]
  const upperValue = values[upperIndex]

  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex)
}

const compareNumbersDescending = (left: number, right: number): number => right - left

const chainComparisons = (...comparisons: number[]): number => {
  for (const comparison of comparisons) {
    if (comparison !== 0) {
      return comparison
    }
  }

  return 0
}

/**
 * Aggregates ESLint stats output into rule-level performance summaries.
 *
 * The resulting metrics keep separate views for cumulative cost, typical per-sample
 * cost, and tail latency so broad hotspots and narrow spikes remain distinguishable.
 */
export const profileEslintRulePerformance = (
  results: readonly LintStatsResult[],
): RulePerformanceReport => {
  const rules = new Map<string, RuleAccumulator>()

  const summary: RulePerformanceSummary = {
    fileCount: results.length,
    fixMs: 0,
    fixPassCount: 0,
    parseMs: 0,
    passCount: 0,
    ruleMs: 0,
    timedFileCount: 0,
    totalMs: 0,
  }

  for (const result of results) {
    const { stats } = result

    if (stats === undefined) {
      continue
    }

    summary.timedFileCount += 1
    summary.fixPassCount += stats.fixPasses

    for (const [passIndex, pass] of stats.times.passes.entries()) {
      summary.passCount += 1
      summary.parseMs += pass.parse.total
      summary.fixMs += pass.fix.total
      summary.totalMs += pass.total

      for (const [ruleId, { total }] of Object.entries(pass.rules ?? {})) {
        summary.ruleMs += total

        const sample: RulePerformanceSample = {
          filePath: result.filePath,
          passIndex: passIndex + 1,
          totalMs: total,
        }

        const accumulator = rules.get(ruleId) ?? {
          filePaths: new Set<string>(),
          samples: [],
          totalMs: 0,
        }

        accumulator.filePaths.add(result.filePath)
        accumulator.samples.push(sample)
        accumulator.totalMs += total
        rules.set(ruleId, accumulator)
      }
    }
  }

  return {
    rules: Array.from(rules.entries())
      .map(([ruleId, accumulator]) => {
        const durations = accumulator.samples
          .map((sample) => sample.totalMs)
          .toSorted((left, right) => left - right)
        const slowestSample = accumulator.samples.reduce((slowest, sample) =>
          sample.totalMs > slowest.totalMs ? sample : slowest,
        )

        return {
          averageMs: accumulator.totalMs / accumulator.samples.length,
          fileCount: accumulator.filePaths.size,
          maxMs: slowestSample.totalMs,
          medianMs: quantile(durations, 0.5),
          percentile95Ms: quantile(durations, 0.95),
          ruleId,
          sampleCount: accumulator.samples.length,
          shareOfRuleTime: summary.ruleMs === 0 ? 0 : accumulator.totalMs / summary.ruleMs,
          slowestSample,
          totalMs: accumulator.totalMs,
        } satisfies RulePerformance
      })
      .toSorted((left, right) =>
        chainComparisons(
          compareNumbersDescending(left.totalMs, right.totalMs),
          compareNumbersDescending(left.maxMs, right.maxMs),
          left.ruleId.localeCompare(right.ruleId),
        ),
      ),
    summary,
  }
}
