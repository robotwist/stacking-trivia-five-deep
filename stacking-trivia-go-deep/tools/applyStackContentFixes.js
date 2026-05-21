#!/usr/bin/env node
/**
 * Apply narrative depth fixes to playable stacks that fail validation.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

/** @type {Record<string, object>} */
const FIXES = {
  'src/data/categories/arts-culture/the-beatles-ultimate.json': {
    title: 'The Beatles: Fab Four',
    description: 'From Liverpool docks to Abbey Road—five steps through Beatlemania',
    image: 'abbey-road-crossing.jpg',
    imageHint: 'The iconic zebra crossing from Abbey Road',
    category: 'music',
    questions: [
      { level: 1, question: "Which city were The Beatles formed in?", answer: 'Liverpool', acceptedAnswers: ['liverpool', 'liverpool england', 'liverpool uk'], hint: 'A port city in northwest England' },
      { level: 2, question: "After rising from Liverpool, what was The Beatles' first UK number-one single?", answer: 'Please Please Me', acceptedAnswers: ['please please me', 'please please me single'], explanation: 'Released in 1963, it launched Beatlemania' },
      { level: 3, question: "'Please Please Me' was the title track of their debut album—recorded in how many days?", answer: 'One', acceptedAnswers: ['one', '1', 'one day', 'a single day'], explanation: 'Their first album was famously recorded in one marathon session' },
      { level: 4, question: 'Who managed the Beatles and was called the Fifth Beatle?', answer: 'Brian Epstein', acceptedAnswers: ['brian epstein', 'epstein', 'brian'], explanation: 'Epstein discovered them at the Cavern Club' },
      { level: 5, question: "After Epstein's death, what was the Beatles' final album recorded together?", answer: 'Abbey Road', acceptedAnswers: ['abbey road', 'abbey road album'], explanation: 'Let It Be was released later but Abbey Road was their last sessions together' },
    ],
  },

  'src/data/categories/sports/olympic_distance_current.json': {
    title: 'Tokyo 2020 Olympic Distance Running',
    description: 'Follow the 800m from gold to silver across Tokyo 2020',
    image: 'olympic-torch.jpg',
    imageHint: 'The Olympic flame at Tokyo 2020',
    questions: [
      { level: 1, question: "Who won the men's 800m gold at the Tokyo 2020 Olympics?", answer: 'Emmanuel Korir', acceptedAnswers: ['emmanuel korir', 'korir', 'emmanuel kiprono korir'] },
      { level: 2, question: "Korir's event—the 800m—is how many meters?", answer: '800', acceptedAnswers: ['800', '800 meters', '800m', 'eight hundred'] },
      { level: 3, question: "Who won the women's 800m gold at the same Tokyo Games?", answer: 'Athing Mu', acceptedAnswers: ['athing mu', 'mu', 'athing'] },
      { level: 4, question: 'Who finished second behind Athing Mu in that 800m final?', answer: 'Keely Hodgkinson', acceptedAnswers: ['keely hodgkinson', 'hodgkinson', 'keely'] },
      { level: 5, question: 'Which country did Keely Hodgkinson represent?', answer: 'Great Britain', acceptedAnswers: ['great britain', 'britain', 'uk', 'united kingdom', 'england'] },
    ],
  },

  'src/data/categories/arts-culture/frida-kahlo.json': {
    title: 'Frida Kahlo: Pain into Art',
    image: 'self-portrait-thorn-necklace.jpg',
    imageHint: 'A 1940 self-portrait with thorn necklace and hummingbird',
    description: "From polio to the bus crash that defined Frida Kahlo's art",
    questions: [
      { level: 1, question: "Which Mexican artist painted 'The Two Fridas'?", answer: 'Frida Kahlo', acceptedAnswers: ['frida kahlo', 'kahlo', 'frida'] },
      { level: 2, question: 'At what age did Frida Kahlo contract polio?', answer: 'Six', acceptedAnswers: ['six', '6', 'six years old', 'age six'] },
      { level: 3, question: 'What accident at age 18 changed Kahlo\'s life forever?', answer: 'Bus accident', acceptedAnswers: ['bus accident', 'bus crash', 'trolley accident', 'streetcar accident'] },
      { level: 4, question: 'What metal object pierced through Frida\'s pelvis in that bus accident?', answer: 'Iron handrail', acceptedAnswers: ['iron handrail', 'handrail', 'metal handrail', 'iron rod'] },
      { level: 5, question: 'After the handrail injury, roughly how many surgeries did Frida endure?', answer: 'Over 30', acceptedAnswers: ['over 30', '30', 'more than 30', 'thirty', '30+'] },
    ],
  },

  'src/data/categories/arts-culture/miles-davis.json': {
    title: 'Miles Davis: Kind of Revolution',
    image: 'kind-of-blue-album.jpg',
    imageHint: 'The 1959 modal jazz album cover',
    description: "From Kind of Blue to first-take magic—Miles Davis's landmark session",
    questions: [
      { level: 1, question: "Which jazz trumpeter recorded the album 'Kind of Blue'?", answer: 'Miles Davis', acceptedAnswers: ['miles davis', 'davis', 'miles'] },
      { level: 2, question: "In what year was Miles Davis's 'Kind of Blue' recorded?", answer: '1959', acceptedAnswers: ['1959', 'nineteen fifty-nine', 'fifty-nine'] },
      { level: 3, question: "Which saxophonist played on 'Kind of Blue' alongside Miles?", answer: 'John Coltrane', acceptedAnswers: ['john coltrane', 'coltrane', 'trane'] },
      { level: 4, question: "Coltrane joined Miles in what jazz approach on 'Kind of Blue'?", answer: 'Modal jazz', acceptedAnswers: ['modal jazz', 'modal improvisation', 'modes', 'modal'] },
      { level: 5, question: "Most 'Kind of Blue' tracks were captured in how many takes?", answer: 'One take', acceptedAnswers: ['one take', 'first take', 'single take', '1 take', 'one'] },
    ],
  },

  'src/data/stacks/friends.json': {
    id: 'friends',
    title: 'Friends: Could This BE Any Deeper?',
    category: 'pop-culture',
    description: 'From Central Perk to Joey\'s fragrance—five steps through the sitcom',
    questions: [
      { level: 1, question: 'What coffee shop do the friends hang out at?', answer: 'Central Perk', acceptedAnswers: ['central perk', 'central perks', 'centralperk'], hint: 'Could this BE any more obvious?' },
      { level: 2, question: 'At Central Perk, what is Ross\'s profession?', answer: 'Paleontologist', acceptedAnswers: ['paleontologist', 'paleontology', 'dinosaur scientist'], hint: 'He works with dinosaurs' },
      { level: 3, question: "Ross's daughter Emma first laughed when he sang what song?", answer: 'Baby Got Back', acceptedAnswers: ['baby got back', "baby's got back", 'sir mix-a-lot', 'baby got back song'], hint: 'Sir Mix-a-Lot' },
      { level: 4, question: "Phoebe once found what in a soda can—and sued?", answer: 'A human thumb', acceptedAnswers: ['a human thumb', 'human thumb', 'thumb', 'a thumb'], hint: 'Definitely should not be in a drink' },
      { level: 5, question: "After that lawsuit, Joey pitched what men's fragrance?", answer: 'Ichiban', acceptedAnswers: ['ichiban', 'ichiban lipstick for men', 'lipstick for men', 'ichiban lipstick'], hint: 'Japanese for number one' },
    ],
  },
}

function writeStack(relPath, data) {
  const abs = path.join(root, relPath)
  fs.writeFileSync(abs, JSON.stringify(data, null, 2) + '\n')
  console.log(`FIXED: ${relPath}`)
}

const relPaths = process.argv.slice(2)
const toApply = relPaths.length ? relPaths.filter((p) => FIXES[p]) : Object.keys(FIXES)

for (const relPath of toApply) {
  writeStack(relPath, FIXES[relPath])
}

console.log(`\nApplied ${toApply.length} fixes`)
