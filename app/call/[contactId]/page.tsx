"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppContext } from '@/contexts/AppContext';
import { useParams, useRouter } from 'next/navigation';

export default function CallingPage() {
  const { contacts, endCall, selectedContactId, setSelectedContactId } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const contactId = typeof params.contactId === 'string' ? params.contactId : null;
  
  const [contact, setContact] = useState(contacts.find(c => c.id === contactId));
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (contactId) {
      setSelectedContactId(contactId); // Ensure context is updated
      const currentContact = contacts.find(c => c.id === contactId);
      if (currentContact) {
        setContact(currentContact);
      } else {
        console.warn(`CallingPage: Contact with id ${contactId} not found.`);
        router.push('/follow-ups'); // Redirect if contact not found
      }
    } else if (selectedContactId) { // Fallback to selectedContactId from context if no param
        const currentContact = contacts.find(c => c.id === selectedContactId);
        if (currentContact) setContact(currentContact);
        else router.push('/follow-ups');
    } else {
        router.push('/follow-ups'); // Redirect if no contact ID at all
    }
  }, [contactId, contacts, router, selectedContactId, setSelectedContactId]);

  useEffect(() => {
    if (contact) { // Only start timer if contact is loaded
      setCallDuration(0); 
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contact]); // Rerun effect if contact changes

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    endCall(callDuration); // This will navigate to post-call screen via AppContext
  };

  if (!contact) {
    return (
      <div className="flex flex-col h-screen p-4 bg-slate-800 text-white items-center justify-center">
        <p>Loading call details...</p>
        {/* Optional: Add a button to go back if stuck */}
        <Button onClick={() => router.push('/follow-ups')} className="mt-4 bg-slate-700 hover:bg-slate-600">
            Back to Follow Ups
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen p-4 bg-slate-800 text-white items-center justify-between">
      <div className="text-center mt-16">
        <Avatar className="w-24 h-24 mx-auto mb-4 ring-2 ring-white">
          {/* Ensure contact.name is defined before trying to access substring */}
          <AvatarFallback className="text-4xl bg-slate-600">{contact.name ? contact.name.substring(0,1).toUpperCase() : '?'}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">{contact.name}</h2>
        <p className="text-lg text-slate-300">Connected</p>
        <p className="text-4xl font-mono mt-2">{formatDuration(callDuration)}</p>
      </div>
      
      <div className="w-full mb-8 px-4">
        {contact.preCallScript && (
            <p className="text-sm text-slate-300 mb-2 text-center bg-slate-700 p-3 rounded-md">
                "{contact.preCallScript}"
            </p>
        )}
      </div>

      <div className="flex justify-around w-full mb-16">
        <Button variant="ghost" className="flex flex-col items-center text-white hover:bg-slate-700 p-3 rounded-full h-auto" onClick={() => setIsSpeaker(!isSpeaker)}>
          <Volume2 className={`w-8 h-8 mb-1 ${isSpeaker ? 'text-green-400' : ''}`} />
          Speaker
        </Button>
        <Button variant="ghost" className="flex flex-col items-center text-white hover:bg-slate-700 p-3 rounded-full h-auto" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff className="w-8 h-8 mb-1 text-red-400" /> : <Mic className="w-8 h-8 mb-1" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
        <Button variant="destructive" className="flex flex-col items-center bg-red-600 hover:bg-red-700 p-3 rounded-full h-auto" onClick={handleEndCall}> 
          <PhoneOff className="w-8 h-8 mb-1" />
          End
        </Button>
      </div>
    </div>
  );
}
