export interface GrammarTopicGuide {
  category: 'Modal Verbs' | 'Future Forms';
  title: string;
  summary: string;
  keyPoints: {
    form: string;
    usage: string;
    examples: string[];
    note?: string;
  }[];
  comparisons?: {
    itemA: string;
    itemB: string;
    difference: string;
  }[];
}

export const grammarGuides: GrammarTopicGuide[] = [
  {
    category: 'Modal Verbs',
    title: 'Ability & Inability',
    summary: 'Expressing what someone is or was capable of doing.',
    keyPoints: [
      {
        form: 'can / can\'t + verb',
        usage: 'Present general ability or situational capability.',
        examples: ['She can speak three languages now.', 'I can\'t hear you.'],
      },
      {
        form: 'could / couldn\'t + verb',
        usage: 'Past general ability.',
        examples: ['When I was six, I could ride a bike.', 'He couldn\'t swim when he was young.'],
      },
      {
        form: 'will be able to + verb',
        usage: 'Future ability (replaces "can" for future time).',
        examples: ['I will be able to help you tomorrow.'],
      },
    ],
  },
  {
    category: 'Modal Verbs',
    title: 'Permission vs Prohibition vs No Obligation',
    summary: 'The critical distinctions between asking/granting permission, forbidding, and lack of necessity.',
    keyPoints: [
      {
        form: 'May I / Can I / be allowed to',
        usage: 'Asking for and giving permission.',
        examples: ['May I come in, please? (Formal)', 'Can I borrow your pen? (Informal)', 'Students are allowed to use calculators.'],
      },
      {
        form: 'mustn\'t / may not / aren\'t allowed to',
        usage: 'Prohibition — something is strictly forbidden and against the rules.',
        examples: ['You mustn\'t smoke here.', 'Visitors may not enter this area.', 'Students aren\'t allowed to use phones.'],
        note: 'Mustn\'t means 0% permission (Forbidden)!',
      },
      {
        form: 'don\'t have to / don\'t need to / needn\'t',
        usage: 'No obligation — something is optional, not mandatory.',
        examples: ['You don\'t have to come if you don\'t want to.', 'You don\'t need to buy anything.', 'We needn\'t wait.'],
        note: 'Don\'t have to means you have a choice!',
      },
    ],
    comparisons: [
      {
        itemA: 'mustn\'t (Prohibition)',
        itemB: 'don\'t have to (No Obligation)',
        difference: '"You mustn\'t go" = Do NOT go (forbidden). "You don\'t have to go" = You can go or stay; it is not necessary.',
      },
    ],
  },
  {
    category: 'Modal Verbs',
    title: 'Obligation & Advice',
    summary: 'Expressing necessity, external requirements, advice, and warnings.',
    keyPoints: [
      {
        form: 'must + base verb',
        usage: 'Internal obligation felt by the speaker.',
        examples: ['I must study harder. I think it is important.'],
      },
      {
        form: 'have to / has to + verb',
        usage: 'External obligation from rules, laws, or school policies.',
        examples: ['Students have to wear uniforms because it is a school rule.'],
      },
      {
        form: 'should / shouldn\'t + verb',
        usage: 'General advice or opinion.',
        examples: ['You should study more.', 'You shouldn\'t eat too much sugar.'],
      },
      {
        form: 'ought to + verb',
        usage: 'Formal advice or moral duty (synonym to should).',
        examples: ['You ought to apologize.'],
      },
      {
        form: '\'d better (had better) + verb',
        usage: 'Strong advice or warning of negative consequence.',
        examples: ['You\'d better take an umbrella (or you will get soaked).'],
      },
      {
        form: 'shouldn\'t have + V3 (Past Participle)',
        usage: 'Expressing regret or past criticism.',
        examples: ['I shouldn\'t have shouted at her.'],
      },
    ],
  },
  {
    category: 'Modal Verbs',
    title: 'Certainty & Possibility (Deductions)',
    summary: 'Making logical deductions based on evidence and assessing probability.',
    keyPoints: [
      {
        form: 'must be / must have',
        usage: 'Positive certainty (95%+ sure based on evidence).',
        examples: ['She studies every day. She must be hardworking.'],
      },
      {
        form: 'can\'t be / can\'t have',
        usage: 'Negative certainty (impossible based on evidence).',
        examples: ['He can\'t be at home. His car isn\'t there.'],
      },
      {
        form: 'may / might / could + verb',
        usage: 'Possibility (around 30-50% chance).',
        examples: ['It may rain tomorrow.', 'She might come later.', 'We could miss the train.'],
      },
      {
        form: 'should + verb',
        usage: 'Normal expectation / prediction.',
        examples: ['The bus should arrive soon.'],
      },
    ],
  },
  {
    category: 'Future Forms',
    title: 'Core Future Forms in English',
    summary: 'Selecting the correct future tense based on intention, arrangement, instant decision, or timetable.',
    keyPoints: [
      {
        form: 'will + verb',
        usage: 'Spontaneous instant decisions, promises, offers, or personal opinions.',
        examples: ['I\'m thirsty. I think I will have some water.', 'I will help you.'],
      },
      {
        form: 'be going to + verb',
        usage: 'Prior intentions / premeditated plans, or predictions with present visual evidence.',
        examples: ['I am going to study harder this semester. It is my intention.'],
      },
      {
        form: 'Present Continuous (am/is/are + V-ing)',
        usage: 'Arranged events involving other people, places, and times already organized.',
        examples: ['I am meeting my friend tomorrow. We have arranged it.'],
      },
      {
        form: 'Present Simple',
        usage: 'Timetables, official schedules, public transport, cinema programs.',
        examples: ['The plane leaves at 7:30 p.m. according to the timetable.'],
      },
      {
        form: 'Future Continuous (will be + V-ing)',
        usage: 'Action in progress at a specific exact point in the future.',
        examples: ['This time tomorrow, I will be studying.'],
      },
      {
        form: 'Time Clauses (when, as soon as, before) + Present Simple',
        usage: 'In dependent future time clauses, use Present Simple, NOT will.',
        examples: ['When I see him (NOT when I will see him), I will tell him.'],
      },
    ],
  },
  {
    category: 'Future Forms',
    title: 'Special Future Phrases',
    summary: 'Phrases that convey proximity, schedule, and likelihood.',
    keyPoints: [
      {
        form: 'be about to + verb',
        usage: 'Immediate future (in the next few seconds or minutes).',
        examples: ['The bus is about to leave.'],
      },
      {
        form: 'be due to + verb',
        usage: 'Expected according to official schedule or calendar.',
        examples: ['The train is due to leave at 8 a.m.'],
      },
      {
        form: 'be likely / unlikely to + verb',
        usage: 'High or low probability of an event occurring.',
        examples: ['They are unlikely to come.'],
      },
    ],
  },
];
