'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Trash2, Save, Type, AlignLeft, Mail, Phone, Calendar, 
  Hash, ChevronDown, ChevronUp, CheckCircle2, CheckSquare, Upload, Copy, Settings, ArrowLeft,
  GitBranch, Link2, Share2, BarChart3, Brain, Database, FileSpreadsheet, MessageSquare, Zap, Globe, Sparkle
} from 'lucide-react';
import { updateForm } from './actions';
import ConfirmModal from '@/components/ui/ConfirmModal';

const FIELD_TYPES = [
  { type: 'text', label: 'Short Text', icon: Type },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'email', label: 'Email Address', icon: Mail },
  { type: 'tel', label: 'Phone Number', icon: Phone },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'select', label: 'Dropdown Menu', icon: ChevronDown },
  { type: 'radio', label: 'Radio Choices', icon: CheckCircle2 },
  { type: 'checkbox', label: 'Checkbox (Consent)', icon: CheckSquare },
  { type: 'file', label: 'File Upload', icon: Upload }
];

const SUGGESTIONS = [
  "Chat to create form...",
  "Create a summer camp registration flow...",
  "Design a job application with file upload...",
  "Build a customer feedback survey with ratings...",
  "Create a contact form with email and phone...",
  "Generate a product order form with options...",
  "Create a student registration form...",
  "Build a newsletter sign-up with consent...",
  "Create an event RSVP form with choices..."
];

