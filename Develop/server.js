const express = require('express');
const path = require('path');
const db = require('./db/db.json');
const fs = require('fs');
const uuid = require('./helpers/uuid');
const {readAndAppend, readFromFile, writeToFile} = require('./helpers/fsUtils');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// GET responeses
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});


app.get('/api/notes', (req,res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  readFromFile('./db/db.json')
    .then((data) => JSON.parse(data))
    .then((json) => {
      const result = json.filter((note) => note.id === noteId);
      return result.length > 0
        ? res.json(noteId)
        : res.json('No notes with that ID');
    });
});

// POST responeses
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
        title,
        text,
        id: uuid()
        };

        readAndAppend(newNote, './db/db.json');
        res.json(db);
    } else {
        res.error('Error in adding note');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    
    readFromFile('./db/db.json')
      .then((data) => JSON.parse(data))
      .then((json) => {
        // Make a new array of all tips except the one with the ID provided in the URL
        const result = json.filter((note) => note.id !== noteId);
  
        // Save that array to the filesystem
        writeToFile('./db/db.json', result);
  
        // Respond to the DELETE request
        res.json(`Item ${noteId} has been deleted`);
      });

  });

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
  });

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);
