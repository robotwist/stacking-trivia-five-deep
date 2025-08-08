# 🎯 DeepStack: Current State → Vision Roadmap

## **Where We Are Now (MDP/MVP)**

### ✅ **Implemented**
- **Core Game Engine**: 5-question stacks with exponential scoring (10 × 2^depth)
- **Stack System**: JSON-based trivia content with multiple topics
- **Basic UI**: React + Tailwind, topic selection, answer input
- **Deployment**: Production-ready on Netlify + Heroku
- **Content**: 7+ trivia stacks (Van Gogh, Olympics, Beatles, etc.)

### ❌ **Missing from Vision**
- **Opening Image Round**: Visual prompt → 5-deep → determines first player
- **Multi-Team Structure**: Host mode, team management, live scoring
- **Performance Finale**: Creative synthesis with props/music
- **Theatrical Personality**: Monty Python + You Don't Know Jack energy
- **Regional Stack System**: Location-based trivia content
- **Social Mechanics**: Torch passing, echoes, collaborative play

---

## **🚀 Where We Want to Be (Full Vision)**

### **Game Title**: Go the Deepest
**Tagline**: "Trivia that dares to matter" - *Monty Python meets You Don't Know Jack meets bar culture*

### **Complete Game Format**:

#### **🎬 Round 1: "And Now for Something Completely Deep"**
- Animated intro with visual prompt (Tesla, vintage ad, landmark)
- All teams collaborate on 5-stack dive
- Winner of final question goes first
- Sets tone: visual → cultural → absurd

#### **🎲 Round 2: Individual Chosen Stacks**
- Each team gets pre-selected topic they know well
- Must complete full 5-stack to score (10→20→40→80→160 pts)
- Others can "snipe" failed stacks for partial points
- **Torch Pass Rule**: Can pass incomplete stack to rivals

#### **🗺️ Round 3: Regional Stack**
- Location-specific knowledge for all teams
- Iowa soybeans, Bay Area tech, local legends
- Encourages place-based cultural literacy

#### **🎡 Round 4: Chaos Stack**
- Random weird topics ("Actors Who Were Wrestlers")
- **Echo Questions**: Earlier answers reappear in disguised form
- Adds unpredictability and humor

#### **🎭 Round 5: Performance Finale - "GO THE DEEPEST"**
- Guitar, mic with beats, costumes provided
- Teams create song/play/rap using session topics
- Judges on accuracy + depth + creativity + cohesion
- Can flip entire game outcome

### **🎪 Personality & Style**:
- **Narrator Voice**: Sarcastic, intellectually playful
- **Visual Style**: Cut-paper animation, collage intros
- **Sound Design**: Descent metaphors, ambient drones
- **Language**: "Shafts, layers, tunnels, strata"

### **🏗️ Technical Architecture**:
- **Host Mode**: Admin dashboard for bar/event management
- **Team Management**: 2-6 teams, live scoreboard
- **Stack Creator**: Community content generation
- **Mobile Companion**: Buzzer input, study mode
- **Regional API**: Location-based stack loading

---

## **📈 3-Phase Roadmap**

### **Phase 1: Bar-Ready MDP** *(2-3 weeks)*
- [ ] Host/Admin mode with team management
- [ ] Opening image round (hardcoded for now)  
- [ ] Performance finale placeholder
- [ ] Projector-friendly scoreboard
- [ ] Basic "depth descent" UI metaphors

### **Phase 2: Theatrical Experience** *(1-2 months)*
- [ ] Animated intros and transitions
- [ ] Narrator voiceover system
- [ ] Social mechanics (torch pass, echoes)
- [ ] Regional stack API
- [ ] Mobile companion app

### **Phase 3: Cultural Platform** *(3-6 months)*
- [ ] Community stack creator
- [ ] Educational study guides
- [ ] Bar licensing system
- [ ] Performance video uploads
- [ ] National tournament infrastructure

---

## **🎯 Success Metrics**

### **MDP Success**: 
- One successful bar night with 3+ teams
- Players request "when's the next one?"
- Format feels distinctly different from regular trivia

### **Platform Success**:
- 10+ bars running weekly games
- User-generated content > 50% of stacks
- Educational partnerships (colleges, libraries)

### **Cultural Impact**:
- "Deep trivia" becomes a recognized format
- Study groups form around stack topics
- Academic/cultural institutions adopt model

---

## **💰 Monetization Strategy**

### **Near-term** (MVP):
- Bar licensing: $30/month per venue
- Custom regional stacks: $500/creation

### **Medium-term** (Platform):
- Mobile app: Freemium with premium stacks
- Educational partnerships: Licensing to schools
- Performance contest prizes and sponsorships

### **Long-term** (Network):
- Tournament entry fees
- Branded merchandise and study materials
- Content creator revenue sharing

---

## **🔧 Technical Priorities for Copilot**

When building features, prioritize:
1. **Bar Usability**: Can this work on a laptop + projector?
2. **Social Dynamics**: Does this encourage group play?
3. **Cultural Depth**: Does this reward real knowledge?
4. **Theatrical Fun**: Is this entertaining to watch?
5. **Scalable Content**: Can communities create this?

**Key Architecture Decisions**:
- Start with local/browser state, evolve to backend
- Prioritize real-time multiplayer over solo features  
- Build stack format to be human-readable and editable
- Design UI for both players and audience (spectacle)
- Make performance round feel like earned celebration

---

*This roadmap guides development from "working trivia app" to "cultural phenomenon that replaces boring bar trivia with something that actually matters."*
