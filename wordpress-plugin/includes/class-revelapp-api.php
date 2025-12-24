<?php
/**
 * Customer Portal API endpoints
 */

class RevelApp_API {
    /**
     * Register REST API routes
     */
    public static function register_routes() {
        $namespace = 'revel/v1';

        // Home endpoint
        register_rest_route($namespace, '/home', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_home_data'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);

        // Members endpoint
        register_rest_route($namespace, '/members', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_members'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);

        // Rewards endpoint
        register_rest_route($namespace, '/rewards', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_rewards'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);

        // Contract endpoint
        register_rest_route($namespace, '/contract', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_contract'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);

        // Change requests - GET
        register_rest_route($namespace, '/change-requests', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_change_requests'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);

        // Change requests - POST
        register_rest_route($namespace, '/change-requests', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'create_change_request'],
            'permission_callback' => [__CLASS__, 'check_auth'],
        ]);
    }

    /**
     * Check authentication
     */
    public static function check_auth() {
        return is_user_logged_in();
    }

    /**
     * Get home data
     */
    public static function get_home_data($request) {
        $user_id = get_current_user_id();
        $facility = RevelApp_DB::get_facility_by_user($user_id);

        return new WP_REST_Response([
            'stats' => [
                'members' => 25,
                'sessions' => 520,
                'monthly_reward' => 78000,
                'days_active' => 145
            ],
            'monthly_trend' => [
                ['month' => '7月', 'users' => 12, 'sessions' => 240],
                ['month' => '8月', 'users' => 15, 'sessions' => 310],
                ['month' => '9月', 'users' => 18, 'sessions' => 380],
                ['month' => '10月', 'users' => 20, 'sessions' => 420],
                ['month' => '11月', 'users' => 22, 'sessions' => 465],
                ['month' => '12月', 'users' => 25, 'sessions' => 520],
            ],
            'recent_activities' => [
                [
                    'user' => '田中 太郎',
                    'action' => 'ゲームセッション完了',
                    'time' => '2時間前',
                    'game' => 'フォーカス'
                ]
            ]
        ], 200);
    }

    /**
     * Get members
     */
    public static function get_members($request) {
        // Mock data - replace with actual DB queries
        return new WP_REST_Response([
            'members' => [
                [
                    'id' => 1,
                    'name' => '田中 太郎',
                    'status' => 'active',
                    'join_date' => '2024-04-01',
                    'last_session' => '2024-12-24',
                    'total_sessions' => 45,
                    'favorite_game' => 'フォーカス'
                ]
            ],
            'total' => 25
        ], 200);
    }

    /**
     * Get rewards
     */
    public static function get_rewards($request) {
        return new WP_REST_Response([
            'current_month' => [
                'amount' => 78000,
                'status' => 'confirmed',
                'payment_date' => '2024-12-25'
            ],
            'history' => [
                [
                    'month' => '2024年12月',
                    'amount' => 78000,
                    'status' => 'confirmed',
                    'payment_date' => '2024-12-25'
                ]
            ]
        ], 200);
    }

    /**
     * Get contract
     */
    public static function get_contract($request) {
        return new WP_REST_Response([
            'facility_name' => '社会福祉法人 サンプル施設',
            'plan' => 'スタンダードプラン',
            'start_date' => '2024-04-01',
            'renewal_date' => '2025-04-01',
            'member_count' => 25,
            'monthly_fee' => 125000,
            'games' => ['フォーカス', 'メモリー', 'パズル', 'リズム', 'カラーマッチ']
        ], 200);
    }

    /**
     * Get change requests
     */
    public static function get_change_requests($request) {
        return new WP_REST_Response([
            'requests' => [
                [
                    'id' => 1,
                    'type' => '利用者追加',
                    'status' => 'approved',
                    'created_at' => '2024-12-20',
                    'description' => '新規利用者3名の追加'
                ]
            ]
        ], 200);
    }

    /**
     * Create change request
     */
    public static function create_change_request($request) {
        $params = $request->get_json_params();

        // Validate and save to database
        // For now, return success

        return new WP_REST_Response([
            'success' => true,
            'message' => '申請を受け付けました',
            'request_id' => 123
        ], 201);
    }
}
