import { PanelData, DataFrameDTO, FieldType, MutableDataFrame } from '@grafana/data';
import { Utils } from './utils';
import { Node } from './models'

describe('Utils', () => {
    describe('extractSelectedTreeNodes', () => {
        it('should throw an error when data is not supplied', () => {
            expect(() => Utils.extractSelectedTreeNodes(undefined, [], 'id')).toThrowError('data: PanelData was not supplied when clicking on tree node.');
        });

        it('should throw an error when nodeIds are not supplied', () => {
            expect(() => Utils.extractSelectedTreeNodes({} as PanelData, undefined, 'id')).toThrowError('Ids of clicked nodes were not supplied when clicking on tree nodes.');
        });

        it('should throw an error when idColumn is not supplied', () => {
            expect(() => Utils.extractSelectedTreeNodes({} as PanelData, ['nodeId'], undefined)).toThrowError('Column name with node ids was not supplied when clicking tree nodes.');
        });

        it('should throw an error when the idColumn is not found in the query result', () => {
            const data: PanelData = {
                series: [
                    {
                        fields: [
                            { name: 'anotherColumn', values: [] },
                        ],
                    },
                ],
            };
            expect(() => Utils.extractSelectedTreeNodes(data, ['nodeId'], 'testId')).toThrowError("Column 'testId' not found in the query result.");
        });

        it('should return a modified DataFrame with selected rows', () => {
            const data: PanelData = {
                series: [
                    {
                        fields: [
                            { name: 'id', values: [1, 2, 3, 4] },
                            { name: 'otherColumn', values: ['A', 'B', 'C', 'D'] },
                        ],
                    },
                ],
            };

            const result = Utils.extractSelectedTreeNodes(data, ['2', '4'], 'id');
            console.log(result);
            expect(result).toEqual({
                length: 2,
                fields: [
                    { name: 'id', values: [2, 4] },
                    { name: 'otherColumn', values: ['B', 'D'] },
                ],
            });
        });
    });

    describe('getDataFrameColumnNames', () => {
        it('should return an array of column names from the first series in a DataFrame', () => {
            const data: PanelData = {
                series: [
                    {
                        fields: [
                            { name: 'column1', values: [] },
                            { name: 'column2', values: [] },
                            { name: 'column3', values: [] },
                        ],
                    },
                ],
            };
            const result = Utils.getDataFrameColumnNames(data);
            expect(result).toEqual(['column1', 'column2', 'column3']);
        });

        it('should handle an empty DataFrame', () => {
            const data: PanelData = {
                series: [],
            };
            const result = Utils.getDataFrameColumnNames(data);
            expect(result).toEqual([]);
        });
    });

    describe('dfToNodeArray', () => {
        it('should map a DataFrame to an array of Node objects', () => {
            const data: DataFrameDTO = {
                fields: [
                    { name: 'id', values: ['1', '2'], type: FieldType.string },
                    { name: 'parentId', values: [null, '1'], type: FieldType.string },
                    { name: 'label', values: ['Node 1', 'Node 2'], type: FieldType.string },
                ],
            };

            const result = Utils.dfToNodeArray(new MutableDataFrame(data), 'id', 'parentId', 'label');

            expect(result).toEqual([
                { name: 'Node 1', id: '1', parent: null, children: [] },
                { name: 'Node 2', id: '2', parent: '1', children: [] },
            ]);
        });
    });

    describe('getExpandedNodeIdsForDepth', () => {
        it('should return an array of expanded node IDs up to a specified depth', () => {
            const tree: Node[] = [
                { id: '1', children: [{ id: '2', children: [], parent: 'n1', name: 'n2' }, { id: '3', children: [], parent: 'n1', name: 'n3' }], parent: null, name: 'n1' },
                { id: '4', children: [{ id: '5', children: [{ id: '6', children: [{ id: '7', children: [], parent: 'n6', name: 'n7' }], parent: 'n5', name: 'n6' }], parent: 'n4', name: 'n5' }], parent: null, name: 'n4' },
            ];
            const result = Utils.getExpandedNodeIdsForDepth(tree, 2);
            expect(result).toEqual(['1', '4', '5']);
        });

        it('should handle an empty tree array', () => {
            const result = Utils.getExpandedNodeIdsForDepth([], 2);
            expect(result).toEqual([]);
        });

        it('should handle an undefined tree', () => {
            const result = Utils.getExpandedNodeIdsForDepth(undefined, 2);
            expect(result).toEqual([]);
        });

        it('should throw an error when max depth is negative', () => {
            expect(() => Utils.getExpandedNodeIdsForDepth([], -1)).toThrowError('maxDepth should be positive number');
        });

        it('should throw an error when max depth undefined', () => {
            expect(() => Utils.getExpandedNodeIdsForDepth([], undefined)).toThrowError('maxDepth should be positive number');
        });

    });
});
