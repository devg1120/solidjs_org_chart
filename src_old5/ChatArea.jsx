import { createSignal, For, Show } from "solid-js";
import ReactionPicker from "./ReactionPicker";

export default function ChatArea(props) {
  const [inputText, setInputText] = createSignal("");
  const [attachedImage, setAttachedImage] = createSignal(null);

  const canSend = () => inputText().trim() || attachedImage();

  // 画像ファイル選択処理
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAttachedImage(URL.createObjectURL(file));
    }
  };

  // 送信イベントハンドラー
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSend()) return;

    // 親コンポーネント（App.jsx）にテキストと画像を渡す
    props.onSendMessage(inputText().trim(), attachedImage());
    
    // フォームクリア
    setInputText("");
    setAttachedImage(null);
  };

  return (
    <main style={{ flex: 1, display: "flex", "flex-direction": "column", "background-color": "#ffffff" }}>
      <header style={{ padding: "16px 24px", "border-bottom": "1px solid #e2e2e2" }}>
        <h1 style={{ margin: 0, "font-size": "18px", "font-weight": "bold" }}># {props.activeChannelName}</h1>
      </header>

      {/* メッセージタイムライン */}
      <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", "flex-direction": "column", gap: "20px" }}>
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

              <Show when={msg.image}>
                <div style={{ "margin-top": "6px" }}>
                  <img src={msg.image} alt="添付画像" style={{ "max-width": "300px", "max-height": "200px", "border-radius": "8px", border: "1px solid #e2e2e2", "object-fit": "contain" }} />
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

              {/* 返信ボタン */}
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
          
          {/* 画像添付時のプレビュー */}
          <Show when={attachedImage()}>
            <div style={{ padding: "8px", "background-color": "#f8f8f8", "border-bottom": "1px solid #e2e2e2", display: "flex", "align-items": "center", gap: "8px" }}>
              <img src={attachedImage()} style={{ width: "60px", height: "60px", "object-fit": "cover", "border-radius": "4px" }} />
              <button type="button" onClick={() => setAttachedImage(null)} style={{ background: "#e2e2e2", border: "none", "border-radius": "50%", width: "20px", height: "20px", cursor: "pointer", "font-size": "12px" }}>✕</button>
            </div>
          </Show>

          <div style={{ display: "flex", "align-items": "center" }}>
            <label style={{ padding: "12px", cursor: "pointer", "font-size": "18px", color: "#868686", "user-select": "none" }}>
              📷
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
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
