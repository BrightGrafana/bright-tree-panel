export enum ToggleMode {
  NoTogle = 'noTogle',
  ExpandOnly = 'expandOnly',
  SingleClick = 'singleClick',
  ChevronOnly = 'chevronOnly',
}

export enum ClickMode {
  SetVariable = 'SetVariable',
  DataLink = 'DataLink',
  Both = 'Both'
}

export type TreeViewOptions = {
  clickMode: ClickMode;
  multiSelect: boolean;
  showItemCount: boolean;
  toggleSelectMode: ToggleMode;
  supportsDisabled: boolean;
  showSearch: boolean;
  searchPlaceholder: string;
  showIconFilter: boolean;
  iconFilterLabel: string;
  dashboardVariableName: string;
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
  additionalColumns: string[];
  showGridLines: boolean;
  showColumnHeaders: boolean;
  labelColumn: string;
  valueMappings: ValueMappings;
  iconColumn: string;
  iconMappings: IconMappings;
  iconColorColumn: string;
  iconColorMappings: ColorMappings;
  iconClickMode: IconClickMode;
  iconClickTooltip: string;
  parentIconColumn: string;
  parentIconMappings: IconMappings;
  parentIconColorColumn: string;
  parentIconColorMappings: ColorMappings;
  compactMode: boolean;
};

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  disabled: boolean;
  link?: string;
  additionalData?: Record<string, unknown>;
}

export enum TreeLevelOrderMode {
  Asc = 'asc',
  Desc = 'desc',
  Source = 'source',
}

export enum IconClickMode {
  Expand = 'expand',
  Select = 'select',
  DoNothing = 'doNothing',
}

export interface RawNode {
  id: string;
  parent?: string;
  name: string;
  disabled: boolean;
  link?: string;
  additionalData?: Record<string, unknown>;
}

export interface PanelOptions {
  clickMode: ClickMode;
  multiSelect: boolean;
  orderLevels: TreeLevelOrderMode;
  idColumn: string;
  labelColumn: string;
  parentIdColumn: string;
  supportsDisabled: boolean;
  disabledColumn: string;
  displayedTreeDepth: number;
  showItemCount: boolean;
  showSearch: boolean;
  searchPlaceholder: string;
  showIconFilter: boolean;
  iconFilterLabel: string;
  dashboardVariableName: string;
  toggleSelectMode: ToggleMode;
  dataLinkUrl: string;
  dataLinkNewTab: boolean;
  additionalColumns: string;
  showGridLines: boolean;
  showColumnHeaders: boolean;
  valueMappings: ValueMappings;
  iconColumn: string;
  iconMappings: IconMappings;
  iconColorColumn: string;
  iconColorMappings: ColorMappings;
  iconClickMode: IconClickMode;
  iconClickTooltip: string;
  parentIconColumn: string;
  parentIconMappings: IconMappings;
  parentIconColorColumn: string;
  parentIconColorMappings: ColorMappings;
  compactMode: boolean;
}

export enum MappingType {
  ValueToText = 'value',
  RangeToText = 'range',
  RegexToText = 'regex',
  SpecialValue = 'special',
}

export interface ValueMappingResult {
  text: string;
  color?: string;
}

export interface BaseValueMap {
  type: MappingType;
  result: ValueMappingResult;
}

export interface ValueMap extends BaseValueMap {
  type: MappingType.ValueToText;
  value: string | number | boolean;
}

export interface RangeMap extends BaseValueMap {
  type: MappingType.RangeToText;
  from: number;
  to: number;
}

export interface RegexMap extends BaseValueMap {
  type: MappingType.RegexToText;
  pattern: string;
}

export interface SpecialValueMap extends BaseValueMap {
  type: MappingType.SpecialValue;
  match: 'null' | 'nan' | 'null+nan' | 'empty' | 'always';
}

export type ValueMapping = ValueMap | RangeMap | RegexMap | SpecialValueMap;

export interface ValueMappings {
  [columnName: string]: ValueMapping[];
}

export interface IconMappings {
  valueMappings: ValueMapping[];
}

export interface ColorMappings {
  [columnName: string]: ValueMapping[];
}
