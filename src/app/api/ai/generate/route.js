import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-igenius-key-1234');

export async function POST(req) {
  try {
    // Validate authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('adminAuth');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Authentication token is missing.' }, { status: 401 });
    }
    try {
      await jwtVerify(token.value, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token.' }, { status: 401 });
    }

    const { prompt, currentFields } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Cohere API Key is missing. Please add COHERE_API_KEY to your .env file to enable AI Form generation.' 
      }, { status: 400 });
    }

    const systemInstructions = `You are a world-class, intelligent form design AI assistant. Your primary directive is to generate highly logical, comprehensive, and professional form schemas.

To ensure maximum utility and correctness:
1. **Intelligent Autocompletion**: If the user provides a brief concept (e.g., "make a car rental form" or "event RSVP"), act as an expert form designer. Automatically generate a comprehensive, logical set of questions needed for that workflow. Do not just wait for explicit instructions; build out the flow intelligently.
2. **Exact Content Replication**: If the user provides a raw copy-paste of a document/form, extract the exact questions, text, and labels as written.
3. **Smart Type Mapping**: Map every question to the most precise input type:
   - Use "email" for email addresses.
   - Use "tel" for telephone/mobile numbers.
   - Use "date" for birthdays, deadlines, or dates.
   - Use "number" for age, quantity, or salary inputs.
   - Use "textarea" for long descriptive text or feedback.
   - Use "radio" for choice selections with 2-5 items.
   - Use "select" for many choices (e.g. countries).
   - Use "checkbox" for agreements/consents or multiple selections.
   - Use "file" for uploads.
   - Use "text" for simple single-line inputs.

4. **Proactive Conditional Logic**: Actively use conditional logic to create dynamic, smart workflows. For example, if you ask "Do you have dietary restrictions?", automatically create a follow-up "Please specify" text field that only shows if they select "Yes".
   - Set the "dependsOn" field to the EXACT label text of the parent question.
   - Set the "conditionValue" to the specific choice value of the parent question that triggers the field.

5. **Form Modification & Structural Edits**: If an array of existing fields is provided, modify this existing structure. Perform the requested edit directly on the existing array and return the entire updated list of fields. Keep all other fields untouched.

Return ONLY a raw JSON array of field objects, and absolutely nothing else. Do not include markdown code block syntax (\`\`\`json or \`\`\`), no conversation, and no introduction.

JSON Schema format to follow strictly:
{
  "id": "random 9-character alphanumeric string",
  "type": "text" | "textarea" | "email" | "tel" | "date" | "number" | "select" | "radio" | "checkbox" | "file",
  "label": "The exact question text",
  "required": true | false,
  "options": ["Option 1", "Option 2"], // only for "select" and "radio" types; empty array for other types
  "dependsOn": "Exact question text label of the parent question this field depends on", // omit or set to null if not conditional
  "conditionValue": "Specific option text value of the parent question that triggers this field" // omit or set to null if not conditional
}`;

    const message = (currentFields && Array.isArray(currentFields) && currentFields.length > 0)
      ? `Apply this edit request to the existing fields list (add, remove, or modify fields accordingly) and return the updated complete array: "${prompt}".\n\nExisting fields: ${JSON.stringify(currentFields)}`
      : `Generate a new form schema based strictly on this request: "${prompt}"`;

    const response = await fetch('https://api.cohere.com/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command-r-plus-08-2024',
        preamble: systemInstructions,
        message,
        temperature: 0.2, // Increased slightly to allow intelligent autocompletion while remaining structured
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Cohere API Error: ${errText}` }, { status: 500 });
    }

    const result = await response.json();
    let rawText = result.text || '';

    // Strip markdown JSON code block wrappers if generated by the AI
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let fields = [];
    try {
      fields = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Failed to parse AI response text as JSON:', rawText);
      return NextResponse.json({ 
        error: 'The AI model returned invalid JSON. Please try rephrasing your prompt.' 
      }, { status: 500 });
    }

    if (!Array.isArray(fields)) {
      return NextResponse.json({ error: 'AI output is not a valid list of questions.' }, { status: 500 });
    }

    // Sanitize and ensure each field has necessary schema items
    const sanitizedFields = fields.map(f => {
      const type = ['text', 'textarea', 'email', 'tel', 'date', 'number', 'select', 'radio', 'checkbox', 'file'].includes(f.type) ? f.type : 'text';
      return {
        id: f.id || Math.random().toString(36).substr(2, 9),
        type,
        label: f.label || 'New Question',
        required: typeof f.required === 'boolean' ? f.required : false,
        options: Array.isArray(f.options) && f.options.length > 0 ? f.options : (type === 'radio' || type === 'select' ? ['Option 1', 'Option 2'] : []),
        dependsOn: typeof f.dependsOn === 'string' ? f.dependsOn : undefined,
        conditionValue: typeof f.conditionValue === 'string' ? f.conditionValue : undefined
      };
    });

    return NextResponse.json({ fields: sanitizedFields });

  } catch (error) {
    console.error('AI generation route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
