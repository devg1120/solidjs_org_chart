import { createSignal, For, Show, createEffect, onMount } from "solid-js";
import ReactionPicker from "./ReactionPicker";

// 🛠️ 個々のメッセージ行を管理するコンポーネント（ホバーメニューと編集状態を持つ）
function MessageItem(props) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editText, setEditText] = createSignal(props.msg.text || "");

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText().trim()) return;
    props.onEdit(props.msg.id, editText().trim());
    setIsEditing(false);
  };

  return (
    <div 
      class="message-row"
      style={{ 
        display: "flex", 
        "flex-direction": "column", 
        gap: "4px",
        position: "relative",
        padding: "8px 12px",
        "margin-left": "-12px",
        "margin-right": "-12px",
        "border-radius": "8px",
        transition: "background 0.1s"
      }}
    >
      {/* 🛠️ マウスホバー時に右上にパッと浮き出るアクションメニュー */}
      <div 
        class="action-menu"
        style={{
          position: "absolute",
          right: "16px",
          top: "-12px",
          background: "#ffffff",
          border: "1px solid #e2e2e2",
          "border-radius": "6px",
          "box-shadow": "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          "z-index": 10
        }}
      >
        <button 
          onClick={() => { setIsEditing(true); setEditText(props.msg.text || ""); }}
          style={{ background: "none", border: "none", padding: "6px 10px", cursor: "pointer", "font-size": "13px", color: "#1d1c1d" }}
          onMouseOver={(e) => e.currentTarget.style.background = "#f8f8f8"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          ✏️ 編集
        </button>
        <button 
          onClick={() => { if(confirm("本当にこのメッセージを削除しますか？")) props.onDelete(props.msg.id); }}
          style={{ background: "none", border: "none", padding: "6px 10px", cursor: "pointer", "font-size": "13px", color: "#e01e5a" }}
          onMouseOver={(e) => e.currentTarget.style.background = "#fff0f4"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          🗑️ 削除
        </button>
      </div>

      {/* ユーザー名と送信時刻情報 */}
      <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
        <span style={{ "font-weight": "bold", "font-size": "15px" }}>{props.msg.user}</span>
        <span style={{ "font-size": "12px", color: "#868686" }}>{props.msg.time}</span>
        {/* 編集が行われた場合は横に表示 */}
        <Show when={props.msg.isEdited}>
          <span style={{ "font-size": "11px", color: "#868686" }}>(編集済み)</span>
        </Show>
      </div>
      
      {/* 🛠️ 通常のテキスト表示エリア vs 編集用入力フォームの切り替え */}
      <Show when={isEditing()} fallback={
        <Show when={props.msg.text}>
          <div style={{ "font-size": "15px", color: "#1d1c1d" }}>{props.msg.text}</div>
        </Show>
      }>
        <form onSubmit={handleEditSubmit} style={{ display: "flex", gap: "8px", "margin-top": "4px" }}>
          <input 
            type="text" 
            value={editText()} 
            onInput={(e) => setEditText(e.currentTarget.value)}
            style={{ flex: 1, padding: "6px 10px", "border-radius": "4px", border: "1px solid #868686", "font-size": "14px", outline: "none" }}
          />
          <button type="submit" style={{ padding: "4px 12px", background: "#007a5a", color: "#ffffff", border: "none", "border-radius": "4px", cursor: "pointer", "font-weight": "bold" }}>保存</button>
          <button type="button" onClick={() => setIsEditing(false)} style={{ padding: "4px 12px", background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "4px", cursor: "pointer" }}>キャンセル</button>
        </form>
      </Show>

      {/* 添付ファイルの描画 */}
      <Show when={props.msg.file}>
        <div style={{ "margin-top": "6px" }}>
          <Show when={props.msg.file.type.startsWith("image/")}>
            <img src={props.msg.file.url} alt="添付画像" style={{ "max-width": "300px", "max-height": "200px", "border-radius": "8px", border: "1px solid #e2e2e2", "object-fit": "contain" }} />
          </Show>
          
          <Show when={!props.msg.file.type.startsWith("image/")}>
            <a href={props.msg.file.url} download={props.msg.file.name} style={{
              display: "flex", "align-items": "center", gap: "12px", padding: "12px",
              background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "8px",
              "max-width": "340px", "text-decoration": "none", color: "#1d1c1d"
            }}>
              <span style={{ "font-size": "28px" }}>{props.getFileIcon(props.msg.file.type, props.msg.file.name)}</span>
              <div style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                <div style={{ "font-weight": "bold", "font-size": "14px" }}>{props.msg.file.name}</div>
                <div style={{ "font-size": "12px", color: "#868686" }}>クリックしてダウンロード</div>
              </div>
            </a>
          </Show>
        </div>
      </Show>
      
      {/* 絵文字リアクション表示領域 */}
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", "align-items": "center", "margin-top": "4px" }}>
        <For each={Object.keys(props.msg.reactions || {})}>
          {(emoji) => {
            const count = () => props.msg.reactions[emoji];
            const isSelfReacted = () => props.msg.hasReacted?.includes(emoji);
            return (
              <Show when={count() > 0}>
                <button
                  onClick={() => props.onReact(props.msg.id, emoji)}
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
        <ReactionPicker onSelectEmoji={(emoji) => props.onReact(props.msg.id, emoji)} />
      </div>

      {/* スレッド返信トリガー */}
      <div style={{ display: "flex", gap: "12px", "margin-top": "4px" }}>
        <button
          onClick={() => props.onOpenThread(props.msg.id)}
          style={{ background: "none", border: "none", color: "#1264a3", cursor: "pointer", padding: 0, "font-size": "13px" }}
        >
          💬 返信する
        </button>
        <Show when={props.getReplyCount(props.msg.id) > 0}>
          <span style={{ "font-size": "13px", color: "#868686" }}>
            {props.getReplyCount(props.msg.id)} 件の返信
          </span>
        </Show>
      </div>
    </div>
  );
}
// 🎛️ メインチャットコンポーネント本体
export default function ChatArea(props) {
  const [inputText, setInputText] = createSignal("");
  const [attachedFile, setAttachedFile] = createSignal(null);
  let timelineRef;

  // タイムラインを最下部に強制スクロールする関数
  const scrollToBottom = () => {
    if (timelineRef) {
      setTimeout(() => {
        timelineRef.scrollTop = timelineRef.scrollHeight;
      }, 30);
    }
  };

  onMount(() => scrollToBottom());
  createEffect(() => {
    const _ = props.activeChannelName;
    scrollToBottom();
  });

  const canSend = () => inputText().trim() || attachedFile();

  const getFileIcon = (type, name) => {
    if (type.startsWith("image/")) return "📷";
    if (type === "application/pdf") return "📄";
    const ext = name.split('.').pop().toLowerCase();
    if (ext === "xlsx" || type.includes("sheet")) return "📗";
    if (ext === "docx" || type.includes("document")) return "📘";
    if (ext === "pptx" || type.includes("presentation")) return "📙";
    return "📁";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAttachedFile({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend()) return;

    props.onSendMessage(inputText().trim(), attachedFile());
    
    setInputText("");
    setAttachedFile(null);
    scrollToBottom();
  };

  return (
    <main style={{ flex: 1, display: "flex", "flex-direction": "column", "background-color": "#ffffff" }}>
      {/* 🛠️ CSSホバー処理の定義（マウスホバー時のみメニューを表示） */}
      <style>{`
        .message-row .action-menu { display: none; }
        .message-row:hover { background-color: #f8f8f8; }
        .message-row:hover .action-menu { display: flex; }
      `}</style>

      <header style={{ padding: "16px 24px", "border-bottom": "1px solid #e2e2e2" }}>
        <h1 style={{ margin: 0, "font-size": "18px", "font-weight": "bold" }}># {props.activeChannelName}</h1>
      </header>

      {/* メッセージ履歴タイムライン */}
      <div 
        ref={timelineRef}
        style={{ flex: 1, padding: "24px", "overflow-y": "scroll", display: "flex", "flex-direction": "column", gap: "20px", height: "0" }}
      >
        <For each={props.messages} fallback={<p style={{ color: "#868686" }}>まだメッセージはありません。</p>}>
          {(msg) => (
            <MessageItem 
              msg={msg}
              getFileIcon={getFileIcon}
              onReact={props.onReact}
              onOpenThread={props.onOpenThread}
              getReplyCount={props.getReplyCount}
              onEdit={props.onEditMessage}
              onDelete={props.onDeleteMessage}
            />
          )}
        </For>
      </div>

      {/* フッター入力フォームエリア */}
      <footer style={{ padding: "0 24px 24px 24px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", "flex-direction": "column", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden", background: "#ffffff" }}>
          
          {/* 送信前の添付ファイルプレビュー */}
          <Show when={attachedFile()}>
            <div style={{ padding: "8px", "background-color": "#f8f8f8", "border-bottom": "1px solid #e2e2e2", display: "flex", "align-items": "center", gap: "8px" }}>
              <Show when={attachedFile().type.startsWith("image/")} fallback={
                <span style={{ "font-size": "24px", padding: "4px 8px" }}>
                  {getFileIcon(attachedFile().type, attachedFile().name)}
                </span>
              }>
                <img src={attachedFile().url} style={{ width: "60px", height: "60px", "object-fit": "cover", "border-radius": "4px" }} />
              </Show>
              <div style={{ flex: 1, "font-size": "13px", "font-weight": "bold", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                {attachedFile().name}
              </div>
              <button type="button" onClick={() => setAttachedFile(null)} style={{ background: "#e2e2e2", border: "none", "border-radius": "50%", width: "20px", height: "20px", cursor: "pointer", "font-size": "12px" }}>✕</button>
            </div>
          </Show>

          {/* コントロールボタンと文字入力欄 */}
          <div style={{ display: "flex", "align-items": "center" }}>
            <label style={{ padding: "12px", cursor: "pointer", "font-size": "18px", color: "#868686", "user-select": "none" }}>
              📎
              <input 
                type="file" 
                accept="image/*,application/pdf,.xlsx,.docx,.pptx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                onChange={handleFileChange} 
                style={{ display: "none" }} 
              />
            </label>

            <input
              type="text"
              value={inputText()}
              onInput={(e) => setInputText(e.currentTarget.value)}
              placeholder={`#${props.activeChannelName} へのメッセージ`}
              style={{ flex: 1, border: "none", padding: "12px 4px", "font-size": "15px", outline: "none" }}
            />
            <button 
              type="submit" 
              disabled={!canSend()} 
              style={{ 
                border: "none", 
                padding: "0 16px", 
                "height": "43px", 
                "font-weight": "bold", 
                background: canSend() ? "#007a5a" : "#e2e2e2", 
                color: canSend() ? "#ffffff" : "#868686", 
                cursor: canSend() ? "pointer" : "default" 
              }}
            >
              送信
            </button>
          </div>
        </form>
      </footer>
    </main>
  );
}