export default function FormEditor({ 
  formId, 
  initialTitle, 
  initialDescription, 
  initialSlug, 
  initialSchema, 
  initialIsActive = true, 
  initialEndDate = '',
  initialOgImage = '',
  initialClosedMessage = '',
  initialViews = 0,
  initialSubmissions = []
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [slug, setSlug] = useState(initialSlug);
  const [isActive, setIsActive] = useState(initialIsActive);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [ogImage, setOgImage] = useState(initialOgImage);
  const [closedMessage, setClosedMessage] = useState(initialClosedMessage);
  const [fields, setFields] = useState(initialSchema);
  const [activeStepIndex, setActiveStepIndex] = useState(initialSchema.length > 0 ? 0 : -1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('Content');
  const [fieldToDelete, setFieldToDelete] = useState(null);

  // Stats and Submissions States
  const [views, setViews] = useState(initialViews);
  const [submissions, setSubmissions] = useState(initialSubmissions);

  // Mobile Drawer States
  const [isStepsOpen, setIsStepsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Cohere AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Typing suggestions placeholder animation
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const [subCharIdx, setSubCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");

  useEffect(() => {
    let timer;
    const currentSuggestion = SUGGESTIONS[suggestionIdx];
    
    if (isDeleting) {
      if (subCharIdx > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentSuggestion.substring(0, subCharIdx - 1));
          setSubCharIdx(subCharIdx - 1);
        }, 30);
      } else {
        setIsDeleting(false);
        setSuggestionIdx(prev => (prev + 1) % SUGGESTIONS.length);
      }
    } else {
      if (subCharIdx < currentSuggestion.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentSuggestion.substring(0, subCharIdx + 1));
          setSubCharIdx(subCharIdx + 1);
        }, 70);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      }
    }

    return () => clearTimeout(timer);
  }, [subCharIdx, isDeleting, suggestionIdx]);

  const addField = (type = 'text') => {
    const newField = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'radio' ? 'What is your choice?' : 'Your question here...',
      required: false,
      options: type === 'radio' || type === 'select' ? ['Option 1', 'Option 2'] : []
    };
    const updated = [...fields, newField];
    setFields(updated);
    setActiveStepIndex(updated.length - 1);
  };

  const updateActiveField = (updates) => {
    if (activeStepIndex === 'ending' || activeStepIndex === -1) return;
    setFields(fields.map((f, i) => i === activeStepIndex ? { ...f, ...updates } : f));
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    if (updated.length === 0) {
      setActiveStepIndex(-1);
    } else {
      setActiveStepIndex(Math.max(0, index - 1));
    }
  };

  const duplicateField = (index) => {
    const fieldToCopy = fields[index];
    const newField = {
      ...fieldToCopy,
      id: Math.random().toString(36).substr(2, 9),
      label: `${fieldToCopy.label} (Copy)`
    };
    const updated = [...fields.slice(0, index + 1), newField, ...fields.slice(index + 1)];
    setFields(updated);
    setActiveStepIndex(index + 1);
  };

  const downloadCSV = () => {
    if (submissions.length === 0) return;
    const headers = ['Submission Date', ...fields.map(f => f.label)];
    const rows = submissions.map(sub => {
      const date = new Date(sub.createdAt).toLocaleString();
      const rowData = fields.map(f => {
        const val = sub.data[f.label];
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '');
        return `"${strVal.replace(/"/g, '""')}"`;
      });
      return [`"${date}"`, ...rowData].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${slug || 'form'}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const moveField = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    setFields(updated);
    if (activeStepIndex === index) {
      setActiveStepIndex(targetIndex);
    } else if (activeStepIndex === targetIndex) {
      setActiveStepIndex(index);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await updateForm(formId, {
        title,
        description,
        slug,
        schema: JSON.stringify(fields),
        isActive,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        ogImage,
        closedMessage
      });
      setToast('Changes saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError('Error saving form. Make sure your URL slug is unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentFields: fields }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate form.');
      }
      if (data.fields && data.fields.length > 0) {
        setFields(data.fields);
        setActiveStepIndex(0);
        setAiPrompt('');
      } else {
        setAiError('No fields returned. Try again with a different request.');
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const activeField = activeStepIndex !== 'ending' && activeStepIndex !== -1 ? fields[activeStepIndex] : null;
  const conversionRate = views > 0 ? Math.round((submissions.length / views) * 100) : 0;

  return (
    <div className="h-[calc(100vh-62px)] w-full flex flex-col overflow-hidden bg-white font-sans">
      
      {/* 1. TOP NAV PANEL - Replica of Typeform Admin Header */}
      <div className="h-[56px] border-b border-[#E4E8F6] bg-white px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
        
        {/* Left Side: Breadcrumb title (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3">
          <button onClick={() => router.push('/admin')} className="p-1 rounded-md hover:bg-navy/5 text-navy transition-colors shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-custom-text">
            <span className="opacity-60 cursor-pointer hover:underline" onClick={() => router.push('/admin')}>Forms</span>
            <span className="opacity-45">›</span>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="text-[13px] font-bold text-navy bg-transparent border-0 border-b border-transparent hover:border-purple/35 focus:border-purple focus:ring-0 focus:outline-none p-0 w-36 transition-all" 
            />
          </div>
        </div>

        {/* Center Side: Mode Navigation Tabs (Scrollable and flex-1 to prevent overlap) */}
        <div className="flex-1 flex items-center gap-0.5 sm:gap-1.5 overflow-x-auto scrollbar-none min-w-0 px-1.5 sm:px-2 whitespace-nowrap justify-start md:justify-center">
          {['Content', 'Workflow', 'Connect', 'Share', 'Results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all ${activeTab === tab ? 'bg-purple/10 text-purple' : 'text-custom-text hover:bg-light-gray'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Side: Action Control Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="hidden sm:flex items-center gap-2 cursor-pointer bg-[#F8F9FD] px-3.5 py-1.5 rounded-full border border-[#E4E8F6] select-none text-[11px] font-bold">
            <span className="text-navy uppercase tracking-wider">{isActive ? 'Active' : 'Closed'}</span>
            <div className={`w-8 h-4.5 rounded-full relative transition-colors ${isActive ? 'bg-[#28A745]' : 'bg-[#E4E4EB]'}`}>
              <input type="checkbox" className="sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${isActive ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
            </div>
          </label>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="flex items-center gap-1 px-3 sm:px-4.5 py-1.5 bg-purple hover:bg-purple-mid text-white rounded-full text-[11px] sm:text-[12px] font-bold hover:shadow-sm transition-all disabled:opacity-50"
          >
            <Save size={13} strokeWidth={2.5} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 text-[12px] bg-red-50 border-b border-red-100 px-6 py-2 shrink-0 font-semibold">{error}</div>}

      {/* 2. CONDITIONAL TAB VIEWS */}
      {activeTab === 'Content' && (
        <div className="flex flex-1 overflow-hidden min-h-0 w-full items-stretch">
          
          {/* COLUMN 1: Vertical Steps List Panel (Hidden on mobile/tablet) */}
          <div className="hidden md:flex w-[250px] shrink-0 border-r border-[#E4E8F6] bg-[#FBFBFC] p-4 flex-col justify-between overflow-y-auto h-full select-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F2F6] pb-2">
                <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Form Steps</span>
                <button 
                  onClick={() => addField('text')}
                  className="p-1 rounded-full text-purple hover:bg-purple/10 transition-colors"
                  title="Add New Step"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* List of active steps */}
              <div className="flex flex-col gap-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {fields.length === 0 ? (
                  <div className="text-center py-10 text-muted/65 text-[11px] italic">
                    No questions added yet. Click Add to create one.
                  </div>
                ) : (
                  fields.map((field, idx) => {
                    const Icon = FIELD_TYPES.find(ft => ft.type === field.type)?.icon || Type;
                    return (
                      <div 
                        key={field.id}
                        onClick={() => setActiveStepIndex(idx)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${activeStepIndex === idx ? 'bg-purple/10 border-purple/20 text-purple font-bold' : 'bg-white border-transparent hover:bg-light-gray/60 text-custom-text'}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-bold shrink-0 opacity-60">{idx + 1}</span>
                          <div className="shrink-0 p-1 bg-light-gray rounded">
                            <Icon size={12} className="text-navy" />
                          </div>
                          <span className={`text-[11px] truncate text-left ${field.hidden ? 'opacity-40 line-through' : ''}`}>{field.label}</span>
                          {field.hidden && (
                            <span className="text-red-500 shrink-0" title="Hidden Field">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => { e.stopPropagation(); moveField(idx, 'up'); }}
                            className="p-1 rounded hover:bg-purple/15 text-purple disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Up"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button 
                            type="button"
                            disabled={idx === fields.length - 1}
                            onClick={(e) => { e.stopPropagation(); moveField(idx, 'down'); }}
                            className="p-1 rounded hover:bg-purple/15 text-purple disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Move Down"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); duplicateField(idx); }}
                            className="p-1 rounded hover:bg-purple/15 text-purple"
                            title="Duplicate"
                          >
                            <Copy size={11} />
                          </button>
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setFieldToDelete(idx); }}
                            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Delete Field"
                          >
                            <Trash2 size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Outro success screen configuration */}
            <div className="border-t border-[#F1F2F6] pt-3 mt-3">
              <div 
                onClick={() => setActiveStepIndex('ending')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${activeStepIndex === 'ending' ? 'bg-purple/10 border-purple/20 text-purple font-bold' : 'bg-white border-transparent hover:bg-light-gray/60 text-custom-text'}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 text-gold">★</span>
                <div className="shrink-0 p-1 bg-light-gray rounded">
                  <svg className="w-3.5 h-3.5 text-navy" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                </div>
                <span className="text-[11px] font-semibold">Endings Page</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Canvas Center Preview Panel */}
          <div className="flex-1 bg-[#F4F5F7] p-4 sm:p-8 flex flex-col justify-between overflow-y-auto h-full select-text min-w-0 relative">
            
            {/* LARGE FORM TITLE INPUT */}
            <div className="max-w-3xl mx-auto w-full mb-4 sm:mb-6 shrink-0 sticky top-0 z-10 bg-[#F4F5F7] pt-4 pb-2 shadow-[0_10px_10px_-10px_#F4F5F7]">
              <textarea 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="text-[20px] sm:text-[24px] font-bold text-navy bg-transparent border-0 border-b-2 border-transparent hover:border-[#E4E8F6] focus:border-purple focus:ring-0 focus:outline-none p-2 w-full text-center transition-all placeholder-navy/30 resize-none overflow-hidden" 
                placeholder="Enter Form Title..."
                rows={2}
              />
            </div>

            {activeStepIndex === -1 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-full bg-purple/5 flex items-center justify-center text-[#A0A4CD]">
                  <Plus size={28} />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-navy mb-1 font-serif">Workspace is Empty</h4>
                  <p className="text-[12px] text-muted leading-relaxed">Add a step on the left steps list or type in the AI generate bar below to construct the entire form automatically.</p>
                </div>
                <button 
                  onClick={() => addField('text')}
                  className="px-5 py-2 bg-purple text-white font-bold text-[12px] rounded-full hover:bg-purple-mid transition-all shadow-sm"
                >
                  Add First Question
                </button>
              </div>
            ) : (
              <div className="bg-white border border-[#E4E8F6] rounded-[24px] shadow-sm p-6 sm:p-12 flex-1 flex flex-col justify-between max-w-3xl mx-auto w-full min-h-fit md:min-h-[460px] relative group/canvas">
                {activeStepIndex !== 'ending' && (
                  <button 
                    type="button" 
                    onClick={() => setFieldToDelete(activeStepIndex)}
                    className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm" 
                    title="Delete Field"
                  >
                    <Trash2 size={13} strokeWidth={2.5} />
                  </button>
                )}
                {activeStepIndex === 'ending' ? (
                  <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-4 text-center my-auto">
                    <div className="w-14 h-14 rounded-full bg-purple/10 text-purple flex items-center justify-center mx-auto shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-[24px] font-bold text-navy tracking-tight font-serif" style={{ fontFamily: 'var(--font-playfair-display), serif' }}>
                      All Done!
                    </h2>
                    <p className="text-[13px] text-muted leading-relaxed">
                      Thank you for completing the form. Your information has been securely saved, and we will be in touch shortly!
                    </p>
                    <div className="pt-2">
                      {/* Removed misleading dummy button */}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full space-y-6 my-auto">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-navy text-white text-[11px] font-bold shrink-0 mt-1">
                        {activeStepIndex + 1}
                      </span>
                      <div className="flex-1">
                        <input 
                          value={activeField.label}
                          onChange={(e) => updateActiveField({ label: e.target.value })}
                          className="w-full p-0 font-sans text-[24px] font-medium text-navy bg-transparent border-0 border-b border-transparent hover:border-purple/20 focus:border-purple focus:ring-0 focus:outline-none transition-all placeholder:text-muted/50"
                          placeholder="Enter question title..."
                        />
                        {activeField.required && <span className="text-red-500 ml-1 text-xl leading-none">*</span>}
                      </div>
                    </div>

                    <div className="w-full pl-9">
                      {activeField.type === 'text' && (
                        <input 
                          type="text" 
                          placeholder="Type your answer here..."
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[15px] outline-none pointer-events-none" 
                        />
                      )}
                      {activeField.type === 'email' && (
                        <input 
                          type="email" 
                          placeholder="name@example.com"
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[15px] outline-none pointer-events-none" 
                        />
                      )}
                      {activeField.type === 'tel' && (
                        <input 
                          type="tel" 
                          placeholder="Enter phone number..."
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[15px] outline-none pointer-events-none" 
                        />
                      )}
                      {activeField.type === 'number' && (
                        <input 
                          type="number" 
                          placeholder="Enter value..."
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[15px] outline-none pointer-events-none" 
                        />
                      )}
                      {activeField.type === 'textarea' && (
                        <textarea 
                          placeholder="Type description..."
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[14px] outline-none pointer-events-none resize-none h-14"
                        ></textarea>
                      )}
                      {activeField.type === 'date' && (
                        <input 
                          type="date" 
                          className="w-full border-0 border-b border-[#E4E8F6] p-2 bg-transparent text-[14px] outline-none pointer-events-none text-navy" 
                        />
                      )}
                      {activeField.type === 'checkbox' && (
                        <div className="flex items-center gap-2.5 py-2 px-3 bg-white border border-[#E4E8F6] rounded-lg w-fit shadow-sm">
                          <input type="checkbox" className="w-3.5 h-3.5 text-purple outline-none pointer-events-none accent-purple" />
                          <span className="text-[12px] font-semibold text-custom-text">I agree to terms</span>
                        </div>
                      )}
                      {activeField.type === 'file' && (
                        <div className="border border-dashed border-custom-border rounded-xl p-4 text-center bg-[#FBFBFC] hover:border-purple transition-all max-w-xs pointer-events-none">
                          <span className="text-[11px] font-bold text-navy block">Click to upload file</span>
                          <span className="text-[9px] text-muted mt-0.5 block">Max size: 8MB</span>
                        </div>
                      )}
                      {activeField.type === 'select' && (
                        <div className="w-full max-w-xs p-3 bg-white border border-[#E4E8F6] rounded-lg text-[13px] flex items-center justify-between text-muted select-none">
                          <span>— Select —</span>
                          <ChevronDown size={14} />
                        </div>
                      )}
                      {activeField.type === 'radio' && (
                        <div className="flex flex-col gap-1.5 max-w-xs w-full">
                          {activeField.options?.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2.5 bg-[#F1F1F5] border border-[#E4E8F6] rounded-lg text-[13px] shadow-sm select-none font-semibold text-custom-text">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-[#D5D8F0] bg-white text-[9px] font-bold text-purple">{String.fromCharCode(65 + idx)}</span>
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {activeField.type !== 'radio' && activeField.type !== 'checkbox' && (
                      <div className="pl-9 pt-1">
                        <div className="inline-flex items-center gap-1.5 bg-[#6B2FA0]/15 text-purple text-[11px] font-bold px-3 py-1.5 rounded-full">
                          <span>OK ✓</span>
                          <span className="text-[9px] opacity-75">press Enter ↵</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* AI Generation Chat Input */}
            <div className="shrink-0 mt-8">
              <form onSubmit={handleAiGenerate} className="relative flex items-center bg-white border border-[#E4E8F6] focus-within:border-purple focus-within:ring-1 focus-within:ring-purple rounded-full px-4 py-2 transition-all shadow-sm max-w-md mx-auto w-full">
                <div className="text-purple mr-2 shrink-0 animate-pulse">
                  <Sparkle size={16} fill="currentColor" />
                </div>
                <input 
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder={aiLoading ? "AI is generating questions..." : placeholderText}
                  disabled={aiLoading}
                  className="flex-1 bg-transparent border-0 p-0 text-[12px] font-semibold text-navy placeholder:text-muted/65 outline-none focus:ring-0"
                />
                <button 
                  type="submit" 
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="p-1 rounded-full bg-purple text-white hover:bg-purple-mid transition-all disabled:opacity-40"
                >
                  {aiLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  )}
                </button>
              </form>
              {aiError && <p className="text-red-500 text-[10px] text-center mt-1.5 font-medium">{aiError}</p>}
            </div>

            {/* Mobile/Tablet Actions Toggle bar */}
            <div className="flex md:hidden items-center justify-center gap-4 mt-6">
              <button 
                onClick={() => setIsStepsOpen(true)}
                className="px-4 py-2 bg-white border border-[#E4E8F6] text-navy rounded-full text-[12px] font-bold shadow-sm active:scale-95 transition-all"
              >
                Steps ({fields.length})
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E4E8F6] text-navy rounded-full text-[12px] font-bold shadow-sm active:scale-95 transition-all"
              >
                <Settings size={13} />
                <span>Settings</span>
              </button>
            </div>

          </div>

          {/* COLUMN 3: Question settings Panel */}
          <div className="hidden lg:block w-[310px] shrink-0 border-l border-[#E4E8F6] bg-[#FBFBFC] p-5 overflow-y-auto h-full select-none space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F2F6] pb-3">
              <div className="p-1.5 bg-navy/5 text-navy rounded-lg">
                <Settings size={14} />
              </div>
              <h3 className="text-[12px] font-bold text-navy uppercase tracking-wider">Step Settings</h3>
            </div>

            {activeStepIndex === -1 ? (
              <div className="text-center py-20 text-muted/60 text-[12px] italic">
                Select a step to customize.
              </div>
            ) : activeStepIndex === 'ending' ? (
              <div className="space-y-3.5 text-[12px] text-muted leading-relaxed">
                <div>
                  <h4 className="font-bold text-navy text-[13px] mb-1">Ending Page</h4>
                  <p>Configures parameters visible on submission completion.</p>
                </div>
                <div className="bg-[#F8F9FD] p-4 rounded-xl border border-[#E4E8F6] text-[11px]">
                  Congratulations messaging automatically is adjusted to fit campaigns.
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Question Type</label>
                  <select
                    value={activeField.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const opts = newType === 'radio' || newType === 'select' ? ['Option 1', 'Option 2'] : [];
                      updateActiveField({ type: newType, options: opts });
                    }}
                    className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[12px] font-semibold text-navy focus:border-purple focus:ring-1 focus:ring-purple outline-none transition-all"
                  >
                    {FIELD_TYPES.map(ft => (
                      <option key={ft.type} value={ft.type}>{ft.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Required Field</span>
                  <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeField.required ? 'bg-[#28A745]' : 'bg-[#E4E4EB]'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={activeField.required} 
                        onChange={(e) => updateActiveField({ required: e.target.checked })} 
                      />
                      <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${activeField.required ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between px-1 border-t border-[#F1F2F6] pt-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Hide Question</span>
                  <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeField.hidden ? 'bg-[#DC3545]' : 'bg-[#E4E4EB]'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={activeField.hidden || false} 
                        onChange={(e) => updateActiveField({ hidden: e.target.checked })} 
                      />
                      <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${activeField.hidden ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>

                {(activeField.type === 'radio' || activeField.type === 'select') && (
                  <div className="space-y-3 border-t border-[#F1F2F6] pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Choice Options</span>
                      <button 
                        onClick={() => {
                          const newOpts = [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`];
                          updateActiveField({ options: newOpts });
                        }}
                        className="text-[10px] text-purple font-bold hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                      {activeField.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(activeField.options || [])];
                              newOpts[oIdx] = e.target.value;
                              updateActiveField({ options: newOpts });
                            }}
                            className="flex-1 p-2 rounded-lg border border-custom-border text-[11px] bg-white outline-none font-medium"
                          />
                          <button 
                            onClick={() => {
                              const newOpts = activeField.options.filter((_, idx) => idx !== oIdx);
                              updateActiveField({ options: newOpts });
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3.5 border-t border-[#F1F2F6] pt-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Branching Logic</span>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-muted/80 uppercase tracking-wide ml-1">Depends On</label>
                      <select
                        value={activeField.dependsOn || ''}
                        onChange={(e) => updateActiveField({ dependsOn: e.target.value || null, conditionValue: '' })}
                        className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[11px] font-medium focus:border-purple focus:ring-0"
                      >
                        <option value="">— No Dependency —</option>
                        {fields.filter((_, i) => i < activeStepIndex && (fields[i].type === 'radio' || fields[i].type === 'select')).map(f => (
                          <option key={f.id} value={f.label}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {activeField.dependsOn && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted/80 uppercase tracking-wide ml-1">If Answer Equals</label>
                        <input 
                          value={activeField.conditionValue || ''}
                          onChange={(e) => updateActiveField({ conditionValue: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[11px] font-semibold focus:border-purple focus:ring-0"
                          placeholder="e.g. Option 1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Workflow' && (
        <div className="flex-1 bg-[#F4F5F7] p-8 overflow-y-auto h-full flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-8 border border-[#E4E8F6] shadow-sm text-center space-y-6">
            <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center text-purple mx-auto">
              <GitBranch size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-navy">Logical Routing Map</h3>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">Visual representation of how users flow through steps dynamically based on answers.</p>
            </div>
            
            <div className="bg-[#F8F9FD] rounded-2xl p-6 border border-[#E4E8F6] text-left space-y-3.5 max-h-[300px] overflow-y-auto">
              {fields.some(f => f.dependsOn) ? (
                fields.filter(f => f.dependsOn).map((field, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[12px] font-semibold text-custom-text">
                    <span className="p-1 bg-[#6B2FA0]/15 text-purple rounded">Rule {idx+1}</span>
                    <span>Show <strong>{field.label}</strong> only if <strong>{field.dependsOn}</strong> equals <strong>"{field.conditionValue}"</strong></span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted/65 italic text-[12px]">
                  No branching routes defined. Set dependency logic in the settings drawer on the Content tab!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Connect' && (
        <div className="flex-1 bg-[#F4F5F7] p-8 overflow-y-auto h-full flex items-center justify-center">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            
            <div className="bg-white border border-[#E4E8F6] rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-[#6B2FA0]/10 text-purple rounded-2xl shrink-0">
                <Sparkle size={24} fill="currentColor" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-navy">Cohere AI Generator</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#28A745]/15 text-[#28A745] text-[10px] font-bold">Active</span>
                </div>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">Powers the "Chat to create" input bar to instantly build and customize complex form paths from prompts.</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E8F6] rounded-3xl p-6 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-navy/5 text-navy rounded-2xl shrink-0">
                <Database size={24} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-navy">Neon PostgreSQL</h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#28A745]/15 text-[#28A745] text-[10px] font-bold">Active</span>
                </div>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">Direct connection to Neon Serverless Database to securely persist form questions and response logs.</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E8F6] rounded-3xl p-6 shadow-sm flex items-start gap-4 opacity-60">
              <div className="p-3 bg-[#E4E4EB] text-muted rounded-2xl shrink-0">
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-navy">Google Sheets</h4>
                  <span className="text-[10px] text-muted font-bold">Connectable</span>
                </div>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">Automatically populate a Google Sheet row for every incoming respondent submission.</p>
              </div>
            </div>

            <div className="bg-white border border-[#E4E8F6] rounded-3xl p-6 shadow-sm flex items-start gap-4 opacity-60">
              <div className="p-3 bg-[#E4E4EB] text-muted rounded-2xl shrink-0">
                <MessageSquare size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-navy">Slack Alerts</h4>
                  <span className="text-[10px] text-muted font-bold">Connectable</span>
                </div>
                <p className="text-[12px] text-muted mt-1.5 leading-relaxed">Relay submission alerts to targeted channels when new forms are processed.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'Share' && (
        <div className="flex-1 bg-[#F4F5F7] p-8 overflow-y-auto h-full flex flex-col items-center justify-start space-y-6 pb-24">
          
          <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-[#E4E8F6] shadow-sm text-center space-y-6 mt-8">
            <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center text-purple mx-auto">
              <Share2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-navy">Share Your Form Flow</h3>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">Embed this form inside web templates or share it directly with respondent audiences.</p>
            </div>

            <div className="flex items-center gap-2.5 bg-[#F8F9FD] border border-[#E4E8F6] p-3 rounded-full justify-between pl-5">
              <div className="flex items-center text-[12px] font-semibold text-purple truncate w-full pr-4">
                <span>/f/</span>
                <input 
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="bg-transparent border-0 border-b border-transparent hover:border-purple/35 focus:border-purple focus:ring-0 focus:outline-none p-0 text-[12px] font-semibold text-purple w-full transition-colors ml-0.5"
                  placeholder="custom-link-name"
                />
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
                  setToast('Form link copied to clipboard!');
                  setTimeout(() => setToast(''), 3000);
                }}
                className="px-4.5 py-2 bg-purple hover:bg-purple-mid text-white rounded-full text-[11px] font-bold shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                Copy Link
              </button>
            </div>
          </div>

          <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E8F6] shadow-sm space-y-6">
            <div>
              <h3 className="text-[16px] font-bold text-navy">Form Status & Access</h3>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">Control who can access your form and when it automatically stops accepting submissions.</p>
            </div>

            <div className="flex items-center justify-between border-t border-[#F1F2F6] pt-5">
              <div>
                <h4 className="text-[13px] font-bold text-navy">Active Status</h4>
                <p className="text-[11px] text-muted mt-0.5">Toggle to instantly open or close the form.</p>
              </div>
              <label className="flex items-center cursor-pointer select-none shrink-0">
                <div className={`w-11 h-6 rounded-full relative transition-colors ${isActive ? 'bg-[#28A745]' : 'bg-[#DC3545]'}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                  />
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-[#F1F2F6] pt-5 gap-6">
              <div className="flex-1">
                <h4 className="text-[13px] font-bold text-navy">Auto-Expiration Date</h4>
                <p className="text-[11px] text-muted mt-0.5">Automatically close this form on a specific date (optional).</p>
              </div>
              <div className="shrink-0 w-36">
                <input 
                  type="date" 
                  value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''} 
                  onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value).toISOString() : '')} 
                  className="w-full p-2.5 rounded-lg border border-custom-border text-[12px] font-medium focus:border-purple focus:ring-0 text-navy bg-[#FBFBFC]"
                />
              </div>
            </div>

            <div className="border-t border-[#F1F2F6] pt-5">
              <div className="mb-3">
                <h4 className="text-[13px] font-bold text-navy">Closed Form Message</h4>
                <p className="text-[11px] text-muted mt-0.5">Customize the message shown to visitors when this form is closed or expired.</p>
              </div>
              <textarea 
                value={closedMessage || ''}
                onChange={(e) => setClosedMessage(e.target.value)}
                placeholder="We're sorry, but submissions for this form are currently closed. If you believe this is an error, please contact the form owner."
                className="w-full p-3 rounded-xl border border-custom-border text-[13px] focus:border-purple focus:ring-0 text-navy bg-[#FBFBFC] min-h-[80px] resize-y"
              />
            </div>
          </div>

          <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E8F6] shadow-sm space-y-6">
            <div>
              <h3 className="text-[16px] font-bold text-navy">Social Preview Image</h3>
              <p className="text-[13px] text-muted mt-1 leading-relaxed">Customize the image that appears when you share your form link on platforms like iMessage, Twitter, Slack, etc.</p>
            </div>

            <div className="border-t border-[#F1F2F6] pt-5 space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={ogImage} 
                  onChange={(e) => setOgImage(e.target.value)} 
                  placeholder="Paste an image URL..." 
                  className="flex-1 p-3 rounded-xl border border-custom-border text-[13px] focus:border-purple focus:ring-0 text-navy bg-[#FBFBFC]"
                />
                <span className="text-muted text-[12px] font-semibold">OR</span>
                <label className="cursor-pointer px-4 py-3 bg-[#F4F5F7] hover:bg-[#EAECEF] text-navy rounded-xl text-[13px] font-bold transition-colors whitespace-nowrap">
                  Upload File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setToast('Uploading image...');
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        });
                        const data = await res.json();
                        if (data.url) {
                          setOgImage(data.url);
                          setToast('Image uploaded!');
                        } else {
                          setToast('Upload failed');
                        }
                      } catch (err) {
                        setToast('Upload failed');
                      }
                      setTimeout(() => setToast(''), 3000);
                    }}
                  />
                </label>
              </div>
              
              {ogImage && (
                <div className="mt-4 border border-[#E4E8F6] rounded-xl overflow-hidden bg-[#FBFBFC]">
                  <div className="aspect-video w-full bg-[#EAECEF] relative">
                    <img src={ogImage} alt="Social Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 bg-white">
                    <div className="text-[12px] text-muted font-medium mb-1">{window.location.host}</div>
                    <div className="text-[14px] font-bold text-navy truncate">{title || 'Untitled Form'}</div>
                    <div className="text-[13px] text-muted truncate mt-0.5">{description || 'Fill out this form'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'Results' && (
        <div className="flex-1 bg-[#F4F5F7] p-8 overflow-y-auto h-full space-y-6">
          {/* Conversion Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E4E8F6] rounded-2xl p-6 shadow-sm">
              <div className="text-[10px] font-bold tracking-wider uppercase text-muted mb-1">Total Views</div>
              <div className="text-[28px] font-bold text-navy">{views}</div>
            </div>
            <div className="bg-white border border-[#E4E8F6] rounded-2xl p-6 shadow-sm">
              <div className="text-[10px] font-bold tracking-wider uppercase text-muted mb-1">Submissions</div>
              <div className="text-[28px] font-bold text-purple">{submissions.length}</div>
            </div>
            <div className="bg-white border border-[#E4E8F6] rounded-2xl p-6 shadow-sm">
              <div className="text-[10px] font-bold tracking-wider uppercase text-muted mb-1">Conversion Rate</div>
              <div className="text-[28px] font-bold text-[#28A745]">{conversionRate}%</div>
            </div>
          </div>

          {/* Submissions Log Table */}
          <div className="max-w-5xl mx-auto bg-white border border-[#E4E8F6] rounded-[16px] shadow-sm overflow-hidden mb-12">
            <div className="px-6 py-4 border-b border-[#E4E8F6] bg-[#FBFBFC] flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-navy uppercase tracking-wider">Responses Log</h4>
              {submissions.length > 0 && (
                <button 
                  onClick={downloadCSV}
                  className="text-[11px] font-bold text-purple bg-purple/10 hover:bg-purple/20 px-4 py-2 rounded-full transition-colors"
                >
                  Download CSV
                </button>
              )}
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-muted/65 italic text-[12px]">
                  No responses received yet.
                </div>
              ) : (
                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="bg-light-gray/45 text-navy font-bold border-b border-[#E4E8F6]">
                      <th className="p-4 whitespace-nowrap">Submission Date</th>
                      {fields.map(f => (
                        <th key={f.id} className="p-4 whitespace-nowrap">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub, sIdx) => (
                      <tr key={sub.id || sIdx} className="border-b border-[#E4E8F6] hover:bg-light-gray/25 transition-colors text-custom-text">
                        <td className="p-4 font-medium whitespace-nowrap text-navy">
                          {new Date(sub.createdAt).toLocaleDateString()} <span className="text-muted ml-1 text-[11px]">{new Date(sub.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        {fields.map(f => (
                          <td key={f.id} className="p-4 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis">
                            {typeof sub.data[f.label] === 'object' ? JSON.stringify(sub.data[f.label]) : String(sub.data[f.label] || '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Steps Mobile Slide-up Bottom Drawer */}
      {isStepsOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end md:hidden animate-fade-in" onClick={() => setIsStepsOpen(false)}>
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl flex flex-col justify-between" onClick={e => e.stopPropagation()}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F2F6] pb-3">
                <span className="text-[12px] font-bold text-navy uppercase tracking-wider">Form Steps</span>
                <button onClick={() => setIsStepsOpen(false)} className="text-[11px] font-bold text-purple hover:underline">Done</button>
              </div>

              <div className="flex flex-col gap-1.5 max-h-[45vh] overflow-y-auto">
                {fields.length === 0 ? (
                  <div className="text-center py-6 text-muted/65 text-[11px] italic">
                    No questions added yet.
                  </div>
                ) : (
                  fields.map((field, idx) => {
                    const Icon = FIELD_TYPES.find(ft => ft.type === field.type)?.icon || Type;
                    return (
                      <div 
                        key={field.id}
                        onClick={() => { setActiveStepIndex(idx); setIsStepsOpen(false); }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${activeStepIndex === idx ? 'bg-purple/10 border-purple/20 text-purple font-bold' : 'bg-[#FBFBFC] border-transparent text-custom-text'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold opacity-60">{idx + 1}</span>
                          <Icon size={12} className="text-navy" />
                          <span className={`text-[11px] truncate ${field.hidden ? 'opacity-40 line-through' : ''}`}>{field.label}</span>
                          {field.hidden && <span className="text-red-500 text-[9px] font-bold shrink-0">HIDDEN</span>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-[#F1F2F6] pt-3 flex flex-col gap-3">
              <div 
                onClick={() => { setActiveStepIndex('ending'); setIsStepsOpen(false); }}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${activeStepIndex === 'ending' ? 'bg-purple/10 border-purple/20 text-purple font-bold' : 'bg-[#FBFBFC] border-transparent text-custom-text'}`}
              >
                <span className="text-gold">★</span>
                <span className="text-[11px] font-semibold">Endings Page</span>
              </div>
              <button 
                onClick={() => { addField('text'); setIsStepsOpen(false); }}
                className="w-full py-3 bg-purple text-white font-bold text-[12px] rounded-xl hover:bg-purple-mid transition-all shadow-sm"
              >
                + Add New Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Mobile Slide-up Bottom Drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end lg:hidden animate-fade-in" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#F1F2F6] pb-3">
              <span className="text-[12px] font-bold text-navy uppercase tracking-wider">Step Settings</span>
              <button onClick={() => setIsSettingsOpen(false)} className="text-[11px] font-bold text-purple hover:underline">Done</button>
            </div>

            {!activeField ? (
              <div className="text-center py-16 text-muted/65 italic text-[12px]">
                No active step selected. Close drawer and select or add a step to edit settings.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Question Type</label>
                  <select
                    value={activeField.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const opts = newType === 'radio' || newType === 'select' ? ['Option 1', 'Option 2'] : [];
                      updateActiveField({ type: newType, options: opts });
                    }}
                    className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[12px] font-semibold text-navy outline-none"
                  >
                    {FIELD_TYPES.map(ft => (
                      <option key={ft.type} value={ft.type}>{ft.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Required Field</span>
                  <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeField.required ? 'bg-[#28A745]' : 'bg-[#E4E4EB]'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={activeField.required} 
                        onChange={(e) => updateActiveField({ required: e.target.checked })} 
                      />
                      <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${activeField.required ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between px-1 border-t border-[#F1F2F6] pt-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Hide Question</span>
                  <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeField.hidden ? 'bg-[#DC3545]' : 'bg-[#E4E4EB]'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={activeField.hidden || false} 
                        onChange={(e) => updateActiveField({ hidden: e.target.checked })} 
                      />
                      <div className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${activeField.hidden ? 'translate-x-3.5' : 'translate-x-0'}`}></div>
                    </div>
                  </label>
                </div>

                {(activeField.type === 'radio' || activeField.type === 'select') && (
                  <div className="space-y-3 border-t border-[#F1F2F6] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Choice Options</span>
                      <button 
                        onClick={() => {
                          const newOpts = [...(activeField.options || []), `Option ${(activeField.options?.length || 0) + 1}`];
                          updateActiveField({ options: newOpts });
                        }}
                        className="text-[10px] text-purple font-bold hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                      {activeField.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input 
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...(activeField.options || [])];
                              newOpts[oIdx] = e.target.value;
                              updateActiveField({ options: newOpts });
                            }}
                            className="flex-1 p-2 rounded-lg border border-custom-border text-[11px] bg-white outline-none font-medium"
                          />
                          <button 
                            onClick={() => {
                              const newOpts = activeField.options.filter((_, idx) => idx !== oIdx);
                              updateActiveField({ options: newOpts });
                            }}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3.5 border-t border-[#F1F2F6] pt-4">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider ml-1">Branching Logic</span>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-muted/80 uppercase tracking-wide ml-1">Depends On</label>
                      <select
                        value={activeField.dependsOn || ''}
                        onChange={(e) => updateActiveField({ dependsOn: e.target.value || null, conditionValue: '' })}
                        className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[11px] font-medium focus:border-purple focus:ring-0"
                      >
                        <option value="">— No Dependency —</option>
                        {fields.filter((_, i) => i < activeStepIndex && (fields[i].type === 'radio' || fields[i].type === 'select')).map(f => (
                          <option key={f.id} value={f.label}>{f.label}</option>
                        ))}
                      </select>
                    </div>

                    {activeField.dependsOn && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted/80 uppercase tracking-wide ml-1">If Answer Equals</label>
                        <input 
                          value={activeField.conditionValue || ''}
                          onChange={(e) => updateActiveField({ conditionValue: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-custom-border bg-white text-[11px] font-semibold focus:border-purple focus:ring-0"
                          placeholder="e.g. Option 1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#28A745] text-white px-5 py-3 rounded-xl shadow-lg font-bold text-[13px] flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 size={16} strokeWidth={2.5} />
          {toast}
        </div>
      )}

      <ConfirmModal
        isOpen={fieldToDelete !== null}
        onClose={() => setFieldToDelete(null)}
        onConfirm={() => {
          if (fieldToDelete !== null) {
            removeField(fieldToDelete);
            setFieldToDelete(null);
          }
        }}
        title="Delete Field"
        message="Are you sure you want to delete this field? Any logic or data tied to this field might be affected."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
