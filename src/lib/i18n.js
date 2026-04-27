// ── i18n — English / German ───────────────────────────────────
export const LANGUAGES = { en: 'EN', de: 'DE', fr: 'FR', es: 'ES', zh: '中文', hi: 'हिन्दी' }

export const STRINGS = {
  en: {
    // Onboarding
    chooseStyle:    'Choose your play style',
    whoIsPlaying:   "Who's playing?",
    upTo16:         'Add up to 16 players',
    addPlayer:      'Add player',
    viewRulesStart: 'View rules & start',
    gameRules:      'Game Rules',
    leaderboard:    'Live Leaderboard',
    leaderboardQ:   'Add your scores to the live room leaderboard?',
    yesShowUs:      'Yes, show us!',
    noThanks:       'No thanks',
    namesAppear:    'Names and scores appear on the screen in the room.',
    playPrivate:    "We'll play without appearing on the public board.",
    startGame:      'Start Game',
    starting:       'Starting…',
    back:           'Back',
    // Play styles
    casual:         'Casual',
    competitive:    'Competitive',
    silly:          'Silly',
    fun:            'Just for Fun',
    classic:        'Classic',
    oneAtATime:     'One at a time',
    spinTheWheel:   'Spin the wheel',
    noScores:       'No scores',
    casualDesc:     'Normal scoring. Relaxed, no pressure.',
    competitiveDesc:'Take turns. You can nudge other balls.',
    sillyDesc:      'Normal scoring + a spin wheel after every hole.',
    funDesc:        'No scores, no leaderboard. Just enjoy the course.',
    // HoleScreen
    hole:           'Hole',
    challenge:      'Challenge',
    rules:          'Rules',
    next:           'Next',
    finish:         'Finish',
    skipHole:       'Skip or jump to another hole',
    jumpToHole:     'Jump to a hole',
    skipAndReturn:  'Skip this hole and come back later',
    current:        'Current',
    skipped:        'Skipped',
    scored:         'Scored',
    total:          'Total',
    leading:        'Leading',
    noScoresEntered:'No scores entered',
    noScoresMsg:    'None of your players have a score yet. Skip this hole, or go back and score it.',
    skipThisHole:   'Skip this hole',
    goBackScore:    'Go back and score it',
    skipHoleQ:      'Skip this hole?',
    skipHoleDesc:   "Shows as — in your scorecard and won't count. You can fill it in at the end.",
    skipIt:         'Skip it',
    cancel:         'Cancel',
    // Timer
    challengeTimer: 'Challenge Timer',
    startTimer:     'Start Timer',
    getReady:       'Get ready…',
    timesUp:        "Time's up!",
    reset:          'Reset',
    // Spinner
    spinTheWheelTitle: 'Spin the wheel!',
    physicalWheelMsg:  "Head to the physical wheel in the corner and give it a spin. Come back when you're done!",
    doneLetsContinue:  "Done — let's continue!",
    // Mode change
    gameOptions:    'Game Options',
    changePlayStyle:'Change Play Style',
    restartGame:    'Restart Game',
    restartQ:       'Restart the game?',
    restartDesc:    'All scores and photos from this round will be lost. This cannot be undone.',
    restart:        'Restart',
    // Photos
    memories:       'Memories',
    makeMemory:     'Make a Memory',
    saveMemory:     'Save this memory?',
    savePolaroid:   'Save Polaroid',
    retake:         'Retake',
    saving:         'Saving…',
    // End screen
    gameOver:       'Game Over',
    finalStandings: 'Final Standings',
    playAgain:      'Play Again',
    shareScorecard: 'Share Scorecard',
    downloadPng:    'Download PNG',
  },

  de: {
    // Onboarding
    chooseStyle:    'Spielstil wählen',
    whoIsPlaying:   'Wer spielt mit?',
    upTo16:         'Bis zu 16 Spieler',
    addPlayer:      'Spieler hinzufügen',
    viewRulesStart: 'Regeln ansehen & starten',
    gameRules:      'Spielregeln',
    leaderboard:    'Live-Bestenliste',
    leaderboardQ:   'Soll euer Ergebnis auf der Bestenliste erscheinen?',
    yesShowUs:      'Ja, zeig uns!',
    noThanks:       'Nein danke',
    namesAppear:    'Namen und Punkte erscheinen auf dem Bildschirm im Raum.',
    playPrivate:    'Wir spielen ohne öffentliche Sichtbarkeit.',
    startGame:      'Spiel starten',
    starting:       'Starte…',
    back:           'Zurück',
    // Play styles
    casual:         'Casual',
    competitive:    'Kompetitiv',
    silly:          'Lustig',
    fun:            'Nur zum Spaß',
    classic:        'Klassisch',
    oneAtATime:     'Einer nach dem anderen',
    spinTheWheel:   'Am Rad drehen',
    noScores:       'Keine Punkte',
    casualDesc:     'Normale Wertung. Entspannt, kein Druck.',
    competitiveDesc:'Abwechselnd spielen. Andere Bälle dürfen angestupst werden.',
    sillyDesc:      'Normale Wertung + nach jedem Loch wird am Rad gedreht.',
    funDesc:        'Keine Punkte, keine Bestenliste. Einfach genießen.',
    // HoleScreen
    hole:           'Loch',
    challenge:      'Challenge',
    rules:          'Regeln',
    next:           'Weiter',
    finish:         'Fertig',
    skipHole:       'Überspringen oder zu einem anderen Loch springen',
    jumpToHole:     'Zu einem Loch springen',
    skipAndReturn:  'Dieses Loch überspringen und später zurückkommen',
    current:        'Aktuell',
    skipped:        'Übersprungen',
    scored:         'Gewertet',
    total:          'Gesamt',
    leading:        'Führend',
    noScoresEntered:'Keine Punkte eingegeben',
    noScoresMsg:    'Noch kein Spieler hat einen Punkt eingetragen. Überspringen oder zurück.',
    skipThisHole:   'Dieses Loch überspringen',
    goBackScore:    'Zurück und eintragen',
    skipHoleQ:      'Dieses Loch überspringen?',
    skipHoleDesc:   'Erscheint als — im Ergebnis und zählt nicht. Kann später eingetragen werden.',
    skipIt:         'Überspringen',
    cancel:         'Abbrechen',
    // Timer
    challengeTimer: 'Challenge-Timer',
    startTimer:     'Timer starten',
    getReady:       'Macht euch bereit…',
    timesUp:        'Zeit abgelaufen!',
    reset:          'Zurücksetzen',
    // Spinner
    spinTheWheelTitle: 'Dreh das Rad!',
    physicalWheelMsg:  'Geh zum Rad in der Ecke und dreh es. Komm zurück wenn du fertig bist!',
    doneLetsContinue:  'Fertig — weiter geht\'s!',
    // Mode change
    gameOptions:    'Spieloptionen',
    changePlayStyle:'Spielstil ändern',
    restartGame:    'Spiel neu starten',
    restartQ:       'Spiel neu starten?',
    restartDesc:    'Alle Punkte und Fotos gehen verloren. Das kann nicht rückgängig gemacht werden.',
    restart:        'Neu starten',
    // Photos
    memories:       'Erinnerungen',
    makeMemory:     'Foto aufnehmen',
    saveMemory:     'Erinnerung speichern?',
    savePolaroid:   'Polaroid speichern',
    retake:         'Wiederholen',
    saving:         'Speichern…',
    // End screen
    gameOver:       'Spiel vorbei',
    finalStandings: 'Endstand',
    playAgain:      'Nochmal spielen',
    shareScorecard: 'Ergebnis teilen',
    downloadPng:    'PNG herunterladen',
  },
}

