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

/* ---- Visit page: partners, beer trail, coffee, music. Each opens a pop-up.
   n name, a address (city added when it is not Santa Cruz), area, kind, s short line, about longer text, url optional ---- */
PLACES:{
 partners:[
  {n:'Flower Bar Design Studio',a:'511 River St',area:'River St · By appointment',kind:'Florals',s:'Handcrafted florals, wreaths and event design.',about:'Led by Sharon, with more than 20 years of floral design behind her. Handcrafted flowers, wreaths, plant arrangements and subscriptions, plus florals for weddings, corporate events and remembrance services. Same day delivery when you order by noon. Studio visits by appointment.',url:'https://flowerbardesignstudio.com'},
  {n:'The Haus of Botanica',a:'',area:'Santa Cruz Mountains',kind:'Hair & beauty',s:'Tara Murphy\'s hair studio: color, balayage, bridal styling and scalp health.',about:'The hair studio of Tara Murphy, up in the Santa Cruz mountains. Tara does transformative hair care: balayage, highlights, all over color, glazes and toners, blowouts, bridal and updo styling and braids, with Olaplex and K18 treatments. She also offers scalp health consultations and hair loss treatments, plus tooth gems. Book with Tara through her site.',url:'https://www.thehausofbotanica.com/hair',ig:'https://www.instagram.com/thehausofbotanica/'},
  {n:'Yayah Designs',a:'',area:'Santa Cruz',kind:'Design',s:'Design by Yayah.',about:'A Santa Cruz designer and longtime Woodhouse collaborator. See the work at yayahdesigns.com.',url:'https://yayahdesigns.com',ig:'https://www.instagram.com/yayahdesigns/'},
  {n:'Gut Designs',a:'511 River St',area:'River St',kind:'Design',s:'Branding, painting, illustration and product design.',about:'A design studio working across branding, painting, illustration, product design and publishing.',url:'https://www.gutdesigns.com',ig:'https://www.instagram.com/gutdesigns/'},
  {n:'Imprint Productions',a:'511 River St',area:'River St',kind:'Records & apparel',s:'Hip-hop record releases, production, apparel and accessories.',about:'DJ Kraeon\'s company, rooted in hip-hop. Imprint Productions puts out record releases for hip-hop artists and offers music production, plus apparel and accessories for artists, crews and brands who want their name on something real.',ig:'https://www.instagram.com/djkraeon/'},
  {n:'Living Swell Kombucha',a:'',area:'Santa Cruz',kind:'Kombucha',s:'Farm to bottle kombucha, brewed in small batches.',about:'Small batch kombucha started in 2021 by Santa Cruz moms Sophie Slosberg and Summer Torrez. It is 100% kombucha, made with local, organic fruit and herbs, and you will find it at local farmers markets and on tap around town.',url:'https://livingswellkombucha.com'}
 ],
 beer:[
  {g:'In Santa Cruz',items:[
   {n:'Humble Sea Brewing Co.',a:'820 Swift St',area:'Westside',s:'Hazy IPAs, lagers and a beer garden',about:'One of the best known names in California craft beer, with a big Westside taproom and garden, hazy IPAs, crisp lagers and a long list of collaborations.'},
   {n:'Santa Cruz Mountain Brewing',a:'402 Ingalls St, Suite 27',area:'Westside',s:'Organic, local ingredients, big patio',about:'A Westside original known for organic beers made with local ingredients, in the Ingalls Street food and drink courtyard.'},
   {n:'Private Press Brewing',a:'334 C Ingalls St',area:'Westside',s:'Barrel aged, strong and dark',about:'Small, serious and barrel focused: imperial stouts, barleywines and blends worth sipping slowly.'},
   {n:'Shanty Shack Brewing',a:'138 Fern St',area:'Harvey West',s:'IPAs, sours, live music',about:'A neighborhood brewery just up the road from us in Harvey West, pouring IPAs and sours with live music on the calendar.'},
   {n:'Sante Adairius Rustic Ales',a:'1315 Water St',area:'Eastside',s:'Rustic farmhouse ales and pizza',about:'The Santa Cruz outpost of one of the country\'s most respected farmhouse and saison breweries.'},
   {n:'Gilman Brewing',a:'817 Soquel Ave',area:'Midtown',s:'Award winning IPAs, in Midtown',about:'A Berkeley born brewery with more than 30 competition medals, now pouring in Midtown Santa Cruz on Soquel Avenue.'},
   {n:'Beer Run',a:'Soquel Ave',area:'Midtown · Coming soon',s:'Beer garden and bottle shop, coming to Midtown',about:'The sibling of Beer Thirty and Beer Mule, coming to Midtown on Soquel Avenue: a beer garden and bottle shop with dozens of drafts and craft hot dogs.'},
   {n:'Lúpulo Craft Beer House',a:'233 Cathcart St',area:'Downtown',s:'Rotating taps from everywhere',about:'Downtown\'s craft beer house, with a rotating draft list and food.'},
   {n:'Balefire Brewing',a:'2-1517 East Cliff Dr',area:'Live Oak',s:'IPAs and English ales',about:'A small brewery near the harbor in Live Oak.'}
  ]},
  {g:'Mid county',items:[
   {n:'Sante Adairius Rustic Ales',a:'103 Kennedy Dr, Capitola',area:'Capitola',s:'The original brewery and tasting rooms',about:'Where Sante Adairius started, with tasting rooms for their farmhouse ales and barrel projects.'},
   {n:'Discretion Brewing',a:'2703 41st Ave, Soquel',area:'Soquel',s:'Hop forward beers and a full kitchen',about:'A Soquel brewpub with a full kitchen and a wide range of beers.'},
   {n:'Beer Thirty',a:'2504 S Main St, Soquel',area:'Soquel',s:'Bottle shop and pour house',about:'A bottle shop and pour house with a big rotating tap list and a garden.'},
   {n:'Other Brother Beer Co. Taproom',a:'10 Parade St, Suite B, Aptos',area:'Aptos Village',s:'Seaside\'s Other Brother, now in Aptos',about:'The Aptos Village taproom of Seaside\'s award winning Other Brother Beer Co., with 22 taps and a short menu of sandwiches and shareable plates.'}
  ]},
  {g:'North county',items:[
   {n:'Steel Bonnet Brewing',a:'20 Victor Square, Scotts Valley',area:'Scotts Valley',s:'British and American ales, pub style',about:'A pub style brewery in Scotts Valley pouring British and American ales.'},
   {n:'Laughing Monk Brewing',a:'262 Mount Hermon Rd, Scotts Valley',area:'Scotts Valley',s:'Brewery and gastropub',about:'A big Scotts Valley brewery and gastropub with indoor and outdoor space and a long bar.'}
  ]},
  {g:'South county',items:[
   {n:'Buena Vista Brewing Co.',a:'65 Hangar Way, Watsonville',area:'Watsonville',s:'Family owned, Latin culture meets craft beer',about:'A family owned brewery and taproom that grew out of weekly recipe nights with family and friends. Their dream, in their words: uniting Latin culture and craft beer.'},
   {n:'Corralitos Brewing Co.',a:'2536 Freedom Blvd, Watsonville',area:'Watsonville',s:'In a former apple packing shed',about:'A brewery in an old apple packing shed in the farmland outside Watsonville.'},
   {n:'Fruition Brewing',a:'918 E Lake Ave, Watsonville',area:'Watsonville',s:'Lagers, sours and barrel aged beer',about:'A Watsonville brewery known for fruit forward sours, lagers and barrel aged beer.'},
   {n:'Beer Mule',a:'45 Aviation Way, Watsonville',area:'Watsonville',s:'Bottle shop, pour house and kitchen',about:'A craft beer bar with rotating beers and ciders on tap, a bottle shop and a kitchen.'}
  ]}
 ],
 coffee:[
  {n:'Mariposa Coffee Bar',a:'1010 Pacific Ave',area:'Downtown',s:'Cuban and Vietnamese coffee, all vegetarian',about:'Founded by Chelsea and Tram, drawing on their Cuban and Vietnamese roots, with an all vegetarian menu and a slow, communal vibe.'},
  {n:'Junkhead Vintage',a:'Portola Dr',area:'Pleasure Point',s:'Coffee and vintage clothing',about:'Coffee and vintage clothing under one roof.'},
  {n:'Cafe Delmarette',a:'1126 Pacific Ave',area:'Downtown',s:'House roasted coffee and a from scratch deli',about:'A downtown café and deli that roasts its own coffee and makes its scones, sandwiches, salads and sweets in house with local ingredients.'},
  {n:'Coffee Conspiracy Co.',a:'1855 41st Ave, Capitola',area:'Capitola',s:'Roasts its own, questions everything',about:'A roaster with rotating single origins, organic house made syrups and contrarian branding. They also run coffee backstage for big name tours.'},
  {n:'Alta Organic Coffee',a:'2712 Mission St Ext',area:'Westside',s:'The county\'s certified organic roaster, since 1987',about:'Founded by Patti Spooner in 1987 and now run by the next generation, Alta is the only certified organic coffee company in the county. Dark and medium roasts from a vintage air roaster, at a Westside café across from the Wrigley Building.'},
  {n:'Verve Coffee Roasters',a:'1540 Pacific Ave',area:'Downtown',s:'Santa Cruz born roaster, light filled café',about:'The Santa Cruz roaster that went worldwide, with a big, bright café in the heart of downtown.'},
  {n:'11th Hour Coffee',a:'402 Ingalls St',area:'Westside',s:'Coffee and tea house, community nights',about:'A Westside coffee and tea house on Ingalls Street that hosts evening community events and seasonal drinks.'},
  {n:'Cat & Cloud Coffee',a:'3600 Portola Dr',area:'Pleasure Point',s:'Creative local roaster',about:'A local roaster with an artsy streak, known for its mocha and breakfast burrito.'},
  {n:'Lulu Carpenter\'s',a:'1545 Pacific Ave',area:'Downtown',s:'A downtown classic',about:'A longtime downtown coffeehouse on Pacific Avenue.'}
 ],
 music:[
  {n:'The Catalyst',a:'1011 Pacific Ave',area:'Downtown',kind:'Club',s:'Touring and local acts in every genre',about:'The classic Santa Cruz club, with touring and local acts in every genre.'},
  {n:'Moe\'s Alley',a:'1535 Commercial Way',area:'Eastside',kind:'Club',s:'Blues, roots, reggae, funk and more',about:'A beloved Eastside club for blues, roots, reggae, funk and more.'},
  {n:'Kuumbwa Jazz Center',a:'320 Cedar St',area:'Downtown',kind:'Jazz',s:'A nationally respected jazz room',about:'A nationally respected jazz room downtown.'},
  {n:'Rio Theatre',a:'1205 Soquel Ave',area:'Midtown',kind:'Theater',s:'Concerts and films',about:'A restored single screen theater hosting concerts and films.'},
  {n:'The Crepe Place',a:'1134 Soquel Ave',area:'Midtown',kind:'Room',s:'Small, loud and loved',about:'A small, loud and much loved music room.'},
  {n:'The Hotel',a:'1003 Cedar St',area:'Downtown',kind:'Bar',s:'Music and DJs downtown, formerly the Red Room',about:'The downtown bar long known as the Red Room, now called the Hotel, with music and DJs.'},
  {n:'Santa Cruz Civic Auditorium',a:'307 Church St',area:'Downtown',kind:'Hall',s:'The big downtown stage',about:'The big downtown stage for touring headliners.'},
  {n:'Felton Music Hall',a:'6275 Hwy 9, Felton',area:'Felton',kind:'Hall',s:'Up in the redwoods',about:'A music hall up in the redwoods, worth the drive.'}
 ]
},

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
/* which group a drink belongs in, whatever Square's category says (lowercase name: group key) */
TAP_GROUP_FIX:{'slippery slope':'house','black lager':'guest'},
TAPS_SNAPSHOT:{updated:'2026-11-05',groups:[
  {key:'house',label:'Woodhouse Beer',items:[
    {name:'Egyptian Cotton',desc:'Hazy IPA · 6.1% ABV · Cashmere, Idaho 7, Azacca, Citra, Mosaic',abv:6.1,style:'Hazy IPA',color:'#12BF94',sizes:[['Pint (16oz)',900],['Tulip (12oz)',700],['Taster (5oz)',300],['Crowler (32oz)',1700]]},
    {name:'Better Late',desc:'',style:'House beer',color:'#FFBF00',sizes:[['Pint (16oz)',800],['Tulip (12oz)',600],['Taster (5oz)',300],['4 Pack',2500]]},
    {name:'Herringbone',desc:'Pale Ale · 5.8% ABV · Mosaic, Simcoe, Citra',abv:5.8,style:'Pale Ale',color:'#2693FF',sizes:[['Pint (16oz)',900],['Tulip (12oz)',600],['Taster (5oz)',300]]},
    {name:'Dark & Ominous Tones',desc:'Milk Stout · 7.5% ABV',abv:7.5,style:'Milk Stout',color:'#593C00',sizes:[['Pint (16oz)',700],['Tulip (12oz)',600],['Taster (5oz)',300],['Crowler (32oz)',1200]]},
    {name:'Framboise',desc:'',style:'Raspberry',color:'#990838',sizes:[['Tulip (12oz)',800],['Taster (5oz)',400],['Bottle',1500]]}
  ]},
  {key:'guest',label:'Guest Taps',items:[
    {name:'Slippery Slope',desc:'',style:'House beer',color:'#12BF94',sizes:[['Pint (16oz)',900]]},
    {name:'Black Lager',desc:'',style:'Guest beer',color:'#2b1a10',sizes:[['Pint (16oz)',900]]}
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
  /* brewhouse (on the platform) */
  {code:'HLT',kind:'hlt',bbl:10,x:-250,z:40,label:'Hot liquor'},
  {code:'MLT',kind:'mlt',bbl:10,x:-268,z:-20,label:'Mash / lauter'},
  {code:'BK',kind:'bk',bbl:10,x:-205,z:-58,label:'Kettle / whirlpool'},
  /* fermenters */
  {code:'FV1',kind:'fv',bbl:10,x:-10,z:-190},
  {code:'FV2',kind:'fv',bbl:10,x:30,z:-148},
  {code:'FV3',kind:'fv',bbl:10,x:72,z:-106},
  {code:'FV4',kind:'fv',bbl:20,x:138,z:-40},
  {code:'FV5',kind:'fv',bbl:2,x:-60,z:196},
  {code:'FV6',kind:'fv',bbl:2,x:0,z:178},
  /* brites */
  {code:'BT1',kind:'bt',bbl:20,x:-40,z:20},
  {code:'BT2',kind:'bt',bbl:7,x:-150,z:86},
  {code:'BT3',kind:'bt',bbl:7,x:-120,z:120},
  {code:'BT4',kind:'bt',bbl:7,x:-90,z:154},
  /* barrels: 12 in two racks, two high */
  {code:'B1',kind:'barrel',bbl:1.9,rack:0,slot:0},{code:'B2',kind:'barrel',bbl:1.9,rack:0,slot:1},{code:'B3',kind:'barrel',bbl:1.9,rack:0,slot:2},
  {code:'B4',kind:'barrel',bbl:1.9,rack:0,slot:3},{code:'B5',kind:'barrel',bbl:1.9,rack:0,slot:4},{code:'B6',kind:'barrel',bbl:1.9,rack:0,slot:5},
  {code:'B7',kind:'barrel',bbl:1.9,rack:1,slot:0},{code:'B8',kind:'barrel',bbl:1.9,rack:1,slot:1},{code:'B9',kind:'barrel',bbl:1.9,rack:1,slot:2},
  {code:'B10',kind:'barrel',bbl:1.9,rack:1,slot:3},{code:'B11',kind:'barrel',bbl:1.9,rack:1,slot:4},{code:'B12',kind:'barrel',bbl:1.9,rack:1,slot:5}
],
/* Preview only. Live data comes from the brewing app (see cellar-setup.sql).
   status: brewing | fermenting | conditioning | cold_crash | carbonating | ready | serving | aging | empty */
CELLAR_PREVIEW:[
  {tank_code:'HLT',status:'empty'},{tank_code:'MLT',status:'empty'},{tank_code:'BK',status:'empty'},
  {tank_code:'FV1',beer_name:'West Coast IPA',style:'West Coast IPA',status:'fermenting',volume_bbl:9.6,batch:'3',day:4,og:1.064,sg:1.030,fg_target:1.010,yeast:'Chico',ready_on:iso(12),readings:[[iso(-4),1.064],[iso(-3),1.055],[iso(-2),1.044],[iso(-1),1.036],[iso(0),1.030]]},
  {tank_code:'FV2',beer_name:'Egyptian Cotton',style:'Hazy IPA',status:'conditioning',volume_bbl:9.4,batch:'2',day:13,og:1.062,sg:1.015,fg_target:1.015,yeast:'London Ale III',ready_on:iso(2),readings:[[iso(-13),1.062],[iso(-11),1.040],[iso(-9),1.022],[iso(-6),1.016],[iso(0),1.015]]},
  {tank_code:'FV3',beer_name:'West Coast IPA',style:'West Coast IPA',status:'cold_crash',volume_bbl:9.5,batch:'4',day:15,og:1.064,sg:1.011,fg_target:1.010,yeast:'Chico',ready_on:iso(3),readings:[[iso(-15),1.064],[iso(-12),1.034],[iso(-8),1.014],[iso(0),1.011]]},
  {tank_code:'FV4',beer_name:'Pilsner',style:'German Pils',status:'fermenting',volume_bbl:13,batch:'1',day:6,og:1.047,sg:1.047,fg_target:1.010,yeast:'34/70',ready_on:'',readings:[[iso(-6),1.047]]},
  {tank_code:'FV5',status:'empty'},
  {tank_code:'FV6',beer_name:'Kir Royale',style:'Mixed fermentation',status:'aging',volume_bbl:1.4,batch:'P7',day:40,og:1.050,sg:1.004,yeast:'House culture'},
  {tank_code:'BT1',status:'empty'},
  {tank_code:'BT2',beer_name:'Still Life In Gold',style:'Golden Ale',status:'serving',volume_bbl:4.2,batch:'5'},
  {tank_code:'BT3',status:'empty',next_beer:'Radler'},
  {tank_code:'BT4',status:'empty',next_beer:'Wit'},
  {tank_code:'B1',beer_name:'Dark & Ominous Tones',style:'Barrel aged milk stout',status:'aging',volume_bbl:1.9},
  {tank_code:'B2',beer_name:'Dark & Ominous Tones',style:'Barrel aged milk stout',status:'aging',volume_bbl:1.9},
  {tank_code:'B3',beer_name:'Framboise',style:'Mixed fermentation · raspberry',status:'aging',volume_bbl:1.9},
  {tank_code:'B4',beer_name:'Framboise',style:'Mixed fermentation · raspberry',status:'aging',volume_bbl:1.9},
  {tank_code:'B7',beer_name:'Persistence',style:'Mixed fermentation',status:'aging',volume_bbl:1.9}
],

/* ---- Fallback events (used only if Squarespace can't be reached). Times are Pacific. ---- */
/* Ticket links you want to force on an event (title must match). Squarespace "Tickets" links are picked up automatically. */
TICKETS:{
  'Foster Andersen Benefit':'https://www.eventbrite.com/e/benefit-for-foster-anderson-the-executive-director-of-shared-adventures-tickets-2003041624419',
  'Horse Feathers':'https://www.eventbrite.com/e/horse-feathers-tickets-1993861278758'
},
EVENTS:[
  {date:'2026-11-05',start:'19:00',end:'22:00',title:'Camellia Boutros Band & Flat SUN Society',tags:['Live music'],
   excerpt:'Arab experimentalism on the electric oud guitar, then six friends from Big Sur and Santa Cruz with polyrhythmic psych rock.',
   body:"Camellia Boutros is a Lebanese Palestinian multi-instrumentalist, composer and cultural worker based in San Francisco. A performer and improviser on trumpet, oud and electric bass, she developed a fretless 12-string electric guitar, the \"electric oud-guitar,\" to explore her own brand of Arab experimentalism. Her music, rooted in Arabic Maqam and the Bay Area sound, blends rock, folk, jazz, hip-hop and psychedelia and defies genre.\n\nShe has performed at Stern Grove, Yerba Buena Gardens, SF Jazz, The Independent, The New Parish, The Regency Ballroom, The Chapel and many more of the Bay Area's most beloved venues.\n\nFlat Sun Society is six friends from Big Sur and Santa Cruz carving a new niche of psychedelic rock with polyrhythms, ethereal vocals and guitar improvisation. Their songs become journeys full of momentous energy, and their audiences dance fluidly and ecstatically. flatsun.net"},
  {date:'2026-11-06',start:'19:00',end:'22:00',title:'Los Pendejos Imbeciles Band',tags:['Live music'],
   excerpt:'Friday night, live on the Woodhouse stage.',body:'Friday night, live on the Woodhouse stage. Grab a pint, grab some friends and settle in for a night of live music.'},
  {date:'2026-11-07',start:'18:30',end:'21:30',title:'Puffball Collective',tags:['Live music'],
   excerpt:'Funky Americana dance jams with members of the Banana Slug String Band, Rosebud and Velour.',
   body:"Funky Americana dance jams, happy feet, spirit lifting revelry.\n\nThe Puffball Collective features Doug Dirt (The Banana Slug String Band, Slugs and Roses), Lachlann Kane (Rosebud, D.B. Walker, Edge of the West Band), Marc Sveen (Velour), Paul Garcia (Banana Slug String Band, Brotherhood of Freaks), Freddie Rodriguez (Rosebud, Redwood Express), David Hunt Cameron (Fat Grass Corduroy) and a collective collection of talented musical merry makers."},
  {date:'2026-11-18',start:'17:00',end:'21:00',title:'Foster Andersen Benefit',tags:['Community'],
   excerpt:'A community benefit night. Come out, raise a glass and show up for one of our own.',body:'A community benefit night at Woodhouse. Come out, raise a glass and show up for one of our own.'},
  {date:'2026-11-28',start:'19:00',end:'22:00',title:'China Cats',tags:['Live music','Ticketed'],
   excerpt:'The premier Grateful Dead tribute in Santa Cruz and the Bay Area, playing the Dead since 2010. $25 at the door.',
   body:"The China Cats are the premier Grateful Dead tribute band in Santa Cruz and the San Francisco Bay Area, performing the music of the Grateful Dead since 2010.\n\nMatt Hartle, lead guitar and vocals. Scott Cooper, rhythm guitar and vocals. Steve Sofranko, keyboards and vocals. Roger Sideman, bass and vocals. Michael Owens, drums.\n\nThey've shared the stage with guests including Donna Jean Godchaux, Melvin Seals and many more.\n\n$25 at the door."},
  {date:'2026-12-04',start:'19:00',end:'22:00',title:"1970's Rock Revue",tags:['Live music'],
   excerpt:'Original arrangements of Rush, Genesis, Mahavishnu, Return to Forever and more 1970s jazz rock and prog.',
   body:"If you wish the era of 1970s jazz-rock and progressive rock never ended, this is the band for you. Joshua Cedar transcribed and charted some of the most amazing, and insanely difficult, music of the era, then found local touring and studio musicians who can play it.\n\nExpect original instrumental arrangements celebrating Rush, Genesis, Emerson, Lake and Palmer, the Dregs, Jeff Beck, Jean-Luc Ponty, Bruford, Mahavishnu Orchestra, Return to Forever, Gentle Giant, King Crimson, Jethro Tull and even a medley of progressive Led Zeppelin."},
  {date:'2026-12-06',start:'17:00',end:'20:00',title:'Horse Feathers',tags:['Live music','Ticketed'],
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
