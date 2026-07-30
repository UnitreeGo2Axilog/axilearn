"use client";

/**
 * The challenge list for one track: order controls (same up/down pattern as
 * lessons), a difficulty chip per row, and a link into each editor.
 *
 * Challenges live in their own subcollection rather than an array on the
 * track document, unlike lessons -- there is no map layout depending on their
 * order, so a doc-per-challenge is simpler and keeps this list's reads and
 * writes independent of the track document's 1 MiB budget.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2, Zap } from "lucide-react";
import {
  deleteChallenge,
  listChallenges,
  moveChallenge,
  readTrackDoc,
} from "@/content/admin-content";
import type { ChallengeDoc, TrackDoc } from "@/content/schema";
import { AdminBack, AdminGuard, StatusChip } from "@/components/admin/admin-shell";
import { Tooltip } from "@/components/tooltip";
import { useLocale, useT } from "@/i18n/use-t";

const DIFF_COLOR: Record<ChallengeDoc["difficulty"], string> = {
  easy: "var(--cleared)",
  medium: "var(--reward)",
  hard: "var(--advanced)",
};
const DIFF_LABEL_KEY = {
  easy: "admin.difficultyEasy",
  medium: "admin.difficultyMedium",
  hard: "admin.difficultyHard",
} as const;

export default function AdminChallengesPage() {
  return (
    <AdminGuard>
      <ChallengesList />
    </AdminGuard>
  );
}

function ChallengesList() {
  const t = useT();
  const locale = useLocale();
  const params = useParams<{ trackId: string }>();
  const trackId = params?.trackId ?? "";

  const [track, setTrack] = useState<TrackDoc | null>(null);
  const [challenges, setChallenges] = useState<ChallengeDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [tr, list] = await Promise.all([readTrackDoc(trackId), listChallenges(trackId)]);
      setTrack(tr);
      setChallenges(list);
      if (!tr) setError(`Track "${trackId}" not found`);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [trackId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function move(id: string, direction: -1 | 1) {
    await moveChallenge(trackId, id, direction);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm(t("admin.confirmDeleteChallenge"))) return;
    await deleteChallenge(trackId, id);
    await load();
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-8">
      <AdminBack href={`/admin/track/${trackId}`} label={t("admin.backToTrack")} />

      <header className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-2xl font-extrabold text-strong">
          {t("admin.challenges")} {track ? `— ${track.title?.en ?? track.id}` : ""}
        </h1>
        <Link
          href={`/${locale}/admin/track/${trackId}/challenge/new`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black"
          style={{ background: "var(--reward)", color: "var(--surface-solid)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("admin.newChallenge")}
        </Link>
      </header>

      {error && (
        <p className="mb-4 text-sm" style={{ color: "var(--reward)" }}>
          {error}
        </p>
      )}

      {challenges.length === 0 ? (
        <p className="panel rounded-xl p-4 text-sm text-muted">{t("admin.noChallenges")}</p>
      ) : (
        <ol className="space-y-2">
          {challenges.map((c, i) => (
            <li
              key={c.id}
              className="panel flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl p-3"
            >
              <span className="font-robot text-[11px] font-bold text-faint">{i + 1}</span>
              <span
                className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${DIFF_COLOR[c.difficulty]} 16%, transparent)`,
                  color: DIFF_COLOR[c.difficulty],
                }}
              >
                {t(DIFF_LABEL_KEY[c.difficulty])}
              </span>
              <Link
                href={`/${locale}/admin/track/${trackId}/challenge/${c.id}`}
                className="min-w-[140px] flex-1 text-sm font-bold text-main hover:opacity-80"
              >
                {c.title?.en || c.id}
              </Link>
              <StatusChip status={c.status} />
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-faint">
                <Zap className="h-3 w-3" />
                {c.xpReward} XP
              </span>
              <span className="flex items-center gap-1">
                <IconButton
                  label={t("admin.moveUp")}
                  disabled={i === 0}
                  onClick={() => void move(c.id, -1)}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton
                  label={t("admin.moveDown")}
                  disabled={i === challenges.length - 1}
                  onClick={() => void move(c.id, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </IconButton>
                <IconButton label={t("admin.delete")} onClick={() => void remove(c.id)} danger>
                  <Trash2 className="h-3.5 w-3.5" />
                </IconButton>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-7 w-7 place-items-center rounded-lg border transition disabled:opacity-30"
      style={{ borderColor: "var(--border)", color: danger ? "var(--reward)" : "var(--text-muted)" }}
    >
      {children}
    </button>
  );
  return disabled ? button : <Tooltip label={label}>{button}</Tooltip>;
}
