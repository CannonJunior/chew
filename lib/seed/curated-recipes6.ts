#!/usr/bin/env tsx
/**
 * Curated vegetarian recipes — 10 varied dishes from around the world.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npm run seed:recipes6
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');

type Recipe = {
  name: string;
  description: string;
  chef: string;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  cuisine?: string;
  difficulty?: string;
  ingredients: string[];
  steps: string[];
  source_url?: string;
  image_url?: string;
};

const RECIPES: Recipe[] = [
  {
    name: "Palak Paneer",
    description: "One of India's most beloved dishes — cubes of fresh paneer suspended in a vivid emerald sauce of blanched spinach, aromatics, and warm spices. The trick is a quick ice-bath after blanching to preserve the bright colour, and a final swirl of cream to round out the heat.",
    chef: "Green AI",
    prep_time_mins: 20,
    cook_time_mins: 25,
    servings: 4,
    cuisine: "Indian",
    difficulty: "medium",
    ingredients: [
      "500g fresh spinach (palak), tough stems removed",
      "400g paneer, cut into 2 cm cubes",
      "2 tbsp ghee or neutral oil, divided",
      "1 large onion, finely diced",
      "4 garlic cloves, minced",
      "1 tbsp fresh ginger, grated",
      "2 green chillies, slit lengthways (deseed for less heat)",
      "1 large tomato, roughly chopped",
      "1 tsp cumin seeds",
      "1 tsp ground coriander",
      "1/2 tsp ground cumin",
      "1/2 tsp garam masala",
      "1/4 tsp turmeric",
      "1/2 tsp fine sea salt, plus more to taste",
      "3 tbsp heavy cream (or cashew cream)",
      "1 tbsp fresh lemon juice",
    ],
    steps: [
      "Blanch the spinach: bring a large pot of salted water to a boil. Add spinach and cook for 90 seconds until just wilted. Drain immediately and transfer to a bowl of ice water to stop cooking and fix the colour. Squeeze out excess water, then blend to a smooth purée. Set aside.",
      "Pan-fry the paneer: heat 1 tbsp ghee in a wide non-stick pan over medium-high heat. Add paneer cubes and fry, turning occasionally, until golden on most sides, about 4 minutes. Transfer to a plate and set aside.",
      "In the same pan, add the remaining ghee over medium heat. Add cumin seeds and let them sizzle for 30 seconds until fragrant.",
      "Add onion and cook, stirring occasionally, for 8–10 minutes until deep golden. Add garlic, ginger, and green chillies; cook for 2 minutes more.",
      "Add chopped tomato, coriander, ground cumin, turmeric, and salt. Cook, mashing the tomato as it softens, for 5 minutes until the masala is thick and oil begins to separate.",
      "Stir in the spinach purée and 100ml water. Simmer over medium-low heat for 5 minutes, stirring occasionally.",
      "Gently fold in the fried paneer. Simmer for 3–4 minutes to let the paneer absorb the flavours.",
      "Stir in the cream and lemon juice. Taste and adjust salt and spice. Finish with a pinch of garam masala. Serve hot with basmati rice or warm naan.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Palak_paneer.jpg/1024px-Palak_paneer.jpg",
  },
  {
    name: "Shakshuka",
    description: "Eggs poached directly in a bubbling pan of spiced tomato and pepper sauce — a North African and Middle Eastern staple that has become a worldwide brunch icon. The sauce is built slowly so the tomatoes caramelise and the harissa blooms, creating a rich, smoky base that is as good scooped up with torn flatbread at midnight as it is at breakfast.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "North African / Middle Eastern",
    difficulty: "easy",
    ingredients: [
      "3 tbsp olive oil",
      "1 large onion, thinly sliced",
      "1 red bell pepper, deseeded and thinly sliced",
      "1 yellow bell pepper, deseeded and thinly sliced",
      "4 garlic cloves, minced",
      "1–2 tsp harissa paste (adjust to taste)",
      "1 tsp smoked paprika",
      "1 tsp ground cumin",
      "1/2 tsp ground coriander",
      "Pinch of cayenne pepper",
      "800g canned whole peeled tomatoes, crushed by hand",
      "1 tsp fine sea salt",
      "1 tsp sugar",
      "6 large eggs",
      "100g feta cheese, crumbled",
      "Small handful of fresh flat-leaf parsley or coriander, roughly chopped",
      "Flatbread or crusty bread, to serve",
    ],
    steps: [
      "Heat olive oil in a large, wide, lidded frying pan over medium heat. Add onion and peppers and cook, stirring occasionally, for 12–15 minutes until very soft and starting to caramelise at the edges.",
      "Add garlic, harissa, smoked paprika, cumin, coriander, and cayenne. Stir well and cook for 2 minutes until the spices are fragrant and the paste has darkened slightly.",
      "Pour in the crushed tomatoes, salt, and sugar. Stir to combine and simmer uncovered for 10–12 minutes, stirring occasionally, until the sauce is thick enough to hold a small well when you drag a spoon through it.",
      "Taste the sauce and adjust seasoning — it should be savoury, slightly sweet, and have a background heat.",
      "Using the back of a large spoon, make 6 evenly spaced wells in the sauce. Crack one egg into each well.",
      "Scatter the feta over the top of the sauce (not directly on the yolks). Cover the pan with a lid and cook over medium-low heat for 5–7 minutes: the whites should be fully set but the yolks still runny. For firmer yolks, cook 2 minutes longer.",
      "Remove from the heat, scatter generously with fresh herbs, and serve immediately from the pan with plenty of bread for scooping.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Shakshuka_%28Shakshouka%29.jpg/1024px-Shakshuka_%28Shakshouka%29.jpg",
  },
  {
    name: "Mushroom Bourguignon",
    description: "A vegetarian reimagining of the great Burgundian braise — portobello and chestnut mushrooms slow-cooked in red wine with pearl onions, carrots, and a bouquet garni until the sauce becomes deeply glossy and complex. It has all the Sunday-evening gravitas of the original, served with creamy mashed potato or crusty bread.",
    chef: "Green AI",
    prep_time_mins: 20,
    cook_time_mins: 55,
    servings: 4,
    cuisine: "French",
    difficulty: "medium",
    ingredients: [
      "500g chestnut mushrooms, quartered",
      "300g portobello mushrooms, cut into 3 cm chunks",
      "200g pearl onions (or small shallots), peeled",
      "2 medium carrots, sliced into coins",
      "4 garlic cloves, minced",
      "2 tbsp tomato paste",
      "350ml dry red wine (Burgundy or Pinot Noir)",
      "350ml vegetable stock",
      "3 tbsp olive oil, divided",
      "2 tbsp butter",
      "2 sprigs fresh thyme",
      "1 bay leaf",
      "1 tbsp plain flour",
      "1 tbsp soy sauce (for umami depth)",
      "Salt and freshly ground black pepper",
      "Fresh flat-leaf parsley, chopped, to finish",
    ],
    steps: [
      "In a large Dutch oven or heavy casserole, heat 2 tbsp olive oil over high heat until smoking. Add the mushrooms in a single layer (cook in batches if needed) and cook without stirring for 3–4 minutes until deeply browned. Season with salt and pepper, then transfer to a plate.",
      "Reduce heat to medium. Add the remaining tbsp olive oil and the pearl onions. Cook, stirring occasionally, for 8 minutes until golden on all sides. Add the carrots and cook for 3 minutes more. Add garlic and cook 1 minute.",
      "Stir in the tomato paste and flour; cook, stirring constantly, for 2 minutes until the paste darkens and smells toasty.",
      "Pour in the red wine, scraping up any browned bits from the base of the pot. Bring to a boil and let it reduce by one-third, about 5 minutes.",
      "Add the stock, soy sauce, thyme sprigs, and bay leaf. Return the seared mushrooms to the pot. The liquid should just cover the vegetables — add a splash more stock if needed.",
      "Bring to a gentle simmer, cover partially, and cook for 30–35 minutes until the sauce has reduced to a glossy, coating consistency and the vegetables are tender.",
      "Remove the thyme sprigs and bay leaf. Stir in the butter off the heat to enrich and shine the sauce. Taste and adjust seasoning.",
      "Serve in deep bowls over buttery mashed potato or egg noodles. Finish with a handful of fresh parsley.",
    ],
  },
  {
    name: "Ribollita",
    description: "Tuscan peasant cooking at its noblest — a thick, twice-cooked (ribollita means 'reboiled') soup of cannellini beans, cavolo nero, and yesterday's stale bread. It thickens overnight in the fridge, and on day two is often fried in olive oil until a golden crust forms on the bottom. Humble ingredients, extraordinary depth.",
    chef: "Green AI",
    prep_time_mins: 20,
    cook_time_mins: 60,
    servings: 6,
    cuisine: "Italian",
    difficulty: "easy",
    ingredients: [
      "3 tbsp extra virgin olive oil, plus more to finish",
      "1 large onion, finely diced",
      "2 celery stalks, finely diced",
      "2 medium carrots, finely diced",
      "4 garlic cloves, minced",
      "1/2 tsp chilli flakes",
      "2 tbsp tomato paste",
      "400g can whole plum tomatoes, crushed",
      "2 × 400g cans cannellini beans, drained and rinsed",
      "300g cavolo nero (or Tuscan kale), stems removed, leaves roughly chopped",
      "1.2 litres vegetable stock",
      "200g day-old sourdough or ciabatta, torn into rough chunks",
      "1 parmesan rind (optional but highly recommended for depth)",
      "2 sprigs fresh rosemary",
      "Salt and freshly ground black pepper",
      "Freshly grated Parmesan, to serve",
    ],
    steps: [
      "Heat olive oil in a large heavy pot over medium heat. Add onion, celery, and carrot with a generous pinch of salt. Cook, stirring occasionally, for 12–15 minutes until very soft and sweet but not coloured.",
      "Add garlic and chilli flakes; cook for 1 minute. Stir in tomato paste and cook for 2 minutes until darkened.",
      "Add the crushed tomatoes and cook for 5 minutes, stirring occasionally, until the sauce is thick.",
      "Mash roughly half of the cannellini beans with a fork or potato masher to create a creamy paste. Add both the mashed and whole beans to the pot.",
      "Add the stock, cavolo nero, rosemary sprigs, and parmesan rind if using. Bring to a simmer, cover partially, and cook for 30 minutes.",
      "Add the torn bread and stir well — it will absorb into the soup and make it extremely thick. Cook for a further 10 minutes, stirring often to prevent sticking. Remove the rosemary and parmesan rind.",
      "The soup should be very thick — almost porridge-like. Season generously. For best results, cool, refrigerate overnight, and reheat the next day: the flavour deepens considerably.",
      "Serve in wide bowls with a vigorous drizzle of your best olive oil and freshly grated Parmesan.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ribollita_Soup.jpg/1024px-Ribollita_Soup.jpg",
  },
  {
    name: "Harissa Cauliflower with Chickpeas and Yogurt",
    description: "A sheet pan dinner that punches far above its weight — cauliflower florets and chickpeas tossed in harissa and roasted at high heat until caramelised and almost crispy at the edges, then spooned over cooling tahini-lemon yogurt. A squeeze of pomegranate and fresh herbs finishes a dish that takes 35 minutes start to finish.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "North African / Middle Eastern",
    difficulty: "easy",
    ingredients: [
      "1 large head cauliflower (about 1kg), broken into medium florets",
      "400g can chickpeas, drained, rinsed, and patted dry",
      "3 tbsp harissa paste",
      "3 tbsp olive oil",
      "1 tsp ground cumin",
      "1 tsp smoked paprika",
      "1/2 tsp fine sea salt",
      "400g thick plain yogurt (Greek or labneh)",
      "2 tbsp tahini",
      "Juice of 1 lemon",
      "1 small garlic clove, minced",
      "2 tbsp pomegranate molasses (or seeds from 1/2 pomegranate)",
      "Small handful of fresh mint and flat-leaf parsley",
      "2 tbsp toasted pine nuts or flaked almonds",
      "Flatbread or pitta, to serve",
    ],
    steps: [
      "Preheat the oven to 220°C (fan 200°C). Line a large baking tray with parchment.",
      "In a large bowl, toss the cauliflower florets and dried chickpeas with the harissa, olive oil, cumin, smoked paprika, and salt until everything is evenly coated.",
      "Spread in a single layer on the baking tray — do not crowd or the vegetables will steam rather than roast. Use two trays if needed.",
      "Roast for 28–32 minutes, tossing once halfway, until the cauliflower is tender and deeply caramelised in spots and the chickpeas are crispy.",
      "While the cauliflower roasts, whisk together the yogurt, tahini, lemon juice, and garlic. Season with salt. Spread in a thick layer across a wide serving platter or individual plates.",
      "Pile the hot roasted cauliflower and chickpeas over the yogurt. Drizzle generously with pomegranate molasses.",
      "Scatter the fresh herbs and toasted nuts over the top. Serve immediately with warm flatbread.",
    ],
  },
  {
    name: "Borscht",
    description: "The great crimson soup of Eastern Europe — sweet-earthy beetroot slow-cooked with cabbage, carrot, potato, and tomato until the broth turns an impossibly deep ruby. Every family has their own version; this one leans Ukrainian: a long simmer with a sautéed flavour base and a spoonful of vinegar at the end to sharpen everything up. Serve with a thick cap of sour cream and fresh dill.",
    chef: "Green AI",
    prep_time_mins: 25,
    cook_time_mins: 60,
    servings: 6,
    cuisine: "Eastern European",
    difficulty: "medium",
    ingredients: [
      "500g raw beetroot (about 3 medium), peeled and coarsely grated",
      "300g green or white cabbage, finely shredded",
      "2 medium carrots, coarsely grated",
      "2 medium potatoes (about 400g), peeled and cut into 1 cm dice",
      "1 large onion, finely diced",
      "3 garlic cloves, minced",
      "2 tbsp tomato paste",
      "400g can chopped tomatoes",
      "1.8 litres vegetable stock",
      "3 tbsp sunflower or neutral oil",
      "2 tbsp red wine vinegar or apple cider vinegar",
      "1 tsp sugar",
      "1 tsp fine sea salt, plus more to taste",
      "1/2 tsp freshly ground black pepper",
      "2 bay leaves",
      "Sour cream or crème fraîche, to serve",
      "Large bunch of fresh dill, chopped, to serve",
      "Crusty rye bread, to serve",
    ],
    steps: [
      "Heat the oil in a large heavy pot over medium heat. Add the onion and cook for 8 minutes until softened and golden. Add the carrots and cook for 3 minutes more.",
      "Add the garlic and tomato paste; stir and cook for 2 minutes until the paste darkens and smells sweet.",
      "Add the grated beetroot and stir to coat in the aromatics. Cook, stirring occasionally, for 5 minutes until the beetroot softens slightly.",
      "Pour in the stock and canned tomatoes. Add the potatoes, cabbage, bay leaves, salt, and pepper. Bring to a boil, then reduce to a steady simmer.",
      "Cover partially and cook for 40–45 minutes, stirring occasionally, until the potatoes are completely tender and the beetroot has given up all its colour into the broth.",
      "Stir in the vinegar and sugar. Taste and adjust — the soup should be a balance of savoury, sweet, and sour. Add more vinegar for sharpness, more sugar if the beetroot is earthy rather than sweet, and more salt as needed. Remove the bay leaves.",
      "Ladle into deep bowls. Top with a generous spoonful of sour cream and a heavy handful of fresh dill. Serve with rye bread.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Borscht_served.jpg/1024px-Borscht_served.jpg",
  },
  {
    name: "Mujaddara",
    description: "One of the oldest dishes in the world — lentils and rice or bulgur cooked together with spiced caramelised onions that take the better part of an hour to make properly. The onions are the soul of the dish: they must go far past golden, into deep mahogany, becoming almost jammy and sweet. The contrast of the nutty lentils against the crispy-soft onion is startlingly good for something so simple.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 65,
    servings: 4,
    cuisine: "Levantine",
    difficulty: "medium",
    ingredients: [
      "250g green or brown lentils, rinsed",
      "200g long-grain white rice (or coarse bulgur wheat), rinsed",
      "4 large onions (about 800g total), halved and thinly sliced into half-moons",
      "120ml olive oil",
      "1 tsp ground cumin",
      "1 tsp ground allspice",
      "1/2 tsp ground cinnamon",
      "1/2 tsp ground coriander",
      "1 tsp fine sea salt",
      "850ml water",
      "Plain yogurt, to serve",
      "Fresh flat-leaf parsley, chopped, to serve",
      "Lemon wedges, to serve",
    ],
    steps: [
      "Cook the onions: heat the olive oil in a large wide pot over medium-high heat. Add all the sliced onions with a pinch of salt. Cook, stirring every few minutes, for 45–55 minutes. The onions will first release water, then steam, then slowly collapse and turn golden, then bronze, then deep mahogany. Do not rush this step — the caramelisation is where all the flavour lives. If they start to catch, reduce the heat slightly. Remove about a third of the onions to a plate lined with paper towel — these will be your crispy garnish.",
      "To the remaining onions in the pot, add the cumin, allspice, cinnamon, and coriander. Stir for 1 minute until the spices bloom in the oil.",
      "Add the lentils and 700ml of the water. Bring to a boil, then reduce to a simmer. Cook uncovered for 15 minutes until the lentils are just barely tender — they should have a little bite remaining.",
      "Add the rinsed rice, remaining 150ml water, and salt. Stir once to combine. Bring back to a simmer, then cover tightly with a lid. Cook over very low heat for 15 minutes without lifting the lid.",
      "Remove from heat and let the pot steam, still covered, for 10 minutes.",
      "Fluff gently with a fork. Taste and adjust salt. Pile onto a large platter and top with the reserved crispy caramelised onions. Serve with a big bowl of yogurt, fresh parsley, and lemon wedges.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mujaddara.jpg/1024px-Mujaddara.jpg",
  },
  {
    name: "Saag Aloo",
    description: "A workhorse of the Indian vegetarian kitchen — cubes of waxy potato sautéed until golden, then finished in a spiced mustard-seed-popped sauce with fresh spinach. Saag aloo is ready in 30 minutes, makes an excellent side dish alongside dal and rice, and is just as satisfying eaten straight from the pan with torn roti.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "Indian",
    difficulty: "easy",
    ingredients: [
      "700g waxy potatoes (e.g. Charlotte or Yukon Gold), peeled and cut into 2 cm cubes",
      "400g fresh spinach, roughly chopped (or 200g frozen, thawed and squeezed dry)",
      "3 tbsp ghee or neutral oil",
      "1 tsp black mustard seeds",
      "1 tsp cumin seeds",
      "1 large onion, finely diced",
      "3 garlic cloves, minced",
      "1 tbsp fresh ginger, grated",
      "2 green chillies, finely sliced",
      "1 tsp ground coriander",
      "1/2 tsp ground turmeric",
      "1/2 tsp garam masala",
      "1/2 tsp fine sea salt, plus more to taste",
      "Juice of 1/2 lemon",
    ],
    steps: [
      "Parboil the potatoes: place cubed potatoes in a pan of cold salted water. Bring to a boil and cook for 5 minutes — they should be just barely yielding when pierced with a knife. Drain and set aside.",
      "Heat ghee in a large frying pan over medium-high heat. Add the mustard seeds and cumin seeds. As soon as the mustard seeds begin to pop (about 30 seconds), add the onion.",
      "Cook the onion, stirring often, for 8–10 minutes until golden. Add garlic, ginger, and green chillies; cook for 2 minutes.",
      "Add the ground coriander and turmeric. Stir for 30 seconds, then add the parboiled potatoes in a single layer. Press them gently against the pan and cook undisturbed for 3–4 minutes until golden on the underside.",
      "Toss the potatoes to coat in the spiced mixture. Cook for a further 3 minutes, turning occasionally, until evenly golden.",
      "Add the spinach in large handfuls — it will wilt down quickly. Stir to combine with the potatoes. Cook for 3–4 minutes until the spinach is tender and any excess moisture has evaporated.",
      "Season with salt, garam masala, and lemon juice. Toss well and serve immediately with roti or rice.",
    ],
  },
  {
    name: "Paneer Tikka Masala",
    description: "The vegetarian answer to the world's most popular curry — chunks of paneer marinated in spiced yogurt, charred under a hot grill to replicate the tandoor effect, then folded into a velvety, fragrant tomato-cream sauce. The two-stage cooking gives the paneer a smoky char on the outside while keeping it soft within, and the masala sauce is rich enough to be a meal in itself.",
    chef: "Green AI",
    prep_time_mins: 30,
    cook_time_mins: 35,
    servings: 4,
    cuisine: "British-Indian",
    difficulty: "medium",
    ingredients: [
      "500g paneer, cut into 3 cm cubes",
      "150g thick plain yogurt",
      "1 tbsp lemon juice",
      "2 tsp Kashmiri chilli powder (or mild chilli powder + 1/2 tsp paprika)",
      "1 tsp ground cumin",
      "1 tsp ground coriander",
      "1/2 tsp garam masala",
      "1/2 tsp ground turmeric",
      "1 tbsp neutral oil",
      "Salt to taste",
      "For the masala sauce:",
      "3 tbsp butter or ghee",
      "1 large onion, finely chopped",
      "4 garlic cloves, minced",
      "1 tbsp fresh ginger, grated",
      "2 tsp Kashmiri chilli powder",
      "2 tsp ground coriander",
      "1 tsp ground cumin",
      "1/2 tsp garam masala",
      "400g can crushed tomatoes",
      "150ml heavy cream",
      "1 tsp sugar",
      "Salt to taste",
      "Fresh coriander leaves, to serve",
    ],
    steps: [
      "Marinate the paneer: mix together the yogurt, lemon juice, Kashmiri chilli, cumin, coriander, garam masala, turmeric, oil, and 1/2 tsp salt in a bowl. Add the paneer cubes and toss gently to coat. Cover and marinate for at least 20 minutes (or up to 4 hours in the fridge).",
      "Preheat the grill (broiler) to its highest setting. Thread the paneer onto metal skewers or spread on a foil-lined baking tray. Grill 10–15 cm from the heat for 8–10 minutes, turning once, until the paneer is charred and blistered in spots. Set aside.",
      "Make the sauce: melt butter in a large saucepan over medium heat. Add onion and cook for 10–12 minutes until deep golden. Add garlic and ginger; cook 2 minutes.",
      "Add the Kashmiri chilli, coriander, cumin, and garam masala. Stir for 1 minute until the kitchen smells fragrant and the spices have darkened slightly.",
      "Add the crushed tomatoes. Cook, stirring regularly, for 10 minutes until the sauce thickens and oil separates at the edges.",
      "Add 100ml water and stir. Use an immersion blender (or transfer in batches) to blend the sauce until very smooth. Return to the pan.",
      "Stir in the cream, sugar, and salt. Simmer for 5 minutes. Fold in the grilled paneer pieces and simmer gently for 3 minutes to allow the paneer to absorb the sauce.",
      "Taste and adjust seasoning. Serve over basmati rice or with garlic naan. Scatter fresh coriander generously over the top.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Paneer_Tikka.jpg/1024px-Paneer_Tikka.jpg",
  },
  {
    name: "Miso-Glazed Aubergine (Nasu Dengaku)",
    description: "A Japanese izakaya classic — aubergine halves roasted until collapsing-tender, then brushed with a sweet miso glaze and caramelised under the grill until they are lacquered and almost sticky. The contrast between the silky interior, the bitter skin, and the sweet-salty glaze is one of the great flavour combinations in vegetable cooking. Ready in 35 minutes.",
    chef: "Green AI",
    prep_time_mins: 5,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "Japanese",
    difficulty: "easy",
    ingredients: [
      "4 medium aubergines (eggplant), about 200g each",
      "2 tbsp neutral oil (e.g. sunflower or rapeseed)",
      "For the dengaku miso glaze:",
      "80g white miso paste (shiro miso)",
      "3 tbsp mirin",
      "2 tbsp sake (or dry sherry)",
      "1 tbsp caster sugar",
      "1 tsp sesame oil",
      "To garnish:",
      "2 tsp toasted sesame seeds",
      "2 spring onions (scallions), thinly sliced",
      "Steamed Japanese rice, to serve",
    ],
    steps: [
      "Preheat the oven to 200°C (fan 180°C). Line a baking tray with foil.",
      "Halve the aubergines lengthways. Score the cut surface in a deep crosshatch pattern — cut down to about 1 cm from the skin in both directions. This helps the glaze penetrate and the flesh to cook through faster.",
      "Brush the cut surfaces generously with neutral oil and season lightly with salt. Place cut-side down on the baking tray. Roast for 20 minutes until the skin is slightly shrivelled and the flesh is almost fully tender.",
      "Make the glaze: combine the miso, mirin, sake, and sugar in a small saucepan over low heat. Whisk continuously for 3–4 minutes until the sugar dissolves and the glaze is smooth and glossy. Remove from heat, stir in the sesame oil. Set aside.",
      "Switch the oven to grill (broiler) on high. Flip the aubergine halves cut-side up. Spoon a generous tablespoon of miso glaze over each half, spreading it into the score marks.",
      "Grill 10–15 cm from the heat for 5–7 minutes until the glaze is deeply caramelised, bubbling, and charred at the edges.",
      "Serve immediately over steamed rice, scattered with toasted sesame seeds and sliced spring onions.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Nasu_dengaku.jpg/1024px-Nasu_dengaku.jpg",
    source_url: "https://www.justonecookbook.com/nasu-dengaku-miso-glazed-eggplant/",
  },
];

async function main() {
  const sqlite = new Database(DB_PATH);

  const existingRows = sqlite.prepare('SELECT title FROM recipes').all() as { title: string }[];
  const existingTitles = new Set(existingRows.map((r) => r.title));

  const insertRecipe = sqlite.prepare(`
    INSERT INTO recipes (id, title, description, cuisine, difficulty, prep_time_min, cook_time_min, servings, tags, source_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertIngredient = sqlite.prepare(`
    INSERT INTO recipe_ingredients (id, recipe_id, wiki_id, name_override, amount, unit, notes, optional, step_order)
    VALUES (?, ?, NULL, ?, NULL, NULL, NULL, 0, ?)
  `);
  const insertStep = sqlite.prepare(`
    INSERT INTO recipe_steps (id, recipe_id, step_number, instruction, duration_min, tip, image_path)
    VALUES (?, ?, ?, ?, NULL, NULL, NULL)
  `);
  const insertMedia = sqlite.prepare(`
    INSERT OR IGNORE INTO recipe_media (id, recipe_id, type, url_or_path, caption, is_primary, sort_order)
    VALUES (?, ?, 'image', ?, 'Primary recipe photo', 1, 0)
  `);

  let inserted = 0;
  let skipped = 0;
  const ts = Math.floor(Date.now() / 1000);

  const seedAll = sqlite.transaction(() => {
    for (const recipe of RECIPES) {
      if (existingTitles.has(recipe.name)) { skipped++; continue; }

      const id = ulid();
      insertRecipe.run(
        id,
        recipe.name,
        `[${recipe.chef}] ${recipe.description}`,
        recipe.cuisine ?? null,
        recipe.difficulty ?? 'medium',
        recipe.prep_time_mins,
        recipe.cook_time_mins,
        recipe.servings,
        JSON.stringify([recipe.chef]),
        recipe.source_url ?? null,
        ts,
        ts,
      );

      recipe.ingredients.forEach((ing: string, i: number) => {
        insertIngredient.run(ulid(), id, ing, i + 1);
      });

      recipe.steps.forEach((step: string, i: number) => {
        const instruction = step.replace(/^\d+\.\s*/, '');
        insertStep.run(ulid(), id, i + 1, instruction);
      });

      if (recipe.image_url) {
        insertMedia.run(ulid(), id, recipe.image_url);
      }

      existingTitles.add(recipe.name);
      inserted++;
    }
  });

  seedAll();
  sqlite.close();

  console.log(`✅ Recipe seed complete — ${inserted} inserted, ${skipped} already existed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
