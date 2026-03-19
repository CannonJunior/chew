#!/usr/bin/env tsx
/**
 * Curated recipe seed — 17 iconic recipes from celebrated chefs.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npx tsx lib/seed/curated-recipes.ts
 *         npm run seed:recipes
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
};

/* ─── Recipe Data ─────────────────────────────────────────────────────────── */

const RECIPES: Recipe[] = [
  {
    name: "Celeriac Shawarma",
    chef: "René Redzepi",
    description: "René Redzepi's Celeriac Shawarma was the centrepiece dish of Noma's 2018 vegetable season menu in Copenhagen. Inspired by tacos al pastor encountered in Mexico, the team spent most of a day slicing a whole celeriac into hundreds of thin tranches, layering them with truffle juice and purée, and slow-roasting the reconstituted bulb on a spit until caramelised and glistening like lamb shawarma.",
    cuisine: "New Nordic",
    difficulty: "hard",
    prep_time_mins: 480,
    cook_time_mins: 240,
    servings: 4,
    ingredients: [
      "1 large whole celeriac (about 1.5kg), peeled",
      "100ml black truffle juice",
      "50g black truffle purée",
      "30g koji (rice koji)",
      "50g unsalted butter, melted",
      "2 tablespoons neutral oil",
      "Sea salt and white pepper to taste",
      "50ml mushroom stock",
      "20g dried seaweed (kombu), ground to powder",
      "2 tablespoons brown butter",
      "4 large outer leaves of steamed seasonal greens (cavolo nero or similar)",
      "50g fresh white currants",
      "1 grilled apple, cored and quartered",
      "4 slices sourdough bread, grilled",
      "Koji emulsion (50g koji, 100ml neutral oil, 20ml water, blended and strained)",
    ],
    steps: [
      "Using a mandoline or very sharp knife, slice the celeriac into paper-thin rounds. Keep the slices in order so the celeriac can be reconstructed.",
      "Whisk together the truffle juice, truffle purée, melted butter and a pinch of salt to form the layering sauce.",
      "Brush each celeriac slice with the truffle-butter mixture and stack them back into the original celeriac shape, pressing firmly to compact.",
      "Wrap the reconstructed celeriac tightly in cling film and refrigerate for at least 2 hours to allow the layers to adhere.",
      "Remove the cling film and secure the celeriac onto a rotisserie spit or place on a wire rack set over a roasting tray.",
      "Roast at 160°C (320°F) rotating slowly (or turning every 20 minutes) for 3–4 hours, basting every 30 minutes with the truffle-butter sauce, until deeply caramelised and tender throughout.",
      "Meanwhile prepare the mushroom-seaweed sauce: combine mushroom stock, ground kombu and brown butter in a small saucepan, simmer for 5 minutes, season and keep warm.",
      "Prepare the koji emulsion by blending koji with neutral oil and water until smooth, then pass through a fine sieve.",
      "Steam the greens until just tender. Grill apple quarters on a hot griddle pan until lightly charred.",
      "Carve the shawarma tableside in thin shavings. Arrange on warm plates with steamed greens, grilled apple and white currants.",
      "Spoon mushroom-seaweed sauce around the plate, drizzle koji emulsion over the celeriac, and serve with grilled sourdough.",
    ],
  },
  {
    name: "Black Cod with Miso",
    chef: "Nobu Matsuhisa",
    description: "Nobu Matsuhisa's signature dish, created in the 1980s at his Los Angeles restaurant. Black cod (sablefish) is marinated for 2–3 days in a sweet white miso glaze, then broiled until lacquered and caramelised. It became one of the most imitated and beloved Japanese-American dishes in the world and put Nobu's cuisine on the global map.",
    cuisine: "Japanese-American",
    difficulty: "medium",
    prep_time_mins: 10,
    cook_time_mins: 15,
    servings: 4,
    ingredients: [
      "4 black cod fillets (about 175g / 6oz each), skin-on",
      "3 tablespoons sake",
      "3 tablespoons mirin",
      "450g (1 lb) white miso paste (shiro miso)",
      "225g (1 cup) sugar",
      "2 tablespoons vegetable oil",
      "Pickled ginger, to serve",
      "Hajikami (pickled ginger shoots), to garnish (optional)",
    ],
    steps: [
      "Make the miso marinade: combine sake and mirin in a medium saucepan and bring to a boil over high heat. Boil for 20 seconds to evaporate the alcohol.",
      "Reduce heat to medium and add the miso, stirring until fully dissolved. Add sugar and cook, stirring constantly, until dissolved and glossy, about 3–4 minutes. Remove from heat and cool completely.",
      "Pat the cod fillets very dry with paper towels. Place in a container, coat all over with the cooled miso marinade, cover and refrigerate for 2–3 days (minimum overnight).",
      "When ready to cook, preheat the broiler (grill) to high and set an oven rack about 15cm (6 inches) from the heat source.",
      "Wipe the excess marinade from the fillets (do not rinse) — too much miso will burn before the fish cooks through.",
      "Broil skin-side up for 3 minutes until the surface is deeply caramelised. Carefully turn fillets and broil flesh-side up for a further 4–5 minutes until the fish flakes easily.",
      "Serve immediately on warm plates, garnished with pickled ginger.",
    ],
  },
  {
    name: "Salmon Cornets",
    chef: "Thomas Keller",
    description: "Thomas Keller's iconic amuse-bouche from The French Laundry, served since the restaurant's earliest days. A miniature tuile cone is filled with salmon tartare and sweet red onion crème fraîche — an elegant one-bite paradox of crunch and cream. The cornet has become the most recognisable symbol of Keller's perfectionist philosophy: simple idea, flawless execution.",
    cuisine: "French-American",
    difficulty: "hard",
    prep_time_mins: 90,
    cook_time_mins: 20,
    servings: 12,
    ingredients: [
      // Tuile batter
      "115g (1 stick) unsalted butter, softened",
      "120g (1 cup) icing (confectioners') sugar, sifted",
      "3 large egg whites",
      "1 teaspoon vanilla extract",
      "120g (1 cup) plain flour, sifted",
      "1 tablespoon black sesame seeds",
      // Salmon tartare
      "225g (8oz) best-quality fresh salmon, very finely diced",
      "1 tablespoon finely minced shallot",
      "1 teaspoon finely minced chives",
      "1 teaspoon extra-virgin olive oil",
      "½ teaspoon lemon juice",
      "Fleur de sel and freshly ground white pepper",
      // Red onion crème fraîche
      "3 tablespoons crème fraîche",
      "1 tablespoon very finely minced red onion",
      "1 teaspoon lemon juice",
      "Pinch of salt",
    ],
    steps: [
      "Make the tuile batter: beat butter and icing sugar together until pale. Gradually beat in egg whites one at a time. Fold in flour and vanilla. Refrigerate for at least 1 hour.",
      "Preheat oven to 175°C (350°F). Spread tuile batter in very thin 7.5cm (3-inch) rounds on a silicone-lined baking sheet. Sprinkle with sesame seeds.",
      "Bake for 5–7 minutes until the edges are golden brown but centres are still pale. Working one at a time, quickly roll each hot tuile around the handle of a wooden spoon to form a cone. Hold until set (10–15 seconds). Cool on a rack.",
      "Make the red onion crème fraîche: stir together crème fraîche, red onion and lemon juice. Season with salt. Transfer to a piping bag and refrigerate.",
      "Prepare the salmon tartare no more than 30 minutes before serving: gently combine diced salmon, shallot, chives, olive oil and lemon juice. Season with fleur de sel and white pepper.",
      "To assemble: pipe a small amount of red onion crème fraîche into the bottom of each cone. Top with a generous teaspoon of salmon tartare.",
      "Stand the filled cornets in small glasses or a purpose-made cornet stand. Serve immediately.",
    ],
  },
  {
    name: "Pumpkin Pie",
    chef: "James Beard",
    description: "James Beard — 'the dean of American cookery' — championed honest, ingredient-forward American cooking throughout his career. His classic pumpkin pie uses real pumpkin purée with warming spices in a buttery short-crust pastry, representing everything he believed about celebrating American culinary tradition. This version from his collected works remains one of the definitive American holiday desserts.",
    cuisine: "American",
    difficulty: "easy",
    prep_time_mins: 30,
    cook_time_mins: 60,
    servings: 8,
    ingredients: [
      // Pastry
      "185g (1½ cups) plain flour",
      "½ teaspoon salt",
      "115g (½ cup) cold unsalted butter, cubed",
      "3–4 tablespoons ice-cold water",
      // Filling
      "425g (15oz) canned or fresh-cooked pumpkin purée",
      "3 large eggs, beaten",
      "200g (1 cup) packed brown sugar",
      "1 teaspoon ground cinnamon",
      "½ teaspoon ground ginger",
      "½ teaspoon freshly grated nutmeg",
      "¼ teaspoon ground cloves",
      "½ teaspoon salt",
      "360ml (1½ cups) evaporated milk or heavy cream",
      "Lightly sweetened whipped cream, to serve",
    ],
    steps: [
      "Make the pastry: pulse flour, salt and butter in a food processor until the mixture resembles breadcrumbs with some pea-sized pieces. Add ice water one tablespoon at a time until dough just comes together.",
      "Shape the dough into a disc, wrap in cling film and refrigerate for 30 minutes.",
      "Preheat oven to 220°C (425°F). Roll pastry on a floured surface and line a 23cm (9-inch) pie dish. Crimp edges and refrigerate while making the filling.",
      "Whisk together pumpkin purée, beaten eggs, brown sugar, all spices, and salt until smooth. Gradually whisk in evaporated milk until fully combined.",
      "Pour filling into the unbaked pastry shell.",
      "Bake at 220°C for 15 minutes, then reduce heat to 175°C (350°F) and bake for a further 40–45 minutes, until the filling is set at the edges but still has a slight wobble in the centre.",
      "Cool completely on a wire rack before slicing — the filling continues to set as it cools. Serve with whipped cream.",
    ],
  },
  {
    name: "Momofuku Pork Buns",
    chef: "David Chang",
    description: "David Chang put Momofuku Noodle Bar on the New York map with these deceptively simple steamed bao buns: pillowy white dough wrapped around thick-cut braised pork belly with cucumber, hoisin and Sriracha. Inspired by the Peking duck wraps Chang encountered in China, they have been copied the world over and are credited with igniting the modern bao boom in Western cities.",
    cuisine: "Asian-American",
    difficulty: "medium",
    prep_time_mins: 60,
    cook_time_mins: 180,
    servings: 8,
    ingredients: [
      // Pork belly
      "1kg (2.2 lb) skin-on pork belly, in one piece",
      "2 tablespoons vegetable oil",
      "2 tablespoons sugar",
      "2 tablespoons kosher salt",
      // Bao dough
      "300g (2½ cups) plain flour",
      "1 tablespoon sugar",
      "1½ teaspoons instant dried yeast",
      "180ml (¾ cup) warm whole milk",
      "1 tablespoon vegetable oil",
      "½ teaspoon baking powder",
      // Accompaniments
      "1 English cucumber, thinly sliced",
      "6 spring onions (scallions), trimmed",
      "4 tablespoons hoisin sauce",
      "Sriracha hot sauce, to taste",
    ],
    steps: [
      "Cure the pork: combine sugar and salt. Rub all over pork belly, place in a zip-lock bag and refrigerate for at least 6 hours, or overnight.",
      "Preheat oven to 130°C (275°F / Gas Mark 1). Rinse the cure off the belly and pat dry. Brown all over in a hot oven-proof pan with oil. Transfer to a roasting rack over a tray, skin-side up.",
      "Roast for 2½–3 hours until completely tender. Cool, then refrigerate until cold and firm (at least 2 hours). Slice into 1cm (½-inch) rounds.",
      "Make the bao: combine flour, sugar, salt and baking powder. Dissolve yeast in warm milk and let foam for 5 minutes. Add oil.",
      "Add milk mixture to flour and knead for 8 minutes until smooth. Cover and rest for 1 hour until doubled.",
      "Punch down dough and divide into 16 equal balls. Roll each into an oval (roughly 10 x 7cm). Brush top half lightly with oil, fold in half over a chopstick, then slide off and rest on baking paper for 20 minutes.",
      "Steam the bao in batches over boiling water for 10–12 minutes until puffed and cooked through.",
      "Pan-fry sliced pork belly in a hot non-stick pan until caramelised on both cut faces.",
      "To assemble: open a steamed bao, add a slice of pork belly, a few cucumber rounds, spring onion, a smear of hoisin and a dash of Sriracha.",
    ],
  },
  {
    name: "Maman's Cheese Soufflé",
    chef: "Jacques Pépin",
    description: "Jacques Pépin credits this soufflé to his mother, Jeannette, who ran a small restaurant in Bourg-en-Bresse. He has made it for decades to show that soufflés are far simpler than their fearsome reputation suggests — ready in under 30 minutes if the béchamel is made ahead. Use the best Gruyère you can find. The trick, Pépin insists, is a properly hot oven and confidence.",
    cuisine: "French",
    difficulty: "medium",
    prep_time_mins: 20,
    cook_time_mins: 28,
    servings: 4,
    ingredients: [
      "30g (2 tablespoons) unsalted butter, plus extra for greasing",
      "25g (3 tablespoons) plain flour",
      "250ml (1 cup) whole milk, hot",
      "4 large eggs, separated",
      "110g (4oz / 1 cup) Gruyère cheese, finely grated",
      "½ teaspoon Dijon mustard",
      "¼ teaspoon freshly grated nutmeg",
      "Salt and freshly ground black pepper",
      "Pinch of cream of tartar",
    ],
    steps: [
      "Preheat the oven to 200°C (400°F / Gas Mark 6). Generously butter a 1-litre (1-quart) soufflé dish. Dust with a little grated cheese, tapping out the excess.",
      "Make the béchamel: melt butter in a saucepan over medium heat. Add flour and cook, stirring, for 1 minute. Gradually whisk in hot milk until smooth. Cook, stirring constantly, for 2–3 minutes until very thick. Remove from heat.",
      "Beat the egg yolks into the warm (not hot) béchamel one at a time. Stir in most of the Gruyère (reserving 2 tablespoons), mustard and nutmeg. Season generously with salt and pepper.",
      "In a clean bowl, whisk egg whites with a pinch of cream of tartar until they form firm, glossy peaks — not dry.",
      "Stir a large spoonful of egg white vigorously into the béchamel to lighten it. Gently fold in the remaining whites in two additions with a large metal spoon, using sweeping under-and-over movements. Stop as soon as there are no white streaks — do not overmix.",
      "Pour the mixture into the prepared dish. Sprinkle reserved cheese on top.",
      "Bake for 25–28 minutes until well risen, golden on top and still very slightly wobbly in the centre. Serve immediately.",
    ],
  },
  {
    name: "Shepherd's Pie",
    chef: "Marco Pierre White",
    description: "Marco Pierre White, who became the youngest chef ever to receive three Michelin stars, has spoken about shepherd's pie as the dish he craves more than anything from the fine dining menus of his career. His version respects the original: good-quality lamb mince, proper lamb stock, and a buttery mashed-potato crust with a lacy brown top. Pure, unfussy British comfort food elevated by technique.",
    cuisine: "British",
    difficulty: "easy",
    prep_time_mins: 20,
    cook_time_mins: 60,
    servings: 4,
    ingredients: [
      // Filling
      "700g (1.5 lb) lamb mince",
      "2 tablespoons vegetable oil",
      "1 large onion, finely diced",
      "2 medium carrots, finely diced",
      "2 cloves garlic, minced",
      "2 tablespoons tomato purée",
      "1 tablespoon Worcestershire sauce",
      "300ml (1¼ cups) lamb or chicken stock",
      "2 sprigs fresh thyme",
      "1 bay leaf",
      "Salt and freshly ground black pepper",
      // Mash topping
      "900g (2 lb) floury potatoes (e.g. Maris Piper or Russet), peeled and cubed",
      "80g (6 tablespoons) unsalted butter",
      "120ml (½ cup) hot whole milk",
      "Salt and white pepper",
    ],
    steps: [
      "Heat oil in a large frying pan over high heat. Brown the lamb mince in batches, breaking up any lumps, until deep golden. Remove and set aside.",
      "In the same pan, soften onion and carrot over medium heat for 8 minutes. Add garlic and cook for 1 minute.",
      "Return the lamb to the pan. Stir in tomato purée and cook for 2 minutes. Add Worcestershire sauce, stock, thyme and bay leaf.",
      "Bring to a simmer and cook uncovered for 20–25 minutes until the sauce has thickened and coats the meat. Remove herbs and season well.",
      "Meanwhile, boil potatoes in salted water until completely tender, about 18 minutes. Drain thoroughly and return to the pan over low heat to dry out for 1–2 minutes.",
      "Mash the potatoes or pass through a potato ricer. Beat in butter and hot milk until silky smooth. Season well.",
      "Preheat oven to 200°C (400°F). Transfer the lamb filling to a large baking dish. Spoon mashed potato over the top, spreading to the edges and roughing up the surface with a fork.",
      "Bake for 25–30 minutes until the topping is golden brown and the filling is bubbling at the edges. Rest for 5 minutes before serving.",
    ],
  },
  {
    name: "Beef Bourguignon",
    chef: "Julia Child",
    description: "Julia Child introduced Americans to this quintessential French peasant dish through 'Mastering the Art of French Cooking' (1961) and her television series. Beef braised for hours in Burgundy wine with lardons, pearl onions and mushrooms became the dish that defined her legacy. Her careful instructions demystified French cuisine and convinced a generation of home cooks they could do it.",
    cuisine: "French",
    difficulty: "medium",
    prep_time_mins: 45,
    cook_time_mins: 210,
    servings: 6,
    ingredients: [
      "1.3kg (3 lb) beef chuck or braising steak, cut into 5cm (2-inch) cubes",
      "170g (6oz) bacon lardons or thick-cut bacon, diced",
      "1 tablespoon vegetable oil",
      "1 large carrot, sliced",
      "1 large onion, sliced",
      "Salt and freshly ground black pepper",
      "2 tablespoons plain flour",
      "750ml (1 bottle) Burgundy or other full-bodied red wine",
      "500ml (2 cups) beef stock",
      "1 tablespoon tomato paste",
      "2 cloves garlic, mashed",
      "1 sprig fresh thyme",
      "1 bay leaf",
      // Garnish
      "18–24 pearl onions, peeled",
      "450g (1 lb) cremini or button mushrooms, quartered",
      "30g (2 tablespoons) unsalted butter",
      "Fresh parsley, finely chopped",
    ],
    steps: [
      "Preheat oven to 230°C (450°F). Pat the beef dry with paper towels — this is essential for proper browning.",
      "In a large oven-proof casserole, sauté lardons in oil over medium heat until lightly browned. Remove and set aside. Raise heat to high.",
      "Brown the beef cubes in batches (do not crowd the pan) until dark on all sides, about 3–4 minutes per batch. Remove and set aside.",
      "In the same fat, brown the sliced onion and carrot. Return the beef and lardons to the pot. Season with salt and pepper, toss with flour and place uncovered in the oven for 4 minutes. Toss again and cook 4 more minutes (this browns the flour).",
      "Reduce oven to 165°C (325°F). Add wine, enough stock to barely cover the meat, tomato paste, garlic, thyme and bay leaf. Bring to a simmer on the stovetop, cover and braise in the oven for 2½–3 hours, until beef is fork-tender.",
      "Meanwhile, blanch pearl onions in boiling water for 1 minute, drain and peel. Braise in butter with a pinch of sugar and salt and a little stock until tender and glazed, about 15 minutes.",
      "Sauté mushrooms in butter over high heat until golden brown. Season and set aside.",
      "When the beef is tender, strain the braising liquid into a saucepan. Skim off fat and simmer until lightly thickened. Return beef, lardons, onions and mushrooms to the casserole, pour sauce over and simmer for 5 minutes.",
      "Serve garnished with fresh parsley, with crusty bread, boiled potatoes, or egg noodles.",
    ],
  },
  {
    name: "Nitro-Scrambled Egg and Bacon Ice Cream",
    chef: "Heston Blumenthal",
    description: "Heston Blumenthal's most famous showpiece dessert from The Fat Duck's 'Full English Breakfast' sequence uses liquid nitrogen to freeze a savoury egg-and-bacon ice cream tableside in less than a minute. The dish plays on Proust's idea of edible memory — every element tastes precisely of a childhood fry-up. It won The Fat Duck its third Michelin star in 2004 and represents the apex of molecular gastronomy.",
    cuisine: "Modern British",
    difficulty: "hard",
    prep_time_mins: 60,
    cook_time_mins: 30,
    servings: 4,
    ingredients: [
      // Bacon ice cream base
      "8 rashers (strips) smoked streaky bacon",
      "500ml (2 cups) whole milk",
      "500ml (2 cups) double (heavy) cream",
      "200g (1 cup) caster sugar",
      "8 large egg yolks",
      "1 tablespoon liquid glucose",
      // Scrambled egg mix
      "4 large whole eggs",
      "4 tablespoons double (heavy) cream",
      "20g (1½ tablespoons) unsalted butter",
      "Salt and white pepper",
      // Liquid nitrogen (to freeze tableside)
      "1 litre liquid nitrogen (handle with extreme care — cryogenic gloves and goggles required)",
      // Serving
      "Toast soldiers or crispy bacon shards",
    ],
    steps: [
      "Make bacon milk: fry bacon rashers until very crispy. Remove rashers and add raw milk to the pan. Gently warm, scraping up bacon fat. Steep for 20 minutes off heat, then strain. Refrigerate until needed.",
      "Make the custard base: heat bacon-infused milk with cream and glucose to just below simmering. Whisk egg yolks with sugar until pale. Slowly pour the hot cream mixture over the yolks, whisking constantly.",
      "Return mixture to the pan and cook over gentle heat, stirring with a spatula, until the custard reaches 82°C (180°F) and coats the back of a spoon. Strain, cool over ice, and refrigerate overnight.",
      "Transfer custard to a stand mixer with a whisk attachment. Working in a well-ventilated area and wearing protective gloves and goggles, slowly pour liquid nitrogen into the bowl while whisking at medium speed.",
      "Continue adding liquid nitrogen and whisking until the mixture reaches a smooth, scoopable ice cream consistency — approximately 3–5 minutes.",
      "For the scrambled eggs: melt butter in a small non-stick pan over very low heat. Beat eggs with cream, season lightly, and cook extremely slowly, stirring constantly, until just barely set — still trembling and glossy.",
      "Plate the scrambled eggs alongside a scoop of the bacon ice cream. Garnish with crispy bacon shards and toast soldiers. Serve immediately.",
    ],
  },
  {
    name: "Beatty's Chocolate Cake",
    chef: "Ina Garten",
    description: "Ina Garten named this beloved layer cake after her friend Beatty Blum, whose recipe she adapted. Published in 'Barefoot Contessa at Home' (2006), it became one of the most made recipes in the United States. The secret is hot black coffee in the batter — it doesn't make the cake taste of coffee but deepens the chocolate flavour dramatically. The chocolate ganache buttercream is equally legendary.",
    cuisine: "American",
    difficulty: "easy",
    prep_time_mins: 30,
    cook_time_mins: 40,
    servings: 8,
    ingredients: [
      // Cake
      "240ml (1 cup) buttermilk, shaken",
      "240ml (1 cup) strong hot black coffee",
      "120ml (½ cup) vegetable oil",
      "2 large eggs, at room temperature",
      "1 teaspoon pure vanilla extract",
      "400g (2 cups) caster (superfine) sugar",
      "225g (1¾ cups) plain flour",
      "75g (¾ cup) good-quality cocoa powder (Dutch-process)",
      "2 teaspoons baking soda",
      "1 teaspoon baking powder",
      "1 teaspoon kosher salt",
      // Chocolate frosting
      "170g (6oz) good-quality dark chocolate, finely chopped",
      "225g (2 sticks) unsalted butter, at room temperature",
      "1 egg yolk",
      "1 teaspoon pure vanilla extract",
      "300g (2½ cups) icing (confectioners') sugar, sifted",
      "1 tablespoon strong hot black coffee",
    ],
    steps: [
      "Preheat oven to 175°C (350°F). Butter and flour two 20cm (8-inch) round cake pans, lining the bottoms with baking paper.",
      "Whisk together buttermilk, hot coffee, oil, eggs and vanilla in a large bowl.",
      "Sift together sugar, flour, cocoa, baking soda, baking powder and salt in a separate bowl.",
      "Gradually add the dry ingredients to the wet, whisking until smooth — batter will be quite thin.",
      "Pour equally between the prepared pans and bake for 35–40 minutes until a toothpick inserted in the centre comes out clean. Cool in pans for 30 minutes, then turn out and cool completely on a rack.",
      "Make the frosting: melt chocolate in a heatproof bowl over barely simmering water. Cool to room temperature.",
      "Beat butter in a stand mixer until light and fluffy. Add egg yolk and vanilla. With mixer on low, gradually add icing sugar, then cooled chocolate and coffee. Beat on medium until smooth and spreadable.",
      "Place one cake layer on a serving plate and spread with frosting. Top with second layer and frost the top and sides. Refrigerate for 30 minutes before slicing.",
    ],
  },
  {
    name: "Dragon's Breath Chili",
    chef: "Guy Fieri",
    description: "Guy Fieri's Dragon's Breath Chili is a mega-bold Texas-style chili that has featured on multiple episodes of Diners, Drive-Ins and Dives. It is everything Fieri represents: no-holds-barred flavour with chunks of beef, layers of chili heat, dark beer and smoky bacon — served in a bread bowl for maximum Triple-D swagger.",
    cuisine: "American",
    difficulty: "easy",
    prep_time_mins: 20,
    cook_time_mins: 120,
    servings: 8,
    ingredients: [
      "900g (2 lb) beef chuck, cut into 1cm (½-inch) cubes",
      "450g (1 lb) hot Italian sausage, casings removed",
      "170g (6oz) thick-cut bacon, diced",
      "1 large onion, diced",
      "1 red bell pepper, diced",
      "1 green bell pepper, diced",
      "6 cloves garlic, minced",
      "2 jalapeños, seeds removed and minced",
      "1 chipotle in adobo, minced, plus 1 tablespoon adobo sauce",
      "2 tablespoons chili powder",
      "1 tablespoon ground cumin",
      "1 tablespoon smoked paprika",
      "1 teaspoon cayenne pepper",
      "2 cans (400g each) diced tomatoes",
      "1 can (400g) kidney beans, drained",
      "1 can (400g) black beans, drained",
      "350ml (12oz) dark beer (stout or porter)",
      "240ml (1 cup) beef stock",
      "2 tablespoons tomato paste",
      "Salt and freshly ground black pepper",
      "8 sourdough bread bowls, to serve",
      "Shredded cheddar, sour cream, and spring onions, to garnish",
    ],
    steps: [
      "In a large Dutch oven or heavy pot, cook bacon over medium-high heat until crispy. Remove bacon, leaving drippings in the pan.",
      "Brown beef in batches over high heat until dark and caramelised. Remove and set aside. Brown sausage, breaking up into crumbles; set aside.",
      "In the same pot, sauté onion and peppers until softened, about 6 minutes. Add garlic, jalapeño and chipotle; cook 1 minute.",
      "Add all the spices (chili powder, cumin, paprika, cayenne) and cook, stirring, for 1–2 minutes until fragrant.",
      "Return all the meats and bacon to the pot. Add tomatoes, beans, beer, stock and tomato paste. Stir well to combine.",
      "Bring to a boil, then reduce heat and simmer uncovered for 1½–2 hours, stirring occasionally, until the chili is thick and the beef is tender. Season with salt and pepper.",
      "Meanwhile, hollow out the bread bowls by cutting off the top and pulling out the interior.",
      "Ladle chili into bread bowls and top with shredded cheddar, sour cream and sliced spring onions.",
    ],
  },
  {
    name: "Next-Level Steak Sandwich",
    chef: "Jamie Oliver",
    description: "Jamie Oliver's steak sandwich is a simple but perfectly constructed handheld meal from his 5 Ingredients series. Thin sirloin steak, punchy horseradish, peppery watercress and roasted cherry tomatoes between thick-cut bread — it is the definition of his philosophy: great ingredients, minimal fuss, maximum flavour. It can be on the table in under 15 minutes.",
    cuisine: "British",
    difficulty: "easy",
    prep_time_mins: 10,
    cook_time_mins: 15,
    servings: 2,
    ingredients: [
      "2 x 200g (7oz) sirloin or rump steaks",
      "200g (7oz) cherry tomatoes on the vine",
      "4 thick slices sourdough or ciabatta bread",
      "2 tablespoons jarred horseradish sauce or creamed horseradish",
      "1 large handful of watercress",
      "2 tablespoons olive oil",
      "Flaky sea salt and freshly ground black pepper",
      "1 tablespoon unsalted butter",
    ],
    steps: [
      "Preheat oven to 200°C (400°F). Toss cherry tomatoes with 1 tablespoon olive oil and season. Roast for 10–12 minutes until blistered and jammy.",
      "Remove steaks from the fridge 20 minutes before cooking. Pat very dry and season generously on both sides with salt and pepper.",
      "Heat a cast-iron or heavy skillet over the highest heat until smoking. Add remaining oil and the steaks.",
      "Cook for 2 minutes per side for medium-rare (adjust timing to your preference). In the final 30 seconds, add butter and baste the steaks as it foams.",
      "Rest the steaks on a board for at least 3 minutes. Slice thinly against the grain.",
      "Toast the bread slices in the pan in the residual steak fat for 30 seconds per side.",
      "Spread horseradish sauce on one side of each toast. Layer with sliced steak, roasted tomatoes (squeeze them slightly to release their juices) and watercress. Season once more and serve immediately.",
    ],
  },
  {
    name: "Fried Yardbird",
    chef: "Marcus Samuelsson",
    description: "Marcus Samuelsson's Fried Yardbird is the signature dish of Red Rooster Harlem, the restaurant he opened in 2010 to celebrate the neighbourhood's culture. The name pays tribute to the Charlie Parker track 'Ornithology' (nicknamed Yardbird), and the dish fuses Southern fried chicken technique with Samuelsson's Swedish-Ethiopian heritage: the brine includes cardamom and berbere, and the chicken is finished with hot sauce butter.",
    cuisine: "American Soul Food",
    difficulty: "medium",
    prep_time_mins: 30,
    cook_time_mins: 30,
    servings: 4,
    ingredients: [
      // Brine
      "1 whole chicken (about 1.5kg / 3.5 lb), cut into 8 pieces",
      "1 litre (4 cups) buttermilk",
      "1 tablespoon kosher salt",
      "1 teaspoon ground cardamom",
      "1 teaspoon berbere spice blend",
      "1 teaspoon smoked paprika",
      "4 cloves garlic, smashed",
      // Dredge
      "300g (2½ cups) plain flour",
      "2 teaspoons kosher salt",
      "1 teaspoon smoked paprika",
      "1 teaspoon garlic powder",
      "1 teaspoon onion powder",
      "½ teaspoon cayenne pepper",
      "½ teaspoon freshly ground black pepper",
      // Frying and finishing
      "Vegetable or peanut oil for deep frying",
      "30g (2 tablespoons) unsalted butter",
      "2 tablespoons hot sauce (e.g. Crystal or Tabasco)",
      "Honey and sliced pickled chillies, to serve",
    ],
    steps: [
      "Marinate: combine buttermilk with salt, cardamom, berbere, paprika and garlic. Add chicken pieces, ensuring fully submerged. Cover and refrigerate for at least 8 hours, or overnight.",
      "Make the dredge: whisk together flour, salt, smoked paprika, garlic powder, onion powder, cayenne and black pepper in a wide shallow bowl.",
      "Remove chicken from buttermilk (allow excess to drip off — do not shake dry). Dredge each piece in the seasoned flour, pressing firmly so the coating adheres. Shake off excess and place on a rack. Let rest for 15 minutes so the coating hydrates.",
      "Heat 7.5cm (3 inches) of oil in a large Dutch oven or cast-iron skillet to 175°C (350°F).",
      "Fry in batches (do not overcrowd): dark meat for 13–15 minutes, white meat for 10–12 minutes, turning once, until deep golden and the internal temperature reaches 74°C (165°F). Drain on a wire rack.",
      "Melt butter with hot sauce in a small pan. Brush liberally over the hot fried chicken.",
      "Drizzle with honey, scatter pickled chillies over the top, and serve immediately.",
    ],
  },
  {
    name: "Shrimp and Roasted Garlic Tamales",
    chef: "Bobby Flay",
    description: "Bobby Flay is celebrated for his bold Southwestern flavours, and these tamales from his Mesa Grill years are among his most distinctive dishes. Masa dough is enriched with roasted garlic butter and filled with spiced Gulf shrimp — a departure from the pork tamales of tradition that showcases his skill in giving Latin-American classics a New York grill treatment.",
    cuisine: "Southwestern American",
    difficulty: "hard",
    prep_time_mins: 90,
    cook_time_mins: 60,
    servings: 6,
    ingredients: [
      // Roasted garlic butter
      "1 whole head of garlic",
      "115g (½ cup / 1 stick) unsalted butter, softened",
      "Salt and freshly ground black pepper",
      // Masa dough
      "450g (3 cups) masa harina (instant corn dough mix)",
      "720ml (3 cups) warm chicken stock",
      "115g (½ cup) cold unsalted butter, cubed",
      "1 teaspoon salt",
      "1 teaspoon baking powder",
      "16 dried corn husks, soaked in warm water for 2 hours",
      // Shrimp filling
      "450g (1 lb) large raw shrimp, peeled and deveined",
      "1 tablespoon ancho chili powder",
      "1 teaspoon ground cumin",
      "1 tablespoon olive oil",
      "Salt and freshly ground black pepper",
      // Roasted corn salsa (to serve)
      "2 ears fresh corn, kernels cut off",
      "1 red bell pepper, roasted, peeled, diced",
      "2 tablespoons fresh lime juice",
      "2 tablespoons fresh coriander (cilantro), chopped",
    ],
    steps: [
      "Roast garlic: drizzle the head of garlic with olive oil, wrap in foil and roast at 200°C (400°F) for 40–45 minutes until completely soft. Squeeze out the cloves and mash with softened butter. Season well.",
      "Soak corn husks in warm water for at least 2 hours until pliable.",
      "Make the masa: using an electric mixer, beat masa harina, warm stock and butter together until a soft dough forms. Mix in salt and baking powder. The dough should hold its shape but not be dry. Spread a spoonful on a husk — it should hold without cracking.",
      "Season shrimp with ancho chili powder, cumin, salt and pepper. Pan-fry in hot olive oil for 1–2 minutes per side until just cooked. Do not overcook — they will finish in the steamer. Rough chop if large.",
      "Assemble tamales: pat a corn husk dry. Spread about 3 tablespoons of masa in the centre, leaving a 2.5cm (1-inch) border. Add a spoonful of roasted garlic butter, then a few pieces of shrimp.",
      "Fold the sides of the husk inward, then fold the bottom up to enclose the filling. Tie with a thin strip of husk or kitchen twine. Repeat with remaining husks.",
      "Stand tamales upright in a steamer basket, open-end up. Steam over boiling water for 45–55 minutes until the masa pulls away cleanly from the husk.",
      "Make the roasted corn salsa: char corn kernels in a dry hot pan, then combine with roasted pepper, lime juice and coriander.",
      "Unwrap tamales on warm plates and top with roasted corn salsa.",
    ],
  },
  {
    name: "Spago Smoked Salmon Pizza",
    chef: "Wolfgang Puck",
    description: "Wolfgang Puck launched the California pizza revolution when he opened Spago in West Hollywood in 1982 and put this topping on his wood-fired oven pizza. Cold-smoked salmon, crème fraîche, red onion and caviar on a crisp thin-crust base stunned diners who had never seen anything like it. It became the most famous pizza in American culinary history and spawned an entire genre of gourmet pizzas.",
    cuisine: "California",
    difficulty: "medium",
    prep_time_mins: 60,
    cook_time_mins: 15,
    servings: 4,
    ingredients: [
      // Pizza dough
      "7g (1 sachet) active dry yeast",
      "240ml (1 cup) warm water",
      "1 teaspoon honey",
      "300g (2½ cups) strong white (bread) flour, plus extra for dusting",
      "1 teaspoon salt",
      "2 tablespoons olive oil",
      // Topping
      "240g (8oz) crème fraîche",
      "2 tablespoons fresh dill, finely chopped",
      "1 tablespoon fresh chives, finely chopped",
      "Freshly ground black pepper",
      "340g (12oz) thinly sliced cold-smoked salmon",
      "½ red onion, sliced paper-thin",
      "2 tablespoons capers, drained",
      "2 tablespoons salmon roe or caviar (optional, but Puck's original uses ossetra)",
      "Zest of 1 lemon",
    ],
    steps: [
      "Dissolve yeast in warm water with honey. Let stand until foamy, about 5 minutes.",
      "Mix flour and salt in a large bowl. Add yeast mixture and olive oil. Knead for 8 minutes until smooth and elastic. Cover and let rise for 1 hour.",
      "Place a pizza stone or heavy baking sheet in the oven and preheat to the highest temperature — ideally 260°C (500°F) — for at least 30 minutes.",
      "Divide dough into 2 or 4 equal pieces. On a floured surface, stretch each piece very thin (Puck stretches by hand to irregular rounds 25–30cm across).",
      "Mix crème fraîche with half the dill and chives. Season with black pepper.",
      "Slide one stretched pizza base onto a floured pizza peel or the back of a baking sheet. Spread a thin layer of crème fraîche over the base, leaving a 1cm border.",
      "Bake for 8–10 minutes until the crust is golden and slightly charred at the edges.",
      "Remove from the oven and immediately drape smoked salmon slices over the hot base. Scatter red onion, capers, remaining herbs and lemon zest over the top.",
      "Add a spoonful of salmon roe in the centre if using. Slice and serve immediately.",
    ],
  },
  {
    name: "Beef Wellington",
    chef: "Gordon Ramsay",
    description: "Gordon Ramsay has made Beef Wellington his signature dish and a recurring challenge on Hell's Kitchen and MasterChef. His version wraps prime beef tenderloin in a duxelles of finely chopped mushrooms and shallots, a thin layer of Parma ham, and golden puff pastry. The result is a show-stopping centrepiece with a rosy pink centre surrounded by crisp, buttery pastry — a dish that tests technical skill at every stage.",
    cuisine: "British",
    difficulty: "hard",
    prep_time_mins: 45,
    cook_time_mins: 45,
    servings: 6,
    ingredients: [
      // Wellington
      "1kg (2.2 lb) beef tenderloin (centre-cut), trimmed and tied",
      "2 tablespoons Dijon mustard",
      "500g (1 lb) cremini mushrooms, very finely chopped (duxelles)",
      "3 shallots, finely minced",
      "3 cloves garlic, minced",
      "30g (2 tablespoons) unsalted butter",
      "2 tablespoons fresh thyme leaves",
      "2 tablespoons vegetable oil",
      "100ml (7 tablespoons) dry white wine",
      "8 slices Parma ham (prosciutto di Parma)",
      "500g (1 lb) ready-made puff pastry, all-butter",
      "2 egg yolks, beaten with 1 tablespoon water (egg wash)",
      "Flaky sea salt and freshly ground black pepper",
    ],
    steps: [
      "Season the beef generously with salt and pepper. Heat oil in a hot pan over very high heat. Sear the beef on all sides for 2 minutes total — colour, don't cook. Remove and brush all over with Dijon mustard. Cool completely.",
      "Make the duxelles: cook shallots, garlic and thyme in butter over medium heat for 3 minutes. Add mushrooms and wine, raise heat, and cook — stirring often — until all moisture has completely evaporated and the mixture is dark and dry, about 15–20 minutes. Season well and cool completely.",
      "Lay a large piece of cling film on a work surface. Lay out Parma ham slices in two overlapping rows to form a rectangle large enough to wrap the beef.",
      "Spread the cooled duxelles in a thin, even layer over the ham. Season lightly.",
      "Place the seared beef at the near edge of the ham. Using the cling film to help, roll tightly into a log, twisting the ends to seal. Refrigerate for at least 30 minutes (or up to 24 hours).",
      "Preheat oven to 220°C (425°F). Roll out puff pastry to a large rectangle. Remove cling film from the beef and place at the near edge of the pastry. Brush pastry edges with egg wash, roll tightly, and tuck the ends under. Brush the entire surface with egg wash. Score lightly with a knife (do not cut through). Refrigerate for 15 minutes.",
      "Place on a baking tray and bake for 25–30 minutes until the pastry is deep golden. For medium-rare, the internal temperature should read 52–54°C (125–130°F).",
      "Rest for 10 minutes before slicing with a sharp serrated knife. Serve with red wine jus and seasonal vegetables.",
    ],
  },
  {
    name: "Chocolate Chip Cookies",
    chef: "Ruth Wakefield (Toll House)",
    description: "Ruth Wakefield invented the chocolate chip cookie in 1938 at her Toll House Inn in Whitman, Massachusetts, when she added cut-up Nestlé chocolate to a butter drop cookie recipe. Nestlé subsequently printed the recipe on every bag of chocolate chips, and it has been the single most baked recipe in America ever since. The secret to the perfect batch: brown the butter, use two types of sugar, and let the dough rest overnight.",
    cuisine: "American",
    difficulty: "easy",
    prep_time_mins: 15,
    cook_time_mins: 12,
    servings: 36,
    ingredients: [
      "285g (2¼ cups) plain flour",
      "1 teaspoon baking soda",
      "1 teaspoon fine salt",
      "225g (2 sticks) unsalted butter, at room temperature (or browned and cooled for deeper flavour)",
      "200g (1 cup) granulated white sugar",
      "200g (1 cup, packed) light brown sugar",
      "2 large eggs",
      "2 teaspoons pure vanilla extract",
      "340g (2 cups) semi-sweet chocolate chips or chopped chocolate",
      "Flaky sea salt (e.g. Maldon), for topping",
    ],
    steps: [
      "Whisk together flour, baking soda and salt in a bowl; set aside.",
      "Beat butter and both sugars in a stand mixer or with a hand mixer on medium-high speed until pale and very fluffy, about 4 minutes.",
      "Add eggs one at a time, beating well after each addition. Beat in vanilla.",
      "Reduce speed to low and add flour mixture, mixing only until just combined — do not overmix.",
      "Fold in chocolate chips with a spatula.",
      "For best results: cover dough and refrigerate for at least 24 hours (up to 72 hours). This concentrates flavour and gives a chewier texture.",
      "When ready to bake, preheat oven to 190°C (375°F). Line baking sheets with parchment.",
      "Roll dough into balls (about 1.5 tablespoons each) and place 5cm (2 inches) apart on prepared sheets. Sprinkle with flaky sea salt.",
      "Bake for 10–12 minutes until the edges are set and golden but the centres still look underdone and glossy.",
      "Cool on the baking sheet for 5 minutes before transferring to a wire rack — the cookies firm up as they cool.",
    ],
  },
];

