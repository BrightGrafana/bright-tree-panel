import { PanelData, DataFrameDTO, FieldType, MutableDataFrame, DataFrame } from '@grafana/data';
import { Utils } from './utils';
import * as runtime from '@grafana/runtime';

// Mock @grafana/runtime
jest.mock('@grafana/runtime', () => ({
  getTemplateSrv: jest.fn()
}));

describe('Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('extractSelectedTreeNodes', () => {
    it('should throw an error when data is not supplied', () => {
      expect(() => Utils.extractSelectedTreeNodes(undefined as any as PanelData, [], 'id')).toThrow(
        'data: PanelData was not supplied when clicking on tree node.'
      );
    });

    it('should throw an error when nodeIds are not supplied', () => {
      expect(() => Utils.extractSelectedTreeNodes({} as PanelData, undefined as any as string[], 'id')).toThrow(
        'Ids of clicked nodes were not supplied when clicking on tree nodes.'
      );
    });

    it('should throw an error when idColumn is not supplied', () => {
      expect(() =>
        Utils.extractSelectedTreeNodes({} as PanelData, ['nodeId'], undefined as any as string)
      ).toThrow('Column name with node ids was not supplied when clicking tree nodes.');
    });

    it('should throw an error when the idColumn is not found in the query result', () => {
      const data: PanelData = {
        series: [
          {
            fields: [{ name: 'anotherColumn', values: [], type: FieldType.string, config: {} }],
            length: 1,
          },
        ],
      } as unknown as PanelData;
      expect(() => Utils.extractSelectedTreeNodes(data, ['nodeId'], 'testId')).toThrow(
        "Column 'testId' not found in the query result."
      );
    });

    it('should return a modified DataFrame with selected rows', () => {
      const data: PanelData = {
        series: [
          {
            fields: [
              { name: 'id', values: [1, 2, 3, 4], type: FieldType.number, config: {} },
              { name: 'otherColumn', values: ['A', 'B', 'C', 'D'], type: FieldType.string, config: {} },
            ],
            length: 2,
          },
        ],
      } as unknown as PanelData;

      const result = Utils.extractSelectedTreeNodes(data, ['2', '4'], 'id');

      expect(result).toEqual({
        length: 2,
        fields: [
          { name: 'id', values: [2, 4], type: FieldType.number, config: {} },
          { name: 'otherColumn', values: ['B', 'D'], type: FieldType.string, config: {} },
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
              { name: 'column1', values: [], type: FieldType.string, config: {} },
              { name: 'column2', values: [], type: FieldType.string, config: {} },
              { name: 'column3', values: [], type: FieldType.string, config: {} },
            ],
          },
        ],
      } as unknown as PanelData;
      const result = Utils.getDataFrameColumnNames(data);
      expect(result).toEqual(['column1', 'column2', 'column3']);
    });

    it('should handle an empty DataFrame', () => {
      const data: PanelData = {
        series: [] as DataFrame[],
      } as PanelData;
      const result = Utils.getDataFrameColumnNames(data);
      expect(result).toEqual([]);
    });
  });

  describe('dfToNodeArray', () => {
    it('should map a DataFrame to an array of Node objects', () => {
      const data: DataFrameDTO = {
        fields: [
          { name: 'id', values: ['1', '2'], type: FieldType.string },
          { name: 'parentId', values: [undefined, '1'], type: FieldType.string },
          { name: 'label', values: ['Node 1', 'Node 2'], type: FieldType.string },
          { name: 'disabled', values: [true, false], type: FieldType.boolean },
        ],
      };

      const result = Utils.dfToNodeArray(
        new MutableDataFrame(data),
        'id',
        'parentId',
        'label',
        'disabled'
      );

      expect(result).toEqual([
        { name: 'Node 1', id: '1', parent: undefined, disabled: true },
        { name: 'Node 2', id: '2', parent: '1', disabled: false },
      ]);
    });
  });

  describe('dfToNodeArray with additionalData and dataLink', () => {
    const mockTemplateService = {
      replace: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (runtime.getTemplateSrv as jest.Mock).mockReturnValue(mockTemplateService);
      mockTemplateService.replace.mockImplementation(url => {
        if (url.includes('${__data.fields.label}')) {
          return url.replace('${__data.fields.label}', 'Node 1');
        }
        return url;
      });
    });

    it('should handle additionalColumns and include them in the result', () => {
      const data: DataFrameDTO = {
        fields: [
          { name: 'id', values: ['1'], type: FieldType.string },
          { name: 'parentId', values: [undefined], type: FieldType.string },
          { name: 'label', values: ['Node 1'], type: FieldType.string },
          { name: 'disabled', values: [false], type: FieldType.boolean },
          { name: 'extraCol', values: ['extraValue'], type: FieldType.string },
        ],
      };

      const result = Utils.dfToNodeArray(
        new MutableDataFrame(data),
        'id',
        'parentId',
        'label',
        'disabled',
        undefined,
        ['extraCol']
      );

      expect(result[0].additionalData).toBeDefined();
      expect(result[0].additionalData?.extraCol).toBe('extraValue');
    });

    it('should handle empty or undefined values in additional columns', () => {
      const data: DataFrameDTO = {
        fields: [
          { name: 'id', values: ['1'], type: FieldType.string },
          { name: 'parentId', values: [undefined], type: FieldType.string },
          { name: 'label', values: ['Node 1'], type: FieldType.string },
          { name: 'disabled', values: [false], type: FieldType.boolean },
          { name: 'extraCol', values: [undefined], type: FieldType.string },
        ],
      };

      const result = Utils.dfToNodeArray(
        new MutableDataFrame(data),
        'id',
        'parentId',
        'label',
        'disabled',
        undefined,
        ['extraCol']
      );

      expect(result[0].additionalData).toBeDefined();
      expect(result[0].additionalData?.extraCol).toBe('');
    });

    it('should handle case-insensitive column name matching', () => {
      const data: DataFrameDTO = {
        fields: [
          { name: 'ID', values: ['1'], type: FieldType.string },
          { name: 'parentId', values: [undefined], type: FieldType.string },
          { name: 'label', values: ['Node 1'], type: FieldType.string },
          { name: 'disabled', values: [false], type: FieldType.boolean },
        ],
      };

      const result = Utils.dfToNodeArray(
        new MutableDataFrame(data),
        'id',
        'parentId',
        'label',
        'disabled'
      );

      expect(result[0].id).toBe('1');
    });

    it('should handle data link URL with template variables', () => {
      const data = new MutableDataFrame({
        fields: [
          { name: 'id', values: ['1'] },
          { name: 'parentId', values: [undefined] },
          { name: 'label', values: ['Node 1'] },
          { name: 'disabled', values: [false] },
        ],
      });

      const result = Utils.dfToNodeArray(
        data,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://test/${__data.fields.label}'
      );

      expect(mockTemplateService.replace).toHaveBeenCalledWith('http://test/${__data.fields.label}', expect.any(Object));
      expect(result[0].link).toBe('http://test/Node 1');
    });

    it('should handle missing template service', () => {
      (runtime.getTemplateSrv as jest.Mock).mockReturnValue(undefined);

      const data = new MutableDataFrame({
        fields: [
          { name: 'id', values: ['1'] },
          { name: 'parentId', values: [undefined] },
          { name: 'label', values: ['Node 1'] },
          { name: 'disabled', values: [false] },
        ],
      });

      const result = Utils.dfToNodeArray(
        data,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://test/${__data.fields.label}'
      );

      expect(result[0].link).toBe('http://test/${__data.fields.label}');
    });
  });

  describe('dfToNodeArray with template links', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(runtime, 'getTemplateSrv').mockReturnValue({
        replace: (url: string, scopedVars: any) => {
          return url.replace(/\${__data\.fields\.label}/g, scopedVars.__data.value.fields.label);
        },
        getVariables: () => [],
        containsTemplate: () => false,
        updateTimeRange: () => {}
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('should properly handle template variables in data links', () => {
      const df = new MutableDataFrame({
        fields: [
          { name: 'id', values: ['1'] },
          { name: 'parentId', values: [null] },
          { name: 'label', values: ['Node 1'] },
          { name: 'disabled', values: [false] }
        ]
      });

      const result = Utils.dfToNodeArray(
        df,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://example.com/${__data.fields.label}'
      );

      expect(runtime.getTemplateSrv).toHaveBeenCalled();
      expect(result[0].link).toBe('http://example.com/Node 1');
    });

    it('should handle cases without template service', () => {
      (runtime.getTemplateSrv as jest.Mock).mockReturnValue(undefined);

      const df = new MutableDataFrame({
        fields: [
          { name: 'id', values: ['1'] },
          { name: 'parentId', values: [null] },
          { name: 'label', values: ['Node 1'] },
          { name: 'disabled', values: [false] }
        ]
      });

      const result = Utils.dfToNodeArray(
        df,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://example.com/${__data.fields.label}'
      );

      expect(result[0].link).toBe('http://example.com/${__data.fields.label}');
    });
  });

  describe('dfToNodeArray with links', () => {
    const data = new MutableDataFrame({
      fields: [
        { name: 'id', values: ['1'] },
        { name: 'parentId', values: [null] },
        { name: 'label', values: ['Node 1'] },
        { name: 'disabled', values: [false] }
      ]
    });

    it('should handle template variables in data links', () => {
      const mockTemplateService = {
        replace: jest.fn(url => url.replace('${__data.fields.label}', 'Node 1'))
      };
      (runtime.getTemplateSrv as jest.Mock).mockReturnValue(mockTemplateService);

      const result = Utils.dfToNodeArray(
        data,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://test/${__data.fields.label}'
      );

      expect(mockTemplateService.replace).toHaveBeenCalled();
      expect(result[0].link).toBe('http://test/Node 1');
    });

    it('should handle missing template service', () => {
      (runtime.getTemplateSrv as jest.Mock).mockReturnValue(undefined);

      const result = Utils.dfToNodeArray(
        data,
        'id',
        'parentId',
        'label',
        'disabled',
        'http://test/${__data.fields.label}'
      );

      expect(result[0].link).toBe('http://test/${__data.fields.label}');
    });
  });
});
