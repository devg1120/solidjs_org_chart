import { createSignal, For, Show } from "solid-js";
import Sidebar from "./Sidebar";
import ThreadPanel from "./ThreadPanel";
import ReactionPicker from "./ReactionPicker";

export default function App() {
  // 1. チャンネル一覧
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  // 2. 現在選択されているチャンネルID
  const [activeChannelId, setActiveChannelId] = createSignal("general");

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 3. メッセージデータ
  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！", reactions: { "👍": 2 }, hasReacted: ["👍"], time: "12:00 PM" },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。", reactions: {}, hasReacted: [], time: "12:01 PM" },
  ]);

  // 4. スレッド（返信）データ
  const [threadMessages, setThreadMessages] = createSignal([
    { id: 101, parentMessageId: 1, user: "Bob", text: "アリスさんこんにちは！", reactions: {}, hasReacted: [], time: "12:05 PM" },
  ]);

  // 5. 現在開いているスレッドの「親メッセージID」
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);

  // 6. 入力フォームの状態
  const [mainInputText, setMainInputText] = createSignal("");
  const [threadInputText, setThreadInputText] = createSignal("");

  // --- 派生シグナル ---
  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  const isMainEmpty = () => !mainInputText().trim();
  const isThreadEmpty = () => !threadInputText().trim();

  // チャンネルが切り替わった時にスレッドを閉じる処理
  const handleChannelChange = (channelId) => {
    setActiveChannelId(channelId);
    setActiveThreadParentId(null);
  };

  // メインメッセージ送信
  const handleSendMainMessage = (e) => {
    e.preventDefault();
    if (isMainEmpty()) return;

    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: mainInputText().trim(),
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };

    setMessages([...messages(), newMessage]);
    setMainInputText("");
  };

  // スレッドへの返信送信
  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if (isThreadEmpty() || !activeThreadParentId()) return;

    const newReply = {
      id: Date.now(),
      parentMessageId: activeThreadParentId(),
      user: "You",
      text: threadInputText().trim(),
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };

    setThreadMessages([...threadMessages(), newReply]);
    setThreadInputText("");
  };

  // メインメッセージのリアクション処理
  const handleReactToMain = (messageId, emoji) => {
    setMessages(messages().map(msg => {
      if (msg.id !== messageId) return msg;

      const alreadyReacted = msg.hasReacted?.includes(emoji);
      const currentCount = msg.reactions?.[emoji] || 0;
      const newCount = alreadyReacted ? currentCount - 1 : currentCount + 1;
      
      const updatedReactions = { ...msg.reactions, [emoji]: newCount };
      if (newCount === 0) delete updatedReactions[emoji];

      const updatedHasReacted = alreadyReacted
        ? msg.hasReacted.filter(e => e !== emoji)
        : [...(msg.hasReacted || []), emoji];

      return { ...msg, reactions: updatedReactions, hasReacted: updatedHasReacted };
    }));
  };

  // スレッドメッセージのリアクション処理
  const handleReactToThread = (replyId, emoji) => {
    setThreadMessages(threadMessages().map(reply => {
      if (reply.id !== replyId) return reply;

      const alreadyReacted = reply.hasReacted?.includes(emoji);
      const currentCount = reply.reactions?.[emoji] || 0;
      const newCount = alreadyReacted ? currentCount - 1 : currentCount + 1;

      const updatedReactions = { ...reply.reactions, [emoji]: newCount };
      if (newCount === 0) delete updatedReactions[emoji];

      const updatedHasReacted = alreadyReacted
        ? reply.hasReacted.filter(e => e !== emoji)
        : [...(reply.hasReacted || []), emoji];

      return { ...reply, reactions: updatedReactions, hasReacted: updatedHasReacted };
    }));
  };

  const getReplyCount = (messageId) => {
    return threadMessages().filter(m => m.parentMessageId === messageId).length;
  };

  return (
    <div style={{ display: "flex", height: "100vh", "font-family": "sans-serif", color: "#1d1c1d", overflow: "hidden" }}>
      
      {/* 1分割目: 分割したサイドバーコンポーネント */}
      <Sidebar 
        channels={channels()} 
        activeChannelId={activeChannelId()} 
        onChannelChange={handleChannelChange} 
      />

      {/* 2分割目: メインチャットエリア */}
      <main style={{ flex: 1, display: "flex", "flex-direction": "column", "background-color": "#ffffff" }}>
        <header style={{ padding: "16px 24px", "border-bottom": "1px solid #e2e2e2" }}>
          <h1 style={{ margin: 0, "font-size": "18px", "font-weight": "bold" }}># {activeChannel()?.name}</h1>
        </header>

        {/* メッセージ履歴タイムライン */}
        <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", "flex-direction": "column", gap: "20px" }}>
          <For each={filteredMessages()} fallback={<p style={{ color: "#868686" }}>まだメッセージはありません。</p>}>
            {(msg) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
                <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                  <span style={{ "font-weight": "bold", "font-size": "15px" }}>{msg.user}</span>
                  <span style={{ "font-size": "12px", color: "#868686" }}>{msg.time}</span>
                </div>
                <div style={{ "font-size": "15px", color: "#1d1c1d" }}>{msg.text}</div>
                
                {/* リアクション */}
                <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", "align-items": "center", "margin-top": "4px" }}>
                  <For each={Object.keys(msg.reactions || {})}>
                    {(emoji) => {
                      const count = () => msg.reactions[emoji];
                      const isSelfReacted = () => msg.hasReacted?.includes(emoji);
                      return (
                        <Show when={count() > 0}>
                          <button
                            onClick={() => handleReactToMain(msg.id, emoji)}
                            style={{
                              padding: "2px 6px", "font-size": "12px", "border-radius": "4px", cursor: "pointer",
                              border: isSelfReacted() ? "1px solid #1264a3" : "1px solid #e2e2e2", 
                              background: isSelfReacted() ? "#e8f3fa" : "#f8f8f8",
                              color: isSelfReacted() ? "#1264a3" : "#1d1c1d"
                            }}
                          >
                            {emoji} {count()}
                          </button>
                        </Show>
                      );
                    }}
                  </For>
                  
                  <ReactionPicker onSelectEmoji={(emoji) => handleReactToMain(msg.id, emoji)} />
                </div>

                {/* 返信・スレッドトリガー */}
                <div style={{ display: "flex", gap: "12px", "margin-top": "4px" }}>
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

        {/* メッセージ入力エリア */}
        <footer style={{ padding: "0 24px 24px 24px" }}>
          <form onSubmit={handleSendMainMessage} style={{ display: "flex", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden" }}>
            <input
              type="text"
              value={mainInputText()}
              onInput={(e) => setMainInputText(e.currentTarget.value)}
              placeholder={`#${activeChannel()?.name} へのメッセージ`}
              style={{ flex: 1, border: "none", padding: "12px", "font-size": "15px", outline: "none" }}
            />
            <button type="submit" disabled={isMainEmpty()} style={{ border: "none", padding: "0 16px", "font-weight": "bold", background: !isMainEmpty() ? "#007a5a" : "#e2e2e2", color: !isMainEmpty() ? "#ffffff" : "#868686" }}>送信</button>
          </form>
        </footer>
      </main>

      {/* スレッドサイドパネル */}
      <Show when={activeThreadParentId() !== null}>
        <ThreadPanel 
          parentMessage={activeThreadParentMessage()}
          replies={filteredThreadMessages()}
          inputText={threadInputText()}
          onInputText={setThreadInputText}
          onSendMessage={handleSendThreadMessage}
          onReactToThread={handleReactToThread}
          onReactToParent={(emoji) => handleReactToMain(activeThreadParentId(), emoji)}
          onClose={() => setActiveThreadParentId(null)}
        />
      </Show>

    </div>
  );
}
