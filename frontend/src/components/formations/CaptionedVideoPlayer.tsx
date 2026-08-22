import { useEffect, useRef, useState } from "react";
import { Pause, Play, Maximize, Minimize, Volume2, VolumeX, ExternalLink, AlertTriangle } from "lucide-react";
import type { CaptionsMap } from "@/services/formations.service";
import { sanitizeUrl } from "@/lib/asset-url";

const SUBTITLE_LANGUAGE_LABELS: Record<string, string> = {
  original: "Original",
  ar: "العربية",
  en: "English",
  zh: "中文",
  tr: "Türkçe",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  nl: "Nederlands",
  pt: "Português",
  it: "Italiano",
};

export function CaptionedVideoPlayer({
  src,
  poster,
  captions,
}: {
  src: string;
  poster?: string;
  captions?: CaptionsMap | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [lang, setLang] = useState("original");
  const [error, setError] = useState<string | null>(null);

  const safeSrc = sanitizeUrl(src);
  const safePoster = sanitizeUrl(poster);
  // YouTube / Vimeo "watch?v=" URLs ne peuvent pas être lus en <video>.
  const isYouTubeWatch = safeSrc ? /youtube\.com\/watch\?v=/i.test(safeSrc) : false;
  const isVimeoWatch = safeSrc ? /vimeo\.com\/\d+/i.test(safeSrc) : false;
  const needsExternalLink = isYouTubeWatch || isVimeoWatch;

  useEffect(() => {
    setCaptionsOn(!!captions);
    setLang("original");
  }, [captions]);

  useEffect(() => {
    setError(null);
  }, [safeSrc]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (v.paused) {
        await v.play();
      } else {
        v.pause();
      }
    } catch (err: any) {
      // NotSupportedError / AbortError / NotAllowedError etc.
      const name = (err?.name as string) || "UnknownError";
      if (name === "NotSupportedError") {
        setError(
          "Format vidéo non supporté nativement. Utilisez le lien externe (lecteur dédié).",
        );
      } else if (name === "NotAllowedError") {
        setError("Lecture automatique bloquée — cliquez à nouveau sur Play.");
      } else {
        setError(err?.message || "Impossible de lire la vidéo.");
      }
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const formatTime = (t: number) => {
    if (!Number.isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const availableLanguages = captions
    ? Object.keys(captions)
        .filter((code) => Array.isArray(captions[code]) && captions[code].length > 0)
        .map((code) => ({ code, label: SUBTITLE_LANGUAGE_LABELS[code] ?? code.toUpperCase() }))
    : [];

  const activeCaption = (() => {
    if (!captionsOn || !captions) return null;
    const segments = captions[lang] ?? captions.original;
    if (!Array.isArray(segments)) return null;
    return segments.find((s) => currentTime >= s.start && currentTime <= s.end)?.text ?? null;
  })();

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden bg-ink"
    >
      {!safeSrc || needsExternalLink || error ? (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-ink to-ink/80 p-6 text-center text-card">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <p className="font-display text-lg font-semibold">
            {needsExternalLink
              ? "Lien YouTube/Vimeo détecté"
              : !safeSrc
                ? "Aucun média vidéo"
                : "Erreur de lecture"}
          </p>
          <p className="max-w-lg text-sm text-card/80">
            {needsExternalLink
              ? "Les plateformes YouTube/Vimeo bloquent la lecture dans un <video>. Ouvrez-la dans un onglet dédié :"
              : error
                ? error
                : "Ajoutez une URL vidéo (MP4 / WebM) directement accessible."}
          </p>
          {safeSrc && (
            <a
              href={safeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir la vidéo dans un nouvel onglet
            </a>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          src={safeSrc}
          poster={safePoster ?? undefined}
          preload="metadata"
          playsInline
          className="h-full w-full cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() =>
            setError("Impossible de charger la vidéo — vérifiez l'URL (MP4/WebM direct).")
          }
        />
      )}

      {safeSrc && !needsExternalLink && !error && captionsOn && activeCaption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-6">
          <span className="max-w-2xl rounded-lg bg-ink/80 px-4 py-2 text-center text-sm font-medium leading-snug text-card shadow-lg sm:text-base">
            {activeCaption}
          </span>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent px-3 pb-2 pt-8 sm:px-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={onSeek}
          className="h-1 w-full cursor-pointer accent-primary disabled:opacity-50"
          disabled={!safeSrc || !!needsExternalLink || !!error}
        />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Lecture"}
              disabled={!safeSrc || !!needsExternalLink || !!error}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {playing ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>
            <button
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              disabled={!safeSrc || !!needsExternalLink || !!error}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-xs font-mono text-card/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {captions && !needsExternalLink && !error && (
              <>
                <button
                  onClick={() => setCaptionsOn((v) => !v)}
                  aria-label="Sous-titres"
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-[11px] font-bold transition ${
                    captionsOn
                      ? "bg-primary text-primary-foreground"
                      : "text-card hover:bg-card/10"
                  }`}
                >
                  CC
                </button>
                {captionsOn && availableLanguages.length > 0 && (
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="h-8 rounded-md border border-card/30 bg-ink/70 px-1.5 text-[11px] font-semibold text-card outline-none"
                  >
                    {availableLanguages.map((language) => (
                      <option key={language.code} value={language.code} className="text-ink">
                        {language.label}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            {safeSrc && (
              <a
                href={safeSrc}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir dans un nouvel onglet"
                title="Ouvrir dans un nouvel onglet"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={toggleFullscreen}
              aria-label="Plein écran"
              disabled={!safeSrc || !!needsExternalLink || !!error}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
