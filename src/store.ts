import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

export type OrgNode = {
  id: string; name: string; role: string; level: number; email?: string; bio?: string; children?: OrgNode[];
};

const initialOrgData: OrgNode = {
  id: "1", name: "山田 太郎", role: "代表取締役社長", level: 1, email: "t.yamada@example.com", bio: "全体の総括を担当。",
  children: [
    {
      id: "2", name: "鈴木 次郎", role: "開発部長", level: 2, email: "j.suzuki@example.com", bio: "開発マネジメント。",
      children: [
        { id: "4", name: "佐藤 花子", role: "フロントエンド", level: 3, email: "h.sato@example.com" },
        { id: "5", name: "高橋 健", role: "バックエンド", level: 3, email: "k.takahashi@example.com" },
      ],
    },
    {
      id: "3", name: "田中 美咲", role: "営業部長", level: 2, email: "m.tanaka@example.com", bio: "営業戦略立案。",
      children: [
        { id: "6", name: "渡辺 翔", role: "営業担当", level: 3 },
        { id: "8", name: "横山 合", role: "営業担当", level: 3 },
        { id: "9", name: "山口 完", role: "営業担当", level: 3 },
      ],
    },
  ],
};

// グローバル状態
export const [chart, setChart] = createStore<OrgNode>(initialOrgData);
export const [activeProfile, setActiveProfile] = createSignal<OrgNode | null>(null);
export const [isEditing, setIsEditing] = createSignal(false);
export const [isAddingChild, setIsAddingChild] = createSignal(false);

// 開閉状態を維持するSet
export const [expandedNodes, setExpandedNodes] = createSignal<Set<string>>(new Set(["1"]));

// ツリー検索ヘルパー
export const findStorePath = (node: any, targetId: string, currentPath: string[] = []): string[] | null => {
  if (node.id === targetId) return currentPath;
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const p = findStorePath(node.children[i], targetId, [...currentPath, "children", i.toString()]);
      if (p) return p;
    }
  }
  return null;
};

// 兄弟ノード情報の取得
export const getSiblingsInfo = (targetId: string) => {
  const path = findStorePath(chart, targetId);
  if (!path || path.length < 2) return { index: -1, total: 0, parentPath: [] };
  const parentPath = path.slice(0, -2);
  const parentObj = parentPath.reduce((obj, key) => obj[key], chart as any);
  return { index: parseInt(path[path.length - 1]), total: parentObj.children.length, parentPath };
};

