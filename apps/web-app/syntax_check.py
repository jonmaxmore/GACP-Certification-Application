
import re

file_path = r"c:\Users\usEr\Documents\GitHub\GACP-Certification-Application\apps\web-app\src\app\farmer\applications\new\steps\StepDocuments.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)

def check_balance(text, open_char, close_char, name):
    count = 0
    for i, char in enumerate(text):
        if char == open_char:
            count += 1
        elif char == close_char:
            count -= 1
        
        if count < 0:
            print(f"Error: Unexpected closing {name} at character {i}")
            return False
    
    if count != 0:
        print(f"Error: Unbalanced {name}. Final count: {count} (positive means missing closing)")
        return False
    else:
        print(f"{name} seem balanced.")
        return True

check_balance(content, '(', ')', "Parentheses")
check_balance(content, '[', ']', "Brackets")
check_balance(content, '{', '}', "Braces")

# Check for simple JSX tag balance (very naive)
div_open = content.count("<div")
div_close = content.count("</div>")
print(f"Div tags: Open={div_open}, Close={div_close}")

