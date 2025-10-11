require('dotenv').config()

const mongoose = require('mongoose')
const path = require('path')

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })

const fs = require('fs')

const { User, College } = require('./models')
const { fetchUserDetails } = require('./githubUtils.cjs')
const { fetchPullRequests } = require('./2_fetchPRs.cjs')

const usernames = fs
  .readFileSync(path.join(__dirname, process.argv[2]), 'utf-8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length && !line.startsWith('#'))

const importUsers = async () => {
  const college = await College.findOne({ name: 'NST SVYASA' }).lean()

  try {
    for (const username of usernames) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        console.log(`User ${username} already exists. Skipping.`)

        if (existingUser.college?.toString() !== college._id.toString()) {
          existingUser.college = college._id
          await existingUser.save()
          console.log(`Updated college for user: ${username}`)
        }

        if (existingUser.role !== 'student') {
          existingUser.role = 'student'
          await existingUser.save()
          console.log(`Updated role to student for user: ${username}`)
        }

        if (existingUser.year !== '1st Year') {
          existingUser.year = '1st Year'
          await existingUser.save()
          console.log(`Updated year to 1st Year for user: ${username}`)
        }

        if (existingUser.name === '') {
          const userDetails = await fetchUserDetails(username)
          if (userDetails && userDetails.name) {
            existingUser.name = userDetails.name
            await existingUser.save()
            console.log(`Updated name for user: ${username}`)
          }
        }

        // Fetch PRs for the existing user
        const totalPRsFetched = await fetchPullRequests([existingUser])
        console.log(`Total PRs fetched for ${username}: ${totalPRsFetched}`)

        continue
      }

      const userDetails = await fetchUserDetails(username)
      if (!userDetails) {
        console.log(`User ${username} not found on GitHub. Skipping.`)
        continue
      }

      const newUser = new User({
        github_id: userDetails.id,
        name: userDetails.name,
        type: userDetails.type,
        username,
        college: college._id,
        year: '1st Year',
        role: 'student',
      })
      await newUser.save()
      console.log(`Inserted user: ${username}`)

      // Fetch PRs for the newly added user
      const totalPRsFetched = await fetchPullRequests([newUser])
      console.log(`Total PRs fetched for ${username}: ${totalPRsFetched}`)
    }
    console.log('Usernames import completed.')
  } catch (err) {
    console.error('Error importing usernames:', err)
  } finally {
    mongoose.connection.close()
  }
}

importUsers()
