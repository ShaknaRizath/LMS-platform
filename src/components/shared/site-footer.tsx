function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 3H21l-6.55 7.49L22.2 21h-6.15l-4.82-6.3L5.7 21H3.6l7-8.01L2.6 3h6.3l4.35 5.75L18.9 3Zm-1.08 16.2h1.17L7.24 4.72H6L17.82 19.2Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 9.5V7.2c0-.7.5-1.2 1.2-1.2H17V3h-2.5C12 3 10.5 4.6 10.5 7v2.5H8V13h2.5v8h3.5v-8H16.5l.5-3.5h-3Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0b1220] px-8 py-10 text-white sm:px-14 sm:py-14">
      <div className="mx-auto max-w-5xl border-b border-dashed border-white/15 pb-10">
        <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Let&apos;s Build
            <br />
            A Future
            <br />
            Together
          </h2>
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-white/70">
              CIMS Campus is dedicated to providing quality education, practical learning
              opportunities, and a supportive academic environment. Our goal is to help students
              develop valuable knowledge, professional skills, and confidence so they can achieve
              their career ambitions and build a successful future.
            </p>
            <a
              href="mailto:xyzfreebook@gmail.com"
              className="rounded-full bg-[#F2B84B] px-6 py-2 text-sm font-semibold text-[#0b1220] transition-opacity hover:opacity-90"
            >
              Contact Now
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 pt-10 sm:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-[#F2B84B]">CIMS</p>
          <div className="mt-3 flex gap-2">
            <a
              href="#"
              aria-label="Instagram"
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <TwitterIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex size-8 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white/50 hover:text-white"
            >
              <FacebookIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Address</p>
          <p className="mt-3 text-sm text-white/60">1169/2 C Lake Cres, Sri Jayawardenepura Kotte 10107</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Call Us</p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-white/60">
            <a href="tel:0773590505" className="underline underline-offset-2 hover:text-white">
              077 359 0505
            </a>
            <a href="tel:+012357896857" className="hover:text-white">
              +0123 57896857
            </a>
            <a href="mailto:xyzfreebook@gmail.com" className="hover:text-white">
              xyzfreebook@gmail.com
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">Our Policies</p>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-white/60">
            <a href="#" className="hover:text-white">
              Privacy Policies
            </a>
            <a href="#" className="hover:text-white">
              Terms of use
            </a>
            <a href="#" className="hover:text-white">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
