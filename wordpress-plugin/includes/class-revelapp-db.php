<?php
/**
 * Database management class
 */

class RevelApp_DB {
    /**
     * Create custom tables
     */
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        // Facilities table
        $table_facilities = $wpdb->prefix . 'revel_facilities';
        $sql_facilities = "CREATE TABLE IF NOT EXISTS $table_facilities (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            contact_name varchar(255),
            contact_email varchar(255),
            contact_phone varchar(50),
            contract_start_date date,
            contract_plan varchar(100),
            status varchar(50) DEFAULT 'active',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        // Members table
        $table_members = $wpdb->prefix . 'revel_members';
        $sql_members = "CREATE TABLE IF NOT EXISTS $table_members (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            facility_id bigint(20) NOT NULL,
            name varchar(255) NOT NULL,
            join_date date,
            status varchar(50) DEFAULT 'active',
            favorite_game varchar(100),
            total_sessions int DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY facility_id (facility_id)
        ) $charset_collate;";

        // Rewards table
        $table_rewards = $wpdb->prefix . 'revel_rewards';
        $sql_rewards = "CREATE TABLE IF NOT EXISTS $table_rewards (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            facility_id bigint(20) NOT NULL,
            month varchar(7) NOT NULL,
            amount decimal(10,2) NOT NULL,
            status varchar(50) DEFAULT 'pending',
            payment_date date,
            member_count int,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY facility_id (facility_id)
        ) $charset_collate;";

        // Change requests table
        $table_requests = $wpdb->prefix . 'revel_change_requests';
        $sql_requests = "CREATE TABLE IF NOT EXISTS $table_requests (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            facility_id bigint(20) NOT NULL,
            type varchar(100) NOT NULL,
            status varchar(50) DEFAULT 'pending',
            requested_date date,
            approved_date date,
            payload longtext,
            notes text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY facility_id (facility_id)
        ) $charset_collate;";

        // Contracts table
        $table_contracts = $wpdb->prefix . 'revel_contracts';
        $sql_contracts = "CREATE TABLE IF NOT EXISTS $table_contracts (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            facility_id bigint(20) NOT NULL,
            plan_name varchar(100),
            member_limit int,
            monthly_fee decimal(10,2),
            payment_method varchar(50),
            bank_name varchar(255),
            bank_branch varchar(255),
            bank_account_type varchar(50),
            bank_account_number varchar(50),
            bank_account_name varchar(255),
            games longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY facility_id (facility_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_facilities);
        dbDelta($sql_members);
        dbDelta($sql_rewards);
        dbDelta($sql_requests);
        dbDelta($sql_contracts);
    }

    /**
     * Get facility by user ID
     */
    public static function get_facility_by_user($user_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'revel_facilities';

        // In production, link user_id to facility_id via user meta
        // For now, return mock data
        return [
            'id' => 1,
            'name' => '社会福祉法人 サンプル施設',
            'contact_name' => '山田 太郎',
            'contact_email' => 'sample@facility.example.com',
            'contract_plan' => 'スタンダードプラン'
        ];
    }
}
