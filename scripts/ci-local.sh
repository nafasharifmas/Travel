#!/usr/bin/env bash
set -e

echo "=========================================="
echo " Visitflow: Running Local CI Validation"
echo "=========================================="

echo -e "\n[1/3] Running Frontend Linter (oxlint)..."
npm --prefix frontend run lint

echo -e "\n[2/3] Running Frontend TypeScript Build..."
npm --prefix frontend run build

echo -e "\n[3/3] Running Backend Tests (PHPUnit)..."
(
  cd backend
  export DB_CONNECTION=sqlite
  export DB_DATABASE=:memory:
  php artisan test
)

echo -e "\n=========================================="
echo " ALL CI CHECKS PASSED SUCCESSFULLY!"
echo "=========================================="

