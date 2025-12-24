"use client";

export default function AdminHome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">
          RevelApp 運営管理
        </h1>
        <p className="text-gray-600 mb-8">
          施設管理・申請対応・メンテナンス管理
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">
              変更申請管理
            </h3>
            <p className="text-sm text-gray-600">
              施設からの変更申請を確認・承認
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">施設管理</h3>
            <p className="text-sm text-gray-600">
              契約施設の詳細情報・ゲーム管理
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              メンテナンスカレンダー
            </h3>
            <p className="text-sm text-gray-600">
              環境構築・メンテナンス予定管理
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-8">Phase 3 で実装予定</p>
      </div>
    </div>
  );
}
