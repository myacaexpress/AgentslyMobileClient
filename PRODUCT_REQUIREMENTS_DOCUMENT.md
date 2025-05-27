# Product Requirements Document: Agentsly.AI Next.js Conversion & Firebase SSO

## 1. Introduction & Overview

This document outlines the requirements for converting the Agentsly.AI React application to a Next.js application, integrating Firebase for Single Sign-On (SSO) using Email/Password, and ensuring feature parity with the provided React codebase. Agentsly.AI is a CRM tool designed to assist sales agents by providing AI-powered features for contact management, call scripting, and follow-up prioritization.

## 2. Goals

*   **Migrate to Next.js:** Convert the existing React single-page application to a Next.js application utilizing the App Router.
*   **Implement Firebase SSO:** Integrate Firebase Authentication for user sign-up and sign-in using email and password.
*   **Feature Parity:** Ensure all functionalities present in the original React application are replicated in the Next.js version.
*   **Maintain UI/UX:** Preserve the visual design and user experience as depicted in the provided screenshots and original component structure.
*   **Leverage Next.js Benefits:** Utilize server components, client components, and routing capabilities of Next.js where appropriate.
*   **Modular Component Structure:** Continue using ShadCN/UI components for a consistent and modern UI.

## 3. Target Users

*   Sales Agents using the CRM for daily tasks, including contact management, making calls, and leveraging AI assistance.

## 4. Functional Requirements

### 4.1. User Authentication (Firebase SSO)
*   **FR-AUTH-001:** Users shall be able to sign up for a new account using an email address and password.
*   **FR-AUTH-002:** Users shall be able to log in to their existing account using their email address and password.
*   **FR-AUTH-003:** Authenticated user state shall be managed globally within the application.
*   **FR-AUTH-004:** Application routes (excluding login/signup pages) shall be protected, requiring authentication.
*   **FR-AUTH-005:** Unauthenticated users attempting to access protected routes shall be redirected to the login page.
*   **FR-AUTH-006:** Logged-in users visiting login/signup pages shall be redirected to the main application page (e.g., Ask screen).
*   **FR-AUTH-007 (Future):** Users shall be able to log out of their account. (Sign out functionality is in AuthContext but UI element not explicitly requested yet).

### 4.2. Ask Screen (Main Interaction Hub - `app/page.tsx`)
*   **FR-ASK-001:** Display a chat interface for users to interact with the AI.
*   **FR-ASK-002:** Allow users to type and send text messages to the AI.
*   **FR-ASK-003:** Allow users to attach images to messages.
    *   **FR-ASK-003a:** Upon image selection, present options to "Extract New Contact" or "Attach to Chat Message".
*   **FR-ASK-004:** Process user queries via the Gemini API (text and image-based).
*   **FR-ASK-005:** Display AI responses in the chat interface.
*   **FR-ASK-006:** Provide "Quick Action" buttons: "Follow up with customers" and "Follow up with prospects".
    *   **FR-ASK-006a:** Clicking these buttons shall trigger a Gemini API call to generate a prioritized list of contacts based on predefined rules (from Settings).
    *   **FR-ASK-006b:** Display the prioritized list within the chat, with options to navigate to contact details.
*   **FR-ASK-007:** Handle loading states appropriately (e.g., skeleton loaders for AI responses).
*   **FR-ASK-008:** Display user avatar/initials.

### 4.3. Contact Confirmation Screen (`app/confirm-contact/page.tsx`)
*   **FR-CONFIRM-001:** Display after AI extracts contact information from an image.
*   **FR-CONFIRM-002:** Show the scanned image (if provided).
*   **FR-CONFIRM-003:** Pre-fill a form with the extracted contact details (Name, Phone, Email, Company, Notes).
*   **FR-CONFIRM-004:** Allow users to verify and edit the extracted information.
*   **FR-CONFIRM-005:** Allow users to save the new contact to the CRM.
*   **FR-CONFIRM-006:** Allow users to cancel and return to the Ask screen.

