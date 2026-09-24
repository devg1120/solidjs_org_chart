import { createSignal } from "solid-js";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ThreadPanel from "./ThreadPanel";

export default function App() {
  // 1. チャンネル一覧
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  // 2. 現在選択されているチャンネルID
  const [activeChannelId, setActiveChannelId] = createSignal("general");

  // 現在の時刻文字列を取得
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // 3. メッセージデータ
  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！", reactions: { "👍": 2 }, hasReacted: ["👍"], time: "12:00 PM", image: null },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。", reactions: {}, hasReacted: [], time: "12:01 PM", image: null },
  ]);

  // 4. スレッド（返信）データ
  const [threadMessages, setThreadMessages] = createSignal([
    { id: 101, parentMessageId: 1, user: "Bob", text: "アリスさんこんにちは！", reactions: {}, hasReacted: [], time: "12:05 PM", image: null },
  ]);

  // 5. 現在開いているスレッドの「親メッセージID」
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);

  // 6. スレッド側フォームの状態管理
  const [threadInputText, setThreadInputText] = createSignal("");
  const [threadAttachedImage, setThreadAttachedImage] = createSignal(null);

  // --- 派生シグナル ---
  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  // チャンネル切り替え処理
  const handleChannelChange = (channelId) => {
    setActiveChannelId(channelId);
    setActiveThreadParentId(null);
  };

  // メインメッセージ送信
  const handleSendMainMessage = (text, imageURL) => {
    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: text,
      image: imageURL,
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };
    setMessages([...messages(), newMessage]);
  };

  // スレッド返信送信
  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if ((!threadInputText().trim() && !threadAttachedImage()) || !activeThreadParentId()) return;

    const newReply = {
      id: Date.now(),
      parentMessageId: activeThreadParentId(),
      user: "You",
      text: threadInputText().trim(),
      image: threadAttachedImage(),
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };

    setThreadMessages([...threadMessages(), newReply]);
    setThreadInputText("");
    setThreadAttachedImage(null);
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

  // メッセージごとの返信数を計算
  const getReplyCount = (messageId) => {
    return threadMessages().filter(m => m.parentMessageId === messageId).length;
  };

  return (
    <div style={{ display: "flex", height: "100vh", "font-family": "sans-serif", color: "#1d1c1d", overflow: "hidden" }}>
      
      {/* サイドバー */}
      <Sidebar 
        channels={channels()} 
        activeChannelId={activeChannelId()} 
        onChannelChange={handleChannelChange} 
      />

      {/* 新設：切り分けたメインチャットコンポーネント */}
      <ChatArea 
        activeChannelName={activeChannel()?.name}
        messages={filteredMessages()}
        onSendMessage={handleSendMainMessage}
        onReact={handleReactToMain}
        onOpenThread={setActiveThreadParentId}
        getReplyCount={getReplyCount}
      />

      {/* スレッドパネル */}
      <Show when={activeThreadParentId() !== null}>
        <ThreadPanel 
          parentMessage={activeThreadParentMessage()}
          replies={filteredThreadMessages()}
          inputText={threadInputText()}
          onInputText={setThreadInputText}
          attachedImage={threadAttachedImage()}
          onAttachedImageChange={setThreadAttachedImage}
          onSendMessage={handleSendThreadMessage}
          onReactToThread={handleReactToThread}
          onReactToParent={(emoji) => handleReactToMain(activeThreadParentId(), emoji)}
          onClose={() => setActiveThreadParentId(null)}
        />
      </Show>

    </div>
  );
}
