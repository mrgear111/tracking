const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const {
  User,
  College,
  GitHubOwner,
  GitHubRepository,
  GitHubPR,
} = require(__dirname + '/../models')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })

app.get('/api', (req, res) => {
  res.send('Krushn Tracker API is running')
})

app.get('/api/GitHubPRs', async (req, res) => {
  try {
    const prs = await GitHubPR.find()
      .populate({
        path: 'author',
        populate: { path: 'college' },
      })
      .populate({
        path: 'repository',
        populate: { path: 'owner' },
      })

    // exclude PRs from red-flagged repositories
    const filteredPRs = prs.filter((pr) => !pr.repository.is_redFlagged)

    res.json(filteredPRs)
  } catch (error) {
    console.error('Error fetching PRs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/redFlagRepository', async (req, res) => {
  const { repositoryId } = req.body
  if (!repositoryId) {
    return res.status(400).json({ error: 'repositoryId is required' })
  }

  try {
    const repository = await GitHubRepository.findById(repositoryId)
    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' })
    }

    repository.is_redFlagged = true
    await repository.save()

    res.json({ message: 'Repository red-flagged successfully', repository })
  } catch (error) {
    console.error('Error red-flagging repository:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/statistics', async (req, res) => {
  try {
    const totalPRs = await GitHubPR.countDocuments()
    const mergedPRs = await GitHubPR.countDocuments({ is_merged: true })
    const openPRs = await GitHubPR.countDocuments({ is_open: true })
    const closedPRs = totalPRs - openPRs

    const totalRepositories = await GitHubRepository.countDocuments()
    const redFlaggedRepositories = await GitHubRepository.countDocuments({
      is_redFlagged: true,
    })

    const totalUsers = await User.countDocuments()
    const totalColleges = await College.countDocuments()
    const totalOwners = await GitHubOwner.countDocuments()

    res.json({
      totalPRs,
      mergedPRs,
      openPRs,
      closedPRs,
      totalRepositories,
      redFlaggedRepositories,
      totalUsers,
      totalColleges,
      totalOwners,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.use('/', express.static(__dirname + '/public'))

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
