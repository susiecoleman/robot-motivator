# Robot Motivator

Google Action to experiment with how daily notifications work.

## Set up

This is the firebase function back end of the Action. There is also the `RobotMotivator.zip` file that provides the Dialogflow aspect of the project. In Dialogflow it is possible to restore a project from a zip file. Also automatic discovery flow needs to be added in the Actions console for the intent that will fulfill the notification. In this case the intent is `motivator` [tutorial](https://developers.google.com/actions/assistant/updates/daily).

### Environment Variables

This project requires environment variables. Run `firebase functions:config:get > .runtimeconfig.json` in the `functions` directory to run the function locally.

The environment variables are:
`robotmotivator.databaseurl`

The project also requires a file called `robot-motivator-firebase-admin.json` in the root of the project which contains the service account key required to interact with a realtime database as an [admin](https://firebase.google.com/docs/database/admin/start).
