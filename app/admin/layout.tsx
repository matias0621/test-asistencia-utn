"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (usuario === null) {
      router.replace("/login");
    } else if (usuario.rol !== "admin") {
      router.replace("/profesor/comisiones");
    }
  }, [usuario, router]);

  if (!usuario || usuario.rol !== "admin") return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
