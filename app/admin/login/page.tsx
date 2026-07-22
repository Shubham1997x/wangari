import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm rounded-xl border border-hairline bg-surface p-8 shadow-[0_1px_3px_rgba(16,20,43,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <img src="/logo.png" alt="Wangari" className="h-10 w-auto object-contain" />
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Admin panel
          </p>
        </div>
        <h1 className="mt-4 font-display text-xl font-extrabold tracking-tight text-ink">
          Wangari
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
