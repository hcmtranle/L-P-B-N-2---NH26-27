import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  RotateCcw,
  Zap,
  MessageSquare
} from "lucide-react";
import { ClassInfo, Student } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIAssistantModalProps {
  classInfo: ClassInfo;
  students: Student[];
  initialPrompt?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  classInfo,
  students,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      role: "assistant",
      content: `Xin chào Cô **${classInfo.teacherName}**! 👋
Em là **Trợ lý AI Giáo viên Chủ nhiệm Lớp 4** của Cô.

Em có thể giúp Cô các công việc sau:
1. 📝 **Soạn nhận xét học bạ / sổ liên lạc** chuẩn Thông tư 27/2020/TT-BGDĐT.
2. 🎲 **Gợi ý trò chơi khởi động 5 phút (Ice-breaker)** cho các tiết học Toán, Tiếng Việt, Khoa học...
3. 🧑‍🏫 **Tư vấn xử lý tình huống sư phạm** (học sinh nói chuyện riêng, chưa hoàn thành bài, nhút nhát...).
4. 📋 **Kế hoạch sinh hoạt lớp cuối tuần** và các hoạt động trải nghiệm sao nhi đồng.
5. 💬 **Soạn tin nhắn gửi Phụ huynh** qua Zalo/SMS ân cần và chuẩn mực.

Cô muốn em hỗ trợ điều gì hôm nay ạ?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState(initialPrompt || "");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: "📝 Nhận xét học bạ TT27",
      prompt: "Hãy viết 3 mẫu nhận xét học bạ theo Thông tư 27: 1 mẫu cho học sinh Xuất sắc, 1 mẫu cho học sinh có năng khiếu Toán nhưng chữ viết chưa đẹp, và 1 mẫu cho học sinh cần rèn luyện thêm tính tự giác.",
    },
    {
      label: "🎲 Trò chơi khởi động 5 phút",
      prompt: "Gợi ý 3 trò chơi khởi động (Ice-breaker) 5 phút đầu giờ môn Toán Lớp 4 giúp học sinh hứng thú tính nhẩm nhanh và sôi nổi.",
    },
    {
      label: "🚨 Xử lý tình huống sư phạm",
      prompt: "Trong giờ học lớp 4, có 2 học sinh ngồi cạnh nhau thường xuyên trêu đùa và không tập trung nghe giảng. Hãy gợi ý cách xử lý sư phạm tế nhị, hiệu quả và tích cực cho giáo viên chủ nhiệm.",
    },
    {
      label: "🗓️ Kịch bản Sinh hoạt lớp tuần",
      prompt: "Lập kịch bản 1 tiết Sinh hoạt lớp 45 phút cho Lớp 4A: Tổng kết thi đua tuần, tuyên dương tổ dẫn đầu, sinh hoạt chủ đề 'Đôi bạn cùng tiến' và dặn dò tuần tới.",
    },
    {
      label: "📩 Soạn tin nhắn Zalo gửi Phụ huynh",
      prompt: "Soạn tin nhắn Zalo gửi phụ huynh nhắc nhở lịch kiểm tra định kỳ giữa học kỳ II môn Toán và Tiếng Việt, dặn dò chuẩn bị đầy đủ dụng cụ học tập.",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          context: `Lớp: ${classInfo.name}, Trường: ${classInfo.school}, Niên khóa: ${classInfo.academicYear}, Sĩ số: ${students.length} học sinh. GVCN: ${classInfo.teacherName}`,
        }),
      });

      const data = await response.json();
      const replyContent = data.reply || data.error || "Xin lỗi Cô, em gặp sự cố kết nối. Cô vui lòng thử lại nhé!";

      const assistantMessage: Message = {
        id: `ast_${Date.now()}`,
        role: "assistant",
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          role: "assistant",
          content: "Dạ thưa Cô, hiện tại không thể kết nối tới máy chủ AI. Thầy/Cô vui lòng kiểm tra lại kết nối mạng nhé!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-3 rounded-md border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold uppercase tracking-tight text-slate-800">
                Trợ Lý AI Giáo Viên Chủ Nhiệm Lớp 4
              </h2>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                Gemini 2.5 Pro
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Tối ưu cho GDPT 2018 và quy chế đánh giá Thông tư 27 Tiểu học
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Làm mới hội thoại</span>
        </button>
      </div>

      {/* Quick Prompts Pills */}
      <div className="bg-white p-2.5 rounded-md border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-1.5 mb-1.5 text-[11px] font-bold text-slate-700">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Gợi ý câu hỏi nhanh:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2 py-0.5 rounded bg-slate-50 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 hover:border-blue-300 text-[11px] font-medium text-slate-700 transition cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-md border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-md p-3 text-xs leading-relaxed shadow-xs relative group ${
                    isAssistant
                      ? "bg-white text-slate-800 border border-slate-200"
                      : "bg-blue-600 text-white font-medium"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-sm max-w-none text-xs">
                    {msg.content}
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {isAssistant && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition px-1 py-0.5 hover:bg-slate-100 rounded text-slate-600 cursor-pointer flex items-center gap-0.5"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-600 text-[10px]">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isAssistant && (
                  <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white p-2.5 rounded-md border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-2 shadow-xs">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span>Trợ lý AI đang xử lý câu trả lời...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi hoặc yêu cầu cho Trợ lý AI..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs bg-white"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
