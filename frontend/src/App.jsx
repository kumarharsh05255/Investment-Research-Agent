import { useState } from "react";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import WatchlistPage from "./pages/WatchlistPage";


function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [
    researchSessionId,
    setResearchSessionId,
  ] = useState(null);


  function handleNavigation(page) {
    setActivePage(page);
  }


  function openResearchSession(
    sessionId
  ) {
    setResearchSessionId(
      sessionId
    );

    setActivePage(
      "dashboard"
    );
  }


  function clearResearchSession() {
    setResearchSessionId(null);
  }


  function renderPage() {
    switch (activePage) {

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
            initialSessionId={
              researchSessionId
            }
            onClearSession={
              clearResearchSession
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