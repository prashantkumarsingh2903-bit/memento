import type { Mood, Reflection } from '../../types';

interface GenerateReflectionOptions {
  text?: string;
  transcript?: string;
  mood?: Mood;
  tags?: string[];
  title?: string;
}

class AIService {
  private isLiveAIConnected = false;

  /**
   * Generates an empathetic, thoughtful reflection based on journal content.
   * Uses non-prescriptive, supportive language.
   */
  public async generateReflection(entry: GenerateReflectionOptions): Promise<Reflection> {
    // Simulate slight processing delay for realistic, contemplative AI feel
    await new Promise((resolve) => setTimeout(resolve, 850));

    const content = `${entry.title || ''} ${entry.text || ''} ${entry.transcript || ''}`.trim();
    const lower = content.toLowerCase();

    // 1. Detect themes
    const themes = this.extractThemes(content, entry.tags || []);

    // 2. Generate thoughtful summary
    const summary = this.generateSummary(content, entry.mood);

    // 3. Formulate observations
    const observations = this.formulateObservations(lower, entry.mood);

    // 4. Offer contemplative exploratory questions
    const questions = this.suggestReflectionQuestions(lower, entry.mood);

    // 5. Suggest gentle, restorative action
    const suggestedAction = this.suggestAction(lower, entry.mood);

    return {
      summary,
      themes,
      observations,
      questions,
      suggestedAction,
      createdAt: new Date().toISOString(),
    };
  }

  public extractThemes(text: string, existingTags: string[] = []): string[] {
    const lower = text.toLowerCase();
    const themeCandidates: { keyword: RegExp; theme: string }[] = [
      { keyword: /\b(presentation|pitch|meeting|client|boss|deadline|work|sprint|project|code|design)\b/, theme: 'Career & Work' },
      { keyword: /\b(anxious|nervous|fear|chest|worry|stress|overwhelm|doubt)\b/, theme: 'Emotional Regulation' },
      { keyword: /\b(calm|peace|coffee|morning|sunrise|silence|stillness|breathe|tea)\b/, theme: 'Mindfulness' },
      { keyword: /\b(walk|park|nature|trees|outside|autumn|sky|mountain|ocean|lake)\b/, theme: 'Nature' },
      { keyword: /\b(friend|friendship|classmate|dinner|connected|talk|conversation|dad|mom|family)\b/, theme: 'Relationships' },
      { keyword: /\b(create|canvas|paint|write|writing|photo|film|camera|make|craft|art)\b/, theme: 'Creativity' },
      { keyword: /\b(tired|sleep|burnout|depleted|rest|bath|exhausted|bed)\b/, theme: 'Rest & Recovery' },
      { keyword: /\b(learn|book|reading|library|curious|study|grow|habit|meditation)\b/, theme: 'Learning & Growth' },
      { keyword: /\b(boundary|protect|say no|space|overcommit)\b/, theme: 'Boundaries' },
    ];

    const detected = new Set<string>();

    // Add existing user tags
    existingTags.forEach((t) => detected.add(t));

    // Match keywords
    themeCandidates.forEach(({ keyword, theme }) => {
      if (keyword.test(lower)) {
        detected.add(theme);
      }
    });

    if (detected.size === 0) {
      detected.add('Daily Reflection');
      detected.add('Self-Discovery');
    }

    return Array.from(detected).slice(0, 4);
  }

  public detectMood(text: string): Mood {
    const lower = text.toLowerCase();
    if (/\b(exhausted|drained|tired|burnout|asleep|sleepy|depleted)\b/.test(lower)) return 'tired';
    if (/\b(sad|grief|lonely|heavy|crying|hurt|lost|down)\b/.test(lower)) return 'low';
    if (/\b(anxious|struggle|panic|hard|difficult|tight|stress|fight)\b/.test(lower)) return 'difficult';
    if (/\b(joy|excited|amazing|thrilled|proud|triumph|great|wonderful|glorious)\b/.test(lower)) return 'great';
    if (/\b(good|productive|grateful|peaceful|content|happy|accomplished|clarity)\b/.test(lower)) return 'good';
    return 'okay';
  }

