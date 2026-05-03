// src/app/api/chat.ts

// Types
interface Message {
  role: string
  content: string
}

export default async function handler(request: Request) {
  // Handle GET requests
  if (request.method === 'GET') {
    return Response.json({
      status: 'operational',
      service: 'AI-Powered Sri Lanka Hotel Assistant',
      message: 'Everything is handled by AI - no hardcoded responses',
      timestamp: new Date().toISOString()
    })
  }

  // Handle POST requests
  if (request.method === 'POST') {
    try {
      const body = await request.json()
      const { message, history = [] }: { message: string; history: Message[] } = body

      if (!message || typeof message !== 'string') {
        return Response.json(
          { error: 'Message is required and must be a string' },
          { status: 400 }
        )
      }

      // Limit message length
      if (message.length > 2000) {
        return Response.json(
          { error: 'Message is too long. Please keep it under 2000 characters.' },
          { status: 400 }
        )
      }

      // Validate history shape
      if (!Array.isArray(history)) {
        return Response.json(
          { error: 'History must be an array' },
          { status: 400 }
        )
      }

      // Environment variables — set these in Vercel dashboard → Project Settings → Environment Variables
      const apiKey = process.env.OLLAMA_API_KEY
      if (!apiKey) {
        return Response.json(
          { error: 'Server misconfiguration: missing OLLAMA_API_KEY' },
          { status: 500 }
        )
      }
      const apiUrl      = process.env.OLLAMA_API_URL    || 'https://ollama.com/api/chat'
      const model       = process.env.OLLAMA_MODEL       || 'gpt-oss:120b-cloud'
      const temperature = parseFloat(process.env.OLLAMA_TEMPERATURE || '0.8')

      // Get current time for AI to use
      const now = new Date()
      const timeContext = {
        hour: now.getHours(),
        date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      }

      // SINGLE SYSTEM PROMPT - AI handles everything
      const systemPrompt = `You are an AI assistant specialized in Sri Lanka hotels and accommodations.

ABOUT YOU:
- You ONLY help with hotels, resorts, guesthouses, and accommodations in Sri Lanka
- You handle greetings, farewells, questions, recommendations - EVERYTHING yourself
- You decide what is relevant vs not relevant
- You generate all responses naturally, no templates
- You remember the conversation context

CURRENT CONTEXT:
- Current time: ${timeContext.time} on ${timeContext.date}
- Time of day: ${timeContext.hour < 12 ? 'morning' : timeContext.hour < 17 ? 'afternoon' : timeContext.hour < 21 ? 'evening' : 'night'}

YOUR CAPABILITIES:
1. Greet users naturally based on time of day
2. Answer ANY question about Sri Lankan hotels (prices, locations, amenities, recommendations)
3. Politely decline off-topic questions with helpful suggestions
4. Format ALL responses in beautiful Markdown
5. Use appropriate emojis naturally
6. Keep conversation flowing naturally
7. Remember what was discussed

RESPONSE RULES:
- ALWAYS use Markdown formatting (## headings, **bold**, - bullet points, \`code\` for prices)
- Be warm, friendly, and helpful
- If user asks about anything NOT related to Sri Lankan hotels, politely say you can't help and suggest asking about Sri Lanka hotels
- For greetings, respond with time-appropriate greeting and offer help
- Keep responses concise but informative
- Use emojis naturally where they fit (🏨 🇱🇰 🌊 🏖️ 🏯 🌴)

You are an AI - you have no hardcoded responses. Generate everything uniquely for each conversation.`

      // Build messages: system prompt + last 14 from client-supplied history + new message
      const recentHistory = history.slice(-14)
      const messages = [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: message }
      ]

      // Fetch with a 30s timeout to prevent hanging requests
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature,
            top_p: 0.9
          }
        })
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()

      // Validate response shape
      if (!data.message?.content) {
        console.error('Unexpected Ollama response shape:', JSON.stringify(data))
        throw new Error('Invalid response from model')
      }

      // Strip <think>...</think> blocks that some models emit before the answer
      const reply = data.message.content
        .replace(/<think>[\s\S]*?<\/think>/g, '')
        .trim()

      return Response.json({
        reply,
        // Return updated history for the client to store and send back next turn
        history: [
          ...recentHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: reply }
        ],
        metadata: {
          history_length: recentHistory.length + 2,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error: any) {
      // Handle fetch timeout
      if (error.name === 'AbortError') {
        console.error('Ollama request timed out')
        return Response.json(
          { reply: '⏱️ The request timed out. Please try again.' },
          { status: 504 }
        )
      }

      console.error('Chat error:', error)
      return Response.json(
        { reply: '❌ Something went wrong. Please try again.' },
        { status: 500 }
      )
    }
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}