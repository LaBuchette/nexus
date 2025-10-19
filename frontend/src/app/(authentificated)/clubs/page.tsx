"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Club {
  id: string;
  name: string;
  description: string;
  game: string;
  logo: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  owner: {
    id: string;
    username: string;
    avatar: string;
  };
}

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);

    // Récupérer la liste des clubs
    const hostname = window.location.hostname;
    fetch(`http://${hostname}:3000/clubs`)
      .then((res) => res.json())
      .then((data) => {
        setClubs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link
              href="/"
              className="text-4xl font-bold text-white mb-2 hover:text-indigo-300 transition-colors"
            >
              🎮 NEXUS
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">
              Clubs de Gaming
            </h1>
            <p className="text-gray-300 mt-2">
              Rejoins une communauté de joueurs passionnés !
            </p>
          </div>

          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold"
                >
                  👤 Mon Profil
                </Link>
                <Link
                  href="/clubs/new"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                >
                  ➕ Créer un Club
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold"
              >
                🔐 Se Connecter
              </Link>
            )}
          </div>
        </div>

        {/* Liste des clubs */}
        {clubs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Aucun club pour le moment
            </h2>
            <p className="text-gray-300 mb-8">
              Sois le premier à créer un club et rassemble des joueurs !
            </p>
            {isAuthenticated && (
              <Link
                href="/clubs/new"
                className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
              >
                ➕ Créer le Premier Club
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 hover:bg-white/15 transition-all cursor-pointer shadow-xl"
                onClick={() => router.push(`/clubs/${club.id}`)}
              >
                {/* Logo du club */}
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-3xl">
                    {club.logo ? (
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      "🎮"
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-bold text-white truncate">
                      {club.name}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {club.game || "Multi-jeux"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {club.description || "Aucune description"}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-300">
                    <span className="mr-2">👥</span>
                    <span>
                      {club.memberCount}/{club.maxMembers} membres
                    </span>
                  </div>
                  <div className="flex items-center">
                    {club.isPublic ? (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">
                        🌍 Public
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full">
                        🔒 Privé
                      </span>
                    )}
                  </div>
                </div>

                {/* Owner */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm">
                    {club.owner.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${club.owner.id}/${club.owner.avatar}.png`}
                        alt={club.owner.username}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      "👤"
                    )}
                  </div>
                  <span className="ml-2 text-sm text-gray-300">
                    Par{" "}
                    <span className="text-white font-semibold">
                      {club.owner.username}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
