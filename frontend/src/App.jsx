import { useState } from "react";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import WatchlistPage from "./pages/WatchlistPage";


function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    researchSessionId,
    setResearchSessionId,
  ] = useState(null);


  // Convert the current URL into the page name
  // expected by Sidebar and Topbar.
  function getActivePage() {
    if (
      location.pathname === "/history"
    ) {
      return "history";
    }

    if (
      location.pathname === "/watchlist"
    ) {
      return "watchlist";
    }

    return "dashboard";
  }


  const activePage =
    getActivePage();


  function handleNavigation(page) {
    if (page === "history") {
      navigate("/history");
      return;
    }

    if (page === "watchlist") {
      navigate("/watchlist");
      return;
    }

    navigate("/");
  }


  function openResearchSession(
    sessionId
  ) {
    setResearchSessionId(
      sessionId
    );

    navigate("/");
  }


  function clearResearchSession() {
    setResearchSessionId(null);
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


        <Routes>

          <Route
            path="/"
            element={
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
            }
          />


          <Route
            path="/history"
            element={
              <HistoryPage
                onContinueResearch={
                  openResearchSession
                }
              />
            }
          />


          <Route
            path="/watchlist"
            element={
              <WatchlistPage />
            }
          />


          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </div>

    </div>
  );
}


export default App;