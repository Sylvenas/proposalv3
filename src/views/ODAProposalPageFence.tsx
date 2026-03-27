"use client";

import { useEffect, useState } from "react";

import { odaOptions } from "@/data/odaMockDataFence";

import { VALID_SCREENS, type Screen } from "./proposal-fence/shared";
import { ApprovedScreen } from "./proposal-fence/screens/ApprovedScreen";
import { DetailScreen } from "./proposal-fence/screens/DetailScreen";
import { EmailScreen } from "./proposal-fence/screens/EmailScreen";
import { LandingScreen } from "./proposal-fence/screens/LandingScreen";
import { OptionsScreen } from "./proposal-fence/screens/OptionsScreen";

export default function ODAProposalPageFence({
  initialScreen = "email",
}: {
  initialScreen?: Screen;
}) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [selectedOption, setSelectedOption] = useState(0);
  const [visible, setVisible] = useState(true);
  const goToLanding = () => setScreen("landing");

  const navigateTo = (next: Screen) => {
    setVisible(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      setScreen(next);
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, 150);
  };

  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      const optionParam = Number.parseInt(params.get("option") ?? "", 10);

      if (screenParam && VALID_SCREENS.includes(screenParam as Screen)) {
        setScreen(screenParam as Screen);
      }

      if (
        Number.isInteger(optionParam) &&
        optionParam >= 1 &&
        optionParam <= odaOptions.length
      ) {
        setSelectedOption(optionParam - 1);
      }
    };

    syncStateFromUrl();
    window.addEventListener("popstate", syncStateFromUrl);
    return () => window.removeEventListener("popstate", syncStateFromUrl);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screen);
    url.searchParams.set("option", String(selectedOption + 1));
    const nextUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [screen, selectedOption]);


  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {screen === "email" && (
        <EmailScreen onContinue={() => navigateTo("landing")} />
      )}
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
