# CAHIER DES CHARGES & PROMPT ANTIGRAVITY
## PROJET : MYCTML (Cabinet Technique & Assistant IA de DIGICAB)

![Armoiries Mairie de Libreville](logo.png)

> **Système d'ingestion intelligente de courriers administratifs, déchiffrage IA (Gemini Multimodal) et synchronisation directe avec le système DIGICAB de la Mairie de Libreville.**

---

## 📌 1. LE PROMPT À COPIER-COLLER DANS GOOGLE ANTIGRAVITY

Copiez l'intégralité du bloc ci-dessous dans votre invite Antigravity pour lancer le développement :

```markdown
Bonjour Antigravity,

Nous validons immédiatement les deux prochaines étapes proposées :
1. Configuration et intégration de la clé d'API Gemini (analyse multimodale pour la transcription des tampons administratifs, annotations manuscrites et synthèse de courriers).
2. Développement de l'interface Web complète : l'application s'appelle officiellement "MYCTML" (Mon Cabinet Technique - Mairie de Libreville), conçue comme le module satellite et compagnon d'ingestion de notre système central "DIGICAB".

Voici le cahier des charges complet et les spécifications d'intégration avec DIGICAB :

---

### I. IDENTITÉ VISUELLE & LOGO OFFICIEL
- Nom de l'application : MYCTML (Mon Cabinet Technique • Mairie de Libreville)
- Sous-titre : Assistant d'Instruction IA & Passerelle d'Ingestion DIGICAB
- Logo officiel : Intégrer les Armoiries officielles de la Mairie de Libreville (`logo.png` : les deux lions marins d'or, les drapeaux tricolores Gabonais Vert-Jaune-Bleu, la couronne murale et le blason historique du navire libérateur).
- Palette graphique : Couleurs institutionnelles haut de gamme (Bleu Nuit / Marine #0B132B, Or Républicain #D4AF37, fond clair épuré et typographie avec empattements pour les titres officiels).

---

### II. RÔLE FONCTIONNEL DE "MYCTML"
MYCTML est l'outil quotidien du Conseiller Technique du Maire (CTML) pour traiter le flux entrant de parapheurs, courriers et dossiers papier avant leur enregistrement formel dans DIGICAB :
1. Ingestion de documents : Dépôt direct (glisser-déposer de scans, photos ou PDF de courriers officiels).
2. Analyse IA Multimodale (Gemini 2.5 / Flash) :
   - Détection et transcription fidèle des tampons officiels (date d'arrivée, numéro d'enregistrement du Secrétariat Particulier ou Général).
   - Déchiffrage des apostilles et annotations manuscrites du Maire ou des Conseillers (ex : « Pour attribution », « Me voir avec le dossier », « Urgent sous 48h », « Projet de réponse svp »).
   - Extraction structurée : Objet du courrier, Expéditeur (Ministère, Direction, Société prestataire, Particulier), Date du document, Références.
   - Génération d'une note de synthèse exécutive pour le Maire (3 à 5 points d'analyse et recommandations d'orientation).
3. Contrôle & Validation CTML :
   - Écran de validation interactif (visualiseur du document à gauche, fiche pré-remplie par l'IA à droite).
   - Possibilité de corriger ou compléter les champs en un clic.
4. Passerelle d'Export Direct vers DIGICAB :
   - Génération automatique du numéro de dossier au format DIGICAB (`CAB-ML-YYYY-XXXX`).
   - Affectation du circuit de validation DIGICAB préconisé (Normal SP, Normal SC, Digitalisation, Express Cabinet, Confidentiel ML, Direction Générale).
   - Sélection de l'Unité RMO de destination (Secrétariat Particulier, DGSTM, DGAF, Affaires Juridiques, etc.).
   - Qualification de la priorité (Faible, Normale, Urgente, Très Urgente).
   - Envoi du dossier complet (métadonnées + PDF + synthèse) vers l'API DIGICAB (`POST /api/dossiers`).

---

### III. ARCHITECTURE TECHNIQUE & CONFIGURATION GEMINI
1. Clé d'API Gemini :
   - Déclarer `GEMINI_API_KEY` dans `.env.example` et gérer la clé côté serveur uniquement.
   - Utiliser le SDK moderne `@google/genai` avec le modèle multimodal adapté à l'analyse de documents haute résolution.
   - Prompt système calibré pour les spécificités de l'administration publique gabonaise et le protocole municipal de Libreville.
2. Architecture Full-Stack :
   - Backend Express + Vite / React + TypeScript + Tailwind CSS.
   - Composant Drag-and-Drop avec aperçu visuel instantané.
   - Module d'export JSON / Webhook compatible avec la base SQLite / REST de DIGICAB.

Merci de générer le code complet et opérationnel de MYCTML selon ces spécifications.
```

