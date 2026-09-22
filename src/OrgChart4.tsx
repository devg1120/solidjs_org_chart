import { For, Show } from "solid-js";

type OrgNode = {
  id: string;
  name: string;
  role: string;
  children?: OrgNode[];
};

const orgData: OrgNode = {
  id: "1",
  name: "山田 太郎",
  role: "代表取締役社長",
  children: [
    {
      id: "2",
      name: "鈴木 次郎",
      role: "開発部長",
      children: [
        { id: "4", name: "佐藤 花子", role: "フロントエンド" },
        { id: "5", name: "高橋 健", role: "バックエンド" },
      ],
    },
    {
      id: "3",
      name: "田中 美咲",
      role: "営業部長",
      children: [
        { id: "6", name: "渡辺 翔", role: "営業担当" },
        { id: "7", name: "伊藤 淳", role: "新規開拓" },
      ],
    },
  ],
};

function OrgChartNode(props: { node: OrgNode }) {
  const hasChildren = () => props.node.children && props.node.children.length > 0;

  return (
    <div class="org-node-container-top">
      {/* 役職・名前のカード */}
      <div class="org-card-top">
        <div class="org-role-top">{props.node.role}</div>
        <div class="org-name-top">{props.node.name}</div>
      </div>

      <Show when={hasChildren()}>
        {/* 右に向かう横線 */}
        <div class="org-line-right-top" />
        
        {/* 子要素を縦に並べるコンテナ */}
        <div class="org-children-container-top">
          <For each={props.node.children}>
            {(child) => <OrgChartNode node={child} />}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default function App() {
  return (
    <div class="org-chart-wrapper-top">
      <style>{`
        .org-chart-wrapper-top {
          padding: 40px;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: sans-serif;
          overflow-x: auto;
        }

        /* 【変更】align-items: flex-start で上詰めに配置 */
        .org-node-container-top {
          display: flex;
          align-items: flex-start;
          position: relative;
        }

        /* カードのスタイル（高さ固定にすると線がブレません） */
        .org-card-top {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          min-width: 160px;
          height: 46px; /* 線の位置固定のため高さを統一 */
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: transform 0.2s;
          z-index: 2;
        }
        .org-card-top:hover {
          transform: translateX(2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .org-role-top {
          font-size: 11px;
          font-weight: 600;
          color: #3b82f6;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .org-name-top {
          font-size: 14px;
          font-weight: bold;
          color: #1e293b;
        }

        /* 親カードの「中央」から右へ伸びる横線 (カードの高さ/2 = 35pxの位置) */
        .org-line-right-top {
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
          margin-top: 35px; 
          flex-shrink: 0;
        }

        /* 子要素の縦並びコンテナ */
        .org-children-container-top {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 24px;
          gap: 16px;
        }

        /* 部下コンテナの左側の縦線（最初のカードの中央から、最後のカードの中央まで） */
        .org-children-container-top::before {
          content: '';
          position: absolute;
          top: 35px;
          bottom: calc(100% - 35px); /* 最後のノードが基準になるため下側で調整 */
          left: 0;
          width: 2px;
          background-color: #cbd5e1;
        }

        /* 【変更】各子ノードの「左側」から伸びる横線（カードの中央に配置） */
        .org-node-container-top::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 35px;
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
        }

        /* 余分な縦線を背景色で消すためのロジックを上詰め用に最適化 */
        .org-children-container-top::after {
          content: '';
          position: absolute;
          top: 35px;
          bottom: 35px;
          left: 0;
          width: 2px;
          background-color: #cbd5e1;
          z-index: 1;
        }
        /* ベースの縦線を一度透明にし、必要な範囲だけafterで線を描画するアプローチに変更 */
        .org-children-container-top::before {
          display: none; 
        }

        /* 最上階層には左向きの線は不要 */
        .org-chart-wrapper-top > div > .org-node-container-top::before {
          display: none;
        }
      `}</style>

      {/* 組織図のレンダリング */}
      <div style={{ display: "flex", "align-items": "flex-start" }}>
        <OrgChartNode node={orgData} />
      </div>
    </div>
  );
}

