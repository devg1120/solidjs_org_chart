import { For, Show, onMount, createEffect, createSignal } from "solid-js";
import ReactionPicker from "./ReactionPicker";

// 🛠️ 個々の返信（スレッドメッセージ）行を管理するコンポーネント
function ReplyItem(props) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editText, setEditText] = createSignal(props.reply.text || "");

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText().trim()) return;
    props.onEditReply(props.reply.id, editText().trim());
    setIsEditing(false);
  };

  return (
    <div 
      class="reply-row"
      style={{ 
        display: "flex", 
        "flex-direction": "column", 
        gap: "4px",
        position: "relative",
        padding: "6px 12px",
        "margin-left": "-12px",
        "margin-right": "-12px",
        "border-radius": "6px",
        transition: "background 0.1s"
      }}
    >
      {/* 🛠️ 返信メッセージホバー時のアクションメニュー */}
      <div 
        class="action-menu"
        style={{
          position: "absolute", right: "12px", top: "-10px",
          background: "#ffffff", border: "1px solid #e2e2e2", "border-radius": "4px",
          "box-shadow": "0 2px 6px rgba(0,0,0,0.1)", display: "flex", "z-index": 10
        }}
      >
        <button 
          onClick={() => { setIsEditing(true); setEditText(props.reply.text || ""); }}
          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", "font-size": "12px", color: "#1d1c1d" }}
          onMouseOver={(e) => e.currentTarget.style.background = "#f8f8f8"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          ✏️ 編集
        </button>
        <button 
          onClick={() => { if(confirm("この返信を削除しますか？")) props.onDeleteReply(props.reply.id); }}
          style={{ background: "none", border: "none", padding: "4px 8px", cursor: "pointer", "font-size": "12px", color: "#e01e5a" }}
          onMouseOver={(e) => e.currentTarget.style.background = "#fff0f4"}
          onMouseOut={(e) => e.currentTarget.style.background = "none"}
        >
          🗑️ 削除
        </button>
      </div>

      {/* 返信者情報 */}
      <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
        <span style={{ "font-weight": "bold", "font-size": "14px" }}>{props.reply.user}</span>
        <span style={{ "font-size": "11px", color: "#868686" }}>{props.reply.time}</span>
        <Show when={props.reply.isEdited}>
          <span style={{ "font-size": "11px", color: "#868686" }}>(編集済み)</span>
        </Show>
      </div>
      
      {/* 通常テキスト vs 編集用フォーム */}
      <Show when={isEditing()} fallback={
        <Show when={props.reply.text}>
          <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{props.reply.text}</div>
        </Show>
      }>
        <form onSubmit={handleEditSubmit} style={{ display: "flex", gap: "6px", "margin-top": "2px" }}>
          <input 
            type="text" value={editText()} onInput={(e) => setEditText(e.currentTarget.value)}
            style={{ flex: 1, padding: "4px 8px", "border-radius": "4px", border: "1px solid #868686", "font-size": "13px", outline: "none" }}
          />
          <button type="submit" style={{ padding: "2px 8px", background: "#007a5a", color: "#ffffff", border: "none", "border-radius": "4px", cursor: "pointer", "font-weight": "bold", "font-size": "12px" }}>保存</button>
          <button type="button" onClick={() => setIsEditing(false)} style={{ padding: "2px 8px", background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "4px", cursor: "pointer", "font-size": "12px" }}>キャンセル</button>
        </form>
      </Show>

      {/* 返信内のファイル表示（画像・PDF・Office完全対応） */}
      <Show when={props.reply.file}>
        <div style={{ "margin-top": "4px" }}>
          <Show when={props.reply.file.type?.startsWith("image/")}>
            <img src={props.reply.file.url} alt="返信の添付画像" style={{ "max-width": "100%", "max-height": "140px", "border-radius": "4px", border: "1px solid #e2e2e2", "object-fit": "contain" }} />
          </Show>
          <Show when={!props.reply.file.type?.startsWith("image/")}>
            <a href={props.reply.file.url} download={props.reply.file.name} style={{
              display: "flex", "align-items": "center", gap: "8px", padding: "8px",
              background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "6px",
              "text-decoration": "none", color: "#1d1c1d"
            }}>
              <span style={{ "font-size": "20px" }}>{props.getFileIcon(props.reply.file.type, props.reply.file.name)}</span>
              <div style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "font-size": "12px", "font-weight": "bold" }}>
                {props.reply.file.name}
              </div>
            </a>
          </Show>
        </div>
      </Show>
      
      {/* リアクションボタン */}
      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", "align-items": "center", "margin-top": "4px" }}>
        <For each={Object.keys(props.reply.reactions || {})}>
          {(emoji) => {
            const count = () => props.reply.reactions[emoji];
            const isSelfReacted = () => props.reply.hasReacted?.includes(emoji);
            return (
              <Show when={count() > 0}>
                <button
                  onClick={() => props.onReactToThread(props.reply.id, emoji)}
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
        <ReactionPicker onSelectEmoji={(emoji) => props.onReactToThread(props.reply.id, emoji)} />
      </div>
    </div>
  );
}
// 🎛️ スレッドメインコンポーネント
export default function ThreadPanel(props) {
  let threadTimelineRef;

  const scrollThreadToBottom = () => {
    if (threadTimelineRef) {
      setTimeout(() => {
        threadTimelineRef.scrollTop = threadTimelineRef.scrollHeight;
      }, 30);
    }
  };

  onMount(() => scrollThreadToBottom());
  createEffect(() => {
    const _ = props.parentMessage?.id;
    scrollThreadToBottom();
  });

  // ファイルの種類に応じた絵文字判定ヘルパー
  const getFileIcon = (type, name) => {
    if (!type) return "📁";
    if (type.startsWith("image/")) return "📷";
    if (type === "application/pdf") return "📄";
    const ext = name?.split('.').pop().toLowerCase();
    if (ext === "xlsx" || type.includes("sheet")) return "📗";
    if (ext === "docx" || type.includes("document")) return "📘";
    if (ext === "pptx" || type.includes("presentation")) return "📙";
    return "📁";
  };
  
  // 🛠️ 画像以外も受け付けられるようにファイル変更処理をアップグレード
  const handleThreadFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    props.onAttachedFileChange({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file)
    });
  };

  const canSend = () => props.inputText.trim() || props.attachedFile;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!canSend()) return;

    props.onSendMessage(e);
    scrollThreadToBottom();
  };

  return (
    <div style={{ width: `${props.width}px`, "border-left": "none", "background-color": "#ffffff", display: "flex", "flex-direction": "column" }}>
      {/* 🛠️ CSSホバー処理の定義（スレッド返信内のホバーメニュー表示用） */}
      <style>{`
        .reply-row .action-menu { display: none; }
        .reply-row:hover { background-color: #f8f8f8; }
        .reply-row:hover .action-menu { display: flex; }
      `}</style>

      {/* ヘッダー */}
      <header style={{ padding: "16px", "border-bottom": "1px solid #e2e2e2", display: "flex", "justify-content": "space-between", "align-items": "center" }}>
        <span style={{ "font-weight": "bold", "font-size": "16px" }}>スレッド</span>
        <button onClick={props.onClose} style={{ background: "none", border: "none", "font-size": "18px", cursor: "pointer", color: "#868686" }}>✕</button>
      </header>

      {/* 返信一覧エリア */}
      <div ref={threadTimelineRef} style={{ flex: 1, padding: "16px", "overflow-y": "auto", display: "flex", "flex-direction": "column", gap: "16px", height: "0" }}>
        
        {/* 親メッセージ表示 */}
        <Show when={props.parentMessage}>
          <div style={{ padding: "12px", "background-color": "#f8f8f8", "border-radius": "6px", "border-left": "4px solid #4a154b" }}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "4px" }}>
              <div>
                <span style={{ "font-weight": "bold", "font-size": "14px" }}>{props.parentMessage.user}</span>
                <span style={{ "font-size": "11px", color: "#868686", "margin-left": "8px" }}>{props.parentMessage.time}</span>
              </div>
              <ReactionPicker onSelectEmoji={props.onReactToParent} />
            </div>
            <Show when={props.parentMessage.text}>
              <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{props.parentMessage.text}</div>
            </Show>
            {/* 親の添付ファイルカード表示 */}
            <Show when={props.parentMessage.file}>
              <div style={{ "margin-top": "6px" }}>
                <Show when={props.parentMessage.file.type?.startsWith("image/")}>
                  <img src={props.parentMessage.file.url} alt="親の添付画像" style={{ "max-width": "100%", "max-height": "140px", "border-radius": "4px", border: "1px solid #e2e2e2", "object-fit": "contain" }} />
                </Show>
                <Show when={!props.parentMessage.file.type?.startsWith("image/")}>
                  <a href={props.parentMessage.file.url} download={props.parentMessage.file.name} style={{
                    display: "flex", "align-items": "center", gap: "8px", padding: "8px",
                    background: "#ffffff", border: "1px solid #e2e2e2", "border-radius": "6px", "text-decoration": "none", color: "#1d1c1d"
                  }}>
                    <span style={{ "font-size": "20px" }}>{getFileIcon(props.parentMessage.file.type, props.parentMessage.file.name)}</span>
                    <div style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap", "font-size": "12px", "font-weight": "bold" }}>
                      {props.parentMessage.file.name}
                    </div>
                  </a>
                </Show>
              </div>
            </Show>
          </div>
        </Show>

        <hr style={{ border: "none", "border-top": "1px solid #e2e2e2", margin: "4px 0" }} />

        {/* 返信メッセージのループ */}
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px" }}>
          <For each={props.replies} fallback={<p style={{ color: "#868686", "font-size": "14px" }}>まだ返信はありません。</p>}>
            {(reply) => (
              <ReplyItem 
                reply={reply}
                getFileIcon={getFileIcon}
                onReactToThread={props.onReactToThread}
                onEditReply={props.onEditReply}
                onDeleteReply={props.onDeleteReply}
              />
            )}
          </For>
        </div>
      </div>

      {/* スレッド用入力フォーム */}
      <footer style={{ padding: "16px" }}>
        <form onSubmit={handleFormSubmit} style={{ display: "flex", "flex-direction": "column", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden", background: "#ffffff" }}>
          
          {/* 送信前ファイルプレビュー（Officeドキュメント・画像両対応） */}
          <Show when={props.attachedFile}>
            <div style={{ padding: "6px", "background-color": "#f8f8f8", "border-bottom": "1px solid #e2e2e2", display: "flex", "align-items": "center", gap: "6px" }}>
              <Show when={props.attachedFile.type?.startsWith("image/")} fallback={
                <span style={{ "font-size": "20px", padding: "0 4px" }}>{getFileIcon(props.attachedFile.type, props.attachedFile.name)}</span>
              }>
                <img src={props.attachedFile.url} style={{ width: "45px", height: "45px", "object-fit": "cover", "border-radius": "4px" }} />
              </Show>
              <div style={{ flex: 1, "font-size": "12px", "font-weight": "bold", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                {props.attachedFile.name}
              </div>
              <button type="button" onClick={() => props.onAttachedFileChange(null)} style={{ background: "#e2e2e2", border: "none", "border-radius": "50%", width: "18px", height: "18px", cursor: "pointer", "font-size": "10px" }}>✕</button>
            </div>
          </Show>

          <div style={{ display: "flex", "align-items": "center" }}>
            {/* 📎 クリップアイコンに変更、Officeファイルも全解放 */}
            <label style={{ padding: "10px", cursor: "pointer", "font-size": "16px", color: "#868686", "user-select": "none" }}>
              📎
              <input 
                type="file" 
                accept="image/*,application/pdf,.xlsx,.docx,.pptx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" 
                onChange={handleThreadFileChange} 
                style={{ display: "none" }} 
              />
            </label>
            <input type="text" value={props.inputText} onInput={(e) => props.onInputText(e.currentTarget.value)} placeholder="返信を入力..." style={{ flex: 1, border: "none", padding: "10px 4px", "font-size": "14px", outline: "none" }} />
            <button type="submit" disabled={!canSend()} style={{ border: "none", padding: "0 12px", "height": "38px", "font-weight": "bold", background: canSend() ? "#007a5a" : "#e2e2e2", color: canSend() ? "#ffffff" : "#868686", cursor: canSend() ? "pointer" : "default" }}>送信</button>
          </div>
        </form>
      </footer>
    </div>
  );
}
