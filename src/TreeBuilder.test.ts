import { buildTree, getPath } from "./TreeBuilder";
import { RawNode, Node, TreeLevelOrderMode } from "./models";

describe("TreeBuilder", () => {
    describe("buildTree function", () => {
        it("should build a tree in ascending order", () => {
            const rawNodes: RawNode[] = [
                { id: "1", name: "C" },
                { id: "2", parent: "1", name: "A" },
                { id: "3", parent: "1", name: "B" },
            ];

            const expectedTree: Node[] = [
                {
                    id: "1",
                    name: "C",
                    children: [
                        { id: "2", parent: "1", name: "A", children: [] },
                        { id: "3", parent: "1", name: "B", children: [] },
                    ],
                },
            ];

            const result = buildTree(rawNodes, TreeLevelOrderMode.Asc);
            expect(result).toEqual(expectedTree);
        });

        it("should build a tree in descending order", () => {
            const rawNodes: RawNode[] = [
                { id: "1", name: "A" },
                { id: "2", parent: "1", name: "C" },
                { id: "3", parent: "1", name: "B" },
            ];

            const expectedTree: Node[] = [
                {
                    id: "1",
                    name: "A",
                    children: [
                        { id: "2", parent: "1", name: "C", children: [] },
                        { id: "3", parent: "1", name: "B", children: [] },
                    ],
                },
            ];

            const result = buildTree(rawNodes, TreeLevelOrderMode.Desc);
            expect(result).toEqual(expectedTree);
        });

        it("should build a tree with no sorting when TreeLevelOrderMode is None", () => {
            const rawNodes: RawNode[] = [
                { id: "1", name: "C" },
                { id: "2", parent: "1", name: "A" },
                { id: "3", parent: "1", name: "B" },
            ];

            const expectedTree: Node[] = [
                {
                    id: "1",
                    name: "C",
                    children: [
                        { id: "2", parent: "1", name: "A", children: [] },
                        { id: "3", parent: "1", name: "B", children: [] },
                    ],
                },
            ];

            const result = buildTree(rawNodes, TreeLevelOrderMode.Source);
            expect(result).toEqual(expectedTree);
        });

        it("should handle a tree with multiple root nodes", () => {
            const rawNodes: RawNode[] = [
                { id: "1", name: "C" },
                { id: "2", parent: "1", name: "A" },
                { id: "3", parent: "1", name: "B" },
                { id: "4", name: "X" },
                { id: "5", name: "Y" },
            ];

            const expectedTree: Node[] = [
                {
                    id: "1",
                    name: "C",
                    children: [
                        { id: "2", parent: "1", name: "A", children: [] },
                        { id: "3", parent: "1", name: "B", children: [] },
                    ],
                },
                { id: "4", name: "X", children: [] },
                { id: "5", name: "Y", children: [] },
            ];

            const result = buildTree(rawNodes, TreeLevelOrderMode.Source);
            expect(result).toEqual(expectedTree);
        });
    });

    describe('getPath function', () => {
        const sampleRawNodes: RawNode[] = [
            { id: 'A', name: 'Node A' },
            { id: 'B', parent: 'A', name: 'Node B' },
            { id: 'C', parent: 'B', name: 'Node C' },
            { id: 'D', parent: 'A', name: 'Node D' },
            { id: 'E', parent: 'B', name: 'Node E' },
        ];

        it('should return it self when the leaf node has no parent', () => {
            const leafNode = sampleRawNodes.find((node) => node.id === 'A') as RawNode;
            expect(getPath(sampleRawNodes, leafNode)).toEqual(['A']);
        });

        it('should return the correct path for a leaf node', () => {
            const leafNode = sampleRawNodes.find((node) => node.id === 'C') as RawNode;
            const expectedPath = ['A', 'B', 'C'];
            expect(getPath(sampleRawNodes, leafNode)).toEqual(expectedPath);
        });


        it('should handle multiple leaf nodes with the same ID by returning the path for the first occurrence', () => {
            const leafNode = sampleRawNodes.find((node) => node.id === 'E') as RawNode;
            const expectedPath = ['A', 'B', 'E'];
            expect(getPath(sampleRawNodes, leafNode)).toEqual(expectedPath);
        });

        it('should handle circular dependencies by not going into an infinite loop', () => {
            const circularNodes: RawNode[] = [
                { id: 'X', parent: 'Y', name: 'Node X' },
                { id: 'Y', parent: 'X', name: 'Node Y' },
            ];
            const leafNode = circularNodes.find((node) => node.id === 'X') as RawNode;
            expect(getPath(circularNodes, leafNode)).toEqual(['Y', 'X']);
        });
    });
});