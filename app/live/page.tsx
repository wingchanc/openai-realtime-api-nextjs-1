"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { Welcome } from "@/components/welcome"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { TokenUsageDisplay } from "@/components/token-usage"
import { MessageControls } from "@/components/message-controls"
import { ToolsEducation } from "@/components/tools-education"
import { TextInput } from "@/components/text-input"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

interface Topic {
  id: string;
  Name?: string;
  name?: string;
  Description?: string;
  Emoji?: string;
}

// Function to map English level names to Chinese
const getLevelInChinese = (level: string): string => {
  const levelMap: Record<string, string> = {
    'beginner': '初級',
    'intermediate': '中級',
    'advanced': '高級'
  };
  return levelMap[level.toLowerCase()] || level;
};

const LiveAppContent: React.FC = () => {
  const router = useRouter()
  
  // Get selected avatar and determine voice
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [voice, setVoice] = useState("alloy") // default fallback
  
  // Get URL search parameters
  const searchParams = useSearchParams()
  const topicId = searchParams.get('topicId')
  const level = searchParams.get('level')
  const conversationTopic = searchParams.get('conversationTopic')
  const conversationParty = searchParams.get('conversationParty')
  const subtopicId = searchParams.get('subtopicId')
  const subtopicName = searchParams.get('subtopicName')
  const subtopicDescription = searchParams.get('subtopicDescription')
  
  // State for topic data
  const [topic, setTopic] = useState<Topic | null>(null)
  const [isLoadingTopic, setIsLoadingTopic] = useState(false)

  // Get avatar from localStorage and set voice
  useEffect(() => {
    const avatar = localStorage.getItem('selectedAvatar')
    setSelectedAvatar(avatar)
    
    // Map avatar to voice
    if (avatar === "jin") {
      setVoice("coral")
    } else if (avatar === "zhan") {
      setVoice("ash")
    }
  }, [])

  // Fetch topic data
  useEffect(() => {
    if (topicId) {
      setIsLoadingTopic(true)
      fetch('/api/options')
        .then(response => response.json())
        .then(data => {
          if (topicId) {
            const foundTopic = data.topics?.find((t: Topic) => t.id === topicId)
            if (foundTopic) {
              setTopic(foundTopic)
            }
          }
        })
        .catch(error => {
          console.error('Error fetching options:', error)
        })
        .finally(() => {
          setIsLoadingTopic(false)
        })
    }
  }, [topicId])

  // Get topic name for display and instruction generation
  const topicName = topic?.Name || topic?.name || null

  // WebRTC Audio Session Hook with dynamic parameters
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
    countdownSeconds,
    isTTSLoading
  } = useWebRTCAudioSession({
    voice,
    tools,
    level: level || undefined,
    topicName: topicName || undefined,
    conversationTopics: conversationTopic ? [conversationTopic] : [],
    conversationParties: conversationParty ? [conversationParty] : [],
    subtopic: subtopicName ? { id: subtopicId || undefined, name: subtopicName || undefined, description: subtopicDescription || undefined } : undefined
  })

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        // timeFunction: 'getCurrentTime',
        // backgroundFunction: 'changeBackgroundColor',
        // partyFunction: 'partyMode',
        // launchWebsite: 'launchWebsite', 
        // copyToClipboard: 'copyToClipboard',
        // scrapeWebsite: 'scrapeWebsite',
        hintsFunction: 'showHints'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions])

  // Render topic/subtopic heading
  const renderHeading = () => {
    if (subtopicName) {
      return (
        <>
          <div className="text-muted-foreground text-center text-sm mb-2">
            {topic?.Emoji && <span className="text-xl mr-2 align-middle">{topic.Emoji}</span>}
            {topicName}
          </div>
          <h1 className="text-3xl font-bold mb-4 text-center">
            {subtopicName}
          </h1>
          {subtopicDescription && (
            <div className="text-muted-foreground mb-3 text-center whitespace-pre-line">
              {subtopicDescription}
            </div>
          )}
        </>
      );
    } else {
      return (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            {topic?.Emoji && <span className="text-2xl">{topic.Emoji}</span>}
            <h1 className="text-2xl font-bold">{topicName}</h1>
          </div>
          {topic?.Description && (
            <div className="text-sm text-muted-foreground mb-3">{topic.Description}</div>
          )}
        </>
      );
    }
  };

  return (
    <main className="h-full">
      <motion.div 
        className="flex flex-col items-center justify-center w-[95vw] sm:w-[90vw] mx-auto my-10 sm:my-20 p-4 sm:p-8 lg:p-12 border rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <div className="self-start mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回上一頁
          </button>
        </div>
        
        {/* <Welcome /> */}
        
        {/* Display topic and level info if available */}
        {(topic || level || conversationTopic || conversationParty) && (
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {renderHeading()}
            {/* Display selected conversation topic */}
            {conversationTopic && !subtopicName && (
              <div className="mb-3">
                <div className="text-sm font-medium text-muted-foreground mb-1">對話主題:</div>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="text-xs">
                    {conversationTopic}
                  </Badge>
                </div>
              </div>
            )}
            {/* Display selected conversation party */}
            {conversationParty && (
              <div className="mb-3">
                <div className="text-sm font-medium text-muted-foreground mb-1">對話角色:</div>
                <div className="flex justify-center">
                  <Badge variant="outline" className="text-xs">
                    {conversationParty}
                  </Badge>
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        <motion.div 
          className="w-full bg-card text-card-foreground rounded-xl border shadow-sm p-4 sm:p-6 space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {/* Display selected avatar and voice */}
          {selectedAvatar && (
            <div className="text-center mb-4">
              <div className="text-sm text-muted-foreground mb-1">選擇的老師:</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-medium">
                  {selectedAvatar === "jin" ? "金莉莉" : "金戰"}
                </span>
                {/* <span className="text-xs text-muted-foreground">
                  ({voice} voice)
                </span> */}
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center gap-4">
            <BroadcastButton 
              isSessionActive={isSessionActive} 
              onClick={handleStartStopClick}
            />
          </div>
          {/* {msgs.length > 4 && <TokenUsageDisplay messages={msgs} />} */}
          {status && (
            <motion.div 
              className="w-full flex flex-col gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <StatusDisplay status={status} />
            </motion.div>
          )}
          
          <MessageControls 
            conversation={conversation}
            msgs={msgs}
            countdownSeconds={countdownSeconds}
          />
          
          {/* <ToolsEducation /> */}
          
          <TextInput 
            onSubmit={sendTextMessage}
            disabled={!isSessionActive}
            isTTSLoading={isTTSLoading}
            showMicrophone={false}
          />
        </motion.div>
        
        {/* {conversation.length > 0 && (
          <motion.div 
            className="w-full max-w-2xl mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Conversation History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm font-medium mb-1">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                      <div className="text-sm">{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )} */}
      </motion.div>
    </main>
  );
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveAppContent />
    </Suspense>
  );
};

export default App; 