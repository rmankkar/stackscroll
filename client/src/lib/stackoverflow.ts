import axios from 'axios';

const SO_API = 'https://api.stackexchange.com/2.3';

export async function fetchTopQuestions(page = 1) {
  const response = await axios.get(`${SO_API}/questions`, {
    params: {
      page,
      pagesize: 10,
      order: 'desc',
      sort: 'votes',
      site: 'stackoverflow',
      filter: '!9Z(-wwYGT',
      key: 'your-api-key'
    }
  });
  
  return response.data.items;
}

export async function fetchAnswers(questionId: number) {
  const response = await axios.get(`${SO_API}/questions/${questionId}/answers`, {
    params: {
      order: 'desc',
      sort: 'votes',
      site: 'stackoverflow',
      filter: '!9Z(-wwYGT',
      key: 'your-api-key'
    }
  });

  return response.data.items;
}
