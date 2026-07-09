const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
app.use(express.json());

// 1. إعداد Gemini
consconst genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// هذه هي "شخصية البوت" - عدلها لتناسب أسلوبك
const SYSTEM_PROMPT = `
أنت الآن المساعد الرقمي لـ CODIA AI. 
أسلوبك في الرد: مهذب، احترافي، ومختصر. 
إذا سألك أحد عن الخدمات، اشرحها بوضوح. 
إذا كان السؤال خارج نطاق العمل، اعتذر بلباقة.
`;

async function getGeminiResponse(userMessage) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: [{ role: "user", parts: SYSTEM_PROMPT }],
        });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
    } catch (error) {
        return "عذراً، أنا حالياً تحت الصيانة، سيعود فريق CODIA AI للرد عليك قريباً.";
    }
}

// 2. معالجة الرسائل (بوابة موحدة لكل المنصات)
async function handleMessage(platform, message, res) {
    const aiReply = await getGeminiResponse(message);
    console.log(`🤖 الرد على ${platform}: ${aiReply}`);
    
    // هنا سيتم إرسال الرد للمنصة عبر API الخاص بها
    // حالياً سنقوم بإرجاع الرد كـ JSON للتوثيق
    res.status(200).send({ platform, reply: aiReply });
}

// مسارات الاستقبال
app.all('/webhook/tiktok', (req, res) => handleMessage('TikTok', req.body.data?.message?.content, res));
app.post('/webhook/meta', (req, res) => handleMessage('Meta', req.body.entry?.[0]?.messaging?.[0]?.message?.text, res));
app.post('/webhook/gmail', (req, res) => handleMessage('Gmail', req.body.message?.data, res));

app.listen(process.env.PORT || 3000, () => console.log('✅ CODIA AI Brain is Active!'));
