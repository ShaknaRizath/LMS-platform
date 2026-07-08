import { Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { signInWithGoogle } from "@/lib/actions/auth/google-signin.action";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.46H12v4.66h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.83Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.6 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function OAuthButtons() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="grid grid-cols-2 gap-3">
      {googleEnabled ? (
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full rounded-full">
            <GoogleIcon />
            Google
          </Button>
        </form>
      ) : (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" className="w-full rounded-full" disabled>
                <GoogleIcon />
                Google
              </Button>
            }
          />
          <TooltipContent>Coming soon</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="outline" className="w-full rounded-full" disabled>
              <Apple className="size-4" />
              Apple
            </Button>
          }
        />
        <TooltipContent>Coming soon</TooltipContent>
      </Tooltip>
    </div>
  );
}
