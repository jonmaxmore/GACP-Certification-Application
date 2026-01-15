
file_path = r"c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\apps\web-app\src\app\farmer\applications\new\steps\StepDocuments.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '`' in line:
        print(f"Line {i+1}: {line.strip()}")
