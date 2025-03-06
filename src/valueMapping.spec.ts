import { MappingType, ValueMapping } from 'types';
import { findMatch } from './valueMapping';

describe('applyValueMapping', () => {
  it('should return null when mappings are not provided', () => {
    expect(findMatch('test')).toBeNull();
    expect(findMatch('test', [])).toBeNull();
  });

  it('should correctly apply value to text mapping', () => {
    const mappings: ValueMapping[] = [
      {
        type: MappingType.ValueToText,
        value: 'office',
        result: { text: 'Office Space', color: '#ff0000' }
      }
    ];
    expect(findMatch('office', mappings)).toEqual({index: 0, result: { text: 'Office Space', color: '#ff0000' }});
    expect(findMatch('residential', mappings)).toBeNull();
  });

  it('should correctly apply range mapping', () => {
    const mappings: ValueMapping[] = [
      {
        type: MappingType.RangeToText,
        from: 0,
        to: 100,
        result: { text: 'Normal Range', color: '#00ff00' }
      }
    ];
    expect(findMatch(50, mappings)).toEqual({index: 0, result: { text: 'Normal Range', color: '#00ff00' }});
    expect(findMatch(-1, mappings)).toBeNull();
    expect(findMatch(101, mappings)).toBeNull();
    expect(findMatch('not a number', mappings)).toBeNull();
  });

  describe('regex mapping', () => {
    const regexMappings: ValueMapping[] = [
      {
        type: MappingType.RegexToText,
        pattern: '^test.*',
        result: { text: 'Test Match', color: '#0000ff' }
      }
    ];

    it('should correctly handle regex patterns', () => {
      expect(findMatch('test123', regexMappings)).toEqual({index: 0, result: { text: 'Test Match', color: '#0000ff' }});
      // Test failing regex match
      expect(findMatch('best123', regexMappings)).toBeNull();
      
      // Test with invalid regex pattern
      const invalidRegexMapping: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '[', // Invalid regex pattern
          result: { text: 'Invalid Regex', color: '#0000ff' }
        }
      ];
      expect(findMatch('test', invalidRegexMapping)).toBeNull();
    });

    it('should handle non-string values', () => {
      const inputs = [
        123,            // number
        true,           // boolean
        undefined,      // undefined
        null,          // null
        {},            // object
        [],            // array
        Symbol('test') // symbol
      ];

      inputs.forEach(input => {
        expect(findMatch(input, regexMappings)).toBeNull();
      });
    });

    it('should handle non-string values in regex mapping', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^1.*',
          result: { text: 'Starts with 1', color: '#0000ff' }
        }
      ];
      expect(findMatch(123, mappings)).toBeNull();
      expect(findMatch(null, mappings)).toBeNull();
      expect(findMatch(undefined, mappings)).toBeNull();
      expect(findMatch({}, mappings)).toBeNull();
    });

    it('should handle string coercion for regex mapping', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^1.*',
          result: { text: 'Starts with 1', color: '#0000ff' }
        }
      ];
      // Test type coercion for stringifiable values
      expect(findMatch('123', mappings)).toEqual({index: 0, result: { text: 'Starts with 1', color: '#0000ff' }});
      expect(findMatch(true, mappings)).toBeNull();
      expect(findMatch([1,2,3], mappings)).toBeNull();
    });

    it('should handle both valid and invalid regex patterns', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '[abc]', // valid regex
          result: { text: 'ABC Match', color: '#0000ff' }
        },
        {
          type: MappingType.RegexToText,
          pattern: '[', // invalid regex
          result: { text: 'Invalid', color: '#ff0000' }
        }
      ];
      
      // Test valid regex first
      expect(findMatch('a', mappings)).toEqual({index: 0, result: { text: 'ABC Match', color: '#0000ff' }});
      expect(findMatch('d', mappings)).toBeNull();
      
      // Now test that we continue past invalid regex
      const invalidFirstMapping: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '[', // invalid regex
          result: { text: 'Invalid', color: '#ff0000' }
        },
        {
          type: MappingType.RegexToText,
          pattern: '[abc]', // valid regex
          result: { text: 'ABC Match', color: '#0000ff' }
        }
      ];
      
      // Should skip invalid regex and match on valid one
      expect(findMatch('a', invalidFirstMapping)).toEqual({index: 1, result: { text: 'ABC Match', color: '#0000ff' }});
    });

    it('should handle multiple regex patterns in sequence', () => {
      const mixedMappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '[', // invalid regex - should be skipped
          result: { text: 'Invalid', color: '#ff0000' }
        },
        {
          type: MappingType.ValueToText,
          value: 'test',
          result: { text: 'Test Value', color: '#00ff00' }
        },
        {
          type: MappingType.RegexToText,
          pattern: '^[0-9]+$', // valid regex
          result: { text: 'Number', color: '#0000ff' }
        }
      ];

      // Should skip invalid regex, skip value mapping, and match valid regex
      expect(findMatch('123', mixedMappings)).toEqual({index: 2, result: { text: 'Number', color: '#0000ff' }});
      // Should not match any pattern
      expect(findMatch('abc', mixedMappings)).toBeNull();
    });

    it('should handle non-matching valid strings', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^test.*',
          result: { text: 'Test Match', color: '#0000ff' }
        }
      ];
      
      // This is a valid string but doesn't match the pattern
      // This should hit both the string type check and the non-matching regex case
      expect(findMatch('not-a-test', mappings)).toBeNull();
    });

    it('should proceed to next mapping after regex non-match', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^test.*',
          result: { text: 'Test Match', color: '#0000ff' }
        },
        {
          type: MappingType.ValueToText,
          value: 'not-a-test',
          result: { text: 'Direct Match', color: '#00ff00' }
        }
      ];
      
      // Should not match regex but match the value mapping
      expect(findMatch('not-a-test', mappings)).toEqual({index: 1, result: { text: 'Direct Match', color: '#00ff00' }});
    });

    it('should immediately return on first regex match', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^[a-z]+$',
          result: { text: 'Letters Only', color: '#0000ff' }
        },
        {
          type: MappingType.RegexToText,
          pattern: '^test',
          result: { text: 'Test Match', color: '#00ff00' }
        }
      ];
      
      // Should match first pattern and return immediately
      expect(findMatch('abc', mappings)).toEqual({index: 0, result: { text: 'Letters Only', color: '#0000ff' }});
      
      // Should not match first pattern but match second
      expect(findMatch('test123', mappings)).toEqual({index: 1, result: { text: 'Test Match', color: '#00ff00' }});
      
      // Should not match any pattern and return null after trying all
      expect(findMatch('123', mappings)).toBeNull();
    });

    it('should handle complex regex patterns and continue to next mapping', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^\\d+$',
          result: { text: 'Numbers', color: '#0000ff' }
        },
        {
          type: MappingType.ValueToText,
          value: 'abc',
          result: { text: 'Letters', color: '#00ff00' }
        }
      ];

      // Test numeric string with regex
      expect(findMatch('123', mappings)).toEqual({index: 0, result: { text: 'Numbers', color: '#0000ff' }});
      
      // Test non-matching string that matches next mapping
      expect(findMatch('abc', mappings)).toEqual({index: 1, result: { text: 'Letters', color: '#00ff00' }});
    });

    it('should handle regex pattern test returning false', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^prefix.*$',
          result: { text: 'Prefix Match', color: '#0000ff' }
        },
        {
          type: MappingType.ValueToText,
          value: 'test',
          result: { text: 'Fallback', color: '#00ff00' }
        }
      ];
      
      const testStr = 'test'; // valid string that won't match the regex
      expect(findMatch(testStr, mappings)).toEqual({index: 1, result: { text: 'Fallback', color: '#00ff00' }});

      const testStr2 = 'prefix-test'; // valid string that matches the regex
      expect(findMatch(testStr2, mappings)).toEqual({index: 0, result: { text: 'Prefix Match', color: '#0000ff' }});
    });

    it('should skip mapping with invalid regex and match subsequent valid mapping', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '(', // invalid regex pattern that throws an error
          result: { text: 'Should be skipped', color: '#ff0000' }
        },
        {
          type: MappingType.RegexToText,
          pattern: '^valid.*',
          result: { text: 'Valid Match', color: '#00ff00' }
        }
      ];
      expect(findMatch('valid input', mappings)).toEqual({index: 1, result: { text: 'Valid Match', color: '#00ff00' }});
    });

    it('should not match anything when pattern is empty', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '',
          result: { text: 'Should Not Match', color: '#ff0000' }
        }
      ];
      expect(findMatch('test', mappings)).toBeNull();
      expect(findMatch('', mappings)).toBeNull();
      expect(findMatch('123', mappings)).toBeNull();
    });

  });

  it('should correctly apply special value mapping', () => {
    const mappings: ValueMapping[] = [
      {
        type: MappingType.SpecialValue,
        match: 'null',
        result: { text: 'No Value', color: '#999999' }
      },
      {
        type: MappingType.SpecialValue,
        match: 'nan',
        result: { text: 'Not a Number', color: '#999999' }
      },
      {
        type: MappingType.SpecialValue,
        match: 'null+nan',
        result: { text: 'No Valid Value', color: '#999999' }
      },
      {
        type: MappingType.SpecialValue,
        match: 'empty',
        result: { text: 'Empty String', color: '#999999' }
      }
    ];

    expect(findMatch(null, mappings)).toEqual({index: 0, result: { text: 'No Value', color: '#999999' }});
    expect(findMatch(NaN, mappings)).toEqual({index: 1, result: { text: 'Not a Number', color: '#999999' }});
    expect(findMatch('', mappings)).toEqual({index: 3, result: { text: 'Empty String', color: '#999999' }});
  });

  it('should try all mappings in order until a match is found', () => {
    const mappings: ValueMapping[] = [
      {
        type: MappingType.ValueToText,
        value: 'office',
        result: { text: 'Office Space', color: '#ff0000' }
      },
      {
        type: MappingType.RegexToText,
        pattern: '.*office.*',
        result: { text: 'Contains Office', color: '#00ff00' }
      }
    ];

    expect(findMatch('office', mappings)).toEqual({index: 0, result: { text: 'Office Space', color: '#ff0000' }});
    expect(findMatch('my office', mappings)).toEqual({index: 1, result: { text: 'Contains Office', color: '#00ff00' }});
  });

  describe('mixed mapping types', () => {
    it('should handle all mapping types in sequence', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '\\d+',
          result: { text: 'Number Match', color: '#0000ff' }
        },
        {
          type: MappingType.ValueToText,
          value: 'test',
          result: { text: 'Value Match', color: '#00ff00' }
        },
        {
          type: MappingType.RangeToText,
          from: 1,
          to: 10,
          result: { text: 'Range Match', color: '#ff0000' }
        }
      ];

      // Test regex match
      expect(findMatch('123', mappings)).toEqual({index: 0, result: { text: 'Number Match', color: '#0000ff' }});
      
      // Test regex non-match, falls through to value match
      expect(findMatch('test', mappings)).toEqual({index: 1, result: { text: 'Value Match', color: '#00ff00' }});
      
      // Test regex non-match, value non-match, falls through to number range
      expect(findMatch(5, mappings)).toEqual({index: 2, result: { text: 'Range Match', color: '#ff0000' }});
      
      // Test no matches
      expect(findMatch('none', mappings)).toBeNull();
    });
  });

  describe('debug mode tests', () => {
    const originalEnv = process.env.DEBUG_VALUE_MAP;

    beforeEach(() => {
      process.env.DEBUG_VALUE_MAP = 'true';
    });

    afterEach(() => {
      process.env.DEBUG_VALUE_MAP = originalEnv;
    });

    it('should handle debug logging for regex matches and non-matches', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '^test.*',
          result: { text: 'Test Match', color: '#0000ff' }
        }
      ];
      
      // This will trigger the debug logging for successful match
      expect(findMatch('test123', mappings)).toEqual({index: 0, result: { text: 'Test Match', color: '#0000ff' }});
      
      // This will trigger the debug logging for non-match
      expect(findMatch('no-match', mappings)).toBeNull();
      
      // This will trigger the debug logging for invalid regex
      const invalidMapping: ValueMapping[] = [
        {
          type: MappingType.RegexToText,
          pattern: '[',
          result: { text: 'Invalid', color: '#ff0000' }
        }
      ];
      expect(findMatch('test', invalidMapping)).toBeNull();
    });
  });

  describe('special value mapping edge cases', () => {
    it('should handle null+nan special value mapping', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.SpecialValue,
          match: 'null+nan',
          result: { text: 'Missing or Invalid', color: '#999999' }
        }
      ];
      
      // Test null case
      expect(findMatch(null, mappings)).toEqual({index: 0, result: { text: 'Missing or Invalid', color: '#999999' }});
      
      // Test NaN case
      expect(findMatch(NaN, mappings)).toEqual({index: 0, result: { text: 'Missing or Invalid', color: '#999999' }});
      
      // Test non-matching case
      expect(findMatch(123, mappings)).toBeNull();
    });

    it('should handle all special value mapping cases', () => {
      const mappings: ValueMapping[] = [
        {
          type: MappingType.SpecialValue,
          match: 'null',
          result: { text: 'Null', color: '#999999' }
        },
        {
          type: MappingType.SpecialValue,
          match: 'nan',
          result: { text: 'NaN', color: '#999999' }
        },
        {
          type: MappingType.SpecialValue,
          match: 'null+nan',
          result: { text: 'Missing or Invalid', color: '#999999' }
        },
        {
          type: MappingType.SpecialValue,
          match: 'empty',
          result: { text: 'Empty', color: '#999999' }
        }
      ];

      // Test each special value type
      expect(findMatch(null, mappings)).toEqual({index: 0, result: { text: 'Null', color: '#999999' }});
      expect(findMatch(NaN, mappings)).toEqual({index: 1, result: { text: 'NaN', color: '#999999' }});
      expect(findMatch('', mappings)).toEqual({index: 3, result: { text: 'Empty', color: '#999999' }});
      
      // Test non-matching cases
      expect(findMatch('not-empty', mappings)).toBeNull();
      expect(findMatch(0, mappings)).toBeNull();
      expect(findMatch(false, mappings)).toBeNull();
    });
  });
});
