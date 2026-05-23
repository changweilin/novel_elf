// Director's Desk -- narrative blueprint editor for AI-facing story structure.

const { useMemo: useMemoDirector } = React;

function directorArr(value) {
  return Array.isArray(value) ? value : [];
}

function directorSlug(value, fallback) {
  if (window.StoryStore?.slugify) return window.StoryStore.slugify(value, fallback);
  return String(value || fallback || "item").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || fallback || "item";
}

function defaultNarrative() {
  return {
    premise: "",
    themes: [],
    storylines: [],
    characterArcs: [],
    openLoops: [],
    style: {
      narration: "",
      tense: "",
      sentenceRhythm: "",
      sensoryPriority: [],
      metaphorRules: "",
      avoid: [],
      dialogue: ""
    }
  };
}

function normalizeNarrativeUi(narrative) {
  const source = narrative || {};
  const base = defaultNarrative();
  return {
    ...base,
    ...source,
    themes: directorArr(source.themes),
    storylines: directorArr(source.storylines),
    characterArcs: directorArr(source.characterArcs),
    openLoops: directorArr(source.openLoops),
    style: {
      ...base.style,
      ...(source.style || {}),
      sensoryPriority: directorArr(source.style?.sensoryPriority),
      avoid: directorArr(source.style?.avoid)
    }
  };
}

function listText(value) {
  return directorArr(value).join(", ");
}

function parseList(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function percent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

function shareFromPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number / 100));
}

function cloneNarrative(value) {
  return JSON.parse(JSON.stringify(value || defaultNarrative()));
}

