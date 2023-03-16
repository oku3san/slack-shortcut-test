const { App, AwsLambdaReceiver, LogLevel } = require('@slack/bolt');

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  logLevel: LogLevel.DEBUG,
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

// セレクトボックスを表示する
const view = {
  type: "modal",
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
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "起動対象を選択してください",
        },
        options: options,
        action_id: "button_click",
      },
      label: {
        type: "plain_text",
        text: "起動対象を選択してください",
      }
    }
  ]
}

app.shortcut('up', async ({ shortcut, ack, context }) => {
  await ack();

  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: view,
    });
    console.log(result);
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

app.action('button_click', async ({ ack, body, context }) => {
  await ack();

  try {
    const selectedOption = body.actions[0].selected_option;
    console.log(selectedOption.value);
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

// Listens to incoming messages that contain "goodbye"
// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
}
