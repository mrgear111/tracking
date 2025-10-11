/**
 * Import all mongoose models and export them as an object
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const models = {}

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get all .mjs files in the models directory
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return (
    file.indexOf('.') !== 0 && file !== 'index.mjs' && file.slice(-4) === '.mjs'
  )
})

// Dynamically import all model files
for (const file of modelFiles) {
  try {
    const filePath = path.join(__dirname, file)

    const modelModule = await import(`file://${filePath}`)
    const modelConfig = modelModule.default

    if (modelConfig && modelConfig.modelName && modelConfig.model) {
      models[modelConfig.modelName] = modelConfig.model
    } else {
      console.warn(`Invalid model structure in ${file}`)
    }
  } catch (error) {
    console.error(`Error loading model from ${file}:`, error)
  }
}

export default models