const DIRECTOR_FALLBACK_LANG = "en";
const DIRECTOR_FANTASY_DEFAULTS = {
  "zh-Hant": {
    storylineLabel: "故事線",
    premise: "一名不情願的繼承者、一件危險遺物與一場古老戰爭交會；分裂王國面對被埋葬魔法的回返，每次勝利都揭露更深的代價。",
    themes: ["權力與慈悲", "臨時家人與誓言職責", "舊罪塑造新戰爭", "魔法的代價"],
    storylines: [
      ["遺物之路", "追尋遺物、解藥或王權的旅程，不斷證明敵人的歷史版本也含有真相。", "隊伍必須撐過第一個證據：王國的建國故事並不完整。"],
      ["王座疑雲", "宮廷、行會、神殿或貴族把任務變成政治武器。", "公開同盟出現時，它的私人代價也同時變得清楚。"],
      ["古老魔法的代價", "魔法能解決眼前問題，卻會重新打開上一個時代的道德傷口。", "每一次施法都幫助當場局面，也讓整本書的局勢變壞。"],
      ["盟伴裂痕", "友情、愛情、競爭與誓約讓外部任務付出情感代價。", "隊伍需要信任，但還沒有人真正有資格要求信任。"]
    ],
    arcs: [
      ["保護所愛之人，不承認更大的召喚。", "把領導當成服務，而不是王冠。", "只要保持平凡，舊戰爭就碰不到自己。", "抗拒召喚", "為任務的第一個公開後果負責。"],
      ["在危險宮廷或隊伍裡取得信任、地位或歸屬。", "在忠誠變成沉默前說出真相。", "有用比被看見更安全。", "戒備盟友", "私人債務迫使他在祕密與隊伍之間選擇。"],
      ["在禁忌知識再次傷人前控制它。", "承認沒有見證者的力量會變成另一座牢籠。", "只要一個人付出代價，就還能承受。", "隱藏代價", "揭露一條魔法規則，卻藏起更糟的一條。"],
      ["在派系戰中活下來，讓每個誓言表面上都不算破裂。", "打破服務恐懼的誓言，保留服務慈悲的誓言。", "中立能保護夾在王冠之間的人。", "分裂誓言", "公開背叛一個派系，私下救下一個人。"]
    ],
    loops: [
      ["第一幕", "誰真正擁有統治權，哪個證據被埋起來了？", "late Act II"],
      ["第一次魔法場景", "遺物每次拯救隊伍時，會要求什麼代價？", "midpoint reversal"],
      ["第一次議會場景", "哪位盟友被更古老的誓言綁在敵方？", "Act III betrayal"],
      ["序章或檔案", "對抗被埋葬魔法的第一場戰爭，真正發生了什麼？", "finale"]
    ],
    style: {
      narration: "近距離第三人稱，輪替視角，情感貼身，奇觀具體",
      sentenceRhythm: "場景推進清楚有力；危險時句子更短；奇觀、哀傷與揭露時使用較長且具觸感的句子。",
      sensoryPriority: ["視覺", "聲音", "觸感", "氣味"],
      metaphorRules: "意象來自天候、鐵、古道、血脈、爐火、廢墟、星辰、誓言、債與飢餓。",
      avoid: ["空泛預言", "泛用黑暗魔王", "設定傾倒", "沒有代價的力量等級", "瞬間信任", "未經鋪陳的天選之人確定感"],
      dialogue: "角色專屬且注意身分階級；先用潛台詞，少量使用直接誓言，讓幽默在壓力下出現。"
    }
  },
  en: {
    storylineLabel: "Storyline",
    premise: "A reluctant heir, a dangerous relic, and an old war converge as a divided realm faces the return of a buried magic; every victory should reveal a deeper cost.",
    themes: ["power versus mercy", "found family and sworn duty", "old sins shaping new wars", "the price of magic"],
    storylines: [
      ["The Relic Road", "The quest for a relic, cure, or throne keeps revealing that the enemy's version of history contains truth.", "The company must survive the first proof that the realm's founding story is incomplete."],
      ["The Throne in Doubt", "Court factions, guilds, temples, or noble houses turn the quest into a political weapon.", "A public alliance is offered at the exact moment its private cost becomes clear."],
      ["The Old Magic's Cost", "Magic can solve the visible problem only by opening a moral wound from the last age.", "Every use of power helps in the scene and worsens the book."],
      ["The Fellowship Fracture", "Friendship, romance, rivalry, and oath-bonds make the external quest emotionally expensive.", "The group needs trust before any member has earned the right to ask for it."]
    ],
    arcs: [
      ["Keep the people they love safe without accepting the larger call.", "Choose leadership as a service rather than a crown.", "If they stay ordinary, the old war cannot touch them.", "reluctant_call", "They must take responsibility for the first public consequence of the quest."],
      ["Earn trust, rank, or belonging inside a dangerous court or fellowship.", "Tell the truth before loyalty turns into silence.", "Being useful is safer than being known.", "guarded_ally", "A private debt forces them to choose between secrecy and the company."],
      ["Control forbidden knowledge before it harms the realm again.", "Admit that power without witnesses becomes another prison.", "The cost is bearable if only one person pays it.", "hidden_cost", "They reveal one rule of the magic and hide the worse rule behind it."],
      ["Survive the factional war by keeping every oath technically unbroken.", "Break the oath that serves fear and keep the one that serves mercy.", "Neutrality will protect the people caught between crowns.", "divided_oath", "They must betray a faction in public to save one person in private."]
    ],
    loops: [
      ["Act I", "Who has the stronger claim to rule, and what proof has been buried?", "late Act II"],
      ["first magic scene", "What does the relic require each time it saves the company?", "midpoint reversal"],
      ["first council scene", "Which ally is bound to the enemy by an older oath?", "Act III betrayal"],
      ["prologue or archive", "What really happened in the first war against the buried magic?", "finale"]
    ],
    style: {
      narration: "close third, rotating POV, emotionally intimate, concrete wonder",
      sentenceRhythm: "Clean, propulsive scene work; shorter clauses under danger; longer tactile sentences for wonder, grief, and reveal.",
      sensoryPriority: ["sight", "sound", "touch", "smell"],
      metaphorRules: "Draw images from weather, iron, old roads, bloodlines, hearths, ruins, stars, oaths, debt, and hunger.",
      avoid: ["empty prophecy", "generic dark lord", "exposition dumps", "power levels without cost", "instant trust", "unearned chosen one certainty"],
      dialogue: "Character-specific and status-aware; use subtext first, direct vows sparingly, and let humor appear under pressure."
    }
  },
  ja: {
    storylineLabel: "物語線",
    premise: "望まぬ継承者、危険な遺物、古い戦争が交差し、分裂した王国は埋もれた魔法の帰還に向き合う。勝利のたびに、より深い代償が明らかになる。",
    themes: ["権力と慈悲", "疑似家族と誓約の義務", "古い罪が新しい戦争を形作る", "魔法の代償"],
    storylines: [["遺物の道", "遺物、治療法、王位を追う旅は、敵の歴史にも真実があることを示し続ける。", "一行は、王国建国の物語が不完全だという最初の証拠を生き延びねばならない。"], ["揺らぐ王座", "宮廷派閥、ギルド、神殿、貴族家が旅を政治の武器に変える。", "公の同盟が差し出される瞬間、その私的な代価も明らかになる。"], ["古き魔法の代償", "魔法は目前の問題を解けるが、前時代の道徳的な傷を開く。", "力を使うたび場面は助かり、本全体の状況は悪くなる。"], ["仲間の亀裂", "友情、恋、競争、誓約が外的な旅を感情的に高くつかせる。", "一行には信頼が必要だが、まだ誰もそれを求める権利を得ていない。"]],
    arcs: [["愛する人を守りたいが、大きな召命は受け入れない。", "王冠ではなく奉仕として導く。", "平凡でいれば古い戦争に触れられない。", "召命への抵抗", "旅の最初の公的な結果に責任を負う。"], ["危険な宮廷や仲間内で信頼、地位、居場所を得たい。", "忠誠が沈黙になる前に真実を語る。", "知られるより役に立つ方が安全だ。", "警戒する味方", "私的な借りが秘密と一行の選択を迫る。"], ["禁忌の知識が再び王国を傷つける前に制御したい。", "証人なき力は別の牢獄になると認める。", "一人だけが払うなら代償は耐えられる。", "隠された代償", "魔法の規則を一つ明かし、より悪い規則を隠す。"], ["派閥戦争を、全ての誓いを表面上破らずに生き延びたい。", "恐れに仕える誓いを破り、慈悲に仕える誓いを守る。", "中立なら王冠の間にいる人々を守れる。", "分かれた誓い", "公には派閥を裏切り、私的には一人を救う。"]],
    loops: [["第一幕", "誰により強い統治権があり、どんな証拠が埋められたのか？", "第二幕後半"], ["最初の魔法場面", "遺物は一行を救うたびに何を要求するのか？", "中盤の反転"], ["最初の評議会場面", "どの味方が古い誓いで敵に結ばれているのか？", "第三幕の裏切り"], ["序章または記録", "埋もれた魔法との最初の戦争で本当は何が起きたのか？", "終幕"]],
    style: { narration: "近接三人称、交代視点、感情に近く、具体的な驚異", sentenceRhythm: "場面運びは明瞭で推進力を持たせる。危険では短く、驚異・悲嘆・開示では触感のある長い文にする。", sensoryPriority: ["視覚", "音", "触感", "匂い"], metaphorRules: "天候、鉄、古道、血筋、炉、廃墟、星、誓い、負債、飢えから比喩を取る。", avoid: ["空虚な予言", "汎用的な闇の王", "設定の垂れ流し", "代償なき力の階級", "即席の信頼", "根拠のない選ばれし者感"], dialogue: "人物固有で身分を意識する。まず含みで語り、直接の誓いは少なく、圧力下でユーモアを出す。" }
  },
  ko: {
    storylineLabel: "스토리라인",
    premise: "마지못한 상속자, 위험한 유물, 오래된 전쟁이 한곳에 모이고 분열된 왕국은 묻힌 마법의 귀환을 맞는다. 모든 승리는 더 깊은 대가를 드러내야 한다.",
    themes: ["권력과 자비", "찾은 가족과 맹세한 의무", "오래된 죄가 새 전쟁을 만든다", "마법의 대가"],
    storylines: [["유물의 길", "유물, 치료법, 왕좌를 찾는 여정은 적의 역사에도 진실이 있음을 계속 드러낸다.", "일행은 왕국 건국 이야기가 불완전하다는 첫 증거를 견뎌야 한다."], ["흔들리는 왕좌", "궁정 파벌, 길드, 사원, 귀족 가문이 여정을 정치적 무기로 바꾼다.", "공개 동맹이 제안되는 순간 그 사적인 대가도 분명해진다."], ["오래된 마법의 대가", "마법은 눈앞의 문제를 해결하지만 지난 시대의 도덕적 상처를 다시 연다.", "힘을 쓸 때마다 장면은 나아지고 책 전체의 상황은 악화된다."], ["동료의 균열", "우정, 사랑, 경쟁, 맹세가 외적 여정을 감정적으로 비싸게 만든다.", "일행은 신뢰가 필요하지만 아직 누구도 그것을 요구할 자격을 얻지 못했다."]],
    arcs: [["사랑하는 사람들을 지키고 싶지만 더 큰 부름은 받아들이지 않는다.", "왕관이 아니라 봉사로서 이끈다.", "평범하게 남으면 오래된 전쟁은 닿지 못한다.", "부름을 거부함", "여정의 첫 공개 결과에 책임져야 한다."], ["위험한 궁정이나 동료 안에서 신뢰, 지위, 소속을 얻고 싶다.", "충성이 침묵이 되기 전에 진실을 말한다.", "알려지는 것보다 쓸모 있는 것이 안전하다.", "경계하는 동맹", "사적인 빚이 비밀과 일행 사이의 선택을 강요한다."], ["금지된 지식이 왕국을 다시 해치기 전에 통제하고 싶다.", "목격자 없는 힘은 또 다른 감옥이 됨을 인정한다.", "한 사람만 대가를 치르면 견딜 수 있다.", "숨은 대가", "마법 규칙 하나를 밝히고 더 나쁜 규칙은 숨긴다."], ["모든 맹세를 기술적으로 지키며 파벌 전쟁에서 살아남고 싶다.", "두려움에 봉사하는 맹세를 깨고 자비에 봉사하는 맹세를 지킨다.", "중립이 왕관 사이의 사람들을 지켜 줄 것이다.", "갈라진 맹세", "공개적으로 한 파벌을 배신하고 사적으로 한 사람을 구한다."]],
    loops: [["1막", "누가 더 강한 통치권을 가졌고 어떤 증거가 묻혔는가?", "2막 후반"], ["첫 마법 장면", "유물은 일행을 구할 때마다 무엇을 요구하는가?", "중간 반전"], ["첫 의회 장면", "어떤 동맹이 더 오래된 맹세로 적에게 묶여 있는가?", "3막 배신"], ["프롤로그 또는 기록", "묻힌 마법과의 첫 전쟁에서 실제로 무슨 일이 있었는가?", "결말"]],
    style: { narration: "밀착 3인칭, 교대 시점, 감정적으로 가까운 구체적 경이", sentenceRhythm: "장면은 명료하고 추진력 있게; 위험에서는 짧게, 경이와 슬픔과 폭로에서는 촉감 있는 긴 문장으로.", sensoryPriority: ["시각", "소리", "촉감", "냄새"], metaphorRules: "날씨, 철, 옛길, 혈통, 화로, 폐허, 별, 맹세, 빚, 굶주림에서 이미지를 가져온다.", avoid: ["빈 예언", "흔한 어둠의 군주", "설정 덤프", "대가 없는 힘의 등급", "즉각적 신뢰", "근거 없는 선택받은 자 확신"], dialogue: "인물 고유성과 지위를 의식한다. 먼저 함축을 쓰고 직접 맹세는 아껴 쓰며 압박 속에서 유머가 나오게 한다." }
  },
  de: {
    storylineLabel: "Storyline",
    premise: "Ein widerwilliger Erbe, ein gefährliches Relikt und ein alter Krieg treffen aufeinander, während ein gespaltenes Reich die Rückkehr begrabener Magie erlebt; jeder Sieg soll tiefere Kosten zeigen.",
    themes: ["Macht gegen Gnade", "gefundene Familie und geschworene Pflicht", "alte Sünden formen neue Kriege", "der Preis der Magie"],
    storylines: [["Der Reliktpfad", "Die Suche nach Relikt, Heilung oder Thron zeigt immer wieder, dass auch die Feindgeschichte Wahrheit enthält.", "Die Gefährten müssen den ersten Beweis überstehen, dass die Gründungsgeschichte des Reiches unvollständig ist."], ["Der zweifelhafte Thron", "Hofparteien, Gilden, Tempel oder Adelshäuser machen die Quest zur politischen Waffe.", "Ein öffentliches Bündnis wird genau dann angeboten, wenn sein privater Preis klar wird."], ["Der Preis alter Magie", "Magie löst das sichtbare Problem nur, indem sie eine moralische Wunde des letzten Zeitalters öffnet.", "Jeder Einsatz von Macht hilft der Szene und verschlechtert das Buch."], ["Der Bruch der Gefährten", "Freundschaft, Liebe, Rivalität und Eide machen die äußere Quest emotional teuer.", "Die Gruppe braucht Vertrauen, bevor jemand es verlangen darf."]],
    arcs: [["Geliebte schützen, ohne den größeren Ruf anzunehmen.", "Führung als Dienst statt als Krone wählen.", "Wer gewöhnlich bleibt, wird vom alten Krieg nicht berührt.", "widerwilliger Ruf", "Die erste öffentliche Folge der Quest verantworten."], ["Vertrauen, Rang oder Zugehörigkeit an Hof oder in der Gemeinschaft gewinnen.", "Die Wahrheit sagen, bevor Loyalität zu Schweigen wird.", "Nützlich sein ist sicherer als erkannt werden.", "wachsamer Verbündeter", "Eine private Schuld erzwingt die Wahl zwischen Geheimnis und Gruppe."], ["Verbotenes Wissen kontrollieren, bevor es das Reich erneut verletzt.", "Zugeben, dass Macht ohne Zeugen zum Gefängnis wird.", "Der Preis ist tragbar, wenn nur eine Person zahlt.", "verborgener Preis", "Eine Regel der Magie enthüllen und die schlimmere verbergen."], ["Den Fraktionskrieg überleben, ohne einen Eid technisch zu brechen.", "Den Eid der Angst brechen und den Eid der Gnade bewahren.", "Neutralität schützt die Menschen zwischen den Kronen.", "geteilter Eid", "Öffentlich eine Fraktion verraten, um privat einen Menschen zu retten."]],
    loops: [["Akt I", "Wer hat den stärkeren Herrschaftsanspruch, und welcher Beweis wurde begraben?", "später Akt II"], ["erste Magieszene", "Was fordert das Relikt jedes Mal, wenn es die Gefährten rettet?", "Mittelpunkt-Wendung"], ["erste Ratsszene", "Welcher Verbündete ist durch einen älteren Eid an den Feind gebunden?", "Verrat in Akt III"], ["Prolog oder Archiv", "Was geschah wirklich im ersten Krieg gegen die begrabene Magie?", "Finale"]],
    style: { narration: "nahe dritte Person, wechselnde POVs, emotional intim, konkrete Wunder", sentenceRhythm: "Klare, treibende Szenen; kürzere Sätze bei Gefahr; längere taktile Sätze für Wunder, Trauer und Enthüllung.", sensoryPriority: ["Sicht", "Klang", "Berührung", "Geruch"], metaphorRules: "Bilder aus Wetter, Eisen, alten Straßen, Blutlinien, Herdfeuern, Ruinen, Sternen, Eiden, Schuld und Hunger.", avoid: ["leere Prophezeiung", "generischer dunkler Herrscher", "Infodumps", "Machtstufen ohne Preis", "sofortiges Vertrauen", "unverdiente Auserwähltengewissheit"], dialogue: "Figurenspezifisch und statusbewusst; zuerst Subtext, direkte Schwüre sparsam, Humor unter Druck." }
  },
  fr: {
    storylineLabel: "Intrigue",
    premise: "Un héritier réticent, une relique dangereuse et une vieille guerre convergent tandis qu'un royaume divisé affronte le retour d'une magie enfouie ; chaque victoire doit révéler un coût plus profond.",
    themes: ["pouvoir contre miséricorde", "famille choisie et devoir juré", "les vieux péchés façonnent les nouvelles guerres", "le prix de la magie"],
    storylines: [["La route de la relique", "La quête d'une relique, d'un remède ou d'un trône révèle que la version ennemie de l'histoire contient aussi du vrai.", "La compagnie doit survivre à la première preuve que le récit fondateur du royaume est incomplet."], ["Le trône incertain", "Factions de cour, guildes, temples ou maisons nobles transforment la quête en arme politique.", "Une alliance publique arrive au moment exact où son coût privé devient clair."], ["Le prix de l'ancienne magie", "La magie résout le problème visible en rouvrant une blessure morale de l'âge passé.", "Chaque usage du pouvoir aide la scène et aggrave le livre."], ["La fracture de la compagnie", "Amitié, amour, rivalité et serments rendent la quête extérieure coûteuse sur le plan émotionnel.", "Le groupe a besoin de confiance avant que quiconque ait gagné le droit de la demander."]],
    arcs: [["Protéger les êtres aimés sans accepter l'appel plus vaste.", "Choisir de diriger comme service plutôt que comme couronne.", "S'ils restent ordinaires, la vieille guerre ne les touchera pas.", "appel refusé", "Assumer la première conséquence publique de la quête."], ["Gagner confiance, rang ou appartenance dans une cour ou une compagnie dangereuse.", "Dire la vérité avant que la loyauté devienne silence.", "Être utile est plus sûr qu'être connu.", "allié méfiant", "Une dette privée force le choix entre secret et compagnie."], ["Contrôler le savoir interdit avant qu'il ne blesse encore le royaume.", "Admettre qu'un pouvoir sans témoins devient une prison.", "Le prix est supportable si une seule personne le paie.", "coût caché", "Révéler une règle de magie et cacher la pire."], ["Survivre à la guerre de factions sans briser techniquement les serments.", "Rompre le serment de la peur et garder celui de la miséricorde.", "La neutralité protégera les gens pris entre les couronnes.", "serment divisé", "Trahir publiquement une faction pour sauver quelqu'un en privé."]],
    loops: [["Acte I", "Qui a le droit le plus fort de régner, et quelle preuve a été enterrée ?", "fin de l'acte II"], ["première scène de magie", "Que demande la relique chaque fois qu'elle sauve la compagnie ?", "renversement médian"], ["première scène de conseil", "Quel allié est lié à l'ennemi par un serment plus ancien ?", "trahison de l'acte III"], ["prologue ou archives", "Que s'est-il vraiment passé lors de la première guerre contre la magie enfouie ?", "finale"]],
    style: { narration: "troisième personne proche, POV alternés, intimité émotionnelle, merveilleux concret", sentenceRhythm: "Scènes claires et propulsives ; phrases plus courtes sous danger ; phrases tactiles plus longues pour merveille, deuil et révélation.", sensoryPriority: ["vue", "son", "toucher", "odorat"], metaphorRules: "Images venues du temps, du fer, des vieilles routes, des lignées, des foyers, des ruines, des étoiles, des serments, des dettes et de la faim.", avoid: ["prophétie vide", "seigneur sombre générique", "déversements d'exposition", "niveaux de pouvoir sans coût", "confiance instantanée", "certitude d'élu non méritée"], dialogue: "Propre à chaque personnage et conscient du statut ; sous-texte d'abord, serments directs rares, humour sous pression." }
  },
  it: {
    storylineLabel: "Trama",
    premise: "Un erede riluttante, una reliquia pericolosa e una vecchia guerra convergono mentre un regno diviso affronta il ritorno di una magia sepolta; ogni vittoria deve rivelare un costo più profondo.",
    themes: ["potere contro misericordia", "famiglia trovata e dovere giurato", "vecchi peccati plasmano nuove guerre", "il prezzo della magia"],
    storylines: [["La via della reliquia", "La ricerca di una reliquia, cura o trono rivela che anche la versione nemica della storia contiene verità.", "La compagnia deve sopravvivere alla prima prova che il mito fondativo del regno è incompleto."], ["Il trono in dubbio", "Fazioni di corte, gilde, templi o casate nobili trasformano la quest in arma politica.", "Un'alleanza pubblica viene offerta proprio quando il suo costo privato diventa chiaro."], ["Il costo dell'antica magia", "La magia risolve il problema visibile solo aprendo una ferita morale dell'epoca passata.", "Ogni uso del potere aiuta la scena e peggiora il libro."], ["La frattura della compagnia", "Amicizia, amore, rivalità e giuramenti rendono costosa emotivamente la quest esterna.", "Il gruppo ha bisogno di fiducia prima che qualcuno abbia guadagnato il diritto di chiederla."]],
    arcs: [["Proteggere chi amano senza accettare la chiamata più grande.", "Scegliere la guida come servizio invece che come corona.", "Se restano ordinari, la vecchia guerra non può toccarli.", "chiamata riluttante", "Assumersi la prima conseguenza pubblica della quest."], ["Guadagnare fiducia, rango o appartenenza in una corte o compagnia pericolosa.", "Dire la verità prima che la lealtà diventi silenzio.", "Essere utili è più sicuro che essere conosciuti.", "alleato guardingo", "Un debito privato impone la scelta tra segreto e compagnia."], ["Controllare il sapere proibito prima che ferisca di nuovo il regno.", "Ammettere che il potere senza testimoni diventa un'altra prigione.", "Il costo è sopportabile se lo paga una sola persona.", "costo nascosto", "Rivelare una regola della magia e nascondere quella peggiore."], ["Sopravvivere alla guerra di fazioni senza rompere tecnicamente i giuramenti.", "Spezzare il giuramento della paura e tenere quello della misericordia.", "La neutralità proteggerà chi è preso tra le corone.", "giuramento diviso", "Tradire pubblicamente una fazione per salvare qualcuno in privato."]],
    loops: [["Atto I", "Chi ha il diritto più forte di governare, e quale prova è stata sepolta?", "tardo Atto II"], ["prima scena di magia", "Che cosa richiede la reliquia ogni volta che salva la compagnia?", "svolta di metà libro"], ["prima scena del consiglio", "Quale alleato è legato al nemico da un giuramento più antico?", "tradimento dell'Atto III"], ["prologo o archivio", "Che cosa accadde davvero nella prima guerra contro la magia sepolta?", "finale"]],
    style: { narration: "terza persona ravvicinata, POV alternati, intimità emotiva, meraviglia concreta", sentenceRhythm: "Scene pulite e propulsive; frasi più brevi nel pericolo; frasi tattili più lunghe per meraviglia, lutto e rivelazione.", sensoryPriority: ["vista", "suono", "tatto", "odore"], metaphorRules: "Immagini da tempo atmosferico, ferro, vecchie strade, linee di sangue, focolari, rovine, stelle, giuramenti, debiti e fame.", avoid: ["profezia vuota", "signore oscuro generico", "spiegoni", "livelli di potere senza costo", "fiducia istantanea", "certezza da prescelto non guadagnata"], dialogue: "Specifico per personaggio e consapevole dello status; prima sottotesto, giuramenti diretti con parsimonia, umorismo sotto pressione." }
  },
  es: {
    storylineLabel: "Línea",
    premise: "Un heredero reticente, una reliquia peligrosa y una vieja guerra convergen cuando un reino dividido afronta el regreso de una magia enterrada; cada victoria debe revelar un coste más profundo.",
    themes: ["poder contra misericordia", "familia encontrada y deber jurado", "viejos pecados moldean nuevas guerras", "el precio de la magia"],
    storylines: [["El camino de la reliquia", "La búsqueda de una reliquia, cura o trono revela que la versión enemiga de la historia también contiene verdad.", "La compañía debe sobrevivir a la primera prueba de que el relato fundador del reino está incompleto."], ["El trono en duda", "Facciones de corte, gremios, templos o casas nobles convierten la misión en arma política.", "Una alianza pública aparece justo cuando su coste privado queda claro."], ["El coste de la vieja magia", "La magia resuelve el problema visible abriendo una herida moral de la edad anterior.", "Cada uso de poder ayuda a la escena y empeora el libro."], ["La fractura de la compañía", "Amistad, romance, rivalidad y juramentos vuelven emocionalmente cara la misión exterior.", "El grupo necesita confianza antes de que nadie se haya ganado el derecho a pedirla."]],
    arcs: [["Proteger a quienes aman sin aceptar la llamada mayor.", "Elegir liderar como servicio y no como corona.", "Si siguen siendo ordinarios, la vieja guerra no podrá tocarlos.", "llamada reticente", "Asumir la primera consecuencia pública de la misión."], ["Ganar confianza, rango o pertenencia en una corte o compañía peligrosa.", "Decir la verdad antes de que la lealtad se vuelva silencio.", "Ser útil es más seguro que ser conocido.", "aliado en guardia", "Una deuda privada fuerza la elección entre secreto y compañía."], ["Controlar el conocimiento prohibido antes de que vuelva a dañar el reino.", "Admitir que el poder sin testigos se vuelve otra prisión.", "El coste es soportable si solo una persona lo paga.", "coste oculto", "Revelar una regla de la magia y ocultar la peor."], ["Sobrevivir a la guerra de facciones sin romper técnicamente ningún juramento.", "Romper el juramento que sirve al miedo y conservar el que sirve a la misericordia.", "La neutralidad protegerá a quienes están entre coronas.", "juramento dividido", "Traicionar públicamente a una facción para salvar a alguien en privado."]],
    loops: [["Acto I", "¿Quién tiene el derecho más fuerte a gobernar y qué prueba fue enterrada?", "final del Acto II"], ["primera escena de magia", "¿Qué exige la reliquia cada vez que salva a la compañía?", "giro del punto medio"], ["primera escena del consejo", "¿Qué aliado está unido al enemigo por un juramento más antiguo?", "traición del Acto III"], ["prólogo o archivo", "¿Qué ocurrió realmente en la primera guerra contra la magia enterrada?", "final"]],
    style: { narration: "tercera cercana, POV rotativo, intimidad emocional, maravilla concreta", sentenceRhythm: "Escenas limpias y propulsivas; frases más cortas bajo peligro; frases táctiles más largas para maravilla, duelo y revelación.", sensoryPriority: ["vista", "sonido", "tacto", "olor"], metaphorRules: "Imágenes de clima, hierro, caminos viejos, linajes, hogares, ruinas, estrellas, juramentos, deuda y hambre.", avoid: ["profecía vacía", "señor oscuro genérico", "volcados de exposición", "niveles de poder sin coste", "confianza instantánea", "certeza de elegido no ganada"], dialogue: "Específico de personaje y consciente del estatus; primero subtexto, juramentos directos con moderación y humor bajo presión." }
  }
};