// Append additional languages
Object.assign(STRINGS, {
  fr: {
    chooseStyle:'Choisissez votre style de jeu',whoIsPlaying:'Qui joue ?',upTo16:"Jusqu'à 16 joueurs",
    addPlayer:'Ajouter un joueur',viewRulesStart:'Voir les règles et commencer',gameRules:'Règles du jeu',
    leaderboard:'Classement en direct',leaderboardQ:'Ajouter vos scores au classement ?',
    yesShowUs:'Oui, montrez-nous !',noThanks:'Non merci',namesAppear:'Les noms et scores apparaissent sur l\'écran.',
    playPrivate:'Nous jouons sans apparaître sur le tableau.',startGame:'Démarrer',starting:'Démarrage…',back:'Retour',
    casual:'Casual',competitive:'Compétitif',silly:'Rigolo',fun:'Juste pour le plaisir',
    classic:'Classique',oneAtATime:'Un par un',spinTheWheel:'Faire tourner la roue',noScores:'Sans points',
    casualDesc:'Score normal. Détendu, sans pression.',competitiveDesc:'À tour de rôle. Vous pouvez pousser les autres balles.',
    sillyDesc:'Score normal + une roue à tourner après chaque trou.',funDesc:'Pas de points, pas de classement. Profitez simplement.',
    hole:'Trou',challenge:'Défi',rules:'Règles',next:'Suivant',finish:'Terminer',
    skipHole:'Passer ou aller à un autre trou',jumpToHole:'Aller à un trou',skipAndReturn:'Passer ce trou et revenir plus tard',
    current:'Actuel',skipped:'Passé',scored:'Scoré',total:'Total',leading:'En tête',
    noScoresEntered:'Aucun score saisi',noScoresMsg:'Aucun joueur n\'a encore de score. Passez ce trou ou revenez en arrière.',
    skipThisHole:'Passer ce trou',goBackScore:'Revenir et scorer',skipHoleQ:'Passer ce trou ?',
    skipHoleDesc:'Apparaît comme — dans votre carte de score et ne compte pas.',skipIt:'Passer',cancel:'Annuler',
    challengeTimer:'Minuteur de défi',startTimer:'Démarrer le minuteur',getReady:'Préparez-vous…',timesUp:'Temps écoulé !',reset:'Réinitialiser',
    spinTheWheelTitle:'Tournez la roue !',physicalWheelMsg:'Allez à la roue dans le coin et faites-la tourner. Revenez quand vous avez terminé !',
    doneLetsContinue:'Terminé — continuons !',gameOptions:'Options de jeu',changePlayStyle:'Changer le style',
    restartGame:'Recommencer le jeu',restartQ:'Recommencer ?',restartDesc:'Tous les scores et photos seront perdus.',restart:'Recommencer',
    memories:'Souvenirs',makeMemory:'Prendre une photo',saveMemory:'Sauvegarder ce souvenir ?',
    savePolaroid:'Sauvegarder le polaroïd',retake:'Reprendre',saving:'Sauvegarde…',
    gameOver:'Jeu terminé',finalStandings:'Classement final',playAgain:'Rejouer',shareScorecard:'Partager la carte de score',downloadPng:'Télécharger PNG',
  },
  es: {
    chooseStyle:'Elige tu estilo de juego',whoIsPlaying:'¿Quién juega?',upTo16:'Hasta 16 jugadores',
    addPlayer:'Agregar jugador',viewRulesStart:'Ver reglas y comenzar',gameRules:'Reglas del juego',
    leaderboard:'Clasificación en vivo',leaderboardQ:'¿Agregar puntajes al marcador?',
    yesShowUs:'¡Sí, muéstranos!',noThanks:'No gracias',namesAppear:'Los nombres aparecen en la pantalla de la sala.',
    playPrivate:'Jugamos sin aparecer en el marcador público.',startGame:'Iniciar juego',starting:'Iniciando…',back:'Volver',
    casual:'Casual',competitive:'Competitivo',silly:'Divertido',fun:'Solo por diversión',
    classic:'Clásico',oneAtATime:'Uno a la vez',spinTheWheel:'Girar la rueda',noScores:'Sin puntos',
    casualDesc:'Puntuación normal. Relajado, sin presión.',competitiveDesc:'Por turnos. Puedes empujar las bolas de otros.',
    sillyDesc:'Puntuación normal + girar la rueda después de cada hoyo.',funDesc:'Sin puntos, sin ranking. Solo disfruta.',
    hole:'Hoyo',challenge:'Desafío',rules:'Reglas',next:'Siguiente',finish:'Terminar',
    skipHole:'Saltar o ir a otro hoyo',jumpToHole:'Ir a un hoyo',skipAndReturn:'Saltar este hoyo y volver después',
    current:'Actual',skipped:'Saltado',scored:'Marcado',total:'Total',leading:'Liderando',
    noScoresEntered:'Sin puntuación',noScoresMsg:'Ningún jugador tiene puntuación aún. Saltad el hoyo o volved.',
    skipThisHole:'Saltar este hoyo',goBackScore:'Volver y puntuar',skipHoleQ:'¿Saltar este hoyo?',
    skipHoleDesc:'Aparece como — en tu tarjeta y no cuenta.',skipIt:'Saltar',cancel:'Cancelar',
    challengeTimer:'Temporizador de desafío',startTimer:'Iniciar temporizador',getReady:'Prepárense…',timesUp:'¡Tiempo agotado!',reset:'Reiniciar',
    spinTheWheelTitle:'¡Gira la rueda!',physicalWheelMsg:'Ve a la rueda en la esquina y gírala. ¡Vuelve cuando termines!',
    doneLetsContinue:'¡Listo — continuemos!',gameOptions:'Opciones del juego',changePlayStyle:'Cambiar estilo',
    restartGame:'Reiniciar juego',restartQ:'¿Reiniciar el juego?',restartDesc:'Se perderán todos los puntos y fotos.',restart:'Reiniciar',
    memories:'Recuerdos',makeMemory:'Tomar una foto',saveMemory:'¿Guardar este recuerdo?',
    savePolaroid:'Guardar Polaroid',retake:'Volver a tomar',saving:'Guardando…',
    gameOver:'Fin del juego',finalStandings:'Clasificación final',playAgain:'Jugar de nuevo',shareScorecard:'Compartir tarjeta',downloadPng:'Descargar PNG',
  },
  zh: {
    chooseStyle:'选择游戏模式',whoIsPlaying:'谁在玩？',upTo16:'最多16名玩家',
    addPlayer:'添加玩家',viewRulesStart:'查看规则并开始',gameRules:'游戏规则',
    leaderboard:'实时排行榜',leaderboardQ:'是否将分数添加到排行榜？',
    yesShowUs:'是的，显示我们！',noThanks:'不用了',namesAppear:'姓名和分数将显示在房间屏幕上。',
    playPrivate:'我们不显示在公共排行榜上。',startGame:'开始游戏',starting:'启动中…',back:'返回',
    casual:'休闲',competitive:'竞技',silly:'搞笑',fun:'纯娱乐',
    classic:'经典',oneAtATime:'依次进行',spinTheWheel:'转动转盘',noScores:'不计分',
    casualDesc:'正常计分，轻松无压力。',competitiveDesc:'轮流击球，可以推开他人的球。',
    sillyDesc:'正常计分，每个洞后转动转盘。',funDesc:'不计分不排名，只享受乐趣。',
    hole:'洞',challenge:'挑战',rules:'规则',next:'下一步',finish:'完成',
    skipHole:'跳过或跳转到其他洞',jumpToHole:'跳转到洞',skipAndReturn:'跳过此洞，稍后返回',
    current:'当前',skipped:'已跳过',scored:'已计分',total:'总计',leading:'领先',
    noScoresEntered:'未输入分数',noScoresMsg:'还没有玩家输入分数，请跳过或返回输入。',
    skipThisHole:'跳过此洞',goBackScore:'返回并计分',skipHoleQ:'跳过此洞？',
    skipHoleDesc:'显示为 — 且不计入总分，可以之后补填。',skipIt:'跳过',cancel:'取消',
    challengeTimer:'挑战计时器',startTimer:'开始计时',getReady:'准备好了…',timesUp:'时间到！',reset:'重置',
    spinTheWheelTitle:'转动转盘！',physicalWheelMsg:'前往角落的转盘并旋转它，完成后回来！',
    doneLetsContinue:'完成——继续！',gameOptions:'游戏选项',changePlayStyle:'更改游戏模式',
    restartGame:'重新开始游戏',restartQ:'重新开始游戏？',restartDesc:'所有分数和照片将丢失，无法撤销。',restart:'重新开始',
    memories:'回忆',makeMemory:'拍一张照片',saveMemory:'保存这张回忆？',
    savePolaroid:'保存宝丽来',retake:'重拍',saving:'保存中…',
    gameOver:'游戏结束',finalStandings:'最终排名',playAgain:'再玩一次',shareScorecard:'分享成绩单',downloadPng:'下载PNG',
  },
  hi: {
    chooseStyle:'अपना खेल शैली चुनें',whoIsPlaying:'कौन खेल रहा है?',upTo16:'16 खिलाड़ियों तक',
    addPlayer:'खिलाड़ी जोड़ें',viewRulesStart:'नियम देखें और शुरू करें',gameRules:'खेल के नियम',
    leaderboard:'लाइव लीडरबोर्ड',leaderboardQ:'क्या लीडरबोर्ड पर स्कोर जोड़ना है?',
    yesShowUs:'हाँ, दिखाओ!',noThanks:'नहीं धन्यवाद',namesAppear:'नाम और स्कोर कमरे की स्क्रीन पर दिखेंगे।',
    playPrivate:'हम सार्वजनिक बोर्ड पर नहीं दिखेंगे।',startGame:'खेल शुरू करें',starting:'शुरू हो रहा है…',back:'वापस',
    casual:'आरामदायक',competitive:'प्रतिस्पर्धात्मक',silly:'मज़ेदार',fun:'सिर्फ मनोरंजन',
    classic:'क्लासिक',oneAtATime:'एक-एक करके',spinTheWheel:'पहिया घुमाओ',noScores:'कोई स्कोर नहीं',
    casualDesc:'सामान्य स्कोरिंग। आरामदायक, कोई दबाव नहीं।',competitiveDesc:'बारी-बारी खेलें। दूसरों की गेंद हटा सकते हैं।',
    sillyDesc:'सामान्य स्कोरिंग + हर होल के बाद पहिया घुमाओ।',funDesc:'कोई स्कोर नहीं, कोई रैंकिंग नहीं। बस आनंद लें।',
    hole:'होल',challenge:'चुनौती',rules:'नियम',next:'अगला',finish:'समाप्त',
    skipHole:'छोड़ें या किसी अन्य होल पर जाएं',jumpToHole:'होल पर जाएं',skipAndReturn:'यह होल छोड़ें और बाद में वापस आएं',
    current:'वर्तमान',skipped:'छोड़ा',scored:'स्कोर किया',total:'कुल',leading:'आगे',
    noScoresEntered:'कोई स्कोर नहीं डाला',noScoresMsg:'किसी खिलाड़ी ने अभी तक स्कोर नहीं डाला है।',
    skipThisHole:'यह होल छोड़ें',goBackScore:'वापस जाएं और स्कोर करें',skipHoleQ:'यह होल छोड़ें?',
    skipHoleDesc:'स्कोरकार्ड में — दिखेगा और गिना नहीं जाएगा।',skipIt:'छोड़ें',cancel:'रद्द करें',
    challengeTimer:'चुनौती टाइमर',startTimer:'टाइमर शुरू करें',getReady:'तैयार हो जाओ…',timesUp:'समय समाप्त!',reset:'रीसेट',
    spinTheWheelTitle:'पहिया घुमाओ!',physicalWheelTitle:'कोने में जाकर पहिया घुमाएं। वापस आएं जब हो जाए!',
    doneLetsContinue:'हो गया — चलते हैं!',gameOptions:'खेल विकल्प',changePlayStyle:'शैली बदलें',
    restartGame:'खेल फिर से शुरू करें',restartQ:'खेल फिर से शुरू करें?',restartDesc:'सभी स्कोर और फोटो खो जाएंगे।',restart:'फिर से शुरू करें',
    memories:'यादें',makeMemory:'फोटो लें',saveMemory:'यह याद सहेजें?',
    savePolaroid:'पोलरॉइड सहेजें',retake:'दोबारा लें',saving:'सहेज रहा है…',
    gameOver:'खेल समाप्त',finalStandings:'अंतिम स्थिति',playAgain:'फिर खेलें',shareScorecard:'स्कोरकार्ड साझा करें',downloadPng:'PNG डाउनलोड करें',
  },
})

