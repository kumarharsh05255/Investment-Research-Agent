import { useEffect, useMemo, useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  ArrowRight,
  Clock3,
  Loader2,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteSession,
  getSessionMessages,
  getSessions,
} from "../services/api";


function HistoryPage({
  onContinueResearch,
}) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");


  useEffect(() => {
    loadSessions();
  }, []);


  async function loadSessions() {
    try {
      setLoading(true);
      setError("");

      const result = await getSessions();

      const items = getSessionItems(result);

      setSessions(items);

      if (items.length > 0) {
        await selectSession(items[0]);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load research history."
      );
    } finally {
      setLoading(false);
    }
  }


  async function selectSession(session) {
    if (!session) {
      return;
    }

    try {
      setSelectedSession(session);
      setMessagesLoading(true);
      setError("");

      const result =
        await getSessionMessages(
          session.id
        );

      setMessages(
        getMessageItems(result)
      );
    } catch (err) {
      console.error(err);

      setMessages([]);

      setError(
        err.message ||
          "Unable to load session messages."
      );
    } finally {
      setMessagesLoading(false);
    }
  }


  async function handleDelete() {
    if (!selectedSession) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this research session? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteSession(
        selectedSession.id
      );

      const remaining =
        sessions.filter(
          (session) =>
            session.id !==
            selectedSession.id
        );

      setSessions(remaining);
      setSelectedSession(null);
      setMessages([]);

      if (remaining.length > 0) {
        await selectSession(
          remaining[0]
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete session."
      );
    } finally {
      setDeleting(false);
    }
  }


  function handleContinue() {
    if (!selectedSession) {
      return;
    }

    onContinueResearch?.(
      selectedSession.id
    );
  }


  const filteredSessions =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return sessions;
      }

      return sessions.filter(
        (session) => {
          const searchable = [
            session.title,
            session.query,
            session.id,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            value
          );
        }
      );
    }, [sessions, search]);


  return (
    <main className="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-10">

      <Header />


      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="mt-8 grid min-h-[650px] overflow-hidden rounded-[24px] border border-[#deded9] bg-white lg:grid-cols-[360px_1fr]">

        <SessionSidebar
          sessions={
            filteredSessions
          }
          selectedSession={
            selectedSession
          }
          search={search}
          setSearch={setSearch}
          loading={loading}
          onSelect={
            selectSession
          }
        />


        <SessionViewer
          session={
            selectedSession
          }
          messages={messages}
          loading={
            messagesLoading
          }
          deleting={deleting}
          onContinue={
            handleContinue
          }
          onDelete={
            handleDelete
          }
        />

      </div>

    </main>
  );
}


function Header() {
  return (
    <header className="border-b border-[#deded9] pb-8">

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
        Research Archive
      </p>


      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
        Research History
      </h1>


      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#777]">
        Reopen previous investment
        research, review the full
        conversation and continue
        working from the same session.
      </p>

    </header>
  );
}


