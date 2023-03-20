const { App, AwsLambdaReceiver,LogLevel } = require('@slack/bolt');

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
  logLevel: LogLevel.DEBUG
});



const options = [
  { text: { type: 'plain_text', text: 'オプション' }, value: 'value1' },
  { text: { type: 'plain_text', text: 'オプション' }, value: 'value2' },
];

const view = {
  type: 'modal',
  callback_id: 'submit',
  title: { type: 'plain_text', text: 'あげる' },
  submit: { type: 'plain_text', text: 'Submit' },
  close: { type: 'plain_text', text: 'Cancel' },
  blocks: [
    {
      type: 'input',
      block_id: 'name',
      element: {
        type: 'static_select',
        placeholder: { type: 'plain_text', text: '起動対象を選択してください' },
        options,
        action_id: 'select_input_action',
      },
      label: { type: 'plain_text', text: '起動対象を選択してください' },
    },
  ],
};

const handleShortcut = async ({ shortcut, ack, context, client }) => {
  try {
    await ack();
    await client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view,
    });
  } catch (error) {
    console.error(error);
    app.error(error);
  }
};

const handleViewSubmit = async ({ ack, body, context, client, view }) => {
  try {
    await ack();
    const value = view.state.values.name.select_input_action.selected_option.value;
    const result = await client.conversations.open({ users: body.user.id });
    await client.chat.postMessage({ channel: result.channel.id, text: value });
  } catch (error) {
    console.error(error);
    app.error(error);
  }
};

app.shortcut('up', handleShortcut);
app.view('submit', handleViewSubmit);

module.exports.handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};
