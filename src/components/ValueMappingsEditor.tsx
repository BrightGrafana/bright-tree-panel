import React, { useState } from 'react';
import { Button, ColorPicker, Field, Input, Select, Tooltip, Icon } from '@grafana/ui';
import { MappingType, ValueMapping, ValueMappings, ValueMap } from '../types';
import { SelectableValue } from '@grafana/data';

interface Props {
  value: ValueMappings;
  onChange: (value: ValueMappings) => void;
}

export const ValueMappingsEditor: React.FC<Props> = ({ value = {}, onChange }) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');

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

  const addMapping = (column: string) => {
    const trimmedColumn = column.trim();
    if (!trimmedColumn) {
      return;
    }

    const newValue = { ...value };
    if (!newValue[trimmedColumn]) {
      newValue[trimmedColumn] = [];
    }
    newValue[trimmedColumn].push({
      type: MappingType.ValueToText,
      value: '',
      result: { text: '' },
    });
    onChange(newValue);
    setSelectedColumn('');
  };

  const updateMapping = (column: string, index: number, mapping: ValueMapping) => {
    const trimmedColumn = column.trim();
    const newValue = { ...value };

    // Handle value conversion for Range mapping type
    if (mapping.type === MappingType.RangeToText) {
      const rangeMapping = mapping as any;
      if (typeof rangeMapping.from === 'string') {
        rangeMapping.from = parseFloat(rangeMapping.from) || 0;
      }
      if (typeof rangeMapping.to === 'string') {
        rangeMapping.to = parseFloat(rangeMapping.to) || 0;
      }
    }

    newValue[trimmedColumn][index] = mapping;
    onChange(newValue);
  };

  const removeMapping = (column: string, index: number) => {
    const trimmedColumn = column.trim();
    const newValue = { ...value };
    newValue[trimmedColumn].splice(index, 1);
    if (newValue[trimmedColumn].length === 0) {
      delete newValue[trimmedColumn];
    }
    onChange(newValue);
  };

  const renderMappingInput = (mapping: ValueMapping, column: string, index: number) => {
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

      updateMapping(column, index, newMapping);
    };

    return (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
        <Select
          value={mapping.type}
          options={mappingTypes}
          onChange={e => e.value && updateType(e.value)}
          width={20}
        />

        {mapping.type === MappingType.ValueToText && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Input
              width={20}
              value={String((mapping as ValueMap).value)}
              onChange={e =>
                updateMapping(column, index, { ...mapping, value: e.currentTarget.value } as ValueMap)
              }
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
                onChange={e => {
                  const value = e.currentTarget.value;
                  updateMapping(column, index, {
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
                onChange={e => {
                  const value = e.currentTarget.value;
                  updateMapping(column, index, {
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
              onChange={e =>
                updateMapping(column, index, { ...mapping, pattern: e.currentTarget.value } as ValueMapping)
              }
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
              onChange={e =>
                e.value &&
                updateMapping(column, index, { ...mapping, match: e.value } as ValueMapping)
              }
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

        <Input
          width={20}
          value={mapping.result.text}
          onChange={e =>
            updateMapping(column, index, {
              ...mapping,
              result: { ...mapping.result, text: e.currentTarget.value },
            })
          }
          placeholder="Display text"
        />

        <ColorPicker
          color={mapping.result.color || ''}
          onChange={color =>
            updateMapping(column, index, {
              ...mapping,
              result: { ...mapping.result, color },
            })
          }
        />

        <Button variant="destructive" size="sm" onClick={() => removeMapping(column, index)}>
          Remove
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Field label="Column">
        <Input
          value={selectedColumn}
          onChange={e => setSelectedColumn(e.currentTarget.value)}
          placeholder="Enter column name"
          addonAfter={
            <Button onClick={() => selectedColumn && addMapping(selectedColumn)} variant="secondary">
              Add mapping
            </Button>
          }
        />
      </Field>

      {Object.entries(value || {}).map(([column, mappings]: [string, ValueMapping[]]) => (
        <Field key={column} label={`Mappings for ${column}`}>
          <div>{mappings.map((m: ValueMapping, i: number) => renderMappingInput(m, column, i))}</div>
        </Field>
      ))}
    </div>
  );
};
