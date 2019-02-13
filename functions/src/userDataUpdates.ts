import { UserData } from './models';

const welcomeIntentUpdateUserData = (userData: UserData) => {
  const numberOfUses =
    userData.numberOfUses === undefined ? 1 : (userData.numberOfUses += 1);
  userData.numberOfUses = numberOfUses;
};

const finishUpdateSetupUpdateUserData = (
  userData: UserData,
  updateSuccessful: boolean
) => {
  userData.addedToRoutine = updateSuccessful;
};

export { welcomeIntentUpdateUserData, finishUpdateSetupUpdateUserData };
