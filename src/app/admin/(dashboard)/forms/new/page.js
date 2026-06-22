'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, GripVertical, Trash2, Settings, Save, Copy, Type, AlignLeft, Mail, Phone, Calendar, Hash, ChevronDown, CheckCircle2, CheckSquare, Upload } from 'lucide-react';
import { createForm } from './actions';

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

export default function FormBuilder() {
  const router = useRouter();
  const [title, setTitle] = useState('My Summer School Registration');
  const [description, setDescription] = useState('Nurturing Character · Raising Change-Makers');
  const [slug, setSlug] = useState('summer-school-2026');
  const [isActive, setIsActive] = useState(true);
  const [endDate, setEndDate] = useState('');
  
  const [fields, setFields] = useState([
    { id: 'sec1', type: 'section', label: '1. Student Information' },
    { id: '1', type: 'text', label: "Student's Full Name", required: true, options: [] },
    { id: '2', type: 'date', label: "Date of Birth", required: true, options: [] },
    { id: '3', type: 'number', label: "Age", required: true, options: [] },
    { id: '4', type: 'radio', label: "Gender", required: true, options: ['Male', 'Female', 'Prefer not to say'] },
    { id: '5', type: 'text', label: "Current School/Class", required: false, options: [] },
    { id: '6', type: 'textarea', label: "Home Address", required: true, options: [] },
    { id: 'sec2', type: 'section', label: '2. Parent / Guardian Information' },
    { id: '7', type: 'text', label: "Parent/Guardian Name", required: true, options: [] },
    { id: '8', type: 'select', label: "Relationship to Student", required: true, options: ['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'] },
    { id: '9', type: 'tel', label: "Phone Number", required: true, options: [] },
    { id: '10', type: 'tel', label: "Alternative Phone Number", required: false, options: [] },
    { id: '11', type: 'email', label: "Email Address", required: true, options: [] },
    { id: '12', type: 'textarea', label: "Residential Address (if different from student)", required: false, options: [] },
    { id: 'sec3', type: 'section', label: '3. Emergency Contact' },
    { id: '13', type: 'text', label: "Emergency Contact Name", required: true, options: [] },
    { id: '14', type: 'text', label: "Emergency Contact Relationship", required: true, options: [] },
    { id: '15', type: 'tel', label: "Emergency Contact Phone", required: true, options: [] },
    { id: 'sec4', type: 'section', label: '4. Medical Information' },
    { id: '16', type: 'radio', label: "Does the student have any medical condition(s)?", required: true, options: ['Yes', 'No'] },
    { id: '17', type: 'textarea', label: "If yes, please specify medical conditions:", required: true, options: [], dependsOn: "Does the student have any medical condition(s)?", conditionValue: "Yes" },
    { id: '18', type: 'radio', label: "Does the student have any allergies?", required: true, options: ['Yes', 'No'] },
    { id: '19', type: 'textarea', label: "If yes, please specify allergies:", required: true, options: [], dependsOn: "Does the student have any allergies?", conditionValue: "Yes" },
    { id: '20', type: 'textarea', label: "Any medication currently being taken?", required: false, options: [] },
    { id: 'sec5', type: 'section', label: '5. Authorisation & Consent' },
    { id: '21', type: 'checkbox', label: "I hereby register my child for Summer School and confirm the information is accurate.", required: true, options: [] },
    { id: '22', type: 'checkbox', label: "I authorize the school to seek emergency medical attention if necessary.", required: true, options: [] },
    { id: '23', type: 'checkbox', label: "I grant permission for my child to participate in all approved activities.", required: true, options: [] },
    { id: '24', type: 'text', label: "Parent/Guardian Signature (Type Full Name)", required: true, options: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const dragType = useRef(null); // Track type when dragging from sidebar

  const [error, setError] = useState('');

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    dragType.current = null;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleSidebarDragStart = (e, type) => {
    dragType.current = type;
    dragItem.current = null;
    e.dataTransfer.effectAllowed = 'copy';
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
    
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      // Reordering existing item
      const newFields = [...fields];
      const draggedItemContent = newFields.splice(dragItem.current, 1)[0];
      newFields.splice(dragOverItem.current, 0, draggedItemContent);
      setFields(newFields);
    } else if (dragType.current !== null && dragOverItem.current !== null) {
      // Dropping new item from sidebar
      const newFields = [...fields];
      newFields.splice(dragOverItem.current, 0, {
        id: Math.random().toString(36).substr(2, 9),
        type: dragType.current,
        label: dragType.current === 'section' ? 'New Section' : 'New Field',
        required: false,
        options: ['Option 1']
      });
      setFields(newFields);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
    dragType.current = null;
  };

  const addField = (type) => {
    setFields([...fields, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: type === 'section' ? 'New Section' : 'New Field',
      required: false,
      options: ['Option 1']
    }]);
  };

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const removeField = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmRemoveField = () => {
    setFields(fields.filter(f => f.id !== deleteConfirmId));
    setDeleteConfirmId(null);
  };

  const duplicateField = (index) => {
    const newFields = [...fields];
    const fieldToCopy = newFields[index];
    newFields.splice(index + 1, 0, {
      ...fieldToCopy,
      id: Math.random().toString(36).substr(2, 9),
      label: fieldToCopy.label + ' (Copy)'
    });
    setFields(newFields);
  };

  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await createForm({
        title,
        description,
        slug,
        schema: JSON.stringify(fields),
        isActive,
        endDate: endDate || null,
      });
      setSuccess(true);
    } catch (err) {
      setError('Error saving form. Make sure your URL slug is unique and the database is connected. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/f/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar Tools */}
      <div className="w-[260px] shrink-0 sticky top-[100px]">
        <div className="bg-white border border-custom-border rounded-xl p-5 mb-4 shadow-sm">
          <h3 className="text-[13px] font-bold text-navy uppercase tracking-[0.08em] mb-4">Add Fields</h3>
          <div className="flex flex-col gap-2">
            {FIELD_TYPES.map(ft => (
              <button
                key={ft.type}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, ft.type)}
                onDragEnd={handleDragEnd}
                onClick={() => addField(ft.type)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-custom-border text-left hover:border-purple hover:bg-purple/5 transition-colors text-[13px] font-medium text-custom-text group cursor-grab active:cursor-grabbing"
              >
                <PlusCircle size={16} className="text-muted group-hover:text-purple" />
                {ft.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-1 bg-white border border-custom-border rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-custom-border">
          <div>
            <h1 className="text-[22px] font-extrabold text-navy tracking-[0.02em]">Create New Form</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-custom-border shadow-sm">
              <span className="text-[13px] font-bold text-navy uppercase tracking-[0.05em]">{isActive ? 'Form Open' : 'Form Closed'}</span>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-success' : 'bg-muted'}`}>
                <input type="checkbox" className="sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </label>
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-lg text-[13px] font-bold tracking-[0.04em] hover:opacity-90 disabled:opacity-50"
            >
              <Save size={16} strokeWidth={2.5} />
              {loading ? 'Saving...' : 'Save & Generate Link'}
            </button>
          </div>
        </div>

        {/* Form Settings */}
        <div className="grid grid-cols-2 gap-4 mb-8 bg-off-white p-5 rounded-lg border border-custom-border">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2">Form Title</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-md border border-custom-border text-[14px]" 
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2">URL Slug</label>
            <input 
              value={slug} onChange={e => setSlug(e.target.value)}
              className="w-full p-2.5 rounded-md border border-custom-border text-[14px]" 
            />
            <p className="text-[11px] text-muted mt-1">Link will be: /f/{slug}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2">Subtitle / Description</label>
            <input 
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-md border border-custom-border text-[14px]" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2">Form Expiration Date (Optional)</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full p-2.5 rounded-md border border-custom-border text-[14px] text-navy"
            />
            <p className="text-[11px] text-muted mt-1">If set, the form will automatically close on this date.</p>
          </div>
        </div>

        {/* Fields List */}
        <div className="flex flex-col gap-3 min-h-[200px]">
          {fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="group flex gap-3 p-4 bg-white border-2 border-transparent hover:border-purple/30 rounded-xl transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              style={{ cursor: 'grab' }}
            >
              <div className="pt-2 cursor-grab text-muted/50 group-hover:text-muted">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-1 grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-5">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1">
                    {field.type === 'section' ? 'Section Title' : 'Field Label'}
                  </label>
                  <div className="flex gap-2">
                    {(() => {
                      const Icon = FIELD_TYPES.find(ft => ft.type === field.type)?.icon || Type;
                      return (
                        <div className="flex items-center justify-center w-[42px] h-[42px] rounded border border-custom-border bg-light-gray text-navy shrink-0" title={`Type: ${field.type}`}>
                          <Icon size={18} />
                        </div>
                      );
                    })()}
                    <input 
                      value={field.label} 
                      onChange={e => updateField(field.id, { label: e.target.value })}
                      className="w-full p-2 rounded border border-custom-border text-[14px] flex-1" 
                    />
                  </div>
                </div>
                
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1">Type</label>
                  <select 
                    value={field.type}
                    onChange={e => updateField(field.id, { type: e.target.value })}
                    className="w-full p-2 rounded border border-custom-border text-[13px] font-medium text-navy bg-light-gray"
                  >
                    {FIELD_TYPES.map(ft => (
                      <option key={ft.type} value={ft.type}>{ft.label}</option>
                    ))}
                  </select>
                </div>

                {field.type !== 'section' && (
                  <div className="col-span-6 sm:col-span-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] font-medium text-custom-text">
                      <input 
                        type="checkbox" 
                        checked={field.required}
                        onChange={e => updateField(field.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-custom-border accent-purple"
                      />
                      Required
                    </label>
                  </div>
                )}

                {/* Options Editor for Select/Radio */}
                {(field.type === 'select' || field.type === 'radio') && (
                  <div className="col-span-12 mt-2 border-t border-custom-border/30 pt-3">
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-[0.08em] mb-1">Options (comma separated)</label>
                    <input 
                      value={(field.options || []).join(', ')} 
                      onChange={e => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full p-2 rounded border border-custom-border text-[13px]" 
                    />
                  </div>
                )}

                {/* Conditional Logic */}
                {index > 0 && field.type !== 'section' && (
                  <div className="col-span-12 mt-2">
                    {!field.hasCondition ? (
                      <button 
                        onClick={() => updateField(field.id, { hasCondition: true })}
                        className="text-[11px] font-bold text-purple hover:text-navy transition-colors flex items-center gap-1"
                      >
                        + Add Conditional Logic
                      </button>
                    ) : (
                      <div className="bg-light-gray/30 p-3 rounded-lg border border-custom-border/50 relative">
                        <button 
                          onClick={() => updateField(field.id, { hasCondition: false, dependsOn: '', conditionValue: '' })}
                          className="absolute top-2 right-2 text-muted hover:text-error transition-colors"
                          title="Remove Conditional Logic"
                        >
                          <Trash2 size={14} />
                        </button>
                        <label className="block text-[10px] font-bold text-navy uppercase tracking-[0.08em] mb-2">Conditional Logic</label>
                        <div className="grid grid-cols-2 gap-3 pr-6">
                          <div>
                            <label className="block text-[10px] text-muted mb-1">Show this field only if:</label>
                            <select 
                              value={field.dependsOn || ''}
                              onChange={e => updateField(field.id, { dependsOn: e.target.value })}
                              className="w-full p-1.5 rounded border border-custom-border text-[12px]"
                            >
                              <option value="">-- Select Parent Field --</option>
                              {fields.slice(0, index).filter(f => f.type === 'radio' || f.type === 'select').map(parent => (
                                <option key={parent.id} value={parent.label}>{parent.label}</option>
                              ))}
                            </select>
                          </div>
                          {field.dependsOn && (
                            <div>
                              <label className="block text-[10px] text-muted mb-1">Equals Value:</label>
                              <input 
                                placeholder="e.g., Yes"
                                value={field.conditionValue || ''}
                                onChange={e => updateField(field.id, { conditionValue: e.target.value })}
                                className="w-full p-1.5 rounded border border-custom-border text-[12px]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 border-l border-custom-border pl-3 ml-2">
                <button onClick={() => duplicateField(index)} title="Duplicate Field" className="p-1.5 text-muted hover:bg-navy/10 hover:text-navy rounded transition-colors">
                  <Copy size={16} />
                </button>
                <button onClick={() => removeField(field.id)} title="Delete Field" className="p-1.5 text-muted hover:bg-error/10 hover:text-error rounded transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {fields.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-custom-border rounded-xl text-muted text-[14px]">
              Drag fields here from the left panel to build your form.
            </div>
          )}
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-custom-border animate-fade-in">
            <h3 className="text-lg font-bold text-navy mb-2">Notice</h3>
            <p className="text-[14px] text-muted mb-6 leading-relaxed">{error}</p>
            <div className="flex justify-end">
              <button 
                onClick={() => setError('')} 
                className="px-5 py-2.5 bg-navy text-white rounded-lg text-[13px] font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl px-10 py-8 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] animate-fade-in relative text-center">
            <button 
              onClick={() => setDeleteConfirmId(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#f4f4f5] text-[#a1a1aa] hover:bg-[#e4e4e7] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-extrabold text-navy mb-2 mt-2">Are you sure?</h3>
            <p className="text-[14px] text-[#52525b] mb-8 leading-snug px-2">
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="flex-1 py-2.5 bg-transparent border-2 border-navy text-navy rounded-lg text-[14px] font-bold hover:bg-light-gray transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveField} 
                className="flex-1 py-2.5 bg-[#f43f5e] text-white rounded-lg text-[14px] font-bold hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl px-10 py-8 w-full max-w-[400px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] animate-fade-in relative text-center">
            <button 
              onClick={() => setSuccess(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#f4f4f5] text-[#a1a1aa] hover:bg-[#e4e4e7] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="w-14 h-14 bg-[#e93d82]/10 text-[#e93d82] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            
            <h3 className="text-2xl font-extrabold text-navy mb-2">Form Created!</h3>
            <p className="text-[14px] text-[#52525b] mb-8 leading-snug px-2">
              Your new form is ready. You can copy the link below to share it.
            </p>
            
            <div className="bg-light-gray border border-custom-border rounded-xl p-3 mb-6 flex items-center justify-between gap-4">
              <div className="text-left overflow-hidden pl-1">
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted mb-0.5">Live URL</div>
                <div className="text-[13px] font-bold text-navy truncate">
                  {typeof window !== 'undefined' ? `${window.location.origin}/f/${slug}` : `/f/${slug}`}
                </div>
              </div>
              <button 
                onClick={handleCopyLink}
                className="flex-shrink-0 px-4 py-2 bg-[#f43f5e] text-white rounded-lg text-[12px] font-bold transition-colors hover:opacity-90"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button 
              onClick={() => router.push('/admin')}
              className="w-full py-2.5 bg-transparent border-2 border-navy text-navy rounded-lg text-[14px] font-bold hover:bg-light-gray transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
