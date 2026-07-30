"use client";

/**
 * Challenge editor: one multiple-choice question with a difficulty and an XP
 * reward. Deliberately smaller than the lesson editor -- a challenge has no
 * body text, no video, no section, because it is not a lesson; it is a single
 * standalone question, and the form only has fields for exactly that.
 */
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Plus, Save, Trash2 } from "lucide-react";
import {
  deleteChallenge,
  readChallenge,
  saveChallenge,
} from "@/content/admin-content";
import { emptyChallengeDoc, type ChallengeDoc } from "@/content/schema";
import {
  AdminBack,
  AdminGuard,
  Field,
  L10nInput,
  SaveState,
  StatusToggle,
  TextInput,
} from "@/components/admin/admin-shell";
import { useLocale, useT } from "@/i18n/use-t";

const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export default function AdminChallengePage() {
  return (
    <AdminGuard>
      <ChallengeEditor />
    </AdminGuard>
  );
}

function ChallengeEditor() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ trackId: string; challengeId: string }>();
  const trackId = params?.trackId ?? "";
  const challengeId = params?.challengeId ?? "";
  const isNew = challengeId === "new";

  const [challenge, setChallenge] = useState<ChallengeDoc | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (isNew) {
      setChallenge(emptyChallengeDoc("", 0));
      return;
    }
    try {
      const c = await readChallenge(trackId, challengeId);
      if (!c) setError(`Challenge "${challengeId}" not found`);
      setChallenge(c);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [trackId, challengeId, isNew]);

  useEffect(() => {
    void load();
  }, [load]);

  function edit(patch: Partial<ChallengeDoc>) {
    setChallenge((prev) => (prev ? { ...prev, ...patch } : prev));
    setState("idle");
  }
  function updateOption(oi: number, text: ChallengeDoc["options"][number]) {
    if (!challenge) return;
    edit({ options: challenge.options.map((o, i) => (i === oi ? text : o)) });
  }
  function addOption() {
    if (!challenge || challenge.options.length >= MAX_OPTIONS) return;
    edit({ options: [...challenge.options, { en: "" }] });
  }
  function removeOption(oi: number) {
    if (!challenge || challenge.options.length <= MIN_OPTIONS) return;
    const options = challenge.options.filter((_, i) => i !== oi);
    edit({ options, correctIndex: challenge.correctIndex >= options.length ? 0 : challenge.correctIndex });
  }

  async function save() {
    if (!challenge) return;
    const id = slug(challenge.id || challenge.title.en);
    if (!id) {
      setError(t("admin.idRequired"));
      return;
    }
    if (!challenge.title.en.trim() || !challenge.prompt.en.trim()) {
      setError(t("admin.titleRequired"));
      return;
    }
    const options = challenge.options.filter((o) => o.en.trim());
    if (options.length < MIN_OPTIONS) {
      setError(t("admin.needTwoOptions"));
      return;
    }

    setState("saving");
    setError(null);
    try {
      await saveChallenge(trackId, {
        ...challenge,
        id,
        options,
        correctIndex: Math.min(challenge.correctIndex, options.length - 1),
      });
      setState("saved");
      if (isNew) router.replace(`/${locale}/admin/track/${trackId}/challenge/${id}`);
    } catch (err) {
      setState("idle");
      setError((err as Error).message);
    }
  }

  async function remove() {
    if (!challenge || isNew) return;
    if (!window.confirm(t("admin.confirmDeleteChallenge"))) return;
    await deleteChallenge(trackId, challenge.id);
    router.push(`/${locale}/admin/track/${trackId}/challenges`);
  }

  if (!challenge) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <AdminBack href={`/admin/track/${trackId}/challenges`} label={t("admin.challenges")} />
        {error && (
          <p className="text-sm" style={{ color: "var(--reward)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-8">
      <AdminBack href={`/admin/track/${trackId}/challenges`} label={t("admin.challenges")} />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-extrabold text-strong">
          {isNew ? t("admin.newChallenge") : t("admin.editChallenge")}
        </h1>
        <StatusToggle status={challenge.status} onChange={(status) => edit({ status })} />
      </header>

      <section className="panel mb-5 space-y-4 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.challengeMeta")}
        </h2>

        <Field label="ID" hint={t("admin.trackIdHint")}>
          <TextInput
            value={challenge.id}
            disabled={!isNew}
            placeholder="ph-c-easy-3"
            onChange={(e) => edit({ id: e.target.value })}
          />
        </Field>

        <L10nInput label={t("admin.trackTitle")} value={challenge.title} onChange={(title) => edit({ title })} />
        <L10nInput
          label={t("admin.prompt")}
          value={challenge.prompt}
          rows={3}
          onChange={(prompt) => edit({ prompt })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("admin.difficulty")}>
            <select
              value={challenge.difficulty}
              onChange={(e) => edit({ difficulty: e.target.value as ChallengeDoc["difficulty"] })}
              className="field w-full rounded-xl px-3 py-2.5 text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("admin.xp")}>
            <TextInput
              type="number"
              min={0}
              value={challenge.xpReward}
              onChange={(e) => edit({ xpReward: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
      </section>

      <section className="panel mb-5 space-y-3 rounded-2xl p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-faint">
          {t("admin.options")}
        </h2>
        <div className="space-y-2">
          {challenge.options.map((opt, oi) => (
            <div key={oi} className="flex items-start gap-2">
              <button
                type="button"
                title={t("admin.correctAnswer")}
                onClick={() => edit({ correctIndex: oi })}
                className="mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition"
                style={{
                  borderColor: challenge.correctIndex === oi ? "var(--cleared)" : "var(--border-strong)",
                  background:
                    challenge.correctIndex === oi
                      ? "color-mix(in srgb, var(--cleared) 18%, transparent)"
                      : "transparent",
                  color: "var(--cleared)",
                }}
              >
                {challenge.correctIndex === oi && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <div className="flex-1">
                <L10nInput
                  label={`${t("admin.option")} ${String.fromCharCode(65 + oi)}`}
                  value={opt}
                  required={false}
                  onChange={(text) => updateOption(oi, text)}
                />
              </div>
              {challenge.options.length > MIN_OPTIONS && (
                <button
                  type="button"
                  onClick={() => removeOption(oi)}
                  className="mt-2 text-faint transition hover:opacity-70"
                  title={t("admin.remove")}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {challenge.options.length < MAX_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-faint"
          >
            <Plus className="h-3 w-3" />
            {t("admin.addOption")}
          </button>
        )}

        <L10nInput
          label={t("admin.explanation")}
          value={challenge.explanation ?? { en: "" }}
          rows={2}
          required={false}
          onChange={(explanation) => edit({ explanation })}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={state === "saving"}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black disabled:opacity-50"
          style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
        >
          <Save className="h-4 w-4" />
          {t("admin.save")}
        </button>
        <SaveState state={state} error={error} />
        {!isNew && (
          <button
            onClick={remove}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold"
            style={{ color: "var(--reward)" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("admin.delete")}
          </button>
        )}
      </div>
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
