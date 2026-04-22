"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const { usuario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (usuario) {
      if (usuario.rol === "admin") {
        router.replace("/admin/comisiones");
      } else {
        router.replace("/profesor/comisiones");
      }
    } else {
      router.replace("/login");
    }
  }, [usuario, router]);

  return null;
}
