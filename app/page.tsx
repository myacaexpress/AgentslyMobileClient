"use client";

import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, ChevronRight, Paperclip, Send, UserRoundPlus, FileImage, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Assuming DialogContent is part of Dialog
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext'; // For potential user info display

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  image?: string | null;
  isLeadList?: boolean;
  isFollowUpList?: boolean;
  leads?: Array<any>; // Define a more specific lead type if possible
  type?: 'skeleton_loader';
  uploadStatus?: string;
}

export default function AskPage() {
  const { 
    mockUser, 
    navigateTo, 
    callGeminiAPI, 
    contacts, 
    customerFollowUpRule, 
    prospectFollowUpRule,
    isLoading, 
    setIsLoading,
    setContactConfirmationData // For passing data to confirmation screen
  } = useAppContext();
  
  // const { user: firebaseUser } = useAuth(); // Get Firebase user if needed for display

  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: `Hello, ${mockUser.name}. What can I help you with today?`, timestamp: new Date() }
  ]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imageForProcessing, setImageForProcessing] = useState<string | null>(null);
  const [showImageActionModal, setShowImageActionModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleFollowUpQuickAction = async (followUpType: 'customers' | 'prospects') => {
    if (isLoading) return;
    setIsLoading(true);

    const actionText = `Follow up with ${followUpType}`;
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: actionText, timestamp: new Date() };
    const skeletonMessageId = Date.now().toString() + '_skeleton';
    const skeletonMessage: ChatMessage = { id: skeletonMessageId, sender: 'ai', text: "", type: 'skeleton_loader', timestamp: new Date() };
    
    setChatMessages(prev => [...prev, userMessage, {
        id: Date.now().toString() + '_ai_instruct',
        sender: 'ai',
        text: `Generating prioritized list for "${actionText}" based on your rules...`,
        timestamp: new Date()
      }, skeletonMessage]);

    const rule = followUpType === 'customers' ? customerFollowUpRule : prospectFollowUpRule;
    const prompt = `
      You are an AI assistant for a CRM. Your task is to help an agent prioritize follow-ups.
      Rule: "${rule}"
      Contacts: ${JSON.stringify(contacts.map(c=>({id:c.id, name:c.name, phone:c.phone, email:c.email, company:c.company, status:c.status, notes:c.notes, urgency:c.urgency, isResolved: c.isResolved, history: c.history?.length || 0 })))}
      Return a JSON array of up to 5 prioritized contacts with fields: "id", "name", "phone", "status", "prioritizationReason".
      prioritizationReason should be a brief explanation based on the rule and contact data.
      If no contacts meet criteria, return an empty JSON array [].
    `;
    const followUpListSchema = {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                "id": { "type": "STRING" },
                "name": { "type": "STRING" },
                "phone": { "type": "STRING" },
                "status": { "type": "STRING" },
                "prioritizationReason": { "type": "STRING" }
            },
            required: ["id", "name", "prioritizationReason"]
        }
    };

    const responseText = await callGeminiAPI(prompt, null, followUpListSchema); 
    let prioritizedLeads: any[] = [];
    let errorMessage = '';

    try {
      prioritizedLeads = JSON.parse(responseText);
      if (!Array.isArray(prioritizedLeads)) { 
        prioritizedLeads = [];
        errorMessage = "The AI returned an unexpected format. Please try again.";
      }
    } catch (e) {
      console.error("Error parsing follow-up list JSON:", e, responseText);
      prioritizedLeads = [];
      errorMessage = "There was an issue processing the AI's response. Please try again.";
    }
    
    setChatMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== skeletonMessageId);
        return [...filteredMessages, {
            id: Date.now().toString() + 'ai_followup',
            sender: 'ai',
            text: errorMessage || (prioritizedLeads.length > 0 ? `Here are the prioritized ${followUpType} based on your rules:` : `No ${followUpType} found matching the criteria based on your rules.`),
            isFollowUpList: prioritizedLeads.length > 0 && !errorMessage, 
            leads: prioritizedLeads, 
            timestamp: new Date()
        }];
    });
    setIsLoading(false);
  };

  const handleSend = async () => {
    if ((!inputMessage.trim() && !attachedImage) || isLoading) return;
    setIsLoading(true); 
    const userMessageText = inputMessage;
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userMessageText, image: attachedImage, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachedImage(null); 

    let prompt = userMessageText;
    if (attachedImage && userMessageText.toLowerCase().includes("lead list")) {
        prompt = `This image contains a list of leads. Please extract the information and tell me you've uploaded it to the CRM. If you can extract names, phone numbers, or emails, mention that. The user said: "${userMessageText}"`;
    } else if (userMessageText.toLowerCase().includes("numbers to dial") || userMessageText.toLowerCase().includes("urgent calls")) {
        const urgentLeads = contacts.filter(c => c.urgency === 'urgent' && !c.isResolved).slice(0, 2);
        const aiResponseText = urgentLeads.length > 0 ? "Here are some urgent leads from your CRM:" : "No urgent leads found in your CRM at the moment.";
        setChatMessages(prev => [...prev, {
            id: Date.now().toString() + 'ai_urgent', sender: 'ai', text: aiResponseText,
            isLeadList: urgentLeads.length > 0, leads: urgentLeads, timestamp: new Date()
        }]);
        setIsLoading(false); return;
    } else if (attachedImage) {
        prompt = `The user uploaded an image and said: "${userMessageText}". Describe the image or answer the question based on the image.`;
    }
    
    const aiResponseText = await callGeminiAPI(prompt, attachedImage);
    const aiResponse: ChatMessage = { id: Date.now().toString() + 'ai_general', sender: 'ai', text: aiResponseText, timestamp: new Date() };
    setChatMessages(prev => [...prev, aiResponse]);
    setIsLoading(false); 
  };

  const handleImageAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageForProcessing(reader.result as string); 
        setShowImageActionModal(true); 
      };
      reader.readAsDataURL(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleExtractContactFromImage = async () => {
    setShowImageActionModal(false);
    if (!imageForProcessing || isLoading) return;
    setIsLoading(true);
    setChatMessages(prev => [...prev, {
        id: Date.now().toString(), sender: 'user', text: "Extracting contact from image...", image: imageForProcessing, timestamp: new Date()
    }]);

    const contactSchema = {
        type: "OBJECT",
        properties: {
            "name": { "type": "STRING", "description": "Full name of the contact." },
            "phone": { "type": "STRING", "description": "Primary phone number." },
            "email": { "type": "STRING", "description": "Email address." },
            "company": { "type": "STRING", "description": "Company name, if any." },
            "notes": { "type": "STRING", "description": "Any other relevant notes or details from the image." }
        },
        // required: ["name"] // Example: make name required
    };
    const prompt = "Analyze the attached image. It might contain handwritten or printed contact information. Extract the Name, Phone Number, Email Address, Company Name, and any other relevant notes. If a field is not found, return an empty string for it. Ensure the response is a valid JSON object matching the provided schema structure.";
    
    const responseText = await callGeminiAPI(prompt, imageForProcessing, contactSchema);
    try {
        const extractedData = JSON.parse(responseText);
        setContactConfirmationData({ image: imageForProcessing, extractedData });
        navigateTo('/confirm-contact');
    } catch (e) {
        console.error("Error parsing contact extraction JSON:", e, responseText);
        setChatMessages(prev => [...prev, {
            id: Date.now().toString(), sender: 'ai', text: "Sorry, I couldn't extract contact details clearly from that image. Please try again or enter manually.", timestamp: new Date()
        }]);
    }
    setImageForProcessing(null);
    setIsLoading(false);
  };

  const handleAttachImageToMessage = () => {
    setAttachedImage(imageForProcessing); 
    setImageForProcessing(null);
    setShowImageActionModal(false);
    setChatMessages(prev => [...prev, {
        id: Date.now().toString(), sender: 'system', text: "Image attached. Type your message and send.", timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-4"> {/* Adjusted height for bottom nav */}
      <header className="flex justify-between items-center mb-4 header-enhanced rounded-lg p-3">
        <h1 className="text-xl font-bold text-slate-800 text-readable-medium">AGENTSLY.AI</h1>
        <Avatar>
          <AvatarFallback className="bg-slate-200 text-slate-700 text-readable">{mockUser.initials}</AvatarFallback>
        </Avatar>
      </header>

      <ScrollArea className="flex-grow mb-4 space-y-4">
        {chatMessages.map(msg => {
          if (msg.type === 'skeleton_loader') { 
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-xs lg:max-w-md p-3 rounded-lg bg-gray-200">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[220px]" />
                  </div>
                </div>
              </div>
            );
          }
          if (msg.sender === 'system') { 
            return (
              <div key={msg.id} className="text-center my-2">
                <p className="text-xs text-gray-500 italic bg-gray-100 px-2 py-1 rounded-full inline-block">{msg.text}</p>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'chat-message-user' : 'chat-message-ai'}`}>
                {msg.uploadStatus && <p className="text-xs text-gray-600 mb-1">{msg.uploadStatus}</p>}
                {msg.image && <img src={msg.image} alt="uploaded content" className="rounded-md mb-2 max-h-40" />}
                <p className="whitespace-pre-wrap">{msg.text}</p>
                
                {(msg.isLeadList || msg.isFollowUpList) && msg.leads && msg.leads.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.leads.map(lead => (
                      <Card key={lead.id} className="bg-white p-3">
                        <p className="font-semibold">{lead.name} <span className="font-normal text-sm">{lead.phone || 'N/A'}</span></p>
                        <p className="text-xs text-gray-600">{lead.status || 'N/A'}</p>
                        {lead.callBefore && <p className="text-xs text-orange-500">Call before {lead.callBefore}</p>}
                        
                        {msg.isFollowUpList && lead.prioritizationReason && (
                          <div className="mt-2 p-2 bg-indigo-50 border-l-2 border-indigo-300 rounded">
                            <p className="text-xs font-semibold text-indigo-700">Prioritization Context:</p>
                            <p className="text-xs text-indigo-600 italic">{lead.prioritizationReason}</p>
                          </div>
                        )}

                        <Button variant="outline" size="sm" className="mt-2 w-full text-indigo-600 border-indigo-600 hover:bg-indigo-50" onClick={() => navigateTo('/follow-ups/[contactId]', {contactId: lead.id})}>
                          Check Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {chatMessages.length <= 1 && ( 
          <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2 text-center">Quick Action</p>
              <div className="flex justify-center space-x-2">
                  <Button variant="outline" className="rounded-full" onClick={() => handleFollowUpQuickAction('customers')} disabled={isLoading}>Follow up with customers</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => handleFollowUpQuickAction('prospects')} disabled={isLoading}>Follow up with prospects</Button>
              </div>
          </div>
      )}

      <Dialog open={showImageActionModal} onOpenChange={setShowImageActionModal}>
        <DialogHeader>
          <DialogTitle>Image Action</DialogTitle>
          <DialogDescription>What would you like to do with the selected image?</DialogDescription>
        </DialogHeader>
        {imageForProcessing && <img src={imageForProcessing} alt="Preview for action" className="rounded-md mb-4 max-h-40 mx-auto" />}
        <div className="space-y-2">
            <Button onClick={handleExtractContactFromImage} className="w-full bg-blue-500 hover:bg-blue-600">
                <UserRoundPlus className="w-4 h-4 mr-2" /> Extract New Contact
            </Button>
            <Button onClick={handleAttachImageToMessage} className="w-full">
                <FileImage className="w-4 h-4 mr-2" /> Attach to Chat Message
            </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {setShowImageActionModal(false); setImageForProcessing(null);}}>Cancel</Button>
        </DialogFooter>
      </Dialog>

      <div className="flex items-center space-x-2 border-t pt-4">
        <Button variant="ghost" size="icon" onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={isLoading}>
          <Paperclip className="w-5 h-5 text-gray-500" />
        </Button>
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageAttach} className="hidden" />
        <Input 
            type="text" 
            placeholder={attachedImage ? "Image attached. Type message..." : "Ask anything..."}
            className="flex-grow input-enhanced" 
            value={inputMessage} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
        />
        <Button size="icon" onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 btn-enhanced text-readable-medium" disabled={isLoading || (!inputMessage.trim() && !attachedImage) }>
          <Send className="w-5 h-5 text-white" />
        </Button>
      </div>
      {attachedImage && !imageForProcessing && (
        <div className="mt-2 p-2 border rounded-md bg-gray-50 flex items-center justify-between">
          <img src={attachedImage} alt="Preview for message" className="max-h-16 rounded-md inline-block"/>
          <Button variant="ghost" size="sm" onClick={() => setAttachedImage(null)} disabled={isLoading}>
            <XCircle className="w-4 h-4 mr-1 text-red-500" /> Remove
          </Button>
        </div>
      )}
    </div>
  );
}
