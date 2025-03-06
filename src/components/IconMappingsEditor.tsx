import React from 'react';
import { Button, getAvailableIcons, Icon, Input, Select, toIconName, Tooltip } from '@grafana/ui';
import { IconMappings, MappingType, ValueMap, ValueMapping } from '../types';
import { SelectableValue } from '@grafana/data';

interface Props {
  value: IconMappings;
  onChange: (value: IconMappings) => void;
}

const defaultValue: ValueMapping =  {
    type: MappingType.ValueToText,
    value: '',
    result: { text: 'check-square' },
  };

export const IconMappingsEditor: React.FC<Props> = ({ value = { valueMappings: [] }, onChange }) => {
  const mappingTypes: Array<SelectableValue<MappingType>> = [
    { label: 'Value', value: MappingType.ValueToText },
    { label: 'Range', value: MappingType.RangeToText },
    { label: 'Regex', value: MappingType.RegexToText },
    { label: 'Special', value: MappingType.SpecialValue },
  ];

  const specialValueOptions: Array<SelectableValue<string>> = [
    { label: 'Null', value: 'null' },
    { label: 'NaN', value: 'nan' },
    { label: 'Null & NaN', value: 'null+nan' },
    { label: 'Empty', value: 'empty' },
    { label: 'Always', value: 'always' },
  ];

  const icons = getAvailableIcons().map((icon) => ({
    label: icon,
    value: icon,
  }));

  const addMapping = () => {
    const updatedValue = { ...value };
    updatedValue.valueMappings = [...updatedValue.valueMappings, {...defaultValue}];
    onChange(updatedValue);
  };

  const updateMapping = (index: number, mapping: ValueMapping) => {
    const updatedValue = { ...value };
    // handle value conversion for Range mapping type
    if (mapping.type === MappingType.RangeToText) {
      const rangeMapping = mapping as any;
      if (typeof rangeMapping.from === 'string') {
        rangeMapping.from = parseFloat(rangeMapping.from) || 0;
      }
      if (typeof rangeMapping.to === 'string') {
        rangeMapping.to = parseFloat(rangeMapping.to) || 0;
      }
    }

    updatedValue.valueMappings[index] = mapping;
    onChange(updatedValue);
  };

  const removeMapping = (index: number) => {
    const updatedValue = { ...value };
    updatedValue.valueMappings.splice(index, 1);
    onChange(updatedValue);

    if (updatedValue.valueMappings.length === 0) {
      addMapping();
    }
  };

  const renderMappingInput = (mapping: ValueMapping, index: number, mappings: ValueMapping[]) => {
    const updateType = (type: MappingType) => {
      const newMapping: ValueMapping = {
        type,
        result: mapping.result,
      } as ValueMapping;

      switch (type) {
        case MappingType.ValueToText:
          (newMapping as any).value = '';
          break;
        case MappingType.RangeToText:
          (newMapping as any).from = 0;
          (newMapping as any).to = 0;
          break;
        case MappingType.RegexToText:
          (newMapping as any).pattern = '';
          break;
        case MappingType.SpecialValue:
          (newMapping as any).match = 'null';
          break;
      }

      updateMapping(index, newMapping);
    };

    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
        <Select
          value={mapping.type}
          options={mappingTypes}
          onChange={(e) => e.value && updateType(e.value)}
          width={20}
        />

        {mapping.type === MappingType.ValueToText && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              width={20}
              value={String((mapping as ValueMap).value)}
              onChange={(e) => updateMapping(index, { ...mapping, value: e.currentTarget.value } as ValueMap)}
              placeholder="Value"
            />
            <div style={{ marginLeft: '4px' }}>
              <Tooltip
                content={
                  <div>
                    <p>Example values:</p>
                    <ul>
                      <li>error - Exact match for &quot;error&quot;</li>
                      <li>42 - Match the number 42</li>
                      <li>true - Match boolean true</li>
                      <li>warning - Match &quot;warning&quot; text</li>
                      <li>%red - Match text ending with &quot;red&quot;</li>
                      <li>pink% - Match text starting with &quot;pink&quot;</li>
                      <li>%indigo% - Match text containing &quot;indigo&quot;</li>
                    </ul>
                  </div>
                }
              >
                <Icon name="question-circle" />
              </Tooltip>
            </div>
          </div>
        )}

        {mapping.type === MappingType.RangeToText && (
          <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Input
                value={(mapping as any).from}
                type="number"
                step="any"
                width={15}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  updateMapping(index, {
                    ...mapping,
                    from: value === '' ? 0 : parseFloat(value),
                  } as ValueMapping);
                }}
                placeholder="From"
              />
              <Input
                value={(mapping as any).to}
                type="number"
                step="any"
                width={15}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  updateMapping(index, {
                    ...mapping,
                    to: value === '' ? 0 : parseFloat(value),
                  } as ValueMapping);
                }}
                placeholder="To"
              />
              <div style={{ marginLeft: '4px' }}>
                <Tooltip
                  content={
                    <div>
                      <p>Example ranges:</p>
                      <ul>
                        <li>0 to 50 - Match values in normal range</li>
                        <li>50 to 80 - Match values in warning range</li>
                        <li>80 to 100 - Match values in critical range</li>
                        <li>-10 to 0 - Match negative values</li>
                      </ul>
                    </div>
                  }
                >
                  <Icon name="question-circle" />
                </Tooltip>
              </div>
            </div>
          </>
        )}

        {mapping.type === MappingType.RegexToText && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              width={20}
              value={(mapping as any).pattern}
              onChange={(e) => updateMapping(index, { ...mapping, pattern: e.currentTarget.value } as ValueMapping)}
              placeholder="Pattern"
            />
            <div style={{ marginLeft: '4px' }}>
              <Tooltip
                content={
                  <div>
                    <p>Example patterns:</p>
                    <ul>
                      <li>^error.*$ - Matches text starting with &quot;error&quot;</li>
                      <li>\d+ - Matches one or more digits</li>
                      <li>[A-Z].* - Matches text starting with capital letter</li>
                      <li>(high|low) - Matches exactly &quot;high&quot; or &quot;low&quot;</li>
                    </ul>
                  </div>
                }
              >
                <Icon name="question-circle" />
              </Tooltip>
            </div>
          </div>
        )}

        {mapping.type === MappingType.SpecialValue && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Select
              width={20}
              value={(mapping as any).match}
              options={specialValueOptions}
              onChange={(e) => e.value && updateMapping(index, { ...mapping, match: e.value } as ValueMapping)}
            />
            <div style={{ marginLeft: '4px' }}>
              <Tooltip
                content={
                  <div>
                    <p>Special value types:</p>
                    <ul>
                      <li>Null - Match null values</li>
                      <li>NaN - Match NaN (Not a Number)</li>
                      <li>Null & NaN - Match either null or NaN</li>
                      <li>Empty - Match empty strings</li>
                    </ul>
                  </div>
                }
              >
                <Icon name="question-circle" />
              </Tooltip>
            </div>
          </div>
        )}

        <Select
          value={mapping.result.text}
          options={icons}
          onChange={(e) => {
            updateMapping(index, { ...mapping, result: { ...mapping.result, text: e.value ?? '' } });
          }}
          width={20}
        />

        <Icon name={toIconName(mapping.result.text) ?? 'check-square'} />

        <Button variant="destructive" size="sm" onClick={() => removeMapping(index)}>
          Remove
        </Button>

        {index === mappings.length - 1 && (
          <Button variant="success" size="sm" onClick={() => addMapping()}>
            Add
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div>{value.valueMappings.map(renderMappingInput)}</div>
    </div>
  );
};
