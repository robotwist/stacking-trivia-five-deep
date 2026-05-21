/**
 * Deep Dive Question Templates
 *
 * LEGACY: Written for 35-question "ultimate" stacks. Playable stacks use exactly 5
 * questions per docs/GOLD_STANDARD_STACK.md and tools/stackValidator.js.
 */

export const DEPTH_TEMPLATES = {
  
  // Template 1: Person/Biography Deep Dive
  personBiography: {
    name: "Person/Biography Deep Dive",
    description: "Progressive exploration of a specific person's life, work, and impact",
    structure: {
      "levels_1_5": {
        title: "Recognition Layer",
        purpose: "Basic facts everyone should know",
        examples: [
          "What is [Person]'s most famous work/achievement?",
          "When/where was [Person] born?", 
          "What field was [Person] known for?",
          "What major award/recognition did [Person] receive?",
          "When did [Person] die/retire?"
        ]
      },
      "levels_6_15": {
        title: "Context Layer", 
        purpose: "Understanding their methods, influences, and key relationships",
        examples: [
          "Who was [Person]'s biggest influence/mentor?",
          "What technique/method was [Person] famous for?",
          "Who did [Person] collaborate with most frequently?",
          "What personal challenge/struggle did [Person] overcome?",
          "What was [Person]'s breakthrough moment?"
        ]
      },
      "levels_16_25": {
        title: "Insider Layer",
        purpose: "Details only true fans/experts know",
        examples: [
          "What was [Person]'s real first/middle name?",
          "What nickname did [Person]'s friends use?",
          "What was [Person]'s daily routine/work habit?",
          "What lesser-known work did [Person] create?",
          "What controversy was [Person] involved in?"
        ]
      },
      "levels_26_35": {
        title: "Expert Layer",
        purpose: "Obscure details demonstrating mastery",
        examples: [
          "What was [Person]'s final/unfinished project?",
          "Which specific tool/equipment did [Person] prefer?",
          "What did [Person] say about their own work in private letters?",
          "How did [Person]'s family/children remember them?",
          "What myth about [Person] is actually false?"
        ]
      }
    }
  },

  // Template 2: Institution/Organization Deep Dive  
  institutionDeepDive: {
    name: "Institution/Organization Deep Dive",
    description: "Progressive exploration of a team, company, school, or institution",
    structure: {
      "levels_1_5": {
        title: "Basic Facts",
        examples: [
          "What is [Institution]'s official name?",
          "Where is [Institution] located?",
          "When was [Institution] founded?",
          "Who is [Institution]'s current leader/coach?",
          "What is [Institution] best known for?"
        ]
      },
      "levels_6_15": {
        title: "History & Culture",
        examples: [
          "What conference/league is [Institution] part of?",
          "What are [Institution]'s traditional colors/symbols?",
          "Who was [Institution]'s most successful leader?",
          "What is [Institution]'s biggest rivalry?",
          "What major achievement is [Institution] most proud of?"
        ]
      },
      "levels_16_25": {
        title: "Traditions & Insider Knowledge",
        examples: [
          "What is [Institution]'s unofficial motto/saying?",
          "What tradition do only insiders know about?",
          "What nickname do people use for [Institution]?",
          "What is [Institution]'s most famous alumni/graduate?",
          "What controversy has [Institution] overcome?"
        ]
      },
      "levels_26_35": {
        title: "Deep Institutional Memory",
        examples: [
          "What was [Institution]'s original name/purpose?",
          "Who is [Institution]'s most unsung hero?",
          "What tradition was discontinued and why?",
          "What does [Institution]'s staff call their workplace?",
          "What legend/story is passed down internally?"
        ]
      }
    }
  },

  // Template 3: Event/Phenomenon Deep Dive
  eventDeepDive: {
    name: "Event/Phenomenon Deep Dive", 
    description: "Progressive exploration of a specific event, movement, or cultural phenomenon",
    structure: {
      "levels_1_5": {
        title: "Basic Recognition",
        examples: [
          "What is [Event/Phenomenon]?",
          "When did [Event/Phenomenon] occur/begin?",
          "Where did [Event/Phenomenon] take place?",
          "Who was the main figure in [Event/Phenomenon]?",
          "Why is [Event/Phenomenon] historically significant?"
        ]
      },
      "levels_6_15": {
        title: "Context & Causes",
        examples: [
          "What led up to [Event/Phenomenon]?",
          "Who were the other key players involved?",
          "What was the immediate reaction to [Event/Phenomenon]?",
          "How long did [Event/Phenomenon] last?",
          "What was the most dramatic moment of [Event/Phenomenon]?"
        ]
      },
      "levels_16_25": {
        title: "Behind the Scenes",
        examples: [
          "What almost went wrong during [Event/Phenomenon]?",
          "Who opposed [Event/Phenomenon] and why?",
          "What secret detail wasn't known at the time?",
          "How did participants really feel about [Event/Phenomenon]?",
          "What was the most unexpected outcome?"
        ]
      },
      "levels_26_35": {
        title: "Legacy & Hidden Details",
        examples: [
          "What myth about [Event/Phenomenon] is actually false?",
          "Who has been forgotten but played a crucial role?",
          "What document/artifact from [Event/Phenomenon] still exists?",
          "How do modern experts view [Event/Phenomenon] differently?",
          "What connection does [Event/Phenomenon] have to current events?"
        ]
      }
    }
  }
};

