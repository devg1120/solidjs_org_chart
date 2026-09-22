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
    <div class="org-node-container">
      {/* 役職・名前のカード */}
      <div class="org-card">
        <div class="org-role">{props.node.role}</div>
        <div class="org-name">{props.node.name}</div>
      </div>

      <Show when={hasChildren()}>
        {/* 下に向かう縦線 */}
        <div class="org-line-down" />
        
        {/* 子要素を横並びにするコンテナ */}
        <div class="org-children-container">
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
    <div class="org-chart-wrapper">
      {/* 綺麗に見せるためのCSSスタイル定義 */}
      <style>{`
        .org-chart-wrapper {
          padding: 40px 20px;
          background-color: #f4f6f9;
          min-height: 100vh;
          font-family: sans-serif;
          overflow-x: auto;
        }
        
        /* 1つの塊を中央に配置 */
        .org-node-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        /* モダンなカードデザイン */
        .org-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 24px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e1e8ed;
          min-width: 150px;
          transition: transform 0.2s;
        }
        .org-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        .org-role {
          font-size: 11px;
          font-weight: 600;
          color: #4a90e2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .org-name {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
        }

        /* 親から下に向かう一本線 */
        .org-line-down {
          width: 2px;
          height: 24px;
          background-color: #cbd5e1;
        }

        /* 部下たちの横並びコンテナ */
        .org-children-container {
          display: flex;
          justify-content: center;
          position: relative;
          padding-top: 24px;
        }

        /* 【重要】部下コンテナの上部の横線（ベース） */
        .org-children-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #cbd5e1;
        }

        /* 【重要】各子ノードから上に向かう縦線 */
        .org-node-container::before {
          content: '';
          position: absolute;
          top: -24px;
          left: 50%;
          width: 2px;
          height: 24px;
          background-color: #cbd5e1;
          transform: translateX(-50%);
        }

        /* 【魔法のCSS】最初と最後の子要素の余分な横線を消す */
        .org-children-container > .org-node-container:first-child::after {
          content: '';
          position: absolute;
          top: -26px;
          left: 0;
          width: 50%;
          height: 4px;
          background-color: #f4f6f9; /* 背景色と同じ色で上書きして消す */
        }
        .org-children-container > .org-node-container:last-child::after {
          content: '';
          position: absolute;
          top: -26px;
          right: 0;
          width: 50%;
          height: 4px;
          background-color: #f4f6f9; /* 背景色と同じ色で上書きして消す */
        }

        /* 子要素が1つだけの場合は、上に向かう縦線だけでいいので横線を完全に隠す */
        .org-children-container > .org-node-container:only-child::after {
          width: 100%;
        }
        
        /* 最上階層（社長など）には上向きの線は不要 */
        .org-chart-wrapper > div > .org-node-container::before {
          display: none;
        }
      `}</style>

      {/* 組織図のレンダリング */}
      <div style={{ display: "flex", "justify-content": "center" }}>
        <OrgChartNode node={orgData} />
      </div>
    </div>
  );
}

