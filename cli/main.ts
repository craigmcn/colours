import { run } from "../src/cli/run";

// Thin Node wrapper: all logic (and its tests) lives in src/cli/run.ts.
const { stdout, stderr, code } = run(process.argv.slice(2));
if (stdout) process.stdout.write(stdout);
if (stderr) process.stderr.write(stderr);
process.exitCode = code;
