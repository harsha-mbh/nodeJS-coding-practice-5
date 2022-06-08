const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT movie_name AS movieName
    FROM movie
    ORDER BY movie_id;`;
  const moviesArray = await db.all(getMovieNamesQuery);
  response.send(moviesArray);
});

//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const insertMovieDetailsQuery = `
    INSERT INTO movie
    (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(insertMovieDetailsQuery);
  const movieId = dbResponse.lastId;
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.run(getMovieQuery);
  response.send(movie);
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET (director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}');`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director
    ORDER BY director_id;`;
  const directorsArray = db.all(getDirectorsQuery);
  response.send(directorsArray);
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movieName
    FROM movie
    WHERE director_id = ${directorId};`;
  const moviesArray = db.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
