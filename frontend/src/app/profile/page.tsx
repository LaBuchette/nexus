"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  discriminator: string;
  email: string;
  avatar: string;
  discordId: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les infos utilisateur depuis localStorage
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      // Pas connecté, rediriger vers l'accueil
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    // Supprimer les données de localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Rediriger vers l'accueil
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 NEXUS</h1>
          <p className="text-gray-300">Ton Profil</p>
        </div>

        {/* Carte de profil */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {/* Avatar et infos principales */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={avatarUrl}
                alt={`Avatar de ${user.username}`}
                className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white/10"></div>
            </div>

            {/* Infos utilisateur */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {user.username}
                {user.discriminator !== "0" && (
                  <span className="text-gray-400">#{user.discriminator}</span>
                )}
              </h2>
              <p className="text-gray-300 mb-4">{user.email}</p>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full">
                  🎮 Joueur
                </span>
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                  ⚡ Membre depuis aujourd&apos;hui
                </span>
              </div>
            </div>

            {/* Bouton déconnexion */}
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              🚪 Déconnexion
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">Clubs</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">Équipes</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">0</div>
              <div className="text-gray-300">Parties</div>
            </div>
          </div>

          {/* Infos techniques (Debug) */}
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              🔧 Informations Techniques
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">ID Nexus:</span>
                <span className="text-white font-mono">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Discord ID:</span>
                <span className="text-white font-mono">{user.discordId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section "Prochainement" */}
        <div className="mt-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            🚀 Prochainement sur Nexus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <div className="text-4xl mb-2">👥</div>
              <h4 className="text-lg font-bold text-white mb-2">Clubs</h4>
              <p className="text-gray-300 text-sm">
                Crée et rejoins des clubs de gaming
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <div className="text-4xl mb-2">💬</div>
              <h4 className="text-lg font-bold text-white mb-2">Chat</h4>
              <p className="text-gray-300 text-sm">
                Discute en temps réel avec ta team
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="text-lg font-bold text-white mb-2">Matchmaking</h4>
              <p className="text-gray-300 text-sm">
                Trouve des coéquipiers pour tes parties
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
