#!/bin/bash
# Script E2E : Démarre le backend Django + frontend Vite + lance les tests Playwright
set -e

BACKEND_DIR="/home/tiavina/Téléchargements/ENENI-main/Backend"
FRONTEND_DIR="/home/tiavina/Téléchargements/ENENI-main/frontend"
PYTHON="/home/tiavina/Téléchargements/ENENI-main/env/bin/python"

echo "=== 1. Création des données de test ==="
cd "$BACKEND_DIR"
$PYTHON manage.py shell < "$FRONTEND_DIR/tests/e2e/setup_test_data.py" 2>&1

echo ""
echo "=== 2. Démarrage du backend Django sur le port 8000 ==="
$PYTHON manage.py runserver 0.0.0.0:8000 --noreload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
sleep 3

# Vérifier que le backend tourne
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERREUR: Le backend n'a pas démarré"
    exit 1
fi
echo "✓ Backend démarré"

echo ""
echo "=== 3. Démarrage du frontend Vite sur le port 5173 ==="
cd "$FRONTEND_DIR"
npx vite --port 5173 --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
sleep 5

# Vérifier que le frontend tourne
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "ERREUR: Le frontend n'a pas démarré"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo "✓ Frontend démarré"

echo ""
echo "=== 4. Lancement des tests Playwright ==="
cd "$FRONTEND_DIR"
npx playwright test --config=playwright.config.js || TEST_EXIT_CODE=$?

echo ""
echo "=== 5. Nettoyage ==="
kill $BACKEND_PID 2>/dev/null || true
kill $FRONTEND_PID 2>/dev/null || true
wait $BACKEND_PID 2>/dev/null || true
wait $FRONTEND_PID 2>/dev/null || true

echo ""
if [ -n "$TEST_EXIT_CODE" ]; then
    echo "⚠️  Certains tests ont échoué (code: $TEST_EXIT_CODE)"
    exit $TEST_EXIT_CODE
else
    echo "✓ Tous les tests E2E ont réussi !"
    exit 0
fi
