import Image from "next/image";
import { RoleSelector } from "@/components/role/RoleSelector";
import { getServerRole } from "@/lib/role-server";

export default async function HomePage() {
  const savedRole = await getServerRole();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-brand-teal/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 right-1/4 size-44 rounded-full bg-brand-pink/15 blur-2xl"
      />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/Logo_cemal_cemul.png"
            alt="Logo Cemal Cemul"
            width={112}
            height={112}
            priority
            className="size-24 rounded-full object-contain shadow-sm sm:size-28"
          />
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Cemal Cemul
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Pilih tampilan kerja di perangkat ini untuk mulai.
          </p>
        </div>

        <RoleSelector savedRole={savedRole} />
      </div>
    </main>
  );
}
