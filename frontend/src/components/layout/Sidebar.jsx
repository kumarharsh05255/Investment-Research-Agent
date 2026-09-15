import {
  BarChart3,
  History,
  Search,
  Telescope,
  X,
} from "lucide-react";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    id: "research",
    label: "Research",
    icon: Search,
  },
  {
    id: "history",
    label: "Research History",
    icon: History,
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: Telescope,
  },
];

function Sidebar({
  activePage,
  onNavigate,
  mobileOpen = false,
  onClose,
}) {
  function handleNavigate(page) {
    onNavigate(page);

    if (onClose) {
      onClose();
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-[88px] items-center justify-between border-b border-[#262626] px-6">
        <button
          onClick={() => handleNavigate("dashboard")}
          className="text-left"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#777]">
            Investment
          </p>

          <h1 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white">
            Research Agent
          </h1>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#888] transition hover:bg-[#1d1d1d] hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#555]">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  selected
                    ? "bg-white text-black"
                    : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                }`}
              >
                <Icon size={17} strokeWidth={1.8} />

                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#262626] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#333] bg-[#1b1b1b] text-[10px] font-semibold text-white">
            IR
          </div>

          <div>
            <p className="text-xs font-medium text-[#d8d8d8]">
              Research Workspace
            </p>

            <p className="mt-0.5 text-[10px] text-[#666]">
              AI-powered analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-[#262626] bg-[#111] lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[272px] border-r border-[#262626] bg-[#111] transition-transform duration-200 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export default Sidebar;