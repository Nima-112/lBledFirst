import { Field, fieldCls, PanelHeader } from "@/components/dashboard/ui";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import { useState } from "react";
import { Toggle } from "./Toggle";

export function SettingsPanel() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [platform, setPlatform] = useState({
    autoConfirm: false,
    allowSignups: true,
    maintenance: false,
    twoFactor: true,
  });

  // Pas encore d'endpoint backend pour mettre à jour le profil (PUT /api/users/me) :
  // ce formulaire est local uniquement pour l'instant.
  const saveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
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
              />
            </Field>
            <button
              onClick={saveProfile}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-warm transition hover:scale-105"
            >
              {saved ? <Check className="h-4 w-4" /> : null} {saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-base font-bold text-foreground">
            Paramètres généraux
          </h3>
          <div className="space-y-1">
            <Toggle
              label="Confirmation automatique des réservations"
              hint="Confirmer sans validation manuelle"
              value={platform.autoConfirm}
              onChange={(v) => setPlatform({ ...platform, autoConfirm: v })}
            />
            <Toggle
              label="Autoriser les inscriptions"
              hint="Nouveaux comptes touristes / hôtes"
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
        </div>
      </div>
    </section>
  );
}
