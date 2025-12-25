"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
  id?: string;
  name: string;
  email: string;
  initials?: string;
  startDate?: string;
}

interface MemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member?: Member | null; // nullの場合は新規登録、あれば編集
}

export function MemberFormDialog({ open, onClose, onSuccess, member }: MemberFormDialogProps) {
  const isEditing = !!member;

  const [formData, setFormData] = useState<Member>({
    name: "",
    email: "",
    initials: "",
    startDate: new Date().toISOString().split('T')[0], // 今日の日付
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // member が変更されたらフォームを更新
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        email: member.email || "",
        initials: member.initials || "",
        startDate: member.startDate ? member.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      });
    } else {
      // 新規登録の場合は初期化
      setFormData({
        name: "",
        email: "",
        initials: "",
        startDate: new Date().toISOString().split('T')[0],
      });
    }
    setError(null);
  }, [member, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isEditing ? `/api/members/${member.id}` : '/api/members';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      // 成功
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save member:', err);
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEditing ? "利用者情報を編集" : "新しい利用者を追加"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {/* エラーメッセージ */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* 氏名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                氏名 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="山田 太郎"
                disabled={loading}
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="yamada@example.com"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">ログイン時に使用します</p>
            </div>

            {/* イニシャル */}
            <div>
              <label htmlFor="initials" className="block text-sm font-medium text-gray-700 mb-1">
                イニシャル（任意）
              </label>
              <Input
                id="initials"
                name="initials"
                type="text"
                value={formData.initials}
                onChange={handleChange}
                placeholder="YT"
                maxLength={3}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">アバターに表示されます（例: YT）</p>
            </div>

            {/* 利用開始日 */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                利用開始日（任意）
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "保存中..." : isEditing ? "更新" : "追加"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
