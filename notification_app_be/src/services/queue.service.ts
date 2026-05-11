import amqp from "amqplib";

const QUEUE = "notifications";

export async function publishJob(
  data: any
) {
  const connection =
    await amqp.connect("amqp://localhost");

  const channel =
    await connection.createChannel();

  await channel.assertQueue(QUEUE);

  channel.sendToQueue(
    QUEUE,
    Buffer.from(JSON.stringify(data))
  );
}

export async function consumeJobs() {
  const connection =
    await amqp.connect("amqp://localhost");

  const channel =
    await connection.createChannel();

  await channel.assertQueue(QUEUE);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(
      msg.content.toString()
    );

    console.log("Processing:", data);

    channel.ack(msg);
  });
}