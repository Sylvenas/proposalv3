"use client";

import { useEffect, useState } from "react";

import { odaOptions } from "@/data/odaMockDataFence";

import { ApprovedScreen } from "./proposal-fence-mobile/screens/ApprovedScreen";
import { DetailScreen } from "./proposal-fence-mobile/screens/DetailScreen";
import { LandingScreen } from "./proposal-fence-mobile/screens/LandingScreen";
import { OptionsScreen } from "./proposal-fence-mobile/screens/OptionsScreen";

type MobileScreen = "landing" | "options" | "detail" | "approved";
const VALID_MOBILE_SCREENS: MobileScreen[] = ["landing", "options", "detail", "approved"];

export default function ODAProposalPageFenceMobile() {
  const [screen, setScreen] = useState<MobileScreen>("landing");
  const [selectedOption, setSelectedOption] = useState(0);
  const [visible, setVisible] = useState(true);

  const goToLanding = () => setScreen("landing");

  const navigateTo = (next: MobileScreen) => {
    setVisible(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setScreen(next);
      requestAnimationFrame(() => setVisible(true));
    }, 150);
  };

  // Sync screen + option from URL params
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      const optionParam = Number.parseInt(params.get("option") ?? "", 10);

      if (screenParam && VALID_MOBILE_SCREENS.includes(screenParam as MobileScreen)) {
        setScreen(screenParam as MobileScreen);
      }
      if (
        Number.isInteger(optionParam) &&
        optionParam >= 1 &&
        optionParam <= odaOptions.length
      ) {
        setSelectedOption(optionParam - 1);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Push screen + option to URL
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screen);
    url.searchParams.set("option", String(selectedOption + 1));
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }, [screen, selectedOption]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {screen === "landing" && (
        <LandingScreen
          onContinue={() => navigateTo("options")}
          onHome={goToLanding}
        />
      )}
      {screen === "options" && (
        <OptionsScreen
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onContinue={() => navigateTo("detail")}
          onHome={goToLanding}
        />
      )}
      {screen === "detail" && (
        <DetailScreen
          option={odaOptions[selectedOption]}
          onBack={() => navigateTo("options")}
          onApprove={() => navigateTo("approved")}
          onHome={goToLanding}
        />
      )}
      {screen === "approved" && (
        <ApprovedScreen
          option={odaOptions[selectedOption]}
          onHome={goToLanding}
        />
      )}
    </div>
  );
}
