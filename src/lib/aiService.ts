import { GoogleGenAI } from '@google/genai'

export interface AIResponse {
  success: boolean
  data?: any
  error?: string
}

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables')
  }
  return new GoogleGenAI({ apiKey })
}

export const aiService = {
  /**
   * Analyze patient symptoms and history to predict potential risks.
   */
  async predictRisk(_patientId: string, currentSymptoms: string): Promise<AIResponse> {
    try {
      const ai = getAIClient()
      const prompt = `You are a medical AI assistant. Analyze the following patient symptoms and output a JSON object with:
- "riskLevel": string (Low, Medium, or High)
- "recommendations": array of strings
- "confidence": number between 0 and 1
Symptoms: ${currentSymptoms}`
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      })
      
      const text = response.text || '{}'
      return {
        success: true,
        data: {
          ...JSON.parse(text),
          timestamp: new Date().toISOString()
        }
      }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message || 'AI request failed' }
    }
  },

  /**
   * Summarize a complex medical report (e.g. PDF text extraction) into simple terms.
   */
  async summarizeReport(reportText: string): Promise<AIResponse> {
    try {
      const ai = getAIClient()
      const prompt = `Summarize the following medical report in simple terms for a patient. Output a JSON object with:
- "summary": string
- "keyFindings": array of strings
- "actionItems": array of strings

Report Text:
${reportText}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      })
      
      const text = response.text || '{}'
      return {
        success: true,
        data: JSON.parse(text)
      }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message || 'AI request failed' }
    }
  },

  /**
   * AI Medical Assistant Chatbot
   */
  async getAssistantReply(message: string, context?: any): Promise<AIResponse> {
    try {
      const ai = getAIClient()
      const prompt = `You are an AI Medical Assistant for LuminaCare. Answer the patient's query politely and concisely. Remind them you are an AI, not a substitute for a doctor.
Patient context: ${JSON.stringify(context || {})}
Patient query: ${message}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
      
      return {
        success: true,
        data: { reply: response.text }
      }
    } catch (error: any) {
      console.error(error)
      return { success: false, error: error.message || 'AI request failed' }
    }
  }
}
