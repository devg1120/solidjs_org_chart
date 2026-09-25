import { createSignal, Show, onCleanup } from "solid-js";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ThreadPanel from "./ThreadPanel";

export default function App() {
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  const [activeChannelId, setActiveChannelId] = createSignal("general");

  // --- 🛠️ スレッド幅調整用のシグナルとロジック ---
  const [threadWidth, setThreadWidth] = createSignal(360); // 初期値 360px
  let isResizing = false;

  const startResize = (e) => {
    e.preventDefault();
    isResizing = true;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    // リサイズ中にテキスト選択されてしまうのを防ぐ
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    // 画面右端からの距離を計算してスレッドの幅を決定
    const newWidth = window.innerWidth - e.clientX;
    
    // 最小幅 280px、最大幅 600px の間で制限をかける
    if (newWidth >= 280 && newWidth <= 600) {
      setThreadWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizing = false;
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  // コンポーネント破棄時にイベントリスナーをクリーンアップ
  onCleanup(() => stopResize());
  // --------------------------------------------

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！", reactions: { "👍": 2 }, hasReacted: ["👍"], time: "12:00 PM", file: null },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。", reactions: {}, hasReacted: [], time: "12:01 PM", file: null },
  ]);

  const [threadMessages, setThreadMessages] = createSignal([]);
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);
  
  const [threadInputText, setThreadInputText] = createSignal("");
  const [threadAttachedFile, setThreadAttachedFile] = createSignal(null);

  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  const handleChannelChange = (channelId) => {
    setActiveChannelId(channelId);
    setActiveThreadParentId(null);
  };

  const handleSendMainMessage = (text, fileObj) => {
    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: text,
      file: fileObj,
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };
    setMessages([...messages(), newMessage]);
  };

  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if (!threadInputText().trim() && !threadAttachedFile()) return;

    const newReply = {
      id: Date.now(),
      parentMessageId: activeThreadParentId(),
      user: "You",
      text: threadInputText().trim(),
      file: threadAttachedFile(),
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };

    setThreadMessages([...threadMessages(), newReply]);
    setThreadInputText("");
    setThreadAttachedFile(null);
  };

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
      <Sidebar channels={channels()} activeChannelId={activeChannelId()} onChannelChange={handleChannelChange} />
      
      <ChatArea 
        activeChannelName={activeChannel()?.name}
        messages={filteredMessages()}
        onSendMessage={handleSendMainMessage}
        onReact={handleReactToMain}
        onOpenThread={setActiveThreadParentId}
        getReplyCount={getReplyCount}
      />

      {/* 🛠️ スレッドが開いている時だけリサイザーとパネルを表示 */}
      <Show when={activeThreadParentId() !== null}>
        {/* ドラッグ用の境界線（ディバイダー） */}
        <div
          onMouseDown={startResize}
          style={{
            width: "4px",
            cursor: "col-resize",
            background: "#e2e2e2",
            "z-index": 10,
            transition: "background 0.2s",
          }}
          // ホバーした時に少し濃くしてドラッグ可能であることを示す
          onMouseOver={(e) => e.currentTarget.style.background = "#1264a3"}
          onMouseOut={(e) => e.currentTarget.style.background = "#e2e2e2"}
        />

        <ThreadPanel 
          width={threadWidth()} // 🛠️ 計算された幅をPropsとして渡す
          parentMessage={activeThreadParentMessage()}
          replies={filteredThreadMessages()}
          inputText={threadInputText()}
          onInputText={setThreadInputText}
          attachedFile={threadAttachedFile()}
          onAttachedFileChange={setThreadAttachedFile}
          onSendMessage={handleSendThreadMessage}
          onReactToThread={handleReactToThread}
          onReactToParent={(emoji) => handleReactToMain(activeThreadParentId(), emoji)}
          onClose={() => setActiveThreadParentId(null)}
        />
      </Show>
    </div>
  );
}
