import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

app.use(cors());
const URL = process.env.URL;
const PORT = process.env.PORT;

const createConnection = async () => {
  const client = new MongoClient(URL);
  await client.connect();
  console.log("MongoDB connected successfully...!");
  return client;
};

const client = await createConnection();

app.get("/", async (req, res) => {
  const data = await client.db("Batch").collection("Batch").find({}).toArray();
  res.send(data);
});

app.post("/data", async (req, res) => {
  const data = req.body;
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    service: "gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: data.from, // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });
  let info = await transporter
    .sendMail({
      from: `"Bulkmailer" <${data.from}>`, // sender address
      to: data.to, // list of receivers
      subject: data.sub, // Subject line
      html: data.text, // html body
    })
    .catch(console.error);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  console.log(data);
  res.send(data);
});
app.post("/contact", async (req, res) => {
  const data = req.body;
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    service: "gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "admnbulkmailer@gmail.com", // generated ethereal user
      pass: process.env.GMAIL_PASS, // generated ethereal password
    },
  });
  let info = await transporter
    .sendMail({
      from: `"${data.name}" <'${data.mail}'>`, // sender address
      to: "maruthikj4@gmail.com", // list of receivers
      subject: data.sub, // Subject line
      html: `<p>${data.mes} <br/> <br/> <br/> <br/>From:<br/>${data.name}<br/>${data.num}<br/>${data.mail}</p>`, // html body
    })
    .catch(console.error);
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  console.log(data);
  res.send(data);
});

app.put("/edit", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    await client
      .db("Batch")
      .collection("Batch")
      .updateOne(
        { _id: new ObjectId(data.id) },

        { $push: { mails: { $each: req.body.mails } } }
      );
  } catch (err) {
    console.log(err);
    res.status(500).json({ Error: err });
  }
});
app.post("/batch/addbatch", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    await client
      .db("Batch")
      .collection("Batch")
      .insertOne({
        name: req.body.batchName,
        mails: [...req.body.mails],
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ Error: err });
  }
});
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    const del = await client
      .db("Batch")
      .collection("Batch")
      .deleteOne({ _id: new ObjectId(id) });
    res.send(del);
  } catch (err) {
    console.log(err);
  }
});
app.get("/admin", async (req, res) => {
  const admin = await client
    .db("Batch")
    .collection("AdminMails")
    .find({})
    .toArray();
  res.send(admin);
});

app.listen(PORT, () =>
  console.log(`server established successfully On the PORT:${PORT}`)
);
