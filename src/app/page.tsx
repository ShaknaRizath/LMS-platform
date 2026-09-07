import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Image src="/cims-logo.png" alt="CIMS Campus" width={96} height={96} priority />
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        Learning Management System
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        One place for programs, modules, semester registration, payments, and
        course content.
      </p>
      <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
        Sign in
      </Button>
    </div>
  );
}
