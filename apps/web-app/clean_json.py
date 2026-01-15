import json
import os

# Try different encodings
for enc in ['utf-8', 'utf-16', 'utf-16-le', 'cp1252']:
    try:
        with open('lint_results.json', 'r', encoding=enc) as f:
            content = f.read()
        if '[' in content:
            break
    except:
        continue

# Find the start of the JSON array
start_index = content.find('[')
if start_index != -1:
    json_content = content[start_index:]
    # Also find the end of the array to be safe
    end_index = json_content.rfind(']')
    if end_index != -1:
        json_content = json_content[:end_index+1]
        
        with open('lint_results_clean.json', 'w', encoding='utf-8') as f:
            f.write(json_content)
        print("Cleaned JSON saved to lint_results_clean.json")
    else:
        print("Could not find end of JSON array")
else:
    print("Could not find start of JSON array")
