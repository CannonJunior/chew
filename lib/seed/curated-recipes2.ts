#!/usr/bin/env tsx
/**
 * Additional curated recipes — 25 iconic dishes from celebrated chefs worldwide.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npm run seed:recipes2
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

const RECIPES: Recipe[] = [
  {
    "name": "Tomato Sauce with Onion and Butter",
    "description": "Marcella Hazan's legendary three-ingredient pasta sauce from 'Essentials of Classic Italian Cooking' is arguably the most famous tomato sauce on the internet. A can of whole tomatoes is simmered with an entire halved onion and a generous amount of butter — no garlic, no olive oil, no herbs — yielding a velvety, sweet, deeply flavored sauce that defies its simplicity. The onion is removed before serving, leaving behind a sauce that has changed the way millions of home cooks think about Italian food.",
    "chef": "Marcella Hazan",
    "prep_time_mins": 5,
    "cook_time_mins": 45,
    "servings": 4,
    "cuisine": "Italian",
    "difficulty": "easy",
    "ingredients": [
      "1 (28-ounce) can whole peeled San Marzano tomatoes, crushed by hand",
      "5 tablespoons unsalted butter",
      "1 small white onion, peeled and halved",
      "1 pinch kosher salt",
      "1 pound pasta, for serving",
      "Freshly grated Parmigiano-Reggiano, for serving"
    ],
    "steps": [
      "Combine the crushed tomatoes, butter, onion halves, and salt in a medium heavy-bottomed saucepan.",
      "Bring to a simmer over medium heat, then reduce heat to low and cook uncovered at a very slow, steady simmer for 45 minutes, stirring occasionally and mashing any large tomato pieces with the back of a wooden spoon.",
      "After 45 minutes the fat should float free from the tomato and the sauce will be thick and glossy.",
      "Remove and discard the onion halves.",
      "Taste and adjust salt. Toss with freshly cooked pasta and serve with Parmigiano-Reggiano."
    ]
  },
  {
    "name": "DB Burger",
    "description": "When Daniel Boulud introduced this burger at db bistro moderne in New York in 2001, it ignited the luxury burger movement across America. A ground sirloin, ribeye, and short rib patty encases a core of red wine-braised short rib and a lobe of foie gras torchon, all served on a Parmesan-and-poppy-seed bun with pommes frites. The labor-intensive process — braising, torchon-making, and custom grinding — turns a humble format into fine-dining theatre.",
    "chef": "Daniel Boulud",
    "prep_time_mins": 90,
    "cook_time_mins": 270,
    "servings": 4,
    "cuisine": "French-American",
    "difficulty": "hard",
    "ingredients": [
      "1 1/2 pounds beef short ribs",
      "1/2 pound oxtail pieces",
      "1 bottle dry red wine",
      "2 carrots, roughly chopped",
      "2 stalks celery, roughly chopped",
      "1 onion, roughly chopped",
      "4 garlic cloves, smashed",
      "2 sprigs fresh thyme",
      "2 bay leaves",
      "1 ounce black truffle, finely chopped",
      "2 pounds freshly ground beef (equal parts ribeye, sirloin, and short rib)",
      "4 ounces foie gras torchon, cut into 4 discs",
      "4 Parmesan-poppy seed burger buns",
      "Salt and freshly ground black pepper",
      "2 tablespoons grapeseed oil",
      "Mustard, cornichons, and tomato confit, for serving"
    ],
    "steps": [
      "Season short ribs and oxtail with salt and pepper and brown in grapeseed oil in a Dutch oven over high heat, then set aside.",
      "Add carrots, celery, onion, and garlic to the pot and cook until softened, about 5 minutes.",
      "Return the meat to the pot, pour in the red wine, add thyme and bay leaves, and braise in a 325°F oven for 3 to 4 hours until the meat is falling off the bone.",
      "Remove the meat, shred finely, and mix with the chopped truffle. Let cool completely and form into 4 compact discs.",
      "Divide the ground beef into 8 thin patties. Place a braised meat disc and a foie gras disc in the center of 4 patties, then top with the remaining 4 patties, sealing the edges tightly.",
      "Season the stuffed patties generously with salt and pepper.",
      "Cook the burgers in a cast-iron skillet over high heat for 3 to 4 minutes per side for medium-rare.",
      "Toast the buns, assemble with mustard, cornichons, and tomato confit, and serve immediately."
    ]
  },
  {
    "name": "Tortilla Española",
    "description": "José Andrés calls the Spanish potato omelette 'the most important dish in Spanish cooking,' and his version — served at his landmark restaurant Jaleo — is a masterclass in restraint and technique. Made with just eggs, potatoes, olive oil, and salt, the key lies in slow-frying the potatoes in abundant olive oil until silky, then binding them with beaten egg in a small skillet and flipping the tortilla with a confident wrist. The result is golden outside, custardy within, and best served at room temperature.",
    "chef": "José Andrés",
    "prep_time_mins": 15,
    "cook_time_mins": 40,
    "servings": 4,
    "cuisine": "Spanish",
    "difficulty": "medium",
    "ingredients": [
      "2 cups extra-virgin olive oil",
      "4 medium Yukon Gold potatoes, peeled and cut into 1/4-inch dice",
      "6 large eggs",
      "1 teaspoon kosher salt"
    ],
    "steps": [
      "Heat the olive oil in a medium heavy-bottomed pot over medium-low heat to 250°F.",
      "Add the diced potatoes and cook slowly, stirring occasionally, for 20 to 25 minutes until the potatoes are tender and golden but not browned.",
      "Drain the potatoes through a colander, reserving the oil.",
      "Beat the eggs vigorously in a large bowl with the salt until foamy. Add the warm potatoes and fold gently, allowing the mixture to rest for 1 minute.",
      "Heat 2 tablespoons of the reserved olive oil in a 6-inch nonstick or well-seasoned skillet over high heat until it just begins to smoke.",
      "Pour in the egg-potato mixture, reduce heat to low, and cook until the edges are set and golden, about 5 minutes.",
      "Place a flat plate over the skillet and flip the tortilla onto the plate in one confident motion.",
      "Slide the tortilla back into the pan uncooked side down and cook for another 3 to 4 minutes until just set in the center.",
      "Slide onto a serving plate and allow to rest for 5 minutes before slicing into wedges."
    ]
  },
  {
    "name": "World Peace Cookies",
    "description": "Originally conceived by Pierre Hermé as a chocolate sablé and brought to American kitchens by Dorie Greenspan in her book 'Baking: From My Home to Yours,' these slice-and-bake cookies earned their lofty name from a neighbor who believed universal access to them could end conflict. Bittersweet chocolate chunks, brown sugar, and a generous measure of fleur de sel are folded into a buttery cocoa dough that is chilled, sliced thick, and baked just barely — they should still look underdone when pulled from the oven. The result is a deeply chocolatey, fudgy, salt-kissed shortbread that borders on addictive.",
    "chef": "Dorie Greenspan",
    "prep_time_mins": 20,
    "cook_time_mins": 12,
    "servings": 36,
    "cuisine": "French-American",
    "difficulty": "easy",
    "ingredients": [
      "1 1/4 cups all-purpose flour",
      "1/3 cup Dutch-process cocoa powder",
      "1/2 teaspoon baking soda",
      "1 stick plus 3 tablespoons (11 tablespoons) unsalted butter, at room temperature",
      "2/3 cup packed light brown sugar",
      "1/4 cup granulated sugar",
      "1/2 teaspoon fleur de sel or fine sea salt",
      "1 teaspoon pure vanilla extract",
      "5 ounces bittersweet chocolate, chopped into irregular chip-sized pieces"
    ],
    "steps": [
      "Sift together the flour, cocoa, and baking soda in a bowl and set aside.",
      "Beat the butter and both sugars together in a stand mixer on medium speed until soft, creamy, and homogenous, about 3 minutes.",
      "Beat in the salt and vanilla extract.",
      "Turn off the mixer and add the flour mixture, then pulse a few times to begin blending. When the risk of flying flour has passed, beat on low until the dough forms large, moist curds.",
      "Toss in the chocolate pieces and mix briefly to distribute.",
      "Divide the dough in half and shape each portion into a log 1 1/2 inches in diameter. Wrap in plastic wrap and refrigerate for at least 3 hours or up to 3 days.",
      "Preheat the oven to 325°F and line two baking sheets with parchment.",
      "Slice the logs into rounds 1/2 inch thick — they may crack at the edges; simply press the pieces back together.",
      "Arrange on baking sheets 1 inch apart and bake one sheet at a time for exactly 12 minutes. The cookies will not look done or feel firm — that is correct.",
      "Transfer the baking sheet to a rack and let the cookies rest until just barely warm before serving."
    ]
  },
  {
    "name": "Black Truffle Soup VGE",
    "description": "Paul Bocuse created this iconic soup in 1975 for a luncheon at the Élysée Palace where President Valéry Giscard d'Estaing honored him with the Légion d'honneur — the dish's name, VGE, stands for the president's initials. Individual porcelain bowls are filled with a rich chicken consommé, foie gras, diced vegetables, and sliced black truffles, then sealed with a dome of puff pastry and baked until the pastry is burnished and billowing. Diners crack through the crust at the table, releasing a cloud of truffle-scented steam — one of the great theatrical gestures in classical French cuisine.",
    "chef": "Paul Bocuse",
    "prep_time_mins": 45,
    "cook_time_mins": 30,
    "servings": 4,
    "cuisine": "French",
    "difficulty": "hard",
    "ingredients": [
      "2 cups rich homemade chicken consommé",
      "5 ounces skinless chicken breast",
      "1 small carrot, cut into tiny dice",
      "1 stalk celery, cut into tiny dice",
      "4 button mushrooms, thinly sliced",
      "2 ounces cooked foie gras, cut into small cubes",
      "2 ounces fresh black truffle, very thinly sliced",
      "4 tablespoons dry white vermouth (Noilly Prat)",
      "8 ounces puff pastry, thawed if frozen",
      "1 egg yolk, beaten with 1 teaspoon water",
      "Salt and white pepper"
    ],
    "steps": [
      "Season the chicken breast lightly with salt and poach gently in the consommé over low heat for 6 minutes. Remove the chicken and let cool, reserving the consommé.",
      "Cut the poached chicken into small dice and set aside.",
      "Blanch the diced carrot and celery in salted boiling water for 2 minutes, then drain.",
      "Divide the vermouth evenly among four oven-safe porcelain soup bowls (about 1 tablespoon each).",
      "Divide the blanched vegetables, mushroom slices, chicken, foie gras, and truffle slices evenly among the bowls.",
      "Ladle the warm consommé into each bowl until the bowl is about two-thirds full. Taste and adjust seasoning.",
      "Preheat the oven to 400°F. Roll out the puff pastry and cut circles at least 1 inch wider than the rim of each bowl.",
      "Brush the rim of each bowl with egg wash. Drape a pastry circle over each bowl, pressing the edges firmly against the sides to seal. Brush the pastry tops generously with egg wash.",
      "Bake for 20 to 22 minutes until the pastry domes are deep golden brown and puffed. Serve immediately."
    ]
  },
  {
    "name": "Olive Oil Spheres",
    "description": "Ferran Adrià's olive oil caviar — commercially realized as Caviaroli — represents one of the most celebrated outcomes of the molecular gastronomy revolution he pioneered at elBulli. Using basic spherification, drops of extra-virgin olive oil are encased in a thin sodium alginate membrane set in a calcium chloride bath, creating jewel-like spheres that burst with pure olive oil flavor when bitten. First presented at elBulli around 2005, the technique demonstrated that any liquid could be transformed into a sphere, fundamentally changing the language of avant-garde cuisine.",
    "chef": "Ferran Adrià",
    "prep_time_mins": 60,
    "cook_time_mins": 5,
    "servings": 4,
    "cuisine": "Spanish",
    "difficulty": "hard",
    "ingredients": [
      "1 cup extra-virgin olive oil (fruity variety)",
      "2 grams sodium alginate",
      "4 grams calcium chloride",
      "4 cups cold water (divided)",
      "Fleur de sel, for serving",
      "Toasted bread or crudités, for serving"
    ],
    "steps": [
      "Prepare the alginate bath: blend 2 grams sodium alginate with 2 cups cold water using an immersion blender until fully dissolved with no lumps. Let rest for 30 minutes to remove air bubbles.",
      "Prepare the setting bath: dissolve 4 grams calcium chloride in the remaining 2 cups cold water in a wide bowl.",
      "Fill a small squeeze bottle or a 5ml half-sphere measuring spoon with the olive oil.",
      "Working carefully, drop small measures of olive oil (about 1/2 teaspoon each) into the alginate bath. The oil droplets will begin to form a thin gel membrane.",
      "Leave the spheres in the alginate bath for approximately 2 to 2.5 minutes — long enough to form a firm skin but not so long the interior gels.",
      "Remove the spheres one at a time with a slotted spoon and transfer gently to the calcium chloride rinsing bath. Let rest for 30 seconds.",
      "Transfer the finished spheres to a bowl of clean cold water to rinse, then drain gently.",
      "Serve the spheres immediately at room temperature on a small spoon, over bruschetta, or alongside delicate seafood, finished with a grain of fleur de sel."
    ]
  },
  {
    "name": "Chocolate Cloud Cake",
    "description": "Nigella Lawson's flourless chocolate cake from 'How to Be a Domestic Goddess' is baked in a water bath to achieve its signature dense, mousse-like interior — she calls it a 'cloud' because the center dramatically sinks as it cools, forming a crater perfect for billows of whipped cream. Made with only eggs, dark chocolate, butter, and sugar, the recipe is both effortlessly elegant and reliably crowd-pleasing. A splash of Cointreau and orange zest give it an adult sophistication that has made it a dinner-party classic for over two decades.",
    "chef": "Nigella Lawson",
    "prep_time_mins": 20,
    "cook_time_mins": 40,
    "servings": 8,
    "cuisine": "British",
    "difficulty": "medium",
    "ingredients": [
      "9 ounces good-quality dark chocolate (70% cocoa), broken into pieces",
      "1 stick (8 tablespoons) unsalted butter, cut into cubes",
      "6 large eggs, 2 whole and 4 separated",
      "3/4 cup caster (superfine) sugar, divided",
      "2 tablespoons Cointreau or Grand Marnier",
      "Zest of 1 large orange",
      "1 1/2 cups heavy cream, whipped to soft peaks, for serving",
      "Cocoa powder or confectioners' sugar, for dusting"
    ],
    "steps": [
      "Preheat oven to 350°F. Grease a 9-inch springform pan and line the bottom with parchment paper. Place the pan in a large roasting tin.",
      "Melt the chocolate in a heatproof bowl set over barely simmering water, then stir in the butter until melted and smooth. Remove from heat and let cool slightly.",
      "In a large bowl, beat the 2 whole eggs and 4 egg yolks with 1/2 cup of the caster sugar until pale and slightly thickened. Stir in the melted chocolate mixture, Cointreau, and orange zest.",
      "In a separate clean bowl, whisk the 4 egg whites until foamy, then gradually add the remaining 1/4 cup of caster sugar and continue whisking until the whites hold their shape but are not stiff or dry.",
      "Stir a large spoonful of egg whites into the chocolate mixture to loosen it, then gently fold in the remaining whites in two additions until just combined.",
      "Pour the batter into the prepared pan. Pour enough hot water into the roasting tin to come 1 inch up the side of the springform pan.",
      "Bake for 35 to 40 minutes until the cake is risen, the top is cracked, and the center has only a slight wobble.",
      "Remove from the water bath and cool completely on a wire rack — the center will sink considerably as it cools.",
      "Just before serving, dust with cocoa powder and fill the sunken center with softly whipped cream."
    ]
  },
  {
    "name": "Roast Chicken with Herbs",
    "description": "Alice Waters' herb-roasted chicken is the quiet manifesto of the farm-to-table movement she built at Chez Panisse. The recipe is almost aggressively simple: a good free-range bird is seasoned generously, rubbed under and over its skin with a paste of fresh herbs and garlic, and roasted at high heat until the skin is shatteringly crisp and the meat juicy. Waters has said the recipe is only as good as its chicken, and her insistence on sourcing exceptional ingredients made this a touchstone recipe for a generation of American cooks.",
    "chef": "Alice Waters",
    "prep_time_mins": 15,
    "cook_time_mins": 55,
    "servings": 4,
    "cuisine": "American",
    "difficulty": "easy",
    "ingredients": [
      "1 whole chicken (3 1/2 to 4 pounds), preferably free-range",
      "1 teaspoon fresh rosemary leaves",
      "1 teaspoon fresh thyme leaves",
      "1 teaspoon fresh oregano or marjoram leaves",
      "2 garlic cloves",
      "3 tablespoons extra-virgin olive oil",
      "Salt and freshly ground black pepper",
      "1/2 lemon",
      "A few thyme and rosemary sprigs, for the cavity"
    ],
    "steps": [
      "Remove the chicken from the refrigerator 30 minutes before roasting. Preheat oven to 400°F.",
      "Using a fork, mash the garlic cloves against a cutting board with a pinch of salt until a smooth paste forms.",
      "Finely chop the rosemary, thyme, and oregano. Combine with the garlic paste and olive oil to make an herb rub.",
      "Gently loosen the skin over the breast and thighs with your fingers. Push the herb rub under the skin, then rub the remaining mixture all over the outside of the bird.",
      "Season the chicken generously inside and out with salt and pepper. Squeeze the lemon half into the cavity and drop it in along with the herb sprigs.",
      "Truss the bird loosely or simply tuck the wing tips behind the back.",
      "Place the chicken breast-side down in a roasting pan and roast for 20 minutes, then flip breast-side up and roast for a further 35 minutes until the juices run clear and the thickest part of the thigh registers 165°F.",
      "Let the chicken rest, loosely tented with foil, for 15 minutes before carving.",
      "Skim the fat from the pan juices and drizzle over the carved chicken."
    ]
  },
  {
    "name": "Roast Bone Marrow with Parsley Salad",
    "description": "Fergus Henderson's most celebrated dish from his restaurant St. JOHN in London has not changed since the day it opened, and it appears in his landmark book 'The Whole Beast: Nose to Tail Eating.' Halved veal leg bones are roasted at high heat until the marrow is soft and trembling, then served on toast alongside a sharp, bracing parsley salad with shallots, capers, and lemon — cutting through the richness with precision. Henderson has said the dish is about the triumph of simplicity, and it is widely credited with restoring offal and forgotten cuts to fine-dining menus worldwide.",
    "chef": "Fergus Henderson",
    "prep_time_mins": 10,
    "cook_time_mins": 20,
    "servings": 4,
    "cuisine": "British",
    "difficulty": "easy",
    "ingredients": [
      "8 center-cut veal or beef marrow bones (about 3 inches long), standing upright",
      "A generous bunch of flat-leaf parsley, leaves picked",
      "2 shallots, peeled and very finely sliced",
      "2 tablespoons capers, rinsed",
      "Juice of 1 lemon",
      "3 tablespoons extra-virgin olive oil",
      "Coarse sea salt and freshly ground black pepper",
      "8 thick slices of sourdough or country bread, toasted"
    ],
    "steps": [
      "Preheat the oven to 450°F.",
      "Place the marrow bones cut-side up in a heavy ovenproof skillet or roasting pan.",
      "Roast for 15 to 20 minutes until the marrow begins to bubble, is giving and loose, but has not completely melted away. The cooking time will vary with the thickness of the bones.",
      "While the bones roast, make the parsley salad: roughly chop the parsley leaves just enough to discipline them, then combine with the shallots and capers.",
      "Dress the parsley salad at the last moment with the lemon juice and olive oil and season with salt and pepper.",
      "Toast the bread slices until golden and place on a board.",
      "Bring the roasted bones to the table immediately. Use a long thin knife or narrow spoon to scrape the warm marrow onto the toast.",
      "Season each marrow toast with a pinch of coarse sea salt, top with a small mound of parsley salad, and eat without delay."
    ]
  },
  {
    "name": "Oaxacan Black Mole with Chicken",
    "description": "Rick Bayless's mole negro — the dish he cooked for President Obama's state dinner honoring Mexico — is considered one of the most complex preparations in Mexican cuisine, requiring more than 20 ingredients and multiple days of work. Dried chiles are toasted until nearly black, then combined with charred tomatoes, chocolate, dried fruit, spices, and chicken broth in a sauce of extraordinary depth and nuance. Bayless describes it as a compilation of years of Oaxacan exploration, calling it 'classic, deeply satisfying, and awesome, but not too baroque.'",
    "chef": "Rick Bayless",
    "prep_time_mins": 120,
    "cook_time_mins": 180,
    "servings": 6,
    "cuisine": "Mexican",
    "difficulty": "hard",
    "ingredients": [
      "6 bone-in chicken pieces (thighs and drumsticks)",
      "6 mulato dried chiles, stems and seeds removed",
      "4 ancho dried chiles, stems and seeds removed",
      "4 pasilla dried chiles, stems and seeds removed",
      "1 chipotle chile",
      "4 Roma tomatoes, charred under broiler",
      "6 tomatillos, husked and charred",
      "1 cup raw almonds",
      "1/2 cup raisins",
      "1 small ripe plantain, sliced",
      "4 garlic cloves, unpeeled and charred",
      "1 white onion, roughly chopped and charred",
      "2 ounces Mexican chocolate (like Ibarra)",
      "1 corn tortilla, torn and lightly toasted",
      "2 slices stale white bread",
      "1 teaspoon dried thyme",
      "1 teaspoon dried marjoram",
      "1 cinnamon stick",
      "4 cups rich chicken broth",
      "3 tablespoons lard or vegetable oil",
      "Salt to taste",
      "Sesame seeds, for garnish"
    ],
    "steps": [
      "Flatten the dried chiles in a dry skillet over medium-high heat and toast, pressing with a spatula, until they darken to nearly black and become fragrant — this step is the key to authentic black mole. Do not burn them to ash.",
      "Soak the toasted chiles in hot water for 30 minutes until soft, then drain.",
      "In the same dry skillet, toast the almonds, raisins, tortilla, and bread separately until lightly browned, adding them to a blender jar.",
      "Fry the plantain slices in 1 tablespoon of the lard until golden, then add to the blender.",
      "Blend the soaked chiles, charred tomatoes, tomatillos, charred garlic and onion, chocolate, and all toasted ingredients with 1 cup of broth until very smooth. Work in batches if necessary.",
      "Heat the remaining lard in a large heavy pot over high heat until smoking. Pour in the mole paste in one addition and fry, stirring constantly, for 5 minutes until the paste darkens and thickens.",
      "Stir in the remaining broth and the dried herbs, bring to a simmer, reduce heat to low, and cook uncovered for 45 minutes to 1 hour, stirring regularly, until the mole is thick enough to coat a spoon. Season generously with salt.",
      "Season the chicken with salt and sear in a separate skillet until golden. Add to the mole and simmer for 25 to 30 minutes until cooked through.",
      "Serve over steamed rice or with warm tortillas, garnished with sesame seeds."
    ]
  },
  {
    "name": "Kogi Korean BBQ Short Rib Tacos",
    "description": "Roy Choi's Kogi tacos were the spark that ignited the American food truck revolution when his truck began crisscrossing Los Angeles in 2008. Flanken-cut short ribs are marinated in a sesame-soy mixture brightened with fresh kiwi and grilled over high heat until charred at the edges, then tucked into small corn tortillas with a ginger-gochugaru slaw, a scallion-spiked salsa verde, and a cilantro-onion relish. Choi describes the dish not as a fusion concept but simply as Los Angeles food, born of the city's Korean and Mexican communities.",
    "chef": "Roy Choi",
    "prep_time_mins": 40,
    "cook_time_mins": 15,
    "servings": 4,
    "cuisine": "Korean-Mexican",
    "difficulty": "medium",
    "ingredients": [
      "2 pounds flanken-cut beef short ribs (kalbi)",
      "1/2 cup soy sauce",
      "3 tablespoons sesame oil",
      "3 tablespoons brown sugar",
      "1 kiwi, peeled and pureed",
      "4 garlic cloves, minced",
      "1 tablespoon grated fresh ginger",
      "2 cups shredded green cabbage",
      "2 tablespoons rice wine vinegar",
      "1 teaspoon gochugaru (Korean chili flakes)",
      "4 scallions, finely sliced, divided",
      "1 cup fresh cilantro leaves, roughly chopped",
      "1/2 white onion, finely diced",
      "Juice of 2 limes",
      "1 cup salsa verde",
      "16 small corn tortillas, warmed",
      "Salt to taste"
    ],
    "steps": [
      "Combine soy sauce, sesame oil, brown sugar, kiwi puree, garlic, and half the ginger in a bowl. Add the short ribs, toss to coat, and marinate in the refrigerator for at least 2 hours or overnight.",
      "Make the scallion slaw: toss the shredded cabbage with rice wine vinegar, gochugaru, remaining ginger, half the scallions, and a pinch of salt. Refrigerate until serving.",
      "Make the cilantro-onion relish: combine the cilantro, white onion, lime juice, and remaining scallions. Season with salt.",
      "Remove the short ribs from the marinade and pat slightly dry. Grill over very high heat for 2 to 3 minutes per side until charred at the edges and caramelized.",
      "Rest the meat for a few minutes, then cut or chop the meat off the bone into bite-sized pieces.",
      "Warm the corn tortillas directly over a gas flame or in a dry skillet until pliable and lightly charred.",
      "Assemble the tacos: spoon a little salsa verde onto each tortilla, add a few pieces of kalbi, top with slaw and cilantro-onion relish, and serve immediately."
    ]
  },
  {
    "name": "Focaccia",
    "description": "Nancy Silverton's focaccia, developed at La Brea Bakery in Los Angeles and later refined for Pizzeria Mozza, is built on a long-fermented, high-hydration dough that produces a loaf of extraordinary airy lightness beneath a deeply golden, olive-oil-crisped crust. The dough is dimpled aggressively before baking so pooled oil creates crunchy, lacy pockets on the surface. Silverton has described her quest to unlock the secrets of great focaccia as one of her most important culinary missions, and the result has become a benchmark against which all other focaccia is measured.",
    "chef": "Nancy Silverton",
    "prep_time_mins": 30,
    "cook_time_mins": 25,
    "servings": 8,
    "cuisine": "Italian-American",
    "difficulty": "medium",
    "ingredients": [
      "4 cups (500g) bread flour",
      "2 1/4 teaspoons (1 packet) active dry yeast",
      "1 1/2 teaspoons fine sea salt",
      "1 1/2 cups warm water (105°F)",
      "1/2 cup extra-virgin olive oil, divided, plus more for the pan",
      "1/2 teaspoon honey or sugar",
      "Flaky sea salt (such as Maldon), for finishing",
      "Fresh rosemary leaves, for finishing"
    ],
    "steps": [
      "Whisk together the yeast, honey, and warm water in the bowl of a stand mixer. Let sit for 5 minutes until foamy.",
      "Add the flour and fine salt, then mix with the dough hook on low speed until combined. Increase to medium and knead for 8 minutes until the dough is smooth and elastic.",
      "Add 2 tablespoons of the olive oil and knead for 2 more minutes until incorporated.",
      "Transfer the dough to a lightly oiled bowl, cover, and let rise at room temperature for 1 1/2 to 2 hours until doubled.",
      "Pour 3 tablespoons of the olive oil into an 18x13-inch rimmed baking sheet and spread to coat. Transfer the dough to the pan and gently stretch to fill, then pour another 2 tablespoons of oil over the top.",
      "Let the dough rest and rise for another 45 minutes until very puffy.",
      "Preheat the oven to 450°F.",
      "Using all ten fingers, dimple the dough deeply and aggressively across the entire surface, creating craters that will hold the oil.",
      "Scatter rosemary leaves generously over the surface and finish with a large pinch of flaky sea salt.",
      "Bake for 20 to 25 minutes until deep golden brown on top and the underside is crisp. Let cool for 10 minutes before cutting."
    ]
  },
  {
    "name": "Roasted Cauliflower with Pomegranate and Pistachios",
    "description": "Yotam Ottolenghi's cauliflower salad from 'Ottolenghi Simple' was a revelation: combining raw grated cauliflower with roasted florets in the same dish creates a textural contrast that Ottolenghi himself called 'a little moment of revelation.' Pomegranate seeds, toasted pistachios, and an abundance of fresh herbs — parsley, mint, tarragon — are dressed with lemon juice and cumin to create a salad that is vibrant, complex, and entirely plant-forward. The dish helped define Ottolenghi's influence on how the Western world thinks about vegetables.",
    "chef": "Yotam Ottolenghi",
    "prep_time_mins": 20,
    "cook_time_mins": 30,
    "servings": 4,
    "cuisine": "Middle Eastern",
    "difficulty": "easy",
    "ingredients": [
      "1 large head cauliflower",
      "4 tablespoons extra-virgin olive oil, divided",
      "1/2 teaspoon ground cumin",
      "1/2 cup pomegranate seeds",
      "1/2 cup shelled pistachios, roughly chopped",
      "1 cup flat-leaf parsley leaves",
      "1/2 cup fresh mint leaves",
      "2 tablespoons fresh tarragon leaves",
      "Juice of 1 large lemon",
      "1/2 teaspoon salt",
      "Freshly ground black pepper"
    ],
    "steps": [
      "Preheat the oven to 425°F.",
      "Cut half the cauliflower into small florets and toss with 2 tablespoons of olive oil, the cumin, salt, and pepper. Spread on a baking sheet in a single layer and roast for 25 to 30 minutes until golden and charred at the edges. Let cool to room temperature.",
      "Coarsely grate the remaining half of the cauliflower on a box grater into a large bowl.",
      "Add the cooled roasted cauliflower to the bowl with the raw grated cauliflower.",
      "Add the parsley, mint, and tarragon leaves.",
      "In a small bowl, whisk together the remaining 2 tablespoons olive oil, lemon juice, and a pinch of salt.",
      "Pour the dressing over the cauliflower and herbs and toss gently to combine.",
      "Transfer to a serving platter and scatter over the pomegranate seeds and chopped pistachios.",
      "Taste and adjust the seasoning, then serve at room temperature."
    ]
  },
  {
    "name": "Ispahan Macaron",
    "description": "Pierre Hermé's Ispahan — named for a city in Iran renowned for its roses — is widely regarded as the most influential pastry creation of the past 30 years. Two large rose-flavored macaron shells sandwich a silky white-chocolate and lychee ganache studded with whole raspberries and fresh lychee, creating a quartet of flavors — rose, lychee, raspberry — that Hermé spent years calibrating. The combination has since spawned Ispahan croissants, ice creams, and cakes, cementing it as a masterpiece of perfumery translated into pastry.",
    "chef": "Pierre Hermé",
    "prep_time_mins": 90,
    "cook_time_mins": 15,
    "servings": 12,
    "cuisine": "French",
    "difficulty": "hard",
    "ingredients": [
      "200g (7 oz) almond flour",
      "200g (7 oz) confectioners' sugar",
      "75g (2.5 oz) aged egg whites (for almond paste)",
      "75g (2.5 oz) egg whites (for meringue)",
      "200g (7 oz) granulated sugar",
      "50ml water",
      "Red and pink food coloring",
      "200g (7 oz) good-quality white chocolate, finely chopped",
      "100ml heavy cream",
      "150g (5 oz) canned lychees, drained and pureed",
      "1 teaspoon rose extract or rose water (to taste)",
      "24 fresh raspberries",
      "8 fresh lychees, halved and pitted"
    ],
    "steps": [
      "Sift almond flour and confectioners' sugar together twice. Mix with 75g aged egg whites to form a smooth almond paste. Tint with a few drops of red and pink food coloring.",
      "Make the Italian meringue: heat granulated sugar and water to 244°F (118°C). Meanwhile whisk the remaining 75g egg whites to soft peaks. Stream the hot syrup into the whites and whisk until the meringue is stiff, glossy, and cooled to room temperature.",
      "Fold the meringue into the almond paste in three additions using the macaronage technique — fold firmly until the batter flows like lava and falls from the spatula in a thick ribbon.",
      "Transfer to a piping bag fitted with a 1cm plain tip and pipe 4cm rounds onto parchment-lined baking sheets. Tap the sheets firmly to release air bubbles and let rest at room temperature for 30 to 45 minutes until a dry skin forms.",
      "Preheat the oven to 325°F (160°C). Bake the shells for 12 to 14 minutes, rotating the tray halfway. Cool completely before removing from the parchment.",
      "Make the ganache: bring the cream to a boil and pour over the white chocolate. Stir until smooth, then blend in the lychee puree and rose extract. Chill until the ganache is pipeable, about 2 hours.",
      "To assemble: pipe a ring of ganache around the perimeter of half the shells. Arrange two raspberries and two lychee halves in the center of the ring.",
      "Pipe a small mound of ganache over the fruit to seal it, then press a second macaron shell on top.",
      "Refrigerate the finished macarons for at least 24 hours before serving to allow the shells to hydrate and flavors to meld."
    ]
  },
  {
    "name": "Poulet Rôti (French Roast Chicken)",
    "description": "Anthony Bourdain's roast chicken from 'The Les Halles Cookbook' is his most personal recipe — he wrote famously that a perfectly roasted chicken reveals everything about a cook's fundamental skill. The technique is classic French brasserie: the bird is rubbed inside and out with herb butter, stuffed with aromatics, and roasted at two different temperatures to achieve crisped skin and juicy meat. Bourdain regarded the dish as both a test of technical ability and a meditation on simplicity, declaring it the single most important thing you can know how to cook.",
    "chef": "Anthony Bourdain",
    "prep_time_mins": 20,
    "cook_time_mins": 55,
    "servings": 4,
    "cuisine": "French",
    "difficulty": "medium",
    "ingredients": [
      "1 whole chicken (about 4 pounds)",
      "4 tablespoons unsalted butter, softened",
      "1 tablespoon fresh thyme leaves, finely chopped",
      "1 tablespoon fresh rosemary leaves, finely chopped",
      "2 garlic cloves, minced",
      "Salt and freshly cracked black pepper",
      "1/2 lemon",
      "1 small onion, halved",
      "1 sprig fresh rosemary",
      "1 sprig fresh thyme",
      "1/2 cup dry white wine",
      "1/2 cup chicken stock"
    ],
    "steps": [
      "Preheat the oven to 400°F. Pat the chicken completely dry with paper towels and let sit at room temperature for 30 minutes.",
      "Mix the softened butter with the chopped thyme, rosemary, garlic, salt, and pepper to make an herb butter.",
      "Carefully slide your fingers under the breast skin to loosen it. Push a tablespoon of herb butter under the skin on each side of the breast, smoothing it across the meat.",
      "Rub the remaining herb butter all over the outside of the chicken. Season the cavity generously with salt and pepper.",
      "Stuff the cavity with the lemon half (squeezed), onion halves, rosemary sprig, and thyme sprig.",
      "Place the chicken on a rack in a roasting pan. Pour the white wine and stock into the bottom of the pan.",
      "Roast for 30 minutes, basting once or twice, then increase the oven temperature to 450°F and roast for a further 20 to 25 minutes until the skin is deeply golden and crackling and the thigh juices run clear.",
      "Rest the chicken loosely tented for 10 to 15 minutes before carving.",
      "Deglaze the roasting pan over the stovetop, skim the fat, and reduce the pan juices briefly for a simple jus."
    ]
  },
  {
    "name": "Oops! I Dropped the Lemon Tart",
    "description": "This deconstructed dessert at Massimo Bottura's three-Michelin-star Osteria Francescana in Modena was born from a genuine accident in 2012, when pastry chef Takahiko Kondo dropped a portion of lemon tart and Bottura declared the splintered result beautiful and worth replicating. Every element of the original tart — citrus curd, spiced pastry crumble, zabaglione, lemongrass gelato, and fragrant garnishes of ginger, capers, and lemon powder — is reassembled on the plate to look as though it has just fallen, creating a dessert that is philosophical as well as delicious.",
    "chef": "Massimo Bottura",
    "prep_time_mins": 120,
    "cook_time_mins": 30,
    "servings": 4,
    "cuisine": "Italian",
    "difficulty": "hard",
    "ingredients": [
      "3 egg yolks",
      "1/2 cup caster sugar",
      "Zest and juice of 2 lemons (preferably Sorrento)",
      "Zest of 1 bergamot",
      "1/4 cup unsalted butter, cubed",
      "1 cup all-purpose flour",
      "1/2 cup cold butter",
      "2 tablespoons sugar",
      "1/4 teaspoon cinnamon",
      "1/4 teaspoon ginger powder",
      "Pinch of cardamom",
      "2 egg yolks plus 2 whole eggs (for zabaglione)",
      "1/4 cup limoncello",
      "2 tablespoons sugar (for zabaglione)",
      "1 1/2 cups whole milk",
      "1 stalk fresh lemongrass, bruised",
      "Zest of 1 lemon",
      "3 tablespoons sugar (for gelato)",
      "3 tablespoons glucose syrup",
      "1 tablespoon salt-packed capers, rinsed",
      "Fresh peppermint leaves, for garnish"
    ],
    "steps": [
      "Make the lemon curd: whisk egg yolks, sugar, lemon juice, and zests in a heatproof bowl. Cook over a bain-marie, stirring constantly, until thick enough to coat a spoon. Remove from heat and whisk in cold butter. Strain and chill.",
      "Make the spiced pastry crumble: pulse flour, cold butter, sugar, cinnamon, ginger, and cardamom in a food processor until sandy and crumbly. Spread on a baking sheet and bake at 350°F for 12 to 15 minutes until lightly golden. Cool.",
      "Make the lemongrass gelato: combine milk, lemongrass, lemon zest, sugar, and glucose in a saucepan and bring to 185°F, stirring. Strain, cool over ice, and churn in an ice-cream machine until frozen. Reserve in the freezer.",
      "Make the limoncello zabaglione: whisk egg yolks, whole eggs, sugar, and limoncello together in a heatproof bowl. Cook over a bain-marie, whisking vigorously, until thickened and tripled in volume. Use immediately or keep warm.",
      "Finely chop the rinsed capers.",
      "To plate, splash a spoonful of warm zabaglione across one side of a chilled plate in an irregular, 'splashed' pattern.",
      "Scatter a generous mound of pastry crumble across the plate as if it has shattered on impact.",
      "Dot spoonfuls of lemon curd over and around the crumble.",
      "Place a quenelle of lemongrass gelato in the center of the 'wreckage' and garnish with chopped capers, peppermint leaves, and a dusting of lemon zest powder."
    ]
  },
  {
    "name": "Pasta e Fagioli",
    "description": "Lidia Bastianich's pasta and bean soup is her most heartfelt dish — a recipe rooted in the cucina povera of the Istrian region where she was born, and one she has taught countless Americans to cook on public television. Dried borlotti beans are slow-cooked with rosemary and bay, then partially puréed to create a broth that is simultaneously rustic and velvety; small pasta — ditalini or elbows — is cooked directly in the broth so every drop of starch thickens the soup. Bastianich considers it the original Italian comfort food.",
    "chef": "Lidia Bastianich",
    "prep_time_mins": 20,
    "cook_time_mins": 120,
    "servings": 6,
    "cuisine": "Italian",
    "difficulty": "medium",
    "ingredients": [
      "1 pound dried borlotti (cranberry) beans, soaked overnight in cold water",
      "2 medium potatoes, peeled and cubed",
      "2 sprigs fresh rosemary",
      "2 bay leaves",
      "6 quarts cold water",
      "1/4 cup extra-virgin olive oil, plus more for drizzling",
      "1 medium onion, finely diced",
      "4 garlic cloves, thinly sliced",
      "2 stalks celery, diced",
      "1 (14-ounce) can crushed tomatoes",
      "Salt and red pepper flakes to taste",
      "1 1/2 cups ditalini or small elbow pasta",
      "Freshly grated Parmigiano-Reggiano, for serving",
      "Extra-virgin olive oil, for finishing"
    ],
    "steps": [
      "Drain and rinse the soaked beans. Combine with the potatoes, rosemary, and bay leaves in a large pot with 6 quarts of cold water. Bring to a boil over high heat.",
      "Reduce heat to a gentle simmer and cook for 60 to 90 minutes until the beans are completely tender.",
      "Remove the rosemary sprigs and bay leaves. Using a food mill or the back of a ladle, pass about half the beans and potato through a strainer back into the pot to thicken the broth. Leave the remaining beans whole.",
      "In a separate skillet, heat the olive oil over medium heat. Sauté the onion, garlic, and celery until soft and golden, about 8 minutes.",
      "Add the crushed tomatoes and cook for 5 minutes, then stir the soffritto into the bean broth.",
      "Season generously with salt and red pepper flakes. Bring the soup back to a boil.",
      "Add the pasta directly to the soup and cook, stirring frequently, until it is very al dente, about 2 minutes less than the package directions.",
      "Remove from heat and let the soup rest for 5 minutes — it will thicken as it sits.",
      "Ladle into bowls, finish with a generous drizzle of extra-virgin olive oil and a handful of grated Parmigiano-Reggiano."
    ]
  },
  {
    "name": "Chiles en Nogada",
    "description": "Diana Kennedy's version of Mexico's most patriotic dish — from 'The Cuisines of Mexico' — faithfully follows the Pueblan tradition in which charred poblano chiles are stuffed with a fragrant pork picadillo of fruit, nuts, and spices, then draped in a walnut cream sauce and decorated with pomegranate seeds and parsley to represent the colors of the Mexican flag. Kennedy insists the chiles should not be fried in egg batter, arguing that the rich nogada and the stuffing are already substantial, and that restraint is the mark of the authentic dish. The recipe is seasonal, tied to the late-summer walnut and pomegranate harvests.",
    "chef": "Diana Kennedy",
    "prep_time_mins": 60,
    "cook_time_mins": 45,
    "servings": 6,
    "cuisine": "Mexican",
    "difficulty": "hard",
    "ingredients": [
      "6 large fresh poblano chiles",
      "1 pound ground pork",
      "1 small white onion, finely diced",
      "3 garlic cloves, minced",
      "2 Roma tomatoes, charred, peeled and chopped",
      "1/4 cup raisins",
      "1/4 cup slivered almonds",
      "1 peach or pear, peeled and diced",
      "1/2 plantain, fried and diced",
      "1/2 teaspoon cinnamon",
      "1/4 teaspoon ground cloves",
      "Salt and pepper",
      "1 cup fresh walnut halves (soaked overnight, skins rubbed off)",
      "4 ounces fresh goat cheese or queso fresco",
      "1/2 cup Mexican crema or crème fraîche",
      "2 tablespoons dry sherry",
      "1/2 cup pomegranate seeds",
      "Flat-leaf parsley sprigs, for garnish"
    ],
    "steps": [
      "Char the poblano chiles directly over a gas flame or under the broiler, turning until blackened all over. Place in a plastic bag, seal, and steam for 15 minutes.",
      "Peel the charred skin from the chiles and carefully make a lengthwise slit in each. Remove the seeds and veins under running water, keeping the chiles intact.",
      "Make the picadillo: fry the onion and garlic in oil over medium heat until soft. Add the pork and cook, breaking it up, until browned.",
      "Add the charred tomatoes, raisins, almonds, diced fruit, plantain, cinnamon, and cloves. Cook together for 10 minutes, stirring, until the flavors meld and the mixture is fragrant but not dry. Season with salt and pepper. Let cool.",
      "Gently stuff each chile with the picadillo mixture, pressing the slit closed.",
      "Make the nogada: blend the soaked walnuts, goat cheese, crema, sherry, and a pinch of salt until very smooth and white. Thin with a little water if needed — the sauce should be pourable.",
      "Arrange the stuffed chiles on a serving platter. Spoon the cold nogada generously over the chiles, covering them entirely.",
      "Scatter pomegranate seeds liberally over the top and arrange parsley sprigs in between. Serve at room temperature."
    ]
  },
  {
    "name": "Braised Lamb Shanks with Apricot Curry Sauce",
    "description": "Charlie Trotter's braised lamb shanks — published in the New York Times and adapted from his Chicago restaurant — exemplify his philosophy of transforming humble cuts into elegant plates through meticulous technique and inspired flavor pairings. The shanks are marinated with aromatic vegetables and herbs, then slow-braised for up to six hours until the meat virtually slides from the bone; the braising liquid is reduced to a glossy sauce enriched with dried apricots and warm curry spices. Trotter's restaurant, which closed in 2012, trained generations of American fine-dining chefs, and this dish remains a touchstone of his legacy.",
    "chef": "Charlie Trotter",
    "prep_time_mins": 45,
    "cook_time_mins": 360,
    "servings": 4,
    "cuisine": "American",
    "difficulty": "hard",
    "ingredients": [
      "4 lamb shanks (about 1 pound each)",
      "2 carrots, roughly chopped",
      "2 stalks celery, roughly chopped",
      "1 onion, roughly chopped",
      "6 garlic cloves",
      "3 sprigs fresh thyme",
      "2 bay leaves",
      "1 tablespoon black peppercorns",
      "2 cups dry red wine",
      "2 cups lamb or veal stock",
      "1 cup water",
      "1 cup dried apricots",
      "1 tablespoon curry powder",
      "1 teaspoon ground cumin",
      "2 tablespoons olive oil",
      "Salt and freshly ground pepper"
    ],
    "steps": [
      "Combine the lamb shanks with the carrots, celery, onion, garlic, thyme, bay leaves, peppercorns, and red wine in a large bowl. Cover and marinate in the refrigerator for at least 4 hours or overnight.",
      "Preheat the oven to 250°F. Remove the shanks from the marinade and pat dry, reserving the marinade and vegetables separately.",
      "Heat the olive oil in a large Dutch oven over high heat and brown the shanks on all sides until deep mahogany. Remove and set aside.",
      "Add the reserved vegetables to the pot and cook until softened and lightly browned, about 5 minutes.",
      "Return the shanks to the pot. Pour in the reserved wine marinade, the stock, and enough water to come almost to the top of the shanks. Lay a sheet of parchment paper directly on the surface, cover tightly, and transfer to the oven.",
      "Braise for 5 to 6 hours until the meat is completely tender and almost falling from the bone.",
      "Transfer the shanks to a baking sheet. Strain the braising liquid, discarding the vegetables, and pour into a wide saucepan.",
      "Add the dried apricots, curry powder, and cumin to the braising liquid. Reduce over high heat by four-fifths until syrupy and glossy.",
      "Increase the oven to 300°F. Brush the shanks with a little reduced sauce and return to the oven for 15 minutes to crisp the exterior.",
      "Serve the shanks over creamy polenta or mashed potatoes, napped with the apricot curry sauce."
    ]
  },
  {
    "name": "Buttermilk-Marinated Roast Chicken",
    "description": "Samin Nosrat's buttermilk chicken — the climactic recipe of her book 'Salt, Fat, Acid, Heat' — is the clearest possible demonstration of how acid transforms meat. A whole bird is submerged in a heavily salted buttermilk brine for up to 24 hours; the lactic acid gently denatures the proteins, preventing them from seizing and squeezing out moisture during roasting, while the salt seasons the meat all the way to the bone. The result is the most tender, juicy, well-seasoned roast chicken imaginable, with skin that crisps to a lacquered bronze.",
    "chef": "Samin Nosrat",
    "prep_time_mins": 20,
    "cook_time_mins": 60,
    "servings": 4,
    "cuisine": "American",
    "difficulty": "easy",
    "ingredients": [
      "1 whole chicken (3 1/2 to 4 pounds)",
      "2 cups whole buttermilk",
      "2 tablespoons Diamond Crystal kosher salt (or 1 tablespoon Morton kosher salt), plus more for the bird",
      "1 teaspoon freshly ground black pepper"
    ],
    "steps": [
      "Season the chicken all over with about 1 teaspoon of kosher salt per pound of bird, including inside the cavity. Allow to rest at room temperature for 30 minutes.",
      "Stir the 2 tablespoons of salt into the buttermilk until dissolved.",
      "Place the chicken in a large zip-lock bag or a snug container. Pour in the buttermilk brine, seal, and massage to coat the chicken thoroughly.",
      "Refrigerate for at least 12 hours, and ideally 24 hours.",
      "Remove the chicken from the refrigerator 1 hour before roasting and remove from the brine, shaking off any excess. Do not rinse.",
      "Preheat the oven to 425°F with a rack set one position below center.",
      "Place the chicken in a cast-iron skillet or on a rack in a roasting pan. Pat the surface gently with a paper towel to remove the thickest drips of buttermilk.",
      "Roast for 55 to 60 minutes until the skin is deep golden-brown and the juices from the thigh run completely clear.",
      "Rest for 10 minutes before carving and serving."
    ]
  },
  {
    "name": "Duck Confit",
    "description": "Hank Shaw's duck confit — developed and refined over years on his James Beard Award-winning blog Hunter Angler Gardener Cook — adapts the ancient French preservation technique for wild and domesticated ducks alike. Duck legs are gently cured overnight in a spiced salt mixture, then slow-cooked submerged in their own fat at very low temperature until the meat is meltingly tender and the connective tissue has dissolved entirely. Shaw's version respects the French original while offering practical guidance for hunters and home cooks, and has introduced the technique to a new generation of American cooks.",
    "chef": "Hank Shaw",
    "prep_time_mins": 20,
    "cook_time_mins": 240,
    "servings": 4,
    "cuisine": "French-American",
    "difficulty": "medium",
    "ingredients": [
      "4 duck legs (about 3 to 4 pounds total)",
      "1 tablespoon kosher salt (0.15–0.25% of meat weight for a gentle cure)",
      "1 tablespoon dried thyme",
      "2 teaspoons freshly ground black pepper",
      "3 bay leaves, crumbled",
      "3 garlic cloves, minced",
      "3 to 4 cups duck fat, goose fat, or lard (enough to submerge the legs)"
    ],
    "steps": [
      "Mix together the salt, thyme, pepper, crumbled bay leaves, and garlic. Massage the cure all over the duck legs.",
      "Place the legs in a sealed container or vacuum bag and refrigerate overnight, or for up to 48 hours for a more pronounced cure.",
      "Preheat the oven to 225°F (or prepare a sous vide bath to 155°F).",
      "Rinse the cure off the duck legs and pat thoroughly dry.",
      "Melt the duck fat in a deep ovenproof pot or Dutch oven over low heat. Lower the duck legs into the fat so they are completely submerged.",
      "Cover and transfer to the oven. Cook for 3 to 4 hours until the meat is completely tender, the fat moves freely when the pot is jiggled, and the meat is nearly falling from the bone.",
      "The confit can be stored in its fat in the refrigerator for up to a month at this point.",
      "To serve, remove the legs from the fat and scrape off any excess. Heat a heavy skillet over high heat without added oil and lay the legs skin-side down. Cook undisturbed for 4 to 5 minutes until the skin is deeply golden and crackling crisp.",
      "Serve with lentils, white beans, or a bitter green salad."
    ]
  },
  {
    "name": "Porcini Risotto with Beef Jus",
    "description": "Alain Ducasse's risotto is the definitive statement of his luxury minimalism: Haute-Lozère porcini mushrooms, the finest Italian Carnaroli rice, and a rich beef jus are combined with a technique — cooking the rice in stages in a heavy pot, finishing off the heat with a generous mount of butter — that produces a risotto of extraordinary creaminess and depth. The dish appears in his cookbook 'My Best' and is served at his restaurants as a monument to the idea that French rigour and Italian spirit can be unified in a single bowl. Every grain remains perfectly al dente inside a sauce of luxurious, almost excessive richness.",
    "chef": "Alain Ducasse",
    "prep_time_mins": 20,
    "cook_time_mins": 30,
    "servings": 4,
    "cuisine": "French-Italian",
    "difficulty": "medium",
    "ingredients": [
      "1 1/2 cups Carnaroli rice",
      "8 ounces fresh porcini mushrooms (or 1 oz dried porcini, rehydrated), cleaned and sliced",
      "1 small white onion, finely minced",
      "1/2 cup dry white wine",
      "5 to 6 cups hot chicken or vegetable broth",
      "1/2 cup good-quality beef jus or demi-glace",
      "6 tablespoons cold unsalted butter, cubed, divided",
      "2 tablespoons extra-virgin olive oil",
      "1/2 cup finely grated Parmigiano-Reggiano",
      "Salt and white pepper",
      "Fresh chives, for garnish"
    ],
    "steps": [
      "Heat the broth in a saucepan and keep at a gentle simmer throughout cooking.",
      "In a wide heavy-bottomed pan, heat 2 tablespoons of the butter and the olive oil over medium heat. Sweat the onion without browning for about 3 minutes until soft and translucent.",
      "Add the rice and cook, stirring, for 2 minutes over low heat until every grain is coated in fat and turns pearly and translucent.",
      "Pour in the white wine and stir until completely absorbed.",
      "Add the simmering broth one ladleful at a time, stirring frequently and adding the next ladle only when the previous one has been absorbed. Continue for about 18 to 20 minutes until the rice is al dente.",
      "While the risotto cooks, sauté the porcini in a separate pan with a knob of butter over high heat until golden. Season and set aside.",
      "When the rice is almost done, stir in the porcini and the warm beef jus.",
      "Remove from heat. Add the remaining cold butter and the Parmigiano-Reggiano and stir vigorously to emulsify into a glossy, creamy sauce — this is the mantecatura step.",
      "Season with salt and white pepper. Cover and rest for 2 minutes. Serve in warm bowls, garnished with fresh chives."
    ]
  },
  {
    "name": "Pommes Purée",
    "description": "Joël Robuchon's mashed potatoes are the most famous side dish in the history of fine dining. Made with an almost equal weight of butter to potatoes, Robuchon told journalists with characteristic candor, 'I owe everything to these mashed potatoes' — they made his reputation at Jamin in Paris in the 1980s and remain the definitive statement of his philosophy that exceptional cooking means perfect execution of simple things. The potatoes are boiled unpeeled, passed through the finest setting of a food mill, and enriched gradually with cold cubed butter and warm milk, then whisked until almost impossibly smooth and light.",
    "chef": "Joël Robuchon",
    "prep_time_mins": 10,
    "cook_time_mins": 45,
    "servings": 4,
    "cuisine": "French",
    "difficulty": "medium",
    "ingredients": [
      "2 pounds Ratte or Yukon Gold potatoes, scrubbed",
      "1 pound (4 sticks) cold unsalted butter, cut into 1/2-inch cubes",
      "3/4 cup whole milk, warmed",
      "Salt to taste"
    ],
    "steps": [
      "Place the unpeeled potatoes in a large pot of cold, heavily salted water. Bring to a boil and cook for 30 to 35 minutes until completely tender when pierced with a knife.",
      "Drain the potatoes. While still very hot, peel them and pass them through the finest disk of a food mill back into the warm cooking pot.",
      "Place the pot over medium heat and stir the milled potatoes vigorously with a wooden spoon until steam rises and the mixture is dry and pulling away from the sides, about 3 to 4 minutes.",
      "Reduce heat to low. Begin adding the cold butter one or two cubes at a time, stirring vigorously and waiting until each addition is nearly melted before adding the next.",
      "Once all the butter has been incorporated, gradually pour in the warm milk, whisking constantly until the purée is silky, glossy, and pale.",
      "Season generously with salt. Pass through a fine-mesh sieve for the smoothest result, if desired.",
      "Serve immediately in warm bowls, or keep warm over the lowest possible heat with a piece of butter on top."
    ]
  },
  {
    "name": "Kashmiri Lamb Rogan Josh",
    "description": "Madhur Jaffrey's rogan josh — drawn from her groundbreaking book 'An Invitation to Indian Cooking' — introduced generations of Western cooks to the aromatic, deeply colored lamb curry of Kashmir. Bone-in lamb is browned and then simmered with whole spices, ginger-garlic paste, yogurt, paprika, and Kashmiri chili until the fat floats free and the sauce is brick-red and intensely fragrant. Jaffrey, considered the world's foremost authority on Indian home cooking, has written that this dish captures the soul of Kashmiri hospitality.",
    "chef": "Madhur Jaffrey",
    "prep_time_mins": 20,
    "cook_time_mins": 60,
    "servings": 4,
    "cuisine": "Indian",
    "difficulty": "medium",
    "ingredients": [
      "2 pounds bone-in lamb shoulder or leg, cut into 2-inch pieces",
      "1/2 cup neutral oil or ghee",
      "4 whole cardamom pods",
      "2 bay leaves",
      "6 whole cloves",
      "10 black peppercorns",
      "1 cinnamon stick",
      "1 large onion, finely sliced",
      "1 inch fresh ginger, roughly chopped",
      "6 garlic cloves",
      "4 tablespoons water",
      "2 teaspoons ground coriander",
      "1 teaspoon ground cumin",
      "2 teaspoons sweet paprika",
      "1/2 teaspoon cayenne pepper",
      "1 cup plain whole-milk yogurt, whisked smooth",
      "1 teaspoon salt (or to taste)",
      "Fresh cilantro, for garnish"
    ],
    "steps": [
      "Blend the ginger, garlic, and 4 tablespoons water in a blender until a smooth paste forms.",
      "Heat the oil or ghee in a wide heavy-bottomed pot over medium-high heat. Brown the lamb pieces in batches, turning them until seared on all sides. Remove and set aside.",
      "Into the same hot fat, add the cardamom, bay leaves, cloves, peppercorns, and cinnamon stick. Stir once and wait a few seconds until the cloves swell and the bay leaves turn slightly golden.",
      "Add the sliced onion and stir-fry for 5 to 6 minutes until medium brown.",
      "Add the ginger-garlic paste and stir for 30 seconds. Add the ground coriander, cumin, paprika, cayenne, and salt and cook, stirring, for another 30 seconds.",
      "Return the browned lamb and any accumulated juices to the pot. Add the whisked yogurt 1 tablespoon at a time, stirring and frying for 30 seconds between each addition until fully incorporated.",
      "Add 1 cup of water, bring to a boil, cover, and reduce heat to low. Simmer for 50 to 60 minutes until the lamb is very tender and the sauce has thickened and turned deep red.",
      "Uncover for the final 10 minutes to concentrate the sauce and allow the fat to float to the surface.",
      "Skim excess oil if desired, garnish with fresh cilantro, and serve with basmati rice or warm naan."
    ]
  },
  {
    "name": "Roast Chicken with Za'atar and Preserved Lemon",
    "description": "Diana Henry's za'atar-rubbed roast chicken — from her James Beard Award-winning book 'A Bird in the Hand' — is a love letter to the fragrant pantry of the Middle East. A whole chicken is coated under and over its skin with za'atar, olive oil, and preserved lemon, then roasted until the herbed crust is deeply golden and the kitchen is filled with the scent of thyme, sumac, and sesame. Henry's book changed how British and American home cooks approach chicken, presenting dozens of globally inspired treatments that prove a weeknight bird can be transportive.",
    "chef": "Diana Henry",
    "prep_time_mins": 15,
    "cook_time_mins": 60,
    "servings": 4,
    "cuisine": "Middle Eastern-British",
    "difficulty": "easy",
    "ingredients": [
      "1 whole chicken (about 3 1/2 pounds)",
      "3 tablespoons za'atar spice blend",
      "4 tablespoons extra-virgin olive oil",
      "1 preserved lemon, pulp discarded, rind finely chopped",
      "2 garlic cloves, minced",
      "Juice of 1 lemon",
      "Salt and freshly ground black pepper",
      "1 small onion, roughly sliced",
      "Fresh flat-leaf parsley, for garnish",
      "Warm flatbreads and yogurt, for serving"
    ],
    "steps": [
      "Preheat the oven to 400°F.",
      "In a small bowl, mix together the za'atar, olive oil, preserved lemon rind, garlic, and lemon juice to form a thick paste.",
      "Gently loosen the skin over the breast and thighs of the chicken with your fingers. Spread half the za'atar paste under the skin, smoothing it across the breast and thigh meat.",
      "Rub the remaining paste all over the outside of the bird. Season generously with salt and pepper.",
      "Scatter the sliced onion in the bottom of a roasting pan. Set the chicken on top and pour a splash of water into the pan.",
      "Roast for 55 to 60 minutes until the crust is deep golden and fragrant and the juices run clear when the thigh is pierced.",
      "Rest the chicken for 10 minutes before carving.",
      "Scatter with fresh flat-leaf parsley and serve with warm flatbreads and thick yogurt."
    ]
  }
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
        null,
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

      existingTitles.add(recipe.name);
      inserted++;
    }
  });

  seedAll();
  sqlite.close();

  console.log(`✅ Recipe seed complete — ${inserted} inserted, ${skipped} already existed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