---

## 🏛️ 2. STRUCTURE DES DONNÉES ÉCHANGÉES ENTRE MYCTML ET DIGICAB

Lorsque **MYCTML** analyse un document et que le Conseiller Technique clique sur **"Transmettre à DIGICAB"**, le format de données transmis au système central DIGICAB est le suivant :

```json
{
  "number": "CAB-ML-2026-0042",
  "object": "Demande d'autorisation de travaux d'aménagement voirie - Boulevard Triomphal",
  "entreprise": "SOCOBA-EDTP",
  "sender_name": "Direction Générale SOCOBA",
  "priority": "Urgente",
  "circuit": "Normal SP",
  "status": "EN_ATTENTE_SIGNATURE",
  "rmo_code": "DGSTM",
  "summary_note": "Courrier sollicitant une autorisation spéciale de circulation et travaux de nuit. Délai critique estimé à 72h. Avis technique préalable DGSTM recommandé avant signature du Maire.",
  "extracted_stamps": [
    {
      "entity": "CABINET DU MAIRE - COURRIER ARRIVEE",
      "date": "2026-09-07",
      "reference": "ARR-742/26"
    }
  ],
  "handwritten_annotations": [
    "Pour avis technique DGSTM et projet d'arrêté avant vendredi. ML"
  ],
  "file_url": "/uploads/dossier_742.pdf"
}
```

---

## 🎨 3. INTÉGRATION DU LOGO OFFICIEL DE LA MAIRIE DE LIBREVILLE

Le logo fourni (`logo.png`) représente les **Grandes Armoiries officielles de la Mairie de Libreville** :
- **Tenants** : Deux lions marins d'or rugissants soutenant l'écu.
- **Drapeaux** : Deux hampes portant le drapeau tricolore de la République Gabonaise (Vert, Jaune, Bleu).
- **Couronne** : Couronne murale crénelée en maçonnerie dorée (symbole républicain de la cité).
- **Écu héraldique** : 
  - Chef : La chaîne brisée et le navire libérateur en mémoire de la fondation de Libreville (1849).
  - Cœur : Soleil rayonnant d'or sur champ d'azur.
  - Pointe : Bandes vertes et ondes marines symbolisant l'Estuaire du Komo et l'Océan Atlantique.
- **Devise** : Banderole inférieure avec la mention officielle **« LIBREVILLE »**.

### Recommandations d'affichage dans MYCTML :
- **En-tête (Navbar)** : Blason en 48x48px ou 56x56px avec bordure dorée et ombre portée subtile.
- **Écran de chargement (Splash Screen)** : Blason centré en 120x120px avec lueur dorée et apparition animée.
- **Fiches de synthèse imprimables (Bordereaux)** : Blason officiel en haut à gauche face à la mention *« RÉPUBLIQUE GABONAISE • VILLE DE LIBREVILLE • CABINET DU MAIRE »*.

---

## ⚙️ 4. WORKFLOW COMPLET DU TRAITEMENT D'UN DOSSIER

```
[ COURRIER PAPIER ]
        │
        ▼ (Scan ou Photo Haute Définition)
[ GLISSER-DÉPOSER DANS MYCTML ]
        │
        ▼
[ ANALYSE MULTIMODALE GEMINI ]
  ├── 1. Transcription des tampons administratifs
  ├── 2. Déchiffrage des mentions manuscrites du Maire
  ├── 3. Détection automatique de l'expéditeur et de l'urgence
  └── 4. Rédaction de la note de synthèse exécutive
        │
        ▼
[ CONTRÔLE PAR LE CONSEILLER TECHNIQUE (CTML) ]
  ├── Vérification des champs extraits
  └── Validation ou ajustement en un clic
        │
        ▼
[ BOUTON "TRANSMETTRE À DIGICAB" ]
        │
        ▼
[ INJECTION DANS DIGICAB ]
  ├── Dossier créé sous référence CAB-ML-...
  ├── Notification automatique à l'unité RMO concernée
  └── Suivi des délais légaux (SLA) & Parapheur électronique
```
