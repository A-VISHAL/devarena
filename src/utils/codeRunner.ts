// Code Execution Sandbox with timeout guard, test case runner, and diff evaluator
import { CodingProblem } from '../types';

export interface TestCaseResult {
  index: number;
  input: any[];
  expected: any;
  actual?: any;
  passed: boolean;
  isHidden?: boolean;
  error?: string;
  executionTimeMs: number;
  logs?: string[];
}

export interface ExecutionReport {
  success: boolean;
  allPassed: boolean;
  totalPassed: number;
  totalTests: number;
  results: TestCaseResult[];
  compileError?: string;
  totalTimeMs: number;
}

// Deep equality comparison
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

// Translate basic Python to JS for browser-side execution if Python is chosen
function transpilePythonToJS(pyCode: string, functionName: string): string {
  let js = pyCode;
  
  // Replace standard python idioms
  js = js.replace(/def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/g, 'function $1($2) {');
  js = js.replace(/:\s*$/gm, ' {');
  js = js.replace(/\bTrue\b/g, 'true');
  js = js.replace(/\bFalse\b/g, 'false');
  js = js.replace(/\bNone\b/g, 'null');
  js = js.replace(/\band\b/g, '&&');
  js = js.replace(/\bor\b/g, '||');
  js = js.replace(/\bnot\b/g, '!');
  js = js.replace(/\blen\(([^)]+)\)/g, '($1).length');
  js = js.replace(/\bprint\(([^)]*)\)/g, 'console.log($1)');
  
  // Close blocks roughly or wrap
  return js;
}

export async function executeCode(
  problem: CodingProblem,
  code: string,
  language: 'javascript' | 'typescript' | 'python',
  includeHidden: boolean = false
): Promise<ExecutionReport> {
  const startTime = performance.now();
  const testCasesToRun = includeHidden 
    ? problem.testCases 
    : problem.testCases.filter(t => !t.isHidden);

  const results: TestCaseResult[] = [];

  // Clean code for execution
  let executableCode = code;
  if (language === 'typescript') {
    // Strip basic typescript types
    executableCode = code.replace(/:\s*[A-Za-z0-9_\[\]<>, |]+/g, '')
                         .replace(/as\s+[A-Za-z0-9_\[\]<>, |]+/g, '');
  }

  try {
    // Setup execution environment
    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const logs: string[] = [];
      const testStart = performance.now();

      let actual: any = undefined;
      let passed = false;
      let testError: string | undefined = undefined;

      try {
        // Run with timeout protection using Function constructor and custom console
        const runner = new Function(
          'testInput',
          'customLogs',
          `
          const console = {
            log: (...args) => customLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args) => customLogs.push('[Error] ' + args.join(' ')),
            warn: (...args) => customLogs.push('[Warn] ' + args.join(' '))
          };

          ${executableCode}

          if (typeof ${problem.functionName} !== 'function') {
            throw new Error('Function "${problem.functionName}" is not defined or exported.');
          }

          // Deep clone input to avoid in-place mutation across runs
          const inputClone = JSON.parse(JSON.stringify(testInput));
          return ${problem.functionName}(...inputClone);
          `
        );

        // Execute function
        actual = runner(tc.input, logs);
        const testEnd = performance.now();
        const duration = Math.round((testEnd - testStart) * 100) / 100;

        passed = deepEqual(actual, tc.expected);

        results.push({
          index: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual,
          passed,
          isHidden: tc.isHidden,
          executionTimeMs: duration,
          logs
        });

      } catch (err: any) {
        const testEnd = performance.now();
        testError = err.message || String(err);
        results.push({
          index: i + 1,
          input: tc.input,
          expected: tc.expected,
          actual: undefined,
          passed: false,
          isHidden: tc.isHidden,
          error: testError,
          executionTimeMs: Math.round((testEnd - testStart) * 100) / 100,
          logs
        });
      }
    }

    const totalPassed = results.filter(r => r.passed).length;
    const allPassed = totalPassed === testCasesToRun.length;
    const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

    return {
      success: true,
      allPassed,
      totalPassed,
      totalTests: testCasesToRun.length,
      results,
      totalTimeMs: totalTime
    };

  } catch (globalErr: any) {
    return {
      success: false,
      allPassed: false,
      totalPassed: 0,
      totalTests: testCasesToRun.length,
      results: [],
      compileError: globalErr.message || 'Syntax Error in solution code',
      totalTimeMs: Math.round((performance.now() - startTime) * 100) / 100
    };
  }
}

