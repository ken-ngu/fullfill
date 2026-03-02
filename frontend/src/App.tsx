import { useState, useEffect } from "react";
import { Landing } from "./pages/Landing";
import { About } from "./pages/About";
import { DataSources } from "./pages/DataSources";
import { Auth } from "./pages/Auth";
import { Search } from "./pages/Search";
import { DiagnosisDetail } from "./pages/DiagnosisDetail";
import Admin340B from "./pages/Admin340B";
import { OrderReview340B } from "./pages/OrderReview340B";
import type { PatientContext } from "./types";

type Page = "home" | "about" | "data-sources" | "login" | "search" | "diagnosis" | "admin340b" | "order-review";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentDiagnosisId, setCurrentDiagnosisId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string>(() => {
    return localStorage.getItem("fullfill_specialty") || "dermatology";
  });
  const [setting, setSetting] = useState<string>(() => {
    return localStorage.getItem("fullfill_setting") || "outpatient";
  });
  const [patientContext] = useState<PatientContext>({
    insurance_type: "commercial",
    age: null,
    deductible_met: false,
    plan_type: "PPO",
    state: null,
  });

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("fullfill_visited");
    if (hasVisited === "true") {
      setCurrentPage("search");
    }
  }, []);

  function handleNavigate(page: string, data?: any) {
    setCurrentPage(page as Page);

    // Handle diagnosis navigation with data
    if (page === "diagnosis" && data?.diagnosisId) {
      setCurrentDiagnosisId(data.diagnosisId);
    } else if (page === "search") {
      setCurrentDiagnosisId(null);
    }

    // Handle order review navigation with data
    if (page === "order-review" && data?.orderId) {
      setCurrentOrderId(data.orderId);
    } else if (page === "admin340b") {
      setCurrentOrderId(null);
    }

    // Instant scroll to top to prevent white screen on mobile
    window.scrollTo(0, 0);
  }

  function handleContinue() {
    localStorage.setItem("fullfill_visited", "true");
    setCurrentPage("search");
  }

  function handleAuth(_email: string) {
    handleNavigate("search");
  }

  function handleSpecialtyChange(newSpecialty: string, newSetting: string) {
    setSpecialty(newSpecialty);
    setSetting(newSetting);
    localStorage.setItem("fullfill_specialty", newSpecialty);
    localStorage.setItem("fullfill_setting", newSetting);
  }

  if (currentPage === "home") {
    return <Landing onContinue={handleContinue} onNavigate={handleNavigate} />;
  }

  if (currentPage === "about") {
    return <About onNavigate={handleNavigate} />;
  }

  if (currentPage === "data-sources") {
    return <DataSources onNavigate={handleNavigate} />;
  }

  if (currentPage === "login") {
    return <Auth onNavigate={handleNavigate} onAuth={handleAuth} />;
  }

  if (currentPage === "diagnosis" && currentDiagnosisId) {
    return (
      <DiagnosisDetail
        diagnosisId={currentDiagnosisId}
        patientContext={patientContext}
        onNavigateToMedication={() => handleNavigate("search")}
      />
    );
  }

  if (currentPage === "admin340b") {
    return <Admin340B onNavigate={handleNavigate} />;
  }

  if (currentPage === "order-review" && currentOrderId) {
    return <OrderReview340B orderId={currentOrderId} onNavigate={handleNavigate} />;
  }

  return (
    <Search
      specialty={specialty}
      setting={setting}
      onSpecialtyChange={handleSpecialtyChange}
      onNavigate={handleNavigate}
    />
  );
}
