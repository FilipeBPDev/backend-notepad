const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { writer } = require('repl');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 7007;

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

app.use(express.json());

function readNotesFile() {
    try {
        const fileContent = fs.readFileSync('notes.json', 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { projects: [] };
        } else {
            console.error('Error reading notes.json:', error.message);
            return { projects: [] };
        }
    }
}

function noteFile(notes) {
    fs.writeFile("notes.json", JSON.stringify(notes, null, 2), (err) => {
        if (err) {
            console.error('Erro ao ler notes.json:', err.messageerr)
        } else {
            console.log('Nota inserida com sucesso!')
        }
    })
}

app.post('/notes', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: "Título e descrição não informados!" })
    }

    const newNote = {
        title,
        description,
        id: uuidv4(),
    };

    const notes = readNotesFile();

    notes.projects.push(newNote)

    noteFile(notes);

    return res.json(newNote);

});

app.get('/notes', (req, res) => {
    const notes = readNotesFile() // Lê o conteúdo de notes.json e retorna com array de notas em json
    return res.json(notes.projects)
});

app.get('/notes/:id', (req, res) => {
    const { id } = req.params
    const notes = readNotesFile()
    const noteId =  notes.projects.find(note => note.id === id)

    return res.json(noteId)

})

app.patch('/notes/:id', (req, res) => {
    const { id } = req.params
    const { title, description } = req.body
    if (!title || !description) {
        return res.status(400).json({ error: "Título e descrição não informados!" })
    }

    const notes = readNotesFile();
    const noteIndex = notes.projects.findIndex(note => note.id === id)
    if(noteIndex === -1) {
        return res.status(400).json({ error: "Nota não encontrada!"})
    }

    notes.projects[noteIndex].title = title;
    notes.projects[noteIndex].description = description;

    noteFile(notes)

    return res.json({message: "Nota alterada com sucesso!"})
})

app.delete('/notes/:id', (req, res) => {
    const { id } = req.params
    const notes = readNotesFile();
    const noteIndex = notes.projects.findIndex(note => note.id === id)
    notes.projects.splice(noteIndex, 1);

    noteFile(notes)

    return res.json({message: "Nota removida com sucesso!"})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
