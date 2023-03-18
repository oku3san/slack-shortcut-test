const { App, AwsLambdaReceiver, LogLevel } = require('@slack/bolt');

// initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  // logLevel: LogLevel.DEBUG,
});

const options = [
  {
    text: {
      type: 'plain_text',
      text: 'オプション1',
    },
    value: 'value1',
  },
  {
    text: {
      type: 'plain_text',
      text: 'オプション2',
    },
    value: 'value2',
  },
];

// セレクトボックスを表示する view object
const view = {
  type: "modal",
  callback_id: "submit",
  title: {
    type: "plain_text",
    text: "あげる",
  },
  submit: {
    type: "plain_text",
    text: "Submit",
  },
  close: {
    type: "plain_text",
    text: "Cancel",
  },
  blocks: [
    {
      type: "input",
      block_id: 'name',
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "起動対象を選択してください",
        },
        options: options,
        action_id: "select_input_action",
      },
      label: {
        type: "plain_text",
        text: "起動対象を選択してください",
      }
    }
  ]
}

// This will show the view in response to the up shortcut
app.shortcut('up', async ({ shortcut, ack, context }) => {
  await ack();

  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: view,

    });
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

// This will handle the submission of the view with the select input
app.view('submit', async ({ ack, body, view }) => {
  await ack();
  try {
    const values = view.state.values
    const selectedValue = values.name.select_input_action.selected_option.value;
    console.log(selectedValue);
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
