# MoodFlow - Site de Suivi d'Humeur

Un site web moderne et interactif pour suivre votre humeur quotidienne avec un design glassmorphism inhabituel et attrayant.

## ✨ Fonctionnalités

### 🎯 Sélecteur d'Humeur Circulaire
- Interface circulaire innovante avec 7 niveaux d'humeur
- Émojis interactifs avec animations de particules
- Sélection intuitive avec effets visuels

### 📊 Tableau de Bord Interactif
- **Humeur actuelle** : Affichage de votre état du jour
- **Série actuelle** : Compteur de jours consécutifs
- **Moyenne hebdomadaire** : Tendance avec indicateur d'évolution
- **Total d'entrées** : Statistiques globales

### 📈 Visualisations Avancées
- **Graphique en vague** : Évolution de l'humeur sur 7/30/90 jours
- **Calendrier interactif** : Vue mensuelle avec codes couleur
- **Répartition des humeurs** : Statistiques détaillées
- **Patterns hebdomadaires** : Analyse par jour de la semaine

### 💾 Stockage Local
- Sauvegarde automatique dans le navigateur (localStorage)
- Export des données au format JSON
- Import/export pour sauvegarde et migration

## 🎨 Design Unique

### Glassmorphism
- Effets de verre translucide avec flou d'arrière-plan
- Bordures subtiles et ombres colorées
- Transparence et profondeur visuelle

### Animations Fluides
- Formes géométriques flottantes en arrière-plan
- Particules colorées lors des interactions
- Transitions douces et micro-interactions
- Effets de ripple sur les clics

### Palette de Couleurs
- **Primaire** : Dégradé violet-rose (#6366f1 → #ec4899)
- **Secondaire** : Dégradé cyan-bleu (#06b6d4 → #3b82f6)
- **Accents** : Orange vif (#f97316), Vert émeraude (#10b981)

## 🚀 Technologies Utilisées

- **HTML5** : Structure sémantique et accessible
- **CSS3** : Grid, Flexbox, Custom Properties, Animations avancées
- **JavaScript ES6+** : Classes, Modules, Async/Await
- **JSON** : Stockage et export des données
- **Canvas API** : Graphiques personnalisés

## 📱 Responsive Design

- **Desktop** : Layout en grille avec navigation horizontale
- **Tablet** : Adaptation des cartes et navigation
- **Mobile** : Interface optimisée avec gestes tactiles

## 🔧 Installation et Utilisation

1. **Téléchargez** tous les fichiers du projet
2. **Ouvrez** `index.html` dans votre navigateur
3. **Sélectionnez** votre humeur du jour
4. **Ajoutez** une note optionnelle
5. **Enregistrez** pour commencer votre suivi

## 📁 Structure du Projet

```
mood-tracker/
├── index.html          # Page principale
├── styles.css          # Styles et animations
├── script.js           # Logique JavaScript
└── README.md           # Documentation
```

## 🎯 Fonctionnalités Détaillées

### Sélection d'Humeur
- 7 niveaux : Très triste, Triste, Neutre, Bien, Heureux, Très heureux, Extatique
- Animation de particules colorées lors de la sélection
- Mise à jour en temps réel du centre du sélecteur

### Notes Personnelles
- Zone de texte avec compteur de caractères (500 max)
- Sauvegarde automatique avec l'humeur
- Affichage dans l'historique et les tooltips

### Statistiques Avancées
- Calcul automatique des moyennes et tendances
- Détection des patterns hebdomadaires
- Répartition en pourcentages des différentes humeurs

### Export/Import
- Export JSON avec toutes les données
- Format compatible pour import dans d'autres applications
- Fonction de suppression avec confirmation

## 🌟 Caractéristiques Techniques

### Performance
- Animations optimisées avec `requestAnimationFrame`
- Gestion efficace de la mémoire pour les particules
- Lazy loading des visualisations complexes

### Accessibilité
- Navigation au clavier complète
- Labels ARIA pour les lecteurs d'écran
- Contraste de couleurs respectant les standards WCAG
- Support de `prefers-reduced-motion`

### Compatibilité
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Support des fonctionnalités ES6+
- Fallbacks pour les anciennes versions

## 🔒 Confidentialité

- **Stockage 100% local** : Aucune donnée n'est envoyée sur internet
- **Pas de cookies** : Utilisation uniquement du localStorage
- **Contrôle total** : Export et suppression à tout moment

## 🎨 Personnalisation

Le design peut être facilement personnalisé en modifiant les variables CSS dans `:root` :

```css
:root {
    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    --secondary-gradient: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    /* ... autres variables */
}
```

## 🐛 Support

Pour toute question ou problème :
1. Vérifiez que JavaScript est activé
2. Utilisez un navigateur moderne
3. Consultez la console pour les erreurs

## 📄 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

---

**MoodFlow** - Créé avec ❤️ pour votre bien-être quotidien

