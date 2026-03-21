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
    const body = await request.json();
    const { prediction } = body;
    const confidence = parseFloat(body.confidence);

    if (!prediction || isNaN(confidence)) {
      console.error('Validation failed for:', { prediction, confidence: body.confidence });
      return NextResponse.json(
        { error: 'Missing or invalid required fields (prediction/confidence)' },
        { status: 400 }
      );
    }

    console.log('Making request with:', { prediction, confidence });

    const prompt = `As a Senior Neuroradiology Expert, provide a definitive interpretation of the attention map visualization for a brain MRI scan classified as ${prediction} with ${(confidence * 100).toFixed(1)}% confidence.

The attention map uses a "jet" colormap where:
- Blue/Dark Blue indicates areas of baseline/low focus
- Cyan/Yellow indicates areas of moderate physiological significance
- Orange/Red indicates areas of peak diagnostic focus

Technical Requirements for your Analysis:
1. Identify the specific anatomical regions of the brain (e.g., hippocampus, cortical thickness, ventricular volume) that the model is actively prioritizing.
2. Explain the diagnostic clinical significance of why the model is focusing on these specific areas for a ${prediction} classification.
3. Describe the key morphological or signal intensity features being highlighted by the peak attention weights (Red/Orange zones).
4. Correlate these findings directly with established neuropathological patterns for ${prediction} cases.

Avoid tentative language like "likely" or "might". Provide a professional, assertive, and technically rigorous interpretation of the model's focus.`;

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
      console.error('OpenAI API Error Details:', JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { error: `OpenAI Service Error: ${errorData.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenAI response received');

    return NextResponse.json({
      suggestions: data.choices[0].message.content
    });
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
} 