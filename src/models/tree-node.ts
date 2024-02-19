export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  disabled: boolean;
  link?: string;
}
