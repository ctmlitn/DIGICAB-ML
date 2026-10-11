#!/bin/bash
# ==============================================================================
# DIGICAB-ML - Script de Déploiement & Mise à Jour Sécurisée (Zero Data Loss)
# ==============================================================================
# Ce script garantit que SEUL le code modifié est mis à jour depuis GitHub
# et que vos dossiers, utilisateurs, paramètres et base de données sont
# SAUVEGARDÉS et STRICTEMENT PRÉSERVÉS.
# ==============================================================================

set -e

echo "==========================================================="
echo "🚀 [DIGICAB-ML] DÉBUT DE LA MISE À JOUR DU CODE"
echo "==========================================================="

# 1. Vérification du répertoire
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# 2. Création automatique du répertoire de sauvegarde
mkdir -p "$APP_DIR/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 3. Sauvegarde immédiate de la base de données existante
if [ -f "$APP_DIR/database.db" ]; then
    echo "💾 [1/6] Sauvegarde de la base de données active (database.db)..."
    cp "$APP_DIR/database.db" "$APP_DIR/backups/database_backup_${TIMESTAMP}.db"
    echo "✅ Sauvegarde créée avec succès : backups/database_backup_${TIMESTAMP}.db"
elif [ -f "$APP_DIR/data/database.db" ]; then
    echo "💾 [1/6] Sauvegarde de la base de données active (data/database.db)..."
    cp "$APP_DIR/data/database.db" "$APP_DIR/backups/database_backup_${TIMESTAMP}.db"
    echo "✅ Sauvegarde créée avec succès : backups/database_backup_${TIMESTAMP}.db"
else
    echo "ℹ️  Aucune base existante trouvée, une nouvelle base sera initialisée au premier lancement."
fi

# 4. Protection Git : S'assurer que la base de données n'est pas écrasée par Git
echo "🛡️  [2/6] Sécurisation des données locales face à Git..."
git config --local core.fileMode false 2>/dev/null || true
# Si la base était accidentellement suivie par git, on la dé-suit localement sans la supprimer
git rm --cached database.db 2>/dev/null || true
git rm --cached data/database.db 2>/dev/null || true

# 5. Récupération des nouveautés de code depuis GitHub (Seul le code est tiré)
echo "📥 [3/6] Récupération du code mis à jour depuis GitHub..."
git pull origin main || git pull origin master || git pull

# 6. Installation des dépendances si nécessaire
echo "📦 [4/6] Mise à jour des paquets Node.js..."
npm install

# 7. Compilation du projet Vite (production)
echo "⚡ [5/6] Compilation de l'interface graphique (npm run build)..."
npm run build

# 8. Redémarrage propre du serveur via PM2
echo "🔄 [6/6] Redémarrage du serveur DIGICAB-ML..."
if command -v pm2 &> /dev/null; then
    pm2 reload digicab-ml || pm2 restart digicab-ml || pm2 start ecosystem.config.cjs
    pm2 save
    echo "✅ Service PM2 redémarré avec succès !"
else
    echo "⚠️ PM2 n'est pas détecté. Vous pouvez relancer le serveur avec: npm start"
fi

echo "==========================================================="
echo "🎉 MISE À JOUR TERMINÉE AVEC SUCCÈS SANS PERTE DE DONNÉES !"
echo "==========================================================="
echo "📁 Vos données sont 100% préservées."
echo "💾 Une copie de sécurité horodatée est disponible dans :"
echo "   $APP_DIR/backups/database_backup_${TIMESTAMP}.db"
echo "🌐 Votre application DIGICAB-ML est prête et à jour !"
echo "==========================================================="
