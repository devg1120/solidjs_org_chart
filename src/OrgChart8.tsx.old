import { For, createSignal, Show } from "solid-js";

// 1. データ型定義
type OrgNode = {
  id: string;
  name: string;
  role: string;
  level: number;
  email?: string;
  bio?: string;
  children?: OrgNode[];
};

// 2. 提供いただいたベースデータ
const initialOrgData: OrgNode = {
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

// 3. アプリケーションのグローバル状態 (State)
const [chartData, setChartData] = createSignal<OrgNode>(initialOrgData);
const [activeProfile, setActiveProfile] = createSignal<OrgNode | null>(null);
const [isEditing, setIsEditing] = createSignal(false);
const [isAddingChild, setIsAddingChild] = createSignal(false);

// 4. データ操作ロジック (Mutations - 再帰関数群)

// A. 情報の書き換え
const updateNodeInTree = (node: OrgNode, id: string, updated: Partial<OrgNode>): OrgNode => {
  if (node.id === id) return { ...node, ...updated };
  if (node.children) {
    return { ...node, children: node.children.map(c => updateNodeInTree(c, id, updated)) };
  }
  return node;
};

// B. 子要素（部下）の追加
const addChildToTree = (node: OrgNode, parentId: string, newChild: OrgNode): OrgNode => {
  if (node.id === parentId) {
    return { ...node, children: [...(node.children || []), newChild] };
  }
  if (node.children) {
    return { ...node, children: node.children.map(c => addChildToTree(c, parentId, newChild)) };
  }
  return node;
};

// C. 上下の順序変更
const moveNodeOrderInTree = (node: OrgNode, targetId: string, direction: "up" | "down"): OrgNode => {
  if (node.children) {
    const idx = node.children.findIndex(c => c.id === targetId);
    if (idx !== -1) {
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx >= 0 && newIdx < node.children.length) {
        const nextChildren = [...node.children];
        const [moved] = nextChildren.splice(idx, 1);
        nextChildren.splice(newIdx, 0, moved);
        return { ...node, children: nextChildren };
      }
      return node;
    }
    return { ...node, children: node.children.map(c => moveNodeOrderInTree(c, targetId, direction)) };
  }
  return node;
};

// D. ノードの削除
const removeNodeFromTree = (node: OrgNode, targetId: string): OrgNode | null => {
  if (node.id === targetId) return null; // ルートノードのセーフティ
  if (node.children) {
    return {
      ...node,
      children: node.children
        .map(c => removeNodeFromTree(c, targetId))
        .filter((c): c is OrgNode => c !== null)
    };
  }
  return node;
};

// E. 兄弟内での現在位置と総数を特定するヘルパー
const getSiblingPosition = (node: OrgNode, id: string): { index: number; total: number } => {
  let res = { index: -1, total: 0 };
  const find = (n: OrgNode) => {
    if (n.children) {
      const idx = n.children.findIndex(c => c.id === id);
      if (idx !== -1) { res = { index: idx, total: n.children.length }; return; }
      n.children.forEach(find);
    }
  };
  find(node);
  return res;
};

