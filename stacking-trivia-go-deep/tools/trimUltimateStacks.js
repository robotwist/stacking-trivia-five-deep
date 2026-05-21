#!/usr/bin/env node
/**
 * Replace 35-question "ultimate" stacks with focused 5-question narrative versions.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const ULTIMATE_STACKS = {
  'src/data/categories/sports/nebraska-sports-ultimate.json': {
    title: 'Nebraska Sports: Cornhusker Pride',
    description: 'From Memorial Stadium sellouts to Tom Osborne\'s dynasty',
    image: 'memorial-stadium.jpg',
    imageHint: 'The sea of red in Lincoln',
    questions: [
      { level: 1, question: "What is the University of Nebraska's football team called?", answer: 'Cornhuskers', acceptedAnswers: ['cornhuskers', 'huskers', 'nebraska cornhuskers'] },
      { level: 2, question: 'Where do the Cornhuskers play home football games?', answer: 'Memorial Stadium', acceptedAnswers: ['memorial stadium', 'memorial', 'the memorial stadium'] },
      { level: 3, question: 'Memorial Stadium is famous for what attendance streak from 1962 to 2022?', answer: 'Sellouts', acceptedAnswers: ['sellouts', 'sellout streak', 'consecutive sellouts', '375 sellouts'] },
      { level: 4, question: 'Who coached Nebraska to three national titles in the 1990s?', answer: 'Tom Osborne', acceptedAnswers: ['tom osborne', 'osborne', 'coach osborne'] },
      { level: 5, question: "What nickname did Osborne's dominant offensive line earn in the 1990s?", answer: 'Pipeline', acceptedAnswers: ['pipeline', 'the pipeline', 'nebraska pipeline'] },
    ],
  },

  'src/data/categories/sports/el-guerrouj-ultimate.json': {
    title: 'Hicham El Guerrouj: Mile Master',
    description: 'The Moroccan king of middle distance—from 1500m records to Olympic double gold',
    questions: [
      { level: 1, question: 'Which Moroccan runner held the 1500m world record for over 20 years?', answer: 'Hicham El Guerrouj', acceptedAnswers: ['hicham el guerrouj', 'el guerrouj', 'guerrouj', 'hicham'] },
      { level: 2, question: "El Guerrouj's specialty—the 1500m—is roughly how many laps on a standard track?", answer: 'Three and three-quarters', acceptedAnswers: ['three and three quarters', '3.75 laps', '3.75', 'almost four laps'] },
      { level: 3, question: 'What was El Guerrouj\'s 1500m world record time (minutes:seconds)?', answer: '3:26.00', acceptedAnswers: ['3:26.00', '3:26', '3 minutes 26', '326'] },
      { level: 4, question: 'At the 2004 Athens Olympics, El Guerrouj finally won gold in which two events?', answer: '1500m and 5000m', acceptedAnswers: ['1500m and 5000m', '1500 and 5000', '1500m 5000m', 'double gold'] },
      { level: 5, question: 'Who did El Guerrouj beat by 0.04 seconds in the 2004 Olympic 1500m final?', answer: 'Bernard Lagat', acceptedAnswers: ['bernard lagat', 'lagat', 'bernard'] },
    ],
  },

  'src/data/categories/sports/prefontaine-ultimate.json': {
    title: 'Steve Prefontaine: Run Like the Wind',
    description: 'Oregon\'s rebel runner—from Hayward Field to a legend cut short',
    questions: [
      { level: 1, question: 'Which American distance runner became an Oregon icon in the 1970s?', answer: 'Steve Prefontaine', acceptedAnswers: ['steve prefontaine', 'prefontaine', 'pre', 'pre fontaine'] },
      { level: 2, question: 'Prefontaine ran collegiately for which university?', answer: 'Oregon', acceptedAnswers: ['oregon', 'university of oregon', 'oregon ducks', 'uo'] },
      { level: 3, question: "Oregon's famous track venue where Pre raced is called what?", answer: 'Hayward Field', acceptedAnswers: ['hayward field', 'hayward', 'hayward field eugene'] },
      { level: 4, question: 'Pre famously wore what brand of racing flats he helped design?', answer: 'Nike', acceptedAnswers: ['nike', 'nike waffles', 'waffle trainers'] },
      { level: 5, question: 'Prefontaine died in 1975 at what age?', answer: '24', acceptedAnswers: ['24', 'twenty-four', 'twenty four', 'age 24'] },
    ],
  },
}

for (const [relPath, data] of Object.entries(ULTIMATE_STACKS)) {
  const abs = path.join(root, relPath)
  fs.writeFileSync(abs, JSON.stringify(data, null, 2) + '\n')
  console.log(`TRIMMED: ${relPath}`)
}
