<?php
// ============================================
// CONFIGURATION SERZIAM TECHNOLOGY SSH
// ============================================
// Copier ce fichier en config.php et modifier
// les valeurs selon votre environnement
// ============================================

// Sécurité : empêcher l'accès direct
if (!defined('SERZIAM_SSH')) {
    die('Accès direct interdit');
}

// ====================
// BASE DE DONNÉES
// ====================

/**
 * Configuration MySQL
 * Modifier selon votre hébergement
 */
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'serziam_ssh');
define('DB_USER', 'votre_utilisateur');
define('DB_PASS', 'votre_mot_de_passe');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATION', 'utf8mb4_unicode_ci');

// ====================
// CONFIGURATION SITE
// ====================

/**
 * URL du site (sans slash final)
 */
define('SITE_URL', 'https://votre-domaine.com');
define('SITE_NAME', 'Serziam Technology SSH');
define('SITE_DESC', 'Vente de serveurs SSH/VPN premium');
define('SITE_LANG', 'fr');
define('SITE_TIMEZONE', 'Africa/Conakry');

// ====================
// PAIEMENT USSD
// ====================

/**
 * Numéros pour les paiements
 * Ces numéros sont masqués dans le frontend
 */
define('ORANGE_NUMBER', '622001839');
define('MTN_NUMBER', '663199359');

/**
 * Réduction quotidienne (en GNF)
 */
define('DAILY_REDUCTION', 1000);

// ====================
 ADMINISTRATION
// ====================

/**
 * Identifiants administrateur
 * Ces identifiants sont utilisés pour se connecter à /admin/
 */
define('ADMIN_USERNAME', 'yayacamara');
define('ADMIN_PASSWORD_HASH', password_hash('yayacamara1995', PASSWORD_DEFAULT));

// ====================
// SÉCURITÉ
// ====================

/**
 * Clé de sécurité pour les tokens
 * Générer une clé unique avec : php -r "echo bin2hex(random_bytes(32));"
 */
define('SECURITY_KEY', 'votre_clé_secrète_unique_ici');

/**
 * Protection contre les attaques
 */
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT', 300); // 5 minutes en secondes
define('SESSION_TIMEOUT', 3600); // 1 heure en secondes

/**
 * Protection CSRF
 */
define('CSRF_TOKEN_LIFE', 3600); // 1 heure

// ====================
// UPLOAD
// ====================

/**
 * Configuration des uploads
 */
define('UPLOAD_MAX_SIZE', 5242880); // 5MB en bytes
define('UPLOAD_ALLOWED_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'ovpn', 'txt']);
define('UPLOAD_DIR', __DIR__ . '/assets/uploads/');

// ====================
// EMAIL
// ====================

/**
 * Configuration email (pour notifications)
 */
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'votre-email@gmail.com');
define('SMTP_PASS', 'votre-mot-de-passe');
define('SMTP_FROM', 'noreply@votre-domaine.com');
define('SMTP_NAME', 'Serziam SSH');

// ====================
// ANALYTICS
// ====================

/**
 * Google Analytics (optionnel)
 */
define('ANALYTICS_ID', ''); // UA-XXXXX ou G-XXXXX

// ====================
// MODE DÉVELOPPEMENT
// ====================

/**
 * Mode debug (désactiver en production !)
 */
define('DEBUG_MODE', true);
define('DISPLAY_ERRORS', false); // Ne jamais activer en production

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', DISPLAY_ERRORS ? 1 : 0);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ====================
// AUTRES PARAMÈTRES
// ====================

/**
 * Configuration des serveurs
 */
define('DEFAULT_SERVER_PRICE', 4000);
define('DEFAULT_SERVER_DAYS', 4);
define('SERVER_EXPIRE_MINUTES', 10); // Après paiement

/**
 * Limites
 */
define('MAX_SERVERS_PER_PAGE', 12);
define('MAX_TESTIMONIALS_PER_PAGE', 10);
define('MAX_TRANSACTIONS_PER_PAGE', 20);

// ====================
// CONSTANTES GLOBALES
// ====================

/**
 * Définition de constante pour vérifier l'accès aux fichiers
 */
define('SERZIAM_SSH', true);

/**
 * Version du système
 */
define('VERSION', '1.0.0');
define('BUILD_DATE', '2024-01-01');

// ====================
// FONCTIONS D'AIDE
// ====================

/**
 * Charger automatiquement les classes
 */
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/includes/classes/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * Fonction de débogage
 */
function debug($data, $die = false) {
    if (DEBUG_MODE) {
        echo '<pre>';
        print_r($data);
        echo '</pre>';
        if ($die) die();
    }
}

/**
 * Journalisation
 */
function log_message($action, $details = '') {
    $log_file = __DIR__ . '/logs/' . date('Y-m-d') . '.log';
    $message = date('Y-m-d H:i:s') . " - $action - $details\n";
    @file_put_contents($log_file, $message, FILE_APPEND | LOCK_EX);
}

// ====================
// INITIALISATION
// ====================

/**
 * Démarrage de session sécurisé
 */
function secure_session_start() {
    $session_name = 'serziam_ssh_session';
    $secure = true;
    $httponly = true;
    
    if (ini_set('session.use_only_cookies', 1) === false) {
        header("Location: /error.php?err=Could not initiate a safe session (ini_set)");
        exit();
    }
    
    $cookieParams = session_get_cookie_params();
    session_set_cookie_params([
        'lifetime' => $cookieParams["lifetime"],
        'path' => '/',
        'domain' => $_SERVER['HTTP_HOST'],
        'secure' => $secure,
        'httponly' => $httponly,
        'samesite' => 'Strict'
    ]);
    
    session_name($session_name);
    session_start();
    session_regenerate_id(true);
}

// Démarrer la session
secure_session_start();

// Définir le fuseau horaire
date_default_timezone_set(SITE_TIMEZONE);

// ====================
// VÉRIFICATIONS
// ====================

/**
 * Vérifier que la configuration est correcte
 */
function check_configuration() {
    $errors = [];
    
    // Vérifier la base de données
    try {
        $db = new PDO(
            'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=' . DB_CHARSET,
            DB_USER,
            DB_PASS
        );
    } catch (PDOException $e) {
        $errors[] = 'Erreur de connexion à la base de données: ' . $e->getMessage();
    }
    
    // Vérifier les répertoires
    $required_dirs = ['assets/uploads', 'logs', 'cache'];
    foreach ($required_dirs as $dir) {
        if (!is_writable(__DIR__ . '/' . $dir)) {
            $errors[] = "Le répertoire $dir n'est pas accessible en écriture";
        }
    }
    
    // Vérifier les extensions PHP
    $required_extensions = ['pdo', 'pdo_mysql', 'openssl', 'mbstring'];
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            $errors[] = "L'extension PHP $ext n'est pas installée";
        }
    }
    
    // Afficher les erreurs
    if (!empty($errors) && DEBUG_MODE) {
        echo '<div style="background:#f8d7da;color:#721c24;padding:20px;margin:20px;border:1px solid #f5c6cb;border-radius:5px;">';
        echo '<h3>Erreurs de configuration</h3>';
        echo '<ul>';
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo '</ul>';
        echo '</div>';
    }
    
    return empty($errors);
}

// Exécuter les vérifications
if (DEBUG_MODE) {
    check_configuration();
}
