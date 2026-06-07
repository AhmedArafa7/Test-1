import re

file_path = r'c:\Users\LENOVO\OneDrive\سطح المكتب\Test-1\src\app\features\properties\property-list\property-list.ts'
content = open(file_path, encoding='utf-8').read()

# Let's find 'clearAllCompare() {' and remove everything after it up to the closing class brace.
idx = content.find('clearAllCompare() {')
if idx != -1:
    content = content[:idx] + '}\n'

open(file_path, 'w', encoding='utf-8').write(content)
print("SUCCESS")
