import * as SecureStore from "expo-secure-store";

const OPENROUTER_KEY_STORE  = "mr_openrouter_key";
const SILICONFLOW_KEY_STORE = "mr_siliconflow_key";
const SELECTED_PROVIDER_STORE = "mr_ai_provider";
const SELECTED_MODEL_STORE  = "mr_ai_model";

export type Provider = "openrouter" | "siliconflow";

export interface AIModel {
  id: string; name: string; provider: Provider;
  pricePerMToken: string; badge: string; description: string;
}

export const MODELS: AIModel[] = [
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3", provider: "openrouter", pricePerMToken: "$0.14", badge: "CHEAPEST", description: "Best value — fast, smart, great for legal/music questions" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "openrouter", pricePerMToken: "$0.35", badge: "BALANCED", description: "Alibaba's flagship — excellent reasoning & multilingual" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "openrouter", pricePerMToken: "$0.12", badge: "FAST", description: "Meta's open model — very fast and cheap" },
  { id: "microsoft/phi-4", name: "Phi-4 (Microsoft)", provider: "openrouter", pricePerMToken: "$0.07", badge: "ULTRA CHEAP", description: "Microsoft's small model — surprisingly capable" },
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "siliconflow", pricePerMToken: "¥0.57", badge: "XIAOMI", description: "Alibaba Qwen on SiliconFlow — great Chinese + English" },
  { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", provider: "siliconflow", pricePerMToken: "¥1.00", badge: "XIAOMI", description: "DeepSeek V3 on SiliconFlow — top-tier reasoning" },
  { id: "Pro/deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "siliconflow", pricePerMToken: "¥4.00", badge: "REASONING", description: "Deep chain-of-thought — best for complex legal analysis" },
];

export async function saveApiKey(provider: Provider, key: string) {
  const storeKey = provider === "openrouter" ? OPENROUTER_KEY_STORE : SILICONFLOW_KEY_STORE;
  await SecureStore.setItemAsync(storeKey, key);
}
export async function getApiKey(provider: Provider): Promise<string | null> {
  const storeKey = provider === "openrouter" ? OPENROUTER_KEY_STORE : SILICONFLOW_KEY_STORE;
  return SecureStore.getItemAsync(storeKey);
}
export async function deleteApiKey(provider: Provider) {
  const storeKey = provider === "openrouter" ? OPENROUTER_KEY_STORE : SILICONFLOW_KEY_STORE;
  await SecureStore.deleteItemAsync(storeKey);
}
export async function saveSelectedModel(modelId: string, provider: Provider) {
  await SecureStore.setItemAsync(SELECTED_MODEL_STORE, modelId);
  await SecureStore.setItemAsync(SELECTED_PROVIDER_STORE, provider);
}
export async function getSelectedModel(): Promise<{ modelId: string; provider: Provider } | null> {
  const modelId = await SecureStore.getItemAsync(SELECTED_MODEL_STORE);
  const provider = await SecureStore.getItemAsync(SELECTED_PROVIDER_STORE) as Provider | null;
  if (!modelId || !provider) return null;
  return { modelId, provider };
}

export interface ChatMessage { role: "user" | "assistant" | "system"; content: string; }

export const MUSIC_RIGHTS_SYSTEM_PROMPT = `You are MusicRight AI, an expert music rights advisor. You help musicians:
1. Collect royalties — ASCAP, BMI, SESAC, The MLC, SoundExchange, Harry Fox Agency
2. Register copyrights — US Copyright Office, ISRC codes, PRO registration
3. File DMCA takedowns — YouTube, TikTok, Instagram, Spotify
4. Understand licensing — sync licenses, mechanical licenses, master vs. publishing rights
5. Collect internationally — GEMA, PRS, SACEM, JASRAC etc.
6. Recover unclaimed money — identify gaps, unclaimed royalties, publisher share
Keep answers concise, practical, and actionable.`;

export async function chatCompletion(messages: ChatMessage[], modelId: string, provider: Provider, apiKey: string): Promise<string> {
  const baseUrl = provider === "openrouter" ? "https://openrouter.ai/api/v1" : "https://api.siliconflow.cn/v1";
  const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
  if (provider === "openrouter") { headers["HTTP-Referer"] = "https://musicright.ai"; headers["X-Title"] = "MusicRight.AI"; }
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST", headers,
    body: JSON.stringify({ model: modelId, messages: [{ role: "system", content: MUSIC_RIGHTS_SYSTEM_PROMPT }, ...messages], max_tokens: 1024, temperature: 0.7 }),
  });
  if (!response.ok) { const err = await response.text(); throw new Error(`API error ${response.status}: ${err}`); }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "No response received.";
}
