// Hypertextual Stack Connector System
// Creates intelligent links between trivia stacks based on shared knowledge domains

export class StackConnector {
  constructor() {
    this.connectionTypes = {
      PERSON: 'person',           // Shared historical figures
      LOCATION: 'location',       // Shared geographical locations  
      ERA: 'era',                 // Shared time periods
      THEME: 'theme',             // Shared conceptual themes
      ENTITY: 'entity',           // Shared organizations/companies
      MEDIUM: 'medium',           // Shared artistic mediums
      SPORT: 'sport'              // Shared sports/activities
    };
    
    // Connection definitions between stacks
    this.stackConnections = {
      'minecraft': {
        connections: [
          {
            targetStack: 'steve-jobs',
            connectionType: this.connectionTypes.THEME,
            trigger: 'redstone',
            connection: 'computational thinking',
            bridgeQuestion: "What Apple co-founder revolutionized personal computing with intuitive design, similar to Minecraft's accessible yet powerful redstone systems?",
            unlockMessage: "🔗 CONNECTION DISCOVERED: From Redstone to Revolution! Both Minecraft's redstone and Steve Jobs' vision made complex technology accessible to everyone."
          },
          {
            targetStack: 'blippi',
            connectionType: this.connectionTypes.THEME,
            trigger: 'educational',
            connection: 'learning through play',
            bridgeQuestion: "What educational children's character teaches colors and numbers through interactive play, similar to how Minecraft teaches engineering and creativity?",
            unlockMessage: "🎓 LEARNING LINK: Educational Play! Both Minecraft and Blippi prove that learning happens best through hands-on exploration."
          }
        ]
      },
      
      'james-taylor': {
        connections: [
          {
            targetStack: 'the-cranberries',
            connectionType: this.connectionTypes.MEDIUM,
            trigger: 'folk',
            connection: 'acoustic storytelling',
            bridgeQuestion: "What Irish band's lead singer Dolores O'Riordan shared James Taylor's gift for emotional acoustic storytelling?",
            unlockMessage: "🎵 MUSICAL THREAD: Acoustic Souls! Both artists used simple instrumentation to create profound emotional connections."
          },
          {
            targetStack: 'van-gogh',
            connectionType: this.connectionTypes.THEME,
            trigger: 'emotional expression',
            connection: 'artistic vulnerability',
            bridgeQuestion: "What Dutch post-impressionist painter shared James Taylor's willingness to express deep personal struggles through his art?",
            unlockMessage: "🎨 ARTISTIC BOND: Vulnerable Expression! Both Taylor's lyrics and Van Gogh's brushstrokes revealed their inner emotional landscapes."
          }
        ]
      },
      
      'nebraska-sports': {
        connections: [
          {
            targetStack: 'okc-thunder',
            connectionType: this.connectionTypes.THEME,
            trigger: 'heartland basketball',
            connection: 'midwest basketball culture',
            bridgeQuestion: "What NBA team, like Nebraska's Huskers, represents passionate basketball culture in America's heartland?",
            unlockMessage: "🏀 HEARTLAND HOOPS: Midwest Basketball! Both Nebraska and Oklahoma share that passionate, community-driven sports culture."
          },
          {
            targetStack: 'el-guerrouj-ultimate',
            connectionType: this.connectionTypes.THEME,
            trigger: 'athletic excellence',
            connection: 'dedication to sport',
            bridgeQuestion: "What Moroccan middle-distance runner embodied the same relentless dedication as Nebraska's greatest athletes?",
            unlockMessage: "🏃‍♂️ DEDICATION THREAD: Athletic Excellence! Both Nebraska sports and El Guerrouj represent unwavering commitment to athletic greatness."
          }
        ]
      },
      
      'wes-anderson': {
        connections: [
          {
            targetStack: 'ernest-movies',
            connectionType: this.connectionTypes.MEDIUM,
            trigger: 'visual comedy',
            connection: 'distinctive film style',
            bridgeQuestion: "What comedy film character, like Wes Anderson's protagonists, had a completely distinctive and instantly recognizable style?",
            unlockMessage: "🎬 STYLE SIGNATURE: Distinctive Cinema! Both Ernest and Anderson created unmistakable visual languages that audiences instantly recognize."
          }
        ]
      },
      
      'tyler-the-creator': {
        connections: [
          {
            targetStack: 'james-taylor',
            connectionType: this.connectionTypes.THEME,
            trigger: 'artistic evolution',
            connection: 'musical growth',
            bridgeQuestion: "What folk singer-songwriter, like Tyler the Creator, showed dramatic artistic evolution from his early work to mature albums?",
            unlockMessage: "🎵 EVOLUTION ARC: Musical Growth! Both artists transformed from their early styles into more sophisticated, emotionally complex musicians."
          },
          {
            targetStack: 'tame-impala',
            connectionType: this.connectionTypes.THEME,
            trigger: 'production innovation',
            connection: 'studio creativity',
            bridgeQuestion: "What Australian psychedelic project, like Tyler's Odd Future work, revolutionized music through innovative home studio production?",
            unlockMessage: "🎛️ PRODUCTION WIZARDS: Studio Innovation! Both Tyler and Kevin Parker proved that bedroom producers could reshape entire genres."
          }
        ]
      }
    };
  }
  
