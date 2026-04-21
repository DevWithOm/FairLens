import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

const SYSTEM_PROMPT = `You are FairLens Copilot, an AI fairness expert assistant built into a bias detection platform. You help users understand bias in their datasets and suggest remediation strategies. Be concise, data-driven, and use technical fairness terminology. Format responses with markdown when helpful. You should reference specific metrics when the user's context includes analysis data.`

// POST /api/copilot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message is required' })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const response = generateLocalResponse(message, context)
      return res.json({ success: true, response, source: 'local' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const contextStr = context ? `\n\nUser's current context:\n${JSON.stringify(context, null, 2)}` : ''
    const prompt = `${SYSTEM_PROMPT}${contextStr}\n\nUser question: ${message}`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    res.json({ success: true, response, source: 'gemini' })
  } catch (err) {
    console.error('Copilot error:', err)
    const response = generateLocalResponse(req.body.message, req.body.context)
    res.json({ success: true, response, source: 'local-fallback' })
  }
})

function generateLocalResponse(question, context) {
  const q = question.toLowerCase()
  const isHindi = q.includes('hindi') || q.includes('हिंदी')
  
  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  // Handle Greetings
  if (q.match(/\b(hi|hello|hey|greetings|namaste)\b/)) {
    if (isHindi || q.includes('namaste')) {
      return getRandom([
        "नमस्ते! मैं FairLens एआई सह-पायलट हूँ। मैं आपके डेटा में पूर्वाग्रह का विश्लेषण करने में कैसे मदद कर सकता हूँ?",
        "हैलो! मैं आपके डेटासेट से पूर्वाग्रह को समझने और सुधारने में आपकी सहायता के लिए यहाँ हूँ।",
        "नमस्ते! क्या आप किसी विशिष्ट मीट्रिक जैसे 'Disparate Impact' के बारे में जानना चाहते हैं?"
      ])
    } else {
      return getRandom([
        "Hi there! I'm the FairLens AI Copilot. How can I help you analyze your dataset for bias today?",
        "Hello! I'm here to help you understand fairness metrics and discover bias hidden in your data. What would you like to know?",
        "Greetings! I can explain fairness metrics, help interpret your results, or suggest debiasing techniques. Where should we start?"
      ])
    }
  }

  // Handle identity questions
  if (q.match(/\b(who are you|what are you|what do you do)\b/)) {
    return isHindi 
      ? "मैं FairLens Copilot हूँ, एक AI असिस्टेंट जिसे आपको एआई पूर्वाग्रहों को पहचानने और सुधारने में मदद करने के लिए डिज़ाइन किया गया है। (नोट: पूरी क्षमताओं के लिए अपना Gemini API key डालें!)"
      : "I am the FairLens Copilot, an AI assistant built to help you measure, discover, and remediate AI bias in your datasets. *(Note: Please add your Gemini API Key in .env to unlock full conversational AI!)*"
  }

  // Handle remediation suggestions specifically
  if (q.includes('remediation') || q.includes('action steps') || q.includes('fix suggestions')) {
    const strategyMatch = q.match(/strategy":"?(\w+)/) || q.match(/strategy: (\w+)/)
    const strategy = strategyMatch ? strategyMatch[1] : 'this adjustment'
    
    if (isHindi) {
      return getRandom([
        `1. **${strategy} लागू करें** — अपने ट्रेनिंग मॉडल में इसे जोड़ने से निष्पक्षता में सुधार होगा।\n\n2. **डेटा की निगरानी करें** — नियमित रूप से मॉडल की जांच करें।\n\n3. **सटीकता जांचें** — सुनिश्चित करें कि सुधार से मॉडल का प्रदर्शन कम न हो।`,
        `1. **डेटा को संतुलित करें** — ${strategy} का उपयोग करके विभिन्न समूहों के प्रति पूर्वाग्रह कम करें।\n\n2. **समय-समय पर ऑडिट करें** — नए आँकड़ों के साथ मॉनिटरिंग करते रहें।\n\n3. **विशेषज्ञों से सलाह लें** — इसे लागू करने से पहले अनुपालन सुनिश्चित करें।`,
        `1. **${strategy} का परीक्षण करें** — एक छोटे समूह पर इस रणनीति का मूल्यांकन करें।\n\n2. **पूर्वाग्रह की समीक्षा** — उत्पादन से पहले अंतिम मैट्रिक्स की जांच करें।\n\n3. **दस्तावेज़ीकरण** — उठाए गए सभी कदमों को स्टेकहोल्डर्स के लिए दर्ज करें।`
      ])
    } else {
      return getRandom([
        `1. **Apply ${strategy}** to your training pipeline — our simulation shows this can improve fairness across groups.\n\n2. **Monitor for Drift** — regularly re-evaluate bias metrics as your dataset evolves to ensure the fix remains effective.\n\n3. **Verify Performance** — ensure that optimizing for fairness doesn't disproportionately degrade accuracy for critical sub-segments.`,
        `1. **Test ${strategy} in Staging** — validate the fairness gains before rolling this out to production users.\n\n2. **Conduct Regular Audits** — schedule demographic parity checks every quarter to catch regression.\n\n3. **Document the Mitigation** — keep a record of these steps for your compliance and legal teams.`,
        `1. **Implement ${strategy} Adjustments** — this specific approach balances disparate impact effectively here.\n\n2. **Review Data Collection** — address root causes of bias upstream where possible.\n\n3. **Stakeholder Review** — present the new fairness metrics vs. accuracy trade-off to your product team.`
      ])
    }
  }

  if (q.includes('disparate impact') || q.includes('di ratio')) {
    let response = `**Disparate Impact Ratio** measures the ratio of the positive outcome rate of the unprivileged group to the privileged group.\n\n**Formula:** DI = Rate(unprivileged) / Rate(privileged)\n\n**Threshold:** DI ≥ 0.8 (80%) passes the "4/5ths Rule" from EEOC guidelines.\n\n- **DI = 1.0**: Perfect parity\n- **DI < 0.8**: Potential adverse impact\n- **DI < 0.5**: Severe bias detected`
    if (context?.analysisResults) {
      const first = Object.values(context.analysisResults).find(Boolean)
      if (first) response += `\n\n📊 Your current DI: **${(first.disparateImpact * 100).toFixed(1)}%**`
    }
    return response
  }

  if (q.includes('4/5') || q.includes('four-fifths') || q.includes('four fifths')) {
    return `**The 4/5ths (80%) Rule** is from the EEOC Uniform Guidelines on Employee Selection Procedures.\n\n**Rule:** The selection rate for any protected group should be at least 80% (4/5ths) of the rate for the group with the highest selection rate.\n\n**Example:** If men are hired at 50%, women should be hired at ≥ 40% (50% × 0.8) to pass.\n\n⚠️ This is a rule of *thumb*, not a legal standard. Courts consider multiple factors.`
  }

  return isHindi 
    ? "मुझे माफ़ करें, मैं इस प्रश्न का सटीक उत्तर नहीं दे सकता। चूंकि यह ऑफ़लाइन मोड है, मैं केवल पूर्वाग्रह मेट्रिक्स से संबंधित बुनियादी प्रश्नों का उत्तर दे सकता हूँ। पूर्ण AI अनुभव के लिए कृपया अपना Gemini API Key जोड़ें।"
    : `(Offline Mode)\n\nI can't fully answer that without an active Gemini API Key. Currently, I can only explain basic concepts like "Disparate Impact" or "4/5ths Rule". \n\n**To get open-ended AI answers, please update the GEMINI_API_KEY in your .env file!**`
}

export default router
