import subprocess
from typing import Optional

def get_version() -> Optional[str]:
    try:
        # Get version from GitVersion if available
        version = subprocess.check_output(['gitversion', '/showvariable', 'SemVer']).decode().strip()
        return version
    except:
        return "0.0.1"  # Fallback version
