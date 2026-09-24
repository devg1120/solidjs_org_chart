import { createSignal, For, Show, onMount, onCleanup } from "solid-js";

export default function ReactionPicker(props) {
  const [isOpen, setIsOpen] = createSignal(false);
  let menuRef;

  // メニューの外側がクリックされたときにポップアップを閉じる
  const handleOutsideClick = (e) => {
    if (menuRef && !menuRef.contains(e.target)) {
      setIsOpen(false);
    }
  };

  // ライフサイクル管理（マウント時にイベントリスナーを安全に登録）
  onMount(() => {
    document.addEventListener("click", handleOutsideClick);
    
    onCleanup(() => {
      document.removeEventListener("click", handleOutsideClick);
    });
  });

  const emojis = ["👍", "❤️", "🚀", "👏", "🎉", "👀", "🔥"];

  return (
    <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen());
        }}
        style={{
          background: "#f8f8f8", border: "1px solid #e2e2e2", "border-radius": "4px",
          padding: "2px 8px", "font-size": "12px", cursor: "pointer", color: "#555"
        }}
      >
        ➕
      </button>

      {/* 絵文字ポップアップのポップオーバー表示 */}
      <Show when={isOpen()}>
        <div style={{
          position: "absolute", bottom: "100%", left: "0", "margin-bottom": "4px",
          background: "#ffffff", border: "1px solid #e2e2e2", "border-radius": "8px",
          padding: "8px", "box-shadow": "0 4px 12px rgba(0,0,0,0.15)",
          display: "flex", gap: "6px", "z-index": 100, "white-space": "nowrap"
        }}>
          <For each={emojis}>
            {(emoji) => (
              <button
                onClick={() => {
                  props.onSelectEmoji(emoji);
                  setIsOpen(false);
                }}
                style={{
                  background: "none", border: "none", "font-size": "18px",
                  cursor: "pointer", padding: "4px", "border-radius": "4px",
                  transition: "background 0.1s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "#f0f0f0"}
                onMouseOut={(e) => e.currentTarget.style.background = "none"}
              >
                {emoji}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
