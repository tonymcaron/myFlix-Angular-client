export interface User {
  _id: string;
  Username: string;
  Email: string;
  Birthday?: string;
  FavoriteMovies: string[];
}

export interface Director {
  Name: string;
  Bio?: string;
  Birth?: string;
  Death?: string;
  Movies?: string[];
}

export interface Genre {
  Name: string;
  Description?: string;
}

export interface Movie {
  _id: string;
  Title: string;
  Description: string;
  Director: Director;
  Genre: Genre;
  ImagePath: string;
  ImageURL?: string;
  Featured?: boolean;
}

export interface UserRegistration {
  Username: string;
  Password: string;
  Email: string;
  Birthday?: string;
}

export interface UserLogin {
  Username: string;
  Password: string;
}

export interface LoginResponse {
  user?: User;
  User?: User;
  token?: string;
  Token?: string;
}
