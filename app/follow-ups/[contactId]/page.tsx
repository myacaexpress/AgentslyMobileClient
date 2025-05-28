"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, Briefcase, XCircle, Wand2, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation'; // For accessing route params and navigation

export default function ContactDetailPage() {
  const { 
    mockUser, 
    contacts, 
    navigateTo, 
    startCall, 
    callGeminiAPI, 
    updateContactData, 
    scriptTemplates,
    isLoading,
    setIsLoading,
    selectedContactId, // Use selectedContactId from context
    setSelectedContactId 
  } = useAppContext();
  
  const params = useParams();
  const router = useRouter();
  const contactId = typeof params.contactId === 'string' ? params.contactId : null;

  // Local state for this page's specific data, initialized from context or contact props
  const [currentContact, setCurrentContact] = useState(contacts.find(c => c.id === contactId));
  const [summarizedContext, setSummarizedContext] = useState(currentContact?.summarizedContext || '');
  const [suggestedScript, setSuggestedScript] = useState(currentContact?.suggestedScript || currentContact?.preCallScript || '');

  useEffect(() => {
    if (contactId) {
      setSelectedContactId(contactId); // Keep context in sync
      const foundContact = contacts.find(c => c.id === contactId);
      setCurrentContact(foundContact);
      if (foundContact) {
        setSummarizedContext(foundContact.summarizedContext || '');
        setSuggestedScript(foundContact.suggestedScript || foundContact.preCallScript || '');
      } else {
        // Contact not found, maybe redirect or show error
        console.warn(`Contact with id ${contactId} not found.`);
        // router.push('/follow-ups'); // Example redirect
      }
    }
  }, [contactId, contacts, setSelectedContactId, router]);


  const handleSummarizeContext = async () => {
    if (isLoading || !currentContact) return;
    setIsLoading(true);
    try {
      const prompt = `Summarize the following customer context in one or two short sentences for a sales agent: "${currentContact.notes}"`;
      const summary = await callGeminiAPI(prompt);
      setSummarizedContext(summary);
      updateContactData(currentContact.id, { summarizedContext: summary });
    } catch (err) {
      console.error("Gemini summarization failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestScript = async () => {
    if (isLoading || !currentContact) return;
    setIsLoading(true);
    try {
      let prompt = `Based on the following customer context: "${currentContact.notes}" and their status: "${currentContact.status}", suggest a brief and polite pre-call script for a sales agent.`;
      if (scriptTemplates && scriptTemplates.trim() !== "") {
        prompt += `\n\nPlease also consider these general script templates and guidelines when crafting the script: "${scriptTemplates}"`;
      }
      const script = await callGeminiAPI(prompt);
      setSuggestedScript(script);
      updateContactData(currentContact.id, { suggestedScript: script });
    } catch (err) {
      console.error("Gemini script suggestion failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentContact) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <p>Contact not found or loading...</p>
        <Button onClick={() => navigateTo('/follow-ups')} className="mt-4">Back to Follow Ups</Button>
      </div>
    );
  }

  // Determine next contact for "Next" button
  const currentIndex = contacts.findIndex(c => c.id === currentContact.id);
  const unresolvedContacts = contacts.filter(c => !c.isResolved);
  let nextContact = null;
  if (currentIndex !== -1 && unresolvedContacts.length > 0) {
    // Find next unresolved contact, looping if necessary
    let nextIndex = (currentIndex + 1) % contacts.length;
    while(contacts[nextIndex].isResolved && nextIndex !== currentIndex) {
        nextIndex = (nextIndex + 1) % contacts.length;
    }
    if (!contacts[nextIndex].isResolved) {
        nextContact = contacts[nextIndex];
    } else if (unresolvedContacts.length > 0 && unresolvedContacts[0].id !== currentContact.id) {
        nextContact = unresolvedContacts[0]; // Fallback to first unresolved if loop fails
    }
  } else if (unresolvedContacts.length > 0) {
    nextContact = unresolvedContacts[0];
  }


  return (
    <div className="flex flex-col h-screen bg-gray-50"> {/* Full screen height */}
      <header className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigateTo('/follow-ups')} disabled={isLoading}>
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-800">Follow Up</h1>
        <Avatar>
          <AvatarFallback className="bg-slate-200 text-slate-700">{mockUser.initials}</AvatarFallback>
        </Avatar>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{currentContact.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => navigateTo('/follow-ups')} disabled={isLoading}> {/* Close button */}
                    <XCircle className="w-5 h-5 text-gray-400 hover:text-gray-600"/>
                </Button>
            </div>
            <CardDescription>{currentContact.status}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm text-gray-700"><Phone className="w-4 h-4 mr-2 text-gray-500" /> {currentContact.phone}</div>
            <div className="flex items-center text-sm text-gray-700"><Mail className="w-4 h-4 mr-2 text-gray-500" /> {currentContact.email}</div>
            <div className="flex items-center text-sm text-gray-700"><Briefcase className="w-4 h-4 mr-2 text-gray-500" /> {currentContact.company}</div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-md">Customer Context</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSummarizeContext} disabled={isLoading || !currentContact.notes}>
                <Wand2 className="w-4 h-4 mr-1"/> Summarize 
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {summarizedContext && (
              <div className="p-2 mb-3 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                <p className="text-sm text-indigo-700 font-semibold">AI Summary:</p>
                <p className="text-sm text-indigo-700 italic whitespace-pre-wrap">{summarizedContext}</p>
              </div>
            )}
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {currentContact.notes.split('. ').map((note, index) => note.trim() && <li key={index}>{note.trim()}</li>)}
            </ul>
             {(!currentContact.notes || currentContact.notes.trim() === "") && <p className="text-sm text-gray-500">No notes available for this contact.</p>}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="text-md">Pre Call Script</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSuggestScript} disabled={isLoading || !currentContact.notes}>
                    <Wand2 className="w-4 h-4 mr-1"/> Suggest Script
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 italic whitespace-pre-wrap">"{suggestedScript}"</p>
            {(!suggestedScript || suggestedScript.trim() === "") && <p className="text-sm text-gray-500">No script available. Try generating one.</p>}
          </CardContent>
        </Card>
      </ScrollArea>

      <div className="p-4 border-t bg-white flex justify-around items-center sticky bottom-0 z-10">
        <Button variant="outline" className="flex-1 mr-2 border-gray-300 text-gray-700" onClick={() => navigateTo('/follow-ups')} disabled={isLoading}>
          <XCircle className="w-5 h-5 mr-2" /> Close
        </Button>
        <Button className="flex-1 mx-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => startCall(currentContact)} disabled={isLoading || currentContact.isResolved}>
          <Phone className="w-5 h-5 mr-2" /> Dial
        </Button>
        <Button 
            variant="outline" 
            className="flex-1 ml-2 border-gray-300 text-gray-700" 
            onClick={() => nextContact ? navigateTo('/follow-ups/[contactId]', {contactId: nextContact.id}) : navigateTo('/follow-ups')} 
            disabled={isLoading || !nextContact}
        >
          Next <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
