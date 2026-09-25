import { For } from "solid-js";

export default function Sidebar(props) {
  return (
    <aside style={{ 
      width: "240px", 
      "background-color": "#4a154b", 
      color: "#bcabbc", 
      padding: "16px", 
      "display": "flex", 
      "flex-direction": "column", 
      "gap": "20px" 
    }}>
      <h2 style={{ color: "#ffffff", "margin-top": 0, "font-size": "18px" }}>Workspace</h2>
      <div>
        <h3 style={{ "font-size": "12px", "margin-bottom": "8px", "text-transform": "uppercase", "color": "#bcabbc" }}>
          チャンネル
        </h3>
        <ul style={{ "list-style": "none", padding: 0, margin: 0, "display": "flex", "flex-direction": "column", gap: "4px" }}>
          <For each={props.channels}>
            {(channel) => (
              <li>
                <button
                  onClick={() => props.onChannelChange(channel.id)}
                  style={{
                    width: "100%", "text-align": "left", border: "none", padding: "6px 12px", "border-radius": "6px", cursor: "pointer", "font-size": "15px",
                    background: props.activeChannelId === channel.id ? "#1164a3" : "transparent",
                    color: props.activeChannelId === channel.id ? "#ffffff" : "#bcabbc",
                  }}
                >
                  # {channel.name}
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </aside>
  );
}
