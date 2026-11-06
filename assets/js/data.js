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

/* ---- Drinks: live from Square via /api/taps (what actually sold in the last 7 days).
        This snapshot is only shown if Square can't be reached. Snapshot taken Nov 5, 2026. ---- */
TAPS_SNAPSHOT:{updated:'2026-11-05',groups:[
  {key:'house',label:'Woodhouse Beer',items:[
    {name:'Egyptian Cotton',desc:'Hazy IPA · 6.1% ABV · Cashmere, Idaho 7, Azacca, Citra, Mosaic',abv:6.1,style:'Hazy IPA',color:'#12BF94',sizes:[['Pint (16oz)',900],['Tulip (12oz)',700],['Taster (5oz)',300],['Crowler (32oz)',1700]]},
    {name:'Better Late',desc:'',style:'House beer',color:'#FFBF00',sizes:[['Pint (16oz)',800],['Tulip (12oz)',600],['Taster (5oz)',300],['4 Pack',2500]]},
    {name:'Herringbone',desc:'Pale Ale · 5.8% ABV · Mosaic, Simcoe, Citra',abv:5.8,style:'Pale Ale',color:'#2693FF',sizes:[['Pint (16oz)',900],['Tulip (12oz)',600],['Taster (5oz)',300]]},
    {name:'Dark & Ominous Tones',desc:'Milk Stout · 7.5% ABV',abv:7.5,style:'Milk Stout',color:'#593C00',sizes:[['Pint (16oz)',700],['Tulip (12oz)',600],['Taster (5oz)',300],['Crowler (32oz)',1200]]},
    {name:'Framboise',desc:'',style:'Raspberry',color:'#990838',sizes:[['Tulip (12oz)',800],['Taster (5oz)',400],['Bottle',1500]]}
  ]},
  {key:'guest',label:'Guest Taps',items:[
    {name:'Slippery Slope',desc:'',style:'Guest beer',color:'#12BF94',sizes:[['Regular',900]]}
  ]},
  {key:'spritz',label:'Spritzes & Seltzers',items:[
    {name:'Lemoncello Spritz',desc:'',color:'#FFBF00',sizes:[['Tulip (12oz)',1000],['Taster (5oz)',500]]},
    {name:'Negroni Spritz',desc:'',color:'#F25B3D',sizes:[['Tulip (12oz)',1000],['Taster (5oz)',500]]},
    {name:'Pineapple Seltzer',desc:'',color:'#FF9F40',sizes:[['Tulip (12oz)',1000],['Taster (5oz)',500]]}
  ]},
  {key:'cider',label:'Cider',items:[{name:'Scrumpy Draft',desc:'Local cider on draft',color:'#FF9F40',sizes:[['12oz',1000]]}]},
  {key:'wine',label:'Wine',items:[{name:'Red, White & Rosé',desc:'By the glass',color:'#B21212',sizes:[['Glass',1000]]}]},
  {key:'na',label:'Non-Alcoholic',items:[{name:'Athletic NA Beer, Living Swell, Probiotic Soda & Sodas',desc:'Zero proof, full flavor',color:'#2693FF',sizes:[]}]}
]},
ARCHIVE:[
  ['Depth of Field','Hazy IPA · Cashmere, Simcoe, Motueka','6.7%'],
  ['Fractal Patterns','International Pale Ale · Citra, Galaxy, Mosaic','6.4%'],
  ['Straight & Narrow','West Coast IPA · Simcoe, Citra, Idaho 7','7.2%'],
  ['Organic Geometry','West Coast Double IPA','8%'],
  ['I Could Care Less','English Mild · Maris Otter, Saaz, Simcoe','4.5%'],
  ['Be Nice','Mixed fermentation Brett table beer','3.6%'],
  ['Persistence','Mixed fermentation · Raspberry','5%'],
  ['Moonless Midnight','Porter · Simcoe, Mosaic','7.1%'],
  ['Superblume','Session IPA · band collab','5%']
],

/* ---- Bar packages for private events (from the brochure, pricing on request) ---- */
BAR_PACKAGES:[
  {name:'Classic Open Bar',mark:1,lede:'Up to three hours of unlimited beverage service.',items:['Three Woodhouse craft beers: pale ale, IPA and light beer','Chardonnay and Pinot Noir','Hard seltzer','All standard non-alcoholic beverages','Professional bar setup and breakdown']},
  {name:'Select Open Bar',mark:2,lede:'Everything in Classic, with a few signature touches.',items:['Everything in the Classic Open Bar','One cider selection','A signature cocktail made for your event','A signature mocktail made for your event','Professional bar setup and breakdown']},
  {name:'Your Way',mark:3,lede:'Flexible options when an open bar isn\'t the right fit.',items:['Guests pay: individual purchases','Drink tickets purchased in advance','Hosted tab with an agreed spending limit','Food and beverage minimum agreed in advance','Extra hours arranged ahead of time']}
],

