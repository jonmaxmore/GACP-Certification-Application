
import sys
import os

def extract_errors(filename):
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return

    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Simple split by newline and filter for "error"
    lines = content.split('\n')
    errors = [l for l in lines if 'error' in l.lower()]
    
    print(f"--- Found {len(errors)} errors ---")
    for err in errors:
        print(err)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_errors(sys.argv[1])
    else:
        print("Usage: python extract_errors.py <filename>")
