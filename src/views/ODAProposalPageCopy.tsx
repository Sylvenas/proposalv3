"use client";

import { useEffect, useState } from "react";

// import { defaultProposalV3Data } from "./proposal-v3/defaultData";
import { importProposalZip } from "./proposal-v3/importZip";
import type { ProposalV3Data } from "./proposal-v3/schema";
import { VALID_SCREENS, type Screen } from "./proposal-v3/shared";
import { UploadScreen } from "./proposal-v3/screens/UploadScreen";
import { ApprovedScreen } from "./proposal-v3/screens/ApprovedScreen";
import { DetailScreen } from "./proposal-v3/screens/DetailScreen";
import { EmailScreen } from "./proposal-v3/screens/EmailScreen";
import { LandingScreen } from "./proposal-v3/screens/LandingScreen";
import { OptionsScreen } from "./proposal-v3/screens/OptionsScreen";

export default function ODAProposalPageCopy({
  initialScreen = "upload",
}: {
  initialScreen?: Screen;
}) {
  const [data, setData] = useState<ProposalV3Data | null>(null);
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [selectedOption, setSelectedOption] = useState(0);
  const [visible, setVisible] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
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

  // If no data loaded yet but URL says a non-upload screen, force back to upload
  useEffect(() => {
    if (!data && screen !== "upload") {
      setScreen("upload");
    }
  }, [data, screen]);

  useEffect(() => {
    const syncStateFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      const optionParam = Number.parseInt(params.get("option") ?? "", 10);

      if (screenParam && VALID_SCREENS.includes(screenParam as Screen)) {
        // Only allow non-upload screens if data is loaded
        if (screenParam === "upload" || data) {
          setScreen(screenParam as Screen);
        } else {
          setScreen("upload");
        }
      }

      if (
        data &&
        Number.isInteger(optionParam) &&
        optionParam >= 1 &&
        optionParam <= data.options.length
      ) {
        setSelectedOption(optionParam - 1);
      }
    };

    syncStateFromUrl();
    window.addEventListener("popstate", syncStateFromUrl);
    return () => window.removeEventListener("popstate", syncStateFromUrl);
  }, [data]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("screen", screen);
    url.searchParams.set("option", String(selectedOption + 1));
    const nextUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [screen, selectedOption]);

  const handleUpload = async (file: File) => {
    try {
      const imported = await importProposalZip(file);
      console.log("[handleUpload] Import succeeded, option titles:", imported.options.map(o => o.summary.title));
      setData(imported);
      setUploadError(null);
      navigateTo("email");
    } catch (error) {
      console.error("[handleUpload] Import failed:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to import package.");
    }
  };

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s ease",
        ["--proposal-accent" as string]: data?.project.themeColor ?? "#000000",
      }}
    >
      {screen === "upload" && (
        <UploadScreen onUpload={handleUpload} error={uploadError} />
      )}
      {screen === "email" && data && (
        <EmailScreen data={data} onContinue={() => navigateTo("landing")} />
      )}
      {screen === "landing" && data && (
        <LandingScreen
          data={data}
          onContinue={() => navigateTo("options")}
          onHome={goToLanding}
        />
      )}
      {screen === "options" && data && (
        <OptionsScreen
          data={data}
          selectedOption={selectedOption}
          onSelect={setSelectedOption}
          onContinue={() => navigateTo("detail")}
          onHome={goToLanding}
        />
      )}
      {screen === "detail" && data && (
        <DetailScreen
          data={data}
          option={data.options[selectedOption]}
          onBack={() => navigateTo("options")}
          onApprove={() => navigateTo("approved")}
          onHome={goToLanding}
        />
      )}
      {screen === "approved" && data && (
        <ApprovedScreen
          data={data}
          option={data.options[selectedOption]}
          onHome={goToLanding}
        />
      )}
    </div>
  );
}
