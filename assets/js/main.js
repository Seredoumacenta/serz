/**
 * Serziam SSH - JavaScript Principal
 * Version: 1.0.0
 */

class SerziamApp {
    constructor() {
        this.siteUrl = window.location.origin;
        this.currentRating = 0;
        this.currentServer = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkViewport();
        this.initializeComponents();
        this.checkForUpdates();
    }

    setupEventListeners() {
        // Menu mobile
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', 
                    navMenu.classList.contains('active'));
            });
            
            // Fermer le menu en cliquant à l'extérieur
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
        
        // Stars rating
        document.querySelectorAll('.stars i').forEach(star => {
            star.addEventListener('click', (e) => this.handleStarClick(e));
            star.addEventListener('mouseover', (e) => this.handleStarHover(e));
        });
        
        if (document.querySelector('.stars')) {
            document.querySelector('.stars').addEventListener('mouseleave', 
                () => this.resetStars());
        }
        
        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }
        
        // Scroll animations
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Resize
        window.addEventListener('resize', () => this.checkViewport());
        
        // Service worker (PWA)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker enregistré:', registration);
                    })
                    .catch(error => {
                        console.log('ServiceWorker échec:', error);
                    });
            });
        }
    }

    checkViewport() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('is-mobile', isMobile);
        document.body.classList.toggle('is-desktop', !isMobile);
    }

    initializeComponents() {
        // Initialiser le ticker
        this.initTicker();
        
        // Initialiser les tooltips
        this.initTooltips();
        
        // Initialiser les modals
        this.initModals();
        
        // Initialiser les serveurs
        this.initServers();
        
        // Vérifier la connexion
        this.checkConnection();
    }

    initTicker() {
        const ticker = document.querySelector('.ticker-content');
        if (!ticker) return;
        
        // Dupliquer le contenu pour un défilement continu
        const content = ticker.innerHTML;
        ticker.innerHTML = content + content;
        
        // Ajuster la vitesse selon la largeur
        const width = ticker.scrollWidth / 2;
        const duration = (width / 50) * 10; // 50px par seconde
        ticker.style.animationDuration = `${duration}s`;
    }

    initTooltips() {
        const elements = document.querySelectorAll('[title]');
        elements.forEach(el => {
            el.setAttribute('aria-label', el.getAttribute('title'));
            el.removeAttribute('title');
        });
    }

    initModals() {
        // Fermer le modal avec ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Fermer en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    initServers() {
        const serverCards = document.querySelectorAll('.server-card');
        serverCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn')) {
                    this.showServerDetails(card.dataset.id);
                }
            });
        });
    }

    async showServerDetails(serverId) {
        try {
            const response = await fetch(`${this.siteUrl}/api/servers.php?id=${serverId}`);
            const server = await response.json();
            
            const modal = new ServerModal(server);
            modal.show();
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur de chargement', 'error');
        }
    }

    handleStarClick(event) {
        this.currentRating = parseInt(event.target.dataset.rating);
        this.updateStars();
        localStorage.setItem('userRating', this.currentRating);
    }

    handleStarHover(event) {
        const rating = parseInt(event.target.dataset.rating);
        this.highlightStars(rating);
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.stars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }

    resetStars() {
        this.highlightStars(this.currentRating);
    }

    updateStars() {
        this.highlightStars(this.currentRating);
    }

    async handleContactForm(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Validation
        if (!data.name || !data.email || !data.message) {
            this.showNotification('Veuillez remplir tous les champs', 'warning');
            return;
        }
        
        if (!this.validateEmail(data.email)) {
            this.showNotification('Email invalide', 'warning');
            return;
        }
        
        try {
            const response = await fetch(`${this.siteUrl}/api/contact.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Message envoyé avec succès!', 'success');
                form.reset();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur de connexion', 'error');
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.querySelector('.navbar');
        
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Animations au scroll
        this.animateOnScroll();
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const position = element.getBoundingClientRect().top;
            
            if (position < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    }

    checkConnection() {
        if (!navigator.onLine) {
            this.showNotification('Vous êtes hors ligne', 'warning');
        }
        
        window.addEventListener('online', () => {
            this.showNotification('Connexion rétablie', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.showNotification('Vous êtes hors ligne', 'warning');
        });
    }

    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            if (registration.update) {
                registration.update();
            }
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        document.body.classList.remove('modal-open');
    }

    showNotification(message, type = 'info') {
        // Supprimer les anciennes notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" aria-label="Fermer">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Supprimer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback pour les anciens navigateurs
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    formatNumber(number) {
        return new Intl.NumberFormat('fr-GN').format(number);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Classes spécialisées
class PaymentVerification {
    constructor() {
        this.apiUrl = `${window.location.origin}/api/verify.php`;
    }

    async verify(message) {
        const resultDiv = document.getElementById('verificationResult');
        if (!resultDiv) return;
        
        resultDiv.innerHTML = `
            <div class="loading-state">
                <div class="loading"></div>
                <p>Vérification en cours...</p>
            </div>
        `;
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            const result = await response.json();
            
            if (result.success) {
                resultDiv.innerHTML = `
                    <div class="success-state">
                        <i class="fas fa-check-circle"></i>
                        <h4>Paiement vérifié !</h4>
                        <p>${result.message}</p>
                        ${result.config ? `
                            <div class="verification-actions">
                                <button class="btn btn-primary" onclick="app.showConfig(${JSON.stringify(result).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-code"></i> Voir la configuration
                                </button>
                                ${result.configFile ? `
                                    <button class="btn btn-secondary" onclick="app.downloadConfig('${result.configFile}', '${btoa(result.config)}')">
                                        <i class="fas fa-download"></i> Télécharger
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
                app.showNotification('Paiement vérifié avec succès', 'success');
            } else {
                resultDiv.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <h4>Échec de vérification</h4>
                        <p>${result.message}</p>
                    </div>
                `;
                app.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            resultDiv.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4>Erreur de connexion</h4>
                    <p>Impossible de vérifier le paiement. Vérifiez votre connexion.</p>
                </div>
            `;
            app.showNotification('Erreur de connexion', 'error');
        }
    }
}

class TestimonialSystem {
    constructor() {
        this.apiUrl = `${window.location.origin}/api/testimonials.php`;
    }

    async submit() {
        const text = document.getElementById('testimonialText')?.value;
        const username = document.getElementById('userName')?.value || 'Anonyme';
        
        if (!app.currentRating) {
            app.showNotification('Veuillez donner une note', 'warning');
            return;
        }
        
        if (!text?.trim()) {
            app.showNotification('Veuillez écrire un témoignage', 'warning');
            return;
        }
        
        if (text.length > 500) {
            app.showNotification('Le témoignage est trop long (max 500 caractères)', 'warning');
            return;
        }
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    rating: app.currentRating,
                    content: text
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                app.showNotification('Merci pour votre témoignage!', 'success');
                
                // Réinitialiser
                document.getElementById('testimonialText').value = '';
                document.getElementById('userName').value = '';
                app.currentRating = 0;
                app.resetStars();
                
                // Ajouter à la liste
                this.addToGrid({
                    username,
                    rating: app.currentRating,
                    content: text,
                    created_at: new Date().toISOString()
                });
            } else {
                app.showNotification(result.message, 'error');
            }
        } catch (error) {
            console.error('Erreur:', error);
            app.showNotification('Erreur de connexion', 'error');
        }
    }

    addToGrid(testimonial) {
        const grid = document.querySelector('.testimonials-grid');
        if (!grid) return;
        
        const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
        const card = document.createElement('div');
        card.className = 'testimonial-card animate-on-scroll';
        card.innerHTML = `
            <div class="testimonial-rating">${stars}</div>
            <p class="testimonial-text">"${testimonial.content}"</p>
            <div class="testimonial-author">
                <strong>${testimonial.username}</strong>
                <span class="date">${app.formatDate(testimonial.created_at)}</span>
            </div>
        `;
        
        grid.insertBefore(card, grid.firstChild);
        
        // Animation
        setTimeout(() => card.classList.add('animated'), 100);
    }
}

