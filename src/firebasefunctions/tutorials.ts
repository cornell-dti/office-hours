import { firestore } from '../firebase';

/**
 * Updates the student tutorial field to the given tutorial value for the user in the firebase
 * If true, shows the student tutorial. If false, hides the student tutorial.
 * @param user - QueueMeIn user
 * @param tutorial - sets the student tutorial to true (will show) or false (will not show)
 */
export const updateStudentTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ studentTutorial: tutorial });
}

/**
 * Updates the ta tutorial field to the given tutorial value for the user in the firebase
 * If true, shows the ta tutorial. If false, hides the student tutorial.
 * @param user - QueueMeIn user
 * @param tutorial - sets the student tutorial to true (will show) or false (will not show)
 */
export const updateTaTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ taTutorial: tutorial });
}

/**
 * Updates the professor tutorial field to the given tutorial value for the user in the firebase
 * If true, shows the ta tutorial. If false, hides the student tutorial.
 * @param user - QueueMeIn user
 * @param tutorial - sets the student tutorial to true (will show) or false (will not show)
 */
export const updateProfTutorial = (
  user: FireUser | undefined,
  tutorial: boolean) => {
  firestore.collection('users').doc(user?.userId).update({ profTutorial: tutorial });
}