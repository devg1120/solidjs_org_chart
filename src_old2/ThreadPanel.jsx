import { For, Show } from "solid-js";

export default function ThreadPanel(props) {
  return (
    <div style={{ width: "360px", "border-left": "1px solid #e2e2e2", "background-color": "#ffffff", display: "flex", "flex-direction": "column" }}>
      
      {/* スレッドヘッダー */}
      <header style={{ padding: "16px", "border-bottom": "1px solid #e2e2e2", display: "flex", "justify-content": "space-between", "align-items": "center" }}>
        <span style={{ "font-weight": "bold", "font-size": "16px" }}>スレッド</span>
        <button onClick={props.onClose} style={{ background: "none", border: "none", "font-size": "18px", cursor: "pointer", color: "#868686" }}>✕</button>
      </header>

      {/* スレッド内スクロールエリア */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", "flex-direction": "column", gap: "16px" }}>
        
        {/* 親メッセージの表示 */}
        <Show when={props.parentMessage}>
          <div style={{ padding: "12px", "background-color": "#f8f8f8", "border-radius": "6px", "border-left": "4px solid #4a154b" }}>
            <div style={{ "font-weight": "bold", "font-size": "14px", "margin-bottom": "4px" }}>{props.parentMessage.user}</div>
            <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{props.parentMessage.text}</div>
          </div>
        </Show>

        <hr style={{ border: "none", "border-top": "1px solid #e2e2e2", margin: "4px 0" }} />

        {/* 返信メッセージ一覧 */}
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px" }}>
          <For each={props.replies} fallback={<p style={{ color: "#868686", "font-size": "14px" }}>まだ返信はありません。</p>}>
            {(reply) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
                <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                  <span style={{ "font-weight": "bold", "font-size": "14px" }}>{reply.user}</span>
                  <span style={{ "font-size": "11px", color: "#868686" }}>12:05 PM</span>
                </div>
                <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{reply.text}</div>
                
                {/* スレッド内メッセージのリアクションボタン */}
                <div style={{ display: "flex", gap: "6px", "margin-top": "4px" }}>
                  <For each={["👍", "❤️", "🚀"]}>
                    {(emoji) => {
                      const count = () => reply.reactions?.[emoji] || 0;
                      return (
                        <button
                          onClick={() => props.onReactToThread(reply.id, emoji)}
                          style={{
                            padding: "2px 6px", "font-size": "12px", "border-radius": "4px", cursor: "pointer",
                            border: count() > 0 ? "1px solid #1d9bd1" : "1px solid #e2e2e2",
                            background: count() > 0 ? "#eaf5fa" : "#f8f8f8"
                          }}
                        >
                          {emoji} {count() > 0 ? count() : ""}
                        </button>
                      );
                    }}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* スレッド用入力フォーム */}
      <footer style={{ padding: "16px" }}>
        <form onSubmit={props.onSendMessage} style={{ display: "flex", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden" }}>
          <input
            type="text"
            value={props.inputText}
            onInput={(e) => props.onInputText(e.currentTarget.value)}
            placeholder="返信を入力..."
            style={{ flex: 1, border: "none", padding: "10px", "font-size": "14px", outline: "none" }}
          />
          <button 
            type="submit" 
            disabled={!props.inputText.trim()} 
            style={{ border: "none", padding: "0 12px", "font-weight": "bold", background: props.inputText.trim() ? "#007a5a" : "#e2e2e2", color: props.inputText.trim() ? "#ffffff" : "#868686" }}
          >
            送信
          </button>
        </form>
      </footer>

    </div>
  );
}
