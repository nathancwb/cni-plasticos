import glob
import re

html_files = ['about.html', 'services.html', 'produtos.html', 'blog.html', 'contact.html']

pattern = re.compile(
    r'(<header class="header">\s*<div class="container header-container">.*?)'
    r'(\s*<button class="menu-toggle".*?</button>\s*</div>\s*</header>)\s*'
    r'(<nav class="nav">.*?</nav>)',
    re.DOTALL
)

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = pattern.sub(r'\1\n\3\2', content)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file}")
