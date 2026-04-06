#!/bin/bash
set -e

echo "Regenerating pnpm lockfile..."
cd /vercel/share/v0-project

# Remove old lockfile
rm -f pnpm-lock.yaml

# Install dependencies and generate new lockfile
pnpm install

echo "Lockfile regenerated successfully!"