/* ---- Make it yours galleries (events page). [image, caption] ---- */
GALLERIES:{
  dinners:{title:'Seated dinners & receptions',imgs:[['img/lantern-hall.jpg','The Hall set for a catered reception'],['img/gallery-room.jpg','Long tables in the Gallery'],['img/patio-deck.jpg','Candlelit tables on the deck'],['img/patio-dusk.jpg','The patio at dusk']]},
  music:{title:'Live bands, DJs & dancing',imgs:[['img/crowd.jpg','KRS-One on the patio'],['img/indoor.jpg','A DJ set inside'],['img/stage.jpg','Live on the outdoor stage'],['img/stage-night.jpg','The stage lit for the night']]},
  stage:{title:'Stage performances & speeches',imgs:[['img/stage-night.jpg','The outdoor stage'],['img/stage.jpg','Behind the kit'],['img/crowd.jpg','A full patio facing the stage']]},
  present:{title:'Presentations & projection',imgs:[['img/indoor.jpg','The video wall inside'],['img/gallery-room.jpg','The Gallery set for a meeting'],['img/purple-room.jpg','Lights down for a show']]},
  food:{title:'Custom catering & hosted bars',imgs:[['img/ribs.jpg','Smoked ribs'],['img/lantern-hall.jpg','Buffet service'],['img/wings.jpg','Wings and a hazy'],['img/cater-2.jpg','Coastal ceviche'],['img/cater-1.jpg','Hummus and empanadas'],['img/cater-3.jpg','Flatbreads'],['img/cater-4.jpg','Sourdough pretzel'],['img/pints.jpg','Woodhouse pints']]},
  decor:{title:'Rentals, florals & entertainment',imgs:[['img/lantern-hall.jpg','Lanterns, ferns and florals'],['img/patio-deck.jpg','String lights and a disco ball'],['img/outdoor-bar.jpg','The outdoor bar rail'],['img/purple-room.jpg','Custom lighting']]}
},

/* ---- Live cellar: the brewing app's Supabase (see cellar-setup.sql). Empty = preview data. ---- */
CELLAR_SOURCE:{url:'',anonKey:'',view:'public_cellar',refreshMinutes:5},
CELLAR_LAYOUT:[
  {code:'FV1',bbl:10,kind:'fv'},{code:'FV2',bbl:10,kind:'fv'},{code:'FV3',bbl:10,kind:'fv'},{code:'FV4',bbl:20,kind:'fv'},
  {code:'P1',bbl:2,kind:'fv',label:'Pilot 1'},{code:'P2',bbl:2,kind:'fv',label:'Pilot 2'},
  {code:'BT2',bbl:7,kind:'bt'},{code:'BT3',bbl:7,kind:'bt'},{code:'BT4',bbl:7,kind:'bt'},{code:'B20',bbl:20,kind:'bt',label:'20 bbl Bright'}
],
CELLAR_PREVIEW:[
  {tank_code:'FV1',beer_name:'Egyptian Cotton',style:'Hazy IPA',status:'fermenting',fill_pct:90,brewed_on:iso(-5),ready_on:iso(9),abv_target:6.1,batch:'#214',og:1.062,sg:1.024,fg_target:1.016,ibu:35,temp_f:66,yeast:'London Ale III',hops:'Cashmere, Idaho 7, Azacca, Citra, Mosaic',malt:'Pilsner, oats, wheat'},
  {tank_code:'FV2',beer_name:'Herringbone',style:'Pale Ale',status:'conditioning',fill_pct:92,brewed_on:iso(-12),ready_on:iso(3),abv_target:5.8,batch:'#212',og:1.054,sg:1.011,fg_target:1.010,ibu:40,temp_f:34,yeast:'Chico',hops:'Mosaic, Simcoe, Citra',malt:'2-row, Vienna, crystal'},
  {tank_code:'FV3',status:'cleaning'},
  {tank_code:'FV4',beer_name:'Better Late',style:'House beer',status:'fermenting',fill_pct:94,brewed_on:iso(-2),ready_on:iso(16),batch:'#215',og:1.058,sg:1.040,fg_target:1.012,temp_f:67},
  {tank_code:'P1',beer_name:'Framboise',style:'Mixed fermentation · Raspberry',status:'fermenting',fill_pct:72,brewed_on:iso(-40),ready_on:iso(50),batch:'#P07',og:1.050,sg:1.006,temp_f:68,yeast:'House mixed culture',malt:'Pilsner, wheat'},
  {tank_code:'P2',status:'empty'},
  {tank_code:'BT2',beer_name:'Dark & Ominous Tones',style:'Milk Stout',status:'ready',fill_pct:66,brewed_on:iso(-26),ready_on:iso(-2),abv_target:7.5,batch:'#209',og:1.074,sg:1.020,fg_target:1.020,ibu:30,temp_f:36,yeast:'English Ale',malt:'Maris Otter, chocolate, roasted barley, lactose'},
  {tank_code:'BT3',beer_name:'Egyptian Cotton',style:'Hazy IPA',status:'ready',fill_pct:48,brewed_on:iso(-20),ready_on:iso(-4),abv_target:6.1,batch:'#211',og:1.062,sg:1.015,fg_target:1.015,ibu:35,temp_f:34,yeast:'London Ale III',hops:'Cashmere, Idaho 7, Azacca, Citra, Mosaic'},
  {tank_code:'BT4',status:'empty'},
  {tank_code:'B20',status:'empty'}
],

