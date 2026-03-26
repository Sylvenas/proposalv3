"use client";

import { useEffect, useState } from "react";

import { odaOptions } from "@/data/odaMockDataCopy";

import { VALID_SCREENS, type Screen } from "./proposal-v3/shared";
import { ApprovedScreen } from "./proposal-v3/screens/ApprovedScreen";
import { DetailScreen } from "./proposal-v3/screens/DetailScreen";
import { EmailScreen } from "./proposal-v3/screens/EmailScreen";
import { LandingScreen } from "./proposal-v3/screens/LandingScreen";
import { OptionsScreen } from "./proposal-v3/screens/OptionsScreen";

export default function ODAProposalPageCopy({
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
