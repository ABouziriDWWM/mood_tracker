// Configuration et constantes
const MOOD_CONFIG = {
  "very-sad": { value: 1, emoji: "😢", label: "Très triste", color: "#ef4444" },
  sad: { value: 2, emoji: "😔", label: "Triste", color: "#f97316" },
  neutral: { value: 3, emoji: "😐", label: "Neutre", color: "#eab308" },
  good: { value: 4, emoji: "🙂", label: "Bien", color: "#22c55e" },
  happy: { value: 5, emoji: "😊", label: "Heureux", color: "#3b82f6" },
  "very-happy": {
    value: 6,
    emoji: "😄",
    label: "Très heureux",
    color: "#8b5cf6",
  },
  ecstatic: { value: 7, emoji: "😍", label: "Extatique", color: "#ec4899" },
};

const STORAGE_KEYS = {
  USERS: "moodflow_users",
  CURRENT_USER: "moodflow_current_user",
  USER_DATA: "moodflow_user_data",
};

// Gestionnaire d'authentification
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkExistingSession();
  }

  setupEventListeners() {
    // Basculer entre connexion et inscription
    document.getElementById("show-register").addEventListener("click", () => {
      this.showRegisterForm();
    });

    document.getElementById("show-login").addEventListener("click", () => {
      this.showLoginForm();
    });

    // Formulaires
    document
      .getElementById("login-form-element")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleLogin();
      });

    document
      .getElementById("register-form-element")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleRegister();
      });

    // Boutons de basculement de mot de passe
    this.setupPasswordToggles();

    // Validation en temps réel
    this.setupRealTimeValidation();

    // Déconnexion
    document.getElementById("logout-btn").addEventListener("click", () => {
      this.showLogoutModal();
    });

    // Modale de déconnexion
    document
      .getElementById("close-logout-modal")
      .addEventListener("click", () => {
        this.hideLogoutModal();
      });

    document.getElementById("cancel-logout").addEventListener("click", () => {
      this.hideLogoutModal();
    });

    document.getElementById("confirm-logout").addEventListener("click", () => {
      this.logout();
      this.hideLogoutModal();
    });
  }

  setupPasswordToggles() {
    const toggles = document.querySelectorAll(".password-toggle");
    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const input = toggle.parentElement.querySelector(".form-input");
        const icon = toggle.querySelector(".toggle-icon");

        if (input.type === "password") {
          input.type = "text";
          icon.textContent = "🙈";
        } else {
          input.type = "password";
          icon.textContent = "👁️";
        }
      });
    });
  }

  setupRealTimeValidation() {
    // Validation du nom d'utilisateur lors de l'inscription
    const registerUsername = document.getElementById("register-username");
    registerUsername.addEventListener("input", () => {
      this.validateUsername(
        registerUsername.value,
        "register-username-validation"
      );
    });

    // Validation de l'email
    const registerEmail = document.getElementById("register-email");
    registerEmail.addEventListener("input", () => {
      this.validateEmail(registerEmail.value, "register-email-validation");
    });

    // Validation du mot de passe
    const registerPassword = document.getElementById("register-password");
    registerPassword.addEventListener("input", () => {
      this.validatePassword(
        registerPassword.value,
        "register-password-validation"
      );
      this.updatePasswordStrength(registerPassword.value);
    });

    // Validation de la confirmation de mot de passe
    const confirmPassword = document.getElementById(
      "register-confirm-password"
    );
    confirmPassword.addEventListener("input", () => {
      this.validatePasswordConfirmation(
        registerPassword.value,
        confirmPassword.value,
        "register-confirm-password-validation"
      );
    });

    // Validation de connexion
    const loginUsername = document.getElementById("login-username");
    loginUsername.addEventListener("input", () => {
      this.clearValidation("login-username-validation");
    });

    const loginPassword = document.getElementById("login-password");
    loginPassword.addEventListener("input", () => {
      this.clearValidation("login-password-validation");
    });
  }

  // Dans votre fichier script.js, modifiez les fonctions showRegisterForm/showLoginForm

  showRegisterForm() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    loginForm.classList.add("hidden");
    // Attendre la fin de l'animation avant de cacher complètement
    setTimeout(() => {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
      registerForm.classList.remove("hidden");
    }, 300); // 300ms correspond à la durée de l'animation
  }

  showLoginForm() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    registerForm.classList.add("hidden");
    setTimeout(() => {
      registerForm.style.display = "none";
      loginForm.style.display = "block";
      loginForm.classList.remove("hidden");
    }, 300);
  }

  async handleLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;

    // Validation basique
    if (!username || !password) {
      this.showValidation(
        "login-username-validation",
        "Veuillez remplir tous les champs",
        "error"
      );
      return;
    }

    // Vérification des identifiants
    const user = this.findUser(username);
    if (!user) {
      this.showValidation(
        "login-username-validation",
        "Utilisateur non trouvé",
        "error"
      );
      return;
    }

    const passwordHash = await this.hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      this.showValidation(
        "login-password-validation",
        "Mot de passe incorrect",
        "error"
      );
      return;
    }

    // Connexion réussie
    this.loginUser(user);
  }

  async handleRegister() {
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById(
      "register-confirm-password"
    ).value;
    const displayName = document
      .getElementById("register-display-name")
      .value.trim();

    // Validation complète
    let isValid = true;

    if (!this.validateUsername(username, "register-username-validation"))
      isValid = false;
    if (!this.validateEmail(email, "register-email-validation"))
      isValid = false;
    if (!this.validatePassword(password, "register-password-validation"))
      isValid = false;
    if (
      !this.validatePasswordConfirmation(
        password,
        confirmPassword,
        "register-confirm-password-validation"
      )
    )
      isValid = false;

    if (!isValid) return;

    // Vérifier si l'utilisateur existe déjà
    if (this.findUser(username) || this.findUserByEmail(email)) {
      this.showValidation(
        "register-username-validation",
        "Nom d'utilisateur ou email déjà utilisé",
        "error"
      );
      return;
    }

    // Créer le nouvel utilisateur
    const user = await this.createUser({
      username,
      email,
      password,
      displayName: displayName || username,
    });

    // Connexion automatique après inscription
    this.loginUser(user);
    this.showToast("Compte créé avec succès ! Bienvenue !", "success");
  }

  async createUser(userData) {
    const userId = this.generateUserId();
    const passwordHash = await this.hashPassword(userData.password);

    const user = {
      id: userId,
      username: userData.username,
      email: userData.email,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profile: {
        displayName: userData.displayName,
        avatar: this.getRandomAvatar(),
        preferences: {
          theme: "default",
          notifications: true,
        },
      },
    };

    this.users[userId] = user;
    this.saveUsers();

    // Initialiser les données utilisateur
    this.initializeUserData(userId);

    return user;
  }

  loginUser(user) {
    this.currentUser = user;
    user.lastLogin = new Date().toISOString();
    this.saveUsers();
    this.saveCurrentUser();

    // Mettre à jour l'interface
    this.updateUserInterface();
    this.hideLoginPage();
    this.showMainApp();

    // Initialiser le tracker d'humeur
    if (window.moodTracker) {
      window.moodTracker.switchUser(user.id);
    } else {
      window.moodTracker = new MoodTracker(user.id);
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    this.showLoginPage();
    this.hideMainApp();
    this.clearForms();

    this.showToast("Déconnexion réussie", "success");
  }

  checkExistingSession() {
    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUserId && this.users[savedUserId]) {
      this.loginUser(this.users[savedUserId]);
    } else {
      this.showLoginPage();
    }
  }

  // Validation des champs
  validateUsername(username, validationId) {
    if (!username) {
      this.showValidation(
        validationId,
        "Le nom d'utilisateur est requis",
        "error"
      );
      return false;
    }
    if (username.length < 3) {
      this.showValidation(
        validationId,
        "Au moins 3 caractères requis",
        "error"
      );
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.showValidation(
        validationId,
        "Seuls les lettres, chiffres et _ sont autorisés",
        "error"
      );
      return false;
    }
    if (this.findUser(username)) {
      this.showValidation(
        validationId,
        "Ce nom d'utilisateur est déjà pris",
        "error"
      );
      return false;
    }
    this.showValidation(
      validationId,
      "Nom d'utilisateur disponible",
      "success"
    );
    return true;
  }

  validateEmail(email, validationId) {
    if (!email) {
      this.showValidation(validationId, "L'email est requis", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showValidation(validationId, "Format d'email invalide", "error");
      return false;
    }
    if (this.findUserByEmail(email)) {
      this.showValidation(validationId, "Cet email est déjà utilisé", "error");
      return false;
    }
    this.showValidation(validationId, "Email valide", "success");
    return true;
  }

  validatePassword(password, validationId) {
    if (!password) {
      this.showValidation(validationId, "Le mot de passe est requis", "error");
      return false;
    }
    if (password.length < 6) {
      this.showValidation(
        validationId,
        "Au moins 6 caractères requis",
        "error"
      );
      return false;
    }

    const strength = this.calculatePasswordStrength(password);
    if (strength < 2) {
      this.showValidation(validationId, "Mot de passe trop faible", "warning");
      return false;
    }

    this.showValidation(validationId, "Mot de passe acceptable", "success");
    return true;
  }

  validatePasswordConfirmation(password, confirmPassword, validationId) {
    if (!confirmPassword) {
      this.showValidation(
        validationId,
        "Veuillez confirmer le mot de passe",
        "error"
      );
      return false;
    }
    if (password !== confirmPassword) {
      this.showValidation(
        validationId,
        "Les mots de passe ne correspondent pas",
        "error"
      );
      return false;
    }
    this.showValidation(validationId, "Mots de passe identiques", "success");
    return true;
  }

  calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return Math.min(strength, 4);
  }

  updatePasswordStrength(password) {
    const strengthElement = document.getElementById("password-strength");
    const strength = this.calculatePasswordStrength(password);

    strengthElement.className = "password-strength";

    if (strength === 0) {
      strengthElement.classList.add("weak");
    } else if (strength === 1) {
      strengthElement.classList.add("weak");
    } else if (strength === 2) {
      strengthElement.classList.add("fair");
    } else if (strength === 3) {
      strengthElement.classList.add("good");
    } else {
      strengthElement.classList.add("strong");
    }
  }

  showValidation(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `form-validation ${type}`;
  }

  clearValidation(elementId) {
    const element = document.getElementById(elementId);
    element.textContent = "";
    element.className = "form-validation";
  }

  // Utilitaires
  findUser(username) {
    return Object.values(this.users).find(
      (user) => user.username === username || user.email === username
    );
  }

  findUserByEmail(email) {
    return Object.values(this.users).find((user) => user.email === email);
  }

  generateUserId() {
    return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  getRandomAvatar() {
    const avatars = [
      "😊",
      "😄",
      "🙂",
      "😍",
      "🤗",
      "😎",
      "🥳",
      "🌟",
      "🦄",
      "🌈",
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  async hashPassword(password) {
    // Simple hachage pour la démo (en production, utiliser bcrypt ou similaire)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "moodflow_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Interface utilisateur
  updateUserInterface() {
    if (this.currentUser) {
      document.getElementById("user-avatar").textContent =
        this.currentUser.profile.avatar;
      document.getElementById("user-name").textContent =
        this.currentUser.profile.displayName;
    }
  }

  hideLoginPage() {
    document.getElementById("login-page").classList.add("hidden");
  }

  showLoginPage() {
    document.getElementById("login-page").classList.remove("hidden");
  }

  hideMainApp() {
    document.getElementById("main-app").classList.add("hidden");
  }

  showMainApp() {
    document.getElementById("main-app").classList.remove("hidden");
  }

  showLogoutModal() {
    document.getElementById("logout-modal").classList.add("active");
  }

  hideLogoutModal() {
    document.getElementById("logout-modal").classList.remove("active");
  }

  clearForms() {
    document.getElementById("login-form-element").reset();
    document.getElementById("register-form-element").reset();
    document.querySelectorAll(".form-validation").forEach((el) => {
      el.textContent = "";
      el.className = "form-validation";
    });
  }

  // Stockage
  loadUsers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      return {};
    }
  }

  saveUsers() {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des utilisateurs:", error);
    }
  }

  saveCurrentUser() {
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, this.currentUser.id);
    }
  }

  initializeUserData(userId) {
    const userData = {
      entries: {},
      settings: {},
    };

    try {
      const allUserData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER_DATA) || "{}"
      );
      allUserData[userId] = userData;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(allUserData));
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation des données utilisateur:",
        error
      );
    }
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}

