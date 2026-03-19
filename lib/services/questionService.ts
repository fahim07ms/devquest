// API service layer for questions, answers, and comments

import api from "@/lib/api";
import type { Question, Answer, Comment } from "@/types";

// ─── Question Services ──────────────────────────────────────────────────────

export interface GetQuestionsParams {
    page?: number;
    limit?: number;
    sort?: "createdAt" | "voteScore" | "viewCount" | "answersCount" | "lastActivityAt";
    order?: "asc" | "desc";
    search?: string;
    tags?: string;
}

export const getQuestions = async (params: GetQuestionsParams = {}) => {
    const response = await api.get<{ data: { questions: Question[] }; message: string }>(
        "/questions",
        { params }
    );
    return response.data.data.questions;
};

export const getQuestionById = async (questionId: string) => {
    const response = await api.get<{ data: { question: Question }; message: string }>(
        `/questions/${questionId}`
    );
    return response.data.data.question;
};

export const createQuestion = async (data: { title: string; body: object; tags?: string[] }) => {
    const response = await api.post<{ data: { question: Question }; message: string }>(
        "/questions",
        data
    );
    return response.data.data.question;
};

// ─── Answer Services ──  //

export const getAnswersByQuestionId = async (questionId: string) => {
    const response = await api.get<{ data: { answers: Answer[] }; message: string }>(
        `/questions/${questionId}/answers`
    );
    return response.data.data.answers;
};

export const createAnswer = async (questionId: string, data: { body: object }) => {
    const response = await api.post<{ data: { answer: Answer }; message: string }>(
        `/questions/${questionId}/answers`,
        data
    );
    return response.data.data.answer;
};

// ─── Comment Services ─── //

export const getCommentsByParentId = async (parentId: string) => {
    const response = await api.get<{ data: { comments: Comment[] }; message: string }>(
        `/questions/${parentId}/comments`
    );
    return response.data.data.comments;
};

export const getAnswerComments = async (answerId: string) => {
    const response = await api.get<{ data: { comments: Comment[] }; message: string }>(
        `/answers/${answerId}/comments`
    );
    return response.data.data.comments;
};

export const createCommentOnParent = async (parentId: string, data: { body: object }) => {
    const response = await api.post<{ data: { comment: Comment }; message: string }>(
        `/questions/${parentId}/comments`,
        data
    );
    return response.data.data.comment;
};

export const createCommentOnAnswer = async (answerId: string, data: { body: object }) => {
    const response = await api.post<{ data: { comment: Comment }; message: string }>(
        `/answers/${answerId}/comments`,
        data
    );
    return response.data.data.comment;
};
