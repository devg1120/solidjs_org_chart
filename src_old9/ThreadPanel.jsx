import { For, Show, onMount, createEffect } from "solid-js";
import ReactionPicker from "./ReactionPicker";

export default function ThreadPanel(props) {
  let threadTimelineRef;

  // 🛠️ 確実なスクロール実行関数
  const scrollThreadToBottom = () => {
    if (threadTimelineRef) {
      setTimeout(() => {
        threadTimelineRef.scrollTop = threadTimelineRef.scrollHeight;
      }, 30);
    }
  };

  // スレッドパネルがパッと開いた瞬間
  onMount(() => {
    scrollThreadToBottom();
  });

  // 🛠️ 別のメッセージの「返信する」が押されて中身が変わった瞬間を検知してスクロール
  createEffect(() => {
    const _ = props.parentMessage?.id;
    scrollThreadToBottom();
  });
  
  const handleThreadFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      props.onAttachedImageChange(URL.createObjectURL(file));
    }
  };

  const canSend = () => props.inputText.trim() || props.attachedImage;

  // 送信イベントハンドラー
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!canSend()) return;

    props.onSendMessage(e); // 親のハンドラーを実行
    
    // 🛠️ 返信が送信された瞬間に強制スクロールを実行
    scrollThreadToBottom();
  };

  return (
      
  <div style={{ 
    width: `${props.width}px`, // 🛠️ 固定値から props.width に変更
    "border-left": "1px solid #e2e2e2", 
    "background-color": "#ffffff", 
    display: "flex", 
    "flex-direction": "column" 
  }}>

      {/* ヘッダー */}
      <header style={{ padding: "16px", "border-bottom": "1px solid #e2e2e2", display: "flex", "justify-content": "space-between", "align-items": "center" }}>
        <span style={{ "font-weight": "bold", "font-size": "16px" }}>スレッド</span>
        <button onClick={props.onClose} style={{ background: "none", border: "none", "font-size": "18px", cursor: "pointer", color: "#868686" }}>✕</button>
      </header>

      {/* 返信一覧スクロールエリア */}
      <div 
        ref={threadTimelineRef}
        style={{ flex: 1, padding: "16px", "overflow-y": "auto", display: "flex", "flex-direction": "column", gap: "16px", height: "0" }}
      >
        {/* 親メッセージ */}
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

            <Show when={props.parentMessage.image}>
              <div style={{ "margin-top": "6px" }}>
                <img src={props.parentMessage.image} alt="親の添付画像" style={{ "max-width": "100%", "max-height": "140px", "border-radius": "4px", border: "1px solid #e2e2e2" }} />
              </div>
            </Show>
            
            <div style={{ display: "flex", "flex-wrap": "wrap", gap: "4px", "margin-top": "6px" }}>
              <For each={Object.keys(props.parentMessage.reactions || {})}>
                {(emoji) => {
                  const count = () => props.parentMessage.reactions[emoji];
                  const isSelfReacted = () => props.parentMessage.hasReacted?.includes(emoji);
                  return (
                    <Show when={count() > 0}>
                      <span style={{
                        padding: "1px 5px", "font-size": "11px", "border-radius": "4px",
                        border: isSelfReacted() ? "1px solid #1264a3" : "1px solid #e2e2e2",
                        background: isSelfReacted() ? "#e8f3fa" : "#f8f8f8",
                        color: isSelfReacted() ? "#1264a3" : "#1d1c1d"
                      }}>
                        {emoji} {count()}
                      </span>
                    </Show>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>

        <hr style={{ border: "none", "border-top": "1px solid #e2e2e2", margin: "4px 0" }} />

        {/* 返信メッセージのループ */}
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px" }}>
          <For each={props.replies} fallback={<p style={{ color: "#868686", "font-size": "14px" }}>まだ返信はありません。</p>}>
            {(reply) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
                <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                  <span style={{ "font-weight": "bold", "font-size": "14px" }}>{reply.user}</span>
                  <span style={{ "font-size": "11px", color: "#868686" }}>{reply.time}</span>
                </div>
                
                <Show when={reply.text}>
                  <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{reply.text}</div>
                </Show>

                <Show when={reply.image}>
                  <div style={{ "margin-top": "4px" }}>
                    <img src={reply.image} alt="返信の添付画像" style={{ "max-width": "100%", "max-height": "140px", "border-radius": "4px", border: "1px solid #e2e2e2" }} />
                  </div>
                </Show>
                
                <div style={{ display: "flex", "flex-wrap": "wrap", gap: "6px", "align-items": "center", "margin-top": "4px" }}>
                  <For each={Object.keys(reply.reactions || {})}>
                    {(emoji) => {
                      const count = () => reply.reactions[emoji];
                      const isSelfReacted = () => reply.hasReacted?.includes(emoji);
                      return (
                        <Show when={count() > 0}>
                          <button
                            onClick={() => props.onReactToThread(reply.id, emoji)}
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
                  <ReactionPicker onSelectEmoji={(emoji) => props.onReactToThread(reply.id, emoji)} />
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* スレッド用入力フォーム */}
      <footer style={{ padding: "16px" }}>
        <form onSubmit={handleFormSubmit} style={{ display: "flex", "flex-direction": "column", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden", background: "#ffffff" }}>
          
          <Show when={props.attachedImage}>
            <div style={{ padding: "6px", "background-color": "#f8f8f8", "border-bottom": "1px solid #e2e2e2", display: "flex", "align-items": "center", gap: "6px" }}>
              <img src={props.attachedImage} style={{ width: "45px", height: "45px", "object-fit": "cover", "border-radius": "4px" }} />
              <button type="button" onClick={() => props.onAttachedImageChange(null)} style={{ background: "#e2e2e2", border: "none", "border-radius": "50%", width: "18px", height: "18px", cursor: "pointer", "font-size": "10px" }}>✕</button>
            </div>
          </Show>

          <div style={{ display: "flex", "align-items": "center" }}>
            <label style={{ padding: "10px", cursor: "pointer", "font-size": "16px", color: "#868686", "user-select": "none" }}>
              📷
              <input type="file" accept="image/*" onChange={handleThreadFileChange} style={{ display: "none" }} />
            </label>
            <input
              type="text"
              value={props.inputText}
              onInput={(e) => props.onInputText(e.currentTarget.value)}
              placeholder="返信を入力..."
              style={{ flex: 1, border: "none", padding: "10px 4px", "font-size": "14px", outline: "none" }}
            />
            <button type="submit" disabled={!canSend()} style={{ border: "none", padding: "0 12px", "height": "38px", "font-weight": "bold", background: canSend() ? "#007a5a" : "#e2e2e2", color: canSend() ? "#ffffff" : "#868686", cursor: canSend() ? "pointer" : "default" }}>送信</button>
          </div>
        </form>
      </footer>

    </div>
  );
}
