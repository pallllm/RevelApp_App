<?php
/**
 * Plugin Name: RevelApp API
 * Plugin URI: https://revelapp.example.com
 * Description: REST API for RevelApp customer portal and admin app
 * Version: 1.0.0
 * Author: RevelApp Team
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('REVELAPP_VERSION', '1.0.0');
define('REVELAPP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('REVELAPP_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include core files
require_once REVELAPP_PLUGIN_DIR . 'includes/class-revelapp-db.php';
require_once REVELAPP_PLUGIN_DIR . 'includes/class-revelapp-api.php';
require_once REVELAPP_PLUGIN_DIR . 'includes/class-revelapp-admin-api.php';

/**
 * Initialize the plugin
 */
function revelapp_init() {
    // Register custom post types and tables on activation
    register_activation_hook(__FILE__, 'revelapp_activate');

    // Initialize API routes
    add_action('rest_api_init', ['RevelApp_API', 'register_routes']);
    add_action('rest_api_init', ['RevelApp_Admin_API', 'register_routes']);
}
add_action('plugins_loaded', 'revelapp_init');

/**
 * Activation hook
 */
function revelapp_activate() {
    RevelApp_DB::create_tables();
    flush_rewrite_rules();
}

/**
 * Deactivation hook
 */
function revelapp_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'revelapp_deactivate');
