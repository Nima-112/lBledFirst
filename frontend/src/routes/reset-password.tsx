import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import heroAtlas from "@/assets/hero-atlas.jpg";
import { Logo } from "@/components/landing/Logo";
import { authService } from "@/services/auth.service";

type Search = { token?: string };

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Réinitialiser le mot de passe — L'Bled First" }] }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien invalide — redemandez une réinitialisation.");
      return;
    }
    if (!password || !confirm) {
      setError("Merci de remplir les deux champs.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password, confirmNewPassword: confirm });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Ce lien n'est plus valide, redemandez une réinitialisation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroAtlas} alt="Paysage rural marocain dans l'Atlas" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <Logo className="mb-8 self-start" />

          {done ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h1 className="font-display text-xl font-extrabold text-foreground">Mot de passe mis à jour</h1>
              <p className="mt-2 text-sm text-muted-foreground">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <button
                type="button"
                onClick={() => navigate({ to: "/auth" })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Se connecter
              </button>
            </div>
          ) : !token ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <h1 className="font-display text-xl font-extrabold text-foreground">Lien invalide</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Ce lien de réinitialisation est incomplet.{" "}
                <Link to="/forgot-password" className="font-semibold text-primary underline underline-offset-2">
                  Redemandez-en un
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold text-foreground">Nouveau mot de passe</h1>
              <p className="mt-2 text-sm text-muted-foreground">Choisissez un nouveau mot de passe pour votre compte.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className={inputCls}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  className={inputCls}
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Mise à jour…" : "Réinitialiser le mot de passe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
