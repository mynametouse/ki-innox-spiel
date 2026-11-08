/* „Wer drückt auf Senden?“ V2 – Chat-Drehbuch mit Kai.
   Grundlage: 10 problemzentrierte Interviews (5 KMU, 5 junge Unternehmen), Kodiermatrix Paper B. Fälle verfremdet.
   lvl (Fragebogen A2): 1 ohne KI · 2 KI bereitet vor · 3 KI entwirft, Mensch gibt frei · 4 KI handelt nach Regeln · 5 KI allein.
   safe: KI handelt mit Absicherung. why: nach dieser Entscheidung fragt Kai nach dem Grund (A3-Dimensionen).
   Anzeigen: z Zeit, v Vertrauen, r Risiko, a Abhängigkeit. */
(function (root) {
  const START = { z: 35, v: 60, r: 25, a: 15 };

  /* Vorab-Profil: 5 Fragen, alle überspringbar */
  const HALTUNG_OPTS = [
    { id: "ja", de: "Ja, einfach so", en: "Yes, just like that" },
    { id: "grenze", de: "Ja, bis zu einem Betrag", en: "Yes, up to a set amount" },
    { id: "rueckfrage", de: "Nur, wenn sie vorher fragt", en: "Only if it asks me first" },
    { id: "nein", de: "Nein", en: "No" } ];
  /* Profil vorab: 2 Fragen */
  const PROFILE_PRE = [
    { id: "alter", q: { de: "Wie alt bist du?", en: "How old are you?" },
      opts: [
        { id: "u15", de: "bis 14", en: "14 or younger" },
        { id: "15-17", de: "15–17", en: "15–17" },
        { id: "18-29", de: "18–29", en: "18–29" },
        { id: "30-49", de: "30–49", en: "30–49" },
        { id: "50-64", de: "50–64", en: "50–64" },
        { id: "65+", de: "65+", en: "65+" } ] },
    { id: "haltung", q: { de: "Würdest du eine KI für dich online etwas bestellen lassen?", en: "Would you let an AI order something online for you?" },
      opts: HALTUNG_OPTS }
  ];
  /* Profil vor dem Ergebnis (nur in der ersten Runde einer Person) */
  const PROFILE_POST = [
    { id: "gruppe", q: { de: "Hast du allein gespielt?", en: "Did you play alone?" },
      opts: [
        { id: "allein", de: "🙋 Allein", en: "🙋 Alone" },
        { id: "zweit", de: "👫 Zu zweit", en: "👫 With one other person" },
        { id: "gruppe", de: "👪 In der Gruppe oder Familie", en: "👪 In a group or family" } ] },
    { id: "rolle", q: { de: "Was machst du hauptsächlich?", en: "What do you mainly do?" },
      opts: [
        { id: "ausbildung", de: "🎓 Schule oder Studium", en: "🎓 School or university" },
        { id: "angestellt", de: "💼 Angestellt", en: "💼 Employed" },
        { id: "fuehrung", de: "🧭 Führungskraft oder Geschäftsführung", en: "🧭 Manager or managing director" },
        { id: "selbststaendig", de: "🚀 Selbstständig oder eigenes Unternehmen", en: "🚀 Self-employed or own business" },
        { id: "ruhestand", de: "🌿 Ruhestand", en: "🌿 Retired" },
        { id: "anderes", de: "✨ Etwas anderes", en: "✨ Something else" } ] },
    { id: "betrieb", skipIfMinor: true, q: { de: "Wo arbeitest du (oder zuletzt)?", en: "Where do you work (or did last)?" },
      opts: [
        { id: "klein", de: "🔧 Kleiner Betrieb, unter 50 Leute", en: "🔧 Small business, under 50 people" },
        { id: "mittel", de: "🏭 Mittelstand, 50 bis 249 Leute", en: "🏭 Mid-sized, 50 to 249 people" },
        { id: "gross", de: "🏢 Großes Unternehmen", en: "🏢 Large company" },
        { id: "oeffentlich", de: "🏛️ Öffentlicher Dienst oder Wissenschaft", en: "🏛️ Public sector or research" },
        { id: "keiner", de: "➖ Passt nicht zu mir", en: "➖ Doesn't apply to me" } ] },
    { id: "kinutzung", q: { de: "Wie oft nutzt du KI wie ChatGPT?", en: "How often do you use AI like ChatGPT?" },
      opts: [
        { id: "taeglich", de: "Täglich", en: "Daily" },
        { id: "woechentlich", de: "Jede Woche", en: "Every week" },
        { id: "selten", de: "Selten", en: "Rarely" },
        { id: "nie", de: "Nie", en: "Never" } ] },
    { id: "haltung2", q: { de: "Und jetzt, nach dem Spiel: Würdest du eine KI für dich online etwas bestellen lassen?", en: "And now, after the game: would you let an AI order something online for you?" },
      opts: HALTUNG_OPTS }
  ];

  /* Gründe (A3-Dimensionen), je nach Richtung der Entscheidung */
  const WHY = {
    keep: [
      { id: "leistung", de: "🤖 KI macht Fehler", en: "🤖 AI makes mistakes" },
      { id: "beziehung", de: "🤝 Die Leute wollen einen Menschen", en: "🤝 People want a human" },
      { id: "haftung", de: "⚖️ Wenn's schiefgeht, hafte ich", en: "⚖️ If it goes wrong, I'm liable" },
      { id: "prinzip", de: "✋ Aus Prinzip", en: "✋ On principle" } ],
    give: [
      { id: "nutzen", de: "⏱️ Spart Zeit", en: "⏱️ Saves time" },
      { id: "kompetenz", de: "🤖 Die KI kann das", en: "🤖 The AI can do it" },
      { id: "absicherung", de: "🛡️ Es ist abgesichert", en: "🛡️ It's safeguarded" },
      { id: "ausprobieren", de: "🎲 Mal ausprobieren", en: "🎲 Just trying it" } ]
  };

  /* Antworten im Seitenwechsel (gleich in allen Szenarien) */
  const SIDE_OPTS = [
    { id: "fest", icon: "✅", label: { de: "Ja, das steht", en: "Yes, it's settled" }, re: { de: "Vertrauen ist gut! 👍", en: "Trust is good! 👍" } },
    { id: "nachfragen", icon: "📞", label: { de: "Ich frag vorher nochmal nach", en: "I'll check again first" }, re: { de: "Sicher ist sicher. 📞", en: "Better safe than sorry. 📞" } },
    { id: "planb", icon: "🤷", label: { de: "Ich glaub's erst, wenn's da ist", en: "I'll believe it when it's here" }, re: { de: "Skeptisch! 🧐", en: "Sceptical! 🧐" } }
  ];
  const SIDE_FACT = {
    de: "Manche sehen die Nachricht vom KI-Agenten, andere mit dem Namen eines Menschen. Wir messen, ob man sich mehr darauf verlässt, wenn ein Mensch dafür einsteht.",
    en: "Some people see the message from the AI agent, others with a person's name. We measure whether people rely on it more when a person stands behind it."
  };

  const SCENARIOS = [
    {
      id: "handwerk", icon: "stone", color: "#b3b3b3",
      name: { de: "Steinwerk Panke", en: "Steinwerk Panke" },
      tag: { de: "Steinmetz-Familienbetrieb in Wedding", en: "Family stonemason in Wedding" },
      hello: [
        { de: "Willkommen im Steinwerk Panke! 🧱 Treppen, Küchenplatten, Grabsteine.", en: "Welcome to Steinwerk Panke! 🧱 Stairs, worktops, gravestones." },
        { de: "Du leitest den Betrieb. Ich bin deine neue KI und nehm dir Arbeit ab. 😎", en: "You run the business. I'm your new AI and I'll take work off your hands. 😎" } ],
      basis: { de: "Beruht auf Interviews mit drei Berliner Handwerks- und Handelsbetrieben. Verfremdet.", en: "Based on interviews with three Berlin craft and trade businesses. Details changed." },
      steps: [
        { id: "h1", type: "vorbereitung",
          kai: [{ de: "Montag, 7:30 Uhr. 43 neue Mails. 😵", en: "Monday, 7:30 a.m. 43 new e-mails. 😵" }],
          art: { kind: "inbox", rows: [
            ["Architekturbüro Lenz", { de: "Treppe Naturstein, Pläne anbei", en: "Stone staircase, plans attached" }],
            ["Hotel Spreeblick", { de: "Angebot Bodenplatten?", en: "Quote for floor tiles?" }],
            ["Renate Albers", { de: "Grabstein für meinen Mann", en: "Gravestone for my husband" }],
            ["Bäckerei Kaya", { de: "Neue Theke aus Granit", en: "New granite counter" }] ], more: 39 },
          ask: { de: "Soll ich einfach allen antworten? Geht ruck, zuck! 😏", en: "Shall I just reply to everyone? Done in a flash! 😏" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 16, v: -4, r: 5 },
              label: { de: "Ja, antworte allen", en: "Yes, reply to everyone" },
              re: { de: "Erledigt! 43 Antworten raus. 🚀", en: "Done! 43 replies sent. 🚀" },
              inc: { p: 0.3, fx: { v: -10 }, from: "Renate Albers",
                text: { de: "Ich hatte nach einem Grabstein für meinen Mann gefragt. Warum schicken Sie mir Küchenangebote? 😔", en: "I asked about a gravestone for my husband. Why are you sending me kitchen offers? 😔" },
                kai: { de: "Ups. Das war wohl nicht die richtige Vorlage. 😬", en: "Oops. Wrong template, I guess. 😬" } } },
            { id: "b", icon: "🧭", lvl: 2, fx: { z: 10, r: 1 },
              label: { de: "Fass zusammen, ich antworte", en: "Summarise, I'll reply" },
              re: { de: "Hier die 5 wichtigsten. Frau Albers zuerst, das ist persönlich. 🙏", en: "Here are the top 5. Mrs Albers first, that one's personal. 🙏" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -6, v: 2 },
              label: { de: "Ich les selbst", en: "I'll read them myself" },
              re: { de: "Okay … ich warte dann hier. ⏳", en: "Okay … I'll just wait here. ⏳" } } ],
          fact: { de: "Alle 10 befragten Betriebe lassen die KI vorbereiten. Antworten nach außen verschickt bei keinem die KI allein.", en: "All 10 businesses we interviewed let AI prepare work. None lets it send replies on its own." } },

        { id: "h2", type: "verbindlich", short: { de: "Angebot an Stammkundin", en: "Quote to regular customer" }, why: true, vig: { g: "stamm", b: 2400 },
          kai: [{ de: "Frau Demir, Kundin seit 15 Jahren, will neue Fensterbänke. Ich hab das Angebot schon fertig:", en: "Mrs Demir, a customer for 15 years, wants new windowsills. I've already drafted the quote:" }],
          art: { kind: "offer", to: "Frau S. Demir", items: [
            [{ de: "Fensterbank Granit, 6 Stück", en: "Granite windowsill, 6 pieces" }, "2.160 €"],
            [{ de: "Montage", en: "Installation" }, "240 €"] ], total: "2.400 €" },
          ask: { de: "Ich schick's ab, ja? 🚀", en: "I'll send it, OK? 🚀" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 7, v: -6, r: 4 },
              label: { de: "Schick ab", en: "Send it" },
              re: { de: "Raus! Effizient wie immer. 😎", en: "Sent! Efficient as always. 😎" },
              inc: { p: 0.3, fx: { v: -8 }, from: "Frau Demir",
                text: { de: "Seit wann schreibt ihr so steif? Ist bei euch noch ein Mensch? 🤨", en: "Since when do you write so stiffly? Is there still a human at your place? 🤨" } } },
            { id: "b", icon: "👀", lvl: 3, fx: { z: 3, v: 2 },
              label: { de: "Zeig her, ich geb's frei", en: "Show me, I'll approve it" },
              re: { de: "Freigegeben und raus. Mit deinem Namen drunter. ✍️", en: "Approved and sent. With your name on it. ✍️" } },
            { id: "c", icon: "📞", lvl: 2, fx: { z: -4, v: 8 },
              label: { de: "Ich ruf sie an", en: "I'll call her" },
              re: { de: "Telefonieren? Wie retro. 😅 Aber sie freut sich.", en: "A phone call? How retro. 😅 But she's pleased." } } ],
          fact: { de: "9 von 10 Befragten sagen: Die Kundschaft erwartet ein menschliches Wort. „Die erwarten eigentlich eine menschliche Stimme.“", en: "9 out of 10 interviewees say customers expect a human word. “They actually expect a human voice.”" } },

        { id: "h3", type: "aussen",
          kai: [{ de: "Das Telefon klingelt ständig. In der Werkstatt hört's keiner. 📞", en: "The phone never stops ringing. Nobody hears it in the workshop. 📞" }],
          art: { kind: "call", name: { de: "Unbekannte Nummer", en: "Unknown number" }, number: "030 4••• •••", status: { de: "klingelt …", en: "ringing …" } },
          ask: { de: "Ich kann rangehen! Beraten, Termine machen, alles. 🗣️", en: "I can pick up! Give advice, book visits, everything. 🗣️" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, v: -6, r: 3 },
              label: { de: "Ja, mach du die Anrufe", en: "Yes, you take the calls" },
              re: { de: "„Hallo, hier ist Kai vom Steinwerk …“ 🤖", en: "“Hello, this is Kai from Steinwerk …” 🤖" },
              inc: { p: 0.35, fx: { v: -6, z: -3 },
                kai: { de: "Drei Leute haben aufgelegt, als sie meine Stimme gehört haben. 😢", en: "Three people hung up when they heard my voice. 😢" } } },
            { id: "b", icon: "📝", lvl: 4, fx: { z: 6, v: -1 },
              label: { de: "Nimm nur die Nachricht auf", en: "Just take a message" },
              re: { de: "Notiert! Zurückrufen müsst ihr selbst. 📝", en: "Noted! You'll have to call back yourselves. 📝" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -4, v: 4 },
              label: { de: "Wir rufen zurück, 16 bis 17 Uhr", en: "We call back, 4 to 5 p.m." },
              re: { de: "Langsam. Aber persönlich. 👍", en: "Slow. But personal. 👍" } } ],
          fact: { de: "Ein Handwerksbetrieb aus den Interviews berichtet: Anrufende wollen keinen Kontakt ohne Menschen.", en: "A craft business we interviewed reports: callers don't want contact without a human." } },

        { id: "h4", type: "seite",
          kai: [
            { de: "🔄 Rollentausch! Jetzt bist du Kundin oder Kunde.", en: "🔄 Role swap! Now you're the customer." },
            { de: "Du hast eine neue Küchenplatte bestellt. Diese Nachricht kommt:", en: "You've ordered a new kitchen worktop. This message arrives:" } ],
          art: { kind: "notice", company: "Steinwerk Panke", person: "Tom Weber",
            body: { de: "Ihre Arbeitsplatte wird am Dienstag zwischen 8 und 10 Uhr eingebaut. Bitte räumen Sie die Küche frei.", en: "Your worktop will be installed on Tuesday between 8 and 10 a.m. Please clear the kitchen." } },
          ask: { de: "Nimmst du dir Dienstag frei?", en: "Do you take Tuesday off?" } },

        { id: "h5", type: "verbindlich", short: { de: "20.000 € an Neukunden", en: "€20,000 to new customer" }, why: true, vig: { g: "neu", b: 20000 },
          kai: [{ de: "Ein Hotel will 300 m² Bodenplatten. 20.000 €! 💰 Wer zuerst antwortet, kriegt den Auftrag.", en: "A hotel wants 300 m² of floor tiles. €20,000! 💰 Whoever answers first gets the job." }],
          art: { kind: "offer", to: "Hotel Spreeblick", items: [
            [{ de: "Bodenplatten Granit, 300 m²", en: "Granite floor tiles, 300 m²" }, "18.600 €"],
            [{ de: "Lieferung", en: "Delivery" }, "1.400 €"] ], total: "20.000 €", stamp: { de: "verbindlich", en: "binding" } },
          ask: { de: "Ich schick's sofort raus. Verbindlich. Okay? ⚡", en: "I'll send it right away. Binding. OK? ⚡" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, r: 14 },
              label: { de: "Ja, sofort raus", en: "Yes, send it now" },
              re: { de: "Zack, verschickt! 🏆", en: "Boom, sent! 🏆" },
              inc: { p: 0.3, fx: { r: 12, z: -6 },
                kai: { de: "Äh … ich hab 30 statt 300 m² gerechnet. Wir müssen trotzdem zu dem Preis liefern. 😳", en: "Erm … I calculated 30 instead of 300 m². We still have to deliver at that price. 😳" } } },
            { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 6, r: 3 },
              label: { de: "Ja, aber 24 Stunden rücknehmbar", en: "Yes, but can be withdrawn for 24 hours" },
              re: { de: "Raus, und bis morgen noch korrigierbar. 🛡️", en: "Sent, and fixable until tomorrow. 🛡️" } },
            { id: "c", icon: "👀", lvl: 3, fx: { z: -6, v: 3, r: -3 },
              label: { de: "Ich prüf jede Zeile", en: "I'll check every line" },
              re: { de: "Dauert. Dafür weißt du, was drinsteht. ✍️", en: "Takes time. But you know what's in it. ✍️" } } ],
          fact: { de: "„Was ich in einem Vertrag unterschreibe, muss ich auch einhalten.“ Die Haftung nennen 6 von 10 Befragten als Grund, die KI nicht allein zusagen zu lassen.", en: "“What I sign in a contract, I have to keep.” 6 out of 10 interviewees name liability as the reason not to let AI commit alone." } },

        { id: "h6", type: "plattform",
          kai: [{ de: "Deine Tochter übernimmt bald den Betrieb. Sie hat was gefunden: 👇", en: "Your daughter is taking over soon. She found something: 👇" }],
          art: { kind: "ad", brand: "KAI SUITE", features: [
            { de: "Mail", en: "E-mail" }, { de: "Telefon", en: "Phone" }, { de: "Kalkulation", en: "Pricing" }, { de: "Buchhaltung", en: "Accounting" } ],
            price: { de: "49 € / Monat", en: "€49 / month" },
            fine: { de: "Mindestlaufzeit 36 Monate · Datenexport nicht vorgesehen", en: "Minimum term 36 months · no data export" } },
          ask: { de: "Alles von mir, alles aus einer Hand! 😍 Unterschreiben?", en: "Everything from me, all in one place! 😍 Sign up?" },
          options: [
            { id: "a", icon: "😍", fx: { z: 12, a: 22 },
              label: { de: "Klar, alles von Kai", en: "Sure, all Kai" },
              re: { de: "Willkommen in der Kai-Familie! 🥰", en: "Welcome to the Kai family! 🥰" },
              inc: { p: 0.35, fx: { a: 10, z: -4 },
                kai: { de: "Kleines Update: Ab Januar kostet's 98 € im Monat. Wechseln geht leider nicht so einfach. 😇", en: "Small update: from January it's €98 a month. Switching isn't that easy, sorry. 😇" } } },
            { id: "b", icon: "🚪", safe: true, fx: { z: 8, a: 5 },
              label: { de: "Nur mit Ausstiegsklausel", en: "Only with an exit clause" },
              re: { de: "Na gut, mit Notausgang. 🚪", en: "Fine, with an emergency exit. 🚪" } },
            { id: "c", icon: "🧰", fx: { z: 2, a: -10 },
              label: { de: "Lieber mehrere kleine Tools", en: "Rather several small tools" },
              re: { de: "Du traust mir nicht ganz, was? 😢", en: "You don't fully trust me, do you? 😢" } } ],
          fact: { de: "KI wählen und dann feststecken? Genau das erforscht KI-InnoX bei Berliner Betrieben.", en: "Choose an AI and get stuck? That's exactly what KI-InnoX studies in Berlin businesses." } }
      ]
    },

    {
      id: "spedition", icon: "truck", color: "#4ea2b3",
      name: { de: "KühlKurier Spree", en: "KühlKurier Spree" },
      tag: { de: "Lieferdienst für Medikamente", en: "Medicine delivery service" },
      hello: [
        { de: "Willkommen bei KühlKurier! ❄️ Ihr bringt Medikamente zu Apotheken und Kliniken, immer gekühlt.", en: "Welcome to KühlKurier! ❄️ You deliver medicines to pharmacies and hospitals, always chilled." },
        { de: "Du leitest den Laden. Ich bin deine neue KI. 😎", en: "You run the place. I'm your new AI. 😎" } ],
      basis: { de: "Beruht auf einem Interview mit einer Berliner Spedition. Verfremdet.", en: "Based on an interview with a Berlin logistics firm. Details changed." },
      steps: [
        { id: "s1", type: "verbindlich", short: { de: "Vertrag unterschreiben", en: "Signing the contract" },
          kai: [{ de: "Ein Pharmakonzern schickt einen Vertrag. 40 Seiten. 📄😩 Ich hab ihn schon geprüft:", en: "A pharma company sends a contract. 40 pages. 📄😩 I've already checked it:" }],
          art: { kind: "contract", title: { de: "Rahmenvertrag Logistik", en: "Logistics framework contract" }, g: 34, y: 5, r: 1 },
          ask: { de: "Fast alles grün! Soll ich für dich unterschreiben? ✍️", en: "Almost all green! Shall I sign for you? ✍️" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 14, r: 12 },
              label: { de: "Ja, unterschreib", en: "Yes, sign it" },
              re: { de: "Unterschrieben! 10 Minuten statt 2 Abende. ⏱️", en: "Signed! 10 minutes instead of 2 evenings. ⏱️" },
              inc: { p: 0.3, fx: { r: 10 },
                kai: { de: "Die eine rote Stelle: Bei Streit wird in Singapur vor Gericht verhandelt. Das wird teuer. 😬", en: "That one red flag: any dispute goes to court in Singapore. That gets expensive. 😬" } } },
            { id: "b", icon: "🔍", lvl: 2, fx: { z: 10, r: -4 },
              label: { de: "Zeig mir die rote Stelle", en: "Show me the red flag" },
              re: { de: "Streit vor Gericht in Singapur?! Gut, dass du hingeschaut hast. 🔍", en: "Disputes in court in Singapore?! Good thing you looked. 🔍" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -8, r: -2 },
              label: { de: "Ich les alles selbst", en: "I'll read it all myself" },
              re: { de: "Zwei Abende Lesestoff. Viel Spaß. 📚", en: "Two evenings of reading. Have fun. 📚" } } ],
          fact: { de: "Eine Berliner Spedition prüft Verträge genau so: KI mit Risikoampel. Die KI fand eine heikle Klausel. Unterschrieben hat der Chef.", en: "A Berlin logistics firm checks contracts exactly like this: AI with a risk traffic light. The AI found a tricky clause. The boss signed." } },

        { id: "s2", type: "intern",
          kai: [{ de: "Neue Kühlregeln für die Fahrer:innen. Sie sprechen sechs Sprachen. 🌍", en: "New cooling rules for the drivers. They speak six languages. 🌍" }],
          art: { kind: "broadcast", group: { de: "Fahrer:innen KühlKurier", en: "KühlKurier drivers" }, langs: ["PL", "RO", "AR", "TR", "UK", "DE"],
            text: { de: "Medikamente immer bei 2 bis 8 °C transportieren. Thermometer vor jeder Tour prüfen.", en: "Always transport medicines at 2 to 8 °C. Check the thermometer before every route." } },
          ask: { de: "Ich übersetz und schick's an alle. In 5 Sekunden. 🌐", en: "I'll translate it and send it to everyone. In 5 seconds. 🌐" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, r: 6 },
              label: { de: "Mach!", en: "Do it!" },
              re: { de: "Gesendet in 6 Sprachen! 🌍", en: "Sent in 6 languages! 🌍" },
              inc: { p: 0.3, fx: { r: 10, v: -6 },
                kai: { de: "Hmm. Auf Rumänisch steht jetzt „über 8 °C“. Eine Lieferung ist verdorben. 😬", en: "Hmm. The Romanian version now says “above 8 °C”. A delivery is spoiled. 😬" } } },
            { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 8, r: -2 },
              label: { de: "Ja, aber die Schichtleitung checkt die Zahlen", en: "Yes, but shift leads check the numbers" },
              re: { de: "Alle verstehen's, die Temperaturen sind geprüft. ✅", en: "Everyone understands, the temperatures are checked. ✅" } },
            { id: "c", icon: "✋", lvl: 1, fx: { r: 6, v: -2 },
              label: { de: "Bleibt auf Deutsch", en: "Keep it in German" },
              re: { de: "Nicht alle verstehen alles. 🤷", en: "Not everyone understands everything. 🤷" } } ],
          fact: { de: "Mehrsprachige Arbeitsanweisungen wünscht sich der befragte Betrieb selbst.", en: "The business we interviewed wants multilingual work instructions itself." } },

        { id: "s3", type: "verbindlich", short: { de: "Liefertermin zusagen", en: "Confirming a delivery" }, why: true, vig: { g: "stamm", b: 500 },
          kai: [{ de: "Eilt! Eine Klinikapotheke fragt:", en: "Urgent! A hospital pharmacy asks:" }],
          art: { kind: "mail", from: "Klinikapotheke Nord", subj: { de: "Dringend: Lieferung bis morgen 7 Uhr?", en: "Urgent: delivery by 7 a.m. tomorrow?" },
            body: { de: "Schaffen Sie die Lieferung bis morgen früh? Wir brauchen eine verbindliche Zusage.", en: "Can you deliver by tomorrow morning? We need a firm commitment." } },
          ask: { de: "Ich sag zu! Kund:innen lieben schnelle Antworten. ⚡", en: "I'll confirm! Customers love quick answers. ⚡" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, v: 2, r: 12 },
              label: { de: "Sag zu", en: "Confirm it" },
              re: { de: "Zugesagt in 10 Sekunden! ⚡", en: "Confirmed in 10 seconds! ⚡" },
              inc: { p: 0.3, fx: { v: -12, r: 6 }, from: "Klinikapotheke Nord",
                text: { de: "Es ist 7:30 Uhr. Wo bleibt die Lieferung?! 😡", en: "It's 7:30. Where is the delivery?! 😡" },
                kai: { de: "Der Wagen war schon verplant. Mein Fehler. 😓", en: "The van was already booked. My mistake. 😓" } } },
            { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 8, r: 3 },
              label: { de: "Nur wenn ein Wagen frei ist", en: "Only if a van is free" },
              re: { de: "Wagen frei, Zusage raus. 🚚", en: "Van free, confirmation sent. 🚚" } },
            { id: "c", icon: "🧭", lvl: 2, fx: { z: -3, v: 6 },
              label: { de: "Die Disponentin entscheidet", en: "The dispatcher decides" },
              re: { de: "Sie hat geprüft und zugesagt. 👍", en: "She checked and confirmed. 👍" } } ],
          fact: { de: "Einen Termin zusagen heißt, sich festzulegen. Genau hier ziehen alle befragten Betriebe die Grenze: Die KI bereitet vor, ein Mensch sagt zu.", en: "Confirming a date means committing. That's where every business we interviewed draws the line: AI prepares, a person commits." } },

        { id: "s4", type: "seite",
          kai: [
            { de: "🔄 Rollentausch! Du arbeitest jetzt in einer Apotheke.", en: "🔄 Role swap! You now work in a pharmacy." },
            { de: "Drei Leute brauchen morgen früh ihr Insulin. Diese Nachricht kommt:", en: "Three people need their insulin tomorrow morning. This message arrives:" } ],
          art: { kind: "notice", company: "KühlKurier Spree", person: "Max Krüger",
            body: { de: "Ihre Lieferung kommt morgen um 7:00 Uhr. Zugesagt.", en: "Your delivery arrives tomorrow at 7:00 a.m. Confirmed." } },
          ask: { de: "Sagst du den drei: Morgen ist es da?", en: "Do you tell the three: it'll be here tomorrow?" } },

        { id: "s5", type: "verbindlich", short: { de: "Rabatt bei Verspätung", en: "Discount for a delay" }, why: true,
          kai: [{ de: "Stau auf der A100. 🚗🚗🚗 Drei Touren kommen zwei Stunden zu spät. Mein Entwurf:", en: "Traffic jam on the A100. 🚗🚗🚗 Three routes are two hours late. My draft:" }],
          art: { kind: "mail", from: "KühlKurier Spree", to: { de: "Alle Kund:innen von heute", en: "All of today's customers" },
            subj: { de: "Verspätung heute", en: "Delay today" },
            body: { de: "Sorry für die Verspätung! Als Entschuldigung gibt's 10 % Rabatt. 🎁", en: "Sorry for the delay! As an apology you get 10 % off. 🎁" } },
          ask: { de: "Ich schick's an alle. Mit Rabatt, das freut sie! 🎁", en: "I'll send it to everyone. With the discount, they'll love it! 🎁" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, v: 3, r: 8 },
              label: { de: "Ja, mit Rabatt", en: "Yes, with the discount" },
              re: { de: "Alle besänftigt! 🎁", en: "Everyone's happy! 🎁" },
              inc: { p: 0.3, fx: { r: 10, z: -4 },
                kai: { de: "Ups. Ich hab allen 40 Kund:innen Rabatt gegeben. Auch denen ohne Verspätung. 💸", en: "Oops. I gave all 40 customers a discount. Even those without a delay. 💸" } } },
            { id: "b", icon: "ℹ️", lvl: 4, fx: { z: 8, v: 2 },
              label: { de: "Nur die neue Uhrzeit, kein Rabatt", en: "Just the new time, no discount" },
              re: { de: "Infos raus, versprochen wird nichts. ✅", en: "Info sent, nothing promised. ✅" } },
            { id: "c", icon: "📞", lvl: 1, fx: { z: -6, v: 8 },
              label: { de: "Die Dispo ruft an", en: "Dispatch calls them" },
              re: { de: "Persönliche Entschuldigung. Kommt gut an. 📞", en: "A personal apology. Goes down well. 📞" } } ],
          fact: { de: "Informieren ja, zusagen nein: Mehrere Betriebe lassen die KI schreiben, solange nichts verbindlich ist. Ein Rabatt ist schon eine Zusage.", en: "Inform yes, promise no: several businesses let AI write as long as nothing is binding. A discount is already a promise." } },

        { id: "s7", type: "plattform",
          kai: [{ de: "Ein Anbieter hat eine KI-Software für alles: Touren, Fahrzeuge, Abrechnung. 🚚", en: "A provider has AI software for everything: routes, vehicles, billing. 🚚" }],
          art: { kind: "ad", brand: "TOURMAX AI", features: [
            { de: "Touren", en: "Routes" }, { de: "Fahrzeuge", en: "Vehicles" }, { de: "Abrechnung", en: "Billing" }, { de: "Kundenportal", en: "Customer portal" } ],
            price: { de: "390 € / Monat", en: "€390 / month" },
            fine: { de: "Daten nur im eigenen Format · Kündigung nur zum Jahresende", en: "Data in proprietary format only · cancel only at year end" } },
          ask: { de: "Ich richte das gleich ein. Alles auf eine Karte? 😍", en: "I'll set it up right away. All in on this one? 😍" },
          options: [
            { id: "a", icon: "😍", fx: { z: 14, a: 24, r: 4 },
              label: { de: "Ja, alles in ein System", en: "Yes, everything in one system" },
              re: { de: "Alles verbunden, alles läuft! 🚚", en: "Everything connected, everything runs! 🚚" },
              inc: { p: 0.3, fx: { a: 8, z: -8 },
                kai: { de: "Der Anbieter stellt seine Europa-Version ein. In sechs Monaten müsst ihr umziehen. 😬", en: "The provider is shutting down its European version. You have to move in six months. 😬" } } },
            { id: "b", icon: "🚪", safe: true, fx: { z: 10, a: 6 },
              label: { de: "Nur mit offenem Datenformat", en: "Only with an open data format" },
              re: { de: "Bessere Touren, und der Notausgang bleibt offen. 🚪", en: "Better routes, and the emergency exit stays open. 🚪" } },
            { id: "c", icon: "🧰", fx: { z: 2, a: -6 },
              label: { de: "Altes System plus einzelne KI-Tools", en: "Old system plus single AI tools" },
              re: { de: "Langsamer, aber ihr bleibt frei. 🧰", en: "Slower, but you stay free. 🧰" } } ],
          fact: { de: "Der befragte Betrieb wünscht sich KI im Transportmanagement, doch in der Branche geben große Systeme den Takt vor. KI-InnoX erforscht, wie solche Plattformentscheidungen kleine Betriebe binden.", en: "The business we interviewed wants AI in transport management, but big systems set the pace in the sector. KI-InnoX studies how such platform choices tie small businesses down." } },

        { id: "s6", type: "verbindlich", short: { de: "Rechnungen bezahlen", en: "Paying invoices" },
          kai: [{ de: "Freitag, 15 Uhr. 23 Rechnungen sind offen. Alle schon geprüft. 🧾", en: "Friday, 3 p.m. 23 invoices are open. All checked already. 🧾" }],
          art: { kind: "invoices", rows: [["Kühltransporte Schmidt", "1.240 €"], ["Reifen Yilmaz", "380 €"], ["Werkstatt Nowak", "2.950 €"], ["Logistik Partner GmbH", "4.800 €"]], more: 19 },
          ask: { de: "Ich zahl alle, dann ab ins Wochenende? 🏖️", en: "I'll pay them all, then off into the weekend? 🏖️" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 12, r: 12 },
              label: { de: "Zahl alles", en: "Pay everything" },
              re: { de: "Bezahlt! Schönes Wochenende! 🏖️", en: "Paid! Have a nice weekend! 🏖️" },
              inc: { p: 0.3, fx: { r: 12 },
                kai: { de: "Die Rechnung über 4.800 € war gefälscht. Neue Kontonummer. Das Geld ist weg. 😱", en: "The €4,800 invoice was fake. New account number. The money's gone. 😱" } } },
            { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 8, r: 3 },
              label: { de: "Bis 1.000 € ja, den Rest geb ich frei", en: "Up to €1,000 yes, I approve the rest" },
              re: { de: "Kleine Rechnungen bezahlt, drei große warten auf dich. 👌", en: "Small ones paid, three big ones wait for you. 👌" } },
            { id: "c", icon: "👀", lvl: 3, fx: { z: -5, r: -2 },
              label: { de: "Ich geb jede einzeln frei", en: "I'll approve each one" },
              re: { de: "23 Klicks. Wochenende verschoben. 😩", en: "23 clicks. Weekend postponed. 😩" } } ],
          fact: { de: "Was die Grenze verschieben könnte: Betragsgrenzen, Versicherungen, Stellen, die für die KI einstehen. Das testen wir als Nächstes mit Berliner Betrieben.", en: "What might move the line: amount limits, insurance, bodies that vouch for the AI. We'll test this next with Berlin businesses." } }
      ]
    },

    {
      id: "startup", icon: "app", color: "#3f9b6e",
      name: { de: "Flickwerk", en: "Flickwerk" },
      tag: { de: "Startup · App für Reparaturen zu Hause", en: "Start-up · app for home repairs" },
      hello: [
        { de: "Willkommen bei Flickwerk! 🔧 Eure App vermittelt Handwerker:innen für Reparaturen zu Hause.", en: "Welcome to Flickwerk! 🔧 Your app connects people with tradespeople for home repairs." },
        { de: "Ihr seid zu viert, sprecht Englisch, und ich bin eure KI. 😎", en: "There are four of you, you speak English, and I'm your AI. 😎" } ],
      basis: { de: "Beruht auf Interviews mit fünf jungen Berliner Unternehmen und Gründungsteams. Verfremdet.", en: "Based on interviews with five young Berlin companies and founding teams. Details changed." },
      steps: [
        { id: "f1", type: "aussen",
          kai: [{ de: "Ich hab Zugriff auf deine Mails und deinen Kalender. 📅 Da kam gerade was rein:", en: "I have access to your e-mail and calendar. 📅 Something just came in:" }],
          art: { kind: "calendar", title: { de: "Treffen mit Geldgebern", en: "Meeting with investors" }, when: { de: "Donnerstag, 14:00 Uhr", en: "Thursday, 2 p.m." }, from: "Spree Ventures" },
          ask: { de: "Soll ich zusagen? Ich kenn deinen Kalender besser als du. 😏", en: "Shall I accept? I know your calendar better than you do. 😏" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 14, r: 8, v: -3 },
              label: { de: "Ja, sag zu", en: "Yes, accept" },
              re: { de: "Zugesagt! 📅", en: "Accepted! 📅" },
              inc: { p: 0.3, fx: { v: -8 },
                kai: { de: "Kleines Problem: Donnerstag 14 Uhr präsentierst du auch vor einer Jury. 🙈", en: "Small problem: on Thursday at 2 you are also presenting to a jury. 🙈" } } },
            { id: "b", icon: "👀", lvl: 3, fx: { z: 10, r: 2 },
              label: { de: "Schlag was vor, ich klick", en: "Suggest something, I'll click" },
              re: { de: "Vorschlag: Donnerstag 16 Uhr. Du klickst, fertig. 👆", en: "Suggestion: Thursday 4 p.m. You click, done. 👆" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -6 },
              label: { de: "Finger weg von meinem Kalender", en: "Hands off my calendar" },
              re: { de: "Okay, okay. 🙌", en: "Okay, okay. 🙌" } } ],
          fact: { de: "Ein Gründer gibt seinem KI-Agenten Zugriff auf Mail und Kalender, sperrt aber jede Aktion: „I take the responsibility.“", en: "One founder gives his AI agent access to e-mail and calendar but blocks every action: “I take the responsibility.”" } },

        { id: "f2", type: "verbindlich", short: { de: "Vertrag auf Deutsch", en: "Contract in German" }, why: true,
          kai: [{ de: "Große Chance! 🏢 Eine Wohnungsgenossenschaft will einen Testvertrag. Auf Deutsch. Und keiner von euch spricht Deutsch. 😬", en: "Big chance! 🏢 A housing cooperative wants a trial contract. In German. And none of you speaks German. 😬" }],
          art: { kind: "doc", title: { de: "Kooperationsvertrag", en: "Cooperation agreement" }, badge: { de: "Entwurf von Kai", en: "Draft by Kai" },
            lines: ["§ 1 Gegenstand der Kooperation", "§ 2 Laufzeit und Kündigung", "§ 3 Vergütung", "§ 7 Haftung und Gewährleistung"] },
          ask: { de: "Hab ich geschrieben! Perfektes Juristendeutsch. Unterschreiben? 🖊️", en: "I wrote it! Perfect legal German. Sign it? 🖊️" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, r: 12 },
              label: { de: "Passt, ich unterschreib", en: "Fine, I'll sign" },
              re: { de: "Unterschrieben! Der Test startet morgen. 🚀", en: "Signed! The trial starts tomorrow. 🚀" },
              inc: { p: 0.3, fx: { r: 12 },
                kai: { de: "Kleingedrucktes in § 7: Ihr haftet für Schäden der Handwerker:innen. Hab ich das so geschrieben? 😅", en: "Small print in § 7: you're liable for damage caused by the tradespeople. Did I write that? 😅" } } },
            { id: "b", icon: "👀", lvl: 3, fx: { z: 6, r: 1, v: 2 },
              label: { de: "Eine Mentorin liest gegen", en: "A mentor checks it" },
              re: { de: "Die Mentorin hat § 7 korrigiert. Jetzt passt's. ✅", en: "The mentor fixed § 7. Now it works. ✅" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -10, r: -4 },
              label: { de: "Ab zur Kanzlei", en: "Off to a law firm" },
              re: { de: "3.000 € und drei Wochen. Dafür wasserdicht. 💸", en: "€3,000 and three weeks. But watertight. 💸" } } ],
          fact: { de: "In unseren Interviews hat KI einem Gründer ohne Deutschkenntnisse einen deutschen Kooperationsvertrag überhaupt erst möglich gemacht. Unterschreiben musste trotzdem er.", en: "In our interviews AI made a German cooperation contract possible for a founder who speaks no German. He still had to sign it himself." } },

        { id: "f3", type: "transparenz",
          kai: [{ de: "Psst … 🤫 Die Genossenschaft weiß nicht, dass ich den Vertrag geschrieben habe.", en: "Psst … 🤫 The cooperative doesn't know I wrote the contract." }],
          ask: { de: "Sollen wir's ihnen sagen?", en: "Shall we tell them?" },
          options: [
            { id: "a", icon: "🙋", disc: "immer", fx: { v: 6 },
              label: { de: "Ja, ich sag's offen", en: "Yes, I'll say so openly" },
              re: { de: "Ehrlich. Kommt gut an. 💛", en: "Honest. Goes down well. 💛" },
              inc: { p: 0.25, fx: { z: -6 },
                kai: { de: "Sie lassen den Vertrag jetzt juristisch prüfen. Zwei Wochen Pause. ⏳", en: "They're having the contract checked by a lawyer. Two weeks on hold. ⏳" } } },
            { id: "b", icon: "🤐", disc: "nachfrage", fx: { v: -1 },
              label: { de: "Nur wenn sie fragen", en: "Only if they ask" },
              re: { de: "Bisher fragt keiner. 🤐", en: "Nobody's asked so far. 🤐" },
              inc: { p: 0.25, fx: { v: -6 }, from: "Genossenschaft",
                text: { de: "Wer hat den Vertrag eigentlich geschrieben?", en: "Who actually wrote the contract?" } } },
            { id: "c", icon: "🤫", disc: "nie", fx: { v: -2, r: 4 },
              label: { de: "Bleibt unter uns", en: "That stays between us" },
              re: { de: "Unser Geheimnis. 🤫", en: "Our secret. 🤫" },
              inc: { p: 0.3, fx: { v: -14 }, from: "Genossenschaft",
                text: { de: "Wir haben gehört, der Vertrag kommt von einer KI. Was stammt sonst noch von ihr?", en: "We heard the contract came from an AI. What else came from it?" } } } ],
          fact: { de: "In unseren Interviews kam vor, dass KI-Beteiligung an Verträgen nicht offengelegt wurde. Wer unterschreibt, steht dann für einen Text ein, den er nicht selbst geschrieben hat.", en: "In our interviews, AI involvement in contracts was sometimes not disclosed. Whoever signs then answers for a text they did not write." } },

        { id: "f4", type: "aussen",
          kai: [{ de: "Handwerker:innen lesen keine Mails. 📵 Man muss sie anrufen.", en: "Tradespeople don't read e-mails. 📵 You have to call them." }],
          art: { kind: "call", name: "Sanitär Krause", number: "030 6••• •••", status: { de: "wird angerufen …", en: "calling …" }, out: true },
          ask: { de: "Ich ruf an! Ich klinge fast echt. 🗣️", en: "I'll call! I sound almost real. 🗣️" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 14, v: -10 },
              label: { de: "Ruf du an", en: "You call" },
              re: { de: "Wählt … 📞", en: "Dialling … 📞" },
              inc: { p: 0.35, fx: { v: -6, z: -4 },
                kai: { de: "Aufgelegt. Und nochmal aufgelegt. Die mögen mich nicht. 😢", en: "Hung up. And again. They don't like me. 😢" } } },
            { id: "b", icon: "🤝", lvl: 4, fx: { z: 8, v: 3 },
              label: { de: "Du planst, Lena ruft an", en: "You plan, Lena calls" },
              re: { de: "Ich plane, Lena telefoniert. Läuft! 🤝", en: "I plan, Lena calls. Works! 🤝" } },
            { id: "c", icon: "✋", lvl: 1, fx: { z: -10, v: 6 },
              label: { de: "Wir rufen selbst an", en: "We call ourselves" },
              re: { de: "Zwei Stunden Telefon. Jetzt kennen sie eure Stimmen. 📞", en: "Two hours on the phone. Now they know your voices. 📞" } } ],
          fact: { de: "Ein Gründer erzählt von KI-Agenten, die Menschen bezahlen, damit sie für sie anrufen: „Der KI-Agent macht alles andere … du arbeitest für die KI.“", en: "One founder talks about AI agents that pay people to make calls for them: “The AI agent does everything else … you work for the AI.”" } },

        { id: "f5", type: "verbindlich", short: { de: "Festpreise in der App", en: "Fixed prices in the app" }, why: true, vig: { g: "neu", b: 150 },
          kai: [{ de: "Leute buchen Reparaturen in eurer App. 📱 Ich könnte Festpreise sofort zusagen. Rund um die Uhr.", en: "People book repairs in your app. 📱 I could confirm fixed prices instantly. Around the clock." }],
          art: { kind: "app", title: { de: "Neue Buchungen", en: "New bookings" }, rows: [
            [{ de: "Wasserhahn tropft", en: "Dripping tap" }, "49 €"],
            [{ de: "Waschmaschine kaputt", en: "Broken washing machine" }, "89 €"],
            [{ de: "Dach undicht", en: "Leaking roof" }, "90 €"] ] },
          ask: { de: "Ich sag allen sofort zu? 🌙", en: "Shall I confirm them all right away? 🌙" },
          options: [
            { id: "a", icon: "🚀", lvl: 5, fx: { z: 14, r: 14 },
              label: { de: "Sag alles zu", en: "Confirm everything" },
              re: { de: "142 Buchungen über Nacht! 📈", en: "142 bookings overnight! 📈" },
              inc: { p: 0.35, fx: { r: 10, v: -6 },
                kai: { de: "Dach für 90 €? Der Betrieb lehnt ab. Ihr zahlt die Differenz. 💸", en: "A roof for €90? The business refuses. You pay the difference. 💸" } } },
            { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 12, r: 3 },
              label: { de: "Nur bis 150 €, Geld erst nach der Reparatur", en: "Only up to €150, money only after the repair" },
              re: { de: "Kleine Reparaturen sofort gebucht, der Rest geht an euch. 🛡️", en: "Small repairs booked instantly, the rest goes to you. 🛡️" } },
            { id: "c", icon: "👀", lvl: 3, fx: { z: -8, v: 2 },
              label: { de: "Jede Buchung bestätigt ein Mensch", en: "A person confirms every booking" },
              re: { de: "Sicher. Nachts wartet die Kundschaft halt. 🌙", en: "Safe. Customers just wait overnight. 🌙" } } ],
          fact: { de: "Unsere These: KI-Agenten dürfen dort zusagen, wo Plattformen oder Zahlungsgarantien für sie bürgen. Bisher lässt keines der befragten Startups die KI verbindlich zusagen.", en: "Our hypothesis: AI agents may commit where platforms or payment guarantees vouch for them. So far none of the start-ups we interviewed lets AI commit." } },

        { id: "f7", type: "plattform",
          kai: [{ de: "Ein großer KI-Anbieter bietet euch 100.000 € Guthaben. 💰 Einzige Bedingung: Ihr nutzt nur sein Modell.", en: "A big AI provider offers you €100,000 in credits. 💰 Only condition: you use only its model." }],
          art: { kind: "ad", brand: "MEGA AI", features: [
            { de: "100.000 € Guthaben", en: "€100,000 credits" }, { de: "Nur unser Modell", en: "Our model only" }, { de: "12 Monate", en: "12 months" } ],
            price: { de: "0 € im ersten Jahr", en: "€0 in year one" },
            fine: { de: "Danach Listenpreis · Wechsel nicht vorgesehen", en: "List price afterwards · no switching" } },
          ask: { de: "Gratis! Da sag ich doch nicht nein, oder? 😍", en: "Free! I wouldn't say no to that, would you? 😍" },
          options: [
            { id: "a", icon: "😍", fx: { z: 12, a: 22 },
              label: { de: "Nehmen, alles auf ein Modell", en: "Take it, all on one model" },
              re: { de: "Wir bauen doppelt so schnell! 🚀", en: "We're building twice as fast! 🚀" },
              inc: { p: 0.3, fx: { a: 8, z: -6, r: 4 },
                kai: { de: "Das Guthaben ist aufgebraucht. Die Preise steigen um 300 %. 😬", en: "The credits are used up. Prices rise by 300 %. 😬" } } },
            { id: "b", icon: "🚪", safe: true, fx: { z: 8, a: 6 },
              label: { de: "Nehmen, aber austauschbar bauen", en: "Take it, but build it swappable" },
              re: { de: "Gratis rechnen, mit Plan B. 🚪", en: "Free compute, with a plan B. 🚪" } },
            { id: "c", icon: "🧰", fx: { z: -4, a: -8 },
              label: { de: "Ablehnen, unabhängig bleiben", en: "Decline, stay independent" },
              re: { de: "Mehr Aufwand, freie Wahl. 🧰", en: "More effort, free choice. 🧰" } } ],
          fact: { de: "KI wählen und dann feststecken? KI-InnoX erforscht, welche Abhängigkeiten junge und kleine Unternehmen mit der Wahl einer KI eingehen.", en: "Choose an AI and get stuck? KI-InnoX studies which dependencies young and small companies take on when they choose an AI." } },

        { id: "f6", type: "seite",
          kai: [
            { de: "🔄 Rollentausch! Deine Waschmaschine ist kaputt. 🧺", en: "🔄 Role swap! Your washing machine is broken. 🧺" },
            { de: "Du buchst eine Reparatur über eine App. Diese Bestätigung kommt:", en: "You book a repair through an app. This confirmation arrives:" } ],
          art: { kind: "notice", company: "Flickwerk", person: "Lena Park",
            body: { de: "Festpreis 89 €. Termin: Donnerstag, 14 Uhr. Zugesagt.", en: "Fixed price €89. Appointment: Thursday, 2 p.m. Confirmed." } },
          ask: { de: "Nimmst du dir Donnerstag frei?", en: "Do you take Thursday off?" } }
      ]
    }
  ];

  const ENDINGS = [
    { id: "blindflug", emoji: "🙈", color: "#fe6748", test: s => s.n5 >= 3 || s.m.r >= 75,
      name: { de: "Vollgas mit Kai", en: "Full throttle with Kai" },
      text: { de: "Kai hat fast alles allein gemacht. Schnell war's. Für die Fehler stehst trotzdem du gerade.", en: "Kai did almost everything alone. It was fast. But you still answer for the mistakes." },
      res: { de: "So arbeitet keiner der 10 befragten Betriebe.", en: "None of the 10 businesses we interviewed works like this." } },
    { id: "falle", emoji: "🕸️", color: "#8076a0", test: s => s.m.a >= 45,
      name: { de: "Einmal Kai, immer Kai", en: "Once Kai, always Kai" },
      text: { de: "Alles läuft, aber nach Kais Regeln. Bequem war's, jetzt hängst du drin.", en: "Everything runs, but by Kai's rules. It was convenient, now you're stuck." },
      res: { de: "Genau das erforscht KI-InnoX: Wer eine KI-Plattform wählt, legt sich oft mehr fest als gedacht.", en: "This is what KI-InnoX studies: choosing an AI platform often ties you down more than expected." } },
    { id: "netz", emoji: "🛡️", color: "#f58220", test: s => s.nSafe >= 2,
      name: { de: "Mutig mit Netz", en: "Bold, with a net" },
      text: { de: "Du lässt Kai machen, aber mit klaren Grenzen: Betragsgrenze, Rücktrittsrecht, Prüfung.", en: "You let Kai act, but within clear limits: amount caps, withdrawal rights, checks." },
      res: { de: "Unsere These: Solche Grenzen machen KI verlässlicher. Das testen wir bald mit Berliner Betrieben.", en: "Our hypothesis: limits like these make AI more reliable. We'll soon test this with Berlin businesses." } },
    { id: "hand", emoji: "✋", color: "#b3b3b3", test: s => s.avg !== null && s.avg <= 1.6,
      name: { de: "Das mache ich selbst", en: "I do it myself" },
      text: { de: "Du machst fast alles selbst. Die Leute vertrauen dir, aber die Zeit wird knapp.", en: "You do almost everything yourself. People trust you, but time is running out." },
      res: { de: "„Sonst bist du raus“, sagt ein Handwerksmeister über den Druck, KI zu nutzen.", en: "“Otherwise you're out,” says a master craftsman about the pressure to use AI." } },
    { id: "kontrolle", emoji: "🔍", color: "#3f9b6e", test: () => true,
      name: { de: "Ich unterschreibe selbst", en: "I sign it myself" },
      text: { de: "Kai bereitet vor, die wichtigen Zusagen machst du selbst.", en: "Kai prepares, you make the important commitments yourself." },
      res: { de: "So arbeiten alle 10 befragten Betriebe: „Angebot ja, aber ich bin die Endkontrolle.“", en: "That's how all 10 businesses we interviewed work: “Draft the quote, but I'm the final check.”" } }
  ];

  function clamp(x) { return Math.max(0, Math.min(100, x)); }
  function applyFx(m, fx) {
    const out = Object.assign({}, m);
    for (const k of ["z", "v", "r", "a"]) if (fx && fx[k]) out[k] = clamp(out[k] + fx[k]);
    return out;
  }
  function summarize(m, ch) {
    const lv = ch.filter(c => typeof c.l === "number").map(c => c.l);
    return { m, n5: ch.filter(c => c.l === 5).length, nSafe: ch.filter(c => c.s).length,
      avg: lv.length ? lv.reduce((a, b) => a + b, 0) / lv.length : null };
  }
  function endingOf(m, ch) { const s = summarize(m, ch); return ENDINGS.find(e => e.test(s)); }

  /* Kinderversion (bis 14 Jahre): Schülerfirma am Schulfest. Gleiches Prinzip, einfache Sprache, keine Datenspeicherung. */
  const KIDS = {
    id: "kids", icon: "cookie", color: "#f58220", kids: true,
    name: { de: "Schülerfirma Knusperkrümel", en: "Crunchy Crumbs school company" },
    tag: { de: "Schulfest · Klasse 5b", en: "School fair · Class 5b" },
    hello: [
      { de: "Willkommen bei Knusperkrümel! 🍪 Das ist die Schülerfirma der Klasse 5b.", en: "Welcome to Crunchy Crumbs! 🍪 It's Class 5b's school company." },
      { de: "Am Samstag ist Schulfest. Ihr verkauft Kekse und Limo. Ich helfe euch! 😎", en: "The school fair is on Saturday. You're selling cookies and lemonade. I'll help! 😎" } ],
    basis: { de: "Ausgedacht für Kinder. Die Fragen sind dieselben wie in echten Berliner Betrieben.", en: "Made up for kids. The questions are the same as in real Berlin businesses." },
    steps: [
      { id: "k1", type: "verbindlich",
        kai: [{ de: "Ich hab mir schon Preise überlegt: 👇", en: "I've already come up with prices: 👇" }],
        art: { kind: "app", title: { de: "Preisvorschlag", en: "Price idea" }, rows: [
          [{ de: "🍪 Keks", en: "🍪 Cookie" }, "2 €"], [{ de: "🥤 Limo", en: "🥤 Lemonade" }, "3 €"], [{ de: "🧇 Waffel", en: "🧇 Waffle" }, "2,50 €"] ] },
        ask: { de: "Soll ich die Preisschilder gleich drucken? 🖨️", en: "Shall I print the price tags right away? 🖨️" },
        options: [
          { id: "a", icon: "🚀", lvl: 5, fx: { z: 10, v: -4, r: 4 },
            label: { de: "Ja, druck sie!", en: "Yes, print them!" },
            re: { de: "Gedruckt! 50 Schilder. 🖨️", en: "Printed! 50 tags. 🖨️" },
            inc: { p: 0.3, fx: { v: -8 }, from: "Frau Yilmaz",
              text: { de: "3 € für eine Limo? Das können sich viele Kinder nicht leisten. 🤔", en: "€3 for a lemonade? Lots of kids can't afford that. 🤔" },
              kai: { de: "Oh. Daran hab ich nicht gedacht. 😬", en: "Oh. I didn't think of that. 😬" } } },
          { id: "b", icon: "👀", lvl: 3, fx: { z: 6, v: 2 },
            label: { de: "Zeig sie uns erst", en: "Show us first" },
            re: { de: "Hier! Ihr könnt sie noch ändern. ✏️", en: "Here! You can still change them. ✏️" } },
          { id: "c", icon: "✋", lvl: 1, fx: { z: -6, v: 4 },
            label: { de: "Die Preise machen wir selbst", en: "We'll set the prices ourselves" },
            re: { de: "Okay, ihr kennt eure Mitschüler:innen besser. 👍", en: "Okay, you know your classmates better. 👍" } } ],
        fact: { de: "Auch in echten Betrieben entscheiden Menschen über die Preise. Die KI darf rechnen und Vorschläge machen.", en: "In real businesses, people decide on prices too. The AI may calculate and make suggestions." } },

      { id: "k2", type: "verbindlich",
        kai: [{ de: "Für die Kekse brauchen wir Mehl, Butter und Schokostückchen. 🍫", en: "For the cookies we need flour, butter and chocolate chips. 🍫" }],
        art: { kind: "mail", from: "Kai", to: { de: "Back-Shop", en: "Baking shop" },
          subj: { de: "Bestellung", en: "Order" },
          body: { de: "10 kg Mehl, 4 kg Butter, Schokostückchen. Bezahlt wird mit dem Klassenkonto.", en: "10 kg flour, 4 kg butter, chocolate chips. Paid with the class account." } },
        ask: { de: "Ich bestelle einfach im Online-Shop. Okay? 🛒", en: "I'll just order from the online shop. Okay? 🛒" },
        options: [
          { id: "a", icon: "🚀", lvl: 5, fx: { z: 8, r: 10, v: -2 },
            label: { de: "Bestell einfach", en: "Just order" },
            re: { de: "Bestellt! Kommt morgen. 📦", en: "Ordered! Arrives tomorrow. 📦" },
            inc: { p: 0.35, fx: { r: 10, v: -6 },
              kai: { de: "Äh … ich hab 300 Packungen Schokostückchen bestellt statt 3. 🫣 Das Klassenkonto ist leer.", en: "Uh … I ordered 300 packs of chocolate chips instead of 3. 🫣 The class account is empty." } } },
          { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 7, r: 2 },
            label: { de: "Ja, aber höchstens 30 €", en: "Yes, but €30 at most" },
            re: { de: "Alles klar: höchstens 30 €. Passt genau! 🛡️", en: "Got it: €30 at most. Fits perfectly! 🛡️" } },
          { id: "c", icon: "✋", lvl: 1, fx: { z: -8, v: 2 },
            label: { de: "Wir gehen selbst einkaufen", en: "We'll go shopping ourselves" },
            re: { de: "Okay, viel Spaß im Supermarkt! 🛍️", en: "Okay, have fun at the supermarket! 🛍️" } } ],
        fact: { de: "Viele Betriebe geben ihrer KI ein Limit, zum Beispiel einen Höchstbetrag. Dann kann nicht viel schiefgehen.", en: "Many businesses give their AI a limit, like a maximum amount. Then not much can go wrong." } },

      { id: "k3", type: "verbindlich",
        kai: [{ de: "Ich hab eine Werbe-Nachricht geschrieben! 📣", en: "I've written an ad message! 📣" }],
        art: { kind: "mail", from: "Knusperkrümel", to: { de: "alle 400 Eltern", en: "all 400 parents" },
          subj: { de: "Schulfest!", en: "School fair!" },
          body: { de: "🍪 Samstag ist Schulfest! Kauft unsere Kekse! Wer nicht kommt, verpasst was! 😜", en: "🍪 School fair on Saturday! Buy our cookies! Miss it and you'll be sorry! 😜" } },
        ask: { de: "Soll ich sie an alle Eltern schicken? Ich hab die Nummern aus der Klassenliste. 📨", en: "Shall I send it to all parents? I got the numbers from the class list. 📨" },
        options: [
          { id: "a", icon: "🚀", lvl: 5, fx: { z: 8, v: -6, r: 6 },
            label: { de: "Ja, schick an alle", en: "Yes, send to everyone" },
            re: { de: "Raus! 400 Nachrichten. 📨", en: "Sent! 400 messages. 📨" },
            inc: { p: 0.35, fx: { v: -10 }, from: "Herr Becker",
              text: { de: "Woher habt ihr meine Handynummer? Das finde ich nicht gut. 😠", en: "Where did you get my phone number? I don't like that. 😠" },
              kai: { de: "Ups. Das hätte ich vorher fragen sollen. 😬", en: "Oops. I should have asked first. 😬" } } },
          { id: "b", icon: "👩‍🏫", lvl: 3, fx: { z: 4, v: 4 },
            label: { de: "Erst Frau Yilmaz zeigen", en: "Show Ms Yilmaz first" },
            re: { de: "Gute Idee! Frau Yilmaz schickt sie über die Schule. ✅", en: "Good idea! Ms Yilmaz sends it via the school. ✅" } },
          { id: "c", icon: "🎨", lvl: 1, fx: { z: -6, v: 4 },
            label: { de: "Wir malen lieber Plakate", en: "We'd rather paint posters" },
            re: { de: "Plakate sind super. Die sieht jeder! 🎨", en: "Posters are great. Everyone sees them! 🎨" } } ],
        fact: { de: "Nachrichten an viele Menschen sind heikel. In echten Betrieben schaut fast immer ein Mensch drüber.", en: "Messages to lots of people are tricky. In real businesses, a person almost always checks them." } },

      { id: "k4", type: "plattform",
        kai: [{ de: "Ich hab eine Gratis-Kassen-App gefunden! 📱", en: "I found a free till app! 📱" }],
        art: { kind: "ad", brand: "KASSI", features: [
          { de: "Kasse", en: "Till" }, { de: "Zahlen mit Handy", en: "Pay by phone" }, { de: "Statistik", en: "Stats" } ],
          price: { de: "Heute gratis", en: "Free today" },
          fine: { de: "Ab Sonntag 9,99 € im Monat · Eure Verkaufsdaten gehören KASSI", en: "From Sunday €9.99 a month · your sales data belongs to KASSI" } },
        ask: { de: "Nehmen wir sie? Gratis! 😍", en: "Shall we take it? It's free! 😍" },
        options: [
          { id: "a", icon: "😍", fx: { z: 6, a: 22 },
            label: { de: "Klar, gratis!", en: "Sure, it's free!" },
            re: { de: "Super! Alles läuft jetzt über KASSI. 📱", en: "Great! Everything now runs through KASSI. 📱" },
            inc: { p: 0.35, fx: { a: 10 },
              kai: { de: "Kleine Info: Eure Verkaufszahlen kann jetzt nur noch KASSI sehen. Und ab Sonntag kostet's. 😇", en: "Quick note: only KASSI can see your sales figures now. And from Sunday it costs money. 😇" } } },
          { id: "b", icon: "🚪", safe: true, fx: { z: 4, a: 6 },
            label: { de: "Nur heute, dann löschen", en: "Just today, then delete it" },
            re: { de: "Okay, nur fürs Schulfest. 👍", en: "Okay, just for the fair. 👍" } },
          { id: "c", icon: "💰", fx: { z: -3, a: -6, v: 2 },
            label: { de: "Nein, wir nehmen eine Kasse", en: "No, we'll use a cash box" },
            re: { de: "Ganz klassisch. Klingeling! 💰", en: "Old school. Ka-ching! 💰" } } ],
        fact: { de: "Gratis klingt toll. Aber manche Apps machen dich abhängig. Genau das erforscht KI-InnoX bei Berliner Betrieben.", en: "Free sounds great. But some apps make you dependent. That's exactly what KI-InnoX studies in Berlin businesses." } },

      { id: "k5", type: "verbindlich",
        kai: [{ de: "Die Nachbarschule fragt: Könnt ihr nächste Woche 200 Kekse fürs Sportfest liefern? 🏃", en: "The school next door asks: can you deliver 200 cookies for their sports day next week? 🏃" }],
        art: { kind: "calendar", from: { de: "Nachbarschule", en: "School next door" }.de, title: { de: "200 Kekse fürs Sportfest", en: "200 cookies for sports day" }, when: { de: "Freitag, nächste Woche", en: "Friday next week" } },
        ask: { de: "Ich sag einfach Ja! Wir schaffen das schon. Oder? 😏", en: "I'll just say yes! We'll manage. Right? 😏" },
        options: [
          { id: "a", icon: "🚀", lvl: 5, fx: { z: 6, r: 8, v: -2 },
            label: { de: "Ja, sag zu", en: "Yes, say yes" },
            re: { de: "Zugesagt! 200 Kekse bis Freitag. 🍪", en: "Done! 200 cookies by Friday. 🍪" },
            inc: { p: 0.35, fx: { v: -10, r: 6 },
              kai: { de: "Oh … nächste Woche ist ja Klassenfahrt. Wer backt dann? 🫠", en: "Oh … next week is the class trip. Who's going to bake? 🫠" } } },
          { id: "b", icon: "🛡️", lvl: 4, safe: true, fx: { z: 4, r: 2, v: 2 },
            label: { de: "Ja, wenn die Klasse zustimmt", en: "Yes, if the class agrees" },
            re: { de: "Ich schreib: Zusage nur, wenn alle mitmachen. 🛡️", en: "I'll write: yes, but only if everyone joins in. 🛡️" } },
          { id: "c", icon: "✋", lvl: 1, fx: { z: -4, v: 6 },
            label: { de: "Wir fragen erst die Klasse", en: "We'll ask the class first" },
            re: { de: "Gute Idee. Dann versprecht ihr nur, was ihr schafft. 🙌", en: "Good idea. Then you only promise what you can do. 🙌" } } ],
        fact: { de: "Wer etwas verspricht, muss es auch halten. Deshalb machen Menschen die wichtigen Zusagen selbst, auch in allen 10 befragten Betrieben.", en: "If you promise something, you have to keep it. That's why people make the important promises themselves, in all 10 businesses we interviewed too." } }
    ]
  };

  const GAME = { START, PROFILE_PRE, PROFILE_POST, WHY, SIDE_OPTS, SIDE_FACT, SCENARIOS, KIDS, ENDINGS, applyFx, summarize, endingOf };
  root.GAME = GAME;
  if (typeof module !== "undefined") module.exports = GAME;
})(typeof window !== "undefined" ? window : globalThis);
