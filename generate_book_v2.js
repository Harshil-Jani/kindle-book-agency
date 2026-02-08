const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Header, Footer, PageBreak,
  AlignmentType, HeadingLevel, PageNumber, BorderStyle,
  Table, TableRow, TableCell, WidthType, ImageRun
} = require("docx");

// ─── Import chapter modules ───
const raw14 = require("./chapters_1_4");
const { chapter5, chapter6, chapter7, chapter8 } = require("./chapters_5_8");
const { chapter9, chapter10, chapter11, chapter12 } = require("./chapters_9_12");

// ─── Formatter specs ───
const BODY_FONT = "Georgia";
const HEAD_FONT = "Arial";
const BODY_SIZE = 23; // ~11.5pt
const BODY_LEADING = 276;

// ─── Helpers (also used in front/back matter) ───
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

// ─── Adapter for plain-object chapter format ───
// Converts { type, text, ... } objects to docx Paragraph/Table objects
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

function adaptChapter(rawFn) {
  return function() {
    const items = rawFn();
    // If first item is already a Paragraph, return as-is (no adaptation needed)
    if (items[0] && items[0].constructor && items[0].constructor.name === 'Paragraph') return items;
    // Convert plain objects to docx objects
    const result = [];
    for (const item of items) {
      switch (item.type) {
        case 'heading':
          result.push(...chapterHeading(item.number, item.title));
          break;
        case 'first':
          result.push(bodyFirst(item.text));
          break;
        case 'body':
          result.push(bodyPara(item.text));
          break;
        case 'break':
          result.push(sceneBreak());
          break;
        case 'trip':
          result.push(...tripCard(item.destination, item.items));
          break;
      }
    }
    return result;
  };
}

const chapter1 = adaptChapter(raw14.chapter1);
const chapter2 = adaptChapter(raw14.chapter2);
const chapter3 = adaptChapter(raw14.chapter3);
const chapter4 = adaptChapter(raw14.chapter4);

