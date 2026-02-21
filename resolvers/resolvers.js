import MovieModel from '../models/movie.js';

const resolvers = {
  Query: {
    movies: async () => {
      return await MovieModel.find({});
    },
    movie: async (_, { id }) => {
      return await MovieModel.findById(id);
    },
    moviesByDirector: async (_, { director_name }) => {
      return await MovieModel.findByDirector(director_name);
    },
  },

  Mutation: {
    addMovie: async (_, { name, director_name, production_house, release_date, rating }) => {
      const movie = new MovieModel({
        name,
        director_name,
        production_house,
        release_date,
        rating,
      });
      return await movie.save();
    },
    updateMovie: async (_, { id, name, director_name, production_house, release_date, rating }) => {
      const update = {};
      if (name != null) update.name = name;
      if (director_name != null) update.director_name = director_name;
      if (production_house != null) update.production_house = production_house;
      if (release_date != null) update.release_date = release_date;
      if (rating != null) update.rating = rating;
      return await MovieModel.findByIdAndUpdate(id, update, { new: true });
    },
    deleteMovie: async (_, { id }) => {
      return await MovieModel.findByIdAndDelete(id);
    },
  },
};

export default resolvers;
