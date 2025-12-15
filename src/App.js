import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Send,
  BarChart2,
  User,
  ArrowRight,
  RefreshCw,
  Star,
  Target,
  Award,
  Upload,
  X,
  Image as ImageIcon,
  Lightbulb,
  Clock,
  ThumbsUp,
  Unlock,
  Zap,
} from "lucide-react";

// --- DATA ---

const INTERVIEW_DATA = [
  {
    id: 1,
    question:
      "Hãy giới thiệu ngắn gọn về bản thân và kinh nghiệm làm việc của bạn.",
    purpose: "Đánh giá khả năng tổng hợp và sự phù hợp cơ bản.",
    hint: "Dùng công thức: Quá khứ (Học vấn) -> Hiện tại (Kinh nghiệm nổi bật) -> Tương lai. Đừng kể lể đời tư.",
    modelAnswer:
      "Em tốt nghiệp chuyên ngành Marketing tại ĐH Kinh Tế. Em đã có 2 năm kinh nghiệm làm Content SEO tại công ty ABC, giúp tăng traffic 30%. Hiện tại, em muốn thử sức ở môi trường agency năng động để phát triển kỹ năng quản lý.",
  },
  {
    id: 2,
    question: "Tại sao bạn lại nghỉ việc ở công ty cũ?",
    purpose: "Kiểm tra thái độ và sự trung thực.",
    hint: "Tuyệt đối không nói xấu sếp hay công ty cũ. Tập trung vào 'hướng tới tương lai'.",
    modelAnswer:
      "Em trân trọng thời gian tại công ty cũ, nhưng em muốn tìm kiếm một môi trường có nhiều thách thức hơn về chuyên môn để phát triển sự nghiệp lâu dài.",
  },
  {
    id: 3,
    question: "Điểm yếu lớn nhất của bạn là gì?",
    purpose: "Đánh giá sự tự nhận thức.",
    hint: "Chọn một điểm yếu thật nhưng không chí mạng, và nêu cách bạn đang khắc phục.",
    modelAnswer:
      "Trước đây em hơi ngại nói trước đám đông. Em đã khắc phục bằng cách tham gia CLB thuyết trình và giờ đã tự tin hơn 70%.",
  },
  {
    id: 4,
    question: "Tại sao bạn nghĩ mình phù hợp với vị trí này?",
    purpose: "Câu hỏi chốt sale bản thân.",
    hint: "So khớp kỹ năng của bạn với yêu cầu trong JD.",
    modelAnswer:
      "Em thấy công ty cần người mạnh về [Kỹ năng A]. Em đã có kinh nghiệm thực tế xử lý vấn đề này ở dự án trước và tin rằng có thể đóng góp ngay lập tức.",
  },
  {
    id: 5,
    question: "Bạn mong muốn mức lương bao nhiêu?",
    purpose: "Đàm phán ngân sách.",
    hint: "Đưa ra một khoảng (range) thay vì con số cứng.",
    modelAnswer:
      "Dựa trên năng lực và thị trường, em mong muốn mức thu nhập trong khoảng 15 - 18 triệu. Tuy nhiên, em quan trọng hơn là cơ hội phát triển tại công ty.",
  },
];

