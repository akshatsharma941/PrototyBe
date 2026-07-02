const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

exports.executePython = (code, stdin = "") => {
  // Create a temporary file
  const tmpDir = os.tmpdir();
  const filename = `pybe_${Date.now()}_${Math.floor(Math.random() * 10000)}.py`;
  const filepath = path.join(tmpDir, filename);
  
  try {
    fs.writeFileSync(filepath, code);
    
    // Spawn python process
    // Use 'python3' as it is standard on most macOS/Linux, fallback to python if needed but python3 is safer
    const result = spawnSync('python3', [filepath], {
      input: stdin,
      timeout: 5000,
      encoding: 'utf-8'
    });
    
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
