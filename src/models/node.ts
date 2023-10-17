export interface Node {
    id: string;
    parent: string | null;
    name: string;
    children: Node[];
}
