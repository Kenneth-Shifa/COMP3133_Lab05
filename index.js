import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import movieSchema from './schemas/schema.js';
import movieResolvers from './resolvers/resolvers.js';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { connectDB } from './db.js';
import { seedMovies } from './seed.js';

const app = express();

dotenv.config();

async function startServer() {
  const server = new ApolloServer({
    typeDefs: movieSchema,
    resolvers: movieResolvers,
  });

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use('/graphql', expressMiddleware(server));

  const playgroundHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GraphQL Playground - Lab 05</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #1e1e1e; color: #e0e0e0; }
    h1 { margin: 0 0 16px; font-size: 1.25rem; }
    .row { display: flex; gap: 16px; margin-bottom: 12px; align-items: center; }
    select { padding: 8px 12px; background: #333; color: #fff; border: 1px solid #555; border-radius: 6px; min-width: 220px; }
    button { padding: 8px 20px; background: #0d7377; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
    button:hover { background: #0a5c5f; }
    textarea { width: 100%; min-height: 140px; padding: 12px; background: #252526; color: #d4d4d4; border: 1px solid #444; border-radius: 6px; font-family: 'Consolas', monospace; font-size: 13px; resize: vertical; }
    .res { white-space: pre-wrap; word-break: break-all; padding: 12px; background: #252526; border: 1px solid #444; border-radius: 6px; min-height: 120px; font-family: 'Consolas', monospace; font-size: 13px; }
    .res.success { border-color: #0d7377; }
    .res.error { border-color: #c53030; color: #fc8181; }
    label { font-size: 0.9rem; color: #999; }
    a { color: #0d7377; }
  </style>
</head>
<body>
  <h1>GraphQL Playground — Lab 05 COMP 3133</h1>
  <div class="row">
    <label>Example:</label>
    <select id="examples">
      <option value="movies">1. Get all movies</option>
      <option value="movie">2. Get movie by ID</option>
      <option value="moviesByDirector">3. Get movies by director</option>
      <option value="addMovie">4. Add movie (mutation)</option>
      <option value="updateMovie">5. Update movie (mutation)</option>
      <option value="deleteMovie">6. Delete movie (mutation)</option>
    </select>
    <button type="button" id="run">Run</button>
  </div>
  <label>Query / Mutation</label>
  <textarea id="query" spellcheck="false"></textarea>
  <label style="display:block; margin-top:12px;">Response</label>
  <pre class="res" id="response">Click Run or choose an example.</pre>
  <script>
    let savedId = null;
    const examples = {
      movies: \`query { movies { id name director_name production_house release_date rating } }\`,
      movie: () => \`query { movie(id: "\${savedId || 'PUT_ID_HERE'}") { id name director_name production_house release_date rating } }\`,
      moviesByDirector: \`query { moviesByDirector(director_name: "Christopher Nolan") { id name director_name production_house release_date rating } }\`,
      addMovie: \`mutation { addMovie(name: "Interstellar", director_name: "Christopher Nolan", production_house: "Paramount Pictures", release_date: "2014-11-07", rating: 8.6) { id name director_name production_house release_date rating } }\`,
      updateMovie: () => \`mutation { updateMovie(id: "\${savedId || 'PUT_ID_HERE'}", name: "Updated Title", rating: 9.0) { id name director_name rating } }\`,
      deleteMovie: () => \`mutation { deleteMovie(id: "\${savedId || 'PUT_ID_HERE'}") { id name } }\`
    };
    const q = document.getElementById('query');
    const ex = document.getElementById('examples');
    const setExample = () => { const v = ex.value; q.value = typeof examples[v] === 'function' ? examples[v]() : examples[v]; };
    ex.addEventListener('change', setExample);
    q.value = examples.movies;
    window.saveIdFromResponse = (data) => {
      if (data?.data?.movies?.length) savedId = data.data.movies[0].id;
      if (data?.data?.addMovie?.id) savedId = data.data.addMovie.id;
    };
    document.getElementById('run').onclick = async () => {
      const resEl = document.getElementById('response');
      resEl.className = 'res';
      try {
        const r = await fetch('/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q.value.trim() }) });
        const data = await r.json();
        if (window.saveIdFromResponse) window.saveIdFromResponse(data);
        resEl.textContent = JSON.stringify(data, null, 2);
        resEl.classList.add(data.errors ? 'error' : 'success');
      } catch (e) {
        resEl.textContent = e.message;
        resEl.classList.add('error');
      }
    };
  </script>
</body>
</html>`;
  app.get('/', (_, res) => res.type('html').send(playgroundHtml));

  const port = process.env.PORT || 4000;
  app.listen(port, async () => {
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    try {
      const { inMemory } = await connectDB();
      console.log(inMemory ? 'Connected to in-memory MongoDB' : 'Connected to MongoDB Atlas');
      if (inMemory) await seedMovies();
    } catch (error) {
      console.log(`Unable to connect to DB: ${error.message}`);
    }
  });
}

startServer();
