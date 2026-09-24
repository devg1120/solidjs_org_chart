import { For, Show } from "solid-js";
import ReactionPicker from "./ReactionPicker";

export default function ThreadPanel(props) {
  return (
    <div style={{ width: "360px", "border-left": "1px solid #e2e2e2", "background-color": "#ffffff", display: "flex", "flex-direction": "column" }}>
      
      {/* ヘッダー */}
      <header style={{ padding: "16px", "border-bottom": "1px solid #e2e2e2", display: "flex", "justify-content": "space-between", "align-items": "center" }}>
        <span style={{ "font-weight": "bold", "font-size": "16px" }}>スレッド</span>
        <button onClick={props.onClose} style={{ background: "none", border: "none", "font-size": "18px", cursor: "pointer", color: "#868686" }}>✕</button>
      </header>

      {/* スレッドスクロールエリア */}
      <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", "flex-direction": "column", gap: "16px" }}>
        
        {/* 親メッセージ */}
        <Show when={props.parentMessage}>
          <div style={{ padding: "12px", "background-color": "#f8f8f8", "border-radius": "6px", "border-left": "4px solid #4a154b" }}>
            <div style={{ display: "flex", "justify-content": "space-between", "align-items": "flex-start", "margin-bottom": "4px" }}>
              <div>
                <span style={{ "font-weight": "bold", "font-size": "14px" }}>{props.parentMessage.user}</span>
                <span style={{ "font-size": "11px", color: "#868686", "margin-left": "8px" }}>{props.parentMessage.time}</span>
              </div>
              {/* スレッド内の親メッセージにもリアクションピッカーを配置 */}
              <ReactionPicker onSelectEmoji={props.onReactToParent} />
            </div>
            <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{props.parentMessage.text}</div>
            
            {/* 親メッセージに付いているリアクション一覧 */}
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

        {/* 返信一覧 */}
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px" }}>
          <For each={props.replies} fallback={<p style={{ color: "#868686", "font-size": "14px" }}>まだ返信はありません。</p>}>
            {(reply) => (
              <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
                <div style={{ display: "flex", "align-items": "baseline", gap: "8px" }}>
                  <span style={{ "font-weight": "bold", "font-size": "14px" }}>{reply.user}</span>
                  <span style={{ "font-size": "11px", color: "#868686" }}>{reply.time}</span>
                </div>
                <div style={{ "font-size": "14px", color: "#1d1c1d" }}>{reply.text}</div>
                
                {/* リアクション表示＆ピッカー */}
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

      {/* 入力フォーム */}
      <footer style={{ padding: "16px" }}>
        <form onSubmit={props.onSendMessage} style={{ display: "flex", border: "1px solid #868686", "border-radius": "8px", overflow: "hidden" }}>
          <input
            type="text"
            value={props.inputText}
            onInput={(e) => props.onInputText(e.currentTarget.value)}
            placeholder="返信を入力..."
            style={{ flex: 1, border: "none", padding: "10px", "font-size": "14px", outline: "none" }}
          />
          <button type="submit" disabled={!props.inputText.trim()} style={{ border: "none", padding: "0 12px", "font-weight": "bold", background: props.inputText.trim() ? "#007a5a" : "#e2e2e2", color: props.inputText.trim() ? "#ffffff" : "#868686" }}>送信</button>
        </form>
      </footer>

    </div>
  );
}
