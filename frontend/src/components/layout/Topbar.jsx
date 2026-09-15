import {
  ChevronRight,
  Plus,
} from "lucide-react";


function Topbar({
  activePage,
  setActivePage,
}) {
  const pageNames = {
    dashboard: "Dashboard",
    research: "Research",
    history: "Research History",
    watchlist: "Watchlist",
  };


  return (
    <header className="sticky top-0 z-30 border-b border-[#deded9] bg-[#f7f7f5]/90 backdrop-blur-xl">

      <div className="flex h-[76px] items-center justify-between px-8 xl:px-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">

          <span className="text-[#8a8a84]">
            Workspace
          </span>


          <ChevronRight
            size={15}
            className="text-[#aaaaa5]"
          />


          <span className="font-medium text-[#111111]">
            {pageNames[activePage]}
          </span>

        </div>


        {/* New Research */}
        {setActivePage && (
          <button
            type="button"
            onClick={() =>
              setActivePage(
                "research"
              )
            }
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#262626]"
          >

            <Plus size={16} />

            New Research

          </button>
        )}

      </div>

    </header>
  );
}


export default Topbar;