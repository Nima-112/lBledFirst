import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, KeyRound, Check } from "lucide-react";
import heroAtlas from "@/assets/hero-atlas.jpg";
import { Logo } from "@/components/landing/Logo";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { Combobox } from "@/components/ui/combobox";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/mock-auth";
import { COUNTRIES } from "@/lib/countries";
import { NATIVE_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Se connecter — L'Bled First" },
      { name: "description", content: "Connectez-vous ou créez votre compte L'Bled First." },
    ],
  }),
  component: AuthScreen,
});

type Copy = {
  back: string; welcome: string; tagline: string;
  loginTab: string; signupTab: string;
  loginTitle: string; signupTitle: string;
  fullName: string; email: string; password: string;
  country: string; nativeLanguage: string;
  countryPh: string; languagePh: string;
  loginBtn: string; signupBtn: string;
  google: string; or: string;
  noAccount: string; hasAccount: string;
  forgot: string;
  forgotTitle: string; forgotIntro: string; newPassword: string; forgotBtn: string; forgotDone: string; forgotBack: string;
  demoHint: string;
  errNoAccount: string; errBadPassword: string; errExists: string; errRequired: string;
};

const COPY: Record<Lang, Copy> = {
  fr: {
    back: "Retour à l'accueil", welcome: "Bienvenue au bled",
    tagline: "Rencontrez le vrai Maroc rural, filmé et raconté par ses habitants.",
    loginTab: "Connexion", signupTab: "Inscription",
    loginTitle: "Content de vous revoir", signupTitle: "Créez votre compte",
    fullName: "Nom complet", email: "Adresse e-mail", password: "Mot de passe",
    country: "Pays d'origine", nativeLanguage: "Langue maternelle",
    countryPh: "Choisissez votre pays…", languagePh: "Choisissez votre langue…",
    loginBtn: "Se connecter", signupBtn: "Créer mon compte",
    google: "Continuer avec Google", or: "ou",
    noAccount: "Pas encore de compte ?", hasAccount: "Déjà inscrit ?",
    forgot: "Mot de passe oublié ?",
    forgotTitle: "Réinitialiser votre mot de passe",
    forgotIntro: "Entrez votre e-mail et un nouveau mot de passe pour reprendre l'accès à votre compte.",
    newPassword: "Nouveau mot de passe",
    forgotBtn: "Réinitialiser",
    forgotDone: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    forgotBack: "Retour à la connexion",
    demoHint: "Démo admin : admin@lbledfirst.ma / admin123",
    errNoAccount: "Aucun compte pour cet e-mail.",
    errBadPassword: "Mot de passe incorrect.",
    errExists: "Un compte existe déjà avec cet e-mail.",
    errRequired: "Merci de remplir tous les champs.",
  },
  en: {
    back: "Back to home", welcome: "Welcome to the bled",
    tagline: "Meet the real rural Morocco, filmed and told by its people.",
    loginTab: "Log in", signupTab: "Sign up",
    loginTitle: "Good to see you again", signupTitle: "Create your account",
    fullName: "Full name", email: "Email address", password: "Password",
    country: "Country of origin", nativeLanguage: "Native language",
    countryPh: "Pick your country…", languagePh: "Pick your language…",
    loginBtn: "Log in", signupBtn: "Create my account",
    google: "Continue with Google", or: "or",
    noAccount: "No account yet?", hasAccount: "Already registered?",
    forgot: "Forgot your password?",
    forgotTitle: "Reset your password",
    forgotIntro: "Enter your email and a new password to regain access to your account.",
    newPassword: "New password",
    forgotBtn: "Reset",
    forgotDone: "Password updated. You can log in.",
    forgotBack: "Back to login",
    demoHint: "Admin demo: admin@lbledfirst.ma / admin123",
    errNoAccount: "No account for this email.",
    errBadPassword: "Incorrect password.",
    errExists: "An account already exists with this email.",
    errRequired: "Please fill in all fields.",
  },
  es: {
    back: "Volver al inicio", welcome: "Bienvenido al bled",
    tagline: "Conoce el verdadero Marruecos rural, filmado y contado por su gente.",
    loginTab: "Entrar", signupTab: "Registrarse",
    loginTitle: "Encantado de verte de nuevo", signupTitle: "Crea tu cuenta",
    fullName: "Nombre completo", email: "Correo electrónico", password: "Contraseña",
    country: "País de origen", nativeLanguage: "Lengua materna",
    countryPh: "Elige tu país…", languagePh: "Elige tu idioma…",
    loginBtn: "Entrar", signupBtn: "Crear mi cuenta",
    google: "Continuar con Google", or: "o",
    noAccount: "¿Aún no tienes cuenta?", hasAccount: "¿Ya registrado?",
    forgot: "¿Olvidaste tu contraseña?",
    forgotTitle: "Restablecer tu contraseña",
    forgotIntro: "Introduce tu correo y una nueva contraseña para recuperar tu cuenta.",
    newPassword: "Nueva contraseña",
    forgotBtn: "Restablecer",
    forgotDone: "Contraseña actualizada. Ya puedes entrar.",
    forgotBack: "Volver al inicio de sesión",
    demoHint: "Demo admin: admin@lbledfirst.ma / admin123",
    errNoAccount: "No hay cuenta para este correo.",
    errBadPassword: "Contraseña incorrecta.",
    errExists: "Ya existe una cuenta con este correo.",
    errRequired: "Por favor, completa todos los campos.",
  },
  ar: {
    back: "العودة إلى الرئيسية", welcome: "مرحباً بك في البلاد",
    tagline: "تعرّف على المغرب القروي الحقيقي، مصوَّراً ومحكياً من أهله.",
    loginTab: "تسجيل الدخول", signupTab: "إنشاء حساب",
    loginTitle: "سعداء بعودتك", signupTitle: "أنشئ حسابك",
    fullName: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور",
    country: "بلد المنشأ", nativeLanguage: "اللغة الأم",
    countryPh: "اختر بلدك…", languagePh: "اختر لغتك…",
    loginBtn: "تسجيل الدخول", signupBtn: "إنشاء حسابي",
    google: "المتابعة مع Google", or: "أو",
    noAccount: "ليس لديك حساب بعد؟", hasAccount: "مسجّل بالفعل؟",
    forgot: "هل نسيت كلمة المرور؟",
    forgotTitle: "إعادة تعيين كلمة المرور",
    forgotIntro: "أدخل بريدك الإلكتروني وكلمة مرور جديدة لاستعادة الوصول إلى حسابك.",
    newPassword: "كلمة مرور جديدة",
    forgotBtn: "إعادة التعيين",
    forgotDone: "تم تحديث كلمة المرور. يمكنك تسجيل الدخول.",
    forgotBack: "العودة إلى تسجيل الدخول",
    demoHint: "حساب المشرف التجريبي: admin@lbledfirst.ma / admin123",
    errNoAccount: "لا يوجد حساب لهذا البريد.",
    errBadPassword: "كلمة المرور غير صحيحة.",
    errExists: "يوجد حساب بالفعل بهذا البريد.",
    errRequired: "يرجى ملء جميع الحقول.",
  },
};

