const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageBreak,
  AlignmentType, HeadingLevel, PageNumber, TableOfContents, BorderStyle,
  Table, TableRow, TableCell, WidthType, ShadingType, LevelFormat, ImageRun
} = require("docx");

// ─── Formatter specs: Garamond body, Montserrat headings ───
// Kindle-compatible: Georgia fallback for Garamond, Arial for Montserrat
const BODY_FONT = "Georgia";
const HEAD_FONT = "Arial";
const BODY_SIZE = 23; // ~11.5pt (half-points)
const BODY_LEADING = 276; // 1.15 line spacing (twips)

// ─── Helpers ───
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

function bodyFirst(text) {
  return bodyPara(text, { noIndent: true });
}

function parseRuns(text) {
  // Handle *italic* and **bold** markers
  const parts = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(new TextRun({ text: text.slice(last, match.index), font: BODY_FONT, size: BODY_SIZE }));
    }
    if (match[1]) {
      parts.push(new TextRun({ text: match[1], font: BODY_FONT, size: BODY_SIZE, bold: true }));
    } else {
      parts.push(new TextRun({ text: match[2], font: BODY_FONT, size: BODY_SIZE, italics: true }));
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(new TextRun({ text: text.slice(last), font: BODY_FONT, size: BODY_SIZE }));
  }
  return parts;
}

function sceneBreak() {
  return new Paragraph({
    spacing: { before: 300, after: 300 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "*\u2003*\u2003*", font: BODY_FONT, size: BODY_SIZE })],
  });
}

