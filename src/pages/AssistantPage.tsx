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
  const {
    assignments,
    subjects,
    pomodoroSessions,
    studyNotes,
    exams,
    syllabi,
    settings,
    studyResources,
  } = useApp();

  const studentName = settings.userName || 'Student';

  const [focusSubjectId, setFocusSubjectId] = useState<string>('all');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'shiv',
      text: `Hello, ${studentName}! I'm Shiv, your personal AI Study Assistant. I can clarify any academic doubts, solve equations, suggest study schedules, explain scientific learning strategies, and analyze your dashboard performance. What would you like to focus on today?`,
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

  // Context focus shift alert message from Shiv
  useEffect(() => {
    if (focusSubjectId !== 'all') {
      const sub = subjects.find(s => s.id === focusSubjectId);
      const subName = sub?.name || 'Subject';
      setMessages((prev) => [
        ...prev,
        {
          id: `focus-change-${Date.now()}`,
          sender: 'shiv',
          text: `🎯 I have focused my context on **${subName}** ${sub?.icon || ''}. I can now read the full text of your notes and syllabus for this subject. Ask me questions, request a quiz, or ask for a custom study plan!`,
          timestamp: new Date(),
          suggestions: [
            `Quiz me on ${subName}`,
            `Review ${subName} syllabus`,
            `Suggest a ${subName} study plan`
          ]
        }
      ]);
    } else {
      // Avoid firing on initial render when there is only the welcome message
      if (messages.length > 1) {
        setMessages((prev) => [
          ...prev,
          {
            id: `focus-change-${Date.now()}`,
            sender: 'shiv',
            text: `🌐 Focus reset. I am now looking at your overall Academic Dashboard with overview context for all subjects.`,
            timestamp: new Date(),
            suggestions: [
              'Show my stats overview',
              'Check my urgent deadlines',
              'Suggest a study plan'
            ]
          }
        ]);
      }
    }
  }, [focusSubjectId, subjects]);

  const getSystemPrompt = () => {
    const isFocus = focusSubjectId !== 'all';
    const activeSub = isFocus ? subjects.find(s => s.id === focusSubjectId) : null;

    const filteredAssignments = isFocus
      ? assignments.filter(a => a.subjectId === focusSubjectId)
      : assignments;

    const filteredExams = isFocus
      ? exams.filter(e => e.subjectId === focusSubjectId)
      : exams;

    const filteredNotes = isFocus
      ? studyNotes.filter(n => n.subjectId === focusSubjectId)
      : studyNotes;

    const overdue = getOverdueAssignments(filteredAssignments);
    const upcoming = getUpcomingAssignments(filteredAssignments, 7);
    const streak = calculateStreak(assignments);
    const hours = getStudyHoursThisWeek(pomodoroSessions);
    const completed = filteredAssignments.filter((a) => a.status === 'completed').length;
    const total = filteredAssignments.length;

    const subjectListStr = subjects
      .map((s) => `- ${s.name} (Icon: ${s.icon})`)
      .join('\n');

    const overdueStr = overdue
      .map((a) => {
        const sub = subjects.find((s) => s.id === a.subjectId);
        return `- ${a.title} (${sub?.name || 'Subject'}) — was due: ${a.dueDate} (Priority: ${a.priority})`;
      })
      .join('\n');

    const upcomingStr = upcoming
      .map((a) => {
        const sub = subjects.find((s) => s.id === a.subjectId);
        const left = getDaysUntilDue(a.dueDate);
        return `- ${a.title} (${sub?.name || 'Subject'}) — due in ${left} day${left !== 1 ? 's' : ''} on ${a.dueDate} (Priority: ${a.priority})`;
      })
      .join('\n');

    const examStr = filteredExams
      .map((e) => {
        const sub = subjects.find((s) => s.id === e.subjectId);
        return `- ${e.title} (${sub?.name || 'Subject'}) on ${e.date} at ${e.time}${e.room ? ` in Room ${e.room}` : ''}`;
      })
      .join('\n');

    const filteredResources = isFocus
      ? studyResources.filter((r) => r.subjectId === focusSubjectId)
      : studyResources;

    const resourceStr = filteredResources
      .map((r) => {
        const sub = r.subjectId !== 'general' ? subjects.find((s) => s.id === r.subjectId) : null;
        return `- Resource: "${r.title}" (${sub?.name || 'General Reference'}) — Category: ${r.category} — Link: ${r.url}${r.description ? ` (Notes: ${r.description})` : ''}`;
      })
      .join('\n');

    // Load full notes contents for focused subject
    let detailedNotesStr = '';
    if (isFocus) {
      detailedNotesStr = filteredNotes
        .map((n) => `--- NOTE: "${n.title}" ---\n${n.content}`)
        .join('\n\n');
    } else {
      detailedNotesStr = filteredNotes
        .map((n) => {
          const sub = subjects.find((s) => s.id === n.subjectId);
          return `- Note: "${n.title}" (${sub?.name || 'Subject'})`;
        })
        .join('\n');
    }

    // Load syllabus details for focused subject
    let syllabusDetails = '';
    if (isFocus) {
      const activeSyllabus = syllabi.find(s => s.subjectId === focusSubjectId);
      if (activeSyllabus && activeSyllabus.notes) {
        syllabusDetails = `Syllabus Overview for ${activeSub?.name}:\n${activeSyllabus.notes}`;
      }
    }

    return `You are Shiv, an intelligent, friendly, and encouraging AI Study Assistant integrated into the user's Academic Planner app.
Your goals:
1. Address the user by their name, "${studentName}".
2. Help the user clarify any academic doubts (solve science, programming, math, history, literature, or any general questions they ask).
3. Offer suggestions on time management, productivity, and study schedules. Suggest techniques like Pomodoro, Active Recall, Feynman technique, and Spaced Repetition.
4. Answer planner-related questions based on their live dashboard statistics.

Current Date: ${new Date().toLocaleDateString()}

${isFocus ? `[ACTIVE FOCUS] You are currently focusing on the subject: "${activeSub?.name}" ${activeSub?.icon}. Tailor your advice primarily to this subject unless the user asks otherwise.` : ''}

User's Real-Time Planner Dashboard Data:
- Student Name: ${studentName}
- Current Study Streak: 🔥 ${streak} day${streak !== 1 ? 's' : ''}
- Study Hours This Week: ⚡ ${hours} hour${hours !== 1 ? 's' : ''} logged
- Completed Assignments: ✅ ${completed} of ${total} (${total > 0 ? Math.round((completed / total) * 100) : 0}% completion for ${isFocus ? activeSub?.name : 'all subjects'})
- Total Saved Course Notes: 📝 ${studyNotes.length} note(s)
- Total Course Syllabus Files: 📚 ${syllabi.length} file(s)
- Total Saved Study Resource Links: 🔗 ${studyResources.length} link(s)

- Registered Subjects (${subjects.length}):
${subjectListStr || 'No subjects created yet.'}

- Study Resources (${filteredResources.length}):
${resourceStr || 'No study resources saved yet.'}

${isFocus ? `Syllabus & Course Notes Content for "${activeSub?.name}":` : 'Saved Notes Titles:'}
${detailedNotesStr || 'No notes created yet.'}
${syllabusDetails ? `\n${syllabusDetails}` : ''}

- Overdue Assignments (${overdue.length}):
${overdueStr || 'None. Great job!'}

- Upcoming Assignments (next 7 days, ${upcoming.length}):
${upcomingStr || 'None in the next 7 days.'}

- Scheduled Exams (${exams.length}):
${examStr || 'No exams scheduled.'}

Instructions:
- Always answer user questions accurately, intelligently, and comprehensively. You have the knowledge of a college professor and a helpful peer.
- If the user asks general questions (e.g. math problems, coding questions, science queries), solve them fully and explain the steps clearly.
- If the user asks you to quiz them, generate a 3-question quiz based on the notes contents or syllabus provided above. Wait for them to answer.
- Refer to the user as "${studentName}".
- Format your response nicely using Markdown (bold text, bullet points, headers, or code blocks if relevant).
- Keep responses engaging but concise. Avoid long paragraphs; prefer bullet points.`;
  };

  // Response generation logic based on app data and keywords (Fallback Local Engine)
  const generateResponse = (query: string): { text: string; suggestions?: string[] } => {
    const q = query.toLowerCase();

    // 1. Context: Urgent deadlines
    if (q.includes('deadline') || q.includes('urgent') || q.includes('due') || q.includes('overdue')) {
      const overdue = getOverdueAssignments(assignments);
      const upcoming = getUpcomingAssignments(assignments, 7);

      if (overdue.length === 0 && upcoming.length === 0) {
        return {
          text: `Fantastic news, ${studentName}! You have no overdue or upcoming assignments due in the next 7 days. Enjoy the free slot or check the **Syllabus** section to get ahead!`,
          suggestions: ['Explain spaced repetition', 'Suggest a study plan'],
        };
      }

      let responseText = `Here is what needs your attention immediately, ${studentName}:\n\n`;
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
          text: `Based on your agenda, ${studentName}, you should prioritize **${first.title}** for ${sub?.icon} ${sub?.name}. It is currently overdue! \n\n**Proposed study block for today:**\n- **Session 1 (25m)**: Outline the core tasks for "${first.title}".\n- **Break (5m)**: Walk around, stretch.\n- **Session 2 (25m)**: Write the first half.\n\nWould you like me to guide you on how to start?`,
          suggestions: ['Yes, explain Pomodoro', 'Check my urgent deadlines'],
        };
      }

      if (upcoming.length > 0) {
        const first = upcoming[0];
        const sub = subjects.find((s) => s.id === first.subjectId);
        return {
          text: `You have "${first.title}" due soon, ${studentName}. Let's get ahead of it!\n\n**Study Plan:**\n- Plan a **45-minute focus block** on **${sub?.name || 'Subject'}** today.\n- Focus strictly on completing the research portion.\n- Follow up with a 15-minute review session tomorrow.`,
          suggestions: ['How to focus better', 'Show my stats overview'],
        };
      }

      return {
        text: `Since you have no upcoming deadlines, ${studentName}, this is the perfect time to build your skills! I suggest setting up a **45-minute review block** for your most challenging subject. Check the **Syllabus** tab to review modules.`,
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
        text: `Here is your academic dashboard analysis, ${studentName} 📊:\n\n- **Current Study Streak**: 🔥 ${streak} day${streak !== 1 ? 's' : ''}\n- **Focus Hours (This Week)**: ⚡ ${hours} hour${hours !== 1 ? 's' : ''} logged\n- **Assignments Finished**: ✅ ${completed} of ${total} (${total > 0 ? Math.round((completed/total)*100) : 0}% completion rate)\n\n${streak > 0 ? 'Fantastic streak! Keep logging daily sessions to keep the flame burning!' : 'Complete an assignment today to start your study streak!'}`,
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
        text: `Hey there, ${studentName}! I am Shiv. I'm ready to help you coordinate your studies, check deadlines, or explain complex concepts. What can I do for you today?`,
        suggestions: ['Suggest a study plan', 'Check my urgent deadlines', 'Show my stats overview'],
      };
    }

    // Default fallback
    return {
      text: `I understand! As your study assistant, I'm here to support your learning, ${studentName}. Let's make sure your assignments are in order, log some focus hours, and review the syllabus. \n\nIf you have a specific doubt, ask me to explain study techniques (like active recall or spaced repetition), suggest a study schedule, or check your stats!`,
      suggestions: ['Suggest a study plan', 'How can I study better?', 'Show my stats overview'],
    };
  };

  const handleSend = async (textToSend: string) => {
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

    const historyPayload = messages.slice(-10).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    try {
      const systemPrompt = getSystemPrompt();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...historyPayload,
            { role: 'user', content: textToSend },
          ],
          model: 'openai',
          private: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content;

      if (!replyText) {
        throw new Error('Empty response from Pollinations API');
      }

      // Generate dynamic suggestions based on reply context
      const suggestions: string[] = [];
      const lowerReply = replyText.toLowerCase();
      
      if (lowerReply.includes('pomodoro')) suggestions.push('Explain Pomodoro');
      if (lowerReply.includes('recall')) suggestions.push('Explain Active Recall');
      if (lowerReply.includes('feynman')) suggestions.push('Explain Feynman');
      if (lowerReply.includes('spaced')) suggestions.push('Explain Spaced Repetition');
      
      const overdue = getOverdueAssignments(assignments);
      if (overdue.length > 0) {
        suggestions.push('Check my urgent deadlines');
      }
      suggestions.push('Suggest a study plan');
      suggestions.push('Show my stats overview');

      const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 3);

      const shivMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'shiv',
        text: replyText,
        timestamp: new Date(),
        suggestions: uniqueSuggestions,
      };

      setMessages((prev) => [...prev, shivMessage]);
    } catch (error) {
      console.warn('AI API call failed or timed out, falling back to local brain:', error);
      
      // Fallback local response
      const fallback = generateResponse(textToSend);
      const shivMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'shiv',
        text: fallback.text,
        timestamp: new Date(),
        suggestions: fallback.suggestions,
      };

      setMessages((prev) => [...prev, shivMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Safe markdown formatting renderer
  function renderMessageText(text: string) {
    const parts: React.ReactNode[] = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    let lastIndex = 0;
    let index = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      const lang = match[1];
      const code = match[2];

      if (textBefore) {
        parts.push(renderInlineMarkdown(textBefore, `text-${index}`));
        index++;
      }

      parts.push(
        <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden border border-[var(--glass-border)] bg-slate-900 shadow-md">
          {lang && (
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800/80 text-[10px] font-mono text-slate-400 border-b border-slate-700/50">
              <span>{lang.toUpperCase()}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition-colors text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 hover:bg-slate-700 font-semibold"
              >
                Copy
              </button>
            </div>
          )}
          <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      );
      index++;
      lastIndex = codeBlockRegex.lastIndex;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter) {
      parts.push(renderInlineMarkdown(textAfter, `text-${index}`));
    }

    return <div className="space-y-2">{parts}</div>;
  }

  function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode {
    const lines = text.split('\n');
    return (
      <div key={keyPrefix} className="space-y-1.5">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={`${keyPrefix}-${lineIdx}`} className="text-sm font-bold text-indigo-400 pt-2 pb-0.5">
                {parseLineFormatting(trimmed.substring(4))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={`${keyPrefix}-${lineIdx}`} className="text-base font-extrabold text-indigo-400 pt-3 pb-1">
                {parseLineFormatting(trimmed.substring(3))}
              </h3>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={`${keyPrefix}-${lineIdx}`} className="text-lg font-black text-indigo-400 pt-4 pb-1">
                {parseLineFormatting(trimmed.substring(2))}
              </h2>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={`${keyPrefix}-${lineIdx}`} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 mt-1.5 text-[8px]">•</span>
                <span className="flex-1 text-sm">{parseLineFormatting(trimmed.substring(2))}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
          if (numMatch) {
            return (
              <div key={`${keyPrefix}-${lineIdx}`} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 font-mono text-xs mt-0.5">{numMatch[1]}.</span>
                <span className="flex-1 text-sm">{parseLineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={`${keyPrefix}-${lineIdx}`} className="text-sm leading-relaxed min-h-[1rem]">
              {parseLineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  }

  function parseLineFormatting(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const boldCodeRegex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
    let match;
    let lastIndex = 0;
    let idx = 0;

    while ((match = boldCodeRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(textBefore);
      }

      if (match[0].startsWith('**')) {
        parts.push(<strong key={`bold-${idx}`} className="font-semibold text-indigo-200">{match[2]}</strong>);
      } else {
        parts.push(<code key={`code-${idx}`} className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-indigo-300 border border-slate-700/60">{match[3]}</code>);
      }
      idx++;
      lastIndex = boldCodeRegex.lastIndex;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter) {
      parts.push(textAfter);
    }

    return parts;
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-100px)]">
      <Header title="AI Study Assistant" subtitle="Clarify doubts, explain concepts, and analyze planning tips with Shiv" />

      {/* Main chat layout */}
      <div className="flex-1 glass-card overflow-hidden flex flex-col z-10 relative">
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.02] to-transparent pointer-events-none" />

        {/* Chat Toolbar */}
        <div className="px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--glass-bg-light)] flex flex-wrap items-center justify-between gap-3 z-20 relative">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Focus Subject:</span>
            <select
              value={focusSubjectId}
              onChange={(e) => setFocusSubjectId(e.target.value)}
              className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-xs px-3 py-1.5 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">🌐 All Subjects (Dashboard Context)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
            {focusSubjectId !== 'all' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 animate-pulse">
                Subject Context Loaded
              </span>
            )}
          </div>

          <div>
            <button
              onClick={() => {
                if (window.confirm('Clear conversation history?')) {
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'shiv',
                      text: `Hello, ${studentName}! I'm Shiv, your personal AI Study Assistant. I can clarify any academic doubts, solve equations, suggest study schedules, explain scientific learning strategies, and analyze your dashboard performance. What would you like to focus on today?`,
                      timestamp: new Date(),
                      suggestions: [
                        'Suggest a study plan',
                        'Check my urgent deadlines',
                        'How can I study better?',
                        'Show my stats overview',
                      ],
                    },
                  ]);
                }
              }}
              className="text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/5 font-medium"
            >
              Clear Chat
            </button>
          </div>
        </div>

        {/* Quick Study Actions Bar */}
        <div className="flex flex-wrap gap-2 px-4 py-2.5 border-b border-[var(--glass-border)] bg-[var(--glass-bg-light)]/40 z-10">
          <button
            onClick={() => handleSend("Give me a quick 3-question quiz based on my study notes or syllabus!")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-500/10 hover:bg-violet-500/15 text-violet-400 border border-violet-500/20 transition-all active:scale-95 animate-fade-in"
          >
            ✏️ Quiz Me
          </button>
          <button
            onClick={() => handleSend("Can you plan my study sessions for today based on my upcoming deadlines?")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 transition-all active:scale-95 animate-fade-in"
          >
            📅 Plan My Day
          </button>
          <button
            onClick={() => handleSend("Explain a difficult concept from my syllabus using the Feynman Technique.")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 transition-all active:scale-95 animate-fade-in"
          >
            💡 Explain Concept
          </button>
        </div>

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
                <div className="space-y-2 max-w-full overflow-hidden">
                  <div
                    className={`p-3.5 rounded-2xl border break-words ${
                      isShiv
                        ? 'bg-[var(--glass-bg-light)] text-[var(--color-text-primary)] border-[var(--glass-border)] rounded-tl-sm'
                        : 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm shadow-md shadow-indigo-600/10'
                    }`}
                  >
                    {isShiv ? renderMessageText(msg.text) : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                  </div>

                  {/* Suggestions */}
                  {isShiv && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all text-left animate-fade-in"
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
            placeholder="Ask Shiv to clarify doubts, quiz you, or solve problems..."
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