/* ---- Fallback events (used only if Squarespace can't be reached). Times are Pacific. ---- */
EVENTS:[
  {date:'2026-11-05',start:'19:00',end:'22:00',title:'Camellia Boutros Band & Flat SUN Society',image:'img/stage-night.jpg',tags:['Live music'],
   excerpt:'Arab experimentalism on the electric oud guitar, then six friends from Big Sur and Santa Cruz with polyrhythmic psych rock.',
   body:"Camellia Boutros is a Lebanese Palestinian multi-instrumentalist, composer and cultural worker based in San Francisco. A performer and improviser on trumpet, oud and electric bass, she developed a fretless 12-string electric guitar, the \"electric oud-guitar,\" to explore her own brand of Arab experimentalism. Her music, rooted in Arabic Maqam and the Bay Area sound, blends rock, folk, jazz, hip-hop and psychedelia and defies genre.\n\nShe has performed at Stern Grove, Yerba Buena Gardens, SF Jazz, The Independent, The New Parish, The Regency Ballroom, The Chapel and many more of the Bay Area's most beloved venues.\n\nFlat Sun Society is six friends from Big Sur and Santa Cruz carving a new niche of psychedelic rock with polyrhythms, ethereal vocals and guitar improvisation. Their songs become journeys full of momentous energy, and their audiences dance fluidly and ecstatically. flatsun.net"},
  {date:'2026-11-06',start:'19:00',end:'22:00',title:'Los Pendejos Imbeciles Band',image:'img/crowd.jpg',tags:['Live music'],
   excerpt:'Friday night, live on the Woodhouse stage.',body:'Friday night, live on the Woodhouse stage. Grab a pint, grab some friends and settle in for a night of live music.'},
  {date:'2026-11-07',start:'18:30',end:'21:30',title:'Puffball Collective',image:'img/stage.jpg',tags:['Live music'],
   excerpt:'Funky Americana dance jams with members of the Banana Slug String Band, Rosebud and Velour.',
   body:"Funky Americana dance jams, happy feet, spirit lifting revelry.\n\nThe Puffball Collective features Doug Dirt (The Banana Slug String Band, Slugs and Roses), Lachlann Kane (Rosebud, D.B. Walker, Edge of the West Band), Marc Sveen (Velour), Paul Garcia (Banana Slug String Band, Brotherhood of Freaks), Freddie Rodriguez (Rosebud, Redwood Express), David Hunt Cameron (Fat Grass Corduroy) and a collective collection of talented musical merry makers."},
  {date:'2026-11-18',start:'17:00',end:'21:00',title:'Foster Andersen Benefit',image:'img/patio-dusk.jpg',tags:['Community'],
   excerpt:'A community benefit night. Come out, raise a glass and show up for one of our own.',body:'A community benefit night at Woodhouse. Come out, raise a glass and show up for one of our own.'},
  {date:'2026-11-28',start:'19:00',end:'22:00',title:'China Cats',image:'img/stage-night.jpg',tags:['Live music','Ticketed'],
   excerpt:'The premier Grateful Dead tribute in Santa Cruz and the Bay Area, playing the Dead since 2010. $25 at the door.',
   body:"The China Cats are the premier Grateful Dead tribute band in Santa Cruz and the San Francisco Bay Area, performing the music of the Grateful Dead since 2010.\n\nMatt Hartle, lead guitar and vocals. Scott Cooper, rhythm guitar and vocals. Steve Sofranko, keyboards and vocals. Roger Sideman, bass and vocals. Michael Owens, drums.\n\nThey've shared the stage with guests including Donna Jean Godchaux, Melvin Seals and many more.\n\n$25 at the door."},
  {date:'2026-12-04',start:'19:00',end:'22:00',title:"1970's Rock Revue",image:'img/indoor.jpg',tags:['Live music'],
   excerpt:'Original arrangements of Rush, Genesis, Mahavishnu, Return to Forever and more 1970s jazz rock and prog.',
   body:"If you wish the era of 1970s jazz-rock and progressive rock never ended, this is the band for you. Joshua Cedar transcribed and charted some of the most amazing, and insanely difficult, music of the era, then found local touring and studio musicians who can play it.\n\nExpect original instrumental arrangements celebrating Rush, Genesis, Emerson, Lake and Palmer, the Dregs, Jeff Beck, Jean-Luc Ponty, Bruford, Mahavishnu Orchestra, Return to Forever, Gentle Giant, King Crimson, Jethro Tull and even a medley of progressive Led Zeppelin."},
  {date:'2026-12-06',start:'17:00',end:'20:00',title:'Horse Feathers',image:'img/patio-deck.jpg',tags:['Live music','Ticketed'],
   excerpt:'Two decades of intimate, cinematic chamber folk from the Pacific Northwest. The kind of night that makes a room go still.',
   tickets:'https://www.eventbrite.com/e/horse-feathers-tickets-1993861278758',
   body:"There are bands you listen to, and then there are bands you experience.\n\nHorse Feathers has spent nearly two decades crafting songs that are intimate, cinematic and quietly unforgettable. Rooted in the Pacific Northwest, their sound weaves together folk, chamber music and haunting harmonies into something that feels both timeless and deeply human.\n\nIf you love the kind of music that makes a room go still before the applause, this is a night you won't want to miss."}
],

