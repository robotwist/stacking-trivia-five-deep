# 🎯 Deep Dive Question Quality Framework
## Ensuring Progressive Depth vs. Breadth in Trivia Stacks

### **Core Philosophy: "Go Deep, Not Wide"**
Each stack should take players on a **focused journey** deeper into a specific topic, not a surface-level tour of related subjects.

---

## 📊 **Deep vs. Breadth Matrix**

### **❌ BREADTH (Avoid This)**
Questions that jump between different topics within a subject:
- Q1: Van Gogh's most famous painting
- Q2: Picasso's blue period  
- Q3: Monet's water lilies
- Q4: Da Vinci's inventions
- Q5: Sculpture techniques

### **✅ DEPTH (Aim for This)**
Questions that dig deeper into the same focused topic:
- Q1: Van Gogh's most famous painting
- Q2: What mental condition affected Van Gogh's art?
- Q3: How many paintings did Van Gogh sell in his lifetime?
- Q4: Who was Van Gogh's art dealer brother?
- Q5: What happened to Van Gogh's ear, and why?

---

## 🎯 **Progressive Depth Structure**

### **Levels 1-5: Foundation Layer**
- **Purpose**: Establish basic knowledge everyone should know
- **Style**: Direct, factual questions
- **Example Path** (Nebraska Sports):
  1. Team name → 2. Stadium → 3. Famous coach → 4. Championship years → 5. Capacity

### **Levels 6-15: Context Layer**
- **Purpose**: Add context, relationships, and "why" questions
- **Style**: Connect facts to broader understanding
- **Example Path** (Nebraska Sports):
  6. Conference history → 7. Rivalry details → 8. Coaching philosophy → 9. Recruiting secrets → 10. Cultural impact

### **Levels 16-25: Insider Layer**
- **Purpose**: Details only true fans/experts would know
- **Style**: Nuanced questions requiring deep knowledge
- **Example Path** (Nebraska Sports):
  16. Assistant coach names → 17. Specific game moments → 18. Player nicknames → 19. Locker room traditions → 20. Recruitment stories

### **Levels 26-35: Expert Layer**
- **Purpose**: Obscure facts that demonstrate mastery
- **Style**: Trivia that even experts might struggle with
- **Example Path** (Nebraska Sports):
  26. Equipment manager details → 27. Stadium construction facts → 28. Minor record holders → 29. Off-season activities → 30. Behind-the-scenes stories

---

## 🔍 **Quality Assurance Checklist**

### **Before Creating Questions:**
- [ ] **Single Focus**: Does this stack focus on ONE specific topic/person/event?
- [ ] **Narrative Arc**: Do questions tell a deeper story together?
- [ ] **No Topic Jumping**: Am I staying within the same subject area?

### **During Question Creation:**
- [ ] **Dependency Check**: Does each question build on previous knowledge?
- [ ] **Depth Escalation**: Does each level require more specialized knowledge?
- [ ] **Context Expansion**: Do later questions add "why" and "how" to earlier "what"?

### **After Question Creation:**
- [ ] **Expert Review**: Would a subject expert find the progression logical?
- [ ] **Casual Test**: Would a casual fan learn something new at each level?
- [ ] **Connection Test**: Do questions connect to each other rather than stand alone?

---

## 📋 **Question Type Evolution**

### **Early Questions (1-10):**
- **Format**: "What is...?" "Who was...?" "When did...?"
- **Knowledge Level**: Public facts, basic recognition
- **Example**: "What stadium do the Cornhuskers play in?"

### **Middle Questions (11-20):**
- **Format**: "Why did...?" "How did...?" "What caused...?"
- **Knowledge Level**: Understanding relationships and context
- **Example**: "Why did Nebraska leave the Big 12 for the Big Ten?"

### **Deep Questions (21-30):**
- **Format**: "Which assistant...?" "What nickname...?" "What tradition...?"
- **Knowledge Level**: Insider knowledge, cultural details
- **Example**: "What was the nickname for Nebraska's offensive line in the 1990s?"

