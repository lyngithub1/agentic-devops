import { app, HttpRequest, HttpResponseInit } from "@azure/functions";
import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { retrieveGrounding } from "../lib/retrieval";
import { isSafe, groundedSystemPrompt } from "../lib/guardrails";

const credential = new DefaultAzureCredential();
const scope = "https://cognitiveservices.azure.com/.default";
const client = new AzureOpenAI({
  azureADTokenProvider: getBearerTokenProvider(credential, scope),
  endpoint: process.env.AOAI_ENDPOINT, apiVersion: "2024-08-01-preview",
});

export async function chat(req: HttpRequest): Promise<HttpResponseInit> {
  const { message, memberId } = await req.json();
  if (!isSafe(message)) {
    return { status: 200, jsonBody: { reply: "I can only help with Contoso products." } };
  }
  // Ground answers in first-party catalog + inventory (RAG)
  const context = await retrieveGrounding(message, memberId);
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: 'system', content: groundedSystemPrompt(context) },
      { role: 'user', content: message },
    ],
  });
  return { status: 200, body: toEventStream(completion) };
}

app.http("chat", { methods: ["POST"], authLevel: "anonymous", handler: chat });