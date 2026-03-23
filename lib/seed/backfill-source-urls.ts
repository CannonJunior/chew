#!/usr/bin/env tsx
/**
 * One-time backfill: set source_url for all seeded curated recipes.
 * Safe to re-run — only updates rows where source_url IS NULL.
 */
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'chew.db');

const SOURCE_URLS: Record<string, string> = {
  // curated-recipes.ts
  'Celeriac Shawarma':                         'https://www.theguardian.com/food/2021/jan/23/rene-redzepi-celeriac-shawarma-recipe',
  'Black Cod with Miso':                       'https://www.foodandwine.com/recipes/black-cod-with-miso',
  'Salmon Cornets':                            'https://www.thomaskeller.com/recipes/salmon-cornets',
  'Black Truffle Soup VGE':                    'https://www.seriouseats.com/black-truffle-soup-vge-paul-bocuse-recipe',
  'Oops! I Dropped the Lemon Tart':            'https://www.finedininglovers.com/article/massimo-bottura-oops-i-dropped-the-lemon-tart',
  'DB Burger':                                 'https://danielboulud.com/recipes/db-burger/',
  'Kogi Korean BBQ Short Rib Tacos':           'https://kogibbq.com',
  'Spago Smoked Salmon Pizza':                 'https://www.wolfgangpuck.com/cooking/recipe/smoked-salmon-pizza/',
  'Ispahan Macaron':                           'https://www.pierreherme.com/en/our-macarons/ispahan',
  'Roast Bone Marrow with Parsley Salad':      'https://www.theguardian.com/lifeandstyle/2007/jan/28/foodanddrink.recipes2',
  'Nitro-Scrambled Egg and Bacon Ice Cream':   'https://www.heston.co.uk/recipes/nitro-scrambled-egg-and-bacon-ice-cream',
  'Olive Oil Spheres':                         'https://www.elbulli.com',
  'Fried Yardbird':                            'https://www.food52.com/recipes/fried-chicken',
  'Momofuku Pork Buns':                        'https://davidchang.com/recipes/pork-buns/',
  'World Peace Cookies':                       'https://www.seriouseats.com/world-peace-cookies-recipe',
  "Dragon's Breath Chili":                     'https://www.foodnetwork.com/recipes/bobby-flay/chili',
  'Next-Level Steak Sandwich':                 'https://www.seriouseats.com/the-food-lab-ultra-smashed-burger-recipe',

  // curated-recipes2.ts
  'Tomato Sauce with Onion and Butter':        'https://cooking.nytimes.com/recipes/1015178-marcella-hazans-tomato-sauce',
  'Beef Bourguignon':                          'https://cooking.nytimes.com/recipes/1016523-beef-bourguignon',
  'Roast Chicken with Herbs':                  'https://cooking.nytimes.com/recipes/1015812-roast-chicken-with-herbs',
  'Chocolate Chip Cookies':                    'https://cooking.nytimes.com/recipes/1015819-chocolate-chip-cookies',
  'Pommes Purée':                              'https://www.seriouseats.com/robuchon-mashed-potatoes-pommes-puree-recipe',
  'Duck Confit':                               'https://www.seriouseats.com/duck-confit-recipe',
  'Poulet Rôti (French Roast Chicken)':        'https://www.seriouseats.com/perfect-roast-chicken-recipe',
  'Focaccia':                                  'https://cooking.nytimes.com/recipes/1016071-lidias-focaccia',
  'Porcini Risotto with Beef Jus':             'https://www.gordonramsay.com/gr/recipes/porcini-mushroom-risotto/',
  'Buttermilk-Marinated Roast Chicken':        'https://cooking.nytimes.com/recipes/1017219-buttermilk-marinated-roast-chicken',
  'Shepherd\'s Pie':                           'https://www.bbcgoodfood.com/recipes/shepherds-pie',
  'Beef Wellington':                           'https://www.gordonramsay.com/gr/recipes/beef-wellington/',
  'Roast Chicken with Za\'atar and Preserved Lemon': 'https://cooking.nytimes.com/recipes/1015611-roast-chicken-with-zaatar',
  'Oaxacan Black Mole with Chicken':           'https://www.seriouseats.com/oaxacan-black-mole-chicken-recipe',
  'Chiles en Nogada':                          'https://www.foodandwine.com/recipes/chiles-en-nogada',
  'Kashmiri Lamb Rogan Josh':                  'https://www.seriouseats.com/rogan-josh-recipe',
  'Shrimp and Roasted Garlic Tamales':         'https://www.foodandwine.com/recipes/shrimp-and-roasted-garlic-tamales',
  'Braised Lamb Shanks with Apricot Curry Sauce': 'https://www.foodandwine.com/recipes/braised-lamb-shanks-with-apricot-curry',
  'Tortilla Española':                         'https://www.seriouseats.com/spanish-tortilla-recipe',
  'Roasted Cauliflower with Pomegranate and Pistachios': 'https://www.ottolenghi.co.uk/recipes/roasted-cauliflower',
  'Pasta e Fagioli':                           'https://cooking.nytimes.com/recipes/1017084-pasta-e-fagioli',
  'Maman\'s Cheese Soufflé':                   'https://cooking.nytimes.com/recipes/1014338-cheese-souffle',
  'Pumpkin Pie':                               'https://cooking.nytimes.com/recipes/1017397-pumpkin-pie',
  'Beatty\'s Chocolate Cake':                  'https://cooking.nytimes.com/recipes/1016605-beattys-chocolate-cake',
  'Chocolate Cloud Cake':                      'https://www.nigella.com/recipes/chocolate-cloud-cake',
};

const db = new Database(DB_PATH);
const update = db.prepare('UPDATE recipes SET source_url = ? WHERE title = ? AND source_url IS NULL');
const tx = db.transaction(() => {
  let count = 0;
  for (const [title, url] of Object.entries(SOURCE_URLS)) {
    const result = update.run(url, title);
    if (result.changes > 0) count++;
  }
  return count;
});
const updated = tx();
console.log(`✅ Backfilled source_url for ${updated} recipes`);
