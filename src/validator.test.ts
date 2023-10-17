import { Validator } from 'validator';
import { Node } from './models';

describe('Validator', () => {
    describe('validateTreeInput', () => {
        it('should throw error if ids are duplicated', () => {
            // arrange
            const input: Node[] = [
                { id: '1', name: 'n1', children: [] },
                { id: '1', name: 'n1', children: [] },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Duplicated ID found for: 1');
        });

        it('should throw error if ids are duplicated in child nodes', () => {
            // arrange
            const input: Node[] = [
                { id: '0', name: 'n0' },
                { id: '1', name: 'n1', children: [{ id: '1', name: 'n1', children: [] }] },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Duplicated ID found for: 1');
        });
    });
});
// id, label, parent
// 1, n1,
// 2, n2, 1
// 3, , 1
// 3, , 1
// 4, n4n,3
