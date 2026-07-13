const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PYTHON_COMMANDS = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];

const runPython = (filepath, stdin) => {
  for (const command of PYTHON_COMMANDS) {
    const result = spawnSync(command, [filepath], {
      input: stdin,
      timeout: 5000,
      encoding: 'utf-8',
      shell: false
    });

    // result.error is set only when the binary itself cannot be spawned
    // (e.g. ENOENT). Move on to the next candidate command in that case.
    if (result.error && result.error.code === 'ENOENT') {
      continue;
    }
    return result;
  }
  return null;
};

exports.executePython = (code, stdin = "") => {
  // Create a temporary file
  const tmpDir = os.tmpdir();
  const filename = `pybe_${Date.now()}_${Math.floor(Math.random() * 10000)}.py`;
  const filepath = path.join(tmpDir, filename);

  try {
    fs.writeFileSync(filepath, code);

    const result = runPython(filepath, stdin);

    if (!result) {
      return {
        run: {
          output: "",
          stderr: 'Python interpreter not found. Please install Python and ensure it is on the PATH.',
          code: null
        }
      };
    }

    return {
      run: {
        output: result.stdout ? result.stdout.trim() : "",
        stderr: result.stderr ? result.stderr.trim() : "",
        code: result.status
      }
    };
  } catch (err) {
    return {
      run: {
        output: "",
        stderr: err.message,
        code: 1
      }
    };
  } finally {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (e) {
      console.error("Failed to delete temp file:", e);
    }
  }
};
