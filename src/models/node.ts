import { RawNode } from "./raw-node";

export interface Node extends RawNode {
    children: Node[];
}
