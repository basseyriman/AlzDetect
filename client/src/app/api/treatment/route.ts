import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is not configured');
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    );
  }

  try {
    const { prediction, confidence } = await request.json();

    if (!prediction || confidence === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Making treatment request with:', { prediction, confidence });

    const prompt = `As a Senior Clinical Neurologist, provide a definitive set of stage-appropriate clinical management and therapeutic lifestyle recommendations for a patient with a confirmed ${prediction} classification (Confidence Score: ${(confidence * 100).toFixed(1)}%).

Professional Guidelines for your Recommendations:
1. Clinical Management:
- Specify the standard-of-care medical interventions (e.g., cholinesterase inhibitors for early stages, NMDA antagonists for advanced stages) that are appropriate for the ${prediction} stage.
- List specific cognitive therapies or neuropsychological interventions tailored to this level of impairment.
- State the essential clinical monitoring requirements (lab work, imaging frequency, cognitive testing).

2. Therapeutic Lifestyle & Caregiving:
- Define the optimal daily structure and cognitive stimulation activities that correlate with the ${prediction} capability level.
- Provide definitive dietary and nutritional strategies for neuro-preservation.
- Outline specific safety and environmental modifications required at this clinical stage.

3. Prognostic Monitoring:
- Identify the primary red-flag symptoms that indicate immediate clinical escalation.
- State the recommended frequency of neurology follow-up visits.

Note: Provide your recommendations as categorical, definitive expert guidance suitable for inclusion in a clinical report. Do not use vague or tentative language. Focus exclusively on the identified ${prediction} stage.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    return NextResponse.json({
      suggestions: data.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in treatment API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate treatment suggestions' },
      { status: 500 }
    );
  }
} 