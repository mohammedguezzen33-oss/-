/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Beaker, CheckCircle2, XCircle, RefreshCw, Trophy, Brain, Sparkles, ChevronLeft } from 'lucide-react';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setError(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "قم بتوليد سؤال عشوائي ومميز باللغة العربية في أحد المجالات التالية: (العلوم، التاريخ، الجغرافيا، الثقافة العامة). تجنب الأسئلة الشائعة جداً والمكررة (مثل الأسئلة عن كوكب المريخ أو عواصم الدول المشهورة جداً). كن مبدعاً في اختيار مواضيع شيقة وغير تقليدية. يجب أن يكون للسؤال 3 خيارات للإجابة، خيار واحد فقط صحيح. قدم النتيجة بتنسيق JSON.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "مجال السؤال (علوم، تاريخ، جغرافيا، ثقافة عامة)" },
              question: { type: Type.STRING, description: "نص السؤال" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "قائمة من 3 خيارات"
              },
              correctIndex: { type: Type.INTEGER, description: "مؤشر الإجابة الصحيحة (0-2)" },
              explanation: { type: Type.STRING, description: "شرح بسيط للإجابة الصحيحة" }
            },
            required: ["category", "question", "options", "correctIndex", "explanation"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}') as Question & { category: string };
      setCurrentQuestion(data);
    } catch (err) {
      console.error("Error fetching question:", err);
      setError("حدث خطأ أثناء جلب السؤال. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null || loading) return;

    setSelectedAnswer(index);
    const correct = index === currentQuestion?.correctIndex;
    setIsCorrect(correct);
    setTotalQuestions(prev => prev + 1);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans selection:bg-emerald-100 relative overflow-x-hidden" dir="rtl">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop')`, // Placeholder for the user's image
          opacity: 0.15 
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 to-[#F8F9FA]/90 backdrop-blur-[2px]" />

      {/* Main Content Wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">تحدي المعرفة</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">النتيجة</span>
              <span className="text-lg font-mono font-bold leading-none">{score}/{totalQuestions}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-12 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full"
                />
                <Brain className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 font-medium animate-pulse">جاري تحضير السؤال القادم...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center"
            >
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-800 font-medium mb-6">{error}</p>
              <button
                onClick={fetchQuestion}
                className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </button>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key={currentQuestion.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Question Card */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Sparkles className="w-24 h-24" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-widest">
                    {(currentQuestion as any).category || 'سؤال'}
                  </span>
                  {selectedAnswer === null && (
                    <button 
                      onClick={fetchQuestion}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      تخطي السؤال
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-8">
                  {currentQuestion.question}
                </h2>

                <div className="grid gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === currentQuestion.correctIndex;
                    const showResult = selectedAnswer !== null;

                    let buttonClass = "w-full p-5 text-right rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ";
                    
                    if (!showResult) {
                      buttonClass += "border-gray-100 hover:border-emerald-500 hover:bg-emerald-50/30 bg-white";
                    } else if (isCorrectOption) {
                      buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                    } else if (isSelected && !isCorrectOption) {
                      buttonClass += "border-red-500 bg-red-50 text-red-900";
                    } else {
                      buttonClass += "border-gray-50 bg-gray-50/50 text-gray-400 opacity-60";
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={buttonClass}
                      >
                        <span className="text-lg font-medium">{option}</span>
                        {showResult && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        {showResult && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback & Next Button */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-6"
                  >
                    <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          {isCorrect ? <Trophy className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <h4 className={`font-bold mb-1 ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                            {isCorrect ? 'إجابة رائعة!' : 'للأسف، إجابة غير صحيحة'}
                          </h4>
                          <p className={`text-sm leading-relaxed ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                            {currentQuestion.explanation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={fetchQuestion}
                      className="w-full py-5 bg-[#141414] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all group active:scale-[0.98]"
                    >
                      السؤال التالي
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>

      {/* Footer Stats */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-6 py-3 rounded-full shadow-lg flex items-center gap-6 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">الدقة: {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}%</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
