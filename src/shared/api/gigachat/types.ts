export type MessageRole = 'system' | 'user' | 'assistant'

export type ChatContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >

export interface ChatMessagePayload {
  role: MessageRole
  content: ChatContent
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessagePayload[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  repetition_penalty?: number
  stream?: boolean
}

export interface OAuthTokenResponse {
  access_token: string
  expires_in: number
}

export interface ModelsResponse {
  data?: Array<{ id: string; object?: string; owned_by?: string }>
}
