import express from 'express';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import mongoose from 'mongoose';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';

mongoose
  .connect(
      process.env.MONGODB_URI
      //'mongodb+srv://vlad:Zseqsxzseqsx1@cluster0.xznxcxz.mongodb.net/blog?retryWrites=true&w=majority'
    )
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));



const app = express();
app.use(cors());



const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());


const  corsOptions = {
  origin: 'https://bogdanova-blog-rangifertarandus.vercel.app/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}



app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, cors(corsOptions), handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', cors(corsOptions), PostController.getAll);
app.get('/posts/tags', cors(corsOptions), PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
