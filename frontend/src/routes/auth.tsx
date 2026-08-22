import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import heroAtlas from "@/assets/hero-atlas.jpg";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { Combobox } from "@/components/ui/combobox";
import { useLogin } from "@/hooks/useLogin";
import { useSignup } from "@/hooks/useSignup";
import { authService } from "@/services/auth.service";
import { consumeAuthRedirect } from "@/lib/auth-redirect";
import { API_ORIGIN } from "@/lib/api";
import { COUNTRIES } from "@/lib/countries";
import { NATIVE_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Se connecter - L'Bled First" },
      {
        name: "description",
        content:
          "Connectez-vous ou creez votre compte L'Bled First pour decouvrir et reserver des experiences rurales authentiques au Maroc.",
      },
    ],
  }),
  component: AuthScreen,
});

type Copy = {
  back: string;
  welcome: string;
  tagline: string;
  loginTab: string;
  signupTab: string;
  loginTitle: string;
  signupTitle: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  nativeLanguage: string;
  countryPh: string;
  languagePh: string;
  loginBtn: string;
  signupBtn: string;
  google: string;
  or: string;
  noAccount: string;
  hasAccount: string;
  errRequired: string;
  errPasswordMismatch: string;
};

const COPY: Copy = {
  back: "Back to home",
  welcome: "Welcome to the bled",
  tagline: "Meet the real rural Morocco, filmed and told by its people.",
  loginTab: "Log in",
  signupTab: "Sign up",
  loginTitle: "Good to see you again",
  signupTitle: "Create your account",
  fullName: "Full name",
  email: "Email address",
  password: "Password",
  confirmPassword: "Confirm password",
  country: "Country of origin",
  nativeLanguage: "Native language",
  countryPh: "Pick your country...",
  languagePh: "Pick your language...",
  loginBtn: "Log in",
  signupBtn: "Create my account",
  google: "Continue with Google",
  or: "or",
  noAccount: "No account yet?",
  hasAccount: "Already registered?",
  errRequired: "Please fill in all fields.",
  errPasswordMismatch: "Passwords do not match.",
};

