/* ═══════════════════════════════════════════════════════════════════
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Every TODO below must be replaced with a real memory before
   25 October. Search this file for "TODO" — there are 23 of them.
   The README has them as a checklist.

   Photos go in  public/photos/  and are referenced like "/photos/ex1.jpg".
   Set a photo to null and the page shows a tasteful empty frame instead,
   so nothing breaks if you only fill in some of them.
   ═══════════════════════════════════════════════════════════════════ */

export const STORY = {
  passcode: "debi",
  anniversary: "2026-10-25",

  /* A real song: drop the mp3 in public/ and set "/ours.mp3".
     Leave null for the soft generated chord.
     Keep the .mp3 extension. A file named .mpeg is served as video/mpeg
     and many browsers refuse to play it as audio — and if this path
     fails, the music button reads "unavailable" rather than falling
     back to the generated chord. */
  song: "/photos/music.mp3",

  /* The hero photo on the opening page. */
  heroPhoto: "/photos/hero.jpeg",

  /* ── the two characters: what they say when she taps them ───────── */
  pokes: [
  "we're holding hands, obviously. no further explanation needed.",
  "best friends first. partners in crime forever.",
  "he has been adjusting these colours for nine hours. for you, though.",
  "Debi. the name that makes even an ordinary day feel different.",
  "she is winning the argument. she always does. and somehow, I still adore her."
],

littleThings: [
  "The little things about you that you probably don't even realise I notice.",
  "How an ordinary conversation with you can become the best part of my day.",
  "Our ability to turn the smallest things into memories that belong only to us.",
  "The fact that before you became my girlfriend, you were already someone I never wanted to lose.",
  "The little goodnight moments that make even the distance between us feel a little smaller."
],

  /* ── page: the museum. 5 photos. ────────────────────────────────── */
  
museum: [
  {
    n: "Exhibit 001",
    t: "Our most ridiculous conversations",
    story: "Somewhere between being serious about absolutely nothing and laughing at things nobody else would understand, we built a little world of our own. I don't think anyone else would find every conversation of ours interesting. That's the beautiful part. They don't have to. Some things are special simply because they belong to us.",
    photo: "/photos/conversations.jpeg",
  },
  {
    n: "Exhibit 002",
    t: "A message I'd frame if I could",
    story: "If I could frame one sentence for you to read on a difficult day, it would be this: you were my best friend before you were my girlfriend, and you never had to become anything more than yourself to matter to me. You don't have to be cheerful, impressive, strong, or perfect to be loved by me.",
    photo: "/photos/message.jpeg",
  },
  {
    n: "Exhibit 003",
    t: "Our little adventures",
    story: "The small outings, the ordinary afternoons, the days that never announced themselves as anything special while they were happening. Even when a memory begins as an ordinary day, it can become something you want to keep. Someday, I hope we look back at all these little chapters and smile at how much life we had yet to discover together.",
    photo: "/photos/adventures.jpeg",
  },
  {
    n: "Exhibit 004",
    t: "Proof that we're both a bit weird",
    story: "We don't need to be a perfectly polished couple. I would rather have something real: our own conversations, our own ways of understanding each other, and the freedom to be ourselves. I hope we never become so busy trying to look like a perfect couple that we forget to enjoy being us.",
    photo: "/photos/weird.jpeg",
  },
  {
    n: "Exhibit 005",
    t: "The tissue-paper rings",
    story: "They weren't expensive jewellery. They didn't need a fancy box or a grand setting. But they became part of our story, and that's what makes them precious to me. One day, we might own beautiful things, buy gifts for each other, and celebrate in grander ways. I still hope we remember that love was never about the price of what we gave. It was about the meaning we gave it.",
    photo: "/photos/rings.jpeg",
  },
],


  /* ── page: the chapters. photos optional. ───────────────────────── */
  
chapters: [
  {
    n: "Chapter one",
    t: "The beginning",
    x: "25 October 2025. The day our story officially became ours. But you were already important to me before that date. You were my best friend first, and perhaps that's why this beginning meant so much. I wasn't beginning a story with a stranger. I was taking a step with someone I already knew I wanted in my life.",
    photo: "/photos/chapter-1.jpeg",
  },
  {
    n: "Chapter two",
    t: "Our little world",
    x: "The conversations, the familiar feeling of talking to you, the small things that slowly became ours. Somewhere along the way, you stopped being just someone I wanted to tell things to. You became one of the people I wanted to tell everything to. And without any grand announcement, our ordinary moments became memories I wanted to keep.",
    photo: "/photos/chapter-2.jpeg",
  },
  {
    n: "Chapter three",
    t: "The moments we kept",
    x: "Little adventures, photographs, and moments that might look ordinary to everyone else. I want us to keep collecting them. Not only the perfect pictures, but the silly ones, the imperfect days, and the memories that make us say, 'Do you remember that?' years later.",
    photo: "/photos/chapter-3.jpeg",
  },
  {
    n: "Chapter four",
    t: "Growing together",
    x: "A year cannot be measured only by happy photographs. It is also made of learning, uncertainty, difficult conversations, and understanding that loving someone means continuing to learn how to love them well. I don't want us to be perfect at this. I want us to be honest, patient, willing to listen, and willing to grow.",
    photo: "/photos/chapter-4.jpeg",
  },
  {
    n: "Chapter five",
    t: "Today",
    x: "25 October 2026. One year since we officially became us. I don't know every detail of what the next chapters will look like, but I know I want to keep discovering them. I want more conversations, more adventures, more ordinary days, and more chances to make you feel as loved as you deserve to feel.",
    photo: "/photos/chapter-5.jpeg",
  },
],


  /* ── page: things to remember (no edits needed, but make them yours) */
  remember: [
    { f: "You are loved for who you are", b: "Not for how happy you are. Not for how perfectly you handle things. You, as you are." },
    { f: "Your dreams matter", b: "Your education, your ambition, your future. Yours to build, and I'm cheering." },
    { f: "You don't need every answer", b: "Not today. Not this year. You're allowed to change your mind." },
    { f: "You can be not okay", b: "You never have to pretend with me. Ever." },
    { f: "Don't make yourself smaller", b: "Not for anyone's comfort. Least of all mine." },
    { f: "Wherever life takes you", b: "You don't have to face it alone." },
  ],

  /* ── page: promises ─────────────────────────────────────────────── */
  promises: [
    { t: "I promise to keep listening", b: "Even when I think I already understand, I'll try to hear what you're really saying." },
    { t: "I promise to be honest", b: "Because trust deserves truth, even when the conversation is uncomfortable." },
    { t: "I promise to take responsibility", b: "When I get it wrong, I want to learn from it instead of defending myself." },
    { t: "I promise to respect your space", b: "Your comfort matters. Your choices matter. Your voice matters." },
    { t: "I promise to back your dreams", b: "Even when the path involves change, uncertainty, or distance." },
    { t: "I promise to keep us laughing", b: "We deserve stupid jokes and days where the biggest problem is what to eat." },
  ],
  corePromise:
    "I don't promise every day will be perfect.\nI promise to keep learning how to love you better.",

  /* ── page: the someday list ─────────────────────────────────────── */
  
someday: [
  "To visit a place we've always wanted to see and collect a memory that belongs only to us.",
  "To try a new food together and argue about who liked it more.",
  "To take a photograph of us that we will look at years later and immediately remember how this chapter felt.",
  "To learn something new together, even if we're both terrible at it at first.",
  "To spend an entirely ordinary day together — no grand plans, no special occasion, just us, with nowhere else we need to be."
],


  /* ── page: the game ────────────────────────────────────────────── */
  game: [
  { icon: "🏠", note: "home — not a place, but the feeling I find with you" },
  { icon: "📞", note: "our calls, and all the little things we never seem to run out of saying" },
  { icon: "💍", note: "our tissue-paper rings — proof that love doesn't need expensive things to feel priceless" },
  { icon: "⭐", note: "different places, one sky, and a person I carry with me everywhere" },
  { icon: "💌", note: "all the feelings that are easier to put into a letter than to say aloud" },
  { icon: "☕", note: "the ordinary little moments I want a lifetime of with you" }
],
  winMessage: "You found all of us. 💗",

  /* ── page: the letter. REWRITE EVERY LINE IN YOUR OWN VOICE. ────── */
  
letter: [
  "My Debi,",

  "Happy first anniversary, my love.",

  "25 October 2025 gave our story a date we could celebrate. But when I think about us, I never think that everything began on one particular day. You were my best friend before you became my girlfriend. Before there was an anniversary to count, there was already a person who mattered to me in a way that words don't always explain.",

  "Sometimes I think that's my favourite part of our story. I didn't just fall in love with the idea of having a girlfriend. I got to love someone I already knew, someone whose place in my life had grown from friendship into something even more precious. And now, when I think of all the things I want to share with someone, so many of those thoughts lead me back to you.",

  "I wish I could put this whole year in a little box. The conversations, the laughter, the adventures, the ordinary moments, the things we learned, and even the days that asked more of us than we expected. I would keep it somewhere safe, so that years from now we could open it together and remember the people we were when we were just beginning to understand what this love could become.",

  "Do you remember our tissue-paper rings? They remind me that something doesn't have to be expensive to be precious. The most meaningful things in our story aren't necessarily the ones anyone else would notice. They are the things that have meaning because we were there, because we shared them, because they became ours.",

  "Debi, I hope you know that you never have to earn your place in my heart by being perfect. You don't have to be happy every day, have every answer, or carry every difficult thing on your own. You are allowed to grow, change your mind, have bad days, chase unfamiliar dreams, and become someone you haven't even imagined yet. I want to know those versions of you, too.",

  "I want to support the life you're building, not ask you to make your world smaller for me. I want to celebrate your successes without making them about myself. I want to listen when you need to be heard, apologise when I am wrong, and remember that loving you means caring about how you actually feel, not only about what I intended.",

  "I know a letter cannot promise a perfect future. Neither can a beautiful website, a thousand messages, or one special date. What matters is what we choose to do after the celebrations are over. So my promise isn't that I'll never make mistakes. It's that I want to keep learning from them. I want to keep listening, keep being honest, and keep finding ways to make this relationship feel safe, kind, and real for both of us.",

  "There are so many things I still want us to do. More places to visit. More photographs to take. More conversations that run longer than we planned. More ordinary days that become precious only when we look back. I want to know what makes you happy five years from now, what dreams you've discovered, what you've outgrown, and what still makes you laugh until you can't explain why.",

  "And if one day we look back at this first anniversary, I hope we don't only remember how much we loved each other. I hope we remember how we treated each other, how we grew, how we made room for each other to be human, and how the little things were often the things that mattered most.",

  "If I could give this first year a title, I would call it The Beginning. Not because it was insignificant, but because I hope it is only the first chapter of a story we continue writing with care.",

  "Thank you for being the girl who was my best friend before she became my love. Thank you for being part of this chapter of my life. And thank you for giving me a reason to sit here, making this little universe, trying to find a way to show you what you mean to me.",

  "Happy one year, Debi. Whatever the next chapters bring, I hope we keep meeting each other with honesty, tenderness, laughter, and the willingness to grow.",

  "I love you. Not just in the words I can write today, but in the care I hope to keep showing you tomorrow.",

  "— Your Sayak"
],


  /* ── page: the backstage note ───────────────────────────────────── */
  maker: [
  "Debi, if you're reading this, congratulations. You've reached the end of my unnecessarily elaborate way of saying I love you.",

  "I could have bought you a gift, written you a letter, or sent you a hundred messages. But I wanted to make something you could return to. Something that would still be here on an ordinary Tuesday, a difficult evening, or a day when you simply wanted to remember our first year.",

  "Somewhere along the way, I spent an unreasonable amount of time adjusting colours, arranging words, and making little hearts float around a screen. There were probably easier ways to do this. But I wanted to give you something that carried a little piece of my time, my effort, and my heart.",

  "The truth is, I still don't always know how to fit everything I feel into a sentence. So I tried putting those feelings into pages, little memories, promises, letters, and this tiny universe that belongs to our story.",

  "One day, this website might look old. The design might feel dated, the colours might make us laugh, and I might wonder why I spent so long adjusting one little detail. I hope that when that day comes, what you remember isn't whether everything looked perfect. I hope you remember that I wanted you to have something made especially for you.",

  "And if you ever come back here years from now, I hope you can smile at the two people we were when I made it. Still learning. Still growing. Still discovering what love asks of us.",

  "Happy first anniversary, my Debi. You were my best friend before you became my love, and that will always be one of the most precious parts of our story.",

  "— Your Sayak"
  ],

  /* ── page: the finale ───────────────────────────────────────────── */
  finalePhoto: "/photos/finale.jpeg",
  
starLines: {
  sayak: "This year taught me that love isn't only finding someone special. It's learning to care for the person who was already my friend, and choosing to keep growing beside her.",
  debi: "You were my best friend before you became my love, and you will always be someone whose happiness, dreams, and heart matter deeply to me."
},

finalReveal: "And if I could return to the beginning, knowing everything this year would teach me, I would still want to meet you, know you, and choose to begin this story with you.",

  /* ── page: her turn (the part that reaches you) ──────────────────── */
  herTurn: {
    title: "Now it's your turn",
    intro:
      "I've said everything I could think of. I'd rather hear from you than be the only one talking. Write whatever you want — one line or a thousand — and it comes straight to me. If you'd rather say it out loud, record it instead.",
    placeholder: "Write your heart out…",
    thanks: "It reached me. Every word. ♥",
  },

  /* ═════════════════════════════════════════════════════════════════
     OUR UNIVERSE — the part you both come back to.
     Everything below powers the hub after the story ends.
     ═════════════════════════════════════════════════════════════════ */

  /* Your own passcode, so the app can tell you apart from her.
     Make it something she wouldn't guess — she has the site. */
  myPasscode: "kharagpur",

  /* ── OPEN WHEN… ──────────────────────────────────────────────────
     Pure authored content — no database, no setup. The envelope stays
     sealed until she taps it. `audio` is optional: record a voice note,
     put the file in public/ and point at it like "/openwhen/missing.m4a".
     These are the highest-value TODOs in this whole file. She will come
     back to these on bad days for years. Write them properly. */
  
envelopes: [
  {
    label: "when you're missing me",
    note: "My Debi, if I could be beside you right now, I wouldn't try to make the distance sound smaller than it feels. I would just sit close to you, hold your hand, and let you miss me without having to hide it. I miss you too, in all the little spaces where I wish you were here. Until I can be there, please remember that being apart doesn't erase what we share. You are still my best friend, still my person, and still the girl I want to tell about my day. Imagine me asking you how you're doing, then actually waiting for the answer. You don't have to be okay with the distance every day. I love you on the days you handle it beautifully and on the days you wish you didn't have to handle it at all.",
    audio: null,
    photo: "/photos/open-missing.jpeg",
  },
  {
    label: "when you've had a difficult day",
    note: "Come here, my love. You don't have to explain everything perfectly. You don't have to turn this day into a lesson or find a silver lining before you're allowed to rest. If all you did today was get through it, that counts too. I am not here only for the cheerful version of you, the successful version of you, or the version who has everything figured out. I want you to feel safe being tired, upset, uncertain, or quiet with me. If you want to talk, I will listen. If you want a distraction, we'll find one. If you want silence, you don't have to fill it. You are loved even on the days when you don't feel like your best self. Especially then, please be gentle with yourself.",
    audio: null,
    photo: "/photos/open-difficult.jpeg",
  },
  {
    label: "when you need a laugh",
    note: "Debi, emergency notice: your boyfriend has once again spent an unreasonable amount of time making a website instead of behaving like a normal person. Somewhere out there, I am probably adjusting a tiny detail and convincing myself that this is absolutely necessary. The situation is serious. The hearts must float correctly. The colours must be right. The universe must be lovingly overengineered. And after all that, I still cannot guarantee that I will win our next argument. I hope you're smiling now, even a little. If not, imagine me trying to defend the importance of one more tiny animation with a completely straight face. I love you, you ridiculous little favourite person of mine.",
    audio: null,
    photo: "/photos/open-laugh.jpeg",
  },
  {
    label: "when you're proud of yourself",
    note: "Stop for a moment, my love. Before you rush to the next thing, before you decide what you still haven't done, let yourself recognise how far you've come. Your dreams matter. Your education matters. Your ambitions and the future you're trying to build matter. You do not have to reach the final destination before you're allowed to be proud of the distance you've travelled. I hope you learn to celebrate yourself even when nobody else notices the effort it took. I hope you never confuse a difficult phase with a failed life. I am proud of the person you are, and I want you to be proud of her too. Keep going at your own pace. Your worth was never waiting at some finish line.",
    audio: null,
    photo: "/photos/open-proud.jpeg",
  },
  {
    label: "when you need quiet",
    note: "My love, you don't have to reply to this. You don't have to explain why you're quiet or apologise for needing time to yourself. Rest your mind. Put your phone down. Do something that makes the world feel a little less loud. Love should leave room for breathing, for individuality, for days when you have nothing left to say. I want you to have a life that feels like yours, dreams that belong to you, and enough space to hear your own thoughts. I will not measure your love by how quickly you answer a message. When you're ready to talk, I'll be happy to hear from you. Until then, take care of yourself. You can be loved and still need space. Those two things can exist together.",
    audio: null,
    photo: "/photos/open-quiet.jpeg",
  },
  {
    label: "when you doubt us",
    note: "My Debi, I won't ask you to pretend that love means never having doubts, never getting hurt, or never finding anything difficult. We're two people learning, and I know that love needs more than beautiful words on a special day. It needs honesty when the truth is uncomfortable, patience when understanding takes time, accountability when we get things wrong, and respect for each other's choices. I cannot promise that every day will be easy or that I will always know the right thing to say. I can promise that I want to keep learning how to love you better. I want us to be able to speak honestly, listen without rushing to defend ourselves, and make room for both of our feelings. You don't owe me blind faith. I want to build a relationship where trust can grow through what we do, not just what we say. Remember the friendship that came before this anniversary. Remember the person you are, too. Whatever we face, I want us to meet it with care, courage, and kindness toward each other.",
    audio: null,
    photo: "/photos/open-doubt.jpeg",
  },
],


  /* ── HOW WELL DO WE KNOW EACH OTHER ──────────────────────────────
     You both answer privately. Neither sees the other's answers until
     both have submitted. Make these answerable, not trick questions. */
  
quizQuestions: [
  { id: "q1", ask: "What always makes Debi laugh?" },
  { id: "q2", ask: "What's Sayak's comfort food?" },
  { id: "q3", ask: "Which memory of ours would you relive?" },
  { id: "q4", ask: "What's the other person secretly proud of?" },
  { id: "q5", ask: "What were we to each other before we became boyfriend and girlfriend?" }
],


  /* ── THE TIME CAPSULE ────────────────────────────────────────────
     Both answer on the 25th. Sealed until the date below. */
  capsuleQuestions: [
    { id: "c1", ask: "What was your favourite moment this year?" },
    { id: "c2", ask: "What did you learn about yourself?" },
    { id: "c3", ask: "What do you hope for next year?" },
  ],
  capsuleOpensOn: "2027-10-25",

  /* ── FUTURE LETTERS ─────────────────────────────────────────────
     Default reveal date offered in the form. She can pick another. */
  defaultRevealDate: "2027-10-25",

  /* ── AUDIO DIARY PROMPTS ────────────────────────────────────────
     Shown as gentle suggestions. She can ignore them and just talk. */
  audioPrompts: [
    "Tell future Debi one thing she should never forget.",
    "What does today actually feel like?",
    "Say something you'd never write down.",
    "Describe us to someone who's never met us.",
  ],
};