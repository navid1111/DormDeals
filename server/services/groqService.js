const fs = require("fs");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

class GroqServiceClass {
  constructor(apiKey) {
    this.groq = new Groq({
      apiKey: apiKey || process.env.GROQ_API_KEY,
    });
    
    // Verify API key was loaded
    if (!apiKey && !process.env.GROQ_API_KEY) {
      console.warn("Warning: No Groq API key provided! Please set GROQ_API_KEY in your environment variables.");
    }
  }

  // ===============================
  // CHAT COMPLETIONS
  // ===============================

  /**
   * Create a basic chat completion
   */
  async createChatCompletion(
    messages,
    model = "llama-3.3-70b-versatile",
    options = {}
  ) {
    try {
      return await this.groq.chat.completions.create({
        messages,
        model,
        ...options,
      });
    } catch (error) {
      console.error("Error creating chat completion:", error);
      throw error;
    }
  }

  /**
   * Create a streaming chat completion
   */
  async createStreamingChatCompletion(
    messages,
    model = "llama-3.3-70b-versatile",
    onChunk
  ) {
    try {
      const stream = await this.groq.chat.completions.create({
        messages,
        model,
        stream: true,
      });

      for await (const chunk of stream) {
        if (onChunk) {
          onChunk(chunk);
        }
      }

      return stream;
    } catch (error) {
      console.error("Error creating streaming chat completion:", error);
      throw error;
    }
  }

  // ===============================
  // AGENTIC TOOLING (COMPOUND MODELS)
  // ===============================

  /**
   * Create a compound-beta chat completion with multiple tool calls
   */
  async createCompoundCompletion(
    messages,
    searchSettings,
    options = {}
  ) {
    try {
      const requestBody = {
        messages,
        model: "compound-beta",
        ...options,
      };

      if (searchSettings) {
        requestBody.search_settings = searchSettings;
      }

      return await this.groq.chat.completions.create(requestBody);
    } catch (error) {
      console.error("Error creating compound completion:", error);
      throw error;
    }
  }

  /**
   * Create a compound-beta-mini chat completion with single tool call
   */
  async createCompoundMiniCompletion(
    messages,
    searchSettings,
    options = {}
  ) {
    try {
      const requestBody = {
        messages,
        model: "compound-beta-mini",
        ...options,
      };

      if (searchSettings) {
        requestBody.search_settings = searchSettings;
      }

      return await this.groq.chat.completions.create(requestBody);
    } catch (error) {
      console.error("Error creating compound mini completion:", error);
      throw error;
    }
  }

  /**
   * Get executed tools from a compound response
   */
  getExecutedTools(response) {
    return response.choices[0]?.message?.executed_tools || [];
  }

  // ===============================
  // REAL-TIME USE CASES
  // ===============================

  /**
   * Real-time fact checker and news agent
   */
  async getRealtimeInfo(query, excludeDomains) {
    const searchSettings = {};
    if (excludeDomains) {
      searchSettings.exclude_domains = excludeDomains;
    }

    return await this.createCompoundCompletion(
      [{ role: "user", content: query }],
      searchSettings
    );
  }

  /**
   * Natural language calculator and code executor
   */
  async calculateOrExecute(query) {
    return await this.createCompoundMiniCompletion([
      {
        role: "system",
        content: "You are a helpful assistant capable of performing calculations and executing simple code when asked.",
      },
      { role: "user", content: query },
    ]);
  }

  /**
   * Code debugging assistant
   */
  async debugCode(codeOrError, isErrorMessage = false) {
    const systemMessage = isErrorMessage
      ? "You are a helpful coding assistant. You can explain errors by searching for recent information or check code snippets by executing them."
      : "You are a helpful coding assistant that can validate and debug code snippets.";

    return await this.createCompoundMiniCompletion([
      { role: "system", content: systemMessage },
      { role: "user", content: codeOrError },
    ]);
  }

  // ===============================
  // AUDIO TRANSCRIPTION
  // ===============================

  /**
   * Transcribe audio file
   */
  async transcribeAudio(options) {
    try {
      const transcriptionOptions = {
        file: options.file,
        model: options.model || "whisper-large-v3-turbo",
        prompt: options.prompt,
        response_format: options.response_format || "json",
        timestamp_granularities: options.timestamp_granularities || ["segment"],
        language: options.language,
        temperature: options.temperature || 0.0,
      };

      return await this.groq.audio.transcriptions.create(transcriptionOptions);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }

  /**
   * Transcribe audio file from path
   */
  async transcribeAudioFromPath(
    filePath,
    options = {}
  ) {
    const fileStream = fs.createReadStream(filePath);
    return await this.transcribeAudio({
      file: fileStream,
      ...options,
    });
  }

  // ===============================
  // VISION MODELS
  // ===============================

  /**
   * Analyze image with vision model
   */
  async analyzeImage(
    imageUrl,
    prompt,
    model = "meta-llama/llama-4-maverick-17b-128e-instruct",
    detail = "auto"
  ) {
    try {
      const messages = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: detail,
              },
            },
          ],
        },
      ];

      return await this.groq.chat.completions.create({
        messages,
        model,
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw error;
    }
  }

  /**
   * Multi-turn visual conversation
   */
  async continueVisualConversation(
    conversationHistory,
    newMessage,
    model = "meta-llama/llama-4-maverick-17b-128e-instruct"
  ) {
    try {
      const messages = [
        ...conversationHistory,
        {
          role: "user",
          content: newMessage,
        },
      ];

      return await this.groq.chat.completions.create({
        messages,
        model,
      });
    } catch (error) {
      console.error("Error in visual conversation:", error);
      throw error;
    }
  }

  /**
   * Generate product description from image
   */
  async generateProductDescription(
    imageUrl,
    productContext,
    model = "meta-llama/llama-4-maverick-17b-128e-instruct"
  ) {
    const prompt = productContext
      ? `Generate a detailed product description for this image. Context: ${productContext}`
      : "Generate a detailed product description for this image, including key features, benefits, and selling points.";

    return await this.analyzeImage(imageUrl, prompt, model);
  }

  /**
   * Generate accessibility description for image
   */
  async generateAccessibilityDescription(
    imageUrl,
    model = "meta-llama/llama-4-maverick-17b-128e-instruct"
  ) {
    const prompt = "Provide a detailed, accessible description of this image for visually impaired users. Include all important visual elements, text, colors, and context.";
    
    return await this.analyzeImage(imageUrl, prompt, model);
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  /**
   * List available models
   */
  async listModels() {
    try {
      return await this.groq.models.list();
    } catch (error) {
      console.error("Error listing models:", error);
      throw error;
    }
  }

  /**
   * Get model information
   */
  async getModel(modelId) {
    try {
      return await this.groq.models.retrieve(modelId);
    } catch (error) {
      console.error("Error getting model info:", error);
      throw error;
    }
  }

  /**
   * Helper method to extract text content from response
   */
  extractTextContent(response) {
    return response.choices[0]?.message?.content || "";
  }

  /**
   * Helper method to check if response used tools
   */
  usedTools(response) {
    const executedTools = this.getExecutedTools(response);
    return executedTools.length > 0;
  }

  /**
   * Helper method to get usage statistics
   */
  getUsageStats(response) {
    return response.usage || null;
  }
}

// Export the class using CommonJS syntax
module.exports = { GroqServiceClass };
