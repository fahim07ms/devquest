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

// Notifications
export type NotificationType =
    | 'NEW_ANSWER'
    | 'NEW_COMMENT'
    | 'BADGE_EARNED'
    | 'ANSWER_ACCEPTED'
    | 'BOUNTY_EXPIRING'
    | 'BOUNTY_AWARDED'
    | 'QUESTION_EDITED'
    | 'MENTIONED'

export interface NotificationActor {
    id: string;
    username: string;
    profilePicture: string | null;
}

export interface Notification {
    id: string;
    type: NotificationType;
    entityId: string;
    isRead: boolean;
    actionUrl: string | null;
    createdAt: string;
    actor: NotificationActor | null;
}

export interface NotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
    hasMore: boolean;
}

// Badge
export type BadgeTier = 'bronze' | 'silver' | 'gold'
export type BadgeCriteriaType =
    | 'question_count'
    | 'answer_count'
    | 'comment_count'
    | 'question_views'
    | 'answer_score'
    | 'accepted_answer_score'
    | 'total_votes_received'
    | 'helpful_flags'
    | 'consecutive_days_visited'

export interface Badge {
    badgeId: string;
    name: string;
    description: string;
    tier: BadgeTier;
    criteriaType: BadgeCriteriaType;
    criteriaThreshold: number;
    iconUrl: string | null;
    awardedAt: string;
}

// Reputation
export type ReputationReason =
    | 'QUESTION_UPVOTED'
    | 'QUESTION_DOWNVOTED'
    | 'ANSWER_UPVOTED'
    | 'ANSWER_DOWNVOTED'
    | 'ANSWER_ACCEPTED'
    | 'ANSWER_UNACCEPTED'
    | 'BOUNTY_OFFERED'
    | 'BOUNTY_AWARDED'
    | 'DOWNVOTE_GIVEN'
    | 'SPAM_PENALTY'
    | 'MODERATOR_ADJUSTMENT'

export interface ReputationHistory {
    historyId: string;
    changeAmount: number;
    reason: ReputationReason;
    relatedEntityType: string;
    relatedEntityId: string | null;
    createdAt: string;
}

// Bounty
export type BountyStatus = 'active' | 'awarded' | 'expired'

export interface Bounty {
    bountyId: string;
    questionId: string;
    offeredBy: string | null;
    awardedAnswerId: string | null;
    amount: number;
    reason: string;
    status: BountyStatus;
    expiresAt: string;
    createdAt: string;
    awardedAt: string | null;
}