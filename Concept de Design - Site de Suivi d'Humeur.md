# Concept de Design - Site de Suivi d'Humeur

## Vision Générale
Créer un site web de suivi d'humeur avec un design **inhabituel et attrayant** qui combine :
- **Glassmorphism** : Effets de verre translucide avec flou d'arrière-plan
- **Géométrie abstraite** : Formes géométriques colorées et dynamiques
- **Palette de couleurs vibrantes** : Dégradés colorés et contrastes élevés
- **Animations fluides** : Micro-interactions et transitions douces

## Palette de Couleurs
- **Primaire** : Dégradé violet-rose (#6366f1 → #ec4899)
- **Secondaire** : Dégradé cyan-bleu (#06b6d4 → #3b82f6)
- **Accent** : Orange vif (#f97316), Vert émeraude (#10b981)
- **Neutre** : Blanc translucide, Gris foncé (#1f2937)
- **Arrière-plan** : Dégradé sombre avec formes géométriques animées

## Typographie
- **Titre principal** : Police moderne sans-serif (Inter/Poppins) - 48px
- **Sous-titres** : 24px, poids semi-bold
- **Corps de texte** : 16px, poids normal
- **Boutons** : 14px, poids medium

## Éléments Visuels Uniques

### 1. Sélecteur d'Humeur Innovant
- **Forme** : Cercle central avec émojis flottants autour
- **Interaction** : Les émojis gravitent autour du centre, grossissent au survol
- **Effet** : Particules colorées qui s'échappent lors de la sélection
- **Animation** : Rotation douce et pulsation des éléments

### 2. Cartes Glassmorphism
- **Arrière-plan** : Verre translucide avec flou (backdrop-filter: blur(20px))
- **Bordures** : Gradient subtil avec opacité
- **Ombres** : Multiples ombres colorées pour effet de profondeur
- **Contenu** : Texte contrasté sur fond semi-transparent

### 3. Visualisation des Données
- **Graphique en forme d'onde** : Représentation fluide de l'humeur dans le temps
- **Particules interactives** : Points colorés qui bougent selon l'humeur
- **Heatmap émotionnelle** : Grille colorée montrant les patterns d'humeur

### 4. Arrière-plan Dynamique
- **Formes géométriques flottantes** : Triangles, cercles, hexagones en mouvement
- **Dégradés animés** : Couleurs qui changent subtilement
- **Effet parallaxe** : Mouvement différentiel des couches

## Architecture du Site

### Page Principale
1. **Header glassmorphism** avec navigation fluide
2. **Section héro** avec sélecteur d'humeur central
3. **Dashboard** avec cartes de statistiques
4. **Historique** avec visualisation en vague
5. **Footer** minimaliste

### Fonctionnalités Clés
- **Sélection d'humeur** : Interface circulaire avec 7 émojis (😢😔😐🙂😊😄😍)
- **Notes rapides** : Zone de texte avec auto-sauvegarde
- **Statistiques** : Moyennes, tendances, streaks
- **Historique** : Calendrier interactif et graphiques
- **Export** : Données JSON téléchargeables

## Interactions et Animations

### Micro-interactions
- **Hover** : Élévation des cartes avec changement d'ombre
- **Click** : Effet de ripple coloré
- **Scroll** : Parallaxe et révélation progressive
- **Loading** : Spinner avec particules colorées

### Transitions
- **Page** : Fade avec translation verticale (300ms ease-out)
- **Modales** : Scale avec backdrop blur (250ms ease-in-out)
- **Éléments** : Transform avec spring animation

## Responsive Design
- **Desktop** : Layout en grille avec sidebar
- **Tablet** : Stack vertical avec navigation en bas
- **Mobile** : Interface simplifiée avec gestes tactiles

## Accessibilité
- **Contraste** : Ratio minimum 4.5:1 pour le texte
- **Navigation** : Support clavier complet
- **Screen readers** : Labels ARIA appropriés
- **Animations** : Respect de prefers-reduced-motion

## Technologies
- **HTML5** : Structure sémantique
- **CSS3** : Grid, Flexbox, Custom Properties, Animations
- **JavaScript ES6+** : Modules, Classes, Async/Await
- **JSON** : Stockage local des données

Ce concept vise à créer une expérience utilisateur mémorable et engageante pour le suivi d'humeur, avec un design qui sort de l'ordinaire tout en restant fonctionnel et accessible.