### 4.4. Follow-Up List Screen (`app/follow-ups/page.tsx`)
*   **FR-FU-LIST-001:** Display a list of contacts requiring follow-up.
*   **FR-FU-LIST-002:** Provide tabs for filtering contacts: "Recent", "Urgent", "Follow Up", "No Answer".
*   **FR-FU-LIST-003:** For each contact, display Name, Phone, Status, and "Call before" time (if applicable).
*   **FR-FU-LIST-004:** Indicate if a contact's follow-up is resolved.
*   **FR-FU-LIST-005:** Provide a "Check Details" button for each contact to navigate to their detail screen.

### 4.5. Contact Detail Screen (`app/follow-ups/[contactId]/page.tsx`)
*   **FR-FU-DETAIL-001:** Display detailed information for a selected contact: Name, Status, Phone, Email, Company.
*   **FR-FU-DETAIL-002:** Display "Customer Context" (notes).
    *   **FR-FU-DETAIL-002a:** Provide a button to "Summarize" context using Gemini API. Display AI summary.
*   **FR-FU-DETAIL-003:** Display "Pre Call Script".
    *   **FR-FU-DETAIL-003a:** Provide a button to "Suggest Script" using Gemini API, considering context and script templates from Settings. Display AI-suggested script.
*   **FR-FU-DETAIL-004:** Provide action buttons: "Close" (back to list), "Dial" (to Calling screen), "Next" (to next contact in follow-up list).

### 4.6. Calling Screen (`app/call/[contactId]/page.tsx`)
*   **FR-CALL-001:** Simulate an active call screen for the selected contact.
*   **FR-CALL-002:** Display contact's Name and Avatar/Initial.
*   **FR-CALL-003:** Show a running call duration timer.
*   **FR-CALL-004:** Display the pre-call script for the contact.
*   **FR-CALL-005:** Provide in-call controls: "Speaker" toggle, "Mute/Unmute" toggle.
*   **FR-CALL-006:** Provide an "End Call" button, which navigates to the Post Call Screen.

### 4.7. Post Call Screen (`app/post-call/[contactId]/page.tsx`)
*   **FR-POSTCALL-001:** Display after a call is ended.
*   **FR-POSTCALL-002:** Show a recap of the pre-call script.
*   **FR-POSTCALL-003:** Display call history information (e.g., call duration).
*   **FR-POSTCALL-004:** Provide an option to "Dial Again".
*   **FR-POSTCALL-005:** Provide a textarea for "Post Call Notes".
    *   **FR-POSTCALL-005a:** Provide a button to "Analyze Notes" using Gemini API. Display AI analysis.
*   **FR-POSTCALL-006:** Display "Quick Call Remarks" buttons (configurable in Settings). Clicking a remark appends it to notes.
*   **FR-POSTCALL-007:** Provide action buttons: "Close", "Back", "Save & Next".

### 4.8. Settings Screen (`app/settings/page.tsx`)
*   **FR-SETTINGS-001:** Allow users to view and edit "Follow up with customers rules".
*   **FR-SETTINGS-002:** Allow users to view and edit "Follow up with prospects rules".
*   **FR-SETTINGS-003:** Allow users to view and edit "Script Templates".
*   **FR-SETTINGS-004:** Allow users to manage "Quick Call Remarks" (add new, remove existing).
*   **FR-SETTINGS-005:** Provide a "Save Settings" button (currently logs to console/alerts; persistence is a future consideration).

### 4.9. Navigation
*   **FR-NAV-001:** Provide a bottom navigation bar with links to "Ask", "Follow Up", and "Settings" screens.
*   **FR-NAV-002:** The bottom navigation bar should be visible on the main application screens.

## 5. Technical Requirements

*   **TR-001:** Framework: Next.js (version 14+ with App Router).
*   **TR-002:** UI Library: ShadCN/UI, Tailwind CSS.
*   **TR-003:** Icons: Lucide React.
*   **TR-004:** Authentication: Firebase Authentication (Email/Password).
*   **TR-005:** AI Integration: Gemini API (via Google AI SDK or direct fetch).
*   **TR-006:** State Management: React Context API (`AppContext`, `AuthContext`), `useState`, `useEffect`.
*   **TR-007:** Environment Variables: API keys and Firebase config managed via `.env.local`.
*   **TR-008:** Code Style: Consistent with TypeScript and React best practices.

## 6. Architecture Overview (Next.js)

