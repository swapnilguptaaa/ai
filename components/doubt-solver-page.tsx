
"use client";

import { useState, useRef, useEffect } from 'react';
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    submitDoubtAction,
    generateFollowUpQuestionsAction,
} from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ClipboardCopy,
    ClipboardCheck,
    Download,
    Printer,
    Lightbulb,
    AlertCircle,
    Pencil,
    History,
    ArrowLeft,
    ExternalLink,
    Trash2,
    Settings,
    Sun,
    Moon,
    Monitor,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';


const CUSTOM_QUESTION_TEXT = "Add any particular detail that isn't asked above and you think is important.";

const examplePrompts = [
    "Explain quantum computing.",
    "What are the main causes of World War I?",
    "Describe the process of photosynthesis.",
    "Who was Leonardo da Vinci?",
    "What is blockchain technology?",
    "Summarize the key ideas of existentialism.",
    "How does a black hole form?",
    "What is the difference between DNA and RNA?",
    "Explain the basics of supply and demand.",
    "What are the primary functions of the United Nations?",
    "Describe the water cycle.",
    "Who wrote '1984' and what is it about?",
    "What is artificial intelligence?",
    "Explain the concept of natural selection.",
    "What was the Renaissance?",
    "How does the stock market work?",
    "What is the Pythagorean theorem?",
    "Describe the structure of an atom.",
    "What are the symptoms of climate change?",
    "Who was Martin Luther King Jr.?",
    "Explain the theory of plate tectonics.",
    "What is the role of mitochondria in a cell?",
    "Summarize the French Revolution.",
    "What is GDP and how is it calculated?",
    "How do vaccines work?",
    "Who was Marie Curie and what did she discover?",
    "What is the scientific method?",
    "Explain the concept of entropy.",
    "What was the Cold War?",
    "How does GPS technology function?",
    "Describe the major themes in Shakespeare's 'Hamlet'.",
    "What is dark matter?",
    "Explain the human digestive system.",
    "What were the key events of the Civil Rights Movement?",
    "What is the difference between a virus and a bacterium?",
    "How do electric cars work?",
    "Who was Albert Einstein?",
    "What is the significance of the periodic table?",
    "Explain the concept of feudalism.",
    "What are the different types of renewable energy?",
    "Describe the plot of 'The Great Gatsby'.",
    "What is CRISPR gene editing?",
    "Explain the structure and function of the human brain.",
    "What was the Industrial Revolution?",
    "How does the internet work?",
    "What are the basic principles of democracy?",
    "Who was Isaac Newton?",
    "Explain the concept of chemical bonds.",
    "What is the greenhouse effect?",
    "What are the stages of sleep?"
];

interface DoubtHistoryItem {
    id: string;
    doubt: string;
    answer: string;
    coreTopic: string;
    briefSummary: string;
}

