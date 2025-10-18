"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    // Récupérer le token et user depuis l'URL (envoyés par le backend)
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (!token || !userParam) {
      setStatus("error");
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    try {
      // Décoder et stocker les données
      const userData = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setStatus("success");

      // Rediriger vers le profil
      setTimeout(() => router.push("/profile"), 2000);
    } catch (error) {
      console.error("Erreur:", error);
      setStatus("error");
      setTimeout(() => router.push("/"), 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center space-y-6 p-8">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
            <h1 className="text-2xl font-bold text-white">
              Connexion en cours...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-400 text-6xl">✓</div>
            <h1 className="text-2xl font-bold text-white">
              Connexion réussie !
            </h1>
            <p className="text-gray-300">Redirection vers votre profil...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-400 text-6xl">✗</div>
            <h1 className="text-2xl font-bold text-white">
              Erreur de connexion
            </h1>
            <p className="text-gray-300">Retour à l&apos;accueil...</p>
          </>
        )}
      </div>
    </div>
  );
}
