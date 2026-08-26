import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Endpoint: Generate Pedagogical Comments (Thông tư 27 - Tiểu học Lớp 4)
  app.post("/api/ai/generate-comment", async (req, res) => {
    try {
      const { studentName, gender, grades, attendance, strengths, weaknesses, term, customTone } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(500).json({
          error: "Chưa cấu hình GEMINI_API_KEY trên hệ thống.",
          fallbackComment: `Em ${studentName} trong học kỳ vừa qua có nhiều tiến bộ trong học tập và rèn luyện. Tích cực tham gia các hoạt động lớp. Cần tiếp tục phát huy trong thời gian tới.`
        });
      }

      const prompt = `Bạn là một chuyên gia giáo dục tiểu học và là giáo viên chủ nhiệm mẫu mực của một lớp 4 tại Việt Nam.
Hãy viết lời nhận xét học bạ / sổ liên lạc định kỳ cho học sinh theo đúng tinh thần Thông tư 27/2020/TT-BGDĐT (Đánh giá học sinh tiểu học).

Thông tin học sinh:
- Họ và tên: ${studentName} (${gender || 'Học sinh'})
- Học kỳ: ${term || 'Học kỳ I'}
- Kết quả học tập các môn: ${JSON.stringify(grades || {})}
- Tình hình chuyên cần: ${attendance || 'Đi học đều đặn'}
- Điểm mạnh / Năng khiếu: ${strengths || 'Chăm ngoan, lễ phép'}
- Điểm cần khắc phục: ${weaknesses || 'Cần tự tin hơn khi phát biểu'}
- Phong cách nhận xét: ${customTone || 'Ân cần, động viên, mang tính xây dựng, tích cực'}

Yêu cầu xuất ra định dạng JSON:
{
  "generalComment": "Lời nhận xét chung về kết quả học tập và rèn luyện (khoảng 3-4 câu ngắn gọn, súc tích, chuẩn mực sư phạm)",
  "competencyComment": "Nhận xét về Năng lực chung & Năng lực đặc thù (khả năng tự học, giao tiếp hợp tác, tính toán, ngôn ngữ...)",
  "qualityComment": "Nhận xét về Phẩm chất (chăm chỉ, trung thực, trách nhiệm, nhân ái...)",
  "parentAdvice": "Lời khuyên hoặc lời nhắn nhủ gửi tới Phụ huynh để cùng phối hợp rèn luyện cho em",
  "encouragement": "Một lời khen ngợi / động viên ngắn để tạo động lực cho học sinh"
}
Chỉ trả về JSON hợp lệ, không có markdown block dư thừa.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (err: any) {
      console.error("Lỗi AI generate-comment:", err);
      return res.status(500).json({
        error: err?.message || "Không thể tạo nhận xét bằng AI",
        fallbackComment: "Học sinh có ý thức học tập tốt, lễ phép với thầy cô và hòa đồng với bạn bè. Cần duy trì phát huy hơn nữa."
      });
    }
  });

  // AI Endpoint: Generate Parent SMS/Zalo Announcement
  app.post("/api/ai/generate-parent-message", async (req, res) => {
    try {
      const { studentName, parentName, purpose, keyNotes, term } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(500).json({
          error: "Chưa cấu hình GEMINI_API_KEY",
          message: `Kính gửi Phụ huynh em ${studentName}, cô xin gửi thông tin tình hình học tập của con trong tuần qua. Kính mong phụ huynh theo dõi và phối hợp cùng cô.`
        });
      }

      const prompt = `Bạn là Giáo viên chủ nhiệm Lớp 4. Hãy soạn một tin nhắn thông báo/liên lạc gửi qua Zalo/SMS cho Phụ huynh học sinh.
Thông tin:
- Tên học sinh: ${studentName}
- Tên Phụ huynh: ${parentName || 'Quý phụ huynh'}
- Mục đích nhắn: ${purpose || 'Thông báo kết quả học tập & rèn luyện'}
- Nội dung lưu ý chính: ${keyNotes || 'Con chăm ngoan, tiến bộ môn Toán'}
- Thời điểm: ${term || 'Cuối tuần'}

Yêu cầu:
- Ngắn gọn, lịch sự, ân cần, chuẩn mực nhà giáo.
- Có lời chào, nội dung chính, lời cảm ơn và số điện thoại liên hệ của GVCN khi cần.
Trả về JSON:
{
  "smsMessage": "Nội dung ngắn gọn dưới 160 ký tự",
  "zaloMessage": "Nội dung đầy đủ, có icon nhẹ nhàng, đẹp mắt, chia dòng rõ ràng",
  "callGuidance": "Gợi ý 2-3 điểm chính nếu gọi điện trực tiếp"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.error("Lỗi AI generate-parent-message:", err);
      return res.status(500).json({ error: err?.message || "Lỗi tạo tin nhắn" });
    }
  });

  // AI Endpoint: Homeroom Teacher Assistant (Kế hoạch bài dạy, trò chơi, giải quyết tình huống)
  app.post("/api/ai/assistant-chat", async (req, res) => {
    try {
      const { message, chatHistory, context } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.status(500).json({
          error: "Chưa cấu hình GEMINI_API_KEY",
          reply: "Xin chào thầy/cô! Em là Trợ lý Giáo viên Chủ nhiệm Lớp 4. Hiện hệ thống cần GEMINI_API_KEY để kích hoạt tính năng AI trực tiếp. Thầy/cô có thể kiểm tra cấu hình trong phần Cài đặt của AI Studio nhé!"
        });
      }

      const systemInstruction = `Bạn là Trợ lý AI Chuyên môn & Chủ nhiệm Lớp 4 (Tiểu học Việt Nam).
Bạn am hiểu:
- Chương trình Giáo dục phổ thông 2018 (GDPT 2018) Lớp 4: Toán, Tiếng Việt (Kết nối tri thức / Cánh Diều / Chân trời sáng tạo), Tiếng Anh, Khoa học, Lịch sử & Địa lý, Tin học, Công nghệ, Hoạt động trải nghiệm.
- Tâm lý học lứa tuổi học sinh Lớp 4 (9-10 tuổi): Bắt đầu phát triển tư duy trừu tượng, thích khẳng định bản thân, thích thi đua khen thưởng, đôi lúc còn ham chơi, cần sự động viên khéo léo.
- Quy định đánh giá học sinh Tiểu học theo Thông tư 27/2020/TT-BGDĐT.
- Kỹ năng quản lý lớp, tổ chức sinh hoạt lớp, trò chơi khởi động 5 phút (Ice-breaker), sinh hoạt Đội/Sao Nhi đồng, xử lý tình huống sư phạm (học sinh nói chuyện, không làm bài, bất hòa...).

Hãy trả lời bằng tiếng Việt, giọng điệu ấm áp, tôn trọng, thiết thực, có ví dụ cụ thể, bố cục rõ ràng (gạch đầu dòng, highlight).
Thông tin lớp hiện tại: ${context || 'Lớp 4, Giáo viên chủ nhiệm'}`;

      const contents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Dạ, tôi đã sẵn sàng hỗ trợ Thầy/Cô quản lý và giảng dạy lớp 4 một cách hiệu quả nhất!' }] }
      ];

      if (Array.isArray(chatHistory)) {
        for (const item of chatHistory) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents as any,
      });

      return res.json({ reply: response.text || "Dạ, tôi đã nhận được câu hỏi. Thầy/cô vui lòng thử lại nhé!" });
    } catch (err: any) {
      console.error("Lỗi AI assistant-chat:", err);
      return res.status(500).json({ error: err?.message || "Lỗi xử lý trợ lý AI" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Quản lý Lớp học đang chạy tại http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Lỗi khởi động server:", err);
});
