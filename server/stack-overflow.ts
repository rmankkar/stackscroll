const STACK_OVERFLOW_API = "https://api.stackexchange.com/2.3";

interface StackOverflowQuestion {
  question_id: number;
  title: string;
  body: string;
  score: number;
  accepted_answer_id?: number;
  owner: { display_name: string };
  answer_count: number;
  tags: string[];
}

interface StackOverflowAnswer {
  answer_id: number;
  body: string;
  score: number;
  is_accepted: boolean;
  owner: { display_name: string };
}

interface StackOverflowResponse<T> {
  items: T[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Stack Overflow API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchStackOverflowQuestions(
  page: number,
  pageSize: number = 10
): Promise<{ questions: StackOverflowQuestion[]; hasMore: boolean }> {
  const data: StackOverflowResponse<StackOverflowQuestion> = await fetchJson(
    `${STACK_OVERFLOW_API}/questions?page=${page}&pagesize=${pageSize}&order=desc&sort=votes&site=stackoverflow&filter=withbody`
  );
  return { questions: data.items, hasMore: data.has_more };
}

export async function fetchStackOverflowAnswers(
  questionIds: number[]
): Promise<StackOverflowAnswer[]> {
  if (questionIds.length === 0) return [];

  const ids = questionIds.join(";");
  const data: StackOverflowResponse<StackOverflowAnswer> = await fetchJson(
    `${STACK_OVERFLOW_API}/questions/${ids}/answers?site=stackoverflow&filter=withbody`
  );
  return data.items;
}