/* ---- House News fallback (used only if the Squarespace blog can't be reached) ---- */
NEWS:[
  {title:"Why we're called Blending & Brewing",image:'img/pints.jpg',
   excerpt:'Blending and brewing community and positive relationships. Blending and brewing cultural backgrounds. And yes, the beer.',
   body:"For anyone who has ever asked about the name of our brewery:\n\nBlending and brewing community and positive relationships.\n\nBlending and brewing cultural backgrounds and enriching each other through them.\n\nAnd blending and brewing beer: classic technique, barrels, mixed cultures and a lot of curiosity. Every piece fits."},
  {title:'The hippest hangout in Santa Cruz',image:'img/stage.jpg',
   excerpt:'We hosted the Nexties and took home the award for the hippest hangout spot in town. It means the world to us.',
   body:"We were beyond excited to host the Nexties, and honored that Woodhouse won the award for the hippest hangout spot in Santa Cruz.\n\nThis means the world to us. We've worked tirelessly to build a place where everyone feels welcome, and the award belongs to every regular, artist, maker and friend who shows up. We even brewed a Nexties Hazy IPA for the occasion."},
  {title:'Jam Session: a band and brewery collab',image:'img/cheers.jpg',
   excerpt:'Superblume and Woodhouse brewed an IPA with the Berkeley Superbloom yeast strain and released it on show night.',
   body:"Superblume and Woodhouse teamed up on a band and brew collaboration: Jam Session IPA, brewed with the Berkeley Superbloom yeast strain and hopped with Citra and Mosaic.\n\nWe released four packs the same night the band took our stage. Music and beer, made together."}
],

/* ---- Cultural event types (Calendar ticker) ---- */
CULTURE:['Afrobeats','Reggae & Dancehall','Hip-Hop','Latin Nights','Line Dancing','Square Dancing','Grateful Dead Tributes','Jazz','Bluegrass & Americana',
  'Psych Rock','Arab Experimental','Chamber Folk','Prog & Jazz Rock','Comedy','Figure Drawing','Art Shows','Makers Markets','Cultural Festivals','Community Benefits','DJ Nights'],

/* ---- Artists and series we have hosted (Calendar page wall). Add freely. ---- */
ARTISTS:[
  'KRS-One','Devin The Dude','Horse Feathers','China Cats','Slow Gherkin','MU330','Honor System','Shinobu',
  'A Tribute to Sly & The Family Stone','Natalie Cressman','Camellia Boutros','Flat Sun Society','Puffball Collective',
  'BLVK H3RO & The 3Peat Band','Selecta 7','Kava Jah & The Remedy','Afrobeats Nite with DJ Monk Earl','Bongo Sidibe',
  'Clan Dyken','The Jamissaries','Anthony Arya','Superblume','Velour','Grateful Dads','Free Elements','Free to Be',
  'SOLCIRCLE','Mick Adams','Brian Fitzgerald Jazz Trio','Casanostra','Edge of the West','Lemongrass ft. Taylor Rae',
  'Tokyo Hot Tub','DizzAster','Marli Moves','Novolunie','Los Pendejos Imbeciles','1970s Rock Revue','Rudi B',
  'Santa Cruz Comedy Festival','Surf City Line Dancing','Santa Cruz Square Dance','BeTV Presents','Mi Gente Fest','The Nexties'
]
};
})();
