// Sample content shown to accounts with the "guest" role.
//
// A guest gets a read-only tour of the platform, so nothing here is fetched
// from the API: the lists on the dashboard and the details pages all read from
// these objects. Dates are computed relative to today so the sample data never
// looks stale (and never trips the "past item" cleanup in the cards).

export const GUEST_ACTION_MESSAGE = "As a guest you cant perform any action.";
export const GUEST_DOWNLOAD_MESSAGE = "As a guest you cant download documents.";

const inDays = (days, hour = 10, minute = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const agoDays = (days, hour = 9, minute = 0) => inDays(-days, hour, minute);

const FACULTY = "Faculty of Engineering";
const DIVISION = "Computer Science";

// A real, viewable PDF ships with the app so the guest sample attachments can
// be opened in the preview exactly like a real attachment would be.
const SAMPLE_PREVIEW_URL = "/samples/guest-preview-document.pdf";

const withPreviewUrls = (documents = []) =>
  documents.map((doc) =>
    !doc.url && String(doc.type).toLowerCase() === "pdf"
      ? { ...doc, url: SAMPLE_PREVIEW_URL }
      : doc,
  );

const sharedDocs = [
  { name: "Hash-Tables-Lecture-Notes.pdf", size: "1.8 MB", type: "pdf" },
  { name: "Hash-Tables-Slides.pptx", size: "3.4 MB", type: "pptx" },
  { name: "Recursion-Worksheet.docx", size: "640 KB", type: "docx" },
];

/* -------------------------------------------------------------------------- */
/* Lessons                                                                    */
/* -------------------------------------------------------------------------- */

export const guestLessons = [
  {
    id: "guest-lesson-1",
    title: "Introduction to Hash Tables",
    subject: "Data Structures & Algorithms",
    type: "Lecture",
    notes:
      "Open addressing, chaining, load factor and why a good hash function is the whole game.",
    UploadContentType: "text",
    uploadername: "Dr. Layla Haddad",
    uploaddate: agoDays(2, 9, 15),
    filesurls: [],
  },
  {
    id: "guest-lesson-2",
    title: "Binary Trees — Worked Examples",
    subject: "Data Structures & Algorithms",
    type: "Lab",
    notes:
      "Insertion, deletion and the four traversal orders, walked through on the whiteboard.",
    UploadContentType: "link",
    link: "https://example.com/cs201/binary-trees-lab",
    uploadername: "Dr. Layla Haddad",
    uploaddate: agoDays(4, 14, 0),
    filesurls: [],
  },
  {
    id: "guest-lesson-3",
    title: "Graph Traversal Walkthrough",
    subject: "Algorithms",
    type: "Tutorial",
    notes:
      "BFS and DFS side by side, including the iterative stack version that trips most people up.",
    UploadContentType: "text",
    uploadername: "Omar Nasser",
    uploaddate: agoDays(6, 11, 45),
    filesurls: [],
  },
  {
    id: "guest-lesson-4",
    title: "Complexity Analysis Cheat Sheet",
    subject: "Algorithms",
    type: "Lecture",
    notes:
      "A one-page reference for the growth rates you are expected to recognise on sight.",
    UploadContentType: "text",
    uploadername: "Dr. Layla Haddad",
    uploaddate: agoDays(9, 8, 30),
    filesurls: [],
  },
  {
    id: "guest-lesson-5",
    title: "Recursion & Backtracking",
    subject: "Data Structures & Algorithms",
    type: "Lecture",
    notes:
      "Base cases, the call stack and pruning a search tree before it explodes.",
    UploadContentType: "text",
    uploadername: "Omar Nasser",
    uploaddate: agoDays(12, 16, 20),
    filesurls: [],
  },
];

const lessonDetails = {
  "guest-lesson-1": {
    ...guestLessons[0],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    text:
      "A hash table stores key/value pairs in buckets chosen by a hash function, which is what buys us average O(1) lookup, insertion and deletion.\n\n" +
      "In this session we covered:\n" +
      "• Separate chaining versus open addressing, and the memory trade-off between them.\n" +
      "• Why the load factor — not the table size — drives performance.\n" +
      "• Resizing strategies (doubling vs. prime stepping) and the rehash cost they hide.\n" +
      "• A live implementation of a hash map with chaining, including a deliberately bad hash function to show collisions in action.\n\n" +
      "Before next week, work through the worksheet in the attachments and try to beat the quadratic-probing exercise.",
    documents: sharedDocs,
  },
  "guest-lesson-2": {
    ...guestLessons[1],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    documents: [{ name: "Binary-Trees-Lab-Sheet.pdf", size: "920 KB", type: "pdf" }],
  },
  "guest-lesson-3": {
    ...guestLessons[2],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    text:
      "Traversal is the same idea twice: visit a node, then make sure every neighbour is eventually visited exactly once.\n\n" +
      "BFS uses a queue and gives you shortest paths in unweighted graphs; DFS uses a stack — or recursion — and is the natural fit for cycle detection and topological ordering.\n\n" +
      "The walkthrough ends with three small graphs you can trace by hand to confirm your ordering matches the reference output.",
    documents: [{ name: "Graph-Traversal-Handout.pdf", size: "1.2 MB", type: "pdf" }],
  },
  "guest-lesson-4": {
    ...guestLessons[3],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    text:
      "O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ).\n\n" +
      "If you can place an algorithm on that ladder and justify it with a recurrence, you can answer most of what the exam asks about complexity.",
    documents: [{ name: "Complexity-Cheat-Sheet.pdf", size: "410 KB", type: "pdf" }],
  },
  "guest-lesson-5": {
    ...guestLessons[4],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    text:
      "Every recursive solution needs a base case you actually trust, and a step that provably shrinks the problem.\n\n" +
      "Backtracking is that same recursion plus the discipline of undoing your choice before trying the next one. The classic examples — N-Queens, subsets, permutations — all follow the choose / explore / un-choose pattern.",
    documents: [{ name: "Recursion-Worksheet.docx", size: "640 KB", type: "docx" }],
  },
};

export const getGuestLesson = (id) => {
  const detail = lessonDetails[id] || lessonDetails["guest-lesson-1"];
  return { ...detail, documents: withPreviewUrls(detail.documents) };
};

/* -------------------------------------------------------------------------- */
/* Quizzes / exams                                                            */
/* -------------------------------------------------------------------------- */

export const guestQuizzes = [
  {
    id: "guest-quiz-1",
    title: "Quiz 2 — Trees & Graphs",
    subject: "Data Structures & Algorithms",
    quizdate: inDays(3, 11, 0),
    description:
      "Twenty multiple-choice questions plus two short proofs on tree height and traversal order.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-quiz-2",
    title: "Midterm Exam — Algorithms",
    subject: "Algorithms",
    quizdate: inDays(12, 9, 0),
    description:
      "Covers divide and conquer, greedy strategies and the first half of dynamic programming.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-quiz-3",
    title: "Practice Quiz — Recursion",
    subject: "Data Structures & Algorithms",
    quizdate: inDays(6, 15, 30),
    description:
      "Ungraded warm-up quiz. Ten questions, unlimited attempts, instant feedback.",
    uploadername: "Omar Nasser",
  },
  {
    id: "guest-quiz-4",
    title: "Quiz 1 — Arrays & Linked Lists",
    subject: "Data Structures & Algorithms",
    quizdate: inDays(18, 10, 0),
    description:
      "Re-sit window for students who missed the first quiz of the term.",
    uploadername: "Dr. Layla Haddad",
  },
];

const quizDetails = {
  "guest-quiz-1": {
    ...guestQuizzes[0],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 30,
    durationminutes: 45,
    instructions:
      "The quiz opens five minutes before the scheduled time and closes automatically at the end of the window.\n\n" +
      "• Section A: 20 multiple-choice questions, one mark each.\n" +
      "• Section B: two short proofs, five marks each.\n" +
      "• You may use one handwritten A4 formula sheet.\n\n" +
      "Answers are graded automatically for Section A; Section B is marked by your instructor within a week.",
    notes:
      "Revision focus: height of a binary search tree, BFS vs. DFS ordering, and detecting a cycle in a directed graph.",
    documents: [{ name: "Quiz-2-Syllabus.pdf", size: "320 KB", type: "pdf" }],
  },
  "guest-quiz-2": {
    ...guestQuizzes[1],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 60,
    durationminutes: 90,
    instructions:
      "Closed book, ninety minutes, calculator permitted.\n\n" +
      "Four long-answer questions. Show your working — method marks are awarded even when the final number is wrong.",
    notes: "Seating is published on the department noticeboard two days before the exam.",
    documents: [{ name: "Midterm-Coverage.pdf", size: "480 KB", type: "pdf" }],
  },
  "guest-quiz-3": {
    ...guestQuizzes[2],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 10,
    durationminutes: 20,
    instructions:
      "Ungraded and unlimited attempts. Use it to find the gaps before the real quiz.\n\n" +
      "Feedback is shown immediately after each attempt.",
    notes: "If a question's explanation is unclear, flag it in the discussion thread.",
    documents: [],
  },
  "guest-quiz-4": {
    ...guestQuizzes[3],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 20,
    durationminutes: 30,
    instructions:
      "Re-sit window for students who missed the first quiz. One attempt only.\n\n" +
      "Contact the course coordinator before the window opens if you need an accommodation.",
    notes: "The re-sit grade replaces the missing grade; it is not capped.",
    documents: [],
  },
};

export const getGuestQuiz = (id) => {
  const detail = quizDetails[id] || quizDetails["guest-quiz-1"];
  return { ...detail, documents: withPreviewUrls(detail.documents) };
};

/* -------------------------------------------------------------------------- */
/* Assignments                                                                */
/* -------------------------------------------------------------------------- */

export const guestAssignments = [
  {
    id: "guest-assignment-1",
    title: "Lab 4 — Implement a Min-Heap",
    subject: "Data Structures & Algorithms",
    deadline: inDays(4, 23, 59),
    description:
      "Build a binary min-heap with insert, extract-min and heapify, then benchmark it against a sorted array.",
    uploadername: "Omar Nasser",
  },
  {
    id: "guest-assignment-2",
    title: "Problem Set 3 — Dynamic Programming",
    subject: "Algorithms",
    deadline: inDays(11, 23, 59),
    description:
      "Five problems on memoisation versus tabulation. Write the recurrence before the code.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-assignment-3",
    title: "Project Proposal — Graph Visualiser",
    subject: "Algorithms",
    deadline: inDays(18, 17, 0),
    description:
      "One page describing your team, the graphs you will support, and the visual encoding you plan to use.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-assignment-4",
    title: "Weekly Reflection — Week 8",
    subject: "Data Structures & Algorithms",
    deadline: inDays(2, 20, 0),
    description:
      "Short reflection on the hash table lab: what surprised you, and what you would change.",
    uploadername: "Omar Nasser",
  },
];

const assignmentDetails = {
  "guest-assignment-1": {
    ...guestAssignments[0],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 25,
    submissionmode: "Upload a ZIP archive",
    instructions:
      "Implement a binary min-heap in the language of your choice. Your class must expose insert, extract-min, peek and heapify.\n\n" +
      "• Include a short README explaining the time complexity of each operation.\n" +
      "• Provide a benchmark that compares your heap against a sorted array for 1k, 10k and 100k inserts.\n" +
      "• Submit as a single ZIP archive named lab4-<your-student-id>.zip.\n\n" +
      "Late submissions lose 10% per day, up to three days; after that the lab is not accepted.",
    notes: "Office hours on Tuesday and Thursday, 14:00–16:00, in the CS lab.",
    documents: [
      { name: "Lab-4-Brief.pdf", size: "760 KB", type: "pdf" },
      { name: "Lab-4-Starter-Code.zip", size: "45 KB", type: "zip" },
    ],
  },
  "guest-assignment-2": {
    ...guestAssignments[1],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 40,
    submissionmode: "Upload a single PDF",
    instructions:
      "Five problems, eight marks each. For every problem write the recurrence, then the bottom-up table, then the final complexity.\n\n" +
      "Prose answers are accepted, but pseudocode must be your own work.",
    notes: "Problem 5 is optional for bonus marks and will not push you above 40.",
    documents: [{ name: "Problem-Set-3.pdf", size: "540 KB", type: "pdf" }],
  },
  "guest-assignment-3": {
    ...guestAssignments[2],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 10,
    submissionmode: "Upload a single PDF",
    instructions:
      "One page, maximum 500 words.\n\n" +
      "Tell us who is on the team, which graph algorithms the visualiser will demonstrate, and sketch the layout. Proposals are reviewed in the following lab session.",
    notes: "Teams of three. Individual proposals are accepted with a short justification.",
    documents: [],
  },
  "guest-assignment-4": {
    ...guestAssignments[3],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    totalmarks: 5,
    submissionmode: "Text entry",
    instructions:
      "Answer in 150–200 words. There is no single correct answer; we are looking for honest reflection and one concrete improvement for the next lab.",
    notes: "Marked for completion, not correctness.",
    documents: [],
  },
};

export const getGuestAssignment = (id) => {
  const detail = assignmentDetails[id] || assignmentDetails["guest-assignment-1"];
  return { ...detail, documents: withPreviewUrls(detail.documents) };
};

/* -------------------------------------------------------------------------- */
/* Online meetings                                                            */
/* -------------------------------------------------------------------------- */

export const guestMeetings = [
  {
    id: "guest-meeting-1",
    title: "Live Session — Balanced Trees",
    subject: "Data Structures & Algorithms",
    meetingdate: inDays(2, 18, 0),
    description:
      "AVL rotations and red-black colouring, worked through on the board before we code them.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-meeting-2",
    title: "Doubt Clearing — Recursion & Backtracking",
    subject: "Data Structures & Algorithms",
    meetingdate: inDays(5, 16, 0),
    description:
      "Bring the exercise you are stuck on. We will trace it on screen together.",
    uploadername: "Omar Nasser",
  },
  {
    id: "guest-meeting-3",
    title: "Guest Talk — Search at Web Scale",
    subject: "Algorithms",
    meetingdate: inDays(9, 17, 30),
    description:
      "An industry engineer on how inverted indexes and sharding actually behave in production.",
    uploadername: "Dr. Layla Haddad",
  },
  {
    id: "guest-meeting-4",
    title: "Weekly Stand-up — Project Teams",
    subject: "Algorithms",
    meetingdate: inDays(1, 12, 0),
    description:
      "Ten minutes per team: what shipped, what is blocked, what is next.",
    uploadername: "Omar Nasser",
  },
];

const meetingDetails = {
  "guest-meeting-1": {
    ...guestMeetings[0],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    platform: "Microsoft Teams",
    durationminutes: 60,
    joinlink: "https://example.com/cs201/live-balanced-trees",
    agenda:
      "1. Quick recap: why an unbalanced BST degrades to a linked list.\n" +
      "2. AVL trees — the four rotation cases, drawn one by one.\n" +
      "3. Red-black trees — what the colours actually buy you.\n" +
      "4. Live coding: insert with rebalancing.\n" +
      "5. Q&A, then the recording is posted with the lesson.",
    notes:
      "Join from a laptop if you can — the coding segment is hard to follow on a phone. The recording will be attached to the lesson page afterwards.",
    documents: [{ name: "Balanced-Trees-Session-Slides.pdf", size: "2.1 MB", type: "pdf" }],
  },
  "guest-meeting-2": {
    ...guestMeetings[1],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    platform: "Google Meet",
    durationminutes: 45,
    joinlink: "https://example.com/cs201/doubt-clearing-recursion",
    agenda:
      "1. Collect the exercises you want to cover (posted in the thread beforehand).\n" +
      "2. Trace the two most-requested problems on screen.\n" +
      "3. Open floor for the rest of the hour.",
    notes: "Post your question in the discussion thread so it can be ordered by demand.",
    documents: [],
  },
  "guest-meeting-3": {
    ...guestMeetings[2],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    platform: "Microsoft Teams",
    durationminutes: 75,
    joinlink: "https://example.com/algorithms/guest-talk-search",
    agenda:
      "1. Introduction and career path.\n" +
      "2. Inverted indexes: from a crawl to a ranked result page.\n" +
      "3. Sharding, replicas and the tail-latency problem.\n" +
      "4. Open Q&A — bring questions about internships.",
    notes: "Attendance is optional but strongly recommended; a short summary will be shared.",
    documents: [{ name: "Guest-Talk-Abstract.pdf", size: "180 KB", type: "pdf" }],
  },
  "guest-meeting-4": {
    ...guestMeetings[3],
    faculty: FACULTY,
    division: DIVISION,
    year: "2nd Year",
    semester: "Fall 2026",
    iscreator: true,
    platform: "Zoom",
    durationminutes: 30,
    joinlink: "https://example.com/algorithms/weekly-standup",
    agenda:
      "Each team gets ten minutes: what shipped this week, what is blocked, what is next.",
    notes: "One person per team speaks; everyone else is welcome to listen.",
    documents: [],
  },
};

export const getGuestMeeting = (id) => {
  const detail = meetingDetails[id] || meetingDetails["guest-meeting-1"];
  return { ...detail, documents: withPreviewUrls(detail.documents) };
};
