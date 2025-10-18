"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    game: "",
    maxMembers: 10,
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Vous devez être connecté pour créer un club");
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:3000/clubs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du club");
      }

      const club = await response.json();

      // Rediriger vers la page du club créé
      router.push(`/clubs/${club.id}`);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/clubs"
            className="text-indigo-300 hover:text-indigo-200 mb-4 inline-block"
          >
            ← Retour aux clubs
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            Créer un Nouveau Club
          </h1>
          <p className="text-gray-300">
            Rassemble des joueurs autour de ta passion ! 🎮
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du club */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Nom du Club *
              </label>
              <input
                type="text"
                required
                maxLength={50}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Valorant Compétitif FR"
              />
              <p className="text-sm text-gray-400 mt-1">
                {formData.name.length}/50 caractères
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Description
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Décris ton club, son ambiance, ses objectifs..."
              />
              <p className="text-sm text-gray-400 mt-1">
                {formData.description.length}/500 caractères
              </p>
            </div>

            {/* Jeu */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Jeu Principal
              </label>
              <input
                type="text"
                value={formData.game}
                onChange={(e) =>
                  setFormData({ ...formData, game: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Valorant, League of Legends, Minecraft..."
              />
            </div>

            {/* Nombre max de membres */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Nombre Maximum de Membres
              </label>
              <input
                type="number"
                min={2}
                max={1000}
                value={formData.maxMembers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxMembers: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Entre 2 et 1000 membres
              </p>
            </div>

            {/* Visibilité */}
            <div>
              <label className="block text-white font-semibold mb-4">
                Visibilité du Club
              </label>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isPublic}
                    onChange={() =>
                      setFormData({ ...formData, isPublic: true })
                    }
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-semibold">🌍 Public</div>
                    <div className="text-sm text-gray-300">
                      Tout le monde peut voir et rejoindre le club
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isPublic}
                    onChange={() =>
                      setFormData({ ...formData, isPublic: false })
                    }
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <div className="text-white font-semibold">🔒 Privé</div>
                    <div className="text-sm text-gray-300">
                      Seuls les membres invités peuvent rejoindre
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/clubs")}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Création..." : "✨ Créer le Club"}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-indigo-900/30 backdrop-blur-lg rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">💡 Conseils</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>✅ Choisissez un nom clair et accrocheur</li>
            <li>✅ Décrivez précisément le niveau ou le style de jeu</li>
            <li>✅ Indiquez vos horaires de jeu ou votre région</li>
            <li>
              ✅ Commencez avec un petit nombre de membres et augmentez
              progressivement
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
