# 🛡️ Guide Complet : Déploiement Hostinger & Zéro Perte de Données

Ce guide détaille pas à pas comment mettre à jour le code de **DIGICAB-ML** depuis GitHub vers votre serveur VPS Hostinger **sans jamais écraser vos données enregistrées** (dossiers, utilisateurs, paramètres, logos, etc.).

---

## 🔑 1. Identifiants de Connexion Administrateur

* **Nom d'utilisateur :** `admin`
* **Mot de passe :** `Nobo0605uqo!`
* **Rôle :** `ADMIN` (Accès complet à la configuration, aux dossiers et aux paramètres)

---

## 🎨 2. Personnalisation du Logo dans les Paramètres

Vous pouvez à tout moment modifier ou restaurer le logo directement depuis l'interface :

1. Connectez-vous en tant qu'administrateur (`admin`).
2. Cliquez sur l'onglet **Paramètres** (icône d'engrenage dans le menu de gauche).
3. Dans la sous-section **Identité & Affichage**, vous trouverez l'encadré dédié : **Logo & Armoiries de l'Application**.
4. Vous avez 3 modes au choix :
   * **📤 Téléverser un fichier (Upload) :** Glissez-déposez ou choisissez votre image (PNG, SVG, JPG, WebP).
   * **🏛️ Armoiries Officielles (Présélections) :** Sélectionnez en un clic le Blason vectoriel officiel ou le logo haute définition.
   * **🔗 URL Web :** Saisissez l'adresse URL directe d'une image.
5. Observez la **prévisualisation en temps réel** (sur la barre latérale, l'écran de connexion et les en-têtes officiels).
6. Cliquez sur **Enregistrer le Logo** (ou sur **Restaurer le Blason Officiel** si vous souhaitez revenir à l'emblème d'origine).

---

## 🏷️ 3. Titre de l'Onglet du Navigateur

Le titre de l'onglet affiche désormais :
```text
DIGICAB-ML
```
Il a été configuré dans le fichier `index.html` et synchronisé dynamiquement dans l'application avec le logo officiel en favicon.

---

## ❓ 4. Pourquoi perdiez-vous vos données lors des mises à jour ?

L'application stocke toutes ses données (dossiers, utilisateurs, paramètres) dans un fichier nommé **`database.db`** (base SQLite).

Lorsque vous mettiez à jour votre VPS auparavant :
1. Soit un nouveau fichier `database.db` (vide ou de test) était présent dans l'archive ou le dépôt GitHub et venait **remplacer** le fichier de votre serveur.
2. Soit la commande de mise à jour écrasait tout le dossier du serveur au lieu de ne mettre à jour que les fichiers de code source (`.tsx`, `.ts`, `.html`).

### Ce qui a été mis en place pour garantir ZÉRO PERTE :
* Le fichier `database.db` et tous ses dérivés sont désormais inscrits dans `.gitignore` : **Git ne touche plus et ne versionne plus la base de données**.
* Un script de déploiement sécurisé **`deploy.sh`** est inclus : avant chaque mise à jour, il crée une copie de sauvegarde horodatée dans un dossier `backups/`, puis ne télécharge que les modifications de code.

---

## 🚀 5. Procédure Pas-à-Pas pour un Déploiement Sécurisé

### Étape 1 : Envoyer le code modifié vers GitHub (Depuis votre ordinateur)

Dans le terminal de votre ordinateur (ou via VS Code / GitHub Desktop) :

```bash
# 1. Vérifiez les fichiers modifiés
git status

# 2. Ajoutez les fichiers de code (la base database.db est automatiquement ignorée)
git add .

# 3. Créez un commit avec un message descriptif
git commit -m "Mise a jour DIGICAB-ML : logo configurable, titre onglet et securite base"

# 4. Envoyez le code vers GitHub
git push origin main
```

---

### Étape 2 : Mettre à jour sur votre VPS Hostinger (Zéro Perte)

Connectez-vous à votre VPS Hostinger en SSH :
```bash
ssh root@IP_DE_VOTRE_VPS
```

Rendez-vous dans le dossier de votre application (par exemple `/var/www/digicab` ou le dossier où se trouve DIGICAB) :
```bash
cd /chemin/vers/votre/projet
```

#### Méthode Automatique Recommandée (1 seule commande) :
Lancez le script de déploiement sécurisé :
```bash
./deploy.sh
```

Ce script effectue automatiquement toutes les étapes suivantes en quelques secondes :
1. **Sauvegarde immédiate** de votre fichier `database.db` dans `backups/database_backup_AAAAMMJJ_HHMMSS.db`.
2. **Récupération du code modifié** depuis GitHub via `git pull` (sans toucher à vos données).
3. **Mise à jour des paquets** (`npm install`).
4. **Recompilation de l'interface** (`npm run build`).
5. **Redémarrage propre du serveur** via PM2 (`pm2 reload digicab-ml`).

---

### En cas de mise à jour manuelle (si vous n'utilisez pas deploy.sh)

Si vous préférez exécuter les commandes à la main sur le VPS :

```bash
# 1. Toujours faire une copie de secours de la base en premier lieu !
cp database.db database_backup_securite.db

# 2. Récupérer uniquement les changements de code depuis GitHub
git pull origin main

# 3. Installer les dépendances éventuelles
npm install

# 4. Compiler l'interface
npm run build

# 5. Redémarrer le serveur PM2
pm2 restart digicab-ml
```

Vos données restent intactes, vos dossiers créés sur le VPS sont conservés, et le code bénéficie de toutes les nouvelles fonctionnalités !
