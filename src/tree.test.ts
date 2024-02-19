import { RawNode, TreeLevelOrderMode } from 'models';
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
      const result = tree.getTree();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 1');
      expect(result[1].name).toBe('Node 5');
    });

    it('should build the tree in descending order when specified', () => {
      const tree = new Tree([...rawNodes], TreeLevelOrderMode.Desc);
      const result = tree.getTree();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 5');
      expect(result[1].name).toBe('Node 1');
    });
    it('should build the tree in provided order', () => {
      const tree = new Tree([...rawNodes], TreeLevelOrderMode.Source);
      const result = tree.getTree();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Node 1');
      expect(result[1].name).toBe('Node 5');
    });

    it('should handle empty rawNodes array', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      const result = tree.getTree();

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

      expect(t).toThrowError('Parent not found for id 2 parent 3');
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

      const result = tree.getNodeIdsForDepth(2);
      expect(result).toEqual(['1', '4', '5']);
    });

    it('should handle an empty tree', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      const result = tree.getNodeIdsForDepth(2);
      expect(result).toEqual([]);
    });

    it('should throw an error when max depth is negative', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      expect(() => tree.getNodeIdsForDepth(-1)).toThrowError('maxDepth should be positive number');
    });

    it('should throw an error when max depth undefined', () => {
      const tree = new Tree([], TreeLevelOrderMode.Asc);
      expect(() => tree.getNodeIdsForDepth(undefined as any as number)).toThrowError(
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
      expect(tree.getPath('A')).toEqual(['A']);
    });

    it('should return the correct path for a leaf node', () => {
      const expectedPath = ['A', 'B', 'C'];
      expect(tree.getPath('C')).toEqual(expectedPath);
    });

    it('should handle multiple leaf nodes with the same ID by returning the path for the first occurrence', () => {
      const expectedPath = ['A', 'B', 'E'];
      expect(tree.getPath('E')).toEqual(expectedPath);
    });
  });
});
