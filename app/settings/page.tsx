"use client";

import React, { useState } from 'react';
import { PlusCircle, Trash2, Zap, LucideIcon } from 'lucide-react'; // Assuming Zap for default new remark icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from '@/contexts/AppContext';
import UserAvatar from '@/components/UserAvatar';

export default function SettingsPage() { 
  const { 
    mockUser, 
    quickCallRemarks, setQuickCallRemarks,
    customerFollowUpRule, setCustomerFollowUpRule,
    prospectFollowUpRule, setProspectFollowUpRule,
    scriptTemplates, setScriptTemplates,
    isLoading, // Assuming isLoading is for global loading state
    // setIsLoading 
  } = useAppContext();

  const [newRemarkText, setNewRemarkText] = useState('');

  const handleAddRemark = () => {
    if (newRemarkText.trim() === '') return;
    // Use a simple counter-based approach to avoid hydration issues
    const timestamp = Date.now();
    const newRemark = { id: `qcr_${timestamp}`, text: newRemarkText, icon: Zap as LucideIcon };
    setQuickCallRemarks(prev => [...prev, newRemark]);
    setNewRemarkText('');
  };

  const handleRemoveRemark = (remarkId: string) => {
    setQuickCallRemarks(prev => prev.filter(remark => remark.id !== remarkId));
  };
  
  const handleSaveSettings = () => {
    // In a real app, this would likely involve an API call to persist settings
    console.log("Settings saved (client-side state updated):", { customerFollowUpRule, prospectFollowUpRule, quickCallRemarks, scriptTemplates });
    alert("Settings saved! (Changes are local to this session for now)"); 
    // Potentially show a toast notification here
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]"> {/* Adjusted height for global header and bottom nav */}
      <ScrollArea className="flex-grow p-4 space-y-6 bg-gray-50">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-md">Follow up with customers rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={customerFollowUpRule}
              onChange={(e) => setCustomerFollowUpRule(e.target.value)}
              placeholder="Enter rules for following up with customers..."
              rows={4}
              className="text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">This rule will guide the AI when you ask to "Follow up with customers".</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-md">Follow up with prospects rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={prospectFollowUpRule}
              onChange={(e) => setProspectFollowUpRule(e.target.value)}
              placeholder="Enter rules for following up with prospects..."
              rows={4}
              className="text-sm"
              disabled={isLoading}
            />
             <p className="text-xs text-gray-500 mt-1">This rule will guide the AI when you ask to "Follow up with prospects".</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-md">Script Templates</CardTitle>
            <CardDescription>Define templates or key phrases for the AI to use when suggesting pre-call scripts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={scriptTemplates}
              onChange={(e) => setScriptTemplates(e.target.value)}
              placeholder="e.g., Start with a friendly greeting. Mention [Product Name]. Ask about their current needs. Offer [Specific Deal] if applicable."
              rows={5}
              className="text-sm"
              disabled={isLoading}
            />
             <p className="text-xs text-gray-500 mt-1">The AI will consider these templates when you use the "Suggest Script" feature.</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-md">Edit Quick Call Remarks</CardTitle>
            <CardDescription>Customize the buttons that appear after a call.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex space-x-2">
              <Input 
                type="text"
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                placeholder="New remark text (e.g., Sent Email)"
                className="flex-grow"
                disabled={isLoading}
              />
              <Button onClick={handleAddRemark} size="icon" className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading || !newRemarkText.trim()}>
                <PlusCircle className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-2">
              {quickCallRemarks.map(remark => {
                const Icon = remark.icon as LucideIcon; // Type assertion
                return (
                  <div key={remark.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
                    <div className="flex items-center">
                      {Icon && <Icon className="w-4 h-4 mr-2 text-gray-600" />}
                      <span className="text-sm text-gray-700">{remark.text}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRemark(remark.id)} disabled={isLoading}>
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                );
              })}
            </div>
             {quickCallRemarks.length === 0 && <p className="text-sm text-gray-400 text-center py-2">No quick remarks defined.</p>}
          </CardContent>
        </Card>
        <div className="pt-4 pb-8 flex justify-end"> {/* Added padding bottom for spacing from nav */}
            <Button onClick={handleSaveSettings} className="bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>Save Settings</Button>
        </div>
      </ScrollArea>
    </div>
  );
}
