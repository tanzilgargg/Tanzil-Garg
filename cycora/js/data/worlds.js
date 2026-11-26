/* CYCORA · learning content. Seven worlds × six lessons.
   Lesson modes:
     sequence – type items one after another (stock, orders, recipe, remake scenes)
     service  – several tickets at once; type a ticket's table number to lock on
     decision – choose the right action by typing it (sort, rescue, match scenes)
   Text is the actual typing material, so it is written to progress in difficulty:
   home row → full alphabet → capitals → space/enter → numbers → punctuation → long instructions. */
CY.data = CY.data || {};

(() => {
  const W5_ITEMS = {
    bottle: { n: 'Empty water bottle', d: 'Plastic · lid on · empty', i: 'bottle', a: 'recycle', why: 'Empty bottles go in recycling. Squash it and screw the lid back on, so the lid gets recycled too.' },
    jar: { n: 'Rinsed glass jar', d: 'Clean glass', i: 'jar', a: 'recycle', why: 'Clean glass can be melted down and made into new jars.' },
    can: { n: 'Drinks can', d: 'Aluminium · empty', i: 'can', a: 'recycle', why: 'Aluminium cans can be recycled again and again.' },
    box: { n: 'Flattened cardboard box', d: 'Clean and dry', i: 'box', a: 'recycle', why: 'Clean, dry cardboard is pulped into new paper products.' },
    peel: { n: 'Banana peel', d: 'Food scrap', i: 'peel', a: 'compost', why: 'Fruit peel breaks down into rich compost.' },
    grounds: { n: 'Used coffee grounds', d: 'From the espresso machine', i: 'grounds', a: 'compost', why: 'Coffee grounds are full of nutrients for compost.' },
    veg: { n: 'Carrot tops & peelings', d: 'Food scrap', i: 'veg', a: 'compost', why: 'Vegetable scraps belong in food waste or compost.' },
    egg: { n: 'Eggshells', d: 'From breakfast prep', i: 'egg', a: 'compost', why: 'Crushed eggshells compost well.' },
    core: { n: 'Apple core', d: 'Food scrap', i: 'core', a: 'compost', why: 'Cores and pips go to compost, not the bin.' },
    tin: { n: 'Sealed tin of beans', d: 'Unopened · in date', i: 'tin', a: 'donate', why: 'It’s sealed and in date. Somebody can eat that.' },
    bread: { n: 'Unopened loaf', d: 'Sealed · baked today', i: 'bread', a: 'donate', why: 'Sealed, fresh food is perfect for a food bank or rescue app.' },
    apples: { n: 'Bag of fresh apples', d: 'Sealed · in date · surplus', i: 'apple', a: 'donate', why: 'Perfectly good apples. Give them to someone who’ll eat them.' },
    packet: { n: 'Crisp packet', d: 'Foil-lined plastic', i: 'packet', a: 'general', why: 'Crisp packets can’t go in home recycling. Lots of supermarkets collect them with soft plastics, otherwise it’s general waste.' },
    plate: { n: 'Broken plate', d: 'Ceramic', i: 'plate', a: 'general', why: 'Ceramics don’t recycle with glass. Wrap the pieces and bin them safely.' },
    tray: { n: 'Polystyrene tray', d: 'From a delivery', i: 'tray', a: 'general', why: 'Polystyrene usually isn’t accepted in recycling.' },
    film: { n: 'Greasy cling film', d: 'Thin plastic · dirty', i: 'film', a: 'general', why: 'Dirty film contaminates recycling, so it goes in general waste.' },
    cup: { n: 'Takeaway coffee cup', d: 'Paper with plastic lining', i: 'cup', a: 'general', why: 'The plastic lining means home recycling usually won’t take them. Some coffee shops collect them. A reusable cup skips the problem.' },
    yog: { n: 'Yoghurt pot with leftovers', d: 'Plastic · food inside', i: 'yoghurt', a: 'recycle', then: 'scrape and rinse it first', why: 'Food left in packaging can spoil a whole load of recycling.' },
    sauce: { n: 'Jar with sauce inside', d: 'Glass · not empty', i: 'jar', a: 'recycle', then: 'rinse the jar first', why: 'Rinse jars so the glass can be recycled cleanly.' },
    pizza: { n: 'Pizza box with a leftover crust', d: 'Cardboard · greasy · crust inside', i: 'pizzabox', a: 'recycle', then: 'take out the leftover crust', why: 'Greasy is fine. Pizza boxes are usually recyclable as long as they’re empty, so take out the food.' },
    drink: { n: 'Can with drink left', d: 'Aluminium · half full', i: 'can', a: 'recycle', then: 'empty it out first', why: 'Leftover drink makes a mess of everything else in the bin. Empty it first.' },
    tape: { n: 'Box with plastic tape', d: 'Cardboard · taped seams', i: 'box', a: 'recycle', then: 'peel off the tape', why: 'Removing tape helps the cardboard pulp cleanly.' },
  };
  const w5 = (...keys) => keys.map((k) => W5_ITEMS[k]);

  const W6_ITEMS = {
    rice: { n: 'Cooked rice', d: 'Cooked 30 min ago · cooling in a shallow tray', i: 'rice', a: 'chill', why: 'Cool cooked rice quickly, ideally within an hour. Then it goes in the fridge and gets eaten within 24 hours.' },
    yog: { n: 'Yoghurt pots', d: 'Use-by date was yesterday', i: 'yoghurt', a: 'compost', why: '“Use by” is about safety. After that date food must never be eaten, sold or donated.' },
    crackers: { n: 'Crackers', d: 'Sealed · best before last week', i: 'packet', a: 'donate', why: '“Best before” is about quality, not safety. Food past it can still be donated if it’s in good condition, and food banks check it as well.' },
    bread: { n: 'Fresh bread', d: 'Baked today · needed next week', i: 'bread', a: 'freeze', why: 'Bread freezes well. Slice it first so you only defrost what you need.' },
    tins: { n: 'Tinned tomatoes', d: 'Sealed · in date · surplus stock', i: 'tin', a: 'donate', why: 'Tins in date and unopened are ideal donations.' },
    soup: { n: 'Lentil soup', d: 'Made today · cooled · won’t sell tonight', i: 'soup', a: 'freeze', why: 'Portion cooled soup, then label and freeze it.' },
    milk: { n: 'Milk', d: 'Opened · smells sour', i: 'milk', a: 'compost', why: 'Spoiled food isn’t safe. Send it to food waste.' },
    cheese: { n: 'Cheese delivery', d: 'Just arrived · at room temperature', i: 'cheese', a: 'chill', why: 'Chilled deliveries go straight in the fridge. 5°C or below.' },
    mould: { n: 'Apples', d: 'Soft · fuzzy mould spots', i: 'apple', a: 'compost', why: 'Mouldy fruit isn’t safe to share. Compost it.' },
    salad: { n: 'Side salad', d: 'Made 10 min ago · not served', i: 'salad', a: 'chill', why: 'Keep fresh salad cold until it’s served.' },
    bananas: { n: 'Very ripe bananas', d: 'Brown spots · still good', i: 'peel', a: 'freeze', why: 'Freeze ripe bananas for smoothies or banana bread.' },
    sandw: { n: 'Sealed sandwiches', d: 'Made today · use-by tomorrow · unsold', i: 'bread', a: 'donate', why: 'In-date surplus can be shared the same day through rescue apps.' },
    cake: { n: 'Buffet sandwiches', d: 'Out of the fridge on a buffet for 4 hours', i: 'bread', a: 'compost', why: 'Chilled food can sit out on display for up to 4 hours, once. After that it’s binned, not donated.' },
    curry: { n: 'Chickpea curry', d: 'Hot · surplus from lunch', i: 'meal', a: 'chill', why: 'Cool leftovers quickly (shallow tubs help) and get them in the fridge within 1–2 hours.' },
    rescueSoup: { n: 'Surplus soup', d: 'Cooled · made today', i: 'soup', a: 'freeze', then: 'label and date it', why: 'A label with the date keeps frozen food safe and easy to use.' },
    rescueBread: { n: 'Unsold rolls', d: 'Baked today · sealed bag', i: 'bread', a: 'donate', then: 'post it on the rescue app', why: 'Rescue apps let neighbours collect surplus before it’s wasted.' },
    rescueCurry: { n: 'Big pot of curry', d: 'Hot · lots left over', i: 'meal', a: 'chill', then: 'portion into shallow boxes', why: 'Small, shallow portions cool faster and more safely.' },
    rescueBan: { n: 'Ripe bananas', d: 'Spotty · sweet', i: 'peel', a: 'freeze', then: 'peel and slice them', why: 'Peeled, sliced bananas are ready for smoothies.' },
    rescueTins: { n: 'Extra tins', d: 'Sealed · in date', i: 'tin', a: 'donate', then: 'pack them for the food bank', why: 'Packed and labelled donations are easy for volunteers to share.' },
  };
  const w6 = (...keys) => keys.map((k) => W6_ITEMS[k]);

  const W7_MATCH = {
    grounds: { n: 'Used coffee grounds', d: 'From 200 coffees a day', i: 'grounds', a: 'compost', why: 'Coffee grounds make good compost. Some growers even raise mushrooms on them.' },
    scraps: { n: 'Food scraps', d: 'Peelings and trimmings', i: 'veg', a: 'compost', why: 'Food scraps become compost (or biogas at anaerobic digestion plants).' },
    oil: { n: 'Used cooking oil', d: 'From the fryer · cooled', i: 'oil', a: 'biodiesel', why: 'Collected cooking oil is cleaned and turned into biodiesel fuel.' },
    card: { n: 'Recovered cardboard', d: 'Flattened delivery boxes', i: 'box', a: 'new paper', why: 'Cardboard is pulped and pressed into new paper and card.' },
    glass: { n: 'Recycled glass bottles', d: 'Sorted by colour', i: 'glass', a: 'new glass', why: 'Glass can be crushed, melted and remade endlessly.' },
    plastic: { n: 'Recovered plastic bottles', d: 'Washed and sorted', i: 'bottle', a: 'new plastic', why: 'Old bottles become new bottles, or get shredded and spun into fleece.' },
    peel: { n: 'Fruit peel', d: 'From the smoothie bar', i: 'peel', a: 'compost', why: 'Peel rots down into compost for the kitchen garden.' },
    jars: { n: 'Old sauce jars', d: 'Rinsed', i: 'jar', a: 'new glass', why: 'Clean jars are melted into new glass containers.' },
    menus: { n: 'Old paper menus', d: 'Dry paper', i: 'paper', a: 'new paper', why: 'Paper fibres can be recycled several times over.' },
    fryer: { n: 'Fryer oil drum', d: 'Sealed · full', i: 'oil', a: 'biodiesel', why: 'One drum of oil can help fuel a delivery van.' },
  };
  const w7 = (...keys) => keys.map((k) => W7_MATCH[k]);

  const S = (from, to, steps) => steps.map((t) => ({ t, from, to }));

  CY.data.worlds = [
    {
      id: 1, key: 'pantry', name: 'Pantry Paradise', room: 'Pantry', guide: 'cy', color: '#FFD966', ink: '#7A5A00',
      tagline: 'Keyboard basics', welcome: 'Empty shelves and no customers. Fill this pantry and we’re in business. Fingers on the keys, Chef.',
      lessons: [
        { title: 'Home Row Hello', objective: 'Find the home row: A S D F and J K L ;', tip: 'Feel for the little bumps on F and J. Your index fingers live there.', mode: 'sequence', scene: 'stock', strict: true, wpm: 8,
          items: ['asdf', 'jkl;', 'add', 'dad', 'salad', 'salsa', 'dal', 'flask', 'glass', 'all salad'] },
        { title: 'Top Row Treats', objective: 'Reach up to the top row (Q to P) and come back home.', tip: 'Only the finger that’s reaching moves. Everyone else stays home.', mode: 'sequence', scene: 'stock', strict: true, wpm: 9,
          items: ['tea', 'pie', 'rye', 'pear', 'pepper', 'rice', 'oats', 'dates', 'pasta', 'tofu'] },
        { title: 'Bottom Row Basket', objective: 'Reach down to the bottom row (Z to M).', tip: 'Curl down, tap, straight back up. Like a spring.', mode: 'sequence', scene: 'stock', strict: true, wpm: 10,
          items: ['bean', 'corn', 'cumin', 'lemon', 'mango', 'bun', 'oven', 'basil', 'melon', 'cinnamon'] },
        { title: 'Capital Crates', objective: 'Use Shift for capital letters.', tip: 'Capital on the left side of the keyboard? Your right little finger holds Shift. And the other way round.', mode: 'sequence', scene: 'stock', strict: true, wpm: 10,
          items: ['Apple', 'Basil', 'Cocoa', 'Mint', 'Brown Rice', 'Olive Oil', 'Sea Salt', 'Black Beans'] },
        { title: 'Space, Enter & Backspace', objective: 'Spacebar with your thumb, Enter to confirm, Backspace to fix mistakes.', tip: 'Red letter? Backspace it. When the word’s right, Enter (↵) puts it on the shelf.', mode: 'sequence', scene: 'stock', strict: false, wpm: 11,
          items: ['flour\n', 'sugar\n', 'red lentils\n', 'oat milk\n', 'green tea\n', 'soy sauce\n', 'rolled oats\n'] },
        { title: 'Pantry Rush', final: true, objective: 'Stock the pantry before the delivery van leaves.', tip: 'The van’s waiting, but a wrong label costs you more time than a slow one.', mode: 'sequence', scene: 'stock', strict: false, time: 90, wpm: 12, pass: 0.6,
          items: ['Basmati Rice', 'chickpeas', 'Maple Syrup', 'oat flour', 'Garlic', 'sea salt', 'Lentils', 'cumin seeds', 'Honey', 'pasta shells', 'Peanut Butter', 'dried apricots'] },
      ],
    },
    {
      id: 2, key: 'orders', name: 'Order Express', room: 'Order Counter', guide: 'bao', color: '#FFC4A3', ink: '#8A3A12',
      tagline: 'Taking customer orders', welcome: 'Hiya. I’m a regular here, so fair warning: if you get my order wrong, I’ll notice. Type it exactly how I say it.',
      lessons: [
        { title: 'Hello, Welcome!', objective: 'Greet each customer, spelled right.', tip: 'See the green bar under me? That’s my patience. I’ve got loads today.', mode: 'sequence', scene: 'orders', patience: 30, wpm: 12,
          items: [{ say: 'Are you open yet?', t: 'welcome in' }, { say: 'Morning.', t: 'good morning' }, { say: 'Table for two, please.', t: 'right this way' }, { say: 'Could we see a menu?', t: 'here you go' }, { say: 'That was lovely, thanks.', t: 'thank you' }, { say: 'Right, I’m off. See you.', t: 'see you soon' }] },
        { title: 'Menu Magic', objective: 'Learn the menu items by typing them.', tip: 'Read the whole order before you start typing.', mode: 'sequence', scene: 'orders', patience: 24, wpm: 13,
          items: [{ say: 'The tomato one, please.', t: 'tomato soup' }, { say: 'Something light?', t: 'veggie wrap' }, { say: 'The creamy one, please.', t: 'mushroom risotto' }, { say: 'Go on then, something sweet.', t: 'lemon tart' }, { say: 'Something filling.', t: 'falafel bowl' }, { say: 'It’s boiling out. Something cold?', t: 'mango smoothie' }] },
        { title: 'How Many?', objective: 'Type quantities with the number row.', tip: 'Numbers are up on the top row. Reach, then come back to home row.', mode: 'sequence', scene: 'orders', patience: 24, wpm: 13,
          items: [{ say: 'Two soups for us, please.', t: '2 tomato soups' }, { say: 'Just one wrap.', t: '1 veggie wrap' }, { say: 'Three of the lemon tarts.', t: '3 lemon tarts' }, { say: 'Four iced teas. One each.', t: '4 iced teas' }, { say: 'Two bowls, thanks.', t: '2 falafel bowls' }, { say: 'Six mini pancakes. Don’t ask.', t: '6 mini pancakes' }] },
        { title: 'Dietary Details', objective: 'Get dietary needs exactly right. Someone’s health depends on it.', tip: 'Commas and hyphens matter here: “nut-free” keeps a guest safe.', mode: 'sequence', scene: 'orders', patience: 32, wpm: 14,
          items: [{ say: 'I’m vegan and avoid dairy.', t: '1 vegan curry, no dairy' }, { say: 'We’re both coeliac.', t: '2 salads, gluten free' }, { say: 'I have a nut allergy.', t: '1 nut-free brownie' }, { say: 'Oat milk, no sugar.', t: '1 oat latte, no sugar' }, { say: 'Two halal wraps please.', t: '2 halal wraps' }, { say: 'Risotto, but I can’t stand mushrooms.', t: '1 risotto, no mushrooms' }] },
        { title: 'Special Requests', objective: 'Handle longer requests against the clock.', tip: 'Long orders. Steady beats speedy here.', mode: 'sequence', scene: 'orders', patience: 28, time: 110, wpm: 15, pass: 0.6,
          items: [{ say: 'Can I customise?', t: 'burger, no onions, extra pickles' }, { say: 'Bread too?', t: 'soup with bread on the side' }, { say: 'Sauce separately.', t: 'pasta, sauce on the side' }, { say: 'Dairy-free tea?', t: 'tea with oat milk, please' }, { say: 'We can’t agree, so half and half.', t: 'pizza, half veggie, half cheese' }, { say: 'Dressing separate.', t: 'salad, dressing on the side' }] },
        { title: 'Lunch Rush', final: true, objective: 'Get through the lunch rush.', tip: 'It’s lunchtime. Nobody wants to wait, me included.', mode: 'sequence', scene: 'orders', patience: 22, time: 110, wpm: 16, pass: 0.6, count: 8, shuffle: true,
          items: [{ say: 'Starving, honestly.', t: '2 tomato soups' }, { say: 'I’ve got a nut allergy.', t: '1 nut-free brownie' }, { say: 'The usual, please.', t: 'mushroom risotto' }, { say: 'Burger, hold the onions.', t: 'burger, no onions' }, { say: 'Three to share.', t: '3 falafel bowls' }, { say: 'Can we do gluten free?', t: '2 salads, gluten free' }, { say: 'Four of those tarts.', t: '4 lemon tarts' }, { say: 'Oat milk, no sugar.', t: '1 oat latte, no sugar' }, { say: 'Two from the kids’ menu.', t: '2 mini pancakes' }, { say: 'Something vegan, please.', t: '1 vegan curry, no dairy' }] },
      ],
    },
    {
      id: 3, key: 'kitchen', name: 'Little Chef’s Kitchen', room: 'Kitchen', guide: 'momo', color: '#8ED1F2', ink: '#0F5679',
      tagline: 'Recipes & instructions', welcome: 'Aprons on. In my kitchen we do every step, in order, every single time. Yes, chef?',
      lessons: [
        { title: 'Ingredient Line-Up', objective: 'Learn kitchen ingredient names.', tip: 'Long words? Break them into chunks: cour-gette, au-ber-gine.', mode: 'sequence', scene: 'recipe', recipe: 'Prep Station', wpm: 14,
          items: ['garlic', 'ginger', 'spinach', 'chickpeas', 'paprika', 'coriander', 'courgette', 'aubergine'] },
        { title: 'Kitchen Verbs', objective: 'Type the action words every chef uses.', tip: 'Short words. Good for warming up the fingers.', mode: 'sequence', scene: 'recipe', recipe: 'Chef’s Vocabulary', wpm: 16,
          items: ['chop', 'dice', 'stir', 'whisk', 'simmer', 'grate', 'knead', 'roast', 'peel', 'blend'] },
        { title: 'Tomato Soup', objective: 'Follow a recipe from start to finish.', tip: 'One step at a time. The pot fills as you go.', mode: 'sequence', scene: 'recipe', recipe: 'Tomato Soup', wpm: 16,
          items: ['chop the onions', 'heat the oil', 'add the tomatoes', 'simmer for 10 minutes', 'blend until smooth', 'serve with basil'] },
        { title: 'Stir-Fry Steps', objective: 'Choose the correct next step, then type it.', tip: 'Two cards, but only one is next. Do them out of order and the dish is ruined.', mode: 'sequence', scene: 'recipe', recipe: 'Veggie Stir-Fry', chooseOrder: true, wpm: 17,
          items: ['Slice the peppers.', 'Heat the wok.', 'Add a splash of oil.', 'Fry the tofu until golden.', 'Toss in the peppers.', 'Season with soy sauce.'] },
        { title: 'Pancake Sprint', objective: 'Numbers, units and full stops, with the clock running.', tip: 'Watch for “ml” and “g” right after the numbers.', mode: 'sequence', scene: 'recipe', recipe: 'Fluffy Pancakes', time: 100, wpm: 18, pass: 0.6,
          items: ['Whisk 2 eggs.', 'Add 250ml of milk.', 'Fold in 120g of flour.', 'Rest the batter for 5 minutes.', 'Cook each side for 1 minute.', 'Top with 3 strawberries.'] },
        { title: 'Chef’s Special', final: true, objective: 'Cook the special in the right order before service.', tip: 'Service in ten minutes. Pick the next step and keep that rice moving.', mode: 'sequence', scene: 'recipe', recipe: 'Spinach Rice Pot', chooseOrder: true, time: 130, wpm: 18, pass: 0.6,
          items: ['Rinse 200g of rice.', 'Boil 400ml of water.', 'Add the rice and cover.', 'Simmer for 12 minutes.', 'Fluff it with a fork.', 'Fold in the spinach.', 'Plate it up, Chef!'] },
      ],
    },
    {
      id: 4, key: 'service', name: 'Speedy Service', room: 'Dining Room', guide: 'zippy', color: '#9CCB8E', ink: '#25502F',
      tagline: 'Serving customers', welcome: 'Tickets in, plates out, no standing around. Type a table number to grab its ticket. Zip zip.',
      lessons: [
        { title: 'Read the Ticket', objective: 'Read each ticket and serve the right table.', tip: 'Every ticket starts with a table number. Type it all to serve.', mode: 'service', concurrent: 1, count: 6, patience: 26, wpm: 15,
          dishes: ['soup', 'pasta', 'salad', 'wrap', 'curry', 'tacos', 'noodles', 'tart'] },
        { title: 'Match the Table', objective: 'Two tickets at once. Serve both.', tip: 'Start typing a number to lock onto that ticket.', mode: 'service', concurrent: 2, count: 8, patience: 24, wpm: 16,
          dishes: ['soup', 'pasta', 'salad', 'wrap', 'curry', 'tacos', 'risotto', 'pancakes', 'noodles'] },
        { title: 'Who’s First?', objective: 'Prioritise the most impatient table.', tip: 'Emptiest ring goes first. Always.', mode: 'service', concurrent: 3, count: 9, patience: 24, varyPatience: true, wpm: 16,
          dishes: ['soup', 'pasta', 'salad', 'wrap', 'curry', 'burger', 'pizza', 'dumplings'] },
        { title: 'Bigger Orders', objective: 'Serve longer orders accurately.', tip: 'Longer tickets. Read a word ahead of your fingers.', mode: 'service', concurrent: 2, count: 8, patience: 30, wpm: 17,
          dishes: ['veggie curry', 'mushroom pasta', 'soup and bread', 'falafel wrap', 'berry pancakes', 'noodle bowl', 'lemon tart'] },
        { title: 'Rush Hour', objective: 'Serve as many tables as you can before time runs out.', tip: 'Typos cost more than pauses. Keep it clean.', mode: 'service', concurrent: 3, count: 14, patience: 22, time: 95, wpm: 18, pass: 0.6,
          dishes: ['soup', 'pasta', 'salad', 'veggie curry', 'tacos', 'risotto', 'dumplings', 'smoothie', 'falafel wrap'] },
        { title: 'Dinner Service', final: true, objective: 'Run a full dinner service with four tables at once.', tip: 'Four tables. Number first, then the dish. Zip zip.', mode: 'service', concurrent: 4, count: 14, patience: 26, varyPatience: true, time: 135, wpm: 19, pass: 0.6,
          dishes: ['tomato soup', 'mushroom pasta', 'side salad', 'veggie curry', 'tacos', 'risotto', 'dumplings', 'berry pancakes', 'falafel wrap', 'lemon tart'] },
      ],
    },
    {
      id: 5, key: 'sorting', name: 'Eco Sorting Squad', room: 'Recycling Yard', guide: 'binnie', color: '#8DBF8B', ink: '#1F4A2A',
      tagline: 'Waste management', welcome: 'Binnie here. I know an awful lot about bins. Each one has a job, so type where things go. (Rules change from council to council, so check the signs where you live.)',
      options: ['recycle', 'compost', 'donate', 'general'],
      lessons: [
        { title: 'Meet the Bins', objective: 'Learn what each of the four bins is for.', tip: 'Read the hint on each bin, then type the bin’s name.', mode: 'decision', scene: 'sort', hints: true, wpm: 14,
          items: w5('bottle', 'peel', 'tin', 'packet', 'can', 'grounds') },
        { title: 'Recycle Right', objective: 'Spot what can and can’t go in recycling.', tip: 'Clean and empty? Probably recycling. Grubby film or foil? Usually not.', mode: 'decision', scene: 'sort', hints: true, wpm: 15,
          items: w5('jar', 'box', 'plate', 'can', 'tray', 'bottle', 'cup', 'film') },
        { title: 'Compost Corner', objective: 'Scraps go to compost. Good food goes to people.', tip: 'Scraps compost. Sealed, in-date food gets donated.', mode: 'decision', scene: 'sort', wpm: 15,
          items: w5('peel', 'bread', 'egg', 'grounds', 'tin', 'veg', 'core', 'apples') },
        { title: 'Contamination Check', objective: 'Fix contaminated items before they’re recycled.', tip: 'Choose the bin, then type how to clean the item up.', mode: 'decision', scene: 'sort', wpm: 16,
          items: w5('yog', 'sauce', 'pizza', 'drink', 'tape') },
        { title: 'Sorting Sprint', objective: 'Sort quickly and correctly against the clock.', tip: 'No hints on the bins this time.', mode: 'decision', scene: 'sort', time: 90, wpm: 17, pass: 0.6, count: 12, shuffle: true,
          items: w5('bottle', 'jar', 'can', 'box', 'peel', 'grounds', 'veg', 'egg', 'tin', 'bread', 'packet', 'plate', 'tray', 'film', 'cup', 'core') },
        { title: 'Big Clean-Up', final: true, objective: 'Clear the whole yard, tricky ones included.', tip: 'The dirty packaging is what catches people out. Read the details.', mode: 'decision', scene: 'sort', time: 140, wpm: 17, pass: 0.6, count: 12, shuffle: true,
          items: w5('bottle', 'peel', 'tin', 'packet', 'yog', 'grounds', 'plate', 'sauce', 'apples', 'cup', 'pizza', 'box', 'egg', 'drink') },
      ],
    },
    {
      id: 6, key: 'rescue', name: 'Food Rescue Heroes', room: 'Food Rescue Station', guide: 'olive', color: '#FFE08A', ink: '#6B4F00',
      tagline: 'Surplus food recovery', welcome: 'I’m Olive, I volunteer with the food rescue lot. Look at the item, read the label, then type the safest thing to do with it.',
      options: ['donate', 'chill', 'freeze', 'compost'],
      lessons: [
        { title: 'Use-By or Best-Before?', objective: '“Use by” is about safety. “Best before” is about quality.', tip: 'Past use-by → compost. Sealed and only past best-before → often donate.', mode: 'decision', scene: 'rescue', options: ['donate', 'compost'], hints: true, wpm: 15,
          items: w6('yog', 'crackers', 'tins', 'milk', 'sandw', 'mould') },
        { title: 'Keep It Cool', objective: 'Decide: chill it now, or freeze it for later?', tip: 'Using it soon? Chill. Saving it for days or weeks? Freeze.', mode: 'decision', scene: 'rescue', options: ['chill', 'freeze'], hints: true, wpm: 16,
          items: w6('rice', 'bread', 'cheese', 'soup', 'salad', 'bananas') },
        { title: 'Share the Surplus', objective: 'Use all four actions to rescue food safely.', tip: 'Donate, chill, freeze or compost. The details on the card tell you which.', mode: 'decision', scene: 'rescue', wpm: 16,
          items: w6('tins', 'curry', 'cake', 'bread', 'sandw', 'milk', 'cheese', 'bananas') },
        { title: 'Rescue Plan', objective: 'Choose an action, then type the rescue step.', tip: 'Good rescues have a plan: portion it, label it, share it.', mode: 'decision', scene: 'rescue', wpm: 17,
          items: w6('rescueSoup', 'rescueBread', 'rescueCurry', 'rescueBan', 'rescueTins') },
        { title: 'Inspection Sprint', objective: 'Quick, but safe.', tip: 'My rule: if you’re not sure it’s safe, it doesn’t get donated.', mode: 'decision', scene: 'rescue', time: 80, wpm: 17, pass: 0.6, count: 12, shuffle: true,
          items: w6('rice', 'yog', 'crackers', 'bread', 'tins', 'soup', 'milk', 'cheese', 'mould', 'salad', 'bananas', 'sandw', 'cake', 'curry') },
        { title: 'Hero Shift', final: true, objective: 'Rescue a whole day’s surplus with a full plan.', tip: 'Busy day, lots of leftovers. We get it all sorted before closing.', mode: 'decision', scene: 'rescue', time: 150, wpm: 18, pass: 0.6, count: 11, shuffle: true,
          items: w6('rice', 'crackers', 'rescueSoup', 'milk', 'rescueBread', 'cake', 'cheese', 'rescueCurry', 'yog', 'rescueTins', 'bananas', 'rescueBan') },
      ],
    },
    {
      id: 7, key: 'remake', name: 'Re-Make Magic', room: 'Re-Make Workshop', guide: 'juno', color: '#D9CCF2', ink: '#4A2E7A',
      tagline: 'Circular production', welcome: 'Mind the gears. Nobody says “rubbish” in here. It’s just stuff we haven’t turned into something else yet.',
      options: ['compost', 'biodiesel', 'new paper', 'new glass', 'new plastic'],
      lessons: [
        { title: 'What Can It Become?', objective: 'Match each recovered material to its new product.', tip: 'Type the product each material can be turned into.', mode: 'decision', scene: 'match', hints: true, wpm: 16,
          items: w7('grounds', 'oil', 'card', 'glass', 'plastic', 'scraps') },
        { title: 'Coffee to Compost', objective: 'Type each step that turns coffee grounds into compost.', tip: 'Each step you type gives the machine a nudge.', mode: 'sequence', scene: 'remake', wpm: 17,
          items: S('grounds', 'compost', ['collect the grounds', 'dry them out', 'mix with dry leaves', 'turn the heap weekly', 'feed the kitchen garden']) },
        { title: 'Oil to Biodiesel', objective: 'Follow used cooking oil from the fryer to a fuel tank.', tip: 'Never pour oil down the sink. It sets hard and blocks the drains.', mode: 'sequence', scene: 'remake', wpm: 18,
          items: S('oil', 'fuel', ['let the oil cool down', 'pour it into a sealed drum', 'book a collection', 'filter out food bits', 'convert it to biodiesel', 'fuel the delivery van']) },
        { title: 'Boxes to Menus', objective: 'Turn recovered cardboard into new paper menus.', tip: 'Watch the punctuation. Commas count.', mode: 'sequence', scene: 'remake', wpm: 18,
          items: S('box', 'paper', ['Flatten the boxes.', 'Keep them clean and dry.', 'Pulp the card with water.', 'Press it into new sheets.', 'Print fresh menus, then reuse!']) },
        { title: 'Material Match Sprint', objective: 'Match materials to products against the clock.', tip: 'Same pairs as before, but against the clock.', mode: 'decision', scene: 'match', time: 85, wpm: 18, pass: 0.6, count: 10, shuffle: true,
          items: w7('grounds', 'oil', 'card', 'glass', 'plastic', 'scraps', 'peel', 'jars', 'menus', 'fryer') },
        { title: 'Circular Kitchen', final: true, objective: 'Run the full workshop: glass and plastic get a second life.', tip: 'Long instructions. Read ahead and keep a steady pace.', mode: 'sequence', scene: 'remake', time: 150, wpm: 19, pass: 0.6,
          items: [...S('glass', 'glass', ['Sort the glass by colour.', 'Crush it into cullet.', 'Melt it in the furnace.', 'Mould 6 new bottles.']), ...S('bottle', 'fabric', ['Wash the plastic bottles.', 'Shred them into flakes.', 'Spin the flakes into yarn.', 'Sew 12 new aprons!'])] },
      ],
    },
  ];

  /* Derive ids + defaults */
  CY.data.worlds.forEach((w) => {
    w.lessons.forEach((l, i) => {
      l.id = `w${w.id}l${i + 1}`;
      l.world = w.id;
      l.n = i + 1;
      if (l.mode === 'decision' && !l.options) l.options = w.options;
      if (l.keyboard === undefined) l.keyboard = w.id <= 2;
    });
  });

  CY.data.world = (id) => CY.data.worlds.find((w) => w.id === +id);
  CY.data.lesson = (lid) => {
    const m = /^w(\d)l(\d)$/.exec(lid);
    if (!m) return null;
    const w = CY.data.world(m[1]);
    return w && w.lessons[m[2] - 1];
  };

  /* Pools for the Daily Challenge and Licence mode */
  CY.data.pools = {
    sort: Object.values(W5_ITEMS).filter((x) => !x.then),
    rescue: Object.values(W6_ITEMS).filter((x) => !x.then),
    match: Object.values(W7_MATCH),
  };
})();