class UssdHandler {
    constructor() {
        this.orangeTemplate = document.getElementById('orangeUssdTemplate')?.textContent || '';
        this.mtnTemplate = document.getElementById('mtnUssdTemplate')?.textContent || '';
    }

    payWithOrange(serverId, amount) {
        const ussdCode = this.orangeTemplate.replace('{amount}', amount);
        this.launchUssd(ussdCode);
        this.showPaymentDialog('orange', amount, serverId);
    }

    payWithMTN(serverId, amount) {
        const ussdCode = this.mtnTemplate.replace('{amount}', amount);
        this.launchUssd(ussdCode);
        this.showPaymentDialog('mtn', amount, serverId);
    }

    launchUssd(code) {
        if (app.isMobile) {
            // Sur mobile, utiliser tel:
            const telLink = document.createElement('a');
            telLink.href = `tel:${encodeURIComponent(code)}`;
            telLink.style.display = 'none';
            document.body.appendChild(telLink);
            telLink.click();
            setTimeout(() => document.body.removeChild(telLink), 100);
        } else {
            // Sur desktop, afficher le code
            this.showUssdCode(code);
        }
    }

    showUssdCode(code) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-mobile-alt"></i> Code USSD</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Composez ce code sur votre téléphone :</p>
                    <div class="ussd-code">
                        <code>${code}</code>
                        <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${code}')">
                            <i class="fas fa-copy"></i> Copier
                        </button>
                    </div>
                    <p class="ussd-help">
                        <i class="fas fa-info-circle"></i>
                        Après paiement, collez le message de confirmation dans le formulaire de vérification.
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    showPaymentDialog(operator, amount, serverId) {
        const operatorName = operator === 'orange' ? 'Orange Money' : 'Mobile Money';
        const operatorColor = operator === 'orange' ? 'orange-money' : 'mtn-money';
        
        app.showNotification(
            `Dialer ouvert. Confirmez l'envoi de ${app.formatNumber(amount)} GNF sur votre téléphone.`,
            'info'
        );
        
        // Enregistrer la tentative de paiement
        this.logPaymentAttempt(serverId, amount, operator);
    }

