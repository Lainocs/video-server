const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

const PORT = 3010
const VIDEO_PATH = path.join(__dirname, 'babymonster-video.mp4') // Vérifie bien le nom de ton fichier

// Route pour servir la page d'accueil
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'))
})

// Route qui gère le streaming vidéo (avec support du scroll/range)
app.get('/video', (req, res) => {
	console.log('Demande de vidéo reçue !')
	const videoPath = path.join(__dirname, 'babymonster-video.mp4')

	if (!fs.existsSync(videoPath)) {
		console.error("ERREUR : Le fichier n'existe pas ici :", videoPath)
		return res.status(404).send('Fichier introuvable')
	}

	const stat = fs.statSync(VIDEO_PATH)
	const fileSize = stat.size
	const range = req.headers.range

	if (range) {
		const parts = range.replace(/bytes=/, '').split('-')
		const start = parseInt(parts[0], 10)
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
		const chunksize = end - start + 1
		const file = fs.createReadStream(VIDEO_PATH, { start, end })
		const head = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/mp4',
		}
		res.writeHead(206, head)
		file.pipe(res)
	} else {
		const head = {
			'Content-Length': fileSize,
			'Content-Type': 'video/mp4',
		}
		res.writeHead(200, head)
		fs.createReadStream(VIDEO_PATH).pipe(res)
	}
})

app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`)
})
