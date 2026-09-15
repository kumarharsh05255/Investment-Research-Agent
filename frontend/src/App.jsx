import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import ResearchPage from "./pages/ResearchPage";
import WatchlistPage from "./pages/WatchlistPage";


function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [
    researchSessionId,
    setResearchSessionId,
  ] = useState(null);

  const [
    researchDraft,
    setResearchDraft,
  ] = useState("");


  function openNewResearch(
    query = ""
  ) {
    setResearchSessionId(null);
    setResearchDraft(query);
    setActivePage("research");
  }


  function openResearchSession(
    sessionId
  ) {
    setResearchSessionId(
      sessionId
    );

    setResearchDraft("");
    setActivePage("research");
  }


  function handleNavigation(
    page
  ) {
    if (
      page === "research"
    ) {
      openNewResearch();
      return;
    }

    setActivePage(page);
  }


  function renderPage() {
    switch (activePage) {
      case "research":
        return (
          <ResearchPage
            initialSessionId={
              researchSessionId
            }
            initialQuery={
              researchDraft
            }
            onNewSession={() => {
              setResearchSessionId(
                null
              );

              setResearchDraft(
                ""
              );
            }}
          />
        );


      case "history":
        return (
          <HistoryPage
            onContinueResearch={
              openResearchSession
            }
          />
        );


      case "watchlist":
        return (
          <WatchlistPage />
        );


      case "dashboard":
      default:
        return (
          <DashboardPage
            setActivePage={
              handleNavigation
            }
            onOpenSession={
              openResearchSession
            }
            onStartResearch={
              openNewResearch
            }
          />
        );
    }
  }


  return (
    <div className="min-h-screen bg-[#f5f5f1] text-black">

      <Sidebar
        activePage={
          activePage
        }
        onNavigate={
          handleNavigation
        }
      />


      <div className="min-h-screen lg:pl-[272px]">

        <Topbar
          activePage={
            activePage
          }
        />


        {renderPage()}

      </div>

    </div>
  );
}


export default App;