import { createSignal, For, Show, createEffect, onMount } from "solid-js";
import ReactionPicker from "./ReactionPicker";

export default function ChatArea(props) {
  const [inputText, setInputText] = createSignal("");
  const [attachedFile, setAttachedFile] = createSignal(null);
  let timelineRef;

  // 最下部へのスクロール関数
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

  // ファイルのタイプに応じて適切なアイコン(絵文字)を返すヘルパー
  const getFileIcon = (type, name) => {
    if (type.startsWith("image/")) return "📷";
    if (type === "application/pdf") return "📄";
    
    // Officeファイルは拡張子またはMIMEタイプで判定
    const ext = name.split('.').pop().toLowerCase();
    if (ext === "xlsx" || type.includes("sheet")) return "📗"; // Excel
    if (ext === "docx" || type.includes("document")) return "📘"; // Word
    if (ext === "pptx" || type.includes("presentation")) return "📙"; // PowerPoint
    return "📁"; // その他ファイル
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
      <header style={{ padding: "16px 24px", "border-bottom": "1px solid #e2e2e2" }}>
        <h1 style={{ margin: 0, "font-size": "18px", "font-weight": "bold" }}># {props.activeChannelName}</h1>
      </header>

      {/* メッセージ履歴 */}
      <div 
        ref={timelineRef}
        style={{ flex: 1, padding: "24px", "overflow-y": "scroll", display: "flex", "flex-direction": "column", gap: "20px", height: "0" }}
      >
        <For each={props.messages} fallback={<p style={{ color: "#868686" }}>まだメッセージはありません。</p>}>
          {(msg) => (
            <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
              <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                <span style={{ "font-weight": "bold", "font-size": "15px" }}>{msg.user}</span>
                <span style={{ "font-size": "12px", color: "#868686" }}>{msg.time}</span>
              </div>
              
              <Show when={msg.text}>
                <div style={{ "font-size": "15px", color: "#1d1c1d" }}>{msg.text}</div>
              </Show>

              {/* 添付ファイル表示領域 */}
              <Show when={msg.file}>
                <div style={{ "margin-top": "6px" }}>
                  <Show when={msg.file.type.startsWith("image/")}>
                    {/* 画像プレビュー */}
                    <img src={msg.file.url} alt="添付画像" style={{ "max-width": "300px", "max-height": "200px", "border-radius": "8px", border: "1px solid #e2e2e2", "object-fit": "contain" }} />
                  </Show>
                  
                  <Show when={!msg.file.type.startsWith("image/")}>
                    {/* ドキュメント各種（PDF, xlsx, docx, pptx）共通のSlack風カードUI */}
                    <a href={msg.file.url} download={msg.file.name} style={{
                      display: "flex", "align-items": "center", gap: "12px", padding: "12px",
                      background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "8px",
                      "max-width": "340px", "text-decoration": "none", color: "#1d1c1d"
                    }}>
                      <span style={{ "font-size": "28px" }}>{getFileIcon(msg.file.type, msg.file.name)}</span>
                      <div style={{ overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                        <div style={{ "font-weight": "bold", "font-size": "14px" }}>{msg.file.name}</div>
                        <div style={{ "font-size": "12px", color: "#868686" }}>クリックしてダウンロード</div>
                      </div>
                    </a>
                  </Show>
                </div>
              </Show>
              
              {/* リアクション */}
              <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", "align-items": "center", "margin-top": "4px" }}>
                <For each={Object.keys(msg.reactions || {})}>
                  {(emoji) => {
                    const count = () => msg.reactions[emoji];
                    const isSelfReacted = () => msg.hasReacted?.includes(emoji);
                    return (
                      <Show when={count() > 0}>
                        <button
                          onClick={() => props.onReact(msg.id, emoji)}
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
                <ReactionPicker onSelectEmoji={(emoji) => props.onReact(msg.id, emoji)} />
              </div>

              {/* スレッドトリガー */}
              <div style={{ display: "flex", gap: "12px", "margin-top": "4px" }}>
                <button
                  onClick={() => props.onOpenThread(msg.id)}
                  style={{ background: "none", border: "none", color: "#1264a3", cursor: "pointer", padding: 0, "font-size": "13px" }}
                >
                  💬 返信する
                </button>
                <Show when={props.getReplyCount(msg.id) > 0}>
                  <span style={{ "font-size": "13px", color: "#868686" }}>
                    {props.getReplyCount(msg.id)} 件の返信
                  </span>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* フッター入力フォーム */}
      <footer style={{ padding: "0 24px 24px 24px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", "flex-direction": "column", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden", background: "#ffffff" }}>
          
          {/* 送信前のファイル添付プレビュー */}
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

          <div style={{ display: "flex", "align-items": "center" }}>
            {/* クリップアイコンの accept 属性に各種 Office フォーマット用の MimeType / 拡張子を追加 */}
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
            <button type="submit" disabled={!canSend()} style={{ border: "none", padding: "0 16px", "height": "43px", "font-weight": "bold", background: canSend() ? "#007a5a" : "#e2e2e2", color: canSend() ? "#ffffff" : "#868686", cursor: canSend() ? "pointer" : "default" }}>送信</button>
          </div>
        </form>
      </footer>
    </main>
  );
}
