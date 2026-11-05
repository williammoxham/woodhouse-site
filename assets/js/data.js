/* =====================================================================
   WOODHOUSE SITE DATA
   This is the one file to edit for everyday changes: hours, menu,
   taps, contacts, artists and the live cellar connection.
   Events and blog posts come from Squarespace automatically
   (see /api); the EVENTS list below is only a fallback.
   ===================================================================== */
(function(){
const t=new Date();
const iso=dd=>new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate()+dd)).toISOString().slice(0,10);

window.WH_DATA={

/* ---- Contacts and links ---- */
CONTACT:{
  phone:'(831) 313-9461',
  general:'beer@woodhousebrews.com',
  events:'tara@woodhousebrews.com',
  booking:'beer@woodhousebrews.com',          /* artists and promoters */
  address:'119 Madrone St, Santa Cruz, CA 95060'
},
LINKS:{
  tally:'https://tally.so/r/Y5g81W',
  brochure:'downloads/woodhouse-events-brochure-2026.pdf',
  pressKit:'downloads/woodhouse-press-kit.pdf',  /* add this file to /downloads to turn the button on */
  instagram:'https://www.instagram.com/woodhousebrews/',
  merch:'https://woodhouse-gear.myshopify.com'
},

/* ---- Hours: index 0 = Sunday. o/c = open/close hour (24h), null = closed ---- */
HOURS:[
  {d:'Sun',o:12,c:19},{d:'Mon',o:null,c:null},{d:'Tue',o:13,c:21},{d:'Wed',o:13,c:21},
  {d:'Thu',o:13,c:21},{d:'Fri',o:13,c:22},{d:'Sat',o:12,c:22}
],

/* ---- Food menu ---- [name, price, description, tag] ---- */
MENU:{
 small:[
  ['Homemade Pretzel','$10','A freshly baked, golden sourdough pretzel served warm with house beer cheese or brown mustard.'],
  ['Pão de Queijo (5)','$10','Brazilian style cheese bread. Crisp outside, pillowy inside, delicately savory.','GF'],
  ['Beet Hummus','$10','Silky garbanzo hummus infused with roasted beets, with warm pita and crisp veggies.','Vegan'],
  ['Jalapeño Hummus','$10','Silky garbanzo hummus with a spicy kick, with warm pita and crisp veggies.','Vegan'],
  ['Sausage Roll (3)','$10','Seasoned sausage hand rolled in flaky puff pastry, with house mustard.'],
  ['Veggie Empanada','$7','Baked pastry filled with potato, carrot and peas. Dancing fuel.'],
  ['Chicken Empanada','$7','Juicy marinated chicken and gooey cheese in a hearty baked pie.'],
  ["Kid's Quesadilla",'$5','Flour tortilla with jack and cheddar for our little guests. Add chicken for a little extra.']
 ],
 salads:[
  ['Caesar','$12','Crisp romaine tossed in our house dressing, shaved parmesan and artisanal croutons.'],
  ['Greek','$12','Spring greens, red onion, kalamata olives, feta and cucumber with a light Mediterranean dressing.','GF'],
  ['Beet','$12','Spring greens, tangy goat cheese and candied walnuts with a delicate citrus vinaigrette.','GF']
 ],
 flat:[
  ['Woodhouse','$16','The signature. Pepperoni, earthy mushrooms and zesty banana peppers.'],
  ['Chicken Pesto','$16','Slow roasted chicken, melted mozzarella and house basil pesto, finished with fresh basil.'],
  ['Pepperoni','$16','Crispy pepperoni over bubbling mozzarella with a drizzle of hot honey.'],
  ['Margherita','$16','Creamy mozzarella and fragrant fresh basil. Simple at its best.','Veg'],
  ['Veggie','$16','Bell peppers, marinated artichoke, mushroom and pineapple.'],
  ['Carnitas','$18','Slow roasted carnitas with house chipotle salsa. New, and already a favorite.']
 ]
},

/* ---- Taps and drinks (Beer page). house:true = Woodhouse beer. Keep this current. ---- */
TAPS:[
  {name:'Early Bird',style:'American Light Ale',abv:5.3,house:true,note:'Crushable, clean and bright. The reward for showing up early.'},
  {name:'Moonless Midnight',style:'Porter',abv:7.1,house:true,note:'Dark as an unlit Santa Cruz night, light on the palate. Coffee and toasted bread.'},
  {name:'Woodhouse Pale Ale',style:'Pale Ale',house:true,note:'Our everyday pour. Balanced, floral and easy to love.'},
  {name:'Woodhouse IPA',style:'West Coast IPA',house:true,note:'Hop forward and dry, with pine and citrus up front.'},
  {name:'Guest Tap',style:'Rotating',guest:true,note:'A beer from a brewery we admire, while our next batches condition.'},
  {name:'Guest Tap',style:'Rotating',guest:true,note:'Ask the bar what is pouring today.'}
],
OTHER_DRINKS:[
  {name:'Wine',note:'Chardonnay and Pinot Noir by the glass.'},
  {name:'Cider',note:'A rotating local cider on draft.'},
  {name:'Hard Seltzer',note:'Light, bubbly, gluten free.'},
  {name:'Non-alcoholic',note:'Sodas, sparkling water and seasonal mocktails.'}
],
ARCHIVE:[
  ['Early Bird','American Light Ale','5.3%'],
  ['Moonless Midnight','Porter · Simcoe, Mosaic','7.1%'],
  ['Nexties','Hazy IPA','IPA'],
  ['Jam Session','IPA · Superblume collab, Superbloom yeast','IPA'],
  ['Trick or Treat','Mixed fermentation on gummies and jolly ranchers','Wild']
],

/* ---- Live cellar: the brewing app's Supabase (see cellar-setup.sql). Empty = preview data. ---- */
CELLAR_SOURCE:{url:'',anonKey:'',view:'public_cellar',refreshMinutes:5},
CELLAR_LAYOUT:[
  {code:'FV1',bbl:10,kind:'fv'},{code:'FV2',bbl:10,kind:'fv'},{code:'FV3',bbl:10,kind:'fv'},{code:'FV4',bbl:20,kind:'fv'},
  {code:'P1',bbl:2,kind:'fv',label:'Pilot 1'},{code:'P2',bbl:2,kind:'fv',label:'Pilot 2'},
  {code:'BT2',bbl:7,kind:'bt'},{code:'BT3',bbl:7,kind:'bt'},{code:'BT4',bbl:7,kind:'bt'},{code:'B20',bbl:20,kind:'bt',label:'20 bbl Bright'}
],
CELLAR_PREVIEW:[
  {tank_code:'FV1',beer_name:'Early Bird',style:'American Light Ale',status:'fermenting',fill_pct:88,brewed_on:iso(-4),ready_on:iso(10),abv_target:5.3},
  {tank_code:'FV2',beer_name:'West Coast IPA',style:'IPA',status:'conditioning',fill_pct:92,brewed_on:iso(-12),ready_on:iso(6),abv_target:6.8},
  {tank_code:'FV3',status:'cleaning'},
  {tank_code:'FV4',beer_name:'Nexties',style:'Hazy IPA',status:'fermenting',fill_pct:94,brewed_on:iso(-2),ready_on:iso(18),abv_target:6.5},
  {tank_code:'P1',beer_name:'Trick or Treat',style:'Mixed fermentation',status:'fermenting',fill_pct:72,brewed_on:iso(-20),ready_on:iso(40)},
  {tank_code:'P2',status:'empty'},
  {tank_code:'BT2',beer_name:'Moonless Midnight',style:'Porter',status:'ready',fill_pct:78,brewed_on:iso(-24),ready_on:iso(-1),abv_target:7.1},
  {tank_code:'BT3',beer_name:'Jam Session',style:'IPA',status:'conditioning',fill_pct:64,brewed_on:iso(-16),ready_on:iso(3),abv_target:6.2},
  {tank_code:'BT4',status:'empty'},
  {tank_code:'B20',status:'empty'}
],

/* ---- Fallback events (used only if Squarespace can't be reached). Times are Pacific. ---- */
EVENTS:[
  {date:'2026-11-05',start:'19:00',end:'22:00',title:'Camellia Boutros Band & Flat SUN Society',excerpt:'Arab experimentalism on the electric oud guitar, then six friends from Big Sur and Santa Cruz with polyrhythmic psych rock.',url:'https://www.woodhousebrews.com/events/2026/11/5/camellia-boutros-band-amp-flat-sun-society',tags:['Live music']},
  {date:'2026-11-06',start:'19:00',end:'22:00',title:'Los Pendejos Imbeciles Band',excerpt:'Friday night, live on the Woodhouse stage.',url:'https://www.woodhousebrews.com/events/2026/11/6/los-pendejos-imbeciles-band',tags:['Live music']},
  {date:'2026-11-07',start:'18:30',end:'21:30',title:'Puffball Collective',excerpt:'Funky Americana dance jams with members of the Banana Slug String Band, Rosebud and Velour.',url:'https://www.woodhousebrews.com/events/2025/3/21/puffball-collective',tags:['Live music']},
  {date:'2026-11-18',start:'17:00',end:'21:00',title:'Foster Andersen Benefit',excerpt:'A community benefit night. Come out, raise a glass and show up for one of our own.',url:'https://www.woodhousebrews.com/events/2026/11/18/foster-andersen-benefit',tags:['Community']},
  {date:'2026-11-28',start:'19:00',end:'22:00',title:'China Cats',excerpt:'The premier Grateful Dead tribute in Santa Cruz and the Bay Area, playing the Dead since 2010. $25 at the door.',url:'https://www.woodhousebrews.com/events/2025/11/29/china-cats-2plsr',tags:['Live music','Ticketed']},
  {date:'2026-12-04',start:'19:00',end:'22:00',title:"1970's Rock Revue",excerpt:'Original arrangements of Rush, Genesis, Mahavishnu, Return to Forever and more 1970s jazz rock and prog.',url:'https://www.woodhousebrews.com/events/2026/12/4/1970s-rock-revue',tags:['Live music']},
  {date:'2026-12-06',start:'17:00',end:'20:00',title:'Horse Feathers',excerpt:'Two decades of intimate, cinematic chamber folk from the Pacific Northwest. The kind of night that makes a room go still.',url:'https://www.eventbrite.com/e/horse-feathers-tickets-1993861278758',tags:['Live music','Ticketed']}
],

/* ---- Artists and series we have hosted (Calendar page wall). Add freely. ---- */
ARTISTS:[
  'KRS-One','Horse Feathers','China Cats','Grateful Dads','Velour','Slow Gherkin','MU330','Honor System','Shinobu',
  'A Tribute to Sly & The Family Stone','Natalie Cressman','Camellia Boutros','Flat Sun Society','Puffball Collective',
  'BLVK H3RO & The 3Peat Band','Selecta 7','Kava Jah & The Remedy','Afrobeats Nite with DJ Monk Earl','Bongo Sidibe',
  'Bongo and the Tontons','Clan Dyken','The Jamissaries','Anthony Arya','Superblume','Free Elements','Free to Be',
  'SOLCIRCLE','Mick Adams','Brian Fitzgerald Jazz Trio','Casanostra','Edge of the West','Lemongrass ft. Taylor Rae',
  'Tokyo Hot Tub','DizzAster','Marli Moves','Novolunie','Los Pendejos Imbeciles','1970s Rock Revue','Rudi B','Lil John',
  'Santa Cruz Comedy Festival','Surf City Line Dancing','Santa Cruz Square Dance','BeTV Presents','Mi Gente Fest','The Nexties'
]
};
})();