// État global de l'application
class MoodTracker {
  constructor(userId) {
    this.userId = userId;
    this.currentMood = "happy";
    this.currentNote = "";
    this.data = this.loadUserData();
    this.currentDate = new Date();
    this.chartPeriod = 7;

    this.init();
  }

  // Changer d'utilisateur
  switchUser(userId) {
    this.userId = userId;
    this.data = this.loadUserData();
    this.updateUI();
    this.generateCalendar();
    this.createMoodChart();
  }

  // Charger les données de l'utilisateur actuel
  loadUserData() {
    try {
      const allUserData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER_DATA) || "{}"
      );
      return allUserData[this.userId] || { entries: {}, settings: {} };
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données utilisateur:",
        error
      );
      return { entries: {}, settings: {} };
    }
  }

  // Sauvegarder les données de l'utilisateur actuel
  saveUserData() {
    try {
      const allUserData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER_DATA) || "{}"
      );
      allUserData[this.userId] = this.data;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(allUserData));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des données utilisateur:",
        error
      );
    }
  }

  enableTouchScrolling() {
    document.addEventListener(
      "touchmove",
      function (e) {
        // Allow all touch moves (don't prevent default)
      },
      { passive: true }
    );
  }

  handleResize() {
    this.createMoodChart();
    this.generateCalendar();

    // Ajuster la taille du sélecteur d'humeur sur mobile
    const moodCircle = document.querySelector(".mood-circle");
    if (window.innerWidth < 768) {
      moodCircle.style.width = Math.min(window.innerWidth - 40, 300) + "px";
      moodCircle.style.height = moodCircle.style.width;
    } else {
      moodCircle.style.width = "";
      moodCircle.style.height = "";
    }
  }

  // Initialisation de l'application
  init() {
    this.setupEventListeners();
    this.updateUI();
    this.generateCalendar();
    this.createMoodChart();
    this.createParticles();
    this.startAnimations();
    this.enableTouchScrolling();

    // Gérer le redimensionnement
    window.addEventListener("resize", () => this.handleResize());
    this.handleResize(); // Appel initial
  }

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    // Sélection d'humeur
    document.querySelectorAll(".mood-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        this.selectMood(option.dataset.mood);
        // this.createRippleEffect(e);
      });
    });

    // Zone de notes
    const noteInput = document.getElementById("mood-note");
    noteInput.addEventListener("input", (e) => {
      this.currentNote = e.target.value;

      this.updateCharCounter();
    });

    // Bouton de sauvegarde
    document.getElementById("save-mood").addEventListener("click", (e) => {
      this.saveMoodEntry();
      this.createRippleEffect(e);
    });

    // Navigation du calendrier
    document.getElementById("prev-month").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.generateCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.generateCalendar();
    });

    // Contrôles du graphique
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".chart-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.chartPeriod = parseInt(btn.dataset.period);
        this.createMoodChart();
      });
    });

    // Export des données
    document.getElementById("export-json").addEventListener("click", () => {
      this.exportData();
    });

    // Suppression des données
    document.getElementById("clear-data").addEventListener("click", () => {
      this.showClearDataModal();
    });

    // Modale de confirmation
    document
      .getElementById("close-clear-modal")
      .addEventListener("click", () => {
        this.hideClearDataModal();
      });

    document.getElementById("cancel-clear").addEventListener("click", () => {
      this.hideClearDataModal();
    });

    document.getElementById("confirm-clear").addEventListener("click", () => {
      this.clearAllData();
      this.hideClearDataModal();
    });

    // Navigation fluide
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("href");
        if (target.startsWith("#")) {
          document.querySelector(target).scrollIntoView({
            behavior: "smooth",
          });

          // Mise à jour de la navigation active
          document
            .querySelectorAll(".nav-link")
            .forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    });

    // Fermeture des modales en cliquant à l'extérieur
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.hideClearDataModal();
      }
    });
  }

  // Sélection d'une humeur
  selectMood(moodKey) {
    this.currentMood = moodKey;

    // Mise à jour de l'interface
    document.querySelectorAll(".mood-option").forEach((option) => {
      option.classList.remove("active");
    });

    document.querySelector(`[data-mood="${moodKey}"]`).classList.add("active");

    // Mise à jour du centre du sélecteur
    const config = MOOD_CONFIG[moodKey];
    document.querySelector(".selected-mood-emoji").textContent = config.emoji;
    document.querySelector(".selected-mood-text").textContent = config.label;

    // Animation de particules
    this.createMoodParticles(config.color);

    // Vibration tactile (si supportée)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }

  // Sauvegarde d'une entrée d'humeur
  saveMoodEntry() {
    const today = new Date().toISOString().split("T")[0];
    const config = MOOD_CONFIG[this.currentMood];

    const entry = {
      date: today,
      mood: this.currentMood,
      value: config.value,
      emoji: config.emoji,
      label: config.label,
      note: this.currentNote.trim(),
      timestamp: Date.now(),
    };

    // Sauvegarde dans les données
    this.data.entries[today] = entry;
    this.saveUserData();

    // Réinitialisation de la note
    this.currentNote = "";
    document.getElementById("mood-note").value = "";
    this.updateCharCounter();

    // Mise à jour de l'interface
    this.updateUI();
    this.generateCalendar();
    this.createMoodChart();

    // Notification de succès
    this.showToast("Humeur sauvegardée avec succès !", "success");

    // Animation du bouton
    const saveBtn = document.getElementById("save-mood");
    saveBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
      saveBtn.style.transform = "";
    }, 150);
  }

  // Mise à jour de l'interface utilisateur
  updateUI() {
    this.updateCurrentMoodCard();
    this.updateStreakCard();
    this.updateAverageCard();
    this.updateTotalCard();
    this.updateExportInfo();
    this.updateMoodDistribution();
    this.updateWeeklyPatterns();
  }

  // Mise à jour de la carte d'humeur actuelle
  updateCurrentMoodCard() {
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = this.data.entries[today];

    if (todayEntry) {
      document.querySelector(".current-emoji").textContent = todayEntry.emoji;
      document.querySelector(".current-label").textContent = todayEntry.label;
      document.querySelector(".last-update").textContent =
        "Votre note actuelle: \t" + todayEntry.note || "Pas de note";
      document.getElementById("last-update-time").textContent = "Aujourd\\hui";
    } else {
      const config = MOOD_CONFIG[this.currentMood];
      document.querySelector(".current-emoji").textContent = config.emoji;
      document.querySelector(".current-label").textContent = config.label;
      document.getElementById("last-update-time").textContent =
        "Non enregistré";
    }
  }

  // Mise à jour de la carte de série
  updateStreakCard() {
    const streak = this.calculateStreak();
    document.getElementById("current-streak").textContent = streak;

    const streakUnit = document.querySelector(".streak-unit");
    streakUnit.textContent = streak > 1 ? "jours" : "jour";

    const streakDescription = document.querySelector(".streak-description");
    if (streak === 0) {
      streakDescription.textContent = "Commencez votre série !";
    } else if (streak < 7) {
      streakDescription.textContent = "Continuez comme ça !";
    } else if (streak < 30) {
      streakDescription.textContent = "Excellente habitude !";
    } else {
      streakDescription.textContent = "Incroyable régularité !";
    }
  }

  // Mise à jour de la carte de moyenne
  updateAverageCard() {
    const weekAverage = this.calculateWeekAverage();
    const previousWeekAverage = this.calculatePreviousWeekAverage();

    document.getElementById("week-average-score").textContent =
      weekAverage.toFixed(1);

    // Emoji basé sur la moyenne
    let emoji = "😐";
    if (weekAverage >= 6) emoji = "😍";
    else if (weekAverage >= 5) emoji = "😊";
    else if (weekAverage >= 4) emoji = "🙂";
    else if (weekAverage >= 3) emoji = "😐";
    else if (weekAverage >= 2) emoji = "😔";
    else emoji = "😢";

    document.getElementById("week-average-emoji").textContent = emoji;

    // Tendance
    const trendArrow = document.getElementById("trend-arrow");
    const trendText = document.getElementById("trend-text");

    if (weekAverage > previousWeekAverage) {
      trendArrow.textContent = "↗️";
      trendText.textContent = "En amélioration";
    } else if (weekAverage < previousWeekAverage) {
      trendArrow.textContent = "↘️";
      trendText.textContent = "En baisse";
    } else {
      trendArrow.textContent = "→";
      trendText.textContent = "Stable";
    }
  }

  // Mise à jour de la carte total
  updateTotalCard() {
    const total = Object.keys(this.data.entries).length;
    document.getElementById("total-entries").textContent = total;

    const totalUnit = document.querySelector(".total-unit");
    totalUnit.textContent = total > 1 ? "entrées" : "entrée";

    const totalDescription = document.querySelector(".total-description");
    if (total === 0) {
      totalDescription.textContent = "Commencez dès maintenant";
    } else {
      const firstEntry = Object.keys(this.data.entries).sort()[0];
      const firstDate = new Date(firstEntry);
      const now = new Date();
      const daysDiff = Math.floor((now - firstDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        totalDescription.textContent = "Depuis aujourd\\hui";
      } else if (daysDiff === 1) {
        totalDescription.textContent = "Depuis hier";
      } else {
        totalDescription.textContent = `Depuis ${daysDiff} jours`;
      }
    }
  }

  // Mise à jour des informations d'export
  updateExportInfo() {
    const total = Object.keys(this.data.entries).length;
    document.getElementById("export-total-entries").textContent = total;

    const exportDateRange = document.getElementById("export-date-range");
    if (total === 0) {
      exportDateRange.textContent = "Aucune donnée";
    } else {
      const dates = Object.keys(this.data.entries).sort();
      const firstDate = new Date(dates[0]).toLocaleDateString("fr-FR");
      const lastDate = new Date(dates[dates.length - 1]).toLocaleDateString(
        "fr-FR"
      );

      if (dates.length === 1) {
        exportDateRange.textContent = `Le ${firstDate}`;
      } else {
        exportDateRange.textContent = `Du ${firstDate} au ${lastDate}`;
      }
    }
  }

  // Calcul de la série actuelle
  calculateStreak() {
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (this.data.entries[dateStr]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calcul de la moyenne de la semaine
  calculateWeekAverage() {
    const today = new Date();
    const weekEntries = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (this.data.entries[dateStr]) {
        weekEntries.push(this.data.entries[dateStr].value);
      }
    }

    if (weekEntries.length === 0) return 0;
    return weekEntries.reduce((sum, val) => sum + val, 0) / weekEntries.length;
  }

  // Calcul de la moyenne de la semaine précédente
  calculatePreviousWeekAverage() {
    const today = new Date();
    const weekEntries = [];

    for (let i = 7; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (this.data.entries[dateStr]) {
        weekEntries.push(this.data.entries[dateStr].value);
      }
    }

    if (weekEntries.length === 0) return 0;
    return weekEntries.reduce((sum, val) => sum + val, 0) / weekEntries.length;
  }

  // Génération du calendrier
  generateCalendar() {
    const calendar = document.getElementById("mood-calendar");
    const monthElement = document.getElementById("current-month");

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Mise à jour du titre du mois
    monthElement.textContent = new Date(year, month).toLocaleDateString(
      "fr-FR",
      {
        month: "long",
        year: "numeric",
      }
    );

    // Effacement du calendrier précédent
    calendar.innerHTML = "";

    // Jours de la semaine
    const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    weekDays.forEach((day) => {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day-header";
      dayElement.textContent = day;
      dayElement.style.fontWeight = "600";
      dayElement.style.color = "var(--text-muted)";
      dayElement.style.textAlign = "center";
      dayElement.style.padding = "var(--spacing-sm)";
      calendar.appendChild(dayElement);
    });

    // Premier jour du mois et nombre de jours
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day";
      calendar.appendChild(emptyDay);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div");
      dayElement.className = "calendar-day";
      dayElement.textContent = day;

      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const entry = this.data.entries[dateStr];

      if (entry) {
        dayElement.classList.add("has-mood");
        dayElement.style.backgroundColor = MOOD_CONFIG[entry.mood].color;
        dayElement.style.color = "white";
        dayElement.title = `${entry.label}: ${entry.note || "Pas de note"}`;
      }

      // Jour actuel
      const today = new Date();
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate()
      ) {
        dayElement.style.border = "2px solid var(--primary-gradient)";
      }

      calendar.appendChild(dayElement);
    }
  }

  enableTouchScrolling() {
    document.addEventListener(
      "touchmove",
      function (e) {
        // Allow all touch moves (don't prevent default)
      },
      { passive: true }
    );
  }

  // Création du graphique d'humeur
  createMoodChart() {
    const canvas = document.getElementById("mood-wave-chart");
    const ctx = canvas.getContext("2d");

    // Configuration du canvas
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Effacement du canvas
    ctx.clearRect(0, 0, width, height);

    // Données pour le graphique
    const data = this.getMoodChartData();

    if (data.length === 0) {
      // Message si pas de données
      ctx.fillStyle = "var(--text-muted)";
      // Taille de police responsive
      let fontSize = 12;
      if (width < 450) fontSize = 4;
      ctx.font = `${fontSize}px var(--font-family)`;
      ctx.textAlign = "center";
      ctx.fillText("Aucune donnée disponible", width / 2, height / 2);
      return;
    }

    // Configuration du graphique
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Échelles
    const maxValue = 7;
    const minValue = 1;
    const valueRange = maxValue - minValue;

    // Grille
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    // Lignes horizontales
    for (let i = 0; i <= 6; i++) {
      const y = padding + (i / 6) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Lignes verticales
    const stepX = chartWidth / (data.length - 1);
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * stepX;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    // Courbe d'humeur
    if (data.length > 1) {
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + index * stepX;
        const y =
          height -
          padding -
          ((point.value - minValue) / valueRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Points sur la courbe
      data.forEach((point, index) => {
        const x = padding + index * stepX;
        const y =
          height -
          padding -
          ((point.value - minValue) / valueRange) * chartHeight;

        ctx.fillStyle = MOOD_CONFIG[point.mood].color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Emoji au-dessus du point
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(point.emoji, x, y - 15);
      });
    }

    // Labels des axes
    ctx.fillStyle = "var(--text-muted)";
    ctx.font = `${width < 450 ? 2 : 12}px var(--font-family)`;
    ctx.textAlign = "center";

    // Labels des dates (affichage allégé sur mobile)
    const showEvery = width < 500 ? Math.ceil(data.length / 2) : 1;
    data.forEach((point, index) => {
      const date = new Date(point.date);
      const label = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
      const x = padding + index * stepX;
      // Affiche moins de labels si l'écran est petit
      if (
        showEvery === 1 ||
        index % showEvery === 0 ||
        index === data.length - 1
      ) {
        ctx.fillText(label, x, height - 10);
      }
    });
  }

  // Obtention des données pour le graphique
  getMoodChartData() {
    const today = new Date();
    const data = [];

    for (let i = this.chartPeriod - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (this.data.entries[dateStr]) {
        data.push({
          date: dateStr,
          ...this.data.entries[dateStr],
        });
      }
    }

    return data;
  }

  // Mise à jour de la répartition des humeurs
  updateMoodDistribution() {
    const container = document.getElementById("mood-distribution");
    container.innerHTML = "";

    const distribution = {};
    Object.values(this.data.entries).forEach((entry) => {
      distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
    });

    const total = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );

    if (total === 0) {
      container.innerHTML =
        '<p style="color: var(--text-muted); text-align: center;">Aucune donnée disponible</p>';
      return;
    }

    Object.entries(distribution).forEach(([mood, count]) => {
      const config = MOOD_CONFIG[mood];
      const percentage = ((count / total) * 100).toFixed(1);

      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.marginBottom = "var(--spacing-sm)";
      item.style.padding = "var(--spacing-sm)";
      item.style.borderRadius = "var(--radius-sm)";
      item.style.background = "rgba(255, 255, 255, 0.05)";

      item.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <span style="font-size: 1.5rem;">${config.emoji}</span>
                    <span style="color: var(--text-primary);">${config.label}</span>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <span style="color: var(--text-secondary);">${count}</span>
                    <span style="color: var(--text-muted);">(${percentage}%)</span>
                </div>
            `;

      container.appendChild(item);
    });
  }

  // Mise à jour des patterns hebdomadaires
  updateWeeklyPatterns() {
    const container = document.getElementById("weekly-heatmap");
    container.innerHTML = "";

    const weekDays = [
      "Dimanche",
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
    ];
    const weekData = Array(7)
      .fill(0)
      .map(() => ({ total: 0, count: 0, note: "" }));

    Object.values(this.data.entries).forEach((entry) => {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay();
      weekData[dayOfWeek].total += entry.value;
      weekData[dayOfWeek].count += 1;
      weekData[dayOfWeek].note = entry.note;
    });

    weekDays.forEach((day, index) => {
      const data = weekData[index];
      const average = data.count > 0 ? data.total / data.count : 0;

      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.marginBottom = "var(--spacing-sm)";
      item.style.padding = "var(--spacing-sm)";
      item.style.borderRadius = "var(--radius-sm)";
      item.style.background = "rgba(255, 255, 255, 0.05)";
      item.style.width = "100%";
      item.style.boxSizing = "border-box";

      let emoji = "😐";
      if (average >= 6) emoji = "😍";
      else if (average >= 5) emoji = "😊";
      else if (average >= 4) emoji = "🙂";
      else if (average >= 3) emoji = "😐";
      else if (average >= 2) emoji = "😔";
      else if (average > 0) emoji = "😢";
      else emoji = "❓";

      item.innerHTML = `
                <div class ="wrap-day" style="display: flex; gap: var(--spacing-sm);flex:1; min-width: 0;">
                    <span style="font-size: 1.2rem;">${emoji}</span>
                    <span style="color: var(--text-primary);">${day},  </span>
                    <div class ="note"> Note: ${data.note || "rien"}</div>
                    
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); flex-shrink:0;">
                    <span style="color: var(--text-secondary);"> ${
                      data.count
                    } entrée${data.count > 1 ? "s" : ""}</span>
                    <span style="color: var(--text-muted);">${
                      average > 0 ? average.toFixed(1) : "-"
                    }</span>
                </div>
            `;

      container.appendChild(item);
    });
  }

  // Mise à jour du compteur de caractères
  updateCharCounter() {
    const counter = document.querySelector(".char-count");
    counter.textContent = this.currentNote.length;

    if (this.currentNote.length > 450) {
      counter.style.color = "#ef4444";
    } else if (this.currentNote.length > 400) {
      counter.style.color = "#f97316";
    } else {
      counter.style.color = "var(--text-muted)";
    }
  }

  // Création de particules d'humeur
  createMoodParticles(color) {
    const container = document.querySelector(".mood-particles");

    for (let i = 0; i < 10; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.width = "4px";
      particle.style.height = "4px";
      particle.style.backgroundColor = color;
      particle.style.borderRadius = "50%";
      particle.style.pointerEvents = "none";

      const startX = Math.random() * 400;
      const startY = Math.random() * 400;
      const endX = startX + (Math.random() - 0.5) * 200;
      const endY = startY + (Math.random() - 0.5) * 200;

      particle.style.left = startX + "px";
      particle.style.top = startY + "px";

      container.appendChild(particle);

      // Animation de la particule
      particle.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          {
            transform: `translate(${endX - startX}px, ${
              endY - startY
            }px) scale(0)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000,
          easing: "ease-out",
        }
      ).onfinish = () => {
        particle.remove();
      };
    }
  }

  // Création de particules d'arrière-plan
  createParticles() {
    const container = document.querySelector(".animated-background");

    setInterval(() => {
      if (document.querySelectorAll(".bg-particle").length < 20) {
        const particle = document.createElement("div");
        particle.className = "bg-particle";
        particle.style.position = "absolute";
        particle.style.width = Math.random() * 6 + 2 + "px";
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = `hsl(${
          Math.random() * 360
        }, 70%, 60%)`;
        particle.style.borderRadius = "50%";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = "100%";
        particle.style.opacity = "0.3";
        particle.style.pointerEvents = "none";

        container.appendChild(particle);

        particle.animate(
          [
            { transform: "translateY(0) rotate(0deg)", opacity: 0.3 },
            { transform: "translateY(-100vh) rotate(360deg)", opacity: 0 },
          ],
          {
            duration: Math.random() * 3000 + 2000,
            easing: "linear",
          }
        ).onfinish = () => {
          particle.remove();
        };
      }
    }, 500);
  }

  // Démarrage des animations
  startAnimations() {
    // Animation de rotation des formes flottantes
    const shapes = document.querySelectorAll(".floating-shape");
    shapes.forEach((shape, index) => {
      setInterval(() => {
        const currentTransform = shape.style.transform || "";
        const rotation = (Date.now() / 50 + index * 60) % 360;
        shape.style.transform = currentTransform + ` rotate(${rotation}deg)`;
      }, 50);
    });
  }

  // Effet de ripple
  createRippleEffect(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("div");
    ripple.style.position = "absolute";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.pointerEvents = "none";
    ripple.style.transform = "scale(0)";
    ripple.style.transition = "transform 0.6s ease-out, opacity 0.6s ease-out";
    ripple.style.opacity = "1";

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.style.transform = "scale(2)";
      ripple.style.opacity = "0";
    }, 10);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Affichage d'une notification toast
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Affichage de la modale de confirmation
  showClearDataModal() {
    const modal = document.getElementById("clear-data-modal");
    modal.classList.add("active");
  }

  // Masquage de la modale de confirmation
  hideClearDataModal() {
    const modal = document.getElementById("clear-data-modal");
    modal.classList.remove("active");
  }

  // Suppression de toutes les données
  clearAllData() {
    this.data = { entries: {}, settings: {} };
    this.saveData();
    this.updateUI();
    this.generateCalendar();
    this.createMoodChart();
    this.showToast("Toutes les données ont été supprimées", "success");
  }

  // Export des données
  exportData() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `moodflow-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast("Données exportées avec succès !", "success");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.authManager = new AuthManager();
});

// Gestion du redimensionnement de la fenêtre
window.addEventListener("resize", () => {
  // Redessiner le graphique si nécessaire
  const tracker = window.moodTracker;
  if (tracker) {
    setTimeout(() => {
      tracker.createMoodChart();
    }, 100);
  }
});

// Gestion de la visibilité de la page
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    // Rafraîchir l'interface quand la page redevient visible
    const tracker = window.moodTracker;
    if (tracker) {
      tracker.updateUI();
    }
  }
});

// const { MongoClient } = require("mongodb");

// const uri = "mongodb://localhost:27017"; // Adresse locale par défaut
// const client = new MongoClient(uri);

// async function main() {
//   try {
//     await client.connect();
//     console.log("Connecté à MongoDB");

//     const db = client.db("moodflow"); // Nom de la base
//     const entries = db.collection("entries"); // Collection pour les humeurs

//     // Exemple d'insertion d'une humeur
//     const moodEntry = {
//       userId: "user_123",
//       date: new Date().toISOString().split("T")[0],
//       mood: "happy",
//       value: 5,
//       note: "Bonne journée !",
//       createdAt: new Date(),
//     };

//     const result = await entries.insertOne(moodEntry);
//     console.log("Entrée insérée avec l'id :", result.insertedId);

//     // Exemple de lecture
//     const allEntries = await entries.find({ userId: "user_123" }).toArray();
//     console.log("Entrées pour user_123 :", allEntries);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     await client.close();
//   }
// }

// main();
