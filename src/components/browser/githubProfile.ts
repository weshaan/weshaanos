/** Public GitHub profile copy for github.com/weshaan (sourced from GitHub API). */

export const GITHUB_PROFILE_URL = 'https://github.com/weshaan'

export const GITHUB_AVATAR_SRC = 'https://avatars.githubusercontent.com/u/118920744?v=4'

export const GITHUB_STATS_CARD_ONE_SRC = '/browser/github%20stats%20one.svg'
export const GITHUB_STATS_CARD_TWO_SRC = '/browser/github%20stats%20two.svg'

export const GITHUB_CONTRIBUTION_SNAKE_DARK_SRC =
  'https://raw.githubusercontent.com/weshaan/weshaan/output/github-contribution-grid-snake-dark.svg'

export const GITHUB_CONTRIBUTION_SNAKE_LIGHT_SRC =
  'https://raw.githubusercontent.com/weshaan/weshaan/output/github-contribution-grid-snake.svg'

export const GITHUB_DISPLAY = {
  login: 'weshaan',
  name: 'Eshaan Walia',
  bio: 'Full Stack Developer | Studying about LLMs • RAG based systems. Open source geek',
  followers: 29,
  following: 40,
  publicRepos: 45,
  joined: 'November 2022',
}

export type GitHubPinnedRepo = {
  name: string
  description: string
  language: string | null
  languageColor: string
  stars: number
  forks?: number
}

export const GITHUB_PINNED_REPOS: GitHubPinnedRepo[] = [
  {
    name: 'Spring-boot-mini-projects',
    description:
      'SmartInventory is a production-grade Inventory Management REST API that I built using Spring Boot 3, Java 17, and MySQL. The project focuses on real world inventory workflows such as stock tracking and transaction auditing, making it suitable for production use and future scalability.',
    language: 'Java',
    languageColor: '#b07219',
    stars: 1,
    forks: 1,
  },
  {
    name: 'Gas-Price-Optimization-using-LSTM-and-Smart-Contracts',
    description:
      'GasScope predicts Ethereum gas fees using an LSTM model and monitors real-time data via the Blocknative API. It automatically executes smart contracts through Web3.py when gas prices fall below a threshold, with a Streamlit dashboard for live monitoring to ensure cost-efficient transactions.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 1,
    forks: 1,
  },
  {
    name: 'multithreading-mini-projects',
    description:
      'This repository contains a collection of Python projects focusing on the basics of multithreading, executed in python. Each mini-project explores different multithreading aspects and a practical application.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 1,
  },
  {
    name: 'PolicyAI-Insurance-Policy-Analyzer-using-RAG-with-LLM',
    description:
      'An AI-powered system that analyzes insurance policy PDFs using RAG with FAISS and Sentence Transformers, and answers queries through a fine-tuned Phi-3.5 model with clause-level evidence via a Streamlit interface.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 1,
    forks: 1,
  },
  {
    name: 'CNN-skin-disease-detection',
    description:
      'This project leverages DenseNet transfer learning on HAM10000 dataset to classify dermoscopic images into benign and malignant categories.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 1,
  },
  {
    name: 'HPX-pll-matrix-mtply',
    description:
      'Parallel matrix multiplication using the HPX C++ runtime system. This project demonstrates how modern asynchronous task-based parallelism can significantly accelerate computational workloads by distributing matrix operations across multiple CPU cores.',
    language: 'C++',
    languageColor: '#f34b7d',
    stars: 1,
  },
]

export const GITHUB_CONTRIBUTIONS_LAST_YEAR = 1247
