import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MovieModel from './models/movie.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const samplePath = join(__dirname, 'Sample_Movies_Records.json');

export const seedMovies = async () => {
  const count = await MovieModel.countDocuments();
  if (count > 0) return;
  const data = JSON.parse(readFileSync(samplePath, 'utf-8'));
  await MovieModel.insertMany(data);
  console.log(`Seeded ${data.length} sample movies.`);
};
