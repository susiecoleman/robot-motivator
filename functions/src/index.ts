import { RegisterUpdate, Suggestions, dialogflow } from 'actions-on-google';
import {
  finishUpdateSetupUpdateUserData,
  welcomeIntentUpdateUserData,
} from './userDataUpdates';

import { UserData } from './models';
import { region } from 'firebase-functions';

const app = dialogflow<{}, UserData>({
  debug: true,
});

app.intent('welcome_intent', conv => {
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
    const numberOfUses: number = conv.user.storage.numberOfUses || 0;
    // Ask user every 5 uses
    if (numberOfUses % 5 === 0) {
      conv.ask('Would you like to add motivational tips to your routine?');
      conv.ask(new Suggestions('Add to Routine', 'no'));
    }
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
