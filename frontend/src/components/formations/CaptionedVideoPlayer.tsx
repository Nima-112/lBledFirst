import { useEffect, useRef, useState } from "react";
import { Pause, Play, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import type { CaptionsMap } from "@/services/formations.service";

const SUBTITLE_LANGUAGES: { code: string; label: string }[] = [
  { code: "original", label: "Original" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "tr", label: "Türkçe" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "nl", label: "Nederlands" },
  { code: "pt", label: "Português" },
];

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

  useEffect(() => {
    setCaptionsOn(!!captions);
    setLang("original");
  }, [captions]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
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

  const activeCaption = (() => {
    if (!captionsOn || !captions) return null;
    const segments = captions[lang] ?? captions.original;
    if (!Array.isArray(segments)) return null;
    return segments.find((s) => currentTime >= s.start && currentTime <= s.end)?.text ?? null;
  })();

  return (
    <div ref={containerRef} className="group relative aspect-video w-full overflow-hidden bg-ink">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {captionsOn && activeCaption && (
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
          className="h-1 w-full cursor-pointer accent-primary"
        />
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause" : "Lecture"}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10"
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-xs font-mono text-card/90">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {captions && (
              <>
                <button
                  onClick={() => setCaptionsOn((v) => !v)}
                  aria-label="Sous-titres"
                  className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-[11px] font-bold transition ${
                    captionsOn ? "bg-primary text-primary-foreground" : "text-card hover:bg-card/10"
                  }`}
                >
                  CC
                </button>
                {captionsOn && (
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="h-8 rounded-md border border-card/30 bg-ink/70 px-1.5 text-[11px] font-semibold text-card outline-none"
                  >
                    {SUBTITLE_LANGUAGES.filter((l) => captions[l.code]).map((l) => (
                      <option key={l.code} value={l.code} className="text-ink">
                        {l.label}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            <button
              onClick={toggleFullscreen}
              aria-label="Plein écran"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-card transition hover:bg-card/10"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
