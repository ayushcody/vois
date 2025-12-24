import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import axios from "axios";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";

dotenv.config({ path: "../.env" }); // Load from root .env

const app = express();
const PORT = process.env.PORT || 3001;

import authRoutes from "./routes/authRoutes";
import ipfsRoutes from "./routes/ipfsRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import zkpRoutes from "./routes/zkpRoutes";
import registrationRoutes from "./routes/registrationRoutes";

app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for Vite dev
}));
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /\.vercel\.app$/  // Allow all Vercel URLs
    ],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/ipfs", ipfsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/zkp", zkpRoutes);

app.post("/api/eksaathi", async (req, res) => {
    try {
        logger.info("EkSaathi request received", { body: req.body });
        const { messages = [], systemPrompt, language = "en" } = req.body || {};

        // Get the last user message
        const lastUserMessage = (messages as any[])
            .filter((m) => m.role === "user")
            .slice(-1)[0];

        const userText = lastUserMessage?.content || "Hello";

        // Build full conversation context
        const conversationHistory = (messages as any[])
            .slice(-6) // Keep last 6 messages for context
            .map((m) => `${m.role === "user" ? "User" : "EkSaathi"}: ${m.content}`)
            .join("\n");

        const prompt =
            `${systemPrompt || ""}\n\n` +
            `User language code: ${language}. Always respond in ${language === "hi" ? "Hindi (हिंदी)" : language === "mr" ? "Marathi (मराठी)" : "English"}.\n\n` +
            `Conversation history:\n${conversationHistory || "User has just opened the chat."}\n\n` +
            `User: ${userText}\nEkSaathi:`;

        const apiKey = process.env.GEMINI_API_KEY;
        let content: string;

        // Smart fallback responses based on user query and language
        const getFallbackResponse = (userText: string, lang: string): string => {
            const lowerText = userText.toLowerCase();

            if (lang === "hi") {
                if (lowerText.includes("verify") || lowerText.includes("id") || lowerText.includes("सत्यापित") || lowerText.includes("ओळख")) {
                    return "ID सत्यापन के लिए, कृपया Register पेज पर जाएं और अपना सरकारी ID नंबर और OTP दर्ज करें। सिस्टम आपकी पहचान सत्यापित करेगा।";
                } else if (lowerText.includes("vote") || lowerText.includes("मत") || lowerText.includes("वोट")) {
                    return "मतदान करने के लिए, Vote पेज पर जाएं, एक सक्रिय चुनाव चुनें, और अपने पसंदीदा उम्मीदवार के लिए वोट दें। आपका वोट Zero-Knowledge Proof के साथ ब्लॉकचेन पर दर्ज किया जाएगा।";
                } else if (lowerText.includes("anonymous") || lowerText.includes("अनामिक")) {
                    return "हां, आपका वोट पूरी तरह से अनामिक है। Zero-Knowledge Proofs का उपयोग करके, आपकी पहचान कभी भी ब्लॉकचेन पर प्रकट नहीं होती, लेकिन आपकी वोट की वैधता सत्यापित की जा सकती है।";
                } else {
                    return "नमस्ते! मैं EkSaathi हूं। मैं आपकी ID सत्यापन, मतदान प्रक्रिया, और Zero-Knowledge Proofs के बारे में मदद कर सकता हूं। कृपया अपना प्रश्न पूछें।";
                }
            } else if (lang === "mr") {
                if (lowerText.includes("verify") || lowerText.includes("id") || lowerText.includes("सत्यापित") || lowerText.includes("ओळख")) {
                    return "ओळख पडताळणीसाठी, कृपया Register पृष्ठावर जा आणि तुमचा सरकारी ID क्रमांक आणि OTP प्रविष्ट करा. प्रणाली तुमची ओळख पडताळेल.";
                } else if (lowerText.includes("vote") || lowerText.includes("मत") || lowerText.includes("वोट")) {
                    return "मतदान करण्यासाठी, Vote पृष्ठावर जा, एक सक्रिय निवडणूक निवडा आणि तुमच्या आवडत्या उमेदवारासाठी मत द्या. तुमचे मत Zero-Knowledge Proof सह ब्लॉकचेनवर नोंदवले जाईल.";
                } else if (lowerText.includes("anonymous") || lowerText.includes("अनामिक")) {
                    return "होय, तुमचे मत पूर्णपणे अनामिक आहे. Zero-Knowledge Proofs वापरून, तुमची ओळख कधीही ब्लॉकचेनवर प्रकट होत नाही, परंतु तुमच्या मताची वैधता सत्यापित केली जाऊ शकते.";
                } else {
                    return "नमस्कार! मी EkSaathi आहे. मी तुम्हाला ID पडताळणी, मतदान प्रक्रिया आणि Zero-Knowledge Proofs बद्दल मदत करू शकतो. कृपया तुमचा प्रश्न विचारा.";
                }
            } else {
                // English
                if (lowerText.includes("verify") || lowerText.includes("id")) {
                    return "To verify your ID, please go to the Register page and enter your government ID number and OTP. The system will verify your identity.";
                } else if (lowerText.includes("vote")) {
                    return "To cast your vote, go to the Vote page, select an active election, and vote for your preferred candidate. Your vote will be recorded on the blockchain with a Zero-Knowledge Proof.";
                } else if (lowerText.includes("anonymous")) {
                    return "Yes, your vote is completely anonymous. Using Zero-Knowledge Proofs, your identity is never revealed on the blockchain, but your vote's validity can be verified.";
                } else if (lowerText.includes("hi") || lowerText.includes("hello") || lowerText.includes("help")) {
                    return "Hello! I'm EkSaathi, EkMat's support assistant. I can help you with ID verification, the voting process, and Zero-Knowledge Proofs. What would you like to know?";
                } else {
                    return "Hello! I'm EkSaathi. I can help you with ID verification, voting, and Zero-Knowledge Proofs. Please ask me a question, or use the quick action buttons below for common queries.";
                }
            }
        };

        if (!apiKey || apiKey.trim() === "") {
            logger.warn("GEMINI_API_KEY is not set. Using smart fallback responses.");
            content = getFallbackResponse(userText, language);
        } else {
            try {
                const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                const response = await axios.post(
                    url,
                    {
                        contents: [
                            {
                                role: "user",
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        },
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        timeout: 30000,
                    }
                );

                const candidate = response.data?.candidates?.[0];
                if (candidate?.content?.parts?.[0]?.text) {
                    content = candidate.content.parts.map((p: any) => p.text).join(" ");
                } else {
                    logger.warn("Gemini API returned empty response, using fallback");
                    content = getFallbackResponse(userText, language);
                }
            } catch (geminiError: any) {
                logger.error("Gemini API error", {
                    message: geminiError.message,
                    status: geminiError.response?.status,
                    data: geminiError.response?.data,
                    apiKeyPresent: !!apiKey,
                });
                // Use smart fallback instead of generic error
                content = getFallbackResponse(userText, language);
            }
        }

        // Return in format expected by useChat hook (Vercel AI SDK format)
        // useChat expects either streaming or a text response
        logger.info("EkSaathi response", { contentLength: content.length, language });
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).send(content);
    } catch (err: any) {
        logger.error("EkSaathi /api/eksaathi error", err);
        const errorMsg =
            "EkSaathi encountered an issue. Please try again in a moment or use the Support Center for critical issues.";
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.status(200).send(errorMsg);
    }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware should be last
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Backend server running on http://localhost:${PORT}`);
});
