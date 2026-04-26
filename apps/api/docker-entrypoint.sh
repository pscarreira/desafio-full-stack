#!/bin/bash
set -e

echo "Rodando seed..."
node dist-seed/seed.js || true

echo "Iniciando API..."
exec node dist/src/main.js