// --- Components ---

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}) => {
  const baseStyle =
    "px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    primary:
      "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-md shadow-yellow-200 border-b-4 border-yellow-600 active:border-b-0 active:mt-1",
    secondary:
      "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50",
    outline: "border-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled
          ? "opacity-50 cursor-not-allowed active:mt-0 active:border-b-4"
          : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border-2 border-orange-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-4 border border-gray-200 p-0.5">
    <div
      className="bg-yellow-400 h-full rounded-full transition-all duration-1000"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState("input");
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");

  // Files
  const [cvFile, setCvFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [jdPreview, setJdPreview] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cvFileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  // Results
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  // Interview
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- Logic ---

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "cv") {
      setCvFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setCvPreview(reader.result);
        reader.readAsDataURL(file);
      } else setCvPreview(null);
    } else {
      setJdFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setJdPreview(reader.result);
        reader.readAsDataURL(file);
      } else setJdPreview(null);
    }
  };

  const handleAnalyze = () => {
    const hasCvContent = cvText.length >= 50 || cvFile;
    if (!hasCvContent) {
      alert("Vui lòng nhập nội dung hoặc tải file CV để bắt đầu.");
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      // Mock Data
      setAnalysisResult({
        score: Math.floor(Math.random() * 20) + 65,
        strengths: [
          "Cấu trúc rõ ràng",
          "Kinh nghiệm phù hợp",
          "Có từ khóa hành động",
        ],
        weaknesses: ["Thiếu số liệu cụ thể", "Mục tiêu hơi chung chung"],
        suggestions: ["Thêm các con số (KPIs)", "Dùng mô hình STAR"],
      });

      if (jdText || jdFile) {
        setMatchResult({
          score: Math.floor(Math.random() * 30) + 55,
          missingSkills: ["Tiếng Anh", "Quản lý nhóm", "Phân tích dữ liệu"],
          advice:
            "Bạn cần bổ sung thêm các ví dụ về khả năng làm việc nhóm để phù hợp hơn với JD này.",
        });
      }

      setIsAnalyzing(false);
      setActiveTab("analyze");
    }, 1500);
  };

  const startInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestionIndex(0);
    setMessages([{ sender: "bot", type: "question", data: INTERVIEW_DATA[0] }]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;

    const newMessages = [...messages, { sender: "user", text: currentInput }];
    setMessages(newMessages);
    setCurrentInput("");
    setIsTyping(true);
    setShowHint(false);

    setTimeout(() => {
      const currentQ = INTERVIEW_DATA[currentQuestionIndex];
      const nextIndex = currentQuestionIndex + 1;

      // Simple Feedback Logic
      let feedback = "Câu trả lời khá tốt.";
      if (currentInput.length < 50)
        feedback = "Câu trả lời hơi ngắn, bạn nên thêm dẫn chứng cụ thể hơn.";
      else if (currentInput.length > 300)
        feedback = "Hơi dài, hãy thử cô đọng lại các ý chính.";

      const feedbackMsg = {
        sender: "bot",
        type: "feedback",
        data: {
          feedback: feedback,
          modelAnswer: currentQ.modelAnswer,
        },
      };

      const updatedMessages = [...newMessages, feedbackMsg];

      if (nextIndex < INTERVIEW_DATA.length) {
        updatedMessages.push({
          sender: "bot",
          type: "question",
          data: INTERVIEW_DATA[nextIndex],
        });
        setCurrentQuestionIndex(nextIndex);
      } else {
        updatedMessages.push({
          sender: "bot",
          type: "text",
          text: "Chúc mừng! Bạn đã hoàn thành bài luyện tập.",
        });
      }

      setMessages(updatedMessages);
      setIsTyping(false);
    }, 1500);
  };

  // --- Renders ---

  const renderHeader = () => (
    <header className="bg-yellow-400 p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-full border-2 border-orange-500 shadow-sm text-2xl">
            🦆
          </div>
          <h1 className="text-2xl font-black text-orange-900 tracking-tight">
            DUCKY COACH
          </h1>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {[
            { id: "input", icon: User, label: "Nhập Liệu" },
            { id: "analyze", icon: BarChart2, label: "Phân Tích" },
            { id: "match", icon: Target, label: "So Khớp" },
            { id: "interview", icon: MessageSquare, label: "Phỏng Vấn" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              disabled={
                (item.id === "analyze" && !analysisResult) ||
                (item.id === "match" && !matchResult)
              }
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2
                ${
                  activeTab === item.id
                    ? "bg-white text-orange-700 shadow-sm border-2 border-orange-200"
                    : "text-orange-900/70 hover:bg-yellow-500/20"
                }
                ${
                  (item.id === "analyze" && !analysisResult) ||
                  (item.id === "match" && !matchResult)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );

  const renderMessage = (msg, idx) => {
    if (msg.sender === "user") {
      return (
        <div key={idx} className="flex justify-end animate-fade-in mb-4">
          <div className="bg-orange-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
            <p className="text-sm">{msg.text}</p>
          </div>
        </div>
      );
    }

    if (msg.type === "question") {
      return (
        <div
          key={idx}
          className="flex justify-start mb-6 w-full animate-fade-in"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-200 border-2 border-yellow-400 flex items-center justify-center text-xl mr-3 flex-shrink-0">
            🦆
          </div>
          <div className="bg-white border-2 border-yellow-200 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[90%]">
            <h3 className="font-bold text-orange-800 mb-1">
              Câu hỏi {msg.data.id}
            </h3>
            <p className="text-gray-800 text-lg font-medium">
              {msg.data.question}
            </p>
            <div className="mt-2 text-xs text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded">
              Mục đích: {msg.data.purpose}
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === "feedback") {
      return (
        <div
          key={idx}
          className="flex justify-start mb-6 w-full animate-fade-in ml-12"
        >
          <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl shadow-sm w-full max-w-[85%]">
            <div className="mb-3 pb-3 border-b border-green-100">
              <h4 className="font-bold text-green-700 text-sm flex items-center gap-2 mb-1">
                <ThumbsUp size={16} /> Nhận xét nhanh:
              </h4>
              <p className="text-gray-700 text-sm italic">
                "{msg.data.feedback}"
              </p>
            </div>
            <div>
              <h4 className="font-bold text-green-700 text-sm flex items-center gap-2 mb-2">
                <Star size={16} className="fill-green-600" /> Câu trả lời tham
                khảo:
              </h4>
              <div className="bg-white p-3 rounded-xl border border-green-200 text-sm text-gray-600 leading-relaxed">
                "{msg.data.modelAnswer}"
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={idx} className="flex justify-start mb-4 ml-12 animate-fade-in">
        <div className="bg-gray-100 text-gray-600 p-3 rounded-2xl text-sm max-w-[85%]">
          {msg.text}
        </div>
      </div>
    );
  };

  const renderInputSection = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200 shadow-sm text-center">
        <h2 className="text-2xl font-black text-orange-800 mb-2">
          Nâng Cấp CV Cùng Ducky 🦆
        </h2>
        <p className="text-gray-600">
          Thả CV vào đây, Vịt sẽ giúp bạn soi lỗi và luyện phỏng vấn!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <User className="text-orange-500" /> CV Của Bạn
            </h3>
            <div className="flex gap-2">
              <input
                type="file"
                ref={cvFileInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, "cv")}
              />
              <button
                onClick={() =>
                  !cvFile ? cvFileInputRef.current.click() : setCvFile(null)
                }
                className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full hover:bg-orange-200"
              >
                {!cvFile ? "+ Tải lên" : "Xóa"}
              </button>
            </div>
          </div>
          {cvFile ? (
            <div className="h-48 bg-orange-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-orange-200">
              <FileText size={40} className="text-orange-400 mb-2" />
              <span className="font-bold text-orange-800 text-sm truncate max-w-[200px]">
                {cvFile.name}
              </span>
            </div>
          ) : (
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="w-full h-48 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-yellow-400 text-sm"
              placeholder="Dán nội dung CV vào đây..."
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Briefcase className="text-yellow-500" /> Job Description (JD)
            </h3>
            <div className="flex gap-2">
              <input
                type="file"
                ref={jdFileInputRef}
                className="hidden"
                onChange={(e) => handleFileUpload(e, "jd")}
              />
              <button
                onClick={() =>
                  !jdFile ? jdFileInputRef.current.click() : setJdFile(null)
                }
                className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full hover:bg-orange-200"
              >
                {!jdFile ? "+ Tải lên" : "Xóa"}
              </button>
            </div>
          </div>
          {jdFile ? (
            <div className="h-48 bg-yellow-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-yellow-200">
              <Briefcase size={40} className="text-yellow-400 mb-2" />
              <span className="font-bold text-yellow-800 text-sm truncate max-w-[200px]">
                {jdFile.name}
              </span>
            </div>
          ) : (
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full h-48 p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-yellow-400 text-sm"
              placeholder="Dán nội dung JD vào đây..."
            />
          )}
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-12 py-3 text-lg shadow-lg"
        >
          {isAnalyzing ? (
            <RefreshCw className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Bắt đầu Phân Tích <ArrowRight />
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 bg-gradient-to-br from-yellow-400 to-orange-500 text-white flex flex-col items-center justify-center border-none">
          <div className="text-6xl font-black mb-2">
            {analysisResult?.score}
          </div>
          <div className="text-sm font-bold opacity-90 uppercase tracking-widest">
            Điểm CV
          </div>
        </Card>
        <Card className="p-6 col-span-2">
          <h3 className="font-bold text-orange-800 mb-4 flex gap-2">
            <Award /> Đánh giá tổng quan
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-green-600 font-bold text-sm mb-2">
                Điểm mạnh
              </h4>
              <ul className="text-sm space-y-1 text-gray-600 list-disc pl-4">
                {analysisResult?.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-red-500 font-bold text-sm mb-2">
                Cần cải thiện
              </h4>
              <ul className="text-sm space-y-1 text-gray-600 list-disc pl-4">
                {analysisResult?.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderJobFit = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="p-8 text-center">
        <h2 className="text-gray-500 text-sm font-bold uppercase mb-2">
          Độ phù hợp công việc
        </h2>
        <div className="text-5xl font-black text-orange-500 mb-4">
          {matchResult?.score}%
        </div>
        <ProgressBar value={matchResult?.score} />

        <div className="mt-8 bg-orange-50 p-6 rounded-xl text-left">
          <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
            <Target size={18} /> Lời khuyên từ Vịt:
          </h3>
          <p className="text-gray-700">{matchResult?.advice}</p>
        </div>
      </Card>
    </div>
  );

  const renderInterview = () => (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-yellow-200">
      <div className="bg-yellow-100 p-4 border-b-2 border-yellow-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-orange-600" />
          <span className="font-bold text-orange-900">Phòng Luyện Tập</span>
        </div>
        {!interviewStarted && (
          <Button
            onClick={startInterview}
            variant="primary"
            className="text-xs py-1"
          >
            Bắt đầu ngay
          </Button>
        )}
        {interviewStarted && (
          <div className="text-xs font-bold bg-white text-orange-600 px-3 py-1 rounded-full border border-orange-200">
            Câu {currentQuestionIndex + 1}/5
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-orange-50/30">
        {!interviewStarted ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
            <div className="text-6xl mb-4">🦆💬</div>
            <h3 className="text-xl font-bold text-gray-700">Sẵn sàng chưa?</h3>
            <p className="text-sm text-gray-500 mt-2">
              Vịt sẽ đóng vai nhà tuyển dụng để phỏng vấn bạn.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {isTyping && (
              <div className="ml-12 text-xs text-gray-400 italic animate-pulse">
                Vịt đang suy nghĩ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {interviewStarted && (
        <div className="p-4 bg-white border-t-2 border-yellow-100">
          {/* Hint Toggle */}
          <div className="mb-2 flex justify-end">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-orange-400 font-bold hover:text-orange-600 flex items-center gap-1"
              >
                <Lightbulb size={12} /> Gợi ý
              </button>
            ) : (
              <div className="bg-yellow-50 w-full p-2 rounded-lg border border-yellow-200 text-xs text-gray-700 mb-2 relative animate-fade-in">
                <button
                  onClick={() => setShowHint(false)}
                  className="absolute top-1 right-1 text-gray-400"
                >
                  <X size={12} />
                </button>
                <strong className="text-orange-600">💡 Mẹo:</strong>{" "}
                {INTERVIEW_DATA[currentQuestionIndex].hint}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Nhập câu trả lời..."
              disabled={isTyping}
              className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-0 focus:border-orange-400 outline-none transition-colors"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isTyping}
              className="rounded-xl aspect-square p-0 w-12 flex items-center justify-center"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800 flex flex-col">
      {renderHeader()}
      <main className="flex-1 p-4 md:p-8">
        {activeTab === "input" && renderInputSection()}
        {activeTab === "analyze" && renderAnalysis()}
        {activeTab === "match" && renderJobFit()}
        {activeTab === "interview" && renderInterview()}
      </main>
    </div>
  );
}
