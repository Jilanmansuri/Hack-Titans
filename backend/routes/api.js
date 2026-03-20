const express = require('express')
const multer = require('multer')
const uploadController = require('../controllers/uploadController')
const analyzeController = require('../controllers/analyzeController')
const roadmapController = require('../controllers/roadmapController')
const sampleController = require('../controllers/sampleController')

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
})

router.get('/samples/resumes', sampleController.listResumeSamples)
router.get('/samples/job-descriptions', sampleController.listJobDescriptionSamples)
router.get('/samples/resumes/:id', sampleController.getResumeTextById)
router.get('/samples/job-descriptions/:id', sampleController.getJobDescriptionTextById)

router.post('/upload-resume', upload.single('file'), uploadController.uploadResume)

router.post('/analyze', analyzeController.analyzeResume)
router.post('/generate-roadmap', roadmapController.generateRoadmap)

module.exports = router

