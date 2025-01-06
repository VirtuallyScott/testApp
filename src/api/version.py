import subprocess
from typing import Optional
import os

def get_version() -> Optional[str]:
    try:
        if os.path.exists('.git'):
            # Try to get version from git tags
            version = subprocess.check_output(['git', 'describe', '--tags', '--always']).decode().strip()
            return version
        return "0.0.1"  # Fallback version if not in git repo
    except subprocess.CalledProcessError:
        return "0.0.1"  # Fallback version if git command fails
