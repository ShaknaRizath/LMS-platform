export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-secondary lg:block">
        <AuthDecorativePattern />
      </div>
    </div>
  );
}

function AuthDecorativePattern() {
  return (
    <svg
      viewBox="0 0 600 800"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="600" height="800" fill="var(--secondary)" />
      <g opacity="0.9">
        <path
          d="M120 60 C260 40 340 160 300 300 C266 420 140 460 90 380 C30 280 -20 90 120 60 Z"
          fill="var(--foreground)"
          opacity="0.06"
        />
        <path
          d="M420 120 C560 140 580 320 470 400 C370 470 260 400 280 300 C300 200 320 105 420 120 Z"
          fill="var(--foreground)"
          opacity="0.1"
        />
        <path
          d="M180 420 C340 400 460 520 400 640 C350 740 190 760 130 660 C70 560 60 440 180 420 Z"
          fill="var(--foreground)"
          opacity="0.14"
        />
        <path
          d="M380 520 C500 540 540 660 460 720 C390 770 300 730 310 650 C320 580 300 505 380 520 Z"
          fill="var(--foreground)"
          opacity="0.08"
        />
        <circle cx="500" cy="700" r="4" fill="var(--foreground)" opacity="0.3" />
        <circle cx="80" cy="200" r="3" fill="var(--foreground)" opacity="0.3" />
        <circle cx="250" cy="700" r="3" fill="var(--foreground)" opacity="0.25" />
      </g>
    </svg>
  );
}
