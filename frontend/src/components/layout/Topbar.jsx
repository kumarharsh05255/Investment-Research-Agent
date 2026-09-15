import {
  Bell,
  ChevronRight,
  Command,
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
    reports: "Saved Reports",
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

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Command/search visual */}
          <button className="hidden items-center gap-3 rounded-xl border border-[#d9d9d4] bg-white px-4 py-2.5 text-sm text-[#777771] transition hover:border-[#bcbcb6] lg:flex">
            <Command size={15} />

            <span>
              Search workspace
            </span>

            <span className="ml-3 rounded-md bg-[#f1f1ed] px-2 py-1 text-[10px] text-[#888882]">
              ⌘ K
            </span>
          </button>

          {/* Notification */}
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9d9d4] bg-white transition hover:bg-[#f0f0ec]">
            <Bell size={17} />
          </button>

          {/* New research */}
          <button
            onClick={() => setActivePage("research")}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#262626]"
          >
            <Plus size={16} />
            New Research
          </button>
        </div>
      </div>
    </header>
  );
}


export default Topbar;