### **Expert Questions (31+):**
- **Format**: Specific numbers, obscure connections, behind-scenes details
- **Knowledge Level**: Only true experts/insiders would know
- **Example**: "What year was Memorial Stadium's current sound system installed?"

---

## 🎯 **Stack Depth Templates**

### **Template 1: Biography Deep Dive**
1-5: Basic life facts → 6-10: Major achievements → 11-15: Personality/methods → 16-20: Lesser-known works → 21-25: Personal relationships → 26-30: Legacy details → 31-35: Trivia/anecdotes

### **Template 2: Event/Institution Deep Dive**
1-5: Basic facts → 6-10: Historical context → 11-15: Key figures → 16-20: Behind-scenes → 21-25: Cultural impact → 26-30: Evolution over time → 31-35: Modern connections

### **Template 3: Cultural Phenomenon Deep Dive**
1-5: Surface recognition → 6-10: Origins/creators → 11-15: Peak popularity → 16-20: Influence/impact → 21-25: Controversies/challenges → 26-30: Evolution → 31-35: Current relevance

---

## 🚫 **Anti-Patterns to Avoid**

### **The Wikipedia Walk**
❌ Starting with Van Gogh → Ending with abstract art history
✅ Starting with Van Gogh → Ending with Van Gogh's personal struggles

### **The Name Drop**
❌ Q15: "Which famous artist was friends with Van Gogh?" (Introduces new topic)
✅ Q15: "What did Van Gogh's brother Theo think of his painting style?" (Deepens current topic)

### **The Trivia Grab Bag**
❌ Random facts about Nebraska: football, corn, weather, politics, geography
✅ Progressive Nebraska football facts: basics → history → culture → insider knowledge

### **The Difficulty Spike**
❌ Q5: Basic fact → Q6: Extremely obscure detail
✅ Q5: Basic fact → Q6: Slightly more specific version of that fact

---

## 🛠️ **Automated Quality Tools**

### **Depth Scoring Algorithm**
```javascript
function calculateDepthScore(questions) {
  let score = 0;
  for (let i = 1; i < questions.length; i++) {
    // Check if current question builds on previous
    if (references(questions[i], questions[i-1])) score += 2;
    
    // Check if question requires knowledge from earlier questions
    if (requiresPriorKnowledge(questions[i], questions.slice(0, i))) score += 3;
    
    // Penalize topic jumping
    if (changesTopic(questions[i], questions[i-1])) score -= 5;
  }
  return score / questions.length;
}
```

### **Content Review Prompts**
1. **"Can you answer Q15 without knowing Q1-14?"** → If yes, too disconnected
2. **"Do questions 20-25 feel like a different stack?"** → If yes, too broad  
3. **"Would an expert be surprised by Q30?"** → If no, not deep enough

---

## 🎯 **Nebraska Stack Analysis**

### **Your Current Nebraska Stack (✅ Good Examples):**
- **Q1→Q5**: Team basics → Stadium → Stars → Coach → Capacity (logical foundation)
- **Q21**: "375 consecutive sellouts" (insider knowledge that requires context)
- **Q28**: "The Pipeline" nickname (cultural knowledge only fans know)

### **Quality Improvements Made:**
- **Progressive revelation**: Each question assumes knowledge from previous
- **Single focus**: All questions about Nebraska sports, not general college sports
- **Cultural depth**: Includes nicknames, traditions, specific moments
- **Expert level**: Questions 30-35 include details only die-hard fans know

---

## 🏆 **Quality Certification Process**

### **Level 1: Self-Check**
- [ ] All questions focus on the same topic
- [ ] Questions get progressively more specific
- [ ] Later questions assume knowledge from earlier ones

### **Level 2: Expert Review**
- [ ] Subject matter expert reviews progression
- [ ] Confirms depth vs. breadth balance
- [ ] Validates difficulty escalation

### **Level 3: Player Testing**
- [ ] Casual fans can answer levels 1-10
- [ ] Enthusiasts struggle with levels 15-25  
- [ ] Only experts can complete levels 30-35

---

This framework ensures every stack takes players on a **focused journey deeper** into a topic rather than a surface-level survey. Your Nebraska stack already follows many of these principles - that's why it feels authentically "deep" rather than just "broad"!
