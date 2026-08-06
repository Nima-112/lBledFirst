import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { MeShell } from "@/components/me/MeShell";
import { Combobox } from "@/components/ui/combobox";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { useAuth as useMockAuth } from "@/lib/mock-auth";
import { patchUser, uploadAvatar, changePassword as changePasswordApi } from "@/services/users.service";
import { resolveUploadUrl } from "@/lib/asset-url";
import { COUNTRIES } from "@/lib/countries";
import { NATIVE_LANGUAGES } from "@/lib/languages";

export const Route = createFileRoute("/me/profile")({
  head: () => ({ meta: [{ title: "Mon profil — L'Bled First" }] }),
  component: MyProfile,
});

function MyProfile() {
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const { updateProfile } = useMockAuth();
  const [form, setForm] = useState({ name: "", phone: "", country: "", language: "" });
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      phone: user.phone ?? "",
      country: user.country ?? "",
      language: user.language ?? "",
    });
    setAvatar(user.avatar ? resolveUploadUrl(user.avatar) : undefined);
  }, [user]);

  const inputCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const pickPhoto = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No connected user");
      // Upload avatar file first if a new one was picked
      let avatarUrl = avatar;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }
      const updated = await patchUser(user.id, { 
        name: form.name, 
        phone: form.phone, 
        country: form.country, 
        language: form.language, 
        avatar: avatarUrl 
      });
      return updated;
    },
    onSuccess: (updated) => {
      setUser({
        id: updated.id,
        name: updated.fullName,
        email: updated.email,
        role: updated.role,
        phone: updated.phone ?? "",
        country: updated.country,
        language: updated.nativeLanguage,
        avatar: updated.avatar,
      });
      // Sync mock-auth localStorage so Navbar reflects changes
      updateProfile({
        fullName: updated.fullName,
        phone: updated.phone ?? "",
        country: updated.country,
        nativeLanguage: updated.nativeLanguage,
        avatar: resolveUploadUrl(updated.avatar),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    },
  });

  const save = () => {
    profileMutation.mutate();
  };

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No connected user");
      await changePasswordApi(password);
    },
    onSuccess: () => {
      setPassword("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 1800);
    },
  });

  const changePassword = () => {
    if (!password.trim() || password.length < 6) return;
    changePasswordMutation.mutate();
  };

  const countryOptions = COUNTRIES.map((c) => ({ value: c.name, label: c.name, hint: c.flag }));
  const languageOptions = NATIVE_LANGUAGES.map((l) => ({ value: l.name, label: l.name }));

  return (
    <MeShell title={t("me.profile.title")}>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Avatar */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-muted">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-4xl font-bold text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={pickPhoto}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
            {t("me.profile.changePhoto")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <p className="mt-4 truncate text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-base font-bold text-foreground">{t("me.profile.personal")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.fullName")}</label>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.phone")}</label>
                <input className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.country")}</label>
                <Combobox value={form.country} onChange={(v) => setForm({ ...form, country: v })} options={countryOptions} placeholder={t("me.profile.country")} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t("me.profile.language")}</label>
                <Combobox value={form.language} onChange={(v) => setForm({ ...form, language: v })} options={languageOptions} placeholder={t("me.profile.language")} />
              </div>
            </div>
            <button
              onClick={save}
              disabled={profileMutation.isPending}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02] disabled:opacity-60"
            >
              {profileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {saved ? <><Check className="h-4 w-4" /> {t("me.profile.saved")}</> : t("me.profile.save")}
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-4 font-display text-base font-bold text-foreground">{t("me.profile.password")}</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("me.profile.newPassword")}
                className={inputCls}
              />
              <button
                onClick={changePassword}
                disabled={!password.trim() || password.length < 6 || changePasswordMutation.isPending}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-[1.02] disabled:opacity-60"
              >
                {changePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {pwSaved ? <><Check className="h-4 w-4" /> {t("me.profile.saved")}</> : t("me.profile.updatePassword")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MeShell>
  );
}
