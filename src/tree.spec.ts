import { RawNode, TreeLevelOrderMode } from './types';
import { Tree } from 'tree';

describe('Tree', () => {
  describe('Constructor', () => {
    const rawNodes: RawNode[] = [
      { id: '1', name: 'Node 1', parent: undefined, disabled: false },
      { id: '2', name: 'Node 2', parent: '1', disabled: false },
      { id: '3', name: 'Node 3', parent: '1', disabled: false },
      { id: '4', name: 'Node 4', parent: '2', disabled: false },
      { id: '5', name: 'Node 5', parent: undefined, disabled: false },
    ];

    it('should build the tree in ascending order by default', () => {
      const tree = new Tree([...rawNodes], TreeLevelOrderMode.Asc);
      const result = tree.value();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 1');
      expect(result[1].name).toBe('Node 5');
    });

    it('should build the tree in descending order when specified', () => {
      const tree = new Tree([...rawNodes], TreeLevelOrderMode.Desc);
      const result = tree.value();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 5');
      expect(result[1].name).toBe('Node 1');
    });
    it('should build the tree in provided order', () => {
      const tree = new Tree([...rawNodes], TreeLevelOrderMode.Source);
      const result = tree.value();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 1');
      expect(result[1].name).toBe('Node 5');
    });

    it('should handle empty rawNodes array', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      const result = tree.value();

      expect(result.length).toBe(0);
    });

    it('should handle rawNodes with missing parent references', () => {
      const nodesWithMissingParent: RawNode[] = [
        { id: '1', name: 'Node 1', parent: undefined, disabled: false },
        { id: '2', name: 'Node 2', parent: '3', disabled: false }, // Parent "3" does not exist
      ];
      const t = () => {
        new Tree(nodesWithMissingParent, TreeLevelOrderMode.Asc);
      };

      expect(t).toThrow('Parent not found for id 2 parent 3');
    });
  });

  describe('Constructor with sorting', () => {
    const rawNodes: RawNode[] = [
      { id: '1', name: 'B', parent: undefined, disabled: false },
      { id: '2', name: 'A', parent: undefined, disabled: false },
      { id: '3', name: 'C', parent: undefined, disabled: false },
    ];

    it('should preserve source order when TreeLevelOrderMode.Source is specified', () => {
      const tree = new Tree(rawNodes, TreeLevelOrderMode.Source);
      const result = tree.value();
      expect(result.map(node => node.name)).toEqual(['B', 'A', 'C']);
    });
  });

  describe('sorting', () => {
    it('should preserve source order when TreeLevelOrderMode.Source is specified', () => {
      const nodes: RawNode[] = [
        { id: '1', name: 'B', disabled: false },
        { id: '2', name: 'A', disabled: false },
        { id: '3', name: 'C', disabled: false }
      ];
      const tree = new Tree(nodes, TreeLevelOrderMode.Source);
      const result = tree.value();
      // With Source mode, order should match input array exactly
      expect(result[0].name).toBe('B');
      expect(result[1].name).toBe('A');
      expect(result[2].name).toBe('C');
    });

    it('should sort nodes in ascending order', () => {
      const nodes: RawNode[] = [
        { id: '1', name: 'B', disabled: false },
        { id: '2', name: 'A', disabled: false },
        { id: '3', name: 'C', disabled: false }
      ];
      const tree = new Tree(nodes, TreeLevelOrderMode.Asc);
      const result = tree.value();
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
      expect(result[2].name).toBe('C');
    });

    it('should sort nodes in descending order', () => {
      const nodes: RawNode[] = [
        { id: '1', name: 'B', disabled: false },
        { id: '2', name: 'A', disabled: false },
        { id: '3', name: 'C', disabled: false }
      ];
      const tree = new Tree(nodes, TreeLevelOrderMode.Desc);
      const result = tree.value();
      expect(result[0].name).toBe('C');
      expect(result[1].name).toBe('B');
      expect(result[2].name).toBe('A');
    });
  });

  describe('getNodeIdsForDepth', () => {
    it('should return an array of expanded node IDs up to a specified depth', () => {
      const tree = new Tree(
        [
          { id: '1', name: 'n1', parent: undefined, disabled: false },
          { id: '2', name: 'n2', parent: '1', disabled: false },
          { id: '3', name: 'n3', parent: '1', disabled: false },
          { id: '4', name: 'n4', parent: undefined, disabled: false },
          { id: '5', name: 'n5', parent: '4', disabled: false },
          { id: '6', name: 'n6', parent: '5', disabled: false },
          { id: '7', name: 'n7', parent: '6', disabled: false },
        ],
        TreeLevelOrderMode.Asc
      );

      const result = tree.listNodeIdsByDepth(2);
      expect(result).toEqual(['1', '4', '5']);
    });

    it('should handle an empty tree', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      const result = tree.listNodeIdsByDepth(2);
      expect(result).toEqual([]);
    });

    it('should throw an error when max depth is negative', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      expect(() => tree.listNodeIdsByDepth(-1)).toThrow('maxDepth should be positive number');
    });

    it('should throw an error when max depth undefined', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      expect(() => tree.listNodeIdsByDepth(undefined as any as number)).toThrow(
        'maxDepth should be positive number'
      );
    });
  });

  describe('getPath function', () => {
    const sampleRawNodes: RawNode[] = [
      { id: 'A', name: 'Node A', disabled: false },
      { id: 'B', parent: 'A', name: 'Node B', disabled: false },
      { id: 'C', parent: 'B', name: 'Node C', disabled: false },
      { id: 'D', parent: 'A', name: 'Node D', disabled: false },
      { id: 'E', parent: 'B', name: 'Node E', disabled: false },
    ];
    const tree = new Tree(sampleRawNodes, TreeLevelOrderMode.Asc);

    it('should return it self when the leaf node has no parent', () => {
      expect(tree.path('A')).toEqual(['A']);
    });

    it('should return the correct path for a leaf node', () => {
      const expectedPath = ['A', 'B', 'C'];
      expect(tree.path('C')).toEqual(expectedPath);
    });

    it('should handle multiple leaf nodes with the same ID by returning the path for the first occurrence', () => {
      const expectedPath = ['A', 'B', 'E'];
      expect(tree.path('E')).toEqual(expectedPath);
    });
  });

  describe('findAll', () => {
    const sampleRawNodes: RawNode[] = [
      { id: 'A', name: 'Node A', disabled: false },
      { id: 'B', parent: 'A', name: 'Node B', disabled: false },
      { id: 'C', parent: 'B', name: 'Node C', disabled: false },
      { id: 'D', parent: 'A', name: 'Node D', disabled: false },
      { id: 'E', parent: 'B', name: 'Node E', disabled: false },
    ];

    it('should find nodes that match search term', () => {
      const tree = new Tree(sampleRawNodes, TreeLevelOrderMode.Asc);
      const result = tree.findAll('Node');
      expect(result).toHaveLength(1); // Root node A with its matching children
      expect(result[0].children).toHaveLength(2); // B and D under A
    });

    it('should find nodes with case-insensitive search', () => {
      const tree = new Tree(sampleRawNodes, TreeLevelOrderMode.Asc);
      const result = tree.findAll('node');
      expect(result).toHaveLength(1);
      expect(result[0].children).toHaveLength(2);
    });

    it('should return empty array when no matches found', () => {
      const tree = new Tree(sampleRawNodes, TreeLevelOrderMode.Asc);
      const result = tree.findAll('XYZ');
      expect(result).toHaveLength(0);
    });

    it('should include parent nodes of matching children', () => {
      const sampleRawNodes: RawNode[] = [
        { id: 'A', name: 'Node A', disabled: false },
        { id: 'B', parent: 'A', name: 'Node B', disabled: false },
        { id: 'E', parent: 'B', name: 'Node E', disabled: false }, // Move E before C
        { id: 'C', parent: 'B', name: 'Node C', disabled: false },
        { id: 'D', parent: 'A', name: 'Node D', disabled: false },
      ];

      const tree = new Tree(sampleRawNodes, TreeLevelOrderMode.Source);
      const result = tree.findAll('E');
      expect(result).toHaveLength(1);
      // Verify the path to Node E: A -> B -> E
      expect(result[0].name).toBe('Node A');
      expect(result[0].children[0].name).toBe('Node B');
      expect(result[0].children[0].children[0].name).toBe('Node E');
    });
  });
});
