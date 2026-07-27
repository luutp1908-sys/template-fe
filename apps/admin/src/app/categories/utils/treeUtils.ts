import { CategoryDTO } from '../api/dtos'

export interface FlattenedNode {
  id: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

export function flattenTree(
  roots: CategoryDTO[],
  byId: Record<string, CategoryDTO>,
  childrenByParent: Record<string | null, string[]>,
  expandedIds: string[]
): FlattenedNode[] {
  const out: FlattenedNode[] = [];
  const expandedSet = new Set(expandedIds || []);

  function walk(nodeId: string, depth: number) {
    const node = byId[nodeId];
    if (!node) return;
    const children = childrenByParent[nodeId] ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedSet.has(nodeId);
    out.push({ id: nodeId, depth, hasChildren, isExpanded });
    if (hasChildren && isExpanded) {
      for (const cid of children) walk(cid, depth + 1);
    }
  }

  for (const r of roots) {
    walk(r.id, 0);
  }

  return out;
}

export function collectDescendantIds(id: string, childrenByParent: Record<string | null, string[]>) {
  const out = new Set<string>();
  const stack = [...(childrenByParent[id] ?? [])];
  while (stack.length) {
    const cid = stack.shift()!;
    if (out.has(cid)) continue;
    out.add(cid);
    const children = childrenByParent[cid] ?? [];
    stack.push(...children);
  }
  return out;
}
