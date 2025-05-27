"use client";

import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation'; // For Next.js navigation
import { MessageSquare, Phone, User, Settings, ArrowLeft, Mic, Video, PhoneOff, Send, Paperclip, Smile, Search, Filter, ChevronRight, CheckCircle, XCircle, Edit2, Clock, AlertTriangle, ListChecks, Users, Briefcase, Calendar, Mail, MapPin, MoreVertical, Volume2, MicOff, PhoneOutgoing, MessageCircle, UserPlus, FileText, ThumbsUp, ThumbsDown, Edit3, Zap, Loader2, Wand2, Trash2, PlusCircle, Camera, FileImage, UserRoundPlus, LucideIcon } from 'lucide-react';

// Types from the original App.js
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: string;
  callBefore: string;
  urgency: 'urgent' | 'normal' | 'low';
  notes: string;
  preCallScript: string;
  history: Array<{ type: string; content?: string; date: Date; status?: string }>;
  isResolved: boolean;
  summarizedContext?: string;
  suggestedScript?: string;
  postCallNotes?: string;
  lastInteraction?: number; // Added for sorting
}

interface CallDetails {
  contactName: string;
  callStartTime: number;
  callDuration?: string;
  callEndTime?: number;
}

interface QuickCallRemark {
  id: string;
  text: string;
  icon: LucideIcon;
}

interface MockUser {
  name: string;
  initials: string;
}

import { callGeminiAPI } from '@/lib/gemini'; // Import from lib

interface AppContextType {
  contacts: Contact[];
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  addContact: (newContactData: Omit<Contact, 'id' | 'isResolved' | 'history'>) => string;
  updateContactData: (contactId: string, updates: Partial<Contact>) => void;
  
  selectedContactId: string | null;
  setSelectedContactId: Dispatch<SetStateAction<string | null>>;
  selectedContact: Contact | undefined;

  mockUser: MockUser;
  
  callDetails: CallDetails | null;
  startCall: (contact: Contact) => void;
  endCall: (durationSeconds: number) => void;
  updateContactNotes: (contactId: string, newPostCallNotes: string) => void;

  callGeminiAPI: typeof callGeminiAPI;
  
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;

  quickCallRemarks: QuickCallRemark[];
  setQuickCallRemarks: Dispatch<SetStateAction<QuickCallRemark[]>>;
  
  customerFollowUpRule: string;
  setCustomerFollowUpRule: Dispatch<SetStateAction<string>>;
  prospectFollowUpRule: string;
  setProspectFollowUpRule: Dispatch<SetStateAction<string>>;
  scriptTemplates: string;
  setScriptTemplates: Dispatch<SetStateAction<string>>;