function chapterHeading(number, title) {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { before: 2400, after: 120 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Chapter ${number}`, font: HEAD_FONT, size: 22, color: "666666", allCaps: true, characterSpacing: 120 })],
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 600 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `\u201C${title}\u201D`, font: HEAD_FONT, size: 40, bold: true })],
    }),
  ];
}

function tripCard(destination, items) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const rows = items.map(([label, value]) =>
    new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 2000, type: WidthType.DXA },
          children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: label, font: HEAD_FONT, size: 18, bold: true })] })],
        }),
        new TableCell({
          borders, width: { size: 6000, type: WidthType.DXA },
          children: [new Paragraph({ spacing: { before: 40, after: 40 }, children: [new TextRun({ text: value, font: BODY_FONT, size: 20 })] })],
        }),
      ],
    })
  );
  return [
    new Paragraph({ spacing: { before: 400, after: 100 }, children: [new TextRun({ text: `TRIP CARD: ${destination}`, font: HEAD_FONT, size: 20, bold: true, allCaps: true, characterSpacing: 80 })] }),
    new Table({ columnWidths: [2000, 6000], rows }),
  ];
}

// ─── Chapter content arrays ───
// Each chapter returns an array of Paragraph objects

function chapter1() {
  return [
    ...chapterHeading(1, "The Notification That Started It All"),
    bodyFirst("I remember the exact moment."),
    bodyPara("It was a Monday. Obviously it was a Monday\u2014nothing life-changing ever happens on a Wednesday. I was sitting in the Bangalore office of a perfectly respectable IT services company, staring at a Jira ticket titled \u201CQ3 Sprint Retrospective Action Items\u2014URGENT.\u201D My third coffee sat cold beside my keyboard. The office smelled like printer toner and somebody\u2019s reheated *rajma chawal.*"),
    bodyPara("My phone buzzed. A notification from some travel Instagram page I\u2019d followed during a particularly boring all-hands meeting: *\u201CThe living root bridges of Meghalaya are over 500 years old. Your excuses are not.\u201D*"),
    bodyPara("I stared at it."),
    bodyPara("Then I stared at my Jira ticket."),
    bodyPara("Then I opened MakeMyTrip."),
    bodyPara("Look, I\u2019m not going to pretend this was some dramatic awakening. I didn\u2019t throw my laptop out the window and declare freedom. I\u2019m an Indian professional\u2014we don\u2019t do dramatic exits; we do quiet browser tabs. One tab had the sprint backlog. The other had flights to Guwahati. I toggled between them for about twenty minutes, which is roughly how long it takes for existential dread to beat corporate responsibility in a fair fight."),
    bodyPara("The thing is, I *traveled.* Not a lot\u2014not in the way those LinkedIn influencers talk about, with their \u201CI quit my six-figure job to find myself in Bali\u201D posts. No. I traveled in the way most Indian professionals travel: reluctantly, briefly, and with at least three work calls scheduled during the trip."),
    bodyPara("A family trip to Ooty when I was twelve. Goa with college friends, where we spent more time arguing about the restaurant bill than actually seeing Goa. A company offsite to Coorg that was 90 percent team-building exercises and 10 percent actual Coorg. This was my travel r\u00E9sum\u00E9. Extensive."),
    bodyPara("But something had been building. Maybe it was the fact that I\u2019d been in Bangalore for four years and had explored approximately three neighborhoods, two malls, and one lake (Ulsoor, and even that was by accident). Maybe it was watching my college WhatsApp group fill up with photos of people in Ladakh and Hampi and Pondicherry while I was filling up spreadsheets. Maybe it was the slow realization that India\u2014this impossibly vast, ridiculous, beautiful country I was supposedly a citizen of\u2014was basically a stranger to me."),
    bodyPara("I knew more about Tokyo from anime than I knew about my own northeastern states."),
    bodyPara("That Instagram notification was just the last push. The root bridges of Meghalaya. Five hundred years old. Built by training the roots of living trees across rivers. I didn\u2019t even know this existed. In my own country. And I was sitting here arguing about whether a bug was P1 or P2."),
    bodyPara("I booked the ticket."),
    bodyPara("Not to Meghalaya\u2014I wasn\u2019t that brave yet. I booked a weekend trip to Hampi. Two nights. Solo. The thought of going alone terrified me almost as much as the Jira ticket, but I figured at least ancient ruins wouldn\u2019t send me passive-aggressive Slack messages."),
    bodyPara("The booking cost me Rs. 4,200 for a round trip from Bangalore. The hostel was Rs. 600 a night. I could afford this. I could not afford *not* to do this."),
    bodyPara("I submitted a leave request for Friday. My manager approved it with a \u201Csure\u201D that somehow carried the weight of mild disappointment. I didn\u2019t tell anyone else. Solo trips, I\u2019d learned from exactly zero experience, were supposed to be done quietly. You just disappear for a bit and come back either enlightened or sunburned. Ideally both."),
    bodyPara("The night before the trip, I packed a bag. Then I unpacked it. Then I packed it again, this time with the conviction of a man who has watched one (1) YouTube video titled \u201CWhat to Pack for a Weekend Trip.\u201D I had three T-shirts, a phone charger, a water bottle, sunscreen I\u2019d never use, and an inexplicable amount of anxiety."),
    bodyPara("I sat on my bed at 11 p.m., backpack ready by the door, alarm set for 5 a.m., and thought: *What am I doing?*"),
    bodyPara("This is a thought every first-time solo traveler has. It sits in your chest like an uninvited guest. You\u2019re not scared of the destination\u2014you\u2019re scared of yourself. Of being alone with your own company for forty-eight hours without the buffer of work, Netflix, or someone else\u2019s itinerary. What if you\u2019re boring? What if you don\u2019t know how to enjoy things without someone to perform enjoyment for?"),
    bodyPara("I almost canceled. I opened the MakeMyTrip app, hovered over the cancellation button, and then\u2014I swear this happened\u2014my phone buzzed with an email. Subject line: \u201CREMINDER: Q3 Sprint Retrospective Action Items\u2014URGENT (2nd Follow-up).\u201D"),
    bodyPara("I put the phone down. I went to sleep. I was going to Hampi."),
    sceneBreak(),
    bodyFirst("The bus dropped me at Hospet at 6 a.m."),
    bodyPara("If you\u2019ve never arrived in a small Indian town at dawn, let me paint the picture: everything is simultaneously asleep and awake. Shops are shuttered, but chai stalls are steaming. Dogs are everywhere, living their best lives. The air smells like dust and possibility\u2014or maybe just dust and cow dung\u2014but in the early-morning light, it\u2019s hard to tell the difference, and you don\u2019t really care."),
    bodyPara("I took an auto to Hampi. The driver charged me double\u2014I was too new at this to negotiate and too excited to mind. As the auto chugged along the road, the landscape shifted. Banana plantations gave way to open land, and then, suddenly, boulders. Massive, ancient, impossible boulders balanced on top of each other like a giant had been playing with rocks and wandered off."),
    bodyPara("And then the Virupaksha Temple appeared."),
    bodyPara("I\u2019m not a particularly spiritual person. I don\u2019t meditate. I skip the *aarti* in temples and go straight for the *prasad.* But standing in front of a temple that has been continuously operating for over 1,300 years, with the morning sun turning its *gopuram* gold, and exactly zero people around because it was 7 a.m. on a random Friday\u2014I felt something."),
    bodyPara("Not enlightenment. Not God. Just... *presence.* The feeling of being somewhere that matters. Of being small in the best possible way."),
    bodyPara("I stood there for twenty minutes. No photos. No Instagram story. Just standing. It was the longest I\u2019d gone without checking my phone since 2019."),
    bodyPara("The rest of the day was a blur of walking, sweating, and having my mind blown every forty minutes. The stone chariot. The elephant stables. The underground Shiva temple where I waded through knee-deep water in the dark, using my phone\u2019s flashlight, heart pounding, laughing at myself. I ate meals at a rooftop restaurant overlooking the river, where the owner called me \u201Cboss\u201D and served me the best *thali* I\u2019d ever had for Rs. 120."),
    bodyPara("I talked to no one for six straight hours. It was terrifying for the first hour, peaceful for the next two, and by hour six, I never wanted to talk to anyone ever again. This was the good stuff. This was the feeling I\u2019d been missing from my air-conditioned, open-plan, always-connected, Slack-notified life."),
    bodyPara("By sunset, I was sitting on Hemakuta Hill. The sky was doing things I didn\u2019t know skies could do\u2014purples and oranges bouncing off the boulders, the Tungabhadra River glinting below, the temple bells starting their evening song. I had my notebook out, but I wasn\u2019t writing. I was just... there."),
    bodyPara("My phone buzzed. A Slack message from my team: \u201CHey, can you review this PR when you get a chance?\u201D"),
    bodyPara("I put my phone on Do Not Disturb."),
    bodyPara("Then I changed my Slack status to \u201COut of Office.\u201D"),
    bodyPara("It was the first honest status I\u2019d ever set."),
    ...tripCard("Hampi", [
      ["Duration", "2\u20133 days (Friday\u2013Sunday from Bangalore)"],
      ["Budget", "Rs. 5,000\u20137,000 (bus + hostel + food + autos)"],
      ["Best Season", "October\u2013February (avoid summer\u2014the boulders radiate heat)"],
      ["One Tip", "Stay on the Hippie Island side (Virupapur Gaddi) for the vibe. Cross the river by coracle. It costs Rs. 20 and is the most fun you\u2019ll have on a boat."],
    ]),
  ];
}

function chapter2() {
  return [
    ...chapterHeading(2, "My First Solo Trip Was a Beautiful Disaster"),
    bodyFirst("I was standing in the rain in a town whose name I couldn\u2019t pronounce, with a dead phone, no hotel booking, and exactly forty-seven rupees in my pocket."),
    bodyPara("This was not the plan. The plan was a three-day solo trip to Coorg\u2014coffee plantations, misty hills, that Instagram-famous abbey. I had a spreadsheet. I had a color-coded itinerary. I had downloaded offline maps. I was, in every way that mattered, prepared."),
    bodyPara("What I was not prepared for was the bus driver deciding that \u201CMadikeri\u201D and \u201CMakkandur\u201D were close enough, dropping me at the wrong town at 9 p.m. in a rainstorm that seemed personally offended by my existence."),
    bodyPara("My phone, which had been clinging to 3 percent battery for the last hour like a man hanging off a cliff in an action movie, finally gave up. The screen went black. I stood under the bus stop\u2019s tin roof, rain hammering all around me, and experienced what I can only describe as the opposite of enlightenment."),
    bodyPara("The thing about solo travel is that there\u2019s no one to blame but yourself. No friend who forgot to book the hotel. No travel agent who messed up the ticket. Just you, standing in the rain, realizing that your spreadsheet means nothing when the universe decides to improvise."),
    bodyPara("A man appeared from somewhere. He was carrying an umbrella and a bag of bananas. He looked at me\u2014soaked, shivering, clearly lost\u2014and said something in Kannada that I didn\u2019t understand. I said something in Hindi that he didn\u2019t understand. We looked at each other."),
    bodyPara("Then he handed me a banana."),
    bodyPara("This is India. You can be completely, hopelessly lost, and someone will hand you a banana. It won\u2019t solve your problem. But it will remind you that you\u2019re not alone, even when you are."),
    bodyPara("Through a combination of gestures, Google Translate (his phone, not mine\u2014mine was dead, remember), and what I can only call aggressive friendliness, he called his cousin who owned a homestay. The cousin arrived on a scooter. I sat behind him, holding my backpack with one hand and my dignity with the other, and we rode through the rain to a small house surrounded by coffee plants."),
    bodyPara("The homestay was a single room with a cot, a blanket that smelled like mothballs and comfort, and a window that looked out onto nothing because it was dark and raining. It cost Rs. 400. The cousin\u2019s wife made me rice and *sambar* at 10 p.m. without being asked, as if feeding stranded strangers was just what you did on a Tuesday night."),
    bodyPara("I charged my phone. I ate the rice. I stared at the ceiling."),
    bodyPara("And then I laughed."),
    bodyPara("Not because anything was funny. But because I was here\u2014in a stranger\u2019s house, in the wrong town, in the rain, eating the best *sambar* I\u2019d ever had\u2014and I was completely, thoroughly alive. The spreadsheet was meaningless. The plan was dead. And something better had replaced it: a story."),
    sceneBreak(),
    bodyFirst("The next two days were a masterclass in improvisation."),
    bodyPara("I woke up to discover that Makkandur was actually lovely. It wasn\u2019t on any tourist map, which meant there were no tourists. The coffee plantation behind the homestay was open for walking\u2014not as a \u201Ctour\u201D with a guide and a ticket, but as a plantation where you could just... walk. The owner\u2019s dog followed me for two hours. I named him Buddy. He didn\u2019t care."),
    bodyPara("I found a waterfall that wasn\u2019t on Google Maps. A local kid showed me the trail in exchange for nothing\u2014he just wanted someone to show. The waterfall was small, maybe ten feet, but I had it entirely to myself. I sat on a rock and let the sound fill my head until there was no room for Jira tickets or sprint retrospectives or anything else that had seemed important forty-eight hours ago."),
    bodyPara("I ate meals at the only restaurant in town\u2014a place with four tables and no menu. You sat down and they brought you what they\u2019d cooked. *Ragi mudde* one day. *Akki roti* the next. Everything tasted like it had been made by someone who loved cooking, not someone running a business."),
    bodyPara("On the last morning, the homestay cousin drove me to the right bus stop. He refused to take money for the ride. I tried to insist. He looked almost insulted. \u201CYou are a guest,\u201D he said, in careful English. \u201CGuests don\u2019t pay.\u201D"),
    bodyPara("I got on the bus to Bangalore. My spreadsheet sat untouched in my bag. I had visited zero of my planned attractions. I had seen no Instagram-famous abbeys. I had taken maybe ten photos, most of them blurry."),
    bodyPara("It was the best trip I\u2019d ever taken."),
    bodyPara("Here\u2019s what I learned, standing in that rain: the worst trips make the best stories. Solo travel competence isn\u2019t built through preparation\u2014it\u2019s built through incompetence. You get lost. You figure it out. You eat a stranger\u2019s banana. And the next time something goes wrong, you panic a little less."),
    bodyPara("My phone died on that trip and my life started."),
    ...tripCard("Coorg (or Wherever the Bus Takes You)", [
      ["Duration", "3 days (Thursday night\u2013Sunday from Bangalore)"],
      ["Budget", "Rs. 4,000\u20136,000 (bus + homestay + food)"],
      ["Best Season", "September\u2013March (monsoon is dramatic but slippery)"],
      ["One Tip", "Skip the famous spots. Stay at a local homestay. Let the host decide what you should see. They know their land better than TripAdvisor."],
    ]),
  ];
}

function chapter3() {
  return [
    ...chapterHeading(3, "The Art of the Long Weekend"),
    bodyFirst("It was January 2nd when I had the revelation that would change how I traveled for the rest of my life."),
    bodyPara("I was staring at my company\u2019s holiday calendar\u2014that sacred document HR sends every December, the one that working India studies with the intensity of a scholar decoding ancient manuscripts. Republic Day fell on a Thursday. Which meant if I took Friday off, I had a four-day weekend. Four days. That was enough for a Himalayan trek. That was enough for a Goa escape. That was enough for a train to Varanasi and back."),
    bodyPara("I pulled out a spreadsheet. (Yes, another spreadsheet. I\u2019m in IT. It\u2019s how we process emotions.)"),
    bodyPara("I mapped every holiday for the year against the days of the week. I identified what I now call \u201Csandwich days\u201D\u2014those lonely Mondays and Fridays sitting between a holiday and a weekend, begging to be taken off. I color-coded them: green for \u201Cfree long weekend,\u201D yellow for \u201Cone leave day needed,\u201D red for \u201Ctoo far from a weekend to exploit.\u201D"),
    bodyPara("The result was staggering. India gives you roughly fifteen to twenty public holidays a year, depending on your state and company. Most people see these as individual days off. I saw them as building blocks. With strategic use of just eight leave days, I could create six long weekends of four days each. That\u2019s twenty-four days of travel from eight days of leave. The rest were free."),
    bodyPara("My manager, to her credit, never questioned why all my leave requests fell on Mondays and Fridays. Maybe she didn\u2019t notice. Maybe she did and decided it wasn\u2019t worth the conversation. Either way, I became the guy who was always \u201Cjust back from somewhere.\u201D"),
    sceneBreak(),
    bodyFirst("The first long weekend I engineered was Republic Day, 2023."),
    bodyPara("Thursday was the holiday. I took Friday off. Saturday and Sunday were free. Four days. I booked a train to Hampi\u2014yes, Hampi again, because some places deserve a second visit, and also because the tickets were Rs. 385 in Sleeper Class and I am nothing if not financially responsible."),
    bodyPara("But this time was different. I wasn\u2019t the terrified first-timer from Chapter 1. I was a man with a system. I had a packing list refined over three trips. I had a power bank. I had downloaded podcasts for the train. I even had a small daypack inside my backpack, which is the solo traveler\u2019s equivalent of a final evolution."),
    bodyPara("The trip itself was unremarkable in the best possible way. I rented a bicycle and spent two days cycling between ruins, stopping whenever something caught my eye, eating when I was hungry, sleeping when I was tired. No itinerary. No agenda. Just four days of being a person instead of an employee."),
    bodyPara("On the train back, I met a woman who worked in HR at an MNC in Hyderabad. She was traveling with her three-year-old, heading to her parents\u2019 place in Hospet. We got talking. I told her about my long-weekend system."),
    bodyPara("She laughed. \u201CYou\u2019re not the first person to figure this out,\u201D she said. \u201CEvery Indian professional does this. We just don\u2019t talk about it.\u201D"),
    bodyPara("She was right. The Art of the Long Weekend is India\u2019s worst-kept secret. Half the country is quietly gaming the holiday calendar, and the other half is wondering why their colleagues are always \u201Cout of station.\u201D"),
    sceneBreak(),
    bodyFirst("Here\u2019s the thing about long weekends: they change your relationship with travel."),
    bodyPara("When you have two weeks of annual leave and you blow them all on one big international trip, travel becomes an event. It\u2019s something you save up for, plan for months, and then collapse from when you get back. It\u2019s wonderful, but it\u2019s also exhausting."),
    bodyPara("Long weekends make travel a *habit.* You\u2019re not escaping your life once a year\u2014you\u2019re weaving travel into your life every few weeks. You go smaller. You go closer. You stop needing travel to be epic and start letting it be ordinary in the best sense of the word."),
    bodyPara("A weekend in Pondicherry. A Thursday-to-Sunday in Hampi. A Friday-to-Monday in the Nilgiris. None of these are Instagram-worthy \u201Conce in a lifetime\u201D trips. But stacked together, they\u2019re a life lived with curiosity. And they cost less than your Netflix subscription for the year."),
    bodyPara("The HR woman on the train had one more piece of advice. \u201CThe trick,\u201D she said, her three-year-old asleep on her lap, \u201Cis to never feel guilty about it. You have the leave. The company gave it to you. Use it. The work will be there on Monday. It\u2019s always there on Monday.\u201D"),
    bodyPara("I\u2019ve never heard anything more true in my life."),
    ...tripCard("The Long Weekend Playbook", [
      ["Duration", "3\u20134 days (use sandwich days)"],
      ["Budget", "Rs. 3,000\u20138,000 depending on destination and distance"],
      ["Top 5 from Bangalore", "Hampi, Pondicherry, Coorg, Wayanad, Gokarna"],
      ["One Tip", "Book trains the day bookings open (120 days out for regular, 10 a.m. sharp). Set a phone alarm. Treat IRCTC like a concert ticket drop."],
    ]),
  ];
}

function chapter4() {
  return [
    ...chapterHeading(4, "The 3 AM Himalayan Mistake"),
    bodyFirst("My alarm went off at 3 a.m. in a tent that was approximately four degrees warmer than the air outside, which was approximately minus five degrees."),
    bodyPara("I lay in my sleeping bag, every cell in my body staging a democratic protest against movement. My toes had filed a formal complaint. My nose, the only part of me exposed to the air, had gone numb thirty minutes ago and was now operating on pure spite."),
    bodyPara("I was 12,500 feet above sea level, on a ridge somewhere between Dharamshala and the summit of Triund Hill, and I was questioning every decision I had ever made, starting with the one where I thought, \u201CA Himalayan trek over a long weekend\u2014how hard can it be?\u201D"),
    bodyPara("The answer, for the record, is: hard. Really hard. The kind of hard that makes you call your mother from a mountain and tell her you love her, not because you\u2019re in danger, but because altitude sickness and gratitude apparently activate the same part of the brain."),
    sceneBreak(),
    bodyFirst("It had started three days earlier in my Bangalore apartment, where I\u2019d watched a YouTube video titled \u201CTriund Trek: Easy Weekend Hike from Delhi!\u201D The exclamation mark should have been a warning."),
    bodyPara("The video showed a smiling man walking through pine forests, sitting at the summit with a cup of Maggi, and generally having the time of his life. It did not show the ninety-minute section where the trail turns into a near-vertical scramble over loose rocks. It did not show the altitude headache that starts at 10,000 feet and sits behind your eyes like an uninvited tenant. It did not show the moment at 2 a.m. when the temperature drops to the point where you can see your breath inside the tent."),
    bodyPara("But the video *did* show the sunrise from the summit. And that\u2014the Dhauladhar range, snow-capped, turning pink and gold in the first light of morning\u2014was the reason I was here. One image. That\u2019s all it takes to get an Indian professional on a plane."),
    bodyPara("I flew to Delhi on a Thursday night. Took an overnight bus to Dharamshala. Reached McLeod Ganj at 8 a.m., bleary-eyed and smelling like forty other people\u2019s sleep. I had one day to acclimate before the trek. I spent it eating momos, drinking lemon-ginger-honey tea, and telling myself that my fitness level was \u201Cadequate.\u201D It was not adequate. I could run 2K on a treadmill. The trek was 9 kilometers of continuous uphill at altitude. These are not the same thing."),
    sceneBreak(),
    bodyFirst("The trek began at 7 a.m. the next morning."),
    bodyPara("The first two hours were beautiful. Pine forests. Dappled sunlight. The sound of nothing except birds and my own increasingly labored breathing. I was keeping pace with a group of college students from Chandigarh who were playing Bollywood songs on a portable speaker, which I found annoying at first and then strangely comforting, because at least it meant other humans were suffering nearby."),
    bodyPara("At the three-hour mark, the trail changed. The gentle slope became a staircase of rocks. The pine forest thinned. The air thinned. My enthusiasm thinned. I stopped to catch my breath every fifty steps. Then every thirty. Then every twenty. The college students pulled ahead. Their music faded. I was alone with the mountain and the growing suspicion that I had made a terrible mistake."),
    bodyPara("The altitude headache started at 10,000 feet\u2014a dull pressure behind my eyes, like someone was gently but firmly pressing their thumbs into my skull. I drank water. I ate a Snickers bar. I told myself it was just dehydration. It wasn\u2019t just dehydration."),
    bodyPara("A porter passed me carrying what appeared to be an entire kitchen on his back\u2014gas cylinder, pots, bags of rice\u2014walking at twice my speed, in sandals, while I stood there in Rs. 4,000 trekking shoes, wheezing. He grinned at me. \u201C*Aaram se, bhai. Pahunch jaoge.*\u201D Take it easy, brother. You\u2019ll get there."),
    bodyPara("I wanted to hug him. Instead, I kept walking."),
    bodyPara("The summit appeared at 2 p.m.\u2014a wide, grassy ridge with the Dhauladhar range spread out in front of it like a wall of white. I dropped my backpack, sat on a rock, and cried. Not from sadness. Not from joy. From the sheer, overwhelming relief of stopping. My legs were shaking. My head was pounding. I was dehydrated, sunburned, and fairly certain I\u2019d lost a toenail."),
    bodyPara("And it was the most beautiful place I had ever seen."),
    bodyPara("The mountains didn\u2019t care about my designation, my annual appraisal, or my sprint velocity. They were just there\u2014ancient, enormous, indifferent. And sitting in front of them, small and sweating and slightly broken, I understood something that no office retreat had ever taught me: you don\u2019t find yourself on a mountain. You just find out what you\u2019re willing to suffer for."),
    sceneBreak(),
    bodyFirst("The 3 a.m. alarm, then."),
    bodyPara("I unzipped the tent and stepped out into a darkness so complete that for a moment I wasn\u2019t sure I had opened my eyes. Then, slowly, the stars appeared. Not the Bangalore stars\u2014those pale, shy things that peek through the light pollution. These were Himalayan stars. Violent, overwhelming, wall-to-wall stars, so many that the sky looked crowded."),
    bodyPara("I stood in the cold and looked up, and for the first time in my adult life, I felt genuinely small. Not metaphorically small, not the Instagram-caption kind of \u201Cfeeling small in a big world.\u201D Actually, physically, cosmically small. A warm speck on a cold rock, looking at light that left its source before my company was founded."),
    bodyPara("The sunrise started at 5:30 a.m. The snow peaks turned pink first\u2014just the tips, like someone had dipped them in rose milk. Then gold. Then blazing white as the sun crested the ridge behind me. The Dhauladhar range, all of it, lit up like a stage. And in front of it, a sea of clouds filling the valley below, so you couldn\u2019t see the ground at all\u2014just mountains floating on clouds, and you, floating with them."),
    bodyPara("I took exactly one photo. Then I put my phone away and just watched."),
    bodyPara("The college students from Chandigarh were up too. One of them offered me chai from a thermos. It was lukewarm and too sweet and it was the best chai I\u2019d ever had."),
    bodyPara("Type 2 fun, they call it. Terrible during. Incredible after. I was freezing, exhausted, and slightly altitude-sick, and I have never been happier."),
    ...tripCard("Triund (or Any Beginner Himalayan Trek)", [
      ["Duration", "4 days (Thursday night flight\u2013Monday morning return)"],
      ["Budget", "Rs. 8,000\u201312,000 (flights + bus + tent + food)"],
      ["Best Season", "March\u2013May or September\u2013November (avoid monsoon and deep winter)"],
      ["One Tip", "Carry a 0\u00B0C sleeping bag even in spring. The mountain doesn\u2019t care about the weather forecast. And start walking before sunrise\u2014the afternoon sun at altitude will finish you."],
    ]),
  ];
}

function chapter5() {
  return [
    ...chapterHeading(5, "Temple Run: A South Indian Food Coma"),
    bodyFirst("The first filter coffee arrived at 5:47 a.m."),
    bodyPara("I know the exact time because I was in Madurai, sitting on the steps outside the Meenakshi Temple, and the temple bells had just started their morning call. A man with a steel cart and a serious expression poured coffee from one tumbler to another in a long, practiced arc\u2014the frothy stream catching the first light\u2014and handed me a stainless steel tumbler so hot I nearly dropped it."),
    bodyPara("I took a sip. The coffee was dark, strong, sweet with jaggery, and tasted like South India had concentrated its entire personality into a single cup. If Bangalore\u2019s startup culture ran on cold brew and oat milk, Madurai ran on this\u2014real coffee, made by a man who\u2019d been making it since before I was born, served in steel because steel is forever."),
    bodyPara("I was four days into a trip that I\u2019d originally titled \u201CSouth India Temple Trail\u201D in my spreadsheet but which had, by Day 2, become \u201CSouth India Food Coma with Occasional Temple Visits.\u201D"),
    sceneBreak(),
    bodyFirst("The trip had started in Chennai, where a colleague\u2019s mother had insisted I eat at a place called Rayar\u2019s Mess in Mylapore."),
    bodyPara("\u201CYou cannot go to Chennai and not eat at Rayar\u2019s,\u201D she had said, with the quiet intensity of someone issuing a non-negotiable life instruction. \u201CGet there before 8 a.m. or don\u2019t bother.\u201D"),
    bodyPara("I got there at 7:30 a.m. The restaurant\u2014and I use that word loosely, because it was a small room with steel tables and no air conditioning\u2014was already full. I was handed a banana leaf. Without being asked what I wanted, a server appeared and ladled sambar. Then rasam. Then three vegetables, two chutneys, rice, papad, and a *payasam* that made me briefly consider relocating to Chennai permanently."),
    bodyPara("The entire meal cost Rs. 80. Eighty rupees. For a meal that would have taken a Bangalore restaurant Rs. 500 and a thirty-minute wait to approximate poorly."),
    bodyPara("This became the pattern. Every town I visited\u2014Chennai, Kanchipuram, Madurai, Rameswaram\u2014the temples were stunning, ancient, architecturally mind-blowing. But the food was what I thought about on the bus between towns. The *idli* at a highway stall that was softer than any I\u2019d had in a city. The *chettinad chicken* in a Karaikudi restaurant so hot that I cried, genuinely cried, and ordered a second plate. The *kothu parotta* at midnight in Madurai, torn and tossed on a massive iron griddle, mixed with egg and spices, served on newspaper."),
    bodyPara("I had come to see temples. I stayed for the food."),
    sceneBreak(),
    bodyFirst("There is a particular kind of patience that South India teaches you."),
    bodyPara("In Rameswaram, I joined the queue to enter the Ramanathaswamy Temple\u2019s corridor of sacred wells. The queue moved at the speed of continental drift. I stood behind a family from Kerala\u2014grandmother, parents, two kids\u2014who were in no hurry whatsoever. The grandmother was telling the kids a story about Rama. The father was on his phone, but not impatiently\u2014just scrolling, waiting, existing."),
    bodyPara("In Bangalore, I would have been checking the time. Here, I realized there was no time to check. The temple didn\u2019t have opening hours in any meaningful sense. It existed. You visited. The queue moved when the queue moved."),
    bodyPara("When I finally reached the wells, a priest poured water over my head from each one\u2014twenty-two wells, twenty-two dousings, each colder than the last. By the end, I was soaked, shivering, and laughing. The grandmother from the queue caught my eye and smiled. She didn\u2019t say anything. She didn\u2019t need to."),
    bodyPara("South India taught me something my calendar-hack brain resisted: some experiences can\u2019t be optimized. You can\u2019t speed-run a temple. You can\u2019t hack a banana leaf meal. The coffee takes as long as the coffee takes. And the thing you came for\u2014the awe, the peace, the full-body feeling of being somewhere sacred\u2014only arrives when you stop trying to make it arrive."),
    bodyPara("On the last evening, in Rameswaram, I walked to the beach where the Bay of Bengal meets the Indian Ocean. The sand was warm. The sky was turning that particular shade of violet that happens only in the minutes between sunset and night. Fishermen were dragging boats up the shore. A group of pilgrims were performing evening prayers at the water\u2019s edge."),
    bodyPara("I sat down and did absolutely nothing. Not meditating\u2014I\u2019m not that person. Just sitting. Digesting. (Both the *chettinad* chicken and the fact that India, my own country, could still make me feel like a tourist.)"),
    ...tripCard("South India Temple & Food Trail", [
      ["Duration", "5 days (Chennai\u2013Kanchipuram\u2013Madurai\u2013Rameswaram)"],
      ["Budget", "Rs. 8,000\u201312,000 (trains + budget hotels + all the food you can eat)"],
      ["Best Season", "October\u2013March (summers are genuinely punishing)"],
      ["One Tip", "Eat where the locals eat, not where Google Maps tells you. If a restaurant has no English signboard and a queue at 7 a.m., you\u2019ve found the right place."],
    ]),
  ];
}

function chapter6() {
  return [
    ...chapterHeading(6, "Sleeper Class Diaries"),
    bodyFirst("The thing about Indian trains is that they are not a mode of transportation. They are a parallel civilization."),
    bodyPara("I know this because I once spent thirty-eight hours on the Vivek Express\u2014not by choice, but because I\u2019d booked a ticket to Dibrugarh, Assam, and the only available option was a Sleeper Class berth on what is, officially, India\u2019s longest train route. \u201CIt\u2019ll be an experience,\u201D I told myself, in the same tone people use before doing things they will later describe as \u201Ccharacter-building.\u201D"),
    bodyPara("Let me walk you through the ecosystem of an Indian Sleeper Class compartment, for the uninitiated."),
    bodyPara("**The Berths:** There are eight per section\u2014side upper, side lower, upper, middle, lower, and three more across the aisle. The lower berth is prime real estate: it\u2019s the only one where you can sit during the day, which means the person who has it controls the social dynamics of the entire section. The upper berth is for people who want to sleep at 6 p.m. and not interact with humanity. The middle berth is an engineering compromise that satisfies no one."),
    bodyPara("I had the middle berth."),
    bodyPara("**The Uncle:** Every Indian train section has one. He\u2019s usually lower berth (because he booked three months in advance, like a responsible person). He\u2019s carrying a bag that contains more food than a small restaurant. Within the first twenty minutes, he will have learned your name, your job, your salary range (through clever indirect questioning), your marital status, and your opinion on the current government. He will then share his own opinions, which are always delivered with the confidence of a man who reads exactly one newspaper."),
    bodyPara("My Uncle was from Silchar. His name was Bordoloi-da. He was a retired bank manager. He had packed: four parathas, aloo sabzi in a steel container, two boiled eggs, a packet of Haldiram\u2019s mixture, three bananas, and biscuits. All of this was for a thirty-eight-hour journey, and all of it was offered to me within the first hour."),
    bodyPara("\u201C*Kha lo, beta.* You young people don\u2019t eat properly.\u201D"),
    bodyPara("This is the Indian train social contract. Strangers will feed you. In return, you listen to their stories. It\u2019s a fair deal. Some of the best conversations of my life have happened in Sleeper Class with people I will never see again."),
    bodyPara("**The Chai:** Every forty-five minutes, a vendor walks through the compartment performing what can only be described as a one-man musical: \u201C*CHAICHAICHAICHAICHAI.*\u201D The chai costs Rs. 10. It comes in a tiny plastic cup. It is, without exception, the best chai you\u2019ve ever tasted. I don\u2019t know what they put in train chai. I suspect it\u2019s a combination of ginger, cardamom, condensation from the railway fog, and something mildly addictive that the government hasn\u2019t classified yet."),
    bodyPara("I drank seven cups on that journey. I regret nothing."),
    bodyPara("**The Night:** Sleeping on an Indian train is an acquired skill, like parallel parking or pretending to enjoy networking events. The middle berth requires you to fold yourself into a shape that yoga doesn\u2019t have a name for. The train rocks\u2014not gently, like a cradle, but aggressively, like it\u2019s trying to shake you off. The sounds: wheels on tracks (rhythmic), snoring from upper berth (arrhythmic), a baby crying three compartments away (eternal), and the occasional station announcement at 2 a.m. that wakes everyone up for a town none of them are getting off at."),
    bodyPara("And yet."),
    bodyPara("There\u2019s a moment, usually around midnight, when you\u2019re lying on your berth with the window slightly open, and the train is passing through somewhere dark\u2014a village, a field, nothing\u2014and the cool air hits your face, and the rhythm of the wheels becomes your heartbeat, and you think: *This is the most alive I\u2019ve felt in months.*"),
    bodyPara("I don\u2019t know why it works. Maybe it\u2019s the forced disconnection\u2014no Wi-Fi, minimal signal, nothing to doom-scroll. Maybe it\u2019s the democracy of it\u2014a CEO and a college student sharing the same section, eating the same Rs. 10 chai, equally uncomfortable on the same berths. Maybe it\u2019s the simple miracle that this steel tube is carrying a thousand stories across a subcontinent, and you\u2019re one of them."),
    bodyPara("Bordoloi-da told me about his daughter. She was a software engineer in Pune. She called every Sunday. He was traveling to see her because she\u2019d just had a baby\u2014his first grandchild. He showed me the photos. He\u2019d bought a tiny kurta from Silchar market. He was planning to stay for two months. His eyes were wet when he talked about it."),
    bodyPara("I told him about my job. About the Jira tickets and the sprint retrospectives. About Hampi. About the feeling of standing in front of something ancient and realizing you\u2019re not that important. He listened the way only retired men on trains listen\u2014completely, without checking their phone, without waiting for their turn to speak."),
    bodyPara("\u201CTravel is good,\u201D he said finally, unwrapping his third paratha. \u201CBut the best part of travel is coming home and knowing where home is.\u201D"),
    bodyPara("He offered me a paratha. I took it."),
    sceneBreak(),
    bodyFirst("At 4 a.m., the train stopped at a station I\u2019d never heard of."),
    bodyPara("I climbed down to the platform, bought chai, and stood in the predawn chill watching coolies and passengers and dogs navigate the controlled chaos of an Indian railway platform. A man was asleep on a bench with a newspaper over his face. A family was sharing a meal on the platform floor, cross-legged, laughing about something. The station clock was broken\u2014stuck at 3:15, which felt philosophically appropriate."),
    bodyPara("A boy, maybe twelve, was selling *vada pav* from a basket. He looked half asleep. I bought two\u2014one for me, one for the dog that had been following me along the platform with the quiet confidence of an animal who knew how this worked. The boy grinned. The dog ate the *vada pav* in one bite. The train whistled."),
    bodyPara("I got back on the train. Bordoloi-da was asleep, the tiny kurta bag clutched to his chest."),
    bodyPara("The train started moving. India rolled past in the dark."),
    bodyPara("I set my phone alarm for the next station. Then I closed my eyes and let the tracks carry me."),
    ...tripCard("Long-Distance Indian Trains", [
      ["Duration", "As long as your courage allows (12\u201338 hours)"],
      ["Budget", "Sleeper Class: Rs. 400\u2013800. 3AC: Rs. 800\u20131,500."],
      ["Best Routes", "Delhi\u2013Jaisalmer (overnight; desert sunrise). Bangalore\u2013Goa (coastal). Kalka\u2013Shimla toy train (UNESCO). NJP\u2013Darjeeling DHR."],
      ["One Tip", "Book on IRCTC 120 days out. Set an alarm for 10 a.m. on booking day. Bring a padlock for your bag, a bedsheet (trust me), and zero expectations about the toilet."],
    ]),
  ];
}

function chapter7() {
  return [
    ...chapterHeading(7, "The Rajasthan Road Trip"),
    bodyFirst("The car\u2019s AC died somewhere between Jodhpur and Jaisalmer. We had 200 kilometers of desert ahead, three bottles of warm water, and a friendship about to be tested."),
    bodyPara("\u201CWe\u201D was me, Arun, and Nikhil\u2014two friends from college who, like me, worked desk jobs in Bangalore and, like me, had reached the point where their annual leave was either use-it-or-lose-it. We\u2019d planned this trip for three months. We\u2019d booked a rental car, mapped out a route\u2014Jaipur, Jodhpur, Jaisalmer, back to Jaipur\u2014and created a shared Google Doc titled \u201CRajasthan Plan\u201D that, by the time we left, had forty-seven comments and three unresolved arguments."),
    bodyPara("The arguments were about: (1) whether to stay in hostels or hotels, (2) whose music would play in the car, and (3) Jaisalmer camel safari vs. Jaisalmer sand dunes sunset. These seem trivial now. They were not trivial at kilometer 450, in a car without AC, in forty-three-degree heat, with Nikhil insisting on playing the same Prateek Kuhad album for the third consecutive hour."),
    sceneBreak(),
    bodyFirst("Travel with friends, I have learned, is the best possible stress test for a relationship."),
    bodyPara("Solo travel reveals you to yourself. Group travel reveals you to others\u2014and them to you. You discover who\u2019s flexible and who\u2019s rigid. Who handles discomfort with humor and who handles it with complaints. Who wants to plan every hour and who wants to wander. And you discover all of this in a confined space, at high temperatures, on limited sleep, with no escape."),
    bodyPara("In Jaipur, we discovered that Arun could not eat spicy food. This was a problem because Rajasthani food is approximately 60 percent chili and 40 percent ghee. He spent the first two days ordering butter naans and paneer butter masala while Nikhil and I ate *laal maas*\u2014a Rajasthani mutton curry so red and fiery that the waiter asked us twice if we were sure. We were sure. We regretted it. We ordered it again the next day."),
    bodyPara("In Jodhpur, we discovered that Nikhil was a morning person and I was not. He wanted to watch the sunrise from Mehrangarh Fort at 5:30 a.m. I wanted to sleep until the sun found me. We compromised: he went alone and took photos, and I looked at them over breakfast while pretending I wished I\u2019d been there."),
    bodyPara("The fort, when I finally visited at the civilized hour of 10 a.m., was worth the argument. Mehrangarh sits on top of Jodhpur like a crown\u2014massive, golden, absurdly grand. Below it, the Blue City spread in every direction, a sea of indigo houses that looked like someone had spilled paint across the desert. I stood at the ramparts and understood, for the first time, why Rajasthani kings built forts on cliffs. It wasn\u2019t just defense. It was ego. It was looking out at the world and saying, *This is mine.*"),
    sceneBreak(),
    bodyFirst("The desert, though\u2014the desert was where the trip became something else."),
    bodyPara("We\u2019d booked a camel safari out of Jaisalmer. Not the tourist kind with fifteen camels in a line and a guide shouting through a megaphone. A small outfit. Three camels. One guide named Raju who spoke four languages and had been crossing the Thar since he was eight. We rode for three hours into the dunes."),
    bodyPara("I should tell you that riding a camel is nothing like riding a horse. A camel moves with a lurching, side-to-side motion that your body interprets as an emergency. Your thighs burn within twenty minutes. Your lower back files a complaint within thirty. And the camel itself\u2014a magnificent, contemptuous animal\u2014makes it very clear through its body language that it tolerates you, but does not respect you."),
    bodyPara("My camel\u2019s name was Munna. Munna did not like me. This was evident from the moment I attempted to mount him and he turned his head 180 degrees to stare at me with what I can only describe as disdain."),
    bodyPara("But the dunes. The dunes made everything worth it. As the sun dropped toward the horizon, the sand turned from yellow to gold to copper to deep, molten orange. The shadows of the dunes stretched into infinity. There was no sound except wind and the soft padding of camel feet on sand. Raju made chai on a small fire, squatting in the sand, his hands moving with the muscle memory of a thousand desert nights."),
    bodyPara("Arun, Nikhil, and I sat in a row on a dune, drinking chai, watching the desert swallow the sun. Nobody spoke. We didn\u2019t need to. This was what we\u2019d come for\u2014not the forts, not the food, not even the road trip. This. Three friends, a desert, a silence that felt like a gift."),
    bodyPara("That night, we slept under the stars on cots that Raju set up on the sand. The Milky Way was visible\u2014actually visible, a cloudy river of light across the sky. Nikhil pointed out constellations. Arun snored. A desert fox yipped somewhere in the distance."),
    bodyPara("At some point, I realized I hadn\u2019t checked my phone in twelve hours. Not because there was no signal (there wasn\u2019t), but because for the first time in months, I didn\u2019t want to."),
    bodyPara("The next morning, the AC was still broken. Nikhil played Prateek Kuhad again. Arun ate another butter naan. And somehow, after the desert, none of it mattered. We drove the 200 kilometers back to Jaipur with the windows down, the desert wind in our hair, and a friendship that had been tested by heat and survived."),
    ...tripCard("Rajasthan Road Trip", [
      ["Duration", "6\u20137 days (Jaipur\u2013Jodhpur\u2013Jaisalmer\u2013Jaipur)"],
      ["Budget", "Rs. 15,000\u201320,000 per person (car rental split three ways + hotels + food + camel safari)"],
      ["Best Season", "October\u2013February (DO NOT go in summer unless you enjoy suffering)"],
      ["One Tip", "Book the camel safari through a local, not a hotel. Ask for an overnight dunes trip. And bring a cushion for the car\u2014your back will thank you after 1,500 kilometers."],
    ]),
  ];
}

function chapter8() {
  return [
    ...chapterHeading(8, "The Northeast Nobody Told Me About"),
    bodyFirst("I\u2019d traveled to eight countries before I went to Meghalaya. Nothing prepared me for it."),
    bodyPara("Not the mountains\u2014I\u2019d seen those in Himachal. Not the waterfalls\u2014I\u2019d seen those in Coorg. What I wasn\u2019t prepared for was the feeling of being a foreigner in my own country. Of looking at a landscape, a culture, a people, and thinking: *This is India?*"),
    bodyPara("I flew into Guwahati on a Thursday evening. The plan was to hire a cab to Shillong, and from there explore Cherrapunji and the living root bridges. Five days, four nights. Simple."),
    bodyPara("Except India\u2019s northeast is never simple. It is, if anything, the country\u2019s longest-running rebuttal to the idea that India is one thing."),
    sceneBreak(),
    bodyFirst("The drive from Guwahati to Shillong took three hours and crossed what felt like three countries."),
    bodyPara("The plains of Assam\u2014flat, green, humid\u2014gave way to winding mountain roads within forty-five minutes. The vegetation changed. The faces changed. The signs changed from Hindi and Assamese to Khasi, a language I couldn\u2019t even identify, let alone read. The houses were different\u2014pitched roofs, wooden frames, gardens with flowers I\u2019d never seen. This was not the India of Bollywood or IT parks or *dal-roti.* This was something else entirely."),
    bodyPara("Shillong itself felt like a small European hill town that had been raised on rice and pork. Clean streets. Coffee shops playing jazz. A police bazaar that sold everything from secondhand books to smoked meat. Young people in band T-shirts, speaking English and Khasi interchangeably. A local bar where a band was playing Hendrix covers, and playing them *well.*"),
    bodyPara("I realized, sitting in that bar with a glass of local rice beer, that I knew nothing about this place. I had an engineering degree, an MBA, a passport with stamps from Singapore and Thailand and Dubai\u2014and I couldn\u2019t name five cities in the northeast. I couldn\u2019t point to Nagaland on a map. I didn\u2019t know that Meghalaya meant \u201CAbode of Clouds\u201D or that it was a matrilineal society\u2014one of the few in the world where property passes through the mother\u2019s line."),
    bodyPara("I felt ashamed. And then I felt grateful that I\u2019d come."),
    sceneBreak(),
    bodyFirst("Cherrapunji\u2014or Sohra, as the locals call it\u2014is the wettest place on earth by some measures."),
    bodyPara("The drive there was like entering a cloud. Literally. At one point, the car was inside a cloud, visibility dropped to ten feet, and the driver\u2014a Khasi man named Bah Kenny who had the calm demeanor of someone who did this daily\u2014simply slowed down and kept going. \u201CThis is normal,\u201D he said. \u201CYou are in the clouds now.\u201D"),
    bodyPara("I was in the clouds. I thought about my cubicle."),
    bodyPara("The living root bridges were a two-hour trek from the nearest road. Not a manicured trail with signposts\u2014a steep, muddy descent through dense subtropical forest, with stone steps carved by the Khasi War community over generations. My trekking shoes, which had survived Triund, were immediately caked in mud. My water bottle fell out of my bag and bounced down thirty steps before a local kid caught it and tossed it back with a grin."),
    bodyPara("And then I saw it."),
    bodyPara("The double-decker root bridge. Two tiers of living roots, woven and trained across a river over centuries by the Khasi people, using the roots of rubber fig trees. The roots were thick as my arm, twisted and interlocked, forming a bridge so solid that fifty people could stand on it. And it was alive. Not a monument. Not a ruin. A living, growing, breathing piece of engineering that had been under construction for longer than most nations have existed."),
    bodyPara("I stood on the bridge and listened to the river below, and the forest around, and felt something I hadn\u2019t felt since Hampi\u2014that sense of *presence.* Of being in a place that mattered. But this was different from Hampi. Hampi was ancient and abandoned. This was ancient and *alive.* The bridge was still growing. The community still maintained it. The roots were still reaching."),
    bodyPara("A woman from the village was crossing the bridge with a basket of betel nuts on her head. She walked across it like it was a sidewalk\u2014no hesitation, no awe, just the daily commute across a bridge that Instagram influencers would fly 2,000 kilometers to photograph. For her, it was just the way home."),
    bodyPara("That contrast\u2014between my wonder and her ordinariness\u2014stayed with me for the rest of the trip. It taught me something about travel that I\u2019m still processing: the most extraordinary places in the world are ordinary to someone. And the fact that they\u2019re ordinary\u2014that someone crosses a living root bridge to buy groceries\u2014makes them more extraordinary, not less."),
    bodyPara("On the last night, Bah Kenny took me to his house for dinner. His wife made *jadoh*\u2014a Khasi rice and pork dish cooked with local spices I couldn\u2019t name. His daughter, who was studying for her tenth-standard exams, asked me about Bangalore. \u201CIs it true everyone works in IT?\u201D she asked. \u201CIs it true the traffic is terrible?\u201D"),
    bodyPara("I laughed. \u201CYes to both.\u201D"),
    bodyPara("She nodded seriously. \u201CI want to visit someday,\u201D she said. \u201CBangalore is so different from here.\u201D"),
    bodyPara("I looked around\u2014at the wooden house, the cloud-wrapped mountains outside the window, the plate of *jadoh* in front of me\u2014and thought: yes. Yes, it is. And that\u2019s the whole point."),
    ...tripCard("Meghalaya", [
      ["Duration", "5 days (fly Thursday night, return Tuesday)"],
      ["Budget", "Rs. 12,000\u201318,000 (flights to Guwahati + cab + homestays + food)"],
      ["Best Season", "October\u2013April (monsoon is spectacular but treacherous for trekking)"],
      ["One Tip", "Stay in a local homestay, not a hotel. The Khasi people are warm, proud hosts. And eat everything they offer\u2014especially the smoked pork."],
    ]),
  ];
}

function chapter9() {
  return [
    ...chapterHeading(9, "Goa Without the Party"),
    bodyFirst("Everyone told me Goa was about parties. They were wrong. Goa is about the Tuesday morning when the tourists leave."),
    bodyPara("I arrived in Goa on a Tuesday. This was deliberate. Not because I\u2019m antisocial (though ask my Slack messages and you might get a different answer), but because someone on Reddit had posted a thread titled \u201CThe Best Time to Visit Goa Is Midweek\u201D and it had fundamentally altered my understanding of the place."),
    bodyPara("The argument was simple: Saturday-to-Monday Goa is a performance. Bangalore and Mumbai descend in buses, the beaches fill with selfie sticks, the shacks charge double, and \u201CGoa vibes\u201D become a competitive sport. Tuesday-to-Thursday Goa is a different place entirely. The beaches are empty. The shacks are half-price. The locals emerge. And the thing that makes Goa actually special\u2014its Portuguese heritage, its food, its quiet, its light\u2014becomes visible again."),
    bodyPara("I took a Thursday off (one leave day, four-day weekend\u2014the system works) and took an overnight bus from Bangalore. I woke up at 6 a.m. to the sight of palm trees and red laterite and the particular quality of Goan light that makes everything look like it\u2019s been run through a warm Instagram filter, except it\u2019s real."),
    sceneBreak(),
    bodyFirst("My first stop was not a beach."),
    bodyPara("It was Fontainhas\u2014the old Portuguese quarter in Panaji. Narrow streets, painted houses in mustard yellow and sea blue and faded pink, bougainvillea spilling over walls, a chapel at every corner. I walked for two hours and met exactly four other tourists. A man was painting his house\u2014literally standing on a ladder, brush in hand, touching up the turquoise facade. He waved at me. I waved back. This felt like a country I\u2019d never been to."),
    bodyPara("The history was everywhere. Goa was Portuguese for 450 years\u2014longer than it\u2019s been Indian. The churches in Old Goa\u2014the Basilica of Bom Jesus, the Se Cathedral\u2014are massive, ornate, European in a way that feels surreal when you step outside and see an auto-rickshaw and a guy selling coconuts. The collision of cultures is not subtle. It\u2019s in the food (vindaloo is Portuguese), the architecture (balc\u00E3os, those covered porches), even the names (D\u2019Souza, Fernandes, Pinto)."),
    bodyPara("At lunch, I found a family-run restaurant in a village called Assagao. No signboard. No Google listing. Just a woman named Maria who cooked fish curry rice in a kitchen that was also her living room. The curry was made with kokum and coconut, the fish was that morning\u2019s catch, and the rice was red. It cost Rs. 150. I ate in silence, listening to the ceiling fan and the crows outside, and thought: *this* is Goa."),
    sceneBreak(),
    bodyFirst("The next morning, I went to a beach. But the right one."),
    bodyPara("Not Baga. Not Calangute. I went to Galgibaga, in South Goa\u2014a beach so quiet that I briefly wondered if it was closed. It wasn\u2019t. It was just Tuesday. The sand was white, the water was the kind of blue-green that travel brochures lie about, and the only other living beings were two crows and a dog who had clearly achieved a level of spiritual enlightenment I could only aspire to."),
    bodyPara("I swam. I lay on the sand. I read fifty pages of a book I\u2019d been meaning to read for six months. Nobody tried to sell me anything. Nobody played EDM from a Bluetooth speaker. The silence was so complete that I could hear the waves individually\u2014each one arriving, pausing, retreating."),
    bodyPara("In the afternoon, I rented a scooter and drove to a spice plantation in Ponda. A guide named Thomas walked me through acres of cardamom, pepper, cinnamon, and nutmeg, explaining each plant with the enthusiasm of someone who genuinely loved his job. At the end, they served a traditional Goan lunch on a banana leaf\u2014*xacuti*, *cafreal*, sol kadhi, and *bebinca* for dessert. The *bebinca* alone\u2014a layered Goan dessert that takes hours to make, each layer baked individually\u2014was worth the trip."),
    bodyPara("On the last evening, I sat at a *toddy* shop in a village near Palolem. *Toddy*\u2014fermented coconut sap\u2014is Goa\u2019s true drink. Not feni (too strong) and definitely not the mass-market beer of North Goa\u2019s shacks. *Toddy* is mild, slightly sweet, slightly sour, and tastes like the tree it came from. The shop was a shack with four plastic chairs and a view of a paddy field. An old man was singing *fado*\u2014Portuguese folk music\u2014in a voice that carried across the field and disappeared into the evening."),
    bodyPara("I\u2019d been to Goa before\u2014twice, in college, for the parties. I remembered almost nothing from those trips except hangovers and arguments about splitting the bill. This trip\u2014the quiet one, the Tuesday one, the one with no plan and no agenda\u2014I remember everything."),
    bodyPara("Every overhyped destination has a quiet side. You just have to go on a Tuesday."),
    ...tripCard("Offbeat Goa", [
      ["Duration", "3\u20134 days (Tuesday\u2013Friday is ideal)"],
      ["Budget", "Rs. 6,000\u201310,000 (bus + guesthouse + scooter rental + food)"],
      ["Best Season", "November\u2013February (skip the December-January peak if possible)"],
      ["One Tip", "Stay in South Goa\u2014Agonda, Palolem, or a village homestay near Canacona. Rent a scooter, not a car. And eat at places with no English menu."],
    ]),
  ];
}

function chapter10() {
  return [
    ...chapterHeading(10, "The Trip That Cost Less Than Friday Dinner"),
    bodyFirst("My total spend for a five-day Himachal trip was Rs. 4,800. My team\u2019s Friday dinner at that fancy place in Koramangala was Rs. 5,200 (split four ways, so Rs. 1,300 each, but still)."),
    bodyPara("I know this because I track every trip\u2019s expenses in a Google Sheet. This is either the most or least romantic thing about me, depending on who you ask. I\u2019ve been told it\u2019s \u201Cvery engineer brain.\u201D I\u2019ve also been told it\u2019s the reason I\u2019m single. Both are probably true."),
    bodyPara("But the spreadsheet doesn\u2019t lie. And what it tells me, trip after trip, is this: India is the most absurdly affordable country to travel in if you travel like an Indian, not like a tourist."),
    bodyPara("The Himachal trip\u2014five days, solo, Bangalore to Delhi to Bir to Barot to Mandi and back\u2014broke down like this:"),
    bodyPara("Flights: Rs. 0. I used credit card points I\u2019d accumulated over a year. (This is the one part that requires advance planning. The rest is pure improvisation.)"),
    bodyPara("Delhi to Bir: Rs. 650. Overnight HRTC Volvo bus. Booked on redBus."),
    bodyPara("Accommodation: Rs. 1,200 total for five nights. Three nights in hostels (Rs. 300/night for a dorm bed in Bir and Barot). Two nights at a homestay in Mandi (Rs. 150/night\u2014and yes, you read that right, the host was a retired schoolteacher who rented out a room and included *parathas* with breakfast)."),
    bodyPara("Food: Rs. 1,500 total. This is the part people don\u2019t believe. But when you eat at roadside *dhabas,* local *thali* places, and homestays, a full meal is Rs. 60\u2013100. That\u2019s three meals a day for Rs. 250. Over five days, that\u2019s Rs. 1,250, with Rs. 250 left over for chai, biscuits, and the occasional Maggi at a mountain caf\u00E9 (Rs. 40, always worth it)."),
    bodyPara("Transport (local): Rs. 1,450. Local buses in Himachal are a revelation. They cost almost nothing (Bir to Barot was Rs. 85, for a three-hour ride through a valley so beautiful that I forgot to take photos). Plus a few shared autos and one hitchhiked ride with a truck driver named Pappu who was delivering apples and had opinions about cricket."),
    sceneBreak(),
    bodyFirst("The key to budget travel in India isn\u2019t deprivation. It\u2019s a shift in mindset."),
    bodyPara("Tourist infrastructure\u2014boutique hotels, guided tours, fixed menus in English\u2014is expensive because it\u2019s designed for people who want India without the uncertainty. And that\u2019s fine, if that\u2019s what you want. But the moment you step off that track\u2014eat where locals eat, sleep where locals sleep, travel how locals travel\u2014the prices collapse and the experiences multiply."),
    bodyPara("In Barot, I found a trout farm run by a Himachali family. For Rs. 200, they caught a trout from the pool, grilled it on the spot with salt and lime, and served it with rice. I sat on the bank of a river that was so clear I could count the stones at the bottom. That meal\u2014fresh trout, river sounds, mountain air\u2014is one of the best I\u2019ve ever had. No Bangalore restaurant has come close."),
    bodyPara("In Bir\u2014India\u2019s paragliding capital\u2014I skipped the paragliding (Rs. 2,500, and I\u2019m afraid of heights) and instead spent two days walking through the tea gardens and Tibetan settlements. Free. The Chokling Monastery had a meditation hall that anyone could sit in. I sat for an hour. Not meditating\u2014just sitting. (I know I keep saying this. But sitting and doing nothing in beautiful places is genuinely my primary travel activity.)"),
    bodyPara("The retired schoolteacher in Mandi\u2014Mr. Sharma\u2014taught me how to make Himachali *siddu,* a steamed stuffed bread that his wife prepared every morning. He was seventy-two. He\u2019d been a teacher for forty years. His students called him on his birthday every year, even the ones who\u2019d moved abroad. He showed me the birthday messages on his phone, scrolling through them with the slow pride of a man who knew he\u2019d mattered."),
    bodyPara("None of this cost more than a few hundred rupees. All of it was worth more than anything I\u2019ve bought at full price."),
    bodyPara("Here\u2019s the thing: budget travel in India isn\u2019t about being cheap. It\u2019s about being *close.* When you stay at a homestay, you\u2019re in someone\u2019s life. When you eat at a *dhaba,* you\u2019re eating what the cook eats. When you take a state transport bus, you\u2019re on the same bus as the people who live there. The money you save is a bonus. The real currency is proximity."),
    ...tripCard("Ultra-Budget Himachal", [
      ["Duration", "5 days (Thursday night flight/bus\u2013Tuesday return)"],
      ["Budget", "Rs. 4,000\u20136,000 (with flight points) or Rs. 7,000\u201310,000 (without)"],
      ["Best Season", "April\u2013June or September\u2013November"],
      ["One Tip", "Learn three phrases in Hindi (or Pahari if you can): \u201CKitna hua?\u201D (How much?), \u201CKhana mil jayega?\u201D (Can I get food?), and \u201CYahan se bus kab hai?\u201D (When\u2019s the next bus from here?). These three sentences will get you anywhere."],
    ]),
  ];
}

function chapter11() {
  return [
    ...chapterHeading(11, "The Trip That Almost Made Me Quit"),
    bodyFirst("I was standing at Langza, a village in Spiti Valley at 14,500 feet, looking at a Buddha statue that overlooked the entire valley, when my phone rang."),
    bodyPara("It was my manager. It was a Sunday. It was 7 a.m."),
    bodyPara("\u201CHey,\u201D she said, with the casual urgency of someone about to ruin your morning. \u201CWe need to talk about the Q2 deliverables. The client escalated last night. Can you join a call at 9?\u201D"),
    bodyPara("I looked at the Buddha. The Buddha looked at the mountains. The mountains looked at the sky. None of them seemed concerned about Q2 deliverables."),
    bodyPara("\u201CI\u2019m in Spiti,\u201D I said. \u201CThe signal drops in twenty minutes. And I\u2019m on leave.\u201D"),
    bodyPara("There was a pause. The kind of pause that, in corporate India, means: *I acknowledge your leave, but I don\u2019t care.*"),
    bodyPara("\u201CJust thirty minutes,\u201D she said. \u201CYou can dial in from wherever you are.\u201D"),
    bodyPara("I looked at the mountains again. I thought about the six days I\u2019d just spent driving through the most desolate, beautiful landscape I\u2019d ever seen. The roads that were barely roads\u2014gravel tracks carved into cliff faces with 1,000-foot drops and no guardrails. The villages where people lived at altitudes most cities would consider uninhabitable. The monastery at Key, perched on a cliff like a prayer made solid. The milky blue of the Spiti River cutting through the brown."),
    bodyPara("I thought about all the times I\u2019d joined calls from airports, hotel lobbies, train platforms. All the \u201Cjust thirty minutes\u201D that turned into an hour. All the leave days that weren\u2019t really leave because the laptop was always in the bag and the Slack notifications never stopped."),
    bodyPara("And something shifted."),
    bodyPara("Not dramatically. Not the way it happens in movies, where someone throws their phone off a cliff and walks into the sunset. I didn\u2019t throw anything. I\u2019m an Indian professional\u2014we don\u2019t throw company property. But standing there, at 14,500 feet, with a Buddha at my back and a client escalation in my ear, I made a decision."),
    bodyPara("I said: \u201CI\u2019ll look at it Tuesday when I\u2019m back.\u201D"),
    bodyPara("Then I hung up."),
    sceneBreak(),
    bodyFirst("Spiti Valley had been building toward this moment for six days."),
    bodyPara("The trip had started in Shimla, where I\u2019d caught a shared taxi to Manali and then another one to Kaza\u2014Spiti\u2019s de facto capital. The road from Manali to Kaza is one of the most dangerous in India: the Kunzum Pass at 15,060 feet, the Rohtang Pass before it, and between them, a stretch of road so broken that \u201Croad\u201D is a generous description. The taxi driver, a Spitian man named Tenzin, drove it like he was taking a stroll through a park. I clutched the door handle and tried not to look at the drop."),
    bodyPara("Kaza itself was spare and quiet\u2014a small town of concrete and prayer flags, surrounded by brown mountains and blue sky, the air so thin and dry that my lips cracked within hours. There was nothing to *do* in Kaza in the conventional sense. No attractions, no nightlife, no curated experiences. There was only: the landscape, the silence, and the monasteries."),
    bodyPara("Key Monastery was a thirty-minute drive from Kaza. It sat on a cliff\u2014white walls, red trim, prayer flags strung from every corner, flapping in the wind like the mountain was breathing. Inside, a monk named Lobsang was sitting in the prayer hall, reading. Just reading. He looked up when I entered and smiled. \u201CSit,\u201D he said. So I sat."),
    bodyPara("We talked for an hour. He was twenty-six\u2014my age. He\u2019d been at the monastery since he was nine. He asked me what I did. I told him: software. He nodded. \u201CDo you like it?\u201D"),
    bodyPara("The question was so simple and so direct that I didn\u2019t know how to answer. In four years of working, no one had asked me that. Not my manager, not my parents, not my friends. We asked each other about promotions, salaries, companies. Not whether we *liked* it."),
    bodyPara("\u201CSometimes,\u201D I said. \u201CNot always.\u201D"),
    bodyPara("He smiled again. \u201CThat is honest. Most people say they love it.\u201D"),
    bodyPara("\u201CDo you like it?\u201D I asked. \u201CThis?\u201D I gestured at the monastery, the mountains, the prayer hall."),
    bodyPara("\u201CEvery day is different,\u201D he said. \u201CBut I chose it. That is the difference.\u201D"),
    sceneBreak(),
    bodyFirst("I didn\u2019t quit my job."),
    bodyPara("I know that\u2019s not the ending you were expecting. In the movie version, I\u2019d quit in a blaze of glory, start a travel blog, and live in Spiti forever. But this isn\u2019t a movie. This is real life, where you have rent, and EMIs, and parents who would like a reasonable explanation before you abandon a stable career."),
    bodyPara("What I did do was this: I went back to work on Tuesday, as promised. I attended the Q2 call. I fixed whatever needed fixing. And then I opened my laptop, went to my company\u2019s HR portal, and submitted leave for every remaining long weekend for the next six months."),
    bodyPara("I also set a boundary. No more calls on leave. No more \u201Cjust thirty minutes.\u201D If it\u2019s an emergency, text me. If it\u2019s not an emergency, it can wait. I\u2019d spent four years treating every work request as urgent. Spiti taught me that urgency is mostly theater."),
    bodyPara("Lobsang was right. The difference isn\u2019t whether you like your work every day. The difference is whether you chose it. And choosing it means choosing all of it\u2014including the right to put it down for a week and stand in front of a mountain and feel, for a few days, like the version of yourself that existed before the first day of your first job."),
    bodyPara("Travel doesn\u2019t have to lead to quitting. Sometimes it gives you the perspective to stay\u2014on your own terms."),
    ...tripCard("Spiti Valley", [
      ["Duration", "7\u20138 days (this one requires real leave)"],
      ["Budget", "Rs. 15,000\u201322,000 (flights to Shimla/Chandigarh + shared taxis + homestays + food)"],
      ["Best Season", "June\u2013September (roads close in winter)"],
      ["One Tip", "Acclimate in Kaza for a full day before going higher. Altitude sickness is real, and Spiti doesn\u2019t have hospitals. Carry Diamox, drink water constantly, and listen to your body."],
    ]),
  ];
}

function chapter12() {
  return [
    ...chapterHeading(12, "An Out of Office That Never Ends"),
    bodyFirst("It\u2019s a Monday morning. 9:15 a.m. I\u2019m at my desk in Bangalore."),
    bodyPara("The laptop is open. Slack is pinging. The coffee is\u2014predictably\u2014going cold. There\u2019s a Jira ticket on my screen, something about a bug in the payment flow, and a stand-up meeting in fifteen minutes where I\u2019ll say \u201Cno blockers\u201D regardless of whether I have blockers."),
    bodyPara("Same desk. Same office. Same Monday."),
    bodyPara("But the desk is different now. There\u2019s a small photo taped to my monitor\u2014the Dhauladhar range at sunrise, taken on a phone with cold fingers. Next to my keyboard, a brass bottle I picked up at a junk shop in Jaisalmer. On the wall behind me, a map of India with colored pins marking every place I\u2019ve been. There are twenty-three pins. There should be more. There will be more."),
    bodyPara("The screen saver cycles through photos: Hampi boulders, a train window, the living root bridge, Munna the camel looking disdainful, Bordoloi-da\u2019s smile. When the screen saver kicks in during meetings, people ask, \u201CWhere\u2019s that?\u201D And I tell them. And sometimes they say, \u201CI\u2019ve been meaning to go there.\u201D And I say, \u201CYou should. Here\u2019s how.\u201D"),
    sceneBreak(),
    bodyFirst("I started writing this book because people kept asking me two questions."),
    bodyPara("The first was: \u201CHow do you travel so much with a full-time job?\u201D The answer is in Chapter 3. It\u2019s not magic. It\u2019s a spreadsheet and no shame about taking Mondays off."),
    bodyPara("The second was: \u201CIsn\u2019t it expensive?\u201D The answer is in Chapter 10. It\u2019s cheaper than your monthly Swiggy bill."),
    bodyPara("But the real question\u2014the one nobody asks directly, but everybody means\u2014is: \u201CIs it worth it?\u201D"),
    bodyPara("Is it worth the planning, the early buses, the cold tents, the middle berths? Is it worth the leave applications and the manager\u2019s mild disappointment and the weekend you could have spent catching up on sleep? Is it worth eating at a *dhaba* when your friends are at a microbrewery? Is it worth being a little tired on Monday?"),
    bodyPara("I don\u2019t know how to answer that without sounding like a motivational poster. So let me just tell you what changed."),
    bodyPara("I\u2019m better at my job. Not because travel taught me \u201Cleadership\u201D or \u201Cresilience\u201D or any of those LinkedIn words. But because I\u2019m less afraid. When you\u2019ve been lost in a town whose name you can\u2019t pronounce, a production outage doesn\u2019t feel like the end of the world. When you\u2019ve negotiated a homestay price in broken Pahari, a client call is just another conversation. The things that used to paralyze me\u2014failure, uncertainty, being alone\u2014are now things I\u2019ve practiced, over and over, in places where the stakes were low and the rewards were high."),
    bodyPara("I\u2019m better at being alone. This is important. Most of us fill every moment with input\u2014podcasts, social media, Netflix, Slack. Travel taught me to sit in silence and find it interesting instead of terrifying. The train at midnight. The beach on a Tuesday. The monastery in Spiti. These were classrooms for a skill that nobody teaches: being comfortable in your own company."),
    bodyPara("I know my country. Not in the way I \u201Cknew\u201D it before\u2014from textbooks and news and Bollywood. I know it from train windows and *dhaba* conversations and walking through villages where people have never heard of Bangalore. I know that India is not one thing. It\u2019s a thousand things, contradicting each other in every direction, held together by chai and trains and a stubborn, chaotic, beautiful insistence on continuing."),
    sceneBreak(),
    bodyFirst("There is a list on my phone. It\u2019s in the Notes app, where everyone keeps their lists. It\u2019s titled \u201CPlaces I Haven\u2019t Been Yet.\u201D"),
    bodyPara("Ladakh. The Andamans. Kutch during the Rann festival. The Konkan coast by train. Arunachal Pradesh. Varanasi during Ganga Aarti. Tirthan Valley in the snow. Pondicherry again, because once wasn\u2019t enough."),
    bodyPara("The list keeps growing. Every trip adds three more places than it crosses off. This used to bother me. Now I understand: the list isn\u2019t meant to be finished. It\u2019s meant to be a reason to keep going."),
    bodyPara("I\u2019m still at my desk. The stand-up starts in five minutes. The bug in the payment flow isn\u2019t going to fix itself."),
    bodyPara("But here\u2019s the thing. Three weeks from now, there\u2019s a Thursday holiday. If I take Friday off, that\u2019s a four-day weekend. That\u2019s enough for the Konkan coast. I checked the trains last night. There\u2019s a Sleeper Class berth available on the Mandovi Express. It leaves at 11 p.m. and arrives in Ratnagiri at 8 a.m."),
    bodyPara("I haven\u2019t booked it yet. But I have the tab open."),
    bodyPara("One tab has the sprint backlog. The other has IRCTC."),
    bodyPara("You already know which one I\u2019m going to click."),
    sceneBreak(),
    bodyFirst("If you\u2019ve made it this far, you already know."),
    bodyPara("You don\u2019t need to quit your job. You don\u2019t need a sabbatical. You don\u2019t need to be brave or adventurous or any of those things that travel Instagram tells you to be. You just need a Thursday holiday, a Friday off, and the willingness to set your status to Out of Office and mean it."),
    bodyPara("The point of this book was never to tell you where to go. You have Google for that. The point was to tell you that you *can* go\u2014between meetings, between deadlines, between the Monday alarm and the Sunday dread. India is right there, outside the office window, waiting for you to close the laptop and look up."),
    bodyPara("So close the laptop."),
    bodyPara("Look up."),
    bodyPara("And then open IRCTC."),
  ];
}

// ─── Assemble the full book ───
function buildBook() {
  const frontMatter = [
    // Half-title
    new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office", font: HEAD_FONT, size: 48, bold: true })] }),
    new Paragraph({ children: [new PageBreak()] }),
    // Also by (blank verso)
    new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "", font: BODY_FONT, size: BODY_SIZE })] }),
    new Paragraph({ children: [new PageBreak()] }),
    // Title page
    new Paragraph({ spacing: { before: 3600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office", font: HEAD_FONT, size: 60, bold: true })] }),
    new Paragraph({ spacing: { before: 200, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "An Indian Professional\u2019s Misadventures Across India", font: BODY_FONT, size: 26, italics: true, color: "555555" })] }),
    new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[Author Name]", font: HEAD_FONT, size: 24, characterSpacing: 100 })] }),
    new Paragraph({ children: [new PageBreak()] }),
    // Copyright page
    new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u00A9 2026 [Author Name]. All rights reserved.", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No part of this publication may be reproduced, distributed, or transmitted", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "in any form without the prior written permission of the publisher.", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "First Edition: 2026", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ISBN: [XXX-X-XXXXXX-XX-X]", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cover design by [Designer Name]", font: BODY_FONT, size: 18 })] }),
    new Paragraph({ children: [new PageBreak()] }),
    // Dedication
    new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "For everyone who has ever stared at a Monday morning", font: BODY_FONT, size: BODY_SIZE, italics: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "and whispered, \u201CI need to get out of here.\u201D", font: BODY_FONT, size: BODY_SIZE, italics: true })] }),
    new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "This book is your permission slip.", font: BODY_FONT, size: BODY_SIZE, italics: true })] }),
    new Paragraph({ children: [new PageBreak()] }),
    // How to Use This Book
    new Paragraph({ spacing: { before: 2400, after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A Note Before We Begin", font: HEAD_FONT, size: 28, bold: true })] }),
    bodyFirst("This is not a guidebook. Don\u2019t use it as one. I am not a travel expert. I\u2019m a guy with a desk job and a spreadsheet habit who decided to use his annual leave instead of losing it."),
    bodyPara("What follows are twelve true stories about traveling India between Monday meetings. They are arranged roughly in the order I became a slightly less incompetent traveler. Each chapter ends with a Trip Card\u2014a budget, a duration, a best season, and one tip. If these Trip Cards happen to help you plan a trip, well, you\u2019re welcome."),
    bodyPara("But the Trip Cards aren\u2019t the point. The stories are the point. The feeling is the point. The moment you read something and think, *I could do that*\u2014that\u2019s the point."),
    bodyPara("Now close this introduction and get to Chapter 1. It starts on a Monday. Obviously."),
    new Paragraph({ children: [new PageBreak()] }),
    // Table of Contents
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Contents", font: HEAD_FONT, size: 36, bold: true })] }),
  ];

  const tocEntries = [
    "The Notification That Started It All",
    "My First Solo Trip Was a Beautiful Disaster",
    "The Art of the Long Weekend",
    "The 3 AM Himalayan Mistake",
    "Temple Run: A South Indian Food Coma",
    "Sleeper Class Diaries",
    "The Rajasthan Road Trip",
    "The Northeast Nobody Told Me About",
    "Goa Without the Party",
    "The Trip That Cost Less Than Friday Dinner",
    "The Trip That Almost Made Me Quit",
    "An Out of Office That Never Ends",
  ];
  tocEntries.forEach((title, i) => {
    frontMatter.push(new Paragraph({
      spacing: { after: 120 },
      indent: { left: 720 },
      children: [
        new TextRun({ text: `${i + 1}.\u2003`, font: HEAD_FONT, size: 22, bold: true }),
        new TextRun({ text: title, font: BODY_FONT, size: 22 }),
      ],
    }));
  });
  frontMatter.push(new Paragraph({ spacing: { before: 200, after: 120 }, indent: { left: 720 }, children: [new TextRun({ text: "Acknowledgments", font: BODY_FONT, size: 22 })] }));
  frontMatter.push(new Paragraph({ spacing: { after: 120 }, indent: { left: 720 }, children: [new TextRun({ text: "About the Author", font: BODY_FONT, size: 22 })] }));

  // Back matter
  const backMatter = [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Acknowledgments", font: HEAD_FONT, size: 36, bold: true })] }),
    bodyFirst("This book exists because of every auto driver who didn\u2019t overcharge me (and the many who did\u2014you made for better stories)."),
    bodyPara("Thank you to Bordoloi-da, wherever you are, for the paratha and the wisdom. To Bah Kenny, for driving through clouds without flinching. To Mr. Sharma in Mandi, for the *siddu* and the stories. To Raju the camel guide, for a desert night I\u2019ll never forget. And to every homestay host, *dhaba* cook, train companion, and stranger who handed me a banana when I was lost."),
    bodyPara("Thank you to my parents, for not disowning me when I told them I was using my leave for \u201Csolo trips\u201D instead of visiting home. (I\u2019m visiting next month. I promise.)"),
    bodyPara("Thank you to my manager, who approved my leave requests with a \u201Csure\u201D that was never enthusiastic but was always sufficient."),
    bodyPara("Thank you to Arun and Nikhil, for surviving Rajasthan with me and for still being friends after the AC incident."),
    bodyPara("And thank you to India, for being so vast and so ridiculous and so beautiful that twenty-three trips barely scratched the surface. The list keeps growing. That\u2019s the whole point."),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "About the Author", font: HEAD_FONT, size: 36, bold: true })] }),
    bodyFirst("[Author Name] is a software professional based in Bangalore who has spent the last four years proving that a full-time desk job and an obsessive travel habit are not mutually exclusive. He has visited twenty-three destinations across India, survived thirteen overnight trains, eaten at approximately 200 roadside *dhabas*, and has never once used the phrase \u201Cwanderlust\u201D without irony."),
    bodyPara("When he\u2019s not traveling, he\u2019s tracking his travel expenses in a spreadsheet. When he\u2019s not doing that, he\u2019s working on the sequel. When he\u2019s not doing that, he\u2019s probably on IRCTC, refreshing the page at 10 a.m."),
    bodyPara("This is his first book. If you enjoyed it, please leave a review on Amazon\u2014even one sentence helps. If you didn\u2019t enjoy it, the return policy is very generous, and he won\u2019t take it personally. (He will take it personally.)"),
    bodyPara("Connect: [social media handles]"),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Coming Next", font: HEAD_FONT, size: 36, bold: true })] }),
    new Paragraph({ spacing: { before: 200, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office: International Edition", font: HEAD_FONT, size: 30, bold: true, italics: true })] }),
    bodyFirst("Same voice. Same spreadsheets. Different passport stamps."),
    bodyPara("What happens when an Indian professional with fifteen days of annual leave discovers that Southeast Asia is three hours away and insanely affordable? That Sri Lanka is so close it feels like cheating? That Dubai has a twenty-hour layover that\u2019s basically a free vacation?"),
    bodyPara("*Out of Office: International Edition* takes the long-weekend philosophy global\u2014because the best time to see the world is between meetings."),
    bodyPara("Join the mailing list at [website] to be the first to know when it launches."),
  ];

  // ─── Cover image section (full-bleed, no margins, no header/footer) ───
  const coverImageData = fs.readFileSync("/Users/harshiljani2002/Desktop/Projects/book-writer/output/cover.png");

  const coverSection = {
    properties: {
      page: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        size: { width: 8640, height: 12960 }, // 6" x 9" in DXA (match cover aspect ratio)
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: "png",
            data: coverImageData,
            transformation: { width: 576, height: 864 }, // 6" x 9" (72 DPI points * 8 = full page)
          }),
        ],
      }),
    ],
  };

  // ─── Main book section ───
  const doc = new Document({
    styles: {
      default: { document: { run: { font: BODY_FONT, size: BODY_SIZE } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 40, bold: true, font: HEAD_FONT },
          paragraph: { spacing: { before: 240, after: 240 }, alignment: AlignmentType.CENTER } },
      ],
    },
    sections: [
      coverSection,
      {
        properties: {
          page: {
            margin: { top: 1080, right: 900, bottom: 1080, left: 900 },
            size: { width: 8640, height: 12240 },
          },
        },
        headers: {
          default: new Header({ children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Out of Office", font: HEAD_FONT, size: 16, italics: true, color: "999999" })],
          })] }),
        },
        footers: {
          default: new Footer({ children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], font: HEAD_FONT, size: 18 })],
          })] }),
        },
        children: [
          ...frontMatter,
          ...chapter1(),
          ...chapter2(),
          ...chapter3(),
          ...chapter4(),
          ...chapter5(),
          ...chapter6(),
          ...chapter7(),
          ...chapter8(),
          ...chapter9(),
          ...chapter10(),
          ...chapter11(),
          ...chapter12(),
          ...backMatter,
        ],
      },
    ],
  });

  return doc;
}

// ─── Generate ───
const doc = buildBook();
Packer.toBuffer(doc).then(buffer => {
  const outPath = "/Users/harshiljani2002/Desktop/Projects/book-writer/output/Out_of_Office_Kindle.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`\u2705 Book generated: ${outPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(0)} KB`);
});
