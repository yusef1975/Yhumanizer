"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [persona, setPersona] = useState("College");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!inputText.trim()) return;

    if (inputText.length > 60000) {
      setError("Input exceeds maximum limit of 60,000 characters (approx 15k tokens).");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          persona: persona,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process text");
      }

      setOutputText(data.humanized);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!outputText) return;

    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: outputText.split('\n').map(line =>
              new Paragraph({
                children: [new TextRun(line)],
              })
            ),
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `StudentVibe_${persona}_Result.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating DOCX:", err);
      setError("Failed to generate DOCX file.");
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col pt-24 hover:pt-24">
      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
          StudentVibe
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto font-medium tracking-wide">
          Transform perfect AI text into a natural, slightly caffeinated student voice. Defeat detectors trivially.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start w-full">
        {/* Left Column: Input */}
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col h-[500px] transition-all duration-300 hover:border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Raw Input (LLM Text)</h2>
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                {["High School", "College", "Creative"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${persona === p
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="flex-1 w-full bg-transparent border-none text-white/90 placeholder:text-white/20 resize-none focus:ring-0 focus:outline-none text-base leading-relaxed"
              placeholder="Paste the overly formal AI text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            onClick={handleRefine}
            disabled={isProcessing || !inputText.trim()}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              {isProcessing ? "Rewriting Vibe..." : "Refine Vibe"}
              {!isProcessing && (
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </span>
          </button>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="glass-panel p-6 flex flex-col h-[500px] relative overflow-hidden group transition-all duration-300 hover:border-white/20">
            {/* Subtle glow effect behind the output */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none transition-all group-hover:bg-indigo-500/10"></div>

            <div className="flex justify-between items-center mb-4 relative z-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-green-400/90">Humanized Output</h2>
              {outputText && (
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadDocx}
                    className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    .docx
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(outputText)}
                    className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 w-full text-white/90 text-base leading-relaxed overflow-y-auto relative z-10 w-full pr-2">
              {outputText ? (
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-white" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3 mt-5 text-white" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2 mt-4 text-white" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-white shadow-sm" {...props} />,
                  }}
                >
                  {outputText}
                </ReactMarkdown>
              ) : (
                <div className="h-full flex items-center justify-center text-white/10 italic">
                  Results will magically appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
