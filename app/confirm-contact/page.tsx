"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Briefcase, FileText, UserRoundPlus, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppContext } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation'; // For redirecting if data is missing

// Interface for contact data, can be shared if defined elsewhere
interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

export default function ContactConfirmationPage() {
  const { 
    navigateTo, 
    addContact, 
    mockUser, 
    contactConfirmationData, 
    setContactConfirmationData,
    isLoading,
    setIsLoading
  } = useAppContext();
  const router = useRouter();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    company: '',
    notes: '',
  });

  useEffect(() => {
    if (contactConfirmationData?.extractedData) {
      setFormData({
        name: contactConfirmationData.extractedData.name || '',
        phone: contactConfirmationData.extractedData.phone || '',
        email: contactConfirmationData.extractedData.email || '',
        company: contactConfirmationData.extractedData.company || '',
        notes: contactConfirmationData.extractedData.notes || '',
      });
    } else {
      // If there's no data, maybe redirect back or show an error
      // For now, let's assume data is always present when navigating here
      // or the user might have refreshed, losing context state.
      // A robust solution might involve query params or session storage for resilience.
      console.warn("ContactConfirmationPage loaded without contactConfirmationData. User might need to restart the process.");
      // Optionally, redirect:
      // router.push('/'); 
    }
  }, [contactConfirmationData, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = () => {
    if (!formData.name && !formData.phone && !formData.email) {
      alert("Please provide at least a name, phone, or email."); // Consider using a ShadCN Dialog/Alert for this
      return;
    }
    setIsLoading(true);
    // Ensure addContact in AppContext matches the expected signature
    const newContactId = addContact({ 
        ...formData, 
        // These fields are not on ContactFormData, so provide defaults or ensure addContact handles them
        status: 'New Lead (from image)', 
        callBefore: 'N/A', 
        urgency: 'normal', 
        preCallScript: `Hi ${formData.name}, I'm following up on the information we received.`
    }); 
    
    // Clear confirmation data and navigate
    setContactConfirmationData(null); 
    navigateTo('/'); 
    // TODO: Consider adding a success message to chat in AskScreen after navigation.
    setIsLoading(false);
  };
  
  const inputFields = [
      { name: "name", label: "Name", placeholder: "Contact's full name", icon: User },
      { name: "phone", label: "Phone", placeholder: "(123) 456-7890", icon: Phone, type: "tel" },
      { name: "email", label: "Email", placeholder: "contact@example.com", icon: Mail, type: "email" },
      { name: "company", label: "Company", placeholder: "Company Inc.", icon: Briefcase, type: "text" },
  ];

  if (!contactConfirmationData) {
    // This can happen on a page refresh if state is lost.
    // A more robust solution would use query parameters or local storage for the image/data.
    return (
        <div className="flex flex-col h-full items-center justify-center p-4">
            <p className="text-lg text-gray-600">No contact data to confirm.</p>
            <p className="text-sm text-gray-500 mb-4">Please try extracting the contact again.</p>
            <Button onClick={() => navigateTo('/')}>Back to Ask</Button>
        </div>
    );
  }

  return (
      <div className="flex flex-col h-screen"> {/* Full screen height */}
          <header className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-10">
               <Button variant="ghost" size="icon" onClick={() => { setContactConfirmationData(null); navigateTo('/');}} disabled={isLoading}>
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-800">Confirm Contact Details</h1>
              <Avatar>
                  <AvatarFallback className="bg-slate-200 text-slate-700">{mockUser.initials}</AvatarFallback>
              </Avatar>
          </header>
          <ScrollArea className="flex-grow p-4 space-y-4 bg-gray-50">
              {contactConfirmationData?.image && (
                  <Card className="bg-white">
                      <CardHeader><CardTitle className="text-md">Scanned Image</CardTitle></CardHeader>
                      <CardContent className="flex justify-center">
                          <img src={contactConfirmationData.image} alt="Scanned contact" className="rounded-md max-h-60 w-auto shadow-md" />
                      </CardContent>
                  </Card>
              )}
              <Card className="bg-white">
                  <CardHeader><CardTitle className="text-md">Extracted Information</CardTitle><CardDescription>Please verify and edit the details below.</CardDescription></CardHeader>
                  <CardContent className="space-y-3">
                      {inputFields.map(field => {
                          const Icon = field.icon;
                          return (
                              <div key={field.name}>
                                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                      <Icon className="w-4 h-4 mr-2 text-gray-500" />
                                      {field.label}
                                  </label>
                                  <Input
                                      type={field.type || "text"}
                                      name={field.name}
                                      id={field.name}
                                      value={formData[field.name as keyof ContactFormData]}
                                      onChange={handleChange}
                                      placeholder={field.placeholder}
                                      className="w-full"
                                      disabled={isLoading}
                                  />
                              </div>
                          );
                      })}
                      <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-gray-500" />
                              Notes
                          </label>
                          <Textarea
                              name="notes"
                              id="notes"
                              value={formData.notes}
                              onChange={handleChange}
                              placeholder="Additional notes..."
                              rows={3}
                              className="w-full"
                              disabled={isLoading}
                          />
                      </div>
                  </CardContent>
              </Card>
          </ScrollArea>
          <div className="p-4 border-t bg-white flex space-x-2 sticky bottom-0 z-10">
              <Button variant="outline" className="flex-1" onClick={() => { setContactConfirmationData(null); navigateTo('/');}} disabled={isLoading}>
                  <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={handleSaveContact} disabled={isLoading}>
                  <UserRoundPlus className="w-4 h-4 mr-2" /> Save Contact
              </Button>
          </div>
      </div>
  );
}
