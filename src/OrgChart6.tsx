import { For, createSignal, Show } from "solid-js";

type OrgNode = {
  id: string;
  name: string;
  role: string;
  level: number;
  children?: OrgNode[];
};

const orgData: OrgNode = {
  id: "1",
  name: "山田 太郎",
  role: "代表取締役社長",
  level: 1,
  children: [
    {
      id: "2",
      name: "鈴木 次郎",
      role: "開発部長",
      level: 2,
      children: [
        { id: "4", name: "佐藤 花子", role: "フロントエンド", level: 3 },
        { id: "5", name: "高橋 健", role: "バックエンド", level: 3 },
        { id: "20", name: "山本 厚", role: "バックエンド", level: 3 },
      ],
    },
    {
      id: "3",
      name: "田中 美咲",
      role: "営業部長",
      level: 2,
      children: [
        { id: "6", name: "渡辺 翔", role: "営業担当", level: 3 },
        { id: "7", name: "伊藤 淳", role: "新規開拓", level: 3 },
        { 
          id: "100", 
          name: "伊藤 カンナ", 
          role: "新規開拓", 
          level: 4 ,
          children: [
            { id: "104", name: "佐藤 花子", role: "フロントエンド", level: 3 },
            { id: "105", name: "高橋 健", role: "バックエンド", level: 3 },
            { id: "1020", name: "山本 厚", role: "バックエンド", level: 3 },
          ],
        },
      ],
    },
    {
      id: "8",
      name: "小林 誠",
      role: "サービス部長",
      level: 2,
      children: [
        { id: "9", name: "中村 恵", role: "カスタマーサポート", level: 3 },
        { id: "10", name: "加藤 浩", role: "テクニカルサポート", level: 3 },
      ],
    },
  ],
};

function OrgChartNode(props: { node: OrgNode }) {
  const hasChildren = () => props.node.children && props.node.children.length > 0;
  const [isOpen, setIsOpen] = createSignal(props.node.level === 2 ? false : true);

  return (
    <div class="org-node-container-top">
      {/* 役職・名前のカード */}
      <div 
        class="org-card-top" 
        classList={{ "has-children": hasChildren() }}
        onClick={() => hasChildren() && setIsOpen(!isOpen())}
      >
        <div class="org-card-body">
          <div class="org-role-top">{props.node.role}</div>
          <div class="org-name-top">
            {props.node.name}
            <Show when={hasChildren()}>
              <span class="org-toggle-icon">{isOpen() ? " −" : " +"}</span>
            </Show>
          </div>
        </div>
      </div>

      {/* 子要素展開 */}
      <Show when={hasChildren() && isOpen()}>
        <div class="org-line-right-top" />
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

        .org-node-container-top {
          display: flex;
          align-items: flex-start;
          position: relative;
        }

        .org-card-top {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          min-width: 170px;
          height: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: all 0.2s;
          z-index: 2;
          user-select: none;
        }
        
        .org-card-top.has-children {
          cursor: pointer;
          border-left: 4px solid #3b82f6;
        }
        .org-card-top.has-children:hover {
          transform: translateX(2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15);
          background: #fdfefe;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .org-toggle-icon {
          font-size: 12px;
          color: #94a3b8;
          font-weight: normal;
          margin-left: 8px;
        }

        /* 親カードから右へ伸びる横線 */
        .org-line-right-top {
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
          margin-top: 36px;
          flex-shrink: 0;
        }

        /* 【改善】子要素の縦並びコンテナ：コンテナ全体に縦線を1本通す（隙間をなくす） */
        .org-children-container-top {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 24px;
          gap: 16px;
        }
        .org-children-container-top::before {
          content: '';
          position: absolute;
          top: 36px;     /* 最初のカードの中央からスタート */
          bottom: 0;     /* 一旦コンテナの最下部まで1本で通す */
          left: 0;
          width: 2px;
          background-color: #cbd5e1;
          z-index: 1;
        }

        /* 各子ノードから左（親の方向）へ伸びる横線 */
        .org-children-container-top > .org-node-container-top::after {
          content: '';
          position: absolute;
          left: -24px;
          top: 36px;
          width: 24px;
          height: 2px;
          background-color: #cbd5e1;
          z-index: 1;
        }

        /* 【重要＆解決】最後の子ノードの「後ろ」に背景色と同じ色のマスクを配置 */
        /* これにより、最後の子ノードのカード中央より下にある縦線を綺麗に覆い隠します */
        .org-children-container-top > .org-node-container-top:last-child::before {
          content: '';
          position: absolute;
          left: -26px;             /* 縦線（left: 0）を覆う位置 */
          top: 38px;              /* カード中央の横線（36px）のすぐ下から */
          bottom: -16px;          /* コンテナのgap（16px）をはみ出してもカバーする領域まで */
          width: 4px;             /* 縦線（2px）より少し太くして確実に消す */
          background-color: #f8fafc; /* コンテナの背景色（.org-chart-wrapper-topと同じ色） */
          z-index: 2;             /* 縦線より上に配置 */
        }
      `}</style>

      {/* 組織図のレンダリング */}
      <div style={{ display: "flex", "align-items": "flex-start" }}>
        <OrgChartNode node={orgData} />
      </div>
    </div>
  );
}