*   **Directory Structure:**
    *   `app/`: Main application routes using App Router.
        *   `(auth)/login/page.tsx`, `(auth)/signup/page.tsx`: Authentication pages.
        *   `page.tsx` (root): AskScreen.
        *   `confirm-contact/page.tsx`: ContactConfirmationScreen.
        *   `follow-ups/page.tsx`: FollowUpListScreen.
        *   `follow-ups/[contactId]/page.tsx`: ContactDetailScreen.
        *   `call/[contactId]/page.tsx`: CallingScreen.
        *   `post-call/[contactId]/page.tsx`: PostCallScreen.
        *   `settings/page.tsx`: SettingsScreen.
        *   `layout.tsx`: Root layout including providers and global styles.
    *   `components/`: Shared React components.
        *   `ui/`: ShadCN/UI components.
        *   `BottomNav.tsx`
        *   `ProtectedRoute.tsx`
    *   `contexts/`: Global state management.
        *   `AppContext.tsx`
        *   `AuthContext.tsx`
    *   `lib/`: Utility functions.
        *   `firebase.ts`: Firebase initialization and auth helpers.
        *   `gemini.ts`: Gemini API call helper.
        *   `utils.ts`: ShadCN/UI `cn` utility.
    *   `public/`: Static assets.

*   **Component Responsibilities:**
    *   Page components (`app/**/page.tsx`) will handle route-level logic and compose screen UIs.
    *   Client Components (`"use client"`) will be used for interactive elements and client-side state.
    *   Server Components will be considered for data fetching where applicable (though current app is heavily client-side).

*   **Data Flow:**
    *   Authentication state managed by `AuthContext` and Firebase.
    *   Application state (contacts, settings, UI state) managed by `AppContext`.
    *   Navigation handled by Next.js Router (`useRouter`, `usePathname`, `Link`) and `navigateTo` from `AppContext`.

## 7. Firebase SSO Integration Plan

*   **Client-Side Setup:**
    *   Initialize Firebase app in `lib/firebase.ts` using environment variables.
    *   Use `firebase/auth` functions for sign-up, sign-in.
*   **Auth Flow:**
    *   User navigates to `/login` or `/signup`.
    *   Submits credentials.
    *   `AuthContext` calls Firebase auth functions.
    *   `onAuthStateChanged` listener in `AuthContext` updates user state.
    *   `ProtectedRoute` component and `useEffect` hooks in login/signup pages handle redirection based on auth state.
*   **Server-Side (Future):** If admin operations or custom token minting is needed, Firebase Admin SDK can be used in API Routes.

## 8. Key Next.js Code Snippets (Illustrative - actual code created)

*   **`app/layout.tsx`:**
    ```tsx
    // ... imports ...
    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body className={...}>
            <AuthProvider>
              <AppProvider>
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <main className="flex-grow">{children}</main>
                    <BottomNav />
                  </div>
                </ProtectedRoute>
              </AppProvider>
            </AuthProvider>
          </body>
        </html>
      );
    }
    ```
*   **`lib/firebase.ts`:** (As created)
*   **`contexts/AuthContext.tsx`:** (As created)
*   **Example Page (`app/page.tsx`):** (As created, using client components and hooks)

## 9. Non-Functional Requirements

*   **NFR-001 (Performance):** Application should load quickly and respond promptly to user interactions.
*   **NFR-002 (Usability):** UI should be intuitive and match the provided design screenshots.
*   **NFR-003 (Maintainability):** Code should be well-organized, commented where necessary, and follow Next.js/React best practices.
*   **NFR-004 (Responsiveness):** Application should be responsive and adapt to mobile screen sizes (max-width: md as per original styling).

## 10. Future Considerations

*   **Database Persistence:** Currently, contacts and settings are in-memory. Integrate Firestore or another database for persistence.
*   **Real-time Features:** Consider Firebase Realtime Database or Firestore listeners for real-time updates if needed.
*   **Advanced Error Handling:** Implement more robust error handling and user feedback mechanisms.
*   **Testing:** Introduce unit and integration tests.
*   **Full ShadCN/UI CLI Integration:** Resolve issues with `shadcn-ui add` to streamline component management.
*   **Server-Side Data Fetching:** Explore opportunities to use Next.js server components for initial data loads.
*   **Sign Out UI:** Add a visible sign-out button.
*   **API Key Security:** Move Gemini API calls to a Next.js API route if client-side key exposure is a concern.
