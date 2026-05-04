import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Tree } from 'tree';
import { ClickMode, IconClickMode, MappingType, RawNode, ToggleMode, TreeLevelOrderMode, TreeViewOptions } from '../types';
import { TreeView } from './TreeView';
import { tableHasIconContentClass, tableHasParentIconContentClass } from './treeStyles';

jest.mock('@grafana/runtime', () => ({
  locationService: {
    getSearchObject: jest.fn(() => ({})),
    getHistory: jest.fn(() => ({
      listen: jest.fn(() => jest.fn()),
    })),
    partial: jest.fn(),
  },
}));

jest.mock('@grafana/ui', () => ({
  Box: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Checkbox: (props: any) => React.createElement('input', { type: 'checkbox', ...props }),
  Icon: ({ name, ...props }: any) => React.createElement('span', { 'data-icon': name, ...props }),
  InlineField: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  InlineFieldRow: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  InlineSwitch: (props: any) => React.createElement('input', { type: 'checkbox', ...props }),
  Input: (props: any) => React.createElement('input', { ...props }),
  toIconName: (value: unknown) => {
    return typeof value === 'string' && value.trim() !== '' ? value : undefined;
  },
}));

const baseOptions: TreeViewOptions = {
  clickMode: ClickMode.SetVariable,
  multiSelect: false,
  showCheckbox: false,
  enableSelectDeselectAll: false,
  includeDisabled: false,
  showItemCount: false,
  toggleSelectMode: ToggleMode.SingleClick,
  supportsDisabled: false,
  showSearch: false,
  searchPlaceholder: '',
  showIconFilter: false,
  iconFilterLabel: '',
  dashboardVariableName: 'node',
  dataLinkUrl: '',
  dataLinkNewTab: false,
  additionalColumns: [],
  showGridLines: true,
  showColumnHeaders: true,
  labelColumn: 'label',
  valueMappings: {},
  iconColumn: 'icon',
  iconMappings: {
    valueMappings: [
      {
        type: MappingType.ValueToText,
        value: 'ok',
        result: { text: 'check' },
      },
    ],
  },
  iconColorColumn: 'iconColor',
  iconColorMappings: { valueMappings: [] },
  iconClickMode: IconClickMode.DoNothing,
  iconClickTooltip: 'icon action',
  parentIconColumn: 'parentIcon',
  parentIconMappings: {
    valueMappings: [
      {
        type: MappingType.ValueToText,
        value: 'p-ok',
        result: { text: 'folder' },
      },
    ],
  },
  parentIconColorColumn: 'parentIconColor',
  parentIconColorMappings: { valueMappings: [] },
  compactMode: false,
};

const buildTree = (nodes: RawNode[]) => new Tree(nodes, TreeLevelOrderMode.Source);

describe('TreeView icon slot classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds icon content class when at least one visible row has icon content', () => {
    const tree = buildTree([
      {
        id: '1',
        name: 'Root',
        disabled: false,
        additionalData: { icon: 'ok' },
      },
      {
        id: '2',
        parent: '1',
        name: 'Child',
        disabled: false,
        additionalData: { icon: 'no-match' },
      },
    ]);

    const { container } = render(React.createElement(TreeView, { tree, options: baseOptions, expanded: ['1'] }));
    const table = container.querySelector('table');

    expect(table).not.toBeNull();
    expect(table?.className).toContain(tableHasIconContentClass);
  });

  it('does not add icon content class when no visible row has icon content', () => {
    const tree = buildTree([
      {
        id: '1',
        name: 'Root',
        disabled: false,
        additionalData: { icon: 'no-match' },
      },
      {
        id: '2',
        parent: '1',
        name: 'Child',
        disabled: false,
        additionalData: { icon: 'still-no-match' },
      },
    ]);

    const { container } = render(React.createElement(TreeView, { tree, options: baseOptions, expanded: ['1'] }));
    const table = container.querySelector('table');

    expect(table).not.toBeNull();
    expect(table?.className).not.toContain(tableHasIconContentClass);
  });

  it('adds parent icon content class when a visible parent row has mapped parent icon from children', () => {
    const tree = buildTree([
      {
        id: '1',
        name: 'Root',
        disabled: false,
        additionalData: { icon: 'no-match' },
      },
      {
        id: '2',
        parent: '1',
        name: 'Child',
        disabled: false,
        additionalData: {
          icon: 'ok',
          parentIcon: 'p-ok',
        },
      },
    ]);

    const { container } = render(React.createElement(TreeView, { tree, options: baseOptions, expanded: ['1'] }));
    const table = container.querySelector('table');

    expect(table).not.toBeNull();
    expect(table?.className).toContain(tableHasParentIconContentClass);
  });
});
