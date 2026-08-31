import type { JournalEntry } from '../types';

export const DEMO_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'The quiet hour before sunrise',
    type: 'text',
    mood: 'great',
    tags: ['Morning', 'Solitude', 'Coffee', 'Ritual'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    text: `Woke up at 5:45 AM before the alarm. The apartment was completely silent except for the low hum of the refrigerator. Made a pour-over with the Ethiopian beans Sarah gave me last week—notes of bergamot and jasmine that filled the kitchen.

Sat by the east window watching the sky shift from indigo to a soft amber wash. There is something profoundly restorative about being awake when the rest of the neighborhood is asleep. No notifications, no urgent emails, no expectations. Just steam rising from the ceramic mug.

I wrote three pages of freehand thoughts about the upcoming design transition. I feel much less overwhelmed today than I did on Tuesday. Space creates perspective.`,
    media: [],
    reflection: {
      summary: 'You experienced a calm, intentional morning ritual that brought clarity to feelings of work overwhelm.',
      themes: ['Solitude', 'Morning Routine', 'Mental Clarity', 'Perspective'],
      observations: [
        'You noted that unhurried morning space directly reduced the anxiety you felt earlier in the week.',
        'Sensory anchors like coffee brewing and dawn light helped ground your attention.',
      ],
      questions: [
        'How might you protect this morning stillness on busier weekdays?',
        'What changed between Tuesday and today that made the design transition feel lighter?',
      ],
      suggestedAction: 'Consider scheduling a recurring 20-minute morning buffer before checking messages.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  },
  {
    id: 'entry-2',
    title: 'Voice note after the client pitch',
    type: 'voice',
    mood: 'good',
    tags: ['Work', 'Presentation', 'Milestone'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // yesterday
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    text: 'Recorded right after walking out of the studio conference room. Still feeling the adrenaline.',
    transcript: `I was really nervous about presenting today because the executive team had conflicting visions for the brand direction. But as soon as I walked them through the user journey prototypes, the room shifted. David actually leaned forward and said it was the clearest articulation of their problem they've seen all year. My hands stopped shaking about three slides in. Really proud of how our team rallied together on the final deck.`,
    media: [
      {
        id: 'media-audio-1',
        type: 'audio',
        url: '',
        duration: 142,
        name: 'pitch-debrief-audio.webm',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      },
    ],
    reflection: {
      summary: 'You successfully navigated a high-stakes presentation that initially sparked significant anxiety, transforming tension into confidence.',
      themes: ['Confidence', 'Achievement', 'Teamwork', 'Communication'],
      observations: [
        'You recognized that tangible prototypes helped align a divided audience.',
        'Physical nervousness subsided once you focused on storytelling rather than self-doubt.',
      ],
      questions: [
        'What preparation technique gave you the most grounded feeling on slide three?',
        'How can you celebrate this win with your collaborators today?',
      ],
      suggestedAction: 'Send a short thank-you note to the team highlighting their specific contributions.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    },
  },
  {
    id: 'entry-3',
    title: 'Evening walk & reflection on creative blocks',
    type: 'mixed',
    mood: 'okay',
    tags: ['Nature', 'Walking', 'Creative Process'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    text: `Spent the entire afternoon staring at a blank canvas and felt the familiar creeping dread of "I have no good ideas left."

Decided to force myself away from the screens and walk through the botanical conservatory park. The autumn leaves are starting to crisp at the edges. Took a short video clip of the sunlight filtering through the glass dome, and recorded a voice note while sitting on the stone bench near the ferns.

Realized that creative exhaustion is usually just consumption overload in disguise. I haven't been creating because my head is packed with other people's podcasts, newsletters, and opinions. I need a week of cognitive fasting.`,
    transcript: `Voice memo from the bench: 'The noise isn't inside me, it's what I've been letting in. If I want original output, I have to stop feeding on constant chatter.'`,
    media: [
      {
        id: 'media-img-1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
        name: 'conservatory-light.jpg',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: 'media-audio-2',
        type: 'audio',
        url: '',
        duration: 48,
        name: 'park-memo.webm',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
    reflection: {
      summary: 'You identified digital overconsumption as the root cause of your creative stagnation and used outdoor movement as a reset.',
      themes: ['Creativity', 'Digital Wellbeing', 'Nature', 'Self-Awareness'],
      observations: [
        'You separated your intrinsic creative ability from temporary mental clutter.',
        'Physical change of environment immediately unlocked an honest insight.',
      ],
      questions: [
        'What would a gentle 3-day "cognitive fast" look like in practice for you?',
        'Which inputs drain your creative vitality the most?',
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    },
  },
  {
    id: 'entry-4',
    title: 'Weekend studio setup check-in',
    type: 'video',
    mood: 'good',
    tags: ['Workspace', 'Video', 'Reorganization'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    text: 'Quick video journal documenting the newly reorganized corner desk and the new warm lighting setup.',
    transcript: `Hey journal. Quick 60-second video check-in. Finally moved the heavy desk to face the north window so the glare is gone. Put up the wooden floating shelf for my favorite ceramic mugs and the small jade plant. It feels twenty times more intentional. I think having a designated sacred corner makes sitting down to write ten times easier.`,
    media: [
      {
        id: 'media-vid-1',
        type: 'video',
        url: '',
        duration: 64,
        name: 'workspace-tour.webm',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
    ],
    reflection: {
      summary: 'You reshaped your physical environment to nurture mental clarity and eliminate friction in your daily writing habit.',
      themes: ['Environment', 'Habits', 'Intentionality'],
      observations: ['You value tactile surroundings that invite calm focus.'],
      questions: ['What other friction points in your daily routine could be resolved by a simple physical change?'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(),
    },
  },
  {
    id: 'entry-5',
    title: 'Learning to sit with unanswered questions',
    type: 'text',
    mood: 'difficult',
    tags: ['Philosophy', 'Uncertainty', 'Patience'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 4 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    text: `I have a compulsion to solve everything immediately. When there is ambiguity—in relationships, in career direction, in financial plans—my instinctive reaction is to obsessively research, optimize, and try to force an outcome.

A quote from Rilke came back to me today:
"Be patient toward all that is unsolved in your heart and try to love the questions themselves, like locked rooms and like books that are now written in a very foreign tongue."

I am trying to practice that. It is profoundly uncomfortable. My chest feels tight when I don't know the exact schedule for next quarter, but I am learning that living the questions is the only honest way forward.`,
    media: [],
    reflection: {
      summary: 'You confronted your habit of anxious over-optimization and found solace in embracing patience toward uncertainty.',
      themes: ['Uncertainty', 'Control', 'Emotional Growth', 'Philosophy'],
      observations: [
        'You noticed the physical manifestation of anxiety (tight chest) connected to ambiguous situations.',
        'You are actively cultivating a gentler, more trusting posture toward the unknown.',
      ],
      questions: [
        'When did a past period of uncertainty lead to an outcome better than what you could have planned?',
        'What is one question you can choose not to answer today?',
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 95).toISOString(),
    },
  },
  {
    id: 'entry-6',
    title: 'Long voice reflection on friendship and distance',
    type: 'voice',
    mood: 'okay',
    tags: ['Friendship', 'Distance', 'Connection'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    text: 'Spoke into Memento while driving home from dinner with old college classmates.',
    transcript: `It's fascinating how friendships evolve in your late twenties and thirties. We haven't seen each other in nearly eight months, and for the first ten minutes there was this awkward politeness, like two people trying on old coats that don't quite fit. But by the second course, the layers melted away and we were talking about aging parents, the fear of missing out on life milestones, and what really matters. True friendship doesn't require constant proximity; it requires mutual honesty when you finally do sit across from each other.`,
    media: [
      {
        id: 'media-audio-3',
        type: 'audio',
        url: '',
        duration: 185,
        name: 'friendship-reflections.webm',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      },
    ],
    reflection: {
      summary: 'You reflected on the resilience of meaningful friendships and how vulnerability bridges time and geographic separation.',
      themes: ['Friendship', 'Vulnerability', 'Life Transitions', 'Aging'],
      observations: [
        'Initial social friction dissolved once conversation moved past superficial status updates.',
        'You value depth and shared history over frequent casual interactions.',
      ],
      questions: [
        'Who is a long-distance friend you have been meaning to send an unprompted message to?',
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 119).toISOString(),
    },
  },
  {
    id: 'entry-7',
    title: 'A Sunday afternoon with film photography',
    type: 'photo',
    mood: 'great',
    tags: ['Photography', 'SlowLiving', 'Creativity'],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(), // 6 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    text: `Got my scans back from the local lab. 36 exposures from the trip to the coast last month. Looking at 35mm film reminds me why delayed gratification is so precious.

When you shoot digital, you look at the screen immediately, judge yourself, delete, and take sixteen more identical frames. With film, you click once, wind the lever, and carry on being present in the world. When you see the photos weeks later, you remember the temperature of the air, not your ego.`,
    media: [
      {
        id: 'media-img-2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1200&q=80',
        name: 'coastal-fog-35mm.jpg',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
      },
      {
        id: 'media-img-3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        name: 'coastline-rocks.jpg',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
      },
    ],
    reflection: {
      summary: 'You connected physical film photography with mindfulness and freedom from instant validation.',
      themes: ['Mindfulness', 'Creativity', 'Slow Living', 'Presence'],
      observations: ['Limiting immediate feedback helped you stay grounded in the living moment.'],
      questions: ['In what other areas of life could you intentionally introduce a delay to savor the experience?'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 143).toISOString(),
    },
  },
  {
    id: 'entry-8',
    title: 'Feeling thoroughly depleted after the sprint',
    type: 'text',
    mood: 'tired',
    tags: ['Burnout', 'Rest', 'Boundaries'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    text: `My brain feels like cold oatmeal. Four 12-hour days back to back shipping the v2 migration. We hit the launch target, which is great, but the cost was exorbitant.

Skipped the gym four days in a row, ate takeout at my desk, drank three double espressos each afternoon. I cannot keep borrowing energy from tomorrow with high interest rates. Tonight is non-negotiable: phone in the other room by 8:30 PM, hot bath with epsom salt, chamomile tea, lights out by 10.`,
    media: [],
    reflection: {
      summary: 'You recognized severe acute fatigue and set explicit immediate boundaries to prevent compounding burnout.',
      themes: ['Burnout', 'Health', 'Boundaries', 'Recovery'],
      observations: [
        'You accurately identified that overwork is "borrowing energy from tomorrow with high interest."',
        'You laid out concrete physical remedies for restorative rest.',
      ],
      questions: [
        'What guardrail can you establish for the next sprint to avoid back-to-back 12-hour days?',
      ],
      suggestedAction: 'Block out recovery time on your calendar for the coming weekend.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 167).toISOString(),
    },
  },
  {
    id: 'entry-9',
    title: 'Short evening video: cooking sourdough pasta',
    type: 'video',
    mood: 'good',
    tags: ['Cooking', 'Mindfulness', 'Home'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
    text: 'Captured a 45-second video while rolling out fresh handmade tagliatelle.',
    transcript: `Look at the texture on this dough. Kneaded it for ten minutes while listening to Chopin. Cooking from scratch is the best antidote to intellectual fatigue. Your hands are covered in semolina flour, you can't touch your phone, and the only metric of success is whether it tastes good with roasted garlic and olive oil.`,
    media: [
      {
        id: 'media-vid-2',
        type: 'video',
        url: '',
        duration: 45,
        name: 'pasta-making.webm',
        thumbnailUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
      },
    ],
    reflection: {
      summary: 'You found tactile sensory joy in cooking as a natural barrier to digital distraction.',
      themes: ['Sensory Presence', 'Mindfulness', 'Cooking', 'Rest'],
      observations: ['Physical activities that occupy both hands effectively prevent automatic phone checking.'],
      questions: ['What other tactile rituals bring you into the physical world when your mind is tired?'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 191).toISOString(),
    },
  },
  {
    id: 'entry-10',
    title: 'Journaling through a difficult conversation with Dad',
    type: 'text',
    mood: 'low',
    tags: ['Family', 'Boundaries', 'Grief', 'Healing'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 216).toISOString(),
    text: `Called my dad tonight. We ended up in that same generational argument about security versus purpose. For years, I used to get defensive and angry. Tonight I just felt a quiet, heavy sadness.

I realized his anxiety isn't a critique of my choices—it's his way of trying to protect me from the instability he experienced in his thirties. We speak entirely different emotional languages, but the root is love wrapped in fear.

I didn't yell. I listened, said "I understand why that worries you," and held my ground gently. It didn't fix the divide, but it broke the cycle of reactive fighting.`,
    media: [],
    reflection: {
      summary: 'You exhibited mature emotional regulation by reinterpreting family friction through empathy rather than defensiveness.',
      themes: ['Family', 'Empathy', 'Emotional Maturity', 'Communication'],
      observations: [
        'You shifted from reacting to your father\'s words to understanding the underlying motive (fear for your safety).',
        'You preserved your personal boundaries without escalating conflict.',
      ],
      questions: [
        'How does it feel in your body when you choose non-defensive listening over proving a point?',
        'What self-care can you give yourself after emotionally draining conversations?',
      ],
      suggestedAction: 'Take 10 minutes to decompress without replaying the conversation repeatedly.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 215).toISOString(),
    },
  },
  {
    id: 'entry-11',
    title: 'Mixed memory: Rainy afternoon in the library archives',
    type: 'mixed',
    mood: 'good',
    tags: ['Books', 'History', 'Curiosity', 'Rain'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    text: `Spent four uninterrupted hours in the central library rare manuscripts room. The smell of aged rag paper and oak varnish is intoxicating.

I was researching 19th-century botanical expedition journals. The level of meticulous illustration and handwritten field observations made me question how fast we consume information now. These explorers spent six months observing a single species of fern and documented every vein with ink.`,
    media: [
      {
        id: 'media-img-4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        name: 'library-manuscripts.jpg',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
      },
    ],
    reflection: {
      summary: 'You drew inspiration from historical patience and detailed craftsmanship in historical research.',
      themes: ['Curiosity', 'Craftsmanship', 'Patience', 'Deep Work'],
      observations: ['You are drawn to meticulous, high-care human creative artifacts.'],
      questions: ['How can you bring even 10% more craft and attentiveness into your work tomorrow?'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 239).toISOString(),
    },
  },
  {
    id: 'entry-12',
    title: 'A small victory in meditation consistency',
    type: 'text',
    mood: 'great',
    tags: ['Meditation', 'Habits', 'Mindfulness'],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 264).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 264).toISOString(),
    text: `Completed 21 consecutive days of 15-minute breath meditation. I didn't think I had the attention span for it, but dropping the expectation of "clearing all thoughts" made all the difference.

Instead of fighting distracting thoughts, I started mentally labeling them: "planning", "remembering", "worrying". Then gently returning to the breath sensation at the tip of the nose. It feels like training an energetic puppy.`,
    media: [],
    reflection: {
      summary: 'You reached a meaningful milestone in mindfulness by embracing gentle observation rather than harsh self-critique.',
      themes: ['Consistency', 'Self-Compassion', 'Mindfulness', 'Habits'],
      observations: ['Reframing meditation from performance to friendly curiosity unlocked consistency.'],
      questions: ['What other daily practices might flourish if approached with the same gentle curiosity?'],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 263).toISOString(),
    },
  },
];
