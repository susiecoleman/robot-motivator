import { RegisterUpdate, Suggestions, dialogflow } from 'actions-on-google';
import { config, region } from 'firebase-functions';
import { credential, database, initializeApp } from 'firebase-admin';
import {
  finishUpdateSetupUpdateUserData,
  welcomeIntentUpdateUserData,
} from './userDataUpdates';

import { UserData } from './models';
import serviceAccount from '../robot-motivator-firebase-admin.json';

const app = dialogflow<{}, UserData>({
  debug: true,
});

const appConfig = config().robotmotivator;
const db = database(
  initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: appConfig.databaseurl,
  })
);

app.intent('welcome_intent', conv => {
  db;
  // db.ref('users/' + userId).once('value', snapshot => {
  //   if (snapshot.exists()) {
  //     console.log('The user is here');
  //   } else {
  //     console.log('Time to add a user');
  //     db.ref('users/' + userId).set({
  //       username: 'susie2',
  //     });
  //   }
  // });

  conv.ask(
    "I can motivate you. Tell me your name and I'll give you a motivational tip"
  );
  welcomeIntentUpdateUserData(conv.user.storage);
});

app.intent<{ name: string }>('motivator', (conv, { name }) => {
  const motivationalStatement = `You can do anything you want ${name}! Your robot motivator believes in you`;
  if (conv.user.storage.addedToRoutine) {
    conv.close(motivationalStatement);
  } else {
    conv.ask(motivationalStatement);
    conv.ask('Would you like to add motivational tips to your routine?');
    conv.ask(new Suggestions('Add to Routine', 'no'));
  }
});

app.intent<{ name: string }>('setup_routine', (conv, input) => {
  const x = input.name;
  conv.ask(
    new RegisterUpdate({
      intent: 'motivator',
      arguments: [{ name: 'name', textValue: x }],
      frequency: 'ROUTINES',
    })
  );
});

app.intent<{}, { status: string }>(
  'finish_update_setup',
  (conv, params, registered) => {
    const updateSuccessful = registered && registered.status === 'OK';
    if (updateSuccessful) {
      conv.close(`Ok, this has been added to your routine.`);
    } else {
      conv.close(
        `Sorry something went wrong I couldn't add that to your routine.`
      );
    }
    finishUpdateSetupUpdateUserData(conv.user.storage, updateSuccessful);
  }
);

app.intent('no_daily_update', conv => {
  conv.close('No problem, come back any time for more motivation!');
});

exports.robotMotivator = region('europe-west1').https.onRequest(app);
