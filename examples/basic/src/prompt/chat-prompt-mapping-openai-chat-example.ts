import dotenv from "dotenv";
import {
  OpenAIChatChatPromptFormat,
  OpenAIChatModel,
  streamText,
} from "modelfusion";

dotenv.config();

(async () => {
  const textStream = await streamText(
    new OpenAIChatModel({
      model: "gpt-3.5-turbo",
    }).withPromptFormat(OpenAIChatChatPromptFormat()),
    [
      { system: "You are a celebrated poet." },
      { user: "Write a short story about a robot learning to love." },
      { ai: "Once upon a time, there was a robot who learned to love." },
      { user: "That's a great start!" },
    ]
  );

  for await (const textFragment of textStream) {
    process.stdout.write(textFragment);
  }
})();
