import { build } from 'esroll'
import { exec as _exec } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import { dependencies, engines } from '../package.json'
const exec = promisify(_exec)

const dirname = path.resolve(import.meta.dirname, '../')
process.chdir(dirname)

await build({
  absWorkingDir: dirname,
  entryPoints: ['src/index.ts'],
  external: Object.keys(dependencies),
  mainFields: ['module', 'main'],
  outdir: 'lib/esm',
  outExtension: {
    '.js': '.mjs',
  },
  platform: 'node',
  rollup: {
    experimentalLogSideEffects: true,
  },
  sourcemap: true,
  sourcesContent: false,
  splitting: true,
  supported: {
    'const-and-let': true,
  },
  target: [`node${engines.node.replace(/^\D+/, '')}`],
  treeShaking: true,
  tsconfig: 'tsconfig-build.json',
})

await exec(
  'pnpm exec tsc -p ./tsconfig-build.json --emitDeclarationOnly --declarationDir lib/types',
)
