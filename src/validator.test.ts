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

        it('should throw error if ids are duplicated', () => {
            // arrange
            const input: Node[] = [
                { id: '1', name: 'n1', children: [] },
                { id: '2', name: 'n2', children: [], parent: '3' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Parent not found for id 2 parent 3');
        });

        it('should throw error if parent matches id', () => {
            // arrange
            const input: Node[] = [
                { id: '1', name: 'n1', children: [] },
                { id: '2', name: 'n2', children: [], parent: '2' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Parent can not be mapped to it self. for: 2');
        });

        xit('should throw error if detached branch is found', () => {
            // arrange
            const input: Node[] = [
                { id: '1', name: 'n1', children: [], parent: '2' },
                { id: '2', name: 'n2', children: [], parent: '1' },
            ];

            // act
            const result = () => Validator.validateTreeInput(input);

            // assert
            expect(result).toThrowError('Detached branch detected for: 1');
        });

        // try to test Cyclical loop
    });
});