function AuthScreen() {
  const { lang } = useI18n();
  const c = COPY[lang];
  const navigate = useNavigate();
  const { login, signup, resetPassword } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotDone, setForgotDone] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "",
    nativeLanguage: "",
    newPassword: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const errText = (code?: string) => {
    switch (code) {
      case "no-account": return c.errNoAccount;
      case "bad-password": return c.errBadPassword;
      case "exists": return c.errExists;
      default: return c.errRequired;
    }
  };

  const goAfterAuth = (role?: string) => {
    const pending = typeof window !== "undefined" ? window.localStorage.getItem("lbf.auth.redirect") : null;
    if (pending?.startsWith("/")) {
      window.localStorage.removeItem("lbf.auth.redirect");
      window.location.assign(pending);
      return;
    }
    if (role === "admin") navigate({ to: "/admin" });
    else navigate({ to: "/" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!form.email || !form.newPassword) return setError(c.errRequired);
      setLoading(true);
      setTimeout(() => {
        const res = resetPassword(form.email, form.newPassword);
        setLoading(false);
        if (!res.ok) return setError(errText(res.error));
        setForgotDone(true);
      }, 500);
      return;
    }

    if (mode === "login") {
      if (!form.email || !form.password) return setError(c.errRequired);
    } else if (!form.fullName || !form.email || !form.password || !form.country || !form.nativeLanguage) {
      return setError(c.errRequired);
    }

    setLoading(true);
    setTimeout(() => {
      const res = mode === "login"
        ? login(form.email, form.password)
        : signup({
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            country: form.country,
            nativeLanguage: form.nativeLanguage,
            role: "tourist",
          });
      setLoading(false);
      if (!res.ok) return setError(errText(res.error));
      goAfterAuth(res.user?.role);
    }, 500);
  };

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name, hint: c.flag }));
  const languageOptions = NATIVE_LANGUAGES.map((l) => ({ value: l.name, label: l.name }));

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroAtlas} alt="Paysage rural marocain dans l'Atlas" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-card">
          <p className="font-hand text-3xl text-saffron">{c.welcome}</p>
          <p className="mt-3 max-w-md font-display text-2xl font-bold leading-snug">{c.tagline}</p>
        </div>
      </div>

      <div className="flex flex-col px-5 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            {c.back}
          </Link>
          <LanguageSelector />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <Logo className="mb-8 self-start" />

          {mode !== "forgot" && (
            <div className="mb-6 inline-flex rounded-full border border-border bg-muted p-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); }}
                  className={`relative rounded-full px-6 py-2 text-sm font-semibold transition ${
                    mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === m && (
                    <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                  )}
                  <span className="relative">{m === "login" ? c.loginTab : c.signupTab}</span>
                </button>
              ))}
            </div>
          )}

          <h1 className="mb-2 font-display text-2xl font-extrabold text-foreground">
            {mode === "login" ? c.loginTitle : mode === "signup" ? c.signupTitle : c.forgotTitle}
          </h1>
          {mode === "forgot" && <p className="mb-6 text-sm text-muted-foreground">{c.forgotIntro}</p>}

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={() => setError("Google sera disponible avec le backend.")}
                className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <GoogleIcon />
                {c.google}
              </button>
              <div className="mb-4 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                <span className="h-px flex-1 bg-border" />{c.or}<span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {mode === "forgot" && forgotDone ? (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 px-5 py-6 text-center">
              <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-emerald-500/20 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">{c.forgotDone}</p>
              <button
                onClick={() => { setMode("login"); setForgotDone(false); setError(null); }}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                {c.forgotBack}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <input className={inputCls} placeholder={c.fullName} value={form.fullName} onChange={set("fullName")} autoComplete="name" />
                  </motion.div>
                )}
              </AnimatePresence>

              <input className={inputCls} type="email" placeholder={c.email} value={form.email} onChange={set("email")} autoComplete="email" />

              {mode !== "forgot" && (
                <div className="relative">
                  <input
                    className={inputCls}
                    type={showPw ? "text" : "password"}
                    placeholder={c.password}
                    value={form.password}
                    onChange={set("password")}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label="toggle password">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}

              {mode === "forgot" && (
                <div className="relative">
                  <input
                    className={inputCls}
                    type={showPw ? "text" : "password"}
                    placeholder={c.newPassword}
                    value={form.newPassword}
                    onChange={set("newPassword")}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground" aria-label="toggle password">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(null); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> {c.forgot}
                  </button>
                </div>
              )}

              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="grid gap-3 overflow-visible sm:grid-cols-2">
                    <Combobox value={form.country} onChange={(v) => setForm((f) => ({ ...f, country: v }))} options={countryOptions} placeholder={c.countryPh} />
                    <Combobox value={form.nativeLanguage} onChange={(v) => setForm((f) => ({ ...f, nativeLanguage: v }))} options={languageOptions} placeholder={c.languagePh} />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>
              )}

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.01] disabled:opacity-70">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? c.loginBtn : mode === "signup" ? c.signupBtn : c.forgotBtn}
              </button>

              {mode === "forgot" && (
                <button type="button" onClick={() => { setMode("login"); setError(null); }} className="block w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground">
                  {c.forgotBack}
                </button>
              )}
            </form>
          )}

          {mode !== "forgot" && (
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? c.noAccount : c.hasAccount}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? c.signupTab : c.loginTab}
              </button>
            </p>
          )}

          <p className="mt-6 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
            {c.demoHint}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
