"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState("chat");   // "chat" | "text-summary" | "pdf-summary"
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
//        console.log("現在のモード:", mode);
        e.preventDefault();
        
        if (!input.trim()) return;

        if (mode === "pdf-summary") {
            if (!file) {
                alert("PDFファイルを選択してください");
                return;
            }
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("http://127.0.0.1:8000/pdf-summary", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                const newAssistantMessage = { role: "assistant", content: data.summary };
                setMessages([...messages, newAssistantMessage]);
            } catch (error) {
                console.error(error);
                const errorMessage = { role: "assistant", content: "PDF要約中にエラーが発生しました" };
                setMessages([...messages, errorMessage]);
            } finally {
                setIsLoading(false);
                setFile(null);
            }
            return;
        }

        const newUserMessage = { role: "user", content: input };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);

        // スピナー表示ON
        setIsLoading(true);

        setInput("");

        try {
            const res = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: updatedMessages,
                    mode: mode, // + モードを送信
                }),
            });

            const data = await res.json();
            const newAssistantMessage = { role: "assistant", content: data.response };
            setMessages([...updatedMessages, newAssistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: "assistant", content: "エラーが発生しました" };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            // スピナー表示OFF
            setIsLoading(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf-summary`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            const newAssistantMessage = { role: "assistant", content: data.response };
            setMessages((prev) => [...prev, newAssistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage = { role: "assistant", content: "PDF要約でエラーが発生しました" };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-xl mx-auto p-4">
            <h1 className="text-2xl mb-4">FastAPI × OpenAI チャット</h1>

            {/* モード切替 */}
            <div className="mb-4">
                <label className="mr-2">モード切り替え:</label>
                <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="chat">チャットモード</option>
                    <option value="text-summary">テキスト要約モード</option>
                    <option value="pdf-summary">PDF要約モード</option>
                </select>
            </div>

            {/* チャット領域 */}
            <div className="flex-1 overflow-y-auto p-2 mb-4 border border-gray-300 rounded bg-gray-50 max-h-[600px]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-1`}
                    >
                        <div
                            className={`p-2 rounded-lg max-w-xs ${
                                msg.role === "user" ? "bg-blue-200 text-left" : "bg-gray-200 text-left"
                            }`}
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: (msg.content ?? "").replace(/\n/g, "<br />"),
                                }}
                            ></div>
                        </div>
                    </div>
                ))}

                {/* スピナー表示 */}
                {isLoading && (
                    <div className="flex justify-start mb-1">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            {mode === "pdf-summary" ? (
                <div className="flex flex-col items-center gap-2">
                    <label className="text-sm text-gray-600">PDFファイルを選択すると自動で要約が始まります</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFUpload}
                        className="border p-2 rounded w-full"
                    />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを入力（Enter送信・Shift+Enter改行）"
                        className="border p-2 flex-1 rounded resize-none h-16"
                    ></textarea>
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        送信
                    </button>
                </form>
            )}
        </div>
    );
}
