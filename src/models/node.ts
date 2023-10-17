export interface Node {
    id: string;
    parent?: string;
    name: string;
    children?: Node[];
}
