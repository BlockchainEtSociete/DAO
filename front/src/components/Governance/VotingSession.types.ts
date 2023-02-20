import dayjs from "dayjs";

export interface Proposal {
    description: string;
    voteCountYes: number;
    voteCountNo: number;
}

export interface SessionDetail {
    proposal: Proposal;
    startTime: number;
    endTime: number;
}

export const SessionStatus = [
    'En attente',
    'En cours',
    'Terminée'
]

export enum SessionStatusId {
    Pending = 0,
    InProgress = 1,
    Ended = 2,
}

export const getSessionStatus = (sessionStartTime: number, sessionEndTime: number): number => {
    if (sessionStartTime > dayjs().unix()) {
        return SessionStatusId.Pending;
    }
    else if(sessionEndTime < dayjs().unix()) {
        return SessionStatusId.Ended;
    }
    
    return SessionStatusId.InProgress;
}