export function DoubtSolverPage() {
    const [doubt, setDoubt] = useState('');
    const [originalDoubt, setOriginalDoubt] = useState('');
    const [wordLimit, setWordLimit] = useState<number | undefined>();
    const [isDefinition, setIsDefinition] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isPromptFocused, setIsPromptFocused] = useState(false);
    const [answer, setAnswer] = useState('');
    const [coreTopic, setCoreTopic] = useState('');
    const [briefSummary, setBriefSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionActionLoading, setIsSuggestionActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();
    const { setTheme, theme } = useTheme();

    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

    const [suggestionQuestions, setSuggestionQuestions] = useState<string[]>([]);
    const [suggestionAnswers, setSuggestionAnswers] = useState<Record<number, string>>({});
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
    
    const [userName, setUserName] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
    
    const [history, setHistory] = useState<DoubtHistoryItem[]>([]);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<DoubtHistoryItem | null>(null);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    const [isStudentMode, setIsStudentMode] = useState(true);

    const [isStarted, setIsStarted] = useState(false);
    const [isExitingWelcome, setIsExitingWelcome] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

    useEffect(() => {
        const storedName = localStorage.getItem('doubtSolverUserName');
        if (storedName) {
            setUserName(storedName);
        } else {
            setIsNameDialogOpen(true);
        }

        const savedHistory = localStorage.getItem('doubtHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse doubt history", e);
                setHistory([]);
            }
        }
        
        const hasVisited = sessionStorage.getItem('hasVisitedDoubtSolver');
        if (hasVisited) {
            setIsStarted(true);
        }

    }, []);


    useEffect(() => {
        if (doubt) return;

        const promptInterval = setInterval(() => {
            setCurrentPromptIndex(prevIndex => (prevIndex + 1) % examplePrompts.length);
        }, 2500);

        return () => clearInterval(promptInterval);
    }, [doubt]);

    const animatedPlaceholder = examplePrompts[currentPromptIndex];

    const submitDoubt = async (doubtToSubmit: string, wordLimit?: number, isDefinition?: boolean, isStudent?: boolean) => {
        if (!doubtToSubmit) {
            setError('Please enter a question.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnswer('');
        setCoreTopic('');
        setBriefSummary('');
        setFollowUpQuestions([]);
        setIsSuggestionDialogOpen(false);
        setIsPromptFocused(false);

        const result = await submitDoubtAction(doubtToSubmit, wordLimit, isDefinition, isStudent);

        if (result.error) {
            setError(result.error);
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.data) {
            if (result.data.isClear) {
                setAnswer(result.data.answer || '');
                setCoreTopic(result.data.coreTopic || '');
                setBriefSummary(result.data.briefSummary || '');

                 if (result.data.answer) {
                    const newHistoryItem: DoubtHistoryItem = {
                        id: new Date().toISOString(),
                        doubt: originalDoubt || doubtToSubmit,
                        answer: result.data.answer,
                        coreTopic: result.data.coreTopic || '',
                        briefSummary: result.data.briefSummary || '',
                    };
                    setHistory(prevHistory => {
                        const updatedHistory = [...prevHistory, newHistoryItem];
                        localStorage.setItem('doubtHistory', JSON.stringify(updatedHistory));
                        return updatedHistory;
                    });
                }
            } else {
                setFollowUpQuestions(result.data.followUpQuestions || []);
            }
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOriginalDoubt(doubt);
        setIsEditing(false);
        await submitDoubt(doubt, wordLimit, isDefinition, isStudentMode);
    };
    
    const handleEditClick = () => {
        setIsEditing(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const handleFocus = () => {
        if (!originalDoubt) {
            setIsPromptFocused(true);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLButtonElement>) => {
        const currentTarget = e.currentTarget;
        const relatedTarget = e.relatedTarget as HTMLElement;

        if (relatedTarget?.closest('form') === formRef.current && relatedTarget?.type === 'submit') {
            return;
        }

        setTimeout(() => {
            if (!currentTarget.contains(document.activeElement)) {
                if (isEditing) {
                    setDoubt(originalDoubt);
                    setIsEditing(false);
                }
                setIsPromptFocused(false);
            }
        }, 0);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(answer);
        setIsCopied(true);
        toast({ title: 'Copied!', description: 'The answer has been copied to your clipboard.' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleDownload = (format: 'txt' | 'doc') => {
        let content = '';
        const mimeType = format === 'doc' ? 'application/msword' : 'text/plain';
        const answerParts = answer.split('\n---\n');
        const mainContent = answerParts[0] || '';
        const quote = answerParts.length > 1 ? answerParts[1] : '';


        if (format === 'doc') {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${coreTopic || 'DoubtSolver Answer'}</title>
                    <style>
                        body { font-family: sans-serif; }
                        h1 { font-size: 24pt; text-transform: capitalize; }
                        p.summary { font-size: 14pt; font-style: italic; color: #555; }
                        blockquote { border-left: 2px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; }
                    </style>
                </head>
                <body>
                    <h1>${coreTopic}</h1>
                    <p class="summary">${briefSummary}</p>
                    <hr />
                    ${mainContent.replace(/\n/g, '<br />')}
                    ${quote ? `<hr /><blockquote>${quote.replace(/\n/g, '<br />')}</blockquote>` : ''}
                </body>
                </html>
            `;
            content = htmlContent;
        } else {
            const plainTextContent = [
                coreTopic.toUpperCase(),
                `Summary: ${briefSummary}`,
                '---',
                mainContent,
                quote ? '---\n' + quote : '',
            ].filter(Boolean).join('\n\n');
            content = plainTextContent;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coreTopic || 'DoubtSolver_Answer'}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const printableArea = document.getElementById('printable-answer');
        if (printableArea) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${coreTopic || 'DoubtSolver Answer'}</title>`);
                printWindow.document.write(`
                    <style>
                        @page { margin: 0; }
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; }
                        h1 { font-size: 2.25rem; font-weight: bold; margin-bottom: 0.5rem; text-transform: capitalize; }
                        p.summary { font-size: 1.125rem; color: #666; margin-bottom: 2rem; }
                        hr { border: none; border-top: 1px solid #ddd; margin: 2rem 0; }
                        .prose { max-width: 100%; }
                        .prose h1, .prose h2, .prose h3, .prose h4 { margin-top: 1.2em; margin-bottom: 0.5em; }
                        .prose p { margin: 1em 0; }
                        .prose ul, .prose ol { padding-left: 20px; }
                        .prose code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                        .prose pre { background: #f4f4f4; padding: 10px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; }
                        .prose blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; margin-left: 0; }
                        .prose table { border-collapse: collapse; width: 100%; }
                        .prose th, .prose td { border: 1px solid #ddd; padding: 8px; }
                    </style>
                `);
                printWindow.document.write('</head><body>');
                printWindow.document.write(printableArea.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };
    
    const handleImproveAnswer = async () => {
        setIsSuggestionActionLoading(true);
        setIsSuggestionLoading(true);
        setIsSuggestionDialogOpen(true);
        const result = await generateFollowUpQuestionsAction(originalDoubt, answer);
        if (result.data) {
            setSuggestionQuestions([...result.data.questions, CUSTOM_QUESTION_TEXT]);
        }
        if (result.error) {
             toast({ variant: 'destructive', title: 'Error', description: result.error });
             setIsSuggestionDialogOpen(false);
        }
        setIsSuggestionLoading(false);
        setIsSuggestionActionLoading(false);
    };

    const handleSuggestionAnswerChange = (index: number, value: string) => {
        setSuggestionAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handleModifyAnswer = async () => {
        let newDoubt = originalDoubt;
        const additionalContext = suggestionQuestions
            .map((q, i) => {
                const userAnswer = suggestionAnswers[i]?.trim();
                if (userAnswer) {
                    if (q === CUSTOM_QUESTION_TEXT) {
                         return `- Additionally, the user provided this important detail: "${userAnswer}"`;
                    }
                    return `- For the question "${q}", the user provided this detail: "${userAnswer}"`;
                }
                return null;
            })
            .filter(Boolean)
            .join('\n');
    
        if (additionalContext) {
            newDoubt += `\n\nPlease provide a more specific answer considering the following details:\n${additionalContext}`;
        }
        
        setDoubt(newDoubt);
        await submitDoubt(newDoubt, wordLimit, isDefinition, isStudentMode);
    };

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const name = nameInput.trim();
        if (name) {
            setUserName(name);
            localStorage.setItem('doubtSolverUserName', name);
            setIsNameDialogOpen(false);
        }
    };

    const handleLoadFromHistory = (item: DoubtHistoryItem) => {
        setDoubt(item.doubt);
        setOriginalDoubt(item.doubt);
        setAnswer(item.answer);
        setCoreTopic(item.coreTopic);
        setBriefSummary(item.briefSummary);
        setFollowUpQuestions([]);
        setError('');
        setIsHistoryDialogOpen(false);
    };
    
    const handleDeleteHistoryItem = (id: string) => {
        const updatedHistory = history.filter((item) => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('doubtHistory', JSON.stringify(updatedHistory));
        setSelectedHistoryItem(null); // Go back to the list view
        toast({ title: 'Deleted!', description: 'The history item has been deleted.' });
    };

    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem('doubtHistory');
        toast({ title: 'History Cleared!', description: 'All your past questions have been deleted.' });
        setIsHistoryDialogOpen(false);
    };

    const handleClearAllData = () => {
        localStorage.removeItem('doubtHistory');
        localStorage.removeItem('doubtSolverUserName');
        sessionStorage.removeItem('hasVisitedDoubtSolver');
        toast({ title: 'All Data Cleared!', description: 'The application will now reload.' });
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    };

    const handleGetStarted = () => {
        setIsExitingWelcome(true);
        sessionStorage.setItem('hasVisitedDoubtSolver', 'true');
        setTimeout(() => {
            setIsStarted(true);
        }, 500); // Match animation duration
    };


    return (
        <TooltipProvider>
            <Dialog open={isNameDialogOpen}>
                <DialogContent 
                    className="sm:max-w-[425px]"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                    hideCloseButton={true}
                >
                    <DialogHeader>
                        <DialogTitle>Welcome!</DialogTitle>
                        <DialogDescription>
                            Let's get personal. What should I call you?
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleNameSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="col-span-3"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Continue</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="max-w-4xl mx-auto">
                {!isStarted ? (
                    <div className={cn(
                        "text-center py-16 animate-in fade-in",
                        isExitingWelcome && "animate-out fade-out"
                    )} style={{ animationDuration: '500ms' }}>
                        <Button onClick={handleGetStarted} size="lg" className="px-8 py-6 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
                            Get Started
                        </Button>
                        <p className="mt-6 text-muted-foreground italic max-w-md mx-auto">
                            {userName ? (
                                <span>
                                    "Hey,&nbsp;
                                    <span className="name-ai-animation font-bold not-italic">{userName}</span>
                                    , remember: the best tutors don't just give you the right answers; they help you ask the right questions and discover the 'why' behind the 'what'."
                                </span>
                            ) : (
                                `"The best tutors don't just give you the right answers; they help you ask the right questions and discover the 'why' behind the 'what'."`
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in" style={{ animationDuration: '500ms' }}>
                        <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                id="student-mode"
                                checked={isStudentMode}
                                onCheckedChange={setIsStudentMode}
                                />
                                <Label htmlFor="student-mode">{isStudentMode ? 'Student' : 'Researcher'}</Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Dialog open={isHistoryDialogOpen} onOpenChange={(open) => {
                                    setIsHistoryDialogOpen(open);
                                    if (!open) {
                                        setSelectedHistoryItem(null);
                                    }
                                }}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" disabled={history.length === 0}>
                                                    <History className="h-4 w-4" />
                                                    <span className="sr-only">View History</span>
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>View History</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <DialogContent className="sm:max-w-xl h-[80vh] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>{selectedHistoryItem ? "Details" : "History"}</DialogTitle>
                                            <DialogDescription>
                                                {selectedHistoryItem ? "Viewing a past entry." : "Here are your past questions."}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex-grow overflow-hidden">
                                            <ScrollArea className="h-full pr-4">
                                                {!selectedHistoryItem ? (
                                                    <div className="space-y-2">
                                                        {history.length > 0 ? [...history].reverse().map((item) => (
                                                            <Card key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedHistoryItem(item)}>
                                                                <CardContent className="p-4">
                                                                    <p className="truncate font-medium">{item.doubt}</p>
                                                                    <p className="text-xs text-muted-foreground">{item.briefSummary}</p>
                                                                </CardContent>
                                                            </Card>
                                                        )) : (
                                                            <p className="text-sm text-muted-foreground text-center py-10">No history available.</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <h3 className="font-headline">{selectedHistoryItem.doubt}</h3>
                                                        <Separator className="my-4" />
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedHistoryItem.answer}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                        {selectedHistoryItem && (
                                            <DialogFooter className="mt-4 pt-4 border-t flex-col sm:flex-row sm:justify-between">
                                                <div className="mb-2 sm:mb-0">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="destructive" size="icon" onClick={() => {
                                                                if (selectedHistoryItem) {
                                                                    handleDeleteHistoryItem(selectedHistoryItem.id)
                                                                }
                                                            }}>
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete Entry</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <div className="flex flex-col-reverse sm:flex-row sm:gap-2">
                                                    <Button variant="outline" onClick={() => setSelectedHistoryItem(null)}>
                                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                                    </Button>
                                                    <Button onClick={() => handleLoadFromHistory(selectedHistoryItem)}>
                                                        View in Fullscreen <ExternalLink className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </DialogFooter>
                                        )}
                                        {!selectedHistoryItem && history.length > 0 && (
                                            <DialogFooter className="mt-4 pt-4 border-t">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Clear All History
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete your entire question history.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DialogFooter>
                                        )}
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon">
                                                    <Settings className="h-4 w-4" />
                                                    <span className="sr-only">Open Settings</span>
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Settings</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Settings</DialogTitle>
                                            <DialogDescription>
                                                Manage application settings here.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-6">
                                            
                                            <div className="space-y-3">
                                                <Label>Theme</Label>
                                                <RadioGroup
                                                    value={theme}
                                                    onValueChange={setTheme}
                                                    className="grid grid-cols-3 gap-2"
                                                >
                                                    <Label
                                                        htmlFor="light"
                                                        className={cn(
                                                            "flex flex-col items-center justify-center rounded-md border-2 p-3 font-normal",
                                                            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                                            theme === 'light' ? "border-primary bg-accent" : "border-muted"
                                                        )}
                                                    >
                                                        <RadioGroupItem value="light" id="light" className="sr-only" />
                                                        <Sun className="h-6 w-6 mb-2" />
                                                        Light
                                                    </Label>
                                                    <Label
                                                        htmlFor="dark"
                                                        className={cn(
                                                            "flex flex-col items-center justify-center rounded-md border-2 p-3 font-normal",
                                                            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                                            theme === 'dark' ? "border-primary bg-accent" : "border-muted"
                                                        )}
                                                    >
                                                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                                        <Moon className="h-6 w-6 mb-2" />
                                                        Dark
                                                    </Label>
                                                    <Label
                                                        htmlFor="system"
                                                        className={cn(
                                                            "flex flex-col items-center justify-center rounded-md border-2 p-3 font-normal",
                                                            "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                                                            theme === 'system' ? "border-primary bg-accent" : "border-muted"
                                                        )}
                                                    >
                                                        <RadioGroupItem value="system" id="system" className="sr-only" />
                                                        <Monitor className="h-6 w-6 mb-2" />
                                                        System
                                                    </Label>
                                                </RadioGroup>
                                            </div>

                                            <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive p-4">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                                    <h3 className="font-semibold text-destructive">Danger Zone</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Clearing all site data will permanently remove your name, history, and settings from this browser. This action cannot be undone.
                                                </p>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" className="w-full">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Clear All Site Data
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete all application data from your browser, including your name and question history. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={handleClearAllData}>
                                                                Yes, delete everything
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <Card className="shadow-lg">
                            <CardHeader>
                                 <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="font-headline text-xl sm:text-2xl">
                                            {userName ? <>Hi <span className="name-ai-animation font-bold">{userName}</span>, ask your doubt</> : 'Ask Your Doubt'}
                                        </CardTitle>
                                        <CardDescription>Enter your question below and let our AI provide a detailed answer.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                                     <div className="flex items-start gap-2">
                                        <div className={cn("relative w-full", { "editing-active": isEditing || isPromptFocused })}>
                                            <Textarea
                                                ref={textareaRef}
                                                placeholder={animatedPlaceholder}
                                                value={doubt}
                                                onChange={(e) => setDoubt(e.target.value)}
                                                onFocus={handleFocus}
                                                onBlur={handleBlur}
                                                className={cn(
                                                    "min-h-[100px] text-base transition-all",
                                                    { "focus:!ring-0 focus:!ring-offset-0 focus-visible:!ring-0 focus-visible:!ring-offset-0": isEditing || isPromptFocused },
                                                    { "placeholder-animated": !doubt }
                                                )}
                                                readOnly={!!originalDoubt && !isEditing}
                                                disabled={isLoading}
                                            />
                                        </div>
                                         {originalDoubt && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={handleEditClick}
                                                        className="btn-pencil-glow disabled:opacity-100"
                                                        type="button"
                                                        disabled={isEditing || isLoading}
                                                        onBlur={handleBlur}
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                        <span className="sr-only">Edit question</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <div className="answer-options">
                                        <button
                                            type="button"
                                            className={cn('option-btn', { selected: isDefinition })}
                                            onClick={() => {
                                                setIsDefinition(true);
                                                setWordLimit(undefined);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Definition
                                        </button>
                                        <button
                                            type="button"
                                            className={cn('option-btn', { selected: wordLimit === 100 })}
                                            onClick={() => {
                                                setWordLimit(100);
                                                setIsDefinition(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Short (100 words)
                                        </button>
                                        <button
                                            type="button"
                                            className={cn('option-btn', { selected: wordLimit === 300 })}
                                            onClick={() => {
                                                setWordLimit(300);
                                                setIsDefinition(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Medium (300 words)
                                        </button>
                                        <button
                                            type="button"
                                            className={cn('option-btn', { selected: wordLimit === 500 })}
                                            onClick={() => {
                                                setWordLimit(500);
                                                setIsDefinition(false);
                                            }}
                                            disabled={isLoading}
                                        >
                                            Large (500 words)
                                        </button>
                                    </div>
                                     {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading} onBlur={handleBlur}>
                                        {isLoading ? 'Searching...' : 'Search'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {isLoading && !answer && (
                            <Card className="mt-8 shadow-lg">
                                <CardHeader>
                                    <Skeleton className="h-8 w-3/4" />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </CardContent>
                            </Card>
                        )}

                        {answer && (
                            <Card className="mt-8 shadow-lg animate-in fade-in duration-500">
                                <CardHeader className="flex flex-row flex-wrap justify-between items-start gap-y-2">
                                    <div>
                                        <CardTitle className="font-headline text-xl sm:text-2xl">Answer</CardTitle>
                                        <CardDescription>Here is the AI-generated response to your question.</CardDescription>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                        <Dialog open={isSuggestionDialogOpen} onOpenChange={(open) => {
                                            setIsSuggestionDialogOpen(open);
                                            if (!open) {
                                                setSuggestionQuestions([]);
                                                setSuggestionAnswers({});
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button
                                                  onClick={handleImproveAnswer}
                                                  disabled={isSuggestionActionLoading || isLoading}
                                                  className="btn-improve-answer"
                                                >
                                                    {isSuggestionActionLoading ? <Lightbulb className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                                                    Improve your answer
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[625px]">
                                                <DialogHeader>
                                                    <DialogTitle>Provide More Details</DialogTitle>
                                                    <DialogDescription>
                                                        Answer the questions below to get a more specific answer.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                {isSuggestionLoading && <Skeleton className="h-40 w-full" />}
                                                {!isSuggestionLoading && suggestionQuestions.length > 0 && (
                                                    <div className="space-y-4 py-4">
                                                        {suggestionQuestions.map((q, i) => (
                                                            <div key={i} className="space-y-2">
                                                                <Label htmlFor={`suggestion-${i}`}>{q}</Label>
                                                                <Input
                                                                    id={`suggestion-${i}`}
                                                                    value={suggestionAnswers[i] || ''}
                                                                    onChange={(e) => handleSuggestionAnswerChange(i, e.target.value)}
                                                                    placeholder={q === CUSTOM_QUESTION_TEXT ? "Your details here..." : "Your one or two word answer..."}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {!isSuggestionLoading && suggestionQuestions.length === 0 && (
                                                    <p className="py-4 text-sm text-muted-foreground">Could not generate suggestions for this topic.</p>
                                                )}
                                                <DialogFooter>
                                                    <Button variant="secondary" onClick={handleModifyAnswer} disabled={isLoading || isSuggestionLoading || suggestionQuestions.length === 0}>
                                                        {isLoading ? 'Modifying...' : 'Modify Answer'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                         <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={handleCopy} className="btn-pencil-glow">
                                                    {isCopied ? <ClipboardCheck className="h-5 w-5 text-orange-500" /> : <ClipboardCopy className="h-5 w-5" />}
                                                    <span className="sr-only">Copy</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Copy answer</p>
                                            </TooltipContent>
                                        </Tooltip>
                                         <DropdownMenu>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="btn-pencil-glow">
                                                            <Download className="h-5 w-5" />
                                                            <span className="sr-only">Download</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Download answer</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleDownload('txt')}>As Text (.txt)</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDownload('doc')}>As Word (.doc)</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <Button variant="ghost" size="icon" onClick={handlePrint} className="btn-pencil-glow">
                                                    <Printer className="h-5 w-5" />
                                                    <span className="sr-only">Print</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Print answer</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div id="printable-answer">
                                        <div className="mb-6">
                                            <h1 className="text-4xl font-bold text-foreground mb-2 capitalize">{coreTopic}</h1>
                                            <p className="summary text-lg text-muted-foreground">{briefSummary}</p>
                                        </div>
                                        <div className="prose dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {followUpQuestions.length > 0 && !isLoading && (
                            <Card className="mt-8 shadow-lg animate-in fade-in duration-500">
                                <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2 text-xl sm:text-2xl">
                                        <Lightbulb className="h-6 w-6 text-accent" />
                                        <span>Need More Clarity?</span>
                                    </CardTitle>
                                    <CardDescription>Your question seems a bit broad. Try one of these more specific questions or rephrase your original one.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-5 space-y-2 text-foreground">
                                        {followUpQuestions.map((q, i) => (
                                            <li key={i}>
                                                {q}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
