import {
    IPromptPayload,
    IPromptResponse,
} from 'src/interfaces/prompt.interface';
import { ContentType } from 'src/modules/thread/enums/thread.enum';

export class PromptHelper {
    /**
     * Builds enhanced prompts for content generation and title generation
     * from the provided payload, including context and type-specific instructions.
     */
    static buildContentGenerationPrompts(payload: IPromptPayload): IPromptResponse {
        const { type, history, current } = payload;

        const tone = current.tone || 'neutral';
        const language = current.language || 'en';
        const extraInstructions = current.extraInstructions || 'None.';

        // Type instructions from buildPrompt method
        const typeInstructions = {
            [ContentType.BLOG_POST]: 'Write a comprehensive blog post',
            [ContentType.PRODUCT_DESCRIPTION]:
                'Write a compelling product description',
            [ContentType.SOCIAL_MEDIA_CAPTION]:
                'Write an engaging social media caption',
            [ContentType.ARTICLE]: 'Write a detailed article',
            [ContentType.OTHER]: 'Generate content',
        };

        const baseInstruction = `${typeInstructions[type] || 'Generate content'} based on the following: ${current.prompt}`;

        const historyText =
            !history || history.length === 0
                ? 'No previous context provided.'
                : history
                    .map(
                        (h, idx) =>
                            `#${idx + 1} Previous Prompt:\n${h.prompt}\n` +
                            `Previous Response:\n${h.response}`,
                    )
                    .join('\n\n');

        // Add context in numbered list format (from buildPrompt method)
        let contextText = '';
        if (history && history.length > 0) {
            contextText = '\n\nPrevious context:\n';
            history.forEach((h, index) => {
                contextText += `${index + 1}. ${h.prompt}\n`;
            });
            contextText +=
                '\nPlease consider the above context when generating the new content.';
        }

        const typeInstruction = this.getTypeInstruction(type);

        const contentPrompt = `
You are an AI content generator.

${baseInstruction}${contextText}

### Content Type
${type}

### Previous Context (Detailed)
${historyText}

### Current Request Details
Tone: ${tone}
Language: ${language}
Extra Instructions: ${extraInstructions}

### Task
${typeInstruction}
Use the previous context only as reference. Do NOT repeat earlier responses.
Return only the final content, without explanations about what you are doing.
  `.trim();

        // You can call this separately (e.g. only for first item in a thread)
        const titlePrompt = `
You are an expert title generator.

### Context
We are generating a new piece of content with the following details:

Content Type: ${type}
Tone: ${tone}
Language: ${language}

Previous Context (if any):
${historyText}

Current Prompt:
${current.prompt}

### Task
Generate a short, catchy, human-friendly title for this content thread.
- Maximum 8–10 words.
- No quotes around the title.
- Make it relevant and clear for the overall topic.
  `.trim();

        return { contentPrompt, titlePrompt };
    }

    /**
     * Returns specific instructions based on content type.
     * This helps the AI clearly shape the output format.
     */
    static getTypeInstruction(type: ContentType): string {
        switch (type) {
            case ContentType.BLOG_POST:
                return `
Generate a complete blog post with clear headings and paragraphs.
Use a friendly and readable style.
Make sure the content flows logically from introduction to conclusion.
Include engaging subheadings and well-structured sections.
      `.trim();

            case ContentType.ARTICLE:
                return `
Generate a comprehensive article with clear headings and paragraphs.
Use a professional and informative style.
Make sure the content flows logically from introduction to conclusion.
Include detailed explanations and supporting information.
      `.trim();

            case ContentType.PRODUCT_DESCRIPTION:
                return `
Generate a concise, persuasive product description.
Highlight key features, benefits, and use cases.
Keep it skimmable, with short paragraphs or bullet points if helpful.
Make it compelling and easy to understand.
      `.trim();

            case ContentType.SOCIAL_MEDIA_CAPTION:
                return `
Generate a short social media caption (1–3 sentences).
Match the requested tone.
Optionally add 3–5 relevant hashtags at the end.
Avoid long paragraphs. Keep it engaging and concise.
      `.trim();

            case ContentType.OTHER:
                return `
Generate helpful, clear content based on the user's request.
Follow the user's instructions carefully.
Ensure the content is relevant and well-structured.
      `.trim();

            default:
                return `
Generate helpful, clear content based on the user's request.
Follow the user's instructions carefully.
      `.trim();
        }
    }
}
