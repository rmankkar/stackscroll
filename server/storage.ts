import { questions, type Question, type InsertQuestion } from "@shared/schema";

export interface IStorage {
  getQuestions(page: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  currentId: number;

  constructor() {
    this.questions = new Map();
    this.currentId = 1;

    // Initialize with dummy data
    const dummyQuestions: InsertQuestion[] = [
      {
        stackOverflowId: 1,
        title: "Why is processing a sorted array faster than processing an unsorted array?",
        body: `<p>Here is a piece of C++ code that shows some very peculiar behavior. For some reason, sorting the data makes the loop much faster:</p>
               <pre><code>std::vector<int> data;</code></pre>`,
        score: 28625,
        acceptedAnswerId: 11227902,
        authorName: "GManNickG",
        answers: [{
          answer_id: 11227902,
          body: "<p>The reason is branch prediction. Modern CPUs try to predict which branch will be taken before the condition is actually evaluated...</p>",
          is_accepted: true,
          owner: { display_name: "Mysticial" },
          score: 35276
        }]
      },
      {
        stackOverflowId: 2,
        title: "What is the '-->' operator in C++?",
        body: `<p>After reading Hidden Features of C++, I was surprised that this compiled:</p>
               <pre><code>while (x --> 0) { // x goes to 0</code></pre>`,
        score: 25431,
        acceptedAnswerId: 1642028,
        authorName: "Bjarne Stroustrup",
        answers: [{
          answer_id: 1642028,
          body: "<p>There is no --> operator in C++. The code is parsed as: while (x-- > 0)</p>",
          is_accepted: true,
          owner: { display_name: "Greg Hewgill" },
          score: 27893
        }]
      },
      {
        stackOverflowId: 3,
        title: "Why does React hook useEffect run twice?",
        body: "<p>I've noticed that my useEffect hook runs twice on component mount. Why is this happening?</p>",
        score: 15478,
        acceptedAnswerId: 60618944,
        authorName: "ReactDev",
        answers: [{
          answer_id: 60618944,
          body: "<p>This is expected behavior in React's Strict Mode, which runs effects twice in development to help find bugs.</p>",
          is_accepted: true,
          owner: { display_name: "Dan Abramov" },
          score: 18234
        }]
      },
      {
        stackOverflowId: 4,
        title: "What does the 'yield' keyword do in Python?",
        body: "<p>What is the yield keyword used for in Python? What are generators?</p>",
        score: 12567,
        acceptedAnswerId: 231767,
        authorName: "PythonLearner",
        answers: [{
          answer_id: 231767,
          body: "<p>The yield keyword is used to define generator functions. Instead of returning a value and terminating, yield provides a value and pauses execution.</p>",
          is_accepted: true,
          owner: { display_name: "PyExpert" },
          score: 15678
        }]
      },
      {
        stackOverflowId: 5,
        title: "What is the difference between 'null' and 'undefined' in JavaScript?",
        body: "<p>I'm confused about the difference between null and undefined in JavaScript. When should I use each?</p>",
        score: 19876,
        acceptedAnswerId: 5076,
        authorName: "JSNewbie",
        answers: [{
          answer_id: 5076,
          body: "<p>undefined means a variable has been declared but has not yet been assigned a value. null is an assignment value representing no value or no object.</p>",
          is_accepted: true,
          owner: { display_name: "JavaScript Guru" },
          score: 22345
        }]
      },
      {
        stackOverflowId: 6,
        title: "How to center a div horizontally and vertically?",
        body: "<p>What's the best way to center a div both horizontally and vertically using CSS?</p>",
        score: 23456,
        acceptedAnswerId: 356789,
        authorName: "CSSLearner",
        answers: [{
          answer_id: 356789,
          body: "<p>Use flexbox: .parent { display: flex; justify-content: center; align-items: center; }</p>",
          is_accepted: true,
          owner: { display_name: "CSS Master" },
          score: 25678
        }]
      },
      {
        stackOverflowId: 7,
        title: "What are the differences between var, let, and const in JavaScript?",
        body: "<p>Can someone explain the differences between var, let, and const declarations in JavaScript?</p>",
        score: 17654,
        acceptedAnswerId: 762345,
        authorName: "ES6Learner",
        answers: [{
          answer_id: 762345,
          body: "<p>var is function-scoped, while let and const are block-scoped. const prevents reassignment of the variable.</p>",
          is_accepted: true,
          owner: { display_name: "ModernJS" },
          score: 19876
        }]
      },
      {
        stackOverflowId: 8,
        title: "How to check if a string contains another string in JavaScript?",
        body: "<p>What's the best way to check if a string contains another string in JavaScript?</p>",
        score: 14567,
        acceptedAnswerId: 456789,
        authorName: "StringMaster",
        answers: [{
          answer_id: 456789,
          body: "<p>Use the includes() method: 'Hello World'.includes('World') // returns true</p>",
          is_accepted: true,
          owner: { display_name: "JSPro" },
          score: 16789
        }]
      },
      {
        stackOverflowId: 9,
        title: "What is the difference between == and === in JavaScript?",
        body: "<p>What's the difference between == and === operators in JavaScript?</p>",
        score: 21345,
        acceptedAnswerId: 567890,
        authorName: "OperatorPro",
        answers: [{
          answer_id: 567890,
          body: "<p>== performs type coercion before comparison, while === compares both value and type without coercion.</p>",
          is_accepted: true,
          owner: { display_name: "JSExpert" },
          score: 23456
        }]
      },
      {
        stackOverflowId: 10,
        title: "How to remove duplicates from an array in JavaScript?",
        body: "<p>What's the most efficient way to remove duplicates from an array in JavaScript?</p>",
        score: 18765,
        acceptedAnswerId: 678901,
        authorName: "ArrayMaster",
        answers: [{
          answer_id: 678901,
          body: "<p>Use Set: const unique = [...new Set(array)]</p>",
          is_accepted: true,
          owner: { display_name: "ES6Pro" },
          score: 20987
        }]
      }
    ];

    dummyQuestions.forEach(q => {
      const question: Question = { ...q, id: this.currentId++ };
      this.questions.set(question.id, question);
    });
  }

  async getQuestions(page: number): Promise<Question[]> {
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return Array.from(this.questions.values())
      .sort((a, b) => b.score - a.score)
      .slice(start, end);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }
}

export const storage = new MemStorage();