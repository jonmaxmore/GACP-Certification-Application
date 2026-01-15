import json
import sys

try:
    with open('lint_results_clean.json', 'r', encoding='utf-8', errors='replace') as f:
        data = json.load(f)
except Exception as e:
    print(f"Error reading JSON: {e}")
    sys.exit(1)

files_with_errors = []
for entry in data:
    if entry['errorCount'] > 0 or entry['warningCount'] > 0:
        file_path = entry['filePath']
        messages = []
        for msg in entry['messages']:
            messages.append({
                'line': msg.get('line'),
                'column': msg.get('column'),
                'severity': 'ERROR' if msg.get('severity') == 2 else 'WARNING',
                'ruleId': msg.get('ruleId'),
                'message': msg.get('message')
            })
        files_with_errors.append({
            'file': file_path,
            'errors': entry['errorCount'],
            'warnings': entry['warningCount'],
            'messages': messages
        })

# Sort by number of errors
files_with_errors.sort(key=lambda x: x['errors'], reverse=True)

with open('parsed_lint.txt', 'w', encoding='utf-8') as out:
    for item in files_with_errors:
        out.write(f"\nFILE: {item['file']}\n")
        out.write(f"Total: {item['errors']} errors, {item['warnings']} warnings\n")
        for msg in item['messages']:
            out.write(f"  [{msg['severity']}] L{msg['line']}:C{msg['column']} ({msg['ruleId']}) {msg['message']}\n")
