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
    <div class="org-node-container-h">
      {/* 役職・名前のカード */}
      <div class="org-card-h">
        <div class="org-role-h">{props.node.role}</div>
        <div class="org-name-h">{props.node.name}</div>
      </div>

      <Show when={hasChildren()}>
        {/* 右に向かう横線 */}
        <div class="org-line-right-h" />
        
        {/* 子要素を縦に並べるコンテナ */}
        <div class="org-children-container-h">
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
    <div class="org-chart-wrapper-h">
      <style>{`
        .org-chart-wrapper-h {
          padding: 40px;
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: sans-serif;
          overflow-x: auto;
        }

        /* 親コンテナ：カードと子ノード群を横並び（X軸）にする */
        .org-node-container-h {
          display: flex;
          align-items: center;
          position: relative;
        }

        /* 横置き用カードデザイン */
        .org-card-h {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          min-width: 160px;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 2;
        }
        .org-card-h:hover {
          transform: translateX(2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .org-role-h {
          font-size: 11px;
          font-weight: 600;
          color: #10b981; /* 縦置きと変化をつけるためエメラルドグリーンに */
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .org-name-h {
          font-size: 14px;
          font-weight: bold;
          color: #1e293b;
        }

        /* 親カードから右（子ノードの集合）へ伸びる横線 */
        .org-line-right-h {
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
          flex-shrink: 0;
        }

        /* 子要素を縦（Y軸）に並べるコンテナ */
        .org-children-container-h {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          padding-left: 24px;
          gap: 16px; /* カード同士の縦の隙間 */
        }

        /* 部下コンテナの左側の縦線（ベース） */
        .org-children-container-h::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 2px;
          background-color: #cbd5e1;
        }

        /* 各子ノードから左（親の方向）に向かう横線 */
        .org-node-container-h::before {
          content: '';
          position: absolute;
          left: -24px;
          top: 50%;
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
          transform: translateY(-50%);
        }

        /* 一番上と一番下の子要素の余分な縦線を背景色で消す */
        .org-children-container-h > .org-node-container-h:first-child::after {
          content: '';
          position: absolute;
          left: -26px;
          top: 0;
          width: 4px;
          height: 50%;
          background-color: #f8fafc;
        }
        .org-children-container-h > .org-node-container-h:last-child::after {
          content: '';
          position: absolute;
          left: -26px;
          bottom: 0;
          width: 4px;
          height: 50%;
          background-color: #f8fafc;
        }

        /* 子要素が1つだけの場合は、左からの一本線だけでいいため、縦のベース線を隠す */
        .org-children-container-h > .org-node-container-h:only-child::after {
          height: 100%;
        }

        /* 最上階層（一番左の社長）には左向きの線は不要 */
        .org-chart-wrapper-h > div > .org-node-container-h::before {
          display: none;
        }
      `}</style>

      {/* 組織図のレンダリング */}
      <div style={{ display: "flex", "align-items": "center" }}>
        <OrgChartNode node={orgData} />
      </div>
    </div>
  );
}