// Question Quality Validators
export const QUALITY_VALIDATORS = {
  
  checkDepthProgression: (questions) => {
    const issues = [];
    
    for (let i = 1; i < questions.length; i++) {
      const current = questions[i];
      const previous = questions[i-1];
      
      // Check if question builds on previous knowledge
      if (!referencesContext(current, questions.slice(0, i))) {
        issues.push({
          level: current.level,
          type: 'DISCONNECTED',
          message: `Question ${current.level} doesn't build on previous knowledge`
        });
      }
      
      // Check difficulty progression
      if (i > 10 && isBasicFact(current)) {
        issues.push({
          level: current.level,
          type: 'TOO_BASIC',  
          message: `Question ${current.level} too basic for this depth level`
        });
      }
    }
    
    return issues;
  },

  checkFocusConsistency: (questions, mainTopic) => {
    const issues = [];
    
    questions.forEach(q => {
      if (!staysOnTopic(q, mainTopic)) {
        issues.push({
          level: q.level,
          type: 'OFF_TOPIC',
          message: `Question ${q.level} strays from main topic: ${mainTopic}`
        });
      }
    });
    
    return issues;
  },

  checkExpertLevel: (questions) => {
    const expertQuestions = questions.filter((q, i) => i >= 25);
    const expertCount = expertQuestions.filter(hasExpertIndicators).length;
    
    if (expertCount < expertQuestions.length * 0.7) {
      return [{
        type: 'INSUFFICIENT_EXPERT',
        message: 'Final questions lack expert-level depth'
      }];
    }
    
    return [];
  }
};

// Helper functions for validation
function referencesContext(question, previousQuestions) {
  const questionText = question.question.toLowerCase();
  
  return previousQuestions.some(prev => {
    const prevAnswer = prev.answer.toLowerCase();
    const keywords = prevAnswer.split(' ').filter(word => word.length > 3);
    return keywords.some(keyword => questionText.includes(keyword));
  });
}

function isBasicFact(question) {
  const basicPatterns = [
    /^what is/i,
    /^when was/i, 
    /^where is/i,
    /^who is/i,
    /^how many/i
  ];
  
  return basicPatterns.some(pattern => pattern.test(question.question));
}

function staysOnTopic(question, mainTopic) {
  const questionText = question.question.toLowerCase();
  const topicWords = mainTopic.toLowerCase().split(' ');
  
  return topicWords.some(word => 
    word.length > 3 && questionText.includes(word)
  );
}

function hasExpertIndicators(question) {
  const expertPatterns = [
    /nickname/i,
    /real name/i, 
    /behind.{0,10}scenes/i,
    /lesser.{0,10}known/i,
    /specific/i,
    /exact/i,
    /assistant/i,
    /second/i,
    /backup/i
  ];
  
  return expertPatterns.some(pattern => 
    pattern.test(question.question) || pattern.test(question.answer)
  );
}

// Pre-made question starters for each depth level
export const QUESTION_STARTERS = {
  foundation: [
    "What is {topic}'s most famous...",
    "When did {topic}...",
    "Where is/was {topic}...",
    "Who created/founded {topic}...",
    "How is {topic} best known..."
  ],
  
  context: [
    "Why did {topic}...",
    "How did {topic} become...", 
    "What influenced {topic}'s...",
    "Who was {topic}'s main...",
    "What led to {topic}'s..."
  ],
  
  insider: [
    "What nickname did {topic}...",
    "What technique did {topic} use for...",
    "Who was {topic}'s lesser-known...",
    "What tradition does {topic} have that...",
    "What controversy surrounded {topic}'s..."
  ],
  
  expert: [
    "What was {topic}'s original working title for...",
    "Which specific tool/method did {topic} prefer for...",
    "What did {topic} say privately about...",
    "What myth about {topic} is actually false...",
    "Who has been forgotten but actually helped {topic}..."
  ]
};

// Usage example for Nebraska Sports
export const NEBRASKA_EXAMPLE = {
  topic: "Nebraska Football",
  foundation_questions: [
    "What is Nebraska's football team called?",
    "In what stadium do they play home games?", 
    "Who was their legendary coach in the 1990s?",
    "How many national championships did Tom Osborne win?",
    "What is Memorial Stadium's capacity?"
  ],
  context_questions: [
    "Why did Nebraska leave the Big 12 for the Big Ten?",
    "What made Tom Osborne's coaching philosophy unique?",
    "How did Nebraska build their recruiting pipeline?",
    "What was the secret to Nebraska's offensive success?",
    "Why is Nebraska's fanbase considered so loyal?"
  ],
  insider_questions: [
    "What nickname did players give the offensive line?",
    "What tradition happens in Memorial Stadium's tunnel?",
    "What did Tom Osborne always carry during games?",
    "What phrase appears in Nebraska's weight room?",
    "What do players call their practice facility?"
  ],
  expert_questions: [
    "What was Tom Osborne's real first job at Nebraska?",
    "Which assistant coach actually designed the option offense?",
    "What superstition did Eric Crouch have before games?",
    "What does the 'N' on the helmet specifically represent?",
    "What tradition was discontinued in the 1980s and why?"
  ]
};

console.log("🎯 Deep Dive Templates Loaded!");
console.log("Use DEPTH_TEMPLATES for structured question creation");
console.log("Use QUALITY_VALIDATORS to check stack depth quality");
console.log("Use QUESTION_STARTERS for inspiration at each level");
