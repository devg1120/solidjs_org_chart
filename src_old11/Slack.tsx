import { createSignal, Show, onCleanup } from "solid-js";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ThreadPanel from "./ThreadPanel";

export default function App() {
  // 初期チャンネルデータ
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  const [activeChannelId, setActiveChannelId] = createSignal("general");

  // --- 🛠️ ズレのない差分リサイズ用ロジック ---
  const [sidebarWidth, setSidebarWidth] = createSignal(240); // サイドバー初期幅
  const [threadWidth, setThreadWidth] = createSignal(360);   // スレッド初期幅
  const [resizeType, setResizeType] = createSignal(null);     // "sidebar" | "thread" | null

  // ドラッグ開始時のマウス位置と、その時の初期幅を記録する一時変数
  let startX = 0;
  let startWidth = 0;

  const startResize = (type) => (e) => {
    e.preventDefault();
    setResizeType(type);
    
    // 掴んだ瞬間のマウスのX座標と現在のパネル幅を記憶
    startX = e.clientX;
    if (type === "sidebar") {
      startWidth = sidebarWidth();
    } else if (type === "thread") {
      startWidth = threadWidth();
    }
    
    // イベントリスナーをドキュメント全体に登録
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
    
    // ドラッグ中のテキスト選択防止・カーソル固定
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  const handleResize = (e) => {
    const currentType = resizeType();
    if (!currentType) return;

    // 開始位置からのマウス移動距離を計算
    const deltaX = e.clientX - startX;

    if (currentType === "sidebar") {
      // サイドバーは右に引っ張ると広がる（プラス）
      const newWidth = startWidth + deltaX;
      if (newWidth >= 120 && newWidth <= 500) {
        setSidebarWidth(newWidth);
      }
    } else if (currentType === "thread") {
      // スレッドは左に引っ張ると広がる（マイナス）
      const newWidth = startWidth - deltaX;
      if (newWidth >= 200 && newWidth <= 600) {
        setThreadWidth(newWidth);
      }
    }
  };

  const stopResize = () => {
    setResizeType(null);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", stopResize);
    
    document.body.style.userSelect = "";
    document.body.style.webkitUserSelect = "";
    document.body.style.cursor = "";
  };

  onCleanup(() => stopResize());
  // --------------------------------------------

  // 時間フォーマット取得ヘルパー
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // メインチャットのメッセージデータ
  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！", reactions: { "👍": 2 }, hasReacted: ["👍"], time: "12:00 PM", file: null },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。", reactions: {}, hasReacted: [], time: "12:01 PM", file: null },
  ]);

  // スレッド（返信）のメッセージデータ
  const [threadMessages, setThreadMessages] = createSignal([]);
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);
  
  // スレッド用入力フォームの状態
  const [threadInputText, setThreadInputText] = createSignal("");
  const [threadAttachedFile, setThreadAttachedFile] = createSignal(null);

  // データ抽出用の派生シグナル（Selectors）
  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  // チャンネル切り替え
  const handleChannelChange = (channelId) => {
    setActiveChannelId(channelId);
    setActiveThreadParentId(null); // チャンネル移動時はスレッドを閉じる
  };

  // メインメッセージ送信（ChatAreaから fileObj を受け取る）
  const handleSendMainMessage = (text, fileObj) => {
    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: text,
      file: fileObj, // { name, type, url }
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };
    setMessages([...messages(), newMessage]);
  };

  // スレッドメッセージ送信
  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if (!threadInputText().trim() && !threadAttachedFile()) return;

    const newReply = {
      id: Date.now(),
      parentMessageId: activeThreadParentId(),
      user: "You",
      text: threadInputText().trim(),
      file: threadAttachedFile(), // 画像だけでなく全ファイル形式を共通オブジェクトで管理
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };

    setThreadMessages([...threadMessages(), newReply]);
    setThreadInputText("");
    setThreadAttachedFile(null);
  };

  // メインメッセージへの絵文字リアクション処理
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

  // スレッドメッセージへの絵文字リアクション処理
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

  // メッセージごとの返信数をカウント
  const getReplyCount = (messageId) => {
    return threadMessages().filter(m => m.parentMessageId === messageId).length;
  };

  // 🛠️ メインメッセージの編集処理
  const handleEditMessage = (messageId, newText) => {
    setMessages(messages().map(msg => 
      msg.id === messageId ? { ...msg, text: newText, isEdited: true } : msg
    ));
  };

  // 🛠️ メインメッセージの削除処理
  const handleDeleteMessage = (messageId) => {
    setMessages(messages().filter(msg => msg.id !== messageId));
    
    // もし削除されたメッセージのスレッドが現在右側に開いていた場合は自動で閉じる
    if (activeThreadParentId() === messageId) {
      setActiveThreadParentId(null);
    }
  };

  // 🛠️ スレッド（返信）メッセージの編集処理
  const handleEditReply = (replyId, newText) => {
    setThreadMessages(threadMessages().map(reply => 
      reply.id === replyId ? { ...reply, text: newText, isEdited: true } : reply
    ));
  };

  // 🛠️ スレッド（返信）メッセージの削除処理
  const handleDeleteReply = (replyId) => {
    setThreadMessages(threadMessages().filter(reply => reply.id !== replyId));
  };

  return (
    <div style={{ display: "flex", height: "100vh", "font-family": "sans-serif", color: "#1d1c1d", overflow: "hidden" }}>
      {/* 1. サイドバー（可変幅 props 伝達） */}
      <Sidebar width={sidebarWidth()} channels={channels()} activeChannelId={activeChannelId()} onChannelChange={handleChannelChange} />
      
      {/* 2. サイドバーとメインチャットの間のリサイザー */}
      <div
        onMouseDown={startResize("sidebar")}
        style={{
          width: "6px",
          cursor: "col-resize",
          background: "#e2e2e2",
          "z-index": 50,
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => e.currentTarget.style.background = "#1264a3"}
        onMouseOut={(e) => e.currentTarget.style.background = "#e2e2e2"}
      />

      {/* 3. メインチャットエリア */}
      <ChatArea 
        activeChannelName={activeChannel()?.name}
        messages={filteredMessages()}
        onSendMessage={handleSendMainMessage}
        onReact={handleReactToMain}
        onOpenThread={setActiveThreadParentId}
        getReplyCount={getReplyCount}
        onEditMessage={handleEditMessage}    
        onDeleteMessage={handleDeleteMessage}
      />

      {/* 4. スレッドパネル（開いている時のみリサイザーとパネルを表示） */}
      <Show when={activeThreadParentId() !== null}>
        <div
          onMouseDown={startResize("thread")}
          style={{
            width: "6px",
            cursor: "col-resize",
            background: "#e2e2e2",
            "z-index": 50,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#1264a3"}
          onMouseOut={(e) => e.currentTarget.style.background = "#e2e2e2"}
        />

        <ThreadPanel 
          width={threadWidth()}
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
          onEditReply={handleEditReply}  
          onDeleteReply={handleDeleteReply}
        />
      </Show>
    </div>
  );
}
