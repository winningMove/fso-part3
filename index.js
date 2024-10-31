import e from "express";
import morgan from "morgan";
import cors from "cors";

const app = e();
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

morgan.token("body", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : ""
);

app.use(
  e.json(),
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

app.get("/info", (_, res) => {
  const output = `<p>Phonebook contains info for ${
    data.length
  } people</p>\n<p>${Date()}</p>`;
  res.send(output);
});

app
  .route("/api/persons")
  .get((_, res) => {
    res.json(data);
  })
  .post((req, res) => {
    const { name, number } = req.body;

    if (!name) return res.status(400).json({ error: "name is missing" });
    if (!number) return res.status(400).json({ error: "number is missing" });
    if (data.some((note) => note.name === name))
      return res.status(400).json({ error: "name must be unique" });

    const id = Math.floor(Math.random() * 100_000) + 5 + "";
    const newEntry = { id, name, number };
    data = [...data, newEntry];
    res.json(newEntry);
  });

app
  .route("/api/persons/:id")
  .get((req, res) => {
    const note = data.find((note) => note.id === req.params.id);
    if (!note) return res.sendStatus(404);
    res.json(note);
  })
  .delete((req, res) => {
    data = data.filter((note) => note.id !== req.params.id);
    res.sendStatus(204);
  });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
