const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/User");
const Pdf = require("./models/Pdf");
const Comment = require("./models/Comment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const { Storage } = require("@google-cloud/storage");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT;

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRETKEY;

const corsOptions = {
  origin: "http://localhost:3000", // Allow only http://localhost:5173 to access
  credentials: true, // Allow cookies
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL);

const conn = mongoose.connection;
let gfs;

let filename = "";

// setting up google cloud storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    filename = Date.now() + "#" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
});

const gStorage = new Storage({
  projectId: "pdf-cloud-storage",
  credentials: {
    client_email: process.env.CLIENT_EMAIL,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const bucketName = "pdf-cloud";

// upload pdf to the cloudwith encrypted filename
async function uploadToCloud(uniqueLink) {
  try {
    await gStorage.bucket(bucketName).upload(`uploads/${filename}`, {
      destination: `${uniqueLink}.pdf`,
      gzip: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error(`Failed to upload ${filename} to ${bucketName}:`, error);
  }
}

// upload to local storage
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { userId } = req.body;
    const uniqueLink = crypto.randomBytes(16).toString("hex");

    await uploadToCloud(uniqueLink);

    const pdf = new Pdf({ userId, filename, uniqueLink });
    await pdf.save();

    res.status(201).json({ message: "PDF uploaded successfully", pdf });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to fetch user's PDFs
app.get("/pdfs", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, user) => {
        if (err) throw err;

        const pdfs = await Pdf.find({ userId: user.id }).populate("comments");
        res.status(200).json({ pdfs });
      });
    } else
      res.status(401).json({ message: "please login first to perform tasks" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve PDFs", error: error.message });
  }
});

// To view a PDf by current user
app.get("/pdf/:pdfname", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, user) => {
        if (err) throw err;

        let pdfname = decodeURIComponent(req.params.pdfname); // Decode the PDF name
        let file = fs.createReadStream(`./uploads/${pdfname}`);
        let stat = fs.statSync(`./uploads/${pdfname}`);
        res.setHeader("Content-Length", stat.size);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename=${pdfname.split("#")[1]}`
        );
        file.pipe(res);
      });
    } else
      res.status(401).json({ message: "please login first to perform tasks" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve PDFs", error: error.message });
  }
});

// Adds a user to a specific PDF's access list.
app.post("/addUser/:_id", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, user) => {
        if (err) throw err;

        const { _id } = req.params;
        const { email } = req.body;

        const pdf = await Pdf.findById(_id);
        if (!pdf) {
          return res.status(404).json({ message: "PDF not found" });
        }
        const userToBeAdded = await User.findOne({ email });
        if (!userToBeAdded) {
          return res.status(404).json({ message: "PDF not found" });
        }

        if (!pdf.userId.includes(userToBeAdded._id)) {
          pdf.userId.push(userToBeAdded._id);
          await pdf.save();
          res.status(200).json({ message: "Email added successfully" });
        } else {
          res.status(200).json({ message: "Email already exists in the list" });
        }
      });
    } else
      res.status(401).json({ message: "please login first to perform tasks" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetches a PDF using its unique link.
app.get("/pdf/:uniqueLink", async (req, res) => {
  try {
    const pdf = await Pdf.findOne({ uniqueLink: req.params.uniqueLink });

    if (!pdf) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const readstream = gfs.createReadStream({ _id: pdf.path });
    readstream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adds a comment to a specific PDF.
app.post("/addComment", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, user) => {
        if (err) throw err;

        const { comment, _id } = req.body;

        const currPdf = await Pdf.findById(_id);
        if (!currPdf) {
          return res.status(404).json({ message: "PDF not found" });
        }

        // Create a new Comment
        const newComment = new Comment({
          comment,
          email: user.email,
        });

        await newComment.save();

        // Append the new comment to the PDF's comment list
        currPdf.comments.push(newComment);

        // Save the PDF
        await currPdf.save();

        // Return the newly created comment
        res.status(200).json(currPdf);
      });
    } else
      res.status(401).json({ message: "please login first to perform tasks" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetches all comments for a specific PDF.
app.get("/getComments/:_id", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, async (err, user) => {
        if (err) throw err;

        const { _id } = req.params;

        const currPdf = await Pdf.findById(_id);
        if (!currPdf) {
          return res.status(404).json({ message: "PDF not found" });
        }

        // Return the comments
        res.status(200).json(currPdf);
      });
    } else
      res.status(401).json({ message: "please login first to perform tasks" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//base url
app.get("/", (req, res) => {
  app.use(express.static(path.resolve(__dirname, "client", "build")));
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// Handles user registration.
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    const authToken = jwt.sign({ email: user.email, id: user._id }, jwtSecret);
    return res.cookie("token", authToken).json(user);
  } catch (error) {
    return res.status(422).json(error);
  }
});

// Handles user login.
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      let passCheck = bcrypt.compareSync(password, user.password);
      if (passCheck) {
        const authToken = jwt.sign(
          { email: user.email, id: user._id },
          jwtSecret
        );
        return res.cookie("token", authToken).json(user);
      } else {
        return res.status(422).json({ error: "Invalid password" });
      }
    } else return res.status(422).json({ error: "User not found" });
  } catch (error) {
    return res.status(422).json(error);
  }
});

// Fetches the profile of the authenticated user.
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, async (err, user) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(user.id);
      res.json({ name, email, _id });
    });
  } else res.json(null);
});

// Logs out the user by clearing the authentication cookie.
app.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

// starts the server on the specified port.
app.listen(PORT, (error) => {
  if (!error) console.log("Server is Successfully Running on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
