import { MappingType, RangeMap, RegexMap, SpecialValueMap, ValueMap, ValueMapping } from './types';

function normalizeString(value: any): string {
  return String(value).trim();
}

export function match(value: any, valueMapping: ValueMapping) {
  switch (valueMapping.type) {
    case MappingType.ValueToText:
      const searchTerm = normalizeString((valueMapping as ValueMap).value).toLowerCase();
      const inputValue = normalizeString(value).toLowerCase();
      if (searchTerm.startsWith('%') && searchTerm.endsWith('%')) {
        if (inputValue.includes(searchTerm.slice(1, -1))) {
          return valueMapping.result;
        }
      }
      if (searchTerm.startsWith('%') && !searchTerm.endsWith('%')) {
        if (inputValue.endsWith(searchTerm.slice(1))) {
          return valueMapping.result;
        }
      }
      if (!searchTerm.startsWith('%') && searchTerm.endsWith('%')) {
        if (inputValue.startsWith(searchTerm.slice(0, -1))) {
          return valueMapping.result;
        }
      }
      if (searchTerm === inputValue) {
        return valueMapping.result;
      }
      break;
    case MappingType.RangeToText:
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (
        typeof numValue === 'number' &&
        !isNaN(numValue) &&
        numValue >= (valueMapping as RangeMap).from &&
        numValue <= (valueMapping as RangeMap).to
      ) {
        return valueMapping.result;
      }
      break;
    case MappingType.RegexToText:
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        const pattern = (valueMapping as RegexMap).pattern;
        if (!pattern) {
          break;
        }
        try {
          const regex = new RegExp(pattern);
          if (regex.test(trimmedValue)) {
            return valueMapping.result;
          }
        } catch (e) {
          // Invalid regex pattern, skip this mapping
          throw e;
        }
      }
      break;
    case MappingType.SpecialValue:
      const specialMap = valueMapping as SpecialValueMap;
      switch (specialMap.match) {
        case 'null':
          if (value === null) {
            return valueMapping.result;
          }
          break;
        case 'nan':
          if (typeof value === 'number' && isNaN(value)) {
            return valueMapping.result;
          }
          break;
        case 'null+nan':
          if (value === null || (typeof value === 'number' && isNaN(value))) {
            return valueMapping.result;
          }
          break;
        case 'empty':
          if (typeof value === 'string' && value.trim() === '') {
            return valueMapping.result;
          }
          break;
        case 'always':
          return valueMapping.result;
      }
      break;
  }
  return null;
}

export function findMatch(value?: unknown, mappings?: ValueMapping[]) {
  if (value === undefined) {
    return null;
  }
  if (mappings === undefined) {
    return null;
  }
  for (const { index, valueMapping } of mappings.map((valueMapping, index) => ({ index, valueMapping }))) {
    try {
      const result = match(value, valueMapping);
      if (result !== null) {
        return { result, index };
      }
    } catch (_: unknown) {}
  }
  return null;
}

export function hasMatch(value?: unknown, mappings?: ValueMapping[]) {
  if (value === undefined) {
    return false;
  }
  if (mappings === undefined) {
    return false;
  }
  for (const valueMapping of mappings) {
    try {
      const result = match(value, valueMapping);
      if (result !== null) {
        return true;
      }
    } catch (_: unknown) {}
  }
  return false;
}