function SessionSidebar({
  sessions,
  selectedSession,
  search,
  setSearch,
  loading,
  onSelect,
}) {
  return (
    <aside className="border-b border-[#deded9] bg-[#fafaf8] lg:border-b-0 lg:border-r">

      <div className="border-b border-[#deded9] p-5">

        <div className="relative">

          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search research..."
            className="h-10 w-full rounded-xl border border-[#deded9] bg-white pl-10 pr-4 text-xs outline-none transition focus:border-black"
          />

        </div>

      </div>


      <div className="max-h-[650px] overflow-y-auto">

        {loading ? (
          <SidebarLoading />
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">

            <MessageSquare
              size={22}
              className="mx-auto text-[#aaa]"
            />

            <p className="mt-4 text-sm font-semibold">
              No research found
            </p>

            <p className="mt-2 text-xs leading-5 text-[#999]">
              Your completed research
              sessions will appear here.
            </p>

          </div>
        ) : (
          sessions.map(
            (session) => {

              const selected =
                selectedSession?.id ===
                session.id;

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() =>
                    onSelect(session)
                  }
                  className={`block w-full border-b border-[#e9e9e5] p-5 text-left transition ${
                    selected
                      ? "bg-black text-white"
                      : "hover:bg-white"
                  }`}
                >

                  <p
                    className={`line-clamp-2 text-sm font-semibold leading-5 ${
                      selected
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {getSessionTitle(
                      session
                    )}
                  </p>


                  <div
                    className={`mt-3 flex items-center gap-1.5 text-[10px] ${
                      selected
                        ? "text-white/50"
                        : "text-[#999]"
                    }`}
                  >

                    <Clock3 size={11} />

                    {formatDate(
                      session.created_at
                    )}

                  </div>

                </button>
              );
            }
          )
        )}

      </div>

    </aside>
  );
}


function SessionViewer({
  session,
  messages,
  loading,
  deleting,
  onContinue,
  onDelete,
}) {
  if (!session) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center px-8 text-center">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
          <MessageSquare
            size={18}
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Select a research session
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
          Choose a session from the
          history panel to review its
          conversation.
        </p>

      </div>
    );
  }


  return (
    <section className="flex min-w-0 flex-col">

      <div className="flex flex-col justify-between gap-5 border-b border-[#deded9] px-6 py-5 md:flex-row md:items-center">

        <div className="min-w-0">

          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#999]">
            Selected Research
          </p>

          <h2 className="mt-2 truncate text-lg font-semibold tracking-[-0.02em]">
            {getSessionTitle(
              session
            )}
          </h2>

        </div>


        <div className="flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#deded9] px-4 text-xs font-semibold text-[#777] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >

            {deleting ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={13}
              />
            )}

            Delete

          </button>


          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black px-4 text-xs font-semibold text-white transition hover:bg-[#222]"
          >

            Continue Research

            <ArrowRight
              size={13}
            />

          </button>

        </div>

      </div>


      <div className="flex-1 overflow-y-auto bg-[#fdfdfb] p-6 md:p-8">

        {loading ? (
          <MessagesLoading />
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-[#999]">
            No messages found in this
            session.
          </p>
        ) : (
          <div className="mx-auto max-w-4xl space-y-5">

            {messages.map(
              (
                message,
                index
              ) => (
                <HistoryMessage
                  key={
                    message.id ||
                    index
                  }
                  message={
                    message
                  }
                />
              )
            )}

          </div>
        )}

      </div>

    </section>
  );
}


function HistoryMessage({
  message,
}) {
  const isUser =
    message.role === "user";


  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-6 ${
          isUser
            ? "rounded-tr-md bg-black text-white"
            : "rounded-tl-md border border-[#deded9] bg-white text-[#444]"
        }`}
      >

        {isUser ? (
          <p className="whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[
              remarkGfm,
            ]}
            components={{

              h1: ({
                children,
              }) => (
                <h1 className="mb-4 mt-6 text-2xl font-semibold tracking-tight first:mt-0">
                  {children}
                </h1>
              ),


              h2: ({
                children,
              }) => (
                <h2 className="mb-3 mt-6 border-b border-[#eeeeea] pb-2 text-xl font-semibold tracking-tight first:mt-0">
                  {children}
                </h2>
              ),


              h3: ({
                children,
              }) => (
                <h3 className="mb-2 mt-5 text-base font-semibold text-black">
                  {children}
                </h3>
              ),


              h4: ({
                children,
              }) => (
                <h4 className="mb-2 mt-4 text-sm font-semibold text-black">
                  {children}
                </h4>
              ),


              p: ({
                children,
              }) => (
                <p className="mb-4 text-[#4c4c48] last:mb-0">
                  {children}
                </p>
              ),


              ul: ({
                children,
              }) => (
                <ul className="mb-5 list-disc space-y-2 pl-5 text-[#4c4c48]">
                  {children}
                </ul>
              ),


              ol: ({
                children,
              }) => (
                <ol className="mb-5 list-decimal space-y-2 pl-5 text-[#4c4c48]">
                  {children}
                </ol>
              ),


              table: ({
                children,
              }) => (
                <div className="my-5 overflow-x-auto rounded-xl border border-[#deded9]">

                  <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                    {children}
                  </table>

                </div>
              ),


              thead: ({
                children,
              }) => (
                <thead className="bg-[#f4f4f0]">
                  {children}
                </thead>
              ),


              th: ({
                children,
              }) => (
                <th className="border-b border-[#deded9] px-4 py-3 text-xs font-semibold text-black">
                  {children}
                </th>
              ),


              td: ({
                children,
              }) => (
                <td className="border-b border-[#eeeeea] px-4 py-3 align-top text-[#555]">
                  {children}
                </td>
              ),


              strong: ({
                children,
              }) => (
                <strong className="font-semibold text-black">
                  {children}
                </strong>
              ),


              a: ({
                href,
                children,
              }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-black underline underline-offset-4"
                >
                  {children}
                </a>
              ),


              hr: () => (
                <hr className="my-6 border-[#eeeeea]" />
              ),

            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

      </div>

    </div>
  );
}


function SidebarLoading() {
  return (
    <div className="space-y-0">

      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="animate-pulse border-b border-[#e9e9e5] p-5"
          >

            <div className="h-3 w-4/5 rounded bg-[#e6e6e1]" />

            <div className="mt-3 h-2 w-20 rounded bg-[#ededE8]" />

          </div>
        )
      )}

    </div>
  );
}


function MessagesLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">

      <div className="ml-auto h-16 w-2/3 animate-pulse rounded-2xl bg-[#e8e8e3]" />

      <div className="h-40 w-5/6 animate-pulse rounded-2xl bg-[#eeeeea]" />

      <div className="ml-auto h-14 w-1/2 animate-pulse rounded-2xl bg-[#e8e8e3]" />

    </div>
  );
}


/*
 * API response helpers
 */

function getSessionItems(
  result
) {
  if (Array.isArray(result)) {
    return result;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.sessions
    )
  ) {
    return result.sessions;
  }

  return [];
}


function getMessageItems(
  result
) {
  if (Array.isArray(result)) {
    return result;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.messages
    )
  ) {
    return result.messages;
  }

  return [];
}


function getSessionTitle(
  session
) {
  return (
    session?.title ||
    session?.query ||
    "Investment Research"
  );
}


function formatDate(value) {
  if (!value) {
    return "Previous research";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Previous research";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}


export default HistoryPage;