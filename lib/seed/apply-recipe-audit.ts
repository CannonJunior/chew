#!/usr/bin/env tsx
/**
 * Applies the recipe audit:
 *  - Updates source_url for every recipe
 *  - Deletes recipes with no working URL (and their child records)
 *  - Populates recipe_media with primary images from the audit
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');
const db = new Database(DB_PATH);

type AuditEntry = {
  id: string;
  title: string;
  source_url: string | null;
  image_url: string | null;
  delete: boolean;
};

const AUDIT: AuditEntry[] = [
  { id: '01KKZDPX6PYNVEJC3YBP71QH6C', title: "Beatty's Chocolate Cake",                        source_url: 'https://barefootcontessa.com/recipes/beattys-chocolate-cake',                                                                          image_url: 'https://d14iv1hjmfkv57.cloudfront.net/assets/recipes/beattys-chocolate-cake/_1200x630_crop_center-center_82_none/IMG_0822.jpeg',         delete: false },
  { id: '01KKZDPX6KRP9E8P07Q2JMAEX0', title: 'Beef Bourguignon',                                source_url: 'https://www.wgbh.org/lifestyle/food/recipes/2020-05-22/julia-childs-beef-bourguignon-recipe',                                          image_url: 'https://cdn.grove.wgbh.org/65/b7/0e57b82a95ee0b1ff2e9150f037d/4226677581-e6850c5780-k.jpg',                                              delete: false },
  { id: '01KKZDPX6X6JJ9H2TTZFD25MEG', title: 'Beef Wellington',                                 source_url: 'https://www.gordonramsay.com/gr/recipes/beef-wellington/',                                                                              image_url: 'https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage14814850-50-beef-well-banner.png',                              delete: false },
  { id: '01KKZDPX6D22YMA0FTTXJ7ZAEF', title: 'Black Cod with Miso',                             source_url: 'https://japan.recipetineats.com/nobus-miso-marinated-black-cod-recipe/',                                                                image_url: 'https://japan.recipetineats.com/wp-content/uploads/2023/01/Nobus_Miso_Marinated_Black_Cod_8513.jpg',                                      delete: false },
  { id: '01KM09MAXJ7TAB6VR4ZHHB7B5F', title: 'Black Truffle Soup VGE',                          source_url: 'https://www.vietworldkitchen.com/blog/2018/01/paul-bocuses-soup-truffles-recipe.html',                                                  image_url: 'https://www.vietworldkitchen.com/wp-content/uploads/2018/01/bocuse-soup-wide.jpg',                                                        delete: false },
  { id: '01KM09MAY09E5GBRPJF96DY0P6', title: 'Braised Lamb Shanks with Apricot Curry Sauce',    source_url: 'https://cooking.nytimes.com/recipes/7305-braised-lamb-shanks-with-apricot-curry-sauce',                                                 image_url: null,                                                                                                                                      delete: false },
  { id: '01KM09MAY1S5NYBVDDM837EBTK', title: 'Buttermilk-Marinated Roast Chicken',              source_url: 'https://www.saltfatacidheat.com/buttermilkmarinated-roast-chicken',                                                                     image_url: null,                                                                                                                                      delete: false },
  { id: '01KKZDPX6BBWWB6EXZN1HP66SH', title: 'Celeriac Shawarma',                               source_url: 'https://www.jamieoliver.com/recipes/vegetables/gnarly-celeriac-shawarma/',                                                              image_url: 'https://asset.jamieoliver.com/images/cq7w2e71/production/168d4ec4bd0b3632af026b8ccc326cdd220f3ed7-853x1279.jpg',                          delete: false },
  { id: '01KM09MAXZDZZK4XTKH9SC2HFP', title: 'Chiles en Nogada',                                source_url: 'https://patijinich.com/chiles_en_nogada_at_last/',                                                                                      image_url: 'https://patijinich.com/wp-content/uploads/2016/09/chiles-en-nogada-main-lg.jpg',                                                          delete: false },
  { id: '01KKZDPX6XY0KE7JHR5EJKY8DA', title: 'Chocolate Chip Cookies',                          source_url: 'https://leitesculinaria.com/9951/recipes-perfect-chocolate-chip-cookies.html',                                                          image_url: null,                                                                                                                                      delete: false },
  { id: '01KM09MAXMK9FTK3Q9HKZ15CHV', title: 'Chocolate Cloud Cake',                            source_url: 'https://www.nigella.com/recipes/chocolate-cloud-cake',                                                                                  image_url: 'https://www.nigella.com/assets/uploads/recipes/public-thumbnail/chocolate-cloud-cake-562a34d0d795c.jpg',                                  delete: false },
  { id: '01KM09MAXGDW5DDMWYNDYHXTVX', title: 'DB Burger',                                       source_url: 'https://www.foodrepublic.com/2011/06/07/a-brief-history-of-the-expensive-burger/',                                                     image_url: 'https://www.foodrepublic.com/img/gallery/a-brief-history-of-the-expensive-burger/intro-import.jpg',                                       delete: false },
  { id: '01KKZDPX6Q7JWTZN017YCVZC9W', title: "Dragon's Breath Chili",                           source_url: 'https://www.foodnetwork.com/recipes/guy-fieri/dragons-breath-chili-recipe-1945276',                                                    image_url: null,                                                                                                                                      delete: false },
  { id: '01KM09MAY134NHX2D3HY9XT104', title: 'Duck Confit',                                     source_url: 'https://www.recipetineats.com/duck-confit/',                                                                                            image_url: 'https://www.recipetineats.com/tachyon/2021/06/Duck-Confit-photo-_8.jpg',                                                                  delete: false },
  { id: '01KM09MAXT3V6ABXG5NN4HS4NX', title: 'Focaccia',                                        source_url: 'https://lidiasitaly.com/recipes/focaccia/',                                                                                             image_url: null,                                                                                                                                      delete: false },
  { id: '01KKZDPX6T4YFW0JQZVC1C8HSW', title: 'Fried Yardbird',                                  source_url: 'https://www.foodrepublic.com/recipes/fried-yardbird-recipe/',                                                                          image_url: 'https://www.foodrepublic.com/img/gallery/fried-yardbird-recipe/intro-import.jpg',                                                         delete: false },
  { id: '01KM09MAXWS15BHPPCWRDMFS6J', title: 'Ispahan Macaron',                                  source_url: 'https://www.patisseriemakesperfect.co.uk/ispahan-macarons/',                                                                           image_url: 'https://www.patisseriemakesperfect.co.uk/wp-content/uploads/2014/10/IMG_14471.jpg',                                                       delete: false },
  { id: '01KM09MAY3YKQ9J1CXF86S2ECF', title: 'Kashmiri Lamb Rogan Josh',                        source_url: 'https://www.recipetineats.com/rogan-josh/',                                                                                             image_url: 'https://www.recipetineats.com/tachyon/2020/02/Rogan-Josh_4.jpg',                                                                          delete: false },
  { id: '01KM09MAXSD5C6J76YNVSVZK1E', title: 'Kogi Korean BBQ Short Rib Tacos',                 source_url: 'https://kogibbq.com',                                                                                                                   image_url: null,                                                                                                                                      delete: false },
  { id: '01KKZDPX6JKWWWTTZYS9EPX1FG', title: "Maman's Cheese Soufflé",                          source_url: 'https://cooking.nytimes.com/recipes/1014338-cheese-souffle',                                                                           image_url: null,                                                                                                                                      delete: false },
  { id: '01KKZDPX6HNGE6BWRYHBCN8VTF', title: 'Momofuku Pork Buns',                              source_url: 'https://www.gourmettraveller.com.au/recipe/chefs-recipes/momofukus-pork-buns-7594/',                                                   image_url: 'https://api.photon.aremedia.net.au/wp-content/uploads/sites/10/GourmetTraveller/2013/05/08/4572/0610gtchangporkbuns-628.jpg',              delete: false },
  { id: '01KKZDPX6TVHT1BE6WS53W81DN', title: 'Next-Level Steak Sandwich',                       source_url: 'https://www.seriouseats.com/the-food-lab-ultra-smashed-burger-recipe',                                                                  image_url: null,                                                                                                                                      delete: false },
  { id: '01KKZDPX6NSPK46K19FGKGD21V', title: 'Nitro-Scrambled Egg and Bacon Ice Cream',        source_url: 'https://www.sbs.com.au/food/recipe/heston-blumenthals-bacon-and-egg-ice-cream/whz97nklu',                                              image_url: 'https://assets.sbs.com.au/dims4/default/5b41872/2147483647/strip/true/crop/469x264+0+0/resize/1280x720!/quality/90/?url=https%3A%2F%2Fsbs-au-brightspot.s3.ap-southeast-2.amazonaws.com%2Fdrupal%2Ffood%2Fpublic%2Fbacon-and-egg-icecream-recipe.jpg', delete: false },
  { id: '01KM09MAXP1XB1E9P95T628Q6T', title: 'Oaxacan Black Mole with Chicken',                 source_url: 'https://www.rickbayless.com/recipe/oaxacan-black-mole/',                                                                               image_url: 'https://www.rickbayless.com/wp-content/uploads/2022/03/IMG_9515-scaled.jpg',                                                              delete: false },
  { id: '01KM09MAXKSH46TVP05X1VDK1X', title: 'Olive Oil Spheres',                               source_url: null,                                                                                                                                    image_url: null,                                                                                                                                      delete: true  },
  { id: '01KM09MAXXA84E95ZVGE40M6W1', title: "Oops! I Dropped the Lemon Tart",                  source_url: 'https://www.four-magazine.com/recipes/oops-ive-dropped-the-lemon-tart/',                                                              image_url: 'https://www.four-magazine.com/wp-content/uploads/2017/09/944_0.jpeg',                                                                     delete: false },
  { id: '01KM09MAXY3HX49JFP1JKG4PCB', title: 'Pasta e Fagioli',                                 source_url: 'https://www.loveandlemons.com/pasta-fagioli/',                                                                                         image_url: 'https://cdn.loveandlemons.com/wp-content/uploads/2023/02/pasta-e-fagioli.jpg',                                                            delete: false },
  { id: '01KM09MAY27JJMK8VJYH2NYYHX', title: 'Pommes Purée',                                    source_url: 'https://guide.michelin.com/us/en/article/features/joel-robuchon-pommes-puree',                                                         image_url: null,                                                                                                                                      delete: false },
  { id: '01KM09MAY2XAMJWSAVM8C678KC', title: 'Porcini Risotto with Beef Jus',                   source_url: 'https://www.gordonramsay.com/gr/recipes/barleyrisotto/',                                                                               image_url: 'https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage192072050-50-mushroom-beauty.jpg',                               delete: false },
  { id: '01KM09MAXWEDNAPRT84S1RM884', title: 'Poulet Rôti (French Roast Chicken)',              source_url: 'https://www.pardonyourfrench.com/french-roast-chicken-poulet-roti/',                                                                    image_url: 'https://i0.wp.com/www.pardonyourfrench.com/wp-content/uploads/2022/10/French-Roast-Chicken-Poulet-Roti-2-scaled.jpg?fit=1709%2C2560&ssl=1', delete: false },
  { id: '01KKZDPX6GWCY9JRNBG5PMNR91', title: 'Pumpkin Pie',                                     source_url: 'https://www.cbsnews.com/news/recipe-ultimate-pumpkin-pie-from-new-york-times-cooking/',                                                image_url: 'https://assets1.cbsnewsstatic.com/hub/i/r/2021/11/19/717fbdbd-fec2-4382-a141-1adfb7370153/thumbnail/1200x630/b64b587f034fd08e84c6906fa1e0e4f2/nyt-ultimate-pumpkin-pie-1280.jpg', delete: false },
  { id: '01KM09MAXP7FRTF5RN5G7SGVC1', title: 'Roast Bone Marrow with Parsley Salad',            source_url: 'https://andrewzimmern.com/recipes/fergus-roasted-marrow-bones-with-parsley-salad-toast/',                                              image_url: 'https://andrewzimmern.com/wp-content/uploads/Andrew-Zimmern-Recipe-Bone-Marrow-scaled.jpg',                                               delete: false },
  { id: '01KM09MAXN3V0RYJ2FD7GW24WR', title: 'Roast Chicken with Herbs',                        source_url: 'https://www.afamilyfeast.com/perfect-herb-roasted-chicken/',                                                                           image_url: 'https://www.afamilyfeast.com/wp-content/uploads/2017/02/Perfect-Herb-Roasted-Chicken.jpg',                                                delete: false },
  { id: '01KM09MAY4GNYSTD83YD5F3EEH', title: "Roast Chicken with Za'atar and Preserved Lemon",  source_url: 'https://www.mondomulia.com/2015/12/11/ottolenghi-chicken-with-zaatar-and-sumac/',                                                      image_url: 'https://www.mondomulia.com/wp-content/uploads/2015/12/Ottolenghi-Roasted-Chicken-3.jpeg',                                                 delete: false },
  { id: '01KM09MAXVPDFWW504MVRS22B9', title: 'Roasted Cauliflower with Pomegranate and Pistachios', source_url: 'https://www.purewow.com/recipes/yotam-ottolenghi-cauliflower-pomegranate-pistachio-salad',                                         image_url: 'https://publish.purewow.net/wp-content/uploads/sites/2/2018/11/yotam-ottolenghi-cauliflower-pomegranate-pistachio-recipe-290.jpg',         delete: false },
  { id: '01KKZDPX6E4Q71ENSBF9BZ9SNV', title: 'Salmon Cornets',                                  source_url: 'https://primalwellness.coach/2023/03/12/salmon-tartare-cornets-with-sweet-red-onion-creme-fraiche-gluten-free-sugar-free-low-carb/',   image_url: 'https://primalwellness.coach/wp-content/uploads/2023/02/Salmon-Tartare-Cornets-3.jpg',                                                    delete: false },
  { id: '01KKZDPX6JNS84AX888H6R3D99', title: "Shepherd's Pie",                                  source_url: 'https://www.greatbritishchefs.com/recipes/shepherds-pie-recipe',                                                                       image_url: 'https://media-cdn2.greatbritishchefs.com/media/2nxlk3u2/img17689.whqc_1426x713q80fpt493fpl600.jpg',                                       delete: false },
  { id: '01KKZDPX6V4K88GGAKJD3JRADB', title: 'Shrimp and Roasted Garlic Tamales',              source_url: 'https://www.mashed.com/658282/bobby-flays-shrimp-and-roasted-garlic-tamale-recipe-with-a-twist/',                                       image_url: 'https://www.mashed.com/img/gallery/bobby-flays-shrimp-and-roasted-garlic-tamale-recipe-with-a-twist/l-intro-1636648160.jpg',               delete: false },
  { id: '01KKZDPX6WXEM50JCJZMVBGSAM', title: 'Spago Smoked Salmon Pizza',                       source_url: 'https://guide.michelin.com/us/en/article/features/wolfgang-puck-smoked-salmon-pizza',                                                  image_url: 'https://d3h1lg3ksw6i6b.cloudfront.net/media/image/2018/10/11/bfba73702f89491baca128213ea6fd1d_Spago+Pizza+-+Spago+Beverly+Hills.jpg',     delete: false },
  { id: '01KM09MAXE9HQRA8TACRHHTRFZ', title: 'Tomato Sauce with Onion and Butter',             source_url: 'https://www.pbs.org/food/recipes/marcella-hazans-tomato-sauce-with-onion-and-butter',                                                  image_url: 'https://dmlxzvnzyohme.cloudfront.net/Marcella-Hazan/_1200x630_crop_center-center_82_none_ns/Tomato_Sauce_Onions_Butter-copy.webp',        delete: false },
  { id: '01KM09MAXH44TQRFR2EFBNJ47E', title: 'Tortilla Española',                               source_url: 'https://www.seriouseats.com/spanish-tortilla-recipe',                                                                                  image_url: null,                                                                                                                                      delete: false },
  { id: '01KM09MAXH7261BKPKFE77P9HJ', title: 'World Peace Cookies',                             source_url: 'https://www.kingarthurbaking.com/recipes/world-peace-cookies-20-recipe',                                                              image_url: 'https://www.kingarthurbaking.com/sites/default/files/2021-09/World-Peace-Cookies-2.0.jpg',                                                delete: false },
];

const deleteMedia  = db.prepare('DELETE FROM recipe_media WHERE recipe_id = ?');
const deleteIngr   = db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?');
const deleteSteps  = db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?');
const deleteRecipe = db.prepare('DELETE FROM recipes WHERE id = ?');
const updateUrl    = db.prepare('UPDATE recipes SET source_url = ? WHERE id = ?');
const insertMedia  = db.prepare(`
  INSERT OR IGNORE INTO recipe_media (id, recipe_id, type, url_or_path, caption, is_primary, sort_order)
  VALUES (?, ?, 'image', ?, 'Primary recipe photo', 1, 0)
`);

const tx = db.transaction(() => {
  let deleted = 0, updated = 0, imagesAdded = 0;
  for (const entry of AUDIT) {
    if (entry.delete) {
      deleteMedia.run(entry.id);
      deleteIngr.run(entry.id);
      deleteSteps.run(entry.id);
      deleteRecipe.run(entry.id);
      deleted++;
      console.log(`  🗑  Deleted: ${entry.title}`);
      continue;
    }
    updateUrl.run(entry.source_url, entry.id);
    updated++;
    // Clear old media and insert new primary image
    deleteMedia.run(entry.id);
    if (entry.image_url) {
      insertMedia.run(ulid(), entry.id, entry.image_url);
      imagesAdded++;
    }
  }
  return { deleted, updated, imagesAdded };
});

const result = tx();
console.log(`\n✅ Done — ${result.deleted} deleted, ${result.updated} updated, ${result.imagesAdded} images stored`);
