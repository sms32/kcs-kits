// Usage: node scripts/seed-cpp.mjs [--force]
// Seeds a C++ basics question bank for Code Relay.
// Needs serviceAccountKey.json in the project root (never commit it).
// Only "fix" and "complete" questions: students repair or finish a small
// program, nobody writes a whole one from scratch.
//
// The in-browser judge (JSCPP) runs a basic C++ subset, so every question uses
// only: iostream, iomanip, cstring, int/double/bool/char, char arrays, if/else,
// for/while. No std::string, no vector, no range-based for.
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const BANK_DOC = "config/relayBank";

const force = process.argv.includes("--force");
const sa = JSON.parse(
  readFileSync(new URL("../serviceAccountKey.json", import.meta.url), "utf8")
);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Wraps a body in the usual C++ boilerplate so each question stays short.
const prog = (body, extraIncludes = "") =>
  `#include <iostream>\n${extraIncludes}using namespace std;\n\nint main() {\n${body}\n    return 0;\n}`;
const CSTR = "#include <cstring>\n";
const IOM = "#include <iomanip>\n";

// Expected outputs are computed later from `solution` (admin page > Compute outputs).
const q = (id, tier, type, title, prompt, starterCode, sampleInput, hiddenInputs, solution) => ({
  id, tier, type, title, prompt, starterCode, sampleInput,
  sampleOutput: "", hiddenInputs, hiddenOutputs: [], solution,
  language: "cpp",
});

