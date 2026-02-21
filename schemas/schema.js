import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Movie {
    id: ID!
    name: String!
    director_name: String!
    production_house: String!
    release_date: String!
    rating: Float!
  }

  type Query {
    movies: [Movie!]!
    movie(id: ID!): Movie
    moviesByDirector(director_name: String!): [Movie!]!
  }

  type Mutation {
    addMovie(
      name: String!
      director_name: String!
      production_house: String!
      release_date: String!
      rating: Float!
    ): Movie!
    updateMovie(
      id: ID!
      name: String
      director_name: String
      production_house: String
      release_date: String
      rating: Float
    ): Movie
    deleteMovie(id: ID!): Movie
  }
`;

export default typeDefs;
