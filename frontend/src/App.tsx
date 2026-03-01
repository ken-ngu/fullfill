import { useState, useEffect } from "react";
import { Landing } from "./pages/Landing";
import { Search } from "./pages/Search";

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [specialty, setSpecialty] = useState<string>(() => {
    return localStorage.getItem("fullfill_specialty") || "dermatology";
  });
  const [setting, setSetting] = useState<string>(() => {
    return localStorage.getItem("fullfill_setting") || "outpatient";
  });

  useEffect(() => {
    // Check if we should skip landing
    const hasVisited = localStorage.getItem("fullfill_visited");
    if (hasVisited === "true") {
      setShowLanding(false);
    }
  }, []);

  function handleSpecialtyChange(newSpecialty: string, newSetting: string) {
    setSpecialty(newSpecialty);
    setSetting(newSetting);
    localStorage.setItem("fullfill_specialty", newSpecialty);
    localStorage.setItem("fullfill_setting", newSetting);
  }

  if (showLanding) {
    return <Landing onContinue={() => setShowLanding(false)} />;
  }

  return (
    <Search
      specialty={specialty}
      setting={setting}
      onSpecialtyChange={handleSpecialtyChange}
    />
  );
}
