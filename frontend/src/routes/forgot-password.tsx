import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

import heroAtlas from "@/assets/hero-atlas.jpg";
import { Logo } from "@/components/landing/Logo";
import { authService } from "@/services/auth.service";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Mot de passe oublié — L'Bled First" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email) {
      setError("Merci de renseigner votre email.");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      // Toujours le même message, que l'email existe ou non côté serveur —
      // on ne révèle jamais quels emails sont enregistrés.
      setSent(true);
    } catch {
      setSent(true);
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

          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-secondary" />
              <h1 className="font-display text-xl font-extrabold text-foreground">Email envoyé</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Si un compte existe pour <span className="font-semibold text-foreground">{email}</span>, un lien de
                réinitialisation vient de lui être envoyé. Vérifiez aussi vos spams.
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-extrabold text-foreground">Mot de passe oublié</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Indiquez votre email, nous vous envoyons un lien pour choisir un nouveau mot de passe.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className={inputCls}
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
