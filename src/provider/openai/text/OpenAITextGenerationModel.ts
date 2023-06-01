import { RunContext } from "../../../run/RunContext.js";
import { TextGenerationModel } from "../../../text/generate/TextGenerationModel.js";
import { Tokenizer } from "../../../text/tokenize/Tokenizer.js";
import { TokenizerModel } from "../../../text/tokenize/TokenizerModel.js";
import { getTiktokenTokenizerForModel } from "../tokenizer/tiktoken.js";
import { OpenAITextGenerationResponse } from "./OpenAITextGenerationResponse.js";
import { generateOpenAITextCompletion } from "./generateOpenAITextCompletion.js";

// see https://platform.openai.com/docs/models/
export const OPENAI_TEXT_GENERATION_MODELS = {
  "text-davinci-003": {
    maxTokens: 4096,
  },
  "text-davinci-002": {
    maxTokens: 4096,
  },
  "code-davinci-002": {
    maxTokens: 8000,
  },
  "text-curie-001": {
    maxTokens: 2048,
  },
  "text-babbage-001": {
    maxTokens: 2048,
  },
  "text-ada-001": {
    maxTokens: 2048,
  },
  davinci: {
    maxTokens: 2048,
  },
  curie: {
    maxTokens: 2048,
  },
  babbage: {
    maxTokens: 2048,
  },
  ada: {
    maxTokens: 2048,
  },
};

export type OpenAITextGenerationModelType =
  keyof typeof OPENAI_TEXT_GENERATION_MODELS;

export type OpenAITextGenerationModelSettings = {
  isUserIdForwardingEnabled?: boolean;

  suffix?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  n?: number;
  logprobs?: number;
  echo?: boolean;
  stop?: string | string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  bestOf?: number;
};

/**
 * Create a text generation model that calls the OpenAI text completion API.
 *
 * @see https://platform.openai.com/docs/api-reference/completions/create
 *
 * @example
 * const textGenerationModel = new OpenAITextGenerationModel({
 *   apiKey: OPENAI_API_KEY,
 *   model: "text-davinci-003",
 *   settings: { temperature: 0.7 },
 * });
 *
 * const response = await textGenerationModel
 *   .withSettings({ maxTokens: 500 })
 *   .generate("Write a short story about a robot learning to love:\n\n");
 *
 * const text = await textGenerationModel.extractOutput(response);
 */
export class OpenAITextGenerationModel
  implements
    TextGenerationModel<string, OpenAITextGenerationResponse, string>,
    TokenizerModel<number[]>
{
  readonly provider = "openai";

  readonly baseUrl?: string;
  readonly apiKey: string;

  readonly model: OpenAITextGenerationModelType;
  readonly settings: OpenAITextGenerationModelSettings;

  readonly tokenizer: Tokenizer<number[]>;
  readonly maxTokens: number;

  constructor({
    baseUrl,
    apiKey,
    model,
    settings = {},
  }: {
    baseUrl?: string;
    apiKey: string;
    model: OpenAITextGenerationModelType;
    settings?: OpenAITextGenerationModelSettings;
  }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
    this.settings = settings;

    this.tokenizer = getTiktokenTokenizerForModel({ model });
    this.maxTokens = OPENAI_TEXT_GENERATION_MODELS[model].maxTokens;
  }

  async generate(
    input: string,
    context?: RunContext
  ): Promise<OpenAITextGenerationResponse> {
    return generateOpenAITextCompletion({
      baseUrl: this.baseUrl,
      abortSignal: context?.abortSignal,
      apiKey: this.apiKey,
      prompt: input,
      model: this.model,
      user: this.settings.isUserIdForwardingEnabled
        ? context?.userId
        : undefined,
      ...this.settings,
    });
  }

  async extractOutput(
    rawOutput: OpenAITextGenerationResponse
  ): Promise<string> {
    return rawOutput.choices[0]!.text;
  }

  withSettings(additionalSettings: OpenAITextGenerationModelSettings) {
    return new OpenAITextGenerationModel({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      model: this.model,
      settings: Object.assign({}, this.settings, additionalSettings),
    });
  }
}
