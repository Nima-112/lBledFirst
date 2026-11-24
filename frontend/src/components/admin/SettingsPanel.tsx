import { Field, fieldCls, PanelHeader } from "@/components/dashboard/ui";
import { useAuth } from "@/context/AuthContext";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Toggle } from "./Toggle";
import { FrontSettings, getSettings, saveSettings } from "@/services/settings.service";
import { patchUser } from "@/services/users.service";
import { parseApiError } from "@/lib/api-errors";

export function SettingsPanel() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const settingsQuery = useQuery<FrontSettings>({
    queryKey: ["admin-settings"],
    queryFn: getSettings,
  });

  const [platform, setPlatform] = useState<FrontSettings>({
    autoConfirm: false,
    allowSignups: true,
    maintenance: false,
    twoFactor: true,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setPlatform(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    setName(user?.name ?? "");
    setPhone((user as any)?.phone ?? "");
  }, [user]);

  const profileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("No connected user");
      const updated = await patchUser(user.id, { name, phone });
      return updated;
    },
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUser?.({
        id: updated.id,
        name: updated.fullName,
        email: updated.email,
        role: updated.role,
        phone: updated.phone ?? "",
        country: updated.country,
        nativeLanguage: updated.nativeLanguage,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 1800);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async () => {
      return await saveSettings(platform);
    },
    onSuccess: (data) => {
      setPlatform(data);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 1800);
    },
  });

  const getProfileErrorMessage = () => {
    if (!profileMutation.error) return null;
    const parsed = parseApiError(profileMutation.error, "Failed to update profile. Please check your inputs.");
    let msg = parsed.message;
    if (msg.includes("Invalid phone number")) {
      msg = "Invalid phone number. It must be between 8 and 20 digits.";
    }
    return msg;
  };

  return (
    <section>
      <PanelHeader
        title="Paramètres d'administration"
        subtitle="Gérez votre profil et la configuration de la plateforme."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">Mon profil</h3>
          <div className="space-y-4">
            <Field label="Nom complet">
              <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="E-mail">
              <input className={fieldCls} value={user?.email ?? ""} disabled />
            </Field>
            <Field label="Téléphone">
              <input
                className={fieldCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 6 00 00 00 00"
              />
            </Field>
            <button
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
            >
              {profileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : profileSaved ? (
                <Check className="h-4 w-4" />
              ) : null}
              {profileMutation.isPending ? "Enregistrement…" : profileSaved ? "Enregistré" : "Enregistrer"}
            </button>
            {profileMutation.error && (
              <p className="text-xs text-destructive">
                {getProfileErrorMessage()}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">
            Paramètres généraux
          </h3>
          {settingsQuery.isLoading && (
            <p className="mb-3 text-xs text-muted-foreground">Chargement des paramètres…</p>
          )}
          <div className="space-y-1">
            <Toggle
              label="Confirmation automatique des réservations"
              hint="Confirmer sans validation manuelle"
              value={platform.autoConfirm}
              onChange={(v) => setPlatform({ ...platform, autoConfirm: v })}
            />
            <Toggle
              label="Autoriser les inscriptions"
              hint="Nouveaux comptes utilisateurs"
              value={platform.allowSignups}
              onChange={(v) => setPlatform({ ...platform, allowSignups: v })}
            />
            <Toggle
              label="Authentification à deux facteurs"
              hint="Sécurité renforcée des comptes admin"
              value={platform.twoFactor}
              onChange={(v) => setPlatform({ ...platform, twoFactor: v })}
            />
            <Toggle
              label="Mode maintenance"
              hint="Rendre la plateforme inaccessible"
              value={platform.maintenance}
              onChange={(v) => setPlatform({ ...platform, maintenance: v })}
            />
          </div>
          <button
            onClick={() => settingsMutation.mutate()}
            disabled={settingsMutation.isPending || settingsQuery.isLoading}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {settingsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : settingsSaved ? (
              <Check className="h-4 w-4" />
            ) : null}
            {settingsMutation.isPending
              ? "Enregistrement…"
              : settingsSaved
                ? "Paramètres enregistrés"
                : "Enregistrer les paramètres"}
          </button>
          {settingsMutation.error && (
            <p className="mt-3 text-xs text-destructive">
              {(settingsMutation.error as any)?.response?.data?.message ??
                (settingsMutation.error as any)?.message ??
                "Erreur d'enregistrement"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
