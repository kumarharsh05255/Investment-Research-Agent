function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "⌂",
    },
    {
      id: "recent",
      label: "Recent Research",
      icon: "◷",
    },
    {
      id: "reports",
      label: "Saved Reports",
      icon: "▤",
    },
    {
      id: "watchlist",
      label: "Watchlist",
      icon: "★",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 p-5">
      <div className="mb-10">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
            IR
          </div>

          <div>
            <h2 className="font-semibold">
              Investment
            </h2>

            <p className="text-xs text-slate-500">
              Research Agent
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <span className="w-5 text-center">
                {item.icon}
              </span>

              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs text-slate-500">
          Research Agent
        </p>

        <p className="mt-1 text-sm font-medium">
          AI-powered analysis
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          Ready
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;