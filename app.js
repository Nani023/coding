const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;
const app = express();
app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    database = open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasPriorityAndStatusProperty = (requestQuery) => {
  return requestQuery.priority != undefined && requestQuery.status != undefined;
};
const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority != undefined;
};
const hasStatusProperty = (requestsQuery) => {
  return requestsQuery.status != undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          *
        FROM 
          todo 
        WHERE 
          todo LIKE "%${search_q}"%
          AND status = "${status}"
          AND priority = "${priority};`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
          todo LIKE "%${search_q}"%
          AND status = "${priority}";`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
        SELECT 
          * 
        FROM 
          todo 
        WHERE 
          todo LIKE "%${search_q}%"
          AND status = "${status}";`;
      break;
    default:
      getTodosQuery = `
      SELECT 
        * 
      FROM
        todo 
      WHERE 
       todo LIKE "%${search_q}%";`;
  }
  data = await database.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
      SELECT
        *
      FROM 
       todo 
      WHERE 
      id = ${todoId};`;
  const todo = await databse.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const postTodoQuery = `
    INSERT INTO 
      todo(id, todo, priority, status)
    VALUES 
      (${id},"${todo}", "${priority}", "${status}";`;
  await database.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status != undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority != undefined:
      updateColumn - "Priority";
      break;
    case requestBody.todo != undefined:
      updateColumn = "Todo";
      break;
  }
  const previousQuery = `
    SELECT 
      * 
    FROM 
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await database.get(previousQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateQuery = `
    UPDATE 
      todo 
    SET 
      todo ="${todo},
      priority = "${priority},
      status = "${status}
    WHERE 
       id = ${todoId};`;
  await database.run(updateQuery);
  response.send(`${updateColumn} updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const deleteQuery = `
    DELETE FROM 
      todo
    WHERE 
      id = ${todoId};`;
  await database.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
