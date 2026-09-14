function ResearchForm({
  query,
  setQuery,
  runResearch,
  loading,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    runResearch();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
    >
      <label className="mb-3 block text-sm font-medium">
        What would you like to research?
      </label>

      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Example: Should I invest in Apple?"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Researching..." : "Run Research"}
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <ExampleButton
          text="Analyze Apple"
          setQuery={setQuery}
        />

        <ExampleButton
          text="Compare NVIDIA and AMD"
          setQuery={setQuery}
        />

        <ExampleButton
          text="Latest Tesla news"
          setQuery={setQuery}
        />
      </div>
    </form>
  );
}

function ExampleButton({ text, setQuery }) {
  return (
    <button
      type="button"
      onClick={() => setQuery(text)}
      className="rounded-lg border border-slate-800 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
    >
      {text}
    </button>
  );
}

export default ResearchForm;