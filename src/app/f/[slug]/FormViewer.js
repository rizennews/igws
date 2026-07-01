'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import CreatorBadge from '@/components/ui/CreatorBadge';
import { submitForm, trackView, trackDropoff } from './actions';
import { UploadDropzone } from '@/lib/uploadthing-components';
import AlertModal from '@/components/ui/AlertModal';

export default function FormViewer({ formId, schema }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: '' });
  const formRef = useRef(null);

  // Track initial view
  useEffect(() => {
    trackView(formId);
  }, [formId]);

  // Compute which fields are visible based on conditional logic
  const visibleFields = useMemo(() => {
    return schema.filter(field => {
      if (field.dependsOn) {
        const parentValue = formData[field.dependsOn];
        if (parentValue !== field.conditionValue) {
          return false;
        }
      }
      return true;
    });
  }, [schema, formData]);

  // Ensure currentStep doesn't exceed bounds if conditional fields appear/disappear
  // visibleFields.length is the Review Step, so currentStep can go up to visibleFields.length
  useEffect(() => {
    if (currentStep > visibleFields.length && visibleFields.length > 0) {
      setCurrentStep(visibleFields.length);
    }
  }, [visibleFields.length, currentStep]);

  const handleChange = (id, value, type = null) => {
    let sanitized = value;
    if (type === 'tel' || type === 'number') {
      // Strip letters from phone/number fields
      if (typeof value === 'string') {
        sanitized = value.replace(/[^0-9\+\-\(\)\s]/g, '');
      }
    } else if (type === 'text' && id.toLowerCase().includes('name')) {
      // Strip numbers from name fields
      if (typeof value === 'string') {
        sanitized = value.replace(/[0-9]/g, '');
      }
    }
    setFormData(prev => ({ ...prev, [id]: sanitized }));
  };

  const handleNext = () => {
    const currentField = visibleFields[currentStep];
    
    // Custom validation for file fields
    if (currentField?.type === 'file' && currentField.required && !formData[currentField.label]) {
      setAlertInfo({ isOpen: true, message: 'Please upload a file before continuing.' });
      return;
    }

    // Strict validation for email fields (require domain with dot)
    if (currentField?.type === 'email' && formData[currentField.label]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData[currentField.label])) {
        setAlertInfo({ isOpen: true, message: 'Please enter a valid, complete email address (e.g., hello@example.com).' });
        return;
      }
    }

    if (formRef.current && formRef.current.reportValidity()) {
      trackDropoff(formId, currentStep);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === visibleFields.length) {
      handleSubmit(e);
    } else {
      handleNext();
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (formRef.current && formRef.current.reportValidity()) {
      setLoading(true);
      
      // Extract all file keys to store alongside the submission
      const fileKeys = [];
      for (const key in formData) {
        if (formData[key] && typeof formData[key] === 'object' && formData[key].key) {
          fileKeys.push(formData[key].key);
        }
      }

      try {
        await submitForm(formId, JSON.stringify(formData), JSON.stringify(fileKeys));
        setSubmitted(true);
      } catch (err) {
        setAlertInfo({ isOpen: true, message: 'Failed to submit form. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };



  const isReviewStep = currentStep === visibleFields.length;
  const field = isReviewStep ? null : visibleFields[currentStep];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        (activeEl.tagName === 'INPUT' && activeEl.type !== 'radio' && activeEl.type !== 'checkbox') ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT'
      );

      if (e.key === 'ArrowUp' && activeEl?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setCurrentStep(prev => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'ArrowDown' && activeEl?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (!isReviewStep) {
          const currentField = visibleFields[currentStep];
          if (currentField?.required && !formData[currentField.label]) return;
          if (currentField?.type === 'file' && currentField.required && !formData[currentField.label]) return;
          setCurrentStep(prev => prev + 1);
        }
        return;
      }

      if (isReviewStep || !field) return;
      if (isInputFocused) return;

      if (field.type === 'radio' && field.options) {
        const key = e.key.toUpperCase();
        const letterIndex = key.charCodeAt(0) - 65; // A = 0, B = 1...
        if (letterIndex >= 0 && letterIndex < field.options.length) {
          e.preventDefault();
          handleChange(field.label, field.options[letterIndex], 'radio');
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
          }, 300);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [field, isReviewStep, formData, handleChange, visibleFields, currentStep]);

  // We add +1 to the total steps to account for the Review screen
  const totalSteps = visibleFields.length + 1;

  if (visibleFields.length === 0) return null;

  if (submitted) {
    return (
      <div className="outro-screen animate-fade-in-up flex flex-col items-center justify-center h-full min-h-[50vh]">
        <div className="outro-icon bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2 className="text-[32px] sm:text-[40px] font-normal text-[#222] leading-tight mb-4">All Done!</h2>
        <p className="text-[16px] sm:text-[20px] text-[#555] max-w-lg text-center">
          Thank you for completing the form. Your information has been securely saved.
        </p>
      </div>
    );
  }

  return (
    <div className="wizard-wrapper typeform-wrapper w-full max-w-[1000px]">
      <div className="wizard-progress">
        <div 
          className="wizard-progress-bar" 
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="wizard-progress-text">
        {isReviewStep ? 'Final Review' : `Question ${currentStep + 1} of ${visibleFields.length}`}
      </div>

      <form className="form-body w-full max-w-[760px] px-4 sm:px-0" ref={formRef} onSubmit={handleFormSubmit}>
        
        {isReviewStep ? (
          <div className="typeform-field wizard-anim flex flex-col items-center justify-center h-full min-h-[50vh]" key="review-step">
            <div className="max-w-2xl mx-auto w-full text-center">
              <h2 className="text-[32px] sm:text-[40px] font-normal text-[#222] leading-tight mb-4">Almost done!</h2>
              <p className="text-[16px] sm:text-[20px] text-[#555] mb-12">Please click the button below to submit your responses.</p>
              
              <div className="flex justify-center mt-8">
                <button 
                  type="submit" 
                  className="bg-purple text-white font-bold rounded-[6px] hover:bg-purple-mid transition-all shadow-sm active:scale-95" 
                  style={{ padding: '12px 32px', fontSize: '20px', minWidth: '160px' }}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="typeform-field wizard-anim w-full" key={field.id}>
            {field.type === 'section' ? (
              <div className="typeform-section-card w-full">
                <div className="section-title text-center text-2xl font-bold mb-4">{field.label}</div>
                <p className="text-center text-muted mb-8">Press continue to proceed.</p>
              </div>
            ) : (
              <div className="field field-full w-full">
                <div className="flex items-start gap-3 mb-2 w-full">
                  <div className="flex items-center justify-center min-w-[24px] h-[24px] bg-purple text-white text-[13px] font-bold rounded-[4px] mt-1.5">
                    {currentStep + 1}
                  </div>
                  <label className="text-[20px] sm:text-[24px] font-normal text-[#222] leading-tight m-0 p-0 block w-full">
                    {field.label}{field.required && <span className="text-[#222] ml-0.5">*</span>}
                  </label>
                </div>
                {field.description && (
                  <p className="text-[15px] sm:text-[18px] text-[#555] mt-1 mb-6 font-normal ml-9">{field.description}</p>
                )}
                
                {field.type === 'text' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <input type="text" name={field.label.toLowerCase().includes('name') ? 'name' : 'text'} autoComplete={field.label.toLowerCase().includes('name') ? 'name' : 'on'} required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'text')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }} autoFocus placeholder="Type your answer here..." className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-1 placeholder:text-muted/40 transition-colors rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }} />
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'email' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <input type="email" name="email" autoComplete="email" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'email')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }} autoFocus placeholder="name@example.com" className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-1 placeholder:text-muted/40 transition-colors rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }} />
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'tel' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <input type="tel" name="tel" autoComplete="tel" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'tel')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }} autoFocus placeholder="+1 (555) 000-0000" className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-1 placeholder:text-muted/40 transition-colors rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }} />
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'number' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <input type="number" name="number" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'number')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }} autoFocus placeholder="Type a number..." className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-1 placeholder:text-muted/40 transition-colors rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }} />
                    {formData[field.label] !== undefined && formData[field.label] !== '' && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'date' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <input type="date" name="date" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'date')} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }} autoFocus className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-1 placeholder:text-muted/40 transition-colors rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }} />
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'textarea' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <textarea rows="1" name="message" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'textarea')} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNext(); } }} autoFocus placeholder="Type your answer here..." className="w-full bg-transparent border-0 border-b-2 border-purple/30 focus:border-purple focus:ring-0 outline-none shadow-none focus:outline-none text-purple text-[20px] sm:text-[24px] p-0 pb-2 placeholder:text-muted/40 transition-colors resize-none overflow-hidden rounded-none" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '2px solid rgba(107, 47, 160, 0.4)', boxShadow: 'none', borderRadius: '0', width: '100%', minWidth: '100%', display: 'block', backgroundColor: 'transparent', padding: '0 0 8px 0', lineHeight: '1.2', height: 'auto', minHeight: '36px' }}></textarea>
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'file' && (
                  <div className="file-upload-wrapper mt-4">
                    {formData[field.label] ? (
                      <div className="p-4 bg-[#EDEEF8] border border-custom-border rounded-xl text-navy flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          <span className="font-medium text-[15px]">File uploaded successfully</span>
                          <button type="button" onClick={() => handleChange(field.label, '')} className="ml-auto text-sm underline hover:opacity-80">Remove</button>
                        </div>
                        <a href={formData[field.label].url} target="_blank" rel="noreferrer" className="text-xs text-muted break-all hover:text-navy underline">
                          {formData[field.label].url}
                        </a>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-custom-border rounded-xl p-6 text-center hover:border-navy transition-colors bg-white">
                        <UploadDropzone
                          endpoint="documentUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              handleChange(field.label, { url: res[0].url, key: res[0].key });
                            }
                          }}
                          onUploadError={(error) => {
                            setAlertInfo({ isOpen: true, message: `ERROR! ${error.message}` });
                          }}
                          appearance={{
                            button: "bg-navy text-white text-[13px] font-bold py-2 px-6 rounded-full",
                            container: "border-0 p-0",
                            label: "text-[13px] text-muted",
                            allowedContent: "text-xs text-muted"
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'select' && (
                  <div className="relative w-full max-w-4xl mt-4">
                    <select required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'select')} autoFocus>
                      <option value="">— Select —</option>
                      {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '36px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[16px] font-bold px-6 py-2.5 rounded-[4px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                        <span className="text-[12px] text-muted hidden sm:inline-block">Press <strong>Enter ↵</strong></span>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'radio' && (
                  <div className="relative w-full max-w-[500px] mt-4 ml-9">
                    <div className="flex flex-col gap-3">
                      {field.options?.map((opt, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        const isSelected = formData[field.label] === opt;
                        return (
                          <label key={opt} className={`flex items-center border rounded-[6px] cursor-pointer transition-all ${isSelected ? 'border-purple bg-purple/10' : 'border-purple/20 bg-purple/5 hover:bg-purple/10'}`} style={{ padding: '12px 16px' }}>
                            <input className="hidden" type="radio" name={field.id} value={opt} required={field.required} checked={isSelected} onChange={e => handleChange(field.label, e.target.value, 'radio')} />
                            <span className={`flex items-center justify-center min-w-[24px] h-[24px] rounded-[4px] text-[13px] font-bold ${isSelected ? 'bg-purple text-white border-purple' : 'bg-white border border-purple/30 text-purple'}`} style={{ marginRight: '16px' }}>{letter}</span>
                            <span className={`text-[17px] ${isSelected ? 'text-purple font-medium' : 'text-purple/80 font-normal'}`}>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '24px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[15px] sm:text-[18px] font-bold px-6 py-2.5 rounded-[6px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {field.type === 'checkbox' && (
                  <div className="relative w-full max-w-[500px] mt-4 ml-9">
                    <div className="consent-check typeform-consent">
                      <input className="mr-2" type="checkbox" required={field.required} checked={formData[field.label] === 'Yes'} onChange={e => handleChange(field.label, e.target.checked ? 'Yes' : 'No', 'checkbox')} />
                      <span>I agree to this field</span>
                    </div>
                    {formData[field.label] && (
                      <div className="animate-fade-in-up flex items-center gap-3" style={{ marginTop: '24px' }}>
                        <button type="button" onClick={handleNext} className="inline-flex items-center justify-center bg-purple text-white text-[15px] sm:text-[18px] font-bold px-6 py-2.5 rounded-[6px] hover:bg-purple-mid transition-all shadow-sm active:scale-95">
                          OK
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </form>

      <div className="fixed bottom-4 right-4 flex gap-1">
        <button onClick={handlePrev} disabled={currentStep === 0 || isReviewStep} className="p-1.5 bg-purple text-white hover:bg-purple-mid rounded transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
        </button>
        <button onClick={handleNext} disabled={isReviewStep} className="p-1.5 bg-purple text-white hover:bg-purple-mid rounded transition-colors disabled:opacity-30 disabled:pointer-events-none shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
      </div>

      <CreatorBadge position="bottom-left" />

      <AlertModal 
        isOpen={alertInfo.isOpen} 
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        message={alertInfo.message}
      />
    </div>
  );
}