  // Navigation related
  navigateTo: (screenPath: string, params?: Record<string, string | number>) => void;
  contactConfirmationData: { image?: string | null; extractedData?: Partial<Contact> } | null;
  setContactConfirmationData: Dispatch<SetStateAction<{ image?: string | null; extractedData?: Partial<Contact> } | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockUserInitial: MockUser = {
  name: "Shawn",
  initials: "RV",
};

const initialQuickCallRemarksData: QuickCallRemark[] = [
  { id: 'qcr1', text: 'Left Voicemail', icon: Mic },
  { id: 'qcr2', text: 'Scheduled Follow-Up', icon: Calendar },
  { id: 'qcr3', text: 'Positive Outcome', icon: ThumbsUp },
  { id: 'qcr4', text: 'Needs Escalation', icon: AlertTriangle },
];

const mockContactsInitialData: Contact[] = [
  { id: '1', name: 'Shawn Milner', phone: '(305) 555-0021', email: 'shawnmilner8@gmail.com', company: 'ACA Health', status: 'Unconfirmed employment status', callBefore: '8:00pm', urgency: 'urgent', notes: "Just completed ACA certification. Looking for first full-time role. Big NBA fan (talks about Lakers). Spouse's name is missing. Part of address is missing.", preCallScript: "Hi! Just a quick follow-up - it looks like we're missing your spouse's name and part of your address. I just need a moment to confirm those so we can update your info", history: [], isResolved: false, lastInteraction: Date.now() - 100000 },
  { id: '2', name: 'Rovic Villaralvo', phone: '(305) 555-0021', email: 'rovic@example.com', company: 'Tech Solutions', status: 'Unconfirmed employment status', callBefore: '5:00pm', urgency: 'urgent', notes: 'Missing spouse name and incomplete address. Previous conversation about new software update.', preCallScript: "Hello Rovic, following up on our previous conversation regarding the new software update.", history: [], isResolved: true, lastInteraction: Date.now() - 200000 },
  { id: '3', name: 'Alex Johnson', phone: '(404) 123-4567', email: 'alex@example.com', company: 'Innovate Corp', status: 'Needs proposal', callBefore: '6:00pm', urgency: 'normal', notes: 'Interested in premium package. Discussed budget constraints last call. Needs a clear breakdown of ROI.', preCallScript: "Hi Alex, I have the proposal ready for you, focusing on the ROI we discussed.", history: [], isResolved: false, lastInteraction: Date.now() - 50000 },
  { id: '4', name: 'Maria Garcia', phone: '(786) 987-6543', email: 'maria@example.com', company: 'HealthFirst', status: 'Follow up in 2 weeks', callBefore: 'N/A', urgency: 'low', notes: 'Sent initial info pack. Expressed interest in family plans. Mentioned her daughter starts college soon.', preCallScript: "Hi Maria, just checking in as scheduled. How are things going? I recall you mentioning your daughter's college plans - any updates on the family plans we discussed?", history: [], isResolved: false, lastInteraction: Date.now() - 300000 },
];


export const AppProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(mockContactsInitialData);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickCallRemarks, setQuickCallRemarks] = useState<QuickCallRemark[]>(initialQuickCallRemarksData);
  const [customerFollowUpRule, setCustomerFollowUpRule] = useState("Look at the most recent 50 contacts and glean from the conversation and contact Fields if they are current customers and determine their need and what follow up steps are expected next in prioritize them accordingly");
  const [prospectFollowUpRule, setProspectFollowUpRule] = useState("First identify prospects by minimal communication as they may be new leads and sort of urgency by contacting people who have most newly been created with the least amount of communication");
  const [scriptTemplates, setScriptTemplates] = useState("General greeting: Hi [Customer Name]!\nFollow-up: Just wanted to follow up on our last conversation about [Topic].\nClosing: Let me know if you have any questions.");
  const [contactConfirmationData, setContactConfirmationData] = useState<{ image?: string | null; extractedData?: Partial<Contact> } | null>(null);

  const navigateTo = (screenPath: string, params?: Record<string, string | number>) => {
    let path = screenPath;
    if (params) {
      Object.keys(params).forEach(key => {
        path = path.replace(`[${key}]`, String(params[key]));
      });
    }
    
    if (screenPath.startsWith('/confirm-contact')) { // Special handling for confirm-contact data
        // Data for confirm-contact is set via setContactConfirmationData directly in AskScreen
    } else {
        setContactConfirmationData(null);
    }

    if (params && params.contactId) {
        setSelectedContactId(String(params.contactId));
    } else if (!screenPath.startsWith('/follow-ups/') && !screenPath.startsWith('/call/') && !screenPath.startsWith('/post-call/')) {
        setSelectedContactId(null);
    }
    router.push(path);
  };

  const addContact = (newContactData: Omit<Contact, 'id' | 'isResolved' | 'history'>): string => {
    const newId = `contact_${Date.now()}`;
    const newContact: Contact = {
      ...newContactData,
      id: newId,
      isResolved: false,
      history: [],
      lastInteraction: Date.now(),
    };
    setContacts(prevContacts => [newContact, ...prevContacts]);
    return newId;
  };

  const updateContactData = (contactId: string, updates: Partial<Contact>) => {
    setContacts(prevContacts =>
      prevContacts.map(c =>
        c.id === contactId ? { ...c, ...updates, lastInteraction: Date.now() } : c
      )
    );
  };

  const startCall = (contact: Contact) => {
    setCallDetails({ contactName: contact.name, callStartTime: Date.now() });
    navigateTo(`/call/${contact.id}`, { contactId: contact.id });
  };

  const endCall = (durationSeconds: number) => {
    const duration = `${Math.floor(durationSeconds / 60)} min ${durationSeconds % 60} sec`;
    setCallDetails(prev => prev ? ({ ...prev, callDuration: duration, callEndTime: Date.now() }) : null);
    if (selectedContactId) {
      navigateTo(`/post-call/${selectedContactId}`, { contactId: selectedContactId });
    } else {
      navigateTo('/'); // Fallback to home if no selected contact
    }
  };
  
  const updateContactNotes = (contactId: string, newPostCallNotes: string) => {
    const contactToUpdate = contacts.find(c => c.id === contactId);
    const updatedHistory = [...(contactToUpdate?.history || []), {type: 'note', content: newPostCallNotes, date: new Date()}];
    updateContactData(contactId, { postCallNotes: newPostCallNotes, history: updatedHistory });
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <AppContext.Provider value={{
      contacts, setContacts, addContact, updateContactData,
      selectedContactId, setSelectedContactId, selectedContact,
      mockUser: mockUserInitial,
      callDetails, startCall, endCall, updateContactNotes,
      callGeminiAPI,
      isLoading, setIsLoading,
      quickCallRemarks, setQuickCallRemarks,
      customerFollowUpRule, setCustomerFollowUpRule,
      prospectFollowUpRule, setProspectFollowUpRule,
      scriptTemplates, setScriptTemplates,
      navigateTo, contactConfirmationData, setContactConfirmationData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
