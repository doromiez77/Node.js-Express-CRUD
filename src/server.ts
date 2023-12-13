import mongoose from 'mongoose';

import app from './app';

const port = 3000;

mongoose.connect('mongodb://localhost/ex2').then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
});