// 5. 組織図の階層レンダーコンポーネント
function OrgChartNode(props: { node: OrgNode }) {
  const hasChildren = () => props.node.children && props.node.children.length > 0;
  const [isOpen, setIsOpen] = createSignal(props.node.level === 2 ? false : true);

  return (
    <div class="org-node-container-top">
      <div 
        class="org-card-top" 
        classList={{ "has-children": hasChildren() }}
        onClick={() => { setActiveProfile(props.node); setIsEditing(false); setIsAddingChild(false); }}
      >
        <div class="org-card-body">
          <div class="org-role-top">{props.node.role}</div>
          <div class="org-name-top">
            <span>{props.node.name}</span>
            <Show when={hasChildren()}>
              <button 
                class="org-toggle-btn"
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen()); }}
              >
                {isOpen() ? "−" : "+"}
              </button>
            </Show>
          </div>
        </div>
      </div>

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
// 6. 追加・編集・移動・削除フォームを内蔵したモーダルコンポーネント
function ProfileModal() {
  const [editName, setEditName] = createSignal("");
  const [editRole, setEditRole] = createSignal("");
  const [editEmail, setEditEmail] = createSignal("");
  const [editBio, setEditBio] = createSignal("");

  const initForm = (node: OrgNode) => {
    setEditName(node.name); setEditRole(node.role); setEditEmail(node.email || ""); setEditBio(node.bio || "");
  };

  const handleSave = (id: string) => {
    const updated = updateNodeInTree(chartData(), id, { name: editName(), role: editRole(), email: editEmail(), bio: editBio() });
    setChartData(updated);
    setActiveProfile({ ...activeProfile()!, name: editName(), role: editRole(), email: editEmail(), bio: editBio() });
    setIsEditing(false);
  };

  const handleAddChild = (parentId: string) => {
    const newChild: OrgNode = {
      id: "n_" + Date.now(),
      name: editName() || "新規メンバー",
      role: editRole() || "役職未定",
      level: activeProfile()!.level + 1,
      email: editEmail(),
      bio: editBio(),
    };
    setChartData(addChildToTree(chartData(), parentId, newChild));
    setIsAddingChild(false); setActiveProfile(null);
  };

  const handleMove = (id: string, dir: "up" | "down") => {
    setChartData(moveNodeOrderInTree(chartData(), id, dir));
    setActiveProfile(null);
  };

  const handleDelete = (id: string) => {
    if (id === "1") return alert("社長は削除できません。");
    if (confirm("このメンバーと配下組織を削除しますか？")) {
      const updated = removeNodeFromTree(chartData(), id);
      if (updated) setChartData(updated);
      setActiveProfile(null);
    }
  };

  return (
    <Show when={activeProfile()}>
      {(profile) => {
        if (!isEditing() && !isAddingChild() && editName() !== profile().name) initForm(profile());
        const pos = () => getSiblingPosition(chartData(), profile().id);
        
        return (
          <div class="modal-overlay" onClick={() => setActiveProfile(null)}>
            <div class="modal-content" onClick={(e) => e.stopPropagation()}>
              <button class="modal-close-btn" onClick={() => setActiveProfile(null)}>×</button>
              
              <Show when={!isEditing() && !isAddingChild()}>
                {/* 閲覧ビュー */}
                <div class="modal-header">
                  <span class="modal-role">{profile().role}</span>
                  <h3 class="modal-name">{profile().name}</h3>
                </div>
                <div class="modal-body">
                  <div class="info-group"><label>メールアドレス</label><p>{profile().email || "未設定"}</p></div>
                  <div class="info-group"><label>担当業務</label><p class="bio-text">{profile().bio || "未設定"}</p></div>
                  
                  {/* 並び替え（兄弟がいる場合） */}
                  <Show when={pos().total > 1}>
                    <div class="info-group">
                      <label>表示順変更</label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button class="btn-secondary" style={{ flex: 1 }} disabled={pos().index === 0} onClick={() => handleMove(profile().id, "up")}>▲ 上へ</button>
                        <button class="btn-secondary" style={{ flex: 1 }} disabled={pos().index === pos().total - 1} onClick={() => handleMove(profile().id, "down")}>▼ 下へ</button>
                      </div>
                    </div>
                  </Show>

                  <div class="btn-row" style={{ "justify-content": "space-between", "margin-top": "20px" }}>
                    <Show when={profile().id !== "1"}>
                      <button class="btn-danger" onClick={() => handleDelete(profile().id)}>削除</button>
                    </Show>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button class="btn-secondary" onClick={() => setIsEditing(true)}>編集</button>
                      <button class="btn-primary" onClick={() => { setEditName(""); setEditRole(""); setEditEmail(""); setEditBio(""); setIsAddingChild(true); }}>部下追加</button>
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={isEditing() || isAddingChild()}>
                {/* フォーム入力ビュー */}
                <div class="modal-header"><h3>{isEditing() ? "情報編集" : "部下追加"}</h3></div>
                <div class="modal-body">
                  <div class="input-group"><label>名前</label><input value={editName()} onInput={(e) => setEditName(e.currentTarget.value)} /></div>
                  <div class="input-group"><label>役職</label><input value={editRole()} onInput={(e) => setEditRole(e.currentTarget.value)} /></div>
                  <div class="input-group"><label>メール</label><input value={editEmail()} onInput={(e) => setEditEmail(e.currentTarget.value)} /></div>
                  <div class="input-group"><label>業務内容</label><textarea value={editBio()} onInput={(e) => setEditBio(e.currentTarget.value)} /></div>
                  <div class="btn-row">
                    <button class="btn-secondary" onClick={() => { setIsEditing(false); setIsAddingChild(false); }}>取消</button>
                    <button class="btn-primary" onClick={() => isEditing() ? handleSave(profile().id) : handleAddChild(profile().id)}>確定</button>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        );
      }}
    </Show>
  );
}

