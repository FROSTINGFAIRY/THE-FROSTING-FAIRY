import React, { useState, useEffect, useId } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Search, 
  RefreshCw, 
  Trash2, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  User as UserIcon, 
  Clock, 
  Tag, 
  Plus, 
  Lock, 
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Loader2,
  Archive,
  Star,
  CornerUpLeft,
  Eye,
  FileCheck
} from 'lucide-react';
import { 
  connectGmailAccount, 
  getGmailToken, 
  setGmailToken, 
  getGmailProfile, 
  listGmailMessages, 
  getGmailMessage, 
  sendGmailEmail, 
  trashGmailMessage, 
  createGmailDraft,
  generateBakeryOrderReceiptHtml, 
  generateBakeryStatusUpdateHtml,
  GmailProfile, 
  GmailMessageItem 
} from '../lib/gmail';
import { MealPlanEntry } from '../types';

interface GmailHubProps {
  websiteName: string;
  websiteSlogan: string;
  mealPlan: MealPlanEntry[];
  currentRole: 'admin' | 'chef' | 'viewer';
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  addAuditLog?: (action: string, type?: 'info' | 'success' | 'warning') => void;
  preselectedOrder?: MealPlanEntry | null;
  onClearPreselectedOrder?: () => void;
}

export function GmailHub({
  websiteName,
  websiteSlogan,
  mealPlan,
  currentRole,
  addToast,
  addAuditLog = () => {},
  preselectedOrder,
  onClearPreselectedOrder,
}: GmailHubProps) {
  // Authentication & Token State
  const [token, setToken] = useState<string | null>(getGmailToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [profile, setProfile] = useState<GmailProfile | null>(null);

  // Mailbox State
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageItem | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'orders' | 'sent' | 'starred' | 'drafts'>('inbox');

  // Composer State
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [selectedOrderForTemplate, setSelectedOrderForTemplate] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');

  // AI Assistant State
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Warm, sweet, and artisanal');
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  // Mandatory Confirmation Dialog State (Destructive / Sending Operations)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'send' | 'trash' | 'draft';
    title: string;
    description: string;
    detailsList?: string[];
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Unique IDs for form accessibility
  const selectOrderId = useId();
  const selectTemplateId = useId();
  const recipientEmailId = useId();
  const emailCcId = useId();
  const emailSubjectId = useId();
  const aiToneId = useId();
  const aiTopicId = useId();
  const emailMessageId = useId();

  // If a preselected order was passed in from the orders queue, open composer with receipt template
  useEffect(() => {
    if (preselectedOrder) {
      setIsComposing(true);
      setSelectedOrderForTemplate(preselectedOrder.id);
      setSelectedTemplate('receipt');
      const custName = preselectedOrder.customerName || preselectedOrder.contactName || 'Valued Customer';
      const cleanEmail = preselectedOrder.contactEmail || 
        (preselectedOrder.customerName ? `${preselectedOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com` : '');
      setComposeTo(cleanEmail);
      setComposeSubject(`Your Artisanal Confection Receipt #${preselectedOrder.id} - ${websiteName} 🎂`);
      
      const receiptHtml = generateBakeryOrderReceiptHtml({
        websiteName,
        websiteSlogan,
        orderId: preselectedOrder.id,
        customerName: custName,
        cakeType: preselectedOrder.cakeType,
        price: preselectedOrder.estimatedPrice || '45.00',
        flavor: preselectedOrder.flavor,
        weight: preselectedOrder.weight,
        message: preselectedOrder.message,
        pickupDate: preselectedOrder.pickupDate,
        pickupTime: preselectedOrder.pickupTime,
        deliveryType: preselectedOrder.deliveryType,
        deliveryAddress: preselectedOrder.deliveryAddress,
        paymentMethod: preselectedOrder.paymentMethod || 'UPI / Card',
        boxContents: preselectedOrder.boxContents,
      });
      setComposeBody(receiptHtml);
    }
  }, [preselectedOrder, websiteName, websiteSlogan]);

  // Load Profile when token is available
  useEffect(() => {
    if (token) {
      loadProfileAndInbox(token);
    }
  }, [token]);

  const handleConnectGmail = async () => {
    setIsAuthenticating(true);
    try {
      const res = await connectGmailAccount();
      setToken(res.accessToken);
      setGmailToken(res.accessToken);
      addAuditLog(`Connected Gmail integration for ${res.user.email}`, 'success');
      addToast('Gmail Connected', `Successfully connected as ${res.user.email}`, 'success');
    } catch (err: any) {
      console.error('Gmail Auth error:', err);
      addToast('Connection Error', err?.message || 'Failed to authenticate with Google Gmail.', 'warning');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadProfileAndInbox = async (authToken: string) => {
    setIsLoadingMessages(true);
    try {
      const prof = await getGmailProfile(authToken);
      if (prof) {
        setProfile(prof);
      }
      await fetchFolderMessages(authToken, activeFolder, searchQuery);
    } catch (err: any) {
      console.error('Error loading Gmail data:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const fetchFolderMessages = async (authToken: string, folder: string, queryStr: string = '') => {
    setIsLoadingMessages(true);
    try {
      let q = queryStr;
      if (folder === 'inbox') {
        q = q ? `in:inbox ${q}` : 'in:inbox';
      } else if (folder === 'orders') {
        const orderTerms = '(cake OR pastry OR order OR frosting OR confection OR booking OR quote)';
        q = q ? `in:inbox ${orderTerms} ${q}` : `in:inbox ${orderTerms}`;
      } else if (folder === 'sent') {
        q = q ? `in:sent ${q}` : 'in:sent';
      } else if (folder === 'starred') {
        q = q ? `is:starred ${q}` : 'is:starred';
      } else if (folder === 'drafts') {
        q = q ? `is:draft ${q}` : 'is:draft';
      }

      const listRes = await listGmailMessages(authToken, q, 15);
      if (listRes.messages && listRes.messages.length > 0) {
        // Fetch message details in parallel (max 10)
        const detailsPromises = listRes.messages.slice(0, 10).map((m) => getGmailMessage(authToken, m.id));
        const resolved = await Promise.all(detailsPromises);
        const validMessages = resolved.filter((m): m is GmailMessageItem => m !== null);
        setMessages(validMessages);
        if (validMessages.length > 0 && !selectedMessage) {
          setSelectedMessage(validMessages[0]);
        }
      } else {
        setMessages([]);
        setSelectedMessage(null);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      addToast('Sync Warning', 'Could not refresh Gmail messages. Please check authorization.', 'warning');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSelectMessage = async (msg: GmailMessageItem) => {
    setSelectedMessage(msg);
    if (!msg.bodyHtml && token) {
      setIsLoadingDetail(true);
      try {
        const full = await getGmailMessage(token, msg.id);
        if (full) {
          setSelectedMessage(full);
        }
      } finally {
        setIsLoadingDetail(false);
      }
    }
  };

  const handleApplyTemplate = (tplKey: string, orderId?: string) => {
    setSelectedTemplate(tplKey);
    const targetOrder = mealPlan.find((o) => o.id === (orderId || selectedOrderForTemplate)) || mealPlan[0];
    const customerName = targetOrder?.customerName || targetOrder?.contactName || 'Valued Customer';
    const cleanEmail = targetOrder?.contactEmail || (targetOrder?.customerName ? `${targetOrder.customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com` : '');

    if (tplKey === 'receipt') {
      if (!targetOrder) {
        addToast('No Order Selected', 'Please select an order from the dropdown to apply receipt template.', 'info');
        return;
      }
      setComposeSubject(`Bespoke Confection Receipt #${targetOrder.id} - ${websiteName} 🎂`);
      setComposeTo(cleanEmail || composeTo);
      setComposeBody(generateBakeryOrderReceiptHtml({
        websiteName,
        websiteSlogan,
        orderId: targetOrder.id,
        customerName,
        cakeType: targetOrder.cakeType,
        price: targetOrder.estimatedPrice || '45.00',
        flavor: targetOrder.flavor,
        weight: targetOrder.weight,
        message: targetOrder.message,
        pickupDate: targetOrder.pickupDate,
        pickupTime: targetOrder.pickupTime,
        deliveryType: targetOrder.deliveryType,
        deliveryAddress: targetOrder.deliveryAddress,
        paymentMethod: targetOrder.paymentMethod || 'UPI / Card',
        boxContents: targetOrder.boxContents,
      }));
    } else if (tplKey === 'baking') {
      setComposeSubject(`We are baking your artisanal order #${targetOrder?.id || 'Update'}! 🥣✨`);
      setComposeBody(generateBakeryStatusUpdateHtml({
        websiteName,
        orderId: targetOrder?.id || 'GUSTO-01',
        customerName,
        cakeType: targetOrder?.cakeType || 'Custom Celebration Cake',
        status: 'Baking',
        customNote: 'Our master chefs have prepared the organic batter and the oven is preheated to perfection.',
      }));
    } else if (tplKey === 'ready') {
      setComposeSubject(`Your sweet creation is ready for pickup! 🏪🎂`);
      setComposeBody(generateBakeryStatusUpdateHtml({
        websiteName,
        orderId: targetOrder?.id || 'GUSTO-01',
        customerName,
        cakeType: targetOrder?.cakeType || 'Custom Cake',
        status: 'Ready for Pickup',
        customNote: 'Your pastry has been boxed in our signature keepsake packaging with satin ribbon.',
      }));
    } else if (tplKey === 'quote') {
      setComposeSubject(`Custom Cake Consultation & Quote - ${websiteName} 🍰`);
      setComposeBody(`
        <div style="font-family:sans-serif; color:#3b2219; padding:20px; background:#fffbf9; border-radius:12px; border:1px solid #fae6dc;">
          <h2 style="color:#c43864;">Warm greetings from ${websiteName}! 🎂</h2>
          <p>Thank you for reaching out regarding your custom celebration dessert!</p>
          <p>We would love to handcraft a one-of-a-kind creation for your celebration. Based on your preferences, we can offer customized tier structuring, organic fillings, and handcrafted sugar flowers.</p>
          <p>Please let us know your preferred date and guest count so we can reserve our baking calendar.</p>
          <p style="margin-top:20px; font-weight:bold; color:#c43864;">The Frosting Fairy Artisanal Team</p>
        </div>
      `.trim());
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!aiTopic && !selectedMessage) {
      addToast('Topic Required', 'Please type a short topic or purpose for the AI assistant.', 'info');
      return;
    }

    setIsAiDrafting(true);
    try {
      const response = await fetch('/api/ai-draft-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          topic: aiTopic || `Reply to customer email about: ${selectedMessage?.subject}`,
          customerName: composeTo.split('@')[0] || selectedMessage?.from || 'Valued Customer',
          orderDetails: selectedOrderForTemplate ? `Order #${selectedOrderForTemplate}` : '',
          tone: aiTone,
          previousMessage: selectedMessage ? selectedMessage.snippet || selectedMessage.bodyText : '',
        }),
      });

      if (!response.ok) {
        throw new Error('AI Assistant was unable to complete the draft.');
      }

      const data = await response.json();
      if (data.subject) setComposeSubject(data.subject);
      if (data.bodyHtml) setComposeBody(data.bodyHtml);

      setShowAiAssistant(false);
      addToast('AI Draft Ready', 'Generated a sweet, professional email response with Gemini!', 'success');
    } catch (err: any) {
      console.warn('AI Draft error:', err);
      // Client-side fallback template
      setComposeSubject(`A Sweet Message regarding your Inquiry - ${websiteName} 🧁`);
      setComposeBody(`
        <div style="font-family:sans-serif; color:#3b2219; padding:20px;">
          <h2 style="color:#c43864;">Hello from ${websiteName},</h2>
          <p>Thank you for connecting with us! We would love to assist you with your inquiry regarding: <strong>${aiTopic || 'custom baked confections'}</strong>.</p>
          <p>Every creation is handcrafted with premium ingredients and tailored to your celebration.</p>
          <p>Please feel free to reply with any additional details!</p>
          <p>Sweet regards,<br><strong>${websiteName} Team</strong></p>
        </div>
      `);
      addToast('AI Template Loaded', 'Loaded custom draft into the editor.', 'info');
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Trigger Send Email with mandatory user confirmation dialog
  const promptSendEmail = () => {
    if (currentRole === 'viewer') {
      addToast('Permission Denied', 'Viewer role cannot dispatch emails.', 'warning');
      return;
    }
    if (!token) {
      addToast('Not Connected', 'Please connect your Google account first.', 'warning');
      return;
    }
    if (!composeTo.trim()) {
      addToast('Recipient Missing', 'Please enter a valid recipient email address.', 'warning');
      return;
    }
    if (!composeSubject.trim()) {
      addToast('Subject Missing', 'Please provide an email subject line.', 'warning');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      type: 'send',
      title: 'Confirm Email Dispatch via Gmail API',
      description: 'You are about to send an official email from your authorized Gmail account. Please review the details before confirming.',
      detailsList: [
        `Recipient: ${composeTo}`,
        composeCc ? `Cc: ${composeCc}` : '',
        `Subject: ${composeSubject}`,
        `Sender: ${profile?.emailAddress || 'The Frosting Fairy'}`,
      ].filter(Boolean),
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          const res = await sendGmailEmail(token, {
            to: composeTo,
            cc: composeCc || undefined,
            subject: composeSubject,
            bodyHtml: composeBody || `<p>${composeSubject}</p>`,
            fromName: websiteName,
            fromEmail: profile?.emailAddress,
          });

          addAuditLog(`Sent Gmail to ${composeTo}: "${composeSubject}" (Message ID: ${res.id})`, 'success');
          addToast('Email Dispatched', `Successfully sent to ${composeTo} via Gmail!`, 'success');

          // Reset composer state
          setIsComposing(false);
          setComposeTo('');
          setComposeCc('');
          setComposeSubject('');
          setComposeBody('');
          if (onClearPreselectedOrder) onClearPreselectedOrder();

          // Refresh Sent folder
          fetchFolderMessages(token, 'sent');
        } catch (err: any) {
          console.error('Failed to send email:', err);
          addToast('Dispatch Error', err?.message || 'Failed to dispatch email via Gmail API.', 'warning');
        } finally {
          setIsProcessingAction(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Trigger Trash Message with mandatory confirmation dialog
  const promptTrashMessage = (msg: GmailMessageItem) => {
    if (currentRole === 'viewer') {
      addToast('Permission Denied', 'Viewer role cannot modify Gmail messages.', 'warning');
      return;
    }
    if (!token) return;

    setConfirmDialog({
      isOpen: true,
      type: 'trash',
      title: 'Move Email to Gmail Trash?',
      description: `Are you sure you want to move message "${msg.subject}" from ${msg.from} to the Gmail Trash folder?`,
      detailsList: [
        `Subject: ${msg.subject}`,
        `From: ${msg.from}`,
        `Date: ${msg.date || 'Recent'}`,
      ],
      onConfirm: async () => {
        setIsProcessingAction(true);
        try {
          const ok = await trashGmailMessage(token, msg.id);
          if (ok) {
            addAuditLog(`Moved Gmail message #${msg.id} ("${msg.subject}") to Trash`, 'info');
            addToast('Moved to Trash', 'Email has been moved to Gmail Trash.', 'info');
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            if (selectedMessage?.id === msg.id) {
              setSelectedMessage(null);
            }
          } else {
            throw new Error('Could not trash message.');
          }
        } catch (err: any) {
          addToast('Action Error', err?.message || 'Failed to trash email.', 'warning');
        } finally {
          setIsProcessingAction(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  return (
    <div id="gmail-hub-container" className="space-y-6 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-cocoa via-brand-cocoa-light to-brand-cocoa text-white p-6 sm:p-8 rounded-3xl border border-brand-cocoa-border shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand-pink/20 text-brand-pink border border-brand-pink/30 flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-widest">
              <Mail className="w-3.5 h-3.5" />
              <span>Official Google Workspace Integration</span>
            </span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white flex items-center gap-2">
            <span>Gmail Bakery Communications</span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-cream-light/80 leading-relaxed font-sans">
            Connect your bakery's Google account to review customer cake inquiries, dispatch branded receipts, notify clients of baking milestones, and compose artisanal updates directly from Gmail.
          </p>
        </div>

        {/* Auth Status / Connect Button */}
        <div className="relative z-10 flex flex-col items-start md:items-end gap-3 shrink-0">
          {token && profile ? (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right space-y-1.5 min-w-[240px]">
              <div className="flex items-center justify-end gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[200px]">{profile.emailAddress}</span>
              </div>
              <p className="text-[10px] text-brand-cream-light/70 font-mono">
                {profile.messagesTotal.toLocaleString()} total messages in mailbox
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => loadProfileAndInbox(token)}
                  disabled={isLoadingMessages}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Refresh Gmail"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  <span>Sync Mailbox</span>
                </button>
                <button
                  onClick={() => {
                    setToken(null);
                    setGmailToken(null);
                    setProfile(null);
                    setMessages([]);
                    setSelectedMessage(null);
                    addToast('Disconnected', 'Disconnected Gmail account.', 'info');
                  }}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnectGmail}
              disabled={isAuthenticating}
              className="px-5 py-3 bg-white hover:bg-brand-cream-light text-brand-cocoa font-sans font-bold text-xs sm:text-sm rounded-2xl shadow-lg border border-brand-cocoa-border hover:shadow-xl transition-all flex items-center gap-3 cursor-pointer group shrink-0"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting to Gmail...' : 'Connect Bakery Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Mailbox Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Folder Nav & Quick Order Dispatch (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Action Button: Compose New Email */}
          <button
            onClick={() => {
              setIsComposing(true);
              setSelectedTemplate('custom');
            }}
            className="w-full py-3.5 px-4 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-2xl font-sans font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Email</span>
          </button>

          {/* Folder Navigation Menu */}
          <div className="bg-white rounded-2xl border border-brand-cocoa-border shadow-xs p-3 space-y-1">
            <button
              onClick={() => {
                setActiveFolder('inbox');
                if (token) fetchFolderMessages(token, 'inbox', searchQuery);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFolder === 'inbox'
                  ? 'bg-brand-pink-light/60 text-brand-pink-dark border border-brand-pink-accent/20'
                  : 'text-brand-cocoa hover:bg-brand-cream-light'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-brand-pink" />
                <span>Inbox</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white text-brand-cocoa-light border border-brand-cocoa-border/40">
                Live
              </span>
            </button>

            <button
              onClick={() => {
                setActiveFolder('orders');
                if (token) fetchFolderMessages(token, 'orders', searchQuery);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFolder === 'orders'
                  ? 'bg-brand-pink-light/60 text-brand-pink-dark border border-brand-pink-accent/20'
                  : 'text-brand-cocoa hover:bg-brand-cream-light'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">🎂</span>
                <span>Cake & Order Inquiries</span>
              </div>
              <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-brand-pink text-white font-bold">
                Filtered
              </span>
            </button>

            <button
              onClick={() => {
                setActiveFolder('sent');
                if (token) fetchFolderMessages(token, 'sent', searchQuery);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFolder === 'sent'
                  ? 'bg-brand-pink-light/60 text-brand-pink-dark border border-brand-pink-accent/20'
                  : 'text-brand-cocoa hover:bg-brand-cream-light'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-brand-pink" />
                <span>Sent Confection Receipts</span>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveFolder('starred');
                if (token) fetchFolderMessages(token, 'starred', searchQuery);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFolder === 'starred'
                  ? 'bg-brand-pink-light/60 text-brand-pink-dark border border-brand-pink-accent/20'
                  : 'text-brand-cocoa hover:bg-brand-cream-light'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>VIP & Starred</span>
              </div>
            </button>
          </div>

          {/* Quick Dispatch from Active Orders Pipeline */}
          <div className="bg-white rounded-2xl border border-brand-cocoa-border shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-brand-cocoa flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-brand-pink" />
                <span>Quick Order Receipts</span>
              </h4>
              <span className="font-mono text-[9px] text-brand-cocoa-light font-bold">
                {mealPlan.length} Active
              </span>
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {mealPlan.slice(0, 5).map((order) => (
                <div
                  key={`quick-mail-order-${order.id}`}
                  className="p-2.5 bg-brand-cream-light/40 hover:bg-brand-pink-light/20 rounded-xl border border-brand-cocoa-border/40 transition-all text-xs flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 truncate">
                    <span className="font-bold text-brand-cocoa block truncate">
                      #{order.id} • {order.customerName || order.contactName || 'Valued Customer'}
                    </span>
                    <span className="text-[10px] text-brand-cocoa-light block truncate">
                      {order.cakeType} ({order.estimatedPrice || '₹45'})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsComposing(true);
                      setSelectedOrderForTemplate(order.id);
                      handleApplyTemplate('receipt', order.id);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-brand-pink hover:text-white text-brand-pink-dark border border-brand-pink/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer shrink-0 shadow-3xs"
                    title="Send Gmail Receipt for this order"
                  >
                    Send Receipt
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Messages List & Detail Viewer or Composer (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Refresh Toolbar */}
          <div className="bg-white p-3 rounded-2xl border border-brand-cocoa-border shadow-xs flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-cocoa-light absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search messages by customer name, order number, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && token) {
                    fetchFolderMessages(token, activeFolder, searchQuery);
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-brand-cream-light/30 border border-brand-cocoa-border/40 rounded-xl text-brand-cocoa focus:outline-none focus:ring-1 focus:ring-brand-pink"
              />
            </div>
            <button
              onClick={() => token && fetchFolderMessages(token, activeFolder, searchQuery)}
              className="px-3 py-2 bg-brand-cream-light/60 hover:bg-brand-cream-light text-brand-cocoa border border-brand-cocoa-border/40 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

          {/* COMPOSER VIEW */}
          {isComposing ? (
            <div className="bg-white rounded-3xl border border-brand-cocoa-border shadow-md overflow-hidden animate-fade-in">
              {/* Composer Header */}
              <div className="bg-brand-cream-light/60 px-6 py-4 border-b border-brand-cocoa-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-brand-pink text-white">
                    <Mail className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-brand-cocoa uppercase tracking-wider">
                      Compose Gmail Message
                    </h3>
                    <p className="text-[10px] text-brand-cocoa-light">
                      Sending from: <strong>{profile?.emailAddress || 'The Frosting Fairy Bakery'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAiAssistant(!showAiAssistant)}
                    className="px-3 py-1.5 bg-brand-pink-light/70 hover:bg-brand-pink-light text-brand-pink-dark border border-brand-pink-accent/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
                    <span>AI Assistant (Gemini)</span>
                  </button>
                  <button
                    onClick={() => setIsComposing(false)}
                    className="p-1.5 hover:bg-brand-cream text-brand-cocoa-light hover:text-brand-cocoa rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI Assistant Drawer */}
              {showAiAssistant && (
                <div className="bg-gradient-to-r from-brand-pink-light/30 via-brand-cream-light/40 to-brand-pink-light/30 p-4 border-b border-brand-pink/20 space-y-3 text-xs text-brand-cocoa">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase font-bold text-brand-pink flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-brand-pink" />
                      <span>Gemini Confectionary Assistant</span>
                    </span>
                    <span className="text-[10px] text-brand-cocoa-light">
                      Drafts bespoke, polite bakery replies in seconds
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor={aiTopicId} className="block text-[10px] font-bold text-brand-cocoa mb-1">
                        What would you like to say?
                      </label>
                      <input
                        id={aiTopicId}
                        type="text"
                        placeholder="e.g. Confirm chocolate cake booking, thank for inquiry, explain allergy policy..."
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-brand-cocoa-border rounded-xl"
                      />
                    </div>
                    <div>
                      <label htmlFor={aiToneId} className="block text-[10px] font-bold text-brand-cocoa mb-1">
                        Tone
                      </label>
                      <select
                        id={aiToneId}
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-brand-cocoa-border rounded-xl cursor-pointer"
                      >
                        <option value="Warm, sweet, and artisanal">Warm & Artisanal 🧁</option>
                        <option value="Formal, professional, and elegant">Formal & Royal 👑</option>
                        <option value="Cheerful, celebratory, and excited">Cheerful & Party 🎉</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerateAiDraft}
                      disabled={isAiDrafting}
                      className="px-4 py-1.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isAiDrafting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating Draft...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Email Draft</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Template Selector Bar */}
              <div className="bg-brand-cream-light/30 px-6 py-2.5 border-b border-brand-cocoa-border/40 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[9px] font-bold uppercase text-brand-cocoa-light">
                  Quick Templates:
                </span>
                <select
                  id={selectTemplateId}
                  value={selectedTemplate}
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-brand-cocoa-border rounded-lg text-xs font-bold text-brand-cocoa cursor-pointer"
                >
                  <option value="custom">✍️ Custom Blank Email</option>
                  <option value="receipt">🧾 Luxury Order Receipt</option>
                  <option value="baking">🥣 Baking in Progress Notice</option>
                  <option value="ready">🏪 Ready for Pickup Alert</option>
                  <option value="quote">🍰 Custom Cake Consultation</option>
                </select>

                {/* If template is order-related, show order picker */}
                {(selectedTemplate === 'receipt' || selectedTemplate === 'baking' || selectedTemplate === 'ready') && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <label htmlFor={selectOrderId} className="text-[10px] text-brand-cocoa-light font-bold">
                      Order:
                    </label>
                    <select
                      id={selectOrderId}
                      value={selectedOrderForTemplate}
                      onChange={(e) => {
                        setSelectedOrderForTemplate(e.target.value);
                        handleApplyTemplate(selectedTemplate, e.target.value);
                      }}
                      className="px-2 py-1 bg-white border border-brand-cocoa-border rounded-lg text-xs font-medium text-brand-cocoa cursor-pointer"
                    >
                      {mealPlan.map((o) => (
                        <option key={`opt-order-${o.id}`} value={o.id}>
                          #{o.id} - {o.customerName || o.contactName || 'Customer'} ({o.cakeType})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Composer Form Fields */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor={recipientEmailId} className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light block">
                      To (Recipient Email) *
                    </label>
                    <input
                      id={recipientEmailId}
                      type="email"
                      placeholder="e.g. client@example.com"
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-brand-cocoa-border rounded-xl text-brand-cocoa font-medium focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={emailCcId} className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light block">
                      Cc (Optional)
                    </label>
                    <input
                      id={emailCcId}
                      type="email"
                      placeholder="e.g. bakery-staff@example.com"
                      value={composeCc}
                      onChange={(e) => setComposeCc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-brand-cocoa-border rounded-xl text-brand-cocoa font-medium focus:ring-1 focus:ring-brand-pink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor={emailSubjectId} className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light block">
                    Subject Line *
                  </label>
                  <input
                    id={emailSubjectId}
                    type="text"
                    placeholder="Subject..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-brand-cocoa-border rounded-xl text-brand-cocoa font-bold text-brand-pink focus:ring-1 focus:ring-brand-pink focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor={emailMessageId} className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light block">
                      Message Content (HTML / Text)
                    </label>
                    <span className="text-[9px] text-brand-cocoa-light font-mono">
                      Rich luxury template formatted
                    </span>
                  </div>
                  <textarea
                    id={emailMessageId}
                    rows={10}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Type your message or use templates above..."
                    className="w-full p-3 text-xs bg-brand-cream-light/10 border border-brand-cocoa-border rounded-xl text-brand-cocoa font-mono focus:ring-1 focus:ring-brand-pink focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Composer Footer Actions */}
              <div className="bg-brand-cream-light/30 px-6 py-4 border-t border-brand-cocoa-border/40 flex items-center justify-between">
                <button
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 bg-white hover:bg-brand-cream-light text-brand-cocoa border border-brand-cocoa-border rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={promptSendEmail}
                    className="px-6 py-2.5 bg-brand-pink hover:bg-brand-pink-dark text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via Gmail</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* MESSAGE LIST & READER SPLIT VIEW */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Message List (5 Cols) */}
              <div className="md:col-span-5 bg-white rounded-2xl border border-brand-cocoa-border shadow-xs p-3 space-y-2 max-h-[640px] overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1 border-b border-brand-cocoa-border/40">
                  <span className="font-mono text-[9px] uppercase font-bold text-brand-cocoa-light">
                    {activeFolder.toUpperCase()} ({messages.length})
                  </span>
                  {isLoadingMessages && <Loader2 className="w-3.5 h-3.5 text-brand-pink animate-spin" />}
                </div>

                {!token ? (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-brand-pink-light/40 text-brand-pink flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h4 className="font-display font-bold text-xs uppercase text-brand-cocoa">
                      Gmail Not Connected
                    </h4>
                    <p className="text-[11px] text-brand-cocoa-light leading-relaxed">
                      Click the button above to link your bakery's Google account and access messages securely.
                    </p>
                    <button
                      onClick={handleConnectGmail}
                      className="px-4 py-2 bg-brand-pink text-white rounded-xl font-bold text-xs shadow-xs hover:bg-brand-pink-dark cursor-pointer transition-all"
                    >
                      Connect Gmail
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Inbox className="w-8 h-8 text-brand-cocoa-light/40 mx-auto" />
                    <p className="text-xs font-bold text-brand-cocoa">No messages in this folder</p>
                    <p className="text-[10px] text-brand-cocoa-light">
                      Sync mailbox or search for another query.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    return (
                      <div
                        key={`msg-item-${msg.id}`}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-brand-pink-light/40 border-brand-pink/60 shadow-3xs'
                            : 'bg-white hover:bg-brand-cream-light/40 border-brand-cocoa-border/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-brand-cocoa truncate max-w-[140px]">
                            {msg.from?.replace(/<.*>/, '').trim() || 'Sender'}
                          </span>
                          <span className="font-mono text-[9px] text-brand-cocoa-light shrink-0">
                            {msg.date ? new Date(msg.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>

                        <div className="font-semibold text-xs text-brand-pink truncate">
                          {msg.subject || '(No Subject)'}
                        </div>

                        <p className="text-[10px] text-brand-cocoa-light line-clamp-2 leading-relaxed">
                          {msg.snippet || 'No text snippet'}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Detail Viewer (7 Cols) */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-brand-cocoa-border shadow-xs overflow-hidden flex flex-col min-h-[480px]">
                {selectedMessage ? (
                  <div className="flex-1 flex flex-col">
                    {/* Message Header */}
                    <div className="bg-brand-cream-light/35 p-4 border-b border-brand-cocoa-border/60 space-y-3 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-black text-sm text-brand-cocoa leading-snug">
                          {selectedMessage.subject}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setIsComposing(true);
                              setComposeTo(selectedMessage.from || '');
                              setComposeSubject(`Re: ${selectedMessage.subject}`);
                              setComposeBody(`\n\n--- Original Message from ${selectedMessage.from} ---\n${selectedMessage.snippet || ''}`);
                            }}
                            className="p-1.5 bg-white hover:bg-brand-pink hover:text-white text-brand-cocoa border border-brand-cocoa-border rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                            title="Reply to this message"
                          >
                            <CornerUpLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => promptTrashMessage(selectedMessage)}
                            className="p-1.5 bg-white hover:bg-red-50 text-brand-cocoa-light hover:text-red-600 border border-brand-cocoa-border rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs space-y-1 text-brand-cocoa">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-brand-cocoa-light uppercase w-10">
                            From:
                          </span>
                          <span className="font-semibold text-brand-cocoa truncate">
                            {selectedMessage.from}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-brand-cocoa-light uppercase w-10">
                            Date:
                          </span>
                          <span className="font-mono text-[10px] text-brand-cocoa-light">
                            {selectedMessage.date || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 p-5 overflow-y-auto max-h-[460px] text-left text-xs leading-relaxed text-brand-cocoa font-sans">
                      {isLoadingDetail ? (
                        <div className="flex items-center justify-center p-12 text-brand-cocoa-light">
                          <Loader2 className="w-6 h-6 animate-spin text-brand-pink mr-2" />
                          <span>Loading message contents...</span>
                        </div>
                      ) : selectedMessage.bodyHtml ? (
                        <div
                          className="prose prose-sm max-w-none text-brand-cocoa"
                          dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap">{selectedMessage.bodyText || selectedMessage.snippet}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-brand-cocoa-light">
                    <Mail className="w-10 h-10 text-brand-cocoa-light/40 mb-2" />
                    <p className="font-bold text-xs text-brand-cocoa">Select an email to read</p>
                    <p className="text-[10px] text-brand-cocoa-light mt-1 max-w-xs">
                      Click any conversation from the list to view the full message details and reply.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION DIALOG (Per Workspace Skill requirement) */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-brand-cocoa/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-brand-cocoa-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl text-left">
            <div className="bg-brand-cream-light/80 border-b border-brand-cocoa-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  confirmDialog.type === 'trash' ? 'bg-red-100 text-red-600' : 'bg-brand-pink-light text-brand-pink'
                }`}>
                  {confirmDialog.type === 'trash' ? <Trash2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-brand-cocoa uppercase tracking-wider">
                    {confirmDialog.title}
                  </h4>
                  <p className="text-[10px] text-brand-cocoa-light font-mono">
                    Official Workspace Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmDialog(null)}
                className="p-1 rounded-full hover:bg-brand-cream text-brand-cocoa-light transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-brand-cocoa leading-relaxed">
                {confirmDialog.description}
              </p>

              {confirmDialog.detailsList && confirmDialog.detailsList.length > 0 && (
                <div className="p-3.5 bg-brand-cream-light/40 border border-brand-cocoa-border/40 rounded-2xl space-y-1.5 text-xs">
                  {confirmDialog.detailsList.map((item, idx) => (
                    <div key={`confirm-item-${idx}`} className="font-medium text-brand-cocoa font-sans">
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-brand-cream-light/30 px-6 py-4 border-t border-brand-cocoa-border/40 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-xs font-bold text-brand-cocoa hover:text-brand-pink bg-white border border-brand-cocoa-border hover:bg-brand-cream-light rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={isProcessingAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  confirmDialog.type === 'trash'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-brand-pink hover:bg-brand-pink-dark'
                }`}
              >
                {isProcessingAction ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {confirmDialog.type === 'trash' ? <Trash2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Confirm & Proceed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
