/**
 * Shared category inference for USDA food descriptions.
 * Patterns are checked in order — first match wins.
 * No trailing \b so plurals ("Beans", "Apples") are matched.
 */
export const KEYWORD_CATEGORIES: [RegExp, string][] = [
  // Nut/seed products — must come BEFORE dairy ("almond butter" ≠ dairy)
  [/\b(almond|walnut|pecan|cashew|pistachio|hazelnut|peanut|macadamia|pine nut|flaxseed|chia|hemp seed|sesame|sunflower seed|pumpkin seed)/i, 'pantry'],

  // Fish & shellfish
  [/\b(salmon|tuna|cod|shrimp|crab|lobster|oyster|clam|mussel|scallop|halibut|tilapia|squid|octopus|anchov|sardine|mackerel|herring|trout|catfish|bass|snapper|mahi|flounder|sole|pollock|rockfish|swordfish|grouper|eel|carp)/i, 'seafood'],
  [/\b(finfish|shellfish|crustacean)/i, 'seafood'],

  // Meat
  [/\b(beef|pork|lamb|veal|chicken|turkey|duck|goose|venison|bison|rabbit|sausage|bacon|ham|prosciutto|salami|pepperoni|lard|suet|chorizo|pancetta|mortadella|liver|kidney|heart|tripe|offal|game bird)/i, 'meat'],

  // Dairy — actual dairy, not plant-based
  [/\b(whole milk|skim milk|2% milk|dairy milk|heavy cream|whipping cream|half.and.half|sour cream|cream cheese|cottage cheese|ricotta|mozzarella|cheddar|parmesan|gruyere|gouda|feta|brie|camembert|goat cheese|yogurt|kefir|ghee|clarified butter|unsalted butter|salted butter|buttermilk|whey|casein|lactose)/i, 'dairy'],
  // "Milk, whole" / "Egg, raw" / "Butter, without salt" / "Cream, fluid"
  [/^(milk|egg|butter|cream|cheese|yogurt|whey)\b/i, 'dairy'],

  // Beverages
  [/\b(beer|wine|spirit|vodka|whiskey|whisky|rum|gin|tequila|ale|lager|cider|mead|sake|soda|cola|soft drink|energy drink|espresso|latte|cappuccino|kombucha|smoothie)/i, 'beverage'],
  [/\b(coffee|tea|cocoa drink|hot chocolate|lemonade|punch|nectar)\b.*(beverage|drink)/i, 'beverage'],
  [/juice\b/i, 'beverage'],
  [/^(water|coffee|tea|beer|wine|juice|soda|milk shake|milkshake|smoothie|latte|chai)\b/i, 'beverage'],

  // Produce — fruits (strip trailing s for plurals by not using \b at end)
  [/\b(apple|orange|banana|grape|strawberr|blueberr|raspberr|blackberr|mango|pineapple|peach|pear|plum|cherr|melon|kiwi|lemon|lime|grapefruit|avocado|tomato|cucumber|zucchini|eggplant|squash|pumpkin|fig|date|pomegranate|passion fruit|papaya|guava|lychee|dragon fruit|apricot|nectarine|persimmon|quince|plantain|starfruit|jackfruit|durian|rambutan|longan|tamarind|cranberr|boysenberr|elderberr|gooseberr|currant|coconut)/i, 'produce'],
  // Produce — vegetables
  [/\b(carrot|potato|sweet potato|onion|garlic|broccoli|cauliflower|cabbage|spinach|lettuce|kale|celery|asparagus|beet|radish|turnip|parsnip|leek|shallot|artichoke|fennel|bok choy|brussels sprout|collard|arugula|watercress|endive|chicory|escarole|radicchio|rhubarb|corn|maize|snap pea|snow pea|edamame|okra|yam|taro|cassava|jicama|kohlrabi|rutabaga|celeriac|salsify|chayote|lotus root|bamboo shoot|water chestnut|daikon|parsley root)/i, 'produce'],
  [/\b(bell pepper|chili pepper|jalape|habanero|serrano|poblano|anaheim|chipotle|guajillo|ancho)/i, 'produce'],
  [/\b(mushroom|truffle|portobello|shiitake|oyster mushroom|chanterelle|morel|porcini|enoki|maitake)/i, 'produce'],

  // Pantry — grains
  [/\b(flour|rice|pasta|bread|oat|barley|wheat|rye|corn meal|quinoa|buckwheat|millet|grain|cereal|tortilla|cracker|noodle|couscous|polenta|semolina|farro|spelt|amaranth|teff|sorghum|bulgur|grits)/i, 'pantry'],
  // Pantry — beans & legumes
  [/\b(bean|lentil|chickpea|pea|tofu|tempeh|legume|dal|hummus|soybean|mung|adzuki|urad|black.eyed pea|split pea|red kidney|navy bean|pinto bean|black bean|cannellini|fava|lima bean)/i, 'pantry'],
  // Pantry — oils, condiments
  [/\b(olive oil|vegetable oil|canola oil|coconut oil|sesame oil|avocado oil|sunflower oil|palm oil|safflower oil|grapeseed oil|vinegar|soy sauce|fish sauce|oyster sauce|hoisin|teriyaki|ketchup|catsup|mustard|mayonnaise|hot sauce|tabasco|sriracha|worcestershire|miso|tahini|broth|stock|bouillon|gravy)/i, 'pantry'],
  [/\b(salt|sugar|brown sugar|powdered sugar|honey|maple syrup|agave|molasses|jam|jelly|marmalade|preserve|chocolate|cocoa|cacao|vanilla|baking powder|baking soda|yeast|cornstarch|arrowroot|gelatin|agar|pectin)/i, 'pantry'],
  // Pantry — spices & herbs
  [/\b(basil|oregano|thyme|rosemary|sage|dill|parsley|cilantro|coriander|mint|chive|tarragon|bay leaf|herb|cumin|turmeric|paprika|cinnamon|clove|nutmeg|cardamom|saffron|chili flake|cayenne|ginger|curry|allspice|anise|caraway|fenugreek|star anise|sumac|za.atar|fennel seed|poppy seed|celery seed|mustard seed|nigella|annatto|asafoetida|mace|pepper)/i, 'pantry'],
  // Pantry — baked goods / sweets / snacks
  [/\b(cake|cookie|pie|muffin|pastry|donut|waffle|pancake|brownie|biscuit|croissant|bagel|scone|tart|pretzel|chip|popcorn|granola|protein bar|energy bar)/i, 'pantry'],
  [/\b(ice cream|gelato|sorbet|candy|caramel|toffee|nougat|marshmallow|fudge|praline|taffy|licorice|gummy)/i, 'pantry'],
  // Catch-all: starts with "Eggs" / "Fish" / "Nuts" / "Sauce"
  [/^eggs?\b/i, 'dairy'],
  [/^fish\b/i, 'seafood'],
  [/^nuts?\b/i, 'pantry'],
  [/^sauce\b/i, 'pantry'],
  // More produce
  [/\b(mandarin|clementine|tangerine|watermelon|cantaloupe|honeydew|tomatillo|jicama|cactus|nopal|plantain|breadfruit|jackfruit|pawpaw|cherimoya|sapote|soursop|carambola|starfruit|tamarind|uglifruit|yuzu|bergamot|kumquat|pomelo|tangelo)/i, 'produce'],
  [/\b(olive|capers|sun.dried tomato|roasted pepper)/i, 'produce'],
  // More pantry
  [/\b(alfalfa|fenugreek|flaxseed|hempseed|chia seed|poppy seed|sesame seed|caraway seed|sunflower seed|pumpkin seed|seed|baobab|spirulina|wheatgrass|moringa|acai|goji|maca|turmeric|matcha)/i, 'pantry'],
  [/\b(animal fat|lard|tallow|schmaltz|duck fat|suet)/i, 'pantry'],
  // More beverages
  [/\b(alcoholic beverage|liqueur|brandy|cognac|port|sherry|vermouth|absinthe|champagne|prosecco|sparkling wine)/i, 'beverage'],
  // More soy/plant milk
  [/\b(soy milk|oat milk|almond milk|rice milk|hemp milk|cashew milk|coconut milk beverage)/i, 'beverage'],
  // Catch-all oil/fat
  [/\boil\b/i, 'pantry'],
  [/\bbutter\b/i, 'pantry'],  // catches "nut butter", "almond butter" etc. that weren't caught above
];

export function inferCategory(name: string): string {
  for (const [pattern, cat] of KEYWORD_CATEGORIES) {
    if (pattern.test(name)) return cat;
  }
  return 'other';
}