// ─── Front Matter ───
function buildFrontMatter() {
  const fm = [];

  // Half-title
  fm.push(new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office", font: HEAD_FONT, size: 48, bold: true })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Blank verso
  fm.push(new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "", font: BODY_FONT, size: BODY_SIZE })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Title page
  fm.push(new Paragraph({ spacing: { before: 3600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office", font: HEAD_FONT, size: 60, bold: true })] }));
  fm.push(new Paragraph({ spacing: { before: 200, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "An Indian Professional\u2019s Misadventures Across India", font: BODY_FONT, size: 26, italics: true, color: "555555" })] }));
  fm.push(new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[Author Name]", font: HEAD_FONT, size: 24, characterSpacing: 100 })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Copyright page
  fm.push(new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u00A9 2026 [Author Name]. All rights reserved.", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No part of this publication may be reproduced, distributed, or transmitted", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "in any form without the prior written permission of the publisher.", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "First Edition: 2026", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ISBN: [XXX-X-XXXXXX-XX-X]", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cover design by [Designer Name]", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "All events and characters in this book are real. Some names have been", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "changed to protect the innocent, the embarrassed, and the auto drivers.", font: BODY_FONT, size: 18 })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Dedication
  fm.push(new Paragraph({ spacing: { before: 4800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "For everyone who has ever stared at a Monday morning", font: BODY_FONT, size: BODY_SIZE, italics: true })] }));
  fm.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "and whispered, \u201CI need to get out of here.\u201D", font: BODY_FONT, size: BODY_SIZE, italics: true })] }));
  fm.push(new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "This book is your permission slip.", font: BODY_FONT, size: BODY_SIZE, italics: true })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Epigraph
  fm.push(new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CThe world is a book, and those who do not travel read only one page.\u201D", font: BODY_FONT, size: 22, italics: true })] }));
  fm.push(new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u2014 Saint Augustine", font: BODY_FONT, size: 20, color: "666666" })] }));
  fm.push(new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u201CSir, your leave balance is 3 days.\u201D", font: BODY_FONT, size: 22, italics: true })] }));
  fm.push(new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "\u2014 HRMS Portal, every quarter", font: BODY_FONT, size: 20, color: "666666" })] }));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // A Note Before We Begin
  fm.push(new Paragraph({ spacing: { before: 2400, after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "A Note Before We Begin", font: HEAD_FONT, size: 28, bold: true })] }));
  fm.push(bodyFirst("This is not a guidebook. Don\u2019t use it as one. I am not a travel expert. I\u2019m a guy with a desk job and a spreadsheet habit who decided to use his annual leave instead of losing it."));
  fm.push(bodyPara("What follows are twelve true stories about traveling India between Monday meetings. They are arranged roughly in the order I became a slightly less incompetent traveler. Each chapter ends with a Trip Card\u2014a budget, a duration, a best season, and one tip. If these Trip Cards happen to help you plan a trip, well, you\u2019re welcome."));
  fm.push(bodyPara("But the Trip Cards aren\u2019t the point. The stories are the point. The feeling is the point. The moment you read something and think, *I could do that*\u2014that\u2019s the point."));
  fm.push(bodyPara("A few disclaimers. The prices in this book are from 2024\u20132025 and are in Indian Rupees unless stated otherwise. They will probably be higher by the time you read this, because that is how time works. The people in these stories are real, though I\u2019ve changed a few names at the polite request of people who didn\u2019t want their train-sleeping faces described in print."));
  fm.push(bodyPara("The opinions are mine. The mistakes are definitely mine. The unsolicited advice from uncles on trains is theirs."));
  fm.push(bodyPara("Now close this introduction and get to Chapter 1. It starts on a Monday. Obviously."));
  fm.push(new Paragraph({ children: [new PageBreak()] }));

  // Table of Contents
  fm.push(new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Contents", font: HEAD_FONT, size: 36, bold: true })] }));

  const tocEntries = [
    "The Notification That Started It All",
    "My First Solo Trip Was a Beautiful Disaster",
    "The 3 AM Himalayan Mistake",
    "Temple Run: A South Indian Food Coma",
    "Sleeper Class Diaries",
    "Desert, Forts, and the Fight Over the Aux Cord",
    "The Northeast Nobody Told Me About",
    "Goa Without the Party",
    "The Art of the Long Weekend",
    "The Rs. 3,500 Experiment",
    "The Trip That Almost Made Me Quit",
    "An Out of Office That Never Ends",
  ];
  tocEntries.forEach((title, i) => {
    fm.push(new Paragraph({
      spacing: { after: 120 },
      indent: { left: 720 },
      children: [
        new TextRun({ text: `${i + 1}.\u2003`, font: HEAD_FONT, size: 22, bold: true }),
        new TextRun({ text: title, font: BODY_FONT, size: 22 }),
      ],
    }));
  });
  fm.push(new Paragraph({ spacing: { before: 200, after: 120 }, indent: { left: 720 }, children: [new TextRun({ text: "Acknowledgments", font: BODY_FONT, size: 22 })] }));
  fm.push(new Paragraph({ spacing: { after: 120 }, indent: { left: 720 }, children: [new TextRun({ text: "About the Author", font: BODY_FONT, size: 22 })] }));

  return fm;
}

