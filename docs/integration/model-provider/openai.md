---
sidebar_position: 2
title: OpenAI
---

# OpenAI

## Setup

1. You can sign up for a developer account at [OpenAI](https://platform.openai.com/overview). You can then [create an API key](https://platform.openai.com/account/api-keys) for accessing the OpenAI API.
1. The API key can be configured as an environment variable (`OPENAI_API_KEY`) or passed in as an option into the model constructor.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/model-provider/openai)

### Generate Text

#### Text Model

[OpenAITextGenerationModel API](/api/classes/OpenAITextGenerationModel)

```ts
import { OpenAITextGenerationModel, generateText } from "modelfusion";

const text = await generateText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  "Write a short story about a robot learning to love:\n\n"
);
```

:::note
You can use your fine-tuned `davinci-002` and `babbage-002` models similarly to the base models. Learn more about [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning).
:::

#### Chat Model

The OpenAI chat models include GPT-3.5-turbo and GPT-4.

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, generateText } from "modelfusion";

const text = await generateText(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    maxCompletionTokens: 500,
  }),
  [
    OpenAIChatMessage.system(
      "Write a short story about a robot learning to love:"
    ),
  ]
);
```

:::note
You can use your fine-tuned `gpt-3.5-turbo` models similarly to the base models. Learn more about [OpenAI fine-tuning](https://platform.openai.com/docs/guides/fine-tuning).
:::

### Stream Text

#### Text Model

[OpenAITextGenerationModel API](/api/classes/OpenAITextGenerationModel)

```ts
import { OpenAITextGenerationModel, streamText } from "modelfusion";

const textStream = await streamText(
  new OpenAITextGenerationModel({
    model: "text-davinci-003",
    maxCompletionTokens: 1000,
  }),
  "You are a story writer. Write a story about a robot learning to love"
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

#### Chat Model

[OpenAIChatModel API](/api/classes/OpenAIChatModel)

```ts
import { OpenAIChatMessage, OpenAIChatModel, streamText } from "modelfusion";

const textStream = await streamText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
  [
    OpenAIChatMessage.system("You are a story writer. Write a story about:"),
    OpenAIChatMessage.user("A robot learning to love"),
  ]
);

for await (const textFragment of textStream) {
  process.stdout.write(textFragment);
}
```

### Generate JSON

#### Chat Model

JSON generation uses the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides a single function specification and instructs the model to provide parameters for calling the function. The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel) |
[OpenAIChatFunctionPrompt API](/api/modules/#openaichatfunctionprompt)

```ts
import {
  OpenAIChatFunctionPrompt,
  OpenAIChatMessage,
  OpenAIChatModel,
  generateJson,
} from "modelfusion";
import { z } from "zod";

const sentiment = await generateJson(
  new OpenAIChatModel({
    model: "gpt-3.5-turbo",
    temperature: 0,
    maxCompletionTokens: 50,
  }),
  {
    name: "sentiment" as const,
    description: "Write the sentiment analysis",
    schema: z.object({
      sentiment: z
        .enum(["positive", "neutral", "negative"])
        .describe("Sentiment."),
    }),
  },
  OpenAIChatFunctionPrompt.forSchemaCurried([
    OpenAIChatMessage.system(
      "You are a sentiment evaluator. " +
        "Analyze the sentiment of the following product review:"
    ),
    OpenAIChatMessage.user(
      "After I opened the package, I was met by a very unpleasant smell " +
        "that did not disappear even after washing. Never again!"
    ),
  ])
);
```

### Generate JSON or Text

#### Chat Model

JSON generation uses the [OpenAI GPT function calling API](https://platform.openai.com/docs/guides/gpt/function-calling). It provides multiple function specifications and instructs the model to provide parameters for calling one of the functions, or to just return text (`auto`). The result is returned as parsed JSON.

[OpenAIChatModel API](/api/classes/OpenAIChatModel) |
[OpenAIChatFunctionPrompt API](/api/modules/#openaichatfunctionprompt)

```ts
const { schema, value, text } = await generateJsonOrText(
  new OpenAIChatModel({ model: "gpt-3.5-turbo", maxCompletionTokens: 1000 }),
  [
    {
      name: "getCurrentWeather" as const, // mark 'as const' for type inference
      description: "Get the current weather in a given location",
      schema: z.object({
        location: z
          .string()
          .describe("The city and state, e.g. San Francisco, CA"),
        unit: z.enum(["celsius", "fahrenheit"]).optional(),
      }),
    },
    {
      name: "getContactInformation" as const,
      description: "Get the contact information for a given person",
      schema: z.object({
        name: z.string().describe("The name of the person"),
      }),
    },
  ],
  OpenAIChatFunctionPrompt.forSchemasCurried([OpenAIChatMessage.user(query)])
);
```

The result contains:

- `schema`: The name of the schema that was matched or `null` if text was generated.
- `value`: The value of the schema that was matched or `null` if text was generated.
- `text`: The generated text. Optional when a schema was matched.

```ts
switch (schema) {
  case "getCurrentWeather": {
    const { location, unit } = value;
    console.log("getCurrentWeather", location, unit);
    break;
  }

  case "getContactInformation": {
    const { name } = value;
    console.log("getContactInformation", name);
    break;
  }

  case null: {
    console.log("No function call. Generated text: ", text);
  }
}
```

### Text Embedding

[OpenAITextEmbeddingModel API](/api/classes/OpenAITextEmbeddingModel)

```ts
import { OpenAITextEmbeddingModel, embedTexts } from "modelfusion";

const embeddings = await embedTexts(
  new OpenAITextEmbeddingModel({ model: "text-embedding-ada-002" }),
  [
    "At first, Nox didn't know what to do with the pup.",
    "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
  ]
);
```

### Tokenize Text

[TikTokenTokenizer API](/api/classes/TikTokenTokenizer)

```ts
import { TikTokenTokenizer, countTokens } from "modelfusion";

const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });

const text = "At first, Nox didn't know what to do with the pup.";

const tokenCount = await countTokens(tokenizer, text);
const tokens = await tokenizer.tokenize(text);
const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
const reconstructedText = await tokenizer.detokenize(tokens);
```

### Transcribe

[OpenAITranscriptionModel API](/api/classes/OpenAITranscriptionModel)

```ts
import fs from "node:fs";
import { OpenAITranscriptionModel, transcribe } from "modelfusion";

const data = await fs.promises.readFile("data/test.mp3");

const transcription = await transcribe(
  new OpenAITranscriptionModel({ model: "whisper-1" }),
  {
    type: "mp3",
    data,
  }
);
```

### Generate Image

OpenAI provides a model called DALL-E that can generate images from text descriptions.

[OpenAIImageGenerationModel API](/api/classes/OpenAIImageGenerationModel)

```ts
import { OpenAIImageGenerationModel, generateImage } from "modelfusion";

const image = await generateImage(
  new OpenAIImageGenerationModel({ size: "512x512" }),
  "the wicked witch of the west in the style of early 19th century painting"
);
```
