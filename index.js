const express = require("express");
var bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const { Users } = require("./models/user");
const { Cards } = require("./models/user");
const Cors = require("cors");
const schedule = require("node-schedule");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(Cors());
// parse application/json
app.use(bodyParser.json());
const port = process.env.PORT || 3000;
const db = require("./models/db");
const bcrypt = require("bcrypt");
const { start } = require("repl");
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
const job = schedule.scheduleJob(rule, function () {
  const current_date = new Date();
  Cards.deleteMany({ endTime: { $lt: current_date.setHours(0) } }).then(
    (res) => {
      console.log(res);
      Cards.save();
      Users.save();
    }
  );
});

function authenticate(req, res, next) {
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1];
  console.log(token);
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}
async function card_check(username, card_name) {
  const user = await Users.findOne({ username });
  await user.populate("cards");
  const cards = user.cards;
  let flag = true;
  cards.map((card) => {
    console.log("existing card name", card.name);
    console.log("new card name", card_name);
    if (card.name == card_name) {
      console.log("falsified");
      flag = false;
    }
  });
  return flag;
}
async function edit_card(card) {
  const { name, startTime, endTime, description } = card;
  console.log(name,startTime,endTime,description);
  try {
    const filter = { name: name };
    const update = {
      startTime: startTime,
      endTime: endTime,
      description: description,
    };
    let doc = await Cards.findOneAndUpdate(filter, update);
    doc.save();
    const response = { sucess: true, message: "card edited" };
    return response;
  } catch {
    const response = { sucess: false, message: "invalid parameters" };
    return response;
  }
}
async function auth(req, res, next) {
  const { username, email, password } = req.body;
  const user = await Users.findOne({ username });
  if (user) {
    bcrypt
      .compare(password, user.password)
      .then((value) => {
        if (value === true) {
          const access_Token = jwt.sign(
            username,
            process.env.ACCESS_TOKEN_SECRET
          );
          req.body = { sucess: true, token: access_Token };
          next();
        } else {
          req.body = { sucess: false, message: "password does not match" };
          next();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    req.body = { sucess: false, message: "username does not exist" };
    next();
  }
}
async function add_card(card, username) {
  const { name, startTime, endTime, description } = card;

  try {
    const user = await Users.findOne({ username });

    const new_card = await Cards.create({
      name: name,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      description: description,
    });

    user.cards.push(new_card);
    user.save();
    const response = { sucess: true, message: "card has been added" };
    return response;
  } catch {
    const response = { sucess: false, message: "invalid parameters" };
    return response;
  }
}
async function create(req, res, next) {
  console.log(req.body);
  const { username, email, password } = req.body;
  const isolduser = await Users.doThisUserExist(username, email);
  if (isolduser === false) {
    const hash = await bcrypt.hash(password, 8);
    const user = await Users.create({
      username: username,
      email: email,
      password: hash,
    });
    req.body = { sucess: true, message: "User has been created" };
    next();
  } else {
    req.body = { sucess: false, message: isolduser };
    next();
  }
}

app.post("/createUser", create, (req, res) => {
  res.json(req.body);
});
app.post("/login", auth, (req, res) => {
  res.json(req.body);
});
app.post("/addcard", authenticate, (req, res) => {
  const username = req.user;
  card_check(username, req.body.name)
    .then((val) => {
      if (val == true) {
        add_card(req.body, username).then((response) => {
          res.json(response);
        });
      } else {
        res.json({ sucess: false, message: "card name not valid" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.get("/cards", authenticate, (req, res) => {
  console.log(req.query.date);
  date = new Date(req.query.date);
  date.setHours(0);
  date1 = new Date(req.query.date);
  date1.setHours(23);
  date1.setMinutes(59);
  date1.setSeconds(59);
  let query = Users.findOne({ username: req.user }).populate({
    path: "cards",
    match: { startTime: { $lte: date1 }, endTime: { $gte: date } },
    options: { sort: { startTime: 1 } },
  });
  let promise = query.exec();
  promise.then((cards) => {
    res.json({ sucess: true, cards: cards.cards });
  });
});
app.put("/editcard", authenticate, (req, res) => {
  const username = req.user;
  card_check(username, req.body.name)
    .then((val) => {
      if (val ==false) {
        edit_card(req.body).then((response) => {
          res.json(response);
        });
      } else {
        res.json({ sucess: false, message: "card name not valid" });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.delete("/cards", authenticate, (req, res) => {
  id = req.query.id;
  console.log("run");
  console.log(id);
  Cards.deleteOne({ _id: id })
    .then(() => {
      res.json({ sucess: true, message: "card has been deleted" });
    })
    .catch((er) => {
      console.log(er);
      res.json({ sucess: false, message: "card could not be deleted" });
    });
});
app.get("/", (req, res) => {
  //   res.send('Hello World!')
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
