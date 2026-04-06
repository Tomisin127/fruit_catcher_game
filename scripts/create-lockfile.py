import json
import subprocess

# Read package.json
with open('/vercel/share/v0-project/package.json', 'r') as f:
    package_json = json.load(f)

# Create minimal pnpm-lock.yaml structure
lockfile_content = """lockfileVersion: '9.0'

settings:
  autoInstallPeers: true
  excludeLinksFromLockfile: false

importers:
  .:
    dependencies:
"""

# Add all dependencies from package.json
for dep, version in package_json.get('dependencies', {}).items():
    lockfile_content += f"      {dep}: '{version}'\n"

lockfile_content += "\n    devDependencies:\n"

# Add all devDependencies from package.json
for dep, version in package_json.get('devDependencies', {}).items():
    lockfile_content += f"      {dep}: '{version}'\n"

# Write the lockfile
with open('/vercel/share/v0-project/pnpm-lock.yaml', 'w') as f:
    f.write(lockfile_content)

print("[v0] Created minimal pnpm-lock.yaml")
print(f"[v0] Added {len(package_json.get('dependencies', {}))} dependencies")
print(f"[v0] Added {len(package_json.get('devDependencies', {}))} devDependencies")
