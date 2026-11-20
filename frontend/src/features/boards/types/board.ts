export type Board = {
  _id: string;
  name: string;
  description?: string;
};

export type BoardList = {
  _id: string;
  name: string;
  board: string;
};

