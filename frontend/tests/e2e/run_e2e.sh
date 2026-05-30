#!/bin/bash
set -e

BACKEND_DIR="/home/tiavina/Téléchargements/ENENI-main/Backend"
FRONTEND_DIR="/home/tiavina/Téléchargements/ENENI-main/frontend"
PYTHON="python3"

echo "=== 1. Création des données de test ==="
cd "$BACKEND_DIR"
$PYTHON manage.py shell < "$FRONTEND_DIR/tests/e2e/setup_test_data.py" 2>&1 || echo "WARN: Setup may have partial errors"

echo ""
echo "=== 2. Démarrage backend Django ==="
cd "$BACKEND_DIR"
$PYTHON manage.py runserver 0.0.0.0:8000 --noreload &
BACKEND_PID=$!
sleep 4
if ! kill -0 $BACKEND_PID 2>/dev/null; then echo "ERREUR: Backend"; exit 1; fi
echo "✓ Backend (PID $BACKEND_PID)"

echo ""
echo "=== 3. Démarrage frontend Vite ==="
cd "$FRONTEND_DIR"
npx vite --port 5173 --host 0.0.0.0 &
FRONTEND_PID=$!
sleep 6
if ! kill -0 $FRONTEND_PID 2>/dev/null; then echo "ERREUR: Frontend"; kill $BACKEND_PID 2>/dev/null; exit 1; fi
echo "✓ Frontend (PID $FRONTEND_PID)"

echo ""
echo "=== 4. Test de connexion ==="
curl -sf http://localhost:8000/api/etablissements/ > /dev/null && echo "✓ Backend répond" || echo "⚠️ Backend ne répond pas"
curl -sf -o /dev/null http://localhost:5173/ > /dev/null && echo "✓ Frontend répond" || echo "⚠️ Frontend ne répond pas"

echo ""
echo "=== 5. Lancement des tests Playwright ==="
cd "$FRONTEND_DIR"
npx playwright test --config=playwright.config.js
EXIT_CODE=$?

echo ""
echo "=== 6. Arrêt des serveurs ==="
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

if [ $EXIT_CODE -eq 0 ]; then
  echo "✓ Tous les tests E2E ont réussi !"
else
  echo "⚠️  $EXIT_CODE tests ont échoué"
fi
exit $EXIT_CODE
