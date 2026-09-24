import { createSignal, Show } from "solid-js";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ThreadPanel from "./ThreadPanel";

export default function App() {
  const [channels] = createSignal([
    { id: "general", name: "general" },
    { id: "random", name: "random" },
  ]);

  const [activeChannelId, setActiveChannelId] = createSignal("general");

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // メッセージデータの初期状態 (fileオブジェクト型に対応)
  const [messages, setMessages] = createSignal([
    { id: 1, channelId: "general", user: "Alice", text: "こんにちは！", reactions: { "👍": 2 }, hasReacted: ["👍"], time: "12:00 PM", file: null },
    { id: 2, channelId: "general", user: "Bob", text: "SolidJSのサンプルです。", reactions: {}, hasReacted: [], time: "12:01 PM", file: null },
  ]);

  const [threadMessages, setThreadMessages] = createSignal([]);
  const [activeThreadParentId, setActiveThreadParentId] = createSignal(null);
  
  const [threadInputText, setThreadInputText] = createSignal("");
  const [threadAttachedImage, setThreadAttachedImage] = createSignal(null);

  const activeChannel = () => channels().find(c => c.id === activeChannelId());
  const filteredMessages = () => messages().filter(m => m.channelId === activeChannelId());
  const activeThreadParentMessage = () => messages().find(m => m.id === activeThreadParentId());
  const filteredThreadMessages = () => threadMessages().filter(m => m.parentMessageId === activeThreadParentId());

  const handleChannelChange = (channelId) => {
    setActiveChannelId(channelId);
    setActiveThreadParentId(null);
  };

  // メインメッセージ送信 (ChatArea からのファイルオブジェクトを受け取る)
  const handleSendMainMessage = (text, fileObj) => {
    const newMessage = {
      id: Date.now(),
      channelId: activeChannelId(),
      user: "You",
      text: text,
      file: fileObj, // file.name, file.type, file.url を含むオブジェクトがそのまま入る
      reactions: {},
      hasReacted: [],
      time: getFormattedTime()
    };
    setMessages([...messages(), newMessage]);
  };

  const handleSendThreadMessage = (e) => {
    e.preventDefault();
    if (!threadInputText().trim() && !threadAttachedImage()) return;

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