  private generateSummary(content: string, mood?: Mood): string {
    if (!content) {
      return 'You paused for a moment of quiet check-in today.';
    }

    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    const firstThought = sentences[0]?.trim();

    if (mood === 'tired' || mood === 'difficult') {
      return `You captured a raw moment of navigating fatigue or emotional weight, articulating how you are holding difficult feelings today.`;
    }
    if (mood === 'great' || mood === 'good') {
      return `You recorded an uplifting moment of accomplishment, presence, or connection that brought a sense of flow and grounded energy.`;
    }

    if (firstThought) {
      return `You reflected on ${firstThought.charAt(0).toLowerCase() + firstThought.slice(1)}, exploring what this experience reveals about your current season.`;
    }

    return `You took intentional time to process your thoughts and check in with your internal state.`;
  }

  private formulateObservations(lower: string, mood?: Mood): string[] {
    const obs: string[] = [];

    if (lower.includes('nervous') || lower.includes('anxious') || lower.includes('fear')) {
      obs.push('You noticed how anxiety surfaced in your body or thoughts before transitioning into action.');
    }
    if (lower.includes('walk') || lower.includes('nature') || lower.includes('outside')) {
      obs.push('Physical movement and sensory engagement in nature served as a calming reset mechanism.');
    }
    if (lower.includes('team') || lower.includes('friend') || lower.includes('dad') || lower.includes('family')) {
      obs.push('Interpersonal dynamics and vulnerability played a central role in shaping how you experienced today.');
    }
    if (lower.includes('work') || lower.includes('code') || lower.includes('design') || lower.includes('sprint')) {
      obs.push('You balanced the drive for accomplishment with the reality of energy limits.');
    }

    if (obs.length === 0) {
      if (mood === 'great' || mood === 'good') {
        obs.push('You recognized a positive shift in your perspective and allowed yourself to savor it.');
        obs.push('You connected tangible daily habits with a higher sense of clarity.');
      } else {
        obs.push('You gave voice to what was present without immediately trying to force a resolution.');
        obs.push('Acknowledging your current state is an essential step toward understanding your needs.');
      }
    }

    return obs.slice(0, 2);
  }

  public suggestReflectionQuestions(lower: string, mood?: Mood): string[] {
    const questions: string[] = [];

    if (lower.includes('work') || lower.includes('project') || lower.includes('presentation')) {
      questions.push('What part of this experience made you feel most capable or aligned?');
      questions.push('How can you celebrate the effort you invested regardless of the final outcome?');
    } else if (lower.includes('tired') || lower.includes('burnout') || mood === 'tired') {
      questions.push('What is one small commitment you could gently release or reschedule this week?');
      questions.push('What kind of rest does your body or mind crave most right now?');
    } else if (lower.includes('friend') || lower.includes('relationship') || lower.includes('family')) {
      questions.push('What boundary or truth felt important to honor in that interaction?');
      questions.push('How can you bring warmth to yourself as you process that conversation?');
    } else {
      questions.push('What would it look like to be gentle with yourself through this experience?');
      questions.push('If you look back on today from a year from now, what might feel most meaningful?');
    }

    return questions.slice(0, 2);
  }

  private suggestAction(lower: string, mood?: Mood): string | undefined {
    if (mood === 'tired' || lower.includes('burnout')) {
      return 'Consider stepping away from screens 30 minutes earlier tonight.';
    }
    if (lower.includes('presentation') || lower.includes('win') || mood === 'great') {
      return 'Take a quiet moment to mark this milestone before rushing to the next task.';
    }
    if (lower.includes('creative') || lower.includes('stuck')) {
      return 'Try a 15-minute unguided walk without headphones tomorrow morning.';
    }
    return undefined;
  }

  public isAIConnected(): boolean {
    return this.isLiveAIConnected;
  }
}

export const aiService = new AIService();
