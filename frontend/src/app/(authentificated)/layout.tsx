"use client";

import { useState, useEffect } from "react";
import Header from "../../components/Header";
import OnboardingModal from "../../components/OnboardingModal";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur a terminé l'onboarding
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      // Si hasCompletedOnboarding n'existe pas ou est false, afficher le modal
      if (!user.hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    }
    setLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return null; // Ne rien afficher pendant le chargement
  }

  return (
    <>
      <Header />
      {children}
      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}