function AuthScreen() {
  const c = COPY;
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const { signup, loading: signupLoading, error: signupError } = useSignup();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [verifiedMessage, setVerifiedMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    nativeLanguage: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam === "google") {
        setGoogleFailed(true);
        setClientError("La connexion avec Google a échoué. Réessayez ou utilisez votre email.");
      }
      const verifiedParam = params.get("verified");
      if (verifiedParam === "1") {
        setVerifiedMessage({
          ok: true,
          text: "Votre email a bien été confirmé — vous pouvez vous connecter.",
        });
      } else if (verifiedParam === "0") {
        setVerifiedMessage({
          ok: false,
          text: "Ce lien de confirmation est invalide ou a expiré.",
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const set = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const loading = loginLoading || signupLoading;
  const error =
    (googleFailed
      ? "La connexion avec Google a échoué. Réessayez ou utilisez votre email."
      : null) ||
    clientError ||
    loginError ||
    signupError;
  const countryOptions = COUNTRIES.map((country) => ({
    value: country.name,
    label: country.name,
    hint: country.flag,
  }));
  const languageOptions = NATIVE_LANGUAGES.map((language) => ({
    value: language.name,
    label: language.name,
  }));

  const finishAuth = (role?: "admin" | "tourist") => {
    const pendingRedirect = consumeAuthRedirect();
    const target =
      role === "admin" ? "/admin" : pendingRedirect ?? "/me/bookings";
    // Full navigation so route guards see the cookie-backed session after login
    // (SPA navigate can run before React applies setAuth from the same submit).
    window.location.assign(target);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setClientError(null);
    setShowResend(false);

    if (mode === "login") {
      if (!form.email || !form.password) {
        setClientError(c.errRequired);
        return;
      }

      const result = await login({ email: form.email, password: form.password });
      if (!result.ok) {
        if (result.emailNotVerified) {
          setShowResend(true);
          setResendEmail(form.email);
        }
        return;
      }
      finishAuth(result.role);
      return;
    }

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.country ||
      !form.nativeLanguage
    ) {
      setClientError(c.errRequired);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setClientError(c.errPasswordMismatch);
      return;
    }

    const result = await signup({
      name: form.fullName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      country: form.country,
      language: form.nativeLanguage,
    });

    if (!result.ok) return;
    if (result.emailVerified === false) {
      setMode("login");
      setVerifiedMessage({
        ok: true,
        text: "Compte créé ! Vérifiez votre boîte mail et cliquez sur le lien de confirmation avant de vous connecter.",
      });
      return;
    }
    finishAuth(result.role);
  };

  const resendEmailLink = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await authService.resendVerification(resendEmail);
      setVerifiedMessage({
        ok: true,
        text: "Un nouveau lien de confirmation a été envoyé à votre adresse email.",
      });
      setShowResend(false);
      setClientError(null);
    } catch (err) {
      setClientError("Impossible de renvoyer le lien. Veuillez réessayer plus tard.");
    } finally {
      setResendLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={heroAtlas}
          alt="Paysage rural marocain dans l'Atlas"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-card">
          <p className="font-hand text-3xl text-saffron">{c.welcome}</p>
          <p className="mt-3 max-w-md font-display text-2xl font-bold leading-snug">{c.tagline}</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {c.back}
          </Link>
          <LanguageSelector />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <Logo className="mb-8 self-start" />

          <div className="mb-6 inline-flex rounded-full border border-border bg-muted p-1">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setClientError(null);
                  setShowResend(false);
                  setVerifiedMessage(null);
                }}
                className={`relative rounded-full px-6 py-2 text-sm font-semibold transition ${
                  mode === tab
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === tab && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{tab === "login" ? c.loginTab : c.signupTab}</span>
              </button>
            ))}
          </div>

          <h1 className="mb-6 font-display text-2xl font-extrabold text-foreground">
            {mode === "login" ? c.loginTitle : c.signupTitle}
          </h1>

          <button
            type="button"
            onClick={() => {
              // Navigation plein-page (pas d'appel axios) : le flux OAuth2 a besoin
              // de vraies redirections de navigateur vers Google puis retour ici.
              window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
            }}
            className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <GoogleIcon />
            {c.google}
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {c.or}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    className={inputCls}
                    placeholder={c.fullName}
                    value={form.fullName}
                    onChange={set("fullName")}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              className={inputCls}
              type="email"
              placeholder={c.email}
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />

            <div className="relative">
              <input
                className={inputCls}
                type={showPassword ? "text" : "password"}
                placeholder={c.password}
                value={form.password}
                onChange={set("password")}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label="toggle password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-muted-foreground transition hover:text-primary"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <input
                      className={inputCls}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={c.confirmPassword}
                      value={form.confirmPassword}
                      onChange={set("confirmPassword")}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                      aria-label="toggle confirm password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid gap-3 overflow-visible sm:grid-cols-2"
                >
                  <Combobox
                    value={form.country}
                    onChange={(value) => setForm((prev) => ({ ...prev, country: value }))}
                    options={countryOptions}
                    placeholder={c.countryPh}
                  />
                  <Combobox
                    value={form.nativeLanguage}
                    onChange={(value) => setForm((prev) => ({ ...prev, nativeLanguage: value }))}
                    options={languageOptions}
                    placeholder={c.languagePh}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!error && verifiedMessage && (
              <p
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  verifiedMessage.ok
                    ? "bg-secondary/10 text-secondary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {verifiedMessage.text}
              </p>
            )}
            {error && (
              <div className="space-y-2">
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
                {showResend && (
                  <button
                    type="button"
                    onClick={resendEmailLink}
                    disabled={resendLoading}
                    className="text-xs font-semibold text-primary hover:underline block text-right w-full"
                  >
                    {resendLoading ? "Envoi en cours..." : "Pas reçu d'e-mail ? Renvoyer le lien de confirmation"}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.01] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? c.loginBtn : c.signupBtn}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "login" ? c.noAccount : c.hasAccount}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setClientError(null);
                setShowResend(false);
                setVerifiedMessage(null);
              }}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? c.signupTab : c.loginTab}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
