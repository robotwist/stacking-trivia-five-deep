#!/usr/bin/env node
/**
 * Replace spoiler-heavy stack descriptions with hook text that does not contain answers.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PLAYABLE_STACK_PATHS } from './playableStacksManifest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

/** @type {Record<string, { description?: string, imageHint?: string, deeperModeDescription?: string }>} */
const FIXES = {
  'src/data/stacks/van-gogh.json': {
    description: 'The Dutch master—fame, struggle, and a single sale that echoes through art history.',
  },
  'src/data/categories/arts-culture/the-beatles-ultimate.json': {
    description: 'Five levels through the band that changed pop music—and the world.',
  },
  'src/data/categories/arts-culture/frida-kahlo.json': {
    description: 'Pain, resilience, and color—the life of a revolutionary Mexican artist.',
  },
  'src/data/categories/arts-culture/miles-davis.json': {
    description: 'Cool jazz and restless innovation—one legendary recording era.',
    imageHint: 'An iconic album cover from a pivotal jazz session',
  },
  'src/data/categories/arts-culture/shakespeare.json': {
    description: 'The Bard’s plays, places, and numbers—five steps through English literature.',
  },
  'src/data/categories/arts-culture/leonardo-da-vinci.json': {
    description: 'Renaissance genius—painter, inventor, and relentless experimenter.',
    imageHint: 'Sketches and inventions of a mind centuries ahead of its time',
  },
  'src/data/categories/arts-culture/mozart.json': {
    description: 'Child prodigy, operatic drama, and unfinished mystery—five musical depths.',
  },
  'src/data/categories/sports/olympic_distance_current.json': {
    description: 'Middle-distance drama at a recent Summer Games—five races, five revelations.',
    imageHint: 'The flame and track that define Olympic distance running',
  },
  'src/data/categories/sports/nebraska-sports-ultimate.json': {
    description: 'Cornhusker pride—stadium lore, dynasties, and football culture.',
    imageHint: 'A sea of red on game day in Lincoln',
  },
  'src/data/categories/sports/el-guerrouj-ultimate.json': {
    description: 'Middle-distance royalty—records, tactics, and Olympic pressure.',
  },
  'src/data/categories/sports/prefontaine-ultimate.json': {
    description: 'A 1970s rebel who packed a historic track and challenged the system—five depths into myth and loss.',
    imageHint: 'A historic track under lights—legend still in the air',
  },
  'src/data/categories/sports/muhammad-ali.json': {
    description: 'From Olympic gold to global icon—five chapters of the Greatest.',
  },
  'src/data/categories/sports/michael-jordan.json': {
    description: 'Finals pressure, clutch shots, and dynasty lore—five levels of MJ.',
  },
  'src/data/categories/sports/serena-williams.json': {
    description: 'She lifted a trophy while hiding life-changing news—five steps from a secret title to motherhood.',
    imageHint: 'A trophy lift with a story still unspoken',
  },
  'src/data/categories/actually/queso-wars.json': {
    description: 'Two states, one melty feud, and a Capitol Hill showdown—five steps into cheese-dip lore.',
    imageHint: 'A steaming bowl at a tailgate—no state names on the menu',
  },
  'src/data/categories/science-technology/tesla.json': {
    description: 'Electrical wizardry, fierce rivalry, and wireless dreams—five inventor depths.',
    imageHint: 'Lightning, coils, and the age of electricity',
    deeperModeDescription: 'Obsessive habits and visions ahead of their time',
  },
  'src/data/categories/science-technology/darwin.json': {
    description: 'The naturalist whose voyage rewrote how we see life on Earth.',
    imageHint: 'Finches, fossils, and the puzzle of adaptation',
    deeperModeDescription: 'Personal struggle behind a world-changing theory',
  },
  'src/data/categories/science-technology/nasa.json': {
    description: 'Rockets, astronauts, and the push beyond our planet—five space-program depths.',
    deeperModeDescription: 'Hidden moments that shaped exploration',
  },
  'src/data/categories/science-technology/marie-curie.json': {
    description: 'Barrier-breaking science in an age of discovery and risk.',
    imageHint: 'Laboratory glow and the price of pioneering research',
    deeperModeDescription: 'The human cost of chasing unknown rays',
  },
  'src/data/categories/science-technology/steve-jobs.json': {
    description: 'Design obsession, startups, and the company that put computers in pockets.',
    deeperModeDescription: 'Perfectionism and controversy behind the brand',
  },
  'src/data/categories/cinema/blade_runner.json': {
    description: 'Neo-noir futures, synthetic life, and what makes us human—five cinematic depths.',
    imageHint: 'Rain-slick streets and neon in a dystopian cityscape',
  },
  'src/data/categories/cinema/the-godfather.json': {
    description: 'Power, family, and cinema’s most unforgettable offers—five Godfather depths.',
    deeperModeDescription: 'Filmmaking secrets for those who conquered the stack',
  },
  'src/data/categories/cinema/star-wars.json': {
    description: 'A galaxy of heroes, ships, and quotable lore—original-trilogy depths.',
  },
  'src/data/categories/history/ancient_greece.json': {
    description: 'Philosophy, sacred hills, and the historian who chronicled war—classical Greece in five steps.',
    imageHint: 'Marble columns and the legacy of Athens',
  },
  'src/data/categories/history/cleopatra.json': {
    description: 'Politics, romance, and myth around history’s most famous queen.',
  },
  'src/data/categories/history/einstein.json': {
    description: 'Relativity, awards, and the mind that reimagined the cosmos.',
    imageHint: 'Wild hair and equations that bent spacetime',
  },
  'src/data/categories/actually/van-gogh-myths.json': {
    description: 'Popular stories about a tortured master—which hold up under scrutiny?',
  },
  'src/data/categories/actually/einstein-myths.json': {
    description: 'Famous Einstein “facts” that deserve a second look.',
  },
  'src/data/categories/actually/shakespeare-myths.json': {
    description: 'Authorship rumors and stage lore—what’s myth vs. evidence?',
  },
  'src/data/stacks/how_i_met_your_mother.json': {
    description: 'Rom-com chaos and the long tale of how he met their mother.',
  },
  'src/data/stacks/community.json': {
    description: 'A study group at the world’s most chaotic community college.',
  },
  'src/data/stacks/the_goonies.json': {
    description: 'Small-town kids, old maps, and treasure—five adventure depths.',
  },
  'src/data/stacks/the_office.json': {
    description: 'Workplace absurdity in a Pennsylvania paper company—five sitcom depths.',
  },
  'src/data/stacks/friends.json': {
    description: 'Six friends, one city, and sitcom history—five iconic depths.',
  },
  'src/data/stacks/back_to_the_future.json': {
    description: 'Clock towers, flux capacitors, and teenage destiny—time-travel depths.',
  },
  'src/data/stacks/stranger_things.json': {
    description: 'Small-town mystery, secret labs, and things that go bump in the night.',
  },
  'src/data/categories/kids/dinosaurs.json': {
    description: 'Teeth, giants, and the day the rulers fell—dino facts for curious minds.',
  },
  'src/data/categories/kids/superheroes.json': {
    description: 'Origins, secret identities, and superpowers—hero lore in five steps.',
  },
  'src/data/categories/kids/space.json': {
    description: 'Stars, planets, and humankind’s small steps beyond Earth.',
  },
  'src/data/categories/kids/videogames.json': {
    description: 'Arcades to blocky worlds—gaming history in five fun facts.',
  },
  'src/data/categories/kids/animals.json': {
    description: 'Speed, size, and survival—remarkable creatures in five facts.',
  },
  'src/data/stacks/heroes-journey-super.json': {
    description: 'The story pattern hidden in myths, movies, and our own lives.',
    deeperModeDescription: 'Bonus lore for monomyth obsessives',
  },
  'src/data/stacks/jesus-historical-mythic.json': {
    description: 'History, language, and myth—five scholarly depths on a world-changing figure.',
  },
  'src/data/stacks/philip-k-dick-super.json': {
    description: 'Paranoia, synthetic souls, and reality undone—five Dick depths.',
  },
  'src/data/stacks/character-name-origins.json': {
    description: 'Hidden meanings tucked inside famous character names.',
  },
}

for (const relPath of PLAYABLE_STACK_PATHS) {
  const fix = FIXES[relPath]
  if (!fix) continue

  const absPath = path.join(root, relPath)
  const stack = JSON.parse(fs.readFileSync(absPath, 'utf8'))

  if (fix.description) stack.description = fix.description
  if (fix.imageHint) stack.imageHint = fix.imageHint
  if (fix.deeperModeDescription && stack.deeperMode) {
    stack.deeperMode.description = fix.deeperModeDescription
  }

  fs.writeFileSync(absPath, JSON.stringify(stack, null, 2) + '\n')
  console.log(`FIXED: ${relPath}`)
}

console.log('\nDone. Run: npm run validate:stacks')
