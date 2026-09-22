import { For, createSignal, Show } from "solid-js";

type OrgNode = {
  id: string;
  name: string;
  role: string;
  level: number;
  email?: string;
  bio?: string;
  children?: OrgNode[];
};

const orgData: OrgNode = {
  id: "1",
  name: "山田 太郎",
  role: "代表取締役社長",
  level: 1,
  email: "t.yamada@example.com",
  bio: "会社の経営戦略と全体の総括を担当しています。趣味はゴルフです。",
  children: [
    {
      id: "2",
      name: "鈴木 次郎",
      role: "開発部長",
      level: 2,
      email: "j.suzuki@example.com",
      bio: "プロダクトの開発マネジメントと技術選定を行っています。",
      children: [
        { id: "4", name: "佐藤 花子", role: "フロントエンド", level: 3, email: "h.sato@example.com", bio: "UI/UXデザインとSolidJS開発が得意です。" },
        { id: "5", name: "高橋 健", role: "バックエンド", level: 3, email: "k.takahashi@example.com", bio: "Node.jsとGoを使ったAPI設計・インフラ構築を担当。" },
      ],
    },
    {
      id: "3",
      name: "田中 美咲",
      role: "営業部長",
      level: 2,
      email: "m.tanaka@example.com",
      bio: "新規クライアントの開拓と営業戦略の立案をリードしています。",
      children: [
        { id: "6", name: "渡辺 翔", role: "営業担当", level: 3, email: "s.watanabe@example.com", bio: "フットワークの軽さを活かした提案を心がけています。" },
        { id: "8", name: "横山 合", role: "営業担当", level: 3, email: "s.watanabe@example.com", bio: "フットワークの軽さを活かした提案を心がけています。" },
        { id: "9", name: "山口　完", role: "営業担当", level: 3, email: "s.watanabe@example.com", bio: "フットワークの軽さを活かした提案を心がけています。" },
      ],
    },
  ],
};

const [activeProfile, setActiveProfile] = createSignal<OrgNode | null>(null);

function OrgChartNode(props: { node: OrgNode }) {
  const hasChildren = () => props.node.children && props.node.children.length > 0;
  const [isOpen, setIsOpen] = createSignal(props.node.level === 2 ? false : true);

  return (
    <div class="org-node-container-top">
      {/* カード部分：classListでhas-childrenを判定し左縦線を表示 */}
      <div 
        class="org-card-top" 
        classList={{ "has-children": hasChildren() }}
        onClick={() => setActiveProfile(props.node)}
      >
        <div class="org-card-body">
          <div class="org-role-top">{props.node.role}</div>
          <div class="org-name-top">
            <span>{props.node.name}</span>
            
            <Show when={hasChildren()}>
              <button 
                class="org-toggle-btn"
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsOpen(!isOpen());
                }}
              >
                {isOpen() ? "−" : "+"}
              </button>
            </Show>
          </div>
        </div>
      </div>

      {/* 子要素への接続線と子コンテナ */}
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

function ProfileModal() {
  return (
    <Show when={activeProfile()}>
      {(profile) => (
        <div class="modal-overlay" onClick={() => setActiveProfile(null)}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <button class="modal-close-btn" onClick={() => setActiveProfile(null)}>×</button>
            
            <div class="modal-header">
              <div>
                <span class="modal-role">{profile().role}</span>
                <h3 class="modal-name">{profile().name}</h3>
              </div>
            </div>

            <div class="modal-body">
              <div class="info-group">
                <label>メールアドレス</label>
                <p>{profile().email || "未設定"}</p>
              </div>
              <div class="info-group">
                <label>自己紹介 / 担当業務</label>
                <p class="bio-text">{profile().bio || "未設定"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}

export default function App() {
  return (
    <div class="org-chart-wrapper-top">
      <style>{`
        .org-chart-wrapper-top { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: sans-serif; overflow-x: auto; }
        .org-node-container-top { display: flex; align-items: flex-start; position: relative; }
        
        /* 基本カード */
        .org-card-top { background: #ffffff; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; min-width: 180px; height: 52px; display: flex; flex-direction: column; justify-content: center; transition: all 0.2s; z-index: 2; user-select: none; cursor: pointer; }
        .org-card-top:hover { transform: translateX(2px); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.15); border-color: #3b82f6; }
        
        /* 子ノードがある場合の左縦線マーク */
        .org-card-top.has-children { border-left: 4px solid #3b82f6; }
        
        .org-role-top { font-size: 11px; font-weight: 600; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px; }
        .org-name-top { font-size: 14px; font-weight: bold; color: #1e293b; display: flex; justify-content: space-between; align-items: center; }

	/*
        .org-toggle-btn { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #64748b; padding: 0; }
        .org-toggle-btn:hover { background: #e2e8f0; color: #1e293b; }
        */
        .org-toggle-btn { background: #ffffff; border: 1px solid #ffffff; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; color: #64748b; padding: 0; }

        /* 接続線ロジック */
        .org-line-right-top { width: 24px; height: 2px; background-color: #cbd5e1; margin-top: 38px; flex-shrink: 0; }
        .org-children-container-top { display: flex; flex-direction: column; position: relative; padding-left: 24px; gap: 16px; }
        .org-children-container-top::before { content: ''; position: absolute; top: 38px; bottom: 0; left: 0; width: 2px; background-color: #cbd5e1; z-index: 1; }
        .org-children-container-top > .org-node-container-top::after { content: ''; position: absolute; left: -24px; top: 38px; width: 24px; height: 2px; background-color: #cbd5e1; z-index: 1; }
        .org-children-container-top > .org-node-container-top:last-child::before { content: ''; position: absolute; left: -26px; top: 40px; bottom: -16px; width: 4px; background-color: #f8fafc; z-index: 2; }

        /* モーダル */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-content { background: #ffffff; border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); position: relative; }
        .modal-close-btn { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; color: #94a3b8; cursor: pointer; }
        .modal-header { border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; }
        .modal-role { font-size: 12px; font-weight: 600; color: #3b82f6; }
        .modal-name { font-size: 20px; margin: 4px 0 0 0; color: #1e293b; }
        .info-group { margin-bottom: 16px; }
        .info-group label { font-size: 11px; font-weight: bold; color: #94a3b8; display: block; margin-bottom: 4px; }
        .info-group p { margin: 0; font-size: 14px; color: #334155; }
        .bio-text { line-height: 1.6; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #f1f5f9; }
      `}</style>

      <div style={{ display: "flex", "align-items": "flex-start" }}>
        <OrgChartNode node={orgData} />
      </div>

      <ProfileModal />
    </div>
  );
}

