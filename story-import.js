(function () {
  "use strict";

  const TEMPLATE_FILE_NAME = "novel-elf-story-settings-template.md";
  const TEMPLATE_SCHEMA = "novel-elf.import-template.v1";
  const DEFAULT_ACCENTS = ["#c89859", "#5f8f7a", "#8a6fb0", "#b36a54", "#6388b6", "#9a8c42"];
  const IMPORT_FALLBACK = "en";
  const IMPORT_TEXT = {
    "zh-Hant": {
      importTitle: "Novel Elf 故事設定匯入", intro1: "空白匯入格式。填入需要的欄位，再將這個 .md 匯入為新故事。", intro2: "章節可以留白。每個區塊下方的標題會成為故事 Wiki 中的名稱。", intro3: "座標使用地圖畫布：x,y 約從 0,0 到 960,620。",
      story: "故事", name: "名稱", subtitle: "副標題", defaultYear: "預設年份", worldview: "世界觀", worldviewHint: "在這裡寫世界前提、語氣、魔法/科技規則、主題與設定限制。", outline: "故事大綱", outlineHint: "在這裡寫準備好的大綱。可使用段落或項目符號。",
      eras: "年代", eraName: "年代名稱", start: "起始", end: "結束", compression: "壓縮倍率", color: "色彩", summary: "摘要", places: "地點", placeName: "地點名稱", coordinates: "座標", description: "描述",
      countries: "國家", countryName: "國家名稱", founded: "成立", dissolved: "滅亡", capital: "首都", leader: "領袖", territory: "疆域", organizations: "組織", organizationName: "組織名稱", headquarters: "總部", members: "成員", domain: "勢力範圍",
      characters: "角色", characterName: "角色名稱", role: "定位", born: "出生", died: "死亡", origin: "出身", location: "所在地", status: "狀態", events: "事件", eventName: "事件名稱", year: "年份", participants: "參與者",
      relationships: "關係", relationshipName: "關係名稱", type: "類型", since: "起始", until: "結束", notes: "備註", untitledStory: "未命名故事", importedStorySettings: "匯入的故事設定", present: "現在", importedPresentDay: "匯入的現在時點。", importedCharacter: "匯入角色", presentStatus: "現身", importedSetting: "匯入設定集", novelElfImport: "Novel Elf 匯入", settingNotes: "設定筆記", worldBibleAndOutline: "世界設定集與大綱"
    },
    en: {
      importTitle: "Novel Elf story settings import", intro1: "Exported blank format. Fill the fields you need, then import this .md as a new story.", intro2: "You can leave sections blank. Headings under each section become names in the story wiki.", intro3: "Coordinates use the map canvas: x,y from roughly 0,0 to 960,620.",
      story: "Story", name: "Name", subtitle: "Subtitle", defaultYear: "Default year", worldview: "Worldview", worldviewHint: "Write the world premise, tone, magic/technology rules, themes, and any setting constraints here.", outline: "Story Outline", outlineHint: "Write the prepared outline here. You can use paragraphs or bullet lists.",
      eras: "Eras", eraName: "Era Name", start: "Start", end: "End", compression: "Compression", color: "Color", summary: "Summary", places: "Places", placeName: "Place Name", coordinates: "Coordinates", description: "Description",
      countries: "Countries", countryName: "Country Name", founded: "Founded", dissolved: "Dissolved", capital: "Capital", leader: "Leader", territory: "Territory", organizations: "Organizations", organizationName: "Organization Name", headquarters: "Headquarters", members: "Members", domain: "Domain",
      characters: "Characters", characterName: "Character Name", role: "Role", born: "Born", died: "Died", origin: "Origin", location: "Location", status: "Status", events: "Events", eventName: "Event Name", year: "Year", participants: "Participants",
      relationships: "Relationships", relationshipName: "Relationship Name", type: "Type", since: "Since", until: "Until", notes: "Notes", untitledStory: "Untitled Story", importedStorySettings: "Imported story settings", present: "Present", importedPresentDay: "Imported present day.", importedCharacter: "Imported character", presentStatus: "present", importedSetting: "Imported Setting", novelElfImport: "Novel Elf Import", settingNotes: "Setting Notes", worldBibleAndOutline: "World bible and outline"
    },
    ja: {
      importTitle: "Novel Elf 物語設定インポート", intro1: "空のインポート形式です。必要な欄を埋めて、この .md を新しい物語として読み込んでください。", intro2: "セクションは空欄でも構いません。各セクション下の見出しが物語 Wiki の名前になります。", intro3: "座標は地図キャンバスを使います。x,y はおよそ 0,0 から 960,620 です。",
      story: "物語", name: "名前", subtitle: "副題", defaultYear: "既定年", worldview: "世界観", worldviewHint: "世界の前提、トーン、魔法/技術ルール、テーマ、設定上の制約を書きます。", outline: "物語アウトライン", outlineHint: "準備済みのアウトラインを書きます。段落でも箇条書きでも構いません。",
      eras: "時代", eraName: "時代名", start: "開始", end: "終了", compression: "圧縮率", color: "色", summary: "要約", places: "場所", placeName: "場所名", coordinates: "座標", description: "説明",
      countries: "国", countryName: "国名", founded: "成立", dissolved: "滅亡", capital: "首都", leader: "指導者", territory: "領土", organizations: "組織", organizationName: "組織名", headquarters: "本拠地", members: "構成員", domain: "勢力圏",
      characters: "人物", characterName: "人物名", role: "役割", born: "出生", died: "死亡", origin: "出身", location: "所在地", status: "状態", events: "事件", eventName: "事件名", year: "年", participants: "参加者",
      relationships: "関係", relationshipName: "関係名", type: "種類", since: "開始", until: "終了", notes: "メモ", untitledStory: "無題の物語", importedStorySettings: "読み込んだ物語設定", present: "現在", importedPresentDay: "読み込んだ現在時点。", importedCharacter: "読み込み人物", presentStatus: "現在", importedSetting: "読み込み設定集", novelElfImport: "Novel Elf 読み込み", settingNotes: "設定メモ", worldBibleAndOutline: "世界設定集とアウトライン"
    },
    ko: {
      importTitle: "Novel Elf 이야기 설정 가져오기", intro1: "빈 가져오기 형식입니다. 필요한 필드를 채운 뒤 이 .md를 새 이야기로 가져오세요.", intro2: "섹션은 비워 둘 수 있습니다. 각 섹션 아래의 제목은 이야기 위키의 이름이 됩니다.", intro3: "좌표는 지도 캔버스를 사용합니다. x,y는 대략 0,0부터 960,620까지입니다.",
      story: "이야기", name: "이름", subtitle: "부제", defaultYear: "기본 연도", worldview: "세계관", worldviewHint: "세계의 전제, 톤, 마법/기술 규칙, 주제, 설정 제약을 여기에 적으세요.", outline: "이야기 개요", outlineHint: "준비한 개요를 여기에 적으세요. 문단이나 목록을 사용할 수 있습니다.",
      eras: "시대", eraName: "시대 이름", start: "시작", end: "끝", compression: "압축률", color: "색상", summary: "요약", places: "장소", placeName: "장소 이름", coordinates: "좌표", description: "설명",
      countries: "국가", countryName: "국가 이름", founded: "성립", dissolved: "해체", capital: "수도", leader: "지도자", territory: "영토", organizations: "조직", organizationName: "조직 이름", headquarters: "본부", members: "구성원", domain: "세력권",
      characters: "인물", characterName: "인물 이름", role: "역할", born: "출생", died: "사망", origin: "출신", location: "위치", status: "상태", events: "사건", eventName: "사건 이름", year: "연도", participants: "참여자",
      relationships: "관계", relationshipName: "관계 이름", type: "유형", since: "시작", until: "종료", notes: "비고", untitledStory: "제목 없는 이야기", importedStorySettings: "가져온 이야기 설정", present: "현재", importedPresentDay: "가져온 현재 시점.", importedCharacter: "가져온 인물", presentStatus: "현재", importedSetting: "가져온 설정집", novelElfImport: "Novel Elf 가져오기", settingNotes: "설정 노트", worldBibleAndOutline: "세계 설정집과 개요"
    },
    de: {
      importTitle: "Novel Elf Story-Einstellungen importieren", intro1: "Leeres Importformat. Fülle die benötigten Felder aus und importiere diese .md als neue Story.", intro2: "Abschnitte dürfen leer bleiben. Überschriften unter den Abschnitten werden Namen im Story-Wiki.", intro3: "Koordinaten verwenden die Kartenfläche: x,y ungefähr von 0,0 bis 960,620.",
      story: "Story", name: "Name", subtitle: "Untertitel", defaultYear: "Standardjahr", worldview: "Weltsicht", worldviewHint: "Schreibe hier Prämisse, Ton, Magie-/Technikregeln, Themen und Setting-Grenzen.", outline: "Story-Outline", outlineHint: "Schreibe hier den vorbereiteten Outline. Absätze oder Listen sind möglich.",
      eras: "Epochen", eraName: "Epochenname", start: "Start", end: "Ende", compression: "Kompression", color: "Farbe", summary: "Zusammenfassung", places: "Orte", placeName: "Ortsname", coordinates: "Koordinaten", description: "Beschreibung",
      countries: "Länder", countryName: "Ländername", founded: "Gegründet", dissolved: "Aufgelöst", capital: "Hauptstadt", leader: "Führung", territory: "Territorium", organizations: "Organisationen", organizationName: "Organisationsname", headquarters: "Hauptsitz", members: "Mitglieder", domain: "Einflussgebiet",
      characters: "Figuren", characterName: "Figurenname", role: "Rolle", born: "Geboren", died: "Gestorben", origin: "Herkunft", location: "Ort", status: "Status", events: "Ereignisse", eventName: "Ereignisname", year: "Jahr", participants: "Beteiligte",
      relationships: "Beziehungen", relationshipName: "Beziehungsname", type: "Typ", since: "Seit", until: "Bis", notes: "Notizen", untitledStory: "Unbenannte Story", importedStorySettings: "Importierte Story-Einstellungen", present: "Gegenwart", importedPresentDay: "Importierte Gegenwart.", importedCharacter: "Importierte Figur", presentStatus: "gegenwärtig", importedSetting: "Importiertes Setting", novelElfImport: "Novel Elf Import", settingNotes: "Setting-Notizen", worldBibleAndOutline: "Weltenbibel und Outline"
    },
    fr: {
      importTitle: "Import de paramètres d'histoire Novel Elf", intro1: "Format vierge exporté. Remplissez les champs utiles, puis importez ce .md comme nouvelle histoire.", intro2: "Les sections peuvent rester vides. Les titres sous chaque section deviennent des noms dans le wiki.", intro3: "Les coordonnées utilisent le canevas de carte : x,y environ de 0,0 à 960,620.",
      story: "Histoire", name: "Nom", subtitle: "Sous-titre", defaultYear: "Année par défaut", worldview: "Univers", worldviewHint: "Écrivez ici la prémisse, le ton, les règles de magie/technologie, les thèmes et contraintes.", outline: "Plan de l'histoire", outlineHint: "Écrivez ici le plan préparé. Paragraphes ou listes sont possibles.",
      eras: "Ères", eraName: "Nom de l'ère", start: "Début", end: "Fin", compression: "Compression", color: "Couleur", summary: "Résumé", places: "Lieux", placeName: "Nom du lieu", coordinates: "Coordonnées", description: "Description",
      countries: "Pays", countryName: "Nom du pays", founded: "Fondé", dissolved: "Dissous", capital: "Capitale", leader: "Dirigeant", territory: "Territoire", organizations: "Organisations", organizationName: "Nom de l'organisation", headquarters: "Siège", members: "Membres", domain: "Domaine",
      characters: "Personnages", characterName: "Nom du personnage", role: "Rôle", born: "Naissance", died: "Mort", origin: "Origine", location: "Lieu", status: "Statut", events: "Événements", eventName: "Nom de l'événement", year: "Année", participants: "Participants",
      relationships: "Relations", relationshipName: "Nom de la relation", type: "Type", since: "Depuis", until: "Jusqu'à", notes: "Notes", untitledStory: "Histoire sans titre", importedStorySettings: "Paramètres d'histoire importés", present: "Présent", importedPresentDay: "Présent importé.", importedCharacter: "Personnage importé", presentStatus: "présent", importedSetting: "Univers importé", novelElfImport: "Import Novel Elf", settingNotes: "Notes d'univers", worldBibleAndOutline: "Bible d'univers et plan"
    },
    it: {
      importTitle: "Importazione impostazioni storia Novel Elf", intro1: "Formato vuoto esportato. Compila i campi necessari e importa questo .md come nuova storia.", intro2: "Le sezioni possono restare vuote. I titoli sotto ogni sezione diventano nomi nel wiki.", intro3: "Le coordinate usano la mappa: x,y circa da 0,0 a 960,620.",
      story: "Storia", name: "Nome", subtitle: "Sottotitolo", defaultYear: "Anno predefinito", worldview: "Mondo", worldviewHint: "Scrivi qui premessa, tono, regole di magia/tecnologia, temi e vincoli.", outline: "Traccia della storia", outlineHint: "Scrivi qui la traccia preparata. Puoi usare paragrafi o elenchi.",
      eras: "Ere", eraName: "Nome era", start: "Inizio", end: "Fine", compression: "Compressione", color: "Colore", summary: "Riepilogo", places: "Luoghi", placeName: "Nome luogo", coordinates: "Coordinate", description: "Descrizione",
      countries: "Paesi", countryName: "Nome paese", founded: "Fondato", dissolved: "Sciolto", capital: "Capitale", leader: "Guida", territory: "Territorio", organizations: "Organizzazioni", organizationName: "Nome organizzazione", headquarters: "Sede", members: "Membri", domain: "Dominio",
      characters: "Personaggi", characterName: "Nome personaggio", role: "Ruolo", born: "Nascita", died: "Morte", origin: "Origine", location: "Luogo", status: "Stato", events: "Eventi", eventName: "Nome evento", year: "Anno", participants: "Partecipanti",
      relationships: "Relazioni", relationshipName: "Nome relazione", type: "Tipo", since: "Da", until: "Fino a", notes: "Note", untitledStory: "Storia senza titolo", importedStorySettings: "Impostazioni storia importate", present: "Presente", importedPresentDay: "Presente importato.", importedCharacter: "Personaggio importato", presentStatus: "presente", importedSetting: "Ambientazione importata", novelElfImport: "Import Novel Elf", settingNotes: "Note ambientazione", worldBibleAndOutline: "Bibbia del mondo e traccia"
    },
    es: {
      importTitle: "Importación de ajustes de historia Novel Elf", intro1: "Formato vacío exportado. Rellena los campos necesarios e importa este .md como nueva historia.", intro2: "Puedes dejar secciones en blanco. Los títulos bajo cada sección serán nombres en el wiki.", intro3: "Las coordenadas usan el lienzo del mapa: x,y aproximadamente de 0,0 a 960,620.",
      story: "Historia", name: "Nombre", subtitle: "Subtítulo", defaultYear: "Año predeterminado", worldview: "Mundo", worldviewHint: "Escribe aquí premisa, tono, reglas de magia/tecnología, temas y restricciones.", outline: "Esquema de la historia", outlineHint: "Escribe aquí el esquema preparado. Puedes usar párrafos o listas.",
      eras: "Eras", eraName: "Nombre de era", start: "Inicio", end: "Fin", compression: "Compresión", color: "Color", summary: "Resumen", places: "Lugares", placeName: "Nombre del lugar", coordinates: "Coordenadas", description: "Descripción",
      countries: "Países", countryName: "Nombre del país", founded: "Fundado", dissolved: "Disuelto", capital: "Capital", leader: "Líder", territory: "Territorio", organizations: "Organizaciones", organizationName: "Nombre de organización", headquarters: "Sede", members: "Miembros", domain: "Dominio",
      characters: "Personajes", characterName: "Nombre del personaje", role: "Rol", born: "Nacimiento", died: "Muerte", origin: "Origen", location: "Ubicación", status: "Estado", events: "Eventos", eventName: "Nombre del evento", year: "Año", participants: "Participantes",
      relationships: "Relaciones", relationshipName: "Nombre de relación", type: "Tipo", since: "Desde", until: "Hasta", notes: "Notas", untitledStory: "Historia sin título", importedStorySettings: "Ajustes de historia importados", present: "Presente", importedPresentDay: "Presente importado.", importedCharacter: "Personaje importado", presentStatus: "presente", importedSetting: "Ambientación importada", novelElfImport: "Importación Novel Elf", settingNotes: "Notas de ambientación", worldBibleAndOutline: "Biblia del mundo y esquema"
    }
  };

  function importLang(lang) {
    const raw = String(lang || window.AEVEN_I18N?.lang || "").trim();
    if (IMPORT_TEXT[raw]) return raw;
    const lower = raw.toLowerCase();
    if (lower === "zh" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant") return "zh-Hant";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("ko")) return "ko";
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("it")) return "it";
    if (lower.startsWith("es")) return "es";
    return IMPORT_FALLBACK;
  }

  function text(key, lang) {
    const code = importLang(lang);
    return IMPORT_TEXT[code]?.[key] || IMPORT_TEXT[IMPORT_FALLBACK][key] || key;
  }

  function aliases(key, extra = []) {
    const out = new Set([key, ...extra]);
    Object.values(IMPORT_TEXT).forEach((table) => {
      if (table[key]) out.add(table[key]);
    });
    return [...out];
  }

  function templateMarkdown(lang) {
    const t = (key) => text(key, lang);
    return `# ${t("importTitle")}

> ${t("intro1")}
> ${t("intro2")}
> ${t("intro3")}

## ${t("story")}
- ${t("name")}:
- ${t("subtitle")}:
- ${t("defaultYear")}: 0

## ${t("worldview")}

> ${t("worldviewHint")}

## ${t("outline")}

> ${t("outlineHint")}

## ${t("eras")}

### ${t("eraName")}
- ${t("start")}:
- ${t("end")}:
- ${t("compression")}:
- ${t("color")}:
- ${t("summary")}:

## ${t("places")}

### ${t("placeName")}
- ${t("coordinates")}:
- ${t("description")}:

## ${t("countries")}

### ${t("countryName")}
- ${t("founded")}:
- ${t("dissolved")}:
- ${t("capital")}:
- ${t("leader")}:
- ${t("color")}:
- ${t("territory")}:
- ${t("description")}:

## ${t("organizations")}

### ${t("organizationName")}
- ${t("founded")}:
- ${t("dissolved")}:
- ${t("headquarters")}:
- ${t("leader")}:
- ${t("members")}:
- ${t("color")}:
- ${t("domain")}:
- ${t("description")}:

## ${t("characters")}

### ${t("characterName")}
- ${t("role")}:
- ${t("born")}:
- ${t("died")}:
- ${t("origin")}:
- ${t("location")}:
- ${t("status")}:
- ${t("description")}:

## ${t("events")}

### ${t("eventName")}
- ${t("year")}:
- ${t("location")}:
- ${t("participants")}:
- ${t("description")}:

## ${t("relationships")}

### ${t("relationshipName")}
- A:
- B:
- ${t("type")}:
- ${t("since")}:
- ${t("until")}:
- ${t("notes")}:
`;
  }

  function parseStoryMarkdown(markdown, options = {}) {
    const sourceText = normalizeNewlines(markdown || "");
    const sections = splitSections(sourceText);
    const storyFields = readFields(sections.story?.content || "");
    const fileTitle = titleFromFileName(options.fileName || "");
    const title = cleanText(options.title)
      || cleanText(valueOf(storyFields, aliases("name", ["title", "story name"])))
      || firstHeading(sourceText)
      || fileTitle
      || text("untitledStory");
    const subtitle = cleanText(valueOf(storyFields, aliases("subtitle", ["tagline"])))
      || cleanText(firstBodyLine(sections.worldview?.content || sections.outline?.content || ""))
      || text("importedStorySettings");
    const defaultYear = toNumber(valueOf(storyFields, [...aliases("defaultYear", ["defaultYear", "default year", "currentYear", "current year"]), ...aliases("year")]), 0);

    const world = {
      schema: TEMPLATE_SCHEMA,
      storyId: slugify(title, "story"),
      name: title,
      subtitle,
      defaultYear,
      worldview: noteBody(sections.worldview?.content || ""),
      outline: noteBody(sections.outline?.content || ""),
      regions: [],
      rivers: [],
      mountains: [],
      forests: [],
      ruins: [],
      places: [],
      eras: [],
      events: [],
      countries: [],
      organizations: [],
      characters: [],
      relationships: [],
      library: { books: [] }
    };

    const placeBook = new Map();
    const addPlace = (name, data = {}) => {
      const cleanName = cleanText(name);
      if (!cleanName || isBlankPlaceholder(cleanName)) return null;
      const key = normalizeName(cleanName);
      const existing = placeBook.get(key);
      if (existing) {
        if (data.x != null) existing.x = data.x;
        if (data.y != null) existing.y = data.y;
        if (data.body && !existing.body) existing.body = data.body;
        return existing;
      }
      const point = data.x != null && data.y != null ? { x: data.x, y: data.y } : autoPoint(placeBook.size);
      const place = {
        id: uniqueId(world.places, "pl", cleanName),
        name: cleanName,
        x: point.x,
        y: point.y
      };
      if (data.body) place.body = data.body;
      world.places.push(place);
      placeBook.set(key, place);
      return place;
    };

    for (const block of itemBlocks(sections.places?.content || "")) {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("description", ["body", "blurb"]))) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) continue;
      const point = parsePoint(valueOf(fields, aliases("coordinates", ["coords", "coordinate", "xy", "位置"])));
      addPlace(name, { ...point, body });
    }

    world.eras = itemBlocks(sections.eras?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("summary", ["blurb", "body", "description"]))) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      return stripEmpty({
        id: uniqueId(world.eras, "era", name || `Era ${index + 1}`),
        name: name || `Era ${index + 1}`,
        start: toNumber(valueOf(fields, aliases("start", ["from"])), index === 0 ? defaultYear : defaultYear + index),
        end: toNumber(valueOf(fields, aliases("end", ["to"])), index === 0 ? defaultYear + 1 : defaultYear + index + 1),
        compressed: toNumber(valueOf(fields, aliases("compression", ["compressed", "scale"])), 1),
        accent: cleanText(valueOf(fields, aliases("color", ["accent", "colour"]))) || DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length],
        blurb: body
      });
    }).filter(Boolean);

    if (!world.eras.length) {
      world.eras.push({
        id: "present",
        name: text("present"),
        start: defaultYear,
        end: defaultYear + 1,
        compressed: 1,
        accent: "#c89859",
        blurb: text("importedPresentDay")
      });
    }

    world.countries = itemBlocks(sections.countries?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("description", ["body", "blurb"]))) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const capital = addPlace(valueOf(fields, aliases("capital", ["capital city"])));
      const founded = toNumber(valueOf(fields, aliases("founded", ["born"])), defaultYear);
      const territory = cleanText(valueOf(fields, aliases("territory", ["borders"]))) || (capital ? territoryFor(capital, index) : "");
      return stripEmpty({
        id: uniqueId(world.countries, "co", name),
        name,
        accent: cleanText(valueOf(fields, aliases("color", ["accent", "colour"]))) || DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length],
        founded,
        dissolved: nullableNumber(valueOf(fields, aliases("dissolved", ["ended"]))),
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, aliases("year", ["snapshot year"])), founded),
          capital: capital ? locationFromPlace(capital) : undefined,
          leader: cleanText(valueOf(fields, aliases("leader", ["ruler"]))),
          body,
          territory
        })]
      });
    }).filter(Boolean);

    world.organizations = itemBlocks(sections.organizations?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("description", ["body", "blurb"]))) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const hq = addPlace(valueOf(fields, aliases("headquarters", ["hq", "base"])));
      const founded = toNumber(valueOf(fields, aliases("founded", ["born"])), defaultYear);
      return stripEmpty({
        id: uniqueId(world.organizations, "or", name),
        name,
        accent: cleanText(valueOf(fields, aliases("color", ["accent", "colour"]))) || DEFAULT_ACCENTS[(index + 2) % DEFAULT_ACCENTS.length],
        founded,
        dissolved: nullableNumber(valueOf(fields, aliases("dissolved", ["ended"]))),
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, aliases("year", ["snapshot year"])), founded),
          hq: hq ? locationFromPlace(hq) : undefined,
          leader: cleanText(valueOf(fields, aliases("leader"))),
          members: nullableNumber(valueOf(fields, aliases("members", ["count"]))),
          body,
          territory: cleanText(valueOf(fields, aliases("domain", ["territory", "borders"])))
        })]
      });
    }).filter(Boolean);

    world.characters = itemBlocks(sections.characters?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const name = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("description", ["body", "blurb"]))) || sectionBody(block.content);
      if (skipEmptyItem(name, fields, body)) return null;
      const place = addPlace(valueOf(fields, aliases("location", ["place", "where"])));
      const born = toNumber(valueOf(fields, aliases("born", ["birth"])), defaultYear - 25);
      return stripEmpty({
        id: uniqueId(world.characters, "ch", name),
        name,
        role: cleanText(valueOf(fields, aliases("role", ["job"]))) || text("importedCharacter"),
        born,
        died: nullableNumber(valueOf(fields, aliases("died", ["death"]))),
        originRegionId: null,
        snapshots: [stripEmpty({
          year: toNumber(valueOf(fields, aliases("year", ["snapshot year"])), Math.max(born, defaultYear)),
          location: place ? locationFromPlace(place) : undefined,
          status: cleanText(valueOf(fields, aliases("status"))) || text("presentStatus"),
          body
        })],
        body
      });
    }).filter(Boolean);

    const entityIndex = entityLookup(world);

    world.events = itemBlocks(sections.events?.content || "").map((block, index) => {
      const fields = readFields(block.content);
      const title = cleanText(valueOf(fields, aliases("name", ["title"]))) || block.title;
      const body = cleanText(valueOf(fields, aliases("description", ["body", "blurb"]))) || sectionBody(block.content);
      if (skipEmptyItem(title, fields, body)) return null;
      const place = addPlace(valueOf(fields, aliases("location", ["place"])));
      return stripEmpty({
        id: uniqueId(world.events, "ev", title || `Event ${index + 1}`),
        year: toNumber(valueOf(fields, aliases("year", ["date"])), defaultYear),
        title,
        body,
        placeId: place?.id || null,
        participants: splitList(valueOf(fields, aliases("participants", ["people", "entities"])))
          .map((name) => entityIndex.get(normalizeName(name)) || name)
          .filter(Boolean)
      });
    }).filter(Boolean);

    world.relationships = parseRelationships(sections.relationships?.content || "", world);
    world.library = libraryFromImport(world);

    return {
      title: world.name,
      world,
      summary: {
        characters: world.characters.length,
        organizations: world.organizations.length,
        countries: world.countries.length,
        places: world.places.length,
        events: world.events.length,
        eras: world.eras.length,
        relationships: world.relationships.length
      }
    };
  }

  function parseRelationships(content, world) {
    const blocks = itemBlocks(content);
    const entityIndex = entityLookup(world);
    const relationships = [];

    if (blocks.length) {
      for (const block of blocks) {
        const fields = readFields(block.content);
        const a = cleanText(valueOf(fields, ["A", "a", "甲", "from", "來源"]));
        const b = cleanText(valueOf(fields, ["B", "b", "乙", "to", "目標"]));
        const note = cleanText(valueOf(fields, aliases("notes", ["note", "description"]))) || sectionBody(block.content);
        if (!a || !b) continue;
        relationships.push(stripEmpty({
          id: uniqueId(relationships, "rl", block.title || `${a}-${b}`),
          a: entityIndex.get(normalizeName(a)) || a,
          b: entityIndex.get(normalizeName(b)) || b,
          kind: cleanText(valueOf(fields, aliases("type", ["kind"]))) || "ally",
          since: nullableNumber(valueOf(fields, aliases("since", ["from"]))),
          until: nullableNumber(valueOf(fields, aliases("until", ["to"]))),
          note
        }));
      }
      return relationships;
    }

    for (const line of content.split("\n")) {
      const text = line.replace(/^\s*[-*]\s+/, "").trim();
      if (!text) continue;
      const match = text.match(/^(.+?)(?:->|=>|--|—|：|:)(.+?)(?:[;；](.*))?$/);
      if (!match) continue;
      const a = cleanText(match[1]);
      const rest = cleanText(match[2]);
      const parts = rest.split(/[;；]/).map(cleanText).filter(Boolean);
      const b = parts.shift() || rest;
      relationships.push(stripEmpty({
        id: uniqueId(relationships, "rl", `${a}-${b}`),
        a: entityIndex.get(normalizeName(a)) || a,
        b: entityIndex.get(normalizeName(b)) || b,
        kind: parts[0] || "ally",
        note: match[3] || ""
      }));
    }
    return relationships;
  }

  function libraryFromImport(world) {
    const chapters = [];
    if (world.worldview) {
      const title = text("worldview");
      chapters.push({
        id: "chap_worldview",
        title,
        year: world.defaultYear,
        placeId: null,
        focusIds: [],
        eventIds: [],
        status: "outline",
        words: wordCount(world.worldview),
        md: `# ${title}\n\n${world.worldview}`,
        illustrations: []
      });
    }
    if (world.outline) {
      const title = text("outline");
      chapters.push({
        id: "chap_outline",
        title,
        year: world.defaultYear,
        placeId: null,
        focusIds: [],
        eventIds: [],
        status: "outline",
        words: wordCount(world.outline),
        md: `# ${title}\n\n${world.outline}`,
        illustrations: []
      });
    }
    if (!chapters.length) return { books: [] };
    return {
      books: [{
        id: "bk_imported_setting",
        title: text("importedSetting"),
        subtitle: world.name,
        author: text("novelElfImport"),
        year: world.defaultYear,
        status: "outline",
        motif: "leaf",
        accent: "#c89859",
        blurb: world.worldview || world.outline || "",
        volumes: [{
          id: "vol_imported_notes",
          title: text("settingNotes"),
          subtitle: text("worldBibleAndOutline"),
          chapters
        }]
      }]
    };
  }

  function splitSections(text) {
    const sections = {};
    let current = "intro";
    let title = "";
    const push = (line) => {
      if (!sections[current]) sections[current] = { title, content: "" };
      sections[current].content += `${line}\n`;
    };

    for (const line of text.split("\n")) {
      const match = line.match(/^##\s+(.+?)\s*$/);
      if (match && !line.startsWith("###")) {
        title = match[1].trim();
        current = sectionKey(title) || slugify(title, "section");
        if (!sections[current]) sections[current] = { title, content: "" };
        continue;
      }
      push(line);
    }
    return sections;
  }

  function sectionKey(value) {
    const text = normalizeName(value);
    if (hasAny(text, aliases("outline", ["plot"]))) return "outline";
    if (hasAny(text, aliases("worldview", ["world bible", "premise", "setting"]))) return "worldview";
    if (hasAny(text, aliases("story", ["metadata", "meta"]))) return "story";
    if (hasAny(text, aliases("eras", ["era", "timeline spans"]))) return "eras";
    if (hasAny(text, aliases("places", ["place", "locations", "location"]))) return "places";
    if (hasAny(text, aliases("countries", ["country", "nations", "realms"]))) return "countries";
    if (hasAny(text, aliases("organizations", ["organization", "factions", "guilds"]))) return "organizations";
    if (hasAny(text, aliases("characters", ["character", "people"]))) return "characters";
    if (hasAny(text, aliases("events", ["event"]))) return "events";
    if (hasAny(text, aliases("relationships", ["relationship", "relations"]))) return "relationships";
    return null;
  }

  function itemBlocks(content) {
    const blocks = [];
    let title = null;
    let lines = [];

    const flush = () => {
      if (title == null) return;
      blocks.push({ title: cleanText(title), content: lines.join("\n") });
    };

    for (const line of normalizeNewlines(content).split("\n")) {
      const match = line.match(/^###\s+(.+?)\s*$/);
      if (match) {
        flush();
        title = match[1];
        lines = [];
      } else if (title != null) {
        lines.push(line);
      }
    }

    flush();
    return blocks;
  }

  function readFields(content) {
    const fields = new Map();
    for (const line of normalizeNewlines(content).split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(">") || trimmed.startsWith("<!--")) continue;
      const match = trimmed.match(/^(?:[-*]\s*)?([^:：]+?)\s*[:：]\s*(.*)$/);
      if (!match) continue;
      const key = normalizeFieldKey(match[1]);
      if (!key) continue;
      fields.set(key, cleanText(match[2]));
    }
    return fields;
  }

  function valueOf(fields, keys) {
    for (const key of keys) {
      const value = fields.get(normalizeFieldKey(key));
      if (!isBlank(value)) return value;
    }
    return "";
  }

  function sectionBody(content) {
    return normalizeNewlines(content)
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(">") || trimmed.startsWith("<!--")) return false;
        if (/^(?:[-*]\s*)?[^:：]+?\s*[:：]\s*$/.test(trimmed)) return false;
        return !/^(?:[-*]\s*)?[^:：]+?\s*[:：]\s*.+$/.test(trimmed);
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function noteBody(content) {
    return normalizeNewlines(content)
      .split("\n")
      .filter((line) => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith(">") && !trimmed.startsWith("<!--") && !trimmed.startsWith("### ");
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function firstBodyLine(content) {
    return sectionBody(content).split("\n").map(cleanText).find(Boolean) || "";
  }

  function firstHeading(text) {
    const match = normalizeNewlines(text).match(/^#\s+(.+?)\s*$/m);
    const heading = cleanText(match?.[1] || "");
    if (!heading || heading.toLowerCase().includes("novel elf")) return "";
    return heading;
  }

  function titleFromFileName(fileName) {
    const base = String(fileName || "")
      .split(/[\\/]/)
      .pop()
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return base || text("untitledStory");
  }

  function entityLookup(world) {
    const lookup = new Map();
    for (const item of [...world.characters, ...world.organizations, ...world.countries]) {
      lookup.set(normalizeName(item.name), item.id);
      lookup.set(normalizeName(item.id), item.id);
    }
    return lookup;
  }

  function skipEmptyItem(name, fields, body) {
    const fieldValues = [...fields.values()].filter((value) => !isBlank(value));
    return isBlankPlaceholder(name) && !fieldValues.length && !cleanText(body);
  }

  function isBlankPlaceholder(value) {
    const text = normalizeName(value);
    return !text || hasAny(text, [
      ...aliases("name", ["title"]),
      ...aliases("eraName"),
      ...aliases("placeName"),
      ...aliases("countryName"),
      ...aliases("organizationName"),
      ...aliases("characterName"),
      ...aliases("eventName"),
      ...aliases("relationshipName"),
      "story name"
    ]);
  }

  function isBlank(value) {
    const text = cleanText(value).toLowerCase();
    return !text || ["-", "n/a", "na", "none", "null", "無", "沒有", "未定", "待填"].includes(text);
  }

  function cleanText(value) {
    return String(value ?? "")
      .replace(/^["'“”]+|["'“”]+$/g, "")
      .trim();
  }

  function normalizeNewlines(value) {
    return String(value || "").replace(/\r\n?/g, "\n");
  }

  function normalizeFieldKey(value) {
    return normalizeName(String(value || "").replace(/^[#\s-]+/, ""));
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function hasAny(value, needles) {
    return needles.some((needle) => value.includes(normalizeName(needle)));
  }

  function toNumber(value, fallback) {
    const text = cleanText(value).replace(/[,，]/g, "");
    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return fallback;
    const number = Number(match[0]);
    return Number.isFinite(number) ? number : fallback;
  }

  function nullableNumber(value) {
    if (isBlank(value)) return null;
    return toNumber(value, null);
  }

  function parsePoint(value) {
    const nums = cleanText(value).match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 2) return {};
    return {
      x: clamp(Number(nums[0]), 20, 940),
      y: clamp(Number(nums[1]), 20, 600)
    };
  }

  function splitList(value) {
    return cleanText(value).split(/[,，、;；\n]/).map(cleanText).filter(Boolean);
  }

  function autoPoint(index) {
    const columns = 5;
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {
      x: 150 + col * 175 + (row % 2) * 35,
      y: 130 + (row % 4) * 115
    };
  }

  function territoryFor(place, index) {
    const radius = 58 + (index % 3) * 12;
    const points = [];
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * 2 * i) / 6 + 0.32;
      points.push(`${Math.round(clamp(place.x + Math.cos(angle) * radius, 20, 940))},${Math.round(clamp(place.y + Math.sin(angle) * radius, 20, 600))}`);
    }
    return points.join(" ");
  }

  function locationFromPlace(place) {
    return { x: place.x, y: place.y, name: place.name };
  }

  function uniqueId(items, prefix, name) {
    const base = `${prefix}_${slugify(name, prefix)}`.replace(new RegExp(`^${prefix}_${prefix}$`), prefix);
    const used = new Set(items.map((item) => item.id));
    let candidate = base;
    let index = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${index}`;
      index += 1;
    }
    return candidate;
  }

  function slugify(value, fallback) {
    const slug = String(value || "")
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    return slug || fallback || "story";
  }

  function stripEmpty(value) {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (item === undefined) continue;
      if (typeof item === "string" && item.trim() === "") continue;
      out[key] = item;
    }
    return out;
  }

  function wordCount(value) {
    return cleanText(value).split(/\s+/).filter(Boolean).length;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  window.StoryImport = {
    parseStoryMarkdown,
    templateMarkdown,
    titleFromFileName,
    templateFileName: TEMPLATE_FILE_NAME
  };
})();
