"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const hostname = window.location.hostname;

      // Appeler l'API pour marquer l'onboarding comme terminé
      const response = await fetch(
        `http://${hostname}:3000/users/complete-onboarding`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        // Mettre à jour l'utilisateur dans localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Fermer le modal
        onComplete();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border border-white/20">
        {/* Indicateur de progression */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all ${
                step === currentStep
                  ? "w-12 bg-indigo-500"
                  : step < currentStep
                  ? "w-8 bg-indigo-700"
                  : "w-8 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Contenu selon l'étape */}
        {currentStep === 1 && (
          <div className="text-center">
            <div className="text-7xl mb-6">🎮</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Bienvenue sur Nexus !
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Nexus est ta plateforme ultime pour trouver des coéquipiers,
              rejoindre des clubs gaming, et construire ton réseau de joueurs.
              <br />
              <br />
              Prêt à commencer l'aventure ? 🚀
            </p>
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-bold text-lg shadow-lg"
            >
              Suivant →
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center">
            <div className="text-7xl mb-6">👥</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Trouve tes coéquipiers
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Ajoute des amis pour construire ton équipe de rêve !
              <br />
              <br />
              Va dans la section <strong>Amis</strong> pour envoyer des demandes
              et commencer à jouer ensemble.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
              >
                ← Retour
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-bold text-lg shadow-lg"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center">
            <div className="text-7xl mb-6">🎮</div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Rejoins un club
            </h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Les clubs sont des communautés de joueurs passionnés !
              <br />
              <br />
              Explore la section <strong>Clubs</strong> pour trouver ta team
              idéale et participer à des événements exclusifs.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
              >
                ← Retour
              </button>
              <button
                onClick={handleComplete}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-bold text-lg shadow-lg"
              >
                ✓ C'est parti !
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
