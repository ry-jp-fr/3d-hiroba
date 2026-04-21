import { redirect } from "next/navigation";
import { adminPasswordEnabled, isAdminAuthed } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "ログイン",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (!adminPasswordEnabled()) {
    redirect("/admin");
  }
  if (await isAdminAuthed()) {
    redirect("/admin");
  }
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-black/5 p-8">
        <h1 className="text-xl font-bold">作品管理</h1>
        <p className="mt-2 text-sm text-ink-muted">
          ダッシュボードにアクセスするためのパスワードを入力してください。
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
