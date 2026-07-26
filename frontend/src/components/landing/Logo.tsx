import logoMark from "@/assets/logo-mark.png";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <img
        src={logoMark}
        alt="L'Bled First fingerprint logo"
        className="h-10 w-auto"
        width={64}
        height={100}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight">
            L'Bled<span className="text-primary"> First</span>
          </span>
        </span>
      )}
    </span>
  );
}
