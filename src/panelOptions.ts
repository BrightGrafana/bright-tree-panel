import { ClickMode, IconClickMode, MappingType, PanelOptions, ToggleMode, TreeLevelOrderMode } from './types';
import { IconMappingsEditor } from './components/IconMappingsEditor';
import { ColorMappingsEditor } from './components/ColorMappingsEditor';
import { ValueMappingsEditor } from './components/ValueMappingsEditor';
import { PanelOptionsEditorBuilder } from '@grafana/data';

export function panelOptions(builder: PanelOptionsEditorBuilder<PanelOptions>) {
  return builder
    .addFieldNamePicker({
      path: 'idColumn',
      name: 'Node id field name',
      description: 'Field name that contains the ids of nodes (every row in the table result is a node).',
      defaultValue: 'id',
    })
    .addFieldNamePicker({
      path: 'labelColumn',
      name: 'Node label field name',
      description: 'Field name that contains the names of the nodes.',
      defaultValue: 'label',
    })
    .addFieldNamePicker({
      path: 'parentIdColumn',
      name: 'Node parent id field name',
      description: 'Name of the field that contains the parent ids of the nodes.',
      defaultValue: 'parent',
    })
    .addTextInput({
      path: 'additionalColumns',
      name: 'Additional Columns',
      description: 'Comma separated list of extra column names to display.',
      defaultValue: '',
    })
    .addBooleanSwitch({
      path: 'supportsDisabled',
      name: 'Support disabled nodes',
      defaultValue: false,
    })
    .addFieldNamePicker({
      path: 'disabledColumn',
      name: 'Node disabled field name',
      description:
        'Name of the field that indicates if nodes are disabled. Supports: boolean = true, string = true, both indicate disabled.',
      defaultValue: 'disabled',
      showIf(currentOptions) {
        return currentOptions.supportsDisabled;
      },
    })
    .addNumberInput({
      path: 'displayedTreeDepth',
      name: 'Expanded levels',
      description: 'Number of levels expanded by default. Applied after save and apply (page refresh).',
      defaultValue: 100,
    })
    .addBooleanSwitch({
      path: 'showItemCount',
      name: 'Show item count',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showSearch',
      name: 'Show Search',
      defaultValue: false,
      category: ['Search'],
    })
    .addTextInput({
      path: 'searchPlaceholder',
      name: 'Search input placeholder text',
      description: 'Placeholder text to display in the search input field.',
      defaultValue: 'Search',
      category: ['Search'],
      showIf(currentOptions) {
        return currentOptions.showSearch;
      },
    })
    .addBooleanSwitch({
      path: 'showIconFilter',
      name: 'Show icon filter',
      description: 'This switch will filter on nodes containing icons and their parents.',
      defaultValue: false,
      category: ['Search'],
      showIf(currentOptions) {
        return currentOptions.showSearch;
      },
    })
    .addTextInput({
      path: 'iconFilterLabel',
      name: 'Icon filter label',
      description: 'Label to display for this toggle',
      defaultValue: 'Alerts only',
      category: ['Search'],
      showIf(currentOptions) {
        return currentOptions.showSearch && currentOptions.showIconFilter;
      },

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
    })
    .addBooleanSwitch({
      path: 'multiSelect',
      name: 'Allow multi select using Ctrl-Click or Shift-Click.',
      defaultValue: true,
      category: ['Selection handling'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both;
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
      category: ['Selection handling'],
    })
    .addTextInput({
      path: 'dashboardVariableName',
      name: 'Dashboard variable name',
      description: 'Name of the dashboard variable in which the id of the clicked node(s) is/are stored.',
      defaultValue: '',
      category: ['Selection handling'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.SetVariable || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addTextInput({
      path: 'dataLinkUrl',
      name: 'Data link URL',
      description:
        'URL to open when a node is clicked. Use the `__data` variable to access the node data. for example: `${__data.fields.link:raw}${__data.fields.label:percentencode}`',
      category: ['Selection handling'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.DataLink || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addBooleanSwitch({
      path: 'dataLinkNewTab',
      name: 'Open in new tab',
      defaultValue: false,
      category: ['Selection handling'],
      showIf(currentOptions) {
        return currentOptions.clickMode === ClickMode.DataLink || currentOptions.clickMode === ClickMode.Both;
      },
    })
    .addBooleanSwitch({
      path: 'showGridLines',
      name: 'Show grid lines',
      defaultValue: false,
      category: ['Appearance'],
    })
    .addBooleanSwitch({
      path: 'showColumnHeaders',
      name: 'Show column headers',
      defaultValue: false,
      category: ['Appearance'],
    })
    .addBooleanSwitch({
      path: 'compactMode',
      name: 'Compact mode',
      description: 'Reduce the amount of space around table cells to make the table more compact.',
      defaultValue: true,
      category: ['Appearance'],
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
      description: 'Map values to icons',
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
      description: 'Map values to icon colors',
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
      description: 'Map values to parent icons',
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
      description: 'Map values to parent icon colors',
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
    .addCustomEditor({
      id: 'valueMappings',
      path: 'valueMappings',
      name: 'Value mappings',
      description: 'Map values to text and colors',
      defaultValue: {},
      editor: ValueMappingsEditor,
      category: ['Value Mappings'],
    });
}
