const fs = require('fs');

try {
    const content = fs.readFileSync('lint_report_clean.json', 'utf8').replace(/^\uFEFF/, '');
    const report = JSON.parse(content);
    let errorCount = 0;
    let output = '';
    report.forEach(file => {
        const errors = file.messages.filter(m => m.severity === 2);
        if (errors.length > 0) {
            output += `\n📄 File: ${file.filePath}\n`;
            errors.forEach(err => {
                output += `  ❌ [${err.line}:${err.column}] ${err.message} (${err.ruleId})\n`;
                errorCount++;
            });
        }
    });
    output += `\nTotal Errors: ${errorCount}\n`;
    fs.writeFileSync('errors_utf8.txt', output, 'utf8');
    console.log("Errors written to errors_utf8.txt");
} catch (e) {
    console.error("Failed to parse report:", e.message);
}
