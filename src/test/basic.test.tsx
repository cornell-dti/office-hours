import { expect } from 'chai';
import 'mocha';
import { firestore } from '../firebase';

const hello = () => {
    return "Hello World!";
}

describe('Hello function', function() {
    it('should return hello world', function() {
        expect(hello()).to.equal('Hello World!');
    });
});