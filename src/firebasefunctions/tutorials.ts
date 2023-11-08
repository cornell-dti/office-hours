import { firestore } from '../firebase';

export const updateStudentTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ studentTutorial: tutorial });
}
export const updateTaTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ taTutorial: tutorial });
}
export const updateProfTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ profTutorial: tutorial });
}