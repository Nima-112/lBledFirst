import { CalendarCheck, GraduationCap, Plus, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Field, fieldCls, Modal, PanelHeader } from "@/components/dashboard/ui";
import {
  FrontFormationEnrollment,
  createEnrollment,
  getFormationEnrollments,
} from "@/services/formation-enrollments.service";
import { getUsersList } from "@/services/users.service";
import { getFormationsList } from "@/services/formations.service";
import type { Formation } from "@/lib/formations";

export function FormationEnrollmentsPanel() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<{ userId: string; formationId: string }>({
    userId: "",
    formationId: "",
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["admin-formation-enrollments"],
    queryFn: getFormationEnrollments,
  });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: getUsersList });
  const formationsQuery = useQuery<Formation[]>({
    queryKey: ["admin-formations"],
    queryFn: getFormationsList,
  });

  const enrollments = enrollmentsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const formations = formationsQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((e: FrontFormationEnrollment) =>
      [e.userName, e.userEmail, e.formationTitle, e.instructorName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [enrollments, query]);

  const totalFormationsEnrolled = new Set(enrollments.map((e) => e.formationId)).size;
  const totalUsersEnrolled = new Set(enrollments.map((e) => e.userId)).size;

  const createMutation = useMutation({
    mutationFn: (p: { userId: number; formationId: number }) => createEnrollment(p),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-formation-enrollments"] });
    },
  });

  const save = async () => {
    if (!draft.userId || !draft.formationId) return;
    await createMutation.mutateAsync({
      userId: Number(draft.userId),
      formationId: Number(draft.formationId),
    });
    setAdding(false);
    setDraft({ userId: "", formationId: "" });
  };

  const startAdd = () => {
    setDraft({ userId: users[0]?.id ?? "", formationId: String(formations[0]?.id ?? "") });
    setAdding(true);
  };

  return (
    <section>
      <PanelHeader
        title="Inscriptions aux formations"
        subtitle="Historique complet des utilisateurs ayant acheté une formation."
        query={query}
        setQuery={setQuery}
        onAdd={startAdd}
        addLabel="Ajouter une inscription"
      />

      <Modal
        open={adding}
        title="Ajouter une inscription"
        size="xl"
        onClose={() => setAdding(false)}
        onSave={draft.userId && draft.formationId && !createMutation.isPending ? save : undefined}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Utilisateur">
            <select
              className={fieldCls}
              value={draft.userId}
              onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email}) · {u.role}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Formation">
            <select
              className={fieldCls}
              value={draft.formationId}
              onChange={(e) => setDraft({ ...draft, formationId: e.target.value })}
            >
              <option value="">Sélectionner…</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} · {f.price ?? 0} MAD
                </option>
              ))}
            </select>
          </Field>
        </div>
        {createMutation.error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {(createMutation.error as any)?.response?.data?.message ??
              (createMutation.error as any)?.message ??
              "Erreur lors de l'inscription"}
          </p>
        )}
        {createMutation.isPending && (
          <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
            Inscription en cours…
          </p>
        )}
      </Modal>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Inscriptions totales
              </p>
              <p className="text-xl font-extrabold text-foreground">{enrollments.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Apprenants uniques
              </p>
              <p className="text-xl font-extrabold text-foreground">{totalUsersEnrolled}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-100 text-saffron-700 dark:bg-saffron-950/50 dark:text-saffron-300">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Formations vendues
              </p>
              <p className="text-xl font-extrabold text-foreground">{totalFormationsEnrolled}</p>
            </div>
          </div>
        </div>
      </div>

      {enrollmentsQuery.isLoading && (
        <p className="mb-4 text-sm text-muted-foreground">Chargement…</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Utilisateur</th>
              <th className="px-4 py-3 font-semibold">Formation</th>
              <th className="px-4 py-3 font-semibold">Formateur</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Date d'achat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && !enrollmentsQuery.isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Aucune inscription pour le moment.
                </td>
              </tr>
            )}
            {filtered.map((e) => (
              <tr key={e.id} className="align-middle">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{e.userName}</p>
                  {e.userEmail && (
                    <p className="text-xs text-muted-foreground">{e.userEmail}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{e.formationTitle}</p>
                  {e.formationSlug && (
                    <p className="text-xs text-muted-foreground">#{e.formationSlug}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {e.instructorName ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">
                  {e.formationPrice} MAD
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <CalendarCheck className="h-3.5 w-3.5" />{" "}
                    {e.purchasedAt.slice(0, 10)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