/* ─── Seed logic ─────────────────────────────────────────────────────────────*/

async function main() {
  const sqlite = new Database(DB_PATH);

  // Fetch existing titles
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

  let inserted = 0;
  let skipped = 0;
  const ts = Math.floor(Date.now() / 1000);

  const seedAll = sqlite.transaction(() => {
    for (const recipe of RECIPES) {
      if (existingTitles.has(recipe.name)) { skipped++; continue; }

      const id = ulid();
      const tags = JSON.stringify([recipe.chef]);

      insertRecipe.run(
        id,
        recipe.name,
        `[${recipe.chef}] ${recipe.description}`,
        recipe.cuisine ?? null,
        recipe.difficulty ?? 'medium',
        recipe.prep_time_mins,
        recipe.cook_time_mins,
        recipe.servings,
        tags,
        null,
        ts,
        ts,
      );

      recipe.ingredients.forEach((ing, i) => {
        insertIngredient.run(ulid(), id, ing, i + 1);
      });

      recipe.steps.forEach((step, i) => {
        // Strip leading "N. " if the agent included numbering
        const instruction = step.replace(/^\d+\.\s*/, '');
        insertStep.run(ulid(), id, i + 1, instruction);
      });

      existingTitles.add(recipe.name);
      inserted++;
    }
  });

  seedAll();
  sqlite.close();

  console.log(`✅ Recipe seed complete — ${inserted} inserted, ${skipped} already existed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
