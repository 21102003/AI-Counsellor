/**
 * useChat Hook - AI Counsellor Chat Integration
 * 
 * Features:
 * - Optimistic UI updates
 * - Message history management
 * - [RENDER_CARD] tag parsing for university cards
 * - Loading states for AI "thinking" animation
 * - Error handling with graceful degradation
 */

import { useState, useCallback, useRef } from 'react';
import { API, ChatMessage, ChatResponse, getErrorMessage, isNetworkError } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface UniversityArtifact {
  name: string;
  country: string;
  flag: string;
  type: 'Target' | 'Reach' | 'Safe';
  cost: string;
  acceptance: string;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  reasoning?: string;
  artifact?: UniversityArtifact;
  timestamp: Date;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════
// UNIVERSITY DATA (for [RENDER_CARD] parsing)
// ═══════════════════════════════════════════════════════════════

const UNIVERSITY_DATA: Record<string, Partial<UniversityArtifact>> = {
  'Stanford University': { country: 'United States', flag: '🇺🇸', cost: '$56,169', acceptance: '4%' },
  'MIT': { country: 'United States', flag: '🇺🇸', cost: '$55,878', acceptance: '4%' },
  'Harvard University': { country: 'United States', flag: '🇺🇸', cost: '$54,269', acceptance: '4%' },
  'New York University': { country: 'United States', flag: '🇺🇸', cost: '$58,000', acceptance: '12%' },
  'UC Berkeley': { country: 'United States', flag: '🇺🇸', cost: '$44,007', acceptance: '11%' },
  'UCLA': { country: 'United States', flag: '🇺🇸', cost: '$43,473', acceptance: '9%' },
  'Columbia University': { country: 'United States', flag: '🇺🇸', cost: '$63,530', acceptance: '4%' },
  'University of Oxford': { country: 'United Kingdom', flag: '🇬🇧', cost: '£30,540', acceptance: '15%' },
  'University of Cambridge': { country: 'United Kingdom', flag: '🇬🇧', cost: '£28,560', acceptance: '18%' },
  'Imperial College London': { country: 'United Kingdom', flag: '🇬🇧', cost: '£35,100', acceptance: '14%' },
  'UCL': { country: 'United Kingdom', flag: '🇬🇧', cost: '£26,000', acceptance: '18%' },
  'University of Toronto': { country: 'Canada', flag: '🇨🇦', cost: 'CA$58,160', acceptance: '43%' },
  'McGill University': { country: 'Canada', flag: '🇨🇦', cost: 'CA$24,000', acceptance: '46%' },
  'TU Munich': { country: 'Germany', flag: '🇩🇪', cost: '€300', acceptance: '20%' },
  'ETH Zurich': { country: 'Switzerland', flag: '🇨🇭', cost: 'CHF 1,460', acceptance: '27%' },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Generate unique message ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse [RENDER_CARD: UniName] tags from AI response
 */
function parseRenderCard(content: string): { cleanContent: string; artifact?: UniversityArtifact } {
  const renderCardRegex = /\[RENDER_CARD:\s*([^\]]+)\]/gi;
  const match = renderCardRegex.exec(content);
  
  if (match) {
    const uniName = match[1].trim();
    const uniData = UNIVERSITY_DATA[uniName];
    
    if (uniData) {
      const artifact: UniversityArtifact = {
        name: uniName,
        country: uniData.country || 'Unknown',
        flag: uniData.flag || '🌍',
        type: 'Target', // Default, could be calculated based on acceptance rate
        cost: uniData.cost || 'N/A',
        acceptance: uniData.acceptance || 'N/A',
      };
      
      // Clean the content by removing the tag
      const cleanContent = content.replace(renderCardRegex, '').trim();
      
      return { cleanContent, artifact };
    }
  }
  
  return { cleanContent: content };
}

/**
 * Generate synthetic reasoning trace for AI responses
 */
function generateReasoning(userMessage: string): string {
  const steps = [
    `Processing query: "${userMessage.substring(0, 50)}..."`,
    '> Analyzing user profile parameters...',
    '> Cross-referencing admission database...',
    '> Calculating probability matrices...',
    '> Generating strategic recommendations...',
  ];
  return steps.join('\n');
}

/**
 * Convert internal messages to API format
 */
function toApiHistory(messages: Message[]): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.content,
  }));
}

// ═══════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

export function useChat(initialMessages: Message[] = []): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  /**
   * Send a message to the AI counsellor
   */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    
    // OPTIMISTIC UPDATE: Add user message immediately
    const userMessage: Message = {
      id: generateId(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get message history for context (exclude the message we just added)
      const history = toApiHistory(messages);
      
      // Call API
      const response: ChatResponse = await API.chat.sendMessage(text.trim(), history);
      
      if (!isMounted.current) return;
      
      // Parse response for [RENDER_CARD] tags
      const { cleanContent, artifact } = parseRenderCard(response.response);
      
      // Create AI response message
      const aiMessage: Message = {
        id: generateId(),
        type: 'ai',
        content: cleanContent,
        reasoning: generateReasoning(text),
        artifact,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      if (!isMounted.current) return;
      
      const errorMessage = isNetworkError(err) 
        ? 'System Offline: Cannot reach AI Core. Please ensure backend is running.'
        : getErrorMessage(err);
      
      setError(errorMessage);
      
      // Add error message as AI response for better UX
      const errorAiMessage: Message = {
        id: generateId(),
        type: 'ai',
        content: `⚠️ **Connection Error**\n\n${errorMessage}\n\nPlease try again or check your network connection.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorAiMessage]);
      
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [messages, isLoading]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    clearError,
  };
}

export default useChat;
