import mongoose from 'mongoose'

const CollegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const College = mongoose.model('College', CollegeSchema)

export default {
  modelName: 'College',
  model: College,
  schema: CollegeSchema,
}