// Additional strings
if (STRINGS.en) STRINGS.en.howToSpin = 'How do you want to spin?';
if (STRINGS.en) STRINGS.en.spinChoiceDesc = 'After each hole someone spins for a challenge — digital on your phone or the physical wheel in the corner!';
if (STRINGS.en) STRINGS.en.spinOnPhone = 'Spin on my phone';
if (STRINGS.en) STRINGS.en.spinPhysical = 'Use physical wheel in the corner';
if (STRINGS.en) STRINGS.en.duplicateNamesWarning = "Duplicate names — we'll add a number automatically (e.g. Max (2))";
if (STRINGS.en) STRINGS.en.private = 'Private';
if (STRINGS.en) STRINGS.en.public = 'Public';
if (STRINGS.de) STRINGS.de.howToSpin = 'Wie möchtet ihr drehen?';
if (STRINGS.de) STRINGS.de.spinChoiceDesc = 'Nach jedem Loch dreht jemand für eine Herausforderung — digital am Handy oder am physischen Rad in der Ecke!';
if (STRINGS.de) STRINGS.de.spinOnPhone = 'Am Handy drehen';
if (STRINGS.de) STRINGS.de.spinPhysical = 'Physisches Rad in der Ecke benutzen';
if (STRINGS.de) STRINGS.de.duplicateNamesWarning = 'Doppelte Namen – wir fügen automatisch eine Zahl hinzu (z.B. Max (2))';
if (STRINGS.de) STRINGS.de.private = 'Privat';
if (STRINGS.de) STRINGS.de.public = 'Öffentlich';
if (STRINGS.fr) STRINGS.fr.howToSpin = 'Comment voulez-vous tourner ?';
if (STRINGS.fr) STRINGS.fr.spinChoiceDesc = "Après chaque trou quelqu'un tourne pour un défi — numérique sur le téléphone ou la roue physique dans le coin !";
if (STRINGS.fr) STRINGS.fr.spinOnPhone = 'Tourner sur mon téléphone';
if (STRINGS.fr) STRINGS.fr.spinPhysical = 'Utiliser la roue physique dans le coin';
if (STRINGS.fr) STRINGS.fr.duplicateNamesWarning = 'Noms en double — nous ajouterons un numéro automatiquement (ex: Max (2))';
if (STRINGS.fr) STRINGS.fr.private = 'Privé';
if (STRINGS.fr) STRINGS.fr.public = 'Public';
if (STRINGS.es) STRINGS.es.howToSpin = '¿Cómo quieres girar?';
if (STRINGS.es) STRINGS.es.spinChoiceDesc = 'Después de cada hoyo alguien gira para un desafío — digital en el teléfono o la rueda física en la esquina.';
if (STRINGS.es) STRINGS.es.spinOnPhone = 'Girar en mi teléfono';
if (STRINGS.es) STRINGS.es.spinPhysical = 'Usar la rueda física en la esquina';
if (STRINGS.es) STRINGS.es.duplicateNamesWarning = 'Nombres duplicados — añadiremos un número automáticamente (ej: Max (2))';
if (STRINGS.es) STRINGS.es.private = 'Privado';
if (STRINGS.es) STRINGS.es.public = 'Público';
if (STRINGS.zh) STRINGS.zh.howToSpin = '你想怎么转？';
if (STRINGS.zh) STRINGS.zh.spinChoiceDesc = '每个洞后有人转动获得挑战任务 — 用手机数字转盘或角落的实体转盘！';
if (STRINGS.zh) STRINGS.zh.spinOnPhone = '用手机转';
if (STRINGS.zh) STRINGS.zh.spinPhysical = '使用角落的实体转盘';
if (STRINGS.zh) STRINGS.zh.duplicateNamesWarning = '重复名字 — 我们会自动添加编号（如 Max (2)）';
if (STRINGS.zh) STRINGS.zh.private = '私密';
if (STRINGS.zh) STRINGS.zh.public = '公开';
if (STRINGS.hi) STRINGS.hi.howToSpin = 'आप कैसे घुमाना चाहते हैं?';
if (STRINGS.hi) STRINGS.hi.spinChoiceDesc = 'हर होल के बाद कोई एक चुनौती के लिए घुमाता है — फोन पर या कोने में फिजिकल व्हील!';
if (STRINGS.hi) STRINGS.hi.spinOnPhone = 'फोन पर घुमाएं';
if (STRINGS.hi) STRINGS.hi.spinPhysical = 'कोने का फिजिकल व्हील इस्तेमाल करें';
if (STRINGS.hi) STRINGS.hi.duplicateNamesWarning = 'डुप्लिकेट नाम — हम स्वचालित रूप से एक नंबर जोड़ेंगे (जैसे Max (2))';
if (STRINGS.hi) STRINGS.hi.private = 'निजी';
if (STRINGS.hi) STRINGS.hi.public = 'सार्वजनिक';
