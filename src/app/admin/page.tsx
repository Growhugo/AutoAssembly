"use client";

import { useState, useCallback } from "react";

interface StoredData {
  content: string | null;
  items: { title: string; snippet: string }[];
  updatedAt: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [storedData, setStoredData] = useState<StoredData | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStoredData = useCallback(async (secret: string) => {
    try {
      const res = await fetch("/api/admin/teams", {
        headers: { "x-admin-secret": secret },
      });
      if (res.ok) {
        const data = await res.json();
        setStoredData(data);
      }
    } catch {
      // Ignore fetch errors
    }
  }, []);

  const handleLogin = async () => {
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teams", {
        headers: { "x-admin-secret": password },
      });
      if (res.status === 401) {
        setAuthError("Incorrect password");
        setLoading(false);
        return;
      }
      setAuthenticated(true);
      const data = await res.json();
      setStoredData(data);
    } catch {
      setAuthError("Connection error");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!pasteContent.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": password,
        },
        body: JSON.stringify({ content: pasteContent }),
      });
      if (res.ok) {
        const result = await res.json();
        setMessage({ type: "success", text: `Saved ${result.itemCount} items from Teams content.` });
        setPasteContent("");
        await fetchStoredData(password);
      } else {
        setMessage({ type: "error", text: "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error" });
    }
    setLoading(false);
  };

  const handleClear = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "DELETE",
        headers: { "x-admin-secret": password },
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Teams data cleared." });
        setStoredData({ content: null, items: [], updatedAt: null });
      } else {
        setMessage({ type: "error", text: "Failed to clear" });
      }
    } catch {
      setMessage({ type: "error", text: "Connection error" });
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <h1 className="mb-1 text-xl font-bold text-cca-blue">AutoAssembly Admin</h1>
          <p className="mb-4 text-sm text-gray-500">Enter admin password to continue</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            disabled={loading}
          />
          {authError && <p className="mb-3 text-sm text-red-500">{authError}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Log In"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-cca-blue">AutoAssembly Admin</h1>
          <p className="text-sm text-gray-500">Manage Teams data for assembly reports</p>
        </div>

        {/* Current stored data */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Current Teams Data</h2>
          {storedData?.content ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  Active
                </span>
                <span className="text-xs text-gray-400">
                  Last updated: {new Date(storedData.updatedAt!).toLocaleDateString("en-IE", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mb-2 text-sm text-gray-600">
                {storedData.items.length} item{storedData.items.length !== 1 ? "s" : ""} stored
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-purple-600 hover:text-purple-700">
                  Preview stored content
                </summary>
                <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-600 whitespace-pre-wrap">
                  {storedData.content}
                </pre>
              </details>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No Teams data stored. Paste content below to add it.</p>
          )}
        </div>

        {/* Paste new content */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-700">Update Teams Content</h2>
          <p className="mb-3 text-xs text-gray-400">
            Paste the weekly Teams email content below. This replaces any existing data.
          </p>
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Paste your weekly Power Automate email content here..."
            rows={10}
            disabled={loading}
            className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || !pasteContent.trim()}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Teams Data"}
            </button>
            {storedData?.content && (
              <button
                onClick={handleClear}
                disabled={loading}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50"
              >
                Clear Stored Data
              </button>
            )}
          </div>
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Instructions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">How This Works</h2>
          <ol className="list-inside list-decimal space-y-1 text-sm text-gray-500">
            <li>Power Automate emails you a Teams summary every week</li>
            <li>Open the email, select all the content, and copy it</li>
            <li>Paste it here and click &ldquo;Save Teams Data&rdquo;</li>
            <li>All users will automatically see Teams content in their reports</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
