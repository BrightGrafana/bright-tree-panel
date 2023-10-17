import { Validator } from 'validator';
import { RawNode } from './models';

describe('Validator', () => {
    describe('validateTreeInput', () => {
        it('should throw error if ids are duplicated', () => {
            // arrange
            const input: RawNode[] = [
                { id: '1', name: 'n1' },
                { id: '1', name: 'n1' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Duplicated ID found for: 1');
        });

        it('should throw error if ids are duplicated', () => {
            // arrange
            const input: RawNode[] = [
                { id: '1', name: 'n1' },
                { id: '2', name: 'n2', parent: '3' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Parent not found for id 2 parent 3');
        });

        it('should throw error if parent matches id', () => {
            // arrange
            const input: RawNode[] = [
                { id: '1', name: 'n1' },
                { id: '2', name: 'n2', parent: '2' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Parent can not be mapped to it self. for: 2');
        });
    });
    describe('validateTreeBranches', () => {
        it('should throw error if detached branch is found', () => {
            // arrange
            const input: RawNode[] = [
                { id: '1', name: 'n1', parent: undefined },
                { id: '2', name: 'n2', parent: '3' },
                { id: '3', name: 'n3', parent: '2' },
            ];

            // act
            const result = () => Validator.validateTreeBranches(input, [
                { id: '1', name: 'n1', parent: undefined, children: [] }]);

            // assert
            expect(result).toThrowError('Detached branch detected for id: 2');
        });
    });
});
