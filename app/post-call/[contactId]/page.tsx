"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, XCircle, Edit3, Wand2, ChevronRight, LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';

export default function PostCallPage() {
  const { 
    mockUser, 
    contacts, 
    navigateTo, 
    callDetails, 
    updateContactNotes, 
    callGeminiAPI, 
    quickCallRemarks,
    isLoading,
    setIsLoading,
    selectedContactId, // Use selectedContactId from context
    setSelectedContactId
  } = useAppContext();

  const params = useParams();
  const router = useRouter();
  const contactId = typeof params.contactId === 'string' ? params.contactId : null;
  
  const [contact, setContact] = useState(contacts.find(c => c.id === contactId));
  const [notes, setNotes] = useState(contact?.postCallNotes || '');
  const [analyzedNotes, setAnalyzedNotes] = useState('');

  useEffect(() => {
    if (contactId) {
      setSelectedContactId(contactId);
      const currentContact = contacts.find(c => c.id === contactId);
      if (currentContact) {
        setContact(currentContact);
        setNotes(currentContact.postCallNotes || `Spouse name is Gemini Milner\nAddress: 1234 Maple Street, Apt. 5B, Los Angeles, CA 90015, United States\nScheduled Follow-Up`); // Default notes from original
      } else {
        console.warn(`PostCallPage: Contact with id ${contactId} not found.`);
        router.push('/follow-ups');
      }
    } else if (selectedContactId) {
        const currentContact = contacts.find(c => c.id === selectedContactId);
        if (currentContact) {
            setContact(currentContact);
            setNotes(currentContact.postCallNotes || `Spouse name is Gemini Milner\nAddress: 1234 Maple Street, Apt. 5B, Los Angeles, CA 90015, United States\nScheduled Follow-Up`);
        } else router.push('/follow-ups');
    }
     else {
      router.push('/follow-ups');
    }
  }, [contactId, contacts, router, selectedContactId, setSelectedContactId]);


  const handleSave = () => {
    if (!contact) return;
    setIsLoading(true);
    updateContactNotes(contact.id, notes);
    
    // Navigate to next unresolved contact or list
    const unresolvedContacts = contacts.filter(c => !c.isResolved && c.id !== contact.id);
    if (unresolvedContacts.length > 0) {
        // Simple logic: go to the first unresolved. More complex logic could find the "next" in sequence.
        navigateTo('/follow-ups/[contactId]', {contactId: unresolvedContacts[0].id}); 
    } else {
        navigateTo('/follow-ups');
    }
    setIsLoading(false);
  };

  const handleAnalyzeNotes = async () => {
    if (isLoading || !notes.trim()) return;
    setIsLoading(true);
    const prompt = `Analyze the following post-call notes and provide a brief summary of key points or suggest next actions for a sales agent: "${notes}"`;
    const analysis = await callGeminiAPI(prompt);
    setAnalyzedNotes(analysis);
    setIsLoading(false);
  };
  
  const handleQuickRemarkClick = (remarkText: string) => {
    setNotes(prev => prev ? `${prev}\n- ${remarkText}` : `- ${remarkText}`);
  };

  if (!contact) {
    return (
      <div className="flex flex-col h-screen p-4 bg-gray-50 items-center justify-center">
        <p>Loading post-call details...</p>
        <Button onClick={() => router.push('/follow-ups')} className="mt-4">Back to Follow Ups</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 bg-white border-b sticky top-0 z-10">
         <Button variant="ghost" size="icon" onClick={() => navigateTo('/follow-ups/[contactId]', {contactId: contact.id})} disabled={isLoading}>
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-800">Call Ended</h1>
        <Avatar>
          <AvatarFallback className="bg-slate-200 text-slate-700">{mockUser.initials}</AvatarFallback>
        </Avatar>
      </header>

      <ScrollArea className="flex-grow p-4 space-y-4"> 
        {contact.preCallScript && (
            <Card className="bg-white">
                <CardHeader><CardTitle className="text-md">Pre Call Script (Recap)</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-gray-600 italic">"{contact.preCallScript}"</p></CardContent>
            </Card>
        )}
        <Card className="bg-white">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-md">Call History</CardTitle>
            {callDetails?.callDuration && <Badge variant="secondary" className="bg-gray-200 text-gray-700">{callDetails.callDuration}</Badge>}
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-sm text-gray-700">Call with {contact.name} ended.</p>
            <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => navigateTo('/call/[contactId]', {contactId: contact.id})} disabled={isLoading}>
              <Phone className="w-4 h-4 mr-1" /> Dial Again
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-md">Post Call Notes</CardTitle>
            {/* <Button variant="ghost" size="sm" disabled={isLoading}><Edit3 className="w-4 h-4 mr-1"/> Edit note</Button> */}
          </CardHeader>
          <CardContent>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="w-full p-2 border rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter call notes here..."
              disabled={isLoading}
            />
            <Button variant="outline" size="sm" onClick={handleAnalyzeNotes} disabled={isLoading || !notes.trim()} className="mt-2">
                <Wand2 className="w-4 h-4 mr-1"/> Analyze Notes
            </Button>
            {analyzedNotes && (
              <div className="p-2 mt-3 bg-indigo-50 border-l-4 border-indigo-500 rounded">
                <p className="text-sm text-indigo-700 font-semibold">AI Analysis:</p>
                <p className="text-sm text-indigo-700 italic whitespace-pre-wrap">{analyzedNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white">
            <CardHeader><CardTitle className="text-md">Quick Call Remarks</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {quickCallRemarks.map(remark => {
                  const Icon = remark.icon as LucideIcon; // Type assertion
                  return (
                    <Button key={remark.id} variant="outline" size="sm" className="rounded-full" onClick={() => handleQuickRemarkClick(remark.text)} disabled={isLoading}>
                      {Icon && <Icon className="w-4 h-4 mr-1"/>} {remark.text}
                    </Button>
                  );
                })}
            </CardContent>
        </Card>
      </ScrollArea>

      <div className="p-4 border-t bg-white flex justify-around items-center sticky bottom-0 z-10">
        <Button variant="outline" className="flex-1 mr-2 border-gray-300 text-gray-700" onClick={() => navigateTo('/follow-ups/[contactId]', {contactId: contact.id})} disabled={isLoading}>
          <XCircle className="w-5 h-5 mr-2" /> Close
        </Button>
         <Button variant="outline" className="flex-1 mx-1 border-gray-300 text-gray-700" onClick={() => navigateTo('/follow-ups/[contactId]', {contactId: contact.id})} disabled={isLoading}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <Button className="flex-1 ml-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSave} disabled={isLoading}>
          Save & Next <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
