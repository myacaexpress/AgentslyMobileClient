"use client";

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from '@/contexts/AppContext';

export default function FollowUpListPage() {
  const { mockUser, contacts, navigateTo } = useAppContext();
  const [activeTab, setActiveTab] = useState('Recent'); 

  // Ensure contacts is always an array to prevent errors if it's undefined
  const safeContacts = contacts || [];

  const filteredContacts = safeContacts.filter(contact => {
    if (!contact) return false; // Skip if contact is undefined
    if (activeTab === 'Urgent') return contact.urgency === 'urgent' && !contact.isResolved;
    if (activeTab === 'Follow Up') return !contact.isResolved; 
    if (activeTab === 'No Answer') {
      return contact.history?.some(h => h.type === 'call_attempt' && h.status === 'no_answer') && !contact.isResolved;
    }
    // Default to 'Recent' or any other tab not explicitly handled above, showing non-resolved contacts
    return !contact.isResolved; 
  }).sort((a,b) => (b.lastInteraction || 0) - (a.lastInteraction || 0)); // Sort by lastInteraction descending

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]"> {/* Adjusted height for bottom nav */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4 flex flex-col flex-grow">
        <TabsList className="grid w-full grid-cols-4 mb-4 shrink-0">
          <TabsTrigger value="Recent" onClick={() => setActiveTab('Recent')}>Recent</TabsTrigger>
          <TabsTrigger value="Urgent" onClick={() => setActiveTab('Urgent')}>Urgent</TabsTrigger>
          <TabsTrigger value="Follow Up" onClick={() => setActiveTab('Follow Up')}>Follow Up</TabsTrigger>
          <TabsTrigger value="No Answer" onClick={() => setActiveTab('No Answer')}>No Ans</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="flex-grow overflow-hidden">
          <ScrollArea className="h-full space-y-3">
            {filteredContacts.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-500 mt-8">No contacts for this category.</p>
              </div>
            )}
            {filteredContacts.map(contact => (
              <Card key={contact.id} className="p-0">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{contact.name} • <span className="text-sm font-normal text-gray-600">{contact.phone}</span></p>
                      <p className="text-sm text-gray-500">{contact.status}</p>
                    </div>
                    {contact.isResolved && <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">Resolved</Badge>}
                  </div>
                  {contact.callBefore && contact.callBefore !== 'N/A' && !contact.isResolved && <p className="text-xs text-orange-500 mt-1">Call before {contact.callBefore}</p>}
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 text-indigo-600 border-indigo-600 hover:bg-indigo-50 flex justify-between items-center" 
                    onClick={() => navigateTo('/follow-ups/[contactId]', {contactId: contact.id})}
                  >
                    Check Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
