import { PanelData } from '@grafana/data';
import { Validator } from './validator';
import { ClickMode, PanelOptions, RawNode, ToggleMode, TreeLevelOrderMode } from './models';

describe('Validator', () => {
  describe('validateTreeInput', () => {
    it('should throw error if ids are duplicated', () => {
      // arrange
      const input: RawNode[] = [
        { id: '1', name: 'n1', disabled: false },
        { id: '1', name: 'n1', disabled: false },
      ];

      // act
      const result = () => Validator.validateTreeInput(input);

      // assert
      expect(result).toThrowError('Duplicated ID found for id: 1');
    });

    it('should throw error if ids are duplicated', () => {
      // arrange
      const input: RawNode[] = [
        { id: '1', name: 'n1', disabled: false },
        { id: '2', name: 'n2', parent: '3', disabled: false },
      ];

      // act
      const result = () => Validator.validateTreeInput(input);

      // assert
      expect(result).toThrowError('Parent not found for id 2 parent 3');
    });

    it('should throw error if parent matches id', () => {
      // arrange
      const input: RawNode[] = [
        { id: '1', name: 'n1', disabled: false },
        { id: '2', name: 'n2', parent: '2', disabled: false },
      ];

      // act
      const result = () => Validator.validateTreeInput(input);

      // assert
      expect(result).toThrowError('Parent can not be mapped to itself. For id: 2');
    });
  });
  describe('validateTreeBranches', () => {
    it('should throw error if detached branch is found', () => {
      // arrange
      const input: RawNode[] = [
        { id: '1', name: 'n1', parent: undefined, disabled: false },
        { id: '2', name: 'n2', parent: '3', disabled: false },
        { id: '3', name: 'n3', parent: '2', disabled: false },
      ];

      // act
      const result = () =>
        Validator.validateTreeBranches(input, [{ id: '1', name: 'n1', children: [], disabled: false }]);

      // assert
      expect(result).toThrowError('Detached branch detected for id: 2');
    });
  });

  // Mock PanelData and PanelOptions objects for testing

  const mockPanelData = {
    series: [
      {
        fields: [{ name: 'id' }, { name: 'label' }, { name: 'parentId' }],
      },
    ],
  } as unknown as PanelData;

  const mockPanelOptions: PanelOptions = {
    clickMode: ClickMode.SetVariable,
    displayedTreeDepth: 2,
    idColumn: 'id',
    labelColumn: 'label',
    parentIdColumn: 'parentId',
    supportsDisabled: false,
    disabledColumn: 'disabled',
    dashboardVariableName: 'myVar',
    multiSelect: true,
    orderLevels: TreeLevelOrderMode.Asc,
    showItemCount: true,
    showSearch: true,
    toggleSelectMode: ToggleMode.SingleClick,
    dataLinkUrl: 'https://www.google.com',
    dataLinkNewTab: false,
  };

  describe('validateOptionsInput', () => {
    it('should not throw an error for valid options', () => {
      expect(() => Validator.validateOptionsInput(mockPanelOptions, mockPanelData)).not.toThrow();
    });

    it('should throw an error if displayedTreeDepth is undefined', () => {
      const invalidOptions: PanelOptions = {
        ...mockPanelOptions,
        displayedTreeDepth: undefined,
      } as unknown as PanelOptions;
      expect(() => Validator.validateOptionsInput(invalidOptions, mockPanelData)).toThrow(
        new ReferenceError("'Expanded levels' must be defined and >= 0 in panel options.")
      );
    });
    it('should throw an error if displayedTreeDepth is negative', () => {
      const invalidOptions: PanelOptions = { ...mockPanelOptions, displayedTreeDepth: -1 } as unknown as PanelOptions;
      expect(() => Validator.validateOptionsInput(invalidOptions, mockPanelData)).toThrow(
        new ReferenceError("'Expanded levels' must be defined and >= 0 in panel options.")
      );
    });

    it('should throw an error if dashboardVariableName is missing', () => {
      const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
      invalidOptions['dashboardVariableName'] = undefined;

      expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).toThrow(
        new ReferenceError(
          "'Dashboard variable name' must be defined in panel options, when using Click mode set variable."
        )
      );
    });
    it('should throw an error if dashboardVariableName is blank string', () => {
      const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
      invalidOptions['dashboardVariableName'] = '  ';

      expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).toThrow(
        new ReferenceError(
          "'Dashboard variable name' must be defined in panel options, when using Click mode set variable."
        )
      );
    });
    it('should throw an error if ClickMode is DataLink and dashboardVariableName is missing', () => {
      const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
      invalidOptions['dashboardVariableName'] = undefined;
      invalidOptions.clickMode = ClickMode.DataLink;

      expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).not.toThrow();
    });

    it.each([['idColumn'], ['labelColumn'], ['parentIdColumn']])(
      'should throw an error if %s is missing',
      (column: string) => {
        const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
        invalidOptions[column] = undefined;

        expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).toThrow(
          new ReferenceError(
            "'Node id field name', 'Node label field name', and 'Node parent id field name' must be defined in panel options."
          )
        );
      }
    );

    it.each([['idColumn'], ['labelColumn'], ['parentIdColumn']])(
      'should throw an error if %s is blank string',
      (column: string) => {
        const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
        invalidOptions[column] = '  ';

        expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).toThrow(
          new ReferenceError(
            "'Node id field name', 'Node label field name', and 'Node parent id field name' must be defined in panel options."
          )
        );
      }
    );
    it.each([['idColumn'], ['labelColumn'], ['parentIdColumn']])(
      'should throw an error if %s is not in the data',
      (column) => {
        const invalidOptions = { ...mockPanelOptions } as Record<string, any>;
        invalidOptions[column] = 'nonExistentColumn';
        expect(() => Validator.validateOptionsInput(invalidOptions as PanelOptions, mockPanelData)).toThrow(
          new ReferenceError("'nonexistentcolumn' is not a table column.")
        );
      }
    );
    it.each([['idColumn'], ['labelColumn'], ['parentIdColumn']])(
      'should support case insensitive %s column',
      (column: string) => {
        const validOptions = { ...mockPanelOptions } as Record<string, any>;
        validOptions[column] = validOptions[column].toUpperCase();

        expect(() => Validator.validateOptionsInput(validOptions as PanelOptions, mockPanelData)).not.toThrow();
      }
    );
  });
});
