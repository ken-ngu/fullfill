import { useState, useEffect } from "react";
import { Landing } from "./pages/Landing";
import { About } from "./pages/About";
import { Auth } from "./pages/Auth";
import { Search } from "./pages/Search";

type Page = "home" | "about" | "login" | "search";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [specialty, setSpecialty] = useState<string>(() => {
    return localStorage.getItem("fullfill_specialty") || "dermatology";
  });
  const [setting, setSetting] = useState<string>(() => {
    return localStorage.getItem("fullfill_setting") || "outpatient";
  });

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("fullfill_visited");
    if (hasVisited === "true") {
      setCurrentPage("search");
    }

    // Check if user is logged in
    const savedUser = localStorage.getItem("fullfill_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid user data
      }
    }
  }, []);

  function handleNavigate(page: string) {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleContinue() {
    localStorage.setItem("fullfill_visited", "true");
    setCurrentPage("search");
  }

  function handleAuth(email: string) {
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

  if (currentPage === "login") {
    return <Auth onNavigate={handleNavigate} onAuth={handleAuth} />;
  }

  return (
    <Search
      specialty={specialty}
      setting={setting}
      onSpecialtyChange={handleSpecialtyChange}
      onNavigate={handleNavigate}
      user={user}
    />
  );
}
