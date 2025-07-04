"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import ThreeDotsWave from "@/components/ui/three-dots-wave";

const LEVELS = [
  {
    key: "beginner",
    title: "初級",
    desc: "基礎對話，簡單句型，充分引導",
  },
  {
    key: "intermediate",
    title: "中級",
    desc: "日常對話，自然表達，適度挑戰",
  },
  {
    key: "advanced",
    title: "高級",
    desc: "複雜情境，專業詞彙，深度討論",
  },
];

interface Topic {
  id: string;
  Name?: string;
  name?: string;
  Description?: string;
  Emoji?: string;
}

interface ClientLevelSelectorProps {
  topic: Topic;
}

export function ClientLevelSelector({ topic }: ClientLevelSelectorProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedConversationTopic, setSelectedConversationTopic] = useState<string>("");
  const [selectedConversationParty, setSelectedConversationParty] = useState<string>("");
  const [conversationTopics, setConversationTopics] = useState<string[]>([]);
  const [conversationParties, setConversationParties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubtopicOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/options');
        console.log("Fetched /api/options response:", response);
        const data = await response.json();
        console.log("Parsed data from /api/options:", data);
        // Find the subtopic for this topic
        const subtopic = (data.subtopics || []).find((st: any) => {
          const match = st.Topic === topic.id || st.TopicId === topic.id || (Array.isArray(st.Topic) && st.Topic.includes(topic.id));
          if (match) {
            console.log("Matched subtopic:", st, "for topic.id:", topic.id);
          }
          return match;
        });
        if (!subtopic) {
          console.warn("No subtopic found for topic.id:", topic.id, "in data.subtopics:", data.subtopics);
          setConversationTopics([]);
          setConversationParties([]);
          setError("找不到相關子主題，請聯絡管理員。");
          return;
        }
        // Extract and split Conversation Topics and Conversation Parties fields
        const topicsRawObj = subtopic["Conversation Topics"] || "";
        const partiesRawObj = subtopic["Conversation Parties"] || "";
        const topicsRaw = typeof topicsRawObj === "string" ? topicsRawObj : topicsRawObj?.value || "";
        const partiesRaw = typeof partiesRawObj === "string" ? partiesRawObj : partiesRawObj?.value || "";
        console.log("topicsRaw:", topicsRaw, "partiesRaw:", partiesRaw);
        const topicsArr = topicsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
        const partiesArr = partiesRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
        setConversationTopics(topicsArr);
        setConversationParties(partiesArr);
      } catch (err) {
        console.error("Error fetching or processing /api/options:", err);
        setError("載入選項時發生錯誤");
        setConversationTopics([]);
        setConversationParties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubtopicOptions();
  }, [topic.id]);

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setStep(2);
  };

  const handleConversationTopicSelect = (topic: string) => {
    setSelectedConversationTopic(topic);
  };

  const handleConversationPartySelect = (party: string) => {
    setSelectedConversationParty(party);
  };

  const handleProceed = () => {
    if (step === 2 && selectedConversationTopic) {
      setStep(3);
    } else if (step === 3 && selectedConversationParty) {
      // Navigate to live page with all parameters
      const params = new URLSearchParams({
        topicId: topic.id,
        level: selectedLevel,
        conversationTopic: selectedConversationTopic,
        conversationParty: selectedConversationParty
      });
      router.push(`/live?${params.toString()}`);
    }
  };

  const canProceed = () => {
    if (step === 2) return selectedConversationTopic !== "";
    if (step === 3) return selectedConversationParty !== "";
    return false;
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-4">
        <div className="flex items-center justify-center">
          <ThreeDotsWave />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center text-red-500">{error}</div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      {/* Topic Header */}
      <div className="mb-10 text-center">
        {topic.Emoji && <span className="text-4xl mr-2 align-middle">{topic.Emoji}</span>}
        <span className="text-3xl font-bold align-middle">{topic.Name || topic.name}</span>
        {topic.Description && <div className="text-muted-foreground mt-2 text-lg">{topic.Description}</div>}
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{selectedLevel ? <Check className="w-4 h-4" /> : '1'}</div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{selectedConversationTopic ? <Check className="w-4 h-4" /> : '2'}</div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{selectedConversationParty ? <Check className="w-4 h-4" /> : '3'}</div>
        </div>
      </div>

      {/* Step 1: Level Selection */}
      {step === 1 && (
        <div>
          <h1 className="text-3xl font-bold mb-12 text-center">選擇練習難度</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {LEVELS.map((level) => (
              <button
                key={level.key}
                className="rounded-2xl border-2 border-transparent p-10 shadow-lg bg-background hover:shadow-2xl hover:border-primary focus:border-primary transition cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-primary min-h-[220px] flex flex-col items-center justify-center"
                onClick={() => handleLevelSelect(level.key)}
                type="button"
              >
                <div className="text-3xl font-extrabold mb-4">{level.title}</div>
                <div className="text-lg text-muted-foreground font-medium">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Conversation Topic Selection */}
      {step === 2 && (
        <div>
          <h1 className="text-3xl font-bold mb-12 text-center">選擇對話主題</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversationTopics.map((conversationTopic) => (
              <Card 
                key={conversationTopic}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedConversationTopic === conversationTopic
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => handleConversationTopicSelect(conversationTopic)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {conversationTopic}
                    {selectedConversationTopic === conversationTopic && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between mt-12">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center gap-4">
              {selectedConversationTopic && (
                <Badge variant="secondary">
                  {selectedConversationTopic}
                </Badge>
              )}
              <Button 
                onClick={handleProceed} 
                disabled={!canProceed()}
              >
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Conversation Party Selection */}
      {step === 3 && (
        <div>
          <h1 className="text-3xl font-bold mb-12 text-center">選擇對話角色</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversationParties.map((party) => (
              <Card 
                key={party}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedConversationParty === party
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : ''
                }`}
                onClick={() => handleConversationPartySelect(party)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {party}
                    {selectedConversationParty === party && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-between mt-12">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div className="flex items-center gap-4">
              {selectedConversationParty && (
                <Badge variant="secondary">
                  {selectedConversationParty}
                </Badge>
              )}
              <Button 
                onClick={handleProceed} 
                disabled={!canProceed()}
                className="bg-green-600 hover:bg-green-700"
              >
                開始對話
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 