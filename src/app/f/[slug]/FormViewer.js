'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { submitForm, trackView, trackDropoff } from './actions';
import { UploadDropzone } from '@/lib/uploadthing-components';

export default function FormViewer({ formId, schema }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
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
      alert('Please upload a file before continuing.');
      return;
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
        alert('Failed to submit form. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="outro-screen animate-fade-in-up">
        <div className="outro-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h2 className="outro-title">All Done!</h2>
        <p className="outro-desc">
          Thank you for completing the form. Your information has been securely saved, and we will be in touch shortly!
        </p>
      </div>
    );
  }

  const isReviewStep = currentStep === visibleFields.length;

  // We add +1 to the total steps to account for the Review screen
  const totalSteps = visibleFields.length + 1;

  if (visibleFields.length === 0) return null;
  const field = isReviewStep ? null : visibleFields[currentStep];

  return (
    <div className="wizard-wrapper typeform-wrapper">
      <div className="wizard-progress">
        <div 
          className="wizard-progress-bar" 
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="wizard-progress-text">
        {isReviewStep ? 'Final Review' : `Question ${currentStep + 1} of ${visibleFields.length}`}
      </div>

      <form className="form-body" ref={formRef} onSubmit={handleFormSubmit}>
        
        {isReviewStep ? (
          <div className="typeform-field wizard-anim" key="review-step">
            <div className="max-w-3xl mx-auto w-full wizard-anim">
              <div className="text-center mb-10 sm:mb-12" style={{ marginBottom: '40px' }}>
                <h2 className="text-[32px] sm:text-[40px] font-extrabold text-navy tracking-tight mb-3" style={{ fontSize: '32px', marginBottom: '12px', color: '#1A1F6B' }}>Review Your Answers</h2>
                <p className="text-[16px] text-muted font-medium" style={{ color: '#6B6E8A' }}>Take a moment to ensure everything is correct before submitting.</p>
              </div>
              
              <div className="bg-white rounded-[24px] shadow-sm border border-custom-border/40 overflow-hidden mb-8" style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #D5D8F0', overflow: 'hidden' }}>
                <div className="flex flex-col">
                  {visibleFields.filter(f => f.type !== 'section').map((f, idx) => (
                    <div key={f.id} className="group flex flex-col sm:flex-row sm:items-start border-b border-custom-border/30 last:border-0 hover:bg-off-white/50 transition-colors" style={{ padding: '28px 32px', borderBottom: '1px solid rgba(213, 216, 240, 0.4)' }}>
                      <div className="w-full sm:w-1/3 shrink-0 pr-4 mb-2 sm:mb-0" style={{ marginBottom: '8px' }}>
                        <div className="text-[13px] font-bold text-muted uppercase tracking-[0.1em]" style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B6E8A', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{f.label}</div>
                      </div>
                      <div className="w-full sm:w-2/3">
                        <div className="text-[18px] sm:text-[20px] text-navy font-medium leading-relaxed" style={{ fontSize: '19px', color: '#1A1F3C', fontWeight: '500', lineHeight: '1.6' }}>
                          {f.type === 'file' ? (
                            formData[f.label] ? (
                              <a href={formData[f.label].url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-purple bg-purple/5 hover:bg-purple/10 transition-colors font-semibold" style={{ display: 'inline-flex', padding: '8px 16px', backgroundColor: 'rgba(107,47,160,0.05)', borderRadius: '12px', color: '#6B2FA0', textDecoration: 'none', fontSize: '15px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                View Attached File
                              </a>
                            ) : (
                              <span className="text-muted/50 italic text-[16px]" style={{ color: '#a0a3bd', fontStyle: 'italic', fontSize: '16px' }}>No file attached</span>
                            )
                          ) : (
                            formData[f.label] ? (
                              <span className="text-navy">{formData[f.label]}</span>
                            ) : (
                              <span className="text-muted/50 italic text-[16px]" style={{ color: '#a0a3bd', fontStyle: 'italic', fontSize: '16px' }}>Not provided</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="typeform-field wizard-anim" key={field.id}>
            {field.type === 'section' ? (
              <div className="typeform-section-card">
                <div className="section-title text-center text-2xl font-bold mb-4">{field.label}</div>
                <p className="text-center text-muted mb-8">Press continue to proceed.</p>
              </div>
            ) : (
              <div className="field field-full typeform-large-input">
                <label>
                  {field.label} {field.required && <span className="req">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input type="text" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'text')} autoFocus />
                )}
                {field.type === 'email' && (
                  <input type="email" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'email')} autoFocus />
                )}
                {field.type === 'tel' && (
                  <input type="tel" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'tel')} autoFocus />
                )}
                {field.type === 'number' && (
                  <input type="number" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'number')} autoFocus />
                )}
                {field.type === 'date' && (
                  <input type="date" required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'date')} autoFocus />
                )}
                {field.type === 'textarea' && (
                  <textarea required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'textarea')} autoFocus></textarea>
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
                            alert(`ERROR! ${error.message}`);
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
                  <select required={field.required} value={formData[field.label] || ''} onChange={e => handleChange(field.label, e.target.value, 'select')} autoFocus>
                    <option value="">— Select —</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === 'radio' && (
                  <div className="radio-group typeform-radio-group">
                    {field.options?.map(opt => (
                      <label key={opt} className={`radio-opt typeform-radio ${formData[field.label] === opt ? 'selected' : ''}`} style={{ animation: 'none', transition: 'none' }}>
                        <input className="mr-2" type="radio" name={field.id} value={opt} required={field.required} checked={formData[field.label] === opt} onChange={e => handleChange(field.label, e.target.value, 'radio')} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {field.type === 'checkbox' && (
                  <div className="consent-check typeform-consent">
                    <input className="mr-2" type="checkbox" required={field.required} checked={formData[field.label] === 'Yes'} onChange={e => handleChange(field.label, e.target.checked ? 'Yes' : 'No', 'checkbox')} />
                    <span>I agree to this field</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="wizard-footer">
          {currentStep > 0 ? (
            <button type="button" className="btn-prev" onClick={handlePrev}>
              &larr; Previous
            </button>
          ) : (
            <div className="w-24"></div> // Spacer to keep layout balanced
          )}
          
          {!isReviewStep ? (
            <button type="submit" className="btn-next">
              {field?.type === 'section' ? 'Continue' : 'Next'} &rarr;
            </button>
          ) : (
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm & Submit'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
