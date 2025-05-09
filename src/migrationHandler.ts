import { PanelModel } from '@grafana/data';
import { IconClickMode, MappingType, PanelOptions } from './types';

export function migrationHandler(panel: PanelModel<Partial<PanelOptions>>) {
  // panel.options contains the current panel options stored in the dashboard
  const options = Object.assign({}, panel.options);

  // migrate old options to new options
  if (options.showGridLines === undefined) {
    options.showGridLines = false;
  }
  if (options.compactMode === undefined) {
    options.compactMode = true;
  }
  if (options.valueMappings === undefined) {
    options.valueMappings = {};
  }
  if (options.iconColumn === undefined) {
    options.iconColumn = '';
  }
  if (options.iconMappings === undefined) {
    options.iconMappings = {
      valueMappings: [
        {
          type: MappingType.ValueToText,
          value: '',
          result: { text: 'check-square' },
        },
      ],
    };
  }
  if (options.iconColorColumn === undefined) {
    options.iconColorColumn = '';
  }
  if (options.iconColorMappings === undefined) {
    options.iconColorMappings = {
      valueMappings: [
        {
          type: MappingType.ValueToText,
          value: '',
          result: { text: '' },
        },
      ],
    };
  }
  if (options.iconClickMode === undefined) {
    options.iconClickMode = IconClickMode.DoNothing;
  }
  if (options.iconClickTooltip === undefined) {
    options.iconClickTooltip = '';
  }
  if (options.parentIconColumn === undefined) {
    options.parentIconColumn = '';
  }
  if (options.parentIconMappings === undefined) {
    options.parentIconMappings = {
      valueMappings: [
        {
          type: MappingType.ValueToText,
          value: '',
          result: { text: 'check-square' },
        },
      ],
    };
  }
  if (options.parentIconColorColumn === undefined) {
    options.parentIconColorColumn = '';
  }
  if (options.parentIconColorMappings === undefined) {
    options.parentIconColorMappings = {
      valueMappings: [
        {
          type: MappingType.ValueToText,
          value: '',
          result: { text: '' },
        },
      ],
    };
  }

  if (options.multiSelect === true) {
    if (options.showCheckbox === undefined) {
      options.showCheckbox = true;
    }
    if (options.showCheckbox) {
      if (options.enableSelectDeselectAll === undefined) {
        options.enableSelectDeselectAll = true;
      }
      if (options.enableSelectDeselectAll) {
        if (options.includeDisabled === undefined) {
          options.includeDisabled = false;
        }
      }
    }
  }

  return options;
}