function directorLang(lang) {
  const raw = String(lang || window.AEVEN_I18N?.lang || "").trim();
  if (DIRECTOR_FANTASY_DEFAULTS[raw]) return raw;
  const lower = raw.toLowerCase();
  if (lower === "zh" || lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant") return "zh-Hant";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("it")) return "it";
  if (lower.startsWith("es")) return "es";
  return DIRECTOR_FALLBACK_LANG;
}

function directorDefaults(lang) {
  return DIRECTOR_FANTASY_DEFAULTS[directorLang(lang)] || DIRECTOR_FANTASY_DEFAULTS[DIRECTOR_FALLBACK_LANG];
}

function fantasyDefaultNarrative(world = {}) {
  const defaults = directorDefaults();
  const characterIds = directorArr(world.characters).map((character) => character.id).filter(Boolean);
  const pov = (...indexes) => indexes.map((index) => characterIds[index]).filter(Boolean);
  const arcCount = Math.max(3, Math.min(4, characterIds.length || 3));

  return {
    premise: defaults.premise,
    themes: defaults.themes,
    storylines: defaults.storylines.map(([name, promise, currentPressure], index) => ({
      ...[
        {
        id: "line_relic_road",
        role: "main",
        targetShare: 0.4,
        povIds: pov(0, 1)
      },
      {
        id: "line_throne_in_doubt",
        role: "secondary",
        targetShare: 0.25,
        povIds: pov(1, 3)
      },
      {
        id: "line_old_magic_cost",
        role: "shadow",
        targetShare: 0.2,
        povIds: pov(2)
      },
      {
        id: "line_fellowship_fracture",
        role: "supporting",
        targetShare: 0.15,
        povIds: pov(0, 2, 3)
      }
      ][index],
      name,
      promise,
      currentPressure
    })),
    characterArcs: defaults.arcs.slice(0, arcCount).map(([want, need, lie, arcStage, nextRequiredBeat], index) => ({
      characterId: characterIds[index] || "",
      want,
      need,
      lie,
      arcStage,
      nextRequiredBeat
    })),
    openLoops: defaults.loops.map(([raisedIn, question, targetPayoff], index) => ({
      ...[
        { id: "loop_buried_claim", importance: "major", status: "active" },
        { id: "loop_relic_price", importance: "major", status: "deepening" },
        { id: "loop_traitor_oath", importance: "medium", status: "active" },
        { id: "loop_first_war", importance: "shadow", status: "active" }
      ][index],
      raisedIn,
      question,
      targetPayoff
    })),
    style: {
      narration: defaults.style.narration,
      tense: "past",
      sentenceRhythm: defaults.style.sentenceRhythm,
      sensoryPriority: defaults.style.sensoryPriority,
      metaphorRules: defaults.style.metaphorRules,
      avoid: defaults.style.avoid,
      dialogue: defaults.style.dialogue
    }
  };
}

function chapterList(world) {
  return directorArr(world.library?.books).flatMap((book) => (
    directorArr(book.volumes).flatMap((volume) => (
      directorArr(volume.chapters).map((chapter) => ({ book, volume, chapter }))
    ))
  ));
}

function DirectorDesk({ world, setWorld, readOnly = false, compact = false, onFocus }) {
  const narrative = normalizeNarrativeUi(world.narrative);
  const characters = directorArr(world.characters);
  const chapters = useMemoDirector(() => chapterList(world), [world.library]);
  const totalWords = chapters.reduce((sum, item) => sum + (Number(item.chapter.words) || 0), 0);
  const activeLoops = narrative.openLoops.filter((loop) => loop.status !== "closed").length;
  const targetTotal = narrative.storylines.reduce((sum, line) => sum + (Number(line.targetShare) || 0), 0);

  const patchNarrative = (patch) => {
    if (readOnly) return;
    setWorld((value) => ({
      ...value,
      narrative: normalizeNarrativeUi({ ...value.narrative, ...patch })
    }));
  };

  const patchStyle = (patch) => {
    patchNarrative({ style: { ...narrative.style, ...patch } });
  };

  const patchArrayItem = (key, index, patch) => {
    if (readOnly) return;
    patchNarrative({
      [key]: narrative[key].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    });
  };

  const removeArrayItem = (key, index) => {
    if (readOnly) return;
    patchNarrative({ [key]: narrative[key].filter((_, itemIndex) => itemIndex !== index) });
  };

  const addStoryline = () => {
    const index = narrative.storylines.length + 1;
    const defaults = directorDefaults();
    patchNarrative({
      storylines: [
        ...narrative.storylines,
        {
          id: directorSlug(`line_${index}`, `line_${index}`),
          name: `${defaults.storylineLabel} ${index}`,
          role: "supporting",
          targetShare: 0,
          povIds: [],
          promise: "",
          currentPressure: ""
        }
      ]
    });
  };

  const addArc = () => {
    patchNarrative({
      characterArcs: [
        ...narrative.characterArcs,
        {
          characterId: characters[0]?.id || "",
          want: "",
          need: "",
          lie: "",
          arcStage: "",
          nextRequiredBeat: ""
        }
      ]
    });
  };

  const addLoop = () => {
    const index = narrative.openLoops.length + 1;
    patchNarrative({
      openLoops: [
        ...narrative.openLoops,
        {
          id: `loop_${index}`,
          question: "",
          importance: "minor",
          targetPayoff: "",
          status: "active"
        }
      ]
    });
  };

  const restoreFantasyDefaults = () => {
    if (readOnly) return;
    const message = window.AEVEN_I18N?.t("Restore Director's Desk fantasy defaults? Current Director's Desk values will be replaced.") || "Restore Director's Desk fantasy defaults? Current Director's Desk values will be replaced.";
    if (!confirm(message)) return;
    setWorld((value) => ({
      ...value,
      narrative: normalizeNarrativeUi(cloneNarrative(fantasyDefaultNarrative(value)))
    }));
  };

  const storylineStats = narrative.storylines.map((line) => {
    const matching = chapters.filter((item) => directorArr(item.chapter.storylineIds).includes(line.id));
    const words = matching.reduce((sum, item) => sum + (Number(item.chapter.words) || 0), 0);
    return {
      chapters: matching.length,
      words,
      actualShare: totalWords > 0 ? words / totalWords : 0
    };
  });

  return (
    <div className={`director ${compact ? "is-compact" : ""} ${readOnly ? "is-readonly" : ""}`}>
      <header className="director-head">
        <div>
          <span className="director-kicker">Folio IV</span>
          <h2>Director's Desk</h2>
        </div>
        <div className="director-head-actions">
          <div className="director-stats">
            <span>{narrative.storylines.length} lines</span>
            <span>{activeLoops} open loops</span>
            <span>{Math.round(targetTotal * 100)}% target</span>
          </div>
          {!readOnly && <button className="director-mini director-restore" onClick={restoreFantasyDefaults}>Restore defaults</button>}
        </div>
      </header>

      <section className="director-panel director-span">
        <header className="director-panel-head">
          <span>Story Shape</span>
        </header>
        <div className="director-grid two">
          <label className="director-field">
            <span>Premise</span>
            <textarea value={narrative.premise} readOnly={readOnly} onChange={(e) => patchNarrative({ premise: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Themes</span>
            <textarea value={listText(narrative.themes)} readOnly={readOnly} onChange={(e) => patchNarrative({ themes: parseList(e.target.value) })} />
          </label>
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Style Bible</span>
        </header>
        <div className="director-grid">
          <label className="director-field">
            <span>Narration</span>
            <input value={narrative.style.narration || ""} readOnly={readOnly} onChange={(e) => patchStyle({ narration: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Tense</span>
            <select value={narrative.style.tense || ""} disabled={readOnly} onChange={(e) => patchStyle({ tense: e.target.value })}>
              <option value="">Unset</option>
              <option value="present">Present</option>
              <option value="past">Past</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="director-field">
            <span>Sentence Rhythm</span>
            <textarea value={narrative.style.sentenceRhythm || ""} readOnly={readOnly} onChange={(e) => patchStyle({ sentenceRhythm: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Sensory Priority</span>
            <input value={listText(narrative.style.sensoryPriority)} readOnly={readOnly} onChange={(e) => patchStyle({ sensoryPriority: parseList(e.target.value) })} />
          </label>
          <label className="director-field">
            <span>Metaphor Rules</span>
            <textarea value={narrative.style.metaphorRules || ""} readOnly={readOnly} onChange={(e) => patchStyle({ metaphorRules: e.target.value })} />
          </label>
          <label className="director-field">
            <span>Avoid</span>
            <textarea value={listText(narrative.style.avoid)} readOnly={readOnly} onChange={(e) => patchStyle({ avoid: parseList(e.target.value) })} />
          </label>
          <label className="director-field director-wide">
            <span>Dialogue</span>
            <textarea value={narrative.style.dialogue || ""} readOnly={readOnly} onChange={(e) => patchStyle({ dialogue: e.target.value })} />
          </label>
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Storyline Mix</span>
          {!readOnly && <button className="director-mini" onClick={addStoryline}>+ line</button>}
        </header>
        <div className="director-stack">
          {narrative.storylines.map((line, index) => {
            const stat = storylineStats[index] || { chapters: 0, words: 0, actualShare: 0 };
            const targetPct = percent(line.targetShare);
            const actualPct = percent(stat.actualShare);
            return (
              <article key={line.id || index} className="director-card">
                <div className="director-card-head">
                  <input className="director-title-input" value={line.name || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { name: e.target.value })} />
                  {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("storylines", index)}>x</button>}
                </div>
                <div className="director-grid line">
                  <label className="director-field">
                    <span>ID</span>
                    <input value={line.id || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { id: directorSlug(e.target.value, line.id || "line") })} />
                  </label>
                  <label className="director-field">
                    <span>Role</span>
                    <select value={line.role || "supporting"} disabled={readOnly} onChange={(e) => patchArrayItem("storylines", index, { role: e.target.value })}>
                      <option value="main">Main</option>
                      <option value="secondary">Secondary</option>
                      <option value="shadow">Shadow</option>
                      <option value="supporting">Supporting</option>
                    </select>
                  </label>
                  <label className="director-field">
                    <span>Target %</span>
                    <input type="number" min="0" max="100" value={targetPct} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { targetShare: shareFromPercent(e.target.value) })} />
                  </label>
                  <label className="director-field">
                    <span>POV IDs</span>
                    <input value={listText(line.povIds)} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { povIds: parseList(e.target.value) })} />
                  </label>
                  <label className="director-field director-wide">
                    <span>Promise</span>
                    <textarea value={line.promise || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { promise: e.target.value })} />
                  </label>
                  <label className="director-field director-wide">
                    <span>Current Pressure</span>
                    <textarea value={line.currentPressure || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("storylines", index, { currentPressure: e.target.value })} />
                  </label>
                </div>
                <div className="director-meter-row">
                  <span>{actualPct}% actual · {stat.chapters} chapters · {stat.words.toLocaleString()} words</span>
                  <div className="director-meter"><i style={{ width: `${Math.min(100, actualPct)}%` }} />{targetPct > 0 && <b style={{ left: `${Math.min(100, targetPct)}%` }} />}</div>
                </div>
              </article>
            );
          })}
          {!narrative.storylines.length && <div className="director-empty">No storylines yet</div>}
        </div>
      </section>

      <section className="director-panel">
        <header className="director-panel-head">
          <span>Character Arcs</span>
          {!readOnly && <button className="director-mini" onClick={addArc}>+ arc</button>}
        </header>
        <div className="director-stack">
          {narrative.characterArcs.map((arc, index) => (
            <article key={`${arc.characterId || "arc"}_${index}`} className="director-card">
              <div className="director-card-head">
                <select className="director-title-input" value={arc.characterId || ""} disabled={readOnly} onChange={(e) => patchArrayItem("characterArcs", index, { characterId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
                </select>
                <div className="director-card-actions">
                  {arc.characterId && onFocus && <button className="director-mini" onClick={() => onFocus(arc.characterId)}>open</button>}
                  {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("characterArcs", index)}>x</button>}
                </div>
              </div>
              <div className="director-grid two">
                {[
                  ["want", "Want"],
                  ["need", "Need"],
                  ["lie", "Lie"],
                  ["arcStage", "Stage"],
                  ["nextRequiredBeat", "Next Beat"]
                ].map(([key, label]) => (
                  <label key={key} className={`director-field ${key === "nextRequiredBeat" ? "director-wide" : ""}`}>
                    <span>{label}</span>
                    <textarea value={arc[key] || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("characterArcs", index, { [key]: e.target.value })} />
                  </label>
                ))}
              </div>
            </article>
          ))}
          {!narrative.characterArcs.length && <div className="director-empty">No arcs yet</div>}
        </div>
      </section>

      <section className="director-panel director-span">
        <header className="director-panel-head">
          <span>Open Loops</span>
          {!readOnly && <button className="director-mini" onClick={addLoop}>+ loop</button>}
        </header>
        <div className="director-loop-grid">
          {narrative.openLoops.map((loop, index) => (
            <article key={loop.id || index} className="director-card">
              <div className="director-card-head">
                <input className="director-title-input" value={loop.id || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { id: directorSlug(e.target.value, loop.id || "loop") })} />
                {!readOnly && <button className="director-icon" onClick={() => removeArrayItem("openLoops", index)}>x</button>}
              </div>
              <div className="director-grid loop">
                <label className="director-field director-wide">
                  <span>Question</span>
                  <textarea value={loop.question || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { question: e.target.value })} />
                </label>
                <label className="director-field">
                  <span>Importance</span>
                  <select value={loop.importance || "minor"} disabled={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { importance: e.target.value })}>
                    <option value="major">Major</option>
                    <option value="medium">Medium</option>
                    <option value="minor">Minor</option>
                    <option value="shadow">Shadow</option>
                  </select>
                </label>
                <label className="director-field">
                  <span>Status</span>
                  <select value={loop.status || "active"} disabled={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="deepening">Deepening</option>
                    <option value="ready_to_pay">Ready to Pay</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <label className="director-field">
                  <span>Raised In</span>
                  <input value={loop.raisedIn || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { raisedIn: e.target.value })} />
                </label>
                <label className="director-field">
                  <span>Target Payoff</span>
                  <input value={loop.targetPayoff || ""} readOnly={readOnly} onChange={(e) => patchArrayItem("openLoops", index, { targetPayoff: e.target.value })} />
                </label>
              </div>
            </article>
          ))}
          {!narrative.openLoops.length && <div className="director-empty">No loops yet</div>}
        </div>
      </section>
    </div>
  );
}

window.DirectorDesk = DirectorDesk;
