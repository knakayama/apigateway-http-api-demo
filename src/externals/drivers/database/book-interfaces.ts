export interface BookTitle {
  book_title: string
}

export interface BasicBook extends BookTitle {
  book_id: string
  book_title: string
}

export interface BasicBookWithDate extends BasicBook {
  created_at: string
  updated_at: string
}

export interface BasicBookDocument extends BasicBookWithDate {
  main_pk: string
  main_sk: string
}