    async logPaymentAttempt(serverId, amount, operator) {
        try {
            await fetch(`${app.siteUrl}/api/payments/log.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    server_id: serverId,
                    amount: amount,
                    operator: operator,
                    user_agent: navigator.userAgent,
                    ip: await this.getIP()
                })
            });
        } catch (error) {
            console.error('Erreur de log:', error);
        }
    }

    async getIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }
}

class ServerModal {
    constructor(server) {
        this.server = server;
    }

    show() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-server"></i> ${this.server.name}</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="server-details">
                        ${this.server.image_url ? `
                            <div class="server-image-large">
                                <img src="${this.server.image_url}" alt="${this.server.name}" loading="lazy">
                            </div>
                        ` : ''}
                        
                        <div class="server-info">
                            <p class="description">${this.server.description || ''}</p>
                            
                            <div class="server-specs">
                                <div class="spec">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>Prix : ${app.formatNumber(this.server.current_price)} GNF</span>
                                </div>
                                <div class="spec">
                                    <i class="fas fa-clock"></i>
                                    <span>Durée : ${this.server.days_left} jours</span>
                                </div>
                                <div class="spec">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>Statut : ${this.server.status}</span>
                                </div>
                            </div>
                            
                            <div class="server-features-list">
                                <h4>Caractéristiques :</h4>
                                <ul>
                                    ${JSON.parse(this.server.features || '[]').map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-orange" onclick="ussdHandler.payWithOrange(${this.server.id}, ${this.server.current_price})">
                            <i class="fas fa-mobile-alt"></i> Orange Money
                        </button>
                        <button class="btn btn-yellow" onclick="ussdHandler.payWithMTN(${this.server.id}, ${this.server.current_price})">
                            <i class="fas fa-mobile-alt"></i> Mobile Money
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

class HelpModal {
    showPaymentHelp() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-question-circle"></i> Aide au paiement</h3>
                    <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-content">
                        <div class="help-step">
                            <div class="step-number">1</div>
                            <h4>Cliquez sur "Payer avec Orange Money" ou "Payer avec Mobile Money"</h4>
                            <p>Le dialer de votre téléphone s'ouvrira automatiquement avec le code USSD pré-rempli.</p>
                        </div>
                        
                        <div class="help-step">
                            <div class="step-number">2</div>
                            <h4>Confirmez le paiement sur votre téléphone</h4>
                            <p>Suivez les instructions à l'écran de votre téléphone pour compléter la transaction.</p>
                        </div>
                        
                        <div class="help-step">
                            <div class="step-number">3</div>
                            <h4>Recevez le message de confirmation</h4>
                            <p>Après paiement, vous recevrez un SMS de confirmation de la part de votre opérateur.</p>
                        </div>
                        
                        <div class="help-step">
                            <div class="step-number">4</div>
                            <h4>Collez le message dans le formulaire de vérification</h4>
                            <p>Copiez-collez le message reçu dans la zone "Vérifier votre paiement" pour obtenir votre configuration.</p>
                        </div>
                    </div>
                    
                    <div class="help-example">
                        <h4>Exemple de message :</h4>
                        <div class="example-message">
                            <p>Bonjour, Envoi de: 4000.00GNF vers le 622001839, reference: PP260130.2102.C58818. Orange Money vous remercie</p>
                        </div>
                    </div>
                    
                    <div class="help-actions">
                        <button class="btn btn-primary" onclick="app.showNotification('Support contacté', 'info')">
                            <i class="fas fa-headset"></i> Contacter le support
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

// Initialiser l'application
const app = new SerziamApp();
const ussdHandler = new UssdHandler();

// Fonctions globales pour l'HTML
window.verifyPayment = () => new PaymentVerification().verify(
    document.getElementById('transactionMessage')?.value || ''
);

window.submitTestimonial = () => new TestimonialSystem().submit();

window.payWithOrange = (serverId, amount) => ussdHandler.payWithOrange(serverId, amount);
window.payWithMTN = (serverId, amount) => ussdHandler.payWithMTN(serverId, amount);

window.showPaymentHelp = () => new HelpModal().showPaymentHelp();

window.copyConfig = () => {
    const configText = document.getElementById('configText');
    if (configText) {
        app.copyToClipboard(configText.value);
        app.showNotification('Configuration copiée !', 'success');
    }
};

window.downloadConfig = (filename, base64) => {
    const link = document.createElement('a');
    link.href = 'data:application/octet-stream;base64,' + base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    app.showNotification('Configuration téléchargée', 'success');
};

window.closeModal = () => app.closeAllModals();

// Exporter pour les tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SerziamApp,
        PaymentVerification,
        TestimonialSystem,
        UssdHandler
    };
                                           }
