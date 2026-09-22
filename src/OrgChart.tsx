import { For, Show, createSignal } from 'solid-js';

// 組織データの型定義
interface OrganizationNode {
  id: string;
  name: string;
  role: string;
  children?: OrganizationNode[];
}

// サンプルデータ
const orgData: OrganizationNode = {
  id: '1',
  name: '山田 太郎',
  role: '代表取締役社長',
  children: [
    {
      id: '2',
      name: '鈴木 花子',
      role: '開発部 部長',
      children: [
        { id: '4', name: '佐藤 一郎', role: 'フロントエンド主任' },
        { id: '5', name: '高橋 恵', role: 'バックエンドエンジニア' },
      ],
    },
    {
      id: '3',
      name: '田中 次郎',
      role: '営業部 部長',
      children: [
        { id: '6', name: '渡辺 健', role: '営業担当' },
      ],
    },
  ],
};

// 組織の1ノードを表示する再帰コンポーネント
function OrgNode(props: { node: OrganizationNode }) {
  const [isOpen, setIsOpen] = createSignal(true);

  const hasChildren = () => !!props.node.children && props.node.children.length > 0;

  return (
    <div style={{ "margin-left": "20px", "border-left": "2px solid #ccc", "padding-left": "15px", "margin-top": "10px" }}>
      <div 
        style={{ 
          "background": "#f0f0f0", 
          "padding": "8px 12px", 
          "border-radius": "4px", 
          "display": "inline-block",
          "cursor": hasChildren() ? "pointer" : "default"
        }}
        onClick={() => hasChildren() && setIsOpen(!isOpen())}
      >
        <strong>{props.node.name}</strong> ({props.node.role})
        <Show when={hasChildren()}>
          <span style={{ "margin-left": "8px", "font-size": "12px" }}>
            {isOpen() ? '[-]' : '[+]'}
          </span>
        </Show>
      </div>

      <Show when={hasChildren() && isOpen()}>
        <div style={{ "margin-top": "5px" }}>
          <For each={props.node.children}>
            {(child) => <OrgNode node={child} />}
          </For>
        </div>
      </Show>
    </div>
  );
}

// メインの体制図コンポーネント
export default function OrgChart() {
  return (
    <div style={{ "padding": "20px", "font-family": "sans-serif" }}>
      <h2>組織体制図</h2>
      <OrgNode node={orgData} />
    </div>
  );
}