const questions = [
  // ---------- Tier 1 ----------
  q("q01", 1, "fix", "Greeting",
    "Read a person's name (one word) and print: Hello, NAME! This program does not compile. Find the mistake and fix it.",
    prog(`    char name[50];
    cin << name;
    cout << "Hello, " << name << "!" << endl;`),
    "Asha", ["Ravi", "Meena", "Zoe"],
    prog(`    char name[50];
    cin >> name;
    cout << "Hello, " << name << "!" << endl;`)),

  q("q02", 1, "fix", "Add Two Numbers",
    "Read two whole numbers (one per line) and print their sum like this: Sum: 12. The program prints the wrong answer. Fix it.",
    prog(`    int a, b;
    cin >> a >> b;
    cout << "Sum: " << a - b << endl;`),
    "5\n7", ["10\n20", "3\n-8", "100\n250"],
    prog(`    int a, b;
    cin >> a >> b;
    cout << "Sum: " << a + b << endl;`)),

  q("q03", 1, "complete", "Area of a Rectangle",
    "Read the length and the width (whole numbers, one per line) and print the area like this: Area: 24. Replace the blank (____) with the correct expression.",
    prog(`    int length, width;
    cin >> length >> width;
    int area = ____;
    cout << "Area: " << area << endl;`),
    "4\n6", ["10\n10", "7\n3", "12\n5"],
    prog(`    int length, width;
    cin >> length >> width;
    int area = length * width;
    cout << "Area: " << area << endl;`)),

  q("q04", 1, "complete", "Even or Odd",
    "Read a whole number. Print Even if it is divisible by 2, otherwise print Odd. Replace the blank (____) with the correct operator.",
    prog(`    int n;
    cin >> n;
    if (n ____ 2 == 0) {
        cout << "Even" << endl;
    } else {
        cout << "Odd" << endl;
    }`),
    "8", ["9", "24", "101"],
    prog(`    int n;
    cin >> n;
    if (n % 2 == 0) {
        cout << "Even" << endl;
    } else {
        cout << "Odd" << endl;
    }`)),

  q("q05", 1, "fix", "Squares up to n",
    "Read a whole number n and print the squares of 1, 2, 3, ... up to n, one per line. For n = 3 the output is 1, 4 and 9 on separate lines. This program stops one number too early. Fix it.",
    prog(`    int n;
    cin >> n;
    for (int i = 1; i < n; i++) {
        cout << i * i << endl;
    }`),
    "5", ["4", "6", "8"],
    prog(`    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cout << i * i << endl;
    }`)),

  // ---------- Tier 2 ----------
  q("q06", 2, "fix", "Largest of Three",
    "Read three whole numbers (one per line) and print the largest one. The program gives the wrong answer for some inputs. Fix it.",
    prog(`    int a, b, c;
    cin >> a >> b >> c;
    int largest = a;
    if (b > largest) largest = b;
    if (c < largest) largest = c;
    cout << largest << endl;`),
    "3\n8\n5", ["12\n45\n30", "9\n2\n5", "-4\n-1\n-8"],
    prog(`    int a, b, c;
    cin >> a >> b >> c;
    int largest = a;
    if (b > largest) largest = b;
    if (c > largest) largest = c;
    cout << largest << endl;`)),

  q("q07", 2, "fix", "Sum from 1 to n",
    "Read a whole number n and print the sum of all the numbers from 1 to n. For n = 4 the answer is 10. This program prints the wrong answer. Fix it.",
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total = i;
    }
    cout << total << endl;`),
    "5", ["10", "100", "3"],
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 1; i <= n; i++) {
        total += i;
    }
    cout << total << endl;`)),

  q("q08", 2, "complete", "Count the Vowels",
    "Read one lowercase word and print how many vowels (a, e, i, o, u) it has. Replace the blank (____) so the program works.",
    prog(`    char word[50];
    cin >> word;
    int count = 0;
    for (int i = 0; i < strlen(word); i++) {
        char ch = word[i];
        if (ch == 'a' || ch == 'e' || ch == ____ || ch == 'o' || ch == 'u') {
            count++;
        }
    }
    cout << count << endl;`, CSTR),
    "computer", ["education", "rhythm", "banana"],
    prog(`    char word[50];
    cin >> word;
    int count = 0;
    for (int i = 0; i < strlen(word); i++) {
        char ch = word[i];
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            count++;
        }
    }
    cout << count << endl;`, CSTR)),

  q("q09", 2, "fix", "Multiplication Table",
    "Read a whole number n and print its first five multiples, one per line, like 3 x 1 = 3. The numbers on the right are wrong. Fix the program.",
    prog(`    int n;
    cin >> n;
    for (int i = 1; i <= 5; i++) {
        cout << n << " x " << i << " = " << n + i << endl;
    }`),
    "3", ["7", "12", "5"],
    prog(`    int n;
    cin >> n;
    for (int i = 1; i <= 5; i++) {
        cout << n << " x " << i << " = " << n * i << endl;
    }`)),

  q("q10", 2, "fix", "Grade Calculator",
    "Read the marks (0 to 100) and print the grade: A for 90 or more, B for 75 or more, C for 50 or more, otherwise Fail. This program gives wrong grades for some marks. Fix it.",
    prog(`    int marks;
    cin >> marks;
    if (marks >= 50) {
        cout << "C" << endl;
    } else if (marks >= 75) {
        cout << "B" << endl;
    } else if (marks >= 90) {
        cout << "A" << endl;
    } else {
        cout << "Fail" << endl;
    }`),
    "82", ["95", "60", "30", "75"],
    prog(`    int marks;
    cin >> marks;
    if (marks >= 90) {
        cout << "A" << endl;
    } else if (marks >= 75) {
        cout << "B" << endl;
    } else if (marks >= 50) {
        cout << "C" << endl;
    } else {
        cout << "Fail" << endl;
    }`)),

  // ---------- Tier 3 ----------
  q("q11", 3, "complete", "Sum of Numbers",
    "The first number n says how many numbers follow. Read them and print their sum. For 3 and then 4 8 15 the answer is 27. Replace the blank (____) with the correct operator.",
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total ____ x;
    }
    cout << total << endl;`),
    "3\n4 8 15", ["5\n1 2 3 4 5", "3\n10 20 30", "4\n7 7 7 7"],
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
    }
    cout << total << endl;`)),

  q("q12", 3, "fix", "Prime or Not",
    "Read a whole number n (2 or more) and print Prime if it is a prime number, otherwise print Not prime. This program gives the wrong answer for some numbers. Fix it.",
    prog(`    int n;
    cin >> n;
    bool isPrime = true;
    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            isPrime = false;
        } else {
            isPrime = true;
        }
    }
    if (isPrime) {
        cout << "Prime" << endl;
    } else {
        cout << "Not prime" << endl;
    }`),
    "10", ["13", "15", "29", "49"],
    prog(`    int n;
    cin >> n;
    bool isPrime = true;
    for (int i = 2; i < n; i++) {
        if (n % i == 0) {
            isPrime = false;
        }
    }
    if (isPrime) {
        cout << "Prime" << endl;
    } else {
        cout << "Not prime" << endl;
    }`)),

  q("q13", 3, "complete", "Average of Numbers",
    "The first number n says how many numbers follow. Read them and print their average with 2 decimal places. Replace the blank (____) with the correct variable.",
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
    }
    double average = (double) ____ / n;
    cout << fixed << setprecision(2) << average << endl;`, IOM),
    "4\n4 8 15 16", ["3\n10 20 30", "4\n5 5 5 5", "3\n1 2 4"],
    prog(`    int n;
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        total += x;
    }
    double average = (double) total / n;
    cout << fixed << setprecision(2) << average << endl;`, IOM)),

  q("q14", 3, "fix", "Palindrome Check",
    "Read one word. Print Yes if it reads the same forwards and backwards, otherwise print No. The program prints No even for words like radar. Fix it.",
    prog(`    char word[50];
    cin >> word;
    int n = strlen(word);
    bool same = true;
    for (int i = 0; i < n / 2; i++) {
        if (word[i] != word[n - i]) {
            same = false;
        }
    }
    if (same) {
        cout << "Yes" << endl;
    } else {
        cout << "No" << endl;
    }`, CSTR),
    "radar", ["hello", "civic", "matrix", "noon"],
    prog(`    char word[50];
    cin >> word;
    int n = strlen(word);
    bool same = true;
    for (int i = 0; i < n / 2; i++) {
        if (word[i] != word[n - 1 - i]) {
            same = false;
        }
    }
    if (same) {
        cout << "Yes" << endl;
    } else {
        cout << "No" << endl;
    }`, CSTR)),

  q("q15", 3, "complete", "FizzBuzz",
    "Read a whole number n. For each number from 1 to n print FizzBuzz if it is divisible by both 3 and 5, Fizz if divisible by 3 only, Buzz if divisible by 5 only, otherwise the number itself. Replace the blank (____) with the correct number.",
    prog(`    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        if (i % 3 == 0 && i % ____ == 0) {
            cout << "FizzBuzz" << endl;
        } else if (i % 3 == 0) {
            cout << "Fizz" << endl;
        } else if (i % 5 == 0) {
            cout << "Buzz" << endl;
        } else {
            cout << i << endl;
        }
    }`),
    "5", ["15", "10", "7"],
    prog(`    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        if (i % 3 == 0 && i % 5 == 0) {
            cout << "FizzBuzz" << endl;
        } else if (i % 3 == 0) {
            cout << "Fizz" << endl;
        } else if (i % 5 == 0) {
            cout << "Buzz" << endl;
        } else {
            cout << i << endl;
        }
    }`)),
];

const bankRef = db.doc(BANK_DOC);
if ((await bankRef.get()).exists && !force) {
  console.log(`${BANK_DOC} already exists, skipping (use --force to replace it).`);
} else {
  await bankRef.set({ language: "cpp", questions });
  console.log(`Seeded ${questions.length} C++ questions. Now press "Compute outputs" in Admin > Code Relay.`);
}

const cfgRef = db.doc("config/relay");
if (!(await cfgRef.get()).exists) {
  await cfgRef.set({
    roundId: null, name: "", status: "idle", startedAt: null,
    durationMin: 45, legSec: 300, minPassSec: 60, leaderboard: null,
  });
  console.log("Created config/relay");
}
process.exit(0);