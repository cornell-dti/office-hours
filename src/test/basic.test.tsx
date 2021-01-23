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

// describe('Unknown Question', function() {
//     it('should not exist', async function() {
//         // Set a long timeout of 5s because it takes quite long on CI server
//         this.timeout(5000);

//         // Expect question one to not exist
//         const questionOne = firestore.collection('questions').doc("1").get();
//         const result = await questionOne

//         expect(result.exists).to.be.false;

//         return Promise.resolve();
//     });
// });
