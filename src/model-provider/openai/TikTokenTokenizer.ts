import { Tiktoken, TiktokenEncoding, getEncoding } from "js-tiktoken";
import { FullTokenizer } from "../../model-function/tokenize-text/Tokenizer.js";
import { never } from "../../util/never.js";
import { OpenAITextEmbeddingModelType } from "./OpenAITextEmbeddingModel.js";
import { OpenAITextGenerationBaseModelType } from "./OpenAITextGenerationModel.js";
import { OpenAIChatBaseModelType } from "./chat/OpenAIChatModel.js";

/**
 * TikToken tokenizer for OpenAI language models.
 *
 * @see https://github.com/openai/tiktoken
 *
 * @example
 * const tokenizer = new TikTokenTokenizer({ model: "gpt-4" });
 *
 * const text = "At first, Nox didn't know what to do with the pup.";
 *
 * const tokenCount = await countTokens(tokenizer, text);
 * const tokens = await tokenizer.tokenize(text);
 * const tokensAndTokenTexts = await tokenizer.tokenizeWithTexts(text);
 * const reconstructedText = await tokenizer.detokenize(tokens);
 */
export class TikTokenTokenizer implements FullTokenizer {
  /**
   * Get a TikToken tokenizer for a specific model or encoding.
   */
  constructor(
    options:
      | {
          model:
            | OpenAIChatBaseModelType
            | OpenAITextGenerationBaseModelType
            | OpenAITextEmbeddingModelType;
        }
      | { encoding: TiktokenEncoding }
  ) {
    this.tiktoken = getEncoding(
      "model" in options
        ? getEncodingNameForModel(options.model)
        : options.encoding
    );
  }

  private readonly tiktoken: Tiktoken;

  async tokenize(text: string) {
    return this.tiktoken.encode(text);
  }

  async tokenizeWithTexts(text: string) {
    const tokens = this.tiktoken.encode(text);

    return {
      tokens,
      tokenTexts: tokens.map((token) => this.tiktoken.decode([token])),
    };
  }

  async detokenize(tokens: number[]) {
    return this.tiktoken.decode(tokens);
  }
}

// implemented here (instead of using js-tiktoken) to be able to quickly updated it
// when new models are released
function getEncodingNameForModel(
  model:
    | OpenAIChatBaseModelType
    | OpenAITextGenerationBaseModelType
    | OpenAITextEmbeddingModelType
) {
  switch (model) {
    case "code-davinci-002":
    case "text-davinci-002":
    case "text-davinci-003": {
      return "p50k_base";
    }
    case "babbage-002":
    case "davinci-002":
    case "ada":
    case "babbage":
    case "curie":
    case "davinci":
    case "text-ada-001":
    case "text-babbage-001":
    case "text-curie-001": {
      return "r50k_base";
    }
    case "gpt-3.5-turbo":
    case "gpt-3.5-turbo-0301":
    case "gpt-3.5-turbo-0613":
    case "gpt-3.5-turbo-16k":
    case "gpt-3.5-turbo-16k-0613":
    case "gpt-4":
    case "gpt-4-0314":
    case "gpt-4-0613":
    case "gpt-4-32k":
    case "gpt-4-32k-0314":
    case "gpt-4-32k-0613":
    case "text-embedding-ada-002": {
      return "cl100k_base";
    }
    default: {
      never(model);
      throw new Error(`Unknown model: ${model}`);
    }
  }
}
