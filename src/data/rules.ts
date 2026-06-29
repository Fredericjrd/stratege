export type RuleCategory =
  | 'accords'
  | 'conjugaison'
  | 'homophones'
  | 'syntaxe'
  | 'ponctuation'
  | 'lexique'
  | 'style';

export interface Rule {
  id: string;
  name: string;
  category: RuleCategory;
  level: number; // 1–10
  shortDesc: string;
}

export const RULES: Rule[] = [
  // Niveau 1 — Accords fondamentaux
  {
    id: 'acc-01',
    name: "Accord sujet-verbe",
    category: 'accords',
    level: 1,
    shortDesc: "Le verbe s'accorde avec son sujet en personne et en nombre.",
  },
  {
    id: 'acc-02',
    name: "Accord du participe passé avec être",
    category: 'accords',
    level: 1,
    shortDesc: "Le participe passé conjugué avec être s'accorde avec le sujet.",
  },
  {
    id: 'hom-01',
    name: "a / à",
    category: 'homophones',
    level: 1,
    shortDesc: "a : verbe avoir ; à : préposition.",
  },
  {
    id: 'hom-02',
    name: "est / et",
    category: 'homophones',
    level: 1,
    shortDesc: "est : verbe être ; et : conjonction de coordination.",
  },
  {
    id: 'hom-03',
    name: "son / sont",
    category: 'homophones',
    level: 1,
    shortDesc: "son : déterminant possessif ; sont : verbe être (3e p. pl.).",
  },

  // Niveau 2 — Conjugaison de base
  {
    id: 'conj-01',
    name: "Indicatif présent des verbes du 1er groupe",
    category: 'conjugaison',
    level: 2,
    shortDesc: "Terminaisons : -e, -es, -e, -ons, -ez, -ent.",
  },
  {
    id: 'conj-02',
    name: "Imparfait vs passé simple",
    category: 'conjugaison',
    level: 2,
    shortDesc: "Imparfait : action durative ou habituelle ; passé simple : action ponctuelle.",
  },
  {
    id: 'hom-04',
    name: "ce / se",
    category: 'homophones',
    level: 2,
    shortDesc: "ce : démonstratif ou présentatif ; se : pronom réfléchi.",
  },
  {
    id: 'hom-05',
    name: "ou / où",
    category: 'homophones',
    level: 2,
    shortDesc: "ou : conjonction disjonctive ; où : adverbe de lieu ou pronom relatif.",
  },
  {
    id: 'acc-03',
    name: "Pluriel des noms composés",
    category: 'accords',
    level: 2,
    shortDesc: "Seuls le nom et l'adjectif prennent la marque du pluriel selon leur fonction.",
  },

  // Niveau 3 — Participes et pronoms
  {
    id: 'acc-04',
    name: "Accord du participe passé avec avoir",
    category: 'accords',
    level: 3,
    shortDesc: "Accord avec le COD placé avant le verbe, jamais avec le sujet.",
  },
  {
    id: 'acc-05',
    name: "Accord de l'adjectif attribut",
    category: 'accords',
    level: 3,
    shortDesc: "L'adjectif attribut s'accorde avec le sujet du verbe d'état.",
  },
  {
    id: 'hom-06',
    name: "leur / leurs",
    category: 'homophones',
    level: 3,
    shortDesc: "leur pronom (invariable) vs leurs déterminant (variable en nombre).",
  },
  {
    id: 'conj-03',
    name: "Subjonctif présent",
    category: 'conjugaison',
    level: 3,
    shortDesc: "Emploi obligatoire après certaines conjonctions et verbes de volonté ou de doute.",
  },
  {
    id: 'synt-01',
    name: "Ne pas confondre complément d'objet direct et indirect",
    category: 'syntaxe',
    level: 3,
    shortDesc: "Le COD répond à \"quoi ?\" sans préposition ; le COI demande une préposition.",
  },

  // Niveau 4 — Homophones avancés
  {
    id: 'hom-07',
    name: "quand / quant / qu'en",
    category: 'homophones',
    level: 4,
    shortDesc: "quand : conjonction temporelle ; quant à : locution prépositionnelle ; qu'en : que + en.",
  },
  {
    id: 'hom-08',
    name: "davantage / d'avantage(s)",
    category: 'homophones',
    level: 4,
    shortDesc: "davantage : adverbe de quantité ; d'avantage(s) : substantif avec préposition.",
  },
  {
    id: 'conj-04',
    name: "Conditionnel présent et passé",
    category: 'conjugaison',
    level: 4,
    shortDesc: "Le conditionnel exprime l'hypothèse ou la politesse ; ne pas le confondre avec le futur.",
  },
  {
    id: 'acc-06',
    name: "Accord des adjectifs de couleur",
    category: 'accords',
    level: 4,
    shortDesc: "Les adjectifs de couleur issus de noms (marron, cerise) sont invariables.",
  },
  {
    id: 'ponc-01',
    name: "Virgule et proposition relative explicative",
    category: 'ponctuation',
    level: 4,
    shortDesc: "La relative explicative est encadrée par des virgules ; la déterminative ne l'est pas.",
  },

  // Niveau 5 — Syntaxe et style intermédiaires
  {
    id: 'synt-02',
    name: "Participe présent vs adjectif verbal",
    category: 'syntaxe',
    level: 5,
    shortDesc: "Le participe présent est invariable et marque l'action ; l'adjectif verbal s'accorde.",
  },
  {
    id: 'synt-03',
    name: "Gérondif et accord du sujet",
    category: 'syntaxe',
    level: 5,
    shortDesc: "Le gérondif a le même sujet que le verbe principal.",
  },
  {
    id: 'lex-01',
    name: "Confusions entre mots paronymes courants",
    category: 'lexique',
    level: 5,
    shortDesc: "Distinguer : évoquer / invoquer, recouvrer / recouvrir, pallier / parer à.",
  },
  {
    id: 'ponc-02',
    name: "Point-virgule dans une liste complexe",
    category: 'ponctuation',
    level: 5,
    shortDesc: "Le point-virgule sépare des éléments d'une liste dont certains contiennent des virgules.",
  },
  {
    id: 'style-01',
    name: "Éviter la nominalisation excessive",
    category: 'style',
    level: 5,
    shortDesc: "Préférer le verbe au substantif dérivé : \"analyser\" plutôt que \"procéder à une analyse\".",
  },

  // Niveau 6 — Accords complexes
  {
    id: 'acc-07',
    name: "Accord du participe passé des verbes pronominaux",
    category: 'accords',
    level: 6,
    shortDesc: "Accord avec le COD antéposé sauf pour les verbes essentiellement pronominaux.",
  },
  {
    id: 'acc-08',
    name: "Accord avec \"tout\"",
    category: 'accords',
    level: 6,
    shortDesc: "Tout adverbe est invariable sauf devant un adjectif féminin commençant par consonne ou h aspiré.",
  },
  {
    id: 'conj-05',
    name: "Concordance des temps au discours indirect",
    category: 'conjugaison',
    level: 6,
    shortDesc: "Au passé, le présent devient imparfait, le futur devient conditionnel.",
  },
  {
    id: 'lex-02',
    name: "Paronymes du registre économique",
    category: 'lexique',
    level: 6,
    shortDesc: "Distinguer : accréditer / accréditer, conjoncture / structure, solde / soldé.",
  },
  {
    id: 'ponc-03',
    name: "Deux-points et ce qu'ils introduisent",
    category: 'ponctuation',
    level: 6,
    shortDesc: "Les deux-points annoncent une explication, une énumération ou une citation directe.",
  },

  // Niveau 7 — Registre soutenu : syntaxe de la note stratégique
  {
    id: 'style-02',
    name: "Concision dans la note stratégique",
    category: 'style',
    level: 7,
    shortDesc: "Une phrase stratégique dit une seule chose. Tout terme non indispensable se supprime.",
  },
  {
    id: 'synt-04',
    name: "Parallélisme des membres d'une énumération",
    category: 'syntaxe',
    level: 7,
    shortDesc: "Dans une liste, chaque élément doit avoir la même structure grammaticale (tous infinitifs, tous nominaux, etc.).",
  },
  {
    id: 'style-03',
    name: "Hiérarchisation de l'argument par la syntaxe",
    category: 'style',
    level: 7,
    shortDesc: "Placer l'information principale en position forte (début ou fin de phrase), les nuances en incise.",
  },
  {
    id: 'lex-03',
    name: "Précision lexicale en analyse économique",
    category: 'lexique',
    level: 7,
    shortDesc: "Distinguer : rentabilité / profitabilité, croissance / expansion, solde / résultat, flux / stock.",
  },
  {
    id: 'ponc-04',
    name: "Ponctuation dans les phrases à subordination multiple",
    category: 'ponctuation',
    level: 7,
    shortDesc: "Dans une phrase à deux niveaux de subordination, isoler la proposition enchâssée la plus longue.",
  },

  // Niveau 8 — Registre scientifique
  {
    id: 'lex-04',
    name: "Emploi du conditionnel dans le discours scientifique",
    category: 'conjugaison',
    level: 8,
    shortDesc: "Le conditionnel marque le résultat non confirmé ou la prudence épistémique ; il ne remplace pas l'indicatif quand le résultat est établi.",
  },
  {
    id: 'lex-05',
    name: "Paronymes de la rédaction scientifique",
    category: 'lexique',
    level: 8,
    shortDesc: "Distinguer : corréler / confondre avec, paramètre / variable, protocole / méthode, modèle / théorie.",
  },
  {
    id: 'synt-05',
    name: "Construction impersonnelle en style académique",
    category: 'syntaxe',
    level: 8,
    shortDesc: "Les tournures \"il ressort que\", \"il apparaît que\" exigent le subjonctif ou l'indicatif selon le degré de certitude.",
  },
  {
    id: 'style-04',
    name: "Voix passive dans la rédaction scientifique",
    category: 'style',
    level: 8,
    shortDesc: "La voix passive est acceptable quand l'agent est inconnu ou non pertinent ; hors de ce cas, la voix active est plus précise.",
  },
  {
    id: 'ponc-05',
    name: "Parenthèses, crochets et incises longues",
    category: 'ponctuation',
    level: 8,
    shortDesc: "Les parenthèses encadrent une précision non indispensable à la compréhension ; les crochets servent aux ajouts dans une citation.",
  },

  // Niveau 9 — Registre de la note à comité de direction
  {
    id: 'style-05',
    name: "Structure de la note à comité de direction",
    category: 'style',
    level: 9,
    shortDesc: "Une note de direction s'ouvre sur la décision demandée, non sur le contexte. Le contexte suit, bref.",
  },
  {
    id: 'lex-06',
    name: "Faux amis du conseil en stratégie",
    category: 'lexique',
    level: 9,
    shortDesc: "Des termes courants changent de sens en contexte stratégique : \"position\" (part de marché vs attitude), \"capture\" (capter de la valeur).",
  },
  {
    id: 'synt-06',
    name: "Proposition absolue et apposition nominale",
    category: 'syntaxe',
    level: 9,
    shortDesc: "La proposition absolue (sujet + participe sans verbe conjugué) est un outil de concision ; elle exige un sujet propre distinct du sujet principal.",
  },
  {
    id: 'acc-09',
    name: "Accord avec les collectifs et les expressions de quantité",
    category: 'accords',
    level: 9,
    shortDesc: "Avec \"la plupart de\", \"le nombre de\", \"une série de\", l'accord se fait avec le complément du nom.",
  },
  {
    id: 'style-06',
    name: "Reformuler sans paraphrase",
    category: 'style',
    level: 9,
    shortDesc: "Reprendre une idée dans une phrase de synthèse exige un mot de bilan (donc, ainsi, par conséquent) sans répéter les termes.",
  },

  // Niveau 10 — Maîtrise éditoriale
  {
    id: 'style-07',
    name: "Variation lexicale et cohérence référentielle",
    category: 'style',
    level: 10,
    shortDesc: "Varier les reprises anaphoriques (pronoms, synonymes, hyponymes) sans créer d'ambiguïté référentielle.",
  },
  {
    id: 'ponc-06',
    name: "Guillemets et discours rapporté dans la presse",
    category: 'ponctuation',
    level: 10,
    shortDesc: "Les guillemets français (« ») encadrent les citations directes ; l'îlot textuel se distingue de la glose par sa ponctuation.",
  },
  {
    id: 'synt-07',
    name: "Anacoluthes et ruptures de construction",
    category: 'syntaxe',
    level: 10,
    shortDesc: "Une anacoluthe involontaire trahit une confusion entre le sujet grammatical et le sujet logique. Les détecter et les corriger.",
  },
  {
    id: 'lex-07',
    name: "Registre et connotation dans le discours économique",
    category: 'lexique',
    level: 10,
    shortDesc: "Certains termes (\"faillite\" vs \"défaillance\", \"licencier\" vs \"supprimer des postes\") ont des effets rhétoriques que le rédacteur doit contrôler.",
  },
  {
    id: 'style-08',
    name: "Phrase longue et lisibilité",
    category: 'style',
    level: 10,
    shortDesc: "Une phrase de plus de quarante mots doit pouvoir se diviser sans perte de sens. Si ce n'est pas possible, c'est qu'elle contient deux idées.",
  },
];

export const RULE_CATEGORIES: { value: RuleCategory; label: string }[] = [
  { value: 'accords', label: 'Accords' },
  { value: 'conjugaison', label: 'Conjugaison' },
  { value: 'homophones', label: 'Homophones' },
  { value: 'syntaxe', label: 'Syntaxe' },
  { value: 'ponctuation', label: 'Ponctuation' },
  { value: 'lexique', label: 'Lexique' },
  { value: 'style', label: 'Style' },
];
