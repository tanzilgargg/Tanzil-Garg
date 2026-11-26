/* CYCORA · achievements, shop catalogue, weekly missions, practice-league rivals. */
(() => {
  const worldDone = (s, w) => !!(s.lessons[`w${w}l6`] && s.lessons[`w${w}l6`].done);
  const threeStars = (s) => Object.values(s.lessons).filter((l) => l.stars === 3).length;

  CY.data.achievements = [
    { id: 'first-shift', name: 'First Shift', desc: 'Complete your very first lesson.', icon: 'star', test: (s) => s.stats.lessonsDone >= 1 },
    { id: 'words-100', name: 'First 100 Words', desc: 'Type 100 words in total.', icon: 'keyboard', test: (s) => s.stats.wordsTyped >= 100 },
    { id: 'words-1000', name: 'Word Chef', desc: 'Type 1,000 words in total.', icon: 'keyboard', test: (s) => s.stats.wordsTyped >= 1000 },
    { id: 'perfect', name: 'Perfect Typist', desc: 'Finish a lesson with 100% accuracy.', icon: 'target', test: (s) => s.stats.perfectLessons >= 1 },
    { id: 'speedy', name: 'Speedy Chef', desc: 'Reach 30 WPM in a lesson.', icon: 'bolt', test: (s) => s.stats.bestWpm >= 30 },
    { id: 'lightning', name: 'Lightning Ladle', desc: 'Reach 50 WPM in a lesson.', icon: 'bolt', test: (s) => s.stats.bestWpm >= 50 },
    { id: 'combo-50', name: 'Combo Cook', desc: 'Hit a 50-key combo.', icon: 'sparkle', test: (s) => s.stats.bestCombo >= 50 },
    { id: 'streak-3', name: 'On a Roll', desc: 'Keep a 3-day streak.', icon: 'flame', test: (s) => s.streak.best >= 3 },
    { id: 'streak-7', name: 'Week of Whisks', desc: 'Keep a 7-day streak.', icon: 'flame', test: (s) => s.streak.best >= 7 },
    { id: 'three-star', name: 'Three-Star Chef', desc: 'Earn 3 stars on 10 lessons.', icon: 'crown', test: (s) => threeStars(s) >= 10 },
    { id: 'world-1', name: 'Pantry Pro', desc: 'Complete Pantry Paradise.', icon: 'home', test: (s) => worldDone(s, 1) },
    { id: 'world-2', name: 'Order Ace', desc: 'Complete Order Express.', icon: 'ticket', test: (s) => worldDone(s, 2) },
    { id: 'world-3', name: 'Kitchen Star', desc: 'Complete Little Chef’s Kitchen.', icon: 'star', test: (s) => worldDone(s, 3) },
    { id: 'world-4', name: 'Service Superstar', desc: 'Complete Speedy Service.', icon: 'bolt', test: (s) => worldDone(s, 4) },
    { id: 'world-5', name: 'Waste Warrior', desc: 'Complete Eco Sorting Squad.', icon: 'leaf', test: (s) => worldDone(s, 5) },
    { id: 'world-6', name: 'Food Rescue Champion', desc: 'Complete Food Rescue Heroes.', icon: 'heart', test: (s) => worldDone(s, 6) },
    { id: 'world-7', name: 'Circular Economy Expert', desc: 'Complete Re-Make Magic.', icon: 'refresh', test: (s) => worldDone(s, 7) },
    { id: 'licensed', name: 'Licensed', desc: 'Earn any Restaurant Licence.', icon: 'licence', test: (s) => s.licence.best >= 60 },
    { id: 'gold-licence', name: 'Gold Standard', desc: 'Earn a Gold Restaurant Licence.', icon: 'medal', test: (s) => s.licence.best >= 90 },
    { id: 'decorator', name: 'Interior Designer', desc: 'Buy 3 items from the shop.', icon: 'bag', test: (s) => s.owned.length >= 8 },
    { id: 'daily-5', name: 'Daily Regular', desc: 'Complete 5 Daily Specials.', icon: 'calendar', test: (s) => s.stats.dailyDone >= 5 },
    { id: 'rescuer', name: 'Rescue Ranger', desc: 'Rescue 25 food items correctly.', icon: 'heart', test: (s) => s.stats.rescued >= 25 },
    { id: 'first-race', name: 'Off the Line', desc: 'Finish your first typing race.', icon: 'flag', test: (s) => s.races.played >= 1 },
    { id: 'race-win', name: 'Golden Ladle', desc: 'Win a typing race.', icon: 'crown', test: (s) => s.races.wins >= 1 },
    { id: 'podium-10', name: 'Podium Regular', desc: 'Finish in the top 3 in 10 races.', icon: 'medal', test: (s) => s.races.podiums >= 10 },
    { id: 'eco-chest', name: 'Daily Eco Hero', desc: 'Complete all three Daily Eco Missions in a day.', icon: 'leaf', test: (s) => s.stats.dailyChests >= 1 },
    { id: 'planet-60', name: 'Planet Ally', desc: 'Grow Planet Health to Thriving (60+).', icon: 'globe', test: (s) => CY.planet.score() >= 60 },
    { id: 'planet-85', name: 'Planet Protector', desc: 'Grow Planet Health to Flourishing (85+).', icon: 'globe', test: (s) => CY.planet.score() >= 85 },
    { id: 'cy-stylist', name: 'Cy’s Stylist', desc: 'Dress Cy in a hat and an accessory.', icon: 'sparkle', test: (s) => s.mascot.cyhat !== 'none' && s.mascot.cyacc !== 'none' },
    { id: 'makeover', name: 'Grand Makeover', desc: 'Change your restaurant’s theme.', icon: 'home', test: (s) => s.style.theme !== 'theme-classic' },
  ];

  /* Shop catalogue.
     place: where it appears (dining · kitchen · counter · yard · building) — toggled on/off.
     slot:  equippable choice (avatar hat/apron/acc · cyhat/cyacc for Cy · theme · wall · tables).
     planet: passive Planet Health bonus while displayed.
     exclusive: can't be bought — earned from Daily Eco Chests or planet milestones. */
  CY.data.shop = [
    // Restaurant themes (change the whole building)
    { id: 'theme-classic', cat: 'Themes', name: 'Classic Coral', price: 0, desc: 'The original CYCORA look.', slot: 'theme' },
    { id: 'theme-seaside', cat: 'Themes', name: 'Seaside Café', price: 150, desc: 'Sky-blue roof, white walls, sea-breeze vibes.', slot: 'theme' },
    { id: 'theme-garden', cat: 'Themes', name: 'Garden Bistro', price: 170, desc: 'Leafy green roof and warm timber.', slot: 'theme' },
    { id: 'theme-night', cat: 'Themes', name: 'Night Market', price: 220, desc: 'Plum roof, glowing neon trim.', slot: 'theme' },
    { id: 'theme-sunset', cat: 'Themes', name: 'Sunset Terrace', price: 0, desc: 'Golden-hour colours. Daily Eco Chest exclusive.', slot: 'theme', exclusive: true },
    // Wall designs (dining room + order counter)
    { id: 'wall-plain', cat: 'Walls', name: 'Plain Paint', price: 0, desc: 'Simple and fresh.', slot: 'wall' },
    { id: 'wall-stripes', cat: 'Walls', name: 'Candy Stripes', price: 60, desc: 'Peachy stripes for the dining room.', slot: 'wall' },
    { id: 'wall-brick', cat: 'Walls', name: 'Exposed Brick', price: 80, desc: 'Cosy bistro brickwork.', slot: 'wall' },
    { id: 'wall-tiles', cat: 'Walls', name: 'Diner Tiles', price: 70, desc: 'Checkerboard tiles, retro style.', slot: 'wall' },
    { id: 'wall-floral', cat: 'Walls', name: 'Wildflower Paper', price: 90, desc: 'Little flowers everywhere.', slot: 'wall' },
    { id: 'wall-mural', cat: 'Walls', name: 'Planet Mural', price: 0, desc: 'A hand-painted Earth. Reward for a Flourishing planet.', slot: 'wall', exclusive: true },
    // Furniture
    { id: 'tables-classic', cat: 'Furniture', name: 'Coral Tables', price: 0, desc: 'Round tables with coral cloths.', slot: 'tables' },
    { id: 'tables-wood', cat: 'Furniture', name: 'Reclaimed Wood Tables', price: 90, desc: 'Made from rescued timber.', slot: 'tables', planet: 2 },
    { id: 'tables-marble', cat: 'Furniture', name: 'Marble Café Tables', price: 120, desc: 'Fancy white marble tops.', slot: 'tables' },
    { id: 'rug', cat: 'Furniture', name: 'Peach Rug', price: 70, desc: 'A cosy rug under the tables.', place: 'dining' },
    { id: 'booth', cat: 'Furniture', name: 'Window Booth', price: 110, desc: 'A comfy booth seat by the window.', place: 'dining' },
    // Plants & decorations
    { id: 'plant', cat: 'Plants & Decor', name: 'Monstera Plant', price: 60, desc: 'A leafy friend for the dining room.', place: 'dining', planet: 1 },
    { id: 'art', cat: 'Plants & Decor', name: 'Hillside Painting', price: 80, desc: 'Local art for the dining wall.', place: 'dining' },
    { id: 'flowerbox', cat: 'Plants & Decor', name: 'Window Flower Boxes', price: 85, desc: 'Bee-friendly flowers on every window.', place: 'building', planet: 2 },
    { id: 'bee-hotel', cat: 'Plants & Decor', name: 'Bee Hotel', price: 0, desc: 'A home for solitary bees in the yard. Daily Eco Chest exclusive.', place: 'yard', planet: 3, exclusive: true },
    // Lighting
    { id: 'lights', cat: 'Lighting', name: 'Fairy Lights', price: 90, desc: 'Twinkly lights across the dining room.', place: 'dining' },
    { id: 'lamp', cat: 'Lighting', name: 'Reading Lamp', price: 60, desc: 'Warm light by the window seat.', place: 'dining' },
    { id: 'lanterns', cat: 'Lighting', name: 'Paper Lanterns', price: 95, desc: 'Soft glowing lanterns overhead.', place: 'dining' },
    { id: 'chandelier', cat: 'Lighting', name: 'LED Chandelier', price: 140, desc: 'Sparkly, and it runs on low-energy LEDs.', place: 'dining', planet: 1 },
    // Kitchen equipment
    { id: 'copper', cat: 'Kitchen', name: 'Copper Pans', price: 110, desc: 'Gleaming pans for the kitchen wall.', place: 'kitchen' },
    { id: 'herbs', cat: 'Kitchen', name: 'Herb Planter', price: 75, desc: 'Fresh basil and mint, zero food miles.', place: 'kitchen', planet: 2 },
    { id: 'mixer', cat: 'Kitchen', name: 'Stand Mixer', price: 95, desc: 'A butter-yellow mixer for baking day.', place: 'kitchen' },
    // Restaurant upgrades
    { id: 'awning', cat: 'Upgrades', name: 'Striped Awning', price: 120, desc: 'A sunny awning over the front door.', place: 'building' },
    { id: 'solar', cat: 'Upgrades', name: 'Solar Panels', price: 200, desc: 'Clean energy on the restaurant roof.', place: 'building', planet: 6 },
    { id: 'garden', cat: 'Upgrades', name: 'Rooftop Garden', price: 160, desc: 'Grow veg on the roof with your compost.', place: 'building', planet: 4 },
    // Cy's wardrobe (mascot)
    { id: 'cy-chef', cat: 'Cy’s Wardrobe', name: 'Cy’s Chef Hat', price: 60, desc: 'A tiny toque for a tiny chef.', slot: 'cyhat' },
    { id: 'cy-beret', cat: 'Cy’s Wardrobe', name: 'Cy’s Beret', price: 50, desc: 'Artistic and adorable.', slot: 'cyhat' },
    { id: 'cy-headphones', cat: 'Cy’s Wardrobe', name: 'Cy’s Race Headphones', price: 80, desc: 'Cy’s focus gear for race day.', slot: 'cyhat' },
    { id: 'cy-crown', cat: 'Cy’s Wardrobe', name: 'Leaf Crown', price: 0, desc: 'Royal greenery. Daily Eco Chest exclusive.', slot: 'cyhat', exclusive: true },
    { id: 'cy-bow', cat: 'Cy’s Wardrobe', name: 'Cy’s Bow', price: 40, desc: 'A coral bow.', slot: 'cyacc' },
    { id: 'cy-glasses', cat: 'Cy’s Wardrobe', name: 'Cy’s Glasses', price: 45, desc: 'Very studious.', slot: 'cyacc' },
    { id: 'cy-flower', cat: 'Cy’s Wardrobe', name: 'Cy’s Daisy', price: 35, desc: 'Fresh from the rooftop garden.', slot: 'cyacc' },
    { id: 'cy-cape', cat: 'Cy’s Wardrobe', name: 'Eco Hero Cape', price: 0, desc: 'For planet-saving sprouts. Daily Eco Chest exclusive.', slot: 'cyacc', exclusive: true },
    // Your chef (avatar)
    { id: 'hat-beret', cat: 'Your Chef', name: 'Coral Beret', price: 50, desc: 'Très chic.', slot: 'hat' },
    { id: 'hat-cap', cat: 'Your Chef', name: 'Sky Cap', price: 50, desc: 'For speedy service days.', slot: 'hat' },
    { id: 'hat-bandana', cat: 'Your Chef', name: 'Sunny Bandana', price: 40, desc: 'Keeps hair tidy in the kitchen.', slot: 'hat' },
    { id: 'hat-leaf', cat: 'Your Chef', name: 'Sprout Hat', price: 120, desc: 'Cy says it’s flattered.', slot: 'hat' },
    { id: 'hat-crown', cat: 'Your Chef', name: 'Head Chef Crown', price: 300, desc: 'For true kitchen royalty.', slot: 'hat' },
    { id: 'apron-coral', cat: 'Your Chef', name: 'Coral Apron', price: 30, desc: 'Bold and bright.', slot: 'apron' },
    { id: 'apron-sky', cat: 'Your Chef', name: 'Sky Apron', price: 30, desc: 'Calm and cool.', slot: 'apron' },
    { id: 'apron-butter', cat: 'Your Chef', name: 'Butter Apron', price: 30, desc: 'Sunny side up.', slot: 'apron' },
    { id: 'apron-plum', cat: 'Your Chef', name: 'Plum Apron', price: 40, desc: 'Fancy dinner energy.', slot: 'apron' },
    { id: 'apron-peach', cat: 'Your Chef', name: 'Peach Apron', price: 30, desc: 'Soft and sweet.', slot: 'apron' },
    { id: 'acc-glasses', cat: 'Your Chef', name: 'Round Glasses', price: 45, desc: 'Read every ticket clearly.', slot: 'acc' },
    { id: 'acc-star', cat: 'Your Chef', name: 'Star Clip', price: 35, desc: 'You’re a star.', slot: 'acc' },
    { id: 'acc-flower', cat: 'Your Chef', name: 'Flower Clip', price: 35, desc: 'Fresh from the garden.', slot: 'acc' },
    { id: 'acc-headphones', cat: 'Your Chef', name: 'Headphones', price: 70, desc: 'Focus mode: on.', slot: 'acc' },
    { id: 'acc-scarf', cat: 'Your Chef', name: 'Chef Scarf', price: 40, desc: 'A classic neckerchief.', slot: 'acc' },
    // Boosts
    { id: 'streak-freeze', cat: 'Boosts', name: 'Streak Freeze', price: 60, desc: 'Protects your streak if you miss one day. Hold up to 2.', consumable: true },
    { id: 'heart-refill', cat: 'Boosts', name: 'Heart Refill', price: 40, desc: 'Refill all your hearts right now.', consumable: true },
  ];
  /* Exclusive rewards handed out by Daily Eco Chests, in order. */
  CY.data.chestRewards = ['cy-cape', 'bee-hotel', 'cy-crown', 'theme-sunset'];

  /* Daily Eco Missions — 3 per day, only from worlds the player can reach. */
  CY.data.dailyPool = [
    { id: 'lessons', text: 'Complete {g} typing lesson{s}', goal: 3, needs: 1 },
    { id: 'oneMinute', text: 'Complete a one-minute typing challenge', goal: 1, needs: 1, hint: 'Daily Special or Espresso Sprint race' },
    { id: 'acc95', text: 'Finish a lesson with 95%+ accuracy', goal: 1, needs: 1 },
    { id: 'race', text: 'Finish {g} typing race{s}', goal: 2, needs: 1 },
    { id: 'podium', text: 'Finish a race in the top 3', goal: 1, needs: 1 },
    { id: 'served', text: 'Serve {g} customers', goal: 10, needs: 2 },
    { id: 'sorted', text: 'Sort {g} waste items correctly', goal: 10, needs: 5 },
    { id: 'recycled', text: 'Recycle {g} items the right way', goal: 4, needs: 5 },
    { id: 'rescued', text: 'Rescue {g} surplus food items', goal: 5, needs: 6 },
    { id: 'stored', text: 'Store {g} foods safely (chill or freeze)', goal: 4, needs: 6 },
    { id: 'circular', text: 'Make {g} circular-production choices', goal: 5, needs: 7 },
  ];

  CY.data.missionPool = [
    { id: 'lessons', text: 'Complete {g} lesson{s}', goals: [3, 5, 7], xp: 40, coins: 30 },
    { id: 'words', text: 'Type {g} words', goals: [150, 250, 400], xp: 40, coins: 30 },
    { id: 'perfect', text: 'Finish {g} lesson{s} with 98%+ accuracy', goals: [1, 2, 3], xp: 50, coins: 40 },
    { id: 'stars3', text: 'Earn 3 stars in {g} lesson{s}', goals: [1, 2, 3], xp: 50, coins: 40 },
    { id: 'daily', text: 'Complete {g} Daily Special{s}', goals: [2, 3, 4], xp: 45, coins: 35 },
    { id: 'served', text: 'Serve {g} tables or customers', goals: [15, 25, 40], xp: 40, coins: 30 },
    { id: 'eco', text: 'Make {g} correct eco decisions', goals: [10, 20, 30], xp: 45, coins: 35 },
    { id: 'xp', text: 'Earn {g} XP', goals: [150, 250, 400], xp: 30, coins: 50 },
  ];

  CY.data.rivals = [
    { name: 'Priya', base: 460, wpm: 46, av: { skin: 2, hair: 3, hairColor: 0, hat: 'hat-bandana', apron: 'coral', acc: 'none' } },
    { name: 'Leo', base: 390, wpm: 41, av: { skin: 0, hair: 0, hairColor: 3, hat: 'hat-cap', apron: 'sky', acc: 'acc-glasses' } },
    { name: 'Amara', base: 330, wpm: 38, av: { skin: 4, hair: 2, hairColor: 0, hat: 'none', apron: 'butter', acc: 'acc-flower' } },
    { name: 'Kenji', base: 270, wpm: 35, av: { skin: 1, hair: 0, hairColor: 0, hat: 'hat-classic', apron: 'plum', acc: 'none' } },
    { name: 'Sofia', base: 220, wpm: 31, av: { skin: 1, hair: 3, hairColor: 4, hat: 'hat-beret', apron: 'peach', acc: 'none' } },
    { name: 'Tomás', base: 170, wpm: 28, av: { skin: 3, hair: 4, hairColor: 1, hat: 'none', apron: 'sage', acc: 'acc-headphones' } },
    { name: 'Zara', base: 130, wpm: 24, av: { skin: 3, hair: 1, hairColor: 1, hat: 'none', apron: 'coral', acc: 'acc-star' } },
    { name: 'Ollie', base: 95, wpm: 20, av: { skin: 0, hair: 0, hairColor: 2, hat: 'hat-leaf', apron: 'sky', acc: 'none' } },
    { name: 'Mei', base: 60, wpm: 17, av: { skin: 1, hair: 1, hairColor: 5, hat: 'none', apron: 'butter', acc: 'acc-glasses' } },
  ];

  CY.data.mascotLines = {
    idle: ['The first guests turn up soon. Probably.', 'Fingers on the home row, Chef.', 'Ten minutes a day beats one long cram on Sunday.', 'I’ve been told I look like a pea. I’m a sprout.', 'Somebody left a teaspoon in the compost again.'],
    great: ['Those fingers didn’t stop once.', 'Clean as a freshly wiped counter.', 'Momo would actually smile at that.', 'Not a crumb out of place.'],
    ok: ['Solid shift.', 'That’ll do nicely.', 'Good. Now do it again, but faster.'],
    retry: ['Happens to everyone. Go again?', 'Slower this time. Honestly, it helps.', 'Shake your hands out and have another go.'],
  };
})();
