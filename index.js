import "dotenv/config";
import e from "express";
import morgan from "morgan";
import cors from "cors";
import Person from "./models/person.js";
const app = e();

/* sample data from before database integration
let data = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
*/

morgan.token("body", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : ""
);

app.use(
  e.json(),
  e.static("dist"),
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  }),
  morgan((tokens, req, res) =>
    [
      tokens.method(req),
      tokens.url(req),
      tokens.status(req, res),
      tokens.res(req, res, "content-length") ?? "-",
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req),
    ].join(" ")
  )
);

app.get("/info", async (_, res, next) => {
  try {
    const count = await Person.countDocuments();
    const output = `<p>Phonebook contains info for ${count} people</p>\n<p>${Date()}</p>`;
    res.send(output);
  } catch (error) {
    next(error);
  }
});

app
  .route("/api/persons")
  .get(async (_, res, next) => {
    try {
      const persons = await Person.find({});
      res.json(persons);
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    const { name, number } = req.body;

    /* 
    -- duplicate names can currently still be added via direct POST,
    -- this is validation code from a previous exercise that required it

    if (data.some((person) => person.name === name))
    return res.status(400).json({ error: "name must be unique" });
    */

    try {
      const newEntry = await new Person({ name, number }).save();
      res.json(newEntry);
    } catch (error) {
      next(error);
    }
  });

app
  .route("/api/persons/:id")
  .get(async (req, res, next) => {
    try {
      const person = await Person.findById(req.params.id);
      if (person) {
        res.json(person);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  })
  .put(async (req, res, next) => {
    const { name, number } = req.body;
    // direct PUT can still modify both name and number, frontend can't
    try {
      const modified = await Person.findByIdAndUpdate(
        req.params.id,
        { name, number },
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      );
      if (modified) {
        res.json(modified);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      await Person.findByIdAndDelete(req.params.id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

app.use(
  (req, res) => {
    res.status(400).send({ error: "unknown endpoint" });
  },
  (err, req, res, next) => {
    console.error(err.message);

    if (err.name === "CastError") {
      return res.status(400).send({ error: "malformed id" });
    } else if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }

    next(err);
  }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
