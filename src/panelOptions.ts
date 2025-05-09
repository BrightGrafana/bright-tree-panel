import { ClickMode, IconClickMode, MappingType, PanelOptions, ToggleMode, TreeLevelOrderMode } from './types';
import { IconMappingsEditor } from './components/IconMappingsEditor';
import { ColorMappingsEditor } from './components/ColorMappingsEditor';
import { ValueMappingsEditor } from './components/ValueMappingsEditor';
import { PanelOptionsEditorBuilder } from '@grafana/data';

export function panelOptions(builder: PanelOptionsEditorBuilder<PanelOptions>) {
  return builder
    .addFieldNamePicker({
      path: 'idColumn',
      name: 'Node ID field name',
      description: 'Every row of data results in a node. Set the field containing the ID of the node.',
      defaultValue: 'id',
      category: ['Tree options'],
    })
    .addFieldNamePicker({
      path: 'labelColumn',
      name: 'Node label field name',
      description: 'Set the field that will be used to render the label of the node.',
      defaultValue: 'label',
      category: ['Tree options'],
    })
    .addFieldNamePicker({
      path: 'parentIdColumn',
      name: 'Node parent ID field name',
      description: 'Set the field that contains the parent ID of the nodes.',
      defaultValue: 'parent',
      category: ['Tree options'],
    })
    .addTextInput({
      path: 'additionalColumns',
      name: 'Additional fields',
      description: 'Comma separated list of extra field names to display. This will transform the tree into a table.',
      defaultValue: '',
      category: ['Tree options'],
    })
    .addBooleanSwitch({
      path: 'supportsDisabled',
      name: 'Support disabled nodes',
      description: 'Disabled nodes will be displayed greyed-out and are neither selectable nor expandable.',
      defaultValue: false,
      category: ['Tree options'],
    })
    .addFieldNamePicker({
      path: 'disabledColumn',
      name: 'Node disabled field name',
      description:
        'Set the field that indicates if a node is disabled. Supports: boolean = true, string = true, both indicating a disabled node.',
      defaultValue: 'disabled',
      category: ['Tree options'],
      showIf(currentOptions) {
        return currentOptions.supportsDisabled;
      },
    })
    .addNumberInput({
      path: 'displayedTreeDepth',
      name: 'Expanded levels',
      description: 'Number of levels that are initially expanded. Applied after save and apply (page refresh).',
      defaultValue: 100,
      category: ['Tree options'],
    })
    .addBooleanSwitch({
      path: 'showItemCount',
      name: 'Show item count',
      description: 'Display the number of first-level child nodes between parenthesis after the label.',
      defaultValue: false,
      category: ['Tree options'],
    })
    .addRadio({
      path: 'orderLevels',
      name: 'Order in each level.',
      defaultValue: TreeLevelOrderMode.Asc,
      settings: {
        options: [
          { value: TreeLevelOrderMode.Asc, label: 'Ascending' },
          { value: TreeLevelOrderMode.Desc, label: 'Descending' },
          { value: TreeLevelOrderMode.Source, label: 'Source' },
        ],
      },
      category: ['Tree options']
    })
    .addBooleanSwitch({
      path: 'showSearch',
      name: 'Show Search',
      defaultValue: false,
      category: ['Search options'],
    })
    .addTextInput({
      path: 'searchPlaceholder',
      name: 'Search input placeholder text',
      description: 'Placeholder text to display in the search input field.',
      defaultValue: 'Search',
      category: ['Search options'],
      showIf(currentOptions) {
        return currentOptions.showSearch;
      },
    })
    .addBooleanSwitch({
      path: 'showIconFilter',
      name: 'Icon filter',
      description: 'Enables a toggle button that will filter on nodes containing icons and their parents.',
      defaultValue: false,
      category: ['Search options'],
      showIf(currentOptions) {
        return currentOptions.showSearch;
      },
    })
    .addTextInput({
      path: 'iconFilterLabel',
      name: 'Icon filter label',
      description: 'Label to display for this toggle button.',
      defaultValue: 'Alerts only',
      category: ['Search options'],
      showIf(currentOptions) {
        return currentOptions.showSearch && currentOptions.showIconFilter;
      },

    })
    .addSelect({
      path: 'toggleSelectMode',
      name: 'Toggle mode',
      defaultValue: ToggleMode.SingleClick,
      description:
        'How Chevron and Label clicking is handled. with `no toggle` make sure `Expanded levels` is high enough.',
      settings: {
        options: [
          { value: ToggleMode.SingleClick, label: 'Both chevron & label toggle' },
          { value: ToggleMode.ExpandOnly, label: 'Chevron toggles. Label only expands' },
          { value: ToggleMode.ChevronOnly, label: 'Only chevron toggles' },
          { value: ToggleMode.NoTogle, label: 'No Toggle' },
        ],
      },
      category: ['Toggle and select options'],
    })
    .addBooleanSwitch({
      path: 'multiSelect',
      name: 'Allow multi select using Ctrl-Click or Shift-Click.',
      description: 'Select different nodes by holding down the Ctrl key or visible ranges using the Shift key.',
      defaultValue: true,
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addBooleanSwitch({
      path: 'showCheckbox',
      name: 'Show checkbox',
      description: 'Select different nodes by using a checkbox in front of the label.',
      defaultValue: true,
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return (currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both) && currentOptions.multiSelect;
      },
    })
    .addBooleanSwitch({
      path: 'enableSelectDeselectAll',
      name: 'Enable select/deselect all',
      description: 'Add an option to the list to select or deselect all nodes at once.',
      defaultValue: true,
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return (currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both) && currentOptions.multiSelect && currentOptions.showCheckbox;
      },
    })
    .addBooleanSwitch({
      path: 'includeDisabled',
      name: 'Include disabled nodes in select/deselect all',
      description: 'Select or deselect disabled nodes when select/deselect all checkbox is clicked.',
      defaultValue: false,
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return (currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both) && currentOptions.multiSelect && currentOptions.showCheckbox && currentOptions.enableSelectDeselectAll;
      },
    })
    .addSelect({
      path: 'clickMode',
      name: 'Click mode',
      defaultValue: ClickMode.SetVariable,
      description:
        'How interaction with the tree is handled. `Set dashboard variable` will store the id of the clicked node(s) in a dashboard variable. `Data link` will open a URL when a node is clicked. `Both` will store the id of the clicked node(s) in a dashboard variable and shows an icon that will open a URL when clicked.',
      settings: {
        options: [
          { value: ClickMode.SetVariable, label: 'Set dashboard variable' },
          { value: ClickMode.DataLink, label: 'Data link' },
          { value: ClickMode.Both, label: 'Both' },
        ],
      },
      category: ['Toggle and select options'],
    })
    .addTextInput({
      path: 'dashboardVariableName',
      name: 'Dashboard variable name',
      description: 'Name of the dashboard variable in which the id of the clicked node(s) is/are stored.',
      defaultValue: '',
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addTextInput({
      path: 'dataLinkUrl',
      name: 'Data link URL',
      description:
        'URL to open when a node is clicked. Use the `__data` variable to access the node data. for example: `${__data.fields.link:raw}${__data.fields.label:percentencode}`.',
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.DataLink || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addBooleanSwitch({
      path: 'dataLinkNewTab',
      name: 'Open in new tab',
      description: 'When selected, clicking a link will open in a new tab instead of navigating away.',
      defaultValue: false,
      category: ['Toggle and select options'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.DataLink || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addBooleanSwitch({
      path: 'showGridLines',
      name: 'Show grid lines',
      description: 'When selected, the grid lines will be visible.',
      defaultValue: false,
      category: ['Table options'],
    })
    .addBooleanSwitch({
      path: 'showColumnHeaders',
      name: 'Show column headers',
      description: 'When selected, the column headers will be visible.',
      defaultValue: false,
      category: ['Table options'],
    })
    .addBooleanSwitch({
      path: 'compactMode',
      name: 'Compact mode',
      description: 'Reduce the amount of space around table cells to make the table more compact.',
      defaultValue: true,
      category: ['Table options'],
    })
    .addCustomEditor({
      id: 'valueMappings',
      path: 'valueMappings',
      name: 'Value mappings',
      description: 'Map values to text and/or colors using one or more mappings.',
      defaultValue: {},
      editor: ValueMappingsEditor,
      category: ['Value mapping'],
    })
    .addFieldNamePicker({
      path: 'iconColumn',
      name: 'Icon field name',
      description: 'Field name that contains the data to calculate the icon.',
      category: ['Icon mapping'],
    })
    .addCustomEditor({
      id: 'iconMappings',
      path: 'iconMappings',
      name: 'Value to icon mappings',
      description: 'Map values to icons using one or more mappings.',
      defaultValue: {
        valueMappings: [
          {
            type: MappingType.ValueToText,
            value: '',
            result: { text: 'check-square' },
          },
        ],
      },
      editor: IconMappingsEditor,
      category: ['Icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.iconColumn?.length ?? 0) > 0;
      },
    })
    .addFieldNamePicker({
      path: 'iconColorColumn',
      name: 'Icon color field name',
      description: 'Field name that contains the data to calculate the icon color.',
      category: ['Icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.iconColumn?.length ?? 0) > 0;
      },
    })
    .addCustomEditor({
      id: 'iconColorMappings',
      path: 'iconColorMappings',
      name: 'Value to icon color mappings',
      description: 'Map values to icon colors using one or more mappings.',
      defaultValue: {
        valueMappings: [
          {
            type: MappingType.ValueToText,
            value: '',
            result: { text: '' },
          },
        ],
      },
      editor: ColorMappingsEditor,
      category: ['Icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.iconColumn?.length ?? 0) > 0 && (currentOptions.iconColorColumn?.length ?? 0) > 0;
      },
    })
    .addFieldNamePicker({
      path: 'parentIconColumn',
      name: 'Icon field name',
      description: 'Field name that contains the data to calculate the parent icon.',
      category: ['Parent icon mapping'],
    })
    .addCustomEditor({
      id: 'parentIconMappings',
      path: 'parentIconMappings',
      name: 'Parent icon map condition(s)',
      description: 'Map values to parent icons using one or more mappings.',
      defaultValue: {
        valueMappings: [
          {
            type: MappingType.ValueToText,
            value: '',
            result: { text: 'check-square' },
          },
        ],
      },
      editor: IconMappingsEditor,
      category: ['Parent icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.parentIconColumn?.length ?? 0) > 0;
      },
    })
    .addFieldNamePicker({
      path: 'parentIconColorColumn',
      name: 'Parent icon color field name',
      description: 'Field name that contains the data to calculate the parent icon color.',
      category: ['Parent icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.parentIconColumn?.length ?? 0) > 0;
      },
    })
    .addCustomEditor({
      id: 'parentIconColorMappings',
      path: 'parentIconColorMappings',
      name: 'Parent icon color map condition(s)',
      description: 'Map values to parent icon colors using one or more mappings.',
      defaultValue: {
        valueMappings: [
          {
            type: MappingType.ValueToText,
            value: '',
            result: { text: '' },
          },
        ],
      },
      editor: ColorMappingsEditor,
      category: ['Parent icon mapping'],
      showIf(currentOptions) {
        return (
          (currentOptions.parentIconColumn?.length ?? 0) > 0 && (currentOptions.parentIconColorColumn?.length ?? 0) > 0
        );
      },
    })
    .addRadio({
      path: 'iconClickMode',
      name: 'Click mode',
      description: 'Action to perform when an icon on a parent node is clicked.',
      defaultValue: IconClickMode.DoNothing,
      settings: {
        options: [
          {
            value: IconClickMode.Expand,
            label: 'Expand',
            description: 'Expand until all values that satisfy the parent icon map condition(s) are visible.',
          },
          {
            value: IconClickMode.Select,
            label: 'Select',
            description: 'Select all enabled children that satisfy the parent icon map condition(s).',
          },
          { value: IconClickMode.DoNothing, label: 'Do nothing' },
        ],
      },
      category: ['Parent icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.iconColumn?.length ?? 0) > 0;
      },
    })
    .addTextInput({
      path: 'iconClickTooltip',
      name: 'Click tooltip',
      description: 'Placeholder text to display in the search input field.',
      defaultValue: 'One or more nodes contains an icon.',
      category: ['Parent icon mapping'],
      showIf(currentOptions) {
        return (currentOptions.iconColumn?.length ?? 0) > 0 && currentOptions.iconClickMode !== IconClickMode.DoNothing;
      },
    })

}
