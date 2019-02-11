// import firebase from 'firebase-admin';
import * as functions from 'firebase-functions';

import { RegisterUpdate, Suggestions, dialogflow } from 'actions-on-google';

// import uuid from 'uuid/v4';

// import serviceAccount from '../robot-motivator-firebase-admin.json';

interface UserData {
  id?: string;
}

const app = dialogflow<{}, UserData>({
  debug: true,
});

// const config = functions.config().robotmotivator;
// const database = firebase.database(
//   firebase.initializeApp({
//     credential: firebase.credential.cert(serviceAccount),
//     databaseURL: config.databaseurl,
//   })
// );

app.intent('welcome_intent', conv => {
  // const userId = uuid();
  // database.ref('users/' + userId).once('value', snapshot => {
  //   if (snapshot.exists()) {
  //     console.log('The user is here');
  //   } else {
  //     console.log('Time to add a user');
  //     database.ref('users/' + userId).set({
  //       username: 'susie2',
  //     });
  //   }
  // });
  conv.ask(
    "I can motivate you. Tell me your name and I'll give you a motivational tip"
  );
});

app.intent<{ name: string }>('motivator', (conv, { name }) => {
  conv.ask(
    `You can do anything you want ${name}! Your robot motivator believes in you`
  );
  conv.ask('Would you like to add motivational tips to your routine?');
  conv.ask(new Suggestions('Add to Routine', 'no'));
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
    if (registered && registered.status === 'OK') {
      conv.close(`Ok, this has been added to your routine.`);
    } else {
      conv.close(
        `Sorry something went wrong I couldn't add that to your routine.`
      );
    }
  }
);

app.intent('no_daily_update', conv => {
  conv.close('No problem, come back any time for more motivation!');
});

exports.robotMotivator = functions.region('europe-west1').https.onRequest(app);
