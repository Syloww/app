// Application de suivi des dépenses
class ExpenseTracker {
    constructor() {
        this.expenses = [];
        this.incomes = [];
        this.categories = [];
        this.incomeCategories = [];
        this.recurringTransactions = [];
        this.currentSection = 'dashboard';
        this.isSwitching = false;
        this.autoSaveInterval = null;
        this.notifications = [];
        this.settings = {
            currency: '€',
            dateFormat: 'DD/MM/YYYY',
            theme: 'light',
            accentColor: 'blue',
            autoSave: true,
            autoSaveInterval: 30000, // 30 secondes
            notifications: true,
            notificationDuration: 5000, // 5 secondes
            autoUpdateEnabled: true,
            autoDownloadEnabled: true
        };
        
        // État des mises à jour
        this.updateState = {
            checking: false,
            available: false,
            downloading: false,
            downloaded: false,
            progress: 0
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeDefaultCategories();
        this.updateUI();
        this.setCurrentDate();
        this.applyTheme();
        this.applyAccentColor();
        this.startAutoSave();
        this.createNotificationContainer();
        this.updateSettings();
        
        // S'assurer que l'attribut data-accent-color est appliqué
        document.documentElement.setAttribute('data-accent-color', this.settings.accentColor);
        
        // Notification de bienvenue
        setTimeout(() => {
            this.showNotification('Application de suivi des dépenses chargée avec succès !', 'success', 3000);
        }, 1000);
        
        // Initialiser les gestionnaires de mise à jour
        this.setupUpdateHandlers();
    }

    // Chargement des données depuis le localStorage
    loadData() {
        const savedExpenses = localStorage.getItem('expenses');
        const savedIncomes = localStorage.getItem('incomes');
        const savedCategories = localStorage.getItem('categories');
        const savedIncomeCategories = localStorage.getItem('incomeCategories');
        const savedRecurring = localStorage.getItem('recurringTransactions');
        const savedSettings = localStorage.getItem('settings');

        if (savedExpenses) {
            this.expenses = JSON.parse(savedExpenses);
        }

        if (savedIncomes) {
            this.incomes = JSON.parse(savedIncomes);
        }

        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        }

        if (savedIncomeCategories) {
            this.incomeCategories = JSON.parse(savedIncomeCategories);
        }


        if (savedRecurring) {
            this.recurringTransactions = JSON.parse(savedRecurring);
        }

        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    // Configuration des gestionnaires de mise à jour
    setupUpdateHandlers() {
        // Les événements sont déjà configurés dans main.js via ipcRenderer.on

        // Gestionnaires pour les boutons de mise à jour
        const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');
        const downloadUpdateBtn = document.getElementById('downloadUpdateBtn');
        const installUpdateBtn = document.getElementById('installUpdateBtn');
        const updateNotificationDownload = document.getElementById('updateNotificationDownload');
        const updateNotificationInstall = document.getElementById('updateNotificationInstall');
        const updateNotificationClose = document.getElementById('updateNotificationClose');

        if (checkUpdatesBtn) {
            checkUpdatesBtn.addEventListener('click', () => this.checkForUpdates());
        }

        if (downloadUpdateBtn) {
            downloadUpdateBtn.addEventListener('click', () => this.downloadUpdate());
        }

        if (installUpdateBtn) {
            installUpdateBtn.addEventListener('click', () => this.installUpdate());
        }

        if (updateNotificationDownload) {
            updateNotificationDownload.addEventListener('click', () => this.downloadUpdate());
        }

        if (updateNotificationInstall) {
            updateNotificationInstall.addEventListener('click', () => this.installUpdate());
        }

        if (updateNotificationClose) {
            updateNotificationClose.addEventListener('click', () => this.hideUpdateNotification());
        }
    }

    // Vérifier les mises à jour
    async checkForUpdates() {
        if (!window.electronAPI) {
            this.showNotification('Les mises à jour ne sont pas disponibles dans cette version', 'warning');
            return;
        }

        try {
            this.updateState.checking = true;
            this.updateUpdateUI();
            
            const result = await window.electronAPI.checkForUpdates();
            
            if (result && result.updateInfo) {
                this.handleUpdateAvailable(result.updateInfo);
            } else {
                this.showNotification('Aucune mise à jour disponible', 'info');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
            this.showNotification('Erreur lors de la vérification des mises à jour', 'error');
        } finally {
            this.updateState.checking = false;
            this.updateUpdateUI();
        }
    }

    // Télécharger la mise à jour
    async downloadUpdate() {
        if (!window.electronAPI) {
            this.showNotification('Les mises à jour ne sont pas disponibles dans cette version', 'warning');
            return;
        }

        try {
            this.updateState.downloading = true;
            this.updateUpdateUI();
            
            await window.electronAPI.downloadUpdate();
        } catch (error) {
            console.error('Erreur lors du téléchargement de la mise à jour:', error);
            this.showNotification('Erreur lors du téléchargement de la mise à jour', 'error');
            this.updateState.downloading = false;
            this.updateUpdateUI();
        }
    }

    // Installer la mise à jour
    installUpdate() {
        if (!window.electronAPI) {
            this.showNotification('Les mises à jour ne sont pas disponibles dans cette version', 'warning');
            return;
        }

        window.electronAPI.installUpdate();
    }

    // Gérer la disponibilité d'une mise à jour
    handleUpdateAvailable(info) {
        this.updateState.available = true;
        this.updateState.downloaded = false;
        this.updateUpdateUI();
        
        // Afficher la notification
        this.showUpdateNotification(info);
        
        // Si le téléchargement automatique est activé
        if (this.settings.autoDownloadEnabled) {
            this.downloadUpdate();
        }
    }

    // Gérer les erreurs de mise à jour
    handleUpdateError(error) {
        console.error('Erreur de mise à jour:', error);
        this.showNotification(`Erreur de mise à jour: ${error}`, 'error');
        this.updateState.checking = false;
        this.updateState.downloading = false;
        this.updateUpdateUI();
    }

    // Gérer la progression du téléchargement
    handleDownloadProgress(progress) {
        this.updateState.progress = Math.round(progress.percent);
        this.updateUpdateUI();
        this.updateUpdateNotificationProgress(progress);
    }

    // Gérer la fin du téléchargement
    handleUpdateDownloaded(info) {
        this.updateState.downloaded = true;
        this.updateState.downloading = false;
        this.updateUpdateUI();
        
        // Mettre à jour la notification
        this.updateUpdateNotificationDownloaded(info);
        
        this.showNotification('Mise à jour téléchargée et prête à être installée', 'success');
    }

    // Afficher la notification de mise à jour
    showUpdateNotification(info) {
        const notification = document.getElementById('updateNotification');
        const text = document.getElementById('updateNotificationText');
        
        if (notification && text) {
            text.textContent = `Version ${info.version} disponible`;
            notification.classList.add('show');
        }
    }

    // Mettre à jour la notification avec la progression
    updateUpdateNotificationProgress(progress) {
        const progressBar = document.getElementById('updateProgressBar');
        const progressFill = document.getElementById('updateProgressFill');
        
        if (progressBar && progressFill) {
            progressBar.style.display = 'block';
            progressFill.style.width = `${Math.round(progress.percent)}%`;
        }
    }

    // Mettre à jour la notification quand téléchargée
    updateUpdateNotificationDownloaded(info) {
        const downloadBtn = document.getElementById('updateNotificationDownload');
        const installBtn = document.getElementById('updateNotificationInstall');
        const progressBar = document.getElementById('updateProgressBar');
        
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (installBtn) installBtn.style.display = 'inline-flex';
        if (progressBar) progressBar.style.display = 'none';
    }

    // Masquer la notification de mise à jour
    hideUpdateNotification() {
        const notification = document.getElementById('updateNotification');
        if (notification) {
            notification.classList.remove('show');
        }
    }

    // Mettre à jour l'interface utilisateur des mises à jour
    updateUpdateUI() {
        const statusDiv = document.getElementById('updateStatus');
        const statusText = document.getElementById('updateStatusText');
        const progressDiv = document.getElementById('updateProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const checkBtn = document.getElementById('checkUpdatesBtn');
        const downloadBtn = document.getElementById('downloadUpdateBtn');
        const installBtn = document.getElementById('installUpdateBtn');

        if (!statusDiv) return;

        statusDiv.style.display = 'block';

        if (this.updateState.checking) {
            statusText.textContent = 'Vérification des mises à jour...';
            checkBtn.disabled = true;
            downloadBtn.style.display = 'none';
            installBtn.style.display = 'none';
        } else if (this.updateState.available && !this.updateState.downloaded) {
            statusText.textContent = 'Mise à jour disponible';
            checkBtn.disabled = false;
            downloadBtn.style.display = 'inline-flex';
            installBtn.style.display = 'none';
        } else if (this.updateState.downloading) {
            statusText.textContent = 'Téléchargement en cours...';
            checkBtn.disabled = true;
            downloadBtn.style.display = 'none';
            installBtn.style.display = 'none';
            
            if (progressDiv) {
                progressDiv.style.display = 'block';
                if (progressFill) progressFill.style.width = `${this.updateState.progress}%`;
                if (progressText) progressText.textContent = `${this.updateState.progress}%`;
            }
        } else if (this.updateState.downloaded) {
            statusText.textContent = 'Mise à jour prête à être installée';
            checkBtn.disabled = false;
            downloadBtn.style.display = 'none';
            installBtn.style.display = 'inline-flex';
            
            if (progressDiv) {
                progressDiv.style.display = 'none';
            }
        } else {
            statusDiv.style.display = 'none';
            checkBtn.disabled = false;
            downloadBtn.style.display = 'none';
            installBtn.style.display = 'none';
        }
    }

    // Sauvegarde des données dans le localStorage
    saveData() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
        localStorage.setItem('incomes', JSON.stringify(this.incomes));
        localStorage.setItem('categories', JSON.stringify(this.categories));
        localStorage.setItem('incomeCategories', JSON.stringify(this.incomeCategories));
        localStorage.setItem('recurringTransactions', JSON.stringify(this.recurringTransactions));
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    // Initialisation des catégories par défaut
    initializeDefaultCategories() {
        if (this.categories.length === 0) {
            this.categories = [
                { id: '1', name: 'Nourriture', color: '#e74c3c', icon: 'fas fa-utensils' },
                { id: '2', name: 'Transport', color: '#3498db', icon: 'fas fa-car' },
                { id: '3', name: 'Shopping', color: '#9b59b6', icon: 'fas fa-shopping-cart' },
                { id: '4', name: 'Loisirs', color: '#f39c12', icon: 'fas fa-gamepad' },
                { id: '5', name: 'Santé', color: '#e67e22', icon: 'fas fa-heart' },
                { id: '6', name: 'Logement', color: '#2ecc71', icon: 'fas fa-home' }
            ];
        }

        if (this.incomeCategories.length === 0) {
            this.incomeCategories = [
                { id: 'inc1', name: 'Salaire', color: '#27ae60', icon: 'fas fa-briefcase' },
                { id: 'inc2', name: 'Freelance', color: '#8e44ad', icon: 'fas fa-laptop-code' },
                { id: 'inc3', name: 'Investissement', color: '#f39c12', icon: 'fas fa-chart-line' },
                { id: 'inc4', name: 'Cadeau', color: '#e91e63', icon: 'fas fa-gift' },
                { id: 'inc5', name: 'Prime', color: '#00bcd4', icon: 'fas fa-star' },
                { id: 'inc6', name: 'Autre', color: '#607d8b', icon: 'fas fa-plus' }
            ];
            this.saveData();
        }
    }

    // Configuration des événements
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Trouver le bouton parent si on clique sur un élément enfant
                const button = e.target.closest('.nav-item');
                const sectionId = button.dataset.section;
                
                if (sectionId) {
                    this.switchSection(sectionId);
                    // Fermer la sidebar sur mobile après sélection
                    this.closeMobileSidebar();
                }
            });
        });

        // Formulaire d'ajout de dépense
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Formulaire d'ajout de revenu
        document.getElementById('incomeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        // Formulaire d'ajout de catégorie
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        // Filtres
        document.getElementById('filterBtn').addEventListener('click', () => {
            this.filterExpenses();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importBtn').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        document.getElementById('manualSaveBtn').addEventListener('click', () => {
            this.manualSave();
        });

        document.getElementById('exportBackupBtn').addEventListener('click', () => {
            this.exportDataWithTimestamp();
        });

        // Gestionnaire pour les notifications
        document.getElementById('notificationsEnabled').addEventListener('change', (e) => {
            this.settings.notifications = e.target.checked;
            this.saveData();
            if (e.target.checked) {
                this.showNotification('Notifications activées', 'info');
            }
        });

        // Gestionnaire pour la durée des notifications
        document.getElementById('notificationDuration').addEventListener('change', (e) => {
            this.settings.notificationDuration = parseInt(e.target.value);
            this.saveData();
        });

        // Paramètres
        document.getElementById('currency').addEventListener('change', (e) => {
            this.settings.currency = e.target.value;
            this.saveData();
            this.updateUI();
        });

        document.getElementById('theme').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applyTheme();
            this.saveData();
        });

        document.getElementById('accentColor').addEventListener('change', (e) => {
            this.settings.accentColor = e.target.value;
            this.applyAccentColor();
            this.saveData();
        });

        // Import de fichier
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        // Changement de type de transaction récurrente
        document.getElementById('recurringType').addEventListener('change', () => {
            this.populateRecurringCategories();
        });

        // Recherche globale
        document.getElementById('globalSearch').addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        document.getElementById('globalSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
            }
        });

        // Actions rapides du dashboard
        this.setupQuickActions();
        
        // Raccourcis clavier
        this.setupKeyboardShortcuts();
        
        // Notification des raccourcis
        this.setupShortcutsNotification();
        
        // Gestion de la sidebar mobile
        this.setupMobileSidebar();
    }

    // Configuration des actions rapides
    setupQuickActions() {
        // Boutons d'actions rapides dans le dashboard
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Trouver le bouton parent si on clique sur un élément enfant
                const button = e.target.closest('.quick-action-btn');
                const section = button.getAttribute('onclick').match(/'([^']+)'/)[1];
                
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Boutons de changement de type de graphique
        document.querySelectorAll('.chart-btn[data-chart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchChartType(btn.dataset.chart);
            });
        });

        // Boutons de changement de type de graphique pour les revenus
        document.querySelectorAll('.chart-btn[data-income-chart]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchIncomeChartType(btn.dataset.incomeChart);
            });
        });

        // Boutons de période pour le graphique de tendance
        document.querySelectorAll('.chart-btn[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchChartPeriod(parseInt(btn.dataset.period));
            });
        });
    }

    // Configuration des raccourcis clavier
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + E pour ajouter une dépense
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.switchSection('add-expense');
            }
            
            // Ctrl/Cmd + I pour ajouter un revenu
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.switchSection('add-income');
            }
            
            // Ctrl/Cmd + H pour l'historique
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.switchSection('history');
            }
            
            // Ctrl/Cmd + D pour le dashboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.switchSection('dashboard');
            }
            
            // Échap pour revenir au dashboard
            if (e.key === 'Escape') {
                this.switchSection('dashboard');
            }
            
            // F1 pour afficher les raccourcis
            if (e.key === 'F1') {
                e.preventDefault();
                this.showShortcuts();
            }
        });
    }

    // Configuration de la notification des raccourcis
    setupShortcutsNotification() {
        // Bouton de fermeture
        document.getElementById('closeShortcuts').addEventListener('click', () => {
            this.hideShortcuts();
        });

        // Fermer avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('shortcutsNotification').classList.contains('show')) {
                this.hideShortcuts();
            }
        });

        // Afficher les raccourcis au premier lancement
        if (!localStorage.getItem('shortcutsShown')) {
            setTimeout(() => {
                this.showShortcuts();
                localStorage.setItem('shortcutsShown', 'true');
            }, 2000);
        }
    }

    // Afficher les raccourcis
    showShortcuts() {
        const notification = document.getElementById('shortcutsNotification');
        const overlay = document.createElement('div');
        overlay.className = 'shortcuts-overlay';
        overlay.id = 'shortcutsOverlay';
        document.body.appendChild(overlay);
        
        notification.classList.add('show');
        overlay.classList.add('show');
    }

    // Masquer les raccourcis
    hideShortcuts() {
        const notification = document.getElementById('shortcutsNotification');
        const overlay = document.getElementById('shortcutsOverlay');
        
        notification.classList.remove('show');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }

    // Configuration de la sidebar mobile
    setupMobileSidebar() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebarNav = document.getElementById('sidebarNav');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Fermer la sidebar lors du redimensionnement vers desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileSidebar();
            }
        });
    }

    // Basculer la sidebar mobile
    toggleMobileSidebar() {
        const sidebarNav = document.getElementById('sidebarNav');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');

        if (sidebarNav.classList.contains('open')) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
    }

    // Ouvrir la sidebar mobile
    openMobileSidebar() {
        const sidebarNav = document.getElementById('sidebarNav');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');

        sidebarNav.classList.add('open');
        sidebarOverlay.classList.add('show');
        mobileMenuToggle.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    // Fermer la sidebar mobile
    closeMobileSidebar() {
        const sidebarNav = document.getElementById('sidebarNav');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');

        sidebarNav.classList.remove('open');
        sidebarOverlay.classList.remove('show');
        mobileMenuToggle.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Changement de type de graphique
    switchChartType(type) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.chart-btn[data-chart]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${type}"]`).classList.add('active');

        // Mettre à jour le graphique
        if (this.categoryChart) {
            this.categoryChart.config.type = type === 'pie' ? 'pie' : 'doughnut';
            this.categoryChart.update();
        }
    }

    // Changement de type de graphique pour les revenus
    switchIncomeChartType(type) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.chart-btn[data-income-chart]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-income-chart="${type}"]`).classList.add('active');

        // Mettre à jour le graphique
        if (this.incomeChart) {
            this.incomeChart.config.type = type === 'pie' ? 'pie' : 'doughnut';
            this.incomeChart.update();
        }
    }

    // Changement de période du graphique de tendance
    switchChartPeriod(days) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.chart-btn[data-period]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${days}"]`).classList.add('active');

        // Mettre à jour le graphique
        this.updateTrendChartWithPeriod(days);
    }

    // Mise à jour du graphique de tendance avec période spécifique
    updateTrendChartWithPeriod(days) {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // Calculer les dates
        const dates = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }

        const dailyTotals = {};
        const dailyIncomes = {};
        dates.forEach(date => {
            dailyTotals[date] = 0;
            dailyIncomes[date] = 0;
        });

        this.expenses.forEach(expense => {
            if (dailyTotals.hasOwnProperty(expense.date)) {
                dailyTotals[expense.date] += expense.amount;
            }
        });

        this.incomes.forEach(income => {
            if (dailyIncomes.hasOwnProperty(income.date)) {
                dailyIncomes[income.date] += income.amount;
            }
        });

        const labels = dates.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        const expensesData = dates.map(date => dailyTotals[date]);
        const incomesData = dates.map(date => dailyIncomes[date]);

        // Mettre à jour les données du graphique
        if (this.trendChart) {
            this.trendChart.data.labels = labels;
            this.trendChart.data.datasets[0].data = expensesData;
            this.trendChart.data.datasets[1].data = incomesData;
            this.trendChart.update();
        }
    }

    // Changement de section
    switchSection(sectionId) {
        // Éviter les changements multiples rapides
        if (this.currentSection === sectionId || this.isSwitching) {
            return;
        }
        
        this.isSwitching = true;
        
        // Masquer toutes les sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Désactiver tous les onglets
        document.querySelectorAll('.nav-item').forEach(tab => {
            tab.classList.remove('active');
        });

        // Afficher la section sélectionnée
        const targetSection = document.getElementById(sectionId);
        const targetNavItem = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        } else {
            console.error(`Section avec l'ID "${sectionId}" non trouvée`);
            this.isSwitching = false;
            return;
        }
        
        if (targetNavItem) {
            targetNavItem.classList.add('active');
        }

        // Mettre à jour l'UI selon la section
        if (sectionId === 'dashboard') {
            this.updateDashboard();
        } else if (sectionId === 'history') {
            this.updateHistory();
        } else if (sectionId === 'categories') {
            this.updateCategories();
        } else if (sectionId === 'add-income') {
            this.updateIncomeForm();
        } else if (sectionId === 'recurring') {
            this.updateRecurring();
        } else if (sectionId === 'reports') {
            this.updateReports();
        } else if (sectionId === 'calendar') {
            this.updateCalendar();
        }
        
        // Réactiver les changements après un court délai
        setTimeout(() => {
            this.isSwitching = false;
        }, 100);
    }

    // Ajout d'une dépense
    addExpense() {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const description = document.getElementById('expenseDescription').value;
        const categoryId = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value;
        const paymentMethod = document.getElementById('expensePaymentMethod').value;

        if (!amount || !description || !categoryId || !date) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            amount: amount,
            description: description,
            categoryId: categoryId,
            date: date,
            paymentMethod: paymentMethod,
            createdAt: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.saveData();
        this.updateUI();
        this.clearExpenseForm();
        this.showNotification(`Dépense de ${amount}${this.settings.currency} ajoutée`, 'success');

        // Retourner au tableau de bord
        this.switchSection('dashboard');
    }

    // Ajout d'un revenu
    addIncome() {
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const description = document.getElementById('incomeDescription').value;
        const categoryId = document.getElementById('incomeCategory').value;
        const date = document.getElementById('incomeDate').value;
        const source = document.getElementById('incomeSource').value;

        if (!amount || !description || !categoryId || !date) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const income = {
            id: Date.now().toString(),
            amount: amount,
            description: description,
            categoryId: categoryId,
            date: date,
            source: source,
            createdAt: new Date().toISOString()
        };

        this.incomes.push(income);
        this.saveData();
        this.updateUI();
        this.clearIncomeForm();
        this.showNotification(`Revenu de ${amount}${this.settings.currency} ajouté`, 'success');

        // Retourner au tableau de bord
        this.switchSection('dashboard');
    }

    // Ajout d'une catégorie
    addCategory() {
        const name = document.getElementById('categoryName').value;
        const color = document.getElementById('categoryColor').value;
        const icon = document.getElementById('categoryIcon').value;

        if (!name) {
            alert('Veuillez saisir un nom de catégorie');
            return;
        }

        const category = {
            id: Date.now().toString(),
            name: name,
            color: color,
            icon: icon
        };

        this.categories.push(category);
        this.saveData();
        this.updateUI();
        this.clearCategoryForm();
    }

    // Suppression d'une dépense
    deleteExpense(expenseId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
            this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
            this.saveData();
            this.updateUI();
            this.showNotification('Dépense supprimée', 'info');
        }
    }

    // Suppression d'un revenu
    deleteIncome(incomeId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
            this.incomes = this.incomes.filter(income => income.id !== incomeId);
            this.saveData();
            this.updateUI();
            this.showNotification('Revenu supprimé', 'info');
        }
    }

    // Suppression d'une transaction (dépense ou revenu)
    deleteTransaction(transactionId, type) {
        if (type === 'expense') {
            this.deleteExpense(transactionId);
        } else {
            this.deleteIncome(transactionId);
        }
    }

    // Suppression d'une catégorie
    deleteCategory(categoryId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            // Vérifier si la catégorie est utilisée
            const isUsed = this.expenses.some(expense => expense.categoryId === categoryId);
            if (isUsed) {
                alert('Cette catégorie est utilisée par des dépenses. Veuillez d\'abord supprimer ou modifier ces dépenses.');
                return;
            }

            this.categories = this.categories.filter(category => category.id !== categoryId);
            this.saveData();
            this.updateUI();
        }
    }

    // Filtrage des transactions
    filterExpenses() {
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const typeFilter = document.getElementById('typeFilter').value;

        let filteredExpenses = [...this.expenses];
        let filteredIncomes = [...this.incomes];

        if (dateFrom) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date >= dateFrom);
            filteredIncomes = filteredIncomes.filter(income => income.date >= dateFrom);
        }

        if (dateTo) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date <= dateTo);
            filteredIncomes = filteredIncomes.filter(income => income.date <= dateTo);
        }

        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(expense => expense.categoryId === categoryFilter);
            filteredIncomes = filteredIncomes.filter(income => income.categoryId === categoryFilter);
        }

        this.displayTransactions(filteredExpenses, filteredIncomes, typeFilter);
    }

    // Effacement des filtres
    clearFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('typeFilter').value = '';
        this.displayTransactions(this.expenses, this.incomes);
    }

    // Export des données
    exportData() {
        const data = {
            expenses: this.expenses,
            incomes: this.incomes,
            categories: this.categories,
            incomeCategories: this.incomeCategories,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `depenses_${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    // Import des données
    importData() {
        document.getElementById('fileInput').click();
    }

    // Gestion de l'import de fichier
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('Cette action va remplacer toutes vos données actuelles. Continuer ?')) {
                    this.expenses = data.expenses || [];
                    this.incomes = data.incomes || [];
                    this.categories = data.categories || [];
                    this.incomeCategories = data.incomeCategories || [];
                    this.settings = { ...this.settings, ...(data.settings || {}) };
                    
                    this.saveData();
                    this.updateUI();
                    this.applyTheme();
                    this.applyAccentColor();
                    alert('Données importées avec succès !');
                }
            } catch (error) {
                alert('Erreur lors de l\'import du fichier. Vérifiez que le fichier est valide.');
            }
        };
        reader.readAsText(file);
    }

    // Effacement de toutes les données
    clearAllData() {
        if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
            this.expenses = [];
            this.incomes = [];
            this.categories = [];
            this.incomeCategories = [];
            this.settings = {
                currency: '€',
                dateFormat: 'DD/MM/YYYY',
                theme: 'light',
                accentColor: 'blue'
            };
            this.saveData();
            this.updateUI();
            this.initializeDefaultCategories();
            this.applyTheme();
            this.applyAccentColor();
            alert('Toutes les données ont été effacées.');
        }
    }

    // Mise à jour de l'interface utilisateur
    updateUI() {
        this.updateDashboard();
        this.updateExpenseForm();
        this.updateIncomeForm();
        this.updateHistory();
        this.updateCategories();
        this.updateSettings();
    }

    // Mise à jour du tableau de bord
    updateDashboard() {
        this.updateStats();
        this.updateCharts();
        this.updateRecentExpenses();
    }

    // Mise à jour des statistiques
    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().toISOString().substring(0, 7);
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = lastMonth.toISOString().substring(0, 7);

        const todayExpenses = this.expenses
            .filter(expense => expense.date === today)
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyExpenses = this.expenses
            .filter(expense => expense.date.startsWith(currentMonth))
            .reduce((sum, expense) => sum + expense.amount, 0);

        const lastMonthExpenses = this.expenses
            .filter(expense => expense.date.startsWith(lastMonthStr))
            .reduce((sum, expense) => sum + expense.amount, 0);

        const totalExpenses = this.expenses
            .reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyIncome = this.incomes
            .filter(income => income.date.startsWith(currentMonth))
            .reduce((sum, income) => sum + income.amount, 0);

        const lastMonthIncome = this.incomes
            .filter(income => income.date.startsWith(lastMonthStr))
            .reduce((sum, income) => sum + income.amount, 0);

        const totalIncome = this.incomes
            .reduce((sum, income) => sum + income.amount, 0);

        const totalBalance = totalIncome - totalExpenses;
        const monthlyBalance = monthlyIncome - monthlyExpenses;

        const daysInMonth = new Date().getDate();
        const dailyAverage = daysInMonth > 0 ? monthlyExpenses / daysInMonth : 0;

        // Calcul des tendances
        const expensesTrend = lastMonthExpenses > 0 ? 
            ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
        const incomeTrend = lastMonthIncome > 0 ? 
            ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
        const balanceTrend = lastMonthIncome > 0 ? 
            ((monthlyBalance - (lastMonthIncome - lastMonthExpenses)) / (lastMonthIncome - lastMonthExpenses)) * 100 : 0;

        // Mise à jour des métriques principales
        document.getElementById('totalBalance').textContent = this.formatCurrency(totalBalance);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(monthlyExpenses);
        document.getElementById('monthlyIncome').textContent = this.formatCurrency(monthlyIncome);
        document.getElementById('dailyExpenses').textContent = this.formatCurrency(todayExpenses);
        document.getElementById('dailyAverage').textContent = this.formatCurrency(dailyAverage);

        // Mise à jour des tendances
        this.updateTrend('balanceTrend', balanceTrend);
        this.updateTrend('expensesTrend', expensesTrend);
        this.updateTrend('incomeTrend', incomeTrend);

        // Mise à jour des statistiques rapides
        document.getElementById('totalTransactions').textContent = this.expenses.length + this.incomes.length;
        document.getElementById('totalCategories').textContent = this.categories.length + this.incomeCategories.length;
        

        // Mise à jour des couleurs selon le solde
        const balanceElement = document.getElementById('totalBalance');
        if (totalBalance >= 0) {
            balanceElement.style.color = '#27ae60';
        } else {
            balanceElement.style.color = '#e74c3c';
        }
    }

    // Mise à jour des tendances
    updateTrend(elementId, trend) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const icon = element.querySelector('i');
        const span = element.querySelector('span');
        
        if (trend > 0) {
            element.className = 'metric-trend positive';
            icon.className = 'fas fa-arrow-up';
            span.textContent = `+${trend.toFixed(1)}%`;
        } else if (trend < 0) {
            element.className = 'metric-trend negative';
            icon.className = 'fas fa-arrow-down';
            span.textContent = `${trend.toFixed(1)}%`;
        } else {
            element.className = 'metric-trend neutral';
            icon.className = 'fas fa-minus';
            span.textContent = '0%';
        }
    }

    // Mise à jour des graphiques
    updateCharts() {
        this.updateCategoryChart();
        this.updateIncomeChart();
        this.updateTrendChart();
    }

    // Graphique des catégories
    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Calculer les totaux par catégorie
        const categoryTotals = {};
        this.expenses.forEach(expense => {
            const category = this.categories.find(cat => cat.id === expense.categoryId);
            if (category) {
                if (!categoryTotals[category.name]) {
                    categoryTotals[category.name] = 0;
                }
                categoryTotals[category.name] += expense.amount;
            }
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);
        const colors = labels.map(label => {
            const category = this.categories.find(cat => cat.name === label);
            return category ? category.color : '#3498db';
        });

        // Détruire le graphique existant s'il existe
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed.toFixed(2)} € (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Graphique des revenus
    updateIncomeChart() {
        const ctx = document.getElementById('incomeChart').getContext('2d');
        
        // Calculer les totaux par catégorie de revenus
        const incomeCategoryTotals = {};
        this.incomes.forEach(income => {
            const category = this.incomeCategories.find(cat => cat.id === income.categoryId);
            if (category) {
                if (!incomeCategoryTotals[category.name]) {
                    incomeCategoryTotals[category.name] = 0;
                }
                incomeCategoryTotals[category.name] += income.amount;
            }
        });

        const labels = Object.keys(incomeCategoryTotals);
        const data = Object.values(incomeCategoryTotals);
        const colors = labels.map(label => {
            const category = this.incomeCategories.find(cat => cat.name === label);
            return category ? category.color : '#27ae60';
        });

        // Détruire le graphique existant s'il existe
        if (this.incomeChart) {
            this.incomeChart.destroy();
        }

        this.incomeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 4,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed.toFixed(2)} € (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Graphique de tendance
    updateTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        // Calculer les dépenses par jour des 30 derniers jours
        const last30Days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }

        const dailyTotals = {};
        const dailyIncomes = {};
        last30Days.forEach(date => {
            dailyTotals[date] = 0;
            dailyIncomes[date] = 0;
        });

        this.expenses.forEach(expense => {
            if (dailyTotals.hasOwnProperty(expense.date)) {
                dailyTotals[expense.date] += expense.amount;
            }
        });

        this.incomes.forEach(income => {
            if (dailyIncomes.hasOwnProperty(income.date)) {
                dailyIncomes[income.date] += income.amount;
            }
        });

        const labels = last30Days.map(date => {
            const d = new Date(date);
            return `${d.getDate()}/${d.getMonth() + 1}`;
        });
        const expensesData = last30Days.map(date => dailyTotals[date]);
        const incomesData = last30Days.map(date => dailyIncomes[date]);

        // Détruire le graphique existant s'il existe
        if (this.trendChart) {
            this.trendChart.destroy();
        }

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Dépenses',
                    data: expensesData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }, {
                    label: 'Revenus',
                    data: incomesData,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#27ae60',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'line',
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} €`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return value.toFixed(0) + ' €';
                            }
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Mise à jour des dépenses récentes
    updateRecentExpenses() {
        const recentExpenses = this.expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recentExpensesList');
        container.innerHTML = '';

        if (recentExpenses.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Aucune dépense enregistrée</p>';
            return;
        }

        recentExpenses.forEach(expense => {
            const category = this.categories.find(cat => cat.id === expense.categoryId);
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';
            expenseElement.innerHTML = `
                <div class="expense-item-info">
                    <div class="expense-item-description">${expense.description}</div>
                    <div class="expense-item-category">${category ? category.name : 'Catégorie inconnue'}</div>
                </div>
                <div class="expense-item-amount">${this.formatCurrency(expense.amount)}</div>
            `;
            container.appendChild(expenseElement);
        });
    }

    // Mise à jour du formulaire de dépense
    updateExpenseForm() {
        const categorySelect = document.getElementById('expenseCategory');
        categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // Mise à jour du formulaire de revenu
    updateIncomeForm() {
        const categorySelect = document.getElementById('incomeCategory');
        categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        this.incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // Mise à jour de l'historique
    updateHistory() {
        this.updateHistoryFilters();
        this.displayTransactions(this.expenses, this.incomes);
    }

    // Mise à jour des filtres d'historique
    updateHistoryFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = '<option value="">Toutes les catégories</option>';
        
        // Ajouter les catégories de dépenses
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `[Dépense] ${category.name}`;
            categoryFilter.appendChild(option);
        });

        // Ajouter les catégories de revenus
        this.incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = `[Revenu] ${category.name}`;
            categoryFilter.appendChild(option);
        });
    }

    // Affichage des transactions dans le tableau
    displayTransactions(expenses, incomes, typeFilter = '') {
        const tbody = document.getElementById('expensesTableBody');
        tbody.innerHTML = '';

        let allTransactions = [];

        // Ajouter les dépenses
        if (typeFilter === '' || typeFilter === 'expense') {
            expenses.forEach(expense => {
                allTransactions.push({
                    ...expense,
                    type: 'expense',
                    typeLabel: 'Dépense'
                });
            });
        }

        // Ajouter les revenus
        if (typeFilter === '' || typeFilter === 'income') {
            incomes.forEach(income => {
                allTransactions.push({
                    ...income,
                    type: 'income',
                    typeLabel: 'Revenu'
                });
            });
        }

        if (allTransactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">Aucune transaction trouvée</td></tr>';
            return;
        }

        allTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(transaction => {
                let category, details;
                
                if (transaction.type === 'expense') {
                    category = this.categories.find(cat => cat.id === transaction.categoryId);
                    details = this.getPaymentMethodLabel(transaction.paymentMethod);
                } else {
                    category = this.incomeCategories.find(cat => cat.id === transaction.categoryId);
                    details = this.getSourceLabel(transaction.source);
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.formatDate(transaction.date)}</td>
                    <td>
                        <span class="transaction-type ${transaction.type}">
                            <i class="fas ${transaction.type === 'expense' ? 'fa-minus-circle' : 'fa-plus-circle'}"></i>
                            ${transaction.typeLabel}
                        </span>
                    </td>
                    <td>${transaction.description}</td>
                    <td>
                        <span style="color: ${category ? category.color : '#666'};">
                            <i class="${category ? category.icon : 'fas fa-tag'}"></i>
                            ${category ? category.name : 'Catégorie inconnue'}
                        </span>
                    </td>
                    <td style="color: ${transaction.type === 'expense' ? '#e74c3c' : '#27ae60'}; font-weight: 600;">
                        ${transaction.type === 'expense' ? '-' : '+'}${this.formatCurrency(transaction.amount)}
                    </td>
                    <td>${details}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="app.deleteTransaction('${transaction.id}', '${transaction.type}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
    }

    // Affichage des dépenses dans le tableau (méthode de compatibilité)
    displayExpenses(expenses) {
        this.displayTransactions(expenses, []);
    }

    // Mise à jour des catégories
    updateCategories() {
        const container = document.getElementById('categoriesList');
        container.innerHTML = '';

        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-card';
            categoryElement.innerHTML = `
                <div class="category-icon" style="background-color: ${category.color};">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-info">
                    <h4>${category.name}</h4>
                </div>
                <div class="category-actions">
                    <button class="btn btn-danger btn-sm" onclick="app.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(categoryElement);
        });
    }

    // Mise à jour des paramètres
    updateSettings() {
        document.getElementById('currency').value = this.settings.currency;
        document.getElementById('dateFormat').value = this.settings.dateFormat;
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('accentColor').value = this.settings.accentColor;
        document.getElementById('notificationsEnabled').checked = this.settings.notifications;
        document.getElementById('notificationDuration').value = this.settings.notificationDuration;
    }

    // Application du thème
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
    }

    // Application de la couleur d'accent
    applyAccentColor() {
        const accentColors = {
            blue: { primary: '#667eea', accent: '#4facfe' },
            purple: { primary: '#8e44ad', accent: '#9b59b6' },
            green: { primary: '#27ae60', accent: '#2ecc71' },
            red: { primary: '#e74c3c', accent: '#ff416c' },
            orange: { primary: '#f39c12', accent: '#e67e22' },
            pink: { primary: '#e91e63', accent: '#f093fb' },
            teal: { primary: '#00bcd4', accent: '#4dd0e1' },
            indigo: { primary: '#3f51b5', accent: '#5c6bc0' }
        };

        const colors = accentColors[this.settings.accentColor] || accentColors.blue;
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--accent-color', colors.accent);
        
        // Appliquer l'attribut data-accent-color pour les styles CSS spécifiques
        document.documentElement.setAttribute('data-accent-color', this.settings.accentColor);
        
        // Forcer la mise à jour des styles
        document.documentElement.offsetHeight;
    }

    // Définition de la date actuelle
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
        document.getElementById('incomeDate').value = today;
    }

    // Effacement du formulaire de dépense
    clearExpenseForm() {
        document.getElementById('expenseForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('expenseDate').value = today;
    }

    // Effacement du formulaire de revenu
    clearIncomeForm() {
        document.getElementById('incomeForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('incomeDate').value = today;
    }

    // Effacement du formulaire de catégorie
    clearCategoryForm() {
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryColor').value = '#3498db';
    }

    // Formatage de la devise
    formatCurrency(amount) {
        return `${amount.toFixed(2)} ${this.settings.currency}`;
    }

    // Formatage de la date
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        switch (this.settings.dateFormat) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return `${day}/${month}/${year}`;
        }
    }

    // Libellé du moyen de paiement
    getPaymentMethodLabel(method) {
        const labels = {
            'cash': 'Espèces',
            'card': 'Carte bancaire',
            'transfer': 'Virement',
            'check': 'Chèque'
        };
        return labels[method] || method;
    }

    // Libellé de la source de revenu
    getSourceLabel(source) {
        const labels = {
            'salary': 'Salaire',
            'freelance': 'Freelance',
            'investment': 'Investissement',
            'gift': 'Cadeau',
            'other': 'Autre'
        };
        return labels[source] || source;
    }

    // Mise à jour du calendrier
    updateCalendar() {
        this.currentDate = new Date();
        this.currentView = 'month';
        this.setupCalendarEventListeners();
        this.renderCalendar();
    }

    // Configuration des événements du calendrier
    setupCalendarEventListeners() {
        // Sélecteurs de vue
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchCalendarView(e.target.dataset.view);
            });
        });

        // Navigation
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.navigateCalendar(-1);
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.navigateCalendar(1);
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.goToToday();
        });

        // Modal - Le bouton fermer utilise maintenant onclick="app.closeModal('activityModal')"

        document.getElementById('editActivity').addEventListener('click', () => {
            this.editActivity();
        });

        document.getElementById('deleteActivity').addEventListener('click', () => {
            this.deleteActivity();
        });

        // Fermer le modal en cliquant à l'extérieur
        document.getElementById('activityModal').addEventListener('click', (e) => {
            if (e.target.id === 'activityModal') {
                this.closeModal();
            }
        });
    }

    // Changement de vue du calendrier
    switchCalendarView(view) {
        this.currentView = view;
        
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Masquer toutes les vues
        document.querySelectorAll('.calendar-view').forEach(view => {
            view.classList.remove('active');
        });

        // Afficher la vue sélectionnée
        document.getElementById(`${view}View`).classList.add('active');

        this.renderCalendar();
    }

    // Navigation dans le calendrier
    navigateCalendar(direction) {
        if (this.currentView === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.currentView === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
        } else if (this.currentView === 'year') {
            this.currentDate.setFullYear(this.currentDate.getFullYear() + direction);
        }
        this.renderCalendar();
    }

    // Aller à aujourd'hui
    goToToday() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    // Rendu du calendrier
    renderCalendar() {
        this.updateCalendarHeader();
        
        if (this.currentView === 'month') {
            this.renderMonthView();
        } else if (this.currentView === 'week') {
            this.renderWeekView();
        } else if (this.currentView === 'year') {
            this.renderYearView();
        }
    }

    // Mise à jour de l'en-tête du calendrier
    updateCalendarHeader() {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        const year = this.currentDate.getFullYear();
        const month = months[this.currentDate.getMonth()];

        if (this.currentView === 'month') {
            document.getElementById('currentDate').textContent = `${month} ${year}`;
        } else if (this.currentView === 'week') {
            const weekStart = this.getWeekStart(this.currentDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            const startMonth = months[weekStart.getMonth()];
            const endMonth = months[weekEnd.getMonth()];
            
            if (weekStart.getMonth() === weekEnd.getMonth()) {
                document.getElementById('currentDate').textContent = `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}, ${year}`;
            } else {
                document.getElementById('currentDate').textContent = `${weekStart.getDate()} ${startMonth} - ${weekEnd.getDate()} ${endMonth}, ${year}`;
            }
        } else if (this.currentView === 'year') {
            document.getElementById('currentDate').textContent = year.toString();
        }
    }

    // Rendu de la vue mensuelle
    renderMonthView() {
        const container = document.getElementById('calendarDays');
        container.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Premier jour du mois et dernier jour
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Premier jour de la semaine (lundi = 1)
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
        
        // Jours du mois précédent
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            const dayElement = this.createDayElement(day, true, year, month - 1);
            container.appendChild(dayElement);
        }
        
        // Jours du mois actuel
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, false, year, month);
            container.appendChild(dayElement);
        }
        
        // Jours du mois suivant pour compléter la grille
        const totalCells = container.children.length;
        const remainingCells = 42 - totalCells; // 6 semaines * 7 jours
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true, year, month + 1);
            container.appendChild(dayElement);
        }
    }

    // Création d'un élément jour
    createDayElement(day, isOtherMonth, year, month) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Vérifier si c'est aujourd'hui
        const today = new Date();
        if (!isOtherMonth && year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-events"></div>
        `;
        
        // Ajouter les événements du jour
        if (!isOtherMonth) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            this.addEventsToDay(dayElement, dateStr);
        }
        
        // Gestionnaire de clic
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                this.showDayDetails(dateStr);
            }
        });
        
        return dayElement;
    }

    // Ajout des événements à un jour
    addEventsToDay(dayElement, dateStr) {
        const eventsContainer = dayElement.querySelector('.day-events');
        const dayEvents = this.getEventsForDate(dateStr);
        
        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = `day-event ${event.type}`;
            eventElement.textContent = event.description;
            eventElement.title = `${event.description} - ${this.formatCurrency(event.amount)}`;
            
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEventDetails(event);
            });
            
            eventsContainer.appendChild(eventElement);
        });
    }

    // Récupération des événements pour une date
    getEventsForDate(dateStr) {
        const events = [];
        
        // Ajouter les dépenses
        this.expenses.forEach(expense => {
            if (expense.date === dateStr) {
                const category = this.categories.find(cat => cat.id === expense.categoryId);
                events.push({
                    ...expense,
                    type: 'expense',
                    categoryName: category ? category.name : 'Inconnue'
                });
            }
        });
        
        // Ajouter les revenus
        this.incomes.forEach(income => {
            if (income.date === dateStr) {
                const category = this.incomeCategories.find(cat => cat.id === income.categoryId);
                events.push({
                    ...income,
                    type: 'income',
                    categoryName: category ? category.name : 'Inconnue'
                });
            }
        });
        
        return events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Rendu de la vue hebdomadaire
    renderWeekView() {
        const weekStart = this.getWeekStart(this.currentDate);
        const weekDays = document.getElementById('weekDays');
        const weekEvents = document.getElementById('weekEvents');
        
        weekDays.innerHTML = '';
        weekEvents.innerHTML = '';
        
        // En-têtes des jours
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'week-day';
            dayElement.innerHTML = `
                <div>${day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div style="font-weight: bold;">${day.getDate()}</div>
            `;
            weekDays.appendChild(dayElement);
            
            // Colonne d'événements
            const eventColumn = document.createElement('div');
            eventColumn.className = 'week-day-column';
            eventColumn.dataset.date = day.toISOString().split('T')[0];
            weekEvents.appendChild(eventColumn);
        }
        
        // Créneaux horaires
        this.renderTimeSlots();
        
        // Événements de la semaine
        this.renderWeekEvents(weekStart);
    }

    // Rendu de la vue annuelle
    renderYearView() {
        const yearGrid = document.getElementById('yearGrid');
        yearGrid.innerHTML = '';
        
        const year = this.currentDate.getFullYear();
        
        for (let month = 0; month < 12; month++) {
            const monthElement = document.createElement('div');
            monthElement.className = 'year-month';
            monthElement.innerHTML = `
                <h4>${this.getMonthName(month)}</h4>
                <div class="year-month-grid"></div>
            `;
            
            const monthGrid = monthElement.querySelector('.year-month-grid');
            this.renderYearMonth(monthGrid, year, month);
            
            yearGrid.appendChild(monthElement);
        }
    }

    // Rendu d'un mois dans la vue annuelle
    renderYearMonth(container, year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
        
        // Jours du mois précédent
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonth.getDate() - i;
            const dayElement = this.createYearDayElement(day, true);
            container.appendChild(dayElement);
        }
        
        // Jours du mois actuel
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createYearDayElement(day, false, year, month);
            container.appendChild(dayElement);
        }
        
        // Compléter la grille
        const remainingCells = 42 - container.children.length;
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createYearDayElement(day, true);
            container.appendChild(dayElement);
        }
    }

    // Création d'un élément jour pour la vue annuelle
    createYearDayElement(day, isOtherMonth, year, month) {
        const dayElement = document.createElement('div');
        dayElement.className = 'year-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        } else {
            // Vérifier s'il y a des événements ce jour
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const events = this.getEventsForDate(dateStr);
            if (events.length > 0) {
                dayElement.classList.add('has-events');
                dayElement.title = `${events.length} événement(s)`;
            }
        }
        
        dayElement.textContent = day;
        
        if (!isOtherMonth) {
            dayElement.addEventListener('click', () => {
                this.currentDate = new Date(year, month, day);
                this.switchCalendarView('month');
            });
        }
        
        return dayElement;
    }

    // Rendu des créneaux horaires
    renderTimeSlots() {
        const timeSlots = document.querySelector('.time-slots');
        timeSlots.innerHTML = '';
        
        for (let hour = 0; hour < 24; hour++) {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeSlots.appendChild(slot);
        }
    }

    // Rendu des événements de la semaine
    renderWeekEvents(weekStart) {
        const eventColumns = document.querySelectorAll('.week-day-column');
        
        eventColumns.forEach((column, index) => {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + index);
            const dateStr = day.toISOString().split('T')[0];
            const events = this.getEventsForDate(dateStr);
            
            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `week-event ${event.type}`;
                eventElement.textContent = event.description;
                eventElement.title = `${event.description} - ${this.formatCurrency(event.amount)}`;
                
                // Positionner l'événement selon l'heure (simulation)
                const hour = new Date(event.createdAt).getHours();
                eventElement.style.top = `${hour * 60}px`;
                eventElement.style.height = '30px';
                
                eventElement.addEventListener('click', () => {
                    this.showEventDetails(event);
                });
                
                column.appendChild(eventElement);
            });
        });
    }

    // Affichage des détails d'un jour
    showDayDetails(dateStr) {
        const events = this.getEventsForDate(dateStr);
        const date = new Date(dateStr);
        const dateFormatted = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('modalTitle').textContent = `Activités du ${dateFormatted}`;
        
        let content = '';
        if (events.length === 0) {
            content = '<p style="text-align: center; color: #666; padding: 2rem;">Aucune activité ce jour</p>';
        } else {
            content = '<div class="events-list">';
            events.forEach(event => {
                const category = event.type === 'expense' 
                    ? this.categories.find(cat => cat.id === event.categoryId)
                    : this.incomeCategories.find(cat => cat.id === event.categoryId);
                
                content += `
                    <div class="event-item ${event.type}" onclick="app.showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})">
                        <div class="event-icon">
                            <i class="${category ? category.icon : 'fas fa-tag'}"></i>
                        </div>
                        <div class="event-details">
                            <h4>${event.description}</h4>
                            <p>${category ? category.name : 'Catégorie inconnue'}</p>
                            <p>${event.type === 'expense' ? 'Dépense' : 'Revenu'}</p>
                        </div>
                        <div class="event-amount ${event.type}">
                            ${event.type === 'expense' ? '-' : '+'}${this.formatCurrency(event.amount)}
                        </div>
                    </div>
                `;
            });
            content += '</div>';
        }
        
        document.getElementById('modalContent').innerHTML = content;
        this.showModal();
    }

    // Affichage des détails d'un événement
    showEventDetails(event) {
        const category = event.type === 'expense' 
            ? this.categories.find(cat => cat.id === event.categoryId)
            : this.incomeCategories.find(cat => cat.id === event.categoryId);
        
        document.getElementById('modalTitle').textContent = event.description;
        
        const content = `
            <div class="event-details-full">
                <div class="event-header">
                    <div class="event-icon-large ${event.type}">
                        <i class="${category ? category.icon : 'fas fa-tag'}"></i>
                    </div>
                    <div class="event-info">
                        <h3>${event.description}</h3>
                        <p class="event-category">${category ? category.name : 'Catégorie inconnue'}</p>
                        <p class="event-type">${event.type === 'expense' ? 'Dépense' : 'Revenu'}</p>
                    </div>
                </div>
                <div class="event-amount-large ${event.type}">
                    ${event.type === 'expense' ? '-' : '+'}${this.formatCurrency(event.amount)}
                </div>
                <div class="event-meta">
                    <p><strong>Date:</strong> ${this.formatDate(event.date)}</p>
                    <p><strong>Créé le:</strong> ${new Date(event.createdAt).toLocaleString('fr-FR')}</p>
                    ${event.paymentMethod ? `<p><strong>Moyen de paiement:</strong> ${this.getPaymentMethodLabel(event.paymentMethod)}</p>` : ''}
                    ${event.source ? `<p><strong>Source:</strong> ${this.getSourceLabel(event.source)}</p>` : ''}
                </div>
            </div>
        `;
        
        document.getElementById('modalContent').innerHTML = content;
        this.currentEvent = event;
        this.showModal();
    }

    // Affichage du modal
    showModal() {
        document.getElementById('activityModal').classList.add('show');
    }

    // Fermeture du modal
    closeModal() {
        document.getElementById('activityModal').classList.remove('show');
        this.currentEvent = null;
    }

    // Édition d'une activité
    editActivity() {
        if (this.currentEvent) {
            // Retourner à la section appropriée
            if (this.currentEvent.type === 'expense') {
                this.switchSection('add-expense');
                // Pré-remplir le formulaire
                document.getElementById('expenseAmount').value = this.currentEvent.amount;
                document.getElementById('expenseDescription').value = this.currentEvent.description;
                document.getElementById('expenseCategory').value = this.currentEvent.categoryId;
                document.getElementById('expenseDate').value = this.currentEvent.date;
                document.getElementById('expensePaymentMethod').value = this.currentEvent.paymentMethod || 'cash';
            } else {
                this.switchSection('add-income');
                // Pré-remplir le formulaire
                document.getElementById('incomeAmount').value = this.currentEvent.amount;
                document.getElementById('incomeDescription').value = this.currentEvent.description;
                document.getElementById('incomeCategory').value = this.currentEvent.categoryId;
                document.getElementById('incomeDate').value = this.currentEvent.date;
                document.getElementById('incomeSource').value = this.currentEvent.source || 'other';
            }
            this.closeModal();
        }
    }

    // Suppression d'une activité
    deleteActivity() {
        if (this.currentEvent && confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
            if (this.currentEvent.type === 'expense') {
                this.deleteExpense(this.currentEvent.id);
            } else {
                this.deleteIncome(this.currentEvent.id);
            }
            this.closeModal();
            this.renderCalendar();
        }
    }

    // Utilitaires pour le calendrier
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster pour lundi
        return new Date(d.setDate(diff));
    }

    getMonthName(monthIndex) {
        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        return months[monthIndex];
    }

    // ===== NOUVELLES FONCTIONNALITÉS =====



    // Gestion des transactions récurrentes
    showAddRecurringModal() {
        this.populateRecurringCategories();
        document.getElementById('recurringModal').classList.add('show');
    }

    populateRecurringCategories() {
        const select = document.getElementById('recurringCategory');
        select.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        
        const type = document.getElementById('recurringType').value;
        const categories = type === 'expense' ? this.categories : this.incomeCategories;
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    addRecurringTransaction() {
        const type = document.getElementById('recurringType').value;
        const description = document.getElementById('recurringDescription').value;
        const amount = parseFloat(document.getElementById('recurringAmount').value);
        const categoryId = document.getElementById('recurringCategory').value;
        const frequency = document.getElementById('recurringFrequency').value;
        const startDate = document.getElementById('recurringStartDate').value;

        if (!description || !amount || !categoryId || !startDate) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const recurring = {
            id: Date.now().toString(),
            type: type,
            description: description,
            amount: amount,
            categoryId: categoryId,
            frequency: frequency,
            startDate: startDate,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        this.recurringTransactions.push(recurring);
        this.saveData();
        this.updateRecurringDisplay();
        this.closeModal('recurringModal');
        this.clearRecurringForm();
        this.showNotification(`Transaction récurrente "${description}" créée`, 'success');
    }

    updateRecurringDisplay() {
        const container = document.getElementById('recurringList');
        container.innerHTML = '';

        this.recurringTransactions.forEach(transaction => {
            const category = transaction.type === 'expense' 
                ? this.categories.find(cat => cat.id === transaction.categoryId)
                : this.incomeCategories.find(cat => cat.id === transaction.categoryId);

            const recurringElement = document.createElement('div');
            recurringElement.className = 'recurring-item';
            recurringElement.innerHTML = `
                <div class="recurring-info">
                    <div class="recurring-icon" style="background: ${category ? category.color : '#3498db'};">
                        <i class="${category ? category.icon : 'fas fa-tag'}"></i>
                    </div>
                    <div class="recurring-details">
                        <h4>${transaction.description}</h4>
                        <p>${category ? category.name : 'Catégorie inconnue'} • ${this.getFrequencyLabel(transaction.frequency)}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="recurring-amount" style="color: ${transaction.type === 'expense' ? '#e74c3c' : '#27ae60'};">
                        ${transaction.type === 'expense' ? '-' : '+'}${this.formatCurrency(transaction.amount)}
                    </span>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteRecurringTransaction('${transaction.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(recurringElement);
        });
    }

    getFrequencyLabel(frequency) {
        const labels = {
            'daily': 'Quotidien',
            'weekly': 'Hebdomadaire',
            'monthly': 'Mensuel',
            'yearly': 'Annuel'
        };
        return labels[frequency] || frequency;
    }

    deleteRecurringTransaction(transactionId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction récurrente ?')) {
            this.recurringTransactions = this.recurringTransactions.filter(t => t.id !== transactionId);
            this.saveData();
            this.updateRecurringDisplay();
        }
    }

    clearRecurringForm() {
        document.getElementById('recurringForm').reset();
    }

    // Gestion des rapports
    exportToPDF() {
        // Placeholder pour l'export PDF
        alert('Fonctionnalité d\'export PDF en cours de développement');
    }

    exportToExcel() {
        // Placeholder pour l'export Excel
        alert('Fonctionnalité d\'export Excel en cours de développement');
    }

    // Gestion des modals
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    // ===== SYSTÈME DE NOTIFICATIONS =====
    
    // Créer le conteneur de notifications
    createNotificationContainer() {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    // Afficher une notification
    showNotification(message, type = 'info', duration = null) {
        if (!this.settings.notifications) return;

        const notificationId = 'notification-' + Date.now();
        const notificationDuration = duration || this.settings.notificationDuration;
        
        const notification = document.createElement('div');
        notification.id = notificationId;
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-header">
                <div class="notification-icon">${icons[type] || icons.info}</div>
                <h4 class="notification-title">${this.getNotificationTitle(type)}</h4>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <p class="notification-message">${message}</p>
            <div class="notification-progress"></div>
        `;

        const container = document.querySelector('.notification-container');
        container.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Animation de la barre de progression
        const progressBar = notification.querySelector('.notification-progress');
        progressBar.style.width = '100%';
        progressBar.style.transition = `width ${notificationDuration}ms linear`;

        // Suppression automatique
        setTimeout(() => {
            this.removeNotification(notificationId);
        }, notificationDuration);

        // Stocker la notification
        this.notifications.push({
            id: notificationId,
            message,
            type,
            timestamp: new Date()
        });
    }

    // Obtenir le titre de la notification selon le type
    getNotificationTitle(type) {
        const titles = {
            success: 'Succès',
            error: 'Erreur',
            warning: 'Attention',
            info: 'Information'
        };
        return titles[type] || titles.info;
    }

    // Supprimer une notification
    removeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // Nettoyer toutes les notifications
    clearAllNotifications() {
        const container = document.querySelector('.notification-container');
        if (container) {
            container.innerHTML = '';
        }
        this.notifications = [];
    }

    // Mise à jour des sections

    updateRecurring() {
        this.updateRecurringDisplay();
    }

    updateReports() {
        // Placeholder pour la mise à jour des rapports
        console.log('Mise à jour des rapports');
    }

    // Fonction de recherche globale
    performSearch(query = '') {
        if (!query || query.length < 2) {
            this.clearSearchResults();
            return;
        }

        const searchResults = this.searchTransactions(query);
        this.displaySearchResults(searchResults, query);
    }

    searchTransactions(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        // Rechercher dans les dépenses
        this.expenses.forEach(expense => {
            if (this.matchesSearch(expense, searchTerm, 'expense')) {
                results.push({
                    ...expense,
                    type: 'expense',
                    typeLabel: 'Dépense'
                });
            }
        });

        // Rechercher dans les revenus
        this.incomes.forEach(income => {
            if (this.matchesSearch(income, searchTerm, 'income')) {
                results.push({
                    ...income,
                    type: 'income',
                    typeLabel: 'Revenu'
                });
            }
        });

        return results.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    matchesSearch(transaction, searchTerm, type) {
        const category = type === 'expense' 
            ? this.categories.find(cat => cat.id === transaction.categoryId)
            : this.incomeCategories.find(cat => cat.id === transaction.categoryId);

        return (
            transaction.description.toLowerCase().includes(searchTerm) ||
            (category && category.name.toLowerCase().includes(searchTerm)) ||
            transaction.amount.toString().includes(searchTerm) ||
            transaction.date.includes(searchTerm)
        );
    }

    displaySearchResults(results, query) {
        // Créer ou mettre à jour la section de résultats de recherche
        let searchSection = document.getElementById('searchResults');
        if (!searchSection) {
            searchSection = document.createElement('div');
            searchSection.id = 'searchResults';
            searchSection.className = 'search-results';
            document.querySelector('.main-content').insertBefore(searchSection, document.querySelector('.main-content').firstChild);
        }

        if (results.length === 0) {
            searchSection.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <h3>Aucun résultat trouvé pour "${query}"</h3>
                    <p>Essayez avec d'autres mots-clés</p>
                </div>
            `;
        } else {
            searchSection.innerHTML = `
                <div class="search-results-header">
                    <h3><i class="fas fa-search"></i> Résultats de recherche pour "${query}" (${results.length})</h3>
                    <button class="btn btn-outline btn-sm" onclick="app.clearSearchResults()">
                        <i class="fas fa-times"></i> Effacer
                    </button>
                </div>
                <div class="search-results-list">
                    ${results.map(transaction => this.createSearchResultItem(transaction)).join('')}
                </div>
            `;
        }

        searchSection.style.display = 'block';
    }

    createSearchResultItem(transaction) {
        const category = transaction.type === 'expense' 
            ? this.categories.find(cat => cat.id === transaction.categoryId)
            : this.incomeCategories.find(cat => cat.id === transaction.categoryId);

        return `
            <div class="search-result-item" onclick="app.viewTransaction('${transaction.id}', '${transaction.type}')">
                <div class="search-result-icon" style="background: ${category ? category.color : '#3498db'};">
                    <i class="${category ? category.icon : 'fas fa-tag'}"></i>
                </div>
                <div class="search-result-info">
                    <h4>${transaction.description}</h4>
                    <p>${category ? category.name : 'Catégorie inconnue'} • ${this.formatDate(transaction.date)}</p>
                </div>
                <div class="search-result-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    }

    clearSearchResults() {
        const searchSection = document.getElementById('searchResults');
        if (searchSection) {
            searchSection.style.display = 'none';
        }
        document.getElementById('globalSearch').value = '';
    }

    viewTransaction(transactionId, type) {
        // Basculer vers l'historique et filtrer la transaction
        this.switchSection('history');
        // Ici on pourrait ajouter un filtre pour afficher seulement cette transaction
        this.clearSearchResults();
    }

    // Sauvegarde automatique
    startAutoSave() {
        if (this.settings.autoSave && this.settings.autoSaveInterval > 0) {
            this.autoSaveInterval = setInterval(() => {
                this.performAutoSave();
            }, this.settings.autoSaveInterval);
        }
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    performAutoSave() {
        try {
            this.saveData();
            this.showNotification('Sauvegarde automatique effectuée', 'info', 2000);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde automatique:', error);
        }
    }

    showAutoSaveNotification() {
        // Créer une notification discrète
        const notification = document.createElement('div');
        notification.className = 'auto-save-notification';
        notification.innerHTML = '<i class="fas fa-save"></i> Sauvegardé automatiquement';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-color);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-size: 0.9rem;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Disparition après 2 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Sauvegarde manuelle avec confirmation
    manualSave() {
        try {
            this.saveData();
            this.showNotification('Sauvegarde réussie !', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }

    showSaveNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `save-notification ${type}`;
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'}"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius-lg);
            font-size: 0.9rem;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: var(--box-shadow-lg);
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'apparition
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Disparition après 3 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Export des données avec horodatage
    exportDataWithTimestamp() {
        const data = {
            expenses: this.expenses,
            incomes: this.incomes,
            categories: this.categories,
            incomeCategories: this.incomeCategories,
            recurringTransactions: this.recurringTransactions,
            settings: this.settings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const link = document.createElement('a');
        link.href = url;
        link.download = `depenses_backup_${timestamp}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showSaveNotification('Sauvegarde exportée avec succès !', 'success');
    }
}

// Gestion des contrôles de fenêtre personnalisés
class WindowControls {
    constructor() {
        this.setupWindowControls();
    }

    setupWindowControls() {
        // Bouton minimiser
        const minimizeBtn = document.getElementById('minimizeBtn');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => {
                if (window.electronAPI) {
                    window.electronAPI.minimizeWindow();
                }
            });
        }

        // Bouton maximiser/restaurer
        const maximizeBtn = document.getElementById('maximizeBtn');
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => {
                if (window.electronAPI) {
                    window.electronAPI.toggleMaximizeWindow();
                }
            });
        }

        // Bouton fermer
        const closeBtn = document.getElementById('closeBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (window.electronAPI) {
                    window.electronAPI.closeWindow();
                }
            });
        }

        // Double-clic sur la barre de titre pour maximiser/restaurer
        const titlebarDragRegion = document.querySelector('.titlebar-drag-region');
        if (titlebarDragRegion) {
            titlebarDragRegion.addEventListener('dblclick', () => {
                if (window.electronAPI) {
                    window.electronAPI.toggleMaximizeWindow();
                }
            });
        }
    }
}

// Initialisation de l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ExpenseTracker();
    window.windowControls = new WindowControls();
});
