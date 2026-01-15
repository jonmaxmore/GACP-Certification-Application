import json
import os

try:
    with open('lint_results_clean.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error: {e}")
    exit(1)

# Filter files with errors
with_errors = [entry for entry in data if entry['errorCount'] > 0]
with_errors.sort(key=lambda x: x['errorCount'], reverse=True)

print(f"Top 10 files with errors:")
for entry in with_errors[:10]:
    # Use only basename for cleaner output
    fname = os.path.basename(entry['filePath'])
    print(f"{fname}: {entry['errorCount']} errors, {entry['warningCount']} warnings")
    # Show first 3 errors
    for msg in entry['messages'][:3]:
        if msg['severity'] == 2:
            print(f"  - L{msg['line']}: {msg['ruleId']} - {msg['message'][:100]}")
