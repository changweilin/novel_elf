(function () {
  "use strict";

  const STORAGE_KEY = "aevenmere.lang.v1";
  const LANGS = [
    { code: "zh-Hant", short: "繁中", name: "繁體中文", html: "zh-Hant" },
    { code: "en", short: "EN", name: "English", html: "en" },
    { code: "ja", short: "日本語", name: "日本語", html: "ja" },
    { code: "ko", short: "한국어", name: "한국어", html: "ko" },
    { code: "de", short: "DE", name: "Deutsch", html: "de" },
    { code: "fr", short: "FR", name: "Français", html: "fr" },
    { code: "it", short: "IT", name: "Italiano", html: "it" },
    { code: "es", short: "ES", name: "Español", html: "es" }
  ];
  const LANG_CODES = new Set(LANGS.map((l) => l.code));
  const FALLBACK = "en";
  const phrases = new Map();
  const reversePhrases = new Map();

  function add(source, tr) {
    phrases.set(source, { ...tr });
    Object.values(tr).forEach((value) => {
      if (value == null) return;
      const key = String(value);
      if (!key || key === source) return;
      if (!reversePhrases.has(key)) reversePhrases.set(key, source);
      else if (reversePhrases.get(key) !== source) reversePhrases.set(key, null);
    });
  }

  function addLabel(source, zh, en, ja, ko, de, fr, it, es) {
    add(source, { "zh-Hant": zh, en, ja, ko, de, fr, it, es });
  }

  addLabel("The Atelier of Aevenmere", "艾文米爾工坊", "The Atelier of Aevenmere", "アイヴンミアの工房", "에이븐미어 작업실", "Das Atelier von Aevenmere", "L'Atelier d'Aevenmere", "L'Atelier di Aevenmere", "El Atelier de Aevenmere");
  addLabel("of Aevenmere", "艾文米爾", "of Aevenmere", "アイヴンミア", "에이븐미어", "von Aevenmere", "d'Aevenmere", "di Aevenmere", "de Aevenmere");
  addLabel("in the palm", "掌中", "in the palm", "手のひらで", "손안에서", "in der Hand", "dans la paume", "nel palmo", "en la palma");
  addLabel("The Atelier", "工坊", "The Atelier", "工房", "작업실", "Das Atelier", "L'Atelier", "L'Atelier", "El Atelier");
  addLabel("The Library", "書庫", "The Library", "書庫", "서재", "Die Bibliothek", "La Bibliothèque", "La Biblioteca", "La Biblioteca");
  addLabel("The Chronicle", "編年史", "The Chronicle", "年代記", "연대기", "Die Chronik", "La Chronique", "La Cronaca", "La Crónica");
  addLabel("The Leaf", "葉箋", "The Leaf", "葉片", "잎장", "Das Blatt", "La Feuille", "La Foglia", "La Hoja");
  addLabel("The Detail", "詳細資料", "The Detail", "詳細", "상세", "Detail", "Détail", "Dettaglio", "Detalle");
  addLabel("The Compendium", "彙典", "The Compendium", "大全", "개요집", "Das Kompendium", "Le Compendium", "Il Compendio", "El Compendio");
  addLabel("The Quill", "羽筆", "The Quill", "羽ペン", "깃펜", "Die Feder", "La Plume", "La Penna", "La Pluma");
  addLabel("Continuity", "連貫性", "Continuity", "整合性", "연속성", "Kontinuität", "Continuité", "Continuità", "Continuidad");
  addLabel("Sync to Codex", "同步到 Codex", "Sync to Codex", "Codexへ同期", "Codex에 동기화", "Mit Codex synchronisieren", "Synchroniser vers Codex", "Sincronizza con Codex", "Sincronizar con Codex");
  addLabel("Plates & Engravings", "圖版與版畫", "Plates & Engravings", "図版と版画", "도판과 판화", "Tafeln & Stiche", "Planches et gravures", "Tavole e incisioni", "Láminas y grabados");
  addLabel("Rendered Page", "渲染頁面", "Rendered Page", "表示ページ", "렌더링 페이지", "Gerenderte Seite", "Page rendue", "Pagina renderizzata", "Página renderizada");
  addLabel("Source · markdown", "原始碼 · Markdown", "Source · markdown", "ソース · Markdown", "소스 · Markdown", "Quelle · Markdown", "Source · Markdown", "Sorgente · Markdown", "Fuente · Markdown");
  addLabel("Table of Contents", "目錄", "Table of Contents", "目次", "목차", "Inhaltsverzeichnis", "Table des matières", "Indice", "Índice");
  addLabel("Development", "發展紀錄", "Development", "展開", "전개", "Entwicklung", "Développement", "Sviluppo", "Desarrollo");
  addLabel("Relationships", "關係", "Relationships", "関係", "관계", "Beziehungen", "Relations", "Relazioni", "Relaciones");
  addLabel("Participants", "參與者", "Participants", "参加者", "참여자", "Beteiligte", "Participants", "Partecipanti", "Participantes");
  addLabel("Through the years", "跨越年代", "Through the years", "年月を越えて", "세월을 따라", "Durch die Jahre", "Au fil des ans", "Nel corso degli anni", "A través de los años");
  addLabel("Ties", "羈絆", "Ties", "つながり", "연결", "Bindungen", "Liens", "Legami", "Vínculos");
  addLabel("Region", "地區", "Region", "地域", "지역", "Region", "Région", "Regione", "Región");
  addLabel("Event", "事件", "Event", "事件", "사건", "Ereignis", "Événement", "Evento", "Evento");
  addLabel("Character", "角色", "Character", "人物", "인물", "Figur", "Personnage", "Personaggio", "Personaje");
  addLabel("Organization", "組織", "Organization", "組織", "조직", "Organisation", "Organisation", "Organizzazione", "Organización");
  addLabel("Country", "國家", "Country", "国家", "국가", "Land", "Pays", "Paese", "País");
  addLabel("Place", "地點", "Place", "場所", "장소", "Ort", "Lieu", "Luogo", "Lugar");
  addLabel("Events", "事件", "Events", "事件", "사건", "Ereignisse", "Événements", "Eventi", "Eventos");
  addLabel("Characters", "角色", "Characters", "人物", "인물", "Figuren", "Personnages", "Personaggi", "Personajes");
  addLabel("Organizations", "組織", "Organizations", "組織", "조직", "Organisationen", "Organisations", "Organizzazioni", "Organizaciones");
  addLabel("Countries", "國家", "Countries", "国家", "국가", "Länder", "Pays", "Paesi", "Países");
  addLabel("Conflicts", "衝突", "Conflicts", "衝突", "갈등", "Konflikte", "Conflits", "Conflitti", "Conflictos");
  addLabel("Conflict", "衝突", "Conflict", "衝突", "갈등", "Konflikt", "Conflit", "Conflitto", "Conflicto");
  addLabel("Realms", "領域", "Realms", "諸領", "영역", "Reiche", "Royaumes", "Regni", "Reinos");
  addLabel("Orders", "結社", "Orders", "結社", "결사", "Orden", "Ordres", "Ordini", "Órdenes");
  addLabel("Souls", "人物", "Souls", "魂", "영혼", "Seelen", "Âmes", "Anime", "Almas");
  addLabel("Map", "地圖", "Map", "地図", "지도", "Karte", "Carte", "Mappa", "Mapa");
  addLabel("Chronicle", "編年", "Chronicle", "年代記", "연대기", "Chronik", "Chronique", "Cronaca", "Crónica");
  addLabel("Codex", "典籍", "Codex", "写本", "코덱스", "Codex", "Codex", "Codice", "Códice");
  addLabel("Leaf", "葉箋", "Leaf", "葉片", "잎장", "Blatt", "Feuille", "Foglia", "Hoja");
  addLabel("All", "全部", "All", "すべて", "전체", "Alle", "Tout", "Tutti", "Todo");
  addLabel("Reckoning", "紀年", "Reckoning", "暦", "연호", "Zeitrechnung", "Chronologie", "Computo", "Cómputo");
  addLabel("Lens", "視窗", "Lens", "レンズ", "렌즈", "Linse", "Lentille", "Lente", "Lente");
  addLabel("Folio I", "卷冊 I", "Folio I", "フォリオ I", "폴리오 I", "Folio I", "Folio I", "Folio I", "Folio I");
  addLabel("— FOLIO I —", "— 卷冊 I —", "— FOLIO I —", "— フォリオ I —", "— 폴리오 I —", "— FOLIO I —", "— FOLIO I —", "— FOLIO I —", "— FOLIO I —");
  addLabel("Folio II", "卷冊 II", "Folio II", "フォリオ II", "폴리오 II", "Folio II", "Folio II", "Folio II", "Folio II");
  addLabel("Folio III", "卷冊 III", "Folio III", "フォリオ III", "폴리오 III", "Folio III", "Folio III", "Folio III", "Folio III");
  addLabel("Folio IV", "卷冊 IV", "Folio IV", "フォリオ IV", "폴리오 IV", "Folio IV", "Folio IV", "Folio IV", "Folio IV");
  addLabel("Desktop", "桌面版", "Desktop", "デスクトップ", "데스크톱", "Desktop", "Bureau", "Desktop", "Escritorio");
  addLabel("Mobile", "手機版", "Mobile", "モバイル", "모바일", "Mobil", "Mobile", "Mobile", "Móvil");
  addLabel("Language", "語言", "Language", "言語", "언어", "Sprache", "Langue", "Lingua", "Idioma");

  addLabel("+ blank", "+ 空白", "+ blank", "+ 空白", "+ 빈 항목", "+ leer", "+ vide", "+ vuoto", "+ en blanco");
  addLabel("+ snapshot", "+ 快照", "+ snapshot", "+ スナップショット", "+ 스냅샷", "+ Schnappschuss", "+ instantané", "+ istantanea", "+ instantánea");
  addLabel("+ relation", "+ 關係", "+ relation", "+ 関係", "+ 관계", "+ Beziehung", "+ relation", "+ relazione", "+ relación");
  addLabel("+ AI event", "+ AI 事件", "+ AI event", "+ AI事件", "+ AI 사건", "+ KI-Ereignis", "+ événement IA", "+ evento IA", "+ evento IA");
  addLabel("+ AI character", "+ AI 角色", "+ AI character", "+ AI人物", "+ AI 인물", "+ KI-Figur", "+ personnage IA", "+ personaggio IA", "+ personaje IA");
  addLabel("+ AI organization", "+ AI 組織", "+ AI organization", "+ AI組織", "+ AI 조직", "+ KI-Organisation", "+ organisation IA", "+ organizzazione IA", "+ organización IA");
  addLabel("+ AI country", "+ AI 國家", "+ AI country", "+ AI国家", "+ AI 국가", "+ KI-Land", "+ pays IA", "+ paese IA", "+ país IA");
  addLabel("+ blank event", "+ 空白事件", "+ blank event", "+ 空白の事件", "+ 빈 사건", "+ leeres Ereignis", "+ événement vide", "+ evento vuoto", "+ evento en blanco");
  addLabel("+ blank soul", "+ 空白人物", "+ blank soul", "+ 空白の魂", "+ 빈 인물", "+ leere Seele", "+ âme vide", "+ anima vuota", "+ alma en blanco");
  addLabel("+ paragraph", "+ 段落", "+ paragraph", "+ 段落", "+ 문단", "+ Absatz", "+ paragraphe", "+ paragrafo", "+ párrafo");
  addLabel("+ new plate", "+ 新圖版", "+ new plate", "+ 新しい図版", "+ 새 도판", "+ neue Tafel", "+ nouvelle planche", "+ nuova tavola", "+ nueva lámina");
  addLabel("+ new chapter", "+ 新章節", "+ new chapter", "+ 新しい章", "+ 새 장", "+ neues Kapitel", "+ nouveau chapitre", "+ nuovo capitolo", "+ capítulo nuevo");
  addLabel("+ begin a new book", "+ 建立新書", "+ begin a new book", "+ 新しい本を始める", "+ 새 책 시작", "+ neues Buch beginnen", "+ commencer un nouveau livre", "+ inizia un nuovo libro", "+ empezar un libro");
  addLabel("Write the next leaf", "續寫下一葉", "Write the next leaf", "次の葉を書く", "다음 잎장 쓰기", "Nächstes Blatt schreiben", "Écrire la feuille suivante", "Scrivi la prossima foglia", "Escribir la próxima hoja");
  addLabel("write the next paragraph", "續寫下一段", "write the next paragraph", "次の段落を書く", "다음 문단 쓰기", "nächsten Absatz schreiben", "écrire le prochain paragraphe", "scrivi il prossimo paragrafo", "escribir el siguiente párrafo");
  addLabel("check against bible", "對照設定集", "check against bible", "設定集と照合", "설정집과 대조", "mit Bibel prüfen", "vérifier avec la bible", "controlla con la bibbia", "comprobar con la biblia");
  addLabel("sync chapter → bible", "章節同步 → 設定集", "sync chapter → bible", "章を同期 → 設定集", "장 동기화 → 설정집", "Kapitel → Bibel synchronisieren", "synchroniser chapitre → bible", "sincronizza capitolo → bibbia", "sincronizar capítulo → biblia");
  addLabel("clear", "清除", "clear", "消去", "지우기", "leeren", "effacer", "cancella", "borrar");
  addLabel("close", "關閉", "close", "閉じる", "닫기", "schließen", "fermer", "chiudi", "cerrar");
  addLabel("jump", "跳至", "jump", "移動", "이동", "springen", "aller", "vai", "saltar");
  addLabel("strike", "刪去", "strike", "削除", "삭제", "streichen", "rayer", "cancella", "tachar");
  addLabel("forget", "遺忘", "forget", "忘れる", "잊기", "vergessen", "oublier", "dimentica", "olvidar");
  addLabel("dissolve", "解散", "dissolve", "解散", "해산", "auflösen", "dissoudre", "sciogli", "disolver");
  addLabel("fall", "陷落", "fall", "滅亡", "몰락", "fallen", "tomber", "cadere", "caer");
  addLabel("AI flesh out", "AI 補完", "AI flesh out", "AIで肉付け", "AI 확장", "KI ausarbeiten", "développer avec IA", "sviluppa con IA", "desarrollar con IA");
  addLabel("draw domain", "繪製領域", "draw domain", "領域を描く", "영역 그리기", "Domäne zeichnen", "tracer le domaine", "disegna dominio", "dibujar dominio");
  addLabel("draw borders", "繪製邊界", "draw borders", "国境を描く", "경계 그리기", "Grenzen zeichnen", "tracer les frontières", "disegna confini", "dibujar fronteras");
  addLabel("cancel", "取消", "cancel", "キャンセル", "취소", "abbrechen", "annuler", "annulla", "cancelar");
  addLabel("upload", "上傳", "upload", "アップロード", "업로드", "hochladen", "téléverser", "carica", "subir");
  addLabel("undo last", "復原上一段", "undo last", "最後を取り消す", "마지막 실행 취소", "letztes rückgängig", "annuler le dernier", "annulla ultimo", "deshacer último");
  addLabel("back to book", "回到書籍", "back to book", "本へ戻る", "책으로 돌아가기", "zurück zum Buch", "retour au livre", "torna al libro", "volver al libro");
  addLabel("hide md ⌗", "隱藏 Markdown ⌗", "hide md ⌗", "Markdownを隠す ⌗", "Markdown 숨기기 ⌗", "Markdown ausblenden ⌗", "masquer md ⌗", "nascondi md ⌗", "ocultar md ⌗");
  addLabel("show md ⌗", "顯示 Markdown ⌗", "show md ⌗", "Markdownを表示 ⌗", "Markdown 보이기 ⌗", "Markdown zeigen ⌗", "afficher md ⌗", "mostra md ⌗", "mostrar md ⌗");

  addLabel("writing…", "書寫中…", "writing…", "執筆中…", "작성 중…", "schreibt…", "écriture…", "scrittura…", "escribiendo…");
  addLabel("inking…", "入墨中…", "inking…", "インク中…", "잉크 중…", "tuscht…", "encrage…", "inchiostro…", "entintando…");
  addLabel("summoning…", "召喚中…", "summoning…", "召喚中…", "소환 중…", "beschwört…", "invocation…", "evocazione…", "invocando…");
  addLabel("founding…", "建立中…", "founding…", "創設中…", "창립 중…", "gründet…", "fondation…", "fondazione…", "fundando…");
  addLabel("drawing borders…", "繪製邊界中…", "drawing borders…", "国境を描画中…", "경계 그리는 중…", "zeichnet Grenzen…", "tracé des frontières…", "disegno confini…", "dibujando fronteras…");
  addLabel("reading…", "閱讀中…", "reading…", "読解中…", "읽는 중…", "liest…", "lecture…", "lettura…", "leyendo…");
  addLabel("scribing…", "抄錄中…", "scribing…", "筆写中…", "기록 중…", "schreibt ab…", "copie…", "trascrizione…", "escribiendo…");

  addLabel("events", "事件", "events", "事件", "사건", "Ereignisse", "événements", "eventi", "eventos");
  addLabel("characters", "角色", "characters", "人物", "인물", "Figuren", "personnages", "personaggi", "personajes");
  addLabel("orgs", "組織", "orgs", "組織", "조직", "Orgs", "orgs", "org", "orgs");
  addLabel("countries", "國家", "countries", "国家", "국가", "Länder", "pays", "paesi", "países");
  addLabel("conflicts", "衝突", "conflicts", "衝突", "갈등", "Konflikte", "conflits", "conflitti", "conflictos");
  addLabel("status", "狀態", "status", "状態", "상태", "Status", "statut", "stato", "estado");
  addLabel("place", "地點", "place", "場所", "장소", "Ort", "lieu", "luogo", "lugar");
  addLabel("note", "筆記", "note", "メモ", "메모", "Notiz", "note", "nota", "nota");
  addLabel("leader", "領袖", "leader", "指導者", "지도자", "Leitung", "chef", "guida", "líder");
  addLabel("HQ", "總部", "HQ", "本部", "본부", "HQ", "QG", "QG", "Sede");
  addLabel("size", "規模", "size", "規模", "규모", "Größe", "taille", "dimensione", "tamaño");
  addLabel("domain", "領域", "domain", "領域", "영역", "Domäne", "domaine", "dominio", "dominio");
  addLabel("ruler", "統治者", "ruler", "統治者", "통치자", "Herrscher", "souverain", "regnante", "gobernante");
  addLabel("capital", "首都", "capital", "首都", "수도", "Hauptstadt", "capitale", "capitale", "capital");
  addLabel("borders", "邊界", "borders", "国境", "경계", "Grenzen", "frontières", "confini", "fronteras");
  addLabel("born", "出生", "born", "誕生", "출생", "geboren", "né", "nato", "nacido");
  addLabel("died", "死亡", "died", "死亡", "사망", "gestorben", "mort", "morto", "muerto");
  addLabel("founded", "建立", "founded", "創設", "창립", "gegründet", "fondé", "fondato", "fundado");
  addLabel("dissolved", "解散", "dissolved", "解散", "해산", "aufgelöst", "dissous", "sciolto", "disuelto");
  addLabel("fell", "陷落", "fell", "滅亡", "몰락", "gefallen", "tombé", "caduto", "cayó");
  addLabel("at", "於", "at", "場所", "장소", "bei", "à", "a", "en");
  addLabel("since", "自", "since", "開始", "시작", "seit", "depuis", "dal", "desde");
  addLabel("until", "至", "until", "終了", "까지", "bis", "jusqu'à", "fino a", "hasta");
  addLabel("ally", "盟友", "ally", "同盟", "동맹", "Verbündete", "allié", "alleato", "aliado");
  addLabel("war", "戰爭", "war", "戦争", "전쟁", "Krieg", "guerre", "guerra", "guerra");
  addLabel("feud", "世仇", "feud", "確執", "불화", "Fehde", "querelle", "faida", "feudo");
  addLabel("trade", "貿易", "trade", "交易", "교역", "Handel", "commerce", "commercio", "comercio");
  addLabel("vassal", "附庸", "vassal", "臣下", "봉신", "Vasall", "vassal", "vassallo", "vasallo");
  addLabel("oath", "誓約", "oath", "誓い", "맹세", "Eid", "serment", "giuramento", "juramento");
  addLabel("rival", "宿敵", "rival", "宿敵", "라이벌", "Rivale", "rival", "rivale", "rival");
  addLabel("leads", "率領", "leads", "率いる", "이끎", "führt", "dirige", "guida", "dirige");
  addLabel("loves", "摯愛", "loves", "愛", "사랑", "liebt", "aime", "ama", "ama");
  addLabel("mentor", "導師", "mentor", "師", "멘토", "Mentor", "mentor", "mentore", "mentor");

  addLabel("alive", "存活", "alive", "存命", "생존", "lebendig", "vivant", "vivo", "vivo");
  addLabel("passed", "逝去", "passed", "故人", "사망", "verstorben", "disparu", "scomparso", "fallecido");
  addLabel("active", "活躍", "active", "活動中", "활동 중", "aktiv", "actif", "attivo", "activo");
  addLabel("ended", "終止", "ended", "終了", "종료", "beendet", "terminé", "terminato", "terminado");
  addLabel("extant", "現存", "extant", "現存", "현존", "bestehend", "existant", "esistente", "existente");
  addLabel("fallen", "已陷落", "fallen", "滅亡", "몰락", "gefallen", "tombé", "caduto", "caído");
  addLabel("living", "存活", "living", "存命", "생존", "lebend", "vivant", "vivente", "vivo");
  addLabel("dissolved", "解散", "dissolved", "解散", "해산", "aufgelöst", "dissous", "sciolto", "disuelto");
  addLabel("not yet founded", "尚未建立", "not yet founded", "未創設", "아직 창립 전", "noch nicht gegründet", "pas encore fondé", "non ancora fondato", "aún no fundado");

  addLabel("search the rolls…", "搜尋名冊…", "search the rolls…", "巻物を検索…", "두루마리 검색…", "Rollen durchsuchen…", "chercher dans les rouleaux…", "cerca nei rotoli…", "buscar en los rollos…");
  addLabel("Optional direction for AI — 'they meet in the rain'…", "給 AI 的可選方向 —「他們在雨中相遇」…", "Optional direction for AI — 'they meet in the rain'…", "AIへの任意の方向性 —「雨の中で出会う」…", "AI 지시 선택 — '그들은 비 속에서 만난다'…", "Optionale KI-Richtung — „sie treffen sich im Regen“…", "Direction facultative pour l'IA — « ils se rencontrent sous la pluie »…", "Direzione facoltativa per l'IA — 'si incontrano nella pioggia'…", "Dirección opcional para IA — 'se encuentran bajo la lluvia'…");
  addLabel("direction for AI — 'they hear a bell at dusk'…", "給 AI 的方向 —「黃昏時他們聽見鐘聲」…", "direction for AI — 'they hear a bell at dusk'…", "AIへの方向性 —「夕暮れに鐘を聞く」…", "AI 지시 — '황혼에 종소리를 듣는다'…", "Richtung für KI — „sie hören bei Dämmerung eine Glocke“…", "direction pour l'IA — « ils entendent une cloche au crépuscule »…", "direzione per l'IA — 'sentono una campana al crepuscolo'…", "dirección para IA — 'oyen una campana al atardecer'…");
  addLabel("A named place", "一個具名地點", "A named place", "名前のある場所", "이름 있는 장소", "Ein benannter Ort", "Un lieu nommé", "Un luogo nominato", "Un lugar con nombre");
  addLabel("What happened. Who saw it. What it cost.", "發生了什麼、誰看見了、付出了什麼代價。", "What happened. Who saw it. What it cost.", "何が起き、誰が見て、何を失ったか。", "무슨 일이 있었고, 누가 보았고, 무엇을 잃었는가.", "Was geschah. Wer es sah. Was es kostete.", "Ce qui s'est passé. Qui l'a vu. Ce que cela a coûté.", "Che cosa accadde. Chi lo vide. Che cosa costò.", "Qué ocurrió. Quién lo vio. Qué costó.");
  addLabel("A line about the bond.", "關於這段關係的一行。", "A line about the bond.", "絆についての一行。", "관계에 대한 한 줄.", "Eine Zeile über die Bindung.", "Une ligne sur le lien.", "Una riga sul legame.", "Una línea sobre el vínculo.");
  addLabel("their station", "其身份", "their station", "その立場", "그들의 지위", "ihre Stellung", "leur rang", "il loro rango", "su posición");
  addLabel("what they are now", "此刻的狀態", "what they are now", "現在の姿", "현재 상태", "was sie jetzt sind", "ce qu'ils sont maintenant", "cosa sono ora", "qué son ahora");
  addLabel("What they are doing. Who they meet.", "他們正在做什麼、遇見誰。", "What they are doing. Who they meet.", "何をし、誰に会うか。", "무엇을 하고 누구를 만나는지.", "Was sie tun. Wen sie treffen.", "Ce qu'ils font. Qui ils rencontrent.", "Che cosa fanno. Chi incontrano.", "Qué hacen. A quién conocen.");
  addLabel("who runs it now", "現在由誰掌管", "who runs it now", "今は誰が率いるか", "지금 누가 이끄는지", "wer es jetzt führt", "qui le dirige maintenant", "chi lo guida ora", "quién lo dirige ahora");
  addLabel("members", "成員", "members", "構成員", "구성원", "Mitglieder", "membres", "membri", "miembros");
  addLabel("What they want, what they fear.", "他們想要什麼、害怕什麼。", "What they want, what they fear.", "何を望み、何を恐れるか。", "무엇을 원하고 두려워하는지.", "Was sie wollen, was sie fürchten.", "Ce qu'ils veulent, ce qu'ils craignent.", "Cosa vogliono, cosa temono.", "Qué desean, qué temen.");
  addLabel("who sits the throne", "坐上王座的人", "who sits the throne", "玉座に座る者", "왕좌에 앉은 자", "wer auf dem Thron sitzt", "qui siège sur le trône", "chi siede sul trono", "quién ocupa el trono");
  addLabel("How the realm stands.", "此國當下的狀態。", "How the realm stands.", "その国の現状。", "그 영역의 현재.", "Wie das Reich dasteht.", "Où en est le royaume.", "Come sta il regno.", "Cómo se sostiene el reino.");
  addLabel("add by name…", "以名稱加入…", "add by name…", "名前で追加…", "이름으로 추가…", "nach Namen hinzufügen…", "ajouter par nom…", "aggiungi per nome…", "añadir por nombre…");
  addLabel("x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …", "x,y x,y x,y …");

  addLabel("— no snapshots yet —", "— 尚無快照 —", "— no snapshots yet —", "— まだスナップショットはありません —", "— 아직 스냅샷 없음 —", "— noch keine Schnappschüsse —", "— aucun instantané —", "— nessuna istantanea —", "— aún no hay instantáneas —");
  addLabel("— no relations —", "— 尚無關係 —", "— no relations —", "— まだ関係はありません —", "— 아직 관계 없음 —", "— keine Beziehungen —", "— aucune relation —", "— nessuna relazione —", "— aún no hay relaciones —");
  addLabel("— no matches —", "— 無相符項目 —", "— no matches —", "— 一致なし —", "— 일치 없음 —", "— keine Treffer —", "— aucun résultat —", "— nessuna corrispondenza —", "— sin resultados —");
  addLabel("— nothing here yet —", "— 這裡還沒有內容 —", "— nothing here yet —", "— ここにはまだ何もありません —", "— 아직 아무것도 없음 —", "— hier ist noch nichts —", "— rien ici pour l'instant —", "— ancora nulla qui —", "— aún no hay nada aquí —");
  addLabel("— no events near", "— 附近沒有事件", "— no events near", "— 近くに事件なし", "— 근처 사건 없음", "— keine Ereignisse nahe", "— aucun événement près de", "— nessun evento vicino a", "— no hay eventos cerca de");
  addLabel("— codex unavailable —", "— Codex 無法使用 —", "— codex unavailable —", "— Codexは利用できません —", "— Codex 사용 불가 —", "— Codex nicht verfügbar —", "— Codex indisponible —", "— Codex non disponibile —", "— Codex no disponible —");
  addLabel("— no folios yet —", "— 尚無卷冊 —", "— no folios yet —", "— まだフォリオはありません —", "— 아직 폴리오 없음 —", "— noch keine Folios —", "— aucun folio —", "— nessun folio —", "— aún no hay folios —");
  addLabel("— this page is bare —", "— 此頁尚空 —", "— this page is bare —", "— このページは空です —", "— 이 페이지는 비어 있음 —", "— diese Seite ist leer —", "— cette page est vide —", "— questa pagina è vuota —", "— esta página está vacía —");
  addLabel("— no volumes yet · begin the first —", "— 尚無分卷 · 建立第一卷 —", "— no volumes yet · begin the first —", "— まだ巻がありません · 最初を始める —", "— 아직 권 없음 · 첫 권 시작 —", "— noch keine Bände · beginne den ersten —", "— aucun volume · commencez le premier —", "— nessun volume · inizia il primo —", "— aún no hay volúmenes · empieza el primero —");
  addLabel("— not yet checked —", "— 尚未檢查 —", "— not yet checked —", "— 未確認 —", "— 아직 확인 안 됨 —", "— noch nicht geprüft —", "— pas encore vérifié —", "— non ancora controllato —", "— aún no revisado —");
  addLabel("✓ no contradictions", "✓ 無矛盾", "✓ no contradictions", "✓ 矛盾なし", "✓ 모순 없음", "✓ keine Widersprüche", "✓ aucune contradiction", "✓ nessuna contraddizione", "✓ sin contradicciones");
  addLabel("— nothing matches that name —", "— 沒有符合該名稱的項目 —", "— nothing matches that name —", "— その名前に一致するものはありません —", "— 그 이름과 일치하는 항목 없음 —", "— nichts passt zu diesem Namen —", "— aucun nom correspondant —", "— nessun nome corrisponde —", "— nada coincide con ese nombre —");
  addLabel("— this chapter has not yet bled into the bible —", "— 此章尚未滲入設定集 —", "— this chapter has not yet bled into the bible —", "— この章はまだ設定集へ流れ込んでいません —", "— 이 장은 아직 설정집에 스며들지 않음 —", "— dieses Kapitel ist noch nicht in die Bibel geflossen —", "— ce chapitre n'a pas encore rejoint la bible —", "— questo capitolo non è ancora confluito nella bibbia —", "— este capítulo aún no pasó a la biblia —");

  addLabel("a roll of names, sigils, & standards", "姓名、徽記與旗幟的卷冊", "a roll of names, sigils, & standards", "名・印章・旗印の巻物", "이름과 문장과 깃발의 두루마리", "eine Rolle aus Namen, Siegeln und Standarten", "un rouleau de noms, sceaux et étendards", "un rotolo di nomi, sigilli e stendardi", "un rollo de nombres, sellos y estandartes");
  addLabel("books underway, drafts in progress, fragments yet to gather", "正在書寫的書、進行中的草稿、尚待收攏的碎片", "books underway, drafts in progress, fragments yet to gather", "進行中の本、書きかけの草稿、まだ集めるべき断片", "진행 중인 책, 쓰는 중인 초안, 아직 모을 조각들", "Bücher in Arbeit, Entwürfe im Gang, Fragmente, die noch warten", "livres en cours, brouillons en marche, fragments à rassembler", "libri in corso, bozze aperte, frammenti da raccogliere", "libros en marcha, borradores en curso, fragmentos por reunir");
  addLabel("on the writing desk", "在書寫桌上", "on the writing desk", "執筆机の上", "집필 책상 위", "auf dem Schreibtisch", "sur le bureau d'écriture", "sullo scrittoio", "en el escritorio");
  addLabel("An empty book", "一本空白書", "An empty book", "空の本", "빈 책", "Ein leeres Buch", "Un livre vide", "Un libro vuoto", "Un libro vacío");
  addLabel("awaiting a first leaf", "等待第一葉", "awaiting a first leaf", "最初の葉を待っている", "첫 잎장을 기다림", "wartet auf das erste Blatt", "en attente d'une première feuille", "in attesa della prima foglia", "esperando la primera hoja");
  addLabel("An untitled chapter", "未題章節", "An untitled chapter", "無題の章", "제목 없는 장", "Ein unbetiteltes Kapitel", "Un chapitre sans titre", "Un capitolo senza titolo", "Un capítulo sin título");
  addLabel("An untitled book", "未題書籍", "An untitled book", "無題の本", "제목 없는 책", "Ein unbetiteltes Buch", "Un livre sans titre", "Un libro senza titolo", "Un libro sin título");
  addLabel("A new work, yet to find its shape", "尚待成形的新作品", "A new work, yet to find its shape", "まだ形を探す新作", "아직 형태를 찾는 새 작품", "Ein neues Werk, das seine Form sucht", "Une œuvre nouvelle qui cherche sa forme", "Un'opera nuova che cerca forma", "Una obra nueva que busca forma");
  addLabel("What this book is for has not yet been written.", "這本書的用途尚未寫下。", "What this book is for has not yet been written.", "この本が何のためにあるかはまだ書かれていない。", "이 책의 목적은 아직 쓰이지 않았다.", "Wozu dieses Buch dient, ist noch nicht geschrieben.", "La raison de ce livre n'est pas encore écrite.", "A cosa serva questo libro non è ancora scritto.", "Para qué sirve este libro aún no está escrito.");
  addLabel("Volume the First", "第一卷", "Volume the First", "第一巻", "제1권", "Erster Band", "Volume premier", "Volume primo", "Volumen primero");
  addLabel("Of beginnings", "關於開端", "Of beginnings", "始まりについて", "시작에 관하여", "Von Anfängen", "Des commencements", "Degli inizi", "De los comienzos");

  addLabel("I·II Atelier", "I·II 工坊", "I·II Atelier", "I·II 工房", "I·II 작업실", "I·II Atelier", "I·II Atelier", "I·II Atelier", "I·II Atelier");
  addLabel("III Library", "III 書庫", "III Library", "III 書庫", "III 서재", "III Bibliothek", "III Bibliothèque", "III Biblioteca", "III Biblioteca");
  addLabel("The Library  ·  書冊", "書庫 · 書冊", "The Library · Books", "書庫 · 書冊", "서재 · 책", "Bibliothek · Bücher", "Bibliothèque · Livres", "Biblioteca · Libri", "Biblioteca · Libros");
  addLabel("The Library · Books", "書庫 · 書冊", "The Library · Books", "書庫 · 書冊", "서재 · 책", "Bibliothek · Bücher", "Bibliothèque · Livres", "Biblioteca · Libri", "Biblioteca · Libros");
  addLabel("Aevenmere", "艾文米爾", "Aevenmere", "アイヴンミア", "에이븐미어", "Aevenmere", "Aevenmere", "Aevenmere", "Aevenmere");
  addLabel("An atlas, in the palm", "掌中的地圖集", "An atlas, in the palm", "手のひらの地図帳", "손안의 지도책", "Ein Atlas in der Hand", "Un atlas dans la paume", "Un atlante nel palmo", "Un atlas en la palma");
  addLabel("Folio IV · 手機版 · A pocket atlas", "卷冊 IV · 手機版 · 口袋地圖集", "Folio IV · Mobile · A pocket atlas", "フォリオ IV · モバイル · ポケット地図帳", "폴리오 IV · 모바일 · 주머니 지도책", "Folio IV · Mobil · Taschenatlas", "Folio IV · Mobile · Atlas de poche", "Folio IV · Mobile · Atlante tascabile", "Folio IV · Móvil · Atlas de bolsillo");
  addLabel("The Atelier in the palm", "掌中的工坊", "The Atelier in the palm", "手のひらの工房", "손안의 작업실", "Das Atelier in der Hand", "L'Atelier dans la paume", "L'Atelier nel palmo", "El Atelier en la palma");
  addLabel("The cartographer's bench, made small. Walk the years with a thumb, lift a leaf in the rain, summon a soul from the back of the boat.", "把製圖師的工作檯縮進掌心。用拇指走過年代，在雨中翻起一葉，從船尾喚出一個人物。", "The cartographer's bench, made small. Walk the years with a thumb, lift a leaf in the rain, summon a soul from the back of the boat.", "地図職人の作業台を小さく。親指で年月を歩き、雨の中で葉を拾い、船尾から魂を呼び出す。", "지도 제작자의 책상을 작게 담았습니다. 엄지로 세월을 걷고, 비 속에서 잎장을 들고, 배 뒤편에서 영혼을 부르세요.", "Der Kartographentisch, verkleinert. Mit dem Daumen durch Jahre gehen, im Regen ein Blatt heben, vom Heck ein Wesen rufen.", "Le banc du cartographe, réduit. Parcourez les années du pouce, soulevez une feuille sous la pluie, invoquez une âme à l'arrière du bateau.", "Il banco del cartografo, in piccolo. Attraversa gli anni con il pollice, solleva una foglia nella pioggia, evoca un'anima da poppa.", "La mesa del cartógrafo, reducida. Recorre los años con el pulgar, levanta una hoja bajo la lluvia, invoca un alma desde la popa.");
  addLabel("iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874", "iPhone · 402×874");
  addLabel("live mobile prototype", "即時手機原型", "live mobile prototype", "ライブモバイルプロトタイプ", "라이브 모바일 프로토타입", "Live-Mobile-Prototyp", "prototype mobile en direct", "prototipo mobile live", "prototipo móvil en vivo");
  addLabel("Tweaks · 手機版", "調整 · 手機版", "Tweaks · Mobile", "調整 · モバイル", "조정 · 모바일", "Anpassungen · Mobil", "Réglages · Mobile", "Regolazioni · Mobile", "Ajustes · Móvil");
  addLabel("Tweaks", "調整", "Tweaks", "調整", "조정", "Anpassungen", "Réglages", "Regolazioni", "Ajustes");
  addLabel("Device", "裝置", "Device", "デバイス", "기기", "Gerät", "Appareil", "Dispositivo", "Dispositivo");
  addLabel("Frame", "外框", "Frame", "フレーム", "프레임", "Rahmen", "Cadre", "Cornice", "Marco");
  addLabel("Scale", "縮放", "Scale", "倍率", "배율", "Skalierung", "Échelle", "Scala", "Escala");
  addLabel("Data", "資料", "Data", "データ", "데이터", "Daten", "Données", "Dati", "Datos");
  addLabel("Bare", "裸機", "Bare", "フレームなし", "프레임 없음", "Ohne", "Nu", "Nudo", "Sin marco");
  addLabel("Re-cast the world", "重鑄世界", "Re-cast the world", "世界を再鋳造", "세계를 다시 주조", "Welt neu gießen", "Refondre le monde", "Riforgia il mondo", "Reforjar el mundo");
  addLabel("Reset Aevenmere to its seed? Local edits will be lost.", "要將艾文米爾重設為初始種子嗎？本機編輯會遺失。", "Reset Aevenmere to its seed? Local edits will be lost.", "アイヴンミアを初期状態に戻しますか？ローカル編集は失われます。", "에이븐미어를 초기 상태로 재설정할까요? 로컬 편집은 사라집니다.", "Aevenmere auf den Seed zurücksetzen? Lokale Änderungen gehen verloren.", "Réinitialiser Aevenmere à son état initial ? Les modifications locales seront perdues.", "Ripristinare Aevenmere al seed? Le modifiche locali andranno perse.", "¿Restablecer Aevenmere a su estado inicial? Se perderán los cambios locales.");

  addLabel("Deployment entry is ready. Choose the full desktop workbench, or open the mobile showcase, both starting from the same Aevenmere world data.", "部署入口已備妥。選擇完整桌面工作台，或開啟手機展示版，從同一份 Aevenmere 世界資料開始瀏覽。", "Deployment entry is ready. Choose the full desktop workbench, or open the mobile showcase, both starting from the same Aevenmere world data.", "公開入口の準備ができました。完全なデスクトップ作業台、またはモバイル展示版を選べます。どちらも同じAevenmere世界データから始まります。", "배포 입구가 준비되었습니다. 전체 데스크톱 작업대나 모바일 쇼케이스를 선택하세요. 둘 다 같은 Aevenmere 세계 데이터에서 시작합니다.", "Der Einstieg ist bereit. Wählen Sie die vollständige Desktop-Werkbank oder die mobile Schauversion, beide mit denselben Aevenmere-Weltdaten.", "L'entrée de déploiement est prête. Choisissez l'atelier desktop complet ou la version mobile, tous deux depuis les mêmes données du monde Aevenmere.", "L'ingresso è pronto. Scegli il banco desktop completo o la vetrina mobile, entrambi dagli stessi dati del mondo Aevenmere.", "La entrada está lista. Elige el banco de escritorio completo o la muestra móvil, ambos desde los mismos datos del mundo Aevenmere.");
  addLabel("部署入口已備妥。選擇完整桌面工作台，或開啟手機展示版，從同一份 Aevenmere 世界資料開始瀏覽。", "部署入口已備妥。選擇完整桌面工作台，或開啟手機展示版，從同一份 Aevenmere 世界資料開始瀏覽。", "Deployment entry is ready. Choose the full desktop workbench, or open the mobile showcase, both starting from the same Aevenmere world data.", "公開入口の準備ができました。完全なデスクトップ作業台、またはモバイル展示版を選べます。どちらも同じAevenmere世界データから始まります。", "배포 입구가 준비되었습니다. 전체 데스크톱 작업대나 모바일 쇼케이스를 선택하세요. 둘 다 같은 Aevenmere 세계 데이터에서 시작합니다.", "Der Einstieg ist bereit. Wählen Sie die vollständige Desktop-Werkbank oder die mobile Schauversion, beide mit denselben Aevenmere-Weltdaten.", "L'entrée de déploiement est prête. Choisissez l'atelier desktop complet ou la version mobile, tous deux depuis les mêmes données du monde Aevenmere.", "L'ingresso è pronto. Scegli il banco desktop completo o la vetrina mobile, entrambi dagli stessi dati del mondo Aevenmere.", "La entrada está lista. Elige el banco de escritorio completo o la muestra móvil, ambos desde los mismos datos del mundo Aevenmere.");
  addLabel("主要入口", "主要入口", "Primary entries", "主要入口", "주요 입구", "Haupteinstiege", "Entrées principales", "Ingressi principali", "Entradas principales");
  addLabel("進入桌面工作台", "進入桌面工作台", "Enter desktop workbench", "デスクトップ作業台へ", "데스크톱 작업대 열기", "Desktop-Werkbank öffnen", "Entrer dans l'atelier desktop", "Entra nel banco desktop", "Entrar al banco de escritorio");
  addLabel("開啟手機展示版", "開啟手機展示版", "Open mobile showcase", "モバイル展示版を開く", "모바일 쇼케이스 열기", "Mobile Schauversion öffnen", "Ouvrir la version mobile", "Apri vetrina mobile", "Abrir muestra móvil");
  addLabel("瀏覽版本", "瀏覽版本", "Browse versions", "バージョンを見る", "버전 보기", "Versionen ansehen", "Parcourir les versions", "Sfoglia versioni", "Explorar versiones");
  addLabel("桌面工作台", "桌面工作台", "Desktop workbench", "デスクトップ作業台", "데스크톱 작업대", "Desktop-Werkbank", "Atelier desktop", "Banco desktop", "Banco de escritorio");
  addLabel("地圖、時間線、典籍與章節編輯器集中在完整寬度畫布。", "地圖、時間線、典籍與章節編輯器集中在完整寬度畫布。", "Map, timeline, codex, and chapter editor gathered on a full-width canvas.", "地図、タイムライン、写本、章エディタをフル幅キャンバスに集約。", "지도, 타임라인, 코덱스, 장 편집기를 전체 폭 캔버스에 모았습니다.", "Karte, Zeitstrahl, Codex und Kapiteleditor auf einer breiten Leinwand.", "Carte, chronologie, codex et éditeur de chapitre réunis sur une toile pleine largeur.", "Mappa, cronologia, codice ed editor capitoli in una tela a tutta larghezza.", "Mapa, línea temporal, códice y editor de capítulos en un lienzo completo.");
  addLabel("進入", "進入", "Enter", "入る", "입장", "Öffnen", "Entrer", "Entra", "Entrar");
  addLabel("手機展示版", "手機展示版", "Mobile showcase", "モバイル展示版", "모바일 쇼케이스", "Mobile Schauversion", "Version mobile", "Vetrina mobile", "Muestra móvil");
  addLabel("以手機尺寸呈現地圖、編年、Codex 與 Leaf 的口袋體驗。", "以手機尺寸呈現地圖、編年、Codex 與 Leaf 的口袋體驗。", "A pocket-sized map, chronicle, Codex, and Leaf experience.", "地図、年代記、Codex、Leafをポケットサイズで体験。", "지도, 연대기, Codex, Leaf를 주머니 크기로 경험하세요.", "Karte, Chronik, Codex und Leaf im Taschenformat.", "Une expérience de poche avec carte, chronique, Codex et Leaf.", "Esperienza tascabile con mappa, cronaca, Codex e Leaf.", "Una experiencia de bolsillo con mapa, crónica, Codex y Leaf.");
  addLabel("開啟", "開啟", "Open", "開く", "열기", "Öffnen", "Ouvrir", "Apri", "Abrir");
  addLabel("靜態部署入口，不需要建置流程。既有桌面版與手機版檔案保持原樣。", "靜態部署入口，不需要建置流程。既有桌面版與手機版檔案保持原樣。", "Static deployment entry. No build step required; desktop and mobile files stay intact.", "静的公開入口。ビルド不要で、デスクトップ版とモバイル版のファイルはそのままです。", "정적 배포 입구입니다. 빌드 단계가 필요 없으며 데스크톱과 모바일 파일은 그대로 유지됩니다.", "Statischer Einstieg ohne Build-Schritt; Desktop- und Mobile-Dateien bleiben intakt.", "Entrée statique sans étape de build ; les fichiers desktop et mobile restent intacts.", "Ingresso statico senza build; i file desktop e mobile restano intatti.", "Entrada estática sin build; los archivos de escritorio y móvil permanecen intactos.");

  addLabel("An Atlas of the Sundered Reach", "裂境地圖集", "An Atlas of the Sundered Reach", "分かたれた辺境の地図帳", "갈라진 변방의 지도책", "Ein Atlas der Gespaltenen Weite", "Un atlas de la Marche fendue", "Un atlante della Marca Spezzata", "Un atlas del Confín Hendido");
  addLabel("drawn by hand · folio of the reach", "手繪 · 邊境卷冊", "drawn by hand · folio of the reach", "手描き · 辺境のフォリオ", "손그림 · 변방의 폴리오", "von Hand gezeichnet · Folio der Weite", "dessiné à la main · folio de la marche", "disegnato a mano · folio della marca", "dibujado a mano · folio del confín");
  addLabel("drawn by hand 繚 folio of the reach", "手繪 · 邊境卷冊", "drawn by hand · folio of the reach", "手描き · 辺境のフォリオ", "손그림 · 변방의 폴리오", "von Hand gezeichnet · Folio der Weite", "dessiné à la main · folio de la marche", "disegnato a mano · folio della marca", "dibujado a mano · folio del confín");
  addLabel("200 LEAGUES", "200 里格", "200 LEAGUES", "200リーグ", "200 리그", "200 MEILEN", "200 LIEUES", "200 LEGHE", "200 LEGUAS");
  addLabel("N", "北", "N", "北", "북", "N", "N", "N", "N");
  addLabel("Drawing borders of", "正在繪製邊界：", "Drawing borders of", "境界を描画中：", "경계 그리는 중:", "Zeichne Grenzen von", "Tracé des frontières de", "Disegno confini di", "Dibujando fronteras de");
  addLabel("click + drag on the map · release to commit", "在地圖上點擊拖曳 · 放開以套用", "click + drag on the map · release to commit", "地図上でクリックしてドラッグ · 離すと確定", "지도에서 클릭+드래그 · 놓으면 적용", "auf der Karte klicken + ziehen · loslassen zum Speichern", "cliquez + glissez sur la carte · relâchez pour valider", "clic + trascina sulla mappa · rilascia per confermare", "clic + arrastra en el mapa · suelta para confirmar");
  addLabel("click + drag on the map 繚 release to commit", "在地圖上點擊拖曳 · 放開以套用", "click + drag on the map · release to commit", "地図上でクリックしてドラッグ · 離すと確定", "지도에서 클릭+드래그 · 놓으면 적용", "auf der Karte klicken + ziehen · loslassen zum Speichern", "cliquez + glissez sur la carte · relâchez pour valider", "clic + trascina sulla mappa · rilascia per confermare", "clic + arrastra en el mapa · suelta para confirmar");

  addLabel("drag rail to scrub. dots are events. bars are lifespans — small marks are snapshots.", "拖曳軌道可瀏覽年代。點為事件，橫條為生命週期，小刻痕為快照。", "drag rail to scrub. dots are events. bars are lifespans — small marks are snapshots.", "レールをドラッグして年代を移動。点は事件、バーは寿命、小さな印はスナップショット。", "레일을 드래그해 시간을 탐색하세요. 점은 사건, 막대는 생애, 작은 표시는 스냅샷입니다.", "Leiste ziehen, um zu scrubben. Punkte sind Ereignisse, Balken Lebensspannen, kleine Marken Schnappschüsse.", "Glissez le rail pour parcourir. Les points sont des événements, les barres des vies, les marques des instantanés.", "Trascina il binario per scorrere. I punti sono eventi, le barre vite, i segni istantanee.", "Arrastra el riel para recorrer. Los puntos son eventos, las barras vidas, las marcas instantáneas.");
  addLabel("drag rail vertically to scrub. dots are events. bars are lifespans — small marks are snapshots.", "垂直拖曳軌道可瀏覽年代。點為事件，橫條為生命週期，小刻痕為快照。", "drag rail vertically to scrub. dots are events. bars are lifespans — small marks are snapshots.", "レールを縦にドラッグして年代を移動。点は事件、バーは寿命、小さな印はスナップショット。", "세로 레일을 드래그해 시간을 탐색하세요. 점은 사건, 막대는 생애, 작은 표시는 스냅샷입니다.", "Leiste vertikal ziehen, um zu scrubben. Punkte sind Ereignisse, Balken Lebensspannen, kleine Marken Schnappschüsse.", "Glissez le rail verticalement pour parcourir. Les points sont des événements, les barres des vies, les marques des instantanés.", "Trascina il binario verticale per scorrere. I punti sono eventi, le barre vite, i segni istantanee.", "Arrastra el riel vertical para recorrer. Los puntos son eventos, las barras vidas, las marcas instantáneas.");
  addLabel("the rail is non-linear: eras keep their visual room.", "時間軌非線性：每個時代都保留可閱讀的視覺空間。", "the rail is non-linear: eras keep their visual room.", "レールは非線形です。各時代に視覚的な余白があります。", "레일은 비선형입니다. 각 시대가 시각적 공간을 유지합니다.", "Die Leiste ist nichtlinear: Epochen behalten Raum.", "Le rail est non linéaire : les ères gardent leur espace visuel.", "Il binario è non lineare: le ere mantengono spazio visivo.", "El riel no es lineal: las eras conservan espacio visual.");

  const titleMap = new Map();
  titleMap.set("The Atelier of Aevenmere", phrases.get("The Atelier of Aevenmere"));
  titleMap.set("The Atelier of Aevenmere — A Cartographer's Setting Bible", {
    "zh-Hant": "艾文米爾工坊 — 製圖師設定集",
    en: "The Atelier of Aevenmere — A Cartographer's Setting Bible",
    ja: "アイヴンミアの工房 — 地図職人の設定集",
    ko: "에이븐미어 작업실 — 지도 제작자의 설정집",
    de: "Das Atelier von Aevenmere — Setting-Bibel eines Kartographen",
    fr: "L'Atelier d'Aevenmere — Bible d'univers d'un cartographe",
    it: "L'Atelier di Aevenmere — Bibbia d'ambientazione del cartografo",
    es: "El Atelier de Aevenmere — Biblia de mundo del cartógrafo"
  });
  titleMap.set("The Atelier of Aevenmere — Mobile", {
    "zh-Hant": "艾文米爾工坊 — 手機版",
    en: "The Atelier of Aevenmere — Mobile",
    ja: "アイヴンミアの工房 — モバイル",
    ko: "에이븐미어 작업실 — 모바일",
    de: "Das Atelier von Aevenmere — Mobil",
    fr: "L'Atelier d'Aevenmere — Mobile",
    it: "L'Atelier di Aevenmere — Mobile",
    es: "El Atelier de Aevenmere — Móvil"
  });

  const pluralWords = {
    volumes: ["卷", "volumes", "巻", "권", "Bände", "volumes", "volumi", "volúmenes"],
    chapters: ["章", "chapters", "章", "장", "Kapitel", "chapitres", "capitoli", "capítulos"],
    drafted: ["已起草", "drafted", "下書き済み", "초안", "entworfen", "rédigés", "redatti", "borradores"],
    words: ["字", "words", "語", "단어", "Wörter", "mots", "parole", "palabras"],
    events: ["事件", "events", "事件", "사건", "Ereignisse", "événements", "eventi", "eventos"],
    souls: ["人物", "souls", "魂", "영혼", "Seelen", "âmes", "anime", "almas"],
    orders: ["結社", "orders", "結社", "결사", "Orden", "ordres", "ordini", "órdenes"],
    realms: ["領域", "realms", "諸領", "영역", "Reiche", "royaumes", "regni", "reinos"],
    members: ["成員", "members", "構成員", "구성원", "Mitglieder", "membres", "membri", "miembros"],
    hands: ["人手", "hands", "人手", "손", "Hände", "mains", "mani", "manos"],
    lines: ["行", "lines", "行", "줄", "Zeilen", "lignes", "righe", "líneas"],
    "recorded events": ["已記錄事件", "recorded events", "記録済み事件", "기록된 사건", "aufgezeichnete Ereignisse", "événements enregistrés", "eventi registrati", "eventos registrados"]
  };
  const pluralLangOrder = ["zh-Hant", "en", "ja", "ko", "de", "fr", "it", "es"];

  function normalizeLang(code) {
    const c = String(code || "").trim();
    if (LANG_CODES.has(c)) return c;
    const lower = c.toLowerCase();
    if (lower === "zh" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant") return "zh-Hant";
    if (lower.startsWith("ja")) return "ja";
    if (lower.startsWith("ko")) return "ko";
    if (lower.startsWith("de")) return "de";
    if (lower.startsWith("fr")) return "fr";
    if (lower.startsWith("it")) return "it";
    if (lower.startsWith("es")) return "es";
    if (lower.startsWith("en")) return "en";
    return "";
  }

  function initialLang() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = normalizeLang(params.get("lang"));
    if (fromUrl) return fromUrl;
    try {
      const stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
      if (stored) return stored;
    } catch {}
    const navs = [navigator.language, ...(navigator.languages || [])];
    for (const n of navs) {
      const lang = normalizeLang(n);
      if (lang) return lang;
    }
    return "zh-Hant";
  }

  let currentLang = initialLang();
  const textSource = new WeakMap();
  const textLast = new WeakMap();
  const attrSource = new WeakMap();
  const listeners = new Set();
  let observer = null;
  let titleSource = document.title;

  function tableFor(source) {
    const direct = phraseSourceFor(source);
    if (direct) return phrases.get(direct);
    const trimmed = source.trim();
    const trimmedSource = trimmed !== source ? phraseSourceFor(trimmed) : null;
    if (trimmedSource) return phrases.get(trimmedSource);
    return null;
  }

  function phraseSourceFor(value) {
    if (phrases.has(value)) return value;
    return reversePhrases.get(value) || null;
  }

  function applyCase(source, value) {
    if (!value) return value;
    if (source.toUpperCase() === source && source.length > 1) return value.toLocaleUpperCase();
    return value;
  }

  function translatePattern(source, lang) {
    const raw = source.trim();
    let m = raw.match(/^(\d[\d,\.]*) (volumes|chapters|drafted|words|events|souls|orders|realms|members|hands|lines|recorded events)$/i);
    if (m) {
      const words = pluralWords[m[2].toLowerCase()];
      const idx = pluralLangOrder.indexOf(lang);
      return `${m[1]} ${words[idx >= 0 ? idx : 1]}`;
    }
    m = raw.match(/^(\d[\d,\.]*) w$/);
    if (m) return `${m[1]} ${translatePattern("1 words", lang).replace(/^1 /, "")}`;
    m = raw.match(/^± (\d+)y$/);
    if (m) {
      const unit = { "zh-Hant": "年", en: "y", ja: "年", ko: "년", de: "J", fr: "a", it: "a", es: "a" }[lang] || "y";
      return `± ${m[1]}${unit}`;
    }
    m = raw.match(/^Book · (.+)$/);
    if (m) {
      const label = tr("Book", lang);
      return `${label} · ${tr(m[1], lang)}`;
    }
    m = raw.match(/^Chapter ([0-9]+) · (.+)$/);
    if (m) {
      const label = tr("Chapter", lang);
      return `${label} ${m[1]} · ${tr(m[2], lang)}`;
    }
    m = raw.match(/^at (.+)$/);
    if (m) return `${tr("at", lang)} ${tr(m[1], lang)}`;
    m = raw.match(/^seated at (.+)$/);
    if (m) return `${tr("seated at", lang)} ${tr(m[1], lang)}`;
    m = raw.match(/^capital · (.+)$/);
    if (m) return `${tr("capital", lang)} · ${tr(m[1], lang)}`;
    m = raw.match(/^led by (.+)$/);
    if (m) return `${tr("led by", lang)} ${tr(m[1], lang)}`;
    m = raw.match(/^seat: (.+)$/);
    if (m) return `${tr("seat", lang)}: ${tr(m[1], lang)}`;
    m = raw.match(/^hue ([0-9]+°)$/);
    if (m) return `${tr("hue", lang)} ${m[1]}`;
    m = raw.match(/^scrub to birth$/);
    if (m) return tr("scrub to birth", lang);
    m = raw.match(/^scrub to founding$/);
    if (m) return tr("scrub to founding", lang);
    m = raw.match(/^scrub to (.+)$/);
    if (m) return `${tr("scrub to", lang)} ${tr(m[1], lang)}`;
    m = raw.match(/^(Through the years|Ties) · ([0-9]+)$/);
    if (m) return `${tr(m[1], lang)} · ${m[2]}`;
    m = raw.match(/^— no events near (.+) · showing earliest —$/);
    if (m) return `${tr("— no events near", lang)} ${m[1]} · ${tr("showing earliest", lang)} —`;
    return null;
  }

  addLabel("Book", "書", "Book", "本", "책", "Buch", "Livre", "Libro", "Libro");
  addLabel("Chapter", "章", "Chapter", "章", "장", "Kapitel", "Chapitre", "Capitolo", "Capítulo");
  addLabel("seated at", "駐於", "seated at", "拠点", "소재지", "Sitz in", "siège à", "sede a", "sede en");
  addLabel("led by", "由", "led by", "率いる者", "이끄는 이", "geführt von", "dirigé par", "guidato da", "dirigido por");
  addLabel("seat", "席位", "seat", "拠点", "소재", "Sitz", "siège", "sede", "sede");
  addLabel("hue", "色相", "hue", "色相", "색상", "Farbton", "teinte", "tonalità", "tono");
  addLabel("scrub to", "跳至", "scrub to", "移動先", "이동", "zu", "aller à", "vai a", "ir a");
  addLabel("scrub to birth", "跳至出生年", "scrub to birth", "誕生年へ移動", "출생 연도로 이동", "zur Geburt", "aller à la naissance", "vai alla nascita", "ir al nacimiento");
  addLabel("scrub to founding", "跳至建立年", "scrub to founding", "創設年へ移動", "창립 연도로 이동", "zur Gründung", "aller à la fondation", "vai alla fondazione", "ir a la fundación");
  addLabel("showing earliest", "顯示最早項目", "showing earliest", "最初を表示", "가장 이른 항목 표시", "zeige früheste", "affiche les premiers", "mostra i primi", "mostrando los primeros");
  addLabel("Optional direction — 'they meet in the rain'…", "可選方向 —「他們在雨中相遇」…", "Optional direction — 'they meet in the rain'…", "任意の方向性 —「雨の中で出会う」…", "선택 지시 — '그들은 비 속에서 만난다'…", "Optionale Richtung — „sie treffen sich im Regen“…", "Direction facultative — « ils se rencontrent sous la pluie »…", "Direzione facoltativa — 'si incontrano nella pioggia'…", "Dirección opcional — 'se encuentran bajo la lluvia'…");
  addLabel("The Leaf · 葉", "葉箋 · 葉", "The Leaf · Leaf", "葉片 · 葉", "잎장 · 잎", "Das Blatt · Blatt", "La Feuille · Feuille", "La Foglia · Foglia", "La Hoja · Hoja");
  addLabel("Summon · 喚", "召喚 · 喚", "Summon · Call", "召喚 · 喚", "소환 · 부름", "Beschwören · Ruf", "Invocation · Appel", "Evoca · Chiamata", "Invocar · Llamada");
  addLabel("The Chronicle · 紀", "編年史 · 紀", "The Chronicle · Record", "年代記 · 紀", "연대기 · 기록", "Die Chronik · Aufzeichnung", "La Chronique · Registre", "La Cronaca · Registro", "La Crónica · Registro");
  addLabel("— no detail penned —", "— 尚未寫下細節 —", "— no detail penned —", "— 詳細はまだ書かれていません —", "— 아직 적힌 세부 내용 없음 —", "— noch kein Detail niedergeschrieben —", "— aucun détail rédigé —", "— nessun dettaglio scritto —", "— no hay detalle escrito —");
  addLabel("Year", "年份", "Year", "年", "연도", "Jahr", "Année", "Anno", "Año");
  addLabel("Focus", "焦點", "Focus", "焦点", "초점", "Fokus", "Foyer", "Fuoco", "Foco");
  addLabel("anywhere", "任何地點", "anywhere", "どこでも", "어디든", "überall", "n'importe où", "ovunque", "cualquier lugar");
  addLabel("none bound", "未綁定", "none bound", "未紐付け", "연결 없음", "keine Bindung", "aucun lien", "nessun legame", "sin vínculo");
  addLabel("a place", "一個地點", "a place", "場所", "장소", "ein Ort", "un lieu", "un luogo", "un lugar");
  addLabel("The Frost-Kindred", "霜裔", "The Frost-Kindred", "霜の同族", "서리 혈족", "Die Frostsippe", "La Parentèle du Givre", "La Stirpe del Gelo", "La Estirpe de la Escarcha");
  addLabel("x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...", "x,y x,y...");

  const seedRows = [
    ["Vaelora", "維洛拉", "Vaelora", "ヴァエローラ", "바엘로라", "Vaelora", "Vaelora", "Vaelora", "Vaelora"],
    ["Cael Vaer", "凱爾維爾", "Cael Vaer", "カエル・ヴェール", "카엘 베어", "Cael Vaer", "Cael Vaer", "Cael Vaer", "Cael Vaer"],
    ["Muirne Reach", "穆恩河域", "Muirne Reach", "ミュルネ辺境", "뮈르네 변경", "Muirne Reach", "Muirne Reach", "Muirne Reach", "Muirne Reach"],
    ["Olbrand", "歐布蘭德", "Olbrand", "オルブランド", "올브랜드", "Olbrand", "Olbrand", "Olbrand", "Olbrand"],
    ["The Ashen Wastes", "灰燼荒原", "The Ashen Wastes", "灰の荒野", "잿빛 황무지", "Die Aschenöden", "Les Landes cendrées", "Le Lande Cineree", "Los Yermos Cenicientos"],
    ["Coalmouth", "煤口鎮", "Coalmouth", "コールマウス", "콜마우스", "Coalmouth", "Coalmouth", "Coalmouth", "Coalmouth"],
    ["Therendil", "瑟倫迪爾", "Therendil", "セレンディル", "테렌딜", "Therendil", "Therendil", "Therendil", "Therendil"],
    ["Hollow Spire", "空心尖塔", "Hollow Spire", "虚ろの尖塔", "빈 첨탑", "Hollow Spire", "Hollow Spire", "Hollow Spire", "Hollow Spire"],
    ["The Drowning Isles", "沉潮群島", "The Drowning Isles", "沈みゆく島々", "가라앉는 제도", "Die Ertrinkenden Inseln", "Les Îles noyantes", "Le Isole Affoganti", "Las Islas Ahogadas"],
    ["Brackhold", "布拉克霍德", "Brackhold", "ブラックホールド", "브랙홀드", "Brackhold", "Brackhold", "Brackhold", "Brackhold"],
    ["Korr Eithun", "科爾艾森", "Korr Eithun", "コル・エイサン", "코르 에이툰", "Korr Eithun", "Korr Eithun", "Korr Eithun", "Korr Eithun"],
    ["Vethgar", "維斯加", "Vethgar", "ヴェスガー", "베스가르", "Vethgar", "Vethgar", "Vethgar", "Vethgar"],
    ["Sehrigad", "塞赫里加德", "Sehrigad", "セーリガド", "세흐리가드", "Sehrigad", "Sehrigad", "Sehrigad", "Sehrigad"],
    ["Khorvad", "霍爾瓦德", "Khorvad", "ホルヴァド", "호르바드", "Khorvad", "Khorvad", "Khorvad", "Khorvad"],
    ["Old Coalmouth", "舊煤口", "Old Coalmouth", "旧コールマウス", "옛 콜마우스", "Alt-Coalmouth", "Vieux Coalmouth", "Vecchia Coalmouth", "Viejo Coalmouth"],
    ["The Sunken Choir", "沉沒唱詩班", "The Sunken Choir", "沈んだ聖歌隊", "가라앉은 성가대", "Der Versunkene Chor", "Le Chœur englouti", "Il Coro Sommerso", "El Coro Hundido"],
    ["Tideglass", "潮玻璃", "Tideglass", "タイドグラス", "타이드글래스", "Tideglass", "Tideglass", "Tideglass", "Tideglass"],
    ["Highland country of long winters and longer memory.", "高地之國，冬季漫長，記憶更長。", "Highland country of long winters and longer memory.", "冬が長く、記憶はさらに長い高地の国。", "긴 겨울과 더 긴 기억을 지닌 고원 지방.", "Hochland mit langen Wintern und noch längerem Gedächtnis.", "Pays de hautes terres aux longs hivers et à la mémoire plus longue encore.", "Terra d'altura dai lunghi inverni e dalla memoria ancora più lunga.", "País de tierras altas, de inviernos largos y memoria aún más larga."],
    ["Salt marshes and lantern-fishers.", "鹽沼與提燈漁人之地。", "Salt marshes and lantern-fishers.", "塩沼と灯を持つ漁師たち。", "소금 습지와 등불 어부들의 땅.", "Salzmarschen und Laternenfischer.", "Marais salants et pêcheurs aux lanternes.", "Paludi salmastre e pescatori con lanterne.", "Marismas saladas y pescadores de faroles."],
    ["What burned here burned for a hundred years.", "此地燃起之火，燃了一百年。", "What burned here burned for a hundred years.", "ここで燃えたものは百年燃え続けた。", "이곳에서 탄 것은 백 년 동안 탔다.", "Was hier brannte, brannte hundert Jahre lang.", "Ce qui brûla ici brûla pendant cent ans.", "Ciò che bruciò qui arse per cento anni.", "Lo que ardió aquí ardió durante cien años."],
    ["Vineyards, libraries, and one poet on retainer.", "葡萄園、圖書館，還有一位受聘詩人。", "Vineyards, libraries, and one poet on retainer.", "葡萄畑、図書館、そして抱えの詩人が一人。", "포도밭과 도서관, 그리고 고용된 시인 한 명.", "Weinberge, Bibliotheken und ein angestellter Dichter.", "Des vignobles, des bibliothèques et un poète sous contrat.", "Vigneti, biblioteche e un poeta a stipendio.", "Viñedos, bibliotecas y un poeta en nómina."],
    ["Three hundred islands at high tide, eleven at low.", "滿潮三百座島，退潮只剩十一座。", "Three hundred islands at high tide, eleven at low.", "満潮では三百の島、干潮では十一。", "밀물에는 삼백 개의 섬, 썰물에는 열하나.", "Dreihundert Inseln bei Flut, elf bei Ebbe.", "Trois cents îles à marée haute, onze à marée basse.", "Trecento isole con l'alta marea, undici con la bassa.", "Trescientas islas con marea alta, once con marea baja."],
    ["The Frost-Kindred. They do not name the dead.", "霜裔之地。他們不為死者命名。", "The Frost-Kindred. They do not name the dead.", "霜の同族。彼らは死者に名を与えない。", "서리 혈족. 그들은 죽은 이의 이름을 부르지 않는다.", "Die Frostsippe. Sie benennen die Toten nicht.", "La Parentèle du Givre. Ils ne nomment pas les morts.", "La Stirpe del Gelo. Non nominano i morti.", "La Estirpe de la Escarcha. No nombran a los muertos."],
    ["Caravan princes. Every coin has been bitten.", "商隊王子的國度。每枚硬幣都被咬驗過。", "Caravan princes. Every coin has been bitten.", "隊商の王子たち。硬貨はすべて噛んで確かめられている。", "대상 왕자들의 땅. 모든 동전에는 이빨 자국이 있다.", "Karawanenfürsten. Jede Münze wurde angebissen.", "Princes caravaniers. Chaque pièce porte une morsure.", "Principi carovanieri. Ogni moneta è stata morsa.", "Príncipes de caravana. Cada moneda ha sido mordida."],
    ["The Mythic Age", "神話時代", "The Mythic Age", "神話の時代", "신화 시대", "Das Mythische Zeitalter", "L'Âge mythique", "L'Era Mitica", "La Edad Mítica"],
    ["Before written tongue. The Three Walkers. The First Sundering.", "文字誕生之前。三行者。第一次裂解。", "Before written tongue. The Three Walkers. The First Sundering.", "文字以前。三人の歩み手。最初の分裂。", "문자가 있기 전. 세 방랑자. 첫 분열.", "Vor der Schrift. Die Drei Wanderer. Die Erste Spaltung.", "Avant la langue écrite. Les Trois Marcheurs. La Première Fracture.", "Prima della lingua scritta. I Tre Camminatori. La Prima Scissione.", "Antes de la lengua escrita. Los Tres Caminantes. La Primera Hendidura."],
    ["The Kindling", "引火年代", "The Kindling", "火付けの時代", "점화기", "Die Entfachung", "L'Embrasement", "L'Accensione", "El Encendido"],
    ["Cities rise. Iron is found, lost, found again.", "城市興起。鐵被發現、失落，又再次被找到。", "Cities rise. Iron is found, lost, found again.", "都市が興る。鉄は見つかり、失われ、また見つかる。", "도시가 일어난다. 철은 발견되고, 잃어버리고, 다시 발견된다.", "Städte entstehen. Eisen wird gefunden, verloren und wiedergefunden.", "Les cités s'élèvent. Le fer est trouvé, perdu, puis retrouvé.", "Le città sorgono. Il ferro viene trovato, perduto, ritrovato.", "Las ciudades se alzan. El hierro se encuentra, se pierde y vuelve a encontrarse."],
    ["Age of Kings", "諸王時代", "Age of Kings", "王たちの時代", "왕들의 시대", "Zeitalter der Könige", "Âge des rois", "Età dei Re", "Edad de Reyes"],
    ["Borders harden. Songs become law.", "邊界凝固，歌謠成為律法。", "Borders harden. Songs become law.", "境界は固まり、歌は法となる。", "국경은 굳어지고 노래는 법이 된다.", "Grenzen verhärten. Lieder werden Gesetz.", "Les frontières se durcissent. Les chants deviennent loi.", "I confini si irrigidiscono. I canti diventano legge.", "Las fronteras se endurecen. Las canciones se vuelven ley."],
    ["The Long Quiet", "漫長靜默", "The Long Quiet", "長き静寂", "긴 침묵", "Die Lange Stille", "Le Long Silence", "Il Lungo Silenzio", "El Largo Silencio"],
    ["Plague, then plenty. The libraries swell.", "瘟疫之後，是豐饒。書庫逐漸膨脹。", "Plague, then plenty. The libraries swell.", "疫病、そして豊穣。図書館は膨らんでいく。", "역병, 그 뒤의 풍요. 도서관은 불어난다.", "Pest, dann Überfluss. Die Bibliotheken schwellen an.", "La peste, puis l'abondance. Les bibliothèques gonflent.", "Peste, poi abbondanza. Le biblioteche si riempiono.", "Plaga y luego abundancia. Las bibliotecas crecen."],
    ["The Burning Years", "燃燒年代", "The Burning Years", "燃える年月", "불타는 해들", "Die Brennenden Jahre", "Les Années ardentes", "Gli Anni Ardenti", "Los Años Ardientes"],
    ["Eighty years that broke a thousand.", "八十年，折斷了一千年。", "Eighty years that broke a thousand.", "千年を砕いた八十年。", "천 년을 꺾은 팔십 년.", "Achtzig Jahre, die tausend zerbrachen.", "Quatre-vingts ans qui en brisèrent mille.", "Ottant'anni che ne spezzarono mille.", "Ochenta años que quebraron mil."],
    ["Present Reckoning", "當前紀年", "Present Reckoning", "現在紀年", "현재 연대", "Gegenwärtige Zeitrechnung", "Datation présente", "Computo Presente", "Cómputo Presente"],
    ["Now. Or thereabouts.", "現在。差不多如此。", "Now. Or thereabouts.", "今。あるいはそのあたり。", "지금. 혹은 그 근처.", "Jetzt. Oder ungefähr.", "Maintenant. Ou à peu près.", "Ora. O giù di lì.", "Ahora. O por ahí."],
    ["The First Sundering", "第一次裂解", "The First Sundering", "最初の分裂", "첫 분열", "Die Erste Spaltung", "La Première Fracture", "La Prima Scissione", "La Primera Hendidura"],
    ["The continent splits along a seam no one remembers carving.", "大陸沿著一道無人記得曾刻下的裂縫分開。", "The continent splits along a seam no one remembers carving.", "大陸は、誰も刻んだ覚えのない継ぎ目に沿って割れる。", "대륙은 아무도 새긴 기억이 없는 이음새를 따라 갈라진다.", "Der Kontinent spaltet sich entlang einer Naht, an deren Schnitt sich niemand erinnert.", "Le continent se fend le long d'une couture que nul ne se souvient avoir taillée.", "Il continente si divide lungo una cucitura che nessuno ricorda di aver inciso.", "El continente se parte por una costura que nadie recuerda haber tallado."],
    ["The Three Walkers depart", "三行者離去", "The Three Walkers depart", "三人の歩み手が去る", "세 방랑자가 떠나다", "Die Drei Wanderer brechen auf", "Les Trois Marcheurs s'en vont", "I Tre Camminatori partono", "Los Tres Caminantes parten"],
    ["They leave behind only their footprints, which are still walked.", "他們只留下腳印，而後人至今仍沿著那些腳印行走。", "They leave behind only their footprints, which are still walked.", "彼らが残したのは足跡だけで、今もそこを人々が歩く。", "그들이 남긴 것은 발자국뿐이며, 사람들은 아직도 그 위를 걷는다.", "Sie hinterlassen nur Fußspuren, die noch heute begangen werden.", "Ils ne laissent que leurs empreintes, que l'on foule encore.", "Lasciano soltanto impronte, ancora percorse.", "Solo dejan huellas, que todavía se recorren."],
    ["Olbrand founded", "歐布蘭德建立", "Olbrand founded", "オルブランド創設", "올브랜드 창건", "Olbrand gegründet", "Fondation d'Olbrand", "Fondazione di Olbrand", "Fundación de Olbrand"],
    ["On a sandbar that has since moved twice.", "建於一片沙洲；那沙洲後來移動了兩次。", "On a sandbar that has since moved twice.", "その後二度動いた砂州の上に。", "그 뒤 두 번이나 옮겨 간 모래톱 위에서.", "Auf einer Sandbank, die seither zweimal gewandert ist.", "Sur un banc de sable qui s'est depuis déplacé deux fois.", "Su una lingua di sabbia che da allora si è spostata due volte.", "Sobre un banco de arena que desde entonces se ha movido dos veces."],
    ["The Iron Argument", "鐵之爭論", "The Iron Argument", "鉄の論争", "철의 논쟁", "Der Eiserne Streit", "La Querelle du fer", "La Disputa del Ferro", "El Argumento de Hierro"],
    ["Three smiths, two forges, one anvil. The argument is still ongoing.", "三名鐵匠、兩座熔爐、一只鐵砧。爭論至今仍未結束。", "Three smiths, two forges, one anvil. The argument is still ongoing.", "三人の鍛冶、二つの炉、一つの金床。その論争は今も続く。", "대장장이 셋, 화덕 둘, 모루 하나. 논쟁은 아직도 계속된다.", "Drei Schmiede, zwei Essen, ein Amboss. Der Streit dauert an.", "Trois forgerons, deux forges, une enclume. La dispute continue.", "Tre fabbri, due forge, un'incudine. La disputa continua ancora.", "Tres herreros, dos fraguas, un yunque. La discusión continúa."],
    ["Coronation at Cael Vaer", "凱爾維爾加冕", "Coronation at Cael Vaer", "カエル・ヴェールの戴冠", "카엘 베어의 대관", "Krönung in Cael Vaer", "Couronnement à Cael Vaer", "Incoronazione a Cael Vaer", "Coronación en Cael Vaer"],
    ["First named monarch of Vaelora. The crown does not fit her.", "維洛拉第一位具名君主。王冠並不合她。", "First named monarch of Vaelora. The crown does not fit her.", "ヴァエローラで初めて名を記された君主。王冠は彼女に合わない。", "바엘로라 최초의 이름 있는 군주. 왕관은 그녀에게 맞지 않는다.", "Erste namentlich bekannte Monarchin Vaeloras. Die Krone passt ihr nicht.", "Première souveraine nommée de Vaelora. La couronne ne lui va pas.", "Prima sovrana nominata di Vaelora. La corona non le sta bene.", "Primera monarca nombrada de Vaelora. La corona no le queda."],
    ["Hollow Spire opens", "空心尖塔開門", "Hollow Spire opens", "虚ろの尖塔が開く", "빈 첨탑 개방", "Hollow Spire öffnet", "Hollow Spire ouvre ses portes", "Hollow Spire apre", "Hollow Spire abre"],
    ["A library disguised as a court, or the other way around.", "一座偽裝成宮廷的圖書館，或反過來也說得通。", "A library disguised as a court, or the other way around.", "宮廷に偽装した図書館、あるいはその逆。", "궁정으로 위장한 도서관, 혹은 그 반대.", "Eine Bibliothek als Hof verkleidet, oder umgekehrt.", "Une bibliothèque déguisée en cour, ou l'inverse.", "Una biblioteca travestita da corte, o il contrario.", "Una biblioteca disfrazada de corte, o al revés."],
    ["The Lantern Concordat", "提燈協約", "The Lantern Concordat", "灯火協約", "등불 협약", "Das Laternenkonkordat", "Le Concordat des Lanternes", "Il Concordato delle Lanterne", "El Concordato de los Faroles"],
    ["Muirne and Therendil agree on nothing, in writing.", "穆恩與瑟倫迪爾以書面形式同意：彼此沒有共識。", "Muirne and Therendil agree on nothing, in writing.", "ミュルネとセレンディルは、何にも同意しないことを書面で合意する。", "뮈르네와 테렌딜은 아무것에도 동의하지 않기로 서면 합의한다.", "Muirne und Therendil einigen sich schriftlich auf nichts.", "Muirne et Therendil ne s'accordent sur rien, par écrit.", "Muirne e Therendil concordano per iscritto di non concordare su nulla.", "Muirne y Therendil acuerdan por escrito no estar de acuerdo en nada."],
    ["Coalmouth burns", "煤口鎮焚毀", "Coalmouth burns", "コールマウス炎上", "콜마우스가 불타다", "Coalmouth brennt", "Coalmouth brûle", "Coalmouth brucia", "Coalmouth arde"],
    ["The fire that names the Wastes. The Ember Hand is blamed.", "命名荒原的那場大火。餘燼之手被歸咎為元凶。", "The fire that names the Wastes. The Ember Hand is blamed.", "荒野に名を与えた火。熾火の手が責められる。", "황무지에 이름을 붙인 불. 잿불의 손이 비난받는다.", "Das Feuer, das den Öden ihren Namen gab. Die Gluthand wird beschuldigt.", "Le feu qui donna son nom aux Landes. La Main des Braises est accusée.", "Il fuoco che diede nome alle Lande. La Mano di Brace viene accusata.", "El fuego que dio nombre a los Yermos. Se culpa a la Mano de Ascuas."],
    ["The Last Burning Year", "最後燃燒之年", "The Last Burning Year", "最後の燃える年", "마지막 불타는 해", "Das Letzte Brennende Jahr", "La Dernière Année ardente", "L'Ultimo Anno Ardente", "El Último Año Ardiente"],
    ["The fires stop. No one is sure why. Several claim credit.", "火勢停了。沒有人確定原因，卻有好幾方聲稱功勞。", "The fires stop. No one is sure why. Several claim credit.", "火は止む。理由は誰にもわからない。何人かが功績を主張する。", "불길이 멈춘다. 이유는 아무도 확신하지 못한다. 여러 이가 공을 주장한다.", "Die Feuer enden. Niemand weiß genau warum. Mehrere beanspruchen den Ruhm.", "Les feux cessent. Nul ne sait pourquoi. Plusieurs s'en attribuent le mérite.", "Gli incendi cessano. Nessuno sa perché. Diversi ne rivendicano il merito.", "Los fuegos se detienen. Nadie sabe por qué. Varios se adjudican el mérito."],
    ["A stranger arrives at Brackhold", "陌生人抵達布拉克霍德", "A stranger arrives at Brackhold", "よそ者がブラックホールドに到着", "낯선 이가 브랙홀드에 도착하다", "Eine Fremde erreicht Brackhold", "Une étrangère arrive à Brackhold", "Una straniera arriva a Brackhold", "Una extraña llega a Brackhold"],
    ["She carries a map of the Reach as it was before the Sundering.", "她帶著一幅裂解前邊境的地圖。", "She carries a map of the Reach as it was before the Sundering.", "彼女は分裂以前の辺境を描いた地図を携えている。", "그녀는 분열 전 변경의 지도를 지니고 있다.", "Sie trägt eine Karte der Weite, wie sie vor der Spaltung war.", "Elle porte une carte de la Marche telle qu'elle était avant la Fracture.", "Porta una mappa della Marca com'era prima della Scissione.", "Lleva un mapa del Confín tal como era antes de la Hendidura."],
    ["The Ashen Holdfast", "灰燼堡壘", "The Ashen Holdfast", "灰の砦", "잿빛 보루", "Die Aschenfeste", "Le Fort cendré", "La Rocca Cinerea", "El Bastión Cenizo"],
    ["The Order of the Open Leaf", "開葉結社", "The Order of the Open Leaf", "開かれた葉の結社", "펼친 잎 결사", "Der Orden des Offenen Blatts", "L'Ordre de la Feuille ouverte", "L'Ordine della Foglia Aperta", "La Orden de la Hoja Abierta"],
    ["The Ember Hand", "餘燼之手", "The Ember Hand", "熾火の手", "잿불의 손", "Die Gluthand", "La Main des Braises", "La Mano di Brace", "La Mano de Ascuas"],
    ["The Lantern Concord", "提燈同盟", "The Lantern Concord", "灯火盟約", "등불 협화회", "Der Laternenbund", "La Concorde des Lanternes", "La Concordia delle Lanterne", "La Concordia de los Faroles"],
    ["The Tide-Counters", "潮汐記數者", "The Tide-Counters", "潮数え", "조수 계수자들", "Die Gezeitenzählerinnen", "Les Compteuses de marée", "Le Contamaree", "Las Contadoras de Mareas"],
    ["Aelda the First-Crowned", "初冠者艾爾妲", "Aelda the First-Crowned", "初冠のアエルダ", "첫 왕관의 아엘다", "Aelda die Erstgekrönte", "Aelda la Première-Couronnée", "Aelda la Prima Incoronata", "Aelda la Primera Coronada"],
    ["Queen Iruna", "伊露娜女王", "Queen Iruna", "イルナ女王", "이루나 여왕", "Königin Iruna", "Reine Iruna", "Regina Iruna", "Reina Iruna"],
    ["Edrun Vael (regent)", "艾德倫・維爾（攝政）", "Edrun Vael (regent)", "エドルン・ヴェール（摂政）", "에드룬 바엘(섭정)", "Edrun Vael (Regent)", "Edrun Vael (régent)", "Edrun Vael (reggente)", "Edrun Vael (regente)"],
    ["The Lantern Council", "提燈議會", "The Lantern Council", "灯火評議会", "등불 평의회", "Der Laternenrat", "Le Conseil des Lanternes", "Il Consiglio delle Lanterne", "El Consejo de los Faroles"],
    ["Magisterix Veth", "維絲大導師", "Magisterix Veth", "マギステリクス・ヴェス", "마지스테릭스 베스", "Magisterix Veth", "Magisterix Veth", "Magisterix Veth", "Magisterix Veth"],
    ["The Vintner-Kings", "酒農諸王", "The Vintner-Kings", "葡萄酒王たち", "양조 왕들", "Die Winzerkönige", "Les Rois-Vignerons", "I Re Vignaioli", "Los Reyes Vinateros"],
    ["King Halor the Reading", "讀書王哈洛爾", "King Halor the Reading", "読書王ハロール", "책 읽는 왕 할로르", "König Halor der Lesende", "Roi Halor le Lecteur", "Re Halor il Lettore", "Rey Halor el Lector"],
    ["The Council of Leaves", "葉之議會", "The Council of Leaves", "葉の評議会", "잎의 평의회", "Der Rat der Blätter", "Le Conseil des Feuilles", "Il Consiglio delle Foglie", "El Consejo de las Hojas"],
    ["First Caravan-Prince Daril", "首任商隊王子達里爾", "First Caravan-Prince Daril", "初代隊商公ダリル", "초대 대상공 다릴", "Erster Karawanenfürst Daril", "Premier prince caravanier Daril", "Primo Principe-Carovaniere Daril", "Primer Príncipe de Caravana Daril"],
    ["Caravan-Prince Hithran VII", "商隊王子希斯蘭七世", "Caravan-Prince Hithran VII", "隊商公ヒスラン七世", "대상공 히스란 7세", "Karawanenfürst Hithran VII.", "Prince caravanier Hithran VII", "Principe-Carovaniere Hithran VII", "Príncipe de Caravana Hithran VII"],
    ["Iron-Marshal Berek", "鐵元帥貝雷克", "Iron-Marshal Berek", "鉄帥ベレク", "철원수 베렉", "Eisenmarschall Berek", "Maréchal-de-Fer Berek", "Maresciallo di Ferro Berek", "Mariscal de Hierro Berek"],
    ["Iron-Marshal Yshen", "鐵元帥伊申", "Iron-Marshal Yshen", "鉄帥イシェン", "철원수 이셴", "Eisenmarschall Yshen", "Maréchal-de-Fer Yshen", "Maresciallo di Ferro Yshen", "Mariscal de Hierro Yshen"],
    ["Lirien the First Reader", "初讀者莉莉恩", "Lirien the First Reader", "最初の読者リリエン", "첫 독자 리리엔", "Lirien die Erste Leserin", "Lirien la Première Lectrice", "Lirien la Prima Lettrice", "Lirien la Primera Lectora"],
    ["Magister Tovar", "托瓦爾導師", "Magister Tovar", "マギステル・トヴァル", "마지스터 토바르", "Magister Tovar", "Magister Tovar", "Magister Tovar", "Magíster Tovar"],
    ["The Unnamed Smith", "無名鐵匠", "The Unnamed Smith", "名なき鍛冶", "이름 없는 대장장이", "Der Namenlose Schmied", "Le Forgeron sans nom", "Il Fabbro Senza Nome", "El Herrero Sin Nombre"],
    ["Veshra Cinder-Mouth", "辛德口維什拉", "Veshra Cinder-Mouth", "灰口のヴェシュラ", "재입 베슈라", "Veshra Aschenmund", "Veshra Bouche-de-Cendre", "Veshra Bocca-di-Cenere", "Veshra Boca-de-Ceniza"],
    ["Master-of-Lights Erris", "掌燈長埃里斯", "Master-of-Lights Erris", "灯火長エリス", "빛의 장인 에리스", "Meister-der-Lichter Erris", "Maître-des-Lumières Erris", "Maestro-delle-Luci Erris", "Maestro de Luces Erris"],
    ["Master-of-Lights Bellan", "掌燈長貝蘭", "Master-of-Lights Bellan", "灯火長ベラン", "빛의 장인 벨란", "Meister-der-Lichter Bellan", "Maître-des-Lumières Bellan", "Maestro-delle-Luci Bellan", "Maestro de Luces Bellan"],
    ["Old Threa", "老瑟蕾亞", "Old Threa", "老スレア", "늙은 스레아", "Alte Threa", "Vieille Threa", "Vecchia Threa", "Vieja Threa"],
    ["Edrun Vael, called Half-Sky", "艾德倫・維爾，又稱半天", "Edrun Vael, called Half-Sky", "エドルン・ヴェール、半空と呼ばれる", "반하늘이라 불리는 에드룬 바엘", "Edrun Vael, genannt Halb-Himmel", "Edrun Vael, dit Demi-Ciel", "Edrun Vael, detto Mezzo-Cielo", "Edrun Vael, llamado Medio Cielo"],
    ["Heir-presumptive of Vaelora", "維洛拉推定繼承人", "Heir-presumptive of Vaelora", "ヴァエローラの推定継承者", "바엘로라의 추정 상속자", "mutmaßlicher Erbe Vaeloras", "héritier présomptif de Vaelora", "erede presunto di Vaelora", "heredero presunto de Vaelora"],
    ["Miorra Tide-Counted", "潮數者蜜歐拉", "Miorra Tide-Counted", "潮に数えられしミオラ", "조수에 헤아려진 미오라", "Miorra Gezeitengezählt", "Miorra Comptée-par-la-Marée", "Miorra Conta-di-Marea", "Miorra Contada-por-la-Marea"],
    ["Lantern-fisher, Olbrand", "歐布蘭德提燈漁人", "Lantern-fisher, Olbrand", "オルブランドの灯漁師", "올브랜드의 등불 어부", "Laternenfischerin aus Olbrand", "pêcheuse aux lanternes d'Olbrand", "pescatrice con lanterna di Olbrand", "pescadora de faroles de Olbrand"],
    ["The Cartographer at Brackhold", "布拉克霍德的製圖師", "The Cartographer at Brackhold", "ブラックホールドの地図職人", "브랙홀드의 지도 제작자", "Die Kartographin von Brackhold", "La cartographe de Brackhold", "La cartografa di Brackhold", "La cartógrafa de Brackhold"],
    ["Anonymous", "匿名者", "Anonymous", "匿名", "익명", "Anonym", "Anonyme", "Anonimo", "Anónima"],
    ["Mistress of the Ember Hand", "餘燼之手女首領", "Mistress of the Ember Hand", "熾火の手の女主", "잿불의 손의 여주인", "Herrin der Gluthand", "Maîtresse de la Main des Braises", "Signora della Mano di Brace", "Señora de la Mano de Ascuas"],
    ["Born", "出生", "Born", "誕生", "출생", "Geboren", "Née", "Nata", "Nacida"],
    ["Fostered", "寄養", "Fostered", "養育", "위탁됨", "In Pflege", "Placée", "Affidato", "Criado en tutela"],
    ["Heir-regent", "繼承攝政", "Heir-regent", "継承摂政", "상속 섭정", "Erbregent", "héritier-régent", "erede-reggente", "heredero-regente"],
    ["Lantern-fisher", "提燈漁人", "Lantern-fisher", "灯漁師", "등불 어부", "Laternenfischerin", "pêcheuse aux lanternes", "pescatrice con lanterna", "pescadora de faroles"],
    ["Witness", "見證者", "Witness", "目撃者", "목격자", "Zeugin", "Témoin", "Testimone", "Testigo"],
    ["Apprentice", "學徒", "Apprentice", "徒弟", "견습생", "Lehrling", "Apprentie", "Apprendista", "Aprendiz"],
    ["Last witness", "最後見證者", "Last witness", "最後の目撃者", "마지막 목격자", "Letzte Zeugin", "Dernier témoin", "Ultima testimone", "Último testigo"],
    ["Arrival", "抵達", "Arrival", "到着", "도착", "Ankunft", "Arrivée", "Arrivo", "Llegada"],
    ["Smith", "鐵匠", "Smith", "鍛冶", "대장장이", "Schmiedin", "Forgeronne", "Fabbra", "Herrera"],
    ["Mistress", "女首領", "Mistress", "女主", "여주인", "Herrin", "Maîtresse", "Signora", "Señora"],
    ["Vanished", "失蹤", "Vanished", "失踪", "사라짐", "Verschwunden", "Disparue", "Scomparsa", "Desaparecida"],
    ["draft", "草稿", "draft", "下書き", "초안", "Entwurf", "brouillon", "bozza", "borrador"],
    ["outline", "大綱", "outline", "アウトライン", "개요", "Gliederung", "plan", "scaletta", "esquema"],
    ["in-progress", "進行中", "in-progress", "進行中", "진행 중", "in Arbeit", "en cours", "in corso", "en curso"],
    ["revising", "修訂中", "revising", "改稿中", "수정 중", "in Überarbeitung", "en révision", "in revisione", "en revisión"],
    ["complete", "完成", "complete", "完了", "완료", "abgeschlossen", "terminé", "completo", "completo"],
    ["A Novel of the Sundered Reach", "裂境小說", "A Novel of the Sundered Reach", "分かたれた辺境の小説", "갈라진 변경의 소설", "Ein Roman der Gespaltenen Weite", "Un roman de la Marche fendue", "Un romanzo della Marca Spezzata", "Una novela del Confín Hendido"],
    ["Drafted in the Atelier", "起草於工坊", "Drafted in the Atelier", "工房で起草", "작업실에서 작성", "Im Atelier entworfen", "Rédigé dans l'Atelier", "Redatto nell'Atelier", "Redactado en el Atelier"],
    ["Volume the First", "第一卷", "Volume the First", "第一巻", "제1권", "Erster Band", "Volume premier", "Volume primo", "Volumen primero"],
    ["Volume the Second", "第二卷", "Volume the Second", "第二巻", "제2권", "Zweiter Band", "Volume second", "Volume secondo", "Volumen segundo"],
    ["Of Arrivals & Maps", "關於抵達與地圖", "Of Arrivals & Maps", "到着と地図について", "도착과 지도에 관하여", "Von Ankünften und Karten", "Des arrivées et des cartes", "Degli arrivi e delle mappe", "De llegadas y mapas"],
    ["Of Ravens & Inheritances", "關於渡鴉與繼承", "Of Ravens & Inheritances", "鴉と相続について", "까마귀와 상속에 관하여", "Von Raben und Erbschaften", "Des corbeaux et des héritages", "Di corvi ed eredità", "De cuervos y herencias"],
    ["The Stranger at the Dock", "碼頭上的陌生人", "The Stranger at the Dock", "桟橋のよそ者", "부두의 낯선 이", "Die Fremde am Kai", "L'étrangère sur le quai", "La straniera al molo", "La extraña en el muelle"],
    ["What the Tide Counts Back", "潮汐回數之物", "What the Tide Counts Back", "潮が数え返すもの", "조수가 되세는 것", "Was die Gezeiten zurückzählen", "Ce que la marée recompte", "Ciò che la marea riconta", "Lo que la marea cuenta de vuelta"],
    ["The Map's Seventh Fold", "地圖的第七摺", "The Map's Seventh Fold", "地図の第七の折り目", "지도의 일곱 번째 접힘", "Die Siebte Falte der Karte", "Le septième pli de la carte", "La settima piega della mappa", "El séptimo pliegue del mapa"],
    ["The Raven That Will Not Leave", "不肯離去的渡鴉", "The Raven That Will Not Leave", "去ろうとしない鴉", "떠나지 않는 까마귀", "Der Rabe, der nicht weichen will", "Le corbeau qui ne partira pas", "Il corvo che non se ne va", "El cuervo que no se marcha"],
    ["What the Half-Sky Inherits", "半天所繼承之物", "What the Half-Sky Inherits", "半空が受け継ぐもの", "반하늘이 물려받는 것", "Was Halb-Himmel erbt", "Ce dont hérite Demi-Ciel", "Ciò che eredita Mezzo-Cielo", "Lo que hereda Medio Cielo"],
    ["A Chronicle of the Wastes, 1102–1180", "荒原編年史，1102–1180", "A Chronicle of the Wastes, 1102–1180", "荒野年代記、1102–1180", "황무지 연대기, 1102–1180", "Eine Chronik der Öden, 1102–1180", "Une chronique des Landes, 1102-1180", "Una cronaca delle Lande, 1102-1180", "Una crónica de los Yermos, 1102-1180"],
    ["Compiled at Hollow Spire", "編於空心尖塔", "Compiled at Hollow Spire", "虚ろの尖塔で編纂", "빈 첨탑에서 편찬", "Zusammengestellt in Hollow Spire", "Compilé à Hollow Spire", "Compilato a Hollow Spire", "Compilado en Hollow Spire"],
    ["Coalmouth Burns", "煤口鎮燃燒", "Coalmouth Burns", "コールマウス炎上", "콜마우스가 타오르다", "Coalmouth brennt", "Coalmouth brûle", "Coalmouth brucia", "Coalmouth arde"],
    ["The First Sparks", "最初火星", "The First Sparks", "最初の火花", "첫 불꽃", "Die Ersten Funken", "Les premières étincelles", "Le prime scintille", "Las primeras chispas"],
    ["Tide-Counter Threa", "潮數者瑟蕾亞", "Tide-Counter Threa", "潮数えスレア", "조수 계수자 스레아", "Gezeitenzählerin Threa", "Threa la Compteuse de marée", "Threa la Contamaree", "Threa la Contadora de Mareas"],
    ["A Memoir, Salt-Stained", "鹽漬回憶錄", "A Memoir, Salt-Stained", "塩に染まった回想録", "소금 얼룩진 회고록", "Eine salzbefleckte Erinnerung", "Un mémoire taché de sel", "Memorie macchiate di sale", "Memorias manchadas de sal"],
    ["Recorded by an apprentice unnamed", "由無名學徒記錄", "Recorded by an apprentice unnamed", "名なき徒弟による記録", "이름 없는 견습생의 기록", "Aufgezeichnet von einem namenlosen Lehrling", "Consigné par une apprentie sans nom", "Registrato da un apprendista senza nome", "Registrado por un aprendiz sin nombre"],
    ["On the Order of the Open Leaf", "論開葉結社", "On the Order of the Open Leaf", "開かれた葉の結社について", "펼친 잎 결사에 관하여", "Über den Orden des Offenen Blatts", "Sur l'Ordre de la Feuille ouverte", "Sull'Ordine della Foglia Aperta", "Sobre la Orden de la Hoja Abierta"],
    ["A Treatise on Reading without Editing", "不加編修之閱讀論", "A Treatise on Reading without Editing", "編集なき読解についての論考", "편집 없는 독해에 관한 논고", "Eine Abhandlung über Lesen ohne Bearbeiten", "Un traité sur la lecture sans correction", "Un trattato sulla lettura senza correzione", "Un tratado sobre leer sin editar"],
    ["Magister Tovar, with marginalia", "托瓦爾導師，附旁註", "Magister Tovar, with marginalia", "マギステル・トヴァル、欄外注付き", "마지스터 토바르, 방주 포함", "Magister Tovar, mit Randnotizen", "Magister Tovar, avec marginalia", "Magister Tovar, con marginalia", "Magíster Tovar, con marginalia"],
    ["Catalogues, never edits. A doctrine examined.", "只編目，絕不改寫。一項教義的檢視。", "Catalogues, never edits. A doctrine examined.", "目録化し、決して編集しない。教義の検証。", "목록화하되 결코 편집하지 않는다. 한 교리의 검토.", "Katalogisiert, editiert nie. Eine Lehre wird geprüft.", "Catalogue, ne corrige jamais. Une doctrine examinée.", "Cataloga, non modifica mai. Una dottrina esaminata.", "Cataloga, nunca edita. Una doctrina examinada."],
    ["Eighty years that broke a thousand. A chronicle, in three folios, of the Ember Hand and what they unmade.", "八十年，折斷了一千年。三卷編年，記錄餘燼之手與他們拆毀的一切。", "Eighty years that broke a thousand. A chronicle, in three folios, of the Ember Hand and what they unmade.", "千年を砕いた八十年。熾火の手と彼らが壊したものを三冊に記す年代記。", "천 년을 꺾은 팔십 년. 잿불의 손과 그들이 무너뜨린 것을 세 권에 담은 연대기.", "Achtzig Jahre, die tausend zerbrachen. Eine Chronik in drei Folios über die Gluthand und was sie zunichtemachte.", "Quatre-vingts ans qui en brisèrent mille. Une chronique en trois folios de la Main des Braises et de ce qu'elle défit.", "Ottant'anni che ne spezzarono mille. Una cronaca in tre folii della Mano di Brace e di ciò che disfece.", "Ochenta años que quebraron mil. Una crónica, en tres folios, de la Mano de Ascuas y de lo que deshizo."],
    ["What the oldest of the Tide-Counters remembers, in the order she chooses to remember it.", "最年長的潮汐記數者所記得的一切，依她選擇記憶的順序排列。", "What the oldest of the Tide-Counters remembers, in the order she chooses to remember it.", "最古の潮数えが覚えていることを、彼女が選んだ順に。", "가장 오래된 조수 계수자가 기억하기로 택한 순서대로 적은 기억.", "Was die älteste Gezeitenzählerin erinnert, in der Reihenfolge, die sie wählt.", "Ce dont se souvient la plus vieille Compteuse de marée, dans l'ordre qu'elle choisit.", "Ciò che ricorda la più anziana delle Contamaree, nell'ordine che sceglie.", "Lo que recuerda la más anciana de las Contadoras de Mareas, en el orden que ella elige."],
    ["She arrives at Brackhold at the lowest tide of the century, carrying a map of a world that no longer is. Three witnesses; one ink not yet dry.", "她在本世紀最低潮時抵達布拉克霍德，帶著一幅已不存在世界的地圖。三名見證者；一筆墨跡尚未乾。", "She arrives at Brackhold at the lowest tide of the century, carrying a map of a world that no longer is. Three witnesses; one ink not yet dry.", "彼女は世紀で最も低い潮にブラックホールドへ着き、もはや存在しない世界の地図を携えていた。三人の証人、乾ききらないインク。", "그녀는 세기의 가장 낮은 썰물 때 브랙홀드에 도착해 더는 존재하지 않는 세계의 지도를 들고 있었다. 세 명의 증인, 아직 마르지 않은 잉크.", "Sie erreicht Brackhold bei der tiefsten Ebbe des Jahrhunderts, mit der Karte einer Welt, die nicht mehr ist. Drei Zeugen; eine Tinte noch nicht trocken.", "Elle arrive à Brackhold à la plus basse marée du siècle, portant la carte d'un monde qui n'est plus. Trois témoins ; une encre pas encore sèche.", "Arriva a Brackhold con la marea più bassa del secolo, portando la mappa di un mondo che non esiste più. Tre testimoni; un inchiostro non ancora asciutto.", "Llega a Brackhold con la marea más baja del siglo, llevando un mapa de un mundo que ya no existe. Tres testigos; una tinta aún húmeda."],
    ["Brackhold at low tide; the stranger disembarks.", "低潮時的布拉克霍德；陌生人下船。", "Brackhold at low tide; the stranger disembarks.", "干潮のブラックホールド。よそ者が下船する。", "썰물의 브랙홀드. 낯선 이가 배에서 내린다.", "Brackhold bei Ebbe; die Fremde geht von Bord.", "Brackhold à marée basse ; l'étrangère débarque.", "Brackhold con la bassa marea; la straniera sbarca.", "Brackhold con marea baja; la extraña desembarca."],
    ["wide ink wash · figure on dock · lanterns leaning", "寬幅水墨 · 碼頭人影 · 傾斜燈籠", "wide ink wash · figure on dock · lanterns leaning", "広い墨絵 · 桟橋の人影 · 傾く灯", "넓은 수묵 · 부두의 인물 · 기울어진 등불", "breite Tuschelavierung · Figur am Kai · geneigte Laternen", "large lavis d'encre · silhouette sur le quai · lanternes penchées", "ampia velatura a inchiostro · figura sul molo · lanterne inclinate", "aguada amplia de tinta · figura en el muelle · faroles inclinados"],
    ["The map before the Sundering.", "裂解之前的地圖。", "The map before the Sundering.", "分裂以前の地図。", "분열 전의 지도.", "Die Karte vor der Spaltung.", "La carte d'avant la Fracture.", "La mappa prima della Scissione.", "El mapa antes de la Hendidura."],
    ["vellum detail · pre-Sundering coastline", "羊皮紙細節 · 裂解前海岸線", "vellum detail · pre-Sundering coastline", "羊皮紙の細部 · 分裂前の海岸線", "양피지 디테일 · 분열 전 해안선", "Pergamentdetail · Küstenlinie vor der Spaltung", "détail de vélin · côte d'avant la Fracture", "dettaglio su pergamena · costa pre-Scissione", "detalle de vitela · costa previa a la Hendidura"],
    ["The ledger of the Tide-Counters.", "潮汐記數者的帳冊。", "The ledger of the Tide-Counters.", "潮数えの台帳。", "조수 계수자들의 장부.", "Das Register der Gezeitenzählerinnen.", "Le registre des Compteuses de marée.", "Il registro delle Contamaree.", "El libro de las Contadoras de Mareas."],
    ["open book · weathered hand turning page", "攤開書冊 · 風霜之手翻頁", "open book · weathered hand turning page", "開いた本 · 風化した手が頁をめくる", "펼친 책 · 닳은 손이 페이지를 넘김", "offenes Buch · verwitterte Hand blättert um", "livre ouvert · main burinée tournant la page", "libro aperto · mano segnata che volta pagina", "libro abierto · mano curtida pasando página"],
    ["An unnamed happening", "未命名事件", "An unnamed happening", "名もなき出来事", "이름 없는 사건", "Ein unbenanntes Geschehen", "Un événement sans nom", "Un accadimento senza nome", "Un suceso sin nombre"],
    ["Someone unnamed", "未命名之人", "Someone unnamed", "名もなき誰か", "이름 없는 누군가", "Eine unbenannte Person", "Quelqu'un sans nom", "Qualcuno senza nome", "Alguien sin nombre"],
    ["An unnamed order", "未命名結社", "An unnamed order", "名もなき結社", "이름 없는 결사", "Ein unbenannter Orden", "Un ordre sans nom", "Un ordine senza nome", "Una orden sin nombre"],
    ["An unnamed realm", "未命名領域", "An unnamed realm", "名もなき領", "이름 없는 영역", "Ein unbenanntes Reich", "Un royaume sans nom", "Un regno senza nome", "Un reino sin nombre"],
    ["of the Reach", "來自邊境", "of the Reach", "辺境の者", "변경의 사람", "aus der Weite", "de la Marche", "della Marca", "del Confín"],
    ["Re-cast the world to its original seed? Edits will be lost.", "要將世界重鑄回原始種子嗎？所有編輯都會遺失。", "Re-cast the world to its original seed? Edits will be lost.", "世界を初期シードへ鋳直しますか？編集内容は失われます。", "세계를 원래 시드로 다시 주조할까요? 편집 내용은 사라집니다.", "Die Welt auf ihren ursprünglichen Seed zurückgießen? Änderungen gehen verloren.", "Refondre le monde depuis sa graine d'origine ? Les modifications seront perdues.", "Riforgiare il mondo dal seed originale? Le modifiche andranno perdute.", "¿Reforjar el mundo desde su semilla original? Se perderán las ediciones."],
    ["Restart", "重新開始", "Restart", "再開", "다시 시작", "Neu starten", "Redémarrer", "Riavvia", "Reiniciar"],
    ["Switch to side-by-side (橫式)", "切換為左右並排（橫式）", "Switch to side-by-side (horizontal)", "左右並びに切替（横式）", "나란히 보기로 전환(가로)", "Zu Nebeneinander wechseln", "Passer côte à côte", "Passa ad affiancato", "Cambiar a lado a lado"],
    ["Switch to stacked (直式)", "切換為上下堆疊（直式）", "Switch to stacked (vertical)", "縦積みに切替（縦式）", "쌓아 보기로 전환(세로)", "Zu Stapelansicht wechseln", "Passer en pile verticale", "Passa a pila verticale", "Cambiar a apilado"],
    ["橫式", "橫式", "horizontal", "横式", "가로", "horizontal", "horizontal", "orizzontale", "horizontal"],
    ["直式", "直式", "vertical", "縦式", "세로", "vertikal", "vertical", "verticale", "vertical"],
    ["— widen the lens, or scrub the rail —", "— 放大視窗，或拖曳時間軌 —", "— widen the lens, or scrub the rail —", "— レンズを広げるか、レールを動かしてください —", "— 범위를 넓히거나 레일을 이동하세요 —", "— Linse erweitern oder Leiste ziehen —", "— élargissez la lentille ou glissez le rail —", "— amplia la lente o scorri il binario —", "— amplía la lente o arrastra el riel —"],
    ["— pick anything: an event dot, a character pin, a country shape, a lifespan bar, or a row in the list —", "— 任選一項：事件點、角色標記、國家形狀、生命週期條，或清單中的一列 —", "— pick anything: an event dot, a character pin, a country shape, a lifespan bar, or a row in the list —", "— 事件点、人物ピン、国の形、寿命バー、リスト行のどれかを選んでください —", "— 사건 점, 인물 핀, 국가 모양, 생애 막대, 목록 행 중 하나를 선택하세요 —", "— Wählen Sie etwas: Ereignispunkt, Figurenpin, Landesform, Lebensleiste oder Listenzeile —", "— choisissez un point d'événement, une épingle de personnage, une forme de pays, une barre de vie ou une ligne —", "— scegli un punto evento, un pin personaggio, una forma di paese, una barra di vita o una riga —", "— elige algo: punto de evento, pin de personaje, forma de país, barra de vida o fila de la lista —"],
    ["illustration", "插圖", "illustration", "挿絵", "삽화", "Illustration", "illustration", "illustrazione", "ilustración"],
    ["An unnamed plate", "未命名圖版", "An unnamed plate", "名もなき図版", "이름 없는 도판", "Eine unbenannte Tafel", "Une planche sans nom", "Una tavola senza nome", "Una lámina sin nombre"],
    ["drop description here", "在此放入描述", "drop description here", "ここに説明を入力", "여기에 설명 입력", "Beschreibung hier einfügen", "déposez la description ici", "inserisci qui la descrizione", "suelta la descripción aquí"],
    ["open in chronicle", "在編年中開啟", "open in chronicle", "年代記で開く", "연대기에서 열기", "in Chronik öffnen", "ouvrir dans la chronique", "apri nella cronaca", "abrir en la crónica"],
    ["(synced)", "（已同步）", "(synced)", "（同期済み）", "(동기화됨)", "(synchronisiert)", "(synchronisé)", "(sincronizzato)", "(sincronizado)"],
    ["synced — no changes proposed", "已同步 — 未提出變更", "synced — no changes proposed", "同期済み — 変更案なし", "동기화됨 — 제안된 변경 없음", "synchronisiert — keine Änderungen vorgeschlagen", "synchronisé — aucune modification proposée", "sincronizzato — nessuna modifica proposta", "sincronizado — sin cambios propuestos"],
    ["MEDIUM", "中", "MEDIUM", "中", "중간", "MITTEL", "MOYEN", "MEDIO", "MEDIO"],
    ["bible:", "設定集：", "bible:", "設定集:", "설정집:", "Bibel:", "bible :", "bibbia:", "biblia:"],
    ["chapter:", "章節：", "chapter:", "章:", "장:", "Kapitel:", "chapitre :", "capitolo:", "capítulo:"],
    ["↻ sync chapter → bible", "↻ 章節同步 → 設定集", "↻ sync chapter → bible", "↻ 章を同期 → 設定集", "↻ 장 동기화 → 설정집", "↻ Kapitel → Bibel synchronisieren", "↻ synchroniser chapitre → bible", "↻ sincronizza capitolo → bibbia", "↻ sincronizar capítulo → biblia"],
    ["⌕ check against bible", "⌕ 對照設定集", "⌕ check against bible", "⌕ 設定集と照合", "⌕ 설정집과 대조", "⌕ mit Bibel prüfen", "⌕ vérifier avec la bible", "⌕ controlla con la bibbia", "⌕ comprobar con la biblia"],
    ["✎ write the next paragraph", "✎ 續寫下一段", "✎ write the next paragraph", "✎ 次の段落を書く", "✎ 다음 문단 쓰기", "✎ nächsten Absatz schreiben", "✎ écrire le prochain paragraphe", "✎ scrivi il prossimo paragrafo", "✎ escribir el siguiente párrafo"],
    ["Jump", "跳至", "Jump", "移動", "이동", "Springen", "Aller", "Vai", "Saltar"],
    ["↺ Re-cast the world", "↺ 重鑄世界", "↺ Re-cast the world", "↺ 世界を再鋳造", "↺ 세계를 다시 주조", "↺ Welt neu gießen", "↺ Refondre le monde", "↺ Riforgia il mondo", "↺ Reforjar el mundo"],
    ["Aevenmere, the sundered reach: highlands and marsh, ash and tide. Open a folio. Walk the years. Stay until something asks to be named.", "艾文米爾，裂開的邊境：高地與沼澤，灰燼與潮汐。翻開一卷，走過年代，停留到某個事物要求被命名。", "Aevenmere, the sundered reach: highlands and marsh, ash and tide. Open a folio. Walk the years. Stay until something asks to be named.", "アイヴンミア、分かたれた辺境。高地と沼、灰と潮。フォリオを開き、年月を歩き、何かが名を求めるまで留まる。", "에이븐미어, 갈라진 변경. 고원과 습지, 재와 조수. 한 권을 펼치고 세월을 걸으며, 무언가 이름을 청할 때까지 머무르세요.", "Aevenmere, die gespaltene Weite: Hochland und Marsch, Asche und Gezeiten. Öffne ein Folio. Geh durch die Jahre. Bleib, bis etwas benannt werden will.", "Aevenmere, la Marche fendue : hautes terres et marais, cendre et marée. Ouvrez un folio. Parcourez les années. Restez jusqu'à ce qu'une chose demande un nom.", "Aevenmere, la Marca spezzata: alture e paludi, cenere e marea. Apri un folio. Attraversa gli anni. Resta finché qualcosa chiede un nome.", "Aevenmere, el Confín Hendido: tierras altas y marismas, ceniza y marea. Abre un folio. Recorre los años. Quédate hasta que algo pida nombre."]
  ];
  seedRows.forEach((row) => addLabel(...row));

  const loreRows = [
    ["A loose alliance of nine highland keeps swears one oath at Cael Vaer.", "九座高地堡壘組成鬆散同盟，在凱爾維爾立下一個誓約。", "A loose alliance of nine highland keeps swears one oath at Cael Vaer.", "九つの高地砦の緩やかな同盟が、カエル・ヴェールで一つの誓いを立てる。", "아홉 고원 요새의 느슨한 동맹이 카엘 베어에서 하나의 맹세를 한다.", "Ein lockeres Bündnis aus neun Hochlandfesten schwört in Cael Vaer einen Eid.", "Une alliance lâche de neuf forts des hautes terres prête un seul serment à Cael Vaer.", "Una fragile alleanza di nove fortezze d'altura giura un unico patto a Cael Vaer.", "Una alianza laxa de nueve fortalezas altas jura un solo voto en Cael Vaer."],
    ["Borders set in stone. The runesmiths are made royal.", "邊界刻入石中。符文鐵匠受封為王室匠師。", "Borders set in stone. The runesmiths are made royal.", "境界は石に刻まれ、ルーン鍛冶は王家のものとなる。", "국경은 돌에 새겨지고, 룬 대장장이들은 왕실 소속이 된다.", "Grenzen werden in Stein gesetzt. Die Runenschmiede werden königlich.", "Les frontières sont gravées dans la pierre. Les forgerons runiques deviennent royaux.", "I confini vengono fissati nella pietra. I fabbri runici diventano reali.", "Las fronteras quedan en piedra. Los herreros rúnicos pasan a ser reales."],
    ["Diminished after the Burning. Loses the southern marches to Therendil.", "燃燒年代後衰弱，南方邊區失於瑟倫迪爾。", "Diminished after the Burning. Loses the southern marches to Therendil.", "燃焼の後に弱体化し、南の辺境をセレンディルに失う。", "불탄 뒤 약해져 남쪽 변경을 테렌딜에 잃는다.", "Nach dem Brennen geschwächt. Verliert die südlichen Marken an Therendil.", "Affaiblie après les Feux. Perd les marches du sud au profit de Therendil.", "Indebolita dopo gli Incendi. Perde le marche meridionali a favore di Therendil.", "Debilitada tras el Ardor. Pierde las marcas del sur ante Therendil."],
    ["Twelve fishing-fleets sign the harbor accord.", "十二支漁船隊簽署港灣協定。", "Twelve fishing-fleets sign the harbor accord.", "十二の漁船団が港湾協定に署名する。", "열두 어선단이 항구 협정에 서명한다.", "Zwölf Fischereiflotten unterzeichnen das Hafenabkommen.", "Douze flottilles de pêche signent l'accord du port.", "Dodici flotte da pesca firmano l'accordo del porto.", "Doce flotas pesqueras firman el acuerdo del puerto."],
    ["Trade with Therendil opens the salt routes.", "與瑟倫迪爾的貿易打開了鹽路。", "Trade with Therendil opens the salt routes.", "セレンディルとの交易が塩の道を開く。", "테렌딜과의 교역이 소금길을 연다.", "Der Handel mit Therendil öffnet die Salzrouten.", "Le commerce avec Therendil ouvre les routes du sel.", "Il commercio con Therendil apre le vie del sale.", "El comercio con Therendil abre las rutas de la sal."],
    ["Six vineyards, one army, one library.", "六座葡萄園，一支軍隊，一座圖書館。", "Six vineyards, one army, one library.", "六つの葡萄畑、一つの軍、一つの図書館。", "포도밭 여섯, 군대 하나, 도서관 하나.", "Sechs Weinberge, ein Heer, eine Bibliothek.", "Six vignobles, une armée, une bibliothèque.", "Sei vigneti, un esercito, una biblioteca.", "Seis viñedos, un ejército, una biblioteca."],
    ["The Spire opens its doors and never again closes them.", "尖塔開啟大門，從此再未關上。", "The Spire opens its doors and never again closes them.", "尖塔は扉を開き、二度と閉ざさない。", "첨탑은 문을 열고 다시는 닫지 않는다.", "Der Turm öffnet seine Türen und schließt sie nie wieder.", "La Flèche ouvre ses portes et ne les referme plus jamais.", "La Guglia apre le porte e non le richiude mai più.", "La Aguja abre sus puertas y nunca vuelve a cerrarlas."],
    ["Annexes the southern Vaeloran marches after the fires.", "大火後併入維洛拉南方邊區。", "Annexes the southern Vaeloran marches after the fires.", "火災後、ヴァエローラ南部の辺境を併合する。", "화재 뒤 바엘로라 남부 변경을 병합한다.", "Annektiert nach den Feuern die südlichen Marken Vaeloras.", "Annexe les marches vaéloranes du sud après les incendies.", "Annetta le marche meridionali vaelorane dopo gli incendi.", "Anexa las marcas sureñas de Vaelora tras los incendios."],
    ["Three caravans, one road, one toll.", "三支商隊，一條道路，一道通行稅。", "Three caravans, one road, one toll.", "三つの隊商、一つの道、一つの通行料。", "대상 셋, 길 하나, 통행세 하나.", "Drei Karawanen, eine Straße, ein Zoll.", "Trois caravanes, une route, un péage.", "Tre carovane, una strada, un pedaggio.", "Tres caravanas, un camino, un peaje."],
    ["Annexes the eastern Wastes after the fires.", "大火後併入東部荒原。", "Annexes the eastern Wastes after the fires.", "火災後、東の荒野を併合する。", "화재 뒤 동부 황무지를 병합한다.", "Annektiert nach den Feuern die östlichen Öden.", "Annexe les Landes orientales après les incendies.", "Annetta le Lande orientali dopo gli incendi.", "Anexa los Yermos orientales tras los incendios."],
    ["Older than any other crown. Will not name itself a kingdom.", "比任何王冠都古老，卻不願自稱王國。", "Older than any other crown. Will not name itself a kingdom.", "どの王冠より古いが、自らを王国とは呼ばない。", "어떤 왕관보다 오래되었으나 스스로를 왕국이라 부르지 않는다.", "Älter als jede andere Krone. Will sich kein Königreich nennen.", "Plus ancien que toute autre couronne. Refuse de se dire royaume.", "Più antica di ogni altra corona. Non vuole chiamarsi regno.", "Más antiguo que cualquier corona. No quiere llamarse reino."],
    ["A frontier holdfast. Mines the long coal seam.", "邊境堡壘，開採漫長煤層。", "A frontier holdfast. Mines the long coal seam.", "辺境の砦。長い石炭層を掘る。", "변경의 보루. 긴 석탄층을 채굴한다.", "Eine Grenzfeste. Baut das lange Kohleflöz ab.", "Un fort frontalier. Exploite le long filon de charbon.", "Una rocca di frontiera. Scava la lunga vena di carbone.", "Un bastión de frontera. Mina la larga veta de carbón."],
    ["On the eve of the fire. No one knows.", "大火前夕。無人知曉。", "On the eve of the fire. No one knows.", "火の前夜。誰も知らない。", "불의 전야. 아무도 모른다.", "Am Vorabend des Feuers. Niemand weiß.", "À la veille du feu. Nul ne sait.", "Alla vigilia del fuoco. Nessuno sa.", "En vísperas del fuego. Nadie lo sabe."],
    ["Burned to slag and rumor in 1120. The Wastes belong to no crown now.", "1120 年燒成熔渣與傳聞。如今荒原不屬於任何王冠。", "Burned to slag and rumor in 1120. The Wastes belong to no crown now.", "1120年、鉱滓と噂に焼け落ちる。今や荒野はいかなる王冠にも属さない。", "1120년에 슬래그와 소문으로 타버렸다. 이제 황무지는 어떤 왕관의 것도 아니다.", "1120 zu Schlacke und Gerücht verbrannt. Die Öden gehören nun keiner Krone.", "Brûlé en scories et en rumeurs en 1120. Les Landes n'appartiennent plus à aucune couronne.", "Bruciato in scorie e voci nel 1120. Le Lande non appartengono più ad alcuna corona.", "Quemado hasta escoria y rumor en 1120. Los Yermos no pertenecen ya a ninguna corona."],
    ["A scholarly order founded at the Spire. Catalogues, never edits.", "創於尖塔的學術結社。只編目，從不改寫。", "A scholarly order founded at the Spire. Catalogues, never edits.", "尖塔で創設された学術結社。目録化し、決して編集しない。", "첨탑에서 창립된 학술 결사. 목록화하되 결코 편집하지 않는다.", "Ein Gelehrtenorden, am Turm gegründet. Katalogisiert, editiert nie.", "Un ordre savant fondé à la Flèche. Catalogue, ne corrige jamais.", "Un ordine erudito fondato alla Guglia. Cataloga, non modifica mai.", "Una orden erudita fundada en la Aguja. Cataloga, nunca edita."],
    ["Now spans the southern courts. Has read everything once.", "如今遍及南方諸廷。所有東西都讀過一遍。", "Now spans the southern courts. Has read everything once.", "今では南方の諸宮廷に広がる。すべてを一度は読んだ。", "이제 남부 궁정 전역에 걸쳐 있다. 모든 것을 한 번씩 읽었다.", "Umspannt nun die südlichen Höfe. Hat alles einmal gelesen.", "S'étend maintenant sur les cours du sud. A tout lu une fois.", "Ora si estende sulle corti del sud. Ha letto tutto almeno una volta.", "Ahora abarca las cortes del sur. Lo ha leído todo una vez."],
    ["A radical sect forged in the Wastes. Holds that fire is the only honest tongue.", "在荒原鍛成的激進教派，主張火焰是唯一誠實的語言。", "A radical sect forged in the Wastes. Holds that fire is the only honest tongue.", "荒野で鍛えられた過激な宗派。火だけが正直な舌だと信じる。", "황무지에서 벼려진 급진 종파. 불만이 유일하게 정직한 혀라 믿는다.", "Eine radikale Sekte, in den Öden geschmiedet. Hält Feuer für die einzige ehrliche Zunge.", "Une secte radicale forgée dans les Landes. Tient le feu pour la seule langue honnête.", "Una setta radicale forgiata nelle Lande. Sostiene che il fuoco sia l'unica lingua onesta.", "Una secta radical forjada en los Yermos. Sostiene que el fuego es la única lengua honesta."],
    ["At its height. Controls four mining-towns.", "全盛時期。控制四座礦鎮。", "At its height. Controls four mining-towns.", "最盛期。四つの鉱山町を支配する。", "전성기. 네 광산 마을을 지배한다.", "Auf dem Höhepunkt. Kontrolliert vier Bergbaustädte.", "À son apogée. Contrôle quatre villes minières.", "Al suo apice. Controlla quattro città minerarie.", "En su apogeo. Controla cuatro pueblos mineros."],
    ["Hunted to extinction by the Lantern Concord and the Order, 1178–1180.", "1178 至 1180 年間，被提燈同盟與開葉結社追剿至滅絕。", "Hunted to extinction by the Lantern Concord and the Order, 1178–1180.", "1178年から1180年、灯火盟約と結社により根絶まで追われる。", "1178년부터 1180년까지 등불 협화회와 결사에 의해 절멸할 때까지 사냥당한다.", "Vom Laternenbund und dem Orden 1178-1180 bis zur Auslöschung gejagt.", "Traquée jusqu'à l'extinction par la Concorde des Lanternes et l'Ordre, 1178-1180.", "Cacciata fino all'estinzione dalla Concordia delle Lanterne e dall'Ordine, 1178-1180.", "Perseguida hasta la extinción por la Concordia de los Faroles y la Orden, 1178-1180."],
    ["A maritime guild. Lights the coast for a tithe.", "海事行會，收取什一稅以照亮海岸。", "A maritime guild. Lights the coast for a tithe.", "海のギルド。十分の一税で沿岸に灯をともす。", "해양 길드. 십일조를 받고 해안을 밝힌다.", "Eine Seegilde. Erleuchtet die Küste gegen den Zehnten.", "Une guilde maritime. Éclaire la côte contre une dîme.", "Una gilda marittima. Illumina la costa per una decima.", "Un gremio marítimo. Ilumina la costa por un diezmo."],
    ["Outlives the Burning by being useful. The coast is lit again.", "憑著有用而活過燃燒年代。海岸重新點亮。", "Outlives the Burning by being useful. The coast is lit again.", "役に立つことで燃焼を生き延びる。沿岸に再び灯がともる。", "쓸모 있음으로 불길을 견딘다. 해안에 다시 불이 켜진다.", "Überlebt das Brennen, weil sie nützlich ist. Die Küste leuchtet wieder.", "Survit aux Feux en restant utile. La côte est de nouveau éclairée.", "Sopravvive agli Incendi perché utile. La costa è di nuovo illuminata.", "Sobrevive al Ardor siendo útil. La costa vuelve a estar iluminada."],
    ["An order of women who write the islands down before the tide moves them.", "一群女性組成的結社，在潮水移動島嶼之前先將它們寫下。", "An order of women who write the islands down before the tide moves them.", "潮が島々を動かす前にそれを書き留める女たちの結社。", "조수가 섬들을 옮기기 전에 그것들을 기록하는 여성들의 결사.", "Ein Orden von Frauen, die Inseln niederschreiben, bevor die Gezeiten sie versetzen.", "Un ordre de femmes qui consignent les îles avant que la marée ne les déplace.", "Un ordine di donne che annotano le isole prima che la marea le sposti.", "Una orden de mujeres que anotan las islas antes de que la marea las mueva."],
    ["Born in the Burning year of his sister's exile.", "出生於姊妹流放的燃燒之年。", "Born in the Burning year of his sister's exile.", "姉の追放の燃える年に生まれる。", "누이의 추방이 있던 불타는 해에 태어났다.", "Geboren im Brennenden Jahr der Verbannung seiner Schwester.", "Né l'année ardente de l'exil de sa sœur.", "Nato nell'anno ardente dell'esilio della sorella.", "Nacido en el año ardiente del exilio de su hermana."],
    ["Sent south to read three languages and sleep in none.", "被送往南方學讀三種語言，卻沒有一處能安睡。", "Sent south to read three languages and sleep in none.", "三つの言語を読むため南へ送られ、どの言語でも眠れない。", "세 언어를 읽으러 남쪽으로 보내졌고 어느 언어에서도 잠들지 못했다.", "Nach Süden geschickt, um drei Sprachen zu lesen und in keiner zu schlafen.", "Envoyé au sud pour lire trois langues et ne dormir dans aucune.", "Mandato a sud a leggere tre lingue e dormire in nessuna.", "Enviado al sur para leer tres lenguas y no dormir en ninguna."],
    ["Returns north with a raven that will not leave his shoulder.", "帶著一隻不肯離開肩頭的渡鴉返回北方。", "Returns north with a raven that will not leave his shoulder.", "肩を離れない鴉とともに北へ戻る。", "어깨를 떠나지 않는 까마귀와 함께 북쪽으로 돌아온다.", "Kehrt mit einem Raben nach Norden zurück, der seine Schulter nicht verlässt.", "Revient au nord avec un corbeau qui ne quitte pas son épaule.", "Torna a nord con un corvo che non lascia la sua spalla.", "Regresa al norte con un cuervo que no abandona su hombro."],
    ["Born owing the tide a name.", "出生時便欠潮汐一個名字。", "Born owing the tide a name.", "潮に名を一つ借りて生まれる。", "조수에게 이름 하나를 빚지고 태어났다.", "Geboren mit einem Namen Schuld an die Gezeiten.", "Née avec un nom dû à la marée.", "Nata dovendo un nome alla marea.", "Nacida debiéndole un nombre a la marea."],
    ["Apprenticed to the Concord at twelve. Has not yet given the tide its name.", "十二歲成為同盟學徒。尚未把名字還給潮汐。", "Apprenticed to the Concord at twelve. Has not yet given the tide its name.", "十二歳で盟約に弟子入り。まだ潮に名を返していない。", "열두 살에 협화회의 견습이 되었다. 아직 조수에게 그 이름을 주지 않았다.", "Mit zwölf beim Bund in Lehre. Hat den Gezeiten ihren Namen noch nicht gegeben.", "Apprentie à la Concorde à douze ans. N'a pas encore donné son nom à la marée.", "Apprendista della Concordia a dodici anni. Non ha ancora dato alla marea il suo nome.", "Aprendiz de la Concordia a los doce. Aún no ha dado su nombre a la marea."],
    ["On the dock when the stranger steps ashore.", "陌生人上岸時，她就在碼頭上。", "On the dock when the stranger steps ashore.", "よそ者が岸に上がる時、桟橋にいる。", "낯선 이가 상륙할 때 부두에 있었다.", "Auf dem Kai, als die Fremde an Land tritt.", "Sur le quai lorsque l'étrangère met pied à terre.", "Sul molo quando la straniera sbarca.", "En el muelle cuando la extraña pisa tierra."],
    ["Apprenticed at the forge — or so the records say.", "曾在鍛爐當學徒，至少記錄如此寫道。", "Apprenticed at the forge — or so the records say.", "鍛冶場で徒弟だった、記録にはそうある。", "대장간에서 견습이었다고 기록은 말한다.", "In der Schmiede in Lehre — so sagen es die Aufzeichnungen.", "Apprentie à la forge — du moins selon les archives.", "Apprendista alla forgia, così dicono i registri.", "Aprendiz en la fragua, o eso dicen los registros."],
    ["Last named to walk out of the Wastes.", "最後一位有名有姓走出荒原的人。", "Last named to walk out of the Wastes.", "名を持って荒野から歩み出た最後の者。", "이름을 가진 채 황무지에서 걸어 나온 마지막 사람.", "Die letzte namentlich Genannte, die die Öden verließ.", "Dernière personne nommée à sortir des Landes.", "Ultima persona nominata a uscire dalle Lande.", "Última persona con nombre en salir de los Yermos."],
    ["Arrives at Brackhold with a map whose ink is still wet.", "帶著墨跡未乾的地圖抵達布拉克霍德。", "Arrives at Brackhold with a map whose ink is still wet.", "インクがまだ濡れた地図を持ってブラックホールドに着く。", "아직 잉크가 마르지 않은 지도를 들고 브랙홀드에 도착한다.", "Erreicht Brackhold mit einer Karte, deren Tinte noch nass ist.", "Arrive à Brackhold avec une carte dont l'encre est encore fraîche.", "Arriva a Brackhold con una mappa dall'inchiostro ancora fresco.", "Llega a Brackhold con un mapa cuya tinta aún está húmeda."],
    ["Rises from the forges of Coalmouth.", "從煤口鎮的鍛爐中崛起。", "Rises from the forges of Coalmouth.", "コールマウスの鍛冶場から頭角を現す。", "콜마우스의 대장간에서 일어선다.", "Steigt aus den Schmieden von Coalmouth auf.", "S'élève des forges de Coalmouth.", "Emerge dalle forge di Coalmouth.", "Surge de las fraguas de Coalmouth."],
    ["Takes the Ember Hand. Fire becomes doctrine.", "接掌餘燼之手。火焰成為教義。", "Takes the Ember Hand. Fire becomes doctrine.", "熾火の手を握る。火は教義となる。", "잿불의 손을 장악한다. 불은 교리가 된다.", "Übernimmt die Gluthand. Feuer wird Doktrin.", "Prend la Main des Braises. Le feu devient doctrine.", "Prende la Mano di Brace. Il fuoco diventa dottrina.", "Toma la Mano de Ascuas. El fuego se vuelve doctrina."],
    ["Last seen walking into a fire she herself did not light.", "最後一次被看見，是走進一場並非她親手點燃的火。", "Last seen walking into a fire she herself did not light.", "最後に見られたのは、彼女自身が灯したのではない火へ歩み入る姿。", "마지막으로 목격된 것은 자신이 붙이지 않은 불 속으로 걸어 들어가는 모습이었다.", "Zuletzt gesehen, wie sie in ein Feuer ging, das sie nicht selbst entzündet hatte.", "Vue pour la dernière fois entrant dans un feu qu'elle n'avait pas allumé.", "Vista l'ultima volta mentre entrava in un fuoco che non aveva acceso lei.", "Vista por última vez entrando en un fuego que ella no encendió."],
    ["Allied through the Concord; cools after the marches dispute.", "因協約結盟；邊區爭議後關係轉冷。", "Allied through the Concord; cools after the marches dispute.", "盟約によって同盟。辺境争議の後に冷え込む。", "협약을 통해 동맹을 맺었으나 변경 분쟁 뒤 식는다.", "Durch den Bund verbündet; kühlt nach dem Markenstreit ab.", "Alliés par la Concorde ; les liens se refroidissent après le litige des marches.", "Alleati dalla Concordia; i rapporti si raffreddano dopo la disputa delle marche.", "Aliados por la Concordia; se enfría tras la disputa de las marcas."],
    ["Over the southern marches.", "為了南方邊區。", "Over the southern marches.", "南の辺境をめぐって。", "남쪽 변경을 두고.", "Wegen der südlichen Marken.", "Au sujet des marches du sud.", "Per le marche meridionali.", "Por las marcas del sur."],
    ["Salt and lanterns for wine and books.", "以鹽與提燈交換美酒與書籍。", "Salt and lanterns for wine and books.", "塩と灯を、葡萄酒と本と交換する。", "소금과 등불을 포도주와 책과 맞바꾼다.", "Salz und Laternen gegen Wein und Bücher.", "Du sel et des lanternes contre du vin et des livres.", "Sale e lanterne in cambio di vino e libri.", "Sal y faroles por vino y libros."],
    ["The Wastes war.", "荒原之戰。", "The Wastes war.", "荒野戦争。", "황무지 전쟁.", "Der Krieg der Öden.", "La guerre des Landes.", "La guerra delle Lande.", "La guerra de los Yermos."],
    ["The Order serves at the Spire.", "結社侍奉於尖塔。", "The Order serves at the Spire.", "結社は尖塔に仕える。", "결사는 첨탑을 섬긴다.", "Der Orden dient am Turm.", "L'Ordre sert à la Flèche.", "L'Ordine serve alla Guglia.", "La Orden sirve en la Aguja."],
    ["Doctrinal — and otherwise.", "教義上的衝突，也不只如此。", "Doctrinal — and otherwise.", "教義上、そしてそれ以外でも。", "교리적으로, 그리고 그 밖에도.", "Doktrinär — und anders.", "Doctrinal — et autrement.", "Dottrinale, e non solo.", "Doctrinal, y no solo."],
    ["After the burning of Coalmouth's lights.", "在煤口鎮燈火被焚之後。", "After the burning of Coalmouth's lights.", "コールマウスの灯が焼かれた後。", "콜마우스의 불빛이 불탄 뒤.", "Nach dem Verbrennen der Lichter von Coalmouth.", "Après l'incendie des lumières de Coalmouth.", "Dopo l'incendio delle luci di Coalmouth.", "Tras la quema de las luces de Coalmouth."],
    ["Sworn at Brackhold, unannounced.", "在布拉克霍德秘密立誓。", "Sworn at Brackhold, unannounced.", "ブラックホールドで、告げられぬまま誓われた。", "브랙홀드에서 예고 없이 맹세됨.", "In Brackhold geschworen, unangekündigt.", "Prêté à Brackhold, sans annonce.", "Giurato a Brackhold, senza annuncio.", "Juramentado en Brackhold, sin anunciar."],
    ["Met once in the forges. Twice in the fires.", "曾在鍛爐中相遇一次，在火中相遇兩次。", "Met once in the forges. Twice in the fires.", "鍛冶場で一度、火の中で二度会った。", "대장간에서 한 번, 불 속에서 두 번 만났다.", "Einmal in den Schmieden getroffen. Zweimal in den Feuern.", "Rencontrés une fois dans les forges. Deux fois dans les flammes.", "Si incontrarono una volta nelle forge. Due volte nei fuochi.", "Se encontraron una vez en las fraguas. Dos veces en los fuegos."]
  ];
  loreRows.forEach((row) => addLabel(...row));

  const chapterRows = [
    ["*Brackhold — the Year of Arrivals, 1209*", "*布拉克霍德 — 抵達之年，1209*", "*Brackhold — the Year of Arrivals, 1209*", "*ブラックホールド — 到着の年、1209*", "*브랙홀드 — 도착의 해, 1209*", "*Brackhold — Jahr der Ankünfte, 1209*", "*Brackhold — l'Année des arrivées, 1209*", "*Brackhold — l'Anno degli Arrivi, 1209*", "*Brackhold — el Año de las Llegadas, 1209*"],
    ["The tide is at its lowest hour when she steps off the boat. Miorra has been counting since dawn — seventeen islands above water, the rest gone to memory and to brine. She marks the count on the slate at her hip and looks up because the boat does not belong.", "她下船時，潮水正落到最低。蜜歐拉從黎明數到現在，水面上有十七座島，其餘都沉入記憶與鹽水。她在腰間石板上記下數字，抬起頭，因為那艘船不屬於這裡。", "The tide is at its lowest hour when she steps off the boat. Miorra has been counting since dawn — seventeen islands above water, the rest gone to memory and to brine. She marks the count on the slate at her hip and looks up because the boat does not belong.", "彼女が船を降りる時、潮は最も低い刻にある。ミオラは夜明けから数えていた。水上に十七の島、残りは記憶と塩水へ消えた。腰の石板に数を刻み、見上げる。その船はこの水のものではない。", "그녀가 배에서 내릴 때 조수는 가장 낮았다. 미오라는 새벽부터 세고 있었다. 물 위의 섬은 열일곱, 나머지는 기억과 소금물 속으로 사라졌다. 그녀는 허리의 석판에 수를 적고, 그 배가 이 물에 속하지 않음을 깨달아 고개를 든다.", "Als sie vom Boot steigt, steht die Tide am tiefsten. Miorra zählt seit der Dämmerung: siebzehn Inseln über Wasser, der Rest Erinnerung und Salz. Sie ritzt die Zahl auf die Schiefertafel an ihrer Hüfte und blickt auf, denn dieses Boot gehört nicht hierher.", "Quand elle descend du bateau, la marée est au plus bas. Miorra compte depuis l'aube : dix-sept îles hors de l'eau, le reste livré à la mémoire et à la saumure. Elle marque le nombre sur l'ardoise à sa hanche et lève les yeux, car ce bateau n'a rien à faire ici.", "Quando scende dalla barca, la marea è al punto più basso. Miorra conta dall'alba: diciassette isole sopra l'acqua, il resto consegnato alla memoria e alla salamoia. Segna il numero sulla lavagna al fianco e alza lo sguardo, perché quella barca non appartiene a quelle acque.", "Cuando baja del bote, la marea está en su hora más baja. Miorra cuenta desde el alba: diecisiete islas sobre el agua, el resto entregado a la memoria y a la salmuera. Marca el número en la pizarra de su cadera y levanta la vista porque ese bote no pertenece allí."],
    ["The stranger carries a roll of vellum the colour of old butter, and ink that has not yet finished setting. There is no wind. The lanterns of the Concord lean toward her anyway, as if asking a question.", "陌生人抱著一卷舊奶油色羊皮紙，墨跡尚未全乾。沒有風。同盟的燈籠卻仍朝她傾斜，像是在發問。", "The stranger carries a roll of vellum the colour of old butter, and ink that has not yet finished setting. There is no wind. The lanterns of the Concord lean toward her anyway, as if asking a question.", "よそ者は古いバター色の羊皮紙と、まだ乾ききらないインクを持っている。風はない。それでも盟約の灯は彼女へ傾く。問いかけるように。", "낯선 이는 오래된 버터빛 양피지와 아직 마르지 않은 잉크를 들고 있다. 바람은 없다. 그런데도 협화회의 등불은 질문하듯 그녀 쪽으로 기운다.", "Die Fremde trägt eine Rolle Pergament in der Farbe alter Butter und Tinte, die noch nicht ganz getrocknet ist. Kein Wind weht. Trotzdem neigen sich die Laternen des Bundes zu ihr, als stellten sie eine Frage.", "L'étrangère porte un rouleau de vélin couleur vieux beurre, avec une encre qui n'a pas fini de prendre. Il n'y a pas de vent. Les lanternes de la Concorde penchent tout de même vers elle, comme pour poser une question.", "La straniera porta un rotolo di pergamena color burro vecchio e un inchiostro non ancora asciutto. Non c'è vento. Eppure le lanterne della Concordia si piegano verso di lei, come a porre una domanda.", "La extraña lleva un rollo de vitela color mantequilla vieja y tinta que aún no acaba de asentarse. No hay viento. Aun así, los faroles de la Concordia se inclinan hacia ella, como si preguntaran algo."],
    ["\"You're new to this water,\" Miorra says, because someone must speak first, and the Tide-Counters taught her so.", "\"你不熟這片水域，\"蜜歐拉說。總得有人先開口，而潮汐記數者就是這樣教她的。", "\"You're new to this water,\" Miorra says, because someone must speak first, and the Tide-Counters taught her so.", "「この水は初めてね」とミオラは言う。誰かが先に話さねばならず、潮数えはそう教えたから。", "\"이 물은 처음이군요,\" 미오라가 말한다. 누군가는 먼저 말해야 하고, 조수 계수자들은 그렇게 가르쳤다.", "\"Ihr seid neu in diesem Wasser\", sagt Miorra, weil jemand zuerst sprechen muss und die Gezeitenzählerinnen es ihr so beigebracht haben.", "« Vous êtes nouvelle dans ces eaux », dit Miorra, parce que quelqu'un doit parler le premier et que les Compteuses de marée le lui ont appris.", "\"Sei nuova in queste acque\", dice Miorra, perché qualcuno deve parlare per primo e le Contamaree glielo hanno insegnato.", "\"Eres nueva en estas aguas\", dice Miorra, porque alguien debe hablar primero y así se lo enseñaron las Contadoras de Mareas."],
    ["\"I am new to this *century*,\" the stranger replies, not looking up from her map.", "\"我不熟的是這個*世紀*，\"陌生人回答，視線仍未離開地圖。", "\"I am new to this *century*,\" the stranger replies, not looking up from her map.", "「初めてなのはこの*世紀*よ」とよそ者は地図から目を上げずに答える。", "\"내가 처음인 것은 이 *세기*야,\" 낯선 이는 지도에서 눈을 떼지 않고 답한다.", "\"Ich bin neu in diesem *Jahrhundert*\", antwortet die Fremde, ohne von ihrer Karte aufzusehen.", "« Je suis nouvelle dans ce *siècle* », répond l'étrangère sans lever les yeux de sa carte.", "\"Sono nuova in questo *secolo*\", risponde la straniera senza alzare gli occhi dalla mappa.", "\"Soy nueva en este *siglo*\", responde la extraña sin apartar la vista del mapa."],
    ["— from the Logs of the Lantern Concord, vol. iv, 1209", "— 出自《提燈同盟航誌》第四卷，1209", "— from the Logs of the Lantern Concord, vol. iv, 1209", "— 『灯火盟約記録』第四巻、1209年より", "— 등불 협화회 기록, 제4권, 1209", "— aus den Logbüchern des Laternenbunds, Bd. IV, 1209", "— des Journaux de la Concorde des Lanternes, vol. IV, 1209", "— dai Registri della Concordia delle Lanterne, vol. IV, 1209", "— de los Registros de la Concordia de los Faroles, vol. IV, 1209"],
    ["The map she carries is of the Reach as it **was**. Not the Reach as it is — the Reach before the Sundering, with one continent unbroken and Brackhold not yet on it. Miorra has seen a copy of this map once, in the Spire's locked stacks, when she was twelve and not yet allowed there.", "她帶著的是邊境**曾經**的模樣，不是如今的模樣，而是裂解之前的邊境：大陸尚未破碎，布拉克霍德也尚未存在。蜜歐拉十二歲時曾在尖塔封鎖書庫中見過這張地圖的抄本；那時她還不該進去。", "The map she carries is of the Reach as it **was**. Not the Reach as it is — the Reach before the Sundering, with one continent unbroken and Brackhold not yet on it. Miorra has seen a copy of this map once, in the Spire's locked stacks, when she was twelve and not yet allowed there.", "彼女の地図は辺境が**かつて**そうであった姿を描いている。今の辺境ではない。分裂前の辺境、一つの大陸が砕けず、ブラックホールドがまだ載っていない地図だ。ミオラは十二歳の時、入ることを許されていなかった尖塔の施錠書庫で、この写しを一度見た。", "그녀가 든 지도는 변경이 **예전**에 그러했던 모습이다. 지금의 변경이 아니다. 분열 전, 하나의 대륙이 갈라지지 않았고 브랙홀드가 아직 없던 지도다. 미오라는 열두 살 때, 들어가면 안 되었던 첨탑의 잠긴 서가에서 이 지도의 사본을 본 적이 있다.", "Die Karte, die sie trägt, zeigt die Weite, wie sie **war**. Nicht wie sie ist — die Weite vor der Spaltung, ein ungebrochener Kontinent, Brackhold noch nicht darauf. Miorra sah eine Kopie dieser Karte einmal in den verschlossenen Magazinen des Turms, als sie zwölf war und dort noch nichts zu suchen hatte.", "La carte qu'elle porte montre la Marche telle qu'elle **était**. Non telle qu'elle est : la Marche avant la Fracture, avec un continent intact et Brackhold pas encore dessus. Miorra a vu une copie de cette carte une fois, dans les réserves fermées de la Flèche, quand elle avait douze ans et n'y était pas encore admise.", "La mappa che porta mostra la Marca com'**era**. Non la Marca com'è: la Marca prima della Scissione, con un continente integro e Brackhold non ancora segnata. Miorra ne ha vista una copia una volta, negli scaffali chiusi della Guglia, quando aveva dodici anni e non avrebbe dovuto essere lì.", "El mapa que lleva muestra el Confín como **era**. No como es: el Confín antes de la Hendidura, con un continente entero y Brackhold aún ausente. Miorra vio una copia de ese mapa una vez, en los depósitos cerrados de la Aguja, cuando tenía doce años y todavía no debía entrar allí."],
    ["She does not say so.", "她沒有說出口。", "She does not say so.", "彼女はそう言わない。", "그녀는 말하지 않는다.", "Sie sagt es nicht.", "Elle ne le dit pas.", "Non lo dice.", "No lo dice."],
    ["The stranger folds the vellum once, twice, three times into a square no larger than a hand. She tucks it inside her coat the way one tucks a child to sleep. Then she looks at Miorra — really looks — and Miorra finds she has been holding her slate hard enough to leave chalk in her palm.", "陌生人把羊皮紙折一次、兩次、三次，折成不比手掌大的方塊。她把它收進外衣，像替孩子掖好被角。然後她看向蜜歐拉，真正地看著她；蜜歐拉才發現自己把石板握得太緊，掌心留下了粉筆痕。", "The stranger folds the vellum once, twice, three times into a square no larger than a hand. She tucks it inside her coat the way one tucks a child to sleep. Then she looks at Miorra — really looks — and Miorra finds she has been holding her slate hard enough to leave chalk in her palm.", "よそ者は羊皮紙を一度、二度、三度と折り、手のひらほどの四角にする。眠る子を包むようにそれを外套へしまう。それからミオラを見る。本当に見る。ミオラは、自分が石板を強く握りすぎ、掌に白墨を残していたことに気づく。", "낯선 이는 양피지를 한 번, 두 번, 세 번 접어 손보다 크지 않은 네모로 만든다. 아이를 재우듯 그것을 코트 안에 넣는다. 그리고 미오라를 본다. 정말로 본다. 미오라는 자신이 석판을 너무 세게 쥐어 손바닥에 분필 자국을 남겼음을 깨닫는다.", "Die Fremde faltet das Pergament einmal, zweimal, dreimal zu einem Quadrat, nicht größer als eine Hand. Sie steckt es in ihren Mantel, wie man ein Kind zum Schlafen zudeckt. Dann sieht sie Miorra an — sieht sie wirklich an — und Miorra merkt, dass sie ihre Tafel so fest hält, dass Kreide in ihrer Handfläche bleibt.", "L'étrangère plie le vélin une fois, deux fois, trois fois, en un carré pas plus grand qu'une main. Elle le glisse dans son manteau comme on borde un enfant. Puis elle regarde Miorra — la regarde vraiment — et Miorra découvre qu'elle serre son ardoise assez fort pour laisser de la craie dans sa paume.", "La straniera piega la pergamena una, due, tre volte in un quadrato non più grande di una mano. La infila nel cappotto come si rimbocca un bambino. Poi guarda Miorra, la guarda davvero, e Miorra si accorge di stringere la lavagna tanto da lasciarsi gesso nel palmo.", "La extraña dobla la vitela una, dos, tres veces hasta formar un cuadrado no mayor que una mano. La guarda dentro del abrigo como quien arropa a un niño. Luego mira a Miorra —la mira de verdad— y Miorra descubre que ha apretado tanto la pizarra que tiene tiza en la palma."],
    ["\"Who counts the tide here?\"", "\"這裡由誰數潮？\"", "\"Who counts the tide here?\"", "「ここで潮を数えるのは誰？」", "\"여기서 조수를 세는 사람은 누구지?\"", "\"Wer zählt hier die Gezeiten?\"", "« Qui compte la marée ici ? »", "\"Chi conta la marea qui?\"", "\"¿Quién cuenta la marea aquí?\""],
    ["\"I do.\"", "\"我。\"", "\"I do.\"", "「私です」", "\"저요.\"", "\"Ich.\"", "« Moi. »", "\"Io.\"", "\"Yo.\""],
    ["\"Good. I am going to need you to count something else.\"", "\"很好。我需要妳幫我數別的東西。\"", "\"Good. I am going to need you to count something else.\"", "「よかった。別のものを数えてもらうことになる」", "\"좋아. 네가 다른 것을 세어 줘야겠어.\"", "\"Gut. Ich werde Euch brauchen, um etwas anderes zu zählen.\"", "« Bien. Je vais avoir besoin que vous comptiez autre chose. »", "\"Bene. Mi servirà che tu conti qualcos'altro.\"", "\"Bien. Voy a necesitar que cuentes otra cosa.\""],
    ["The Tide-Counters keep a ledger of every island that has ever shown its face above the brine. The ledger is older than Brackhold itself; older, Threa says, than the names anyone gives the islands.", "潮汐記數者保存著一本帳冊，記下每一座曾在鹽水上露面的島。那本帳冊比布拉克霍德本身更古老；瑟蕾亞說，也比任何人給島嶼取的名字更古老。", "The Tide-Counters keep a ledger of every island that has ever shown its face above the brine. The ledger is older than Brackhold itself; older, Threa says, than the names anyone gives the islands.", "潮数えは、塩水の上に顔を出したすべての島を台帳に記している。その台帳はブラックホールドそのものより古い。スレアによれば、誰かが島に与えた名よりも古い。", "조수 계수자들은 소금물 위로 얼굴을 드러낸 모든 섬의 장부를 보관한다. 그 장부는 브랙홀드 자체보다 오래되었고, 스레아에 따르면 사람들이 섬에 붙인 이름보다도 오래되었다.", "Die Gezeitenzählerinnen führen ein Register jeder Insel, die je ihr Gesicht über der Lake zeigte. Das Register ist älter als Brackhold selbst; älter, sagt Threa, als die Namen, die irgendwer den Inseln gibt.", "Les Compteuses de marée tiennent le registre de chaque île qui a jamais montré son visage au-dessus de la saumure. Il est plus ancien que Brackhold même ; plus ancien, dit Threa, que les noms donnés aux îles.", "Le Contamaree tengono un registro di ogni isola che abbia mai mostrato il volto sopra la salamoia. Il registro è più antico della stessa Brackhold; più antico, dice Threa, dei nomi che chiunque dà alle isole.", "Las Contadoras de Mareas guardan un libro de cada isla que alguna vez asomó sobre la salmuera. El libro es más antiguo que Brackhold misma; más antiguo, dice Threa, que los nombres que cualquiera da a las islas."],
    ["Threa is the oldest of them. Threa was old when Miorra's mother was a girl.", "瑟蕾亞是她們之中最年長的。蜜歐拉的母親還是女孩時，瑟蕾亞就已經老了。", "Threa is the oldest of them. Threa was old when Miorra's mother was a girl.", "スレアはその中で最も古い。ミオラの母が少女だった頃、スレアはすでに老いていた。", "스레아는 그들 중 가장 오래되었다. 미오라의 어머니가 소녀였을 때도 스레아는 이미 늙었다.", "Threa ist die älteste von ihnen. Threa war alt, als Miorras Mutter ein Mädchen war.", "Threa est la plus vieille d'entre elles. Elle était déjà vieille quand la mère de Miorra était enfant.", "Threa è la più anziana. Era già vecchia quando la madre di Miorra era ragazza.", "Threa es la más vieja de ellas. Ya era vieja cuando la madre de Miorra era niña."],
    ["\"You brought a stranger to my dock,\" Threa says, not looking up from the ledger. The page is open to a column Miorra has never seen, in a hand she does not recognise.", "\"妳把陌生人帶到我的碼頭，\"瑟蕾亞說，眼睛沒有離開帳冊。頁面攤在一欄蜜歐拉從未見過的文字上，筆跡也不是她認得的任何人。", "\"You brought a stranger to my dock,\" Threa says, not looking up from the ledger. The page is open to a column Miorra has never seen, in a hand she does not recognise.", "「私の桟橋によそ者を連れてきたね」とスレアは台帳から目を上げずに言う。頁はミオラが見たことのない欄に開かれ、知らない筆跡で書かれている。", "\"내 부두에 낯선 이를 데려왔구나,\" 스레아가 장부에서 눈을 들지 않고 말한다. 펼쳐진 쪽에는 미오라가 한 번도 본 적 없는 열이, 알아보지 못하는 필체로 적혀 있다.", "\"Du hast eine Fremde zu meinem Kai gebracht\", sagt Threa, ohne vom Register aufzusehen. Die Seite liegt bei einer Spalte offen, die Miorra noch nie gesehen hat, in einer Handschrift, die sie nicht erkennt.", "« Tu as amené une étrangère à mon quai », dit Threa sans lever les yeux du registre. La page est ouverte sur une colonne que Miorra n'a jamais vue, d'une main qu'elle ne reconnaît pas.", "\"Hai portato una straniera al mio molo\", dice Threa senza alzare lo sguardo dal registro. La pagina è aperta su una colonna che Miorra non ha mai visto, in una grafia che non riconosce.", "\"Trajiste a una extraña a mi muelle\", dice Threa sin levantar la vista del libro. La página está abierta en una columna que Miorra nunca ha visto, escrita con una mano que no reconoce."],
    ["\"She brought herself.\"", "\"她是自己來的。\"", "\"She brought herself.\"", "「自分で来ました」", "\"그녀가 스스로 왔어요.\"", "\"Sie hat sich selbst gebracht.\"", "« Elle est venue d'elle-même. »", "\"Si è portata da sola.\"", "\"Ella se trajo sola.\""],
    ["\"That is the difference, isn't it.\" Threa turns the page. The column continues — names, years, a counting that does not stop where the ledger should. \"Sit down, child. We are going to count something the tide remembered.\"", "\"這就是差別，不是嗎。\"瑟蕾亞翻過一頁。那一欄繼續往下延伸：名字、年份，一串本該在帳冊終點停止卻沒有停止的計數。\"坐下，孩子。我們要數一樣潮汐記得的東西。\"", "\"That is the difference, isn't it.\" Threa turns the page. The column continues — names, years, a counting that does not stop where the ledger should. \"Sit down, child. We are going to count something the tide remembered.\"", "「そこが違いだね」スレアは頁をめくる。欄は続いている。名前、年、台帳が終わるべきところで止まらない数え。 「座りなさい、子よ。潮が覚えていたものを数えるよ」", "\"그게 차이겠지.\" 스레아가 페이지를 넘긴다. 열은 계속된다. 이름, 해, 장부가 멈춰야 할 곳에서 멈추지 않는 계수. \"앉아라, 아이야. 조수가 기억한 것을 세어 보자.\"", "\"Das ist der Unterschied, nicht wahr.\" Threa blättert um. Die Spalte geht weiter — Namen, Jahre, ein Zählen, das nicht dort endet, wo das Register enden müsste. \"Setz dich, Kind. Wir werden etwas zählen, woran sich die Gezeiten erinnerten.\"", "« C'est toute la différence, n'est-ce pas. » Threa tourne la page. La colonne continue : noms, années, un compte qui ne s'arrête pas où le registre devrait. « Assieds-toi, enfant. Nous allons compter quelque chose dont la marée s'est souvenue. »", "\"Questa è la differenza, vero?\" Threa volta pagina. La colonna continua: nomi, anni, un conto che non si ferma dove il registro dovrebbe. \"Siediti, bambina. Conteremo qualcosa che la marea ha ricordato.\"", "\"Esa es la diferencia, ¿verdad?\" Threa pasa la página. La columna continúa: nombres, años, una cuenta que no se detiene donde el libro debería. \"Siéntate, niña. Vamos a contar algo que la marea recordó.\""],
    ["*[outline]*", "*[大綱]*", "*[outline]*", "*[アウトライン]*", "*[개요]*", "*[Gliederung]*", "*[plan]*", "*[scaletta]*", "*[esquema]*"],
    ["*[draft pending]*", "*[草稿待寫]*", "*[draft pending]*", "*[下書き待ち]*", "*[초안 대기]*", "*[Entwurf ausstehend]*", "*[brouillon en attente]*", "*[bozza in attesa]*", "*[borrador pendiente]*"],
    ["*[a fresh leaf — begin]*", "*[新葉 — 開始]*", "*[a fresh leaf — begin]*", "*[新しい葉 — 開始]*", "*[새 잎장 — 시작]*", "*[frisches Blatt — beginnen]*", "*[feuille neuve — commencer]*", "*[foglia nuova — inizia]*", "*[hoja nueva — empezar]*"],
    ["The stranger unfolds her map for Miorra. Each crease shows a different epoch.", "陌生人為蜜歐拉展開地圖。每一道摺痕都顯示不同時代。", "The stranger unfolds her map for Miorra. Each crease shows a different epoch.", "よそ者はミオラのために地図を広げる。折り目ごとに違う時代が現れる。", "낯선 이는 미오라에게 지도를 펼친다. 접힌 자국마다 다른 시대가 보인다.", "Die Fremde entfaltet ihre Karte für Miorra. Jede Falte zeigt eine andere Epoche.", "L'étrangère déplie sa carte pour Miorra. Chaque pli montre une époque différente.", "La straniera apre la mappa per Miorra. Ogni piega mostra un'epoca diversa.", "La extraña despliega su mapa para Miorra. Cada pliegue muestra una época distinta."],
    ["The seventh fold is blank — for what has not happened yet.", "第七道摺痕是空白，留給尚未發生之事。", "The seventh fold is blank — for what has not happened yet.", "第七の折り目は空白だ。まだ起きていないことのために。", "일곱 번째 접힘은 비어 있다. 아직 일어나지 않은 일을 위해.", "Die siebte Falte ist leer — für das, was noch nicht geschehen ist.", "Le septième pli est blanc — pour ce qui n'est pas encore arrivé.", "La settima piega è vuota, per ciò che non è ancora accaduto.", "El séptimo pliegue está en blanco: para lo que aún no ha ocurrido."],
    ["Threa recognises a name on the map: the Sunken Choir, *as it was above water.*", "瑟蕾亞認出地圖上的一個名字：沉沒唱詩班，*仍在水面之上時的樣子。*", "Threa recognises a name on the map: the Sunken Choir, *as it was above water.*", "スレアは地図上の名に気づく。沈んだ聖歌隊、*水上にあった頃の姿で。*", "스레아는 지도 위의 이름을 알아본다. 가라앉은 성가대, *물 위에 있던 모습 그대로.*", "Threa erkennt einen Namen auf der Karte: den Versunkenen Chor, *wie er über Wasser war.*", "Threa reconnaît un nom sur la carte : le Chœur englouti, *tel qu'il était au-dessus de l'eau.*", "Threa riconosce un nome sulla mappa: il Coro Sommerso, *com'era sopra l'acqua.*", "Threa reconoce un nombre en el mapa: el Coro Hundido, *tal como era sobre el agua.*"],
    ["A raven arrives from Cael Vaer.", "一隻渡鴉自凱爾維爾抵達。", "A raven arrives from Cael Vaer.", "カエル・ヴェールから鴉が届く。", "카엘 베어에서 까마귀가 도착한다.", "Ein Rabe kommt aus Cael Vaer.", "Un corbeau arrive de Cael Vaer.", "Un corvo arriva da Cael Vaer.", "Un cuervo llega desde Cael Vaer."],
    ["Edrun at Cael Vaer; the raven on his shoulder for the ninth day.", "艾德倫在凱爾維爾；渡鴉停在他肩上已是第九天。", "Edrun at Cael Vaer; the raven on his shoulder for the ninth day.", "カエル・ヴェールのエドルン。鴉は九日目も彼の肩にいる。", "카엘 베어의 에드룬. 까마귀는 아흐레째 그의 어깨에 있다.", "Edrun in Cael Vaer; der Rabe sitzt den neunten Tag auf seiner Schulter.", "Edrun à Cael Vaer ; le corbeau est sur son épaule pour le neuvième jour.", "Edrun a Cael Vaer; il corvo è sulla sua spalla per il nono giorno.", "Edrun en Cael Vaer; el cuervo lleva nueve días en su hombro."],
    ["A messenger from Brackhold; Threa's seal on the parchment.", "來自布拉克霍德的信使；羊皮紙上有瑟蕾亞的封印。", "A messenger from Brackhold; Threa's seal on the parchment.", "ブラックホールドからの使者。羊皮紙にはスレアの封印。", "브랙홀드에서 온 전령. 양피지에는 스레아의 인장.", "Ein Bote aus Brackhold; Threas Siegel auf dem Pergament.", "Un messager de Brackhold ; le sceau de Threa sur le parchemin.", "Un messaggero da Brackhold; il sigillo di Threa sulla pergamena.", "Un mensajero de Brackhold; el sello de Threa en el pergamino."],
    ["He recognises the cartographer's hand though they have never met.", "他認得製圖師的筆跡，雖然兩人從未見過。", "He recognises the cartographer's hand though they have never met.", "会ったこともないのに、彼は地図職人の筆跡を見分ける。", "그는 만난 적도 없는데 지도 제작자의 필체를 알아본다.", "Er erkennt die Hand der Kartographin, obwohl sie einander nie begegnet sind.", "Il reconnaît la main de la cartographe bien qu'ils ne se soient jamais rencontrés.", "Riconosce la mano della cartografa anche se non si sono mai incontrati.", "Reconoce la mano de la cartógrafa aunque nunca se han visto."],
    ["The regent's burdens.", "攝政的重擔。", "The regent's burdens.", "摂政の重荷。", "섭정의 짐.", "Die Lasten des Regenten.", "Les fardeaux du régent.", "I fardelli del reggente.", "Las cargas del regente."],
    ["A southward journey is debated.", "眾人爭論是否南行。", "A southward journey is debated.", "南への旅が議論される。", "남쪽 여정을 두고 논의한다.", "Eine Reise nach Süden wird beraten.", "Un voyage vers le sud est débattu.", "Si discute un viaggio verso sud.", "Se debate un viaje hacia el sur."],
    ["The raven, again.", "又是那隻渡鴉。", "The raven, again.", "また、鴉。", "또 까마귀.", "Der Rabe, wieder.", "Le corbeau, encore.", "Il corvo, di nuovo.", "El cuervo, otra vez."],
    ["The forges of Coalmouth at the eve.", "前夕的煤口鎮鍛爐。", "The forges of Coalmouth at the eve.", "前夜のコールマウスの鍛冶場。", "전야의 콜마우스 대장간.", "Die Schmieden von Coalmouth am Vorabend.", "Les forges de Coalmouth à la veille.", "Le forge di Coalmouth alla vigilia.", "Las fraguas de Coalmouth en la víspera."],
    ["*[outline]* The forges of Coalmouth at the eve.", "*[大綱]* 前夕的煤口鎮鍛爐。", "*[outline]* The forges of Coalmouth at the eve.", "*[アウトライン]* 前夜のコールマウスの鍛冶場。", "*[개요]* 전야의 콜마우스 대장간.", "*[Gliederung]* Die Schmieden von Coalmouth am Vorabend.", "*[plan]* Les forges de Coalmouth à la veille.", "*[scaletta]* Le forge di Coalmouth alla vigilia.", "*[esquema]* Las fraguas de Coalmouth en la víspera."]
  ];
  chapterRows.forEach((row) => addLabel(...row));

  function tr(source, lang = currentLang) {
    if (source == null) return "";
    const s = String(source);
    const leading = s.match(/^\s*/)?.[0] || "";
    const trailing = s.match(/\s*$/)?.[0] || "";
    const core = s.trim();
    let sourceKey = phraseSourceFor(s);
    let keepSpace = false;
    if (!sourceKey && core !== s) {
      sourceKey = phraseSourceFor(core);
      keepSpace = true;
    }
    let table = sourceKey ? phrases.get(sourceKey) : null;
    if (table) {
      const value = table[lang] || table[FALLBACK] || s;
      return keepSpace ? `${leading}${value}${trailing}` : value;
    }
    const patterned = translatePattern(s, lang);
    if (patterned) return applyCase(s, patterned);
    return s;
  }

  function yearLabel(y, lang = currentLang) {
    const n = Number(y);
    const before = {
      "zh-Hant": "裂前",
      en: "BR",
      ja: "裂前",
      ko: "분열 전",
      de: "VR",
      fr: "ARc",
      it: "PR",
      es: "AR"
    };
    const after = {
      "zh-Hant": "裂後",
      en: "AR",
      ja: "裂後",
      ko: "분열 후",
      de: "NR",
      fr: "PRc",
      it: "DR",
      es: "DR"
    };
    if (n < 0) return `${Math.abs(n)} ${before[lang] || before.en}`;
    return `${n} ${after[lang] || after.en}`;
  }

  function isIgnored(node) {
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return true;
    return !!el.closest("script,style,textarea,input,code,pre,[data-i18n-ignore]");
  }

  function translateTextNode(node) {
    const current = node.nodeValue;
    if (!current || !current.trim()) return;
    const last = textLast.get(node);
    if (!textSource.has(node) || current !== last) {
      textSource.set(node, current);
    }
    const source = textSource.get(node);
    const next = tr(source);
    if (next !== current) node.nodeValue = next;
    textLast.set(node, next);
  }

  function translateAttributes(el) {
    if (isIgnored(el)) return;
    const attrs = ["placeholder", "title", "aria-label", "data-placeholder", "value"];
    let byAttr = attrSource.get(el);
    if (!byAttr) {
      byAttr = {};
      attrSource.set(el, byAttr);
    }
    for (const attr of attrs) {
      if (!el.hasAttribute(attr)) continue;
      if (attr === "value" && !["BUTTON", "INPUT"].includes(el.tagName)) continue;
      if (attr === "value" && el.tagName === "INPUT" && !["button", "submit", "reset"].includes((el.getAttribute("type") || "").toLowerCase())) continue;
      const current = el.getAttribute(attr);
      if (!current || !current.trim()) continue;
      if (!byAttr[attr] || current !== byAttr[`__last_${attr}`]) byAttr[attr] = current;
      const next = tr(byAttr[attr]);
      if (next !== current) el.setAttribute(attr, next);
      byAttr[`__last_${attr}`] = next;
    }
  }

  function walk(root) {
    if (!root || isIgnored(root)) return;
    if (root.nodeType === 3) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 11) return;
    if (root.nodeType === 1) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode(node) {
        return isIgnored(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === 3) translateTextNode(node);
      else if (node.nodeType === 1) translateAttributes(node);
      node = walker.nextNode();
    }
  }

  function updateDocumentTitle() {
    const table = titleMap.get(titleSource) || titleMap.get(document.title);
    if (table) {
      document.title = table[currentLang] || table[FALLBACK] || document.title;
    }
  }

  function updateLinks() {
    const anchors = document.querySelectorAll("a[href]");
    anchors.forEach((a) => {
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(mailto|tel|javascript):/i.test(raw)) return;
      try {
        const url = new URL(raw, window.location.href);
        if (url.origin !== window.location.origin) return;
        url.searchParams.set("lang", currentLang);
        a.href = url.href;
      } catch {}
    });
  }

  function apply() {
    document.documentElement.lang = (LANGS.find((l) => l.code === currentLang) || LANGS[0]).html;
    walk(document.body || document.documentElement);
    updateDocumentTitle();
    updateLinks();
    listeners.forEach((fn) => {
      try { fn(currentLang); } catch {}
    });
  }

  function setLang(lang) {
    const normalized = normalizeLang(lang) || FALLBACK;
    currentLang = normalized;
    try { localStorage.setItem(STORAGE_KEY, normalized); } catch {}
    const url = new URL(window.location.href);
    url.searchParams.set("lang", normalized);
    window.history.replaceState(null, "", url.href);
    apply();
  }

  function injectStyles() {
    if (document.getElementById("aevenmere-i18n-style")) return;
    const style = document.createElement("style");
    style.id = "aevenmere-i18n-style";
    style.textContent = `
      .i18n-slot{display:flex;align-items:center;min-width:0}
      .i18n-switcher{display:inline-flex;align-items:center;gap:8px;padding:0;border:0;background:transparent;color:#eee3cc;font:12px/1.2 ui-sans-serif,system-ui,-apple-system,sans-serif}
      body>.i18n-switcher{display:flex;justify-content:flex-end;background:transparent;padding:8px 16px}
      .i18n-switcher label{font-weight:700;color:#d2a85f;letter-spacing:0;text-transform:none}
      .i18n-switcher select{height:28px;min-width:118px;border:1px solid rgba(238,227,204,.22);border-radius:6px;background:#171d20;color:#eee3cc;padding:0 8px;font:12px/1.2 ui-sans-serif,system-ui,-apple-system,sans-serif}
      .i18n-switcher select:focus{outline:2px solid rgba(210,168,95,.55);outline-offset:2px}
      @media (max-width:680px){.i18n-switcher label{display:none}.i18n-switcher select{min-width:92px}}
    `;
    document.head.appendChild(style);
  }

  let switcherEl = null;

  function mountSwitcher() {
    if (!switcherEl || !document.body) return;
    const slot = document.querySelector(".i18n-slot");
    const host = slot || document.body;
    if (switcherEl.parentElement !== host) {
      if (host === document.body) document.body.insertBefore(switcherEl, document.body.firstElementChild);
      else host.appendChild(switcherEl);
    } else if (host === document.body && document.body.firstElementChild !== switcherEl) {
      document.body.insertBefore(switcherEl, document.body.firstElementChild);
    }
  }

  function createSwitcher() {
    if (document.querySelector(".i18n-switcher")) {
      switcherEl = document.querySelector(".i18n-switcher");
      mountSwitcher();
      return;
    }
    injectStyles();
    const wrap = document.createElement("div");
    wrap.className = "i18n-switcher";
    wrap.setAttribute("data-i18n-ignore", "");
    const label = document.createElement("label");
    label.textContent = tr("Language", currentLang);
    label.setAttribute("for", "aevenmere-language");
    const select = document.createElement("select");
    select.id = "aevenmere-language";
    select.setAttribute("aria-label", "Language");
    LANGS.forEach((lang) => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = `${lang.short} · ${lang.name}`;
      select.appendChild(opt);
    });
    select.value = currentLang;
    select.addEventListener("change", () => setLang(select.value));
    wrap.append(label, select);
    switcherEl = wrap;
    mountSwitcher();
    window.requestAnimationFrame(mountSwitcher);
    onChange((lang) => {
      select.value = lang;
      label.textContent = tr("Language", lang);
    });
  }

  function start() {
    if (!document.body) return;
    createSwitcher();
    apply();
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => walk(node));
        if (m.type === "characterData") walk(m.target);
        if (m.type === "attributes") translateAttributes(m.target);
      }
      mountSwitcher();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label", "data-placeholder", "value"]
    });
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  window.AEVEN_I18N = {
    langs: LANGS,
    get lang() { return currentLang; },
    setLang,
    t: tr,
    yearLabel,
    apply,
    onChange
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
