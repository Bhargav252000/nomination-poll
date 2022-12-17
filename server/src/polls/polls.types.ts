export type CreatePollFields = {
  topic: string;
  votesPerVoter: number;
  name: string;
};

export type JoinPollFields = {
  pollId: string;
  name: string;
};

export type RejoinPollFields = {
  pollId: string;
  userId: string;
  name: string;
};
