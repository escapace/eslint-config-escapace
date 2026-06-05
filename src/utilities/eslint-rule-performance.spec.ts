import type { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import { profileEslintRulePerformance } from './eslint-rule-performance'

const stats = (
  fixPasses: number,
  passes: Array<{
    fix: number
    parse: number
    total: number
    rules?: Record<string, number>
  }>,
): Linter.Stats => ({
  fixPasses,
  times: {
    passes: passes.map((pass) => ({
      fix: { total: pass.fix },
      parse: { total: pass.parse },
      rules: Object.fromEntries(
        Object.entries(pass.rules ?? {}).map(([ruleId, total]) => [ruleId, { total }]),
      ),
      total: pass.total,
    })),
  },
})

describe('profileEslintRulePerformance', () => {
  it('aggregates rule timings across files and passes', { timeout: 60_000 }, () => {
    const report = profileEslintRulePerformance([
      {
        filePath: '/repo/src/a.ts',
        stats: stats(1, [
          {
            fix: 0,
            parse: 1,
            rules: {
              alpha: 6,
              beta: 2,
            },
            total: 9,
          },
          {
            fix: 1,
            parse: 1,
            rules: {
              alpha: 3,
            },
            total: 5,
          },
        ]),
      },
      {
        filePath: '/repo/src/b.ts',
        stats: stats(0, [
          {
            fix: 0,
            parse: 2,
            rules: {
              alpha: 1,
              gamma: 4,
            },
            total: 7,
          },
        ]),
      },
      {
        filePath: '/repo/src/ignored.ts',
      },
    ])

    expect(report.summary).toEqual({
      fileCount: 3,
      fixMs: 1,
      fixPassCount: 1,
      parseMs: 4,
      passCount: 3,
      ruleMs: 16,
      timedFileCount: 2,
      totalMs: 21,
    })

    expect(report.rules.map((rule) => rule.ruleId)).toEqual(['alpha', 'gamma', 'beta'])

    expect(report.rules[0]).toMatchObject({
      averageMs: 10 / 3,
      fileCount: 2,
      maxMs: 6,
      medianMs: 3,
      ruleId: 'alpha',
      sampleCount: 3,
      totalMs: 10,
    })
    expect(report.rules[0]?.shareOfRuleTime).toBeCloseTo(0.625)
    expect(report.rules[0]?.percentile95Ms).toBeCloseTo(5.7)
    expect(report.rules[0]?.slowestSample).toEqual({
      filePath: '/repo/src/a.ts',
      passIndex: 1,
      totalMs: 6,
    })

    expect(report.rules[1]).toMatchObject({
      averageMs: 4,
      fileCount: 1,
      maxMs: 4,
      medianMs: 4,
      percentile95Ms: 4,
      ruleId: 'gamma',
      sampleCount: 1,
      totalMs: 4,
    })
  })

  it('returns empty metrics when no stats are present', { timeout: 60_000 }, () => {
    expect(profileEslintRulePerformance([{ filePath: '/repo/src/a.ts' }])).toEqual({
      rules: [],
      summary: {
        fileCount: 1,
        fixMs: 0,
        fixPassCount: 0,
        parseMs: 0,
        passCount: 0,
        ruleMs: 0,
        timedFileCount: 0,
        totalMs: 0,
      },
    })
  })
})