// ─── Back Matter ───
function buildBackMatter() {
  return [
    // Acknowledgments
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Acknowledgments", font: HEAD_FONT, size: 36, bold: true })] }),
    bodyFirst("This book exists because of every auto driver who didn\u2019t overcharge me (and the many who did\u2014you made for better stories)."),
    bodyPara("Thank you to Bordoloi-da, wherever you are, for the paratha and the wisdom. To David in Shillong, for explaining a culture I should have already known. To Miguel in Fontainhas, for 450 years of Goan history in a two-hour walk. To Tenzin in Kaza, for the question that changed everything. To Raju, for bounding up Triund like a mountain goat while I wheezed behind you. And to every chai vendor on every railway platform who served the best chai in the world for ten rupees."),
    bodyPara("Thank you to my parents, for not disowning me when I told them I was using my leave for \u201Csolo trips\u201D instead of visiting home. (I\u2019m visiting next month. I promise. This time I mean it.)"),
    bodyPara("Thank you to my manager, who approved my leave requests with a \u201Csure\u201D that was never enthusiastic but was always sufficient. And to HR, for that passive-aggressive email about \u201Cleave policy spirit vs. letter.\u201D I framed it."),
    bodyPara("Thank you to Vikram and Priya, for surviving Rajasthan with me and for still being friends after the AC incident and the aux cord war. The \u201CDesert Survivors\u201D group chat lives on."),
    bodyPara("Thank you to Arjun, who stared at my holiday spreadsheet in horror and then asked for a copy. You were the first convert. There are now forty-seven of us in that WhatsApp group."),
    bodyPara("Thank you to the elderly Kodava couple in Coorg who took me in from the rain, fed me, and called me a taxi. I never learned your names, but I think about your kindness every time I meet a stranger."),
    bodyPara("Thank you to Meera, for betting me Rs. 1,000 that I couldn\u2019t do Himachal for Rs. 3,500. That money paid for three extra meals. You made the trip possible."),
    bodyPara("And thank you to India, for being so vast and so ridiculous and so beautiful that twenty-three trips barely scratched the surface. The list keeps growing. That\u2019s the whole point."),

    // About the Author
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "About the Author", font: HEAD_FONT, size: 36, bold: true })] }),
    bodyFirst("[Author Name] is a software professional based in Bangalore who has spent the last four years proving that a full-time desk job and an obsessive travel habit are not mutually exclusive. He has visited twenty-three destinations across India, survived thirteen overnight trains, eaten at approximately 200 roadside *dhabas*, and has never once used the phrase \u201Cwanderlust\u201D without irony."),
    bodyPara("He holds a degree in computer science and a self-issued certification in Long Weekend Optimization. His holiday spreadsheet has been downloaded by three departments at his company and flagged by HR. He considers this a personal achievement."),
    bodyPara("When he\u2019s not traveling, he\u2019s tracking his travel expenses in a spreadsheet. When he\u2019s not doing that, he\u2019s working on the sequel. When he\u2019s not doing that, he\u2019s probably on IRCTC, refreshing the page at 10 a.m."),
    bodyPara("This is his first book. If you enjoyed it, please leave a review on Amazon\u2014even one sentence helps. If you didn\u2019t enjoy it, the return policy is very generous, and he won\u2019t take it personally. (He will take it personally.)"),
    bodyPara("Connect: [social media handles]"),
    bodyPara("Newsletter: [website] \u2014 Get the Long Weekend Calendar free when you sign up."),

    // Coming Next
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Coming Next", font: HEAD_FONT, size: 36, bold: true })] }),
    new Paragraph({ spacing: { before: 200, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Out of Office: International Edition", font: HEAD_FONT, size: 30, bold: true, italics: true })] }),
    bodyFirst("Same voice. Same spreadsheets. Different passport stamps."),
    bodyPara("What happens when an Indian professional with fifteen days of annual leave discovers that Southeast Asia is three hours away and insanely affordable? That Sri Lanka is so close it feels like cheating? That Dubai has a twenty-hour layover that\u2019s basically a free vacation?"),
    bodyPara("*Out of Office: International Edition* takes the long-weekend philosophy global\u2014because the best time to see the world is between meetings."),
    bodyPara("Destinations include: Sri Lanka, Thailand, Bali, Vietnam, Nepal, Bhutan, Dubai, and the one European city you can actually afford on an Indian salary (spoiler: it\u2019s not Paris)."),
    bodyPara("Join the mailing list at [website] to be the first to know when it launches. Early subscribers get a free copy of the International Long Weekend Calendar."),

    // Also By (placeholder)
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ spacing: { before: 2400, after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Did You Enjoy This Book?", font: HEAD_FONT, size: 28, bold: true })] }),
    bodyFirst("If *Out of Office* made you laugh, think, or open a browser tab to IRCTC, I\u2019d be incredibly grateful if you left a review on Amazon. Reviews are the single most important thing that helps independent authors reach new readers."),
    bodyPara("It doesn\u2019t need to be long. Even one sentence helps:"),
    bodyPara("\u201CFunny and relatable. Made me book a trip.\u201D \u2014 That\u2019s a perfect review."),
    bodyPara("\u201CRead it on a train. Very meta.\u201D \u2014 Also a perfect review."),
    bodyPara("Thank you for reading. Now go set your status to Out of Office."),
  ];
}

// ─── Assemble ───
function buildBook() {
  const frontMatter = buildFrontMatter();
  const backMatter = buildBackMatter();

  // Cover image section
  const coverImageData = fs.readFileSync("/Users/harshiljani2002/Desktop/Projects/book-writer/output/cover.png");
  const coverSection = {
    properties: {
      page: {
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        size: { width: 8640, height: 12960 },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            type: "png",
            data: coverImageData,
            transformation: { width: 576, height: 864 },
          }),
        ],
      }),
    ],
  };

  // Main book section
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
  // Word count estimate
  const wordEstimate = Math.round(buffer.length / 2.8);
  console.log(`   Estimated words: ~${wordEstimate.toLocaleString()}`);
});
