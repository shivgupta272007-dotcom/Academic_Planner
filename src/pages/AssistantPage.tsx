import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Brain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import { getOverdueAssignments, getUpcomingAssignments, calculateStreak, getStudyHoursThisWeek } from '../utils/analytics';
import { getDaysUntilDue } from '../utils/dates';

interface Message {
  id: string;
  sender: 'user' | 'shiv';
  text: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function AssistantPage() {
  const { assignments, subjects, pomodoroSessions } = useApp();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'shiv',
      text: "Hello! I'm Shiv, your personal AI Study Assistant. I can analyze your dashboard, suggest study schedules, clarify learning strategies, and help you stay on track. What would you like to focus on today?",
      timestamp: new Date(),
      suggestions: [
        'Suggest a study plan',
        'Check my urgent deadlines',
        'How can I study better?',
        'Show my stats overview',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Response generation logic based on app data and keywords
  const generateResponse = (query: string): { text: string; suggestions?: string[] } => {
    const q = query.toLowerCase();

    // 1. Context: Urgent deadlines
    if (q.includes('deadline') || q.includes('urgent') || q.includes('due') || q.includes('overdue')) {
      const overdue = getOverdueAssignments(assignments);
      const upcoming = getUpcomingAssignments(assignments, 7);

      if (overdue.length === 0 && upcoming.length === 0) {
        return {
          text: "Fantastic news! You have no overdue or upcoming assignments due in the next 7 days. Enjoy the free slot or check the **Syllabus** section to get ahead!",
          suggestions: ['Explain spaced repetition', 'Suggest a study plan'],
        };
      }

      let responseText = "Here is what needs your attention immediately:\n\n";
      if (overdue.length > 0) {
        responseText += `⚠️ **Overdue Assignments (${overdue.length}):**\n`;
        overdue.slice(0, 3).forEach((a) => {
          const sub = subjects.find((s) => s.id === a.subjectId);
          responseText += `- **${a.title}** (${sub?.icon} ${sub?.name}) — was due on ${a.dueDate}\n`;
        });
        responseText += '\n';
      }

      if (upcoming.length > 0) {
        responseText += `📅 **Due this week (${upcoming.length}):**\n`;
        upcoming.slice(0, 3).forEach((a) => {
          const sub = subjects.find((s) => s.id === a.subjectId);
          const left = getDaysUntilDue(a.dueDate);
          responseText += `- **${a.title}** (${sub?.icon} ${sub?.name}) — in ${left} day${left !== 1 ? 's' : ''}\n`;
        });
      }

      responseText += "\nI suggest tackling the oldest overdue task first. Try launching a 25-minute Pomodoro timer for it!";
      return {
        text: responseText,
        suggestions: ['Start Pomodoro timer', 'Suggest a study plan'],
      };
    }

    // 2. Context: Study plan suggestion
    if (q.includes('plan') || q.includes('suggest') || q.includes('schedule') || q.includes('study today')) {
      const upcoming = getUpcomingAssignments(assignments, 7);
      const overdue = getOverdueAssignments(assignments);

      if (overdue.length > 0) {
        const first = overdue[0];
        const sub = subjects.find((s) => s.id === first.subjectId);
        return {
          text: `Based on your agenda, you should prioritize **${first.title}** for ${sub?.icon} ${sub?.name}. It is currently overdue! \n\n**Proposed study block for today:**\n- **Session 1 (25m)**: Outline the core tasks for "${first.title}".\n- **Break (5m)**: Walk around, stretch.\n- **Session 2 (25m)**: Write the first half.\n\nWould you like me to guide you on how to start?`,
          suggestions: ['Yes, explain Pomodoro', 'Check my urgent deadlines'],
        };
      }

      if (upcoming.length > 0) {
        const first = upcoming[0];
        const sub = subjects.find((s) => s.id === first.subjectId);
        return {
          text: `You have "${first.title}" due soon. Let's get ahead of it!\n\n**Study Plan:**\n- Plan a **45-minute focus block** on **${sub?.name || 'Subject'}** today.\n- Focus strictly on completing the research portion.\n- Follow up with a 15-minute review session tomorrow.`,
          suggestions: ['How to focus better', 'Show my stats overview'],
        };
      }

      return {
        text: "Since you have no upcoming deadlines, this is the perfect time to build your skills! I suggest setting up a **45-minute review block** for your most challenging subject. Check the **Syllabus** tab to review modules.",
        suggestions: ['How can I study better?', 'Review my subjects'],
      };
    }

    // 3. Context: Stats overview
    if (q.includes('stats') || q.includes('overview') || q.includes('performance') || q.includes('progress')) {
      const streak = calculateStreak(assignments);
      const hours = getStudyHoursThisWeek(pomodoroSessions);
      const completed = assignments.filter((a) => a.status === 'completed').length;
      const total = assignments.length;

      return {
        text: `Here is your academic dashboard analysis 📊:\n\n- **Current Study Streak**: 🔥 ${streak} day${streak !== 1 ? 's' : ''}\n- **Focus Hours (This Week)**: ⚡ ${hours} hour${hours !== 1 ? 's' : ''} logged\n- **Assignments Finished**: ✅ ${completed} of ${total} (${total > 0 ? Math.round((completed/total)*100) : 0}% completion rate)\n\n${streak > 0 ? 'Fantastic streak! Keep logging daily sessions to keep the flame burning!' : 'Complete an assignment today to start your study streak!'}`,
        suggestions: ['Suggest a study plan', 'Check my urgent deadlines'],
      };
    }

    // 4. Doubt clarification: study techniques
    if (q.includes('how') || q.includes('study better') || q.includes('active recall') || q.includes('spaced') || q.includes('feynman') || q.includes('pomodoro') || q.includes('technique')) {
      if (q.includes('spaced')) {
        return {
          text: "**Spaced Repetition** is a learning method where you review material at increasing intervals (e.g., 1 day, 3 days, 7 days, 30 days) instead of cramming. It shifts knowledge from short-term to long-term memory. You can configure your Deadlines lead-time settings in our **Settings** page to remind you 1, 3, or 7 days in advance!",
          suggestions: ['Explain active recall', 'Explain Feynman technique'],
        };
      }
      if (q.includes('recall')) {
        return {
          text: "**Active Recall** involves testing your memory rather than passively reading notes. Instead of highlighting text, close the book and write down everything you remember, or use flashcards. Shiv's advice: Write a brief quiz in your **Notes** checklist and try answering them without checking the notes!",
          suggestions: ['Explain spaced repetition', 'Explain Feynman technique'],
        };
      }
      if (q.includes('feynman')) {
        return {
          text: "The **Feynman Technique** is simple:\n1. Choose a concept you want to learn.\n2. Explain it to a 10-year-old child (or write it down simply using no complex jargon).\n3. Identify gaps in your explanation, go back to the source material, and simplify further.\n\nThis ensures you actually understand the material rather than just memorizing terms.",
          suggestions: ['Explain active recall', 'Explain Pomodoro'],
        };
      }
      if (q.includes('pomodoro')) {
        return {
          text: "The **Pomodoro Technique** divides study time into 25-minute focus intervals followed by 5-minute short breaks. After 4 sessions, take a longer 15-30 minute break. We have built this directly into our **Pomodoro Timer** tab where your focus time automatically logs study hours directly to your subjects!",
          suggestions: ['Suggest a study plan', 'Show my stats overview'],
        };
      }
      return {
        text: "My top three scientific study techniques are:\n1. **Active Recall** (testing yourself, not just reading).\n2. **Spaced Repetition** (scheduling reviews over intervals).\n3. **Feynman Technique** (explaining concepts simply).\n\nWhich one would you like me to explain in detail?",
        suggestions: ['Explain active recall', 'Explain spaced repetition', 'Explain Feynman technique'],
      };
    }

    // 5. Default greeting & general conversation
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('shiv')) {
      return {
        text: "Hey there! I am Shiv. I'm ready to help you coordinate your studies, check deadlines, or explain complex concepts. What can I do for you?",
        suggestions: ['Suggest a study plan', 'Check my urgent deadlines', 'Show my stats overview'],
      };
    }

    // Default fallback
    return {
      text: "I understand! As your study assistant, I'm here to support your learning. Let's make sure your assignments are in order, log some focus hours, and review the syllabus. \n\nIf you have a specific doubt, ask me to explain study techniques (like active recall or spaced repetition), suggest a study schedule, or check your stats!",
      suggestions: ['Suggest a study plan', 'How can I study better?', 'Show my stats overview'],
    };
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateResponse(textToSend);
      const shivMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'shiv',
        text: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };
      setMessages((prev) => [...prev, shivMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <Header title="AI Study Assistant" subtitle="Clarify doubts, explain concepts, and analyze planning tips with Shiv" />

      {/* Main chat layout */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col z-10 relative">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />

        {/* Chat Messages */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 no-scrollbar">
          {messages.map((msg) => {
            const isShiv = msg.sender === 'shiv';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isShiv ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isShiv
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                      : 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                  }`}
                >
                  {isShiv ? <Sparkles size={16} /> : <User size={16} />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap border ${
                      isShiv
                        ? 'bg-[var(--glass-bg-light)] text-[var(--color-text-primary)] border-[var(--glass-border)] rounded-tl-sm'
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm shadow-md shadow-indigo-600/10'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Suggestions */}
                  {isShiv && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md">
                <Brain size={16} className="animate-pulse" />
              </div>
              <div className="bg-[var(--glass-bg-light)] border border-[var(--glass-border)] px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend(input);
            }}
            placeholder="Ask Shiv to clarify doubts or suggest plans..."
            className="flex-1 glass-input py-3"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
