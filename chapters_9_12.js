const {
  Paragraph, TextRun, PageBreak, AlignmentType, HeadingLevel, BorderStyle,
  Table, TableRow, TableCell, WidthType
} = require("docx");

const BODY_FONT = "Georgia";
const HEAD_FONT = "Arial";
const BODY_SIZE = 23;
const BODY_LEADING = 276;

function bodyPara(text, opts = {}) {
  const runs = parseRuns(text);
  return new Paragraph({
    spacing: { after: 120, line: BODY_LEADING },
    indent: opts.noIndent ? undefined : { firstLine: 360 },
    alignment: AlignmentType.JUSTIFIED,
    ...opts.paraOpts,
    children: runs,
  });
}
function bodyFirst(text) { return bodyPara(text, { noIndent: true }); }
function parseRuns(text) {
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(new TextRun({ text: text.slice(last, match.index), font: BODY_FONT, size: BODY_SIZE }));
    if (match[1]) parts.push(new TextRun({ text: match[1], font: BODY_FONT, size: BODY_SIZE, bold: true }));
    else parts.push(new TextRun({ text: match[2], font: BODY_FONT, size: BODY_SIZE, italics: true }));
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(new TextRun({ text: text.slice(last), font: BODY_FONT, size: BODY_SIZE }));
  return parts;
}
function sceneBreak() {
  return new Paragraph({ spacing: { before: 300, after: 300 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "*\u2003*\u2003*", font: BODY_FONT, size: BODY_SIZE })] });
}
function chapterHeading(number, title) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 120 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Chapter ${number}`, font: HEAD_FONT, size: 22, color: "666666", allCaps: true, characterSpacing: 120 })] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 600 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `\u201C${title}\u201D`, font: HEAD_FONT, size: 40, bold: true })] }),
  ];
}
function tripCard(destination, items) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const rows = items.map(([label, value]) =>
    new TableRow({ children: [
      new TableCell({ borders, width: { size: 2000, type: WidthType.DXA },
        children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: label, font: HEAD_FONT, size: 18, bold: true })] })] }),
      new TableCell({ borders, width: { size: 6000, type: WidthType.DXA },
        children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: value, font: BODY_FONT, size: 20 })] })] }),
    ] })
  );
  return [
    new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: `TRIP CARD: ${destination}`, font: HEAD_FONT, size: 20, bold: true, allCaps: true, characterSpacing: 80 })] }),
    new Table({ columnWidths: [2000, 6000], rows }),
  ];
}

// ─────────────────────────────────────────────────
// CHAPTER 9
// ─────────────────────────────────────────────────
function chapter9() {
  const p = [];

  p.push(...chapterHeading(9, "The Art of the Long Weekend"));

  // ── OPENING ──
  p.push(bodyFirst("The year I discovered the Indian holiday calendar was rigged in my favour, everything changed."));
  p.push(bodyPara("It was January 2nd, 2024. The office was that particular flavour of empty that only exists in the first week of a new year\u2014half the team still \u201Cworking from home,\u201D which is code for \u201Cwatching Shark Tank in pyjamas.\u201D I was at my desk because I am, fundamentally, a person who shows up. This is not a virtue. It is a compulsion born of middle-class guilt and the lingering fear that someone might mark me absent in some invisible register."));
  p.push(bodyPara("My screen had two tabs open. One was Jira, which displayed a sprint backlog so long it looked like a CVS receipt. The other was the 2024 gazetted holiday list, which HR had emailed with the subject line \u201CPlease Plan Your Leave Responsibly.\u201D I had opened it to mark a few dates in my personal calendar. What I found instead was a treasure map."));
  p.push(bodyPara("I counted. India has roughly fifteen gazetted holidays per year, give or take depending on your state and how your company feels about Ambedkar Jayanti. Fifteen days when the office is closed, no questions asked. Now add weekends\u2014that\u2019s 104 days. Together, that\u2019s 119 days of the year when you are already not working. The question that lit up my brain like a Diwali skyline was devastatingly simple: what if those 119 days could be *more*?"));
  p.push(bodyPara("I leaned back in my chair, cracked my knuckles, and opened a fresh spreadsheet. This was going to be my masterpiece."));

  p.push(sceneBreak());

  // ── THE SPREADSHEET ──
  p.push(bodyPara("The spreadsheet took three hours to build, which is longer than some of the trips it would eventually enable. I named it \u201COperation Long Weekend\u201D because I am a man who believes that everything sounds more exciting with the word \u201COperation\u201D in front of it. Operation Long Weekend. Operation Rajma Chawal. Operation Don\u2019t Tell HR."));
  p.push(bodyPara("The structure was simple but elegant. Column A: date. Column B: day of the week. Column C: holiday name (if any). Column D: whether it was a gazetted holiday, a restricted holiday, or a regular weekend. Column E\u2014and this was the genius part\u2014Column E was labelled \u201CLeave Leverage Ratio.\u201D This was a metric I invented on the spot. It measured how many total days off you could get per day of PTO used. A ratio of 4:1 meant one day of leave gave you a four-day weekend. A ratio of 9:2 meant two days of leave gave you nine consecutive days off. I colour-coded the ratios. Green for anything above 3:1. Yellow for 2:1. Red for anything that required you to actually burn a full week of leave like some kind of peasant."));
  p.push(bodyPara("My colleague Arjun walked over around the second hour, coffee in hand, and stared at my screen. Arjun is a backend developer with a gift for saying exactly the wrong thing at the right moment. He squinted at my spreadsheet, then at me, then back at the spreadsheet."));
  p.push(bodyPara("\u201CIs this\u2026 a work project?\u201D he asked."));
  p.push(bodyPara("\u201CIt\u2019s the most important project I\u2019ve ever worked on,\u201D I said, without looking up."));
  p.push(bodyPara("\u201CYou\u2019re using your data skills to\u2026 *not work*?\u201D"));
  p.push(bodyPara("I turned to face him. \u201CArjun. Republic Day is a Thursday this year. Take Friday off. That\u2019s a four-day weekend. Holi is a Monday. Take Tuesday off. Another four-day weekend. Independence Day is a Thursday. Same trick. Dussehra falls on a Friday this year, and if you take Monday and Tuesday off\u2014\u201D"));
  p.push(bodyPara("His eyes went wide. I watched the realization cascade across his face like a waterfall of dawning comprehension. He pulled up a chair."));
  p.push(bodyPara("\u201CSend me a copy of that spreadsheet,\u201D he said."));
  p.push(bodyPara("\u201CI\u2019ll add you to the shared drive.\u201D"));

  p.push(sceneBreak());

  // ── THE REPUBLIC DAY HACK ──
  p.push(bodyPara("The first test of Operation Long Weekend was Republic Day, January 26th. It fell on a Friday\u2014not a Thursday as I\u2019d initially told Arjun, because I had been so excited I\u2019d misread my own spreadsheet. No matter. A Friday holiday meant the weekend was already three days. Take Thursday off, and it was four. Leave Leverage Ratio: 4:1. Green zone. I put in the leave request on January 5th. My manager, a man named Vikram who communicated primarily through sighs, approved it in seventeen minutes. I don\u2019t think he even looked at the date."));
  p.push(bodyPara("My plan was Pondicherry. I had never been, and I had romanticised it thoroughly: French colonial architecture, boutique cafes, a promenade where I\u2019d walk at sunset feeling like a character in a Mani Ratnam film. I booked a guesthouse on a Tuesday. Rs. 1,800 per night, which felt reasonable. I packed light\u2014one backpack, two shirts, a book I\u2019d been meaning to finish since July."));
  p.push(bodyPara("The problem became apparent approximately three seconds after I opened MakeMyTrip on January 20th. Every hotel in Pondicherry was either sold out or had tripled in price. The Rs. 1,800 guesthouse sent me a WhatsApp message\u2014a WhatsApp message, mind you, not even an email\u2014informing me that due to \u201Cpeak season demand,\u201D my booking was being \u201Cupgraded\u201D to a Rs. 4,500 room. This is the hospitality industry\u2019s version of dynamic pricing, and it feels exactly as dishonest as it sounds."));
  p.push(bodyPara("I called the guesthouse. A man named Joseph answered with the weary politeness of someone who had fielded this call forty times that day. \u201CSir, it\u2019s Republic Day weekend. Everyone is coming.\u201D"));
  p.push(bodyPara("\u201CEveryone?\u201D"));
  p.push(bodyPara("\u201CBangalore, Chennai, Hyderabad\u2014everyone, sir. Every techie in South India has the same idea.\u201D"));
  p.push(bodyPara("He was right. I had made a fundamental error. I had optimised my *calendar*, but I had forgotten to optimise for the fact that ten million other people with the same calendar were running the same optimisation. The long weekend hack had a flaw: *everyone knew it*."));
  p.push(bodyPara("I sat at my desk, defeated, for about ninety seconds. Then I opened Google Maps and started scrolling south along the coast from Pondicherry. Thirty kilometres down, I found Mahabalipuram. Same coast. Same Bay of Bengal. UNESCO World Heritage Site. And when I searched for accommodation, the prices were normal. Better than normal. A beach shack\u2014actual walls, actual bed, a fan that worked intermittently\u2014for Rs. 600 a night."));
  p.push(bodyPara("I booked it instantly. No WhatsApp negotiations. No dynamic pricing. Just a man on the phone who said, \u201CYes, sir, we have rooms. Come whenever.\u201D"));
  p.push(bodyPara("Those four days in Mahabalipuram were among the best of the year. The Shore Temple at dawn, when the stone turns gold and the only sound is waves. Seafood lunches at a shack run by a woman named Lakshmi who served fish curry on banana leaves and judged you if you asked for a fork. An afternoon spent watching sculptors in the town\u2019s stone-carving workshops, their chisels tapping out rhythms that hadn\u2019t changed in a thousand years. I read my entire book. I ate crab with my hands. I spent Rs. 4,200 total, including transport."));
  p.push(bodyPara("The lesson was clear: the hack works, but you have to hack the hack. When everyone zigs to Pondicherry, you zag to Mahabalipuram. When everyone books Manali, you book Tirthan Valley. The adjacent town is always cheaper, quieter, and\u2014more often than not\u2014better."));

  p.push(sceneBreak());

  // ── THE FULL YEAR MAP ──
  p.push(bodyPara("By February, I had the entire year mapped. Not just the holidays\u2014the *strategy*. Each trip was threaded into the work calendar like a needle through fabric, invisible until you looked closely. March brought Holi on a Monday; I took Tuesday off and spent four days in Orchha, wandering Mughal-era palaces that most tourists skip on their way to Khajuraho. April had nothing useful\u2014no holidays near weekends\u2014so I worked through it like a normal person and pretended to enjoy it."));
  p.push(bodyPara("May was a masterstroke: Buddha Purnima fell on a Thursday. One day of leave, four-day weekend, and I was on a bus to Dharamshala. June had nothing, but I negotiated a \u201Cwork from anywhere\u201D week and spent it in Munnar, attending standups from a tea plantation while my manager pretended not to notice the suspiciously green background on my video calls."));
  p.push(bodyPara("The sprint planning meetings became a kind of performance art. I would wait until the end, when the scrum master asked about upcoming time off, and casually mention, \u201CI\u2019ll be OOO on Friday.\u201D My manager Vikram would look at the calendar, then at me, then at the calendar again, performing the calculation of whether this was worth fighting. It never was. One day of leave is not a hill any manager wants to die on, especially when the person requesting it has already finished their sprint tasks."));
  p.push(bodyPara("The art was in the *casually*. You never announce a long weekend trip with enthusiasm. You mention it the way you\u2019d mention a dentist appointment\u2014boringly, briefly, with an undertone of mild inconvenience. \u201CYeah, I\u2019ll be unreachable Friday, some family thing.\u201D The \u201Cfamily thing\u201D was me, alone, eating *poha* at a street stall in Varanasi at six in the morning, but Vikram didn\u2019t need to know that."));
  p.push(bodyPara("August brought Independence Day on a Thursday\u2014the golden configuration again. I took Friday off and went to Alleppey. September had Ganesh Chaturthi on a Tuesday; I took Monday off and spent four days in Hampi for the second time, because some places demand return visits. By October, the system had spread. Arjun was using the spreadsheet. So was Priya from the design team. So was Rohit from DevOps, who had modified it to include his wife\u2019s company\u2019s holiday calendar, creating a merged super-calendar that optimised for couples. He called it \u201COperation Double Leave.\u201D I was so proud I almost cried."));
  p.push(bodyPara("The Slack status became its own art form. \u201CWorking remotely from Jaipur\u201D was my favourite\u2014technically true, since I did answer three emails from a haveli rooftop, but spiritually dishonest in a way that brought me deep satisfaction. My colleague Sneha started setting her status to \u201CWorking remotely from [undisclosed location]\u201D which was less subtle but twice as funny."));

  p.push(sceneBreak());

  // ── THE MASTERPIECE ──
  p.push(bodyPara("The crown jewel of Operation Long Weekend came in October. Dussehra fell on a Friday. The following Monday and Tuesday were regular workdays. But here\u2019s the thing: if you take Monday and Tuesday off\u2014just two days of PTO\u2014you get a nine-day stretch. Friday (Dussehra) through the following Sunday. Nine days. Two days of leave. Leave Leverage Ratio: 9:2, or 4.5:1. Deep green. Neon green. The kind of green that makes a spreadsheet sing."));
  p.push(bodyPara("I put in the leave request in September. Vikram stared at it. I could see him doing the math on his screen, his lips moving slightly as he counted days. He looked up at me. I smiled. Not a smug smile\u2014a helpful smile, the smile of a man who is simply exercising his contractual right to paid time off."));
  p.push(bodyPara("\u201CThis is\u2026 technically correct,\u201D he said."));
  p.push(bodyPara("\u201CThe best kind of correct,\u201D I replied."));
  p.push(bodyPara("He approved it. What else could he do? I had used two days of leave. I had nine days of freedom. And I used every single one of them in Ladakh."));
  p.push(bodyPara("Ladakh in October is a gamble\u2014the season is ending, some passes might close, the nights drop below freezing. But the light is extraordinary, a crystalline amber that makes every mountain look like it was painted by someone who just discovered the colour gold. I drove from Manali over the Rohtang Pass, through Keylong and Sarchu, sleeping in dhabas along the highway where the truckers gathered around kerosene heaters and told stories about the road. I reached Leh on day three and spent the remaining six days doing absolutely nothing productive. Pangong Lake. Nubra Valley. Thiksey Monastery at dawn. A yak cheese omelette at a cafe run by a Ladakhi woman named Dolma who called me \u201Ccity boy\u201D and charged me an extra twenty rupees for being \u201Ctoo skinny.\u201D"));
  p.push(bodyPara("Nine days. Two days of PTO. The math was irrefutable. This was my magnum opus, my Sistine Chapel of leave management, and when I returned to the office, I had the tan of a man who had been gone for two weeks and the smugness of a man who had only used two days of annual leave to achieve it."));

  p.push(sceneBreak());

  // ── CLOSE + HOOK ──
  p.push(bodyPara("By year\u2019s end, the numbers were staggering. Eleven trips. Twelve days of PTO. Fifty-two days spent outside the city, outside the routine, outside the fluorescent-lit purgatory of the open-plan office. The spreadsheet had become legendary. Three departments asked for copies. A product manager from the Mumbai office emailed me directly, asking if I\u2019d build a version for Maharashtra\u2019s holiday calendar. I declined, because I was too busy building one for Karnataka."));
  p.push(bodyPara("HR, to their credit, waited until November to respond. The email came from a woman named Nandini in the People & Culture team, and it was a masterclass in corporate passive-aggression. The subject line was \u201CLeave Policy: Spirit vs. Letter.\u201D The body reminded all employees that \u201Cleave is intended for rest and rejuvenation\u201D and that \u201Cstrategic clustering of leave days around holidays, while not technically a violation, may not reflect the collaborative spirit we encourage.\u201D I printed the email and pinned it above my desk. It was the closest thing to a trophy I\u2019d ever received."));
  p.push(bodyPara("Arjun walked by as I was admiring it. \u201CYou\u2019re going to frame that, aren\u2019t you?\u201D"));
  p.push(bodyPara("\u201CI\u2019m considering a plaque,\u201D I said."));
  p.push(bodyPara("The calendar hack was my magnum opus. But there was one more optimisation I needed to crack: how to make each trip cost less than my monthly Swiggy bill. Turns out, travelling India is absurdly cheap\u2014if you\u2019re willing to eat where the locals eat and sleep where the truckers sleep."));

  // TRIP CARD
  p.push(...tripCard("The Long Weekend Calendar", [
    ["Destination", "The Long Weekend Calendar"],
    ["Duration", "Varies (3\u20139 days from 1\u20132 PTO days)"],
    ["Budget", "Varies per destination"],
    ["Best Windows", "Republic Day (Jan), Holi (Mar), Independence Day (Aug), Dussehra/Diwali (Oct)"],
    ["Key Principle", "1 day of PTO + 1 adjacent holiday = 3\u20134 day weekend"],
    ["Spreadsheet", "Map all gazetted holidays + optional holidays + weekends in January itself"],
    ["Pro Tip", "Book the ADJACENT town, not the obvious destination. Everyone hacks the same weekends."],
  ]));

  return p;
}

// ─────────────────────────────────────────────────
// CHAPTER 10
// ─────────────────────────────────────────────────
function chapter10() {
  const p = [];

  p.push(...chapterHeading(10, "The Rs. 3,500 Experiment"));

  // ── OPENING ──
  p.push(bodyFirst("My total spend for a five-day Himachal trip was Rs. 3,500. This is less than what I spent on Swiggy last month. I know this because I track both in the same Excel sheet, and the irony is not lost on me."));
  p.push(bodyPara("The number sat in cell D47 of my expense tracker, glowing green because I had conditional formatting set to highlight anything under Rs. 5,000. Above it, in cell D46, was my October Swiggy total: Rs. 4,218. Four thousand two hundred and eighteen rupees for a month of butter chicken deliveries and late-night biryani orders eaten standing over the kitchen counter at midnight, aluminium foil still clinging to the container. Below it, Rs. 3,500 for five days in the Himalayas\u2014transport, food, accommodation, miscellaneous. Five days of mountains, rivers, hot springs, and the best rajma chawal I have ever tasted in my life."));
  p.push(bodyPara("Something about those two numbers, sitting side by side in adjacent cells, rearranged my understanding of money. I had been spending more to *feel less*. The Swiggy orders were convenient, forgettable, consumed while scrolling Instagram. The Himachal trip was inconvenient, unforgettable, and consumed while sitting on a rock beside a river listening to water that had been flowing since before anyone thought to put a price on anything."));
  p.push(bodyPara("The experiment had started as a bet. It ended as a philosophy. Here is how it happened."));

  p.push(sceneBreak());

  // ── THE RULES ──
  p.push(bodyPara("My friend Meera was the catalyst, as she was for most of my worst and best ideas. Meera works in UX design, which means she spends her days thinking about how people behave and her evenings telling me how badly I behave. We were at a bar in Koramangala\u2014the kind of place that charges Rs. 400 for a beer and calls it \u201Ccraft\u201D\u2014when I mentioned that I was thinking about a Himachal trip."));
  p.push(bodyPara("\u201CHow much will you spend?\u201D she asked."));
  p.push(bodyPara("\u201CI don\u2019t know. Fifteen, twenty thousand?\u201D"));
  p.push(bodyPara("She gave me that look\u2014the one she reserves for bad UI decisions and worse life choices. \u201CYou could do it for five thousand. Easily.\u201D"));
  p.push(bodyPara("\u201CFive thousand for five days? In Himachal?\u201D"));
  p.push(bodyPara("\u201CLess. I bet you could do it for four.\u201D"));
  p.push(bodyPara("The competitive part of my brain\u2014the part that once spent three hours optimising a SQL query that only ran once a month\u2014ignited. \u201CThree and a half thousand,\u201D I said. \u201CFive days, Kasol to Kheerganga to Manikaran. Rs. 3,500, all in.\u201D"));
  p.push(bodyPara("Meera raised an eyebrow. \u201CIf you go over, you owe me a thousand.\u201D"));
  p.push(bodyPara("\u201CDeal.\u201D"));
  p.push(bodyPara("We shook on it, and I immediately began setting ground rules, because nothing says \u201Cfun trip\u201D like a formal rule framework. Rule one: no flights. Only government buses and shared transport. Rule two: no taxis, no Ola, no Uber. If it doesn\u2019t have a state transport corporation logo on the side, I\u2019m not getting in it. Rule three: only eat at dhabas\u2014no restaurant with a menu printed in English. Rule four: no accommodation over Rs. 500 a night. Rule five: no \u201Ctourist\u201D anything. No guided tours, no entry fees over Rs. 50, no souvenir shops. I was going to travel like the truck drivers and the sadhus and the local families who have been navigating these mountains for centuries without the assistance of TripAdvisor."));

  p.push(sceneBreak());

  // ── DAY 1-2: DELHI TO KASOL ──
  p.push(bodyPara("Day one began at midnight at ISBT Delhi, the Inter-State Bus Terminus at Kashmere Gate, which is less a bus station and more a controlled experiment in chaos theory. I say \u201Ccontrolled\u201D loosely. The control is an illusion maintained by a handful of staff members in khaki uniforms who point in contradictory directions when you ask which bay has the Himachal bus."));
  p.push(bodyPara("The terminal at midnight is a world unto itself. Families sleeping on metal benches, their luggage forming defensive perimeters around them. Chai vendors threading through the crowd with kettles that seem to hold an infinite supply of tea. The smell is diesel and samosas and that specific government-building disinfectant that Indian public infrastructure uses as a kind of signature fragrance. I found my bus\u2014an HRTC semi-deluxe to Bhuntar, departure 12:30 AM\u2014after asking four people and receiving five different answers."));
  p.push(bodyPara("The ticket cost Rs. 550. Semi-deluxe, in the vocabulary of Indian state transport, means the seats recline approximately seven degrees and the curtains are a shade of blue that was optimistic in 1996. The bus was nearly full. I had a window seat, which I had booked specifically because the only way to survive a twelve-hour overnight bus is to lean your head against the glass and pretend you\u2019re in a music video. The man next to me was already asleep, his head wrapped in a shawl, emitting a gentle snore that would accompany me through six states worth of highway."));
  p.push(bodyPara("Sleep on an HRTC semi-deluxe is not really sleep. It\u2019s a kind of negotiation between your body\u2019s desire for unconsciousness and the bus driver\u2019s desire to treat the mountain roads like a Formula 1 circuit. Every hairpin turn produces a full-body tilt that jolts you awake, and just as you settle back in, the driver honks\u2014not a polite honk but a sustained blast that echoes off the valley walls and probably wakes up villages three kilometres away. I dozed in fifteen-minute increments, bookended by honks and turns, and dreamed about spreadsheets."));
  p.push(bodyPara("We stopped at a dhaba near Mandi at 5 AM. The morning air was sharp and cold and smelled like pine. I stumbled off the bus, groggy and stiff, and ordered chai and aloo paratha. The paratha was thick, greasy, golden-brown, and exactly what I needed. The chai was the colour of terracotta and sweet enough to reset my entire nervous system. Cost: Rs. 50. I stood there in the grey mountain dawn, eating a perfect paratha, watching the mist lift off the Beas River, and thought: *This. This is what Rs. 50 buys you.*"));
  p.push(bodyPara("Bhuntar arrived at noon\u2014twelve hours after departure, as promised, which is honestly impressive punctuality for an Indian government bus. From Bhuntar, I took a local bus to Kasol. This bus cost Rs. 30 and was, remarkably, more crowded than the overnight one. It held approximately twice its intended capacity, with passengers standing in the aisle, sitting on luggage, and in one memorable case, sharing a seat with a crate of apples. The road wound along the Parvati River, and through the window I could see the water churning white and green over boulders, the valley narrowing as we climbed."));
  p.push(bodyPara("Kasol arrived in forty minutes. I found a guesthouse on the main road\u2014a place called Mountain View Lodge, which had a mountain view only if you leaned out the window at a forty-five-degree angle and looked past the dosa cart. The room was small, clean enough, with a bed, a blanket, and a window that opened onto a courtyard where someone was strumming a guitar badly. Rs. 400 per night. I dropped my bag, washed my face, and went to find lunch."));
  p.push(bodyPara("The dhaba was called Raju\u2019s. It might not have been called Raju\u2019s\u2014there was no sign\u2014but the man cooking was named Raju, so I\u2019m exercising editorial discretion. Raju served exactly two things: rajma chawal and dal chawal. I ordered the rajma chawal. It arrived in a steel plate, the rajma thick and dark and smoky, the rice steaming, a wedge of lemon on the side. I took one bite and understood, viscerally, that I had been paying Rs. 250 for inferior rajma chawal in Bangalore for two years. Raju\u2019s version cost Rs. 60. It was better in every measurable and immeasurable dimension. The beans were softer. The gravy was richer. The rice was the right rice\u2014not basmati, not fancy, just short-grain mountain rice that absorbs the rajma gravy like it was born for this purpose."));
  p.push(bodyPara("I ate. I ordered a second plate. Raju raised an eyebrow but said nothing, which is the dhaba owner\u2019s way of saying *I approve of you*. Total food cost for day one: Rs. 170. I was, if anything, under budget."));

  p.push(sceneBreak());

  // ── DAY 3-4: KHEERGANGA TREK + MANIKARAN ──
  p.push(bodyPara("Day three was the Kheerganga trek, and the Kheerganga trek is the reason I believe that some of the best things in life are, in fact, free\u2014or at least only cost you the price of a bus ticket and your knees."));
  p.push(bodyPara("The trail starts from Barshaini, a twenty-minute bus ride from Kasol (Rs. 15). I didn\u2019t hire a guide because the trail is well-marked and because I was on a budget so tight it creaked. Instead, I followed the stream of other trekkers\u2014a mix of college students with too much energy, European backpackers with too many tattoos, and a family from Punjab who were carrying, I am not exaggerating, a full pressure cooker in their backpack. \u201CFor rajma,\u201D the father explained when he saw me staring. \u201CThe dhaba at the top charges too much.\u201D This man understood the assignment."));
  p.push(bodyPara("The trek is about twelve kilometres each way, and it climbs roughly 1,700 metres through forest so dense that the sunlight arrives pre-filtered, dappled, cathedral-like. The first two hours were beautiful. The next two hours were painful. My calves burned. My lungs, accustomed to Bangalore\u2019s sea-level air and office air conditioning, staged a formal protest. I stopped four times, pretending to take photographs but actually just trying to breathe without wheezing."));
  p.push(bodyPara("And then, at the top, the hot springs."));
  p.push(bodyPara("Kheerganga\u2019s hot springs are natural pools of geothermally heated water at approximately 13,000 feet, surrounded by pine forests and snow-streaked peaks. You climb for five hours through increasingly brutal terrain, your body screaming for rest, and then you lower yourself into water that is exactly, precisely, miraculously the right temperature. Not too hot, not too warm\u2014the Goldilocks zone of natural bathing. I sat in that water for an hour. My muscles unwound. My thoughts dissolved. A sadhu\u2014dreadlocked, orange-robed, barefoot despite the altitude\u2014sat across from me, smoking a chillum with the serene focus of a man who has figured out something that I, with all my spreadsheets, have not."));
  p.push(bodyPara("\u201CHow long have you been here?\u201D I asked him."));
  p.push(bodyPara("\u201CThree years,\u201D he said. \u201CGive or take.\u201D"));
  p.push(bodyPara("\u201CThree *years*? At Kheerganga?\u201D"));
  p.push(bodyPara("He shrugged. \u201CWhere else would I go?\u201D"));
  p.push(bodyPara("I told him about the budget experiment. He found it hilarious. \u201CYou spend Rs. 3,500 in five days? I spend less than that in a month.\u201D He gestured at the mountains, the springs, the endless sky. \u201CAll of this is free, bhai. The expensive things are the ones you don\u2019t need.\u201D"));
  p.push(bodyPara("I camped near the springs that night. Not in a tent\u2014I hadn\u2019t brought one\u2014but in a tarpaulin shelter that someone had set up for trekkers. Rs. 200, which included a blanket that smelled like woodsmoke and a dinner of dal rice cooked over a fire by a man named Suresh who ran the camp like a benevolent dictator. Cost of the day: Rs. 265, including the bus to Barshaini."));
  p.push(bodyPara("Day four was the descent and then Manikaran, which is only three kilometres from Barshaini and which contains one of the great free meals in India. The Manikaran Gurudwara sits beside the Parvati River, and the water here is naturally boiling\u2014actual boiling, steam rising from the river, enough heat to cook rice in the current. The gurudwara uses this geothermal water in its kitchen, which I think makes it the most energy-efficient place of worship in the country."));
  p.push(bodyPara("The *langar*\u2014the communal kitchen\u2014serves free food to anyone who walks in. No questions about religion, caste, budget, or whether you have a bet with a UX designer in Bangalore. You sit on the floor. You hold out your plate. Volunteers serve you dal, roti, rice, and a vegetable dish that changes daily. On the day I visited, it was aloo gobi, and it was extraordinary\u2014simple, flavourful, cooked in quantities large enough to feed hundreds but tasting like it was made for you specifically."));
  p.push(bodyPara("I sat on the floor of the Manikaran Gurudwara, cross-legged, my plate balanced on my knee, surrounded by truckers, families, backpackers, and two elderly women who were discussing, in rapid Punjabi, the relative merits of different brands of pressure cookers. The food was warm. The floor was cool. The river roared outside. I ate until I was full, and then I ate a little more, because that is the etiquette of langar, and because the roti was the softest roti I had ever encountered and I wanted to remember it with my body, not just my mind."));
  p.push(bodyPara("Cost of the best meal of the trip: Rs. 0. I did make a donation at the gurudwara\u2019s offering box\u2014Rs. 100\u2014but this was gratitude, not payment. You cannot pay for langar. That is the point."));

  p.push(sceneBreak());

  // ── DAY 5: THE RETURN + ACCOUNTING ──
  p.push(bodyPara("Day five was the return, and the return is where the experiment either held together or collapsed. I took the local bus from Kasol to Bhuntar (Rs. 30), then the HRTC bus from Bhuntar to Delhi (Rs. 550, same semi-deluxe, same seven-degree recline, same cacophony of honks). Breakfast was aloo paratha at a dhaba near the bus stand (Rs. 40). Lunch was a packet of biscuits and a chai on the bus (Rs. 30). Dinner would be whatever I could find at ISBT Delhi when I arrived, which would probably be a samosa and a prayer."));
  p.push(bodyPara("On the bus, I opened my expense tracker. I am the kind of person who tracks expenses on a trip the way a pilot tracks altitude\u2014constantly, nervously, with the awareness that a miscalculation could be catastrophic. I had logged every rupee."));
  p.push(bodyPara("Transport: Rs. 1,175. This included both overnight buses (Rs. 550 each), the local buses (Rs. 30 each way to Kasol, Rs. 15 to Barshaini), and nothing else because there was nothing else. No taxis, no autos, no Ola surge pricing."));
  p.push(bodyPara("Food: Rs. 825. This was spread across five days of dhaba meals, chai stops, and the occasional biscuit packet. The langar at Manikaran had saved me at least two meals\u2019 worth of spending, plus the Rs. 100 donation."));
  p.push(bodyPara("Accommodation: Rs. 1,200. Three nights in Kasol at Rs. 400 each, plus Rs. 200 for the tarpaulin shelter at Kheerganga. One night was spent on the bus."));
  p.push(bodyPara("Miscellaneous: Rs. 300. This covered a phone charger I bought because mine broke on day two (Rs. 150), a bottle of sunscreen (Rs. 80), and a wool cap I purchased from a roadside vendor in Kasol because my ears were freezing and I had dramatically underestimated mountain cold (Rs. 70)."));
  p.push(bodyPara("Total: Rs. 3,500. Exactly."));
  p.push(bodyPara("I stared at the number. I photographed it. I sent the screenshot to Meera with a single message: \u201CPay up.\u201D"));
  p.push(bodyPara("Her reply came in three minutes: a UPI payment of Rs. 1,000 and a text that said, \u201CI hate you and I\u2019m doing this trip next month.\u201D"));
  p.push(bodyPara("But the money wasn\u2019t the point\u2014though I admit it did buy me approximately 2.5 Swiggy dinners, which I enjoyed with the complex satisfaction of a man who had beaten the system twice in one month. The point was what the experiment had revealed. The cheap trip was *better*. Not better despite being cheap\u2014better *because* it was cheap. When you remove the cushion of money, you are forced into proximity with the actual country. No taxi means you ride the bus with the apple-crate man and the pressure-cooker family. No restaurant means you eat Raju\u2019s rajma chawal. No hotel means you sleep at Kheerganga and talk to a sadhu about the economics of renunciation."));
  p.push(bodyPara("Every rupee I didn\u2019t spend had pushed me closer to India. Every luxury I\u2019d skipped had been replaced by something better: a conversation, a shared meal, a view that no hotel room could frame."));

  p.push(sceneBreak());

  // ── CLOSE + HOOK ──
  p.push(bodyPara("The Rs. 3,500 experiment proved something I\u2019d suspected but never confirmed: India rewards you for spending less. The less you spend, the closer you get to the real thing. The budget isn\u2019t a constraint\u2014it\u2019s a compass. It points you toward the dhabas and the government buses and the gurudwara kitchens, away from the tourist traps and the Instagram cafes and the overpriced \u201Cexperiences\u201D that stand between you and the experience itself."));
  p.push(bodyPara("But there\u2019s a flip side to all this travelling. After eighteen months of long weekends and calendar hacks, I was starting to ask a question I hadn\u2019t expected: *What if I just\u2026 didn\u2019t go back?* What if the Monday morning return\u2014the bus to the airport, the auto to the apartment, the laptop open to fifty-three unread Slack messages\u2014what if I simply\u2026 skipped it? It was a dangerous thought. And it was waiting for me in Spiti Valley."));

  // TRIP CARD
  p.push(...tripCard("Budget Himachal (Kasol\u2013Kheerganga\u2013Manikaran)", [
    ["Destination", "Budget Himachal (Kasol\u2013Kheerganga\u2013Manikaran)"],
    ["Duration", "5 days"],
    ["Budget", "Rs. 3,500 (total \u2014 not per day)"],
    ["Getting There", "ISBT Delhi \u2192 Bhuntar (govt bus Rs. 550), Bhuntar \u2192 Kasol (local bus Rs. 30)"],
    ["Stay", "Guesthouses in Kasol Rs. 300\u2013500/night, camping at Kheerganga Rs. 0 (carry tent) or Rs. 200"],
    ["Must Eat", "Langar at Manikaran Gurudwara (free, open to everyone), dhaba rajma chawal"],
    ["Pro Tip", "Track every rupee. The discipline makes you creative, and the final tally is your trophy."],
  ]));

  return p;
}

// ─────────────────────────────────────────────────
// CHAPTER 11
// ─────────────────────────────────────────────────
function chapter11() {
  const p = [];

  p.push(...chapterHeading(11, "The Trip That Almost Made Me Quit"));

  // ── OPENING ──
  p.push(bodyFirst("The sunrise at Key Monastery is not a visual experience. It is a physical one. The light does not appear\u2014it *arrives*, like a wave, like a wall of gold that hits the mountains and then hits you, and for a moment the entire valley is burning and you are burning with it, standing at 14,000 feet in a thin jacket with your laptop bag slung over one shoulder because you are a man who brings his work laptop to a monastery and this, if you think about it, tells you everything you need to know about your life."));
  p.push(bodyPara("My laptop had 12% battery. The call was at 11 AM\u2014a sprint review with the product team, the kind of meeting where everyone shares their screen and pretends to have accomplished more than they did. It was 6:47 AM. The monastery was silent except for the prayer flags snapping in the wind and the low, almost sub-audible hum of monks chanting somewhere inside the white-walled complex. The Himalayas spread out below me in layers\u2014brown, then gold, then white, then blue, each ridge a slightly different shade, as if someone had arranged them by colour and forgotten to stop."));
  p.push(bodyPara("There was no WiFi. There was no cellular signal. My phone showed the words \u201CNo Service\u201D with the dispassionate clarity of a machine that does not understand what those words mean to a man who is supposed to join a call in four hours."));
  p.push(bodyPara("I should have felt conflicted. The responsible employee in me\u2014the one who shows up, who files JIRA tickets on time, who once stayed late to fix a deployment that wasn\u2019t even his\u2014should have been panicking. But standing there, watching the gold light cascade down the mountains like something being poured, I felt nothing about the call. Absolutely nothing. Not rebellion. Not guilt. Just\u2026 nothing. As if the meeting existed in a dimension that this place had quietly, thoroughly erased."));
  p.push(bodyPara("This worried me more than the missing WiFi."));

  p.push(sceneBreak());

  // ── THE CONTEXT ──
  p.push(bodyPara("Let me explain how I ended up at a monastery at dawn with a dying laptop and a growing suspicion that my entire career was a mistake."));
  p.push(bodyPara("It had been eighteen months since the first trip\u2014eighteen months and fifteen-odd journeys since I\u2019d discovered the long weekend hack and the budget trick and the art of the Slack status that says \u201Cavailable\u201D while you\u2019re standing in a waterfall. By any metric, the past year and a half had been extraordinary. I had seen more of India in eighteen months than most people see in a decade. I had eaten street food in fourteen states. I had slept on trains, in guesthouses, in a hammock on a houseboat, and once on the floor of a bus station because the 2 AM Volvo was cancelled and I refused to book a hotel on principle."));
  p.push(bodyPara("But something had shifted. The trips, which once felt like liberation, had started to feel like logistics. I would arrive in a new city and immediately begin optimising\u2014fastest route to the hotel, cheapest lunch spot, most efficient sightseeing order. I was treating Varanasi like a sprint and Hampi like a Kanban board. The joy was still there, somewhere, but it was buried under a layer of planning and a deeper layer of exhaustion."));
  p.push(bodyPara("My colleague Sneha noticed first. She caught me at the coffee machine one Monday morning, back from a weekend in Udaipur, and she said the thing that nobody wants to hear: \u201CYou look more tired after your trips than before them.\u201D"));
  p.push(bodyPara("I laughed it off. But she was right. I had become a machine for converting leave days into destinations, and somewhere in the process I had stopped experiencing the destinations themselves. I was collecting places the way some people collect stamps\u2014for the record, not for the thing itself."));
  p.push(bodyPara("Spiti Valley was supposed to be the correction. I had heard about Spiti the way you hear about mythological places\u2014in fragments, in whispers, from people who describe it with a far-off look in their eyes and the inability to finish sentences. \u201CThe light is\u2026 I mean, the mountains\u2026 you just have to\u2026\u201D I had filed ten days of leave\u2014the longest I\u2019d ever taken\u2014and told my manager Vikram that I was going somewhere with no phone signal. He looked relieved, which I chose not to analyse."));
  p.push(bodyPara("The plan was simple: get as remote as possible, stay as long as possible, and see if the thing I\u2019d been chasing on all these weekend trips\u2014the thing that kept slipping away faster and faster\u2014would finally hold still long enough for me to look at it."));

  p.push(sceneBreak());

  // ── THE ISOLATION ──
  p.push(bodyPara("Spiti Valley in October is a place that is actively preparing to disappear. The passes close in November. The tourists leave in September. What remains is the valley itself\u2014stark, enormous, almost lunar in its desolation\u2014and the people who live in it year-round, who don\u2019t have the option of leaving when the snow comes."));
  p.push(bodyPara("I arrived in Kaza, the district headquarters, after two days of driving from Manali over the Rohtang Pass and through the Kunzum La. The road\u2014and I use the word generously\u2014was a series of switchbacks carved into cliffs, occasionally interrupted by waterfalls that flowed directly across the asphalt, as if the mountain hadn\u2019t been consulted about the road and was expressing its opinion. My shared jeep held six passengers, a driver named Dorje who smoked continuously and drove with the casual confidence of a man who had made this trip a thousand times, and one terrified goat that belonged to someone and was going somewhere and bleated in protest at every turn, which was often."));
  p.push(bodyPara("Kaza at 12,500 feet is not a town that tries to impress you. It has a main street, a few guesthouses, a monastery, and a wind that comes off the mountains with the force and temperature of an open freezer. I checked into a guesthouse called the Spiti Holiday Home\u2014a name that suggests amenities it does not possess\u2014and spent the first evening just breathing. The altitude compresses your lungs and expands your thoughts. Everything feels slightly slowed, slightly heightened, as if the thin air has recalibrated your senses."));
  p.push(bodyPara("The next morning, I went to Tabo. Tabo Monastery is over a thousand years old. It\u2019s called the \u201CAjanta of the Himalayas,\u201D and when you step inside its dark, freezing prayer halls, you understand why. The murals on the walls are ancient\u2014Buddhas and bodhisattvas painted in pigments that have survived a millennium of Himalayan winters, their colours still vibrant in the torchlight, their faces serene in a way that makes you aware of how unserene your own face is. I stood in that room for forty-five minutes. I was the only person there. The silence was not empty\u2014it was *full*, packed with centuries of prayer and cold air and the accumulated stillness of a thousand years."));
  p.push(bodyPara("From Tabo, I hiked to Dhankar Lake\u2014a two-hour walk from Dhankar village, uphill, through a landscape that looked like Mars with better lighting. The lake, when I reached it, was small, glacial, and turquoise in a way that seemed digitally enhanced but wasn\u2019t. I was alone. Completely, entirely alone. Not alone in the Instagram sense\u2014where you crop out the thirty other tourists\u2014but actually alone. No other people. No sounds except wind. No evidence that the twenty-first century had occurred."));
  p.push(bodyPara("And then there was Langza. Population 137, though I suspect this is an optimistic count. Langza sits at 14,500 feet and contains two things of note: a massive Buddha statue overlooking the valley, and the ground itself, which is littered with fossils. Not fossils in a museum case\u2014fossils on the surface, lying in the dirt, waiting for you to pick them up. Marine fossils. Shells and ammonites and the compressed remains of creatures that lived when the Himalayas were an ocean floor, four hundred million years ago."));
  p.push(bodyPara("I picked up a fossil. It was an ammonite\u2014a spiral shell, perfectly preserved, cool and heavy in my palm. I held something that had been alive when this place was underwater, before the tectonic plates collided and pushed the ocean floor five kilometres into the sky. The Himalayas are the world\u2019s longest-running act of geological violence, and I was holding the evidence in my hand."));
  p.push(bodyPara("My sprint retro was in three days. I had held an ocean fossil at 14,500 feet. These two facts could not coexist comfortably in my mind, so one of them had to give. I sat down on the cold ground beside the Buddha statue and stared at the valley for a very long time, turning the fossil over in my fingers, and wondered what exactly I was doing with my life."));

  p.push(sceneBreak());

  // ── THE CONVERSATION ──
  p.push(bodyPara("The conversation that changed everything happened in Kaza, on day six, in a guesthouse kitchen that smelled like butter tea and kerosene."));
  p.push(bodyPara("Tenzin owned the guesthouse. He was in his mid-forties, with a face weathered by altitude and a laugh that came easily and loudly. He had grown up in Spiti, gone to Delhi for college, worked in IT\u2014actual IT, at an actual tech company\u2014for eight years, and then come back. He had been running the guesthouse for eight years since."));
  p.push(bodyPara("We were sitting at the kitchen table, drinking butter tea\u2014which tastes like someone put a tablespoon of butter in your chai and is exactly as divisive as it sounds\u2014when I told him about my trips, my spreadsheet, my leave hacks, and the growing suspicion that I was doing all of this to avoid confronting a question I didn\u2019t want to ask."));
  p.push(bodyPara("\u201CWhat question?\u201D he said."));
  p.push(bodyPara("\u201CWhether I should quit.\u201D"));
  p.push(bodyPara("He nodded. He had heard this before. Every traveller who comes to Spiti eventually says the words \u201CI should quit my job,\u201D in the same tone of voice that people use to say \u201CI should start exercising.\u201D It\u2019s aspirational, vague, and usually forgotten by the time they reach the Manali Volvo."));
  p.push(bodyPara("\u201CI\u2019m not going to tell you to quit your job,\u201D Tenzin said. He refilled my cup. \u201CThat\u2019s what everyone expects me to say. The guy who left the city, lives in the mountains, runs a guesthouse\u2014you think I\u2019m going to give you the speech about freedom and simplicity and following your heart?\u201D"));
  p.push(bodyPara("\u201CAre you not?\u201D"));
  p.push(bodyPara("\u201CNo.\u201D He smiled. \u201CBecause the question isn\u2019t whether to quit. The question is what you\u2019re quitting *toward*.\u201D"));
  p.push(bodyPara("I said nothing. The kitchen was warm. The wind rattled the windowpanes."));
  p.push(bodyPara("\u201CEveryone who comes here wants to escape *from* something,\u201D he continued. \u201CThe job, the city, the traffic, the boss. But escaping from something is just running. You run and you run and eventually you end up\u2026 here.\u201D He gestured around the kitchen. \u201CWhich is beautiful. I love it. But I didn\u2019t come here because I was running. I came here because I knew this was where I wanted to be. I was running *toward* Spiti, not away from Delhi. The difference matters.\u201D"));
  p.push(bodyPara("He took a sip of his tea. \u201CSo. What are you running toward?\u201D"));
  p.push(bodyPara("I opened my mouth and found that I had no answer. Not a bad answer\u2014no answer at all. A blank space where a life plan should have been. I had spent eighteen months perfecting the art of leaving, and I had never once asked myself what I was arriving at."));
  p.push(bodyPara("\u201CYou don\u2019t know yet,\u201D Tenzin said. It was not a question. \u201CThat\u2019s okay. But don\u2019t quit until you do. Otherwise you\u2019re just changing the scenery around the same problem.\u201D"));
  p.push(bodyPara("We sat in silence for a while. The butter tea grew cold. Outside, the Spiti wind did what it always does\u2014carried on, indifferent, ancient, unbothered by the small crises of men who haven\u2019t figured out their lives."));

  p.push(sceneBreak());

  // ── THE DECISION ──
  p.push(bodyPara("I didn\u2019t quit. I want to be clear about that, because this is not the story of the man who went to the mountains and found enlightenment and handed in his resignation with a serene smile. That story is a fantasy, and it belongs in a TED talk, not in a book about a man who tracks his Swiggy expenses in the same spreadsheet as his travel budget."));
  p.push(bodyPara("What I did was smaller, and I think more honest. I made a decision not about my career, but about the relationship between my career and my travels. For eighteen months, I had treated them as opposites. Work was the cage. Travel was the escape. The office was the real life I was stuck in. The trips were the real life I was running toward. But Tenzin was right\u2014I wasn\u2019t running toward anything. I was just running."));
  p.push(bodyPara("The decision was this: I would stop treating travel as an escape from work and start treating it as a parallel life. Not \u201Cout of office\u201D as a departure from normal\u2014but \u201Cout of office\u201D as its own kind of normal. Work on weekdays. Travel on weekends. Not in opposition. Not in competition. Just\u2026 both. Two tracks, running side by side, each making the other possible."));
  p.push(bodyPara("It sounds simple. It was simple. But it required me to stop resenting Monday mornings, which I had been doing professionally for a decade and a half. It required me to stop viewing the office as the enemy of the mountains. The office paid for the mountains. The mountains made the office survivable. They needed each other, and I needed both."));
  p.push(bodyPara("On day seven, I joined the 11 AM sprint review from a cafe in Kaza. The cafe was called Taste of Spiti, and it served momos and coffee and had WiFi that worked for approximately eight consecutive minutes before collapsing, which was enough to log in, share my screen, give my update, and log off before anyone noticed the yak in the background."));
  p.push(bodyPara("My camera was off. But the mountains were in the window. I could see them while I talked about velocity and burn-down charts, and they did not make the meeting less tedious, but they made the tedium less important. The meeting was a small thing. The mountains were a large thing. Both were happening at the same time. This was okay."));
  p.push(bodyPara("After the call, I closed my laptop, ordered another coffee, and walked to the Kaza monastery. The monks were doing their evening prayers. I sat outside and listened. The chanting was low and rhythmic and old, and it mixed with the wind, and I thought: *I can have this. I can have both.*"));
  p.push(bodyPara("It was the first time in eighteen months of travelling that I felt not excited, not exhilarated, not desperate to stay\u2014but *settled*. Settled in the way you feel when you stop trying to solve a problem and realise that it was never a problem in the first place. Just a life. Just my life, with its spreadsheets and its mountains, its sprint retros and its sunrises, its cold coffee and its butter tea."));

  p.push(sceneBreak());

  // ── CLOSE + HOOK ──
  p.push(bodyPara("The drive out of Spiti goes through Kunzum Pass, at 15,060 feet. It is a place where the road is not really a road but a suggestion written in gravel across the roof of the world. The pass was closing in a week\u2014the first snows had already dusted the higher peaks, and the border police were talking about shutting the route\u2014so I was among the last to cross before winter sealed the valley shut."));
  p.push(bodyPara("At the top of the pass, I asked Dorje to stop. He pulled over, lit a cigarette, and leaned against the jeep with the patience of a man for whom this was a road, not a revelation. I stood at the edge and looked back at Spiti\u2014the valley I had spent ten days in, the valley that had asked me a question I couldn\u2019t answer and then, quietly, answered it for me."));
  p.push(bodyPara("The prayer flags at the pass snapped and whipped in the wind. Below, the valley was brown and gold and enormous, and the river was a silver thread stitching the mountains together, and the sky was the kind of blue that doesn\u2019t exist at lower altitudes\u2014a blue so deep it\u2019s almost violet, the blue you see when there\u2019s almost no atmosphere between you and space."));
  p.push(bodyPara("I knew I would come back. Not because I was running from something\u2014not anymore\u2014but because Spiti was now part of who I was. It had joined the list of places that had changed me: Hampi\u2019s boulders, Coorg\u2019s rain, the Konkan railway\u2019s dawn. Each trip had left something behind in me, and I had left something behind in each place, and this accumulation\u2014this layering of self and landscape\u2014was the whole point. Not the leave hack. Not the budget trick. The *layering*."));
  p.push(bodyPara("I drove out of Spiti Valley with something I didn\u2019t have when I drove in: a plan. Not a travel plan\u2014I had enough of those. A life plan. And it started with accepting that \u201COut of Office\u201D was never about leaving. It was about knowing where you belong when you come back."));

  // TRIP CARD
  p.push(...tripCard("Spiti Valley", [
    ["Destination", "Spiti Valley"],
    ["Duration", "8\u201310 days (this one needs real time off)"],
    ["Budget", "Rs. 18,000\u201325,000 (from Delhi, shared jeep/bus)"],
    ["Best Season", "June\u2013October (road closed November\u2013May)"],
    ["Getting There", "Delhi \u2192 Manali \u2192 Rohtang \u2192 Kunzum Pass \u2192 Kaza (2 days by road)"],
    ["Altitude", "12,500+ feet \u2014 acclimatize in Manali first, carry Diamox"],
    ["Pro Tip", "Go in October. It\u2019s the last month before winter closes everything. The silence is absolute."],
  ]));

  return p;
}

// ─────────────────────────────────────────────────
// CHAPTER 12
// ─────────────────────────────────────────────────
function chapter12() {
  const p = [];

  p.push(...chapterHeading(12, "An Out of Office That Never Ends"));

  // ── OPENING ──
  p.push(bodyFirst("Monday morning. The office. The same desk, the same monitor, the same coffee mug with the chipped handle that I keep meaning to replace and never do because it holds exactly the right amount of coffee and change is, at its core, frightening."));
  p.push(bodyPara("The Jira board has fourteen tickets in the sprint backlog. The standup is at 10:15. Someone has microwaved rajma chawal in the office kitchen, and the smell has colonised the entire floor, mixing with the air conditioning into a fragrance that is simultaneously nostalgic and aggressive. My chair makes that same sound when I sit down\u2014the hydraulic wheeze of a mechanism that has supported my existential crises for three years and is, I suspect, running low on whatever gas keeps it from collapsing entirely."));
  p.push(bodyPara("Everything is the same. Except it isn\u2019t. My screensaver is a photo from Spiti\u2014Langza village, the Buddha statue, the fossil-strewn ground. My Slack profile picture is from Triund, the one where I\u2019m standing at the ridge with the Dhauladhar range behind me and an expression on my face that could be interpreted as either enlightenment or altitude sickness. My phone\u2019s wallpaper is a train window\u2014the Konkan coast, the one I photographed at dawn when the Arabian Sea was pink and the tunnels were still coming every few minutes."));
  p.push(bodyPara("My Slack status says \u201CAvailable.\u201D And I am available. I\u2019m here. I\u2019m at my desk. I\u2019m going to write code and attend meetings and drink coffee and do the things that pay for the life I\u2019ve built. But the life I\u2019ve built is no longer contained in this office. It extends outward in every direction\u2014south to Hampi, west to Goa, north to Spiti, east to Meghalaya\u2014and it carries with it the taste of dhaba rajma chawal and the smell of monsoon rain on laterite soil and the sound of prayer flags in wind so cold it burns."));
  p.push(bodyPara("I have integrated travel into my identity. Not as escape. As *practice*."));

  p.push(sceneBreak());

  // ── THE INVENTORY ──
  p.push(bodyPara("Eighteen months. Eighteen months and twenty-odd trips, and what do I have to show for it? Not souvenirs\u2014I don\u2019t buy souvenirs, because I learned in Rajasthan that the miniature camel will end up in a drawer and the \u201Cauthentic\u201D puppet will gather dust and the fridge magnet will fall off during the next earthquake drill and you\u2019ll step on it barefoot at 2 AM. What I have is less tangible and more durable."));
  p.push(bodyPara("Hampi taught me presence. You cannot stand among those boulders, in that impossible landscape, and think about your sprint backlog. The rocks won\u2019t let you. They are too old and too strange and too committed to being exactly what they are, and in their presence, you are forced to be exactly what you are, which is a small person standing in a large ruin trying to understand time."));
  p.push(bodyPara("Coorg taught me resilience. The rain taught me that. The rain that came down like it was trying to make a point, that turned the coffee plantations into rivers and the rivers into oceans and the leeches into my constant, blood-sucking companions. You cannot survive a Coorg monsoon without developing the conviction that discomfort is not the enemy of experience. It *is* the experience."));
  p.push(bodyPara("Triund taught me that suffering has a view. The climb is brutal. The last kilometre is vertical. Your calves scream. Your lungs burn. And then you reach the top and the Dhauladhar range is right there\u2014not in the distance, not on a postcard, but *right there*, close enough to feel like you could reach out and touch the snow. The view is the reward for the pain. They are inseparable. You cannot have one without the other."));
  p.push(bodyPara("Tamil Nadu taught me patience. The temples taught me that\u2014the endless, magnificent, overwhelming temples, each one a universe of stone, each one requiring you to slow down and look and look again and accept that you will not understand everything and that is fine. You do not need to understand a temple. You need to stand inside it and let it work on you, the way music works on you, without requiring your comprehension."));
  p.push(bodyPara("The train taught me vulnerability. Twenty-eight hours in a second-class sleeper, surrounded by strangers, sharing food and space and silence with people you will never see again\u2014this is an exercise in trust. You trust the stranger with your luggage while you sleep. You trust the chai vendor that the milk is fresh. You trust the track, the driver, the schedule, the country. You let go. You have to."));
  p.push(bodyPara("Rajasthan taught me compromise. The golden city, the blue city, the pink city\u2014every colour a negotiation between what I wanted and what the desert offered. The camel ride I didn\u2019t want but took. The palace I wanted to see but couldn\u2019t afford. The daal baati churma that was too simple to be as good as it was, which is the essential lesson of Rajasthan: simplicity is not the absence of complexity but the resolution of it."));
  p.push(bodyPara("Meghalaya taught me humility. The living root bridges taught me that. Bridges grown, not built\u2014fifty, eighty, a hundred years of patient cultivation, roots trained across rivers by people who knew they would never walk on the finished bridge. They built for their grandchildren. I build for the next sprint. The difference in time horizon is enough to rearrange your priorities if you let it."));
  p.push(bodyPara("Goa taught me authenticity. Not the Goa of beach clubs and Instagram influencers but the Goa of ferry crossings and village bars and old Portuguese churches where the light comes through stained glass and lands on pews worn smooth by five hundred years of seated prayers. Authenticity is not found. It is what remains when you stop performing."));
  p.push(bodyPara("The calendar hack taught me ingenuity. Himachal taught me simplicity. And Spiti\u2014Spiti taught me the right question. Not *should I quit?* but *what am I building?* Not *where should I go?* but *who do I become when I get there?*"));

  p.push(sceneBreak());

  // ── THE CHANGES ──
  p.push(bodyPara("The changes were small. That\u2019s what surprised me. I had expected travel to produce some grand transformation\u2014a new career, a new city, a new personality. Instead, it produced a series of small behavioral shifts that, taken together, amounted to a different way of being in the same life."));
  p.push(bodyPara("I take real lunch breaks now. Not the desk lunch, not the sad sandwich eaten while scrolling Slack, but an actual break\u2014forty-five minutes, away from the screen, eating food that I can see and taste and smell. I learned this in South India, where lunch is an event, not an interruption. A full meals\u2014rice, sambar, rasam, three vegetables, a papad, a pickle, and a sweet\u2014served on a banana leaf and eaten slowly, deliberately, with your right hand, because the hand knows what the fork does not: that food is a relationship, not a transaction."));
  p.push(bodyPara("I say no to Sunday night meetings. This was a direct consequence of the long weekend calendar hack. Once you understand that your weekends are *yours*\u2014not the company\u2019s, not Slack\u2019s, not Vikram\u2019s\u2014you stop treating them as overflow time for the work that didn\u2019t get done during the week. Sunday at 8 PM is not a meeting slot. It is the last hour of your freedom, and it should be spent doing something that matters, even if that something is staring at a wall in a state of deliberate, defiant laziness."));
  p.push(bodyPara("I keep a bag half-packed at all times. This is the budget traveller\u2019s reflex\u2014the knowledge that opportunity doesn\u2019t send calendar invites. A long weekend appears on Wednesday. A cheap fare drops on Thursday morning. By Thursday night, you\u2019re on a bus. The half-packed bag is not paranoia. It is preparedness. It says: *I am ready. I am always ready.*"));
  p.push(bodyPara("I talk to strangers on my commute. I learned this on the trains\u2014those twenty-eight-hour journeys where the man in the upper berth becomes your confidant and the woman with the tiffin becomes your lunch provider and the child across the aisle becomes your entertainment. Strangers are not threats. They are stories you haven\u2019t heard yet. My metro commute in Bangalore is twenty-two minutes, and in those twenty-two minutes I have learned about a retired professor\u2019s research on soil bacteria, a college student\u2019s plan to start a pickle business, and an auto driver\u2019s theory about why Rajkumar is still the greatest actor in Kannada cinema. None of this information is useful. All of it is valuable."));
  p.push(bodyPara("My Instagram is half office, half mountains. I used to curate it\u2014only travel photos, only the good ones, only the golden-hour shots that make your life look like a tourism ad. Now I post the Monday desk alongside the Saturday summit. The cold coffee next to the campfire coffee. The sprint board next to the starry sky. I\u2019ve stopped caring about the ratio because the ratio *is* my life, and my life is half spreadsheet, half sunset, and I\u2019m done pretending otherwise."));
  p.push(bodyPara("These are small things. But they add up. They add up to a person who is more present, more patient, more willing to eat with his hands and sleep on a bus and talk to a stranger and say no to a meeting and yes to an impulse. They add up to a person who has stopped waiting for life to happen *outside* the office and started letting it happen everywhere, all the time, including at 10:15 on a Monday morning when the standup is about to begin and the rajma chawal smell is strong and the screensaver is showing mountains."));

  p.push(sceneBreak());

  // ── THE PLACES STILL ON THE LIST ──
  p.push(bodyPara("The list never shrinks. This is the point. Every trip adds more destinations than it crosses off, because India is not a country you can complete. It is a country that expands the more you explore it, like a fractal, like a map that redraws itself every time you unfold it."));
  p.push(bodyPara("Lakshadweep. I have seen photos of the lagoons\u2014turquoise, absurd, the kind of water that makes you question whether the Indian Ocean is real or just very good CGI. I have a tab open for the permit application. I have not yet submitted it. I will."));
  p.push(bodyPara("Kutch during the Rann Utsav, when the salt desert turns white under the full moon and the craft villages open their doors and the air tastes like salt and stars. The Andamans, where the coral is alive and the history is brutal and the beaches are so empty that your footprints are the only ones for a kilometre. Sikkim\u2019s Goechala trek, where you walk for nine days through rhododendron forests to stand face-to-face with Kanchenjunga, the third-highest mountain on earth, and probably cry, because that is what people do at Goechala and I am not above it."));
  p.push(bodyPara("And Kashmir. Finally. Kashmir, which I have been circling for years\u2014reading about it, dreaming about it, talking to people who have been and who invariably say, with the quiet certainty of the converted, \u201CIt is the most beautiful place in India.\u201D I will go. I will take the train to Jammu and the bus to Srinagar and I will sit in a shikara on Dal Lake and I will eat wazwan and I will walk through the Mughal gardens and I will understand, at last, why every Bollywood film from the 1960s was shot there."));
  p.push(bodyPara("The list never shrinks. This is not a failure of planning. It is a feature of the country. India has more than you can see in a lifetime, and this is its gift to you: the guarantee that you will never run out of places to go, people to meet, food to eat, mountains to climb, trains to board, buses to catch, and Monday mornings to return from with a tan and a story and a slightly different version of yourself."));

  p.push(sceneBreak());

  // ── THE INVITATION ──
  p.push(bodyPara("I\u2019m talking to you now. You, at your desk. You, with your fourteen Jira tickets and your 10:15 standup and your cold coffee and your rajma chawal smell. You, who has been reading this book and thinking, *maybe*, in the back of your mind, *I could do that*."));
  p.push(bodyPara("You can."));
  p.push(bodyPara("You have fifteen days of annual leave. You have long weekends that you currently spend watching Netflix in your pyjamas and ordering Swiggy at 11 PM and feeling, by Sunday evening, a vague dissatisfaction that you can\u2019t quite name but that sits in your chest like a stone. You have a country with twenty-nine states, twenty-two official languages, six climate zones, and more diversity per square kilometre than most continents manage in their entirety."));
  p.push(bodyPara("You have a thousand reasons not to go. The sprint is not done. The manager will frown. The budget is tight. The tickets are expensive. The weather might be bad. The hotel reviews are mixed. You don\u2019t know anyone who\u2019s been. You\u2019re not the \u201Ctravelling type.\u201D You\u2019ll go next month. Next quarter. Next year. After the promotion. After the wedding. After things settle down."));
  p.push(bodyPara("Things never settle down. That is the secret no one tells you. There is no magical future moment when your calendar clears and your bank account fills and your boss smiles benevolently and says, \u201CGo, explore India, take all the time you need.\u201D That moment does not exist. What exists is *now*\u2014this weekend, this long weekend, this gap between Holi and Monday that you could fill with Netflix or you could fill with Orchha."));
  p.push(bodyPara("I had the same reasons. All of them. Every single one. I went anyway. I took the train when I couldn\u2019t afford the flight. I ate at the dhaba when I couldn\u2019t afford the restaurant. I slept in the Rs. 400 guesthouse and the Rs. 200 tarpaulin shelter and the bus station floor, and every single time, the experience was richer than the price suggested, because India does not charge you for its best offerings. The sunrise is free. The temple is free. The langar is free. The conversation with the stranger on the train is free. The fossil on the ground at Langza is free. The most extraordinary things in this country cost nothing, and the only price of admission is showing up."));
  p.push(bodyPara("It was the best decision I\u2019ve made from a Monday morning desk. And I\u2019ve made it again and again, every time I open a new tab and search for a bus ticket, every time I set my status to \u201COut of Office,\u201D every time I stuff my half-packed bag into the overhead bin of a semi-deluxe HRTC bus and think, *Here we go again*."));

  p.push(sceneBreak());

  // ── CLOSE ──
  p.push(bodyPara("It is 10:14 on a Monday morning. The standup starts in one minute. My coffee is cold. The Jira board is full. The rajma chawal smell has faded, replaced by the usual office blend of synthetic carpet and ambition."));
  p.push(bodyPara("My browser has two tabs open. The left tab is the sprint backlog\u2014fourteen tickets, two blockers, one critical bug that has been critical for three weeks and will be critical for three more. The right tab is a search page: \u201CDelhi to Srinagar flights October.\u201D The prices are reasonable. The timing is good. There is a long weekend in October that the spreadsheet has already highlighted in green."));
  p.push(bodyPara("I look at the left tab. I look at the right tab. I look at the left tab again. The standup starts in forty-five seconds."));
  p.push(bodyPara("I smile. It is a small smile\u2014the kind that lives in the corners of your mouth and does not announce itself\u2014but it contains multitudes. It contains Hampi\u2019s boulders and Coorg\u2019s rain and Triund\u2019s ridge and the Konkan coast at dawn. It contains Raju\u2019s rajma chawal and Dolma\u2019s yak cheese omelette and the Manikaran langar. It contains Tenzin\u2019s question and the Langza fossil and the Key Monastery sunrise. It contains every bus station, every dhaba, every trail, every train, every conversation with a stranger who became, for a few hours, the most important person in my world."));
  p.push(bodyPara("I open Slack. I navigate to my profile. I click on the status field. I type two words:"));
  p.push(bodyPara("**Out of Office.**"));
  p.push(bodyPara("Below it, in the notes field\u2014the one that nobody reads but everyone can see\u2014I type: *Be back Monday. Or not. We\u2019ll see.*"));
  p.push(bodyPara("The standup notification pops up. I close the Slack window. I click the right tab. I look at the flights. October is two months away. The spreadsheet is ready. The bag is half-packed. The list never shrinks."));
  p.push(bodyPara("I close my eyes for a moment. When I open them, the mountains will be there\u2014on my screensaver, in my memory, on the other side of a bus ticket and a leave request and a Friday that has the good sense to fall next to a holiday."));
  p.push(bodyPara("I open my eyes. I join the standup. I answer when they ask what I\u2019m working on. And in the back of my mind, where the spreadsheet lives, where the map unfolds, where India waits\u2014patient, vast, impossibly beautiful, and mine for the taking\u2014a counter ticks over. Another long weekend. Another destination. Another departure."));
  p.push(bodyPara("Another Out of Office that, if I\u2019m honest, never really ends."));

  // TRIP CARD — FINAL
  p.push(...tripCard("India (All of It)", [
    ["Destination", "India (All of It)"],
    ["Duration", "A lifetime of long weekends"],
    ["Budget", "Whatever you can spare \u2014 it\u2019s always enough"],
    ["Best Season", "Always \u2014 every season opens a different India"],
    ["Getting There", "You\u2019re already here"],
    ["Companions", "Solo, friends, family \u2014 each teaches differently"],
    ["Pro Tip", "Set your status to \u201COut of Office.\u201D Then go. The Jira tickets will wait. The sunsets won\u2019t."],
  ]));

  return p;
}

module.exports = { chapter9, chapter10, chapter11, chapter12 };
