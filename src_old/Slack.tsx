import { createSignal, For, Show } from "solid-js";
import ThreadPanel from "./ThreadPanel"; // 1本目のファイルをインポート

export default function App() {
  // 1. チャンネル一覧
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  // 2. 現在選択されているチャンネルID
  const [activeChannelId, setActiveChannelId] = createSignal("general");

  // 3. メッセージデータの状態
  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！" },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。" },
  ]);

  // 4. スレッド（返信）データの状態
  const [threadMessages, setThreadMessages] = createSignal([
    { id: 101, parentMessageId: 1, user: "Bob", text: "アリスさんこんにちは！" },
  ]);

  // 5. 現在開いているスレッドの「親メッセージID」（nullの時は閉じる）
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);

  // 6. 入力フォームの状態
  const [mainInputText, setMainInputText] = createSignal("");
  const [threadInputText, setThreadInputText] = createSignal("");

  // --- 派生シグナル ---
  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  // メインチャットのメッセージ送信
  const handleSendMainMessage = (e) => {
    e.preventDefault();
    if (!mainInputText().trim()) return;

    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: mainInputText().trim(),
    };

    setMessages([...messages(), newMessage]);
    setMainInputText("");
  };

  // スレッドへの返信送信
  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if (!threadInputText().trim() || !activeThreadParentId()) return;

    const newReply = {
      id: Date.now(),
      parentMessageId: activeThreadParentId(),
      user: "You",
      text: threadInputText().trim(),
    };

    setThreadMessages([...threadMessages(), newReply]);
    setThreadInputText("");
  };

  // 返信数のカウント
  const getReplyCount = (messageId) => {
    return threadMessages().filter(m => m.parentMessageId === messageId).length;
  };

  return (
    <div style={{ display: "flex", height: "100vh", "font-family": "sans-serif", color: "#1d1c1d", overflow: "hidden" }}>
      
      {/* サイドバー */}
      <aside style={{ width: "240px", "background-color": "#4a154b", color: "#bcabbc", padding: "16px", "display": "flex", "flex-direction": "column", "gap": "20px" }}>
        <h2 style={{ color: "#ffffff", "margin-top": 0, "font-size": "18px" }}>Workspace</h2>
        <div>
          <h3 style={{ "font-size": "12px", "margin-bottom": "8px", "text-transform": "uppercase", "color": "#bcabbc" }}>チャンネル</h3>
          <ul style={{ "list-style": "none", padding: 0, margin: 0, "display": "flex", "flex-direction": "column", gap: "4px" }}>
            <For each={channels()}>
              {(channel) => (
                <li>
                  <button
                    onClick={() => {
                      setActiveChannelId(channel.id);
                      setActiveThreadParentId(null);
                    }}
                    style={{
                      width: "100%", "text-align": "left", border: "none", padding: "6px 12px", "border-radius": "6px", cursor: "pointer", "font-size": "15px",
                      background: activeChannelId() === channel.id ? "#1164a3" : "transparent",
                      color: activeChannelId() === channel.id ? "#ffffff" : "#bcabbc",
                    }}
                  >
                    # {channel.name}
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>
      </aside>

      {/* メインチャットエリア */}
      <main style={{ flex: 1, display: "flex", "flex-direction": "column", "background-color": "#ffffff" }}>
        <header style={{ padding: "16px 24px", "border-bottom": "1px solid #e2e2e2" }}>
          <h1 style={{ margin: 0, "font-size": "18px", "font-weight": "bold" }}># {activeChannel()?.name}</h1>
        </header>

        {/* メッセージ履歴 */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", "flex-direction": "column", gap: "20px" }}>
          <For each={filteredMessages()} fallback={<p style={{ color: "#868686" }}>まだメッセージはありません。</p>}>
            {(msg) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
                <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                  <span style={{ "font-weight": "bold", "font-size": "15px" }}>{msg.user}</span>
                  <span style={{ "font-size": "12px", color: "#868686" }}>12:00 PM</span>
                </div>
                <div style={{ "font-size": "15px", color: "#1d1c1d" }}>{msg.text}</div>
                
                <div style={{ display: "flex", gap: "12px", "margin-top": "2px" }}>
                  <button
                    onClick={() => setActiveThreadParentId(msg.id)}
                    style={{ background: "none", border: "none", color: "#1264a3", cursor: "pointer", padding: 0, "font-size": "13px" }}
                  >
                    💬 返信する
                  </button>
                  <Show when={getReplyCount(msg.id) > 0}>
                    <span style={{ "font-size": "13px", color: "#868686" }}>
                      {getReplyCount(msg.id)} 件の返信
                    </span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* メッセージ入力 */}
        <footer style={{ padding: "0 24px 24px 24px" }}>
          <form onSubmit={handleSendMainMessage} style={{ display: "flex", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden" }}>
            <input
              type="text"
              value={mainInputText()}
              onInput={(e) => setMainInputText(e.currentTarget.value)}
              placeholder={`#${activeChannel()?.name} へのメッセージ`}
              style={{ flex: 1, border: "none", padding: "12px", "font-size": "15px", outline: "none" }}
            />
            <button type="submit" disabled={!mainInputText().trim()} style={{ border: "none", padding: "0 16px", "font-weight": "bold", background: mainInputText().trim() ? "#007a5a" : "#e2e2e2", color: mainInputText().trim() ? "#ffffff" : "#868686" }}>送信</button>
          </form>
        </footer>
      </main>

      {/* 3. スレッドサイドパネル（インポートしたコンポーネントを使用） */}
      <Show when={activeThreadParentId() !== null}>
        <ThreadPanel 
          parentMessage={activeThreadParentMessage()}
          replies={filteredThreadMessages()}
          inputText={threadInputText()}
          onInputText={setThreadInputText}
          onSendMessage={handleSendThreadMessage}
          onClose={() => setActiveThreadParentId(null)}
        />
      </Show>

    </div>
  );
}
