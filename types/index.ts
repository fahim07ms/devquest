// Shared TypeScript types for DevQuest

export interface Tag {
    tag_id: string;
    name: string;
}

export interface Author {
    authorId: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    username?: string;
}

export interface Question {
    id: string;
    title: string;
    body: object; // TipTap JSON
    voteScore: number;
    viewCount: number;
    answersCount: number;
    lastActivityAt: string;
    createdAt: string;
    updatedAt: string;
    isFrozen: boolean;
    activeBounty?: {
        id: string;
        amount: number;
        expiresAt: string;
    } | null;
    author: Author;
    tags: Tag[];
}

export interface Answer {
    id: string;
    questionId: string;
    body: object; // TipTap JSON
    voteScore: number;
    isAccepted: boolean;
    acceptedAt: string | null;
    createdAt: string;
    updatedAt: string;
    isFrozen: boolean;
    author: Author;
}

export interface Recipient {
    recipientId: string;
    recipientUsername: string;
}

export interface Comment {
    id: string;
    parentId: string;
    depthLevel: number;
    body: object; // TipTap JSON
    voteScore: number;
    createdAt: string;
    updatedAt: string;
    isFrozen: boolean;
    author: Author;
    recipient: Recipient;
}

export interface PaginatedResponse<T> {
    data: T[];
    total?: number;
    page?: number;
    limit?: number;
}