  // Check if a question triggers any connections
  checkForConnections(currentStack, questionLevel, questionText, userAnswer) {
    const stackConnections = this.stackConnections[currentStack];
    if (!stackConnections) return null;
    
    const discoveredConnections = [];
    
    stackConnections.connections.forEach(connection => {
      // Check if this question triggers a connection
      if (this.triggerMatches(questionText, userAnswer, connection.trigger)) {
        discoveredConnections.push({
          ...connection,
          discoveryLevel: questionLevel,
          pointBonus: this.calculateConnectionBonus(questionLevel)
        });
      }
    });
    
    return discoveredConnections.length > 0 ? discoveredConnections : null;
  }
  
  // Check if question content matches connection trigger
  triggerMatches(questionText, userAnswer, trigger) {
    const searchText = (questionText + ' ' + userAnswer).toLowerCase();
    
    switch (trigger) {
      case 'redstone':
        return searchText.includes('redstone') || searchText.includes('circuit') || searchText.includes('repeater');
      case 'folk':
        return searchText.includes('acoustic') || searchText.includes('folk') || searchText.includes('storytelling');
      case 'heartland basketball':
        return searchText.includes('basketball') || searchText.includes('court') || searchText.includes('midwest');
      default:
        return searchText.includes(trigger);
    }
  }
  
  // Calculate bonus points for discovering connections
  calculateConnectionBonus(level) {
    const baseBonus = 50;
    const levelMultiplier = Math.floor(level / 5) * 10;
    return baseBonus + levelMultiplier;
  }
  
  // Generate the connection discovery UI data
  generateConnectionDiscovery(connection) {
    return {
      type: 'STACK_CONNECTION_DISCOVERED',
      message: connection.unlockMessage,
      targetStack: connection.targetStack,
      connectionType: connection.connectionType,
      bridgeQuestion: connection.bridgeQuestion,
      pointBonus: connection.pointBonus,
      actions: [
        {
          type: 'CONTINUE_CURRENT',
          label: 'Continue Current Stack',
          description: 'Keep playing this stack'
        },
        {
          type: 'EXPLORE_CONNECTION',
          label: `Explore ${connection.targetStack}`,
          description: 'Jump to the connected stack',
          bonusPoints: 25 // Bonus for exploration
        },
        {
          type: 'BOOKMARK_CONNECTION',
          label: 'Bookmark for Later',
          description: 'Save this connection to explore later'
        }
      ]
    };
  }
}

// Export singleton instance
export const stackConnector = new StackConnector();
