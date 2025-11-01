import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface TestCase {
  input: any[];
  expectedOutput: any;
}

export interface RunResult {
  output: any;
  error?: string;
}

// Helper to create a temporary file
async function createTempFile(content: string, extension: string): Promise<string> {
  const tmpDir = os.tmpdir();
  const tempFile = path.join(tmpDir, `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`);
  await fs.writeFile(tempFile, content);
  return tempFile;
}

// Helper to clean up temp file
async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    // Also try to clean up any compiled files
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, path.extname(filePath));
    
    // Try to remove .class files for Java
    try {
      await fs.unlink(path.join(dir, `${basename}.class`));
    } catch {}
    
    // Try to remove Solution.class for Java
    try {
      await fs.unlink(path.join(dir, 'Solution.class'));
    } catch {}
    
    // Try to remove executable for C++
    try {
      await fs.unlink(path.join(dir, basename));
      await fs.unlink(path.join(dir, `${basename}.exe`));
    } catch {}
  } catch (err) {
    // Ignore cleanup errors
  }
}

// Run JavaScript code
export async function runJavaScript(code: string, testCase: TestCase, functionName: string): Promise<RunResult> {
  try {
    const vm = await import('vm');
    const sandbox: any = {
      console: { log: () => {} },
      result: null,
    };

    // Create wrapper code that calls the function and stores result
    const wrapperCode = `
      ${code}
      result = ${functionName}(${testCase.input.map(i => JSON.stringify(i)).join(', ')});
    `;

    vm.runInNewContext(wrapperCode, sandbox, { timeout: 5000 });
    
    return { output: sandbox.result };
  } catch (err: any) {
    return { output: null, error: err.message };
  }
}

// Run Python code
export async function runPython(code: string, testCase: TestCase, functionName: string): Promise<RunResult> {
  let tempFile: string | null = null;
  
  try {
    // Convert function name from camelCase to snake_case for Python
    const pythonFunctionName = functionName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Create Python wrapper code
    const wrapperCode = `
import json
import sys

${code}

# Test the function
try:
    args = ${JSON.stringify(testCase.input)}
    result = ${pythonFunctionName}(*args)
    print(json.dumps(result))
    sys.exit(0)
except Exception as e:
    print(json.dumps({"error": str(e)}), file=sys.stderr)
    sys.exit(1)
`;

    tempFile = await createTempFile(wrapperCode, 'py');
    
    const { stdout, stderr } = await execAsync(`python "${tempFile}"`, {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && stderr.includes('error')) {
      const errorObj = JSON.parse(stderr);
      return { output: null, error: errorObj.error };
    }

    const result = JSON.parse(stdout.trim());
    return { output: result };
  } catch (err: any) {
    if (err.killed) {
      return { output: null, error: 'Execution timeout' };
    }
    return { output: null, error: err.message };
  } finally {
    if (tempFile) await cleanupTempFile(tempFile);
  }
}

// Run Java code
export async function runJava(code: string, testCase: TestCase, functionName: string): Promise<RunResult> {
  let tempFile: string | null = null;
  
  try {
    // Extract the return type from the function signature
    const returnTypeMatch = code.match(/public\s+static\s+(\w+)\s+/);
    const returnType = returnTypeMatch ? returnTypeMatch[1] : 'int';
    
    // Create Java wrapper code with main method
    const wrapperCode = `
import java.util.*;

${code.replace('public class Solution', 'class Solution')}

public class Main {
    public static void main(String[] args) {
        try {
            Object[] testInputs = ${JSON.stringify(testCase.input)};
            Object result = null;
            
            ${generateJavaCallCode(functionName, testCase.input, returnType)}
            
            System.out.println(toJson(result));
        } catch (Exception e) {
            System.err.println("{\\"error\\": \\"" + e.getMessage() + "\\"}");
            System.exit(1);
        }
    }
    
    private static String toJson(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) return "\\"" + obj + "\\"";
        if (obj instanceof Boolean || obj instanceof Number) return obj.toString();
        if (obj instanceof int[]) {
            int[] arr = (int[]) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        return obj.toString();
    }
}
`;

    tempFile = await createTempFile(wrapperCode, 'java');
    const dir = path.dirname(tempFile);
    
    // Compile Java code
    await execAsync(`javac "${tempFile}"`, {
      timeout: 10000,
      cwd: dir,
    });
    
    // Run Java code
    const { stdout, stderr } = await execAsync(`java -cp "${dir}" Main`, {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && stderr.includes('error')) {
      return { output: null, error: stderr };
    }

    const result = JSON.parse(stdout.trim());
    return { output: result };
  } catch (err: any) {
    if (err.killed) {
      return { output: null, error: 'Execution timeout' };
    }
    return { output: null, error: err.message };
  } finally {
    if (tempFile) await cleanupTempFile(tempFile);
  }
}

// Run C++ code
export async function runCpp(code: string, testCase: TestCase, functionName: string): Promise<RunResult> {
  let tempFile: string | null = null;
  
  try {
    // Create C++ wrapper code with main function
    const wrapperCode = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

${code}

string toJson(int val) { return to_string(val); }
string toJson(bool val) { return val ? "true" : "false"; }
string toJson(const string& val) { return "\\"" + val + "\\""; }
string toJson(const vector<int>& val) {
    stringstream ss;
    ss << "[";
    for (size_t i = 0; i < val.size(); i++) {
        if (i > 0) ss << ",";
        ss << val[i];
    }
    ss << "]";
    return ss.str();
}

int main() {
    try {
        ${generateCppCallCode(functionName, testCase.input)}
        cout << toJson(result) << endl;
        return 0;
    } catch (const exception& e) {
        cerr << "{\\"error\\": \\"" << e.what() << "\\"}" << endl;
        return 1;
    }
}
`;

    tempFile = await createTempFile(wrapperCode, 'cpp');
    const dir = path.dirname(tempFile);
    const basename = path.basename(tempFile, '.cpp');
    const exeFile = path.join(dir, basename);
    
    // Compile C++ code
    await execAsync(`g++ "${tempFile}" -o "${exeFile}" -std=c++11`, {
      timeout: 10000,
    });
    
    // Run C++ code
    const { stdout, stderr } = await execAsync(`"${exeFile}"`, {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });

    if (stderr && stderr.includes('error')) {
      return { output: null, error: stderr };
    }

    const result = JSON.parse(stdout.trim());
    return { output: result };
  } catch (err: any) {
    if (err.killed) {
      return { output: null, error: 'Execution timeout' };
    }
    return { output: null, error: err.message };
  } finally {
    if (tempFile) await cleanupTempFile(tempFile);
  }
}

// Helper to generate Java call code
function generateJavaCallCode(functionName: string, inputs: any[], returnType: string): string {
  const args = inputs.map((input, i) => {
    if (typeof input === 'string') return `"${input}"`;
    if (typeof input === 'number') return input.toString();
    if (typeof input === 'boolean') return input.toString();
    if (Array.isArray(input)) {
      return `new int[]{${input.join(',')}}`;
    }
    return input.toString();
  }).join(', ');
  
  return `result = Solution.${functionName}(${args});`;
}

// Helper to generate C++ call code
function generateCppCallCode(functionName: string, inputs: any[]): string {
  const args = inputs.map(input => {
    if (typeof input === 'string') return `"${input}"`;
    if (typeof input === 'number') return input.toString();
    if (typeof input === 'boolean') return input ? 'true' : 'false';
    if (Array.isArray(input)) {
      return `vector<int>{${input.join(',')}}`;
    }
    return input.toString();
  }).join(', ');
  
  return `auto result = ${functionName}(${args});`;
}

