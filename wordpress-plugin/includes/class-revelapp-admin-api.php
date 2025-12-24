<?php
/**
 * Admin App API endpoints
 */

class RevelApp_Admin_API {
    /**
     * Register REST API routes
     */
    public static function register_routes() {
        $namespace = 'revel-admin/v1';

        // Change requests management
        register_rest_route($namespace, '/change-requests', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_all_change_requests'],
            'permission_callback' => [__CLASS__, 'check_admin_auth'],
        ]);

        // Update change request status
        register_rest_route($namespace, '/change-requests/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => [__CLASS__, 'update_change_request'],
            'permission_callback' => [__CLASS__, 'check_admin_auth'],
        ]);

        // Facilities list
        register_rest_route($namespace, '/facilities', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_facilities'],
            'permission_callback' => [__CLASS__, 'check_admin_auth'],
        ]);

        // Facility detail
        register_rest_route($namespace, '/facilities/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_facility'],
            'permission_callback' => [__CLASS__, 'check_admin_auth'],
        ]);
    }

    /**
     * Check admin authentication
     */
    public static function check_admin_auth() {
        return current_user_can('manage_options');
    }

    /**
     * Get all change requests
     */
    public static function get_all_change_requests($request) {
        // Mock data - replace with actual DB queries
        return new WP_REST_Response([
            'requests' => [
                [
                    'id' => 1,
                    'facility_name' => 'サンプル施設',
                    'type' => '利用者追加',
                    'status' => 'pending',
                    'created_at' => '2024-12-20',
                    'requested_date' => '2025-01-01'
                ]
            ]
        ], 200);
    }

    /**
     * Update change request
     */
    public static function update_change_request($request) {
        $id = $request['id'];
        $params = $request->get_json_params();

        // Update in database

        return new WP_REST_Response([
            'success' => true,
            'message' => '申請を更新しました'
        ], 200);
    }

    /**
     * Get facilities
     */
    public static function get_facilities($request) {
        return new WP_REST_Response([
            'facilities' => [
                [
                    'id' => 1,
                    'name' => '社会福祉法人 サンプル施設',
                    'plan' => 'スタンダードプラン',
                    'member_count' => 25,
                    'status' => 'active'
                ]
            ]
        ], 200);
    }

    /**
     * Get facility detail
     */
    public static function get_facility($request) {
        $id = $request['id'];

        return new WP_REST_Response([
            'id' => $id,
            'name' => '社会福祉法人 サンプル施設',
            'contact_name' => '山田 太郎',
            'contact_email' => 'sample@facility.example.com',
            'plan' => 'スタンダードプラン',
            'member_count' => 25,
            'monthly_fee' => 125000,
            'games' => ['フォーカス', 'メモリー', 'パズル']
        ], 200);
    }
}