// 7. エントリポイント
export default function OrgChart8() {
  return (
    <div class="org-chart-wrapper-top">
      <style>{`
        .org-chart-wrapper-top { padding: 40px; background-color: #f8fafc; min-height: 100vh; font-family: sans-serif; overflow-x: auto; }
        .org-node-container-top { display: flex; align-items: flex-start; position: relative; }
        .org-card-top { background: #ffffff; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; min-width: 180px; height: 52px; display: flex; flex-direction: column; justify-content: center; transition: all 0.2s; z-index: 2; user-select: none; cursor: pointer; }
        .org-card-top:hover { transform: translateX(2px); box-shadow: 0 6px 16px rgba(59,130,246,0.15); border-color: #3b82f6; }
        .org-card-top.has-children { border-left: 4px solid #3b82f6; }
        .org-role-top { font-size: 11px; font-weight: 600; color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 2px; }
        .org-name-top { font-size: 14px; font-weight: bold; color: #1e293b; display: flex; justify-content: space-between; align-items: center; }
        .org-toggle-btn { background: #fff; border: 1px solid #fff; border-radius: 4px; width: 20px; height: 20px; cursor: pointer; color: #64748b; }
        
        /* 罫線 */
        .org-line-right-top { width: 24px; height: 2px; background-color: #cbd5e1; margin-top: 38px; flex-shrink: 0; }
        .org-children-container-top { display: flex; flex-direction: column; position: relative; padding-left: 24px; gap: 16px; }
        .org-children-container-top::before { content: ''; position: absolute; top: 38px; bottom: 0; left: 0; width: 2px; background-color: #cbd5e1; z-index: 1; }
        .org-children-container-top > .org-node-container-top::after { content: ''; position: absolute; left: -24px; top: 38px; width: 24px; height: 2px; background-color: #cbd5e1; z-index: 1; }
        .org-children-container-top > .org-node-container-top:last-child::before { content: ''; position: absolute; left: -26px; top: 40px; bottom: -16px; width: 4px; background-color: #f8fafc; z-index: 2; }

        /* モーダルUI */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(15,23,42,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .modal-content { background: #ffffff; border-radius: 16px; padding: 24px; width: 100%; max-width: 360px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); position: relative; }
        .modal-close-btn { position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; }
        .modal-header { border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 12px; }
        .modal-role { font-size: 11px; font-weight: 600; color: #3b82f6; display: block; }
        .modal-name { font-size: 18px; margin: 2px 0 0 0; color: #1e293b; }
        .info-group, .input-group { margin-bottom: 12px; }
        .info-group label, .input-group label { font-size: 11px; font-weight: bold; color: #94a3b8; display: block; margin-bottom: 2px; }
        .info-group p { margin: 0; font-size: 13px; color: #334155; }
        .bio-text { line-height: 1.5; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #f1f5f9; }
        .input-group input, .input-group textarea { width: 100%; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; box-sizing: border-box; }
        .input-group textarea { height: 60px; resize: none; }
        .btn-row { display: flex; gap: 8px; margin-top: 16px; }
        .btn-primary, .btn-secondary, .btn-danger { padding: 6px 14px; font-size: 12px; font-weight: bold; border-radius: 6px; cursor: pointer; border: none; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: #e2e8f0; color: #334155; }
        .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-danger { background: #ef4444; color: white; }
      `}</style>

      <div style={{ display: "flex", "align-items": "flex-start" }}>
        <OrgChartNode node={chartData()} />
      </div>

      <ProfileModal />
    </div>
  );
}

