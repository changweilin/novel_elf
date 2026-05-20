// Expanded seed data: places, regions, eras, events, characters w/ snapshots,
// organizations w/ snapshots, countries w/ snapshots, and relationships.
// Snapshot format: { year, location:{x,y,name} OR territory:"x,y x,y...", leader?, members?, status?, body }
// at year Y, entity state = latest snapshot with snap.year <= Y.

window.WORLD_SEED = {
  name: "Aevenmere",
  subtitle: "An Atlas of the Sundered Reach",

  regions: [
    { id: "vael",   name: "Vaelora",            polygon: "180,120 320,90 410,150 380,260 250,290 160,230", hue: 142, cap: { x: 280, y: 200, name: "Cael Vaer" }, blurb: "Highland country of long winters and longer memory." },
    { id: "muirne", name: "Muirne Reach",       polygon: "410,150 560,140 620,250 540,340 380,260",       hue: 78,  cap: { x: 510, y: 240, name: "Olbrand" },   blurb: "Salt marshes and lantern-fishers." },
    { id: "ashen",  name: "The Ashen Wastes",   polygon: "560,140 720,170 760,290 620,250",               hue: 28,  cap: { x: 670, y: 220, name: "Coalmouth" }, blurb: "What burned here burned for a hundred years." },
    { id: "south",  name: "Therendil",          polygon: "250,290 380,260 540,340 500,460 320,470 220,400", hue: 108, cap: { x: 380, y: 400, name: "Hollow Spire" }, blurb: "Vineyards, libraries, and one poet on retainer." },
    { id: "isles",  name: "The Drowning Isles", polygon: "620,460 720,440 800,510 740,580 640,560",       hue: 200, cap: { x: 700, y: 510, name: "Brackhold" }, blurb: "Three hundred islands at high tide, eleven at low." },
    { id: "north",  name: "Korr Eithun",        polygon: "60,80 180,60 320,90 180,120 100,180",           hue: 220, cap: { x: 170, y: 110, name: "Vethgar" },  blurb: "The Frost-Kindred. They do not name the dead." },
    { id: "east",   name: "Sehrigad",           polygon: "720,170 880,200 900,360 760,290",               hue: 50,  cap: { x: 820, y: 280, name: "Khorvad" },  blurb: "Caravan princes. Every coin has been bitten." }
  ],
  rivers: [
    { id: "r1", path: "M 250,90 Q 280,180 320,250 T 380,400 T 360,470" },
    { id: "r2", path: "M 560,140 Q 540,220 540,340 T 640,460" },
    { id: "r3", path: "M 760,290 Q 740,360 720,440" }
  ],
  mountains: [
    { x: 130, y: 130 }, { x: 155, y: 120 }, { x: 180, y: 135 }, { x: 210, y: 125 },
    { x: 580, y: 180 }, { x: 615, y: 195 }, { x: 650, y: 175 }, { x: 690, y: 200 }, { x: 725, y: 215 },
    { x: 820, y: 230 }, { x: 845, y: 250 }, { x: 870, y: 235 }
  ],
  forests: [
    { x: 290, y: 320 }, { x: 320, y: 340 }, { x: 350, y: 320 }, { x: 380, y: 350 },
    { x: 280, y: 380 }, { x: 310, y: 400 }, { x: 340, y: 380 },
    { x: 460, y: 200 }, { x: 490, y: 215 }, { x: 460, y: 230 }
  ],
  ruins: [
    { x: 620, y: 215, name: "Old Coalmouth" },
    { x: 230, y: 450, name: "The Sunken Choir" },
    { x: 720, y: 510, name: "Tideglass" }
  ],

  // Named places — used so AI/users can pin characters & events without inventing coords.
  places: [
    { id: "pl_caelvaer",   name: "Cael Vaer",      x: 280, y: 200 },
    { id: "pl_olbrand",    name: "Olbrand",        x: 510, y: 240 },
    { id: "pl_coalmouth",  name: "Coalmouth",      x: 670, y: 220 },
    { id: "pl_hollow",     name: "Hollow Spire",   x: 380, y: 400 },
    { id: "pl_brackhold",  name: "Brackhold",      x: 700, y: 510 },
    { id: "pl_vethgar",    name: "Vethgar",        x: 170, y: 110 },
    { id: "pl_khorvad",    name: "Khorvad",        x: 820, y: 280 },
    { id: "pl_oldcoal",    name: "Old Coalmouth",  x: 620, y: 215 },
    { id: "pl_choir",      name: "The Sunken Choir", x: 230, y: 450 },
    { id: "pl_tideglass",  name: "Tideglass",      x: 720, y: 510 }
  ],

  eras: [
    { id: "myth",   name: "The Mythic Age",     start: -10000, end: -2000, compressed: 0.45, accent: "#7a4a9c", blurb: "Before written tongue. The Three Walkers. The First Sundering." },
    { id: "kindle", name: "The Kindling",       start: -2000,  end: -400,  compressed: 0.70, accent: "#c08840", blurb: "Cities rise. Iron is found, lost, found again." },
    { id: "kings",  name: "Age of Kings",       start: -400,   end:  600,  compressed: 1.00, accent: "#c89859", blurb: "Borders harden. Songs become law." },
    { id: "long",   name: "The Long Quiet",     start:  600,   end:  1100, compressed: 0.85, accent: "#6b8a7a", blurb: "Plague, then plenty. The libraries swell." },
    { id: "fire",   name: "The Burning Years",  start:  1100,  end:  1180, compressed: 1.40, accent: "#a8362f", blurb: "Eighty years that broke a thousand." },
    { id: "now",    name: "Present Reckoning",  start:  1180,  end:  1212, compressed: 1.60, accent: "#d6b07a", blurb: "Now. Or thereabouts." }
  ],

  // Discrete events ─ year, location, participants
  events: [
    { id: "ev_sunder",  year: -8200, title: "The First Sundering",      body: "The continent splits along a seam no one remembers carving.", placeId: null,           participants: [] },
    { id: "ev_walkers", year: -3100, title: "The Three Walkers depart", body: "They leave behind only their footprints, which are still walked.", placeId: "pl_vethgar", participants: [] },
    { id: "ev_olbrand", year: -1450, title: "Olbrand founded",          body: "On a sandbar that has since moved twice.",                       placeId: "pl_olbrand", participants: ["co_muir"] },
    { id: "ev_iron",    year:  -210, title: "The Iron Argument",        body: "Three smiths, two forges, one anvil. The argument is still ongoing.", placeId: "pl_caelvaer", participants: ["co_vael"] },
    { id: "ev_crown",   year:    88, title: "Coronation at Cael Vaer",  body: "First named monarch of Vaelora. The crown does not fit her.",     placeId: "pl_caelvaer", participants: ["co_vael"] },
    { id: "ev_spire",   year:   340, title: "Hollow Spire opens",       body: "A library disguised as a court, or the other way around.",       placeId: "pl_hollow",   participants: ["co_ther", "or_orac"] },
    { id: "ev_lantern", year:   720, title: "The Lantern Concordat",    body: "Muirne and Therendil agree on nothing, in writing.",             placeId: "pl_olbrand",  participants: ["co_muir","co_ther"] },
    { id: "ev_burn",    year:  1102, title: "Coalmouth burns",          body: "The fire that names the Wastes. The Ember Hand is blamed.",       placeId: "pl_coalmouth", participants: ["or_ember"] },
    { id: "ev_lastfire",year:  1178, title: "The Last Burning Year",    body: "The fires stop. No one is sure why. Several claim credit.",      placeId: "pl_coalmouth", participants: ["or_ember","or_orac"] },
    { id: "ev_arrival", year:  1209, title: "A stranger arrives at Brackhold", body: "She carries a map of the Reach as it was before the Sundering.", placeId: "pl_brackhold", participants: ["ch_cart","ch_miorra"] }
  ],

  // Countries — political entities with shifting borders, capitals, leaders.
  countries: [
    {
      id: "co_vael", name: "Vaelora", accent: "#3b7a4d", founded: -350, dissolved: null,
      snapshots: [
        { year: -350, capital: { x: 280, y: 200, name: "Cael Vaer" }, leader: "Aelda the First-Crowned", body: "A loose alliance of nine highland keeps swears one oath at Cael Vaer.",
          territory: "200,140 320,110 380,160 350,240 240,260 180,210" },
        { year:   88, capital: { x: 280, y: 200, name: "Cael Vaer" }, leader: "Queen Iruna", body: "Borders set in stone. The runesmiths are made royal.",
          territory: "180,120 320,90 410,150 380,260 250,290 160,230" },
        { year: 1180, capital: { x: 280, y: 200, name: "Cael Vaer" }, leader: "Edrun Vael (regent)", body: "Diminished after the Burning. Loses the southern marches to Therendil.",
          territory: "180,120 320,90 410,150 360,240 260,280 160,230" }
      ]
    },
    {
      id: "co_muir", name: "Muirne Reach", accent: "#7a9a3a", founded: -1450, dissolved: null,
      snapshots: [
        { year: -1450, capital: { x: 510, y: 240, name: "Olbrand" }, leader: "The Lantern Council", body: "Twelve fishing-fleets sign the harbor accord.",
          territory: "440,180 560,160 600,240 520,320 420,260" },
        { year:   720, capital: { x: 510, y: 240, name: "Olbrand" }, leader: "Magisterix Veth", body: "Trade with Therendil opens the salt routes.",
          territory: "410,150 560,140 620,250 540,340 380,260" }
      ]
    },
    {
      id: "co_ther", name: "Therendil", accent: "#5a7a3a", founded: -800, dissolved: null,
      snapshots: [
        { year: -800, capital: { x: 380, y: 400, name: "Hollow Spire" }, leader: "The Vintner-Kings", body: "Six vineyards, one army, one library.",
          territory: "260,300 380,280 500,360 470,440 320,450 240,400" },
        { year:  340, capital: { x: 380, y: 400, name: "Hollow Spire" }, leader: "King Halor the Reading", body: "The Spire opens its doors and never again closes them.",
          territory: "250,290 380,260 540,340 500,460 320,470 220,400" },
        { year: 1190, capital: { x: 380, y: 400, name: "Hollow Spire" }, leader: "The Council of Leaves", body: "Annexes the southern Vaeloran marches after the fires.",
          territory: "230,270 380,250 540,340 510,470 310,480 210,410" }
      ]
    },
    {
      id: "co_seh", name: "Sehrigad", accent: "#a87a3a", founded: -200, dissolved: null,
      snapshots: [
        { year: -200, capital: { x: 820, y: 280, name: "Khorvad" }, leader: "First Caravan-Prince Daril", body: "Three caravans, one road, one toll.",
          territory: "740,200 870,210 890,330 770,310" },
        { year:  900, capital: { x: 820, y: 280, name: "Khorvad" }, leader: "Caravan-Prince Hithran VII", body: "Annexes the eastern Wastes after the fires.",
          territory: "720,170 880,200 900,360 760,290" }
      ]
    },
    {
      id: "co_korr", name: "Korr Eithun", accent: "#4a6a9c", founded: -1800, dissolved: null,
      snapshots: [
        { year: -1800, capital: { x: 170, y: 110, name: "Vethgar" }, leader: "The Frost-Kindred", body: "Older than any other crown. Will not name itself a kingdom.",
          territory: "60,80 180,60 320,90 180,120 100,180" }
      ]
    },
    {
      id: "co_ashen", name: "The Ashen Holdfast", accent: "#7a3a3a", founded: -100, dissolved: 1120,
      snapshots: [
        { year: -100, capital: { x: 670, y: 220, name: "Coalmouth" }, leader: "Iron-Marshal Berek", body: "A frontier holdfast. Mines the long coal seam.",
          territory: "560,140 720,170 760,290 620,250" },
        { year: 1100, capital: { x: 670, y: 220, name: "Coalmouth" }, leader: "Iron-Marshal Yshen", body: "On the eve of the fire. No one knows.",
          territory: "560,140 720,170 760,290 620,250" }
      ],
      dissolvedBody: "Burned to slag and rumor in 1120. The Wastes belong to no crown now."
    }
  ],

  // Organizations — guilds, orders, cabals. Have HQs, member-counts, sometimes territory.
  organizations: [
    {
      id: "or_orac", name: "The Order of the Open Leaf", accent: "#c89859", founded: 320, dissolved: null,
      snapshots: [
        { year:  320, hq: { x: 380, y: 400, name: "Hollow Spire" }, leader: "Lirien the First Reader", members: 19, body: "A scholarly order founded at the Spire. Catalogues, never edits.",
          territory: "340,380 420,380 430,420 340,420" },
        { year: 1100, hq: { x: 380, y: 400, name: "Hollow Spire" }, leader: "Magister Tovar", members: 1340, body: "Now spans the southern courts. Has read everything once.",
          territory: "260,340 470,330 500,440 290,460" }
      ]
    },
    {
      id: "or_ember", name: "The Ember Hand", accent: "#a8362f", founded: 1080, dissolved: 1180,
      snapshots: [
        { year: 1080, hq: { x: 620, y: 215, name: "Old Coalmouth" }, leader: "The Unnamed Smith", members: 47, body: "A radical sect forged in the Wastes. Holds that fire is the only honest tongue.",
          territory: "590,200 690,200 700,250 590,260" },
        { year: 1150, hq: { x: 670, y: 220, name: "Coalmouth" }, leader: "Veshra Cinder-Mouth", members: 880, body: "At its height. Controls four mining-towns.",
          territory: "560,170 740,180 760,280 580,260" }
      ],
      dissolvedBody: "Hunted to extinction by the Lantern Concord and the Order, 1178–1180."
    },
    {
      id: "or_lantern", name: "The Lantern Concord", accent: "#6a8a9a", founded: 720, dissolved: null,
      snapshots: [
        { year: 720, hq: { x: 510, y: 240, name: "Olbrand" }, leader: "Master-of-Lights Erris", members: 60, body: "A maritime guild. Lights the coast for a tithe.",
          territory: "470,210 550,210 580,290 470,290" },
        { year: 1180, hq: { x: 510, y: 240, name: "Olbrand" }, leader: "Master-of-Lights Bellan", members: 410, body: "Outlives the Burning by being useful. The coast is lit again.",
          territory: "440,200 600,200 620,330 440,330" }
      ]
    },
    {
      id: "or_tide", name: "The Tide-Counters", accent: "#4a8a9a", founded: 980, dissolved: null,
      snapshots: [
        { year:  980, hq: { x: 700, y: 510, name: "Brackhold" }, leader: "Old Threa", members: 14, body: "An order of women who write the islands down before the tide moves them.",
          territory: "640,460 800,470 800,560 640,560" }
      ]
    }
  ],

  // Characters — lifespan, regional origin, and a sequence of snapshots that trace where they were.
  characters: [
    {
      id: "ch_edrun", name: "Edrun Vael, called Half-Sky", role: "Heir-presumptive of Vaelora",
      born: 1184, died: null, originRegionId: "vael",
      snapshots: [
        { year: 1184, location: { x: 280, y: 200, name: "Cael Vaer" }, status: "Born", body: "Born in the Burning year of his sister's exile." },
        { year: 1199, location: { x: 380, y: 400, name: "Hollow Spire" }, status: "Fostered", body: "Sent south to read three languages and sleep in none." },
        { year: 1208, location: { x: 280, y: 200, name: "Cael Vaer" }, status: "Heir-regent", body: "Returns north with a raven that will not leave his shoulder." }
      ]
    },
    {
      id: "ch_miorra", name: "Miorra Tide-Counted", role: "Lantern-fisher, Olbrand",
      born: 1180, died: null, originRegionId: "muirne",
      snapshots: [
        { year: 1180, location: { x: 510, y: 240, name: "Olbrand" }, status: "Born", body: "Born owing the tide a name." },
        { year: 1208, location: { x: 510, y: 240, name: "Olbrand" }, status: "Lantern-fisher", body: "Apprenticed to the Concord at twelve. Has not yet given the tide its name." },
        { year: 1209, location: { x: 700, y: 510, name: "Brackhold" }, status: "Witness", body: "On the dock when the stranger steps ashore." }
      ]
    },
    {
      id: "ch_cart", name: "The Cartographer at Brackhold", role: "Anonymous",
      born: 1140, died: null, originRegionId: null,
      snapshots: [
        { year: 1140, location: { x: 620, y: 215, name: "Old Coalmouth" }, status: "Apprentice", body: "Apprenticed at the forge — or so the records say." },
        { year: 1178, location: { x: 670, y: 220, name: "Coalmouth" }, status: "Last witness", body: "Last named to walk out of the Wastes." },
        { year: 1209, location: { x: 700, y: 510, name: "Brackhold" }, status: "Arrival", body: "Arrives at Brackhold with a map whose ink is still wet." }
      ]
    },
    {
      id: "ch_veshra", name: "Veshra Cinder-Mouth", role: "Mistress of the Ember Hand",
      born: 1112, died: 1178, originRegionId: "ashen",
      snapshots: [
        { year: 1144, location: { x: 670, y: 220, name: "Coalmouth" }, status: "Smith", body: "Rises from the forges of Coalmouth." },
        { year: 1150, location: { x: 670, y: 220, name: "Coalmouth" }, status: "Mistress", body: "Takes the Ember Hand. Fire becomes doctrine." },
        { year: 1178, location: { x: 670, y: 220, name: "Coalmouth" }, status: "Vanished", body: "Last seen walking into a fire she herself did not light." }
      ]
    }
  ],

  // Relationships — undirected pairs with kind + optional date range. Resolved at currentYear.
  relationships: [
    { id: "rl_1", a: "co_vael", b: "co_ther", kind: "ally",    since: 88,   until: 1180, note: "Allied through the Concord; cools after the marches dispute." },
    { id: "rl_2", a: "co_vael", b: "co_ther", kind: "feud",    since: 1190, until: null, note: "Over the southern marches." },
    { id: "rl_3", a: "co_muir", b: "co_ther", kind: "trade",   since: 720,  until: null, note: "Salt and lanterns for wine and books." },
    { id: "rl_4", a: "co_seh",  b: "co_ashen", kind: "war",    since: 1100, until: 1120, note: "The Wastes war." },
    { id: "rl_5", a: "or_orac", b: "co_ther", kind: "vassal",  since: 340,  until: null, note: "The Order serves at the Spire." },
    { id: "rl_6", a: "or_ember", b: "or_orac", kind: "war",    since: 1100, until: 1180, note: "Doctrinal — and otherwise." },
    { id: "rl_7", a: "or_ember", b: "or_lantern", kind: "war", since: 1102, until: 1180, note: "After the burning of Coalmouth's lights." },
    { id: "rl_8", a: "ch_edrun", b: "ch_miorra", kind: "oath", since: 1209, until: null, note: "Sworn at Brackhold, unannounced." },
    { id: "rl_9", a: "ch_veshra", b: "or_ember", kind: "leads", since: 1150, until: 1178, note: "" },
    { id: "rl_10", a: "ch_cart", b: "ch_veshra", kind: "rival", since: 1144, until: 1178, note: "Met once in the forges. Twice in the fires." }
  ],

  // ─────────────────────────────────────────────────────────────────────
  // The Library — books, volumes, chapters, illustrations.
  // Each chapter is markdown; chapter.focusIds / eventIds / placeId tie
  // the prose into the chronicle so AI can sync changes both ways.
  // ─────────────────────────────────────────────────────────────────────
  library: {
    books: [
      {
        id: "bk_brackhold",
        title: "The Cartographer at Brackhold",
        subtitle: "A Novel of the Sundered Reach",
        author: "Drafted in the Atelier",
        accent: "#c89859",
        motif: "compass",      // cover art: compass | sigil | banner | leaf | tide
        status: "in-progress",  // outline | draft | in-progress | revising | complete
        year: 1209,
        blurb: "She arrives at Brackhold at the lowest tide of the century, carrying a map of a world that no longer is. Three witnesses; one ink not yet dry.",
        volumes: [
          {
            id: "vol_b1", title: "Volume the First", subtitle: "Of Arrivals & Maps",
            chapters: [
              {
                id: "ch_b1_1",
                title: "The Stranger at the Dock",
                year: 1209, placeId: "pl_brackhold",
                focusIds: ["ch_cart", "ch_miorra"],
                eventIds: ["ev_arrival"],
                status: "draft",
                words: 412,
                md: `# The Stranger at the Dock

*Brackhold — the Year of Arrivals, 1209*

The tide is at its lowest hour when she steps off the boat. Miorra has been counting since dawn — seventeen islands above water, the rest gone to memory and to brine. She marks the count on the slate at her hip and looks up because the boat does not belong.

![[ill_dock_arrival]]

The stranger carries a roll of vellum the colour of old butter, and ink that has not yet finished setting. There is no wind. The lanterns of the Concord lean toward her anyway, as if asking a question.

"You're new to this water," Miorra says, because someone must speak first, and the Tide-Counters taught her so.

"I am new to this *century*," the stranger replies, not looking up from her map.

> — from the Logs of the Lantern Concord, vol. iv, 1209

The map she carries is of the Reach as it **was**. Not the Reach as it is — the Reach before the Sundering, with one continent unbroken and Brackhold not yet on it. Miorra has seen a copy of this map once, in the Spire's locked stacks, when she was twelve and not yet allowed there.

She does not say so.

![[ill_old_map]]

The stranger folds the vellum once, twice, three times into a square no larger than a hand. She tucks it inside her coat the way one tucks a child to sleep. Then she looks at Miorra — really looks — and Miorra finds she has been holding her slate hard enough to leave chalk in her palm.

"Who counts the tide here?"

"I do."

"Good. I am going to need you to count something else."`,
                illustrations: [
                  { id: "ill_dock_arrival", caption: "Brackhold at low tide; the stranger disembarks.", placeholder: "wide ink wash · figure on dock · lanterns leaning", url: null },
                  { id: "ill_old_map", caption: "The map before the Sundering.", placeholder: "vellum detail · pre-Sundering coastline", url: null }
                ]
              },
              {
                id: "ch_b1_2",
                title: "What the Tide Counts Back",
                year: 1209, placeId: "pl_brackhold",
                focusIds: ["ch_miorra", "ch_cart"],
                eventIds: [],
                status: "draft",
                words: 287,
                md: `# What the Tide Counts Back

The Tide-Counters keep a ledger of every island that has ever shown its face above the brine. The ledger is older than Brackhold itself; older, Threa says, than the names anyone gives the islands.

Threa is the oldest of them. Threa was old when Miorra's mother was a girl.

"You brought a stranger to my dock," Threa says, not looking up from the ledger. The page is open to a column Miorra has never seen, in a hand she does not recognise.

"She brought herself."

![[ill_threa_ledger]]

"That is the difference, isn't it." Threa turns the page. The column continues — names, years, a counting that does not stop where the ledger should. "Sit down, child. We are going to count something the tide remembered."`,
                illustrations: [
                  { id: "ill_threa_ledger", caption: "The ledger of the Tide-Counters.", placeholder: "open book · weathered hand turning page", url: null }
                ]
              },
              {
                id: "ch_b1_3",
                title: "The Map's Seventh Fold",
                year: 1209, placeId: "pl_brackhold",
                focusIds: ["ch_cart"],
                eventIds: [],
                status: "outline",
                words: 0,
                md: `# The Map's Seventh Fold

*[outline]*

- The stranger unfolds her map for Miorra. Each crease shows a different epoch.
- The seventh fold is blank — for what has not happened yet.
- Threa recognises a name on the map: the Sunken Choir, *as it was above water.*
- A raven arrives from Cael Vaer.

*[draft pending]*`,
                illustrations: []
              }
            ]
          },
          {
            id: "vol_b2", title: "Volume the Second", subtitle: "Of Ravens & Inheritances",
            chapters: [
              {
                id: "ch_b2_1",
                title: "The Raven That Will Not Leave",
                year: 1209, placeId: "pl_caelvaer",
                focusIds: ["ch_edrun"],
                eventIds: [],
                status: "outline",
                words: 0,
                md: `# The Raven That Will Not Leave

*[outline]*

- Edrun at Cael Vaer; the raven on his shoulder for the ninth day.
- A messenger from Brackhold; Threa's seal on the parchment.
- He recognises the cartographer's hand though they have never met.`,
                illustrations: []
              },
              {
                id: "ch_b2_2",
                title: "What the Half-Sky Inherits",
                year: 1209, placeId: "pl_caelvaer",
                focusIds: ["ch_edrun"],
                eventIds: [],
                status: "outline",
                words: 0,
                md: `# What the Half-Sky Inherits

*[outline]*

- The regent's burdens.
- A southward journey is debated.
- The raven, again.`,
                illustrations: []
              }
            ]
          }
        ]
      },
      {
        id: "bk_burning",
        title: "The Burning Years",
        subtitle: "A Chronicle of the Wastes, 1102–1180",
        author: "Compiled at Hollow Spire",
        accent: "#a8362f",
        motif: "sigil",
        status: "draft",
        year: 1180,
        blurb: "Eighty years that broke a thousand. A chronicle, in three folios, of the Ember Hand and what they unmade.",
        volumes: [
          {
            id: "vol_burn_1", title: "Folio I", subtitle: "Coalmouth Burns",
            chapters: [
              { id: "ch_burn_1_1", title: "The First Sparks", year: 1100, placeId: "pl_coalmouth",
                focusIds: ["ch_veshra"], eventIds: ["ev_burn"],
                status: "outline", words: 0,
                md: "# The First Sparks\n\n*[outline]* The forges of Coalmouth at the eve.",
                illustrations: [] }
            ]
          }
        ]
      },
      {
        id: "bk_threa",
        title: "Tide-Counter Threa",
        subtitle: "A Memoir, Salt-Stained",
        author: "Recorded by an apprentice unnamed",
        accent: "#4a8a9a",
        motif: "tide",
        status: "outline",
        year: 1205,
        blurb: "What the oldest of the Tide-Counters remembers, in the order she chooses to remember it.",
        volumes: []
      },
      {
        id: "bk_leaf",
        title: "On the Order of the Open Leaf",
        subtitle: "A Treatise on Reading without Editing",
        author: "Magister Tovar, with marginalia",
        accent: "#6b8a7a",
        motif: "leaf",
        status: "revising",
        year: 1200,
        blurb: "Catalogues, never edits. A doctrine examined.",
        volumes: []
      }
    ]
  }
};
